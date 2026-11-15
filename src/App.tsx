import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import {
  ActiveNavSection,
  AttemptGradeLevel,
  AttemptRecord,
  BlitzModeId,
  CategoryStatsMap,
  DailyChallengeState,
  DifficultyLevel,
  EgeCategoryTab,
  GradeLevel,
  MistakeItem,
  MockExamRecord,
  OpenEssayKind,
  OpenEssayQuestion,
  PlatformQuestion,
  SavedEssayRecord,
  SprintModule,
  TaskModule,
  UserProfile,
} from './types/platform';
import {
  GRADE_LABELS,
  buildMockTestQuestions,
  filterQuestionsByDifficulty,
  getAnalyticsCategoryTarget,
  getModuleTargetForKimTask,
  getModulesForGrade,
  resolveAnalyticsCategoryKey,
  shuffleQuestions,
} from './data/curriculum';
import { getMentorById } from './data/petsData';
import { DEFAULT_THEME_ID } from './data/themesData';
import { getTextClozePlainPreview } from './data/textClozeData';
import { formatAttemptAnswers } from './utils/attemptFormatting';
import {
  HINT_COST,
  appendAttemptHistory,
  appendMockExamRecord,
  awardRedemptionXp,
  claimDailyChallengeReward,
  deductHintXp,
  deleteSavedEssay,
  equipTitle,
  getActiveUser,
  getCategoryStats,
  getDailyChallenge,
  getDyslexiaMode,
  getMistakes,
  incrementMistakeCorrectStreak,
  logoutUser,
  markModuleCompleted,
  markQuestionsSolved,
  recordAnswerStats,
  recordBlitzDuelOutcome,
  recordCategoryAttempt,
  recordMistake,
  removeMistakeAsLearned,
  resetSolvedQuestionsForPool,
  saveEssayDraft,
  saveEssayToArchive,
  setDyslexiaMode as persistDyslexiaMode,
  updateDailyChallengeOnAnswer,
  updateDailyChallengeOnMistakeLearned,
  updateUserGrade,
} from './utils/storage';
import { AuthScreen, checkAndConsumeInviteFromUrl } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { LogoMark } from './components/LogoMark';
import { DashboardView } from './components/DashboardView';
import { SprintsView } from './components/SprintsView';
import { CurriculumView } from './components/CurriculumView';
import { MistakeFolderView } from './components/MistakeFolderView';
import { AttemptHistory } from './components/AttemptHistory';
import { MockExamJournal } from './components/MockExamJournal';
import { SavedEssaysArchive } from './components/SavedEssaysArchive';
import { MentorBlitzDuel } from './components/MentorBlitzDuel';
import { Shop } from './components/Shop';
import { MentorRuleChat } from './components/MentorRuleChat';
import { ActiveSessionConfig, TrainerSession } from './components/TrainerSession';

function truncatePreview(text: string, maxLen = 150): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trimEnd()}…`;
}

function buildQuestionPreviewText(q: PlatformQuestion): string {
  if (q.type === 'fill_letter') {
    return truncatePreview(q.sentence || q.targetWord);
  }
  if (q.type === 'punctuation_input') {
    if (q.expectedDigits !== undefined) {
      return truncatePreview(q.sentenceTemplate);
    }
    let idx = 0;
    return truncatePreview(q.sentenceTemplate.replace(/\[_\]/g, () => `(${++idx})`));
  }
  if (q.type === 'text_cloze') {
    return truncatePreview(getTextClozePlainPreview(q.markupText));
  }
  if (q.type === 'parsing') {
    if (q.mode === 'phonetic') {
      return truncatePreview(`Фонетический разбор: «${q.fullWord}»`);
    }
    if (q.mode === 'morphological') {
      return truncatePreview(`Морфологический разбор «${q.targetWord}»: ${q.sentence}`);
    }
    return truncatePreview(`Синтаксический разбор: ${q.sentence}`);
  }
  if (q.type === 'ege_row_spelling') {
    return truncatePreview(
      q.rows
        .map((r) => `${r.rowNumber}) ${r.words.map((w) => w.template).join(', ')}`)
        .join(' · ')
    );
  }
  if (q.type === 'ege_task14') {
    return truncatePreview(
      q.rows
        .map((r) => `${r.rowNumber}) ${r.words.map((w) => w.cue).join(', ')}`)
        .join(' · ')
    );
  }
  if (q.type === 'ege_task15') {
    const preview = q.sentenceTemplate.replace(/\{(\d+)\}/g, '($1)[н/нн]');
    return truncatePreview(preview);
  }
  if (q.type === 'word_input') {
    return truncatePreview(q.sentence ? `${q.prompt} «${q.sentence}»` : q.prompt);
  }
  if (q.type === 'phraseology_highlight') {
    return truncatePreview(`${q.prompt} ${q.paragraph}`);
  }
  if (q.type === 'matching') {
    const sample = q.leftItems
      .slice(0, 2)
      .map((i) => `${i.key}: ${i.text}`)
      .join('; ');
    return truncatePreview(`${q.prompt} (${sample})`);
  }
  if (q.type === 'open_essay') {
    return truncatePreview(q.prompt);
  }
  return truncatePreview(q.contextText ? `${q.prompt} ${q.contextText}` : q.prompt);
}

function resolveAttemptGradeLevel(
  sourceId: string,
  userGrade: GradeLevel,
  question: PlatformQuestion,
  overrideGrade?: AttemptGradeLevel
): AttemptGradeLevel {
  if (overrideGrade) return overrideGrade;
  const tag = question.topicTag || '';
  if (sourceId.startsWith('ege-') || sourceId === 'mock-ege' || tag.startsWith('ЕГЭ')) {
    return 'ege';
  }
  if (sourceId.startsWith('oge-') || sourceId === 'mock-oge' || tag.startsWith('ОГЭ')) {
    return 'oge';
  }
  if (userGrade === 'grades_2_4') return 'grade2_4';
  if (userGrade === 'grades_5_6') return 'grade5_6';
  if (userGrade === 'grades_7_8') return 'grade7_8';
  if (userGrade === 'oge') return 'oge';
  return 'ege';
}

function resolveAttemptModuleTitle(
  sourceId: string,
  sourceTitle: string,
  question: PlatformQuestion
): string {
  if (sourceId.startsWith('sprint-') || sourceId.startsWith('history-')) {
    return sourceTitle;
  }
  return question.topicTag || sourceTitle;
}

function getRankTier(xp: number): number {
  if (xp < 200) return 0;
  if (xp < 500) return 1;
  if (xp < 1000) return 2;
  return 3;
}

const AI_EXAM_TO_ESSAY_KIND: Record<SavedEssayRecord['examType'], OpenEssayKind> = {
  OGE_SUMMARY: 'oge_summary',
  OGE_ESSAY: 'oge_essay',
  EGE_ESSAY: 'ege_essay',
  FINAL_ESSAY: 'final_essay',
};

const ESSAY_MIN_WORDS: Record<OpenEssayKind, number> = {
  oge_summary: 70,
  oge_essay: 70,
  ege_essay: 150,
  final_essay: 250,
};

function resolveOpenEssayQuestionForArchive(
  record: SavedEssayRecord
): OpenEssayQuestion {
  const modules = [...getModulesForGrade('oge'), ...getModulesForGrade('ege')];
  for (const mod of modules) {
    for (const q of mod.questions) {
      if (q.type === 'open_essay' && q.id === record.questionId) {
        return q;
      }
    }
  }

  const essayKind = AI_EXAM_TO_ESSAY_KIND[record.examType];
  return {
    id: record.questionId,
    type: 'open_essay',
    essayKind,
    topicTag: 'Мои сочинения',
    prompt: record.promptTitle,
    sourceText: record.sourceText,
    minWords: ESSAY_MIN_WORDS[essayKind],
    hasAudio: essayKind === 'oge_summary',
    criteriaText: 'Официальные критерии ФИПИ',
    hint: 'Следите за чётким абзацным членением, логикой рассуждения и соблюдением минимального объёма слов.',
    ruleTitle: 'Работа с текстом и сочинение',
    ruleExplanation:
      'Проверьте соблюдение объёма, аргументации и речевых норм в соответствии с критериями ФИПИ.',
  };
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => getActiveUser());
  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => {
    const active = getActiveUser();
    return active ? getMistakes(active.nickname) : [];
  });
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeState | null>(() => {
    const active = getActiveUser();
    return active ? getDailyChallenge(active.nickname) : null;
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStatsMap | null>(() => {
    const active = getActiveUser();
    return active ? getCategoryStats(active.nickname) : null;
  });
  const [activeSection, setActiveSection] = useState<ActiveNavSection>('dashboard');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('base');
  const [activeEgeTab, setActiveEgeTab] = useState<EgeCategoryTab>(() => {
    try {
      const saved = localStorage.getItem('mogni_kim_ege_tab');
      if (
        saved === 'speech_culture' ||
        saved === 'spelling' ||
        saved === 'punctuation' ||
        saved === 'text_essay'
      ) {
        return saved;
      }
    } catch {
      // ignore storage read errors
    }
    return 'speech_culture';
  });
  const [activeSession, setActiveSession] = useState<ActiveSessionConfig | null>(null);
  const [activeBlitzMode, setActiveBlitzMode] = useState<BlitzModeId | null>(null);
  const [sessionNonce, setSessionNonce] = useState(0);
  const [restartAction, setRestartAction] = useState<(() => void) | undefined>(
    undefined
  );
  const [subtopicAction, setSubtopicAction] = useState<
    ((subtopic: string | null) => void) | undefined
  >(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dyslexiaMode, setDyslexiaMode] = useState<boolean>(() => getDyslexiaMode());
  const [recentLevelUp, setRecentLevelUp] = useState(false);
  const prevUserSnapshotRef = useRef<{ nickname: string; xp: number } | null>(
    user ? { nickname: user.nickname, xp: user.xp } : null
  );

  useEffect(() => {
    checkAndConsumeInviteFromUrl();
  }, []);

  useEffect(() => {
    const themeId = user?.activeTheme || DEFAULT_THEME_ID;
    document.documentElement.setAttribute('data-theme', themeId);
  }, [user?.activeTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dyslexia-mode', dyslexiaMode);
  }, [dyslexiaMode]);

  const handleToggleDyslexiaMode = () => {
    setDyslexiaMode((prev) => {
      const next = !prev;
      persistDyslexiaMode(next);
      return next;
    });
  };

  useEffect(() => {
    if (!user) {
      prevUserSnapshotRef.current = null;
      setRecentLevelUp(false);
      return;
    }

    const prev = prevUserSnapshotRef.current;
    if (prev && prev.nickname === user.nickname) {
      if (getRankTier(user.xp) > getRankTier(prev.xp)) {
        setRecentLevelUp(true);
      }
    } else {
      setRecentLevelUp(false);
    }

    prevUserSnapshotRef.current = { nickname: user.nickname, xp: user.xp };
  }, [user?.nickname, user?.xp]);

  useEffect(() => {
    if (recentLevelUp && activeSection === 'dashboard' && !activeSession) {
      const timer = window.setTimeout(() => setRecentLevelUp(false), 2600);
      return () => window.clearTimeout(timer);
    }
  }, [recentLevelUp, activeSection, activeSession]);

  useEffect(() => {
    if (user) {
      setMistakes(getMistakes(user.nickname));
      setDailyChallenge(getDailyChallenge(user.nickname));
      setCategoryStats(getCategoryStats(user.nickname));
    } else {
      setMistakes([]);
      setDailyChallenge(null);
      setCategoryStats(null);
    }
  }, [user?.nickname]);

  const handleAuthenticated = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    setMistakes(getMistakes(loggedUser.nickname));
    setDailyChallenge(getDailyChallenge(loggedUser.nickname));
    setCategoryStats(getCategoryStats(loggedUser.nickname));
    setActiveSection('dashboard');
    setActiveSession(null);
    setActiveBlitzMode(null);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setMistakes([]);
    setActiveSession(null);
    setActiveBlitzMode(null);
  };

  const handleEgeTabChange = (tab: EgeCategoryTab) => {
    setActiveEgeTab(tab);
    try {
      localStorage.setItem('mogni_kim_ege_tab', tab);
    } catch {
      // ignore storage write errors
    }
  };

  const handleGradeChange = (grade: GradeLevel) => {
    if (!user) return;
    const updated = updateUserGrade(user, grade);
    setUser(updated);
    setActiveSession(null);
    setActiveBlitzMode(null);
    handleEgeTabChange('speech_culture');
    if (activeSection === 'mock_test' && grade !== 'oge' && grade !== 'ege') {
      setActiveSection('dashboard');
    }
  };

  const handleTitleChange = (title: string) => {
    if (!user) return;
    setUser(equipTitle(user, title));
  };

  const selectUnseenBatch = (
    pool: PlatformQuestion[],
    batchSize: number,
    currentUser: UserProfile
  ): {
    questions: PlatformQuestion[];
    cycleResetNotice: boolean;
    updatedUser: UserProfile;
  } => {
    if (pool.length === 0) {
      return {
        questions: [],
        cycleResetNotice: false,
        updatedUser: currentUser,
      };
    }

    const solvedSet = new Set(currentUser.solvedQuestionIds ?? []);
    const unsolvedPool = pool.filter((q) => !solvedSet.has(q.id));

    if (unsolvedPool.length === 0) {
      const updatedUser = resetSolvedQuestionsForPool(
        currentUser,
        pool.map((q) => q.id)
      );
      return {
        questions: shuffleQuestions(pool).slice(0, batchSize),
        cycleResetNotice: true,
        updatedUser,
      };
    }

    return {
      questions: shuffleQuestions(unsolvedPool).slice(0, batchSize),
      cycleResetNotice: false,
      updatedUser: currentUser,
    };
  };

  const handleStartSprint = (sprint: SprintModule) => {
    const currentUser = getActiveUser() ?? user;
    if (!currentUser) return;
    const { questions, cycleResetNotice, updatedUser } = selectUnseenBatch(
      sprint.questions,
      sprint.sessionSize,
      currentUser
    );
    if (updatedUser !== currentUser) {
      setUser(updatedUser);
    }
    setActiveBlitzMode(null);
    setActiveSection('sprints');
    setSessionNonce((n) => n + 1);
    setRestartAction(() => () => handleStartSprint(sprint));
    setSubtopicAction(undefined);
    setActiveSession({
      id: `sprint-${sprint.id}`,
      title: `Спринт: ${sprint.title}`,
      subtitle: sprint.subtitle,
      questions,
      xpPerCorrect: 15,
      cycleResetNotice,
    });
  };

  const handleStartModule = (
    mod: TaskModule,
    requestedSubtopic: string | null = null
  ) => {
    const currentUser = getActiveUser() ?? user;
    if (!currentUser) return;
    const isOgeOrEge =
      mod.id.startsWith('oge-') ||
      mod.id.startsWith('ege-') ||
      currentUser.grade === 'oge' ||
      currentUser.grade === 'ege';
    let questions: PlatformQuestion[];
    let cycleResetNotice = false;
    let availableSubtopics: string[] = [];
    let resolvedSubtopic: string | null = null;

    const filtered = isOgeOrEge
      ? filterQuestionsByDifficulty(mod.questions, difficulty)
      : mod.questions;

    availableSubtopics = Array.from(
      new Set(
        filtered
          .map((q) => q.subtopic?.trim())
          .filter((s): s is string => Boolean(s))
      )
    );

    resolvedSubtopic =
      requestedSubtopic && availableSubtopics.includes(requestedSubtopic)
        ? requestedSubtopic
        : null;

    const subtopicPool = resolvedSubtopic
      ? filtered.filter((q) => q.subtopic?.trim() === resolvedSubtopic)
      : filtered;

    const batch = selectUnseenBatch(subtopicPool, 10, currentUser);
    questions = batch.questions;
    cycleResetNotice = batch.cycleResetNotice;
    if (batch.updatedUser !== currentUser) {
      setUser(batch.updatedUser);
    }

    setActiveBlitzMode(null);
    setActiveSection('curriculum');
    setSessionNonce((n) => n + 1);
    setRestartAction(() => () => handleStartModule(mod, resolvedSubtopic));
    setSubtopicAction(
      availableSubtopics.length >= 2
        ? () => (nextSub: string | null) => handleStartModule(mod, nextSub)
        : undefined
    );
    setActiveSession({
      id: mod.id,
      title: mod.title,
      subtitle: mod.subtitle,
      questions,
      xpPerCorrect: 20,
      cycleResetNotice,
      availableSubtopics,
      selectedSubtopic: resolvedSubtopic,
    });
  };

  const handleStartMockTest = () => {
    const currentUser = getActiveUser() ?? user;
    if (!currentUser) return;
    const questions = buildMockTestQuestions(currentUser.grade);
    const examLabel =
      currentUser.grade === 'oge'
        ? 'ОГЭ'
        : currentUser.grade === 'ege'
        ? 'ЕГЭ'
        : undefined;
    setActiveBlitzMode(null);
    setActiveSection('mock_test');
    setSessionNonce((n) => n + 1);
    setRestartAction(() => () => handleStartMockTest());
    setSubtopicAction(undefined);
    setActiveSession({
      id: `mock-${currentUser.grade}`,
      title: `Комплексный тест (${GRADE_LABELS[currentUser.grade]})`,
      questions,
      isMockExam: currentUser.grade === 'oge' || currentUser.grade === 'ege',
      examLabel,
      xpPerCorrect: 25,
    });
  };

  const handleStartMistakeReview = (items: MistakeItem[] = mistakes) => {
    if (items.length === 0) return;
    setActiveBlitzMode(null);
    setActiveSection('mistakes');
    setSessionNonce((n) => n + 1);
    setRestartAction(undefined);
    setSubtopicAction(undefined);
    setActiveSession({
      id: 'mistake-review',
      title: 'Тренировка по ошибкам',
      questions: items.map((m) => m.question),
      isReviewMode: true,
      xpPerCorrect: 20,
    });
  };

  const handleReopenAttempt = (record: AttemptRecord) => {
    setActiveBlitzMode(null);
    setActiveSection('history');
    setSessionNonce((n) => n + 1);
    setRestartAction(() => () => handleReopenAttempt(record));
    setSubtopicAction(undefined);
    setActiveSession({
      id: `history-${record.id}`,
      title: record.moduleTitle,
      subtitle: 'Повторное решение из истории',
      questions: [record.questionSnapshot],
      xpPerCorrect: 20,
      gradeLevelOverride: record.gradeLevel,
    });
  };

  const handleQuestionAnswered = (
    question: PlatformQuestion,
    isCorrect: boolean,
    xpGain: number,
    isReviewMode: boolean,
    sourceId: string,
    sourceTitle: string,
    gradeLevelOverride?: AttemptGradeLevel,
    userState?: unknown
  ): number => {
    if (!user) return 0;

    const { user: statsUpdatedUser, xpDelta } = recordAnswerStats(
      user,
      isCorrect,
      xpGain,
      isReviewMode
    );

    let nextUser = statsUpdatedUser;
    if (isCorrect && !isReviewMode) {
      const solvedIds = [question.id, ...(question.constituentIds ?? [])];
      nextUser = markQuestionsSolved(statsUpdatedUser, solvedIds);
    }

    const { userAnswer, correctAnswer } = formatAttemptAnswers(question, userState);

    nextUser = appendAttemptHistory(nextUser, {
      questionId: question.id,
      moduleTitle: resolveAttemptModuleTitle(sourceId, sourceTitle, question),
      gradeLevel: resolveAttemptGradeLevel(
        sourceId,
        user.grade,
        question,
        gradeLevelOverride
      ),
      previewText: buildQuestionPreviewText(question),
      isCorrect,
      userAnswer,
      correctAnswer,
      questionSnapshot: question,
    });

    setUser(nextUser);

    const catKey = resolveAnalyticsCategoryKey(user.grade, sourceId, question);
    if (catKey) {
      setCategoryStats(recordCategoryAttempt(user.nickname, catKey, isCorrect));
    }
    setDailyChallenge(
      updateDailyChallengeOnAnswer(user.nickname, {
        isCorrect,
        isSprint: sourceId.startsWith('sprint-'),
      })
    );

    if (!isCorrect) {
      const nextMistakes = recordMistake(
        user.nickname,
        question,
        sourceId,
        sourceTitle
      );
      setMistakes(nextMistakes);
    } else if (isReviewMode) {
      const nextMistakes = incrementMistakeCorrectStreak(
        user.nickname,
        question.id
      );
      setMistakes(nextMistakes);
    }

    return xpDelta;
  };

  const handleMarkLearned = (questionId: string, fromReviewSession = false) => {
    if (!user) return;
    const nextMistakes = removeMistakeAsLearned(user.nickname, questionId);
    setMistakes(nextMistakes);
    setDailyChallenge(updateDailyChallengeOnMistakeLearned(user.nickname));
    if (fromReviewSession) {
      setUser(awardRedemptionXp(user, 10));
    }
  };

  const handleDeductHintXp = (): boolean => {
    if (!user) return false;
    const { user: updatedUser, spent } = deductHintXp(user, HINT_COST);
    if (spent) {
      setUser(updatedUser);
    }
    return spent;
  };

  const handleClaimDailyChallenge = () => {
    if (!user) return;
    const { user: updatedUser, challenge, awarded } = claimDailyChallengeReward(user);
    if (awarded) {
      setUser(updatedUser);
    }
    setDailyChallenge(challenge);
  };

  const handlePracticeWeakSpot = (categoryId: string) => {
    if (!user) return;
    const target = getAnalyticsCategoryTarget(user.grade, categoryId);
    if (!target) {
      setActiveSection('curriculum');
      return;
    }
    if (target.kind === 'module') {
      handleStartModule(target.module);
    } else {
      handleStartSprint(target.sprint);
    }
  };

  const handlePracticeKimTask = (examType: 'oge' | 'ege', taskNumber: number) => {
    const mod = getModuleTargetForKimTask(examType, taskNumber);
    if (!mod) {
      setActiveSection('curriculum');
      return;
    }
    handleStartModule(mod);
  };

  const handleStartBlitzDuel = (mode: BlitzModeId) => {
    setActiveSession(null);
    setActiveBlitzMode(mode);
  };

  const handleBlitzDuelFinished = (outcome: { won: boolean; xpReward: number }) => {
    const latestUser = getActiveUser() ?? user;
    if (!latestUser) return;
    const updatedUser = recordBlitzDuelOutcome(latestUser, outcome);
    setUser(updatedUser);
  };

  const handleSessionCompleted = (
    moduleId: string,
    mockExamResult?: Omit<MockExamRecord, 'id' | 'timestamp'>
  ) => {
    const latestUser = getActiveUser() ?? user;
    if (!latestUser) return;

    let updatedUser = latestUser;
    if (mockExamResult) {
      updatedUser = appendMockExamRecord(updatedUser, mockExamResult);
    }
    if (!moduleId.startsWith('history-') && moduleId !== 'mistake-review') {
      updatedUser = markModuleCompleted(updatedUser, moduleId);
    }
    if (updatedUser !== latestUser) {
      setUser(updatedUser);
    }
  };

  const handleSaveEssay = (
    entry: Omit<SavedEssayRecord, 'id' | 'timestamp'> & { id?: string }
  ): SavedEssayRecord | void => {
    const latestUser = getActiveUser() ?? user;
    if (!latestUser) return;
    const { user: updatedUser, savedRecord } = saveEssayToArchive(latestUser, entry);
    setUser(updatedUser);
    return savedRecord;
  };

  const handleUpdateArchivedEssay = (record: SavedEssayRecord) => {
    const latestUser = getActiveUser() ?? user;
    if (!latestUser) return;
    const { user: updatedUser } = saveEssayToArchive(latestUser, record);
    saveEssayDraft(latestUser.nickname, record.questionId, record.studentText);
    setUser(updatedUser);
  };

  const handleDeleteArchivedEssay = (essayId: string) => {
    const latestUser = getActiveUser() ?? user;
    if (!latestUser) return;
    setUser(deleteSavedEssay(latestUser, essayId));
  };

  const handleOpenSavedEssayInEditor = (record: SavedEssayRecord) => {
    const latestUser = getActiveUser() ?? user;
    if (!latestUser) return;
    saveEssayDraft(latestUser.nickname, record.questionId, record.studentText);
    const question = resolveOpenEssayQuestionForArchive(record);
    setActiveBlitzMode(null);
    setActiveSection('saved_essays');
    setSessionNonce((n) => n + 1);
    setRestartAction(undefined);
    setSubtopicAction(undefined);
    setActiveSession({
      id: `saved-essay-${record.id}`,
      title: 'Редактирование сочинения',
      subtitle: record.promptTitle,
      questions: [question],
      xpPerCorrect: 20,
      essayArchiveId: record.id,
    });
  };

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  const activeMentor = getMentorById(user.activeMentorId);
  const activeTheme = user.activeTheme || DEFAULT_THEME_ID;

  return (
    <div
      data-theme={activeTheme}
      className={`app-shell-bg relative min-h-screen bg-[#080B14] text-slate-100 overflow-x-hidden ${
        dyslexiaMode ? 'dyslexia-mode' : ''
      }`}
    >
      <Sidebar
        user={user}
        activeSection={activeSection}
        mistakeCount={mistakes.length}
        dyslexiaMode={dyslexiaMode}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onToggleDyslexiaMode={handleToggleDyslexiaMode}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setActiveSession(null);
          setActiveBlitzMode(null);
        }}
        onStartSprint={handleStartSprint}
        onStartMockTest={handleStartMockTest}
        onGradeChange={handleGradeChange}
        onTitleChange={handleTitleChange}
        onProfileRestored={handleAuthenticated}
        onLogout={handleLogout}
      />

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0B0F1D]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="font-display text-base font-bold text-white whitespace-nowrap">
            могни КИМ
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Открыть меню"
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Workspace with Ambient Radial Glow */}
      <main className="relative lg:pl-64">
        <div
          aria-hidden="true"
          className="app-ambient-glow pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[280px] rounded-full bg-violet-600/10 blur-3xl"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {activeSession ? (
            <TrainerSession
              key={`${activeSession.id}-${sessionNonce}`}
              session={activeSession}
              userXp={user.xp}
              activeUserId={user.nickname}
              activeMentor={activeMentor}
              onExit={() => {
                setActiveSession(null);
                if (activeSection === 'mock_test') {
                  setActiveSection('dashboard');
                }
              }}
              onRestartFresh={restartAction}
              onSelectSubtopic={subtopicAction}
              onSaveEssay={handleSaveEssay}
              onQuestionAnswered={handleQuestionAnswered}
              onDeductHintXp={handleDeductHintXp}
              onMarkLearned={handleMarkLearned}
              onSessionCompleted={handleSessionCompleted}
            />
          ) : activeBlitzMode ? (
            <MentorBlitzDuel
              mode={activeBlitzMode}
              grade={user.grade}
              activeMentor={activeMentor}
              onExit={() => setActiveBlitzMode(null)}
              onDuelFinished={handleBlitzDuelFinished}
            />
          ) : activeSection === 'dashboard' ? (
            <DashboardView
              user={user}
              mistakes={mistakes}
              dailyChallenge={dailyChallenge ?? getDailyChallenge(user.nickname)}
              categoryStats={categoryStats ?? getCategoryStats(user.nickname)}
              recentLevelUp={recentLevelUp}
              onClaimDailyChallenge={handleClaimDailyChallenge}
              onPracticeWeakSpot={handlePracticeWeakSpot}
              onStartBlitzDuel={handleStartBlitzDuel}
              onOpenMistakesFolder={() => setActiveSection('mistakes')}
              onStartMistakeReview={() => handleStartMistakeReview(mistakes)}
              onStartSprint={handleStartSprint}
              onOpenSprints={() => setActiveSection('sprints')}
              onOpenCurriculum={() => setActiveSection('curriculum')}
              onStartMockTest={handleStartMockTest}
            />
          ) : activeSection === 'sprints' ? (
            <SprintsView
              grade={user.grade}
              activeMentor={activeMentor}
              duelsWon={user.duelsWon ?? 0}
              onStartSprint={handleStartSprint}
              onStartBlitzDuel={handleStartBlitzDuel}
            />
          ) : activeSection === 'curriculum' ? (
            <CurriculumView
              grade={user.grade}
              completedModuleIds={user.completedModuleIds}
              difficulty={difficulty}
              activeEgeTab={activeEgeTab}
              onEgeTabChange={handleEgeTabChange}
              onDifficultyChange={setDifficulty}
              onStartModule={handleStartModule}
            />
          ) : activeSection === 'shop' ? (
            <Shop user={user} onUserUpdated={setUser} />
          ) : activeSection === 'rules_chat' ? (
            <MentorRuleChat activeMentor={activeMentor} />
          ) : activeSection === 'history' ? (
            <AttemptHistory
              attempts={user.attemptHistory ?? []}
              onReopenAttempt={handleReopenAttempt}
              onNavigateToCurriculum={() => setActiveSection('curriculum')}
            />
          ) : activeSection === 'mock_journal' ? (
            <MockExamJournal
              records={user.mockExamHistory ?? []}
              grade={user.grade}
              onPracticeKimTask={handlePracticeKimTask}
              onStartMockTest={handleStartMockTest}
            />
          ) : activeSection === 'saved_essays' ? (
            <SavedEssaysArchive
              essays={user.savedEssays ?? []}
              onSaveUpdatedEssay={handleUpdateArchivedEssay}
              onDeleteEssay={handleDeleteArchivedEssay}
              onOpenInEditor={handleOpenSavedEssayInEditor}
              onNavigateToCurriculum={() => setActiveSection('curriculum')}
            />
          ) : (
            <MistakeFolderView
              mistakes={mistakes}
              onMarkLearned={(qId) => handleMarkLearned(qId, false)}
              onStartReviewSession={handleStartMistakeReview}
              onNavigateToSprints={() => setActiveSection('sprints')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
