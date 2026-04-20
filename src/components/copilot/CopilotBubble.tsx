import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { X, Sparkles, ArrowRight, MessageCircle, RotateCcw, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { copilotFlows, type CopilotOption } from './copilotFlows';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { CopilotRecommendationCard } from './CopilotRecommendationCard';

const KAKAO_CHANNEL_URL = 'https://open.kakao.com/o/sHLdK3Ch';

interface HistoryEntry {
  question: string;
  selectedLabel: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chips?: string[];
  chipsUsed?: boolean;
  isFinal?: boolean;
  recommendedTrack?: string | null;
  recommendedRoute?: string | null;
  recommendedMessage?: string | null;
  summary?: string | null;
  detectedConcerns?: string[] | null;
  detectedSeverity?: string | null;
}

type Mode = 'guide' | 'chat';

const STORAGE_KEY = 'copilot_state_v1';
const INITIAL_GREETING: ChatMessage = {
  id: '1',
  role: 'assistant',
  content: '안녕하세요 😊 어떤 고민을 함께 살펴볼까요? 먼저 누구에 대한 이야기인지 알려주실래요?',
  chips: ['본인', '자녀', '가족', '기타'],
};

interface PersistedState {
  mode: Mode;
  currentStepId: string;
  history: HistoryEntry[];
  chatMessages: ChatMessage[];
  sessionId: string;
  conversationId: string | null;
}

const loadPersisted = (): Partial<PersistedState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const CopilotBubble: React.FC = () => {
  const persisted = useRef<Partial<PersistedState>>(loadPersisted()).current;

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(persisted.mode ?? 'guide');
  const [currentStepId, setCurrentStepId] = useState<string>(persisted.currentStepId ?? 'root');
  const [history, setHistory] = useState<HistoryEntry[]>(persisted.history ?? []);
  const navigate = useNavigate();

  // Chat state - 복원
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    persisted.chatMessages && persisted.chatMessages.length > 0
      ? persisted.chatMessages
      : [INITIAL_GREETING]
  );
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(
    persisted.sessionId ?? `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const conversationIdRef = useRef<string | null>(persisted.conversationId ?? null);

  // 상태 변경 시 자동 저장
  useEffect(() => {
    try {
      const state: PersistedState = {
        mode,
        currentStepId,
        history,
        chatMessages,
        sessionId: sessionIdRef.current,
        conversationId: conversationIdRef.current,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [mode, currentStepId, history, chatMessages]);

  const currentStep = copilotFlows[currentStepId];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoading]);

  const handleSelect = useCallback((option: CopilotOption) => {
    if (currentStep) {
      setHistory(prev => [...prev, { question: currentStep.question, selectedLabel: option.label }]);
    }
    if (option.action === 'navigate' && option.route) {
      navigate(option.route);
      setIsOpen(false);
      resetFlow();
    } else if (option.action === 'kakao') {
      window.open(KAKAO_CHANNEL_URL, '_blank');
    } else if (option.action === 'payment') {
      navigate('/token-subscription');
      setIsOpen(false);
      resetFlow();
    } else if (option.nextStep) {
      setCurrentStepId(option.nextStep);
    }
  }, [currentStep, navigate]);

  const resetFlow = useCallback(() => {
    setCurrentStepId('root');
    setHistory([]);
  }, []);

  const sendMessage = async (text: string, fromChipMsgId?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // 칩이 사용된 메시지는 비활성화
    if (fromChipMsgId) {
      setChatMessages(prev => prev.map(m => m.id === fromChipMsgId ? { ...m, chipsUsed: true } : m));
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: trimmed };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    try {
      const recentMessages = [...chatMessages.slice(-8), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const chatHistory = recentMessages.slice(0, -1);

      const { data, error } = await supabase.functions.invoke('platform-ai-consultant', {
        body: { message: trimmed, chatHistory },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || '죄송합니다, 다시 시도해주세요.',
        chips: Array.isArray(data?.chips) ? data.chips : [],
        isFinal: !!data?.isFinal,
        recommendedTrack: data?.recommendedTrack || null,
        recommendedRoute: data?.recommendedRoute || null,
        recommendedMessage: data?.recommendedMessage || null,
        summary: data?.summary || null,
        detectedConcerns: Array.isArray(data?.detectedConcerns) ? data.detectedConcerns : null,
        detectedSeverity: data?.detectedSeverity || null,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);

      // 대화 저장 (개인화 데이터로 활용)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const fullMessages = [...chatMessages, userMsg, assistantMsg].map(m => ({
          role: m.role, content: m.content,
        }));
        const payload: any = {
          session_id: sessionIdRef.current,
          user_id: user?.id ?? null,
          messages: fullMessages,
          is_complete: !!data?.isFinal,
          summary: data?.summary ?? null,
          detected_target: data?.detectedTarget ?? null,
          detected_concerns: data?.detectedConcerns ?? null,
          detected_severity: data?.detectedSeverity ?? null,
          recommended_track: data?.recommendedTrack ?? null,
          recommended_route: data?.recommendedRoute ?? null,
        };
        if (conversationIdRef.current) {
          await supabase.from('copilot_conversations').update(payload).eq('id', conversationIdRef.current);
        } else {
          const { data: ins } = await supabase.from('copilot_conversations').insert(payload).select('id').maybeSingle();
          if (ins?.id) conversationIdRef.current = ins.id;
        }
      } catch (saveErr) {
        console.warn('copilot save failed', saveErr);
      }
    } catch {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = () => sendMessage(chatInput);

  if (!currentStep) return null;

  return (
    <>
      {/* Floating Bubble - bottom-24 on mobile to clear StickyConversionBar */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-[80px] right-3 z-[60] md:bottom-6 md:right-6"
          >
            <button
              onClick={() => setIsOpen(true)}
              aria-label="발달심리 코파일럿 열기"
              className="group relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-2 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold hidden md:inline">코파일럿</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
className="fixed bottom-[80px] left-3 right-3 z-[60] md:left-6 md:right-auto md:w-[380px] md:bottom-6"
          >
            <div className="rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col h-[calc(100dvh-100px)] md:h-[70vh] max-h-[640px]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-transparent border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">발달심리 코파일럿</p>
                    <p className="text-[10px] text-white/50">14년 전문가 설계 엔진</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {mode === 'guide' && history.length > 0 && (
                    <Button variant="ghost" size="icon-sm" onClick={resetFlow} className="text-white/60 hover:text-white hover:bg-white/10" title="처음으로">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  {mode === 'chat' && chatMessages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setChatMessages([INITIAL_GREETING]);
                        sessionIdRef.current = `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                        conversationIdRef.current = null;
                      }}
                      className="text-white/60 hover:text-white hover:bg-white/10"
                      title="새 대화 시작"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="flex border-b border-white/10 shrink-0">
                <button
                  onClick={() => setMode('guide')}
                  className={cn(
                    "flex-1 py-2 text-xs font-medium transition-colors",
                    mode === 'guide' ? "text-primary border-b-2 border-primary" : "text-white/40 hover:text-white/60"
                  )}
                >
                  🧭 가이드
                </button>
                <button
                  onClick={() => setMode('chat')}
                  className={cn(
                    "flex-1 py-2 text-xs font-medium transition-colors",
                    mode === 'chat' ? "text-primary border-b-2 border-primary" : "text-white/40 hover:text-white/60"
                  )}
                >
                  💬 AI 채팅
                </button>
              </div>

              {/* Content */}
              {mode === 'guide' ? (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-4">
                    {history.length > 0 && (
                      <div className="space-y-1.5">
                        {history.map((entry, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white/40">
                            <span className="shrink-0">✓</span>
                            <span className="truncate">{entry.selectedLabel}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1">
                      {currentStep.emoji && <span className="text-2xl">{currentStep.emoji}</span>}
                      <h3 className="text-base font-bold text-white leading-snug">{currentStep.question}</h3>
                      {currentStep.subtitle && <p className="text-xs text-white/50">{currentStep.subtitle}</p>}
                    </div>

                    <div className="space-y-2">
                      {currentStep.options.map((option, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          onClick={() => handleSelect(option)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 group"
                        >
                          {option.emoji && <span className="text-lg shrink-0">{option.emoji}</span>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{option.label}</p>
                            {option.description && <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{option.description}</p>}
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary shrink-0 transition-colors" />
                        </motion.button>
                      ))}
                    </div>

                    {currentStepId === 'root' && (
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => window.open(KAKAO_CHANNEL_URL, '_blank')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#FEE500]/10 text-[#FEE500] text-xs font-medium hover:bg-[#FEE500]/20 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          카톡 상담
                        </button>
                        <button
                          onClick={() => { navigate('/token-subscription'); setIsOpen(false); resetFlow(); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          이용권 보기
                        </button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                /* Chat Mode */
                <>
                  <ScrollArea className="flex-1 min-h-0 h-full">
                    <div className="p-4 space-y-3 max-w-full break-words [&_*]:max-w-full">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="space-y-2">
                          <div className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'assistant' && (
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-3.5 h-3.5 text-primary" />
                              </div>
                            )}
                            <div className={cn(
                              "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                              msg.role === 'user'
                                ? "bg-primary text-white"
                                : "bg-white/10 text-white/90"
                            )}>
                              {msg.role === 'assistant' ? (
                                <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_p]:leading-relaxed">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                              ) : msg.content}
                            </div>
                            {msg.role === 'user' && (
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                                <User className="w-3.5 h-3.5 text-white/60" />
                              </div>
                            )}
                          </div>
                          {/* Quick chips */}
                          {msg.role === 'assistant' && msg.chips && msg.chips.length > 0 && !msg.chipsUsed && (
                            <div className="flex flex-wrap gap-1.5 pl-8">
                              {msg.chips.map((chip, i) => (
                                <button
                                  key={i}
                                  onClick={() => sendMessage(chip, msg.id)}
                                  disabled={isLoading}
                                  className="px-3 py-1.5 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Final recommendation CTA */}
                          {msg.role === 'assistant' && msg.isFinal && msg.recommendedRoute && (
                            <div className="ml-8 mt-2 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 to-purple-500/10 p-3 space-y-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                                <Sparkles className="w-3 h-3" />
                                대화 내용을 바탕으로 추천드려요
                              </div>
                              {msg.recommendedMessage && (
                                <p className="text-xs text-white/80 leading-relaxed">{msg.recommendedMessage}</p>
                              )}
                              <button
                                onClick={() => {
                                  navigate(msg.recommendedRoute!);
                                  setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                              >
                                {msg.recommendedTrack === 'expert_urgent' ? '긴급 전문가 연결' : '30일 마음 트랙 시작하기'}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-2 items-center">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="bg-white/10 rounded-xl px-3 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                          </div>
                        </div>
                      )}
                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-white/10 shrink-0">
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleChatSend(); }}
                      className="flex gap-2"
                    >
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="궁금한 점을 물어보세요..."
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm h-9"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        size="icon-sm"
                        disabled={!chatInput.trim() || isLoading}
                        className="bg-primary hover:bg-primary/90 h-9 w-9"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
