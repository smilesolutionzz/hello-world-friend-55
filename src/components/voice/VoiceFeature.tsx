import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Mic, MicOff, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceFeatureProps {
  text: string;
  title: string;
  type?: 'question' | 'result' | 'guide';
}

const VoiceFeature: React.FC<VoiceFeatureProps> = ({ text, title, type = 'result' }) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleTextToSpeech = async () => {
    if (!text) return;

    setIsPlaying(true);
    
    try {
      // ElevenLabs API를 통한 고품질 TTS
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { 
          text: text,
          voice: 'Aria', // 따뜻한 여성 목소리
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      // Base64 오디오를 Blob으로 변환
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // HTML5 Audio로 재생
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "음성 재생 오류",
          description: "음성 재생 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      };

      await audio.play();
      
      toast({
        title: "🎙️ AI 음성 재생 시작",
        description: "ElevenLabs AI 음성으로 들려드립니다.",
      });

    } catch (error) {
      setIsPlaying(false);
      console.error('ElevenLabs TTS Error:', error);
      
      // 폴백: 브라우저 기본 TTS 사용
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
        
        toast({
          title: "기본 음성으로 재생",
          description: "AI 음성 서비스가 일시적으로 불가능합니다.",
        });
      } catch (fallbackError) {
        toast({
          title: "음성 기능 오류",
          description: "음성 재생이 불가능합니다.",
          variant: "destructive"
        });
      }
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleSpeechToText = async () => {
    // 타입 확장을 위한 인터페이스
    interface SpeechRecognitionWindow extends Window {
      webkitSpeechRecognition?: any;
      SpeechRecognition?: any;
    }

    const windowWithSpeech = window as SpeechRecognitionWindow;
    
    if (!windowWithSpeech.webkitSpeechRecognition && !windowWithSpeech.SpeechRecognition) {
      toast({
        title: "음성 인식 미지원",
        description: "브라우저에서 음성 인식을 지원하지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 음성 인식 시작",
        description: "말씀해 주세요...",
      });
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      console.log('Speech result:', speechResult);
      
      toast({
        title: "음성 인식 완료",
        description: `"${speechResult}"로 인식되었습니다.`,
      });
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast({
        title: "음성 인식 오류",
        description: "음성 인식 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const getVoiceIcon = () => {
    switch (type) {
      case 'question':
        return <Brain className="w-4 h-4" />;
      case 'guide':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Volume2 className="w-4 h-4" />;
    }
  };

  const getVoiceLabel = () => {
    switch (type) {
      case 'question':
        return '질문 듣기';
      case 'guide':
        return '가이드 듣기';
      default:
        return '결과 듣기';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🎙️ {title}
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            음성 지원
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          시각 장애인과 고령자를 위한 음성 접근성 기능입니다.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={isPlaying ? stopSpeech : handleTextToSpeech}
            variant={isPlaying ? "destructive" : "default"}
            className="h-12 gap-2"
            disabled={!text}
          >
            {isPlaying ? <VolumeX className="w-4 h-4" /> : getVoiceIcon()}
            {isPlaying ? '음성 정지' : getVoiceLabel()}
          </Button>
          
          <Button
            onClick={handleSpeechToText}
            variant="outline"
            className="h-12 gap-2"
            disabled={isListening}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? '인식 중...' : '음성 입력'}
          </Button>
        </div>
        
        {isPlaying && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700 font-medium">음성으로 재생 중...</span>
            </div>
          </div>
        )}
        
        {isListening && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">음성을 듣고 있습니다...</span>
            </div>
          </div>
        )}
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700">
            ✨ <strong>ElevenLabs AI 음성 적용!</strong> 자연스럽고 전문적인 AI 음성으로 업그레이드되었습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceFeature;