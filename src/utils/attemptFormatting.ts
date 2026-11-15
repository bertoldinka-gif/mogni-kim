import {
  EgeTask14SpellingForm,
  PlatformQuestion,
  SyntacticRole,
} from '../types/platform';

const SYNTACTIC_ROLE_LABELS: Record<SyntacticRole, string> = {
  none: 'служебное / не член',
  subject: 'подлежащее',
  predicate: 'сказуемое',
  attribute: 'определение',
  object: 'дополнение',
  adverbial: 'обстоятельство',
};

const FORM_LABELS: Record<EgeTask14SpellingForm, string> = {
  solid: 'слитно',
  separate: 'раздельно',
  hyphen: 'через дефис',
};

function cleanBlank(val: string | undefined | null): string {
  const trimmed = (val ?? '').trim();
  return trimmed.length > 0 ? trimmed : '∅';
}

function normalizeDigitsDisplay(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}

/**
 * Parses TextCloze markup into readable text plus ordered blanks list.
 */
function parseTextClozeForDisplay(markupText: string): {
  readableText: string;
  expectedBlanks: string[];
} {
  const tokenRegex = /(\{\{[^}]+\}\}|\[\[[^\]]*\]\])/g;
  const expectedBlanks: string[] = [];
  let idx = 0;
  const readableText = markupText.replace(tokenRegex, (token) => {
    idx += 1;
    if (token.startsWith('{{') && token.endsWith('}}')) {
      const inner = token.slice(2, -2);
      if (inner.includes('|')) {
        const colonIdx = inner.indexOf(':');
        const optionsRaw = colonIdx !== -1 ? inner.slice(colonIdx + 1) : inner;
        const parts = optionsRaw.split('|');
        const correctOpt =
          parts.find((p) => p.trim().endsWith('*'))?.replace(/\*$/, '').trim() ??
          parts[0]?.trim() ??
          '';
        expectedBlanks.push(correctOpt);
        return `(${idx}: ${parts.map((p) => p.replace(/\*$/, '').trim()).join(' / ')})`;
      }
      const colonIdx = inner.indexOf(':');
      if (colonIdx !== -1) {
        const label = inner.slice(0, colonIdx).trim();
        const expected = inner.slice(colonIdx + 1).trim();
        expectedBlanks.push(expected);
        return `${label}[...]`;
      }
      expectedBlanks.push(inner.trim());
      return '[...]';
    }
    const punct = token.slice(2, -2).trim();
    expectedBlanks.push(punct);
    return '[знак]';
  });

  return { readableText, expectedBlanks };
}

/**
 * Computes human-readable `correctAnswer` for any PlatformQuestion,
 * safe both at answer-capture time and as a fallback for legacy history entries.
 */
export function formatCorrectAnswer(question: PlatformQuestion): string {
  switch (question.type) {
    case 'single_choice': {
      const idx =
        typeof question.correctAnswer === 'number'
          ? question.correctAnswer
          : question.correctAnswer[0] ?? 0;
      const optText = question.options[idx];
      return optText ? `${idx + 1}. ${optText}` : String(idx + 1);
    }

    case 'multiple_choice': {
      const indices = Array.isArray(question.correctAnswer)
        ? [...question.correctAnswer].sort((a, b) => a - b)
        : [question.correctAnswer];
      if (indices.length === 0) return '—';
      const digits = indices.map((i) => i + 1).join('');
      const labels = indices
        .map((i) => {
          const text = question.options[i];
          return text ? `${i + 1}) ${text}` : String(i + 1);
        })
        .join('; ');
      return question.options.length <= 5 ? `${digits} (${labels})` : labels;
    }

    case 'fill_letter': {
      const resolved = question.targetWord.includes('..')
        ? question.targetWord.replace('..', question.correctAnswer)
        : question.correctAnswer;
      return `${question.correctAnswer.toUpperCase()} (${resolved})`;
    }

    case 'word_input': {
      return question.displayAnswer || question.acceptedAnswers.join(' / ');
    }

    case 'punctuation_input': {
      if (question.expectedDigits) {
        return question.expectedDigits;
      }
      const marks = question.expectedMarks ?? [];
      return marks.length > 0 ? marks.map((m) => cleanBlank(m)).join(' | ') : '—';
    }

    case 'ege_row_spelling': {
      const digits = [...question.correctRows].sort((a, b) => a - b).join('');
      const letters = question.rows
        .map((r) => `${r.rowNumber}: ${r.words.map((w) => cleanBlank(w.expectedLetter)).join(', ')}`)
        .join(' · ');
      return `${digits} (${letters})`;
    }

    case 'ege_task14': {
      const digits = [...question.correctRows].sort((a, b) => a - b).join('');
      const pairs = question.rows
        .filter((r) => question.correctRows.includes(r.rowNumber))
        .map((r) => `${r.rowNumber}) ${r.words.map((w) => w.canonicalWord).join(', ')}`)
        .join('; ');
      return pairs ? `${digits} (${pairs})` : digits;
    }

    case 'ege_task15': {
      const digits = [...question.correctSlots].sort((a, b) => a - b).join('');
      const slotDesc = question.slots
        .map((s) => `(${s.slotNumber}) ${s.expected.toUpperCase()}`)
        .join(', ');
      return `${digits} (${slotDesc})`;
    }

    case 'phraseology_highlight': {
      return question.targetPhrase;
    }

    case 'matching': {
      return question.leftItems
        .map((item) => `${item.key}-${question.correctMapping[item.key] ?? '?'}`)
        .join(', ');
    }

    case 'text_cloze': {
      if (question.expectedDigits) {
        return question.expectedDigits;
      }
      const { expectedBlanks } = parseTextClozeForDisplay(question.markupText);
      return expectedBlanks.length > 0
        ? expectedBlanks.map((b) => cleanBlank(b)).join(' | ')
        : '—';
    }

    case 'parsing': {
      if (question.mode === 'phonetic') {
        const lettersPart = question.missingLetter
          ? `буква «${question.missingLetter}», `
          : '';
        return `${lettersPart}${question.expectedSyllableDivision} (${question.expectedSyllableCount} сл., ${question.expectedLetterCount} б., ${question.expectedSoundCount} зв.)`;
      }
      if (question.mode === 'morphological') {
        return `${question.expectedPos}, н.ф. «${question.expectedBaseForm}» (${question.expectedQuestions[0] ?? ''})`;
      }
      const rolesSummary = question.tokens
        .filter((t) => t.expectedRole !== 'none')
        .map((t) => `${t.word} (${SYNTACTIC_ROLE_LABELS[t.expectedRole]})`)
        .join(', ');
      const charsSummary = question.expectedCharacteristics.join(', ');
      return [rolesSummary, charsSummary].filter(Boolean).join(' · ') || '—';
    }

    case 'open_essay': {
      return `Сочинение / изложение проверено AI-экспертом (от ${question.minWords} слов)`;
    }
  }
}

/**
 * Formats both the student's submitted answer and the canonical correct answer
 * into clean human-readable strings for AttemptHistory.
 */
export function formatAttemptAnswers(
  question: PlatformQuestion,
  userState: unknown
): { userAnswer: string; correctAnswer: string } {
  const correctAnswer = formatCorrectAnswer(question);
  const state = (userState && typeof userState === 'object'
    ? userState
    : null) as Record<string, unknown> | null;

  if (!state) {
    return { userAnswer: '—', correctAnswer };
  }

  switch (question.type) {
    case 'single_choice':
    case 'multiple_choice': {
      const indices = Array.isArray(state.selectedIndices)
        ? state.selectedIndices
            .filter((n): n is number => typeof n === 'number')
            .sort((a, b) => a - b)
        : [];
      if (indices.length === 0) {
        return { userAnswer: 'Не выбран', correctAnswer };
      }
      if (question.type === 'single_choice') {
        const i = indices[0];
        const txt = question.options[i];
        return {
          userAnswer: txt ? `${i + 1}. ${txt}` : String(i + 1),
          correctAnswer,
        };
      }
      const digits = indices.map((i) => i + 1).join('');
      const labels = indices
        .map((i) => {
          const text = question.options[i];
          return text ? `${i + 1}) ${text}` : String(i + 1);
        })
        .join('; ');
      return {
        userAnswer: question.options.length <= 5 ? `${digits} (${labels})` : labels,
        correctAnswer,
      };
    }

    case 'fill_letter': {
      const chosen = typeof state.selectedOption === 'string' ? state.selectedOption : '';
      if (!chosen) return { userAnswer: '—', correctAnswer };
      const resolved = question.targetWord.includes('..')
        ? question.targetWord.replace('..', chosen)
        : chosen;
      return {
        userAnswer: `${chosen.toUpperCase()} (${resolved})`,
        correctAnswer,
      };
    }

    case 'word_input': {
      const ans = typeof state.answer === 'string' ? state.answer.trim() : '';
      return {
        userAnswer: ans || '—',
        correctAnswer,
      };
    }

    case 'punctuation_input': {
      if (question.expectedDigits) {
        const digits =
          typeof state.digitsInput === 'string'
            ? normalizeDigitsDisplay(state.digitsInput)
            : '';
        return {
          userAnswer: digits || '—',
          correctAnswer,
        };
      }
      const vals = Array.isArray(state.values)
        ? state.values.map((v) => cleanBlank(typeof v === 'string' ? v : ''))
        : [];
      return {
        userAnswer: vals.length > 0 ? vals.join(' | ') : '—',
        correctAnswer,
      };
    }

    case 'ege_row_spelling': {
      const answerInput =
        typeof state.answerInput === 'string' ? normalizeDigitsDisplay(state.answerInput) : '';
      const letterValues = Array.isArray(state.letterValues)
        ? state.letterValues.map((v) => (typeof v === 'string' ? v : ''))
        : [];
      let cursor = 0;
      const rowLetters = question.rows
        .map((r) => {
          const letters = r.words.map(() => cleanBlank(letterValues[cursor++]));
          return `${r.rowNumber}: ${letters.join(', ')}`;
        })
        .join(' · ');
      return {
        userAnswer: answerInput
          ? `${answerInput}${rowLetters ? ` (${rowLetters})` : ''}`
          : rowLetters || '—',
        correctAnswer,
      };
    }

    case 'ege_task14': {
      const answerInput =
        typeof state.answerInput === 'string' ? normalizeDigitsDisplay(state.answerInput) : '';
      const selectedForms =
        state.selectedForms && typeof state.selectedForms === 'object'
          ? (state.selectedForms as Record<string, EgeTask14SpellingForm>)
          : {};
      const selectedRowDetails = Object.entries(selectedForms)
        .slice(0, 6)
        .map(([key, form]) => `${key}: ${FORM_LABELS[form] ?? form}`);
      const suffix =
        selectedRowDetails.length > 0 ? ` (${selectedRowDetails.join('; ')})` : '';
      return {
        userAnswer: answerInput ? `${answerInput}${suffix}` : '—',
        correctAnswer,
      };
    }

    case 'ege_task15': {
      const digitsInput =
        typeof state.digitsInput === 'string' ? normalizeDigitsDisplay(state.digitsInput) : '';
      const slotValues =
        state.slotValues && typeof state.slotValues === 'object'
          ? (state.slotValues as Record<number, string>)
          : {};
      const slotsStr = question.slots
        .map((s) => `(${s.slotNumber}) ${cleanBlank(slotValues[s.slotNumber]).toUpperCase()}`)
        .join(', ');
      return {
        userAnswer: digitsInput
          ? `${digitsInput}${slotsStr ? ` (${slotsStr})` : ''}`
          : slotsStr || '—',
        correctAnswer,
      };
    }

    case 'phraseology_highlight': {
      const indices = Array.isArray(state.selectedIndices)
        ? state.selectedIndices
            .filter((n): n is number => typeof n === 'number')
            .sort((a, b) => a - b)
        : [];
      if (indices.length === 0) return { userAnswer: '—', correctAnswer };
      const words = question.paragraph.trim().split(/\s+/);
      const picked = indices
        .map((i) => words[i] ?? '')
        .filter(Boolean)
        .join(' ');
      return {
        userAnswer: picked || '—',
        correctAnswer,
      };
    }

    case 'matching': {
      const mapping =
        state.selectedMapping && typeof state.selectedMapping === 'object'
          ? (state.selectedMapping as Record<string, number | ''>)
          : {};
      const text = question.leftItems
        .map((item) => `${item.key}-${mapping[item.key] || '?'}`)
        .join(', ');
      return {
        userAnswer: text || '—',
        correctAnswer,
      };
    }

    case 'text_cloze': {
      if (question.expectedDigits) {
        const digits =
          typeof state.digitsInput === 'string'
            ? normalizeDigitsDisplay(state.digitsInput)
            : '';
        return {
          userAnswer: digits || '—',
          correctAnswer,
        };
      }
      const vals = Array.isArray(state.values)
        ? state.values.map((v) => cleanBlank(typeof v === 'string' ? v : ''))
        : [];
      return {
        userAnswer: vals.length > 0 ? vals.join(' | ') : '—',
        correctAnswer,
      };
    }

    case 'parsing': {
      if (question.mode === 'phonetic') {
        const missing =
          typeof state.missingLetterVal === 'string' && state.missingLetterVal.trim()
            ? `буква «${state.missingLetterVal.trim()}», `
            : '';
        const div =
          typeof state.syllableDivisionVal === 'string' && state.syllableDivisionVal.trim()
            ? state.syllableDivisionVal.trim()
            : '—';
        const syl =
          typeof state.syllableCountVal === 'string' && state.syllableCountVal.trim()
            ? state.syllableCountVal.trim()
            : '?';
        const letC =
          typeof state.totalLettersVal === 'string' && state.totalLettersVal.trim()
            ? state.totalLettersVal.trim()
            : '?';
        const sndC =
          typeof state.totalSoundsVal === 'string' && state.totalSoundsVal.trim()
            ? state.totalSoundsVal.trim()
            : '?';
        return {
          userAnswer: `${missing}${div} (${syl} сл., ${letC} б., ${sndC} зв.)`,
          correctAnswer,
        };
      }
      if (question.mode === 'morphological') {
        const pos =
          typeof state.selectedPos === 'string' && state.selectedPos
            ? state.selectedPos
            : 'часть речи не выбрана';
        const base =
          typeof state.morphBaseFormInput === 'string' && state.morphBaseFormInput.trim()
            ? `, н.ф. «${state.morphBaseFormInput.trim()}»`
            : '';
        const q =
          typeof state.morphQuestionInput === 'string' && state.morphQuestionInput.trim()
            ? ` (${state.morphQuestionInput.trim()})`
            : '';
        return {
          userAnswer: `${pos}${base}${q}`,
          correctAnswer,
        };
      }
      const roles = Array.isArray(state.tokenRoles)
        ? (state.tokenRoles as SyntacticRole[])
        : [];
      const rolesSummary = question.tokens
        .map((t, idx) => {
          const role = roles[idx] ?? 'none';
          return role !== 'none'
            ? `${t.word} (${SYNTACTIC_ROLE_LABELS[role] ?? role})`
            : null;
        })
        .filter((x): x is string => Boolean(x))
        .join(', ');
      const chars = Array.isArray(state.selectedCharacteristics)
        ? (state.selectedCharacteristics as string[]).join(', ')
        : '';
      return {
        userAnswer: [rolesSummary, chars].filter(Boolean).join(' · ') || '—',
        correctAnswer,
      };
    }

    case 'open_essay': {
      const essayText = typeof state.essayText === 'string' ? state.essayText.trim() : '';
      const words = essayText
        ? essayText.split(/\s+/).filter((t) => /[а-яА-ЯёЁa-zA-Z0-9]/.test(t)).length
        : 0;
      const report =
        state.gradingReport && typeof state.gradingReport === 'object'
          ? (state.gradingReport as {
              totalScore?: number;
              maxTotalScore?: number;
              isPassFail?: boolean;
              overallPassed?: boolean;
            })
          : null;
      const scorePart = report?.isPassFail
        ? ` · ${report.overallPassed ? 'ИТОГ: ЗАЧЁТ' : 'ИТОГ: НЕЗАЧЁТ'}`
        : report &&
          typeof report.totalScore === 'number' &&
          typeof report.maxTotalScore === 'number'
        ? ` · Оценка: ${report.totalScore}/${report.maxTotalScore}`
        : '';
      return {
        userAnswer: `Текст (${words} сл.)${scorePart}`,
        correctAnswer,
      };
    }
  }
}

export interface HistoryQuestionBody {
  prompt: string;
  passageText?: string;
  bodyText?: string;
  optionsList?: string[];
}

/**
 * Extracts full readable question details for the AttemptHistory expandable review drawer.
 */
export function formatQuestionBodyForHistory(
  question: PlatformQuestion
): HistoryQuestionBody {
  switch (question.type) {
    case 'single_choice':
    case 'multiple_choice':
      return {
        prompt: question.prompt,
        passageText: question.passage || question.contextText,
        optionsList: question.options.map((opt, idx) =>
          question.optionQuotes?.[idx]
            ? `${idx + 1}) ${opt} — «${question.optionQuotes[idx]}»`
            : `${idx + 1}) ${opt}`
        ),
      };

    case 'fill_letter':
      return {
        prompt: 'Вставьте пропущенную букву в слове:',
        bodyText: `${question.targetWord} — ${question.sentence}`,
        optionsList: question.options.map((opt, idx) => `${idx + 1}) ${opt}`),
      };

    case 'word_input':
      return {
        prompt: question.prompt,
        passageText: question.passage,
        bodyText: question.sentence,
      };

    case 'punctuation_input':
      return {
        prompt: question.prompt,
        bodyText: question.sentenceTemplate.replace(/\[_\]/g, '[_]'),
      };

    case 'ege_row_spelling':
      return {
        prompt:
          question.prompt ||
          'Укажите варианты ответов, в которых во всех словах одного ряда пропущена одна и та же буква:',
        optionsList: question.rows.map(
          (r) => `${r.rowNumber}) ${r.words.map((w) => w.template).join(', ')}`
        ),
      };

    case 'ege_task14':
      return {
        prompt: question.prompt,
        optionsList: question.rows.map((r) => {
          let line = r.sentenceTemplate;
          r.words.forEach((w, i) => {
            line = line.replace(`{${i}}`, w.cue);
          });
          return `${r.rowNumber}) ${line}`;
        }),
      };

    case 'ege_task15':
      return {
        prompt: question.prompt,
        bodyText: question.sentenceTemplate.replace(/\{(\d+)\}/g, '($1)[н/нн]'),
      };

    case 'phraseology_highlight':
      return {
        prompt: question.prompt,
        bodyText: question.paragraph,
      };

    case 'matching':
      return {
        prompt: question.prompt,
        optionsList: [
          ...question.leftItems.map((l) => `${l.key}) ${l.text}`),
          ...question.rightItems.map((r) => `${r.number}) ${r.text}`),
        ],
      };

    case 'text_cloze': {
      const { readableText } = parseTextClozeForDisplay(question.markupText);
      return {
        prompt: question.prompt,
        bodyText: readableText,
      };
    }

    case 'parsing':
      if (question.mode === 'phonetic') {
        return {
          prompt: question.prompt,
          bodyText: `Слово для разбора: ${question.displayWord}`,
        };
      }
      if (question.mode === 'morphological') {
        return {
          prompt: question.prompt,
          bodyText: `${question.sentence} (слово: ${question.targetWord})`,
        };
      }
      return {
        prompt: question.prompt,
        bodyText: question.sentence,
      };

    case 'open_essay':
      return {
        prompt: question.prompt,
        passageText: question.sourceText,
      };
  }
}
