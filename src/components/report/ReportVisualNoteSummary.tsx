import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';

interface ReportVisualNoteSummaryProps {
  reportData: any;
  userName: string;
  userAge: number;
  gender: string;
}

function extractTopInsights(reportData: any, isEnglish: boolean): {
  overallScore: number;
  riskLevel: string;
  topStrengths: string[];
  topConcerns: string[];
  keyRecommendation: string;
  dimensionScores: { name: string; score: number }[];
} {
  const sections = reportData?.sections || [];
  const preprocessed = reportData?.preprocessedData;
  const dimScores = preprocessed?.dimensionScores || reportData?.dimensionScores || {};

  // Extract dimension scores
  const dimensionScores = Object.entries(dimScores)
    .filter(([k]) => !['total', 'average', 'age', 'ageInMonths'].includes(k))
    .slice(0, 6)
    .map(([name, score]) => ({ name, score: Number(score) || 0 }));

  // Overall score
  const overallScore = preprocessed?.overallScore || reportData?.overallScore || 
    (dimensionScores.length > 0 ? Math.round(dimensionScores.reduce((s, d) => s + d.score, 0) / dimensionScores.length) : 65);

  const riskLevel = preprocessed?.riskLevel || reportData?.riskLevel || 'moderate';

  // Extract strengths/concerns from sections text
  const allText = sections.map((s: any) => (s.content || '').replace(/<[^>]*>/g, '')).join(' ');
  const topStrengths = dimensionScores.filter(d => d.score <= 40).slice(0, 2).map(d => d.name);
  const topConcerns = dimensionScores.filter(d => d.score >= 60).slice(0, 2).map(d => d.name);

  const keyRecommendation = sections.find((s: any) => 
    s.title?.includes('개입') || s.title?.includes('로드맵') || s.title?.includes('Intervention') || s.title?.includes('Roadmap')
  )?.content?.replace(/<[^>]*>/g, '').substring(0, 120) || 
  (isEnglish ? 'Continue regular monitoring and follow the recommended activities.' : '정기적인 모니터링을 지속하고 추천 활동을 따라주세요.');

  return { overallScore, riskLevel, topStrengths, topConcerns, keyRecommendation, dimensionScores };
}

const DIMENSION_KO: Record<string, string> = {
  anxiety: '불안', depression: '우울', stress: '스트레스', anger: '분노',
  positive: '긍정', engagement: '몰입', social: '사회성', emotional: '정서',
  cognitive: '인지', language: '언어', motor: '운동', attention: '주의력',
  selfEsteem: '자존감', sleep: '수면', behavior: '행동',
};

const ReportVisualNoteSummary: React.FC<ReportVisualNoteSummaryProps> = ({
  reportData, userName, userAge, gender
}) => {
  const { isEnglish } = useLanguage();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const t = (ko: string, en: string) => isEnglish ? en : ko;

  const insights = extractTopInsights(reportData, isEnglish);
  const date = new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Auto-save visual note to DB
  useEffect(() => {
    const saveVisualNote = async () => {
      if (isSaved) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        await supabase.from('visual_notes' as any).insert({
          user_id: session.user.id,
          title: `${userName} ${t('종합 리포트 요약', 'Report Summary')}`,
          source_type: 'assessment',
          summary_data: {
            title: `${userName} ${t('리포트 요약', 'Report Summary')}`,
            subtitle: date,
            centerTheme: t('종합 분석', 'Analysis'),
            sections: insights.dimensionScores.map(d => ({
              title: DIMENSION_KO[d.name] || d.name,
              icon: '📊',
              points: [`${d.score}${t('점', 'pt')}`],
            })),
            keyInsight: insights.keyRecommendation,
            actionItems: insights.topConcerns.map(c => DIMENSION_KO[c] || c),
            moodColor: insights.overallScore <= 40 ? 'green' : insights.overallScore <= 60 ? 'amber' : 'rose',
          },
        });
        setIsSaved(true);
      } catch (e) {
        console.warn('Visual note save failed:', e);
      }
    };
    saveVisualNote();
  }, []);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const link = document.createElement('a');
      link.download = `AIHPRO_${userName}_${t('요약카드', 'SummaryCard')}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: t('📥 카드 다운로드 완료', '📥 Card Downloaded') });
    } catch {
      toast({ title: t('다운로드 실패', 'Download Failed'), variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const scoreColor = insights.overallScore <= 40 ? '#059669' : insights.overallScore <= 60 ? '#D97706' : '#DC2626';
  const scoreLabel = insights.overallScore <= 40 ? t('양호', 'Good') : insights.overallScore <= 60 ? t('관심 필요', 'Moderate') : t('주의', 'Caution');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-white">{t('📋 1장 요약 비주얼 노트', '📋 One-Page Visual Summary')}</h3>
        </div>
        <Button onClick={downloadCard} disabled={isGenerating} size="sm" className="gap-1.5 text-xs">
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {t('PNG 저장', 'Save PNG')}
        </Button>
      </div>

      {/* Card */}
      <div ref={cardRef} style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", maxWidth: '600px', margin: '0 auto' }}>
        {/* Logo & Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#6B7280', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>AIHPRO REPORT SUMMARY</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B' }}>{userName} {t('님의 종합 분석', "'s Analysis")}</div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{date} · {userAge}{t('세', 'y/o')} · {gender === 'male' ? t('남', 'M') : t('여', 'F')}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: `4px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: scoreColor }}>{insights.overallScore}</div>
            </div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: scoreColor, marginTop: '4px' }}>{scoreLabel}</div>
          </div>
        </div>

        {/* Dimension Bars */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('영역별 분석', 'DOMAIN ANALYSIS')}</div>
          {insights.dimensionScores.map((d, i) => {
            const barColor = d.score <= 40 ? '#059669' : d.score <= 60 ? '#D97706' : '#DC2626';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '60px', fontSize: '11px', fontWeight: '600', color: '#64748B', textAlign: 'right' }}>
                  {DIMENSION_KO[d.name] || d.name}
                </div>
                <div style={{ flex: 1, height: '12px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(d.score, 100)}%`, height: '100%', background: barColor, borderRadius: '6px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ width: '30px', fontSize: '11px', fontWeight: '700', color: barColor }}>{d.score}</div>
              </div>
            );
          })}
        </div>

        {/* Strengths & Concerns */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, padding: '12px', background: '#ECFDF5', borderRadius: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#059669', marginBottom: '6px' }}>💪 {t('강점 영역', 'Strengths')}</div>
            {insights.topStrengths.length > 0 ? insights.topStrengths.map((s, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#065F46', fontWeight: '600' }}>• {DIMENSION_KO[s] || s}</div>
            )) : <div style={{ fontSize: '11px', color: '#065F46' }}>{t('전체적으로 균형 잡힌 상태', 'Balanced overall')}</div>}
          </div>
          <div style={{ flex: 1, padding: '12px', background: '#FFF7ED', borderRadius: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#D97706', marginBottom: '6px' }}>🔍 {t('관심 영역', 'Focus Areas')}</div>
            {insights.topConcerns.length > 0 ? insights.topConcerns.map((c, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#92400E', fontWeight: '600' }}>• {DIMENSION_KO[c] || c}</div>
            )) : <div style={{ fontSize: '11px', color: '#92400E' }}>{t('특별한 우려 영역 없음', 'No significant concerns')}</div>}
          </div>
        </div>

        {/* Key Recommendation */}
        <div style={{ padding: '12px', background: '#EFF6FF', borderRadius: '10px', borderLeft: '4px solid #3B82F6', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB', marginBottom: '4px' }}>💡 {t('핵심 제언', 'Key Recommendation')}</div>
          <div style={{ fontSize: '11px', color: '#1E40AF', lineHeight: '1.5' }}>{insights.keyRecommendation}</div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
          <div style={{ fontSize: '9px', color: '#94A3B8' }}>© AIHPRO · AI 기반 아동 발달 분석 플랫폼</div>
          <div style={{ fontSize: '9px', color: '#94A3B8' }}>hilightpro.lovable.app</div>
        </div>
      </div>

      {isSaved && (
        <p className="text-center text-xs text-muted-foreground">
          ✅ {t('비주얼 노트가 대시보드에 자동 저장되었습니다', 'Visual note saved to dashboard automatically')}
        </p>
      )}
    </div>
  );
};

export default ReportVisualNoteSummary;
