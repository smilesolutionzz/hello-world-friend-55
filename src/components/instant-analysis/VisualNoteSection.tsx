import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileImage, Lock, Crown, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import VisualSummaryCard from '@/components/visual-summary/VisualSummaryCard';
import type { VisualSummaryData } from '@/components/visual-summary/VisualSummaryCard';

interface VisualNoteSectionProps {
  analysisResult: any;
  inputText: string;
}

export const VisualNoteSection: React.FC<VisualNoteSectionProps> = ({ analysisResult, inputText }) => {
  const { isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [summaryData, setSummaryData] = useState<VisualSummaryData | null>(null);
  const [illustrationImage, setIllustrationImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Use the same generate-visual-summary edge function as voice counseling
      const { data, error } = await supabase.functions.invoke('generate-visual-summary', {
        body: {
          type: 'assessment',
          content: {
            sections: analysisResult.recommendations?.map((r: string, i: number) => ({
              title: `추천 ${i + 1}`,
              content: r,
            })) || [],
            summary: analysisResult.comprehensiveReports?.developmentAssessment
              ? `종합점수: ${analysisResult.comprehensiveReports.developmentAssessment.overall || analysisResult.confidence || 75}/100. ${analysisResult.type || '고민'} 분석 결과.`
              : inputText,
            analysisType: analysisResult.type || '고민 분석',
            severity: analysisResult.severity || '중간',
            deepAnalysis: analysisResult.deepAnalysis?.rootCauseAnalysis || '',
            strengths: analysisResult.comprehensiveReports?.strengthsWeaknesses?.strengths || [],
            weaknesses: analysisResult.comprehensiveReports?.strengthsWeaknesses?.weaknesses || [],
          },
          testType: analysisResult.type || '고민 분석',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.summary) {
        setSummaryData(data.summary);
        setIllustrationImage(data.illustrationImage || null);
        setHasGenerated(true);

        // Check subscription status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          setIsSubscribed(!!sub);

          // Save to visual_notes
          try {
            await supabase.from('visual_notes' as any).insert({
              user_id: user.id,
              title: data.summary.title || '고민 분석 비주얼 노트',
              source_type: 'assessment',
              summary_data: data.summary,
              background_image_url: data.illustrationImage || null,
            });
          } catch (saveErr) {
            console.warn('Failed to save visual note:', saveErr);
          }
        }

        setShowDialog(true);
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
    features: isEnglish
      ? ['Score gauges & radar chart', 'Strengths/weaknesses breakdown', 'Personalized action items', 'Shareable infographic']
      : ['점수 게이지 & 레이더 차트', '강점/약점 분석', '맞춤형 실행 항목', '공유 가능한 인포그래픽'],
    dialogTitle: isEnglish ? '🎨 Visual Note' : '🎨 비주얼 노트',
  };

  return (
    <>
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
            onClick={hasGenerated ? () => setShowDialog(true) : handleGenerate}
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
                {hasGenerated ? (isEnglish ? 'View Visual Note' : '비주얼 노트 보기') : L.generate}
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Dialog with VisualSummaryCard */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{L.dialogTitle}</DialogTitle>
          </DialogHeader>

          {summaryData && isSubscribed && (
            <VisualSummaryCard
              data={summaryData}
              illustrationImage={illustrationImage}
              onClose={() => setShowDialog(false)}
            />
          )}

          {summaryData && !isSubscribed && (
            <div className="relative">
              <div className="filter blur-md pointer-events-none">
                <VisualSummaryCard
                  data={summaryData}
                  illustrationImage={illustrationImage}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
                <div className="text-center p-6 max-w-sm">
                  <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{L.premiumOnly}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{L.unlockDesc}</p>
                  <Button
                    onClick={() => navigate(isEnglish ? '/en/token-subscription' : '/token-subscription')}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {L.subscribe}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VisualNoteSection;
