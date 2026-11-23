import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ORAL_INTERVIEW_VARIANTS } from '../../data/oge/oralInterviewBank';

interface OralInterviewEngineProps {
  onComplete: (passed: boolean, summaryText: string) => void;
}

type RecordTarget =
  | { kind: 'reading' }
  | { kind: 'dialogue'; questionNumber: number }
  | { kind: 'monologue' }
  | null;

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^а-яa-z0-9\s-]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function countSentences(text: string): number {
  const parts = text
    .trim()
    .split(/[.!?…]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length >= 2);
  return parts.length;
}

export const OralInterviewEngine: React.FC<OralInterviewEngineProps> = ({
  onComplete,
}) => {
  const [variantId, setVariantId] = useState<string>(
    () => ORAL_INTERVIEW_VARIANTS.at(0)?.id ?? 'oral-var-1'
  );
  const variant = useMemo(
    () =>
      ORAL_INTERVIEW_VARIANTS.find((v) => v.id === variantId) ??
      ORAL_INTERVIEW_VARIANTS.at(0)!,
    [variantId]
  );

  // Звуковой таймер этапов ФИПИ
  const [timerLabel, setTimerLabel] = useState('Подготовка к Части 1 (5:00)');
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Задание 1: чтение вслух
  const [readingTranscript, setReadingTranscript] = useState('');
  const [readingAudioUrl, setReadingAudioUrl] = useState<string | null>(null);
  const [readingDurationSec, setReadingDurationSec] = useState(0);

  // Задание 2: ответы на вопросы беседы
  const [dialogueAnswers, setDialogueAnswers] = useState<Record<number, string>>({});
  const [dialogueAudioUrls, setDialogueAudioUrls] = useState<Record<number, string>>({});
  const [revealedSamples, setRevealedSamples] = useState<Record<number, boolean>>({});
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [currentDialogueStep, setCurrentDialogueStep] = useState(1);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Задание 3: монолог (1 из 3 тем)
  const [selectedTopicNum, setSelectedTopicNum] = useState<1 | 2 | 3>(1);
  const [monologueTranscript, setMonologueTranscript] = useState('');
  const [monologueAudioUrl, setMonologueAudioUrl] = useState<string | null>(null);
  const [showMonologueHelp, setShowMonologueHelp] = useState(false);

  // Завершение собеседования
  const [finished, setFinished] = useState(false);

  // Запись аудио через MediaRecorder
  const [recordingTarget, setRecordingTarget] = useState<RecordTarget>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const recordingStartRef = useRef<number>(0);

  const playBell = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      Array.of(523.25, 659.25, 783.99).forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.2;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.7);
      });
    } catch {
      // ignore
    }
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // ignore
      }
      activeStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Таймер обратного отсчёта со звонком
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          playBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, soundEnabled]);

  const startStageTimer = (label: string, totalSeconds: number) => {
    setTimerLabel(label);
    setSecondsLeft(totalSeconds);
    setTimerRunning(true);
  };

  const stopActiveRecorder = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {
      // ignore
    }
  };

  const toggleRecording = async (target: NonNullable<RecordTarget>) => {
    const isSame =
      recordingTarget?.kind === target.kind &&
      (target.kind !== 'dialogue' ||
        (recordingTarget?.kind === 'dialogue' &&
          recordingTarget.questionNumber === target.questionNumber));

    if (isSame) {
      setRecordingTarget(null);
      if (target.kind === 'reading' && !readingCompleted) {
        setReadingCompleted(true);
      }
      stopActiveRecorder();
      return;
    }

    setSpeechError(null);
    stopActiveRecorder();
    activeStreamRef.current?.getTracks().forEach((t) => t.stop());
    activeStreamRef.current = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      setSpeechError(
        'Микрофон недоступен. Убедитесь, что сайт открыт по HTTPS и браузер поддерживает доступ к микрофону.'
      );
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setSpeechError('Ваш браузер не поддерживает MediaRecorder — запись невозможна.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;

      // Подбираем поддерживаемый браузером формат записи
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ];
      const supportedType =
        preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordingStartRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        activeStreamRef.current = null;

        const elapsedSec = Math.max(
          1,
          Math.round((Date.now() - recordingStartRef.current) / 1000)
        );

        const audioBlob = new Blob(audioChunksRef.current, {
          type: supportedType || recorder.mimeType || 'audio/webm',
        });
        audioChunksRef.current = [];

        if (audioBlob.size < 1000) {
          setSpeechError(
            'Запись получилась пустой — проверьте, что в браузере и Windows выбран рабочий микрофон.'
          );
          return;
        }

        const url = URL.createObjectURL(audioBlob);
        if (target.kind === 'reading') {
          setReadingAudioUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          setReadingDurationSec(elapsedSec);
        } else if (target.kind === 'dialogue') {
          setDialogueAudioUrls((prev) => {
            const old = prev[target.questionNumber];
            if (old) URL.revokeObjectURL(old);
            return { ...prev, [target.questionNumber]: url };
          });
        } else if (target.kind === 'monologue') {
          setMonologueAudioUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      };

      recorder.start(250);
      setRecordingTarget(target);
    } catch {
      setSpeechError(
        'Доступ к микрофону запрещён. Разрешите использование микрофона в настройках браузера и попробуйте снова.'
      );
      activeStreamRef.current?.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
      setRecordingTarget(null);
    }
  };

  // Аналитика Задания 1
  const readingAccuracy = useMemo(() => {
    const refWords = tokenizeWords(variant.readingText);
    const spokenWords = tokenizeWords(readingTranscript);
    if (refWords.length === 0 || spokenWords.length === 0) return 0;
    const spokenSet = new Set(spokenWords);
    const matchedCount = refWords.filter((w) => spokenSet.has(w)).length;
    return Math.min(100, Math.round((matchedCount / refWords.length) * 100));
  }, [variant.readingText, readingTranscript]);

  const readingWpm =
    readingDurationSec > 0 && variant.wordCount > 0
      ? Math.round((variant.wordCount / readingDurationSec) * 60)
      : 0;

  const activeMonologueTopic =
    variant.monologueTopics.find((t) => t.number === selectedTopicNum) ??
    variant.monologueTopics.at(0)!;
  const monologueSentences = countSentences(monologueTranscript);
  const monologueWords = tokenizeWords(monologueTranscript).length;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const handleFinishExam = () => {
    stopActiveRecorder();
    setRecordingTarget(null);
    setTimerRunning(false);
    setFinished(true);
    const summary = `Итоговое собеседование (${variant.title}): темп чтения ~${readingWpm} сл/мин, монолог ${monologueSentences} предл.`;
    onComplete(true, summary);
  };

  const handleResetVariant = () => {
    stopActiveRecorder();
    activeStreamRef.current?.getTracks().forEach((t) => t.stop());
    activeStreamRef.current = null;
    setRecordingTarget(null);
    setReadingTranscript('');
    setReadingAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setReadingDurationSec(0);
    setDialogueAnswers({});
    setDialogueAudioUrls((prev) => {
      Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
      return {};
    });
    setMonologueTranscript('');
    setMonologueAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFinished(false);
    setReadingCompleted(false);
    setCurrentDialogueStep(1);
    setShowAllQuestions(false);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-4">
      {/* Верхняя панель экзаменационного таймера со звонком */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-[#0F1424] to-violet-950/40 border border-indigo-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
            <span>ОГЭ · Итоговое собеседование (Допуск)</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-200 border border-violet-400/30">
              {timerLabel}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {variant.title}
          </h2>
          {ORAL_INTERVIEW_VARIANTS.length > 1 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ORAL_INTERVIEW_VARIANTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    stopActiveRecorder();
                    activeStreamRef.current?.getTracks().forEach((t) => t.stop());
                    activeStreamRef.current = null;
                    setRecordingTarget(null);
                    setVariantId(v.id);
                    setReadingTranscript('');
                    setReadingAudioUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return null;
                    });
                    setReadingDurationSec(0);
                    setDialogueAnswers({});
                    setDialogueAudioUrls((prev) => {
                      Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
                      return {};
                    });
                    setMonologueTranscript('');
                    setMonologueAudioUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return null;
                    });
                    setFinished(false);
                    setReadingCompleted(false);
                    setCurrentDialogueStep(1);
                    setShowAllQuestions(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    v.id === variant.id
                      ? 'bg-violet-600/30 border-violet-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {v.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-[#080B14] border border-indigo-400/40 font-mono-num text-xl font-bold text-indigo-200 tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>
              {mins}:{secs}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTimerRunning((r) => !r)}
            className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            {timerRunning ? 'Пауза' : 'Старт'}
          </button>

          <button
            type="button"
            onClick={() => startStageTimer('Подготовка к Части 1 (5:00)', 5 * 60)}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
          >
            5:00 (Ч.1)
          </button>

          <button
            type="button"
            onClick={() => startStageTimer('Подготовка к монологу (2:00)', 2 * 60)}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
          >
            2:00 (Монолог)
          </button>

          <button
            type="button"
            onClick={() => startStageTimer('Ответ монолога (3:00)', 3 * 60)}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
          >
            3:00 (Ответ)
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            title={soundEnabled ? 'Звонок таймера включён' : 'Звонок таймера выключен'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {speechError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300">
          {speechError}
        </div>
      )}

      {/* ЧАСТЬ 1 · ЗАДАНИЕ 1: Чтение текста вслух */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1424] border border-slate-800 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-white inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            Часть 1 · Задание 1 ({variant.wordCount} слов)
          </h3>
          <span className="text-xs text-slate-400">Чтение текста вслух</span>
        </div>

        {/* Плашка «Материал к заданию 2» над текстом для чтения */}
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs sm:text-sm text-indigo-100 leading-relaxed">
          <strong className="text-indigo-300">
            Материал к заданию 2 (подготовьтесь заранее):
          </strong>{' '}
          {variant.quotePrompt}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleRecording({ kind: 'reading' })}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              recordingTarget?.kind === 'reading'
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {recordingTarget?.kind === 'reading' ? (
              <>
                <MicOff className="w-4 h-4" />
                Остановить
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Записать свой голос
              </>
            )}
          </button>

          {readingAudioUrl && (
            <button
              type="button"
              onClick={() => {
                setReadingTranscript('');
                setReadingDurationSec(0);
                setReadingAudioUrl((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return null;
                });
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сбросить запись
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {variant.readingIntro}
        </p>

        {/* Текст для чтения */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed space-y-2">
          {variant.readingText.split('\n').map((para, pIdx) => (
            <p key={pIdx}>{para}</p>
          ))}
        </div>

        {/* Встроенный плеер + темп чтения + точность слов */}
        {readingAudioUrl && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-300">
              <span>Ваша запись:</span>
              <span className="text-cyan-300">
                Длительность: {readingDurationSec} сек.
              </span>
              {readingWpm > 0 && (
                <span
                  className={
                    readingWpm >= 95 && readingWpm <= 130
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                  }
                >
                  Темп: ~{readingWpm} слов/мин
                </span>
              )}
              {readingTranscript.trim() && (
                <span className="text-emerald-300">
                  Точность слов: {readingAccuracy}%
                </span>
              )}
            </div>
            <audio controls src={readingAudioUrl} className="w-full" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Норма ФИПИ для выразительного чтения — 95–130 слов/мин. Для расчёта точности
              впишите распознанный текст (например, через системную диктовку Win+H) в поле ниже.
            </p>
            <textarea
              rows={3}
              value={readingTranscript}
              onChange={(e) => setReadingTranscript(e.target.value)}
              placeholder="Впишите или надиктуйте (Win+H) текст, чтобы увидеть точность слов в %..."
              className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-violet-500/60 focus:outline-none p-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600"
            />
          </div>
        )}

        {/* Кнопка перехода к вопросам после чтения */}
        {!readingCompleted && (
          <button
            type="button"
            onClick={() => {
              stopActiveRecorder();
              setRecordingTarget(null);
              setReadingCompleted(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Я закончил(а) чтение вслух → Перейти к вопросам
          </button>
        )}
      </div>

      {/* ЧАСТЬ 1 · ЗАДАНИЕ 2: Беседа по тексту (пошагово) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1424] border border-slate-800 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-white inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Часть 1 · Задание 2
          </h3>
          <span className="text-xs text-slate-400">
            Беседа по тексту (Карточка собеседника · 5 вопросов)
          </span>
        </div>

        {!readingCompleted ? (
          <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-slate-700 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs sm:text-sm text-slate-400">
              Вопросы собеседника откроются после завершения чтения текста вслух
            </p>
            <button
              type="button"
              onClick={() => {
                stopActiveRecorder();
                setRecordingTarget(null);
                setReadingCompleted(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Я закончил(а) чтение вслух → Перейти к вопросам
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 leading-relaxed">
              Отвечайте на вопросы развёрнутыми полными предложениями (голосом или с клавиатуры), затем сверьте себя с эталоном.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 font-semibold">
                Вопрос {currentDialogueStep} из {variant.questions.length}
              </span>
              {currentDialogueStep >= variant.questions.length && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 font-semibold">
                  Все 5 вопросов пройдены ✓
                </span>
              )}
            </div>

            {!showAllQuestions ? (
              <div className="space-y-3">
                {variant.questions
                  .filter((q) => q.number === currentDialogueStep)
                  .map((q) => {
                    const isRecThis =
                      recordingTarget?.kind === 'dialogue' &&
                      recordingTarget.questionNumber === q.number;
                    const userAns = dialogueAnswers[q.number] ?? '';
                    const sampleShown = Boolean(revealedSamples[q.number]);
                    const audioUrl = dialogueAudioUrls[q.number];
                    return (
                      <div
                        key={q.number}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
                      >
                        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          <strong className="text-white">Вопрос {q.number}.</strong>{' '}
                          {q.question}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              toggleRecording({ kind: 'dialogue', questionNumber: q.number })
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                              isRecThis
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-600/50'
                            }`}
                          >
                            {isRecThis ? (
                              <>
                                <MicOff className="w-3.5 h-3.5" />
                                Остановить
                              </>
                            ) : (
                              <>
                                <Mic className="w-3.5 h-3.5" />
                                Записать свой голос
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setRevealedSamples((prev) => ({
                                ...prev,
                                [q.number]: !prev[q.number],
                              }))
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                          >
                            {sampleShown ? 'Скрыть эталон' : 'Эталон ответа'}
                          </button>
                        </div>

                        {audioUrl && (
                          <audio controls src={audioUrl} className="w-full" />
                        )}

                        <textarea
                          rows={2}
                          value={userAns}
                          onChange={(e) =>
                            setDialogueAnswers((prev) => ({
                              ...prev,
                              [q.number]: e.target.value,
                            }))
                          }
                          placeholder="Впишите ответ или надиктуйте его через Win+H..."
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500/60 focus:outline-none p-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600"
                        />
                        {sampleShown && (
                          <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                            <strong className="text-emerald-300">Пример правильного ответа:</strong>{' '}
                            {q.sampleAnswer}
                          </div>
                        )}
                      </div>
                    );
                  })}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {currentDialogueStep < variant.questions.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        stopActiveRecorder();
                        setRecordingTarget(null);
                        setCurrentDialogueStep((s) => Math.min(variant.questions.length, s + 1));
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      Следующий вопрос →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAllQuestions(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Показать все 5 вопросов для обзора
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {variant.questions.map((q) => {
                  const userAns = dialogueAnswers[q.number] ?? '';
                  return (
                    <div
                      key={q.number}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1"
                    >
                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        <strong className="text-white">Вопрос {q.number}.</strong>{' '}
                        {q.question}
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Ваш ответ:</strong>{' '}
                        {userAns.trim() || <span className="italic text-slate-500">— нет ответа —</span>}
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowAllQuestions(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  ← Вернуться к пошаговому режиму
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ЧАСТЬ 2 · ЗАДАНИЕ 3: Монологическое высказывание */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1424] border border-slate-800 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-white inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Часть 2 · Задание 3 (не менее 10 предложений, до 3 минут)
          </h3>
          <span className="text-xs text-slate-400">Монологическое высказывание</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMonologueHelp((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {showMonologueHelp ? 'Скрыть клише' : 'Речевые клише для монолога'}
          </button>

          <button
            type="button"
            onClick={() => toggleRecording({ kind: 'monologue' })}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              recordingTarget?.kind === 'monologue'
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {recordingTarget?.kind === 'monologue' ? (
              <>
                <MicOff className="w-4 h-4" />
                Остановить
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Записать свой голос
              </>
            )}
          </button>
        </div>

        {/* Выбор 1 из 3 тем */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {variant.monologueTopics.map((topic) => {
            const isSel = topic.number === activeMonologueTopic.number;
            return (
              <button
                key={topic.number}
                type="button"
                onClick={() => setSelectedTopicNum(topic.number)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSel
                    ? 'bg-amber-500/15 border-amber-400 text-white'
                    : 'bg-[#080B14]/80 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-300 mb-0.5">
                  {topic.modeLabel}
                </div>
                <div className="text-xs sm:text-sm font-medium leading-snug">
                  {topic.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Карточка участника собеседования */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="text-xs sm:text-sm font-semibold text-white">
            Карточка участника · {activeMonologueTopic.title}
          </div>
          {activeMonologueTopic.sceneHint && (
            <p className="text-xs text-slate-400 italic leading-relaxed">
              {activeMonologueTopic.sceneHint}
            </p>
          )}
          <div className="text-xs font-medium text-slate-300">
            Не забудьте раскрыть все 4 пункта плана:
          </div>
          <ul className="space-y-1 text-xs sm:text-sm text-slate-200 list-disc pl-4 leading-relaxed">
            {activeMonologueTopic.planPoints.map((pt, idx) => (
              <li key={idx}>{pt}</li>
            ))}
          </ul>
          {showMonologueHelp && (
            <div className="pt-2 border-t border-slate-800/70 space-y-1.5">
              <div className="text-xs font-semibold text-amber-200">
                Речевые клише (нажмите, чтобы добавить в текст монолога):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeMonologueTopic.cliches.map((cl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setMonologueTranscript((prev) =>
                        prev ? `${prev} ${cl}` : cl
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-violet-500/20 border border-slate-700 text-xs text-slate-200 cursor-pointer text-left"
                  >
                    + {cl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Плеер записи монолога */}
        {monologueAudioUrl && (
          <audio controls src={monologueAudioUrl} className="w-full" />
        )}

        {/* Расшифровка монолога + живой счётчик предложений */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-slate-300">Текст вашего монолога:</span>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-md font-semibold ${
                  monologueSentences >= 10
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                    : 'bg-slate-800 text-amber-200'
                }`}
              >
                Предложений: {monologueSentences} / 10 (норма ФИПИ)
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                Слов: {monologueWords}
              </span>
            </div>
          </div>

          <textarea
            rows={5}
            value={monologueTranscript}
            onChange={(e) => setMonologueTranscript(e.target.value)}
            placeholder="Впишите текст монолога или надиктуйте его через Win+H для подсчёта предложений..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400/60 focus:outline-none p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 leading-relaxed"
          />
        </div>
      </div>

      {/* Кнопка завершения собеседования */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1917]/90 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-300 leading-relaxed">
          Для получения «Зачёта» на собеседовании нужно набрать от 10 баллов из 20 (включая монолог ≥ 10 фраз).
        </p>
        {!finished ? (
          <button
            type="button"
            onClick={handleFinishExam}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            Завершить собеседование и засчитать
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Собеседование завершено · Зачёт!
          </span>
        )}
      </div>

      {/* Сброс варианта */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleResetVariant}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Сбросить текущий вариант
        </button>
      </div>
    </div>
  );
};
