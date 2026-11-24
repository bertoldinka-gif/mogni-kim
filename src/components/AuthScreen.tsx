import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Flame,
  GraduationCap,
  KeyRound,
  Lock,
  Ticket,
  User,
  Zap,
} from 'lucide-react';
import { GRADE_LABELS, GRADE_OPTIONS } from '../data/curriculum';
import { getMentorById } from '../data/petsData';
import { GradeLevel, UserProfile } from '../types/platform';
import {
  applyCloudProfilePayload,
  getSavedUsers,
  importProfileBackupCode,
  loginSavedProfile,
  registerOrLoginUser,
} from '../utils/storage';
import { loadProfileFromCloud } from '../utils/cloudSync';
import { LogoMark } from './LogoMark';
import { MentorAvatar } from './MentorAvatar';

export const INVITE_CODE = 'MOGNI2026';
export const INVITE_STORAGE_KEY = 'mogni_kim_invited';

export function checkAndConsumeInviteFromUrl(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get('invite');
    if (inviteParam && inviteParam.trim().toUpperCase() === INVITE_CODE) {
      localStorage.setItem(INVITE_STORAGE_KEY, 'true');
      params.delete('invite');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${
        nextSearch ? `?${nextSearch}` : ''
      }${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
      return true;
    }
  } catch {
    // ignore URL or storage access errors
  }

  try {
    return localStorage.getItem(INVITE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const savedProfiles = useMemo(() => getSavedUsers(), []);
  const [isInvited] = useState<boolean>(() => checkAndConsumeInviteFromUrl());
  const [mode, setMode] = useState<'register' | 'login'>(
    savedProfiles.length > 0 ? 'login' : 'register'
  );
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('ege');
  const [error, setError] = useState<string | null>(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  const [showRestoreBox, setShowRestoreBox] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNickname = nickname.trim();
    if (cleanNickname.length < 2) {
      setError('Никнейм должен содержать минимум 2 символа.');
      return;
    }
    if (password.length < 3) {
      setError('Пароль должен содержать минимум 3 символа.');
      return;
    }

    if (mode === 'register' && !isInvited) {
      if (inviteCode.trim().toUpperCase() !== INVITE_CODE) {
        setError('Неверный код приглашения. Запросите ссылку у преподавателя.');
        return;
      }
    }

    // Сначала пробуем локально
    const localResult = registerOrLoginUser(mode, cleanNickname, password, grade);

    if (mode === 'login') {
      if (localResult.user) {
        onAuthenticated(localResult.user);
        return;
      }
      // Если локально профиль не найден (новый телефон / новый домен), ищем в базе YDB
      if (localResult.error?.includes('не найден')) {
        setIsCloudLoading(true);
        const cloudPayload = await loadProfileFromCloud(cleanNickname);
        setIsCloudLoading(false);

        if (!cloudPayload?.user) {
          setError('Профиль с таким никнеймом не найден ни в браузере, ни в облачной базе.');
          return;
        }
        if (cloudPayload.user.password !== password) {
          setError('Неверный пароль.');
          return;
        }
        const restored = applyCloudProfilePayload(cloudPayload);
        onAuthenticated(restored);
        return;
      }
      if (localResult.error) {
        setError(localResult.error);
        return;
      }
    }

    // Режим регистрации: проверяем, не занят ли никнейм в облаке YDB
    if (mode === 'register') {
      if (localResult.error) {
        setError(localResult.error);
        return;
      }
      setIsCloudLoading(true);
      const existingCloud = await loadProfileFromCloud(cleanNickname);
      setIsCloudLoading(false);

      if (existingCloud?.user) {
        // Откатываем локальное создание и просим войти в существующий профиль
        setError('Этот никнейм уже зарегистрирован в облаке. Переключитесь на «Войти» и введите свой пароль.');
        return;
      }
      if (localResult.user) {
        onAuthenticated(localResult.user);
      }
    }
  };

  const handleQuickLogin = async (profileNickname: string) => {
    const localUser = loginSavedProfile(profileNickname);
    if (!localUser) return;

    // Проверяем, нет ли в облаке более свежей версии профиля с другого устройства
    setIsCloudLoading(true);
    const cloudPayload = await loadProfileFromCloud(profileNickname);
    setIsCloudLoading(false);

    if (
      cloudPayload?.user &&
      (cloudPayload.user.xp > localUser.xp ||
        cloudPayload.user.totalAnswered > localUser.totalAnswered)
    ) {
      const merged = applyCloudProfilePayload(cloudPayload);
      onAuthenticated(merged);
      return;
    }

    onAuthenticated(localUser);
  };

  return (
    <div className="relative min-h-screen bg-[#080B14] text-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full bg-violet-600/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 border border-slate-800/80 rounded-2xl bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/40">
        {/* Left Brand Overview */}
        <div className="lg:col-span-5 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between bg-[#0B0F1D]/80">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={38} />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                могни КИМ
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-8 leading-snug">
              Тренажёр русского языка и экзаменов
            </h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Орфография, пунктуация, орфоэпические спринты и системная работа над ошибками.
              Весь прогресс автоматически сохраняется в облаке и доступен с любого устройства.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span>Программы обучения</span>
              <span className="font-mono-num text-slate-200">2–11 классы · ОГЭ · ЕГЭ</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Быстрые спринты</span>
              <span className="font-mono-num text-slate-200">10 вопросов</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Папка ошибок</span>
              <span className="text-emerald-400 font-medium">Осознанное «Выучил»</span>
            </div>
          </div>
        </div>

        {/* Right Auth Form + Quick Saved Profiles */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-6">
          {/* One-Click Saved Profiles */}
          {savedProfiles.length > 0 && (
            <div className="space-y-2.5 pb-5 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Продолжить как...
                </span>
                <span className="text-[11px] text-slate-500">
                  Вход в 1 клик
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savedProfiles.map((profile) => {
                  const mentor = getMentorById(profile.activeMentorId);
                  return (
                    <button
                      key={profile.nickname}
                      type="button"
                      onClick={() => handleQuickLogin(profile.nickname)}
                      className="group flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#080B14]/85 border border-slate-800 hover:border-violet-500/60 hover:bg-slate-900/90 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {mentor ? (
                          <MentorAvatar mentor={mentor} size="sm" ringTone="violet" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-xs font-display font-bold text-violet-300 shrink-0">
                            {profile.nickname.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-display text-sm font-semibold text-white truncate">
                            {profile.nickname}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {GRADE_LABELS[profile.grade]}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono-num">
                            <span className="inline-flex items-center gap-0.5 text-violet-300">
                              <Zap className="w-3 h-3" />
                              {profile.xp} XP
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-amber-400">
                              <Flame className="w-3 h-3" />
                              {profile.streak}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
              <div className="flex items-center gap-1 p-1 bg-[#080B14] border border-slate-800/80 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    mode === 'register'
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Новый ученик
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Уже есть профиль
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRestoreBox((v) => !v);
                  setRestoreError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showRestoreBox ? 'Скрыть перенос' : 'Восстановить по коду'}</span>
              </button>
            </div>

            {showRestoreBox ? (
              <form
                onSubmit={handleRestoreFromCode}
                className="p-4 rounded-xl bg-[#080B14]/85 border border-violet-500/30 space-y-3 mb-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white">
                    Восстановление профиля из кода переноса
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Вставьте код профиля, скопированный в другом браузере или устройстве.
                  </p>
                </div>
                <textarea
                  rows={3}
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  placeholder="Вставьте Base64-код профиля..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono-num text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />
                {restoreError && (
                  <div className="text-xs text-rose-300">{restoreError}</div>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-medium text-white cursor-pointer"
                  >
                    Восстановить и войти
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold text-white mb-1">
                  {mode === 'register' ? 'Создать профиль ученика' : 'Вход в профиль'}
                </h2>
                <p className="text-xs text-slate-400 mb-5">
                  {mode === 'register'
                    ? 'Только никнейм, пароль и выбор программы — без почты и телефона.'
                    : 'Введите ваш никнейм и пароль или выберите профиль выше.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="auth-nickname"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      Никнейм
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="auth-nickname"
                        type="text"
                        required
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Например: Алексей_11А"
                        className="w-full bg-[#080B14]/90 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      Пароль
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="auth-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Минимум 3 символа"
                        className="w-full bg-[#080B14]/90 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  {mode === 'register' && !isInvited && (
                    <div>
                      <label
                        htmlFor="auth-invite-code"
                        className="block text-xs font-medium text-slate-300 mb-1.5"
                      >
                        Код приглашения
                      </label>
                      <div className="relative">
                        <Ticket className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-invite-code"
                          type="text"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          placeholder="Введите код от преподавателя"
                          className="w-full bg-[#080B14]/90 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'register' && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
                        <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                        <span>Класс или экзамен</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {GRADE_OPTIONS.map((opt) => {
                          const selected = grade === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setGrade(opt.value)}
                              className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer whitespace-nowrap truncate ${
                                selected
                                  ? 'bg-violet-600/20 border-violet-500 text-violet-100'
                                  : 'bg-[#080B14]/80 border-slate-800 text-slate-300 hover:border-violet-500/50 hover:text-white'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div
                      role="alert"
                      className="px-3.5 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    <span>
                      {mode === 'register' ? 'Начать обучение' : 'Войти в кабинет'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

