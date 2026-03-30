import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Phone, Loader2, ArrowLeft, Download, Copy, Volume2, VolumeX } from 'lucide-react';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// SimpleRealtimeChat removed - now using RealtimeChat from utils
import { RealtimeChat } from '@/utils/RealtimeAudio';

function SimpleAIAzitInner() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const chatRef = useRef<RealtimeChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  const handleMessage = (event: any) => {
    // 사용자 음성 텍스트
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const text = event.transcript?.trim();
      if (text) {
        setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
      }
    }
    // AI 응답 텍스트 (실시간)
    else if (event.type === 'response.audio_transcript.delta') {
      setCurrentTranscript(prev => prev + (event.delta || ''));
    }
    // AI 응답 완료
    else if (event.type === 'response.audio_transcript.done') {
      const text = event.transcript?.trim();
      if (text) {
        setMessages(prev => [...prev, { role: 'assistant', content: text, timestamp: new Date() }]);
      }
      setCurrentTranscript('');
    }
    // AI 음성 재생 상태
    else if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.done') {
      setIsSpeaking(false);
    }
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage, {
        mode: 'free',
        onDisconnect: () => {
          setIsConnected(false);
          toast({ title: "연결 끊김", description: "재연결에 실패했습니다.", variant: "destructive" });
        },
        onReconnecting: () => {
          toast({ title: "재연결 중...", description: "잠시만 기다려주세요." });
        },
      });
      await chatRef.current.init();
      
      setIsConnected(true);
      toast({ title: "연결 완료", description: "AI와 대화를 시작하세요!" });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "연결 실패",
        description: error instanceof Error ? error.message : "마이크 권한을 확인해주세요",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setCurrentTranscript('');
    toast({ title: "연결 종료", description: "대화가 종료되었습니다." });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const getConversationText = () => {
    const header = `금쪽상담소 상담 기록\n날짜: ${new Date().toLocaleString('ko-KR')}\n${'='.repeat(40)}\n\n`;
    const conversation = messages.map(msg => 
      `[${msg.role === 'user' ? '나' : 'AI'}] ${msg.content}`
    ).join('\n\n');
    return header + conversation;
  };

  const copyConversation = async () => {
    await navigator.clipboard.writeText(getConversationText());
    toast({ title: "복사 완료", description: "대화 내용이 클립보드에 복사되었습니다." });
  };

  const downloadConversation = () => {
    const blob = new Blob([getConversationText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-azit-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "다운로드 완료" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로
          </Button>
          <h1 className="text-2xl font-bold text-white">🎭 금쪽상담소</h1>
          <div className="w-20" />
        </div>

        {/* Main Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
          {!isConnected ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎙️</div>
              <h2 className="text-xl font-semibold text-white mb-3">
                AI와 음성으로 대화하세요
              </h2>
              <p className="text-purple-200 mb-8">
                마이크 권한이 필요합니다
              </p>
              <Button
                onClick={startConversation}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 연결 중...</>
                ) : (
                  <><Mic className="w-5 h-5 mr-2" /> 대화 시작</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
                  <span className="text-white text-sm">
                    {isSpeaking ? 'AI가 말하는 중...' : '듣고 있어요...'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={toggleMute} className="text-white">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/20 text-white'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {currentTranscript && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-2xl bg-white/20 text-white opacity-70">
                        {currentTranscript}
                        <span className="animate-pulse">▌</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-white/20">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyConversation} disabled={messages.length === 0}
                    className="border-white/30 text-white hover:bg-white/10">
                    <Copy className="w-4 h-4 mr-1" /> 복사
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadConversation} disabled={messages.length === 0}
                    className="border-white/30 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-1" /> 저장
                  </Button>
                </div>
                <Button onClick={endConversation} variant="destructive" size="sm">
                  <Phone className="w-4 h-4 mr-1" /> 종료
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Tips */}
        {!isConnected && (
          <p className="text-center text-purple-300 text-sm mt-4">
            🎧 이어폰 또는 헤드셋 착용 시 음성 인식 정확도가 크게 향상됩니다<br />
            💡 PC에서 Chrome 브라우저 사용을 권장합니다
          </p>
        )}
      </div>
    </div>
  );
}

export default function SimpleAIAzit() {
  return (
    <SubscriptionGuard featureName="금쪽상담소 상담" trialKey="AI_COUNSELOR_CHAT">
      <SimpleAIAzitInner />
    </SubscriptionGuard>
  );
}
