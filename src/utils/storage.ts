// ... (предыдущий код файла без изменений)

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
];

// --- ЗАМЕНЕННАЯ ФУНКЦИЯ ---
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
// ---------------------------

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

// ... (остальной код файла без изменений)
