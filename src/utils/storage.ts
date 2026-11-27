import {
  DEFAULT_TITLE,
  LOOTBOX_COST,
  MENTORS,
  MENTOR_HIRE_COST,
  MentorCharacter,
  RARE_TITLES,
} from '../data/petsData';
import {
  GIFT_CATALOG,
  GIFT_UPGRADE_COST,
  GIFT_UPGRADE_RARITIES,
  OwnedGiftRecord,
  generateGiftLegend,
  getMentorSignatureForGift,
  loadUserGifts,
  saveUserGifts,
} from '../data/giftsData';
import {
  DEFAULT_THEME_ID,
  ThemeDefinition,
  UI_THEMES,
} from '../data/themesData';
import {
  AttemptRecord,
  CategoryStatsMap,
  DailyChallengeKind,
  DailyChallengeState,
  GradeLevel,
  MistakeItem,
  MockExamRecord,
  PlatformQuestion,
  SavedEssayRecord,
  SkillPillar,
  SkillStatsMap,
  UserProfile,
} from '../types/platform';

const USERS_KEY = 'mogni_kim_users';
const ACTIVE_USER_KEY = 'mogni_kim_active_user';
const LEGACY_USERS_KEY = 'mogni_kim_users_v1';
const LEGACY_ACTIVE_USER_KEY = 'mogni_kim_active_user_v1';
const MISTAKES_PREFIX = 'mogni_kim_mistakes_v1_';
const DYSLEXIA_MODE_KEY = 'mogni_kim_dyslexia_mode';

export function getDyslexiaMode(): boolean {
  try {
    return localStorage.getItem(DYSLEXIA_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDyslexiaMode(enabled: boolean): void {
  try {
    localStorage.setItem(DYSLEXIA_MODE_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore storage errors
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const MAX_ATTEMPT_HISTORY = 300;
export const MAX_MOCK_EXAM_HISTORY = 100;

function normalizeUser(u: UserProfile): UserProfile {
  const rawThemes = Array.isArray(u.unlockedThemes) ? u.unlockedThemes : [];
  const unlockedThemes = Array.from(new Set([DEFAULT_THEME_ID, ...rawThemes]));
  const activeTheme =
    u.activeTheme && unlockedThemes.includes(u.activeTheme)
      ? u.activeTheme
      : DEFAULT_THEME_ID;

  return {
    ...u,
    xp: Math.max(0, u.xp ?? 0),
    activeDays: u.activeDays ?? (u.lastActiveDate ? [u.lastActiveDate] : []),
    unlockedMentors: u.unlockedMentors ?? [],
    activeMentorId: u.activeMentorId ?? null,
    unlockedTitles:
      u.unlockedTitles && u.unlockedTitles.length > 0
        ? u.unlockedTitles
        : [DEFAULT_TITLE],
    activeTitle: u.activeTitle || DEFAULT_TITLE,
    unlockedThemes,
    activeTheme,
    solvedQuestionIds: Array.isArray(u.solvedQuestionIds)
      ? Array.from(new Set(u.solvedQuestionIds))
      : [],
    attemptHistory: Array.isArray(u.attemptHistory)
      ? u.attemptHistory.slice(0, MAX_ATTEMPT_HISTORY)
      : [],
    mockExamHistory: Array.isArray(u.mockExamHistory)
      ? u.mockExamHistory.slice(0, MAX_MOCK_EXAM_HISTORY)
      : [],
    savedEssays: Array.isArray(u.savedEssays) ? u.savedEssays : [],
    duelsWon: Math.max(0, u.duelsWon ?? 0),
  };
}

function readUsersMap(): Record<string, UserProfile> {
  try {
    let raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_USERS_KEY);
      if (legacy) {
        localStorage.setItem(USERS_KEY, legacy);
        raw = legacy;
      }
    }
    return raw ? (JSON.parse(raw) as Record<string, UserProfile>) : {};
  } catch {
    return {};
  }
}

function writeUsersMap(users: Record<string, UserProfile>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readActiveUserKey(): string | null {
  let active = localStorage.getItem(ACTIVE_USER_KEY);
  if (!active) {
    const legacy = localStorage.getItem(LEGACY_ACTIVE_USER_KEY);
    if (legacy) {
      localStorage.setItem(ACTIVE_USER_KEY, legacy);
      active = legacy;
    }
  }
  return active;
}

export function getSavedUsers(): UserProfile[] {
  const users = readUsersMap();
  return Object.values(users)
    .map(normalizeUser)
    .sort((a, b) => {
      if (a.lastActiveDate !== b.lastActiveDate) {
        return b.lastActiveDate.localeCompare(a.lastActiveDate);
      }
      return b.xp - a.xp;
    });
}

export function getActiveUser(): UserProfile | null {
  try {
    const nickname = readActiveUserKey();
    if (!nickname) return null;
    const users = readUsersMap();
    const found = users[nickname.toLowerCase()] ?? users[nickname];
    return found ? normalizeUser(found) : null;
  } catch {
    return null;
  }
}

export function loginSavedProfile(nickname: string): UserProfile | null {
  const key = nickname.trim().toLowerCase();
  const users = readUsersMap();
  const existing = users[key] ?? users[nickname];
  if (!existing) return null;

  const updated = touchDailyStreak(normalizeUser(existing), todayISO());
  users[key] = updated;
  writeUsersMap(users);
  localStorage.setItem(ACTIVE_USER_KEY, key);
  return updated;
}

export function registerOrLoginUser(
  mode: 'login' | 'register',
  nicknameRaw: string,
  password: string,
  grade: GradeLevel
): { user?: UserProfile; error?: string } {
  const nickname = nicknameRaw.trim();
  if (nickname.length < 2) {
    return { error: 'Никнейм должен содержать минимум 2 символа.' };
  }
  if (password.length < 3) {
    return { error: 'Пароль должен содержать минимум 3 символа.' };
  }

  const key = nickname.toLowerCase();
  const users = readUsersMap();
  const existing = users[key];
  const today = todayISO();

  if (mode === 'login') {
    if (!existing) {
      return { error: 'Профиль с таким никнеймом не найден. Переключитесь на регистрацию.' };
    }
    if (existing.password !== password) {
      return { error: 'Неверный пароль.' };
    }
    const updated = touchDailyStreak(normalizeUser(existing), today);
    users[key] = updated;
    writeUsersMap(users);
    localStorage.setItem(ACTIVE_USER_KEY, key);
    return { user: updated };
  }

  if (existing) {
    return { error: 'Этот никнейм уже занят. Войдите в существующий профиль или выберите другой.' };
  }

  const newUser: UserProfile = {
    nickname,
    password,
    grade,
    xp: 0,
    streak: 1,
    totalAnswered: 0,
    totalCorrect: 0,
    completedModuleIds: [],
    activeDays: [today],
    unlockedMentors: [],
    activeMentorId: null,
    unlockedTitles: [DEFAULT_TITLE],
    activeTitle: DEFAULT_TITLE,
    unlockedThemes: [DEFAULT_THEME_ID],
    activeTheme: DEFAULT_THEME_ID,
    solvedQuestionIds: [],
    attemptHistory: [],
    mockExamHistory: [],
    savedEssays: [],
    duelsWon: 0,
    lastActiveDate: today,
    createdAt: new Date().toISOString(),
  };

  users[key] = newUser;
  writeUsersMap(users);
  localStorage.setItem(ACTIVE_USER_KEY, key);
  return { user: newUser };
}

function mergeActiveDay(activeDays: string[] | undefined, today: string): string[] {
  const list = Array.isArray(activeDays) ? activeDays : [];
  if (list.includes(today)) return list;
  return [...list, today].slice(-30);
}

function touchDailyStreak(user: UserProfile, today: string): UserProfile {
  const nextDays = mergeActiveDay(user.activeDays, today);
  if (user.lastActiveDate === today) {
    return nextDays === user.activeDays ? user : { ...user, activeDays: nextDays };
  }
  const last = new Date(user.lastActiveDate);
  const current = new Date(today);
  const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  const nextStreak = diffDays === 1 ? user.streak + 1 : 1;
  return {
    ...user,
    streak: nextStreak,
    activeDays: nextDays,
    lastActiveDate: today,
  };
}

export function logoutUser(): void {
  localStorage.removeItem(ACTIVE_USER_KEY);
  localStorage.removeItem(LEGACY_ACTIVE_USER_KEY);
}

export function updateUserProfile(updated: UserProfile): UserProfile {
  const normalized = normalizeUser(updated);
  const users = readUsersMap();
  const key = normalized.nickname.toLowerCase();
  users[key] = normalized;
  writeUsersMap(users);
  return normalized;
}

export function markQuestionsSolved(
  user: UserProfile,
  questionIds: string[]
): UserProfile {
  const normalized = normalizeUser(user);
  const existing = normalized.solvedQuestionIds ?? [];
  const nextSet = new Set(existing);
  let changed = false;
  for (const id of questionIds) {
    if (id && !nextSet.has(id)) {
      nextSet.add(id);
      changed = true;
    }
  }
  if (!changed) return normalized;
  return updateUserProfile({
    ...normalized,
    solvedQuestionIds: Array.from(nextSet),
  });
}

export function appendAttemptHistory(
  user: UserProfile,
  entry: Omit<AttemptRecord, 'id' | 'timestamp'>
): UserProfile {
  const normalized = normalizeUser(user);
  const existing = normalized.attemptHistory ?? [];
  const nextRecord: AttemptRecord = {
    ...entry,
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  const nextHistory = [nextRecord, ...existing].slice(0, MAX_ATTEMPT_HISTORY);
  return updateUserProfile({
    ...normalized,
    attemptHistory: nextHistory,
  });
}

export function appendMockExamRecord(
  user: UserProfile,
  entry: Omit<MockExamRecord, 'id' | 'timestamp'>
): UserProfile {
  const normalized = normalizeUser(user);
  const existing = normalized.mockExamHistory ?? [];
  const nextRecord: MockExamRecord = {
    ...entry,
    id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  const nextHistory = [nextRecord, ...existing].slice(0, MAX_MOCK_EXAM_HISTORY);
  return updateUserProfile({
    ...normalized,
    mockExamHistory: nextHistory,
  });
}

// --- Essay Auto-Save Drafts & Saved Essays Archive ---

const ESSAY_DRAFT_PREFIX = 'mogni_kim_essay_draft_v1_';

function essayDraftKey(userId: string, questionId: string): string {
  return `${ESSAY_DRAFT_PREFIX}${userId.trim().toLowerCase()}_${questionId}`;
}

export function getEssayDraft(userId: string, questionId: string): string {
  try {
    return localStorage.getItem(essayDraftKey(userId, questionId)) ?? '';
  } catch {
    return '';
  }
}

export function saveEssayDraft(
  userId: string,
  questionId: string,
  text: string
): void {
  try {
    const key = essayDraftKey(userId, questionId);
    if (!text) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, text);
    }
  } catch {
    // ignore storage errors
  }
}

export function clearEssayDraft(userId: string, questionId: string): void {
  try {
    localStorage.removeItem(essayDraftKey(userId, questionId));
  } catch {
    // ignore storage errors
  }
}

export function saveEssayToArchive(
  user: UserProfile,
  entry: Omit<SavedEssayRecord, 'id' | 'timestamp'> & { id?: string }
): { user: UserProfile; savedRecord: SavedEssayRecord } {
  const normalized = normalizeUser(user);
  const existing = normalized.savedEssays ?? [];
  const now = new Date().toISOString();

  if (entry.id) {
    const existingIdx = existing.findIndex((item) => item.id === entry.id);
    if (existingIdx >= 0) {
      const updatedRecord: SavedEssayRecord = {
        ...existing[existingIdx],
        ...entry,
        id: entry.id,
        timestamp: now,
      };
      const nextList = [
        updatedRecord,
        ...existing.filter((item) => item.id !== entry.id),
      ];
      return {
        user: updateUserProfile({ ...normalized, savedEssays: nextList }),
        savedRecord: updatedRecord,
      };
    }
  }

  const newRecord: SavedEssayRecord = {
    ...entry,
    id:
      entry.id ||
      `essay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: now,
  };

  return {
    user: updateUserProfile({
      ...normalized,
      savedEssays: [newRecord, ...existing],
    }),
    savedRecord: newRecord,
  };
}

export function deleteSavedEssay(user: UserProfile, essayId: string): UserProfile {
  const normalized = normalizeUser(user);
  const existing = normalized.savedEssays ?? [];
  const filtered = existing.filter((item) => item.id !== essayId);
  if (filtered.length === existing.length) return normalized;
  return updateUserProfile({
    ...normalized,
    savedEssays: filtered,
  });
}

export function recordBlitzDuelOutcome(
  user: UserProfile,
  opts: { won: boolean; xpReward: number }
): UserProfile {
  const normalized = normalizeUser(user);
  const today = todayISO();
  const touched = touchDailyStreak(normalized, today);
  return updateUserProfile({
    ...touched,
    xp: Math.max(0, touched.xp + Math.max(0, opts.xpReward)),
    duelsWon: (touched.duelsWon ?? 0) + (opts.won ? 1 : 0),
  });
}

export function resetSolvedQuestionsForPool(
  user: UserProfile,
  poolQuestionIds: string[]
): UserProfile {
  const normalized = normalizeUser(user);
  const poolSet = new Set(poolQuestionIds);
  const existing = normalized.solvedQuestionIds ?? [];
  const filtered = existing.filter((id) => !poolSet.has(id));
  if (filtered.length === existing.length) return normalized;
  return updateUserProfile({
    ...normalized,
    solvedQuestionIds: filtered,
  });
}

export function updateUserGrade(user: UserProfile, grade: GradeLevel): UserProfile {
  return updateUserProfile({ ...user, grade });
}

/**
 * Strict XP system:
 * - Correct answer: +xpGain
 * - Incorrect answer in standard/sprint mode: -15 XP (clamped at 0)
 * - Incorrect answer in Mistake Review mode: -20 XP (clamped at 0)
 */
export function recordAnswerStats(
  user: UserProfile,
  isCorrect: boolean,
  xpGain: number,
  isReviewMode = false
): { user: UserProfile; xpDelta: number } {
  const today = todayISO();
  const touched = touchDailyStreak(normalizeUser(user), today);
  const penalty = isReviewMode ? -20 : -15;
  const rawDelta = isCorrect ? xpGain : penalty;
  const nextXp = Math.max(0, touched.xp + rawDelta);
  const actualDelta = nextXp - touched.xp;

  const updated = updateUserProfile({
    ...touched,
    xp: nextXp,
    totalAnswered: touched.totalAnswered + 1,
    totalCorrect: touched.totalCorrect + (isCorrect ? 1 : 0),
  });

  return { user: updated, xpDelta: actualDelta };
}

export const HINT_COST = 5;

export function deductHintXp(
  user: UserProfile,
  cost = HINT_COST
): { user: UserProfile; spent: boolean } {
  const normalized = normalizeUser(user);
  if (normalized.xp < cost) {
    return { user: normalized, spent: false };
  }
  const updated = updateUserProfile({
    ...normalized,
    xp: Math.max(0, normalized.xp - cost),
  });
  return { user: updated, spent: true };
}

export function awardRedemptionXp(user: UserProfile, bonus = 10): UserProfile {
  const normalized = normalizeUser(user);
  return updateUserProfile({
    ...normalized,
    xp: normalized.xp + bonus,
  });
}

export function markModuleCompleted(user: UserProfile, moduleId: string): UserProfile {
  if (user.completedModuleIds.includes(moduleId)) return user;
  return updateUserProfile({
    ...user,
    completedModuleIds: [...user.completedModuleIds, moduleId],
  });
}

// --- Shop, Mentors & Titles ---

export function equipMentor(user: UserProfile, mentorId: string | null): UserProfile {
  const normalized = normalizeUser(user);
  return updateUserProfile({
    ...normalized,
    activeMentorId: mentorId,
  });
}

export function equipTitle(user: UserProfile, title: string): UserProfile {
  const normalized = normalizeUser(user);
  return updateUserProfile({
    ...normalized,
    activeTitle: title,
  });
}

export function hireMentorDirect(
  user: UserProfile,
  mentorId: string
): { user: UserProfile; error?: string } {
  const normalized = normalizeUser(user);
  const unlocked = normalized.unlockedMentors ?? [];
  if (unlocked.includes(mentorId)) {
    return { user: equipMentor(normalized, mentorId) };
  }
  const mentor = MENTORS.find((m) => m.id === mentorId);
  const hireCost = mentor?.price ?? MENTOR_HIRE_COST;
  if (normalized.xp < hireCost) {
    return {
      user: normalized,
      error: `Недостаточно XP. Нужно ${hireCost} XP.`,
    };
  }
  const updated = updateUserProfile({
    ...normalized,
    xp: normalized.xp - hireCost,
    unlockedMentors: [...unlocked, mentorId],
    activeMentorId: mentorId,
  });
  return { user: updated };
}

export function equipTheme(user: UserProfile, themeId: string): UserProfile {
  const normalized = normalizeUser(user);
  const unlocked = normalized.unlockedThemes ?? [DEFAULT_THEME_ID];
  const nextTheme = unlocked.includes(themeId) ? themeId : DEFAULT_THEME_ID;
  return updateUserProfile({
    ...normalized,
    activeTheme: nextTheme,
  });
}

export function buyOrEquipTheme(
  user: UserProfile,
  themeId: string
): { user: UserProfile; error?: string } {
  const normalized = normalizeUser(user);
  const unlocked = normalized.unlockedThemes ?? [DEFAULT_THEME_ID];
  if (unlocked.includes(themeId)) {
    return { user: equipTheme(normalized, themeId) };
  }

  const theme = UI_THEMES.find((t) => t.id === themeId);
  if (!theme) {
    return { user: normalized, error: 'Тема оформления не найдена.' };
  }

  if (normalized.xp < theme.cost) {
    return {
      user: normalized,
      error: `Недостаточно XP для темы «${theme.name}». Нужно ${theme.cost} XP.`,
    };
  }

  const updated = updateUserProfile({
    ...normalized,
    xp: normalized.xp - theme.cost,
    unlockedThemes: [...unlocked, theme.id],
    activeTheme: theme.id,
  });
  return { user: updated };
}

export interface LootboxReward {
  kind: 'mentor' | 'theme' | 'title' | 'xp';
  mentor?: MentorCharacter;
  theme?: ThemeDefinition;
  title?: string;
  xpAmount?: number;
  note?: string;
}

export function openFipiLootbox(user: UserProfile): {
  user: UserProfile;
  reward?: LootboxReward;
  error?: string;
} {
  const normalized = normalizeUser(user);
  if (normalized.xp < LOOTBOX_COST) {
    return {
      user: normalized,
      error: `Недостаточно XP. Для открытия сундука нужно ${LOOTBOX_COST} XP.`,
    };
  }

  let nextXp = normalized.xp - LOOTBOX_COST;
  const ownedMentors = [...(normalized.unlockedMentors ?? [])];
  const ownedThemes = [...(normalized.unlockedThemes ?? [DEFAULT_THEME_ID])];
  const ownedTitles = [...(normalized.unlockedTitles ?? [DEFAULT_TITLE])];

  const unownedMentors = MENTORS.filter((m) => !ownedMentors.includes(m.id));
  const unownedThemes = UI_THEMES.filter(
    (t) => t.id !== DEFAULT_THEME_ID && !ownedThemes.includes(t.id)
  );
  const unownedRareTitles = RARE_TITLES.filter((t) => !ownedTitles.includes(t));

  const grantMentor = (note?: string) => {
    const mentor = unownedMentors[Math.floor(Math.random() * unownedMentors.length)];
    const updated = updateUserProfile({
      ...normalized,
      xp: nextXp,
      unlockedMentors: [...ownedMentors, mentor.id],
      activeMentorId: normalized.activeMentorId ?? mentor.id,
    });
    return {
      user: updated,
      reward: { kind: 'mentor' as const, mentor, note },
    };
  };

  const grantTheme = (note?: string) => {
    const theme = unownedThemes[Math.floor(Math.random() * unownedThemes.length)];
    const updated = updateUserProfile({
      ...normalized,
      xp: nextXp,
      unlockedThemes: [...ownedThemes, theme.id],
      activeTheme: theme.id,
    });
    return {
      user: updated,
      reward: { kind: 'theme' as const, theme, note },
    };
  };

  const grantTitle = (note?: string) => {
    const title =
      unownedRareTitles[Math.floor(Math.random() * unownedRareTitles.length)];
    const updated = updateUserProfile({
      ...normalized,
      xp: nextXp,
      unlockedTitles: [...ownedTitles, title],
      activeTitle: title,
    });
    return {
      user: updated,
      reward: { kind: 'title' as const, title, note },
    };
  };

  const roll = Math.random();

  // 50% Mentor Drop
  if (roll < 0.5) {
    if (unownedMentors.length > 0) return grantMentor();
    if (unownedThemes.length > 0) {
      return grantTheme(
        `Все ${MENTORS.length} наставников уже собраны — выпала тема оформления!`
      );
    }
    if (unownedRareTitles.length > 0) {
      return grantTitle('Все наставники и темы уже открыты — выпал редкий титул!');
    }
    const bonus = 150;
    nextXp += bonus;
    const updated = updateUserProfile({ ...normalized, xp: nextXp });
    return {
      user: updated,
      reward: {
        kind: 'xp',
        xpAmount: bonus,
        note: 'Вся коллекция собрана — начислен бонусный кэшбэк!',
      },
    };
  }

  // 20% UI Theme Drop (0.50 .. 0.70)
  if (roll < 0.7) {
    if (unownedThemes.length > 0) return grantTheme();
    if (unownedMentors.length > 0) {
      return grantMentor('Все темы оформления уже открыты — вам достался наставник!');
    }
    if (unownedRareTitles.length > 0) {
      return grantTitle('Все темы и наставники уже собраны — выпал редкий титул!');
    }
  }

  // 20% Rare Title Drop (0.70 .. 0.90)
  if (roll < 0.9) {
    if (unownedRareTitles.length > 0) return grantTitle();
    if (unownedThemes.length > 0) {
      return grantTheme('Все редкие титулы уже открыты — выпала тема оформления!');
    }
    if (unownedMentors.length > 0) {
      return grantMentor('Все редкие титулы уже открыты — вам достался наставник!');
    }
  }

  // 10% Consolation XP Cashback (+50 to +150 XP)
  const cashback = Math.floor(Math.random() * 11) * 10 + 50;
  nextXp += cashback;
  const updated = updateUserProfile({ ...normalized, xp: nextXp });
  return {
    user: updated,
    reward: { kind: 'xp', xpAmount: cashback },
  };
}

// --- Persistent Mistake Folder ---

function mistakesKey(nickname: string): string {
  return `${MISTAKES_PREFIX}${nickname.toLowerCase()}`;
}

export function getMistakes(nickname: string): MistakeItem[] {
  try {
    const raw = localStorage.getItem(mistakesKey(nickname));
    return raw ? (JSON.parse(raw) as MistakeItem[]) : [];
  } catch {
    return [];
  }
}

function saveMistakes(nickname: string, items: MistakeItem[]): MistakeItem[] {
  localStorage.setItem(mistakesKey(nickname), JSON.stringify(items));
  return items;
}

export function recordMistake(
  nickname: string,
  question: PlatformQuestion,
  sourceId: string,
  sourceTitle: string
): MistakeItem[] {
  const current = getMistakes(nickname);
  const now = new Date().toISOString();
  const existingIdx = current.findIndex((m) => m.questionId === question.id);

  if (existingIdx >= 0) {
    const updated = [...current];
    updated[existingIdx] = {
      ...updated[existingIdx],
      failCount: updated[existingIdx].failCount + 1,
      correctStreak: 0,
      lastAttemptAt: now,
    };
    return saveMistakes(nickname, updated);
  }

  const newItem: MistakeItem = {
    questionId: question.id,
    question,
    sourceId,
    sourceTitle,
    failCount: 1,
    correctStreak: 0,
    addedAt: now,
    lastAttemptAt: now,
  };
  return saveMistakes(nickname, [newItem, ...current]);
}

export function incrementMistakeCorrectStreak(
  nickname: string,
  questionId: string
): MistakeItem[] {
  const current = getMistakes(nickname);
  const now = new Date().toISOString();
  const updated = current.map((m) =>
    m.questionId === questionId
      ? { ...m, correctStreak: m.correctStreak + 1, lastAttemptAt: now }
      : m
  );
  return saveMistakes(nickname, updated);
}

export function removeMistakeAsLearned(
  nickname: string,
  questionId: string
): MistakeItem[] {
  const current = getMistakes(nickname);
  const filtered = current.filter((m) => m.questionId !== questionId);
  return saveMistakes(nickname, filtered);
}

// --- Literacy Weak-Spot Analytics (4 Core Pillars) ---

const SKILLS_PREFIX = 'mogni_kim_skills_v1_';
const DAILY_CHALLENGE_PREFIX = 'mogni_kim_daily_challenge_v1_';

function createEmptySkillStats(): SkillStatsMap {
  return {
    orthography: { correct: 0, total: 0 },
    punctuation: { correct: 0, total: 0 },
    speech_culture: { correct: 0, total: 0 },
    text_work: { correct: 0, total: 0 },
  };
}

function skillsKey(nickname: string): string {
  return `${SKILLS_PREFIX}${nickname.toLowerCase()}`;
}

export function getSkillStats(nickname: string): SkillStatsMap {
  try {
    const raw = localStorage.getItem(skillsKey(nickname));
    if (!raw) return createEmptySkillStats();
    const parsed = JSON.parse(raw) as Partial<SkillStatsMap>;
    const base = createEmptySkillStats();
    return {
      orthography: parsed.orthography ?? base.orthography,
      punctuation: parsed.punctuation ?? base.punctuation,
      speech_culture: parsed.speech_culture ?? base.speech_culture,
      text_work: parsed.text_work ?? base.text_work,
    };
  } catch {
    return createEmptySkillStats();
  }
}

export function recordSkillAttempt(
  nickname: string,
  pillar: SkillPillar,
  isCorrect: boolean
): SkillStatsMap {
  const current = getSkillStats(nickname);
  const entry = current[pillar] ?? { correct: 0, total: 0 };
  const next: SkillStatsMap = {
    ...current,
    [pillar]: {
      correct: entry.correct + (isCorrect ? 1 : 0),
      total: entry.total + 1,
    },
  };
  localStorage.setItem(skillsKey(nickname), JSON.stringify(next));
  return next;
}

const CATEGORY_STATS_PREFIX = 'mogni_kim_category_stats_v1_';

function categoryStatsKey(nickname: string): string {
  return `${CATEGORY_STATS_PREFIX}${nickname.toLowerCase()}`;
}

export function getCategoryStats(nickname: string): CategoryStatsMap {
  try {
    const raw = localStorage.getItem(categoryStatsKey(nickname));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CategoryStatsMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function recordCategoryAttempt(
  nickname: string,
  categoryKey: string,
  isCorrect: boolean
): CategoryStatsMap {
  const current = getCategoryStats(nickname);
  const entry = current[categoryKey] ?? { correct: 0, total: 0 };
  const next: CategoryStatsMap = {
    ...current,
    [categoryKey]: {
      correct: entry.correct + (isCorrect ? 1 : 0),
      total: entry.total + 1,
    },
  };
  localStorage.setItem(categoryStatsKey(nickname), JSON.stringify(next));
  return next;
}

// --- Daily Mentor Challenge ("Вызов дня от наставника") ---

function localDateISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DAILY_CHALLENGE_TEMPLATES: Array<{
  kind: DailyChallengeKind;
  title: string;
  description: string;
  target: number;
}> = [
  {
    kind: 'streak_5',
    title: 'Решить 5 заданий без ошибок',
    description: 'Дайте 5 точных ответов подряд в любом тренажёре или спринте.',
    target: 5,
  },
  {
    kind: 'sprint_10',
    title: 'Пройти спринт из 10 слов',
    description: 'Выполните 10 заданий в разделе «Спринты» за сегодняшний день.',
    target: 10,
  },
  {
    kind: 'mistakes_3',
    title: 'Выучить 3 карточки в Работе над ошибками',
    description: 'Закрепите проблемные правила и отметьте 3 карточки кнопкой «Выучил».',
    target: 3,
  },
  {
    kind: 'streak_5',
    title: 'Собрать комбо из 7 верных ответов',
    description: 'Ответьте без единого промаха на 7 вопросов подряд в любом модуле.',
    target: 7,
  },
  {
    kind: 'sprint_10',
    title: 'Двойной рывок: 15 заданий в спринтах',
    description: 'Решите 15 быстрых карточек в разделе «Спринты» на скорость и точность.',
    target: 15,
  },
  {
    kind: 'mistakes_3',
    title: 'Закрыть 2 долга в Работе над ошибками',
    description: 'Повторите сложные случаи и отметьте 2 карточки кнопкой «Выучил».',
    target: 2,
  },
  {
    kind: 'streak_5',
    title: 'Идеальная десятка: 10 ответов подряд',
    description: 'Докажите мастерство — дайте 10 правильных ответов без единой ошибки.',
    target: 10,
  },
  {
    kind: 'sprint_10',
    title: 'Утренняя разминка: 8 заданий в спринтах',
    description: 'Закройте 8 любых карточек в разделе «Спринты» (ударения, паронимы или словарные слова).',
    target: 8,
  },
  {
    kind: 'mistakes_3',
    title: 'Генеральная уборка: 5 карточек из ошибок',
    description: 'Отработайте слабые места и закройте 5 карточек в «Работе над ошибками».',
    target: 5,
  },
];

function pickDailyTemplate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayNumber =
    y && m && d
      ? Math.floor(Date.UTC(y, m - 1, d) / 86400000)
      : Math.floor(Date.now() / 86400000);
  return DAILY_CHALLENGE_TEMPLATES[
    Math.abs(dayNumber) % DAILY_CHALLENGE_TEMPLATES.length
  ];
}

function dailyChallengeKey(nickname: string): string {
  return `${DAILY_CHALLENGE_PREFIX}${nickname.toLowerCase()}`;
}

function createFreshDailyChallenge(dateStr: string): DailyChallengeState {
  const tpl = pickDailyTemplate(dateStr);
  return {
    date: dateStr,
    kind: tpl.kind,
    title: tpl.title,
    description: tpl.description,
    progress: 0,
    target: tpl.target,
    rewardXp: 100,
    claimed: false,
    currentStreak: 0,
  };
}

function saveDailyChallenge(
  nickname: string,
  state: DailyChallengeState
): DailyChallengeState {
  localStorage.setItem(dailyChallengeKey(nickname), JSON.stringify(state));
  return state;
}

export function getDailyChallenge(nickname: string): DailyChallengeState {
  const today = localDateISO();
  try {
    const raw = localStorage.getItem(dailyChallengeKey(nickname));
    if (!raw) {
      return saveDailyChallenge(nickname, createFreshDailyChallenge(today));
    }
    const parsed = JSON.parse(raw) as DailyChallengeState;
    if (!parsed || parsed.date !== today) {
      return saveDailyChallenge(nickname, createFreshDailyChallenge(today));
    }
    return parsed;
  } catch {
    return saveDailyChallenge(nickname, createFreshDailyChallenge(today));
  }
}

export function updateDailyChallengeOnAnswer(
  nickname: string,
  opts: { isCorrect: boolean; isSprint: boolean }
): DailyChallengeState {
  const current = getDailyChallenge(nickname);
  if (current.claimed) return current;

  if (current.kind === 'sprint_10') {
    if (!opts.isSprint) return current;
    const nextProgress = Math.min(current.target, current.progress + 1);
    return saveDailyChallenge(nickname, { ...current, progress: nextProgress });
  }

  if (current.kind === 'streak_5') {
    if (current.progress >= current.target) return current;
    if (opts.isCorrect) {
      const nextStreak = Math.min(current.target, (current.currentStreak ?? current.progress) + 1);
      return saveDailyChallenge(nickname, {
        ...current,
        currentStreak: nextStreak,
        progress: Math.max(current.progress, nextStreak),
      });
    }
    return saveDailyChallenge(nickname, {
      ...current,
      currentStreak: 0,
      progress: 0,
    });
  }

  return current;
}

export function updateDailyChallengeOnMistakeLearned(
  nickname: string
): DailyChallengeState {
  const current = getDailyChallenge(nickname);
  if (current.claimed || current.kind !== 'mistakes_3') return current;
  const nextProgress = Math.min(current.target, current.progress + 1);
  return saveDailyChallenge(nickname, { ...current, progress: nextProgress });
}

export function claimDailyChallengeReward(user: UserProfile): {
  user: UserProfile;
  challenge: DailyChallengeState;
  awarded: boolean;
} {
  const current = getDailyChallenge(user.nickname);
  if (current.claimed || current.progress < current.target) {
    return { user, challenge: current, awarded: false };
  }
  const updatedUser = awardRedemptionXp(user, current.rewardXp);
  const updatedChallenge = saveDailyChallenge(user.nickname, {
    ...current,
    claimed: true,
  });
  return { user: updatedUser, challenge: updatedChallenge, awarded: true };
}

// --- Profile Backup & Restore Portability (Base64) ---

interface ProfileBackupPayload {
  version: number;
  user: UserProfile;
  mistakes?: MistakeItem[];
  skillStats?: SkillStatsMap;
  categoryStats?: CategoryStatsMap;
  dailyChallenge?: DailyChallengeState;
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function exportProfileBackupCode(user: UserProfile): string {
  const normalized = normalizeUser(user);
  const payload: ProfileBackupPayload = {
    version: 1,
    user: normalized,
    mistakes: getMistakes(normalized.nickname),
    skillStats: getSkillStats(normalized.nickname),
    categoryStats: getCategoryStats(normalized.nickname),
    dailyChallenge: getDailyChallenge(normalized.nickname),
  };
  return utf8ToBase64(JSON.stringify(payload));
}

export function importProfileBackupCode(rawCode: string): {
  user?: UserProfile;
  error?: string;
} {
  const cleaned = rawCode.trim();
  if (!cleaned) {
    return { error: 'Вставьте код профиля перед восстановлением.' };
  }

  try {
    const jsonStr = base64ToUtf8(cleaned);
    const parsed = JSON.parse(jsonStr) as Partial<ProfileBackupPayload>;
    if (
      !parsed ||
      !parsed.user ||
      typeof parsed.user.nickname !== 'string' ||
      parsed.user.nickname.trim().length < 2
    ) {
      return { error: 'Некорректный формат кода профиля.' };
    }

    const restoredUser = normalizeUser({
      ...parsed.user,
      nickname: parsed.user.nickname.trim(),
      password: parsed.user.password || '123',
      grade: parsed.user.grade || 'ege',
      completedModuleIds: Array.isArray(parsed.user.completedModuleIds)
        ? parsed.user.completedModuleIds
        : [],
      lastActiveDate: parsed.user.lastActiveDate || todayISO(),
      createdAt: parsed.user.createdAt || new Date().toISOString(),
    });

    const key = restoredUser.nickname.toLowerCase();
    const users = readUsersMap();
    users[key] = restoredUser;
    writeUsersMap(users);
    localStorage.setItem(ACTIVE_USER_KEY, key);

    if (Array.isArray(parsed.mistakes)) {
      saveMistakes(restoredUser.nickname, parsed.mistakes);
    }
    if (parsed.skillStats) {
      const base = createEmptySkillStats();
      const mergedSkills: SkillStatsMap = {
        orthography: parsed.skillStats.orthography ?? base.orthography,
        punctuation: parsed.skillStats.punctuation ?? base.punctuation,
        speech_culture: parsed.skillStats.speech_culture ?? base.speech_culture,
        text_work: parsed.skillStats.text_work ?? base.text_work,
      };
      localStorage.setItem(skillsKey(restoredUser.nickname), JSON.stringify(mergedSkills));
    }
    if (parsed.categoryStats && typeof parsed.categoryStats === 'object') {
      localStorage.setItem(
        categoryStatsKey(restoredUser.nickname),
        JSON.stringify(parsed.categoryStats)
      );
    }
    if (parsed.dailyChallenge && parsed.dailyChallenge.date === localDateISO()) {
      saveDailyChallenge(restoredUser.nickname, parsed.dailyChallenge);
    }

    return { user: restoredUser };
  } catch {
    return { error: 'Не удалось расшифровать код. Проверьте, что строка скопирована полностью.' };
  }
}
export function applyCloudProfilePayload(payload: {
  user: UserProfile;
  mistakes?: MistakeItem[];
  categoryStats?: CategoryStatsMap | null;
}): UserProfile {
  const normalized = normalizeUser(payload.user);
  const key = normalized.nickname.toLowerCase();

  const users = readUsersMap();
  users[key] = normalized;
  writeUsersMap(users);
  localStorage.setItem(ACTIVE_USER_KEY, key);

  if (Array.isArray(payload.mistakes)) {
    try {
      localStorage.setItem(
        `${MISTAKES_PREFIX}${key}`,
        JSON.stringify(payload.mistakes)
      );
    } catch {
      // ignore storage errors
    }
  }

  if (payload.categoryStats && typeof payload.categoryStats === 'object') {
    try {
      localStorage.setItem(
        `mogni_kim_cat_stats_v1_${key}`,
        JSON.stringify(payload.categoryStats)
      );
    } catch {
      // ignore storage errors
    }
  }

  return normalized;
}
export function buyShopGift(
  user: UserProfile,
  giftId: string
): { user: UserProfile; gift?: OwnedGiftRecord; error?: string } {
  const normalized = normalizeUser(user);
  const item = GIFT_CATALOG.find((g) => g.id === giftId);
  if (!item) {
    return { user: normalized, error: 'Подарок не найден.' };
  }
  if (normalized.xp < item.cost) {
    return {
      user: normalized,
      error: `Недостаточно XP для подарка «${item.name}». Нужно ${item.cost} XP.`,
    };
  }

  const activeMentor = MENTORS.find((m) => m.id === normalized.activeMentorId);
  const currentGifts = loadUserGifts(normalized.id);
  const serialNumber = Math.floor(10 + Math.random() * 890);
  const newRecord: OwnedGiftRecord = {
    uid: `gift-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    giftId: item.id,
    serialNumber,
    purchasedAt: new Date().toLocaleDateString('ru-RU'),
    mentorId: normalized.activeMentorId ?? null,
    mentorSignature: getMentorSignatureForGift(
      normalized.activeMentorId,
      activeMentor?.name
    ),
  };

  saveUserGifts(normalized.id, [newRecord, ...currentGifts]);
  const updated = updateUserProfile({
    ...normalized,
    xp: normalized.xp - item.cost,
  });
  return { user: updated, gift: newRecord };
}

export function upgradeOwnedGift(
  user: UserProfile,
  giftUid: string
): { user: UserProfile; error?: string } {
  const normalized = normalizeUser(user);
  if (normalized.xp < GIFT_UPGRADE_COST) {
    return {
      user: normalized,
      error: `Недостаточно XP для улучшения. Нужно ${GIFT_UPGRADE_COST} XP.`,
    };
  }

  const currentGifts = loadUserGifts(normalized.id);
  const idx = currentGifts.findIndex((g) => g.uid === giftUid);
  if (idx === -1) {
    return { user: normalized, error: 'Подарок не найден на вашей полке.' };
  }
  const target = currentGifts[idx];
  if (target.upgraded) {
    return { user: normalized, error: 'Этот подарок уже улучшен!' };
  }

  const meta = GIFT_CATALOG.find((c) => c.id === target.giftId);
  if (!meta) {
    return { user: normalized, error: 'Описание подарка не найдено.' };
  }

  const rarity =
    GIFT_UPGRADE_RARITIES[Math.floor(Math.random() * GIFT_UPGRADE_RARITIES.length)];
  const activeMentor = MENTORS.find((m) => m.id === normalized.activeMentorId);
  const { perk, legend } = generateGiftLegend(
    meta,
    rarity,
    target.serialNumber,
    activeMentor?.name
  );

  const nextGifts = [...currentGifts];
  nextGifts[idx] = {
    ...target,
    upgraded: {
      rarityId: rarity.id,
      rarityName: rarity.name,
      perk,
      legend,
      upgradedAt: new Date().toLocaleDateString('ru-RU'),
    },
  };

  saveUserGifts(normalized.id, nextGifts);
  const updated = updateUserProfile({
    ...normalized,
    xp: normalized.xp - GIFT_UPGRADE_COST,
  });
  return { user: updated };
}
