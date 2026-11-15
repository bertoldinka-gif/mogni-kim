import { TextClozeQuestion } from '../types/platform';

export type ClozeSlotKind = 'letter' | 'choice' | 'punct';

export interface ClozeSlot {
  index: number;
  kind: ClozeSlotKind;
  expected: string;
  displayNumber?: number;
  options?: string[];
  placeholder?: string;
}

export type WordSegment =
  | { type: 'text'; text: string }
  | { type: 'slot'; slot: ClozeSlot };

export type ParagraphItem =
  | { type: 'space' }
  | { type: 'word'; segments: WordSegment[] }
  | { type: 'punct'; slot: ClozeSlot };

export interface ParsedTextCloze {
  paragraphs: ParagraphItem[][];
  slots: ClozeSlot[];
}

function parseCurlyToken(rawInner: string, index: number): ClozeSlot {
  // Choice pill if contains '|'
  if (rawInner.includes('|')) {
    let labelOverride: string | undefined;
    let optionsPart = rawInner;

    const colonIdx = rawInner.indexOf(':');
    if (colonIdx !== -1) {
      labelOverride = rawInner.slice(0, colonIdx).trim();
      optionsPart = rawInner.slice(colonIdx + 1);
    }

    const rawOptions = optionsPart
      .split('|')
      .map((opt) => opt.trim())
      .filter(Boolean);

    let expected = '';
    const cleanOptions = rawOptions.map((opt) => {
      if (opt.endsWith('*')) {
        const cleaned = opt.slice(0, -1).trim();
        expected = cleaned;
        return cleaned;
      }
      return opt;
    });

    if (!expected && cleanOptions.length > 0) {
      expected = cleanOptions[0];
    }

    let placeholder = labelOverride;
    if (!placeholder) {
      if (cleanOptions.length <= 2 && cleanOptions.every((o) => o.length <= 4)) {
        placeholder = cleanOptions.join('/');
      } else {
        placeholder = 'выбор…';
      }
    }

    return {
      index,
      kind: 'choice',
      expected,
      options: cleanOptions,
      placeholder,
    };
  }

  // Numbered single-letter token for OGE Task 7, e.g. {{(1):и}}
  const numberedMatch = /^\((\d+)\):(.*)$/.exec(rawInner.trim());
  if (numberedMatch) {
    return {
      index,
      kind: 'letter',
      displayNumber: Number(numberedMatch[1]),
      expected: numberedMatch[2].trim(),
    };
  }

  // Single-letter (or empty '') input
  return {
    index,
    kind: 'letter',
    expected: rawInner.trim(),
  };
}

function normalizePunctMark(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '—' || trimmed === '–') return '-';
  return trimmed;
}

export function parseTextClozeMarkup(markupText: string): ParsedTextCloze {
  const slots: ClozeSlot[] = [];
  const rawParagraphs = markupText.split(/\n+/).filter((p) => p.trim().length > 0);

  const paragraphs: ParagraphItem[][] = rawParagraphs.map((para) => {
    const items: ParagraphItem[] = [];
    let currentWordSegments: WordSegment[] = [];

    const flushWord = () => {
      if (currentWordSegments.length > 0) {
        items.push({ type: 'word', segments: currentWordSegments });
        currentWordSegments = [];
      }
    };

    const tokenRegex = /(\{\{[^}]*\}\}|\[\[[^\]]*\]\])/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const pushPlainText = (chunk: string) => {
      // Split preserving whitespace runs so words stay together
      const parts = chunk.split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          flushWord();
          if (items.length > 0 && items[items.length - 1].type !== 'space') {
            items.push({ type: 'space' });
          }
        } else {
          currentWordSegments.push({ type: 'text', text: part });
        }
      }
    };

    while ((match = tokenRegex.exec(para)) !== null) {
      if (match.index > lastIndex) {
        pushPlainText(para.slice(lastIndex, match.index));
      }

      const rawToken = match[0];
      const slotIndex = slots.length;

      if (rawToken.startsWith('{{')) {
        const inner = rawToken.slice(2, -2);
        const slot = parseCurlyToken(inner, slotIndex);
        slots.push(slot);
        currentWordSegments.push({ type: 'slot', slot });
      } else {
        const inner = rawToken.slice(2, -2);
        const slot: ClozeSlot = {
          index: slotIndex,
          kind: 'punct',
          expected: normalizePunctMark(inner),
        };
        slots.push(slot);
        flushWord();
        items.push({ type: 'punct', slot });
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < para.length) {
      pushPlainText(para.slice(lastIndex));
    }

    flushWord();
    return items;
  });

  return { paragraphs, slots };
}

export function getTextClozePlainPreview(markupText: string): string {
  return markupText
    .replace(/\{\{([^}]*)\}\}/g, (_, inner: string) => {
      if (inner.includes('|')) {
        const colonIdx = inner.indexOf(':');
        if (colonIdx !== -1) {
          return `[${inner.slice(0, colonIdx)}]`;
        }
        return '[...]';
      }
      const numMatch = /^\((\d+)\):/.exec(inner.trim());
      if (numMatch) {
        return `(${numMatch[1]})..`;
      }
      return '..';
    })
    .replace(/\[\[[^\]]*\]\]/g, '(_)')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTextClozeAnswersSummary(markupText: string): string {
  const { slots } = parseTextClozeMarkup(markupText);
  return slots
    .map((slot, idx) => {
      const val =
        slot.expected === ''
          ? 'без знака/буквы'
          : slot.expected === '-'
          ? '—'
          : slot.expected;
      const num = slot.displayNumber ?? idx + 1;
      return `${num}) ${val}`;
    })
    .join(' · ');
}

export const textClozeQuestions: TextClozeQuestion[] = [
  {
    id: 'cloze-legend-1',
    type: 'text_cloze',
    difficulty: 'base',
    topicTag: 'Комплексный диктант',
    prompt:
      'Вставьте пропущенные буквы, выберите верное написание слов и расставьте знаки препинания:',
    markupText:
      'Существу{{е}}т стари{{н|нн*}}ая л{{е}}генда. Однажды {{древнегреческий*|древне греческий|древне-греческий}} художник напис{{а}}л {{(не)обычный:необычный*|не обычный}} н{{а}}тюрморт. На п{{о}}лотне были изображены наливные ягоды и спелая гроз{{д}}ь в{{и}}нограда. Пл{{о}}ды бл{{е|и*}}стали на со{{л}}нце [[,]] искрились [[,]] переливались яркими красками [[]] и манили своей свежестью. Когда картину выносят в сад [[,]] птицы слетаются и всматривают{{}}ся в ягоды [[,]] принимая их за настоящие.',
    ruleTitle: 'Орфография и пунктуация в связном тексте',
    ruleExplanation:
      'Существует (I спр.), старинная (основа старин- + суффикс -н-), древнегреческий (из подчинительного словосочетания «Древняя Греция» — слитно), необычный (синоним «удивительный» без противопоставления), блистали (корень -блист- перед суффиксом -а-), солнце (проверочное «солнечный»), всматриваются («что делают?» — без Ь). Перед одиночным союзом «и» между однородными сказуемыми запятая не нужна; придаточное времени и деепричастный оборот обособляются.',
    hint: 'Проверяйте спряжение глаголов, наличие суффикса -а- в корне -блест-/-блист- и границы однородных членов.',
  },
  {
    id: 'cloze-winter-forest-2',
    type: 'text_cloze',
    difficulty: 'base',
    topicTag: 'Комплексный диктант',
    prompt:
      'Заполните все пропуски орфограмм и расставьте знаки препинания в тексте о зимнем утре:',
    markupText:
      'Ранним утром морозный воздух удивительно чист и прохлад{{е}}н. Выр{{о|а*}}стающие вдоль просеки сосны покрыты пушистым ине{{е}}м [[,]] а ветви елей гну{{т*|ть}}ся под тяжестью снега. {{(Не)громкий:негромкий*|не громкий}} хруст веток раздаётся в тишине [[]] и нарушает сонный покой леса. Путники зам{{е|и*}}рают от восторга [[,]] любуясь картиной [[,]] которая откр{{ы}}вается перед ними.',
    ruleTitle: 'Чередующиеся корни, НЕ с прилагательными и пунктуация',
    ruleExplanation:
      'Вырастающие (в корне -раст- перед СТ пишется А), инеем (сущ. на -ей в Т.п.), гнутся (что делают? — без Ь), негромкий (можно заменить синонимом «тихий»), замирают (корень -мир- перед -а-). В первом сложносочинённом предложении запятая перед «а» ставится; перед «и» между однородными сказуемыми («раздаётся и нарушает») запятая не нужна.',
    hint: 'Обратите внимание на корни -раст-/-рос-, -мер-/-мир- и однородные сказуемые.',
  },
  {
    id: 'cloze-pushkin-lyceum-3',
    type: 'text_cloze',
    difficulty: 'hard',
    topicTag: 'Комплексный диктант · ЕГЭ',
    prompt:
      'Выполните комплексный орфографический и пунктуационный разбор текста повышенной сложности:',
    markupText:
      'Царскосельский лицей [[-]] знаменитое учебное заведение [[,]] где воспитывался юный Пушкин. {{В течение*|В течении}} шести лет будущий поэт создал десятки стихотворений [[,]] {{несмотря на*|не смотря на}} строгий распорядок дня. Дружба лицеистов оказалась на удивление крепкой [[:]] они поддерживали друг друга на протяжении всей жизни. Лицейское братство было {{(не)случайным:неслучайным|не случайным*}} явлением [[,]] а настоящей духовной опорой.',
    ruleTitle: 'Трудные случаи ЕГЭ: производные предлоги, НЕ и БСП',
    ruleExplanation:
      'Лицей — заведение (тире между подлежащим и сказуемым-существительными). «В течение» (производный предлог времени с -е на конце), «несмотря на» (уступительный предлог пишется слитно). После слова «крепкой» ставится двоеточие, так как вторая часть БСП поясняет первую. «Не случайным явлением, а...» — при наличии противопоставления с союзом «а» НЕ с прилагательным пишется раздельно.',
    hint: 'Обратите внимание на производные предлоги и на союз «а» в последнем предложении.',
  },
];
