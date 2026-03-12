import { RealtimeVoiceChatComponent } from '@/components/voice/RealtimeVoiceChat';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';
import { useLanguage } from '@/i18n/LanguageContext';

function VoiceCounselingInner() {
  const { isEnglish } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{isEnglish ? 'AI Voice Counseling' : 'AI 음성 상담'}</h1>
          <p className="text-muted-foreground">{isEnglish ? 'Talk to an AI counselor in real-time' : '실시간으로 AI 상담사와 대화하세요'}</p>
        </div>
        <RealtimeVoiceChatComponent />
      </div>
    </div>
  );
}

export default function VoiceCounselingPage() {
  const { isEnglish } = useLanguage();
  return (
    <SubscriptionGuard featureName={isEnglish ? 'AI Voice Counseling' : 'AI 음성 상담'} trialKey="AI_COUNSELOR_CHAT">
      <VoiceCounselingInner />
    </SubscriptionGuard>
  );
}
