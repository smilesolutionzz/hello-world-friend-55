import React from "react";
import { useAutoSaveTestResult } from "@/hooks/useAutoSaveTestResult";
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useToast } from '@/hooks/use-toast';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface SocialBehaviorCheckResultProps {
  results: any;
  answers: Record<string, string>;
  onBack: () => void;
}

const categoryInfo: Record<string, { label: string; emoji: string }> = {
  social_interaction: { label: '사회적 상호작용', emoji: '👥' },
  play_peer: { label: '놀이 및 또래관계', emoji: '🎮' },
  communication: { label: '의사소통', emoji: '💬' },
  behavioral_patterns: { label: '행동 패턴', emoji: '🧠' },
  sensory_response: { label: '감각 반응', emoji: '👂' },
};

const SocialBehaviorCheckResult: React.FC<SocialBehaviorCheckResultProps> = ({ results, answers, onBack }) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  useAutoSaveTestResult({ testType: "사회적 행동 발달 자가체크", results });

  const getColor = (s: number) => s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-primary' : s >= 40 ? 'bg-yellow-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 80 ? '우수' : s >= 60 ? '양호' : s >= 40 ? '관찰필요' : '지원필요';

  const domains: DomainScore[] = results.scores
    ? Object.entries(results.scores).map(([key, score]) => ({
        key,
        label: categoryInfo[key]?.label || key,
        score: score as number,
        maxScore: 100,
        level: getLevel(score as number),
        color: getColor(score as number),
      }))
    : [];

  const overallScore = results.overallScore || 0;
  const overallLevel = overallScore >= 80 ? '우수' : overallScore >= 60 ? '양호' : overallScore >= 40 ? '관찰필요' : '지원필요';
  const severityColor = overallScore >= 80 ? 'text-green-600 border-green-300' : overallScore >= 60 ? 'text-primary border-primary/30' : overallScore >= 40 ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  // Build sections from analysis object
  const aiSections: ReportSection[] = results.analysis ? [
    results.analysis.summary && { id: 'summary', icon: '💖', title: '종합 소견', content: results.analysis.summary, defaultOpen: true },
    results.analysis.strengths && { id: 'strengths', icon: '⭐', title: '강점 영역', content: results.analysis.strengths },
    results.analysis.observations && { id: 'observations', icon: '💡', title: '관찰 포인트', content: results.analysis.observations },
    results.analysis.activities && { id: 'activities', icon: '🎮', title: '추천 활동 가이드', content: results.analysis.activities },
    results.analysis.consultation && { id: 'consultation', icon: '👥', title: '전문 상담 안내', content: results.analysis.consultation },
  ].filter(Boolean) as ReportSection[] : [];

  const fullAnalysis = aiSections.map(s => s.content).join('\n\n');

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '사회적행동_발달_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName="사회적 행동 발달 자가체크 결과"
      subtitle="AIH 부모 관찰 기반 발달 체크리스트"
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={overallScore}
      totalLabel="종합 점수"
      scoreUnit="/ 100"
      scoreSeverity={overallLevel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={fullAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '사회적 행동 발달',
            subtitle: '5영역 분석',
            date: new Date().toLocaleDateString('ko-KR'),
            scores: results.scores ? Object.fromEntries(Object.entries(results.scores).map(([k, v]) => [k, ((v as number) / 100) * 7])) : {},
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(categoryInfo).map(([k, v]) => [k, v.label])),
            riskLevel: overallScore >= 60 ? 'low' : overallScore >= 40 ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default SocialBehaviorCheckResult;
