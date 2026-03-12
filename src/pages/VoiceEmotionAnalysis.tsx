import React from 'react';
import { VoiceEmotionAnalyzer } from '@/components/audio/VoiceEmotionAnalyzer';
import { useLanguage } from '@/i18n/LanguageContext';

export default function VoiceEmotionAnalysis() {
  const { isEnglish } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{isEnglish ? 'Voice Emotion Analysis' : '음성 감정 분석'}</h1>
          <p className="text-muted-foreground">{isEnglish ? 'AI analyzes emotions from your voice' : 'AI가 당신의 음성에서 감정을 분석합니다'}</p>
        </div>
        <VoiceEmotionAnalyzer />
        <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>{isEnglish ? '💡 Speak naturally in a comfortable environment' : '💡 편안한 환경에서 자연스럽게 말씀해주세요'}</p>
          <p>{isEnglish ? '🔒 All voice data is securely processed' : '🔒 모든 음성 데이터는 안전하게 처리됩니다'}</p>
        </div>
      </div>
    </div>
  );
}
