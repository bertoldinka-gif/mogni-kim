import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ORAL_INTERVIEW_VARIANTS } from '../../data/oge/oralInterviewBank';

interface OralInterviewEngineProps {
  onComplete: (passed: boolean, summaryText: string) => void;
}

interface FipaCriterion {
  id: string;
  code: string;
  title: string;
  maxScore: number;
  table: number;
}

const FIPA_CRITERIA: FipaCriterion[] = [
  // Таблица 1 · Чтение вслух (макс. 3 б.)
  { id: 'ch1', code: 'Ч1', title: 'Интонация', maxScore: 1, table: 1 },
  { id: 'ch2', code: 'Ч2', title: 'Темп чтения', maxScore: 1, table: 1 },
  { id: 'ch3', code: 'Ч3', title: 'Искажения слов', maxScore: 1, table: 1 },
  // Таблица 2 · Беседа по тексту (макс. 5 б.)
  { id: 'd1', code: 'Д1', title: 'Вопрос 1', maxScore: 1, table: 2 },
  { id: 'd2', code: 'Д2', title: 'Вопрос 2', maxScore: 1, table: 2 },
  { id: 'd3', code: 'Д3', title: 'Вопрос 3', maxScore: 1, table: 2 },
  { id: 'd4', code: 'Д4', title: 'Вопрос 4', maxScore: 1, table: 2 },
  { id: 'd5', code: 'Д5', title: 'Вопрос 5', maxScore: 1, table: 2 },
  // Таблица 3 · Монолог (макс. 3 б.)
  { id: 'm1', code: 'М1', title: 'Коммуникативная задача: ≥ 10 фраз', maxScore: 2, table: 3 },
  { id: 'm2', code: 'М2', title: 'Логичность монолога', maxScore: 1, table: 3 },
  // Таблица 4 · Грамотность речи (макс. 6 б.)
  { id: 'r1', code: 'Р1', title: 'Орфоэпические нормы', maxScore: 2, table: 4 },
  { id: 'r2', code: 'Р2', title: 'Грамматические нормы', maxScore: 2, table: 4 },
  { id: 'r3', code: 'Р3', title: 'Речевые нормы', maxScore: 2, table: 4 },
];

const FIPA_MAX_TOTAL = 17;
const FIPA_PASS_THRESHOLD = 10;

const TABLE_TITLES: Record<number, string> = {
  1: 'Таблица 1 · Чтение вслух (макс. 3 б.)',
  2: 'Таблица 2 · Беседа по тексту (макс. 5 б.)',
  3: 'Таблица 3 · Монолог (макс. 3 б.)',
  4: 'Таблица 4 · Грамотность речи по заданиям 1–3 (макс. 6 б.)',
};

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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

  const [soundEnabled, setSoundEnabled] = useState(true);

  // ==== ЗАДАНИЕ 1: таймеры подготовки 5:00 и чтения 2:00 ====
  const [prepSeconds, setPrepSeconds] = useState(5 * 60);
  const [prepRunning, setPrepRunning] = useState(false);
  const [readSeconds, setReadSeconds] = useState(2 * 60);
  const [readRunning, setReadRunning] = useState(false);

  // ==== ЗАДАНИЕ 3: таймеры подготовки 2:00 и ответа 3:00 ====
  const [monoPrepSeconds, setMonoPrepSeconds] = useState(2 * 60);
  const [monoPrepRunning, setMonoPrepRunning] = useState(false);
  const [monoAnswerSeconds, setMonoAnswerSeconds] = useState(3 * 60);
  const [monoAnswerRunning, setMonoAnswerRunning] = useState(false);

  // ==== Чтение завершено / пошаговые вопросы ====
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [readingSpentSec, setReadingSpentSec] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [revealedSamples, setRevealedSamples] = useState<Record<number, boolean>>({});

  // ==== Монолог ====
  const [selectedTopicNum, setSelectedTopicNum] = useState<1 | 2 | 3>(1);
  const [monologueImageUrl, setMonologueImageUrl] = useState<string | null>(null);
  const [showCliches, setShowCliches] = useState(false);

  // ==== Оценки ФИПИ ====
  const [scores, setScores] = useState<Record<string, number>>({});
  const [savedToast, setSavedToast] = useState(false);

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

  // Таймеры
  useEffect(() => {
    if (!prepRunning) return;
    const id = window.setInterval(() => {
      setPrepSeconds((prev) => {
        if (prev <= 1) {
          setPrepRunning(false);
          playBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [prepRunning, soundEnabled]);

  useEffect(() => {
    if (!readRunning) return;
    const id = window.setInterval(() => {
      setReadSeconds((prev) => {
        if (prev <= 1) {
          setReadRunning(false);
          playBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [readRunning, soundEnabled]);

  useEffect(() => {
    if (!monoPrepRunning) return;
    const id = window.setInterval(() => {
      setMonoPrepSeconds((prev) => {
        if (prev <= 1) {
          setMonoPrepRunning(false);
          playBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [monoPrepRunning, soundEnabled]);

  useEffect(() => {
    if (!monoAnswerRunning) return;
    const id = window.setInterval(() => {
      setMonoAnswerSeconds((prev) => {
        if (prev <= 1) {
          setMonoAnswerRunning(false);
          playBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [monoAnswerRunning, soundEnabled]);

  // Примечание ФИПИ: если М1 = 0, то М2 = 0
  useEffect(() => {
    if ((scores.m1 ?? 0) === 0 && (scores.m2 ?? 0) !== 0) {
      setScores((prev) => ({ ...prev, m2: 0 }));
    }
  }, [scores.m1, scores.m2]);

  const activeTopic =
    variant.monologueTopics.find((t) => t.number === selectedTopicNum) ??
    variant.monologueTopics.at(0)!;

  const totalScore = useMemo(
    () => FIPA_CRITERIA.reduce((sum, crit) => sum + (scores[crit.id] ?? 0), 0),
    [scores]
  );
  const passed = totalScore >= FIPA_PASS_THRESHOLD;

  const readingSpent =
    readingSpentSec > 0 ? readingSpentSec : Math.max(1, 2 * 60 - readSeconds);
  const readingWpm =
    readingSpent > 0 && variant.wordCount > 0
      ? Math.round((variant.wordCount / readingSpent) * 60)
      : 0;

  const handleCompleteReading = () => {
    setReadRunning(false);
    const spent = Math.max(1, 2 * 60 - readSeconds);
    setReadingSpentSec(spent);
    setReadingCompleted(true);
  };

  const handleSaveScores = () => {
    const summary = `Итоговое собеседование (${variant.title}): ${totalScore}/${FIPA_MAX_TOTAL} б. (${
      passed ? 'ЗАЧЁТ' : 'НЕЗАЧЁТ'
    })`;
    onComplete(passed, summary);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2000);
  };

  const handleReset = () => {
    setPrepSeconds(5 * 60);
    setPrepRunning(false);
    setReadSeconds(2 * 60);
    setReadRunning(false);
    setMonoPrepSeconds(2 * 60);
    setMonoPrepRunning(false);
    setMonoAnswerSeconds(3 * 60);
    setMonoAnswerRunning(false);
    setReadingCompleted(false);
    setReadingSpentSec(0);
    setCurrentQuestion(1);
    setShowAllQuestions(false);
    setRevealedSamples({});
    setMonologueImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setShowCliches(false);
    setScores({});
    setSavedToast(false);
  };

  const renderTimerControls = (
    label: string,
    seconds: number,
    running: boolean,
    setRunning: (fn: (r: boolean) => boolean) => void,
    onReset: () => void,
    accent: 'indigo' | 'emerald' | 'amber' | 'cyan'
  ) => {
    const accentMap = {
      indigo: 'border-indigo-400/40 text-indigo-200 bg-[#080B14]',
      emerald: 'border-emerald-400/40 text-emerald-200 bg-[#080B14]',
      amber: 'border-amber-400/40 text-amber-200 bg-[#080B14]',
      cyan: 'border-cyan-400/40 text-cyan-200 bg-[#080B14]',
    } as const;
    const btnMap = {
      indigo: 'bg-indigo-500 hover:bg-indigo-400',
      emerald: 'bg-emerald-600 hover:bg-emerald-500',
      amber: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
      cyan: 'bg-cyan-600 hover:bg-cyan-500',
    } as const;

    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400">{label}</span>
        <div
          className={`px-3 py-1.5 rounded-lg border font-mono-num text-base font-bold tracking-wider ${accentMap[accent]}`}
        >
          {formatTime(seconds)}
        </div>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className={`px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer ${btnMap[accent]}`}
        >
          {running ? 'Пауза' : 'Старт'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
        >
          Сброс
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-4">
      {/* Шапка варианта + общий переключатель звонка */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-[#0F1424] to-violet-950/40 border border-indigo-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
            <span>ОГЭ · Итоговое собеседование (Допуск)</span>
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
                    setVariantId(v.id);
                    handleReset();
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

        <button
          type="button"
          onClick={() => setSoundEnabled((s) => !s)}
          title={soundEnabled ? 'Звонок таймера включён' : 'Звонок таймера выключен'}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer shrink-0"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* БЛОК 1 · ЧАСТЬ 1 · ЗАДАНИЕ 1 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1424] border border-slate-800 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-semibold text-white inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            Блок 1 · Часть 1 · Задание 1 ({variant.wordCount} слов)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {renderTimerControls(
              'Подготовка',
              prepSeconds,
              prepRunning,
              setPrepRunning,
              () => {
                setPrepSeconds(5 * 60);
                setPrepRunning(false);
              },
              'indigo'
            )}
            {renderTimerControls(
              'Чтение',
              readSeconds,
              readRunning,
              setReadRunning,
              () => {
                setReadSeconds(2 * 60);
                setReadRunning(false);
              },
              'emerald'
            )}
          </div>
        </div>

        {/* Вопрос 5 по цитате — над текстом */}
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs sm:text-sm text-indigo-100 leading-relaxed">
          <strong className="text-indigo-300">Вопрос 5 по цитате (материал к заданию 2):</strong>{' '}
          {variant.quotePrompt}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {variant.readingIntro}
        </p>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed space-y-2">
          {variant.readingText.split('\n').map((para, pIdx) => (
            <p key={pIdx}>{para}</p>
          ))}
        </div>

        {!readingCompleted ? (
          <button
            type="button"
            onClick={handleCompleteReading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Завершить чтение и открыть вопросы
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
            <div className="font-semibold">
              Чтение завершено. Затрачено времени: {formatTime(readingSpent)}.
            </div>
            <div>
              Скорость чтения: <strong>~{readingWpm} слов/мин</strong>{' '}
              <span className="text-emerald-300/80">(норма ФИПИ — 95–130 слов/мин)</span>
            </div>
          </div>
        )}
      </div>

      {/* БЛОК 2 · ЧАСТЬ 1 · ЗАДАНИЕ 2 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1424] border border-slate-800 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-white inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Блок 2 · Часть 1 · Задание 2
          </h3>
          <span className="text-xs text-slate-400">Беседа по тексту · 5 вопросов</span>
        </div>

        {!readingCompleted ? (
          <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-slate-700 text-center text-xs sm:text-sm text-slate-400">
            Вопросы откроются после завершения чтения вслух (Блок 1).
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 font-semibold text-xs">
                {showAllQuestions ? 'Все вопросы для обзора' : `Вопрос ${currentQuestion} из 5`}
              </span>
              <button
                type="button"
                onClick={() => setShowAllQuestions((v) => !v)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
              >
                {showAllQuestions ? 'По одному' : 'Показать все вопросы'}
              </button>
            </div>

            <div className="space-y-3">
              {variant.questions
                .filter((q) => showAllQuestions || q.number === currentQuestion)
                .map((q) => {
                  const sampleShown = Boolean(revealedSamples[q.number]);
                  return (
                    <div
                      key={q.number}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
                    >
                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        <strong className="text-white">Вопрос {q.number}.</strong>{' '}
                        {q.question}
                      </div>
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
                        {sampleShown ? 'Скрыть эталон' : 'Проверить по эталону'}
                      </button>
                      {sampleShown && (
                        <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                          <strong className="text-emerald-300">Эталон ответа:</strong>{' '}
                          {q.sampleAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {!showAllQuestions && currentQuestion < variant.questions.length && (
              <button
                type="button"
                onClick={() => setCurrentQuestion((n) => Math.min(variant.questions.length, n + 1))}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                Следующий вопрос →
              </button>
            )}
            {!showAllQuestions && currentQuestion >= variant.questions.length && (
              <div className="text-xs font-semibold text-emerald-300">
                Все 5 вопросов пройдены ✓
              </div>
            )}
          </>
        )}
      </div>

      {/* БЛОК 3 · ЧАСТЬ 2 · ЗАДАНИЕ 3 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1424] border border-slate-800 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-semibold text-white inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Блок 3 · Часть 2 · Задание 3
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {renderTimerControls(
              'Подготовка',
              monoPrepSeconds,
              monoPrepRunning,
              setMonoPrepRunning,
              () => {
                setMonoPrepSeconds(2 * 60);
                setMonoPrepRunning(false);
              },
              'amber'
            )}
            {renderTimerControls(
              'Ответ',
              monoAnswerSeconds,
              monoAnswerRunning,
              setMonoAnswerRunning,
              () => {
                setMonoAnswerSeconds(3 * 60);
                setMonoAnswerRunning(false);
              },
              'cyan'
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {variant.monologueTopics.map((topic) => {
            const isSel = topic.number === activeTopic.number;
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

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="text-xs sm:text-sm font-semibold text-white">
            Карточка участника · {activeTopic.title}
          </div>
          {activeTopic.sceneHint && (
            <p className="text-xs text-slate-400 italic leading-relaxed">
              {activeTopic.sceneHint}
            </p>
          )}

          {/* Загрузка картинки только для Темы 1 (Описание фотографии) */}
          {selectedTopicNum === 1 && (
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer">
                <ImageIcon className="w-4 h-4 text-violet-400" />
                <span>Загрузить картинку</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setMonologueImageUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return url;
                    });
                  }}
                />
              </label>
              {monologueImageUrl && (
                <img
                  src={monologueImageUrl}
                  alt="Фотография для описания"
                  className="max-h-64 rounded-xl border border-slate-700"
                />
              )}
            </div>
          )}

          <div className="text-xs font-medium text-slate-300">
            Не забудьте раскрыть все 4 пункта плана:
          </div>
          <ul className="space-y-1 text-xs sm:text-sm text-slate-200 list-disc pl-4 leading-relaxed">
            {activeTopic.planPoints.map((pt, idx) => (
              <li key={idx}>{pt}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setShowCliches((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-200 cursor-pointer"
          >
            {showCliches ? 'Скрыть клише' : 'Показать речевые клише'}
            {showCliches ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showCliches && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeTopic.cliches.map((cl, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                >
                  {cl}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* БЛОК 4 · КРИТЕРИИ ФИПИ 2027 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1424] border border-emerald-500/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-white">
            Блок 4 · Критерии оценивания ФИПИ · 2027 г. (макс. 17 баллов, зачёт от 10 б.)
          </h3>
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              passed
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
            }`}
          >
            {passed ? 'ЗАЧЁТ' : 'НЕЗАЧЁТ'}
          </span>
        </div>

        {[1, 2, 3, 4].map((tableNum) => (
          <div
            key={tableNum}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
          >
            <div className="text-xs font-semibold text-slate-300">
              {TABLE_TITLES[tableNum]}
            </div>
            <div className="space-y-1.5">
              {FIPA_CRITERIA.filter((c) => c.table === tableNum).map((crit) => {
                const current = scores[crit.id] ?? 0;
                const m2Disabled = crit.id === 'm2' && (scores.m1 ?? 0) === 0;
                const options = Array.from({ length: crit.maxScore + 1 }, (_, i) => i);
                return (
                  <div
                    key={crit.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-slate-300">
                      <span className="font-mono-num text-violet-300 mr-1.5">
                        {crit.code}
                      </span>
                      {crit.title} (0–{crit.maxScore})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {options.map((pt) => {
                        const disabled = m2Disabled && pt > 0;
                        const selected = current === pt;
                        return (
                          <button
                            key={pt}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              setScores((prev) => ({ ...prev, [crit.id]: pt }))
                            }
                            className={`w-8 h-7 rounded-md border text-xs font-semibold transition-colors ${
                              selected
                                ? 'bg-violet-600 border-violet-400 text-white'
                                : disabled
                                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-violet-500/60 cursor-pointer'
                            }`}
                          >
                            {pt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="text-sm font-semibold text-white">
            Итого: <span className="font-mono-num text-lg">{totalScore}</span> / {FIPA_MAX_TOTAL} б.
          </div>
          <button
            type="button"
            onClick={handleSaveScores}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              savedToast
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {savedToast ? 'Сохранено!' : 'Сохранить баллы в результатах ученика'}
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          Сбросить всё
        </button>
      </div>
    </div>
  );
};
