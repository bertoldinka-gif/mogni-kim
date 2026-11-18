import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eraser,
  Highlighter,
  Keyboard,
  Lightbulb,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import {
  PunctuationInputQuestion,
  SavedQuestionState,
} from '../../types/platform';
import { TrainerSidePanel } from './TrainerSidePanel';

type MarkerTool =
  | 'none'
  | 'subject'
  | 'predicate'
  | 'clause'
  | 'intro'
  | 'conjunction';

const MARKER_TOOLS: Array<{
  id: MarkerTool;
  label: string;
  shortDesc: string;
  btnActiveClass: string;
  tokenClass: string;
}> = [
  {
    id: 'none',
    label: 'Обычный режим',
    shortDesc: 'Ввод ответа',
    btnActiveClass: 'bg-slate-800 border-slate-500 text-white',
    tokenClass: '',
  },
  {
    id: 'subject',
    label: 'Подлежащее',
    shortDesc: '___',
    btnActiveClass: 'bg-indigo-500/20 border-indigo-400 text-indigo-200',
    tokenClass: 'border-b-2 border-indigo-400 text-indigo-100 pb-[1px]',
  },
  {
    id: 'predicate',
    label: 'Сказуемое',
    shortDesc: '===',
    btnActiveClass: 'bg-emerald-500/20 border-emerald-400 text-emerald-200',
    tokenClass: 'border-b-4 border-double border-emerald-400 text-emerald-100 pb-[1px]',
  },
  {
    id: 'clause',
    label: 'Оборот / Границы',
    shortDesc: '|...|',
    btnActiveClass: 'bg-cyan-500/20 border-cyan-400 text-cyan-200',
    tokenClass: 'bg-cyan-500/20 text-cyan-200 rounded px-1',
  },
  {
    id: 'intro',
    label: 'Вводное / Обращение',
    shortDesc: '(...)',
    btnActiveClass: 'bg-amber-500/20 border-amber-400 text-amber-200',
    tokenClass: 'bg-amber-500/25 text-amber-200 rounded px-1',
  },
  {
    id: 'conjunction',
    label: 'Союз',
    shortDesc: '[и]',
    btnActiveClass: 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200',
    tokenClass: 'bg-fuchsia-500/25 text-fuchsia-200 rounded px-1',
  },
];

const MARKER_STYLE_BY_ID: Record<Exclude<MarkerTool, 'none'>, string> = {
  subject: 'border-b-2 border-indigo-400 text-indigo-100 pb-[1px]',
  predicate: 'border-b-4 border-double border-emerald-400 text-emerald-100 pb-[1px]',
  clause: 'bg-cyan-500/20 text-cyan-200 rounded px-1',
  intro: 'bg-amber-500/25 text-amber-200 rounded px-1',
  conjunction: 'bg-fuchsia-500/25 text-fuchsia-200 rounded px-1',
};

function normalizeMark(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '—' || trimmed === '–' || trimmed === '-') return '-';
  if (trimmed === ',' || trimmed === ':') return trimmed;
  return '';
}

function formatMarkLabel(mark: string): string {
  if (mark === ',') return ', (запятая)';
  if (mark === ':') return ': (двоеточие)';
  if (mark === '-') return '— (тире)';
  return 'знак не нужен';
}

function extractDigitTokens(raw: string, validTokens?: string[]): string[] {
  const cleaned = raw.replace(/\D/g, '');
  if (!cleaned) return [];

  if (!validTokens || validTokens.length === 0) {
    return Array.from(new Set(cleaned.split(''))).sort((a, b) => Number(a) - Number(b));
  }

  const validSet = new Set(validTokens);
  const found: string[] = [];
  let i = 0;

  while (i < cleaned.length) {
    if (i + 1 < cleaned.length) {
      const twoDigit = cleaned.slice(i, i + 2);
      if (validSet.has(twoDigit)) {
        found.push(twoDigit);
        i += 2;
        continue;
      }
    }
    const oneDigit = cleaned[i];
    if (validSet.has(oneDigit)) {
      found.push(oneDigit);
    }
    i += 1;
  }

  return Array.from(new Set(found)).sort((a, b) => Number(a) - Number(b));
}

function normalizeDigitCode(raw: string, validTokens?: string[]): string {
  return extractDigitTokens(raw, validTokens).join('');
}

export interface PunctuationSavedState {
  values: string[];
  digitsInput: string;
}

interface PunctuationInputEngineProps {
  question: PunctuationInputQuestion;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<PunctuationSavedState>;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: PunctuationSavedState,
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

export const PunctuationInputEngine: React.FC<PunctuationInputEngineProps> = ({
  question,
  isReviewMode = false,
  isLastQuestion = false,
  canGoPrev = false,
  savedState,
  comboStreak = 0,
  activeMentor = null,
  userXp = 999,
  onRequestHint,
  onAnswered,
  onPrev,
  onNext,
  onMarkLearned,
}) => {
  const isDigitMode = question.expectedDigits !== undefined;
  const segments = isDigitMode ? [] : question.sentenceTemplate.split('[_]');
  const slotCount = isDigitMode ? 0 : Math.max(0, segments.length - 1);
  const expectedMarks = question.expectedMarks ?? [];

  const templateDigitTokens: string[] = [];
  if (isDigitMode) {
    const tokenRegex = /\((\d+)\)/g;
    let tokMatch: RegExpExecArray | null = null;
    while ((tokMatch = tokenRegex.exec(question.sentenceTemplate)) !== null) {
      if (tokMatch[1]) {
        templateDigitTokens.push(tokMatch[1]);
      }
    }
  }

  const [values, setValues] = useState<string[]>(
    () => savedState?.userState?.values ?? Array(slotCount).fill('')
  );
  const [digitsInput, setDigitsInput] = useState<string>(
    () => savedState?.userState?.digitsInput ?? ''
  );
  const [focusedSlot, setFocusedSlot] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<MarkerTool>('none');
  const [wordMarks, setWordMarks] = useState<Record<string, Exclude<MarkerTool, 'none'>>>({});
  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digitsInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValues(savedState?.userState?.values ?? Array(slotCount).fill(''));
    setDigitsInput(savedState?.userState?.digitsInput ?? '');
    setFocusedSlot(0);
    setWordMarks({});
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);
    if (!savedState) {
      setTimeout(() => {
        if (isDigitMode) {
          digitsInputRef.current?.focus();
        } else {
          const firstInput = inputRefs.current.find((el) => Boolean(el));
          firstInput?.focus();
        }
      }, 30);
    }
  }, [question.id, slotCount, isDigitMode, savedState]);

  const canAffordHint = userXp >= 5;

  const handleToggleHint = () => {
    if (showHint) {
      setShowHint(false);
      return;
    }
    if (hintUnlocked) {
      setShowHint(true);
      return;
    }
    if (!canAffordHint) return;
    if (onRequestHint && !onRequestHint()) return;
    setHintUnlocked(true);
    setShowHint(true);
  };

  const toggleWordMark = (tokenKey: string) => {
    if (activeTool === 'none') return;
    setWordMarks((prev) => {
      const next = { ...prev };
      if (next[tokenKey] === activeTool) {
        delete next[tokenKey];
      } else {
        next[tokenKey] = activeTool;
      }
      return next;
    });
  };

  const toggleDigitSelection = (digit: string) => {
    if (submitted) return;
    const currentTokens = extractDigitTokens(digitsInput, templateDigitTokens);
    const nextTokens = currentTokens.includes(digit)
      ? currentTokens.filter((d) => d !== digit)
      : [...currentTokens, digit].sort((a, b) => Number(a) - Number(b));
    setDigitsInput(nextTokens.join(''));
  };

  const focusSlot = (index: number) => {
    if (index < 0 || index >= slotCount) return;
    setFocusedSlot(index);
    inputRefs.current[index]?.focus();
  };

  const setSlotValue = (index: number, nextMark: string, advance: boolean) => {
    if (submitted || index < 0 || index >= slotCount) return;
    const normalized = normalizeMark(nextMark);
    setValues((prev) => {
      const copy = [...prev];
      copy[index] = normalized;
      return copy;
    });
    if (advance && index + 1 < slotCount) {
      focusSlot(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (submitted) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusSlot(index - 1);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusSlot(index + 1);
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      setSlotValue(index, '', true);
      return;
    }

    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        e.preventDefault();
        focusSlot(index - 1);
      } else {
        e.preventDefault();
        setSlotValue(index, '', false);
      }
      return;
    }

    if (e.key === ',' || e.key === ':' || e.key === '-' || e.key === '—' || e.key === '–') {
      e.preventDefault();
      setSlotValue(index, e.key, true);
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (submitted) return;
    const raw = e.target.value;
    if (!raw) {
      setSlotValue(index, '', false);
      return;
    }
    const lastChar = raw.slice(-1);
    const normalized = normalizeMark(lastChar);
if (normalized === ',' || normalized === ':' || normalized === '-') {
setSlotValue(index, normalized, true);
}
};
const handleSubmit = () => {
if (submitted) return;
let allCorrect = false;
if (isDigitMode) {
const normalizedUser = normalizeDigitCode(digitsInput, templateDigitTokens);
const normalizedExpected = normalizeDigitCode(
question.expectedDigits ?? '',
templateDigitTokens
);
if (!normalizedUser && normalizedExpected !== '') return;
allCorrect = normalizedUser === normalizedExpected;
} else {
allCorrect =
expectedMarks.length === slotCount &&
expectedMarks.every((exp, i) => normalizeMark(values[i] ?? '') === normalizeMark(exp));
}
let quote: string | null = null;
if (activeMentor) {
if (!allCorrect) {
quote = pickRandomQuote(activeMentor.mistakeQuotes);
} else if (comboStreak + 1 >= 2) {
quote = pickRandomQuote(activeMentor.comboQuotes);
}
setMentorQuote(quote);
}
setSubmitted(true);
setIsCorrect(allCorrect);
onAnswered(allCorrect, { values, digitsInput }, quote);
};
const correctHighlight = isDigitMode
? question.expectedDigits || 'Запятые не требуются'
: expectedMarks
.map((mark, idx) => '(' + (idx + 1) + ') ' + formatMarkLabel(normalizeMark(mark)))
.join(' · ');
const renderMarkableTokens = (text: string, prefix: string) => {
const tokens = text.split(/(\s+)/);
return tokens.map((tok, tokIdx) => {
if (!tok) return null;
if (/^\s+$/.test(tok)) {
return <React.Fragment key={prefix + '-sp-' + tokIdx}>{tok}</React.Fragment>;
}
const tokenKey = prefix + '-' + tokIdx;
const appliedMark = wordMarks[tokenKey];
const markClass = appliedMark ? MARKER_STYLE_BY_ID[appliedMark] : '';
if (activeTool === 'none') {
return (
<span
key={tokenKey}
className={'inline transition-colors ' + markClass}
>
{tok}

);
}
return (
<span
key={tokenKey}
role="button"
tabIndex={0}
onClick={() => toggleWordMark(tokenKey)}
onKeyDown={(e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
toggleWordMark(tokenKey);
}
}}
className={'inline cursor-pointer select-none transition-all hover:bg-slate-800/75 rounded-sm ' + markClass}
>
{tok}

);
});
};
const renderDigitSentence = () => {
const expectedSet = new Set(
extractDigitTokens(question.expectedDigits ?? '', templateDigitTokens)
);
const userSet = new Set(
extractDigitTokens(digitsInput, templateDigitTokens)
);
const parts = question.sentenceTemplate.split(/(\d+)/g);
return parts.map((part, pIdx) => {
const match = part.match(/^(\d+)$/);
if (match && match[1]) {
const digit = match[1];
const expectedComma = expectedSet.has(digit);
const userSelected = userSet.has(digit);
let badgeClass =
'bg-violet-500/20 border-violet-400/50 text-violet-200 hover:bg-violet-500/35 hover:border-violet-300';
let label = part;
if (submitted) {
if (expectedComma && userSelected) {
badgeClass = 'bg-emerald-500/25 border-emerald-400 text-emerald-200';
label = '(' + digit + ',)';
} else if (!expectedComma && !userSelected) {
badgeClass = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300';
label = part;
} else if (expectedComma && !userSelected) {
badgeClass = 'bg-rose-500/25 border-rose-400 text-rose-200';
label = '(' + digit + ' + ,)';
} else {
badgeClass = 'bg-rose-500/25 border-rose-400 text-rose-200 line-through';
label = part;
}
} else if (userSelected) {
badgeClass =
'bg-indigo-500/35 border-indigo-300 text-white shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-400/50';
label = '(' + digit + ',)';
}
if (!submitted) {
return (
<button
key={'num-' + pIdx}
type="button"
onClick={() => toggleDigitSelection(digit)}
title={
userSelected
? 'Убрать запятую на позиции ' + digit
: 'Поставить запятую на позиции ' + digit
}
aria-pressed={userSelected}
className={
'inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded-md border font-mono-num text-xs sm:text-sm font-bold align-baseline transition-all cursor-pointer select-none active:scale-95 ' +
badgeClass
}
>
{label}

);
}
return (
<span
key={'num-' + pIdx}
className={
'inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded-md border font-mono-num text-xs sm:text-sm font-bold align-baseline transition-colors ' +
badgeClass
}
>
{label}

);
}
return <React.Fragment key={'seg-' + pIdx}>{renderMarkableTokens(part, 'd-' + pIdx)}</React.Fragment>;
});
};
return (

{/* Left Column: Interactive Sentence */}




{question.topicTag || 'Пунктуация'} ·{' '}
{isDigitMode
? 'Нажмите на цифры в тексте или введите ответ'
: 'Введите знаки с клавиатуры'}

{question.hint && !submitted && (
<button
type="button"
disabled={!hintUnlocked && !canAffordHint}
title={
!hintUnlocked && !canAffordHint
? 'Недостаточно XP для подсказки (нужно 5 XP)'
: undefined
}
onClick={handleToggleHint}
className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
>


{showHint
? 'Скрыть подсказку'
: hintUnlocked
? 'Подсказка'
: 'Подсказка (-5 XP)'}


)}
{question.prompt}

{/* Interactive "Маркер / Черновик" Scratchpad Toolbar */}




Маркер / Черновик (не влияет на оценку):
{Object.keys(wordMarks).length > 0 && (
<button
type="button"
onClick={() => setWordMarks({})}
className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-[11px] text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
>

Сбросить пометки

)}
{MARKER_TOOLS.map((tool) => {
const isSelected = activeTool === tool.id;
return (
<button
key={tool.id}
type="button"
onClick={() => setActiveTool(tool.id)}
className={
'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ' +
(isSelected
? tool.btnActiveClass
: 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700')
}
>
{tool.label}
{tool.id !== 'none' && (

{tool.shortDesc}

)}

);
})}

{/* Interactive Sentence Workspace */}

{isDigitMode
? renderDigitSentence()
: segments.map((seg, idx) => {
const hasSlot = idx < slotCount;
const userVal = normalizeMark(values[idx] ?? '');
const expectedVal = normalizeMark(expectedMarks[idx] ?? '');
const slotOk = userVal === expectedVal;
let slotClass =
focusedSlot === idx
? 'bg-violet-500/20 border-violet-400 text-white ring-2 ring-violet-500/30'
: 'bg-slate-900 border-slate-700 text-slate-100 hover:border-violet-500/60';
if (submitted) {
slotClass = slotOk
? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
: 'bg-rose-500/20 border-rose-500 text-rose-300';
}
return (
);
})}
{/* Bottom Controls: Numeric Input (ФИПИ digit mode) or Quick Punctuation Toolbar (slot mode) */}
{isDigitMode ? (
Ответ (цифры, на месте которых должны стоять запятые):
<input
id={'punct-digits-' + question.id}
ref={digitsInputRef}
type="text"
inputMode="numeric"
disabled={submitted}
value={digitsInput}
onChange={(e) => {
if (!submitted) setDigitsInput(e.target.value);
}}
onKeyDown={(e) => {
if (e.key === 'Enter') {
e.preventDefault();
if (submitted) onNext();
else handleSubmit();
}
}}
placeholder="Нажмите на цифры выше или введите: 124"
className={
'w-full pl-10 pr-4 py-3 rounded-xl border text-base sm:text-lg font-mono-num font-bold tracking-widest placeholder:text-slate-600 placeholder:text-xs sm:placeholder:text-sm placeholder:font-sans placeholder:tracking-normal placeholder:font-normal focus:outline-none transition-all ' +
(submitted
? isCorrect
? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
: 'bg-rose-500/15 border-rose-500 text-rose-200'
: 'bg-[#080B14]/90 border-slate-700 text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30')
}
/>
{!submitted && (
<button
type="button"
disabled={!digitsInput.replace(/\D/g, '')}
onClick={handleSubmit}
className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
>

Проверить

)}
{submitted && (

{isCorrect ? (
<>


Верно! Все запятые определены точно.

</>
) : (
<>


Верные цифры:{' '}

{question.expectedDigits || '—'}
{' '}
(проверьте подсвеченные позиции в предложении).

</>
)}

)}

) : !submitted ? (



Слот №{focusedSlot + 1}:

{[
{ val: ',', label: ', Запятая' },
{ val: ':', label: ': Двоеточие' },
{ val: '-', label: '— Тире' },
].map((btn) => (
<button
key={btn.val}
type="button"
onClick={() => setSlotValue(focusedSlot, btn.val, true)}
className="px-2.5 py-1.5 rounded-lg bg-[#080B14]/80 border border-slate-700 hover:border-violet-500/60 text-xs font-mono-num font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
>
{btn.label}

))}
<button
type="button"
onClick={() => setSlotValue(focusedSlot, '', true)}
className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-slate-600 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
>

Пропуск

Проверить


) : (

{isCorrect ? (
<>


Все знаки препинания расставлены верно.

</>
) : (
<>


Проверьте выделенные красным позиции — справа от них указан верный знак (∅ — знак не нужен).

</>
)}

)}
{/* Right Column (Desktop) / Stacked + Fixed Bottom Bar (Mobile) */}
<TrainerSidePanel
submitted={submitted}
isCorrect={isCorrect}
ruleTitle={question.ruleTitle}
ruleExplanation={question.ruleExplanation}
hint={question.hint}
showHint={showHint}
hintUnlocked={hintUnlocked}
canAffordHint={canAffordHint}
onToggleHint={handleToggleHint}
correctAnswerHighlight={correctHighlight}
isReviewMode={isReviewMode}
isLastQuestion={isLastQuestion}
canGoPrev={canGoPrev}
learnedClicked={learnedClicked}
activeMentor={activeMentor}
mentorQuote={mentorQuote}
onMarkLearned={
onMarkLearned
? () => {
setLearnedClicked(true);
onMarkLearned(question.id);
}
: undefined
}
onPrev={onPrev}
onNext={onNext}
/>

);
};
