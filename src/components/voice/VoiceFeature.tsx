import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Mic, MicOff, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      // Web Speech API 사용 (ElevenLabs 대신 임시)
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      // 음성 종료 시 상태 변경
      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "음성 재생 오류",
          description: "음성 재생 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      };

      speechSynthesis.speak(utterance);
      
      toast({
        title: "🎙️ 음성 재생 시작",
        description: "결과를 음성으로 들려드립니다.",
      });

    } catch (error) {
      setIsPlaying(false);
      console.error('TTS Error:', error);
      toast({
        title: "음성 기능 오류",
        description: "브라우저에서 음성 기능을 지원하지 않습니다.",
        variant: "destructive"
      });
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
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-700">
            💡 <strong>향후 업그레이드:</strong> ElevenLabs AI 음성으로 더욱 자연스럽고 전문적인 음성 서비스를 제공할 예정입니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceFeature;