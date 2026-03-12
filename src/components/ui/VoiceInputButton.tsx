import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

interface VoiceInputButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
  isFixed?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscription,
  disabled = false,
  className = "",
  isFixed = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    } catch (error) {
      return 'prompt';
    }
  };

  const startRecording = async () => {
    const permissionState = await checkMicrophonePermission();
    
    if (permissionState === 'denied') {
      toast({
        title: isEnglish ? 'Microphone permission required' : '마이크 접근 권한 필요',
        description: isEnglish
          ? 'Please allow microphone access in browser settings (lock icon next to address bar).'
          : '브라우저 설정에서 마이크 권한을 허용해주세요. 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 설정할 수 있습니다.',
        variant: 'destructive',
      });
      return;
    }

    if (permissionState === 'prompt') {
      toast({
        title: isEnglish ? 'Requesting microphone permission' : '마이크 접근 권한 요청',
        description: isEnglish
          ? 'Please allow microphone access for voice input.'
          : '음성 분석을 위해 마이크 접근을 허용해주세요.',
      });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: isEnglish ? 'Recording started' : '녹음 시작',
        description: isEnglish
          ? 'Please speak. Press again to stop recording.'
          : '말씀하세요. 다시 버튼을 눌러 녹음을 종료합니다.',
      });
    } catch (error) {
      console.error('Recording error:', error);
      const errorMessage = error instanceof Error && error.name === 'NotAllowedError' 
        ? (isEnglish
          ? 'Microphone access was denied. Please allow microphone permission in browser settings.'
          : '마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
        : (isEnglish
          ? 'Unable to access microphone. Check if another app is using it.'
          : '마이크에 접근할 수 없습니다. 다른 앱에서 마이크를 사용 중인지 확인해주세요.');
        
      toast({
        title: isEnglish ? 'Recording error' : '녹음 오류',
        description: errorMessage,
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

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      if (chunksRef.current.length === 0) {
        throw new Error(isEnglish ? 'No recorded audio data' : '녹음된 데이터가 없습니다');
      }

      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binary);

      // Send to Supabase edge function
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio, language: isEnglish ? 'en' : 'ko' }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.text) {
        onTranscription(data.text);
        toast({
          title: isEnglish ? 'Transcription complete' : '음성 인식 완료',
          description: isEnglish ? 'Text has been inserted.' : '텍스트가 입력되었습니다.',
        });
      } else {
        throw new Error(isEnglish ? 'Could not transcribe audio' : '음성을 인식할 수 없습니다');
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: isEnglish ? 'Voice processing error' : '음성 처리 오류',
        description: error instanceof Error
          ? error.message
          : (isEnglish ? 'An error occurred while processing voice.' : '음성 처리 중 오류가 발생했습니다'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`flex items-center gap-2 ${isFixed ? 'fixed bottom-20 right-4 z-50 shadow-lg' : ''} ${className}`}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
      {isProcessing
        ? (isEnglish ? 'Processing...' : '처리 중...')
        : isRecording
        ? (isEnglish ? 'Stop' : '녹음 중지')
        : (isEnglish ? 'Voice Input' : '음성 입력')}
    </Button>
  );
};
