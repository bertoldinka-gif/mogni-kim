import type { AiExamType, AiGradingReport } from '../services/aiGrader';

export type GradeLevel =
  | 'grades_2_4'
  | 'grades_5_6'
  | 'grades_7_8'
  | 'oge'
  | 'ege';

export type DifficultyLevel = 'base' | 'hard';

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'fill_letter'
  | 'punctuation_input'
  | 'phraseology_highlight'
  | 'matching'
  | 'open_essay'
  | 'text_cloze'
  | 'parsing'
  | 'ege_row_spelling'
  | 'ege_task14'
  | 'ege_task15'
  | 'word_input';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty?: DifficultyLevel;
  ruleTitle: string;
  ruleExplanation: string;
  hint: string;
  topicTag?: string;
  subtopic?: string;
  constituentIds?: string[];
  passageGroupId?: string;
  kimTaskNumber?: number;
  enableScratchpad?: boolean;
}

export interface QuizQuestion extends BaseQuestion {
  type: 'single_choice' | 'multiple_choice';
  prompt: string;
  contextText?: string;
  passage?: string;
  options: string[];
  /** Optional exact quoted sentence from micro-text matching each option card */
  optionQuotes?: string[];
  /** Index for single_choice, or array of indices for multiple_choice */
  correctAnswer: number | number[];
}

export interface FillLetterQuestion extends BaseQuestion {
  type: 'fill_letter';
  sentence: string;
  targetWord: string;
  options: string[];
  correctAnswer: string;
  lexicalMeaning?: string;
}

export interface PunctuationInputQuestion extends BaseQuestion {
  type: 'punctuation_input';
  prompt: string;
  /** Sentence with [_] markers or (1), (2) numbered placeholders */
  sentenceTemplate: string;
  /** Expected punctuation marks per [_] slot in order (',', ':', '-', or '') */
  expectedMarks?: string[];
  /** Optional ФИПИ numbered-position comma answer digits (e.g. '12' or '134'), order-independent */
  expectedDigits?: string;
}

export interface SavedQuestionState<T = unknown> {
  isCorrect: boolean;
  userState: T;
  mentorQuote?: string | null;
}

export interface PhraseologyHighlightQuestion extends BaseQuestion {
  type: 'phraseology_highlight';
  prompt: string;
  /** 3–5 sentence paragraph with interactive word tokens */
  paragraph: string;
  /** Exact phraseological unit inside paragraph */
  targetPhrase: string;
  /** Meaning of the phraseological unit */
  phraseMeaning: string;
}

export interface MatchingLeftItem {
  key: string; // 'А', 'Б', 'В', 'Г', 'Д'
  text: string;
}

export interface MatchingRightItem {
  number: number; // 1..9
  text: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  prompt: string;
  leftColumnTitle?: string;
  rightColumnTitle?: string;
  selectOptionPrefix?: string;
  leftItems: MatchingLeftItem[];
  rightItems: MatchingRightItem[];
  /** Mapping from left key ('А') to right item number (1..9) */
  correctMapping: Record<string, number>;
}

export type OpenEssayKind =
  | 'oge_summary'
  | 'oge_essay'
  | 'ege_essay'
  | 'final_essay'
  | 'golden_reading',
  | 'oral_interview';

export interface OpenEssayQuestion extends BaseQuestion {
  type: 'open_essay';
  essayKind: OpenEssayKind;
  prompt: string;
  sourceText?: string;
  minWords: number;
  hasAudio?: boolean;
  audioTitle?: string;
  criteriaText: string;
}

export interface TextClozeQuestion extends BaseQuestion {
  type: 'text_cloze';
  prompt: string;
  /** Inline authoring markup: {{letter}}, {{(1):letter}}, {{opt1|opt2*}}, {{label:opt1*|opt2}}, [[punct]] */
  markupText: string;
  /** Optional OGE Task 7 final digit answer (e.g. '1479'), validated regardless of digit order */
  expectedDigits?: string;
}

export type ParsingMode = 'phonetic' | 'morphological' | 'syntactic';

export type PhoneticVoicingPair =
  | 'voiced_paired'
  | 'voiced_unpaired'
  | 'voiceless_paired'
  | 'voiceless_unpaired';

export type PhoneticHardnessPair =
  | 'hard_paired'
  | 'hard_unpaired'
  | 'soft_paired'
  | 'soft_unpaired';

export interface PhoneticSoundSpec {
  expectedSound: string;
  soundType: 'vowel' | 'consonant';
  stress?: 'stressed' | 'unstressed';
  voicing?: PhoneticVoicingPair;
  hardness?: PhoneticHardnessPair;
}

export interface PhoneticLetterRow {
  letter: string;
  soundCount: number;
  sounds: PhoneticSoundSpec[];
}

export interface PhoneticParsingQuestion extends BaseQuestion {
  type: 'parsing';
  mode: 'phonetic';
  prompt: string;
  displayWord: string;
  missingLetter?: string;
  fullWord: string;
  expectedSyllableCount: number;
  expectedSyllableDivision: string;
  expectedLetterCount: number;
  expectedSoundCount: number;
  letterRows: PhoneticLetterRow[];
}

export type MorphPartOfSpeech =
  | 'Существительное'
  | 'Прилагательное'
  | 'Глагол'
  | 'Местоимение'
  | 'Наречие'
  | 'Причастие'
  | 'Деепричастие';

export interface MorphologicalParsingQuestion extends BaseQuestion {
  type: 'parsing';
  mode: 'morphological';
  prompt: string;
  sentence: string;
  targetWord: string;
  expectedPos: MorphPartOfSpeech;
  expectedQuestions: string[];
  expectedBaseForm: string;
  expectedFeatures: Record<string, string | string[]>;
  expectedSyntacticRole?: string | string[];
}

export type SyntacticRole =
  | 'none'
  | 'subject'
  | 'predicate'
  | 'attribute'
  | 'object'
  | 'adverbial';

export interface SyntacticTokenSpec {
  word: string;
  trailingPunct?: string;
  expectedRole: SyntacticRole;
  acceptableRoles?: SyntacticRole[];
}

export interface SyntacticParsingQuestion extends BaseQuestion {
  type: 'parsing';
  mode: 'syntactic';
  prompt: string;
  sentence: string;
  tokens: SyntacticTokenSpec[];
  expectedCharacteristics: string[];
}

export type ParsingQuestion =
  | PhoneticParsingQuestion
  | MorphologicalParsingQuestion
  | SyntacticParsingQuestion;

export interface EgeRowSpellingWord {
  /** Word template with '..' where the missing letter slot appears */
  template: string;
  /** Expected single lowercase letter (e.g. 'е', 'и', 'ъ') or '-' / '' if no letter is needed */
  expectedLetter: string;
}

export interface EgeRowSpellingRow {
  rowNumber: number; // 1..5
  words: EgeRowSpellingWord[]; // 3 words (Tasks 9-10) or 2 words (Tasks 11-12)
}

export interface EgeRowSpellingQuestion extends BaseQuestion {
  type: 'ege_row_spelling';
  prompt?: string;
  /** 5 numbered rows (1..5), each with 2 or 3 words */
  rows: EgeRowSpellingRow[];
  /** Sorted matching row numbers (1..5) where all words have the same missing letter */
  correctRows: number[];
}

export type EgeTask14SpellingForm = 'solid' | 'separate' | 'hyphen';

export interface EgeTask14Word {
  /** Word cue in parentheses, e.g. '(В)ТЕЧЕНИЕ' */
  cue: string;
  /** Expected spelling mode */
  expectedForm: EgeTask14SpellingForm;
  /** Canonical spelled form shown in feedback, e.g. 'в течение' */
  canonicalWord: string;
}

export interface EgeTask14Row {
  rowNumber: number; // 1..5
  /** Row sentence containing {0} and {1} placeholders for the 2 words */
  sentenceTemplate: string;
  words: EgeTask14Word[];
}

export interface EgeTask14Question extends BaseQuestion {
  type: 'ege_task14';
  prompt: string;
  targetForm: EgeTask14SpellingForm;
  rows: EgeTask14Row[];
  correctRows: number[];
}

export interface EgeTask15Slot {
  slotNumber: number; // 1..6
  expected: 'н' | 'нн';
  canonicalWord?: string;
}

export interface EgeTask15Question extends BaseQuestion {
  type: 'ege_task15';
  prompt: string;
  /** Single sentence with {1}, {2}, ... placeholders for numbered (1)[н|нн] slots */
  sentenceTemplate: string;
  slots: EgeTask15Slot[];
  /** Sorted matching slot numbers, e.g. [1, 2, 4] */
  correctSlots: number[];
}

export type WordInputSubmode =
  | 'grammar_form'
  | 'phrase_transform'
  | 'text_lexicon';

export interface WordInputQuestion extends BaseQuestion {
  type: 'word_input';
  submode?: WordInputSubmode;
  prompt: string;
  /** Optional sentence (e.g., with word in parentheses for OGE Task 8) */
  sentence?: string;
  /** Full reading passage (e.g., for OGE Task 12, EGE Tasks 1, 21, 25, 26) */
  passage?: string;
  answerLabel?: string;
  digitOrderIndependent?: boolean;
  inputPlaceholder?: string;
  acceptedAnswers: string[];
  displayAnswer?: string;
  /** Accept answers with or without spaces (e.g., 'дом из дерева' and 'домиздерева') */
  ignoreSpaces?: boolean;
}

export type PlatformQuestion =
  | QuizQuestion
  | FillLetterQuestion
  | PunctuationInputQuestion
  | PhraseologyHighlightQuestion
  | MatchingQuestion
  | OpenEssayQuestion
  | TextClozeQuestion
  | ParsingQuestion
  | EgeRowSpellingQuestion
  | EgeTask14Question
  | EgeTask15Question
  | WordInputQuestion;

export type EgeCategoryTab =
  | 'speech_culture'
  | 'spelling'
  | 'punctuation'
  | 'text_essay';

export interface TaskModule {
  id: string;
  title: string;
  subtitle: string;
  taskNumber?: string;
  engineType: QuestionType | 'mixed';
  egeTab?: EgeCategoryTab;
  sessionSize: number;
  questions: PlatformQuestion[];
}

export type SprintId =
  | 'orthoepy'
  | 'paronyms'
  | 'phraseology'
  | 'expressive_means'
  | 'dictation'
  | 'vocabulary';

export interface SprintModule {
  id: SprintId;
  title: string;
  subtitle: string;
  availableFor: GradeLevel[];
  sessionSize: number;
  questions: PlatformQuestion[];
}

export type SkillPillar =
  | 'orthography'
  | 'punctuation'
  | 'speech_culture'
  | 'text_work';

export interface SkillStatEntry {
  correct: number;
  total: number;
}

export type SkillStatsMap = Record<SkillPillar, SkillStatEntry>;

export type CategoryStatsMap = Record<string, SkillStatEntry>;

export type BlitzModeId = 'orthoepy' | 'paronyms' | 'vocabulary' | 'mix';

export type DailyChallengeKind = 'sprint_10' | 'mistakes_3' | 'streak_5';

export interface DailyChallengeState {
  date: string; // YYYY-MM-DD
  kind: DailyChallengeKind;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardXp: number;
  claimed: boolean;
  currentStreak?: number;
}

export interface MistakeItem {
  questionId: string;
  question: PlatformQuestion;
  sourceId: string;
  sourceTitle: string;
  failCount: number;
  correctStreak: number;
  addedAt: string;
  lastAttemptAt: string;
}

export type AttemptGradeLevel =
  | 'grade2_4'
  | 'grade5_6'
  | 'grade7_8'
  | 'oge'
  | 'ege';

export interface AttemptRecord {
  id: string;
  questionId: string;
  moduleTitle: string;
  gradeLevel: AttemptGradeLevel;
  previewText: string;
  isCorrect: boolean;
  timestamp: string;
  userAnswer?: string;
  correctAnswer?: string;
  questionSnapshot: PlatformQuestion;
}

export interface MockExamTaskResult {
  taskNumber: number;
  taskTitle: string;
  isCorrect: boolean;
}

export interface MockExamRecord {
  id: string;
  examType: 'oge' | 'ege';
  timestamp: string;
  score: number;
  maxScore: number;
  durationSeconds?: number;
  taskResults: MockExamTaskResult[];
}

export interface SavedEssayRecord {
  id: string;
  questionId: string;
  examType: AiExamType;
  promptTitle: string;
  sourceText?: string;
  studentText: string;
  wordCount: number;
  timestamp: string;
  gradingReport?: AiGradingReport;
}

export interface UserProfile {
  nickname: string;
  password: string;
  grade: GradeLevel;
  xp: number;
  streak: number;
  totalAnswered: number;
  totalCorrect: number;
  completedModuleIds: string[];
  activeDays?: string[];
  unlockedMentors?: string[];
  activeMentorId?: string | null;
  unlockedTitles?: string[];
  activeTitle?: string;
  unlockedThemes?: string[];
  activeTheme?: string;
  solvedQuestionIds?: string[];
  attemptHistory?: AttemptRecord[];
  mockExamHistory?: MockExamRecord[];
  savedEssays?: SavedEssayRecord[];
  duelsWon?: number;
  lastActiveDate: string;
  createdAt: string;
}

export type ActiveNavSection =
  | 'dashboard'
  | 'sprints'
  | 'curriculum'
  | 'mistakes'
  | 'history'
  | 'mock_journal'
  | 'saved_essays'
  | 'shop'
  | 'rules_chat'
  | 'mock_test';
