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

    // КРИТИЧЕСКИ ВАЖНО: синхронизируем восстановленный профиль в YDB
    scheduleCloudSync(restoredUser, {
      mistakes: getMistakes(restoredUser.nickname),
      categoryStats: getCategoryStats(restoredUser.nickname),
    });

    return { user: restoredUser };
  } catch {
    return { error: 'Не удалось расшифровать код. Проверьте, что строка скопирована полностью.' };
  }
}
