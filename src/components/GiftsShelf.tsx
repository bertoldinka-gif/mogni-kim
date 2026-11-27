import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Award, Calendar, Gift, Hash, Sparkles, X, Zap } from 'lucide-react';
import {
  GIFT_CATALOG,
  GIFT_UPGRADE_COST,
  GIFT_UPGRADE_RARITIES,
  OwnedGiftRecord,
  loadUserGifts,
} from '../data/giftsData';
import { getMentorById } from '../data/petsData';
import { UserProfile } from '../types/platform';

interface GiftsShelfProps {
  user: UserProfile;
  onUpgradeGift?: (giftUid: string) => { ok: boolean; error?: string };
}

export const GiftsShelf: React.FC<GiftsShelfProps> = ({ user, onUpgradeGift }) => {
  const [ownedGifts, setOwnedGifts] = useState<OwnedGiftRecord[]>(() =>
    loadUserGifts(user.id)
  );
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  useEffect(() => {
    setOwnedGifts(loadUserGifts(user.id));
  }, [user.id, user.xp]);

  const selectedRecord = ownedGifts.find((g) => g.uid === selectedUid) ?? null;
  const selectedMeta = selectedRecord
    ? GIFT_CATALOG.find((c) => c.id === selectedRecord.giftId)
    : null;
  const selectedRarity = selectedRecord?.upgraded
    ? GIFT_UPGRADE_RARITIES.find((r) => r.id === selectedRecord.upgraded?.rarityId)
    : null;

  const handleUpgradeClick = () => {
    if (!selectedRecord || !onUpgradeGift || isUpgrading) return;
    setUpgradeError(null);
    setIsUpgrading(true);

    window.setTimeout(() => {
      const res = onUpgradeGift(selectedRecord.uid);
      setIsUpgrading(false);
      if (!res.ok) {
        setUpgradeError(res.error ?? 'Не удалось улучшить подарок.');
        return;
      }
      setOwnedGifts(loadUserGifts(user.id));
    }, 650);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-slate-800/80 space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-300">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Полка коллекционных подарков
            </h3>
            <p className="text-[11px] text-slate-400">
              Нажмите на подарок, чтобы открыть карточку или улучшить его до редкого NFT-статуса
            </p>
          </div>
        </div>
        <span className="font-mono-num text-xs px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 shrink-0">
          {ownedGifts.length} шт.
        </span>
      </div>

      {ownedGifts.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#080B14]/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
          На вашей полке пока пусто. Загляните в{' '}
          <span className="text-amber-300 font-medium">Магазин → Витрина подарков</span>, чтобы
          забрать первый трофей!
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {ownedGifts.map((item) => {
            const meta = GIFT_CATALOG.find((c) => c.id === item.giftId);
            if (!meta) return null;
            const rarity = item.upgraded
              ? GIFT_UPGRADE_RARITIES.find((r) => r.id === item.upgraded?.rarityId)
              : null;

            return (
              <button
                key={item.uid}
                type="button"
                onClick={() => {
                  setUpgradeError(null);
                  setSelectedUid(item.uid);
                }}
                className={`group relative p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                  rarity
                    ? `${rarity.cardBg} ${rarity.borderGlow} hover:scale-[1.03]`
                    : 'bg-[#080B14]/80 border-slate-800 hover:border-violet-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="font-mono-num text-[10px] text-slate-400 self-end">
                  #{item.serialNumber}
                </span>
                <span className="text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform">
                  {meta.emoji}
                </span>
                <span className="text-[11px] font-medium text-slate-200 line-clamp-1 w-full">
                  {meta.name}
                </span>
                {rarity && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${rarity.badgeColor}`}
                  >
                    ✨ {rarity.patternSymbol}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Telegram-style Gift Card Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedRecord && selectedMeta && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
              onClick={() => setSelectedUid(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                onClick={(e) => e.stopPropagation()}
                className={
                  'relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-6 space-y-5 ' +
                  (selectedRarity
                    ? selectedRarity.cardBg + ' ' + selectedRarity.borderGlow
                    : 'bg-slate-900 border-slate-700/90 shadow-2xl')
                }
              >
                <button
                  type="button"
                  onClick={() => setSelectedUid(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center space-y-2 pt-1">
                  <motion.div
                    animate={
                      isUpgrading
                        ? { rotate: [0, -12, 12, -10, 10, 0], scale: [1, 1.18, 0.95, 1.15, 1] }
                        : { rotate: 0, scale: 1 }
                    }
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 rounded-2xl bg-black/35 border border-white/15 flex items-center justify-center text-5xl shadow-inner"
                  >
                    {selectedMeta.emoji}
                  </motion.div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono-num text-xs px-2.5 py-0.5 rounded-full bg-black/40 border border-white/15 text-slate-200">
                      <Hash className="w-3 h-3 text-amber-400" />
                      Экземпляр #{selectedRecord.serialNumber}
                    </span>
                    {selectedRarity && (
                      <span
                        className={
                          'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ' +
                          selectedRarity.badgeColor
                        }
                      >
                        <Sparkles className="w-3 h-3" />
                        {selectedRarity.name}
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-xl font-bold text-white">
                    {selectedMeta.name}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedMeta.description}
                  </p>
                </div>

                {/* Metadata Table */}
                <div className="rounded-xl bg-black/40 border border-white/10 p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-violet-400" />
                      Дата получения:
                    </span>
                    <span className="font-mono-num text-slate-200 font-medium">
                      {selectedRecord.purchasedAt}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Подпись наставника (
                      {getMentorById(selectedRecord.mentorId)?.name ?? 'Хранитель'}):
                    </span>
                    <p className="text-slate-200 italic leading-relaxed">
                      {selectedRecord.mentorSignature}
                    </p>
                  </div>
                </div>

                {/* Upgraded Legend or Upgrade CTA */}
                {selectedRecord.upgraded ? (
                  <div className="rounded-xl bg-black/50 border border-amber-400/35 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Sparkles className="w-4 h-4" />
                      <span>Коллекционная легенда артефакта</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {selectedRecord.upgraded.legend}
                    </p>
                  </div>
                ) : (
                  onUpgradeGift && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={isUpgrading || user.xp < GIFT_UPGRADE_COST}
                        onClick={handleUpgradeClick}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-fuchsia-600 to-cyan-600 hover:from-amber-400 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-bold text-white shadow-lg shadow-fuchsia-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>
                          {isUpgrading
                            ? 'Перековываем артефакт...'
                            : user.xp < GIFT_UPGRADE_COST
                            ? 'Нужно ' + GIFT_UPGRADE_COST + ' XP для улучшения'
                            : 'Улучшить за ' + GIFT_UPGRADE_COST + ' XP ✨'}
                        </span>
                      </button>

                      {upgradeError && (
                        <p className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                          {upgradeError}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 text-center">
                        Ваш баланс: {user.xp} XP
                      </p>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={() => setSelectedUid(null)}
                  className="w-full text-center text-xs text-slate-300 hover:text-white underline cursor-pointer"
                >
                  Закрыть
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
