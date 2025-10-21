import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ 
  text, 
  className = '' 
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handleSpeak = async () => {
    try {
      // 재생 중이면 중지
      if (isPlaying && audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);

      // Edge function 호출
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Base64를 Blob으로 변환
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // 오디오 재생
      const newAudio = new Audio(audioUrl);
      newAudio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      newAudio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: '재생 오류',
          description: '오디오 재생 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      };

      setAudio(newAudio);
      await newAudio.play();
      setIsPlaying(true);

    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast({
        title: '음성 변환 실패',
        description: '음성으로 변환하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSpeak}
      variant="outline"
      size="sm"
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          변환 중...
        </>
      ) : isPlaying ? (
        <>
          <VolumeX className="h-4 w-4 mr-2" />
          중지
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4 mr-2" />
          음성으로 듣기
        </>
      )}
    </Button>
  );
};
