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

type SpeechTarget =
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
  const [readingSecondsSpent, setReadingSecondsSpent] = useState(0);

  // Задание 2: ответы на 5 вопросов беседы
  const [dialogueAnswers, setDialogueAnswers] = useState<Record<number, string>>({});
  const [revealedSamples, setRevealedSamples] = useState<Record<number, boolean>>({});

  // Задание 3: монолог (1 из 3 тем)
  const [selectedTopicNum, setSelectedTopicNum] = useState<1 | 2 | 3>(1);
  const [monologueTranscript, setMonologueTranscript] = useState('');
  const [showMonologueHelp, setShowMonologueHelp] = useState(false);

  // Завершение собеседования
  const [finished, setFinished] = useState(false);

  // Web Speech API (онлайн-транскрибация речи)
  const [recordingTarget, setRecordingTarget] = useState<SpeechTarget>(null);
  const [interimText, setInterimText] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

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

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
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

  // Секундомер чтения вслух для подсчёта темпа (слов/мин)
  useEffect(() => {
    if (recordingTarget?.kind !== 'reading') return;
    const id = window.setInterval(() => {
      setReadingSecondsSpent((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [recordingTarget]);

  const startStageTimer = (label: string, totalSeconds: number) => {
    setTimerLabel(label);
    setSecondsLeft(totalSeconds);
    setTimerRunning(true);
  };

  const stopRecording = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setRecordingTarget(null);
    setInterimText('');
  };

  const toggleRecording = (target: NonNullable<SpeechTarget>) => {
    const isSame =
      recordingTarget?.kind === target.kind &&
      (target.kind !== 'dialogue' ||
        (recordingTarget.kind === 'dialogue' &&
          recordingTarget.questionNumber === target.questionNumber));

    if (isSame) {
      stopRecording();
      return;
    }

    stopRecording();
    setSpeechError(null);

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError(
        'Ваш браузер не поддерживает голосовой ввод — вы можете вписать или отредактировать текст вручную.'
      );
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'ru-RU';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results.item(i);
          const transcript = res.item(0)?.transcript ?? '';
          if (res.isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interimChunk += transcript;
          }
        }
        setInterimText(interimChunk);

        if (finalChunk.trim()) {
          if (target.kind === 'reading') {
            setReadingTranscript((prev) =>
              `${prev} ${finalChunk.trim()}`.trim()
            );
          } else if (target.kind === 'dialogue') {
            setDialogueAnswers((prev) => ({
              ...prev,
              [target.questionNumber]: `${prev[target.questionNumber] ?? ''} ${finalChunk.trim()}`.trim(),
            }));
          } else if (target.kind === 'monologue') {
            setMonologueTranscript((prev) =>
              `${prev} ${finalChunk.trim()}`.trim()
            );
          }
        }
      };

      rec.onerror = (e: any) => {
        if (e?.error !== 'aborted') {
          setSpeechError(
            'Не удалось получить сигнал с микрофона. Проверьте разрешение микрофона в браузере или введите ответ вручную.'
          );
        }
        setRecordingTarget(null);
        setInterimText('');
      };

      rec.onend = () => {
        setRecordingTarget(null);
        setInterimText('');
      };

      recognitionRef.current = rec;
      setRecordingTarget(target);
      rec.start();
    } catch {
      setSpeechError('Ошибка запуска микрофона. Вы можете ввести ответ с клавиатуры.');
      setRecordingTarget(null);
    }
  };

  // Аналитика Задания 1 (сверка прочитанного вслух с эталонным текстом)
  const readingStats = useMemo(() => {
    const refWords = tokenizeWords(variant.readingText);
    const spokenWords = tokenizeWords(readingTranscript);
    const spokenSet = new Set(spokenWords);
    const matchedCount = refWords.filter((w) => spokenSet.has(w)).length;
    const accuracy =
      refWords.length > 0 && spokenWords.length > 0
        ? Math.min(100, Math.round((matchedCount / refWords.length) * 100))
        : 0;
    const wpm =
      readingSecondsSpent >= 5 && spokenWords.length > 0
        ? Math.round((spokenWords.length / readingSecondsSpent) * 60)
        : 0;
    return {
      totalRef: refWords.length,
      spokenCount: spokenWords.length,
      accuracy,
      wpm,
      spokenSet,
    };
  }, [variant.readingText, readingTranscript, readingSecondsSpent]);

  const activeMonologueTopic =
    variant.monologueTopics.find((t) => t.number === selectedTopicNum) ??
    variant.monologueTopics.at(0)!;
  const monologueSentences = countSentences(monologueTranscript);
  const monologueWords = tokenizeWords(monologueTranscript).length;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const handleFinishExam = () => {
    stopRecording();
    setTimerRunning(false);
    setFinished(true);
    const summary = `Итоговое собеседование (${variant.title}): чтение ${readingStats.accuracy}%, монолог ${monologueSentences} предл.`;
    onComplete(true, summary);
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
stopRecording();
setVariantId(v.id);
setReadingTranscript('');
setReadingSecondsSpent(0);
setDialogueAnswers({});
setMonologueTranscript('');
setFinished(false);
}}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    v.id === variant.id
                      ? 'bg-violet-600/30 border-violet-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}

>
{v.title}

))}

)}
{mins}:{secs}


<button
type="button"
onClick={() => setTimerRunning((r) => !r)}
className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
>

{timerRunning ? 'Пауза' : 'Старт'}

<button
type="button"
onClick={() => startStageTimer('Подготовка к Части 1 (5:00)', 5 * 60)}
className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
>
5:00 (Ч.1)

<button
type="button"
onClick={() => startStageTimer('Подготовка к монологу (2:00)', 2 * 60)}
className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
>
2:00 (Монолог)

<button
type="button"
onClick={() => startStageTimer('Ответ монолога (3:00)', 3 * 60)}
className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
>
3:00 (Ответ)

<button
type="button"
onClick={() => setSoundEnabled((s) => !s)}
title={soundEnabled ? 'Звонок таймера включён' : 'Звонок таймера выключен'}
className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
>
{soundEnabled ? (

) : (

)}


{speechError && (

{speechError}

)}
{/* ЧАСТЬ 1 · ЗАДАНИЕ 1: Чтение текста вслух */}




Часть 1 · Задание 1 ({variant.wordCount} слов)


Чтение текста вслух



<button
type="button"
onClick={() => toggleRecording({ kind: 'reading' })}
className={px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${ recordingTarget?.kind === 'reading' ? 'bg-rose-500 text-white animate-pulse' : 'bg-violet-600 hover:bg-violet-500 text-white' }}
>
{recordingTarget?.kind === 'reading' ? (
<>

Остановить запись
</>
) : (
<>

Читать вслух (Запись речи)
</>
)}

{readingTranscript && (
<button
type="button"
onClick={() => {
setReadingTranscript('');
setReadingSecondsSpent(0);
}}
className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 inline-flex items-center gap-1 cursor-pointer"
>

Сбросить

)}

{variant.readingIntro}
{/* Текст для чтения с подсветкой распознанных слов */}

{variant.readingText.split('\n').map((para, pIdx) => (

{para.split(/(\s+)/).map((tok, tIdx) => {
if (/^\s+$/.test(tok) || !tok) return tok;
const clean = tokenizeWords(tok).at(0) ?? '';
const isMatched =
readingStats.spokenCount > 0 && clean && readingStats.spokenSet.has(clean);
return (
 0
? isMatched
? 'text-emerald-300'
: 'text-amber-300/90 underline decoration-amber-500/40'
: undefined
}
>
{tok}

);
})}

))}
{/* Онлайн-расшифровка чтения и метрики точности / темпа */}
{(readingTranscript || recordingTarget?.kind === 'reading') && (



Распознанная речь (онлайн):



Точность слов: {readingStats.accuracy}%

{readingStats.wpm > 0 && (

Темп: ~{readingStats.wpm} слов/мин

)}



{readingTranscript}
{recordingTarget?.kind === 'reading' && interimText && (
 {interimText}
)}


)}
{/* ЧАСТЬ 1 · ЗАДАНИЕ 2: Беседа по тексту (5 вопросов) */}



Часть 1 · Задание 2


Беседа по тексту (Карточка собеседника · 5 вопросов)


Отвечайте на вопросы развёрнутыми полными предложениями (голосом или с клавиатуры), затем сверьте себя с эталоном.

{variant.questions.map((q) => {
const isRecThis =
recordingTarget?.kind === 'dialogue' &&
recordingTarget.questionNumber === q.number;
const userAns = dialogueAnswers[q.number] ?? '';
const sampleShown = Boolean(revealedSamples[q.number]);
return (



Вопрос {q.number}.
{q.question}


<button
type="button"
onClick={() =>
toggleRecording({ kind: 'dialogue', questionNumber: q.number })
}
className={px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${ isRecThis ? 'bg-rose-500 text-white animate-pulse' : 'bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-600/50' }}
>

{isRecThis ? 'Стоп' : 'Ответить голосом'}

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


<textarea
rows={2}
value={
isRecThis && interimText
? ${userAns} ${interimText}.trim()
: userAns
}
onChange={(e) =>
setDialogueAnswers((prev) => ({
...prev,
[q.number]: e.target.value,
}))
}
placeholder="Надиктуйте или запишите развёрнутый ответ..."
className="w-full rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500/60 focus:outline-none p-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600"
/>
{sampleShown && (

Пример правильного ответа:{' '}
{q.sampleAnswer}

)}

);
})}

{/* ЧАСТЬ 2 · ЗАДАНИЕ 3: Монологическое высказывание */}




Часть 2 · Задание 3 (не менее 10 предложений, до 3 минут)


Монологическое высказывание



<button
type="button"
onClick={() => setShowMonologueHelp((v) => !v)}
className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-200 inline-flex items-center gap-1.5 cursor-pointer"
>

{showMonologueHelp ? 'Скрыть клише' : 'Речевые клише для монолога'}

<button
type="button"
onClick={() => toggleRecording({ kind: 'monologue' })}
className={px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer ${ recordingTarget?.kind === 'monologue' ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 hover:bg-amber-400 text-slate-950' }}
>


{recordingTarget?.kind === 'monologue'
? 'Остановить запись'
: 'Произнести монолог (Запись)'}



{/* Выбор 1 из 3 тем */}

{variant.monologueTopics.map((topic) => {
const isSel = topic.number === activeMonologueTopic.number;
return (
<button
key={topic.number}
type="button"
onClick={() => setSelectedTopicNum(topic.number)}
className={text-left p-3 rounded-xl border transition-all cursor-pointer ${ isSel ? 'bg-amber-500/15 border-amber-400 text-white' : 'bg-[#080B14]/80 border-slate-800 text-slate-300 hover:border-slate-600' }}
>

{topic.modeLabel}

{topic.title}

);
})}
{/* Карточка участника собеседования */}


Карточка участника · {activeMonologueTopic.title}

{activeMonologueTopic.sceneHint && (

{activeMonologueTopic.sceneHint}

)}

Не забудьте раскрыть все 4 пункта плана:


{activeMonologueTopic.planPoints.map((pt, idx) => (
{pt}
))}
{showMonologueHelp && (


Речевые клише (нажмите, чтобы добавить в текст монолога):


{activeMonologueTopic.cliches.map((cl, idx) => (
<button
key={idx}
type="button"
onClick={() =>
setMonologueTranscript((prev) =>
prev ? ${prev} ${cl} : cl
)
}
className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-violet-500/20 border border-slate-700 text-xs text-slate-200 cursor-pointer text-left"
>
+ {cl}

))}


)}
{/* Расшифровка монолога + живой счётчик предложений */}




Расшифровка вашего монолога:


<span
className={px-2.5 py-0.5 rounded-md font-semibold ${ monologueSentences >= 10 ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'bg-slate-800 text-amber-200' }}
>
Предложений: {monologueSentences} / 10 (норма ФИПИ)


Слов: {monologueWords}


<textarea
rows={5}
value={
recordingTarget?.kind === 'monologue' && interimText
? ${monologueTranscript} ${interimText}.trim()
: monologueTranscript
}
onChange={(e) => setMonologueTranscript(e.target.value)}
placeholder="Нажмите «Произнести монолог» и говорите в микрофон (или введите текст для проверки)..."
className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400/60 focus:outline-none p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 leading-relaxed"
/>
{/* Кнопка завершения собеседования */}


Для получения «Зачёта» на собеседовании нужно набрать от 10 баллов из 20 (включая монолог ≥ 10 фраз).

{!finished ? (


Завершить собеседование и засчитать

) : (


Собеседование завершено · Зачёт!

)}



);
};
