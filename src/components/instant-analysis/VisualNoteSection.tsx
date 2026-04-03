import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileImage, Lock, Crown, Loader2, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface VisualNoteSectionProps {
  analysisResult: any;
  inputText: string;
}

export const VisualNoteSection: React.FC<VisualNoteSectionProps> = ({ analysisResult, inputText }) => {
  const { isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-visual-note', {
        body: {
          analysisResult,
          inputText,
          language: isEnglish ? 'en' : 'ko',
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        setHasGenerated(true);

        // Check subscription status
        setCheckingSubscription(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          setIsSubscribed(!!sub);
        }
        setCheckingSubscription(false);
      }
    } catch (err) {
      console.error('Visual note generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const L = {
    title: isEnglish ? '1-Page Visual Note' : '1장 비주얼 노트',
    subtitle: isEnglish ? 'Premium infographic summary of your analysis' : '분석 결과를 한 장으로 요약한 프리미엄 인포그래픽',
    generate: isEnglish ? 'Generate Visual Note' : '비주얼 노트 생성하기',
    generating: isEnglish ? 'Generating infographic...' : '인포그래픽 생성 중...',
    premiumOnly: isEnglish ? 'Premium subscribers only' : '프리미엄 구독자 전용',
    unlockDesc: isEnglish
      ? 'Subscribe to unlock the full visual note and download it in high resolution'
      : '구독하시면 비주얼 노트 전체를 고해상도로 확인하고 다운로드할 수 있습니다',
    subscribe: isEnglish ? 'Subscribe to Unlock' : '구독하고 잠금 해제',
    download: isEnglish ? 'Download Visual Note' : '비주얼 노트 다운로드',
    features: isEnglish
      ? ['Score gauges & radar chart', 'Strengths/weaknesses breakdown', 'Personalized action items', 'Shareable infographic']
      : ['점수 게이지 & 레이더 차트', '강점/약점 분석', '맞춤형 실행 항목', '공유 가능한 인포그래픽'],
  };

  // Initial CTA state - not generated yet
  if (!hasGenerated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 overflow-hidden"
      >
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <FileImage className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                {L.title}
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">
                  Premium
                </Badge>
              </h4>
              <p className="text-[10px] text-white/50">{L.subtitle}</p>
            </div>
          </div>

          {/* Feature preview */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {L.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-lg p-2 border border-white/5">
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="text-[10px] text-white/70">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold py-4 rounded-xl"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {L.generating}
              </>
            ) : (
              <>
                <FileImage className="w-4 h-4 mr-2" />
                {L.generate}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Generated state - show image with blur for non-subscribers
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 overflow-hidden"
    >
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <FileImage className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="text-sm md:text-base font-bold text-white">{L.title}</h4>
          </div>
          {isSubscribed && (
            <a href={imageUrl || '#'} download="visual-note.png" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 text-xs">
                <Download className="w-3 h-3 mr-1" />
                {L.download}
              </Button>
            </a>
          )}
        </div>

        <div className="relative rounded-xl overflow-hidden">
          {/* Image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Visual Note"
              className={`w-full h-auto ${!isSubscribed ? 'filter blur-md' : ''}`}
            />
          )}

          {/* Blur overlay for non-subscribers */}
          {!isSubscribed && !checkingSubscription && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="text-center p-6 max-w-sm">
                <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{L.premiumOnly}</h3>
                <p className="text-xs text-white/60 mb-4">{L.unlockDesc}</p>
                <Button
                  onClick={() => navigate(isEnglish ? '/en/token-subscription' : '/token-subscription')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {L.subscribe}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VisualNoteSection;
