import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import RedFlagAlertDialog from './RedFlagAlertDialog';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface AutismSpectrumResultProps {
  results: any;
  answers: Record<string, string>;
  onBack: () => void;
}

const categoryLabels: Record<string, string> = {
  social_communication: '사회적 소통',
  restricted_repetitive: '제한적 반복행동',
  sensory_processing: '감각처리',
  communication_language: '의사소통 언어',
  adaptive_functioning: '적응기능',
};

const AutismSpectrumResult: React.FC<AutismSpectrumResultProps> = ({ results, answers, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  const isHighRisk = results.scores?.riskLevel === '높음' || results.crisisIndicators?.needsImmediateAttention;

  useEffect(() => {
    if (isHighRisk) {
      setShowCrisisAlert(true);
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    }
  }, [results]);

  useAutoSaveTestResult({
    testType: '자폐스펙트럼 선별검사',
    results: { categoryScores: results.categoryScores, totalScore: results.totalScore, riskLevel: results.riskLevel },
    analysis: results.overallInterpretation,
    severity: results.riskLevel === 'high' ? '높음' : results.riskLevel === 'moderate' ? '보통' : '양호',
    ageGroup: 'child',
  });

  const getColor = (score: number) => {
    if (score >= 3.5) return 'bg-destructive';
    if (score >= 2.5) return 'bg-orange-500';
    if (score >= 2.0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLevel = (score: number) => {
    if (score >= 3.5) return '고도';
    if (score >= 2.5) return '중등도';
    if (score >= 2.0) return '경계선';
    return '정상';
  };

  const domains: DomainScore[] = results.scores?.categories
    ? Object.entries(results.scores.categories).map(([key, score]) => ({
        key,
        label: categoryLabels[key] || key,
        score: parseFloat((score as number).toFixed(1)),
        maxScore: 4,
        level: getLevel(score as number),
        color: getColor(score as number),
      }))
    : [];

  const parseAnalysisSections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    // Try splitting by paragraphs if no ## headers
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    if (paragraphs.length >= 3) {
      const icons = ['🧠', '📊', '💡', '🎯', '🌱', '💪', '📋'];
      paragraphs.slice(0, 7).forEach((p, idx) => {
        const firstLine = p.split('\n')[0].replace(/[#*]/g, '').trim();
        const rest = p.split('\n').slice(1).join('\n').trim() || p;
        sections.push({
          id: `s-${idx}`,
          icon: icons[idx] || '📋',
          title: firstLine.length > 5 && firstLine.length < 50 ? firstLine : `분석 ${idx + 1}`,
          content: rest,
          defaultOpen: idx === 0,
        });
      });
    }
    return sections;
  };

  const aiSections = parseAnalysisSections(results.overallInterpretation || '');
  const overallScore = results.scores?.overall?.toFixed(1) || 'N/A';
  const riskLabel = results.scores?.riskLevel || '알 수 없음';
  const severityColor = riskLabel === '높음' ? 'text-destructive border-destructive/30'
    : riskLabel === '주의' ? 'text-yellow-600 border-yellow-300'
    : 'text-green-600 border-green-300';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '자폐스펙트럼_선별검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  return (
    <>
      <RedFlagAlertDialog
        isOpen={showCrisisAlert}
        onClose={() => setShowCrisisAlert(false)}
        redFlagResult={{
          hasRedFlags: isHighRisk,
          flags: isHighRisk ? [{
            type: 'high_risk_score',
            severity: 'critical' as const,
            message: '신경발달 검사 결과 즉각적인 전문가 상담이 필요합니다',
            description: results.crisisIndicators?.crisisMessage || '전문가 평가가 필요합니다.'
          }] : [],
          overallSeverity: 'critical' as const,
        }}
      />

      <ClinicalReportLayout
        testName="AIH 신경발달 조기선별검사"
        subtitle="ASES-AIH (Autism Spectrum Early Screening)"
        onBack={onBack}
        onDownload={handleDownload}
        totalScore={overallScore}
        totalLabel="종합 점수"
        scoreUnit="/ 4.0"
        scoreSeverity={riskLabel}
        severityColor={severityColor}
        domains={domains}
        aiAnalysis={results.overallInterpretation}
        aiSections={aiSections.length > 0 ? aiSections : undefined}
      >
        <div className="mb-4">
          <VisualResultInfographic
            data={{
              testName: '신경발달 선별검사',
              subtitle: '5개 영역 종합 분석',
              date: new Date().toLocaleDateString('ko-KR'),
              scores: results.scores?.categories
                ? Object.fromEntries(Object.entries(results.scores.categories).map(([k, v]) => [k, (v as number) / 4 * 7]))
                : {},
              maxScore: 7,
              categoryTranslations: categoryLabels,
              aiSummary: results.overallInterpretation,
              riskLevel: riskLabel === '높음' ? 'high' : riskLabel === '주의' ? 'moderate' : 'low',
            }}
          />
        </div>
      </ClinicalReportLayout>
    </>
  );
};

export default AutismSpectrumResult;
