import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface AttachmentStyleResultProps {
  result: {
    answers: Record<string, number>;
    anxietyScore: number;
    avoidanceScore: number;
    style: string;
    total: number;
    average: number;
    analysis?: string;
  };
  onRestart: () => void;
}

const AttachmentStyleResult: React.FC<AttachmentStyleResultProps> = ({ result, onRestart }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish, localePath } = useLanguage();

  useAutoSaveTestResult({
    testType: '애착 유형 검사',
    results: {
      total: result.total,
      average: result.average,
      anxietyScore: result.anxietyScore,
      avoidanceScore: result.avoidanceScore,
      style: result.style,
    },
    analysis: result.analysis || `애착 유형: ${result.style}, 불안: ${result.anxietyScore.toFixed(1)}/7, 회피: ${result.avoidanceScore.toFixed(1)}/7`,
  });

  const styleLabelsEn: Record<string, string> = { '안정형': 'Secure', '불안형': 'Anxious', '회피형': 'Avoidant', '혼란형': 'Disorganized' };
  const styleDescKo: Record<string, string> = { '안정형': '건강한 관계를 형성하는 유형', '불안형': '관계에 대한 걱정이 많은 유형', '회피형': '독립성을 중시하는 유형', '혼란형': '친밀함과 거리감 사이에서 혼란스러운 유형' };
  const styleDescEn: Record<string, string> = { '안정형': 'Forms healthy relationships', '불안형': 'Worries about relationships', '회피형': 'Values independence', '혼란형': 'Confused between closeness and distance' };

  const getColor = (score: number) => score >= 5 ? 'bg-destructive' : score >= 3.5 ? 'bg-orange-500' : 'bg-green-500';
  const getLevel = (score: number) => score >= 5 ? (isEnglish ? 'High' : '높음') : score >= 3.5 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Low' : '낮음');

  const domains: DomainScore[] = [
    { key: 'anxiety', label: isEnglish ? 'Anxiety' : '불안 점수', score: parseFloat(result.anxietyScore.toFixed(1)), maxScore: 7, level: getLevel(result.anxietyScore), color: getColor(result.anxietyScore) },
    { key: 'avoidance', label: isEnglish ? 'Avoidance' : '회피 점수', score: parseFloat(result.avoidanceScore.toFixed(1)), maxScore: 7, level: getLevel(result.avoidanceScore), color: getColor(result.avoidanceScore) },
  ];

  const parseAnalysisSections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    const regex = /##\s*([^\n]+)\n([\s\S]*?)(?=##\s*|$)/g;
    let match, idx = 0;
    while ((match = regex.exec(text)) !== null) {
      const title = match[1].replace(/^[^\w가-힣]*/, '').trim();
      const content = match[2].replace(/\*\*/g, '').trim();
      if (content.length > 10) {
        const emojiMatch = match[1].match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        sections.push({ id: `s-${idx}`, icon: emojiMatch?.[0] || '📋', title, content, defaultOpen: idx === 0 });
        idx++;
      }
    }
    return sections;
  };

  const aiSections = parseAnalysisSections(result.analysis || '');
  const styleName = isEnglish ? (styleLabelsEn[result.style] || result.style) : result.style;
  const styleDesc = isEnglish ? (styleDescEn[result.style] || '') : (styleDescKo[result.style] || '');

  const isHealthy = result.style === '안정형';
  const severityColor = isHealthy ? 'text-green-600 border-green-300'
    : result.style === '혼란형' ? 'text-destructive border-destructive/30'
    : 'text-yellow-600 border-yellow-300';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Attachment_Result' : '애착유형_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const handleShare = async () => {
    const text = `${isEnglish ? 'Attachment Style' : '애착 유형'}: ${styleName}\n${isEnglish ? 'Anxiety' : '불안'}: ${result.anxietyScore.toFixed(1)}/7\n${isEnglish ? 'Avoidance' : '회피'}: ${result.avoidanceScore.toFixed(1)}/7`;
    if (navigator.share) await navigator.share({ title: isEnglish ? 'Attachment Style' : '애착 유형 검사', text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast({ title: isEnglish ? 'Copied' : '복사 완료' }); }
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Attachment Style Test Results' : '애착 유형 검사 결과'}
      subtitle={styleDesc}
      onBack={onRestart}
      onDownload={handleDownload}
      onShare={handleShare}
      totalScore={styleName}
      totalLabel={isEnglish ? 'Attachment Type' : '애착 유형'}
      scoreSeverity={styleName}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={result.analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Attachment Style' : '애착 유형',
            subtitle: styleName,
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: { anxiety: result.anxietyScore, avoidance: result.avoidanceScore },
            maxScore: 7,
            categoryTranslations: {
              anxiety: isEnglish ? 'Anxiety' : '불안',
              avoidance: isEnglish ? 'Avoidance' : '회피',
            },
            aiSummary: result.analysis,
            riskLevel: isHealthy ? 'low' : result.style === '혼란형' ? 'high' : 'moderate',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default AttachmentStyleResult;
