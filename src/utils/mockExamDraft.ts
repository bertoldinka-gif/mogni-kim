import type { PlatformQuestion } from '../types/platform';

export interface MockExamDraftSavedState {
  isCorrect: boolean;
  userState: unknown;
  mentorQuote?: string | null;
}

export interface MockExamDraft {
  version: 2;
  /** Точные id вопросов варианта в исходном порядке. */
  questionIds: string[];
  total: number;
  finished: false;
  currentIndex: number;
  correctCount: number;
  wrongCount: number;
  comboStreak: number;
  netXpDelta: number;
  elapsedSeconds: number;
  /** Результаты по questionId, а не по индексу. */
  resultsByQuestionId: Record<string, boolean | null>;
  /** Проверенные состояния по questionId. */
  savedStatesByQuestionId: Record<string, MockExamDraftSavedState>;
  /** Черновики непроверенных ответов по questionId. */
  draftStatesByQuestionId: Record<string, unknown>;
  /** Множество questionId, на которые уже был дан ответ. */
  answeredQuestionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export function draftStorageKey(userId: string | undefined, sessionId: string): string {
  return `mogni_mock_draft_${userId ?? 'guest'}_${sessionId}`;
}

export function loadDraft(
  userId: string | undefined,
  sessionId: string
): MockExamDraft | null {
  try {
    const raw = localStorage.getItem(draftStorageKey(userId, sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MockExamDraft>;
    if (!parsed || !Array.isArray(parsed.questionIds) || parsed.questionIds.length === 0) {
      return null;
    }
    return {
      version: 2,
      questionIds: parsed.questionIds.filter((x): x is string => typeof x === 'string'),
      total: typeof parsed.total === 'number' ? parsed.total : parsed.questionIds.length,
      finished: false,
      currentIndex: typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0,
      correctCount: typeof parsed.correctCount === 'number' ? parsed.correctCount : 0,
      wrongCount: typeof parsed.wrongCount === 'number' ? parsed.wrongCount : 0,
      comboStreak: typeof parsed.comboStreak === 'number' ? parsed.comboStreak : 0,
      netXpDelta: typeof parsed.netXpDelta === 'number' ? parsed.netXpDelta : 0,
      elapsedSeconds: typeof parsed.elapsedSeconds === 'number' ? parsed.elapsedSeconds : 0,
      resultsByQuestionId:
        parsed.resultsByQuestionId && typeof parsed.resultsByQuestionId === 'object'
          ? parsed.resultsByQuestionId
          : {},
      savedStatesByQuestionId:
        parsed.savedStatesByQuestionId && typeof parsed.savedStatesByQuestionId === 'object'
          ? parsed.savedStatesByQuestionId
          : {},
      draftStatesByQuestionId:
        parsed.draftStatesByQuestionId && typeof parsed.draftStatesByQuestionId === 'object'
          ? parsed.draftStatesByQuestionId
          : {},
      answeredQuestionIds: Array.isArray(parsed.answeredQuestionIds)
        ? parsed.answeredQuestionIds.filter((x): x is string => typeof x === 'string')
        : [],
      createdAt: parsed.createdAt || new Date().toISOString(),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveDraft(
  userId: string | undefined,
  sessionId: string,
  draft: MockExamDraft
): MockExamDraft {
  const next: MockExamDraft = { ...draft, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(draftStorageKey(userId, sessionId), JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
  return next;
}

export function clearDraft(userId: string | undefined, sessionId: string): void {
  try {
    localStorage.removeItem(draftStorageKey(userId, sessionId));
  } catch {
    // ignore
  }
}

/** Пересобирает вопросы строго по questionIds из черновика. */
export function rebuildQuestionsByIds(
  ids: string[],
  questionPool: PlatformQuestion[]
): { questions: PlatformQuestion[]; missing: string[] } {
  const index = new Map<string, PlatformQuestion>();
  for (const q of questionPool) index.set(q.id, q);
  const questions: PlatformQuestion[] = [];
  const missing: string[] = [];
  for (const id of ids) {
    const q = index.get(id);
    if (q) questions.push(q);
    else missing.push(id);
  }
  return { questions, missing };
}
