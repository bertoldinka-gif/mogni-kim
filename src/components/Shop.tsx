import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Crown,
  Gift,
  Lock,
  Palette,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  LOOTBOX_COST,
  MENTORS,
  MENTOR_HIRE_COST,
  MentorCharacter,
} from '../data/petsData';
import { DEFAULT_THEME_ID, ThemeDefinition, UI_THEMES } from '../data/themesData';
import { UserProfile } from '../types/platform';
import {
  LootboxReward,
  buyOrEquipTheme,
  equipMentor,
  equipTheme,
  hireMentorDirect,
  openFipiLootbox,
} from '../utils/storage';
import { AnimatedXpValue, FloatingXpBadge, useXpDeltaToast } from './AnimatedXpCounter';
import { MentorAvatar } from './MentorAvatar';
import { GIFT_CATALOG, OwnedGiftRecord, loadUserGifts } from '../data/giftsData';
import { buyShopGift } from '../utils/storage';

interface ShopProps {
  user: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
}

export const Shop: React.FC<ShopProps> = ({ user, onUserUpdated }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [lastReward, setLastReward] = useState<LootboxReward | null>(null);
  const [shopError, setShopError] = useState<string | null>(null);
const [boughtGift, setBoughtGift] = useState<OwnedGiftRecord | null>(null);

const handleBuyGift = (giftId: string) => {
  setShopError(null);
  const res = buyShopGift(user, giftId);
  if (res.error) {
    setShopError(res.error);
    return;
  }
  onUserUpdated(res.user);
  if (res.gift) setBoughtGift(res.gift);
};

  const unlockedMentors = user.unlockedMentors ?? [];
  const activeMentorId = user.activeMentorId ?? null;
  const unlockedCount = unlockedMentors.length;
  const unlockedThemes = user.unlockedThemes ?? [DEFAULT_THEME_ID];
  const activeTheme = user.activeTheme ?? DEFAULT_THEME_ID;
  const xpToast = useXpDeltaToast(user.xp);

  const handleOpenLootbox = () => {
    if (isOpening || user.xp < LOOTBOX_COST) return;
    setShopError(null);
    setLastReward(null);
    setIsOpening(true);

    setTimeout(() => {
      const result = openFipiLootbox(user);
      setIsOpening(false);
      if (result.error) {
        setShopError(result.error);
        return;
      }
      onUserUpdated(result.user);
      if (result.reward) {
        setLastReward(result.reward);
      }
    }, 750);
  };

  const handleHireOrSelect = (mentor: MentorCharacter) => {
    setShopError(null);
    const isOwned = unlockedMentors.includes(mentor.id);
    if (isOwned) {
      const nextMentorId = activeMentorId === mentor.id ? null : mentor.id;
      onUserUpdated(equipMentor(user, nextMentorId));
      return;
    }

    const res = hireMentorDirect(user, mentor.id);
    if (res.error) {
      setShopError(res.error);
      return;
    }
    onUserUpdated(res.user);
  };

  const handleBuyOrSelectTheme = (theme: ThemeDefinition) => {
    setShopError(null);
    const isOwned = unlockedThemes.includes(theme.id);
    if (isOwned) {
      onUserUpdated(equipTheme(user, theme.id));
      return;
    }
    const res = buyOrEquipTheme(user, theme.id);
    if (res.error) {
      setShopError(res.error);
      return;
    }
    onUserUpdated(res.user);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Магазин наставников
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Открывайте AI-наставников и редкие титулы за заработанные XP.
          </p>
        </div>

        <div className="shop-balance-pill relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 w-fit shrink-0">
          <Zap className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-slate-400">Баланс:</span>
          <span className="font-mono-num text-base font-bold text-white">
            <AnimatedXpValue value={user.xp} durationMs={600} suffix=" XP" />
          </span>
          {xpToast && (
            <FloatingXpBadge
              toastKey={xpToast.key}
              delta={xpToast.delta}
              className="-top-2 right-1"
            />
          )}
        </div>
      </div>

      {/* Secret FIPI Lootbox Banner */}
      <div className="shop-lootbox-banner relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-violet-950/70 via-slate-900/95 to-amber-950/40 backdrop-blur-md border border-violet-500/30 shadow-xl shadow-black/30">
        <Sparkles className="w-28 h-28 opacity-10 -bottom-5 -right-5 absolute pointer-events-none text-amber-400" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <motion.div
              animate={
                isOpening
                  ? {
                      rotate: [-8, 8, -10, 10, -6, 6, 0],
                      scale: [1, 1.08, 1.04, 1.1, 1],
                    }
                  : { rotate: 0, scale: 1 }
              }
              transition={{ duration: 0.7 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/25 to-violet-600/25 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/40"
            >
              <Gift className="w-8 h-8 text-amber-300" />
            </motion.div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  Секретный сундук ФИПИ
                </h2>
                <span className="font-mono-num px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-xs font-semibold text-amber-300">
                  {LOOTBOX_COST} XP
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Испытайте удачу и получите случайную награду из хранилища:
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono-num">
                <span className="text-violet-300">50% — Новый наставник</span>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-300">20% — Тема оформления</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300">20% — Редкий титул</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-300">10% — Кэшбэк +50…150 XP</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isOpening || user.xp < LOOTBOX_COST}
            onClick={handleOpenLootbox}
            className="shop-locked-cta inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-lg shadow-amber-950/40 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isOpening
                ? 'Открываем сундук...'
                : user.xp < LOOTBOX_COST
                ? `Нужно ${LOOTBOX_COST} XP`
                : `Открыть за ${LOOTBOX_COST} XP`}
            </span>
          </button>
        </div>

        {/* Lootbox Drop Reveal */}
        <AnimatePresence>
          {lastReward && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              className="shop-lootbox-reveal relative z-10 mt-5 p-4 rounded-xl bg-[#080B14]/85 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {lastReward.kind === 'mentor' && lastReward.mentor && (
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <div className="relative shrink-0">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-500/35 via-violet-500/30 to-amber-400/35 blur-lg pointer-events-none"
                    />
                    <MentorAvatar
                      mentor={lastReward.mentor}
                      size="2xl"
                      ringTone="amber"
                      className="relative ring-2 ring-amber-400/80 shadow-[0_0_28px_rgba(245,158,11,0.35),0_0_44px_rgba(139,92,246,0.3)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-emerald-400">
                      Новый наставник разблокирован!
                    </div>
                    <div className="font-display text-lg font-bold text-white">
                      {lastReward.mentor.name} — {lastReward.mentor.role}
                    </div>
                    {lastReward.note && (
                      <div className="text-xs text-slate-400">{lastReward.note}</div>
                    )}
                  </div>
                </div>
              )}

              {lastReward.kind === 'theme' && lastReward.theme && (
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl border border-slate-700/80 p-2 flex flex-col justify-between shrink-0 shadow-lg"
                    style={{ backgroundColor: lastReward.theme.bgMain }}
                  >
                    <div
                      className="h-3 rounded"
                      style={{ backgroundColor: lastReward.theme.bgCard }}
                    />
                    <div className="flex items-center gap-1">
                      <span
                        className="h-2.5 flex-1 rounded-full"
                        style={{ backgroundColor: lastReward.theme.accentPrimary }}
                      />
                      <span
                        className="h-2.5 flex-1 rounded-full"
                        style={{ backgroundColor: lastReward.theme.accentSecondary }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-cyan-300">
                      Открыта и применена тема оформления!
                    </div>
                    <div className="font-display text-base font-bold text-white">
                      «{lastReward.theme.name}»
                    </div>
                    {lastReward.note && (
                      <div className="text-xs text-slate-400">{lastReward.note}</div>
                    )}
                  </div>
                </div>
              )}

              {lastReward.kind === 'title' && lastReward.title && (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-300">
                      Выпал редкий титул (установлен в профиль)!
                    </div>
                    <div className="font-display text-base font-bold text-white">
                      «{lastReward.title}»
                    </div>
                    {lastReward.note && (
                      <div className="text-xs text-slate-400">{lastReward.note}</div>
                    )}
                  </div>
                </div>
              )}

              {lastReward.kind === 'xp' && (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-400">
                      Утешительный кэшбэк XP!
                    </div>
                    <div className="font-display text-base font-bold text-white">
                      +{lastReward.xpAmount} XP возвращено на баланс
                    </div>
                    {lastReward.note && (
                      <div className="text-xs text-slate-400">{lastReward.note}</div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {shopError && (
          <div className="relative z-10 mt-4 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {shopError}
          </div>
        )}
      </div>

      {/* Direct Mentor Hire Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Прямой наём наставников
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Наставник комментирует ваши ошибки и серии прямо во время решения заданий.
            </p>
          </div>
          <span className="font-mono-num text-xs text-slate-400 whitespace-nowrap">
            Открыто: {unlockedCount} / {MENTORS.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MENTORS.map((mentor) => {
            const isOwned = unlockedMentors.includes(mentor.id);
            const isActive = activeMentorId === mentor.id;
            const hireCost = mentor.price ?? MENTOR_HIRE_COST;
            const canAfford = user.xp >= hireCost;

            return (
              <div
                key={mentor.id}
                className={`shop-mentor-card relative overflow-hidden p-5 rounded-xl ${mentor.cardGradient} backdrop-blur-md border transition-all duration-200 flex flex-col justify-between gap-4 ${
                  isActive
                    ? 'shop-card-active border-emerald-500/70 shadow-lg shadow-emerald-950/30'
                    : isOwned
                    ? 'border-slate-700/80 hover:border-violet-500/50'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="relative flex flex-col items-center text-center pt-1">
                    {isActive ? (
                      <span className="absolute top-0 right-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 whitespace-nowrap">
                        <Check className="w-3 h-3" />
                        <span>Активен</span>
                      </span>
                    ) : !isOwned ? (
                      <Lock className="w-4 h-4 text-slate-500 absolute top-0.5 right-0.5" />
                    ) : null}

                    <MentorAvatar
                      mentor={mentor}
                      size="xl"
                      locked={!isOwned}
                      ringTone={isActive ? 'emerald' : 'violet'}
                    />

                    <div className="mt-3 min-w-0 w-full">
                      <h3 className="font-display text-base sm:text-lg font-semibold text-white truncate">
                        {mentor.name}
                      </h3>
                      <p className="shop-mentor-tagline text-xs font-medium text-indigo-300/90 truncate mt-0.5">
                        {mentor.tagline ?? mentor.role}
                      </p>
                      {mentor.description && (
                        <p className="shop-mentor-desc text-[11px] text-slate-300/85 leading-relaxed mt-1.5 line-clamp-3">
                          {mentor.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sample quote */}
                  <p className="shop-quote-box text-xs text-slate-300/90 italic leading-relaxed bg-[#080B14]/60 border border-slate-800/70 rounded-lg p-3">
                    «{mentor.mistakeQuotes[0]}»
                  </p>
                </div>

                <div className="pt-1">
                  {isOwned ? (
                    <button
                      type="button"
                      onClick={() => handleHireOrSelect(mentor)}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'shop-active-btn bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/30'
                          : 'shop-secondary-btn bg-slate-800/90 hover:bg-violet-600 text-white border border-slate-700 hover:border-violet-500'
                      }`}
                    >
                      {isActive ? 'Активен (нажмите, чтобы снять)' : 'Выбрать'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleHireOrSelect(mentor)}
                      className="shop-locked-cta w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Нанять за {hireCost} XP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UI Themes Showcase Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-400" />
              <span>Темы оформления сайта</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Меняйте атмосферу тренажёра: палитра сохраняется в профиле и работает вместе с режимом для дислексиков.
            </p>
          </div>
          <span className="font-mono-num text-xs text-slate-400 whitespace-nowrap">
            Открыто: {unlockedThemes.length} / {UI_THEMES.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {UI_THEMES.map((theme) => {
            const isOwned = unlockedThemes.includes(theme.id);
            const isActive = activeTheme === theme.id;
            const canAfford = user.xp >= theme.cost;

            return (
              <div
                key={theme.id}
                className={`shop-theme-card p-5 rounded-xl bg-slate-900/75 backdrop-blur-md border transition-all flex flex-col justify-between gap-4 ${
                  isActive
                    ? 'shop-card-active border-emerald-500/70 shadow-lg shadow-emerald-950/30'
                    : isOwned
                    ? 'border-slate-700/80 hover:border-cyan-500/50'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Mini Theme Color Preview */}
                  <div
                    className="relative h-20 rounded-xl border border-slate-700/70 p-3 flex flex-col justify-between overflow-hidden"
                    style={{ backgroundColor: theme.bgMain }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {theme.previewSwatches.map((hex, i) => (
                          <span
                            key={`${theme.id}-sw-${i}`}
                            className="w-4 h-4 rounded-full border border-white/15 shadow-xs"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300">
                          <Check className="w-3 h-3" />
                          <span>Активна</span>
                        </span>
                      ) : !isOwned ? (
                        <span className="shop-theme-price-pill font-mono-num px-2 py-0.5 rounded bg-slate-900/85 border border-white/15 text-[11px] font-semibold text-white">
                          {theme.cost} XP
                        </span>
                      ) : null}
                    </div>

                    <div
                      className="h-6 rounded-lg border border-white/10 px-2.5 flex items-center justify-between"
                      style={{ backgroundColor: theme.bgCard }}
                    >
                      <span
                        className="h-2 w-16 rounded-full"
                        style={{ backgroundColor: theme.accentPrimary }}
                      />
                      <span
                        className="h-2 w-9 rounded-full"
                        style={{ backgroundColor: theme.accentSecondary }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {theme.description}
                    </p>
                  </div>
                </div>

                <div>
                  {isOwned ? (
                    <button
                      type="button"
                      disabled={isActive}
                      onClick={() => handleBuyOrSelectTheme(theme)}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'shop-active-btn bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 cursor-default'
                          : 'shop-secondary-btn bg-slate-800/90 hover:bg-violet-600 text-white border border-slate-700 hover:border-violet-500 cursor-pointer'
                      }`}
                    >
                                           {isActive ? 'Активна' : 'Применить'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuyOrSelectTheme(theme)}
                      className="shop-locked-cta w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Купить за {theme.cost} XP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collectible Gifts Showcase */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <span>Витрина коллекционных подарков</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Подарите себе трофей с личной подписью активного наставника — он появится на полке в
              профиле, где его можно улучшить до редкого!
            </p>
          </div>
          <span className="font-mono-num text-xs text-slate-400 whitespace-nowrap">
            На полке: {loadUserGifts(user.id).length} шт.
          </span>
        </div>

        {boughtGift && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-emerald-200">
            <span>
              🎉 Подарок{' '}
              <strong>
                {GIFT_CATALOG.find((g) => g.id === boughtGift.giftId)?.name} #
                {boughtGift.serialNumber}
              </strong>{' '}
              отправлен на вашу полку в «Личном кабинете»!
            </span>
            <button
              type="button"
              onClick={() => setBoughtGift(null)}
              className="text-xs underline text-emerald-300 hover:text-white cursor-pointer"
            >
              Скрыть
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GIFT_CATALOG.map((gift) => {
            const canAfford = user.xp >= gift.cost;
            return (
              <div
                key={gift.id}
                className="p-5 rounded-xl bg-slate-900/75 backdrop-blur-md border border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#080B14]/90 border border-slate-800 flex items-center justify-center text-3xl">
                      {gift.emoji}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        gift.limited
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                          : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                      }`}
                    >
                      {gift.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {gift.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {gift.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handleBuyGift(gift.id)}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-white shadow-lg shadow-amber-950/30 transition-all cursor-pointer whitespace-nowrap"
                >
                  Подарить себе за {gift.cost} XP
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

