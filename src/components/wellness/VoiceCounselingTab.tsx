import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RealtimeVoiceChat } from '@/utils/RealtimeVoiceChat';
import { useLanguage } from '@/i18n/LanguageContext';

interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const VoiceCounselingTab = () => {
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessage = (event: any) => {
    if (event.type === 'response.audio_transcript.delta' && event.delta) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, content: last.content + event.delta }];
        }
        return [...prev, { role: 'assistant', content: event.delta, timestamp: new Date() }];
      });
      return;
    }

    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const transcript = typeof event.transcript === 'string' ? event.transcript.trim() : '';
      if (!transcript) return;
      setMessages(prev => [...prev, { role: 'user', content: transcript, timestamp: new Date() }]);
      return;
    }

    if (event.type === 'input.transcript.ignored') {
      toast({
        title: isEnglish ? 'Could not hear clearly' : '음성이 명확하지 않습니다',
        description: isEnglish ? 'Please speak again a bit more clearly.' : '조금 더 또렷하게 다시 말씀해 주세요.',
      });
    }
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeVoiceChat(handleMessage, setIsSpeaking);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({ 
        title: isEnglish ? "Ready to counsel" : "상담 준비 완료", 
        description: isEnglish ? "Press the record button to start speaking." : "녹음 버튼을 눌러 말씀을 시작하세요." 
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({ 
        title: isEnglish ? "Connection failed" : "연결 실패", 
        description: isEnglish ? "Unable to start voice counseling." : "음성 상담을 시작할 수 없습니다.", 
        variant: "destructive" 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const startRecording = async () => {
    try {
      if (chatRef.current?.audioContext?.state === 'suspended') {
        await chatRef.current.audioContext.resume();
      }
      await chatRef.current?.startRecording();
      setIsRecording(true);
      toast({ 
        title: isEnglish ? "Recording" : "녹음 중", 
        description: isEnglish ? "Press send when you're done speaking." : "말씀하신 후 전송 버튼을 눌러주세요." 
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({ 
        title: isEnglish ? "Recording failed" : "녹음 실패", 
        description: isEnglish ? "Unable to start recording." : "녹음을 시작할 수 없습니다.", 
        variant: "destructive" 
      });
    }
  };

  const stopAndSend = async () => {
    try {
      await chatRef.current?.stopRecordingAndSend();
      setIsRecording(false);
      toast({ 
        title: isEnglish ? "Sent" : "전송 완료", 
        description: isEnglish ? "AI is responding..." : "AI가 응답 중입니다..." 
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ 
        title: isEnglish ? "Send failed" : "전송 실패", 
        description: isEnglish ? "Unable to send message." : "메시지를 전송할 수 없습니다.", 
        variant: "destructive" 
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    toast({ 
      title: isEnglish ? "Session ended" : "상담 종료", 
      description: isEnglish ? "Voice counseling session has ended." : "음성 상담이 종료되었습니다." 
    });
  };

  useEffect(() => {
    const handleBeforeUnload = () => chatRef.current?.disconnect();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Phone className="w-6 h-6" />
          {isEnglish ? 'Real-time AI Voice Counseling' : '실시간 AI 음성 상담'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 p-4 bg-white/70 rounded-lg">
            {isConnected ? (
              <>
                <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                <span className="font-medium">
                  {isSpeaking 
                    ? (isEnglish ? 'AI counselor is speaking...' : 'AI 상담사가 말하고 있습니다...') 
                    : (isEnglish ? 'Listening. Please speak.' : '듣고 있습니다. 말씀해주세요.')}
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-muted-foreground">{isEnglish ? 'Not connected' : '연결되지 않음'}</span>
              </>
            )}
          </div>

          {messages.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-white/50 rounded-lg">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-white border border-green-200'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString(isEnglish ? 'en-US' : 'ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            {!isConnected ? (
              <Button
                onClick={startConversation}
                disabled={isConnecting}
                size="lg"
                className="w-full max-w-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isEnglish ? 'Connecting...' : '연결 중...'}
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    {isEnglish ? 'Start Voice Counseling' : '음성 상담 연결'}
                  </>
                )}
              </Button>
            ) : (
              <div className="flex flex-col gap-3 w-full max-w-sm">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={isSpeaking}
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    {isEnglish ? 'Start Recording' : '녹음 시작'}
                  </Button>
                ) : (
                  <Button
                    onClick={stopAndSend}
                    size="lg"
                    className="w-full animate-pulse bg-gradient-to-r from-red-500 to-rose-600"
                  >
                    <MicOff className="w-5 h-5 mr-2" />
                    {isEnglish ? 'Send' : '전송하기'}
                  </Button>
                )}
                
                <Button
                  onClick={endConversation}
                  variant="outline"
                  size="sm"
                  className="w-full border-green-300"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  {isEnglish ? 'End Session' : '상담 종료'}
                </Button>
              </div>
            )}
          </div>

          <div className="text-sm text-green-800 text-center space-y-1 bg-white/50 p-4 rounded-lg">
            <p>{isEnglish ? '💡 Speak naturally as if having a conversation' : '💡 자연스럽게 대화하듯 말씀해주세요'}</p>
            <p>{isEnglish ? '🔒 All conversations are securely protected' : '🔒 모든 대화는 안전하게 보호됩니다'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
