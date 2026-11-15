import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  BookmarkX,
  Check,
  ClipboardCheck,
  Copy,
  Crown,
  Eye,
  FileText,
  Flame,
  Gift,
  History,
  LayoutDashboard,
  LogOut,
  Send,
  Upload,
  Zap,
  X,
} from 'lucide-react';
import { GRADE_OPTIONS, getSprintsForGrade } from '../data/curriculum';
import { DEFAULT_TITLE, getMentorById } from '../data/petsData';
import {
  ActiveNavSection,
  GradeLevel,
  SprintModule,
  UserProfile,
} from '../types/platform';
import {
  exportProfileBackupCode,
  importProfileBackupCode,
} from '../utils/storage';
import { AnimatedXpValue, FloatingXpBadge, useXpDeltaToast } from './AnimatedXpCounter';
import { LogoMark } from './LogoMark';
import { MentorAvatar } from './MentorAvatar';

interface SidebarProps {
  user: UserProfile;
  activeSection: ActiveNavSection;
  mistakeCount: number;
  dyslexiaMode: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onToggleDyslexiaMode: () => void;
  onSelectSection: (section: ActiveNavSection) => void;
  onStartSprint: (sprint: SprintModule) => void;
  onStartMockTest: () => void;
  onGradeChange: (grade: GradeLevel) => void;
  onTitleChange: (title: string) => void;
  onProfileRestored: (user: UserProfile) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeSection,
  mistakeCount,
  dyslexiaMode,
  isOpenMobile,
  onCloseMobile,
  onToggleDyslexiaMode,
  onSelectSection,
  onStartSprint,
  onStartMockTest,
  onGradeChange,
  onTitleChange,
  onProfileRestored,
  onLogout,
}) => {
  const sprints = getSprintsForGrade(user.grade);
  const showMockTest = user.grade === 'oge' || user.grade === 'ege';
  const activeMentor = getMentorById(user.activeMentorId);
  const historyCount = user.attemptHistory?.length ?? 0;
  const mockExamCount = user.mockExamHistory?.length ?? 0;
  const savedEssaysCount = user.savedEssays?.length ?? 0;
  const unlockedTitles =
    user.unlockedTitles && user.unlockedTitles.length > 0
      ? user.unlockedTitles
      : [DEFAULT_TITLE];
  const activeTitle = user.activeTitle || DEFAULT_TITLE;
  const xpToast = useXpDeltaToast(user.xp);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreInput, setRestoreInput] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleCopyBackupCode = async () => {
    const code = exportProfileBackupCode(user);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedCode(true);
        window.setTimeout(() => setCopiedCode(false), 2500);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreError(null);
    const result = importProfileBackupCode(restoreInput);
    if (result.error) {
      setRestoreError(result.error);
      return;
    }
    if (result.user) {
      setRestoreInput('');
      setShowRestoreModal(false);
      onCloseMobile();
      onProfileRestored(result.user);
    }
  };

  const handleNav = (section: ActiveNavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-r-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
      isActive
        ? 'bg-gradient-to-r from-violet-500/15 to-transparent border-l-2 border-violet-400 text-white'
        : 'border-l-2 border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg'
    }`;

  const sidebarContent = (
    <aside className="w-64 h-full bg-[#0B0F1D]/95 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between select-none">
      <div className="p-3.5 space-y-4 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1.5 pt-1">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
              могни КИМ
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Закрыть меню"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Badge: Active Mentor, Title Selector, XP & Grade Switcher */}
        <div className="p-3 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {activeMentor ? (
                <MentorAvatar mentor={activeMentor} size="sm" ringTone="amber" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800/80 ring-2 ring-slate-700/80 flex items-center justify-center text-xs font-display font-bold text-slate-400 shrink-0">
                  {user.nickname.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-display text-sm font-semibold text-white truncate">
                  {user.nickname}
                </div>
                {activeMentor && (
                  <div className="text-[10px] text-slate-400 truncate">
                    {activeMentor.name}
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex items-center gap-2 text-xs font-mono-num shrink-0">
              <span className="text-violet-400 font-semibold">
                <AnimatedXpValue value={user.xp} durationMs={600} suffix=" XP" />
              </span>
              <span className="inline-flex items-center gap-0.5 text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                {user.streak}
              </span>
              {xpToast && (
                <FloatingXpBadge
                  toastKey={xpToast.key}
                  delta={xpToast.delta}
                  className="-top-2 right-0"
                />
              )}
            </div>
          </div>

          {/* Active Title Quick Selector */}
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {unlockedTitles.length > 1 ? (
              <select
                aria-label="Выбрать титул профиля"
                value={activeTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full bg-[#080B14] border border-slate-800 hover:border-amber-500/40 rounded-md px-2 py-1 text-[11px] font-medium text-amber-200 focus:outline-none focus:border-amber-500 cursor-pointer truncate"
              >
                {unlockedTitles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[11px] font-medium text-amber-200/90 truncate">
                {activeTitle}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="quick-grade-switch" className="sr-only">
              Переключить класс или экзамен
            </label>
            <select
              id="quick-grade-switch"
              value={user.grade}
              onChange={(e) => onGradeChange(e.target.value as GradeLevel)}
              className="w-full bg-[#080B14] border border-slate-800 hover:border-violet-500/50 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer transition-colors"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1" aria-label="Основная навигация">
          <button
            type="button"
            onClick={() => handleNav('dashboard')}
            className={navItemClass(activeSection === 'dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-violet-400" />
            <span>Дашборд</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('curriculum')}
            className={navItemClass(activeSection === 'curriculum')}
          >
            <BookOpen className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>Темы / Задания</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('mistakes')}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-r-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'mistakes'
                ? 'bg-gradient-to-r from-violet-500/15 to-transparent border-l-2 border-violet-400 text-white'
                : 'border-l-2 border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg'
            }`}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <BookmarkX className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="whitespace-nowrap">Работа над ошибками</span>
            </span>
            {mistakeCount > 0 && (
              <span className="font-mono-num px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-[11px] font-semibold text-rose-300 shrink-0">
                {mistakeCount}
              </span>
            )}
          </button>

          {/* Attempt History Navigation Item */}
          <button
            type="button"
            onClick={() => handleNav('history')}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-r-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'history'
                ? 'bg-gradient-to-r from-violet-500/15 to-transparent border-l-2 border-violet-400 text-white'
                : 'border-l-2 border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg'
            }`}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <History className="w-4 h-4 shrink-0 text-indigo-400" />
              <span className="whitespace-nowrap">История решений</span>
            </span>
            {historyCount > 0 && (
              <span className="font-mono-num px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-semibold text-indigo-300 shrink-0">
                {historyCount}
              </span>
            )}
          </button>

          {/* Mock Exam Journal Navigation Item */}
          <button
            type="button"
            onClick={() => handleNav('mock_journal')}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-r-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'mock_journal'
                ? 'bg-gradient-to-r from-violet-500/15 to-transparent border-l-2 border-violet-400 text-white'
                : 'border-l-2 border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg'
            }`}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <ClipboardCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="whitespace-nowrap">Журнал пробников</span>
            </span>
            {mockExamCount > 0 && (
              <span className="font-mono-num px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 shrink-0">
                {mockExamCount}
              </span>
            )}
          </button>

          {/* Saved Essays Archive Navigation Item */}
          <button
            type="button"
            onClick={() => handleNav('saved_essays')}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-r-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'saved_essays'
                ? 'bg-gradient-to-r from-violet-500/15 to-transparent border-l-2 border-violet-400 text-white'
                : 'border-l-2 border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg'
            }`}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <FileText className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="whitespace-nowrap">Мои сочинения</span>
            </span>
            {savedEssaysCount > 0 && (
              <span className="font-mono-num px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-semibold text-cyan-300 shrink-0">
                {savedEssaysCount}
              </span>
            )}
          </button>

          {/* Shop Navigation Item */}
          <button
            type="button"
            onClick={() => handleNav('shop')}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-r-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'shop'
                ? 'bg-gradient-to-r from-violet-500/15 to-transparent border-l-2 border-violet-400 text-white'
                : 'border-l-2 border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg'
            }`}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Gift className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Магазин</span>
            </span>
            <span className="font-mono-num px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-300 shrink-0">
              <AnimatedXpValue value={user.xp} durationMs={600} suffix=" XP" />
            </span>
          </button>

          {/* Mentor Rule Chat (Справочник) */}
          <button
            type="button"
            onClick={() => handleNav('rules_chat')}
            className={navItemClass(activeSection === 'rules_chat')}
          >
            <Send className="w-4 h-4 shrink-0 text-sky-400" />
            <span>Справочник</span>
          </button>

          {showMockTest && (
            <button
              type="button"
              onClick={() => {
                onStartMockTest();
                onCloseMobile();
              }}
              className={navItemClass(activeSection === 'mock_test')}
            >
              <ClipboardCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Комплексный тест</span>
            </button>
          )}
        </nav>

        {/* Sprints Section */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <button
            type="button"
            onClick={() => handleNav('sprints')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSection === 'sprints'
                ? 'text-violet-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Спринты (10 вопр.)</span>
            </span>
          </button>

          <div className="space-y-0.5 pl-2">
            {sprints.map((sprint) => (
              <button
                key={sprint.id}
                type="button"
                onClick={() => {
                  onStartSprint(sprint);
                  onCloseMobile();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer truncate"
              >
                {sprint.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Dyslexia Toggle + Portability Backup + Logout */}
      <div className="p-3.5 border-t border-slate-800/80 space-y-2.5">
        <button
          type="button"
          role="switch"
          aria-checked={dyslexiaMode}
          onClick={onToggleDyslexiaMode}
          className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border transition-colors cursor-pointer ${
            dyslexiaMode
              ? 'bg-amber-500/15 border-amber-500/45 text-amber-200'
              : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
          }`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Eye
              className={`w-4 h-4 shrink-0 ${
                dyslexiaMode ? 'text-amber-300' : 'text-slate-400'
              }`}
            />
            <span className="text-xs font-medium truncate">
              Режим для дислексиков
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              dyslexiaMode ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                dyslexiaMode ? 'translate-x-4.5' : 'translate-x-1'
              }`}
            />
          </span>
        </button>

        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Перенос прогресса
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={handleCopyBackupCode}
              className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                copiedCode
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#080B14]/80 border-slate-800 hover:border-violet-500/50 text-slate-300 hover:text-white'
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Код скопирован!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                  <span>Скопировать код профиля</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setRestoreError(null);
                setRestoreInput('');
                setShowRestoreModal(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#080B14]/80 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span>Восстановить профиль</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Выйти из профиля</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}

      {/* Restore Profile Modal via Portal */}
      {showRestoreModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-profile-title"
          >
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#0B0F1D] border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3
                  id="restore-profile-title"
                  className="font-display text-lg font-bold text-white"
                >
                  Восстановить профиль
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRestoreModal(false)}
                  aria-label="Закрыть окно"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Вставьте резервный Base64-код профиля. Все XP, наставники, титулы, ошибки и
                прогресс заданий будут перенесены на это устройство.
              </p>

              <form onSubmit={handleRestoreSubmit} className="space-y-3">
                <textarea
                  rows={4}
                  value={restoreInput}
                  onChange={(e) => setRestoreInput(e.target.value)}
                  placeholder="Вставьте код профиля..."
                  className="w-full bg-[#080B14] border border-slate-700 rounded-xl p-3 text-xs font-mono-num text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                />

                {restoreError && (
                  <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                    {restoreError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRestoreModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-xs font-medium text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
                  >
                    Восстановить
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
