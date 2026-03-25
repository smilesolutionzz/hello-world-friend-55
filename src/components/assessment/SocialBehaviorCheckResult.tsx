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

const categoryInfoKo: Record<string, { label: string; emoji: string }> = {
  social_interaction: { label: '사회적 상호작용', emoji: '👥' },
  play_peer: { label: '놀이 및 또래관계', emoji: '🎮' },
  communication: { label: '의사소통', emoji: '💬' },
  behavioral_patterns: { label: '행동 패턴', emoji: '🧠' },
  sensory_response: { label: '감각 반응', emoji: '👂' },
};

const categoryInfoEn: Record<string, { label: string; emoji: string }> = {
  social_interaction: { label: 'Social Interaction', emoji: '👥' },
  play_peer: { label: 'Play & Peer Relations', emoji: '🎮' },
  communication: { label: 'Communication', emoji: '💬' },
  behavioral_patterns: { label: 'Behavioral Patterns', emoji: '🧠' },
  sensory_response: { label: 'Sensory Response', emoji: '👂' },
};

const SocialBehaviorCheckResult: React.FC<SocialBehaviorCheckResultProps> = ({ results, answers, onBack }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const categoryInfo = isEnglish ? categoryInfoEn : categoryInfoKo;

  useAutoSaveTestResult({ testType: isEnglish ? "Social Behavior Development Check" : "사회적 행동 발달 자가체크", results });

  const getColor = (s: number) => s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-primary' : s >= 40 ? 'bg-yellow-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 80 ? (isEnglish ? 'Excellent' : '우수') : s >= 60 ? (isEnglish ? 'Good' : '양호') : s >= 40 ? (isEnglish ? 'Observe' : '관찰필요') : (isEnglish ? 'Support Needed' : '지원필요');

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
  const overallLevel = overallScore >= 80 ? (isEnglish ? 'Excellent' : '우수') : overallScore >= 60 ? (isEnglish ? 'Good' : '양호') : overallScore >= 40 ? (isEnglish ? 'Observe' : '관찰필요') : (isEnglish ? 'Support Needed' : '지원필요');
  const severityColor = overallScore >= 80 ? 'text-green-600 border-green-300' : overallScore >= 60 ? 'text-primary border-primary/30' : overallScore >= 40 ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const sectionTitles = isEnglish
    ? { summary: 'Overall Assessment', strengths: 'Strengths', observations: 'Key Observations', activities: 'Recommended Activities', consultation: 'Consultation Guide' }
    : { summary: '종합 소견', strengths: '강점 영역', observations: '관찰 포인트', activities: '추천 활동 가이드', consultation: '전문 상담 안내' };

  const aiSections: ReportSection[] = results.analysis ? [
    results.analysis.summary && { id: 'summary', icon: '💖', title: sectionTitles.summary, content: results.analysis.summary, defaultOpen: true },
    results.analysis.strengths && { id: 'strengths', icon: '⭐', title: sectionTitles.strengths, content: results.analysis.strengths },
    results.analysis.observations && { id: 'observations', icon: '💡', title: sectionTitles.observations, content: results.analysis.observations },
    results.analysis.activities && { id: 'activities', icon: '🎮', title: sectionTitles.activities, content: results.analysis.activities },
    results.analysis.consultation && { id: 'consultation', icon: '👥', title: sectionTitles.consultation, content: results.analysis.consultation },
  ].filter(Boolean) as ReportSection[] : [];

  const fullAnalysis = aiSections.map(s => s.content).join('\n\n');

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'SocialBehavior_Results' : '사회적행동_발달_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? "Social Behavior Development Check Results" : "사회적 행동 발달 자가체크 결과"}
      subtitle={isEnglish ? "AIH Parent Observation-Based Checklist" : "AIH 부모 관찰 기반 발달 체크리스트"}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={overallScore}
      totalLabel={isEnglish ? "Overall Score" : "종합 점수"}
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
            testName: isEnglish ? 'Social Behavior' : '사회적 행동 발달',
            subtitle: isEnglish ? '5 Domain Analysis' : '5영역 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
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
