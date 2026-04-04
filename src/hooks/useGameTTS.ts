import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseGameTTSReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
}

export function useGameTTS(): UseGameTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const abortRef = useRef(false);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  const stop = useCallback(() => {
    abortRef.current = true;
    cleanup();
    setIsSpeaking(false);
    setIsLoading(false);
  }, [cleanup]);

  const speak = useCallback(async (text: string) => {
    // Stop any current playback
    stop();
    abortRef.current = false;

    if (!text.trim()) return;

    // TTS용 텍스트 정제: 특수문자 제거 (물결표, 별표 등)
    const cleanedText = text
      .replace(/[~～♪♡★☆※◆◇▶▷●○■□△▽♥♠♣♦…]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!cleanedText) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { text: cleanedText, voice: 'rumam', model: 'eleven_multilingual_v2' }
      });

      if (abortRef.current) return;
      if (error) throw error;

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Use data URI for reliable base64 audio playback
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        audioRef.current = null;
        // Fallback to browser TTS
        fallbackSpeak(cleanedText);
      };

      setIsLoading(false);
      setIsSpeaking(true);
      
      // Mobile browsers require user interaction for audio playback
      // Use play() promise to catch autoplay restrictions
      try {
        await audio.play();
      } catch (playErr) {
        console.warn('Audio play blocked (autoplay policy), falling back to browser TTS:', playErr);
        audioRef.current = null;
        fallbackSpeak(cleanedText);
      }
    } catch (err) {
      console.error('TTS error:', err);
      setIsLoading(false);
      if (!abortRef.current) {
        fallbackSpeak(cleanedText);
      }
    }
  }, [stop]);

  const fallbackSpeak = useCallback((text: string) => {
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, isLoading };
}
