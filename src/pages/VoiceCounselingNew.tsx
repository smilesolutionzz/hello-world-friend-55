import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Loader2, Volume2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeVoiceChat } from '@/utils/RealtimeVoiceChat';
import { cn } from '@/lib/utils';

interface ChatLine {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  partial?: boolean;
}

const ELEPHANT_INSTRUCTIONS = `당신은 '코끼리'라는 이름의 따뜻하고 지혜로운 한국어 심리 상담사입니다.
- 항상 부드럽고 차분한 말투로 1인칭("저는", "코끼리는")을 사용해 응답합니다.
- 한 번에 2~3문장으로 짧고 공감적으로 답합니다. 길게 설교하지 않습니다.
- 사용자의 감정을 먼저 인정한 뒤 ('힘드셨겠어요', '그렇게 느끼실 만해요'), 열린 질문 1개로 대화를 이어갑니다.
- 의학적 진단·약물·자살 위기 신호가 보이면 즉시 전문가 상담(/expert-hiring) 안내를 부드럽게 권유합니다.
- 침묵하거나 음성이 불명확하면 추측하지 말고 "조금 더 들려주실 수 있을까요?" 라고 다정하게 다시 묻습니다.`;

const VoiceCounselingNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const partialAssistantRef = useRef<string>('');
  const partialAssistantId = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
      chatRef.current = null;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const handleMessage = useCallback((msg: any) => {
    // 사용자 발화 전사
    if (msg.type === 'conversation.item.input_audio_transcription.completed') {
      const text = (msg.transcript || '').trim();
      if (!text) return;
      setLines((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
      return;
    }

    // 코끼리 응답 텍스트 스트리밍
    if (msg.type === 'response.audio_transcript.delta' && msg.delta) {
      partialAssistantRef.current += msg.delta;
      setLines((prev) => {
        if (partialAssistantId.current) {
          return prev.map((l) =>
            l.id === partialAssistantId.current ? { ...l, text: partialAssistantRef.current, partial: true } : l
          );
        }
        const id = `a-${Date.now()}`;
        partialAssistantId.current = id;
        return [...prev, { id, role: 'assistant', text: partialAssistantRef.current, partial: true }];
      });
      return;
    }

    if (msg.type === 'response.audio_transcript.done') {
      const finalText = (msg.transcript || partialAssistantRef.current || '').trim();
      setLines((prev) => {
        if (partialAssistantId.current) {
          return prev.map((l) =>
            l.id === partialAssistantId.current ? { ...l, text: finalText, partial: false } : l
          );
        }
        return [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: finalText }];
      });
      partialAssistantRef.current = '';
      partialAssistantId.current = null;
      return;
    }

    if (msg.type === 'error') {
      console.error('Realtime error:', msg);
      toast({ title: '음성 오류', description: msg.error?.message || '잠시 후 다시 시도해주세요.', variant: 'destructive' });
    }
  }, [toast]);

  const start = async () => {
    if (status === 'connecting' || status === 'ready') return;
    setStatus('connecting');
    try {
      const chat = new RealtimeVoiceChat(handleMessage, setIsSpeaking, {
        instructions: ELEPHANT_INSTRUCTIONS,
        voice: 'shimmer',
        useServerVad: true,
      });
      chatRef.current = chat;
      await chat.init();

      // 세션 설정 완료까지 대기 (간단 폴링)
      const startedAt = Date.now();
      while (Date.now() - startedAt < 8000) {
        try {
          await chat.startRecording();
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 250));
        }
      }
      setIsListening(true);
      setStatus('ready');

      // 인사말 트리거
      setTimeout(() => {
        try {
          chatRef.current?.sendTextMessage('안녕하세요. 가볍게 자기소개와 함께 어떤 마음으로 오셨는지 따뜻하게 물어봐 주세요.');
        } catch (e) {
          console.warn('greeting failed', e);
        }
      }, 600);
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      toast({
        title: '연결 실패',
        description: e?.message || '마이크 권한과 네트워크를 확인해주세요.',
        variant: 'destructive',
      });
    }
  };

  const end = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsListening(false);
    setIsSpeaking(false);
    setStatus('idle');
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
      toast({ title: '마이크 토글 실패', description: e?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF7] via-white to-[#F5F2EC]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> 뒤로
          </Button>
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <span className="w-2 h-2 rounded-full bg-[#C8B88A]" />
            코끼리 상담사
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 pb-40">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8B88A]/15 text-[#8B7A4A] text-xs tracking-wide mb-5">
            <Sparkles className="w-3.5 h-3.5" /> 실시간 음성 상담
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>
            마음을 들려주세요, <br className="md:hidden" /> 코끼리가 듣고 있어요
          </h1>
          <p className="mt-3 text-neutral-500 text-sm md:text-base">
            말을 시작하면 자동으로 인식해 응답해요. 끊김 없이 자연스럽게 대화하세요.
          </p>
        </section>

        {/* Elephant orb */}
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

          <div className="mt-6 h-6 text-sm text-neutral-500">
            {status === 'idle' && '시작 버튼을 눌러주세요'}
            {status === 'connecting' && (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> 코끼리를 깨우는 중…
              </span>
            )}
            {status === 'ready' && isSpeaking && (
              <span className="inline-flex items-center gap-2 text-[#8B7A4A]">
                <Volume2 className="w-4 h-4" /> 코끼리가 말하고 있어요
              </span>
            )}
            {status === 'ready' && !isSpeaking && isListening && '듣고 있어요… 편하게 말씀해주세요'}
            {status === 'ready' && !isSpeaking && !isListening && '마이크가 일시 정지됨'}
            {status === 'error' && <span className="text-red-500">연결에 실패했어요</span>}
          </div>
        </section>

        {/* Transcript */}
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
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-keep',
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

      {/* Bottom control */}
      <div className="fixed bottom-0 inset-x-0 z-30 pb-6 pt-4 bg-gradient-to-t from-white via-white/95 to-white/0">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center gap-4">
          {status !== 'ready' ? (
            <Button
              onClick={start}
              disabled={status === 'connecting'}
              className="h-14 px-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-base shadow-lg gap-2"
            >
              {status === 'connecting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> 연결 중
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
