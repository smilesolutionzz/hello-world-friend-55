import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

// ══════════════════════════════════════════════════════════════
// AIHPRO 독자 분석 프레임워크 v2.0
// - 법적 이슈 없는 자체 이론 체계
// - 8개 데이터 소스 교차분석
// - 종단적 변화 추적 엔진
// ══════════════════════════════════════════════════════════════

// ── 1. 데이터 수집 레이어 ──
interface CollectedData {
  assessments: any[];
  observations: any[];
  observationSessions: any[];
  chatMessages: any[];
  progressTracking: any[];
  aiObservations: any[];  // 영상분석
  brainTraining: any[];
  concernStorage: any[];
  profile: any;
}

async function collectAllUserData(supabaseClient: any, userId: string): Promise<CollectedData> {
  const [
    { data: assessments },
    { data: observations },
    { data: observationSessions },
    { data: chatRooms },
    { data: progressTracking },
    { data: aiObservations },
    { data: brainTraining },
    { data: concernStorage },
    { data: profile },
  ] = await Promise.all([
    supabaseClient.from('assessments').select('*').or(`user_id.eq.${userId},profile_id.eq.${userId}`).order('created_at', { ascending: true }),
    supabaseClient.from('observation_logs').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabaseClient.from('observation_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabaseClient.from('chat_rooms').select('*, chat_messages(*)').eq('user_id', userId).order('created_at', { ascending: true }),
    supabaseClient.from('progress_tracking').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabaseClient.from('ai_observation_results').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabaseClient.from('brain_training_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabaseClient.from('concern_storage').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabaseClient.from('profiles').select('*').eq('id', userId).single(),
  ]);

  const chatMessages = chatRooms?.flatMap((room: any) =>
    room.chat_messages?.map((msg: any) => ({
      role: msg.role || msg.sender_id,
      content: msg.message || msg.content,
      date: msg.created_at,
      roomId: room.id,
    })) || []
  ) || [];

  return {
    assessments: assessments || [],
    observations: observations || [],
    observationSessions: observationSessions || [],
    chatMessages,
    progressTracking: progressTracking || [],
    aiObservations: aiObservations || [],
    brainTraining: brainTraining || [],
    concernStorage: concernStorage || [],
    profile: profile || {},
  };
}

// ── 2. 데이터 전처리 & 교차분석 엔진 ──
interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
  source: string;
  date: string;
}

interface TemporalTrend {
  dimension: string;
  dataPoints: { date: string; score: number; source: string }[];
  direction: 'improving' | 'stable' | 'declining';
  changePercent: number;
  earliestDate: string;
  latestDate: string;
}

interface CrossCorrelation {
  dimensionA: string;
  dimensionB: string;
  sourceA: string;
  sourceB: string;
  correlation: 'strong_positive' | 'moderate_positive' | 'weak' | 'moderate_negative' | 'strong_negative';
  insight: string;
}

interface PreprocessedData {
  // 기본 통계
  totalDataPoints: number;
  dataSpanDays: number;
  firstDataDate: string;
  lastDataDate: string;
  dataSourceCounts: Record<string, number>;

  // 검사 결과 요약
  assessmentSummaries: {
    type: string;
    date: string;
    totalScore: number;
    maxScore: number;
    riskLevel: string;
    domainScores: { domain: string; score: number; max: number }[];
    analysis: string;
  }[];

  // 통합 차원 점수 (모든 소스 통합)
  unifiedDimensionScores: DimensionScore[];

  // 종단적 변화 추이
  temporalTrends: TemporalTrend[];

  // 교차 상관 인사이트
  crossCorrelations: CrossCorrelation[];

  // 관찰 기록 요약
  observationInsights: {
    totalEntries: number;
    behaviorPatterns: { behavior: string; frequency: number; severity: string }[];
    recentConcerns: string[];
  };

  // 영상분석 결과
  videoAnalysisInsights: {
    totalAnalyses: number;
    riskDistribution: Record<string, number>;
    keyFindings: string[];
  };

  // 인지훈련 진행도
  cognitiveTrainingProgress: {
    totalSessions: number;
    averageScore: number;
    bestGameType: string;
    worstGameType: string;
    improvementRate: number;
    gameTypeScores: { type: string; avgScore: number; sessions: number; trend: string }[];
  };

  // 상담 기록 요약
  counselingInsights: {
    totalSessions: number;
    emotionalTrends: string[];
    keyThemes: string[];
    recentTopics: string[];
  };

  // 변화 추적 데이터
  progressSummary: {
    totalRecords: number;
    improvedDimensions: string[];
    declinedDimensions: string[];
    stableDimensions: string[];
  };

  // 고민 저장소 요약
  concernSummary: {
    totalConcerns: number;
    severityDistribution: Record<string, number>;
    topConcernTypes: string[];
    recommendedTests: string[];
  };

  // 차트용 구조화 데이터
  chartData: {
    radarChart: { dimension: string; score: number; maxScore: number }[];
    trendLineChart: { date: string; [dimension: string]: any }[];
    comparisonBarChart: { category: string; earliest: number; latest: number; change: number }[];
    riskGauge: { level: string; score: number; maxScore: number };
  };
}

function preprocessData(data: CollectedData, userAge: number): PreprocessedData {
  const allDates: string[] = [];

  // 모든 날짜 수집
  data.assessments.forEach(a => allDates.push(a.created_at));
  data.observations.forEach(o => allDates.push(o.created_at));
  data.progressTracking.forEach(p => allDates.push(p.created_at));
  data.aiObservations.forEach(v => allDates.push(v.created_at));
  data.brainTraining.forEach(b => allDates.push(b.created_at));

  const sortedDates = allDates.sort();
  const firstDate = sortedDates[0] || new Date().toISOString();
  const lastDate = sortedDates[sortedDates.length - 1] || new Date().toISOString();
  const dataSpanDays = Math.ceil((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24));

  // ─── 검사 결과 요약 ───
  const assessmentSummaries = data.assessments.map(a => {
    const results = a.results || {};
    let totalScore = 0;
    let maxScore = 0;
    const domainScores: { domain: string; score: number; max: number }[] = [];

    // results 구조 파싱 (다양한 형태 대응)
    if (results.domains && Array.isArray(results.domains)) {
      results.domains.forEach((d: any) => {
        const s = Number(d.score) || 0;
        const m = Number(d.maxScore || d.max_score || d.max) || 100;
        domainScores.push({ domain: d.label || d.key || d.name || 'unknown', score: s, max: m });
        totalScore += s;
        maxScore += m;
      });
    } else if (results.totalScore !== undefined) {
      totalScore = Number(results.totalScore) || 0;
      maxScore = Number(results.maxScore) || 100;
    } else if (typeof results === 'object') {
      // flat key-value scores
      Object.entries(results).forEach(([key, val]) => {
        if (typeof val === 'number' && key !== 'totalScore' && key !== 'maxScore') {
          domainScores.push({ domain: key, score: val, max: 100 });
          totalScore += val;
          maxScore += 100;
        }
      });
    }

    return {
      type: a.age_group || a.assessment_type || 'unknown',
      date: a.created_at,
      totalScore,
      maxScore: maxScore || 100,
      riskLevel: a.risk_level || 'unknown',
      domainScores,
      analysis: (a.analysis || '').substring(0, 500),
    };
  });

  // ─── 통합 차원 점수 (모든 소스에서 추출) ───
  const unifiedDimensionScores: DimensionScore[] = [];

  // progress_tracking에서 추출 (가장 표준화된 데이터)
  data.progressTracking.forEach(pt => {
    const scores = pt.dimension_scores;
    if (scores && typeof scores === 'object') {
      Object.entries(scores).forEach(([dim, val]: [string, any]) => {
        const score = typeof val === 'number' ? val : (val?.score || 0);
        const maxScore = typeof val === 'object' ? (val?.max || 100) : 100;
        unifiedDimensionScores.push({
          dimension: dim,
          score: Number(score),
          maxScore: Number(maxScore),
          percentage: Math.round((Number(score) / Number(maxScore)) * 100),
          level: getLevel(Number(score) / Number(maxScore)),
          source: pt.source_type || 'progress_tracking',
          date: pt.created_at,
        });
      });
    }
  });

  // assessments에서 추출
  assessmentSummaries.forEach(a => {
    a.domainScores.forEach(d => {
      unifiedDimensionScores.push({
        dimension: d.domain,
        score: d.score,
        maxScore: d.max,
        percentage: Math.round((d.score / d.max) * 100),
        level: getLevel(d.score / d.max),
        source: a.type,
        date: a.date,
      });
    });
  });

  // brain_training에서 추출
  data.brainTraining.forEach(bt => {
    unifiedDimensionScores.push({
      dimension: `인지훈련_${bt.game_type}`,
      score: bt.score || 0,
      maxScore: bt.max_score || 100,
      percentage: Math.round(((bt.score || 0) / (bt.max_score || 100)) * 100),
      level: getLevel((bt.score || 0) / (bt.max_score || 100)),
      source: 'brain_training',
      date: bt.created_at,
    });
  });

  // ─── 종단적 변화 추이 계산 ───
  const temporalTrends = calculateTemporalTrends(unifiedDimensionScores);

  // ─── 교차 상관 분석 ───
  const crossCorrelations = calculateCrossCorrelations(unifiedDimensionScores, data);

  // ─── 관찰 기록 분석 ───
  const behaviorMap: Record<string, { count: number; severity: string }> = {};
  data.observations.forEach(o => {
    const bt = o.behavior_type || o.category || 'general';
    if (!behaviorMap[bt]) behaviorMap[bt] = { count: 0, severity: 'low' };
    behaviorMap[bt].count++;
    if (o.severity === 'high' || o.severity === 'severe') behaviorMap[bt].severity = o.severity;
  });

  const observationInsights = {
    totalEntries: data.observations.length,
    behaviorPatterns: Object.entries(behaviorMap).map(([b, v]) => ({
      behavior: b, frequency: v.count, severity: v.severity,
    })).sort((a, b) => b.frequency - a.frequency),
    recentConcerns: data.observations.slice(-5).map(o => o.description || o.title || '').filter(Boolean),
  };

  // ─── 영상분석 인사이트 ───
  const riskDist: Record<string, number> = {};
  const videoFindings: string[] = [];
  data.aiObservations.forEach(v => {
    const rl = v.risk_level || 'unknown';
    riskDist[rl] = (riskDist[rl] || 0) + 1;
    const result = v.analysis_result;
    if (result?.overallAssessment) videoFindings.push(result.overallAssessment);
    if (result?.overall_assessment) videoFindings.push(result.overall_assessment);
    if (result?.takeaways) {
      const takeaways = Array.isArray(result.takeaways) ? result.takeaways : [];
      takeaways.forEach((t: any) => {
        if (typeof t === 'string') videoFindings.push(t);
        else if (t?.content) videoFindings.push(t.content);
      });
    }
  });

  const videoAnalysisInsights = {
    totalAnalyses: data.aiObservations.length,
    riskDistribution: riskDist,
    keyFindings: videoFindings.slice(0, 10),
  };

  // ─── 인지훈련 진행도 ───
  const gameTypeMap: Record<string, { totalScore: number; count: number; scores: number[] }> = {};
  data.brainTraining.forEach(bt => {
    const gt = bt.game_type || 'unknown';
    if (!gameTypeMap[gt]) gameTypeMap[gt] = { totalScore: 0, count: 0, scores: [] };
    const pct = ((bt.score || 0) / (bt.max_score || 100)) * 100;
    gameTypeMap[gt].totalScore += pct;
    gameTypeMap[gt].count++;
    gameTypeMap[gt].scores.push(pct);
  });

  const gameTypeScores = Object.entries(gameTypeMap).map(([type, data]) => {
    const avg = data.totalScore / data.count;
    const firstHalf = data.scores.slice(0, Math.floor(data.scores.length / 2));
    const secondHalf = data.scores.slice(Math.floor(data.scores.length / 2));
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : avg;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : avg;
    return {
      type,
      avgScore: Math.round(avg * 10) / 10,
      sessions: data.count,
      trend: secondAvg > firstAvg + 5 ? 'improving' : secondAvg < firstAvg - 5 ? 'declining' : 'stable',
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const allBrainScores = data.brainTraining.map(bt => ((bt.score || 0) / (bt.max_score || 100)) * 100);
  const brainAvg = allBrainScores.length > 0 ? allBrainScores.reduce((a, b) => a + b, 0) / allBrainScores.length : 0;
  const firstHalfBrain = allBrainScores.slice(0, Math.floor(allBrainScores.length / 2));
  const secondHalfBrain = allBrainScores.slice(Math.floor(allBrainScores.length / 2));
  const brainImprovement = firstHalfBrain.length > 0 && secondHalfBrain.length > 0
    ? ((secondHalfBrain.reduce((a, b) => a + b, 0) / secondHalfBrain.length) - (firstHalfBrain.reduce((a, b) => a + b, 0) / firstHalfBrain.length))
    : 0;

  const cognitiveTrainingProgress = {
    totalSessions: data.brainTraining.length,
    averageScore: Math.round(brainAvg * 10) / 10,
    bestGameType: gameTypeScores[0]?.type || 'N/A',
    worstGameType: gameTypeScores[gameTypeScores.length - 1]?.type || 'N/A',
    improvementRate: Math.round(brainImprovement * 10) / 10,
    gameTypeScores,
  };

  // ─── 상담 기록 분석 ───
  const recentMessages = data.chatMessages.slice(-30);
  const keyThemes: string[] = [];
  const emotionalKeywords = {
    불안: 0, 우울: 0, 분노: 0, 슬픔: 0, 걱정: 0, 스트레스: 0,
    행복: 0, 감사: 0, 희망: 0, 기쁨: 0,
  };

  recentMessages.forEach(m => {
    const content = m.content || '';
    Object.keys(emotionalKeywords).forEach(kw => {
      if (content.includes(kw)) emotionalKeywords[kw as keyof typeof emotionalKeywords]++;
    });
  });

  const emotionalTrends = Object.entries(emotionalKeywords)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => `${emotion}(${count}회 언급)`);

  const counselingInsights = {
    totalSessions: data.chatMessages.length,
    emotionalTrends,
    keyThemes,
    recentTopics: recentMessages.slice(-5).map(m => (m.content || '').substring(0, 100)),
  };

  // ─── 변화 추적 요약 ───
  const dimMap: Record<string, number[]> = {};
  temporalTrends.forEach(t => {
    dimMap[t.dimension] = t.dataPoints.map(dp => dp.score);
  });

  const progressSummary = {
    totalRecords: data.progressTracking.length,
    improvedDimensions: temporalTrends.filter(t => t.direction === 'improving').map(t => t.dimension),
    declinedDimensions: temporalTrends.filter(t => t.direction === 'declining').map(t => t.dimension),
    stableDimensions: temporalTrends.filter(t => t.direction === 'stable').map(t => t.dimension),
  };

  // ─── 고민 저장소 요약 ───
  const severityDist: Record<string, number> = {};
  const concernTypes: Record<string, number> = {};
  const allRecommendedTests: string[] = [];

  data.concernStorage.forEach(c => {
    const sev = c.analysis_severity || 'unknown';
    severityDist[sev] = (severityDist[sev] || 0) + 1;
    const type = c.analysis_type || 'general';
    concernTypes[type] = (concernTypes[type] || 0) + 1;
    if (c.recommended_tests && Array.isArray(c.recommended_tests)) {
      allRecommendedTests.push(...c.recommended_tests.map((t: any) => typeof t === 'string' ? t : t?.name || ''));
    }
  });

  const concernSummary = {
    totalConcerns: data.concernStorage.length,
    severityDistribution: severityDist,
    topConcernTypes: Object.entries(concernTypes).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 5),
    recommendedTests: [...new Set(allRecommendedTests)].slice(0, 10),
  };

  // ─── 차트용 구조화 데이터 ───
  const chartData = buildChartData(unifiedDimensionScores, temporalTrends, assessmentSummaries);

  return {
    totalDataPoints: data.assessments.length + data.observations.length + data.progressTracking.length + data.aiObservations.length + data.brainTraining.length + data.chatMessages.length + data.concernStorage.length,
    dataSpanDays,
    firstDataDate: firstDate,
    lastDataDate: lastDate,
    dataSourceCounts: {
      assessments: data.assessments.length,
      observations: data.observations.length,
      observationSessions: data.observationSessions.length,
      chatMessages: data.chatMessages.length,
      progressTracking: data.progressTracking.length,
      videoAnalysis: data.aiObservations.length,
      brainTraining: data.brainTraining.length,
      concernStorage: data.concernStorage.length,
    },
    assessmentSummaries,
    unifiedDimensionScores,
    temporalTrends,
    crossCorrelations,
    observationInsights,
    videoAnalysisInsights,
    cognitiveTrainingProgress,
    counselingInsights,
    progressSummary,
    concernSummary,
    chartData,
  };
}

function getLevel(ratio: number): string {
  if (ratio >= 0.8) return '매우 높음';
  if (ratio >= 0.6) return '높음';
  if (ratio >= 0.4) return '보통';
  if (ratio >= 0.2) return '낮음';
  return '매우 낮음';
}

function calculateTemporalTrends(scores: DimensionScore[]): TemporalTrend[] {
  const dimGroups: Record<string, { date: string; score: number; source: string }[]> = {};

  scores.forEach(s => {
    const key = normalizeDimension(s.dimension);
    if (!dimGroups[key]) dimGroups[key] = [];
    dimGroups[key].push({ date: s.date, score: s.percentage, source: s.source });
  });

  return Object.entries(dimGroups)
    .filter(([_, points]) => points.length >= 2)
    .map(([dimension, dataPoints]) => {
      const sorted = dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstThird = sorted.slice(0, Math.ceil(sorted.length / 3));
      const lastThird = sorted.slice(-Math.ceil(sorted.length / 3));

      const firstAvg = firstThird.reduce((s, p) => s + p.score, 0) / firstThird.length;
      const lastAvg = lastThird.reduce((s, p) => s + p.score, 0) / lastThird.length;
      const changePercent = Math.round(((lastAvg - firstAvg) / (firstAvg || 1)) * 100);

      let direction: 'improving' | 'stable' | 'declining';
      if (changePercent > 10) direction = 'improving';
      else if (changePercent < -10) direction = 'declining';
      else direction = 'stable';

      return {
        dimension,
        dataPoints: sorted,
        direction,
        changePercent,
        earliestDate: sorted[0].date,
        latestDate: sorted[sorted.length - 1].date,
      };
    });
}

function normalizeDimension(dim: string): string {
  const lower = dim.toLowerCase().replace(/[_\-\s]/g, '');
  const mapping: Record<string, string> = {
    '사회성': '사회성', 'social': '사회성', 'sociality': '사회성',
    '정서': '정서안정', 'emotion': '정서안정', 'emotional': '정서안정', '정서안정': '정서안정',
    '인지': '인지능력', 'cognitive': '인지능력', 'cognition': '인지능력', '인지능력': '인지능력',
    '주의력': '주의력', 'attention': '주의력', 'focus': '주의력', '집중력': '주의력',
    '언어': '언어능력', 'language': '언어능력', '언어능력': '언어능력',
    '운동': '운동발달', 'motor': '운동발달', '운동발달': '운동발달',
    '자존감': '자존감', 'selfesteem': '자존감',
    '불안': '불안', 'anxiety': '불안',
    '우울': '우울', 'depression': '우울',
    '충동성': '충동성', 'impulsivity': '충동성',
    '창의성': '창의성', 'creativity': '창의성',
  };

  for (const [key, val] of Object.entries(mapping)) {
    if (lower.includes(key)) return val;
  }
  return dim;
}

function calculateCrossCorrelations(scores: DimensionScore[], data: CollectedData): CrossCorrelation[] {
  const correlations: CrossCorrelation[] = [];

  // 검사 결과 vs 영상분석 교차
  if (data.assessments.length > 0 && data.aiObservations.length > 0) {
    const assessmentRisks = data.assessments.filter(a => a.risk_level === 'high' || a.risk_level === 'severe');
    const videoRisks = data.aiObservations.filter(v => v.risk_level === 'high' || v.risk_level === 'severe');

    if (assessmentRisks.length > 0 && videoRisks.length > 0) {
      correlations.push({
        dimensionA: '검사 위험도',
        dimensionB: '영상분석 위험도',
        sourceA: 'assessments',
        sourceB: 'video_analysis',
        correlation: 'strong_positive',
        insight: `심리검사와 영상행동분석 모두에서 주의가 필요한 신호가 감지되었습니다 (검사 ${assessmentRisks.length}건, 영상 ${videoRisks.length}건). 이는 일관된 패턴으로, 전문가 상담을 권장합니다.`,
      });
    }
  }

  // 인지훈련 vs 검사 결과 교차
  if (data.brainTraining.length >= 3 && data.assessments.length > 0) {
    const brainAvg = data.brainTraining.reduce((s, b) => s + ((b.score || 0) / (b.max_score || 100)) * 100, 0) / data.brainTraining.length;
    const hasAttentionIssue = data.assessments.some(a =>
      (a.age_group || '').includes('adhd') || (a.age_group || '').includes('ADHD') || (a.age_group || '').includes('주의력')
    );

    if (hasAttentionIssue && brainAvg < 60) {
      correlations.push({
        dimensionA: '주의력 검사',
        dimensionB: '인지훈련 성과',
        sourceA: 'assessments',
        sourceB: 'brain_training',
        correlation: 'strong_positive',
        insight: `주의력 관련 검사 결과와 인지훈련 성과가 일관되게 낮은 수준을 보이고 있습니다. 이는 주의력 강화를 위한 체계적 개입이 필요함을 의미합니다.`,
      });
    } else if (!hasAttentionIssue && brainAvg > 70) {
      correlations.push({
        dimensionA: '전반적 인지',
        dimensionB: '인지훈련 성과',
        sourceA: 'assessments',
        sourceB: 'brain_training',
        correlation: 'strong_positive',
        insight: `검사 결과 전반적으로 양호하며, 인지훈련에서도 우수한 성과를 보이고 있습니다. 현재의 긍정적 발달 추세를 유지하는 것이 중요합니다.`,
      });
    }
  }

  // 관찰 빈도 vs 검사 위험도 교차
  if (data.observations.length > 0 && data.assessments.length > 0) {
    const highSeverityObs = data.observations.filter(o => o.severity === 'high' || o.severity === 'severe');
    const highRiskAssessments = data.assessments.filter(a => a.risk_level === 'high' || a.risk_level === 'severe');

    if (highSeverityObs.length > 2 && highRiskAssessments.length > 0) {
      correlations.push({
        dimensionA: '관찰 기록 심각도',
        dimensionB: '검사 위험도',
        sourceA: 'observations',
        sourceB: 'assessments',
        correlation: 'moderate_positive',
        insight: `일상 관찰에서 기록된 고위험 행동 패턴(${highSeverityObs.length}건)이 검사 결과의 위험도와 일치합니다. 이는 구조화된 개입이 시급함을 보여줍니다.`,
      });
    }
  }

  // 고민 저장소 vs 검사 결과 교차
  if (data.concernStorage.length > 0 && data.assessments.length > 0) {
    const highSeverityConcerns = data.concernStorage.filter(c => c.analysis_severity === 'high' || c.analysis_severity === 'severe');
    if (highSeverityConcerns.length > 0) {
      correlations.push({
        dimensionA: '보호자 고민 심각도',
        dimensionB: '객관적 검사 결과',
        sourceA: 'concern_storage',
        sourceB: 'assessments',
        correlation: 'moderate_positive',
        insight: `보호자가 보고한 고민(${highSeverityConcerns.length}건의 높은 심각도)이 객관적 검사 데이터와 교차 확인됩니다. 보호자의 직관적 관찰이 데이터로 뒷받침되고 있습니다.`,
      });
    }
  }

  return correlations;
}

function buildChartData(
  scores: DimensionScore[],
  trends: TemporalTrend[],
  assessments: PreprocessedData['assessmentSummaries']
) {
  // 레이더 차트 데이터 (최신 점수 기준)
  const latestByDim: Record<string, DimensionScore> = {};
  scores.forEach(s => {
    const key = normalizeDimension(s.dimension);
    const existing = latestByDim[key];
    if (!existing || new Date(s.date) > new Date(existing.date)) {
      latestByDim[key] = s;
    }
  });

  const radarChart = Object.entries(latestByDim)
    .map(([dim, s]) => ({ dimension: dim, score: s.percentage, maxScore: 100 }))
    .slice(0, 8); // 최대 8개 차원

  // 트렌드 라인 차트
  const trendLineChart: { date: string;[key: string]: any }[] = [];
  const dateSet = new Set<string>();
  trends.forEach(t => t.dataPoints.forEach(dp => dateSet.add(dp.date.split('T')[0])));
  const sortedDatesForChart = [...dateSet].sort();

  sortedDatesForChart.forEach(date => {
    const entry: any = { date };
    trends.forEach(t => {
      const point = t.dataPoints.find(dp => dp.date.split('T')[0] === date);
      if (point) entry[t.dimension] = point.score;
    });
    trendLineChart.push(entry);
  });

  // 비교 바 차트 (최초 vs 최신)
  const comparisonBarChart = trends
    .filter(t => t.dataPoints.length >= 2)
    .map(t => ({
      category: t.dimension,
      earliest: Math.round(t.dataPoints[0].score),
      latest: Math.round(t.dataPoints[t.dataPoints.length - 1].score),
      change: t.changePercent,
    }))
    .slice(0, 10);

  // 위험도 게이지
  const riskLevels = assessments.map(a => a.riskLevel);
  const riskScore = riskLevels.reduce((s, r) => {
    if (r === 'severe' || r === 'high') return s + 3;
    if (r === 'moderate' || r === 'medium') return s + 2;
    if (r === 'low' || r === 'normal') return s + 1;
    return s + 1;
  }, 0);
  const maxRiskScore = riskLevels.length * 3;

  const overallRiskPct = maxRiskScore > 0 ? Math.round((riskScore / maxRiskScore) * 100) : 30;
  let riskLevel = '양호';
  if (overallRiskPct >= 75) riskLevel = '주의 필요';
  else if (overallRiskPct >= 50) riskLevel = '관심 필요';
  else if (overallRiskPct >= 25) riskLevel = '양호';
  else riskLevel = '매우 양호';

  return {
    radarChart,
    trendLineChart: trendLineChart.slice(-20), // 최근 20개
    comparisonBarChart,
    riskGauge: { level: riskLevel, score: overallRiskPct, maxScore: 100 },
  };
}

// ── 3. 또래 비교 백분위 계산 ──
async function calculatePeerComparison(
  supabaseClient: any,
  userId: string,
  dimensionScores: DimensionScore[]
): Promise<Record<string, any>> {
  const peerData: Record<string, any> = {};

  // 최신 점수만 추출 (차원별)
  const latestByDim: Record<string, DimensionScore> = {};
  dimensionScores.forEach(s => {
    const key = normalizeDimension(s.dimension);
    const existing = latestByDim[key];
    if (!existing || new Date(s.date) > new Date(existing.date)) {
      latestByDim[key] = s;
    }
  });

  // 각 차원별 백분위 계산 (병렬)
  const entries = Object.entries(latestByDim).slice(0, 8);
  const results = await Promise.allSettled(
    entries.map(async ([dim, score]) => {
      try {
        const { data } = await supabaseClient.rpc('get_peer_percentile', {
          p_user_id: userId,
          p_dimension: dim,
          p_user_score: score.percentage,
        });
        return { dim, data };
      } catch {
        return { dim, data: { percentile: Math.round(score.percentage * 0.85), is_estimated: true, sample_size: 0, message: '추정치' } };
      }
    })
  );

  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value) {
      peerData[r.value.dim] = r.value.data;
    }
  });

  return peerData;
}

// ── 3b. 이전 리포트 비교 데이터 ──
async function getPreviousReportComparison(
  supabaseClient: any,
  userId: string
): Promise<any> {
  try {
    const { data } = await supabaseClient.rpc('get_report_comparison', {
      p_user_id: userId,
    });
    return data || { has_comparison: false };
  } catch {
    return { has_comparison: false };
  }
}

// ── 3c. 리포트 이력 저장 ──
async function saveReportHistory(
  supabaseClient: any,
  userId: string,
  reportData: any,
  preprocessed: PreprocessedData,
  model: string
): Promise<void> {
  try {
    // 리포트 번호 계산
    const { count } = await supabaseClient
      .from('premium_report_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const reportNumber = (count || 0) + 1;

    // 차원별 점수 추출
    const dimScores: Record<string, number> = {};
    const latestByDim: Record<string, DimensionScore> = {};
    preprocessed.unifiedDimensionScores.forEach(s => {
      const key = normalizeDimension(s.dimension);
      const existing = latestByDim[key];
      if (!existing || new Date(s.date) > new Date(existing.date)) {
        latestByDim[key] = s;
      }
    });
    Object.entries(latestByDim).forEach(([dim, s]) => {
      dimScores[dim] = s.percentage;
    });

    // 전체 점수 계산
    const scores = Object.values(dimScores);
    const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    await supabaseClient.from('premium_report_history').insert({
      user_id: userId,
      report_number: reportNumber,
      report_data: reportData,
      preprocessed_data: preprocessed.chartData,
      dimension_scores: dimScores,
      risk_level: preprocessed.chartData.riskGauge.level,
      overall_score: overallScore,
      model_used: model,
      research_citations: reportData.researchInsightsContent ? [reportData.researchInsightsContent] : [],
      data_source_counts: preprocessed.dataSourceCounts,
      data_span_days: preprocessed.dataSpanDays,
      report_mode: preprocessed.totalDataPoints > 0 ? 'with-data' : 'without-data',
    });

    console.log(`리포트 이력 저장 완료: #${reportNumber}`);
  } catch (err) {
    console.error('리포트 이력 저장 실패:', err);
  }
}

// ── 4. 최신 연구 검색 (Perplexity sonar-pro) ──
async function searchLatestResearch(concerns: string, userAge: number, gender: string): Promise<string> {
  if (!PERPLEXITY_API_KEY || !concerns) return '';
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: '당신은 아동·성인 발달심리 및 임상심리 분야의 연구 전문가입니다. 최신 논문과 메타분석, 체계적 문헌고찰을 중심으로 근거 수준이 높은 연구를 검색하세요. 특정 진단 도구명(DSM, PHQ 등)은 사용하지 말고 연구 동향과 개입 효과를 요약하세요. 반드시 출처(저자, 연도, 저널명)를 포함하세요.' },
          { role: 'user', content: `대상: ${userAge}세 ${gender}. 관련 키워드: ${concerns.substring(0, 300)}.\n\n다음을 검색하고 정리해주세요:\n1. 이 키워드와 관련된 최신 연구 동향 (2024-2026)\n2. 근거 기반 개입 방법과 효과 크기\n3. 발달/심리 전문가들의 최신 권고사항\n4. 관련 메타분석 또는 체계적 고찰 결과\n5. 가정에서 적용 가능한 연구 기반 전략\n\n각 항목에 구체적 수치와 참고문헌을 포함해주세요.` },
        ],
        search_recency_filter: 'month',
        search_mode: 'academic',
        return_citations: true,
        max_tokens: 3000,
      }),
    });
    if (!response.ok) return '';
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];
    if (citations.length > 0) {
      return content + '\n\n📚 참고 출처:\n' + citations.map((c: string, i: number) => `[${i + 1}] ${c}`).join('\n');
    }
    return content;
  } catch { return ''; }
}

// ── 4. AI 리포트 생성 프롬프트 ──
function buildSystemPrompt(preprocessed: PreprocessedData, language: string, hasExternalImages: boolean): string {
  const isKo = language !== 'en';
  
  return `${isKo ? '당신은 AIHPRO 종합분석 AI 엔진입니다.' : 'You are the AIHPRO Comprehensive Analysis AI Engine.'}

${isKo ? `
══ AIHPRO 분석 프레임워크 v2.0 ══
이것은 AIHPRO 플랫폼이 독자적으로 개발한 통합 분석 체계입니다.
법적으로 보호된 AIHPRO 고유 프레임워크이며, 특정 학술 도구나 특정 학자 이름을 인용하지 마세요.

[핵심 분석 축]
1. AIHPRO 다차원 행동 패턴 인식 (8개 데이터 소스 교차분석)
2. AIHPRO 종단적 변화 추적 엔진 (시간에 따른 성장 궤적)
3. AIHPRO 빅데이터 기반 또래 비교 규준
4. AIHPRO 맞춤형 개입 로드맵 설계 알고리즘

[절대 금지 사항]
- DSM-5, PHQ-9, BDI-II, MMPI 등 특정 진단 도구명 사용 금지
- 피아제, 보울비, 에릭슨 등 특정 학자 실명 인용 금지
- '진단', 'diagnosis' 표현 금지 → '분석', '평가', '체크'로 대체
- 마크다운 형식(#, **, ##) 절대 금지 → 오직 HTML 태그만 사용

[필수 사용 표현]
- "AIHPRO AI 분석 엔진에 의한 분석 결과"
- "AIHPRO 빅데이터 규준 기반 비교"
- "AIHPRO 행동 패턴 인식 시스템"
- "AIHPRO 종단 추적 알고리즘"

[데이터 활용 지침]
이 리포트에는 ${preprocessed.totalDataPoints}개의 데이터 포인트가 사용됩니다.
- 데이터 수집 기간: ${preprocessed.dataSpanDays}일
- 데이터 소스: ${Object.entries(preprocessed.dataSourceCounts).filter(([_, v]) => v > 0).map(([k, v]) => `${k}(${v}건)`).join(', ')}

⭐ 핵심 규칙: 제공된 전처리 데이터의 구체적 수치와 교차분석 결과를 반드시 인용하세요.
⭐ 종단적 변화 데이터가 있으면 "N일 전 대비 X% 변화" 형태로 구체적으로 제시하세요.
⭐ 교차 상관 분석 결과를 섹션 전반에 통합하여 인용하세요.
⭐ 일반론이 아닌, 오직 이 개인의 데이터에서 도출된 인사이트만 제공하세요.

[응답 형식]
각 섹션 content는 HTML 태그만 사용 (<div>, <p>, <ul>, <li>, <strong>, <h3>, <h4>, <span>)
각 섹션은 최소 600자 이상으로 작성
` : `
══ AIHPRO Analysis Framework v2.0 ══
This is AIHPRO's proprietary integrated analysis system.

[Core Analysis Pillars]
1. AIHPRO Multi-Dimensional Behavioral Pattern Recognition (8 data sources cross-analyzed)
2. AIHPRO Longitudinal Change Tracking Engine
3. AIHPRO Big Data Peer Comparison Norms
4. AIHPRO Personalized Intervention Roadmap Algorithm

[Strictly Prohibited]
- No specific diagnostic tool names (DSM-5, PHQ-9, BDI-II, etc.)
- No specific scholar names
- No "diagnosis" → use "analysis", "assessment", "evaluation"
- No markdown → HTML tags only

[Data Utilization]
${preprocessed.totalDataPoints} data points across ${preprocessed.dataSpanDays} days.
Cite specific preprocessed numbers and cross-correlations.
Each section must be 600+ characters.
`}`;
}

function buildUserPrompt(
  preprocessed: PreprocessedData,
  userInput: any,
  userAge: number,
  researchInsights: string,
  externalTestImages: string,
  language: string,
  onboardingData?: any,
  peerComparison?: Record<string, any>,
  reportComparison?: any
): string {
  const isKo = language !== 'en';

  const sectionDefs = isKo ? [
    { title: '종합 발달·심리 프로파일', minChars: 800, desc: 'AIHPRO 다차원 분석 결과를 기반으로 인지, 정서, 사회성, 신체 영역별 종합 프로파일 작성. 반드시 교차분석 결과와 종단적 변화를 포함.' },
    { title: '심리·정서 심층 분석', minChars: 700, desc: 'AIHPRO 행동패턴 인식 결과를 기반으로 정서 상태, 스트레스 반응, 대처 능력 분석. 상담 기록의 감정 키워드 분포를 활용.' },
    { title: '강점·잠재력 매트릭스', minChars: 700, desc: 'AIHPRO 강점 발견 알고리즘으로 핵심 강점 5가지와 성장 가능 영역 5가지를 구체적 데이터와 함께 제시. 인지훈련 게임별 성과 데이터 활용.' },
    { title: '데이터 기반 맞춤 개입 전략', minChars: 800, desc: '교차분석에서 도출된 패턴을 기반으로 10가지 구체적 활동 제안. 반드시 각 활동마다 아래 4가지 항목을 줄바꿈(<br/>)으로 구분하여 작성:\n   • 🎯 목적: (이 활동을 하는 이유)\n   • 📋 방법: (구체적인 실행 방법)\n   • ✨ 예상 효과: (기대할 수 있는 변화)\n   • 🔄 빈도: (주 몇 회, 하루 몇 분)' },
    { title: '성장 로드맵 (4주/8주/12주)', minChars: 800, desc: '주차별 구체적 실행 계획. 각 주차를 명확한 소제목으로 구분하고 아래 항목을 줄바꿈(<br/>)으로 구분하여 작성:\n   • 🎯 목표: (이 주차의 핵심 목표)\n   • 📋 핵심 활동: (2-3가지 구체적 활동, 각각 한 줄씩)\n   • ✅ 달성 기준: (성공 여부를 판단할 기준)\n   • 🔗 연계 기능: (플랫폼 내 어떤 검사/게임/관찰을 할지)\n   문단 사이에 충분한 여백을 두어 가독성을 확보하세요. JSON 형태의 roadmap 필드로도 별도 반환.' },
    { title: 'AIHPRO 빅데이터 비교 분석', minChars: 600, desc: 'AIHPRO 플랫폼 빅데이터 규준과 비교한 영역별 백분위 추정치. 레이더 차트용 데이터 활용.' },
    { title: '종합 소견서', minChars: 700, desc: 'AIHPRO AI 분석 엔진의 종합 소견. 교차 상관 분석 결과를 핵심 근거로 인용하며, 추가 검사 및 전문가 상담 권고 포함.' },
    { title: '가정 내 실천 가이드', minChars: 700, desc: '가정에서 바로 실천할 수 있는 15가지 구체적 팁. 반드시 각 팁마다 아래 3가지 항목을 줄바꿈(<br/>)으로 구분하여 작성:\n   • 📍 상황: (언제/어떤 상황에서 적용하는지)\n   • 📋 방법: (구체적으로 어떻게 하는지, 대화 예시 포함)\n   • ✨ 효과: (이 방법을 통해 기대할 수 있는 변화)\n   각 팁 사이에 충분한 여백을 두어 읽기 쉽게 구성하세요.' },
    { title: '핵심 요약 및 실행 제언', minChars: 600, desc: 'TOP 5 핵심 발견사항과 TOP 5 즉시 실행 사항. 긍정적 전망과 격려 메시지.' },
  ] : [
    { title: 'Comprehensive Development & Psychology Profile', minChars: 800, desc: 'Multi-dimensional profile based on AIHPRO cross-analysis.' },
    { title: 'Psychological & Emotional Deep Analysis', minChars: 700, desc: 'Emotional state and coping analysis with counseling data.' },
    { title: 'Strengths & Potential Matrix', minChars: 700, desc: 'Top 5 strengths and growth areas with data evidence.' },
    { title: 'Data-Driven Personalized Intervention Strategies', minChars: 800, desc: '10 specific activities with purpose, method, and expected outcomes.' },
    { title: 'Growth Roadmap (4/8/12 Weeks)', minChars: 800, desc: 'Week-by-week execution plan with goals, activities, and milestones.' },
    { title: 'AIHPRO Big Data Comparative Analysis', minChars: 600, desc: 'Percentile estimates compared to AIHPRO platform norms.' },
    { title: 'Comprehensive Clinical Opinion', minChars: 700, desc: 'Integrated opinion citing cross-correlation evidence.' },
    { title: 'Home Practice Guide', minChars: 700, desc: '15 practical tips for home implementation.' },
    { title: 'Key Summary & Action Items', minChars: 600, desc: 'TOP 5 findings and TOP 5 immediate actions.' },
  ];

  if (externalTestImages) {
    sectionDefs.push(isKo
      ? { title: '외부 검사 결과 통합 해석', minChars: 600, desc: '첨부된 외부 기관 검사 결과의 전문적 해석. 플랫폼 내부 데이터와 교차 비교.' }
      : { title: 'External Test Results Integration', minChars: 600, desc: 'Professional interpretation of attached external test results.' }
    );
  }

  const sectionList = sectionDefs.map((s, i) =>
    `${i + 1}. "${s.title}" (최소 ${s.minChars}자)\n   - ${s.desc}`
  ).join('\n\n');

  return `
═══ 대상자 정보 ═══
이름: ${userInput?.name || 'N/A'}
생년월일: ${userInput?.birthDate || 'N/A'} (만 ${userAge}세)
성별: ${userInput?.gender || 'N/A'}

═══ 전처리된 데이터 분석 결과 (AIHPRO 엔진) ═══

📊 데이터 개요
- 총 데이터 포인트: ${preprocessed.totalDataPoints}개
- 데이터 수집 기간: ${preprocessed.dataSpanDays}일 (${preprocessed.firstDataDate?.split('T')[0]} ~ ${preprocessed.lastDataDate?.split('T')[0]})
- 데이터 소스별: ${JSON.stringify(preprocessed.dataSourceCounts)}

📋 검사 결과 요약 (${preprocessed.assessmentSummaries.length}건)
${JSON.stringify(preprocessed.assessmentSummaries.map(a => ({
    type: a.type, date: a.date?.split('T')[0], score: `${a.totalScore}/${a.maxScore}`,
    risk: a.riskLevel, domains: a.domainScores.slice(0, 5),
  })), null, 1)}

📈 종단적 변화 추이 (AIHPRO 추적 엔진)
${preprocessed.temporalTrends.length > 0 ? JSON.stringify(preprocessed.temporalTrends.map(t => ({
    dimension: t.dimension, direction: t.direction, change: `${t.changePercent}%`,
    period: `${t.earliestDate?.split('T')[0]} → ${t.latestDate?.split('T')[0]}`,
    dataPoints: t.dataPoints.length,
  })), null, 1) : '(종단 데이터 부족 - 2회 이상 측정 필요)'}

🔗 교차 상관 분석 결과
${preprocessed.crossCorrelations.length > 0 ? preprocessed.crossCorrelations.map(c =>
    `• [${c.sourceA} ↔ ${c.sourceB}] ${c.correlation}: ${c.insight}`
  ).join('\n') : '(교차 분석 데이터 부족)'}

👁️ 관찰 기록 분석 (${preprocessed.observationInsights.totalEntries}건)
행동 패턴: ${JSON.stringify(preprocessed.observationInsights.behaviorPatterns.slice(0, 5))}
최근 우려사항: ${preprocessed.observationInsights.recentConcerns.join(' | ') || 'N/A'}

🎬 영상분석 인사이트 (${preprocessed.videoAnalysisInsights.totalAnalyses}건)
위험도 분포: ${JSON.stringify(preprocessed.videoAnalysisInsights.riskDistribution)}
주요 발견: ${preprocessed.videoAnalysisInsights.keyFindings.slice(0, 3).join(' | ') || 'N/A'}

🧠 인지훈련 진행도 (${preprocessed.cognitiveTrainingProgress.totalSessions}세션)
평균 점수: ${preprocessed.cognitiveTrainingProgress.averageScore}%
최강 영역: ${preprocessed.cognitiveTrainingProgress.bestGameType}
개선률: ${preprocessed.cognitiveTrainingProgress.improvementRate}%
게임별: ${JSON.stringify(preprocessed.cognitiveTrainingProgress.gameTypeScores.slice(0, 5))}

💬 상담 기록 분석 (${preprocessed.counselingInsights.totalSessions}건)
감정 키워드 분포: ${preprocessed.counselingInsights.emotionalTrends.join(', ') || 'N/A'}

📊 변화 추적 요약
개선된 영역: ${preprocessed.progressSummary.improvedDimensions.join(', ') || '해당 없음'}
하락한 영역: ${preprocessed.progressSummary.declinedDimensions.join(', ') || '해당 없음'}
안정적 영역: ${preprocessed.progressSummary.stableDimensions.join(', ') || '해당 없음'}

❤️ 보호자 고민 분석 (${preprocessed.concernSummary.totalConcerns}건)
심각도 분포: ${JSON.stringify(preprocessed.concernSummary.severityDistribution)}
주요 고민 유형: ${preprocessed.concernSummary.topConcernTypes.join(', ') || 'N/A'}

📉 차트용 데이터 (레이더 차트)
${JSON.stringify(preprocessed.chartData.radarChart)}

📉 차트용 데이터 (변화 비교)
${JSON.stringify(preprocessed.chartData.comparisonBarChart)}

📉 위험도 게이지
${JSON.stringify(preprocessed.chartData.riskGauge)}

${peerComparison && Object.keys(peerComparison).length > 0 ? `\n═══ 또래 비교 백분위 (AIHPRO 빅데이터) ═══\n${Object.entries(peerComparison).map(([dim, data]: [string, any]) => 
  `• ${dim}: 상위 ${100 - (data?.percentile || 50)}% (백분위 ${data?.percentile || 50}위, ${data?.is_estimated ? '추정치' : `${data?.sample_size}명 기반`}, 평균 ${data?.avg_score || 'N/A'}점)`
).join('\n')}\n⭐ 반드시 "AIHPRO 빅데이터 비교 분석" 섹션에서 이 백분위 데이터를 정확히 인용하세요.` : ''}

${reportComparison?.has_comparison ? `\n═══ 이전 리포트 대비 변화 분석 ═══\n• 이전 리포트: #${reportComparison.previous_report_number} (${reportComparison.previous_report_date?.split('T')[0]})\n• 현재 리포트: #${reportComparison.current_report_number}\n• 간격: ${reportComparison.days_between}일\n• 종합 점수 변화: ${reportComparison.previous_overall_score} → ${reportComparison.current_overall_score} (${reportComparison.overall_change > 0 ? '+' : ''}${reportComparison.overall_change})\n• 위험도 변화: ${reportComparison.previous_risk_level} → ${reportComparison.current_risk_level}\n• 차원별 변화:\n${(reportComparison.dimension_changes || []).map((d: any) => `  - ${d.dimension}: ${d.previous_score} → ${d.current_score} (${d.change > 0 ? '+' : ''}${d.change}, ${d.status === 'improved' ? '✅ 개선' : d.status === 'declined' ? '⚠️ 하락' : '➡️ 유지'})`).join('\n')}\n⭐ 이전 리포트와의 변화를 모든 관련 섹션에서 구체적으로 언급하세요.` : ''}

${userInput?.recentConcerns ? `\n═══ 보호자 주요 고민 ═══\n${userInput.recentConcerns}` : ''}
${userInput?.developmentalNotes ? `\n═══ 보호자 관찰 소견 ═══\n${userInput.developmentalNotes}` : ''}
${onboardingData ? `\n═══ 온보딩 기초 데이터 ═══\n대상: ${onboardingData.subject_type === 'child' ? '아이' : '본인'}\n${onboardingData.child_age ? `아이 나이: ${onboardingData.child_age}세` : ''}\n${onboardingData.child_gender ? `성별: ${onboardingData.child_gender === 'male' ? '남아' : '여아'}` : ''}\n관심 키워드: ${(onboardingData.concern_keywords || []).join(', ')}\n기초 상태 체크: ${JSON.stringify(onboardingData.baseline_answers || {})}` : ''}
${researchInsights ? `\n═══ 최신 연구 참고 (Perplexity 학술 검색) ═══\n${researchInsights.substring(0, 2500)}` : ''}
${externalTestImages ? `\n═══ 외부 기관 검사 결과 (AI 분석) ═══\n${externalTestImages}` : ''}

═══ 작성할 섹션 목록 ═══
${sectionList}

═══ 응답 형식 (반드시 준수) ═══
순수 JSON만 반환하세요. 마크다운 코드 블록 없이. 첫 문자는 { 마지막은 }

{
  "sections": [
    ${sectionDefs.map(s => `{ "title": "${s.title}", "content": "<div>...</div>" }`).join(',\n    ')}
  ],
  "summary": "<div>핵심 요약 (300자 이상)</div>",
  "roadmap": {
    "weeks4": [
      { "week": 1, "goal": "구체적 목표", "activities": ["구체적 활동1 (누가/무엇/어떻게/하루 몇 분)", "활동2", "활동3"], "platformFeatures": ["간편검사", "게임상담"], "milestone": "달성 기준" },
      { "week": 2, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["관찰일지", "두뇌훈련"], "milestone": "..." },
      { "week": 3, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["심층검사"], "milestone": "..." },
      { "week": 4, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["리포트"], "milestone": "4주 중간점검" }
    ],
    "weeks8": [
      { "week": 5, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["게임상담", "영상분석"], "milestone": "..." },
      { "week": 6, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["인지훈련"], "milestone": "..." },
      { "week": 7, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["음성상담"], "milestone": "..." },
      { "week": 8, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["리포트"], "milestone": "8주 중간평가" }
    ],
    "weeks12": [
      { "week": 9, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["간편검사"], "milestone": "..." },
      { "week": 10, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["관찰일지"], "milestone": "..." },
      { "week": 11, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["심층검사"], "milestone": "..." },
      { "week": 12, "goal": "...", "activities": ["...", "...", "..."], "platformFeatures": ["리포트"], "milestone": "12주 최종평가" }
    ]
  },
  "chartData": {
    "radarScores": [{"dimension": "...", "score": 0, "maxScore": 100}],
    "riskLevel": "${preprocessed.chartData.riskGauge.level}",
    "riskScore": ${preprocessed.chartData.riskGauge.score},
    "keyMetrics": {
      "overallWellbeing": 0,
      "socialAdaptation": 0,
      "emotionalStability": 0,
      "cognitiveFunction": 0,
      "behavioralRegulation": 0
    }
  }
}`;
}

// ── 5. JSON 파싱 유틸리티 ──
function stripCodeFences(text: string): string {
  return (text || '').replace(/^\uFEFF/, '').replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toHtmlContent(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

  return `<div>${trimmed
    .split(/\n{2,}/)
    .map(block => `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`)
    .join('')}</div>`;
}

function normalizeSectionTitle(title: string): string {
  return title
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/[\d️⃣⃣0-9①-⑨#.·\-_:：,()（）「」【】《》<>⚠️📋📊🔬❤️💪🎯🗺️👥🏥👨‍👩‍👧📝✅☑️⭐🌟💡🧠📈📉🏠🤝💬📖🔍✨•]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()
    .trim();
}

function getTitleAliases(isEn: boolean): Record<string, string[]> {
  return isEn
    ? {
        'Comprehensive Development & Psychology Profile': ['comprehensivedevelopmentpsychologyprofile', 'developmentprofile', 'comprehensiveprofile'],
        'Psychological & Emotional Deep Analysis': ['psychologicalemotionaldeepanalysis', 'emotionalanalysis', 'psychologicalanalysis'],
        'Strengths & Potential Matrix': ['strengthspotentialmatrix', 'strengthsweaknessesmatrix', 'strengthsanalysis'],
        'Data-Driven Personalized Intervention Strategies': ['datadrivenpersonalizedinterventionstrategies', 'interventionstrategies', 'personalizedintervention'],
        'Growth Roadmap (4/8/12 Weeks)': ['growthroadmap4812weeks', 'growthroadmap', 'roadmap'],
        'AIHPRO Big Data Comparative Analysis': ['aihprobigdatacomparativeanalysis', 'bigdatacomparison', 'peercomparison'],
        'Comprehensive Clinical Opinion': ['comprehensiveclinicalopinion', 'clinicalopinion', 'expertopinion'],
        'Home Practice Guide': ['homepracticeguide', 'familyguide', 'practiceguide'],
        'Key Summary & Action Items': ['keysummaryactionitems', 'summaryactionitems', 'summary'],
        'External Test Results Integration': ['externaltestresultsintegration', 'externaltestintegration', 'externalresults'],
      }
    : {
        '종합 발달·심리 프로파일': ['종합발달심리프로파일', '종합발달프로파일', '발달종합평가', '발달심리프로파일', '종합프로파일'],
        '심리·정서 심층 분석': ['심리정서심층분석', '심리상태분석', '정서심층분석', '심리분석'],
        '강점·잠재력 매트릭스': ['강점잠재력매트릭스', '강점약점분석', '강점분석', '잠재력매트릭스', '강점약점매트릭스'],
        '데이터 기반 맞춤 개입 전략': ['데이터기반맞춤개입전략', '맞춤개입전략', '맞춤활동제안', '개입전략', '맞춤형개입프로그램'],
        '성장 로드맵 (4주/8주/12주)': ['성장로드맵', '발달로드맵', '로드맵', '성장로드맵주주주'],
        'AIHPRO 빅데이터 비교 분석': ['빅데이터비교분석', '또래비교분석', '비교분석', '빅데이터분석'],
        '종합 소견서': ['종합소견서', '전문가소견서', '소견서'],
        '가정 내 실천 가이드': ['가정내실천가이드', '가족지원가이드', '실천가이드', '양육가이드'],
        '핵심 요약 및 실행 제언': ['핵심요약및실행제언', '종합요약및제언', '핵심요약', '요약제언'],
        '외부 검사 결과 통합 해석': ['외부검사결과통합해석', '외부검사해석', '외부검사분석'],
      };
}

function findBestReportTitle(aiTitle: string, requiredSections: string[], isEn: boolean): string | null {
  if (!aiTitle) return null;

  const normalized = normalizeSectionTitle(aiTitle);
  if (!normalized) return null;

  for (const required of requiredSections) {
    if (normalizeSectionTitle(required) === normalized) return required;
  }

  const titleAliases = getTitleAliases(isEn);
  for (const [target, aliases] of Object.entries(titleAliases)) {
    for (const alias of aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) return target;
    }
  }

  for (const required of requiredSections) {
    const normalizedRequired = normalizeSectionTitle(required);
    if (normalized.includes(normalizedRequired) || normalizedRequired.includes(normalized)) return required;
  }

  const keywordMap: Record<string, string> = isEn
    ? {
        profile: 'Comprehensive Development & Psychology Profile',
        emotional: 'Psychological & Emotional Deep Analysis',
        strength: 'Strengths & Potential Matrix',
        intervention: 'Data-Driven Personalized Intervention Strategies',
        roadmap: 'Growth Roadmap (4/8/12 Weeks)',
        bigdata: 'AIHPRO Big Data Comparative Analysis',
        peer: 'AIHPRO Big Data Comparative Analysis',
        clinical: 'Comprehensive Clinical Opinion',
        practice: 'Home Practice Guide',
        summary: 'Key Summary & Action Items',
        action: 'Key Summary & Action Items',
        external: 'External Test Results Integration',
      }
    : {
        '프로파일': '종합 발달·심리 프로파일',
        '정서': '심리·정서 심층 분석',
        '강점': '강점·잠재력 매트릭스',
        '개입': '데이터 기반 맞춤 개입 전략',
        '로드맵': '성장 로드맵 (4주/8주/12주)',
        '빅데이터': 'AIHPRO 빅데이터 비교 분석',
        '또래': 'AIHPRO 빅데이터 비교 분석',
        '소견': '종합 소견서',
        '가정': '가정 내 실천 가이드',
        '실천': '가정 내 실천 가이드',
        '요약': '핵심 요약 및 실행 제언',
        '제언': '핵심 요약 및 실행 제언',
        '외부': '외부 검사 결과 통합 해석',
      };

  for (const [keyword, title] of Object.entries(keywordMap)) {
    if (normalized.includes(keyword)) return title;
  }

  return null;
}

function extractJSON(text: string): any {
  const cleaned = stripCodeFences(text);

  try { return JSON.parse(cleaned); } catch {}

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
    try { return JSON.parse(jsonStr); } catch {}
    try { return JSON.parse(jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')); } catch {}
  }

  if (firstBrace !== -1) {
    let truncated = cleaned.substring(firstBrace)
      .replace(/,\s*\{[^}]*$/, '')
      .replace(/,\s*"[^"]*$/, '')
      .replace(/:\s*"[^"]*$/, ': ""');

    let openBraces = 0, openBrackets = 0, inString = false, escape = false;
    for (const ch of truncated) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') openBraces++;
      if (ch === '}') openBraces--;
      if (ch === '[') openBrackets++;
      if (ch === ']') openBrackets--;
    }

    if (inString) truncated += '"';
    truncated = truncated.replace(/,\s*$/, '');
    for (let i = 0; i < openBrackets; i++) truncated += ']';
    for (let i = 0; i < openBraces; i++) truncated += '}';
    try { return JSON.parse(truncated); } catch {}
  }

  return null;
}

function normalizeReportPayload(candidate: any, requiredSections: string[], isEn: boolean): any | null {
  if (!candidate || typeof candidate !== 'object') return null;

  let rawSections: any[] = [];
  if (Array.isArray(candidate.sections)) {
    rawSections = candidate.sections;
  } else if (candidate.sections && typeof candidate.sections === 'object') {
    rawSections = Object.entries(candidate.sections).map(([title, value]) => ({ title, content: value }));
  }

  if (rawSections.length === 0) {
    rawSections = Object.entries(candidate)
      .map(([title, value]) => {
        const matchedTitle = findBestReportTitle(title, requiredSections, isEn);
        if (!matchedTitle) return null;
        return { title, content: value };
      })
      .filter(Boolean) as any[];
  }

  const byTitle = new Map<string, string>();
  for (const section of rawSections) {
    const title = typeof section?.title === 'string'
      ? section.title
      : typeof section?.name === 'string'
      ? section.name
      : typeof section?.heading === 'string'
      ? section.heading
      : '';

    const rawContent = typeof section?.content === 'string'
      ? section.content
      : typeof section?.body === 'string'
      ? section.body
      : typeof section?.html === 'string'
      ? section.html
      : typeof section?.text === 'string'
      ? section.text
      : typeof section === 'string'
      ? section
      : '';

    const matchedTitle = findBestReportTitle(title, requiredSections, isEn);
    const normalizedContent = toHtmlContent(rawContent);

    if (matchedTitle && normalizedContent && !byTitle.has(matchedTitle)) {
      byTitle.set(matchedTitle, normalizedContent);
    }
  }

  if (byTitle.size === 0 && rawSections.length > 0) {
    for (let i = 0; i < Math.min(rawSections.length, requiredSections.length); i++) {
      const rawContent = typeof rawSections[i]?.content === 'string'
        ? rawSections[i].content
        : typeof rawSections[i]?.body === 'string'
        ? rawSections[i].body
        : typeof rawSections[i]?.html === 'string'
        ? rawSections[i].html
        : typeof rawSections[i]?.text === 'string'
        ? rawSections[i].text
        : '';
      const normalizedContent = toHtmlContent(rawContent);
      if (normalizedContent && normalizedContent.length > 20) {
        byTitle.set(requiredSections[i], normalizedContent);
      }
    }
  }

  if (byTitle.size === 0) return null;

  const summaryTitle = isEn ? 'Key Summary & Action Items' : '핵심 요약 및 실행 제언';
  const fallbackSummaryText = Array.from(byTitle.values())
    .map(content => content.replace(/<[^>]*>/g, ' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);

  return {
    ...candidate,
    sections: requiredSections.map(title => ({
      title,
      content: byTitle.get(title) ?? `<div><p>이 섹션의 분석이 생성되지 않았습니다. 다시 시도해주세요.</p></div>`,
    })),
    summary: toHtmlContent(candidate.summary) || toHtmlContent(candidate.executiveSummary) || toHtmlContent(candidate.overallSummary) || byTitle.get(summaryTitle) || toHtmlContent(fallbackSummaryText),
    roadmap: candidate.roadmap ?? candidate.growthRoadmap ?? null,
    chartData: candidate.chartData ?? null,
  };
}

function reconstructReportFromText(text: string, requiredSections: string[], isEn: boolean): any | null {
  const prepared = stripCodeFences(text)
    .replace(/<(\/?(?:h[1-6]|p|div|li|ul|ol|br))\b[^>]*>/gi, '\n$&\n')
    .replace(/\r/g, '\n');

  const lines = prepared.split('\n').map(line => line.trim()).filter(Boolean);
  const buckets = new Map<string, string[]>();
  let currentTitle: string | null = null;

  for (const rawLine of lines) {
    const plainLine = rawLine.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim();
    const matchedTitle = findBestReportTitle(plainLine, requiredSections, isEn);
    const looksLikeHeading = matchedTitle && plainLine.length <= 80;

    if (looksLikeHeading) {
      currentTitle = matchedTitle;
      if (!buckets.has(matchedTitle)) buckets.set(matchedTitle, []);
      continue;
    }

    if (currentTitle) {
      buckets.get(currentTitle)?.push(rawLine);
    }
  }

  const recoveredCount = Array.from(buckets.values()).filter(lines => lines.join(' ').trim().length > 40).length;
  if (recoveredCount === 0) return null;

  const sections = requiredSections.map(title => ({
    title,
    content: toHtmlContent((buckets.get(title) || []).join('\n')),
  }));
  const summaryTitle = isEn ? 'Key Summary & Action Items' : '핵심 요약 및 실행 제언';
  const summarySection = sections.find(section => section.title === summaryTitle && section.content);
  const fallbackSummary = sections
    .filter(section => section.content)
    .map(section => section.content.replace(/<[^>]*>/g, ' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);

  return {
    sections,
    summary: summarySection?.content || toHtmlContent(fallbackSummary),
    roadmap: null,
    chartData: null,
    recoveredFrom: 'section-parser',
  };
}

async function repairMalformedReportJSON(text: string, requiredSections: string[], language: string): Promise<any | null> {
  if (!LOVABLE_API_KEY || !text?.trim()) return null;

  try {
    const repairPrompt = `아래 깨진 프리미엄 리포트 결과를 엄격한 JSON으로 복구하세요.\n- 의미를 바꾸거나 새 임상 사실을 만들지 마세요.\n- HTML은 가능한 그대로 유지하세요.\n- 응답은 JSON만 출력하세요.\n- sections는 반드시 title/content를 가진 배열이어야 합니다.\n- title은 아래 목록 중 하나와 정확히 일치해야 합니다.\n\n[필수 섹션]\n${requiredSections.join('\n')}\n\n[JSON 스키마]\n{\n  "sections": [{ "title": "섹션명", "content": "<div>...</div>" }],\n  "summary": "<div>...</div>",\n  "roadmap": null\n}\n\n[복구할 원본]\n${text.slice(0, 28000)}`;

    const repairResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: [
          {
            role: 'system',
            content: language === 'en'
              ? 'You repair malformed AI outputs into strict JSON. Return JSON only.'
              : '당신은 깨진 AI 응답을 엄격한 JSON으로 복구하는 엔진입니다. 반드시 JSON만 반환하세요.',
          },
          { role: 'user', content: repairPrompt },
        ],
        max_tokens: 16000,
      }),
    });

    if (!repairResponse.ok) {
      console.error('JSON 복구 호출 실패:', repairResponse.status);
      return null;
    }

    const repairRawText = await repairResponse.text();
    try {
      const repairEnvelope = JSON.parse(repairRawText);
      return extractJSON(extractMessageContent(repairEnvelope));
    } catch {
      return extractJSON(repairRawText);
    }
  } catch (error) {
    console.error('JSON 복구 실패:', error);
    return null;
  }
}

function extractMessageContent(rawJson: any): string {
  const choice = rawJson?.choices?.[0];
  if (!choice) return '';
  const msg = choice.message;
  if (!msg) return '';
  if (typeof msg.content === 'string' && msg.content.trim()) return msg.content.trim();
  if (Array.isArray(msg.content)) {
    const text = msg.content.map((p: any) => typeof p === 'string' ? p : (p?.text || '')).join('').trim();
    if (text) return text;
  }
  const toolArgs = msg.tool_calls?.[0]?.function?.arguments;
  if (toolArgs) return typeof toolArgs === 'string' ? toolArgs : JSON.stringify(toolArgs);
  return '';
}

// ── 6. 메인 핸들러 ──
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { assessments: clientAssessments, observations: clientObservations, observationSessions: clientSessions, chatRooms: clientChatRooms, profile: clientProfile, externalTestImages, userInput, reportMode, language, onboardingData } = await req.json();

    const isWithData = reportMode !== 'without-data';
    const isKo = language !== 'en';

    console.log('AIHPRO 리포트 v2.0 생성 시작:', {
      userId: user.id, reportMode, userName: userInput?.name,
    });

    // 나이 계산
    const calculateAge = (birthDate: string): number => {
      if (!birthDate) return 0;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
      return age;
    };
    const userAge = calculateAge(userInput?.birthDate);

    let preprocessed: PreprocessedData;

    if (isWithData) {
      // ★ 핵심 차별화: 서버에서 직접 8개 소스 수집 + 전처리
      const collectedData = await collectAllUserData(supabaseClient, user.id);

      console.log('데이터 수집 완료:', {
        assessments: collectedData.assessments.length,
        observations: collectedData.observations.length,
        progressTracking: collectedData.progressTracking.length,
        videoAnalysis: collectedData.aiObservations.length,
        brainTraining: collectedData.brainTraining.length,
        chatMessages: collectedData.chatMessages.length,
        concernStorage: collectedData.concernStorage.length,
      });

      preprocessed = preprocessData(collectedData, userAge);

      console.log('전처리 완료:', {
        totalDataPoints: preprocessed.totalDataPoints,
        dataSpanDays: preprocessed.dataSpanDays,
        temporalTrends: preprocessed.temporalTrends.length,
        crossCorrelations: preprocessed.crossCorrelations.length,
        radarDimensions: preprocessed.chartData.radarChart.length,
      });
    } else {
      // without-data 모드: 최소 구조 생성
      preprocessed = {
        totalDataPoints: 0, dataSpanDays: 0,
        firstDataDate: new Date().toISOString(),
        lastDataDate: new Date().toISOString(),
        dataSourceCounts: {},
        assessmentSummaries: [],
        unifiedDimensionScores: [],
        temporalTrends: [],
        crossCorrelations: [],
        observationInsights: { totalEntries: 0, behaviorPatterns: [], recentConcerns: [] },
        videoAnalysisInsights: { totalAnalyses: 0, riskDistribution: {}, keyFindings: [] },
        cognitiveTrainingProgress: { totalSessions: 0, averageScore: 0, bestGameType: 'N/A', worstGameType: 'N/A', improvementRate: 0, gameTypeScores: [] },
        counselingInsights: { totalSessions: 0, emotionalTrends: [], keyThemes: [], recentTopics: [] },
        progressSummary: { totalRecords: 0, improvedDimensions: [], declinedDimensions: [], stableDimensions: [] },
        concernSummary: { totalConcerns: 0, severityDistribution: {}, topConcernTypes: [], recommendedTests: [] },
        chartData: { radarChart: [], trendLineChart: [], comparisonBarChart: [], riskGauge: { level: '분석 중', score: 50, maxScore: 100 } },
      };
    }

    // ★ 병렬로 연구 검색 + 또래 비교 + 이전 리포트 비교 수행
    const concerns = userInput?.recentConcerns || userInput?.developmentalNotes || '';
    const [researchInsights, peerComparison, reportComparison] = await Promise.all([
      searchLatestResearch(concerns, userAge, userInput?.gender || ''),
      isWithData ? calculatePeerComparison(supabaseClient, user.id, preprocessed.unifiedDimensionScores) : {},
      getPreviousReportComparison(supabaseClient, user.id),
    ]);

    console.log('부가 데이터 수집 완료:', {
      hasResearch: !!researchInsights,
      peerDimensions: Object.keys(peerComparison).length,
      hasComparison: reportComparison?.has_comparison,
    });

    // AI 프롬프트 구성
    const systemPrompt = buildSystemPrompt(preprocessed, language || 'ko', !!externalTestImages);
    const userPrompt = buildUserPrompt(preprocessed, userInput, userAge, researchInsights, externalTestImages || '', language || 'ko', onboardingData, peerComparison, reportComparison);

    // AI 호출 — 최고 사양 모델 (Gemini 3.1 Pro Preview) 사용
    const aiModel = 'google/gemini-3.1-pro-preview';
    console.log(`AI 호출 시작 (${aiModel} — PhD급 분석), 프롬프트 길이: ${systemPrompt.length + userPrompt.length}`);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: systemPrompt + '\n\n⚠️ 절대 중요: 응답은 순수 JSON만. ```json 없이. 첫 문자 { 마지막 }' },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 32000,
        reasoning: {
          effort: 'medium',
        },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI 응답 오류:', aiResponse.status, errorText);

      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'LOVABLE_AI_CREDITS_INSUFFICIENT', message: 'AI 크레딧이 부족합니다.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 });
      }
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'LOVABLE_AI_RATE_LIMITED', message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 });
      }
      throw new Error(`AI 분석 실패: ${aiResponse.status}`);
    }

    const rawText = await aiResponse.text();
    console.log('AI 응답 길이:', rawText?.length);

    // 섹션 정의
    const isEn = language === 'en';
    const requiredSections = isEn
      ? ['Comprehensive Development & Psychology Profile', 'Psychological & Emotional Deep Analysis', 'Strengths & Potential Matrix', 'Data-Driven Personalized Intervention Strategies', 'Growth Roadmap (4/8/12 Weeks)', 'AIHPRO Big Data Comparative Analysis', 'Comprehensive Clinical Opinion', 'Home Practice Guide', 'Key Summary & Action Items']
      : ['종합 발달·심리 프로파일', '심리·정서 심층 분석', '강점·잠재력 매트릭스', '데이터 기반 맞춤 개입 전략', '성장 로드맵 (4주/8주/12주)', 'AIHPRO 빅데이터 비교 분석', '종합 소견서', '가정 내 실천 가이드', '핵심 요약 및 실행 제언'];

    if (externalTestImages) {
      requiredSections.push(isEn ? 'External Test Results Integration' : '외부 검사 결과 통합 해석');
    }

    const placeholderReport = (reason: string) => ({
      sections: requiredSections.map(title => ({
        title,
        content: `<div><p>이 섹션의 분석이 생성되지 않았습니다. (${reason}) 다시 시도해주세요.</p></div>`,
      })),
      summary: `<div>리포트 생성 중 문제가 발생했습니다. (${reason})</div>`,
      roadmap: null,
      chartData: null,
      parseError: true,
    });

    let reportData: any;
    try {
      const aiData = JSON.parse(rawText);
      let messageContent = extractMessageContent(aiData);
      console.log('AI content 길이:', messageContent.length);

      if (!messageContent || messageContent.length < 50) {
        console.error('AI content 비어있음, 재시도');
        const retryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai/gpt-5.2',
            messages: [
              { role: 'system', content: systemPrompt + '\n\n⚠️ 응답은 순수 JSON만. 첫 문자 { 마지막 }' },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 32000,
          }),
        });
        if (retryResponse.ok) {
          const retryRaw = await retryResponse.text();
          const retryData = JSON.parse(retryRaw);
          messageContent = extractMessageContent(retryData);
        }
        if (!messageContent || messageContent.length < 50) {
          reportData = placeholderReport('AI content가 비어있음');
        }
      }

      if (!reportData) {
        const parsedCandidate = extractJSON(messageContent);
        reportData = normalizeReportPayload(parsedCandidate, requiredSections, isEn);
      }

      if (!reportData) {
        console.warn('기본 JSON 파싱 실패, 섹션 텍스트 복원 시도');
        reportData = reconstructReportFromText(messageContent, requiredSections, isEn);
      }

      if (!reportData) {
        console.warn('섹션 텍스트 복원 실패, AI JSON 복구 시도');
        const repairedCandidate = await repairMalformedReportJSON(messageContent, requiredSections, language || 'ko');
        reportData = normalizeReportPayload(repairedCandidate, requiredSections, isEn);
      }

      if (!reportData) {
        reportData = placeholderReport('JSON 파싱 실패');
      }

      if (reportData && Array.isArray(reportData.sections)) {
        const validSectionCount = reportData.sections.filter((section: any) => {
          const content = typeof section?.content === 'string' ? section.content.replace(/<[^>]*>/g, '').trim() : '';
          return content.length > 20 && !content.includes('이 섹션의 분석이 생성되지 않았습니다');
        }).length;

        console.log('복원된 섹션 수:', validSectionCount, '/', requiredSections.length);

        if (validSectionCount === 0) {
          const fallbackReconstructed = reconstructReportFromText(messageContent, requiredSections, isEn);
          if (fallbackReconstructed) {
            reportData = fallbackReconstructed;
          }
        }
      }
    } catch (parseError) {
      console.error('AI 응답 파싱 최종 오류:', parseError);
      reportData = placeholderReport('JSON 파싱 실패');
    }

    // 메타데이터 & 전처리 데이터 첨부
    reportData.metadata = {
      generatedAt: new Date().toISOString(),
      model: aiModel,
      frameworkVersion: 'AIHPRO_v4.0_PhD',
      analysisLevel: 'PhD-grade (Gemini 3.1 Pro + Perplexity sonar-pro)',
      dataCount: preprocessed.dataSourceCounts,
      dataSpanDays: preprocessed.dataSpanDays,
      hasResearchInsights: !!researchInsights,
      hasPeerComparison: Object.keys(peerComparison).length > 0,
      hasReportComparison: reportComparison?.has_comparison || false,
      reportNumber: reportComparison?.current_report_number || 1,
      userInfo: { name: userInput?.name, age: userAge, gender: userInput?.gender },
    };

    // 프론트엔드 시각화용 전처리 데이터 첨부
    reportData.preprocessedData = {
      chartData: preprocessed.chartData,
      temporalTrends: preprocessed.temporalTrends.map(t => ({
        dimension: t.dimension,
        direction: t.direction,
        changePercent: t.changePercent,
        dataPoints: t.dataPoints.map(dp => ({ date: dp.date.split('T')[0], score: dp.score })),
      })),
      crossCorrelations: preprocessed.crossCorrelations.map(c => ({
        insight: c.insight,
        correlation: c.correlation,
        sources: `${c.sourceA} ↔ ${c.sourceB}`,
      })),
      cognitiveTrainingProgress: preprocessed.cognitiveTrainingProgress,
      dataSourceCounts: preprocessed.dataSourceCounts,
      totalDataPoints: preprocessed.totalDataPoints,
      dataSpanDays: preprocessed.dataSpanDays,
      progressSummary: preprocessed.progressSummary,
      peerComparison,
      reportComparison,
    };

    if (researchInsights) {
      reportData.researchInsightsContent = researchInsights;
    }

    // ★ 리포트 이력 저장 (비동기 - 응답 블로킹 안함)
    saveReportHistory(supabaseClient, user.id, reportData, preprocessed, aiModel).catch(err => {
      console.error('리포트 이력 저장 백그라운드 오류:', err);
    });

    return new Response(
      JSON.stringify({ success: true, report: reportData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('리포트 생성 오류:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : '리포트 생성 중 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
