import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n/LanguageContext';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface RelationshipStyleResultProps {
  result: {
    type: string;
    scores: Record<string, number>;
    result: {
      title: string;
      description: string;
      characteristics: string[];
      advice: string;
      color: string;
      icon: any;
    };
    answers: Record<number, string>;
  };
  onBack?: () => void;
}

const typeNamesKo: Record<string, string> = {
  secure: '안정형', anxious: '불안형', avoidant: '회피형', dismissive: '무시형',
  assertive: '단정적', passive: '수동적', aggressive: '공격적', passive_aggressive: '소극적 공격',
};
const typeNamesEn: Record<string, string> = {
  secure: 'Secure', anxious: 'Anxious', avoidant: 'Avoidant', dismissive: 'Dismissive',
  assertive: 'Assertive', passive: 'Passive', aggressive: 'Aggressive', passive_aggressive: 'Passive-Aggressive',
};

const RelationshipStyleResult = ({ result, onBack }: RelationshipStyleResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();

  useAutoSaveTestResult({
    testType: '관계 스타일 검사',
    results: { type: result.type, scores: result.scores, title: result.result.title },
    severity: result.type === 'secure' || result.type === 'assertive' ? '양호' : '보통',
    ageGroup: 'adult',
  });

  const totalQuestions = Object.keys(result.answers).length;
  const getScorePercentage = (type: string) => Math.round((result.scores[type] / totalQuestions) * 100);

  const getColor = (pct: number) => pct >= 40 ? 'bg-primary' : pct >= 25 ? 'bg-yellow-500' : 'bg-muted';
  const getLevel = (pct: number) => pct >= 40 ? (isEnglish ? 'Dominant' : '우세') : pct >= 25 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Low' : '낮음');

  const domains: DomainScore[] = Object.entries(result.scores).map(([key, score]) => {
    const pct = getScorePercentage(key);
    const names = isEnglish ? typeNamesEn : typeNamesKo;
    return { key, label: names[key] || key, score: pct, maxScore: 100, level: getLevel(pct), color: getColor(pct) };
  });

  // Top type score for severity
  const topPct = Math.max(...domains.map(d => d.score));
  const severityColor = topPct >= 50 ? 'text-primary border-primary/30' : 'text-yellow-600 border-yellow-300';

  // Build analysis from result data
  const analysisText = `${result.result.description}\n\n주요 특징:\n${result.result.characteristics.map(c => `• ${c}`).join('\n')}\n\n💡 전문가 조언:\n${result.result.advice}`;

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'RelationshipStyle_Results' : '관계스타일_검사_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Relationship Style Results' : '관계 스타일 진단 결과'}
      subtitle={result.result.title}
      onBack={onBack || (() => navigate('/assessment'))}
      onDownload={handleDownload}
      totalScore={`${topPct}%`}
      totalLabel={isEnglish ? 'Dominant Style' : '우세 유형 비율'}
      scoreSeverity={result.result.title}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysisText}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Relationship Style' : '관계 스타일',
            subtitle: result.result.title,
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(result.scores).map(([k]) => [k, (getScorePercentage(k) / 100) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(isEnglish ? typeNamesEn : typeNamesKo).map(([k, v]) => [k, v])),
            riskLevel: result.type === 'secure' || result.type === 'assertive' ? 'low' : 'moderate',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default RelationshipStyleResult;
