import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription }) => {
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: isEnglish ? 'Recording started' : '녹음 시작',
        description: isEnglish
          ? 'Recording your voice. Press again to stop.'
          : '음성을 녹음하고 있습니다. 다시 버튼을 눌러 종료하세요.',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: isEnglish ? 'Recording failed' : '녹음 실패',
        description: isEnglish
          ? 'Please check microphone permission.'
          : '마이크 접근 권한을 확인해주세요.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];

        console.log('Sending audio to transcription service...');

        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Data, language: isEnglish ? 'en' : 'ko' }
        });

        if (error) {
          throw error;
        }

        if (data?.text) {
          onTranscription(data.text);
          toast({
            title: isEnglish ? 'Transcription complete' : '변환 완료',
            description: isEnglish
              ? 'Your voice has been converted to text.'
              : '음성이 텍스트로 변환되었습니다.',
          });
        } else {
          throw new Error(isEnglish ? 'No transcription result' : '변환 결과가 없습니다');
        }
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: isEnglish ? 'Transcription failed' : '변환 실패',
        description: error instanceof Error
          ? error.message
          : (isEnglish ? 'Failed to convert voice to text.' : '음성을 텍스트로 변환할 수 없습니다.'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{isEnglish ? 'Voice Recording' : '음성 녹음'}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isRecording ? (isEnglish ? 'Recording...' : '녹음 중...') : (
                <>
                  {isEnglish ? 'Press the button to' : '버튼을 눌러'}
                  <br className="block sm:hidden" />
                  {isEnglish ? 'start recording' : '녹음을 시작하세요'}
                </>
              )}
            </p>
          </div>

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            size="lg"
            variant={isRecording ? 'destructive' : 'default'}
            className="w-32 h-32 rounded-full"
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : isRecording ? (
              <Square className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </Button>

          {isProcessing && (
            <p className="text-sm text-muted-foreground">
              {isEnglish ? 'Converting to text...' : '텍스트로 변환 중...'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
