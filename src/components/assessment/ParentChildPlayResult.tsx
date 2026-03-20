import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import PlayActivityRecommendations from './PlayActivityRecommendations';
import GrowthReport from './GrowthReport';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface ParentChildPlayResultProps {
  result: {
    style: string;
    title: string;
    description: string;
    scores: Record<string, number>;
    aiAnalysis?: string;
    ageGroup: string;
    childAge: number;
    cognitiveScore?: number;
    emotionalScore?: number;
    socialScore?: number;
    physicalScore?: number;
  };
}

const scoreLabels: Record<string, string> = {
  collaborative: '협력적',
  supportive: '지원적',
  directive: '지시적',
  observant: '관찰적',
};

const devLabels: Record<string, string> = {
  cognitive: '인지 발달',
  emotional: '정서 발달',
  social: '사회성 발달',
  physical: '신체 발달',
};

const ageGroupLabels: Record<string, string> = {
  infant: '영아기 (0-2세)',
  child: '유아기 (3-6세)',
  school: '학령기 (7-12세)',
};

const ParentChildPlayResult = ({ result }: ParentChildPlayResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const devScores: Record<string, number> = {
    cognitive: result.cognitiveScore || 0,
    emotional: result.emotionalScore || 0,
    social: result.socialScore || 0,
    physical: result.physicalScore || 0,
  };

  const getColor = (s: number) => s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-yellow-500' : s >= 25 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (s: number) => s >= 75 ? '우수' : s >= 50 ? '양호' : s >= 25 ? '보통' : '관찰필요';

  const domains: DomainScore[] = Object.entries(devScores).map(([key, score]) => ({
    key,
    label: devLabels[key] || key,
    score,
    maxScore: 100,
    level: getLevel(score),
    color: getColor(score),
  }));

  // Also add play style scores as domains
  const styleDomains: DomainScore[] = Object.entries(result.scores).map(([key, score]) => ({
    key,
    label: scoreLabels[key] || key,
    score,
    maxScore: Math.max(...Object.values(result.scores), 10),
    level: '',
    color: 'bg-primary',
  }));

  const allDomains = [...domains, ...styleDomains];

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    const icons = ['🧠', '⭐', '🎯', '🎮', '📋', '💡', '🌱'];
    return paragraphs.slice(0, 7).map((p, idx) => {
      const firstLine = p.split('\n')[0].replace(/[#*]/g, '').trim();
      const rest = p.split('\n').slice(1).join('\n').trim() || p;
      return {
        id: `s-${idx}`,
        icon: icons[idx] || '📋',
        title: firstLine.length > 5 && firstLine.length < 50 ? firstLine : `분석 ${idx + 1}`,
        content: rest,
        defaultOpen: idx === 0,
      };
    });
  };

  const aiSections = parseAISections(result.aiAnalysis || '');
  const avgDev = Object.values(devScores).reduce((a, b) => a + b, 0) / 4;

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '부모아동_놀이평가_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const handleShare = async () => {
    const text = `부모아동 놀이성향: ${result.title}\n발달 점수 평균: ${Math.round(avgDev)}점`;
    if (navigator.share) await navigator.share({ title: '놀이평가 결과', text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast({ title: '복사 완료' }); }
  };

  return (
    <ClinicalReportLayout
      testName="부모아동 놀이성향 분석 결과"
      subtitle={`${ageGroupLabels[result.ageGroup] || result.ageGroup} · ${result.childAge}세 · ${result.title}`}
      onBack={() => navigate(-1)}
      onDownload={handleDownload}
      onShare={handleShare}
      totalScore={Math.round(avgDev)}
      totalLabel="발달 평균"
      scoreUnit="/ 100"
      scoreSeverity={result.title}
      severityColor="text-primary border-primary/30"
      domains={allDomains}
      aiAnalysis={result.aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '부모아동 놀이성향',
            subtitle: '발달 영역 분석',
            date: new Date().toLocaleDateString('ko-KR'),
            scores: Object.fromEntries(Object.entries(devScores).map(([k, v]) => [k, v / 100 * 7])),
            maxScore: 7,
            categoryTranslations: devLabels,
            riskLevel: avgDev >= 50 ? 'low' : avgDev >= 25 ? 'moderate' : 'high',
          }}
        />
      </div>
      {result.cognitiveScore && result.emotionalScore && result.socialScore && result.physicalScore && (
        <PlayActivityRecommendations
          cognitiveScore={result.cognitiveScore}
          emotionalScore={result.emotionalScore}
          socialScore={result.socialScore}
          physicalScore={result.physicalScore}
          ageGroup={result.ageGroup}
          childAge={result.childAge}
        />
      )}
      <GrowthReport childAge={result.childAge} ageGroup={result.ageGroup} />
    </ClinicalReportLayout>
  );
};

export default ParentChildPlayResult;
