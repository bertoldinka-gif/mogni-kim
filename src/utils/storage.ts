// ... (предыдущие импорты и код без изменений)

// --- Daily Mentor Challenge ("Вызов дня от наставника") ---

function localDateISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Расширенный список ежедневных вызовов
const DAILY_CHALLENGE_TEMPLATES: Array<{
  kind: DailyChallengeKind;
  title: string;
  description: string;
  target: number;
  rewardXp?: number;
}> = [
  {
    kind: 'streak_5',
    title: 'Решить 5 заданий без ошибок',
    description: 'Дайте 5 точных ответов подряд в любом тренажёре или спринте.',
    target: 5,
  },
  {
    kind: 'streak_10',
    title: 'Решить 10 заданий без единой ошибки',
    description: 'Продемонстрируйте железную выдержку — 10 верных ответов подряд.',
    target: 10,
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
    kind: 'mistakes_5_ortho',
    title: 'Закрыть 5 карточек по орфографии',
    description: 'Исправьте и выучите 5 ошибок именно из блока «Орфография».',
    target: 5,
  },
  {
    kind: 'duel_win',
    title: 'Победить наставника в блиц-дуэли',
    description: 'Одержите верх над Штабом ФИПИ или своим наставником в скорости.',
    target: 1,
  },
  {
    kind: 'sprint_stress',
    title: 'Пройти спринт по ударениям',
    description: 'Пройдите спринт в режиме «Ударения» без единой ошибки.',
    target: 1, // 1 успешный спринт
  },
  {
    kind: 'fix_mistakes_3',
    title: 'Исправить 3 ошибки из папки ошибок',
    description: 'Вернитесь в раздел ошибок и решите 3 проблемных задания правильно.',
    target: 3,
  },
  {
    kind: 'sprint_20',
    title: 'Пройти спринт из 20 слов',
    description: 'Наберите скорость и выносливость: 20 выполненных заданий за день.',
    target: 20,
  },
  {
    kind: 'perfect_score',
    title: 'Пройти мини-тест на 100%',
    description: 'Выполните любой тест или модуль без ошибок (100% точности).',
    target: 1,
  },
];

function pickDailyTemplate(dateStr: string) {
  // Детерминированный хеш для выбора задания на основе даты
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return DAILY_CHALLENGE_TEMPLATES[hash % DAILY_CHALLENGE_TEMPLATES.length];
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
    rewardXp: tpl.rewardXp ?? 100,
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
    
    // Если дата сменилась, генерируем новое задание
    if (!parsed || parsed.date !== today) {
      return saveDailyChallenge(nickname, createFreshDailyChallenge(today));
    }
    return parsed;
  } catch {
    return saveDailyChallenge(nickname, createFreshDailyChallenge(today));
  }
}

// Обновление прогресса при ответе на вопрос
export function updateDailyChallengeOnAnswer(
  nickname: string,
  opts: { isCorrect: boolean; isSprint?: boolean; mode?: string; category?: string }
): DailyChallengeState {
  const current = getDailyChallenge(nickname);
  if (current.claimed) return current;

  // Вызов: Спринт (любой)
  if (current.kind === 'sprint_10' || current.kind === 'sprint_20') {
    if (!opts.isSprint) return current;
    const nextProgress = Math.min(current.target, current.progress + 1);
    return saveDailyChallenge(nickname, { ...current, progress: nextProgress });
  }

  // Вызов: Спринт по ударениям
  if (current.kind === 'sprint_stress') {
    if (opts.isSprint && opts.mode === 'orthoepy') {
      // Считаем успешным, если ответ верный. Можно настроить логику завершения спринта.
      if (opts.isCorrect) {
         const nextProgress = Math.min(current.target, current.progress + 1);
         return saveDailyChallenge(nickname, { ...current, progress: nextProgress });
      }
    }
    return current;
  }

  // Вызов: Серии правильных ответов
  if (current.kind === 'streak_5' || current.kind === 'streak_10') {
    if (current.progress >= current.target) return current;
    if (opts.isCorrect) {
      const nextStreak = Math.min(current.target, (current.currentStreak ?? current.progress) + 1);
      return saveDailyChallenge(nickname, {
        ...current,
        currentStreak: nextStreak,
        progress: Math.max(current.progress, nextStreak),
      });
    }
    // Сброс серии при ошибке
    return saveDailyChallenge(nickname, {
      ...current,
      currentStreak: 0,
      progress: 0,
    });
  }

  return current;
}

// Специальный метод для фиксации победы в дуэли
export function updateDailyChallengeOnDuelWin(nickname: string): DailyChallengeState {
  const current = getDailyChallenge(nickname);
  if (current.claimed || current.kind !== 'duel_win') return current;
  
  return saveDailyChallenge(nickname, { 
    ...current, 
    progress: Math.min(current.target, current.progress + 1) 
  });
}

// Обновление прогресса при работе над ошибками
export function updateDailyChallengeOnMistakeLearned(
  nickname: string,
  category?: string
): DailyChallengeState {
  const current = getDailyChallenge(nickname);
  if (current.claimed) return current;

  // Вызов: Выучить 3 карточки (общий)
  if (current.kind === 'mistakes_3') {
    const nextProgress = Math.min(current.target, current.progress + 1);
    return saveDailyChallenge(nickname, { ...current, progress: nextProgress });
  }

  // Вызов: Закрыть 5 карточек по орфографии
  if (current.kind === 'mistakes_5_ortho' && category === 'orthography') {
    const nextProgress = Math.min(current.target, current.progress + 1);
    return saveDailyChallenge(nickname, { ...current, progress: nextProgress });
  }

  // Вызов: Исправить 3 ошибки (синоним, но с другим контекстом)
  if (current.kind === 'fix_mistakes_3') {
    const nextProgress = Math.min(current.target, current.progress + 1);
    return saveDailyChallenge(nickname, { ...current, progress: nextProgress });
  }

  return current;
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

// ... (остальной код без изменений)
