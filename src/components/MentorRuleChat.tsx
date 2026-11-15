import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookMarked,
  CheckCheck,
  Pin,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { MentorCharacter, pickRandomQuote } from '../data/petsData';
import {
  RULES_KNOWLEDGE_BASE,
  RuleKnowledgeEntry,
  findMatchingRule,
} from '../data/rulesKnowledgeBase';
import { MentorAvatar } from './MentorAvatar';

interface MentorRuleChatProps {
  activeMentor: MentorCharacter | null;
}

type ChatBubbleKind =
  | { kind: 'welcome' }
  | { kind: 'rule_summary'; rule: RuleKnowledgeEntry; introLine: string }
  | { kind: 'rule_examples'; rule: RuleKnowledgeEntry }
  | { kind: 'rule_exceptions'; rule: RuleKnowledgeEntry }
  | { kind: 'topics_directory' }
  | { kind: 'not_found'; query: string };

interface ChatMessage {
  id: string;
  sender: 'student' | 'mentor';
  text?: string;
  payload?: ChatBubbleKind;
  time: string;
}

const DEFAULT_GUIDE_NAME = 'Справочник ФИПИ';
const DEFAULT_GUIDE_INTROS = [
  'Запрос принят. Вот точный алгоритм правила из базы ФИПИ:',
  'Разберём это правило чётко и по шагам:',
];

const TELEGRAM_DOODLE_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140" fill="none">
    <g stroke="rgba(255,255,255,0.038)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 24l8-4-2 9-6-5z"/>
      <circle cx="72" cy="26" r="6"/>
      <path d="M112 18c4 0 7 3 7 7s-3 7-7 7-7-3-7-7"/>
      <path d="M24 76h14M31 69v14"/>
      <path d="M68 72l10-8 6 12-16-4z"/>
      <path d="M108 78c6-8 14-8 20 0"/>
      <path d="M22 118c4-5 10-5 14 0"/>
      <rect x="64" y="108" width="12" height="12" rx="3" transform="rotate(15 70 114)"/>
      <path d="M114 112l8 8m0-8l-8 8"/>
    </g>
  </svg>`
);

function formatNowTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export const MentorRuleChat: React.FC<MentorRuleChatProps> = ({ activeMentor }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'mentor',
      payload: { kind: 'welcome' },
      time: formatNowTime(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mentorName = activeMentor?.name ?? DEFAULT_GUIDE_NAME;
  const mentorAccentText = activeMentor?.accentText ?? 'text-cyan-300';

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const filteredQuickTopics = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return RULES_KNOWLEDGE_BASE;
    return RULES_KNOWLEDGE_BASE.filter(
      (r) =>
        r.topicTitle.toLowerCase().includes(q) ||
        r.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [searchFilter]);

  const scheduleMentorReply = (payload: ChatBubbleKind) => {
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
    }
    setIsTyping(true);
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}-${Math.random()}`,
          sender: 'mentor',
          payload,
          time: formatNowTime(),
        },
      ]);
    }, 550);
  };

  const handleSendQuery = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}-${Math.random()}`,
        sender: 'student',
        text: trimmed,
        time: formatNowTime(),
      },
    ]);
    setInputValue('');

    const matchedRule = findMatchingRule(trimmed);
    if (matchedRule) {
      const introLine = activeMentor
        ? pickRandomQuote(activeMentor.chatIntroQuotes)
        : pickRandomQuote(DEFAULT_GUIDE_INTROS);
      scheduleMentorReply({
        kind: 'rule_summary',
        rule: matchedRule,
        introLine,
      });
    } else {
      scheduleMentorReply({
        kind: 'not_found',
        query: trimmed,
      });
    }
  };

  const handleInlineAction = (
    action: 'exceptions' | 'examples' | 'all_topics',
    rule?: RuleKnowledgeEntry
  ) => {
    const label =
      action === 'exceptions'
        ? `Покажи исключения: ${rule?.topicTitle ?? ''}`
        : action === 'examples'
        ? `Покажи примеры: ${rule?.topicTitle ?? ''}`
        : 'Покажи все темы справочника';

    setMessages((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}-${Math.random()}`,
        sender: 'student',
        text: label,
        time: formatNowTime(),
      },
    ]);

    if (action === 'all_topics') {
      scheduleMentorReply({ kind: 'topics_directory' });
      return;
    }

    if (action === 'examples' && rule) {
      scheduleMentorReply({ kind: 'rule_examples', rule });
      return;
    }

    if (action === 'exceptions' && rule) {
      scheduleMentorReply({ kind: 'rule_exceptions', rule });
    }
  };

  const handlePinnedClick = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}-${Math.random()}`,
        sender: 'student',
        text: 'Доступные правила в базе',
        time: formatNowTime(),
      },
    ]);
    scheduleMentorReply({ kind: 'topics_directory' });
  };

  const handleResetChat = () => {
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
    }
    setIsTyping(false);
    setSearchFilter('');
    setShowSearchBar(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'mentor',
        payload: { kind: 'welcome' },
        time: formatNowTime(),
      },
    ]);
  };

  const renderMentorAvatar = () => {
    if (activeMentor) {
      return (
        <MentorAvatar
          mentor={activeMentor}
          size="xs"
          ringTone="violet"
          className="w-9 h-9"
        />
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/25 to-violet-500/25 border border-cyan-400/40 flex items-center justify-center text-xs font-display font-bold text-cyan-200 shrink-0">
        СФ
      </div>
    );
  };

  const renderMentorBubbleContent = (payload: ChatBubbleKind) => {
    if (payload.kind === 'welcome') {
      const greeting = activeMentor
        ? pickRandomQuote(activeMentor.chatIntroQuotes)
        : 'Добро пожаловать в быстрый справочник правил русского языка!';
      return (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {greeting}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Напишите название правила (например: <span className="text-cyan-300 font-medium">«причастия»</span>,{' '}
            <span className="text-cyan-300 font-medium">«пре/при»</span>,{' '}
            <span className="text-cyan-300 font-medium">«не с глаголами»</span>) или нажмите на тему ниже — я сразу выдам шпаргалку, примеры и исключения.
          </p>
        </div>
      );
    }

    if (payload.kind === 'rule_summary') {
      return (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-300 italic leading-relaxed">
            «{payload.introLine}»
          </p>
          <div className="p-2.5 rounded-xl bg-[#0E1621]/75 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-display font-semibold text-white">
              <BookMarked className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{payload.rule.topicTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {payload.rule.summary}
            </p>
          </div>
        </div>
      );
    }

    if (payload.kind === 'rule_examples') {
      return (
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-display font-semibold text-white">
            Примеры: {payload.rule.topicTitle}
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200">
            {payload.rule.examples.map((ex, i) => (
              <li
                key={`ex-${i}`}
                className="px-2.5 py-1.5 rounded-lg bg-[#0E1621]/70 border border-slate-700/40 leading-relaxed"
              >
                • {ex}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (payload.kind === 'rule_exceptions') {
      return (
        <div className="space-y-1.5">
          <div className="text-xs sm:text-sm font-display font-semibold text-amber-300">
            Исключения и ловушки: {payload.rule.topicTitle}
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {payload.rule.exceptions ||
              'Для этого правила строгих словарных исключений нет — действуйте по основному алгоритму.'}
          </p>
        </div>
      );
    }

    if (payload.kind === 'topics_directory') {
      return (
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-display font-semibold text-white">
            Доступные правила в базе ({RULES_KNOWLEDGE_BASE.length}):
          </div>
          <p className="text-xs text-slate-300">
            Выберите нужную тему одним нажатием:
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          По запросу «{payload.query}» точного правила в моей локальной базе пока нет.
          Попробуйте переформулировать запрос или выберите одну из готовых тем справочника:
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-4.5rem)] min-h-[540px] max-h-[840px] rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl bg-[#0E1621]">
        {/* Top Telegram Header */}
        <header className="px-4 py-3 bg-[#17212B] border-b border-slate-800/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {renderMentorAvatar()}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-sm sm:text-base font-semibold text-white truncate">
                  {mentorName}
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-medium text-cyan-300 shrink-0">
                  справочник
                </span>
              </div>
              <div className="text-xs leading-tight mt-0.5">
                {isTyping ? (
                  <span className="inline-flex items-center gap-1 text-cyan-300 font-medium animate-pulse">
                    <span>печатает...</span>
                  </span>
                ) : (
                  <span className="text-cyan-400 font-medium">в сети</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSearchBar((v) => !v)}
              aria-label="Поиск темы в справочнике"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showSearchBar
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetChat}
              aria-label="Очистить историю чата"
              title="Начать диалог заново"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Optional Quick Search Bar */}
        {showSearchBar && (
          <div className="px-4 py-2 bg-[#141D26] border-b border-slate-800/80 flex items-center gap-2 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Фильтр тем (например: причастия, запятые, пре)..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Сбросить фильтр"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Slim Pinned Message Bar */}
        <button
          type="button"
          onClick={handlePinnedClick}
          className="w-full px-4 py-2 bg-[#17212B]/90 hover:bg-[#1C2834] border-b border-slate-800/80 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer shrink-0"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-0.5 h-7 rounded-full bg-cyan-400 shrink-0" />
            <Pin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-cyan-300 leading-tight">
                Закреплённое сообщение
              </div>
              <div className="text-xs text-slate-300 truncate leading-tight mt-0.5">
                Доступные правила в базе ({RULES_KNOWLEDGE_BASE.length} тем для быстрого повторения)
              </div>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* Scrollable Chat Messages Area with Telegram Dark Doodle Pattern */}
        <div
          className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3"
          style={{
            backgroundColor: '#0E1621',
            backgroundImage: `url("data:image/svg+xml,${TELEGRAM_DOODLE_SVG}")`,
            backgroundRepeat: 'repeat',
          }}
        >
          {messages.map((msg) => {
            if (msg.sender === 'student') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[82%] sm:max-w-[70%] rounded-2xl rounded-br-none bg-violet-600/90 text-white px-3.5 py-2 shadow-md">
                    <p className="text-xs sm:text-sm leading-relaxed break-words">
                      {msg.text}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-violet-200/90 font-mono-num">
                      <span>{msg.time}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                  </div>
                </div>
              );
            }

            const payload = msg.payload ?? { kind: 'welcome' as const };
            const ruleForActions =
              payload.kind === 'rule_summary' ||
              payload.kind === 'rule_examples' ||
              payload.kind === 'rule_exceptions'
                ? payload.rule
                : null;

            const showDirectoryButtons =
              payload.kind === 'welcome' ||
              payload.kind === 'topics_directory' ||
              payload.kind === 'not_found';

            return (
              <div key={msg.id} className="flex items-end gap-2.5 max-w-[92%] sm:max-w-[82%]">
                {renderMentorAvatar()}

                <div className="space-y-1.5 min-w-0 flex-1">
                  {/* Mentor Bubble */}
                  <div className="rounded-2xl rounded-bl-none bg-[#182533] border border-slate-700/60 px-3.5 py-2.5 shadow-md">
                    <div className={`text-xs font-semibold mb-1 ${mentorAccentText}`}>
                      {mentorName}
                    </div>

                    {renderMentorBubbleContent(payload)}

                    <div className="flex justify-end mt-1.5">
                      <span className="text-[10px] text-slate-400 font-mono-num">
                        {msg.time}
                      </span>
                    </div>
                  </div>

                  {/* Telegram Inline Keyboard Buttons directly beneath rule bubble */}
                  {ruleForActions && (
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleInlineAction('exceptions', ruleForActions)
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/75 border border-slate-600/40 text-xs font-medium text-slate-100 transition-colors cursor-pointer truncate"
                      >
                        Исключения
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleInlineAction('examples', ruleForActions)
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/75 border border-slate-600/40 text-xs font-medium text-slate-100 transition-colors cursor-pointer truncate"
                      >
                        Примеры
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInlineAction('all_topics')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/75 border border-slate-600/40 text-xs font-medium text-slate-100 transition-colors cursor-pointer truncate"
                      >
                        Все темы
                      </button>
                    </div>
                  )}

                  {showDirectoryButtons && (
                    <div className="flex flex-wrap gap-1.5">
                      {RULES_KNOWLEDGE_BASE.map((entry) => (
                        <button
                          key={`inline-${msg.id}-${entry.id}`}
                          type="button"
                          onClick={() => handleSendQuery(entry.topicTitle)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/80 border border-slate-600/40 text-xs font-medium text-cyan-200 hover:text-white transition-colors cursor-pointer text-left"
                        >
                          {entry.topicTitle}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-end gap-2.5">
              {renderMentorAvatar()}
              <div className="rounded-2xl rounded-bl-none bg-[#182533] border border-slate-700/60 px-3.5 py-2.5 text-xs text-cyan-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          )}

          <div ref={scrollEndRef} />
        </div>

        {/* Bottom Input Area with Quick-Topic Pills */}
        <div className="bg-[#17212B] border-t border-slate-800/90 px-3 sm:px-4 pt-2.5 pb-3 space-y-2.5 shrink-0">
          {/* Quick-Topic Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {filteredQuickTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSendQuery(topic.topicTitle)}
                className="px-2.5 py-1 rounded-full bg-[#242F3D] hover:bg-[#2B394A] border border-slate-700/70 text-[11px] font-medium text-slate-200 hover:text-white whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                {topic.topicTitle}
              </button>
            ))}
          </div>

          {/* Telegram Message Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(inputValue);
              inputRef.current?.focus();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Сообщение..."
              className="flex-1 bg-[#242F3D] border border-slate-700/60 focus:border-cyan-500/70 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Отправить сообщение"
              className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-45 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
