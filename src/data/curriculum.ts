import {
  BlitzModeId,
  DifficultyLevel,
  EgeCategoryTab,
  FillLetterQuestion,
  GradeLevel,
  PlatformQuestion,
  QuizQuestion,
  SkillPillar,
  SprintId,
  SprintModule,
  TaskModule,
} from '../types/platform';
import { orthoepyQuestions } from './sprints/orthoepy';
import { paronymsQuestions } from './sprints/paronyms';
import { phraseologyQuestions } from './sprints/phraseology';
import { expressiveMeansQuestions } from './sprints/expressiveMeans';
import { getVocabularyWordsForGrade } from './sprints/vocabularyWords';
import {
  grades2to8Modules,
  grades5to6Modules,
  grades7to8Modules,
} from './grades/grades2to8';
import { ogeModules } from './oge/ogeTasks';
import { egeModules } from './ege/egeOtherTasks';
import { egeTask10Questions } from './ege/egeTask10';
import { textClozeQuestions } from './textClozeData';

export const GRADE_LABELS: Record<GradeLevel, string> = {
  grades_2_4: '2–4 классы',
  grades_5_6: '5–6 классы',
  grades_7_8: '7–8 классы',
  oge: 'Подготовка к ОГЭ',
  ege: 'Подготовка к ЕГЭ',
};

export const GRADE_OPTIONS: { value: GradeLevel; label: string; shortLabel: string }[] = [
  { value: 'grades_2_4', label: '2-4 классы', shortLabel: '2–4 кл.' },
  { value: 'grades_5_6', label: '5-6 классы', shortLabel: '5–6 кл.' },
  { value: 'grades_7_8', label: '7-8 классы', shortLabel: '7–8 кл.' },
  { value: 'oge', label: 'Подготовка к ОГЭ', shortLabel: 'ОГЭ' },
  { value: 'ege', label: 'Подготовка к ЕГЭ', shortLabel: 'ЕГЭ' },
];

export const EGE_TABS: { id: EgeCategoryTab; label: string; rangeLabel: string }[] = [
  { id: 'speech_culture', label: 'Культура речи', rangeLabel: 'Задания 1–8' },
  { id: 'spelling', label: 'Орфография', rangeLabel: 'Задания 9–15' },
  { id: 'punctuation', label: 'Пунктуация', rangeLabel: 'Задания 16–21' },
  { id: 'text_essay', label: 'Текст и Сочинение', rangeLabel: 'Задания 22–26, Сочинение' },
];

export const ALL_SPRINTS: SprintModule[] = [
  {
    id: 'vocabulary',
    title: 'Словарные слова',
    subtitle: 'Трудные словарные слова с проверкой лексического значения',
    availableFor: ['grades_2_4', 'grades_5_6', 'grades_7_8', 'oge', 'ege'],
    sessionSize: 10,
    questions: [],
  },
  {
    id: 'orthoepy',
    title: 'Ударения',
    subtitle: 'Орфоэпический минимум: быстрый спринт на 10 вопросов',
    availableFor: ['grades_2_4', 'grades_5_6', 'grades_7_8', 'oge', 'ege'],
    sessionSize: 10,
    questions: orthoepyQuestions,
  },
  {
    id: 'paronyms',
    title: 'Паронимы',
    subtitle: 'Точность словоупотребления и лексическая сочетаемость',
    availableFor: ['grades_2_4', 'grades_5_6', 'grades_7_8', 'oge', 'ege'],
    sessionSize: 10,
    questions: paronymsQuestions,
  },
  {
    id: 'phraseology',
    title: 'Фразеологизмы',
    subtitle: 'Устойчивые выражения, синонимы и контекст',
    availableFor: ['oge', 'ege'],
    sessionSize: 10,
    questions: phraseologyQuestions,
  },
  {
    id: 'expressive_means',
    title: 'Средства выразительности',
    subtitle: 'Тропы и приёмы художественной выразительности для ОГЭ',
    availableFor: ['oge'],
    sessionSize: 10,
    questions: expressiveMeansQuestions,
  },
  {
    id: 'dictation',
    title: 'Комплексный диктант',
    subtitle: 'Интерактивный текст с пропусками букв, выбором написания и пунктуацией',
    availableFor: ['grades_5_6', 'grades_7_8', 'oge', 'ege'],
    sessionSize: 3,
    questions: textClozeQuestions,
  },
];

export function getSprintsForGrade(grade: GradeLevel): SprintModule[] {
  return ALL_SPRINTS.filter((s) => s.availableFor.includes(grade)).map((s) =>
    s.id === 'vocabulary'
      ? { ...s, questions: getVocabularyWordsForGrade(grade) }
      : s
  );
}

export function getModulesForGrade(grade: GradeLevel): TaskModule[] {
  if (grade === 'oge') return ogeModules;
  if (grade === 'ege') return egeModules;
  if (grade === 'grades_5_6') return grades5to6Modules;
  if (grade === 'grades_7_8') return grades7to8Modules;
  return grades2to8Modules;
}

export function filterQuestionsByDifficulty(
  questions: PlatformQuestion[],
  difficulty?: DifficultyLevel
): PlatformQuestion[] {
  if (!difficulty) return questions;
  const matched = questions.filter(
    (q) => !q.difficulty || q.difficulty === difficulty
  );
  return matched.length > 0 ? matched : questions;
}

/**
 * Fisher-Yates (Knuth) unbiased shuffle returning a new array.
 */
export function shuffleQuestions<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function resolveSkillPillar(
  sourceId: string,
  question: PlatformQuestion
): SkillPillar {
  const id = sourceId.toLowerCase();

  // Sprints
  if (id === 'sprint-vocabulary' || id === 'sprint-dictation') return 'orthography';
  if (id === 'sprint-orthoepy' || id === 'sprint-paronyms' || id === 'sprint-phraseology') {
    return 'speech_culture';
  }
  if (id === 'sprint-expressive_means') return 'text_work';

  // Grades 2-8
  if (id === 'g-orthography') return 'orthography';
  if (id === 'g-punctuation' || id === 'g-syntax') return 'punctuation';
  if (id === 'g-phonetics' || id === 'g-morphology' || id === 'g-lexicon') {
    return 'speech_culture';
  }
  if (id === 'g-text-work') return 'text_work';

  // OGE
  if (id === 'oge-6' || id === 'oge-7') return 'orthography';
  if (id === 'oge-2-3' || id === 'oge-4' || id === 'oge-5') return 'punctuation';
  if (id === 'oge-8' || id === 'oge-9') return 'speech_culture';
  if (id === 'oge-summary' || id === 'oge-10-12' || id === 'oge-essay') return 'text_work';

  // EGE
  if (
    id === 'ege-9' ||
    id === 'ege-10' ||
    id === 'ege-11' ||
    id === 'ege-12' ||
    id === 'ege-13' ||
    id === 'ege-14' ||
    id === 'ege-15' ||
    id === 'ege-11-12' ||
    id === 'ege-13-15' ||
    id === 'ege-dictation'
  ) {
    return 'orthography';
  }
  if (
    id === 'ege-16' ||
    id === 'ege-17' ||
    id === 'ege-18' ||
    id === 'ege-19' ||
    id === 'ege-20' ||
    id === 'ege-17-20' ||
    id === 'ege-21'
  ) {
    return 'punctuation';
  }
  if (
    id === 'ege-1' ||
    id === 'ege-2' ||
    id === 'ege-3' ||
    id === 'ege-1-3' ||
    id === 'ege-4' ||
    id === 'ege-5' ||
    id === 'ege-6' ||
    id === 'ege-5-6' ||
    id === 'ege-7' ||
    id === 'ege-8'
  ) {
    return 'speech_culture';
  }
  if (
    id === 'ege-22' ||
    id === 'ege-23' ||
    id === 'ege-24' ||
    id === 'ege-25' ||
    id === 'ege-26' ||
    id === 'ege-23-26' ||
    id === 'ege-essay' ||
    id === 'ege-final-essay'
  ) {
    return 'text_work';
  }

  // Fallback for mistake-review / mock tests based on question metadata
  const tag = (question.topicTag || '').toLowerCase();
  if (
    question.type === 'punctuation_input' ||
    tag.includes('пунктуац') ||
    tag.includes('синтаксис') ||
    tag.includes('задание 4') ||
    tag.includes('задание 5') ||
    tag.includes('задание 16') ||
    tag.includes('задание 17') ||
    tag.includes('задания 17') ||
    tag.includes('задание 18') ||
    tag.includes('задание 19') ||
    tag.includes('задание 20') ||
    tag.includes('задание 21')
  ) {
    return 'punctuation';
  }
  if (
    question.type === 'open_essay' ||
    question.type === 'phraseology_highlight' ||
    tag.includes('огэ · задание 10') ||
    tag.includes('огэ · задание 11') ||
    tag.includes('огэ · задание 12') ||
    tag.includes('текст') ||
    tag.includes('сочинен') ||
    tag.includes('изложен') ||
    tag.includes('выразительн') ||
    tag.includes('задание 22') ||
    tag.includes('задания 23') ||
    tag.includes('задания 10–12')
  ) {
    return 'text_work';
  }
  if (tag.includes('огэ · задание 9') || tag.includes('огэ · задание 8')) {
    return 'speech_culture';
  }
  if (
    question.type === 'fill_letter' ||
    question.type === 'ege_row_spelling' ||
    question.type === 'ege_task14' ||
    question.type === 'ege_task15' ||
    tag.includes('орфограф') ||
    tag.includes('словарн') ||
    tag.includes('задание 6') ||
    tag.includes('задание 7') ||
    tag.includes('задание 9') ||
    tag.includes('задание 10') ||
    tag.includes('задание 11') ||
    tag.includes('задание 12') ||
    tag.includes('задание 13') ||
    tag.includes('задание 14') ||
    tag.includes('задание 15')
  ) {
    return 'orthography';
  }

  return 'speech_culture';
}

export function getWeakSpotPracticeTarget(
  grade: GradeLevel,
  pillar: SkillPillar
): { kind: 'module'; module: TaskModule } | { kind: 'sprint'; sprint: SprintModule } | null {
  const modules = getModulesForGrade(grade);
  const sprints = getSprintsForGrade(grade);

  const findMod = (ids: string[]) => modules.find((m) => ids.includes(m.id));
  const findSprint = (ids: string[]) => sprints.find((s) => ids.includes(s.id));

  if (pillar === 'orthography') {
    const mod = findMod([
      'g-orthography',
      'oge-6',
      'oge-7',
      'ege-9',
      'ege-10',
      'ege-11',
      'ege-12',
      'ege-13',
      'ege-14',
      'ege-15',
    ]);
    if (mod) return { kind: 'module', module: mod };
    const sp = findSprint(['vocabulary', 'dictation']);
    if (sp) return { kind: 'sprint', sprint: sp };
  }

  if (pillar === 'punctuation') {
    const mod = findMod([
      'g-punctuation',
      'oge-5',
      'oge-4',
      'ege-16',
      'ege-17',
      'ege-18',
      'ege-19',
      'ege-20',
      'ege-21',
    ]);
    if (mod) return { kind: 'module', module: mod };
  }

  if (pillar === 'speech_culture') {
    const mod = findMod([
      'g-lexicon',
      'g-morphology',
      'oge-8',
      'ege-4',
      'ege-5',
      'ege-6',
      'ege-7',
    ]);
    if (mod) return { kind: 'module', module: mod };
    const sp = findSprint(['orthoepy', 'paronyms']);
    if (sp) return { kind: 'sprint', sprint: sp };
  }

  if (pillar === 'text_work') {
    const mod = findMod([
      'g-text-work',
      'oge-10-12',
      'ege-22',
      'ege-23',
      'ege-24',
      'ege-25',
      'ege-26',
      'ege-23-26',
    ]);
    if (mod) return { kind: 'module', module: mod };
    const sp = findSprint(['expressive_means', 'phraseology']);
    if (sp) return { kind: 'sprint', sprint: sp };
  }

  if (modules.length > 0) return { kind: 'module', module: modules[0] };
  if (sprints.length > 0) return { kind: 'sprint', sprint: sprints[0] };
  return null;
}

function pickRandomItem<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function pickSharedPassageGroup(
  questions: PlatformQuestion[],
  taskNumbers: number[]
): PlatformQuestion[] {
  const groupIds = Array.from(
    new Set(
      questions
        .map((q) => q.passageGroupId)
        .filter((id): id is string => Boolean(id))
    )
  );
  if (groupIds.length === 0) return [];

  const completeGroups = groupIds.filter((gid) =>
    taskNumbers.every((num) =>
      questions.some((q) => q.passageGroupId === gid && q.kimTaskNumber === num)
    )
  );
  const chosenGroupId =
    pickRandomItem(completeGroups) ?? pickRandomItem(groupIds);
  if (!chosenGroupId) return [];

  const result: PlatformQuestion[] = [];
  for (const num of taskNumbers) {
    const match = questions.find(
      (q) => q.passageGroupId === chosenGroupId && q.kimTaskNumber === num
    );
    if (match) {
      result.push(match);
    }
  }
  return result;
}

export function buildMockTestQuestions(grade: GradeLevel): PlatformQuestion[] {
  const modules = getModulesForGrade(grade);

  if (grade === 'oge') {
    const collected: PlatformQuestion[] = [];
    const byId = new Map(modules.map((m) => [m.id, m]));

    // Tasks 2–3: shared micro-text passageGroupId
    const oge23 = byId.get('oge-2-3');
    if (oge23) {
      const micro = pickSharedPassageGroup(oge23.questions, [2, 3]);
      if (micro.length > 0) {
        collected.push(...micro);
      } else {
        const fallback = pickRandomItem(oge23.questions);
        if (fallback) collected.push({ ...fallback, kimTaskNumber: 2 });
      }
    }

    // Standalone Tasks 4..9 in strict numerical order
    const standaloneOge: Array<{ modId: string; taskNum: number }> = [
      { modId: 'oge-4', taskNum: 4 },
      { modId: 'oge-5', taskNum: 5 },
      { modId: 'oge-6', taskNum: 6 },
      { modId: 'oge-7', taskNum: 7 },
      { modId: 'oge-8', taskNum: 8 },
      { modId: 'oge-9', taskNum: 9 },
    ];
    for (const slot of standaloneOge) {
      const mod = byId.get(slot.modId);
      if (!mod) continue;
      const playable = mod.questions.filter((q) => q.type !== 'open_essay');
      const picked = pickRandomItem(playable);
      if (picked) {
        collected.push({ ...picked, kimTaskNumber: picked.kimTaskNumber ?? slot.taskNum });
      }
    }

    // Tasks 10–12: shared main-text passageGroupId
    const oge1012 = byId.get('oge-10-12');
    if (oge1012) {
      const mainGroup = pickSharedPassageGroup(oge1012.questions, [10, 11, 12]);
      if (mainGroup.length > 0) {
        collected.push(...mainGroup);
      } else {
        const fallback = pickRandomItem(oge1012.questions);
        if (fallback) collected.push({ ...fallback, kimTaskNumber: 10 });
      }
    }

    return collected;
  }

  if (grade === 'ege') {
    const collected: PlatformQuestion[] = [];
    const byId = new Map(modules.map((m) => [m.id, m]));

    // Tasks 1–3: shared micro-text passageGroupId across ege-1, ege-2, ege-3
    const microPool = [
      ...(byId.get('ege-1')?.questions ?? []),
      ...(byId.get('ege-2')?.questions ?? []),
      ...(byId.get('ege-3')?.questions ?? []),
    ];
    const microGroup = pickSharedPassageGroup(microPool, [1, 2, 3]);
    if (microGroup.length > 0) {
      collected.push(...microGroup);
    } else {
      [1, 2, 3].forEach((num) => {
        const mod = byId.get(`ege-${num}`);
        const picked = mod ? pickRandomItem(mod.questions) : undefined;
        if (picked) collected.push({ ...picked, kimTaskNumber: num });
      });
    }

    // Standalone Tasks 4..22 in strict numerical order
    for (let taskNum = 4; taskNum <= 22; taskNum++) {
      const mod = byId.get(`ege-${taskNum}`);
      if (!mod) continue;
      const playable = mod.questions.filter((q) => q.type !== 'open_essay');
      const picked = pickRandomItem(playable);
      if (picked) {
        collected.push({ ...picked, kimTaskNumber: picked.kimTaskNumber ?? taskNum });
      }
    }

    // Tasks 23–26: shared main reading text passageGroupId across ege-23..ege-26
    const mainPool = [
      ...(byId.get('ege-23')?.questions ?? []),
      ...(byId.get('ege-24')?.questions ?? []),
      ...(byId.get('ege-25')?.questions ?? []),
      ...(byId.get('ege-26')?.questions ?? []),
    ];
    const mainGroup = pickSharedPassageGroup(mainPool, [23, 24, 25, 26]);
    if (mainGroup.length > 0) {
      collected.push(...mainGroup);
    } else {
      [23, 24, 25, 26].forEach((num) => {
        const mod = byId.get(`ege-${num}`);
        const picked = mod ? pickRandomItem(mod.questions) : undefined;
        if (picked) collected.push({ ...picked, kimTaskNumber: num });
      });
    }

    return collected;
  }

  const collected: PlatformQuestion[] = [];
  for (const mod of modules) {
    const playable = mod.questions.filter((q) => q.type !== 'open_essay');
    if (playable.length > 0) {
      collected.push(playable[0]);
    }
  }
  return collected;
}

// --- Grade-Specific Analytics Categories & Weak-Spot Routing ---

export interface AnalyticsCategoryDef {
  id: string;
  label: string;
  targetModuleIds: string[];
  fallbackSprintIds?: SprintId[];
}

export function getAnalyticsCategoriesForGrade(
  grade: GradeLevel
): AnalyticsCategoryDef[] {
  if (grade === 'oge') {
    return [
      {
        id: 'oge_syntax_punct',
        label: 'Синтаксис и пунктуация (2–5)',
        targetModuleIds: ['oge-2-3', 'oge-4', 'oge-5'],
      },
      {
        id: 'oge_orthography',
        label: 'Орфография (6–7)',
        targetModuleIds: ['oge-6', 'oge-7'],
        fallbackSprintIds: ['vocabulary', 'dictation'],
      },
      {
        id: 'oge_grammar',
        label: 'Грамматика (8–9)',
        targetModuleIds: ['oge-8', 'oge-9'],
      },
      {
        id: 'oge_text_work',
        label: 'Работа с текстом (10–12)',
        targetModuleIds: ['oge-10-12'],
        fallbackSprintIds: ['expressive_means', 'phraseology'],
      },
    ];
  }

  if (grade === 'ege') {
    return [
      {
        id: 'ege_speech_culture',
        label: 'Культура речи (1–8)',
        targetModuleIds: [
          'ege-4',
          'ege-5',
          'ege-6',
          'ege-7',
          'ege-8',
          'ege-1',
          'ege-2',
          'ege-3',
        ],
        fallbackSprintIds: ['orthoepy', 'paronyms'],
      },
      {
        id: 'ege_orthography',
        label: 'Орфография (9–15)',
        targetModuleIds: [
          'ege-9',
          'ege-10',
          'ege-11',
          'ege-12',
          'ege-13',
          'ege-14',
          'ege-15',
          'ege-dictation',
        ],
        fallbackSprintIds: ['vocabulary', 'dictation'],
      },
      {
        id: 'ege_punctuation',
        label: 'Пунктуация (16–21)',
        targetModuleIds: [
          'ege-16',
          'ege-17',
          'ege-18',
          'ege-19',
          'ege-20',
          'ege-21',
        ],
      },
      {
        id: 'ege_text_work',
        label: 'Работа с текстом (22–26)',
        targetModuleIds: ['ege-22', 'ege-23', 'ege-24', 'ege-25', 'ege-26'],
        fallbackSprintIds: ['phraseology'],
      },
    ];
  }

  // Grades 2–4, 5–6, 7–8: dynamically derived from actual curriculum folders in that grade
  const modules = getModulesForGrade(grade);
  return modules.map((mod) => ({
    id: `${grade}:${mod.id}`,
    label: mod.title,
    targetModuleIds: [mod.id],
  }));
}

export function resolveAnalyticsCategoryKey(
  grade: GradeLevel,
  sourceId: string,
  question: PlatformQuestion
): string | null {
  const id = sourceId.toLowerCase();
  const tag = (question.topicTag || '').toLowerCase();
  const taskNum = question.kimTaskNumber;

  if (grade === 'oge') {
    if (
      id === 'oge-2-3' ||
      id === 'oge-4' ||
      id === 'oge-5' ||
      (taskNum !== undefined && taskNum >= 2 && taskNum <= 5) ||
      /задани[ея]\s*(2|3|4|5)\b/.test(tag) ||
      question.type === 'punctuation_input'
    ) {
      return 'oge_syntax_punct';
    }
    if (
      id === 'oge-6' ||
      id === 'oge-7' ||
      id === 'sprint-vocabulary' ||
      id === 'sprint-dictation' ||
      (taskNum !== undefined && taskNum >= 6 && taskNum <= 7) ||
      /задани[ея]\s*(6|7)\b/.test(tag) ||
      question.type === 'fill_letter'
    ) {
      return 'oge_orthography';
    }
    if (
      id === 'oge-8' ||
      id === 'oge-9' ||
      id === 'sprint-orthoepy' ||
      id === 'sprint-paronyms' ||
      (taskNum !== undefined && taskNum >= 8 && taskNum <= 9) ||
      /задани[ея]\s*(8|9)\b/.test(tag)
    ) {
      return 'oge_grammar';
    }
    if (
      id === 'oge-10-12' ||
      id === 'oge-summary' ||
      id === 'oge-essay' ||
      id === 'sprint-expressive_means' ||
      id === 'sprint-phraseology' ||
      (taskNum !== undefined && taskNum >= 10 && taskNum <= 12) ||
      /задани[ея]\s*(10|11|12)\b|изложен|сочинен/.test(tag)
    ) {
      return 'oge_text_work';
    }
    return 'oge_syntax_punct';
  }

  if (grade === 'ege') {
    if (
      /^ege-[1-8]$/.test(id) ||
      id === 'ege-1-3' ||
      id === 'ege-5-6' ||
      id === 'sprint-orthoepy' ||
      id === 'sprint-paronyms' ||
      id === 'sprint-phraseology' ||
      (taskNum !== undefined && taskNum >= 1 && taskNum <= 8) ||
      /задани[ея]\s*[1-8]\b/.test(tag)
    ) {
      return 'ege_speech_culture';
    }
    if (
      /^ege-(9|10|11|12|13|14|15|11-12|13-15|dictation)$/.test(id) ||
      id === 'sprint-vocabulary' ||
      id === 'sprint-dictation' ||
      (taskNum !== undefined && taskNum >= 9 && taskNum <= 15) ||
      /задани[ея]\s*(9|1[0-5])\b/.test(tag) ||
      question.type === 'ege_row_spelling' ||
      question.type === 'ege_task14' ||
      question.type === 'ege_task15' ||
      question.type === 'fill_letter'
    ) {
      return 'ege_orthography';
    }
    if (
      /^ege-(16|17|18|19|20|21|17-20)$/.test(id) ||
      (taskNum !== undefined && taskNum >= 16 && taskNum <= 21) ||
      /задани[ея]\s*(1[6-9]|2[01])\b/.test(tag) ||
      question.type === 'punctuation_input'
    ) {
      return 'ege_punctuation';
    }
    if (
      id === 'ege-22' ||
      id === 'ege-23' ||
      id === 'ege-24' ||
      id === 'ege-25' ||
      id === 'ege-26' ||
      id === 'ege-23-26' ||
      id === 'ege-essay' ||
      id === 'ege-final-essay' ||
      (taskNum !== undefined && taskNum >= 22 && taskNum <= 26) ||
      /задани[ея]\s*2[2-6]\b|сочинен/.test(tag)
    ) {
      return 'ege_text_work';
    }
    return 'ege_speech_culture';
  }

  // Grades 2–4, 5–6, 7–8
  const modules = getModulesForGrade(grade);
  const direct = modules.find((m) => m.id === sourceId);
  if (direct) return `${grade}:${direct.id}`;

  let matchedModId: string | null = null;
  if (id === 'sprint-vocabulary' || id === 'sprint-dictation' || question.type === 'fill_letter' || tag.includes('орфограф')) {
    matchedModId = 'g-orthography';
  } else if (question.type === 'punctuation_input' || tag.includes('пунктуац')) {
    matchedModId = 'g-punctuation';
  } else if ((question.type === 'parsing' && question.mode === 'phonetic') || tag.includes('фонетик')) {
    matchedModId = 'g-phonetics';
  } else if ((question.type === 'parsing' && question.mode === 'morphological') || tag.includes('морфолог')) {
    matchedModId = 'g-morphology';
  } else if ((question.type === 'parsing' && question.mode === 'syntactic') || tag.includes('синтаксис')) {
    matchedModId = 'g-syntax';
  } else if (id === 'sprint-orthoepy' || id === 'sprint-paronyms' || tag.includes('лексик')) {
    matchedModId = 'g-lexicon';
  } else if (question.type === 'text_cloze' || tag.includes('текст')) {
    matchedModId = 'g-text-work';
  }

  if (matchedModId && modules.some((m) => m.id === matchedModId)) {
    return `${grade}:${matchedModId}`;
  }
  return modules.length > 0 ? `${grade}:${modules[0].id}` : null;
}

export function getAnalyticsCategoryTarget(
  grade: GradeLevel,
  categoryId: string
): { kind: 'module'; module: TaskModule } | { kind: 'sprint'; sprint: SprintModule } | null {
  const categories = getAnalyticsCategoriesForGrade(grade);
  const cat = categories.find((c) => c.id === categoryId) ?? categories[0];
  const modules = getModulesForGrade(grade);
  const sprints = getSprintsForGrade(grade);

  if (cat) {
    for (const modId of cat.targetModuleIds) {
      const found = modules.find((m) => m.id === modId);
      if (found) return { kind: 'module', module: found };
    }
    if (cat.fallbackSprintIds) {
      for (const spId of cat.fallbackSprintIds) {
        const sp = sprints.find((s) => s.id === spId);
        if (sp) return { kind: 'sprint', sprint: sp };
      }
    }
  }

  if (modules.length > 0) return { kind: 'module', module: modules[0] };
  if (sprints.length > 0) return { kind: 'sprint', sprint: sprints[0] };
  return null;
}

export function getModuleTargetForKimTask(
  examType: 'oge' | 'ege',
  taskNumber: number
): TaskModule | null {
  const modules = examType === 'oge' ? ogeModules : egeModules;
  if (examType === 'oge') {
    if (taskNumber === 2 || taskNumber === 3) {
      return modules.find((m) => m.id === 'oge-2-3') ?? null;
    }
    if (taskNumber >= 10 && taskNumber <= 12) {
      return modules.find((m) => m.id === 'oge-10-12') ?? null;
    }
    return modules.find((m) => m.id === `oge-${taskNumber}`) ?? null;
  }

  return modules.find((m) => m.id === `ege-${taskNumber}`) ?? null;
}

export type BlitzQuestion = QuizQuestion | FillLetterQuestion;

export function getBlitzQuestionPool(
  mode: BlitzModeId,
  grade: GradeLevel
): BlitzQuestion[] {
  const vocab = getVocabularyWordsForGrade(grade);
  const fillLetterFromModules: FillLetterQuestion[] = egeTask10Questions.slice(0, 40);

  if (mode === 'orthoepy') {
    return shuffleQuestions([...orthoepyQuestions]);
  }
  if (mode === 'paronyms') {
    return shuffleQuestions([...paronymsQuestions]);
  }
  if (mode === 'vocabulary') {
    return shuffleQuestions([...vocab, ...fillLetterFromModules.slice(0, 15)]);
  }
  return shuffleQuestions([
    ...orthoepyQuestions,
    ...paronymsQuestions,
    ...vocab,
    ...fillLetterFromModules.slice(0, 20),
  ]);
}
