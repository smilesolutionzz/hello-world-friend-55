import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Loader2, Volume2, Sparkles, RefreshCw, History, AlertTriangle, Wifi, MicVocal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeVoiceChat } from '@/utils/RealtimeVoiceChat';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ChatLine {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  partial?: boolean;
  ts: number;
}

type Status = 'idle' | 'checking' | 'connecting' | 'ready' | 'reconnecting' | 'error';
type ErrCode = 'MIC' | 'NET' | 'WS' | 'SESSION' | 'AUTH' | 'UNKNOWN';

const ELEPHANT_INSTRUCTIONS = `당신은 '코끼리'라는 이름의 따뜻하고 지혜로운 한국어 심리 상담사입니다.
- 항상 부드럽고 차분한 말투로 1인칭("저는", "코끼리는")을 사용해 응답합니다.
- 한 번에 2~3문장으로 짧고 공감적으로 답합니다. 길게 설교하지 않습니다.
- 사용자의 감정을 먼저 인정한 뒤 ('힘드셨겠어요', '그렇게 느끼실 만해요'), 열린 질문 1개로 대화를 이어갑니다.
- 의학적 진단·약물·자살 위기 신호가 보이면 즉시 전문가 상담(/expert-hiring) 안내를 부드럽게 권유합니다.
- 침묵하거나 음성이 불명확하면 추측하지 말고 "조금 더 들려주실 수 있을까요?" 라고 다정하게 다시 묻습니다.`;

// 자막 정규화: 중복/짤림 방지
const sanitizeTranscript = (text: string) => {
  if (!text) return '';
  let out = text.replace(/\s+/g, ' ').trim();
  // 같은 단어/조각이 연속 반복되는 경우 1회로 축약 (예: "그래서 그래서 저는")
  out = out.replace(/(\b\S{2,}\b)(\s+\1){1,}/g, '$1');
  // 끝부분 "다다다다" 류의 자모 반복 정리
  out = out.replace(/(.)\1{4,}$/g, '$1$1');
  return out;
};

const MAX_RECONNECT = 3;
const RECONNECT_DELAYS = [800, 1500, 3000]; // ms

const VoiceCounselingNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<number | null>(null);
  const linesRef = useRef<ChatLine[]>([]);

  const [status, setStatus] = useState<Status>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [errorInfo, setErrorInfo] = useState<{ code: ErrCode; message: string } | null>(null);

  // throttle용
  const partialAssistantRef = useRef<string>('');
  const partialAssistantId = useRef<string | null>(null);
  const partialFlushTimer = useRef<number | null>(null);
  const lastFlushedText = useRef<string>('');

  // 세션 인사 트리거 보호
  const greetingSentRef = useRef(false);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useEffect(() => {
    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      if (partialFlushTimer.current) window.clearTimeout(partialFlushTimer.current);
      void persistSession();
      chatRef.current?.disconnect();
      chatRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  // ───────── 자막 throttle 적용 partial flush ─────────
  const flushPartial = useCallback(() => {
    const text = sanitizeTranscript(partialAssistantRef.current);
    if (text === lastFlushedText.current) return;
    lastFlushedText.current = text;
    setLines((prev) => {
      if (partialAssistantId.current) {
        return prev.map((l) =>
          l.id === partialAssistantId.current ? { ...l, text, partial: true } : l
        );
      }
      const id = `a-${Date.now()}`;
      partialAssistantId.current = id;
      return [...prev, { id, role: 'assistant', text, partial: true, ts: Date.now() }];
    });
  }, []);

  const schedulePartialFlush = useCallback(() => {
    if (partialFlushTimer.current) return;
    partialFlushTimer.current = window.setTimeout(() => {
      partialFlushTimer.current = null;
      flushPartial();
    }, 120); // 120ms throttle
  }, [flushPartial]);

  const finalizeAssistant = useCallback((finalText: string) => {
    if (partialFlushTimer.current) {
      window.clearTimeout(partialFlushTimer.current);
      partialFlushTimer.current = null;
    }
    const text = sanitizeTranscript(finalText || partialAssistantRef.current);
    setLines((prev) => {
      if (partialAssistantId.current) {
        return prev.map((l) =>
          l.id === partialAssistantId.current ? { ...l, text, partial: false } : l
        );
      }
      return [...prev, { id: `a-${Date.now()}`, role: 'assistant', text, ts: Date.now() }];
    });
    partialAssistantRef.current = '';
    partialAssistantId.current = null;
    lastFlushedText.current = '';
  }, []);

  // ───────── 세션 저장 ─────────
  const persistSession = useCallback(async () => {
    const items = linesRef.current.filter((l) => !l.partial && l.text?.trim());
    if (items.length < 2 || !sessionStartRef.current) return;
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      const startedAt = new Date(sessionStartRef.current).toISOString();
      const endedAt = new Date().toISOString();
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const firstUser = items.find((i) => i.role === 'user')?.text ?? '';
      const title = firstUser.length > 1 ? firstUser.slice(0, 40) : '코끼리와의 대화';
      await supabase.from('voice_counseling_sessions').insert({
        user_id: u.user.id,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: duration,
        message_count: items.length,
        title,
        transcript: items.map((i) => ({ role: i.role, text: i.text, ts: i.ts })),
      });
    } catch (e) {
      console.error('persistSession failed', e);
    }
    sessionStartRef.current = null;
  }, []);

  // ───────── 메시지 핸들러 ─────────
  const handleMessage = useCallback((msg: any) => {
    if (msg.type === 'conversation.item.input_audio_transcription.completed') {
      const text = sanitizeTranscript(msg.transcript || '');
      if (!text) return;
      setLines((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() }]);
      return;
    }

    if (msg.type === 'response.audio_transcript.delta' && msg.delta) {
      partialAssistantRef.current += msg.delta;
      schedulePartialFlush();
      return;
    }

    if (msg.type === 'response.audio_transcript.done') {
      finalizeAssistant(msg.transcript || '');
      return;
    }

    if (msg.type === 'response.done') {
      // 안전장치: delta가 없었는데 끝났을 때
      if (partialAssistantRef.current) {
        finalizeAssistant(partialAssistantRef.current);
      }
    }
  }, [schedulePartialFlush, finalizeAssistant]);

  // ───────── 사전 진단 ─────────
  const runPreflight = async (): Promise<{ ok: true } | { ok: false; code: ErrCode; message: string }> => {
    setStatus('checking');
    setStatusMsg('환경을 점검하고 있어요…');

    // 1) 네트워크
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { ok: false, code: 'NET', message: '인터넷 연결이 끊겨 있어요. 네트워크를 확인해주세요.' };
    }

    // 2) 인증
    const { data: s } = await supabase.auth.getSession();
    if (!s?.session?.access_token) {
      return { ok: false, code: 'AUTH', message: '로그인이 필요해요. 로그인 후 다시 시도해주세요.' };
    }

    // 3) 마이크 권한
    setStatusMsg('마이크 권한을 확인하고 있어요…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch (e: any) {
      const isDenied = e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError';
      return {
        ok: false,
        code: 'MIC',
        message: isDenied
          ? '마이크 권한이 차단되었어요. 브라우저 주소창의 자물쇠 아이콘에서 마이크를 허용해주세요.'
          : '마이크에 접근할 수 없어요. 다른 앱에서 사용 중인지 확인해주세요.',
      };
    }

    return { ok: true };
  };

  // ───────── 연결 ─────────
  const connect = useCallback(async (isReconnect = false) => {
    setErrorInfo(null);
    if (!isReconnect) {
      setStatus('connecting');
      setStatusMsg('코끼리를 깨우는 중…');
    } else {
      setStatus('reconnecting');
      setStatusMsg(`연결이 끊겨 다시 시도하는 중… (${reconnectAttempts.current}/${MAX_RECONNECT})`);
    }

    try {
      const chat = new RealtimeVoiceChat(handleMessage, setIsSpeaking, {
        instructions: ELEPHANT_INSTRUCTIONS,
        voice: 'shimmer',
        useServerVad: true,
        onReady: () => {
          // 세션 준비 완료 → 녹음 시작
          chat.startRecording().then(() => {
            setIsListening(true);
            setStatus('ready');
            setStatusMsg('');
            reconnectAttempts.current = 0;
            if (!greetingSentRef.current) {
              greetingSentRef.current = true;
              try {
                chat.sendTextMessage('안녕하세요. 가볍게 자기소개와 함께 어떤 마음으로 오셨는지 따뜻하게 물어봐 주세요.');
              } catch (e) {
                console.warn('greeting failed', e);
              }
            }
          }).catch((e: any) => {
            handleErrorInfo({ code: 'MIC', message: e?.message || '녹음을 시작할 수 없어요.' });
          });
        },
        onError: (info) => {
          handleErrorInfo({ code: info.code, message: info.message });
        },
        onClose: ({ code, reason }) => {
          console.warn('WS closed', code, reason);
          // 자동 재연결
          if (reconnectAttempts.current < MAX_RECONNECT && status !== 'idle') {
            const delay = RECONNECT_DELAYS[reconnectAttempts.current] ?? 3000;
            reconnectAttempts.current += 1;
            setStatus('reconnecting');
            setStatusMsg(`연결이 끊겨 다시 시도하는 중… (${reconnectAttempts.current}/${MAX_RECONNECT})`);
            reconnectTimer.current = window.setTimeout(() => connect(true), delay);
          } else {
            handleErrorInfo({ code: 'WS', message: '연결이 끊겼어요. 재시도 버튼을 눌러주세요.' });
          }
        },
      });
      chatRef.current = chat;
      sessionStartRef.current ??= Date.now();
      await chat.init();
    } catch (e: any) {
      handleErrorInfo({ code: 'WS', message: e?.message || '연결에 실패했어요.' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleMessage]);

  const handleErrorInfo = (info: { code: ErrCode; message: string }) => {
    setErrorInfo(info);
    setStatus('error');
    setStatusMsg('');
    setIsListening(false);
    setIsSpeaking(false);
    console.error('[voice-counseling]', info.code, info.message);
    toast({
      title: `오류 [${info.code}]`,
      description: info.message,
      variant: 'destructive',
    });
  };

  const start = async () => {
    if (status === 'connecting' || status === 'ready') return;
    greetingSentRef.current = false;
    reconnectAttempts.current = 0;

    const pre = await runPreflight();
    if (!pre.ok) {
      handleErrorInfo({ code: pre.code, message: pre.message });
      return;
    }
    await connect(false);
  };

  const end = async () => {
    if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
    await persistSession();
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsListening(false);
    setIsSpeaking(false);
    setStatus('idle');
    setStatusMsg('');
    setErrorInfo(null);
    toast({ title: '대화를 저장했어요', description: '대화 기록 페이지에서 다시 볼 수 있어요.' });
  };

  const toggleMute = async () => {
    if (!chatRef.current) return;
    try {
      if (isListening) {
        await chatRef.current.stopRecordingAndSend();
        setIsListening(false);
      } else {
        await chatRef.current.startRecording();
        setIsListening(true);
      }
    } catch (e: any) {
      handleErrorInfo({ code: 'MIC', message: e?.message || '마이크 토글 실패' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF7] via-white to-[#F5F2EC]">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> 뒤로
          </Button>
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <span className="w-2 h-2 rounded-full bg-[#C8B88A]" />
            코끼리 상담사
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/voice-counseling/history')} className="gap-1.5">
            <History className="w-4 h-4" /> 기록
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 pb-40">
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8B88A]/15 text-[#8B7A4A] text-xs tracking-wide mb-5">
            <Sparkles className="w-3.5 h-3.5" /> 실시간 음성 상담
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>
            마음을 들려주세요, <br className="md:hidden" /> 코끼리가 듣고 있어요
          </h1>
          <p className="mt-3 text-neutral-500 text-sm md:text-base break-keep">
            말을 시작하면 자동으로 인식해 응답해요. 끊김 없이 자연스럽게 대화하세요.
          </p>
        </section>

        <section className="flex flex-col items-center mb-10">
          <div className="relative">
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-2xl transition-all duration-700',
                isSpeaking ? 'bg-[#C8B88A]/60 scale-125' : isListening ? 'bg-emerald-300/40 scale-110' : 'bg-neutral-200/60 scale-100'
              )}
            />
            <div
              className={cn(
                'relative w-44 h-44 md:w-56 md:h-56 rounded-full bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] flex items-center justify-center text-7xl md:text-8xl select-none transition-transform duration-500',
                isSpeaking && 'animate-pulse',
                isListening && !isSpeaking && 'scale-[1.02]'
              )}
            >
              🐘
            </div>
          </div>

          <div className="mt-6 min-h-[28px] text-sm text-neutral-500 text-center px-4 break-keep">
            {status === 'idle' && '시작 버튼을 눌러주세요'}
            {(status === 'checking' || status === 'connecting' || status === 'reconnecting') && (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {statusMsg || '준비 중…'}
              </span>
            )}
            {status === 'ready' && isSpeaking && (
              <span className="inline-flex items-center gap-2 text-[#8B7A4A]">
                <Volume2 className="w-4 h-4" /> 코끼리가 말하고 있어요
              </span>
            )}
            {status === 'ready' && !isSpeaking && isListening && '듣고 있어요… 편하게 말씀해주세요'}
            {status === 'ready' && !isSpeaking && !isListening && '마이크가 일시 정지됨'}
            {status === 'error' && errorInfo && (
              <span className="text-red-500">[{errorInfo.code}] {errorInfo.message}</span>
            )}
          </div>

          {status === 'error' && errorInfo && (
            <div className="mt-4 max-w-md w-full rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm text-red-700">
              <div className="flex items-start gap-2 mb-2">
                {errorInfo.code === 'MIC' ? <MicVocal className="w-4 h-4 mt-0.5" /> :
                 errorInfo.code === 'NET' || errorInfo.code === 'WS' ? <Wifi className="w-4 h-4 mt-0.5" /> :
                 <AlertTriangle className="w-4 h-4 mt-0.5" />}
                <div className="flex-1 break-keep">{errorInfo.message}</div>
              </div>
              <Button onClick={start} size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
                <RefreshCw className="w-4 h-4" /> 다시 시도
              </Button>
            </div>
          )}
        </section>

        <section
          ref={scrollRef}
          className="max-h-[42vh] overflow-y-auto rounded-3xl bg-white/70 backdrop-blur border border-black/5 shadow-sm p-5 space-y-3"
        >
          {lines.length === 0 ? (
            <p className="text-center text-neutral-400 text-sm py-8">대화가 여기 표시돼요</p>
          ) : (
            lines.map((l) => (
              <div key={l.id} className={cn('flex', l.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-keep whitespace-pre-wrap',
                    l.role === 'user'
                      ? 'bg-neutral-900 text-white rounded-br-md'
                      : 'bg-[#F5F2EC] text-neutral-800 rounded-bl-md'
                  )}
                >
                  {l.text || (l.partial ? '…' : '')}
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-30 pb-6 pt-4 bg-gradient-to-t from-white via-white/95 to-white/0">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center gap-4">
          {status !== 'ready' && status !== 'reconnecting' ? (
            <Button
              onClick={start}
              disabled={status === 'connecting' || status === 'checking'}
              className="h-14 px-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-base shadow-lg gap-2"
            >
              {(status === 'connecting' || status === 'checking') ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> 연결 중
                </>
              ) : status === 'error' ? (
                <>
                  <RefreshCw className="w-5 h-5" /> 다시 시도
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" /> 코끼리와 대화 시작
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant="outline"
                disabled={status === 'reconnecting'}
                className={cn(
                  'h-14 w-14 rounded-full p-0 border-2 transition-colors',
                  isListening ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-300 bg-white'
                )}
              >
                {isListening ? <Mic className="w-5 h-5 text-emerald-600" /> : <MicOff className="w-5 h-5 text-neutral-500" />}
              </Button>
              <Button
                onClick={end}
                variant="outline"
                className="h-14 px-6 rounded-full border-neutral-300 text-neutral-700"
              >
                대화 종료
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCounselingNew;
