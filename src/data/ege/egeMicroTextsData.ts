import { MultipleChoiceQuestion, WordInputQuestion } from '../../types/platform';

export interface MicroBundleInput {
  groupId: string;
  difficulty?: 'base' | 'hard';
  /** Текст с пропуском <...> для Задания 1 и 5 словами в **...** для Задания 2 */
  textWithMarks: string;
  t1: {
    prompt: string;
    answers: string[];
    displayAnswer?: string;
    inputPlaceholder?: string;
    ruleTitle: string;
    ruleExplanation: string;
    hint: string;
  };
  t2: {
    options: string[];
    correct: number[];
    ruleExplanation: string;
    hint: string;
  };
  t3: {
    options: string[];
    correct: number[];
    ruleExplanation: string;
    hint: string;
  };
}

export interface MicroTextBundle {
  t1: WordInputQuestion;
  t2: MultipleChoiceQuestion;
  t3: MultipleChoiceQuestion;
}

export function createMicroTextBundle(cfg: MicroBundleInput): MicroTextBundle {
  const diff = cfg.difficulty ?? 'base';
  const fillWord = cfg.t1.displayAnswer ?? cfg.t1.answers.at(0) ?? '';
  const cleanMarks = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, '$1');
  const fillBlank = (s: string) => s.replace(/<\.\.\.>|<…>/g, fillWord);

  return {
    t1: {
      id: `${cfg.groupId}-t1`,
      type: 'word_input',
      submode: 'text_lexicon',
      difficulty: diff,
      kimTaskNumber: 1,
      passageGroupId: cfg.groupId,
      topicTag: 'ЕГЭ · Задание 1',
      passage: cleanMarks(cfg.textWithMarks),
      prompt: cfg.t1.prompt,
      inputPlaceholder: cfg.t1.inputPlaceholder ?? 'Запишите слово...',
      acceptedAnswers: cfg.t1.answers,
      displayAnswer: fillWord,
      ruleTitle: cfg.t1.ruleTitle,
      ruleExplanation: cfg.t1.ruleExplanation,
      hint: cfg.t1.hint,
    },
    t2: {
      id: `${cfg.groupId}-t2`,
      type: 'multiple_choice',
      difficulty: diff,
      kimTaskNumber: 2,
      passageGroupId: cfg.groupId,
      topicTag: 'ЕГЭ · Задание 2',
      passage: fillBlank(cfg.textWithMarks),
      prompt:
        'В тексте выделены пять слов. Укажите варианты ответов, в которых лексическое значение выделенного слова соответствует его значению в данном тексте. Запишите номера ответов:',
      options: cfg.t2.options,
      correctAnswer: cfg.t2.correct,
      ruleTitle: 'Лексическое значение слов в микротексте (Задание 2 ЕГЭ)',
      ruleExplanation: cfg.t2.ruleExplanation,
      hint: cfg.t2.hint,
    },
    t3: {
      id: `${cfg.groupId}-t3`,
      type: 'multiple_choice',
      difficulty: diff,
      kimTaskNumber: 3,
      passageGroupId: cfg.groupId,
      topicTag: 'ЕГЭ · Задание 3',
      passage: cleanMarks(fillBlank(cfg.textWithMarks)),
      prompt:
        'Укажите варианты ответов, в которых даны ВЕРНЫЕ характеристики фрагмента текста. Запишите номера этих ответов:',
      options: cfg.t3.options,
      correctAnswer: cfg.t3.correct,
      ruleTitle: 'Стилистический анализ микротекста (Задание 3 ЕГЭ)',
      ruleExplanation: cfg.t3.ruleExplanation,
      hint: cfg.t3.hint,
    },
  };
}

// Сюда будем добавлять новые микротексты (MICRO_3, MICRO_4, MICRO_5...)
const MICRO_BUNDLES: MicroTextBundle[] = [];

export const ege1MicroQuestions: WordInputQuestion[] = MICRO_BUNDLES.map((b) => b.t1);
export const ege2MicroQuestions: MultipleChoiceQuestion[] = MICRO_BUNDLES.map((b) => b.t2);
export const ege3MicroQuestions: MultipleChoiceQuestion[] = MICRO_BUNDLES.map((b) => b.t3);
