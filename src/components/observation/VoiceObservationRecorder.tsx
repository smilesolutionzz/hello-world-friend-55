import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

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
        title: "녹음 시작",
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
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) {
          throw new Error('Failed to convert audio');
        }

        toast({
          title: "AI 분석 중...",
          description: "음성을 텍스트로 변환하고 있습니다",
        });

        const { data, error } = await supabase.functions.invoke('voice-to-observation', {
          body: { audioBase64: base64Audio }
        });

        if (error) throw error;

        toast({
          title: "변환 완료",
          description: "AI가 관찰일지를 작성했습니다",
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
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6">
          {/* 녹음 버튼 */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div
                  key="recording"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  {/* 파동 효과 */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-destructive/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-destructive/20"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    variant="destructive"
                    className="w-20 h-20 rounded-full relative z-10"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                </motion.div>
              ) : isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-20 h-20 rounded-full bg-muted flex items-center justify-center"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="w-20 h-20 rounded-full"
                  >
                    <Mic className="w-8 h-8" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 상태 텍스트 */}
          <div className="text-center space-y-1">
            {isRecording ? (
              <>
                <div className="flex items-center gap-2 justify-center text-destructive">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="font-mono text-lg font-medium">{formatTime(recordingTime)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  녹음 중... 완료되면 버튼을 눌러주세요
                </p>
              </>
            ) : isProcessing ? (
              <p className="text-sm text-muted-foreground">
                AI가 음성을 분석하고 있습니다...
              </p>
            ) : (
              <>
                <p className="font-medium">음성으로 기록하기</p>
                <p className="text-sm text-muted-foreground">
                  버튼을 누르고 관찰 내용을 말씀해주세요
                </p>
              </>
            )}
          </div>

          {/* 팁 */}
          {!isRecording && !isProcessing && (
            <div className="text-xs text-center text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-sm">
              💡 "오늘 아이가 어린이집에서..." 처럼 자연스럽게 말씀해주세요
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceObservationRecorder;
