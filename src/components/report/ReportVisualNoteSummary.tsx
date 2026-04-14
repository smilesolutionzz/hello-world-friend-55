import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import VisualSummaryCard, { type VisualSummaryData } from '@/components/visual-summary/VisualSummaryCard';
import { extractOrderedListItems, extractReadableSnippet } from './reportContentUtils';

interface ReportVisualNoteSummaryProps {
  reportData: any;
  userName: string;
  userAge: number;
  gender: string;
}

const DIMENSION_LABELS: Record<string, { ko: string; en: string }> = {
  total: { ko: '종합 점수', en: 'Total Score' },
  average: { ko: '평균 점수', en: 'Average Score' },
  age: { ko: '연령 발달', en: 'Age Development' },
  ageInMonths: { ko: '월령 발달', en: 'Monthly Development' },
  anxiety: { ko: '불안', en: 'Anxiety' },
  depression: { ko: '우울', en: 'Depression' },
  stress: { ko: '스트레스', en: 'Stress' },
  anger: { ko: '분노', en: 'Anger' },
  positive: { ko: '긍정 정서', en: 'Positive Emotion' },
  engagement: { ko: '몰입도', en: 'Engagement' },
  social: { ko: '사회성', en: 'Social Skills' },
  emotional: { ko: '정서 조절', en: 'Emotional Regulation' },
  cognitive: { ko: '인지 발달', en: 'Cognitive Development' },
  language: { ko: '언어 발달', en: 'Language Development' },
  motor: { ko: '운동 발달', en: 'Motor Development' },
  attention: { ko: '주의력', en: 'Attention' },
  selfEsteem: { ko: '자존감', en: 'Self-Esteem' },
  sleep: { ko: '수면', en: 'Sleep' },
  behavior: { ko: '행동 조절', en: 'Behavior Regulation' },
};

function getDimensionLabel(name: string, isEnglish: boolean) {
  const entry = DIMENSION_LABELS[name];
  if (entry) return isEnglish ? entry.en : entry.ko;
  return name;
}

function getMoodColor(overallScore: number): VisualSummaryData['moodColor'] {
  if (overallScore <= 40) return 'green';
  if (overallScore <= 60) return 'amber';
  return 'rose';
}

function getRiskLabel(level: string, isEnglish: boolean): string {
  const lower = (level || '').toLowerCase();
  if (lower.includes('high') || lower.includes('severe') || lower.includes('심각') || lower.includes('높')) {
    return isEnglish ? 'Needs close attention' : '주의 깊은 관찰이 필요해요';
  }
  if (lower.includes('medium') || lower.includes('moderate') || lower.includes('중') || lower.includes('보통')) {
    return isEnglish ? 'Worth monitoring' : '꾸준히 살펴보면 좋아요';
  }
  if (lower.includes('low') || lower.includes('normal') || lower.includes('정상') || lower.includes('낮')) {
    return isEnglish ? 'Generally stable' : '전반적으로 안정적이에요';
  }
  return isEnglish ? 'Data-based snapshot' : '현재 데이터 기준 요약이에요';
}

function buildVisualSummaryData(
  reportData: any,
  userName: string,
  userAge: number,
  gender: string,
  isEnglish: boolean,
  date: string,
): VisualSummaryData {
  const t = (ko: string, en: string) => (isEnglish ? en : ko);
  const preprocessed = reportData?.preprocessedData || {};
  const chartData = preprocessed?.chartData || {};
  const sections = reportData?.sections || [];

  const radarSource = [
    ...(Array.isArray(chartData?.radarChart) ? chartData.radarChart : []),
    ...(Array.isArray(chartData?.radarScores) ? chartData.radarScores : []),
  ];

  const dimensionScores = radarSource.length > 0
    ? radarSource
        .map((item: any) => ({
          name: String(item?.dimension || item?.category || item?.name || ''),
          score: Number(item?.score || 0),
        }))
        .filter((item: { name: string; score: number }) => item.name && Number.isFinite(item.score))
        .slice(0, 4)
    : Object.entries(preprocessed?.dimensionScores || reportData?.dimensionScores || {})
        .filter(([key]) => !['total', 'average', 'age', 'ageInMonths'].includes(key))
        .map(([name, score]) => ({ name, score: Number(score) || 0 }))
        .filter((item) => Number.isFinite(item.score))
        .slice(0, 4);

  const riskGauge = chartData?.riskGauge || {};
  const overallScore = Number(
    riskGauge?.score
      ?? preprocessed?.overallScore
      ?? reportData?.overallScore
      ?? (dimensionScores.length > 0
        ? Math.round(dimensionScores.reduce((sum, item) => sum + item.score, 0) / dimensionScores.length)
        : 50)
  );

  const summarySource = reportData?.summary || sections.find((section: any) =>
    /요약|summary|핵심|executive/i.test(section?.title || '')
  )?.content || '';

  const actionSource = sections.find((section: any) =>
    /실행|제언|개입|로드맵|recommend|action|intervention|plan/i.test(section?.title || '')
  )?.content || reportData?.summary || '';

  const keyFindings = extractOrderedListItems(summarySource, 3);
  const actionItems = extractOrderedListItems(actionSource, 3);
  const summarySnippet = extractReadableSnippet(summarySource || actionSource, 120)
    || t('핵심 문장이 정리되면 이곳에 자동 요약됩니다.', 'A concise summary will appear here once enough content is available.');
  const riskLabel = getRiskLabel(riskGauge?.level || preprocessed?.riskLevel || reportData?.riskLevel || '', isEnglish);

  const metricPoints = dimensionScores.length > 0
    ? dimensionScores.map((item) => `${getDimensionLabel(item.name, isEnglish)} ${item.score}${t('점', ' pts')}`)
    : [t('시각화할 핵심 지표가 아직 충분하지 않습니다.', 'There are not enough chart metrics to visualize yet.')];

  const findingPoints = keyFindings.length > 0
    ? keyFindings
    : [summarySnippet];

  const actionPoints = actionItems.length > 0
    ? actionItems
    : [t('관찰일지와 리포트를 함께 쌓아 다음 회차 비교를 준비해 주세요.', 'Keep adding observations and reports to prepare for the next comparison.')];

  const subtitleParts = [date];
  if (userAge > 0) subtitleParts.push(`${userAge}${t('세', 'y/o')}`);
  if (gender) subtitleParts.push(gender === 'male' ? t('남아', 'Boy') : gender === 'female' ? t('여아', 'Girl') : gender);

  return {
    title: `${userName} ${t('요약 비주얼 노트', 'Visual Note')}`,
    subtitle: subtitleParts.join(' · '),
    centerTheme: riskLabel,
    sections: [
      {
        title: t('현재 상태', 'Current Snapshot'),
        icon: '🧭',
        points: [summarySnippet],
        highlight: `${t('종합 점수', 'Overall Score')} ${overallScore}`,
      },
      {
        title: t('주요 지표', 'Key Metrics'),
        icon: '📊',
        points: metricPoints,
      },
      {
        title: t('핵심 발견', 'Key Findings'),
        icon: '🔎',
        points: findingPoints,
      },
      {
        title: t('즉시 실행', 'Action Steps'),
        icon: '✅',
        points: actionPoints,
        highlight: actionPoints[0],
      },
    ],
    keyInsight: actionPoints[0] || summarySnippet,
    actionItems: actionPoints,
    moodColor: getMoodColor(overallScore),
  };
}

const ReportVisualNoteSummary: React.FC<ReportVisualNoteSummaryProps> = ({
  reportData,
  userName,
  userAge,
  gender,
}) => {
  const { isEnglish } = useLanguage();
  const [isSaved, setIsSaved] = useState(false);

  const date = useMemo(
    () => new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    [isEnglish]
  );

  const summaryData = useMemo(
    () => buildVisualSummaryData(reportData, userName, userAge, gender, isEnglish, date),
    [reportData, userName, userAge, gender, isEnglish, date]
  );

  useEffect(() => {
    const saveVisualNote = async () => {
      if (isSaved) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        await supabase.from('visual_notes' as any).insert({
          user_id: session.user.id,
          title: summaryData.title,
          source_type: 'assessment',
          summary_data: summaryData,
        });

        setIsSaved(true);
      } catch (error) {
        console.warn('Visual note save failed:', error);
      }
    };

    saveVisualNote();
  }, [isSaved, summaryData]);

  return (
    <div className="space-y-3">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{isEnglish ? 'Visual Note Summary' : '요약 비주얼 노트'}</h3>
        <p className="text-sm text-muted-foreground">
          {isEnglish ? 'A cleaner one-page summary built from the same report data.' : '같은 리포트 데이터를 바탕으로 핵심만 한 장에 정리했습니다.'}
        </p>
      </div>

      <VisualSummaryCard data={summaryData} />

      {isSaved && (
        <p className="text-center text-xs text-muted-foreground">
          ✅ {isEnglish ? 'Visual note saved to dashboard automatically' : '비주얼 노트가 대시보드에 자동 저장되었습니다'}
        </p>
      )}
    </div>
  );
};

export default ReportVisualNoteSummary;
