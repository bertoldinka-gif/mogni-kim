import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Calendar,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AiExamType, countEssayWords } from '../services/aiGrader';
import { SavedEssayRecord } from '../types/platform';

interface SavedEssaysArchiveProps {
  essays: SavedEssayRecord[];
  onSaveUpdatedEssay: (record: SavedEssayRecord) => void;
  onDeleteEssay: (essayId: string) => void;
  onOpenInEditor: (record: SavedEssayRecord) => void;
  onNavigateToCurriculum: () => void;
}

type ExamFilter = 'all' | AiExamType;

const EXAM_BADGE_META: Record<
  AiExamType,
  { label: string; shortLabel: string; badgeClass: string }
> = {
  OGE_SUMMARY: {
    label: 'ОГЭ · Сжатое изложение',
    shortLabel: 'ОГЭ Изложение',
    badgeClass: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200',
  },
  OGE_ESSAY: {
    label: 'ОГЭ · Сочинение (13)',
    shortLabel: 'ОГЭ Сочинение',
    badgeClass: 'bg-sky-500/15 border-sky-500/40 text-sky-200',
  },
  EGE_ESSAY: {
    label: 'ЕГЭ · Сочинение (27)',
    shortLabel: 'ЕГЭ Сочинение',
    badgeClass: 'bg-violet-500/15 border-violet-500/40 text-violet-200',
  },
  FINAL_ESSAY: {
    label: 'Итоговое сочинение',
    shortLabel: 'Итоговое',
    badgeClass: 'bg-amber-500/15 border-amber-500/40 text-amber-200',
  },
};
const DEFAULT_EXAM_BADGE_META = {
  label: 'Письменная работа',
  shortLabel: 'Сочинение',
  badgeClass: 'bg-slate-500/15 border-slate-500/40 text-slate-200',
};

function getExamBadgeMeta(examType?: string | null) {
  if (!examType) return DEFAULT_EXAM_BADGE_META;
  const normalized = examType.toUpperCase() as AiExamType;
  return EXAM_BADGE_META[normalized] ?? DEFAULT_EXAM_BADGE_META;
}

function formatEssayDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

function buildExcerpt(text: string | null | undefined, maxLen = 190): string {
  const cleaned = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trimEnd()}…`;
}

export const SavedEssaysArchive: React.FC<SavedEssaysArchiveProps> = ({
  essays: essaysProp,
  onSaveUpdatedEssay,
  onDeleteEssay,
  onOpenInEditor,
  onNavigateToCurriculum,
}) => {
  const essays = essaysProp ?? [];

  const [filter, setFilter] = useState<ExamFilter>('all');
  const [query, setQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeRecord, setActiveRecord] = useState<SavedEssayRecord | null>(null);
  const [draftEditText, setDraftEditText] = useState('');
  const [showSourceInModal, setShowSourceInModal] = useState(false);
  const [copiedModalText, setCopiedModalText] = useState(false);
  const [savedModalNotice, setSavedModalNotice] = useState(false);

  useEffect(() => {
    if (!activeRecord) return;
    setDraftEditText(activeRecord.studentText ?? '');
    setShowSourceInModal(false);
    setCopiedModalText(false);
    setSavedModalNotice(false);
  }, [activeRecord?.id]);

  useEffect(() => {
    if (!activeRecord) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveRecord(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeRecord]);

  const filteredEssays = useMemo(() => {
    const q = query.trim().toLowerCase();
    return essays.filter((item) => {
      const normalizedType = (item.examType || '').toUpperCase();
      if (filter !== 'all' && normalizedType !== filter) return false;
      if (!q) return true;
      return (
        (item.promptTitle ?? '').toLowerCase().includes(q) ||
        (item.studentText ?? '').toLowerCase().includes(q)
      );
    });
  }, [essays, filter, query]);

  const modalWordCount = useMemo(
    () => countEssayWords(draftEditText ?? ''),
    [draftEditText]
  );

  const handleSaveModalChanges = () => {
    if (!activeRecord) return;
    const trimmed = draftEditText.trim();
    if (!trimmed) return;
    const updated: SavedEssayRecord = {
      ...activeRecord,
      studentText: trimmed,
      wordCount: countEssayWords(trimmed),
      timestamp: new Date().toISOString(),
    };
    onSaveUpdatedEssay(updated);
    setActiveRecord(updated);
    setSavedModalNotice(true);
    window.setTimeout(() => setSavedModalNotice(false), 2200);
  };

  const handleCopyModalText = async () => {
    try {
      await navigator.clipboard.writeText(draftEditText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = draftEditText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopiedModalText(true);
    window.setTimeout(() => setCopiedModalText(false), 2200);
  };

  const handleOpenInTrainer = () => {
    if (!activeRecord) return;
    const trimmed = draftEditText.trim() || activeRecord.studentText || '';
    const recordToOpen: SavedEssayRecord = {
      ...activeRecord,
      studentText: trimmed,
      wordCount: countEssayWords(trimmed),
    };
    setActiveRecord(null);
    onOpenInEditor(recordToOpen);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>Мои сочинения</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Личный архив написанных и проверенных сочинений и изложений ОГЭ, ЕГЭ и итогового сочинения.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToCurriculum}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-violet-500/60 text-sm font-medium text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span>К темам и заданиям</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/75 border border-slate-800/80">
          {(
            [
              { id: 'all', label: 'Все' },
              { id: 'OGE_SUMMARY', label: 'ОГЭ Изложение' },
              { id: 'OGE_ESSAY', label: 'ОГЭ Сочинение' },
              { id: 'EGE_ESSAY', label: 'ЕГЭ Сочинение' },
              { id: 'FINAL_ESSAY', label: 'Итоговое' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по теме или тексту..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/75 border border-slate-800/80 focus:border-violet-500 focus:outline-none text-xs sm:text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </div>

      {essays.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="font-display text-lg font-semibold text-white">
              Архив сочинений пока пуст
            </h2>
            <p className="text-sm text-slate-400">
              Откройте любое изложение или сочинение в разделах ОГЭ/ЕГЭ и нажмите «Сохранить работу» или «Проверить по критериям» — работа появится здесь.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToCurriculum}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Выбрать задание</span>
          </button>
        </div>
      ) : filteredEssays.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-center text-sm text-slate-400">
          По выбранному фильтру или запросу работ не найдено.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEssays.map((record) => {
            const meta = getExamBadgeMeta(record.examType);
            const report = record.gradingReport;
            const isConfirmingDelete = confirmDeleteId === record.id;

            return (
              <div
                key={record.id}
                className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-xs font-semibold ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono-num">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatEssayDate(record.timestamp)}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-xs font-mono-num text-slate-300">
                      {record.wordCount ?? 0} сл.
                    </span>
                  </div>

                  {report && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-mono-num font-bold ${
                        report.isPassFail
                          ? report.overallPassed
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                          : 'bg-violet-500/15 border-violet-500/40 text-violet-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {report.isPassFail
                          ? report.overallPassed
                            ? 'ИТОГ: ЗАЧЁТ'
                            : 'ИТОГ: НЕЗАЧЁТ'
                          : `${report.totalScore} / ${report.maxTotalScore} б.`}
                      </span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-display text-base font-semibold text-white leading-snug">
                    {record.promptTitle || 'Без названия'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {buildExcerpt(record.studentText)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveRecord(record)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600/90 to-indigo-600/90 hover:from-violet-500 hover:to-indigo-500 text-xs sm:text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Читать / Редактировать</span>
                  </button>

                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-300">Удалить работу?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteEssay(record.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-medium text-white cursor-pointer"
                      >
                        Да, удалить
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(record.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-800 hover:border-rose-500/40 text-xs font-medium text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Удалить</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Reader / Editor Modal via Portal */}
      {activeRecord &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="saved-essay-modal-title"
          >
            <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0B0F1D] border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-5">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-xs font-semibold ${
                        getExamBadgeMeta(activeRecord.examType).badgeClass
                      }`}
                    >
                      {getExamBadgeMeta(activeRecord.examType).label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-num">
                      {formatEssayDate(activeRecord.timestamp)}
                    </span>
                  </div>
                  <h3
                    id="saved-essay-modal-title"
                    className="font-display text-base sm:text-lg font-bold text-white leading-snug"
                  >
                    {activeRecord.promptTitle || 'Без названия'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveRecord(null)}
                  aria-label="Закрыть окно"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Optional Collapsible Source Text */}
              {activeRecord.sourceText && (
                <div className="rounded-xl bg-[#080B14]/80 border border-slate-800/80 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowSourceInModal((v) => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-violet-400" />
                      <span>Исходный текст задания</span>
                    </span>
                    <span className="text-violet-400">
                      {showSourceInModal ? 'Свернуть' : 'Показать'}
                    </span>
                  </button>
                  {showSourceInModal && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 max-h-48 overflow-y-auto whitespace-pre-line">
                      {activeRecord.sourceText}
                    </div>
                  )}
                </div>
              )}

              {/* Editable Student Essay Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <label
                    htmlFor="modal-essay-editor"
                    className="font-medium text-slate-300"
                  >
                    Текст работы (можно отредактировать и сохранить)
                  </label>
                  <span className="font-mono-num font-semibold px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">
                    {modalWordCount} слов
                  </span>
                </div>
                <textarea
                  id="modal-essay-editor"
                  rows={10}
                  value={draftEditText}
                  onChange={(e) => setDraftEditText(e.target.value)}
                  className="w-full rounded-xl bg-[#080B14]/90 border border-slate-800 focus:border-violet-500 focus:outline-none p-3.5 text-sm text-slate-100 leading-relaxed resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!draftEditText.trim()}
                    onClick={handleSaveModalChanges}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-50 ${
                      savedModalNotice
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    {savedModalNotice ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Изменения сохранены</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Сохранить изменения</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyModalText}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#080B14] border border-slate-700 hover:border-slate-500 text-xs sm:text-sm font-medium text-slate-200 cursor-pointer"
                  >
                    {copiedModalText ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-400" />
                        <span>Скопировать текст</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenInTrainer}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-xs sm:text-sm font-medium text-cyan-200 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Открыть в тренажёре</span>
                </button>
              </div>

              {/* Saved ФИПИ Grading Report */}
              {activeRecord.gradingReport && (
                <div className="p-4 sm:p-5 rounded-xl bg-[#080B14]/90 border border-violet-500/35 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-violet-300">
                        Сохранённый отчёт по критериям ФИПИ
                      </div>
                      <div className="text-sm sm:text-base font-display font-semibold text-white mt-0.5">
                        {activeRecord.gradingReport.verdictLabel}
                      </div>
                    </div>

                    {activeRecord.gradingReport.isPassFail ? (
                      <div
                        className={`px-3.5 py-1.5 rounded-xl border text-center ${
                          activeRecord.gradingReport.overallPassed
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        }`}
                      >
                        <div className="font-display text-sm sm:text-base font-bold">
                          {activeRecord.gradingReport.overallPassed
                            ? 'ИТОГ: ЗАЧЁТ'
                            : 'ИТОГ: НЕЗАЧЁТ'}
                        </div>
                      </div>
                    ) : (
                      <div className="px-3.5 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/40 text-right">
                        <div className="font-mono-num text-lg font-bold text-white">
                          {activeRecord.gradingReport.totalScore}{' '}
                          <span className="text-xs font-normal text-slate-400">
                            / {activeRecord.gradingReport.maxTotalScore}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {activeRecord.gradingReport.requirements &&
                    activeRecord.gradingReport.requirements.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeRecord.gradingReport.requirements.map((req) => (
                          <div
                            key={req.code}
                            className={`p-3 rounded-xl border space-y-1 ${
                              req.passed
                                ? 'bg-emerald-500/10 border-emerald-500/35'
                                : 'bg-rose-500/10 border-rose-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-white">
                                {req.title}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded ${
                                  req.passed
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {req.statusLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {req.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(activeRecord.gradingReport.criteria ?? []).map((crit) => {
                      const isPassFail = Boolean(
                        activeRecord.gradingReport?.isPassFail
                      );
                      const passed = isPassFail
                        ? Boolean(crit.passed)
                        : crit.score === crit.maxScore;
                      const zeroScore = isPassFail ? !passed : crit.score === 0;

                      return (
                        <div
                          key={crit.code}
                          className={`p-3 rounded-xl border space-y-1 ${
                            passed
                              ? 'bg-emerald-500/10 border-emerald-500/35'
                              : zeroScore
                              ? 'bg-rose-500/10 border-rose-500/35'
                              : 'bg-slate-900/75 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white">
                              <span className="font-mono-num text-violet-300 mr-1.5">
                                {crit.code}
                              </span>
                              {crit.title}
                            </span>
                            {isPassFail ? (
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded ${
                                  passed
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {crit.statusLabel ?? (passed ? 'Зачёт' : 'Незачёт')}
                              </span>
                            ) : (
                              <span
                                className={`font-mono-num text-xs font-bold px-2 py-0.5 rounded ${
                                  passed
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : zeroScore
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-500/15 text-amber-300'
                                }`}
                              >
                                {crit.score}/{crit.maxScore}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {crit.comment}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
