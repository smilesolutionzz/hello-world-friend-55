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
    // Browser TTS fallback도 함께 중지 (페이지 이탈 시 목소리 잔존 방지)
    try {
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }
    } catch {
      /* ignore */
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
      if (typeof speechSynthesis === 'undefined') {
        console.warn('SpeechSynthesis not available');
        setIsSpeaking(false);
        setIsLoading(false);
        return;
      }
      speechSynthesis.cancel();
      
      const trySpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.9;
        
        // Try to find a Korean voice
        const voices = speechSynthesis.getVoices();
        const koVoice = voices.find(v => v.lang.startsWith('ko'));
        if (koVoice) utterance.voice = koVoice;
        
        utterance.onstart = () => { setIsSpeaking(true); setIsLoading(false); };
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => { setIsSpeaking(false); setIsLoading(false); };
        speechSynthesis.speak(utterance);
      };

      // On mobile, voices may load asynchronously
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          speechSynthesis.onvoiceschanged = null;
          trySpeak();
        };
        // Timeout fallback if voices never load
        setTimeout(() => {
          if (speechSynthesis.getVoices().length === 0) {
            // Still try without specific voice
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.9;
            utterance.onstart = () => { setIsSpeaking(true); setIsLoading(false); };
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => { setIsSpeaking(false); setIsLoading(false); };
            speechSynthesis.speak(utterance);
          }
        }, 500);
      } else {
        trySpeak();
      }
    } catch {
      setIsSpeaking(false);
      setIsLoading(false);
    }
  }, []);

  return { speak, stop, isSpeaking, isLoading };
}
