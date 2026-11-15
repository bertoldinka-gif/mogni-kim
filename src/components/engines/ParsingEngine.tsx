import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Lightbulb,
  MessageSquareQuote,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../../data/petsData';
import {
  MorphPartOfSpeech,
  MorphologicalParsingQuestion,
  ParsingQuestion,
  PhoneticHardnessPair,
  PhoneticParsingQuestion,
  PhoneticSoundSpec,
  PhoneticVoicingPair,
  SavedQuestionState,
  SyntacticParsingQuestion,
  SyntacticRole,
} from '../../types/platform';
import { MentorAvatar } from '../MentorAvatar';

export interface ParsingSavedState {
  missingLetterVal: string;
  syllableCountVal: string;
  syllableDivisionVal: string;
  totalLettersVal: string;
  totalSoundsVal: string;
  phoneticRows: PhoneticRowState[];
  selectedPos: MorphPartOfSpeech | '';
  morphQuestionInput: string;
  morphBaseFormInput: string;
  morphFeatures: Record<string, string>;
  morphSyntacticRole: string;
  tokenRoles: SyntacticRole[];
  selectedCharacteristics: string[];
}

interface ParsingEngineProps {
  question: ParsingQuestion;
  isReviewMode?: boolean;
  isLastQuestion?: boolean;
  canGoPrev?: boolean;
  savedState?: SavedQuestionState<unknown>;
  comboStreak?: number;
  activeMentor?: MentorCharacter | null;
  userXp?: number;
  onRequestHint?: () => boolean;
  onAnswered: (
    isCorrect: boolean,
    userState?: ParsingSavedState,
    mentorQuote?: string | null
  ) => void;
  onPrev?: () => void;
  onNext: () => void;
  onMarkLearned?: (questionId: string) => void;
}

/* ===========================
   PHONETIC CONSTANTS & HELPERS
   =========================== */

const PHONETIC_KEYBOARD_KEYS = [
  'а\u0301',
  'о\u0301',
  'у\u0301',
  'ы\u0301',
  'э\u0301',
  'и\u0301',
  "'",
  "й'",
];

const VOICING_OPTIONS: Array<{ id: PhoneticVoicingPair; label: string }> = [
  { id: 'voiced_paired', label: 'звонкий / парный' },
  { id: 'voiced_unpaired', label: 'звонкий / непарный' },
  { id: 'voiceless_paired', label: 'глухой / парный' },
  { id: 'voiceless_unpaired', label: 'глухой / непарный' },
];

const HARDNESS_OPTIONS: Array<{ id: PhoneticHardnessPair; label: string }> = [
  { id: 'hard_paired', label: 'твёрдый / парный' },
  { id: 'hard_unpaired', label: 'твёрдый / непарный' },
  { id: 'soft_paired', label: 'мягкий / парный' },
  { id: 'soft_unpaired', label: 'мягкий / непарный' },
];

interface PhoneticSubSoundState {
  sound: string;
  soundType: 'vowel' | 'consonant' | '';
  stress: 'stressed' | 'unstressed' | '';
  voicing: PhoneticVoicingPair | '';
  hardness: PhoneticHardnessPair | '';
}

interface PhoneticRowState {
  soundCount: number | null;
  sounds: [PhoneticSubSoundState, PhoneticSubSoundState];
}

function createEmptySubSound(): PhoneticSubSoundState {
  return {
    sound: '',
    soundType: '',
    stress: '',
    voicing: '',
    hardness: '',
  };
}

function normalizeSound(raw: string): string {
  return raw
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/[\[\]\s]/g, '')
    .replace(/[’‘‛`´ʹʼ]/g, "'");
}

function createInitialPhoneticRows(q: PhoneticParsingQuestion): PhoneticRowState[] {
  return q.letterRows.map(() => ({
    soundCount: null,
    sounds: [createEmptySubSound(), createEmptySubSound()],
  }));
}

function formatSoundSpecSummary(spec: PhoneticSoundSpec): string {
  if (spec.soundType === 'vowel') {
    return `[${spec.expectedSound}] — гласный, ${
      spec.stress === 'stressed' ? 'ударный' : 'безударный'
    }`;
  }
  const voicingLabel =
    VOICING_OPTIONS.find((o) => o.id === spec.voicing)?.label ?? '';
  const hardnessLabel =
    HARDNESS_OPTIONS.find((o) => o.id === spec.hardness)?.label ?? '';
  return `[${spec.expectedSound}] — согласный, ${voicingLabel}, ${hardnessLabel}`;
}

function isSubSoundCorrect(
  userSub: PhoneticSubSoundState,
  expectedSpec: PhoneticSoundSpec | undefined
): boolean {
  if (!expectedSpec) return false;
  if (normalizeSound(userSub.sound) !== normalizeSound(expectedSpec.expectedSound)) {
    return false;
  }
  if (userSub.soundType !== expectedSpec.soundType) return false;
  if (expectedSpec.soundType === 'vowel') {
    return userSub.stress === expectedSpec.stress;
  }
  return (
    userSub.voicing === expectedSpec.voicing &&
    userSub.hardness === expectedSpec.hardness
  );
}

/* ===========================
   MORPHOLOGICAL CONSTANTS
   =========================== */

const POS_OPTIONS: MorphPartOfSpeech[] = [
  'Существительное',
  'Прилагательное',
  'Глагол',
  'Местоимение',
  'Наречие',
  'Причастие',
  'Деепричастие',
];

const SYNTACTIC_ROLE_SELECT_OPTIONS = [
  'Подлежащее',
  'Сказуемое',
  'Определение',
  'Дополнение',
  'Обстоятельство',
  'Не является членом предложения',
];

interface FeatureFieldDef {
  key: string;
  label: string;
  options: string[];
}

const POS_FEATURE_SCHEMAS: Record<MorphPartOfSpeech, FeatureFieldDef[]> = {
  Глагол: [
    { key: 'aspect', label: 'Вид', options: ['совершенный', 'несовершенный'] },
    { key: 'reflexivity', label: 'Возвратность', options: ['возвратный', 'невозвратный'] },
    {
      key: 'conjugation',
      label: 'Спряжение',
      options: ['I спряжение', 'II спряжение', 'разноспрягаемый'],
    },
    { key: 'tense', label: 'Время', options: ['настоящее', 'прошедшее', 'будущее'] },
    { key: 'number', label: 'Число', options: ['единственное', 'множественное'] },
    {
      key: 'person',
      label: 'Лицо',
      options: ['1-е лицо', '2-е лицо', '3-е лицо', 'не определяется'],
    },
  ],
  Существительное: [
    { key: 'animacy', label: 'Одушевлённость', options: ['одушевлённое', 'неодушевлённое'] },
    { key: 'gender', label: 'Род', options: ['мужской', 'женский', 'средний', 'общий'] },
    {
      key: 'declension',
      label: 'Склонение',
      options: ['1-е склонение', '2-е склонение', '3-е склонение', 'разносклоняемое', 'несклоняемое'],
    },
    {
      key: 'case',
      label: 'Падеж',
      options: [
        'именительный',
        'родительный',
        'дательный',
        'винительный',
        'творительный',
        'предложный',
      ],
    },
    { key: 'number', label: 'Число', options: ['единственное', 'множественное'] },
  ],
  Прилагательное: [
    {
      key: 'category',
      label: 'Разряд',
      options: ['качественное', 'относительное', 'притяжательное'],
    },
    { key: 'form', label: 'Форма', options: ['полная', 'краткая'] },
    {
      key: 'gender',
      label: 'Род',
      options: ['мужской', 'женский', 'средний', 'не определяется'],
    },
    {
      key: 'case',
      label: 'Падеж',
      options: [
        'именительный',
        'родительный',
        'дательный',
        'винительный',
        'творительный',
        'предложный',
        'не определяется',
      ],
    },
    { key: 'number', label: 'Число', options: ['единственное', 'множественное'] },
  ],
  Местоимение: [
    {
      key: 'category',
      label: 'Разряд',
      options: [
        'личное',
        'возвратное',
        'притяжательное',
        'вопросительное',
        'относительное',
        'неопределённое',
        'отрицательное',
        'указательное',
        'определительное',
      ],
    },
    {
      key: 'case',
      label: 'Падеж',
      options: [
        'именительный',
        'родительный',
        'дательный',
        'винительный',
        'творительный',
        'предложный',
      ],
    },
    { key: 'number', label: 'Число', options: ['единственное', 'множественное'] },
    {
      key: 'person',
      label: 'Лицо',
      options: ['1-е лицо', '2-е лицо', '3-е лицо', 'не определяется'],
    },
  ],
  Наречие: [
    {
      key: 'category',
      label: 'Разряд по значению',
      options: [
        'образа действия',
        'меры и степени',
        'места',
        'времени',
        'причины',
        'цели',
      ],
    },
    { key: 'invariability', label: 'Изменяемость', options: ['неизменяемое'] },
  ],
  Причастие: [
    { key: 'voice', label: 'Залог', options: ['действительное', 'страдательное'] },
    { key: 'tense', label: 'Время', options: ['настоящее', 'прошедшее'] },
    { key: 'aspect', label: 'Вид', options: ['совершенный', 'несовершенный'] },
    { key: 'form', label: 'Форма', options: ['полная', 'краткая'] },
    {
      key: 'case',
      label: 'Падеж',
      options: [
        'именительный',
        'родительный',
        'дательный',
        'винительный',
        'творительный',
        'предложный',
        'не определяется',
      ],
    },
    { key: 'number', label: 'Число', options: ['единственное', 'множественное'] },
  ],
  Деепричастие: [
    { key: 'aspect', label: 'Вид', options: ['совершенный', 'несовершенный'] },
    { key: 'reflexivity', label: 'Возвратность', options: ['возвратный', 'невозвратный'] },
    { key: 'invariability', label: 'Изменяемость', options: ['неизменяемое'] },
  ],
};

function normalizeQuestionText(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\?+$/, '');
}

function isFeatureMatch(
  actual: string | undefined,
  expected: string | string[]
): boolean {
  if (!actual) return false;
  const normActual = actual.trim().toLowerCase();
  if (Array.isArray(expected)) {
    return expected.some((item) => item.trim().toLowerCase() === normActual);
  }
  return normActual === expected.trim().toLowerCase();
}

const VERB_PAST_GENDER_FIELD: FeatureFieldDef = {
  key: 'gender',
  label: 'Род',
  options: ['Мужской', 'Женский', 'Средний', 'Не определяется (мн. ч.)'],
};

function getEffectiveMorphFields(
  pos: MorphPartOfSpeech,
  tenseValue: string | undefined
): FeatureFieldDef[] {
  const base = POS_FEATURE_SCHEMAS[pos];
  if (pos !== 'Глагол') return base;
  const isPast = (tenseValue ?? '').trim().toLowerCase() === 'прошедшее';
  if (isPast) {
    return base.map((f) => (f.key === 'person' ? VERB_PAST_GENDER_FIELD : f));
  }
  return base;
}

/* ===========================
   SYNTACTIC CONSTANTS & SVG
   =========================== */

const SYNTACTIC_CYCLE: SyntacticRole[] = [
  'none',
  'subject',
  'predicate',
  'attribute',
  'object',
  'adverbial',
];

const SYNTACTIC_ROLE_META: Record<
  SyntacticRole,
  { label: string; shortLabel: string; colorClass: string; strokeColor: string }
> = {
  none: {
    label: 'Не выделено',
    shortLabel: '—',
    colorClass: 'text-slate-400',
    strokeColor: 'transparent',
  },
  subject: {
    label: 'Подлежащее',
    shortLabel: 'Подл.',
    colorClass: 'text-sky-300',
    strokeColor: '#38bdf8',
  },
  predicate: {
    label: 'Сказуемое',
    shortLabel: 'Сказ.',
    colorClass: 'text-rose-300',
    strokeColor: '#fb7185',
  },
  attribute: {
    label: 'Определение',
    shortLabel: 'Опред.',
    colorClass: 'text-amber-300',
    strokeColor: '#fbbf24',
  },
  object: {
    label: 'Дополнение',
    shortLabel: 'Дополн.',
    colorClass: 'text-emerald-300',
    strokeColor: '#34d399',
  },
  adverbial: {
    label: 'Обстоятельство',
    shortLabel: 'Обст.',
    colorClass: 'text-violet-300',
    strokeColor: '#a78bfa',
  },
};

const SYNTACTIC_CHARACTERISTIC_GROUPS: Array<{
  title: string;
  items: string[];
}> = [
  {
    title: 'По цели высказывания',
    items: ['Повествовательное', 'Побудительное', 'Вопросительное'],
  },
  {
    title: 'По интонации',
    items: ['Восклицательное', 'Невосклицательное'],
  },
  {
    title: 'По количеству основ и составу',
    items: ['Простое', 'Сложное', 'Односоставное', 'Двусоставное'],
  },
  {
    title: 'По наличию второстепенных',
    items: ['Распространённое', 'Нераспространённое'],
  },
  {
    title: 'Осложнение',
    items: [
      'Осложнено однородными членами',
      'Осложнено обращениями',
      'Осложнено вводными словами',
    ],
  },
];

const SyntacticUnderline: React.FC<{ role: SyntacticRole }> = ({ role }) => {
  if (role === 'none') {
    return <span className="block h-[7px] w-full" aria-hidden="true" />;
  }

  if (role === 'subject') {
    return (
      <span
        className="block h-[7px] w-full flex items-center"
        aria-hidden="true"
      >
        <span className="block w-full h-[2px] bg-sky-400 rounded-full" />
      </span>
    );
  }

  if (role === 'predicate') {
    return (
      <span
        className="block h-[7px] w-full flex flex-col justify-center gap-[2px]"
        aria-hidden="true"
      >
        <span className="block w-full h-[2px] bg-rose-400 rounded-full" />
        <span className="block w-full h-[2px] bg-rose-400 rounded-full" />
      </span>
    );
  }

  if (role === 'attribute') {
    return (
      <svg
        className="block w-full h-[7px] overflow-visible"
        viewBox="0 0 60 6"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 3 Q 3.75 0, 7.5 3 T 15 3 T 22.5 3 T 30 3 T 37.5 3 T 45 3 T 52.5 3 T 60 3"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  if (role === 'object') {
    return (
      <svg
        className="block w-full h-[7px]"
        viewBox="0 0 60 6"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="3"
          x2="60"
          y2="3"
          stroke="#34d399"
          strokeWidth="2"
          strokeDasharray="6 4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // adverbial: dash-dot
  return (
    <svg
      className="block w-full h-[7px]"
      viewBox="0 0 60 6"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="3"
        x2="60"
        y2="3"
        stroke="#a78bfa"
        strokeWidth="2"
        strokeDasharray="8 3 2 3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

/* ===========================
   MAIN PARSING ENGINE
   =========================== */

export const ParsingEngine: React.FC<ParsingEngineProps> = ({
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
  const restored = (savedState?.userState ?? null) as Partial<ParsingSavedState> | null;

  const [submitted, setSubmitted] = useState(() => Boolean(savedState));
  const [isCorrect, setIsCorrect] = useState(() => Boolean(savedState?.isCorrect));
  const [showHint, setShowHint] = useState(false);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [learnedClicked, setLearnedClicked] = useState(false);
  const [mentorQuote, setMentorQuote] = useState<string | null>(
    () => savedState?.mentorQuote ?? null
  );

  // Phonetic states
  const [missingLetterVal, setMissingLetterVal] = useState(
    () => restored?.missingLetterVal ?? ''
  );
  const [syllableCountVal, setSyllableCountVal] = useState(
    () => restored?.syllableCountVal ?? ''
  );
  const [syllableDivisionVal, setSyllableDivisionVal] = useState(
    () => restored?.syllableDivisionVal ?? ''
  );
  const [totalLettersVal, setTotalLettersVal] = useState(
    () => restored?.totalLettersVal ?? ''
  );
  const [totalSoundsVal, setTotalSoundsVal] = useState(
    () => restored?.totalSoundsVal ?? ''
  );
  const [phoneticRows, setPhoneticRows] = useState<PhoneticRowState[]>(() =>
    question.mode === 'phonetic'
      ? restored?.phoneticRows?.length === question.letterRows.length
        ? restored.phoneticRows
        : createInitialPhoneticRows(question)
      : []
  );
  const [activeSoundTarget, setActiveSoundTarget] = useState<{
    rowIdx: number;
    subIdx: 0 | 1;
  }>({ rowIdx: 0, subIdx: 0 });
  const soundInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Morphological states
  const [selectedPos, setSelectedPos] = useState<MorphPartOfSpeech | ''>(
    () => restored?.selectedPos ?? ''
  );
  const [morphQuestionInput, setMorphQuestionInput] = useState(
    () => restored?.morphQuestionInput ?? ''
  );
  const [morphBaseFormInput, setMorphBaseFormInput] = useState(
    () => restored?.morphBaseFormInput ?? ''
  );
  const [morphFeatures, setMorphFeatures] = useState<Record<string, string>>(
    () => restored?.morphFeatures ?? {}
  );
  const [morphSyntacticRole, setMorphSyntacticRole] = useState(
    () => restored?.morphSyntacticRole ?? ''
  );

  // Syntactic states
  const [tokenRoles, setTokenRoles] = useState<SyntacticRole[]>(() =>
    question.mode === 'syntactic'
      ? restored?.tokenRoles?.length === question.tokens.length
        ? restored.tokenRoles
        : question.tokens.map(() => 'none')
      : []
  );
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>(
    () => restored?.selectedCharacteristics ?? []
  );

  useEffect(() => {
    const nextRestored = (savedState?.userState ?? null) as Partial<ParsingSavedState> | null;
    setSubmitted(Boolean(savedState));
    setIsCorrect(Boolean(savedState?.isCorrect));
    setShowHint(false);
    setHintUnlocked(false);
    setLearnedClicked(false);
    setMentorQuote(savedState?.mentorQuote ?? null);

    if (question.mode === 'phonetic') {
      setMissingLetterVal(nextRestored?.missingLetterVal ?? '');
      setSyllableCountVal(nextRestored?.syllableCountVal ?? '');
      setSyllableDivisionVal(nextRestored?.syllableDivisionVal ?? '');
      setTotalLettersVal(nextRestored?.totalLettersVal ?? '');
      setTotalSoundsVal(nextRestored?.totalSoundsVal ?? '');
      setPhoneticRows(
        nextRestored?.phoneticRows?.length === question.letterRows.length
          ? nextRestored.phoneticRows
          : createInitialPhoneticRows(question)
      );
      setActiveSoundTarget({ rowIdx: 0, subIdx: 0 });
      soundInputRefs.current = {};
    } else if (question.mode === 'morphological') {
      setSelectedPos(nextRestored?.selectedPos ?? '');
      setMorphQuestionInput(nextRestored?.morphQuestionInput ?? '');
      setMorphBaseFormInput(nextRestored?.morphBaseFormInput ?? '');
      setMorphFeatures(nextRestored?.morphFeatures ?? {});
      setMorphSyntacticRole(nextRestored?.morphSyntacticRole ?? '');
    } else if (question.mode === 'syntactic') {
      setTokenRoles(
        nextRestored?.tokenRoles?.length === question.tokens.length
          ? nextRestored.tokenRoles
          : question.tokens.map(() => 'none')
      );
      setSelectedCharacteristics(nextRestored?.selectedCharacteristics ?? []);
    }
  }, [question, savedState]);

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

  const handleInsertPhoneticKey = (symbol: string) => {
    if (submitted || question.mode !== 'phonetic' || phoneticRows.length === 0) return;

    let { rowIdx, subIdx } = activeSoundTarget;
    rowIdx = Math.max(0, Math.min(rowIdx, phoneticRows.length - 1));

    const targetRow = phoneticRows[rowIdx];
    if (!targetRow || targetRow.soundCount === 0) {
      return;
    }
    if (targetRow.soundCount !== 2 && subIdx === 1) {
      subIdx = 0;
    }

    const inputKey = `${rowIdx}-${subIdx}`;
    const inputEl = soundInputRefs.current[inputKey];

    setPhoneticRows((prev) => {
      const next = [...prev];
      const row = next[rowIdx];
      if (!row) return prev;
      const current = row.sounds[subIdx]?.sound ?? '';
      let updated = current + symbol;

      if (inputEl && typeof inputEl.selectionStart === 'number') {
        const start = inputEl.selectionStart;
        const end = inputEl.selectionEnd ?? start;
        updated = current.slice(0, start) + symbol + current.slice(end);
        setTimeout(() => {
          inputEl.focus();
          const pos = start + symbol.length;
          inputEl.setSelectionRange(pos, pos);
        }, 0);
      } else {
        setTimeout(() => {
          inputEl?.focus();
        }, 0);
      }

      const nextSounds: [PhoneticSubSoundState, PhoneticSubSoundState] = [
        ...row.sounds,
      ] as [PhoneticSubSoundState, PhoneticSubSoundState];
      nextSounds[subIdx] = { ...nextSounds[subIdx], sound: updated };
      next[rowIdx] = { ...row, sounds: nextSounds };
      return next;
    });
  };

  const evaluatePhonetic = (q: PhoneticParsingQuestion): boolean => {
    if (q.missingLetter) {
      if (missingLetterVal.trim().toLowerCase() !== q.missingLetter.toLowerCase()) {
        return false;
      }
    }
    if (Number(syllableCountVal.trim()) !== q.expectedSyllableCount) {
      return false;
    }
    if (
      syllableDivisionVal.trim().toLowerCase().replace(/\s+/g, '') !==
      q.expectedSyllableDivision.toLowerCase()
    ) {
      return false;
    }
    if (Number(totalLettersVal.trim()) !== q.expectedLetterCount) {
      return false;
    }
    if (Number(totalSoundsVal.trim()) !== q.expectedSoundCount) {
      return false;
    }

    return q.letterRows.every((expectedRow, idx) => {
      const userRow = phoneticRows[idx];
      if (!userRow) return false;
      if (userRow.soundCount !== expectedRow.soundCount) return false;
      if (expectedRow.soundCount === 0) return true;

      return expectedRow.sounds.every((expectedSpec, subIdx) =>
        isSubSoundCorrect(userRow.sounds[subIdx], expectedSpec)
      );
    });
  };

  const evaluateMorphological = (q: MorphologicalParsingQuestion): boolean => {
    if (selectedPos !== q.expectedPos) return false;
    const normInputQ = normalizeQuestionText(morphQuestionInput);
    const qMatch = q.expectedQuestions.some(
      (eq) => normalizeQuestionText(eq) === normInputQ
    );
    if (!qMatch) return false;
    if (
      morphBaseFormInput.trim().toLowerCase() !== q.expectedBaseForm.trim().toLowerCase()
    ) {
      return false;
    }
    const isPastVerb =
      q.expectedPos === 'Глагол' &&
      isFeatureMatch(
        Array.isArray(q.expectedFeatures.tense)
          ? q.expectedFeatures.tense[0]
          : q.expectedFeatures.tense,
        'прошедшее'
      );

    const featuresOk = Object.entries(q.expectedFeatures).every(([key, expectedVal]) => {
      if (isPastVerb && key === 'person') return true;
      if (q.expectedPos === 'Глагол' && !isPastVerb && key === 'gender') return true;
      return isFeatureMatch(morphFeatures[key], expectedVal);
    });
    if (!featuresOk) return false;

    if (q.expectedSyntacticRole) {
      return isFeatureMatch(morphSyntacticRole, q.expectedSyntacticRole);
    }
    return true;
  };

  const evaluateSyntactic = (q: SyntacticParsingQuestion): boolean => {
    const tokensOk = q.tokens.every((tok, idx) => {
      const allowed = tok.acceptableRoles ?? [tok.expectedRole];
      return allowed.includes(tokenRoles[idx] ?? 'none');
    });
    if (!tokensOk) return false;

    const expectedSet = new Set(q.expectedCharacteristics);
    const actualSet = new Set(selectedCharacteristics);
    if (expectedSet.size !== actualSet.size) return false;
    for (const item of expectedSet) {
      if (!actualSet.has(item)) return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (submitted) return;
    let ok = false;
    if (question.mode === 'phonetic') {
      ok = evaluatePhonetic(question);
    } else if (question.mode === 'morphological') {
      ok = evaluateMorphological(question);
    } else {
      ok = evaluateSyntactic(question);
    }

    let quote: string | null = null;
    if (activeMentor) {
      if (!ok) {
        quote = pickRandomQuote(activeMentor.mistakeQuotes);
      } else if (comboStreak + 1 >= 2) {
        quote = pickRandomQuote(activeMentor.comboQuotes);
      }
      setMentorQuote(quote);
    }

    setSubmitted(true);
    setIsCorrect(ok);
    onAnswered(
      ok,
      {
        missingLetterVal,
        syllableCountVal,
        syllableDivisionVal,
        totalLettersVal,
        totalSoundsVal,
        phoneticRows,
        selectedPos,
        morphQuestionInput,
        morphBaseFormInput,
        morphFeatures,
        morphSyntacticRole,
        tokenRoles,
        selectedCharacteristics,
      },
      quote
    );
  };

  /* ===========================
     RENDER MODE 1: PHONETIC
     =========================== */
  const renderPhoneticWorkspace = (q: PhoneticParsingQuestion) => {
    const missingOk = q.missingLetter
      ? missingLetterVal.trim().toLowerCase() === q.missingLetter.toLowerCase()
      : true;
    const countOk = Number(syllableCountVal.trim()) === q.expectedSyllableCount;
    const divisionOk =
      syllableDivisionVal.trim().toLowerCase().replace(/\s+/g, '') ===
      q.expectedSyllableDivision.toLowerCase();
    const totalLettersOk =
      Number(totalLettersVal.trim()) === q.expectedLetterCount;
    const totalSoundsOk =
      Number(totalSoundsVal.trim()) === q.expectedSoundCount;

    const updateSubSound = (
      rowIdx: number,
      subIdx: 0 | 1,
      updater: (curr: PhoneticSubSoundState) => PhoneticSubSoundState
    ) => {
      setPhoneticRows((prev) => {
        const next = [...prev];
        const row = next[rowIdx];
        if (!row) return prev;
        const nextSounds: [PhoneticSubSoundState, PhoneticSubSoundState] = [
          ...row.sounds,
        ] as [PhoneticSubSoundState, PhoneticSubSoundState];
        nextSounds[subIdx] = updater(nextSounds[subIdx]);
        next[rowIdx] = { ...row, sounds: nextSounds };
        return next;
      });
    };

    const focusedRow = phoneticRows[activeSoundTarget.rowIdx];
    const focusedLetterSpec = q.letterRows[activeSoundTarget.rowIdx];
    const focusedLetterDisplay =
      q.missingLetter &&
      focusedLetterSpec?.letter === q.missingLetter &&
      !submitted
        ? missingLetterVal.trim() || '?'
        : focusedLetterSpec?.letter ?? '';

    const renderCharacteristicsCell = (
      rowIdx: number,
      subIdx: 0 | 1,
      subState: PhoneticSubSoundState,
      expectedSpec: PhoneticSoundSpec | undefined,
      isMismatchedSubCount: boolean
    ) => {
      const typeCorrect = expectedSpec
        ? subState.soundType === expectedSpec.soundType
        : false;
      const detailsCorrect = expectedSpec
        ? expectedSpec.soundType === 'vowel'
          ? subState.stress === expectedSpec.stress
          : subState.voicing === expectedSpec.voicing &&
            subState.hardness === expectedSpec.hardness
        : false;

      return (
        <div className="space-y-2">
          {/* Primary Type: Vowel vs Consonant */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'vowel', label: 'гласный' },
                { id: 'consonant', label: 'согласный' },
              ] as const
            ).map((opt) => {
              const active = subState.soundType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={submitted}
                  onClick={() =>
                    updateSubSound(rowIdx, subIdx, (curr) => ({
                      ...curr,
                      soundType: opt.id,
                      stress: opt.id === 'vowel' ? curr.stress : '',
                      voicing: opt.id === 'consonant' ? curr.voicing : '',
                      hardness: opt.id === 'consonant' ? curr.hardness : '',
                    }))
                  }
                  className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all ${
                    submitted ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    active
                      ? submitted
                        ? typeCorrect
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : 'bg-rose-500/20 border-rose-500 text-rose-200'
                        : 'bg-indigo-600/80 border-indigo-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}

            {/* Vowel sub-pills */}
            {subState.soundType === 'vowel' && (
              <div className="inline-flex flex-wrap items-center gap-1 pl-1.5 border-l border-slate-800">
                {(
                  [
                    { id: 'stressed', label: 'ударный' },
                    { id: 'unstressed', label: 'безударный' },
                  ] as const
                ).map((opt) => {
                  const active = subState.stress === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        updateSubSound(rowIdx, subIdx, (curr) => ({
                          ...curr,
                          stress: opt.id,
                        }))
                      }
                      className={`px-2 py-1 rounded-md border text-xs transition-all ${
                        submitted ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        active
                          ? submitted
                            ? expectedSpec && subState.stress === expectedSpec.stress
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                              : 'bg-rose-500/20 border-rose-500 text-rose-200'
                            : 'bg-violet-600 border-violet-400 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Consonant two clean rows: Voicing & Pair + Hardness & Pair */}
          {subState.soundType === 'consonant' && (
            <div className="space-y-1.5 pt-0.5">
              {/* Row 1: Voicing & Pair */}
              <div className="flex flex-wrap items-center gap-1">
                {VOICING_OPTIONS.map((opt) => {
                  const active = subState.voicing === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        updateSubSound(rowIdx, subIdx, (curr) => ({
                          ...curr,
                          voicing: opt.id,
                        }))
                      }
                      className={`px-2 py-1 rounded-md border text-[11px] sm:text-xs transition-all whitespace-nowrap ${
                        submitted ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        active
                          ? submitted
                            ? expectedSpec && subState.voicing === expectedSpec.voicing
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                              : 'bg-rose-500/20 border-rose-500 text-rose-200'
                            : 'bg-violet-600 border-violet-400 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Hardness & Pair */}
              <div className="flex flex-wrap items-center gap-1">
                {HARDNESS_OPTIONS.map((opt) => {
                  const active = subState.hardness === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        updateSubSound(rowIdx, subIdx, (curr) => ({
                          ...curr,
                          hardness: opt.id,
                        }))
                      }
                      className={`px-2 py-1 rounded-md border text-[11px] sm:text-xs transition-all whitespace-nowrap ${
                        submitted ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        active
                          ? submitted
                            ? expectedSpec && subState.hardness === expectedSpec.hardness
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                              : 'bg-rose-500/20 border-rose-500 text-rose-200'
                            : 'bg-violet-600 border-violet-400 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {submitted && expectedSpec && (!typeCorrect || !detailsCorrect) && (
            <div className="text-[11px] text-emerald-300 pt-0.5">
              Верно: {formatSoundSpecSummary(expectedSpec)}
            </div>
          )}

          {submitted && !expectedSpec && isMismatchedSubCount && (
            <div className="text-[11px] text-rose-300 pt-0.5">
              Лишний звук для этой буквы
            </div>
          )}
        </div>
      );
    };

    const renderSoundInputCell = (
      rowIdx: number,
      subIdx: 0 | 1,
      subState: PhoneticSubSoundState,
      expectedSpec: PhoneticSoundSpec | undefined,
      letterDisplay: string,
      isDualMode: boolean
    ) => {
      const soundCorrect = expectedSpec
        ? normalizeSound(subState.sound) === normalizeSound(expectedSpec.expectedSound)
        : false;
      const isActiveSlot =
        !submitted &&
        activeSoundTarget.rowIdx === rowIdx &&
        activeSoundTarget.subIdx === subIdx;
      const inputKey = `${rowIdx}-${subIdx}`;

      return (
        <div className="space-y-1">
          {isDualMode && (
            <div className="text-[11px] font-medium text-violet-300">
              Звук {subIdx + 1}
            </div>
          )}
          <input
            ref={(el) => {
              soundInputRefs.current[inputKey] = el;
            }}
            type="text"
            disabled={submitted}
            value={subState.sound}
            onFocus={() => setActiveSoundTarget({ rowIdx, subIdx })}
            onChange={(e) => {
              const val = e.target.value;
              updateSubSound(rowIdx, subIdx, (curr) => ({ ...curr, sound: val }));
            }}
            placeholder="[звук]"
            aria-label={`Звук ${isDualMode ? subIdx + 1 : ''} для буквы ${letterDisplay}`}
            className={`w-28 px-2.5 py-1.5 rounded-lg border font-mono-num text-sm focus:outline-none transition-all ${
              submitted
                ? soundCorrect
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500 text-rose-300'
                : isActiveSlot
                ? 'bg-slate-900 border-violet-500 text-white ring-1 ring-violet-500/40'
                : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
            }`}
          />
          {submitted && expectedSpec && !soundCorrect && (
            <div className="text-[11px] font-mono-num text-emerald-300">
              → [{expectedSpec.expectedSound}]
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {/* Top Bar: Word, Missing Letter (if any), Syllable Count & Syllable Division */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 sm:p-4 rounded-xl bg-[#080B14]/85 border border-slate-800/90">
          <div className="sm:col-span-4 flex flex-col justify-center gap-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Слово для разбора
            </span>
            {q.missingLetter ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
                  {q.displayWord.split('..')[0]}
                </span>
                <input
                  type="text"
                  maxLength={1}
                  disabled={submitted}
                  value={missingLetterVal}
                  onChange={(e) => setMissingLetterVal(e.target.value)}
                  placeholder="_"
                  aria-label="Пропущенная буква"
                  className={`w-8 h-9 rounded-lg border text-center font-display text-lg font-bold focus:outline-none transition-all ${
                    submitted
                      ? missingOk
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-900 border-violet-500/60 text-white focus:border-violet-400'
                  }`}
                />
                <span className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
                  {q.displayWord.split('..')[1] ?? ''}
                </span>
                {submitted && !missingOk && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-emerald-300">
                    → {q.missingLetter}
                  </span>
                )}
              </div>
            ) : (
              <div className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
                {q.displayWord}
              </div>
            )}
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label
              htmlFor={`syll-count-${q.id}`}
              className="block text-xs font-medium text-slate-400"
            >
              Кол-во слогов
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`syll-count-${q.id}`}
                type="number"
                min={1}
                max={10}
                disabled={submitted}
                value={syllableCountVal}
                onChange={(e) => setSyllableCountVal(e.target.value)}
                placeholder="Напр. 3"
                className={`w-full px-3 py-2 rounded-lg border font-mono-num text-sm focus:outline-none transition-all ${
                  submitted
                    ? countOk
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
                }`}
              />
              {submitted && !countOk && (
                <span className="px-1.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono-num font-bold text-emerald-300 shrink-0">
                  → {q.expectedSyllableCount}
                </span>
              )}
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label
              htmlFor={`syll-div-${q.id}`}
              className="block text-xs font-medium text-slate-400"
            >
              Деление на слоги (через дефис)
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`syll-div-${q.id}`}
                type="text"
                disabled={submitted}
                value={syllableDivisionVal}
                onChange={(e) => setSyllableDivisionVal(e.target.value)}
                placeholder="Напр.: жёл-ты-е"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all ${
                  submitted
                    ? divisionOk
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
                }`}
              />
              {submitted && !divisionOk && (
                <span className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-300 whitespace-nowrap shrink-0">
                  → {q.expectedSyllableDivision}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Compact Phonetic Virtual Keyboard Bar */}
        {!submitted && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#080B14]/75 border border-slate-800/80">
            <span className="text-xs text-slate-400">
              Фонетическая клавиатура{' '}
              <span className="text-slate-500">
                {focusedRow?.soundCount === 0
                  ? '(выберите поле звука)'
                  : `(буква «${focusedLetterDisplay}»${
                      focusedRow?.soundCount === 2
                        ? `, звук ${activeSoundTarget.subIdx + 1}`
                        : ''
                    })`}
                :
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {PHONETIC_KEYBOARD_KEYS.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleInsertPhoneticKey(sym)}
                  className="min-w-[32px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-violet-500/70 hover:bg-violet-500/15 text-xs sm:text-sm font-mono-num font-semibold text-slate-100 transition-colors cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Row-by-Row Phonetic Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/90 bg-[#080B14]/80">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3 w-16">Буква</th>
                <th className="py-2.5 px-3 w-32">Кол-во звуков</th>
                <th className="py-2.5 px-3 w-36">Звук</th>
                <th className="py-2.5 px-3">Характеристики звука</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm">
              {q.letterRows.map((expectedRow, idx) => {
                const rowState = phoneticRows[idx] ?? {
                  soundCount: null,
                  sounds: [createEmptySubSound(), createEmptySubSound()],
                };

                const selectedCount = rowState.soundCount;
                const isZeroMode = selectedCount === 0;
                const isDualMode = selectedCount === 2;
                const countCorrect = selectedCount === expectedRow.soundCount;

                const allSubsCorrect =
                  expectedRow.soundCount === 0
                    ? true
                    : expectedRow.sounds.every((expSpec, sIdx) =>
                        isSubSoundCorrect(rowState.sounds[sIdx], expSpec)
                      );

                const rowAllOk = countCorrect && allSubsCorrect;
                const isActiveRow = !submitted && activeSoundTarget.rowIdx === idx;
                const displayLetter =
                  q.missingLetter &&
                  expectedRow.letter === q.missingLetter &&
                  !submitted
                    ? missingLetterVal.trim() || '?'
                    : expectedRow.letter;

                const rowBgClass = submitted
                  ? rowAllOk
                    ? 'bg-emerald-500/5'
                    : 'bg-rose-500/5'
                  : isActiveRow
                  ? 'bg-violet-500/5'
                  : '';

                const rowBorderTop = idx > 0 ? 'border-t border-slate-800/80' : '';

                const letterCell = (
                  <td
                    rowSpan={isDualMode ? 2 : 1}
                    className={`py-2.5 px-3 align-middle ${rowBorderTop}`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 font-display text-base font-bold text-white">
                      {displayLetter}
                    </span>
                  </td>
                );

                const countCell = (
                  <td
                    rowSpan={isDualMode ? 2 : 1}
                    className={`py-2.5 px-3 align-middle ${rowBorderTop}`}
                  >
                    <div className="inline-flex items-center gap-1">
                      {[0, 1, 2].map((cnt) => {
                        const selected = rowState.soundCount === cnt;
                        return (
                          <button
                            key={cnt}
                            type="button"
                            disabled={submitted}
                            onClick={() => {
                              setPhoneticRows((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], soundCount: cnt };
                                return next;
                              });
                              if (cnt !== 0) {
                                setActiveSoundTarget({ rowIdx: idx, subIdx: 0 });
                              }
                            }}
                            className={`w-7 h-7 rounded-md border font-mono-num text-xs font-semibold transition-all ${
                              submitted ? 'cursor-default' : 'cursor-pointer'
                            } ${
                              selected
                                ? submitted
                                  ? countCorrect
                                    ? 'bg-emerald-500/25 border-emerald-500 text-emerald-200'
                                    : 'bg-rose-500/25 border-rose-500 text-rose-200'
                                  : 'bg-violet-600 border-violet-400 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {cnt}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && !countCorrect && (
                      <div className="text-[11px] font-mono-num text-emerald-300 mt-1">
                        → {expectedRow.soundCount}
                      </div>
                    )}
                  </td>
                );

                if (isZeroMode) {
                  return (
                    <tr key={`phon-row-${q.id}-${idx}`} className={rowBgClass}>
                      {letterCell}
                      {countCell}
                      <td colSpan={2} className={`py-3 px-3 align-middle ${rowBorderTop}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm italic text-slate-400">
                            звука не обозначает
                          </span>
                          {submitted && expectedRow.soundCount > 0 && (
                            <span className="text-[11px] text-emerald-300">
                              Верно:{' '}
                              {expectedRow.sounds
                                .map((s) => formatSoundSpecSummary(s))
                                .join('; ')}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (isDualMode) {
                  return (
                    <React.Fragment key={`phon-row-${q.id}-${idx}`}>
                      <tr className={rowBgClass}>
                        {letterCell}
                        {countCell}
                        <td className={`py-2.5 px-3 align-top ${rowBorderTop}`}>
                          {renderSoundInputCell(
                            idx,
                            0,
                            rowState.sounds[0],
                            expectedRow.sounds[0],
                            displayLetter,
                            true
                          )}
                        </td>
                        <td className={`py-2.5 px-3 align-middle ${rowBorderTop}`}>
                          {renderCharacteristicsCell(
                            idx,
                            0,
                            rowState.sounds[0],
                            expectedRow.sounds[0],
                            !countCorrect
                          )}
                        </td>
                      </tr>
                      <tr className={rowBgClass}>
                        <td className="py-2.5 px-3 align-top border-t border-dashed border-slate-800/80">
                          {renderSoundInputCell(
                            idx,
                            1,
                            rowState.sounds[1],
                            expectedRow.sounds[1],
                            displayLetter,
                            true
                          )}
                        </td>
                        <td className="py-2.5 px-3 align-middle border-t border-dashed border-slate-800/80">
                          {renderCharacteristicsCell(
                            idx,
                            1,
                            rowState.sounds[1],
                            expectedRow.sounds[1],
                            !countCorrect
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                }

                // Single sound mode (soundCount === null || soundCount === 1)
                return (
                  <tr key={`phon-row-${q.id}-${idx}`} className={rowBgClass}>
                    {letterCell}
                    {countCell}
                    <td className={`py-2.5 px-3 align-middle ${rowBorderTop}`}>
                      {renderSoundInputCell(
                        idx,
                        0,
                        rowState.sounds[0],
                        expectedRow.sounds[0],
                        displayLetter,
                        false
                      )}
                    </td>
                    <td className={`py-2.5 px-3 align-middle ${rowBorderTop}`}>
                      {expectedRow.soundCount === 0 && submitted ? (
                        <div className="space-y-1">
                          {renderCharacteristicsCell(
                            idx,
                            0,
                            rowState.sounds[0],
                            undefined,
                            !countCorrect
                          )}
                          <div className="text-[11px] text-emerald-300">
                            Верно: звука не обозначает (0 звуков)
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {renderCharacteristicsCell(
                            idx,
                            0,
                            rowState.sounds[0],
                            expectedRow.sounds[0],
                            !countCorrect
                          )}
                          {submitted && expectedRow.soundCount === 2 && (
                            <div className="text-[11px] text-emerald-300">
                              Второй звук: {formatSoundSpecSummary(expectedRow.sounds[1])}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Row: Total Letters & Total Sounds */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-[#080B14]/85 border border-slate-800/90">
          <span className="text-xs sm:text-sm font-medium text-slate-300">
            Итоговый подсчёт
          </span>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`total-letters-${q.id}`}
                className="text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap"
              >
                Всего букв:
              </label>
              <input
                id={`total-letters-${q.id}`}
                type="number"
                min={1}
                max={30}
                disabled={submitted}
                value={totalLettersVal}
                onChange={(e) => setTotalLettersVal(e.target.value)}
                placeholder="0"
                className={`w-16 px-2.5 py-1.5 rounded-lg border font-mono-num text-sm text-center focus:outline-none transition-all ${
                  submitted
                    ? totalLettersOk
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
                }`}
              />
              {submitted && !totalLettersOk && (
                <span className="text-xs font-mono-num font-bold text-emerald-300">
                  → {q.expectedLetterCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor={`total-sounds-${q.id}`}
                className="text-xs sm:text-sm font-medium text-slate-300 whitespace-nowrap"
              >
                Всего звуков:
              </label>
              <input
                id={`total-sounds-${q.id}`}
                type="number"
                min={1}
                max={30}
                disabled={submitted}
                value={totalSoundsVal}
                onChange={(e) => setTotalSoundsVal(e.target.value)}
                placeholder="0"
                className={`w-16 px-2.5 py-1.5 rounded-lg border font-mono-num text-sm text-center focus:outline-none transition-all ${
                  submitted
                    ? totalSoundsOk
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
                }`}
              />
              {submitted && !totalSoundsOk && (
                <span className="text-xs font-mono-num font-bold text-emerald-300">
                  → {q.expectedSoundCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ===========================
     RENDER MODE 2: MORPHOLOGICAL
     =========================== */
  const renderMorphologicalWorkspace = (q: MorphologicalParsingQuestion) => {
    const posOk = selectedPos === q.expectedPos;
    const questionOk = q.expectedQuestions.some(
      (eq) => normalizeQuestionText(eq) === normalizeQuestionText(morphQuestionInput)
    );
    const baseOk =
      morphBaseFormInput.trim().toLowerCase() === q.expectedBaseForm.trim().toLowerCase();

    const activeFields = selectedPos
      ? getEffectiveMorphFields(selectedPos, morphFeatures.tense)
      : [];
    const parts = q.sentence.split(
      new RegExp(`(${q.targetWord})`, 'i')
    );

    return (
      <div className="space-y-4">
        {/* Highlighted Sentence Banner */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#080B14]/85 border border-slate-800/90 text-base sm:text-lg text-slate-100 leading-relaxed">
          {parts.map((chunk, idx) =>
            chunk.toLowerCase() === q.targetWord.toLowerCase() ? (
              <span
                key={`morph-tok-${idx}`}
                className="inline-block px-2 py-0.5 mx-0.5 rounded-lg bg-violet-500/25 border border-violet-400/60 font-semibold text-white"
              >
                {chunk}
              </span>
            ) : (
              <span key={`morph-txt-${idx}`}>{chunk}</span>
            )
          )}
        </div>

        {/* Core Morphological Row: POS + Question + Base Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#080B14]/80 border border-slate-800/90 space-y-1.5">
            <label
              htmlFor={`morph-pos-${q.id}`}
              className="block text-xs font-medium text-slate-400"
            >
              Часть речи
            </label>
            <select
              id={`morph-pos-${q.id}`}
              disabled={submitted}
              value={selectedPos}
              onChange={(e) => {
                setSelectedPos(e.target.value as MorphPartOfSpeech | '');
                setMorphFeatures({});
              }}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all ${
                submitted
                  ? posOk
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-500 text-rose-200'
                  : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
              }`}
            >
              <option value="">Выберите часть речи...</option>
              {POS_OPTIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            {submitted && !posOk && (
              <div className="text-xs text-emerald-300">→ {q.expectedPos}</div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-[#080B14]/80 border border-slate-800/90 space-y-1.5">
            <label
              htmlFor={`morph-q-${q.id}`}
              className="block text-xs font-medium text-slate-400"
            >
              Вопрос к слову
            </label>
            <input
              id={`morph-q-${q.id}`}
              type="text"
              disabled={submitted}
              value={morphQuestionInput}
              onChange={(e) => setMorphQuestionInput(e.target.value)}
              placeholder="Напр.: что сделает?"
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all ${
                submitted
                  ? questionOk
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-500 text-rose-200'
                  : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
              }`}
            />
            {submitted && !questionOk && (
              <div className="text-xs text-emerald-300">
                → {q.expectedQuestions[0]}
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-[#080B14]/80 border border-slate-800/90 space-y-1.5">
            <label
              htmlFor={`morph-base-${q.id}`}
              className="block text-xs font-medium text-slate-400"
            >
              Начальная форма
            </label>
            <input
              id={`morph-base-${q.id}`}
              type="text"
              disabled={submitted}
              value={morphBaseFormInput}
              onChange={(e) => setMorphBaseFormInput(e.target.value)}
              placeholder="Начальная форма слова"
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all ${
                submitted
                  ? baseOk
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-500 text-rose-200'
                  : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
              }`}
            />
            {submitted && !baseOk && (
              <div className="text-xs text-emerald-300">→ {q.expectedBaseForm}</div>
            )}
          </div>
        </div>

        {/* Dynamic Grammatical Feature Cards */}
        {selectedPos ? (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-400">
              Постоянные и непостоянные признаки ({selectedPos}):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeFields.map((field) => {
                const val = morphFeatures[field.key] ?? '';
                const expectedForKey = q.expectedFeatures[field.key];
                const fieldOk =
                  selectedPos === q.expectedPos &&
                  expectedForKey !== undefined &&
                  isFeatureMatch(val, expectedForKey);

                return (
                  <div
                    key={field.key}
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      submitted
                        ? fieldOk
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-rose-500/10 border-rose-500/40'
                        : 'bg-[#080B14]/75 border-slate-800/90'
                    }`}
                  >
                    <label
                      htmlFor={`feat-${q.id}-${field.key}`}
                      className="block text-xs font-medium text-slate-400"
                    >
                      {field.label}
                    </label>
                    <select
                      id={`feat-${q.id}-${field.key}`}
                      disabled={submitted}
                      value={val}
                      onChange={(e) => {
                        const nextVal = e.target.value;
                        setMorphFeatures((prev) => {
                          const next = { ...prev, [field.key]: nextVal };
                          if (selectedPos === 'Глагол' && field.key === 'tense') {
                            if (nextVal.trim().toLowerCase() === 'прошедшее') {
                              delete next.person;
                            } else {
                              delete next.gender;
                            }
                          }
                          return next;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-violet-500 focus:outline-none text-xs sm:text-sm text-white"
                    >
                      <option value="">Выберите...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {submitted && !fieldOk && expectedForKey !== undefined && (
                      <div className="text-[11px] text-emerald-300">
                        →{' '}
                        {Array.isArray(expectedForKey)
                          ? expectedForKey[0]
                          : expectedForKey}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#080B14]/60 border border-dashed border-slate-800 text-xs sm:text-sm text-slate-400 text-center">
            Выберите часть речи, чтобы открыть карточки грамматических признаков.
          </div>
        )}

        {/* Show full expected features summary if wrong POS was chosen */}
        {submitted && selectedPos !== q.expectedPos && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
            <div className="font-semibold text-emerald-300">
              Верные признаки для «{q.expectedPos}»:
            </div>
            <div className="flex flex-wrap gap-2">
              {getEffectiveMorphFields(
                q.expectedPos,
                Array.isArray(q.expectedFeatures.tense)
                  ? q.expectedFeatures.tense[0]
                  : q.expectedFeatures.tense
              ).map((f) => {
                const exp = q.expectedFeatures[f.key];
                if (!exp) return null;
                return (
                  <span
                    key={f.key}
                    className="px-2 py-0.5 rounded bg-slate-900/80 border border-emerald-500/30 text-emerald-200"
                  >
                    {f.label}: {Array.isArray(exp) ? exp[0] : exp}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Field: Syntactic Role (always shown at bottom regardless of POS) */}
        {(() => {
          const expectedRole = q.expectedSyntacticRole;
          const syntacticRoleOk = expectedRole
            ? isFeatureMatch(morphSyntacticRole, expectedRole)
            : Boolean(morphSyntacticRole);
          const expectedRoleLabel = Array.isArray(expectedRole)
            ? expectedRole[0]
            : expectedRole;

          return (
            <div
              className={`p-3.5 rounded-xl border space-y-1.5 ${
                submitted
                  ? syntacticRoleOk
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-rose-500/10 border-rose-500/50'
                  : 'bg-[#080B14]/80 border-slate-800/90'
              }`}
            >
              <label
                htmlFor={`morph-syntactic-role-${q.id}`}
                className="block text-xs font-medium text-slate-400"
              >
                Синтаксическая роль (член предложения)
              </label>
              <select
                id={`morph-syntactic-role-${q.id}`}
                disabled={submitted}
                value={morphSyntacticRole}
                onChange={(e) => setMorphSyntacticRole(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm focus:outline-none transition-all ${
                  submitted
                    ? syntacticRoleOk
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                      : 'bg-rose-500/15 border-rose-500 text-rose-200'
                    : 'bg-slate-900 border-slate-700 text-white focus:border-violet-500'
                }`}
              >
                <option value="">Выберите синтаксическую роль...</option>
                {SYNTACTIC_ROLE_SELECT_OPTIONS.map((roleOpt) => (
                  <option key={roleOpt} value={roleOpt}>
                    {roleOpt}
                  </option>
                ))}
              </select>
              {submitted && !syntacticRoleOk && expectedRoleLabel && (
                <div className="text-xs text-emerald-300">
                  → {expectedRoleLabel}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  /* ===========================
     RENDER MODE 3: SYNTACTIC
     =========================== */
  const renderSyntacticWorkspace = (q: SyntacticParsingQuestion) => {
    const cycleTokenRole = (idx: number) => {
      if (submitted) return;
      setTokenRoles((prev) => {
        const next = [...prev];
        const curr = next[idx] ?? 'none';
        const nextIdx = (SYNTACTIC_CYCLE.indexOf(curr) + 1) % SYNTACTIC_CYCLE.length;
        next[idx] = SYNTACTIC_CYCLE[nextIdx];
        return next;
      });
    };

    const toggleCharacteristic = (item: string) => {
      if (submitted) return;
      setSelectedCharacteristics((prev) =>
        prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
      );
    };

    const hasUnderlinedFunctionWord =
      submitted &&
      q.tokens.some(
        (tok, idx) =>
          tok.expectedRole === 'none' && (tokenRoles[idx] ?? 'none') !== 'none'
      );

    return (
      <div className="space-y-4">
        {/* Compact Legend Bar + Rule Notice + Reset Button */}
        <div className="p-3 rounded-xl bg-[#080B14]/80 border border-slate-800/90 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {(
                [
                  'subject',
                  'predicate',
                  'attribute',
                  'object',
                  'adverbial',
                ] as SyntacticRole[]
              ).map((role) => (
                <div key={role} className="inline-flex items-center gap-2 text-xs">
                  <span className={`font-medium ${SYNTACTIC_ROLE_META[role].colorClass}`}>
                    {SYNTACTIC_ROLE_META[role].label}
                  </span>
                  <span className="w-8 inline-block">
                    <SyntacticUnderline role={role} />
                  </span>
                </div>
              ))}
            </div>

            {!submitted && (
              <button
                type="button"
                onClick={() => setTokenRoles(q.tokens.map(() => 'none'))}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить разбор</span>
              </button>
            )}
          </div>

          <p className="text-[11px] sm:text-xs text-amber-300/90 leading-snug">
            Предлоги, союзы и частицы членами предложения не являются — не подчёркивайте их.
          </p>
        </div>

        {/* Clickable Sentence with Syntactic Underlines */}
        <div className="p-4 sm:p-6 rounded-xl bg-[#080B14]/85 border border-slate-800/90 space-y-3">
          <div className="flex flex-wrap items-start gap-x-2.5 gap-y-4 text-lg sm:text-xl leading-snug">
            {q.tokens.map((tok, idx) => {
              const role = tokenRoles[idx] ?? 'none';
              const allowed = tok.acceptableRoles ?? [tok.expectedRole];
              const tokenOk = allowed.includes(role);
              const isFunctionWordMistake =
                submitted && !tokenOk && tok.expectedRole === 'none' && role !== 'none';

              return (
                <div
                  key={`synt-tok-${q.id}-${idx}`}
                  className="inline-flex flex-col items-center"
                >
                  <div className="inline-flex items-baseline">
                    <button
                      type="button"
                      disabled={submitted}
                      title={
                        isFunctionWordMistake
                          ? 'Служебная часть речи (предлог/союз) не является членом предложения и не подчёркивается.'
                          : undefined
                      }
                      onClick={() => cycleTokenRole(idx)}
                      className={`inline-flex flex-col items-stretch px-1.5 py-0.5 rounded-lg transition-all ${
                        submitted ? 'cursor-default' : 'cursor-pointer hover:bg-slate-800/80'
                      } ${
                        submitted
                          ? tokenOk
                            ? 'bg-emerald-500/10'
                            : isFunctionWordMistake
                            ? 'bg-rose-500/20 ring-1 ring-rose-500'
                            : 'bg-rose-500/15 ring-1 ring-rose-500/50'
                          : role !== 'none'
                          ? 'bg-slate-800/50'
                          : ''
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          isFunctionWordMistake
                            ? 'text-rose-200'
                            : role !== 'none'
                            ? SYNTACTIC_ROLE_META[role].colorClass
                            : 'text-slate-100'
                        }`}
                      >
                        {tok.word}
                      </span>
                      <SyntacticUnderline role={role} />
                    </button>

                    {tok.trailingPunct && (
                      <span className="text-slate-200 select-none ml-0.5">
                        {tok.trailingPunct}
                      </span>
                    )}
                  </div>

                  {submitted && !tokenOk && (
                    isFunctionWordMistake ? (
                      <span
                        title="Служебная часть речи (предлог/союз) не является членом предложения и не подчёркивается."
                        className="mt-1 px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-[10px] font-semibold text-rose-200 whitespace-nowrap"
                      >
                        Не подчёркивать
                      </span>
                    ) : (
                      <span className="mt-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300 whitespace-nowrap">
                        → {SYNTACTIC_ROLE_META[tok.expectedRole].shortLabel}
                      </span>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {hasUnderlinedFunctionWord && (
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Служебная часть речи (предлог/союз) не является членом предложения и не подчёркивается.
              </span>
            </div>
          )}
        </div>

        {/* Multi-column Checkbox Grid for Sentence Characteristics */}
        <div className="space-y-2.5">
          <div className="text-xs font-medium text-slate-400">
            Характеристики предложения (отметьте все подходящие):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SYNTACTIC_CHARACTERISTIC_GROUPS.map((group) => (
              <div
                key={group.title}
                className="p-3.5 rounded-xl bg-[#080B14]/80 border border-slate-800/90 space-y-2"
              >
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  {group.title}
                </div>
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const checked = selectedCharacteristics.includes(item);
                    const shouldBeChecked = q.expectedCharacteristics.includes(item);
                    const isWrongChoice =
                      submitted && checked !== shouldBeChecked;

                    return (
                      <label
                        key={item}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm transition-all ${
                          submitted ? 'cursor-default' : 'cursor-pointer'
                        } ${
                          submitted
                            ? shouldBeChecked
                              ? checked
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                                : 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                              : checked
                              ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                              : 'bg-slate-900/50 border-slate-800/60 text-slate-500'
                            : checked
                            ? 'bg-violet-500/20 border-violet-500/60 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={submitted}
                          checked={checked}
                          onChange={() => toggleCharacteristic(item)}
                          className="rounded border-slate-600 bg-slate-900 text-violet-500 focus:ring-violet-500/40"
                        />
                        <span className="flex-1 leading-snug">{item}</span>
                        {isWrongChoice && shouldBeChecked && (
                          <span className="text-[10px] font-semibold text-amber-300 whitespace-nowrap">
                            нужно
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-4">
      {/* Full-Width Single-Column Parsing Card */}
      <div className="p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 shadow-xl shadow-black/20 space-y-4 lg:space-y-5">
        {/* Header with Top-Right Hint Toggle */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">
              {question.topicTag || 'Языковой разбор'}
            </span>

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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs font-medium text-violet-300 hover:text-violet-200 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>
                  {showHint
                    ? 'Скрыть подсказку'
                    : hintUnlocked
                    ? 'Подсказка'
                    : 'Подсказка (-5 XP)'}
                </span>
              </button>
            )}
          </div>

          <h3 className="w-full [text-wrap:wrap] font-display text-base sm:text-lg font-semibold text-white leading-snug">
            {question.prompt}
          </h3>

          {showHint && !submitted && question.hint && (
            <div className="p-3 lg:p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs lg:text-sm text-violet-200 leading-relaxed">
              <span className="font-semibold text-violet-300">Подсказка: </span>
              {question.hint}
            </div>
          )}
        </div>

        {/* Mode-specific interactive workspace */}
        {question.mode === 'phonetic' && renderPhoneticWorkspace(question)}
        {question.mode === 'morphological' && renderMorphologicalWorkspace(question)}
        {question.mode === 'syntactic' && renderSyntacticWorkspace(question)}

        {/* Desktop Pre-Submit Navigation & Submit Row */}
        {!submitted && (
          <div className="hidden lg:flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {onPrev && (
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={onPrev}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-300 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>
              )}
              {!isLastQuestion && (
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-violet-500/50 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Вперёд</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-500/25 text-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>Проверить разбор</span>
            </button>
          </div>
        )}
      </div>

      {/* Full-Width Horizontal Feedback Banner (after submit) */}
      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 sm:p-6 rounded-2xl backdrop-blur-md border space-y-4 ${
            isCorrect
              ? 'bg-[#0B1917]/90 border-emerald-500/40'
              : 'bg-[#1C0E14]/90 border-rose-500/40'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Разбор выполнен верно!</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/40 text-xs font-semibold text-rose-300">
                    <XCircle className="w-4 h-4" />
                    <span>Есть неточности · {isReviewMode ? '-20 XP' : '-15 XP'}</span>
                  </span>
                )}
              </div>

              {activeMentor && mentorQuote && (
                <div
                  className={`p-3.5 rounded-xl bg-[#080B14]/85 border ${activeMentor.accentBorder} flex items-start gap-3.5`}
                >
                  <MentorAvatar
                    mentor={activeMentor}
                    size="md"
                    ringTone={isCorrect ? 'amber' : 'violet'}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                      <span>{activeMentor.name}</span>
                      <MessageSquareQuote className={`w-3 h-3 ${activeMentor.accentText}`} />
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      «{mentorQuote}»
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <h4 className="font-display text-sm sm:text-base font-semibold text-white">
                  {question.ruleTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {question.ruleExplanation}
                </p>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex flex-col gap-2.5 shrink-0 min-w-[230px]">
              {isReviewMode && isCorrect && onMarkLearned && (
                <button
                  type="button"
                  disabled={learnedClicked}
                  onClick={() => {
                    setLearnedClicked(true);
                    onMarkLearned(question.id);
                  }}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    learnedClicked
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>
                    {learnedClicked
                      ? 'Удалено (+10 XP)'
                      : 'Выучил (убрать) · +10 XP'}
                  </span>
                </button>
              )}

              <div className="flex items-center gap-2">
                {onPrev && (
                  <button
                    type="button"
                    disabled={!canGoPrev}
                    onClick={onPrev}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#080B14]/85 border border-slate-700 hover:border-violet-500/50 text-slate-200 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onNext}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>{isLastQuestion ? 'Завершить' : 'Вперёд'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Action Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#080B14]/95 backdrop-blur-md border-t border-slate-800 px-4 py-3">
        {!submitted ? (
          <div className="flex items-center gap-2">
            {onPrev && (
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={onPrev}
                aria-label="Назад"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-medium whitespace-nowrap cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Проверить разбор</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            {onPrev && (
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={onPrev}
                aria-label="Назад"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-medium whitespace-nowrap cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
            )}

            {isReviewMode && isCorrect && onMarkLearned && (
              <button
                type="button"
                disabled={learnedClicked}
                onClick={() => {
                  setLearnedClicked(true);
                  onMarkLearned(question.id);
                }}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  learnedClicked
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{learnedClicked ? '+10 XP' : 'Выучил (+10 XP)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
            >
              <span>{isLastQuestion ? 'Завершить' : 'Вперёд'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
