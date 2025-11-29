import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceObservationRecorderProps {
  onObservationCreated: (observation: any) => void;
}

const VoiceObservationRecorder: React.FC<VoiceObservationRecorderProps> = ({ 
  onObservationCreated 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "🎤 녹음 시작",
        description: "관찰 내용을 자유롭게 말씀해주세요",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "녹음 시작 실패",
        description: "마이크 권한을 확인해주세요",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) {
          throw new Error('Failed to convert audio');
        }

        toast({
          title: "🔄 AI 분석 중...",
          description: "음성을 텍스트로 변환하고 구조화하는 중입니다",
        });

        const { data, error } = await supabase.functions.invoke('voice-to-observation', {
          body: { audioBase64: base64Audio }
        });

        if (error) throw error;

        toast({
          title: "✅ 변환 완료!",
          description: "AI가 관찰일지를 자동으로 작성했습니다",
        });

        onObservationCreated(data);
      };
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "처리 실패",
        description: "음성 처리 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">🎤 음성으로 빠르게 기록하기</h3>
          <p className="text-sm text-muted-foreground">
            관찰 내용을 말씀하시면 AI가 자동으로 정리해드립니다
          </p>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 text-red-500 animate-pulse">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI가 분석하는 중...</span>
          </div>
        )}

        <div className="flex gap-3">
          {!isRecording && !isProcessing && (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Mic className="w-5 h-5 mr-2" />
              녹음 시작
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
            >
              <Square className="w-5 h-5 mr-2" />
              녹음 종료
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center max-w-md">
          💡 팁: "오늘 아이가 어린이집에서..." 처럼 자연스럽게 말씀해주세요. 
          AI가 자동으로 카테고리와 감정을 분석합니다.
        </div>
      </div>
    </Card>
  );
};

export default VoiceObservationRecorder;
