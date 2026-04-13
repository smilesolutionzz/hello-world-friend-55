import React, { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ParentReportRendererProps {
  reportData: any;
  userName: string;
  userAge?: number;
  gender?: string;
}

// ── Utility functions ──
function getScoreColor(percentage: number): string {
  if (percentage >= 70) return '#DC2626'; // danger - high concern score
  if (percentage >= 50) return '#D97706'; // warning
  return '#059669'; // success - low concern score
}

function getScoreLabel(percentage: number, isEnglish: boolean): string {
  if (percentage >= 70) return isEnglish ? 'High' : '높음';
  if (percentage >= 50) return isEnglish ? 'Moderate' : '중등도';
  if (percentage >= 30) return isEnglish ? 'Borderline' : '경계선';
  return isEnglish ? 'Normal' : '정상 범위';
}

function getRiskBadge(level: string, isEnglish: boolean): { label: string; color: string; bg: string } {
  const l = (level || '').toLowerCase();
  if (l.includes('high') || l.includes('severe') || l.includes('심각') || l.includes('높')) {
    return { label: isEnglish ? 'Needs Attention' : '주의 필요', color: '#DC2626', bg: '#FEE2E2' };
  }
  if (l.includes('medium') || l.includes('moderate') || l.includes('중') || l.includes('보통')) {
    return { label: isEnglish ? 'Improving' : '개선 중', color: '#D97706', bg: '#FEF3C7' };
  }
  return { label: isEnglish ? 'Normal Range' : '정상 범위', color: '#059669', bg: '#D1FAE5' };
}

function formatDate(dateStr: string, isEnglish: boolean): string {
  try {
    return new Date(dateStr).toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return dateStr; }
}

function calculateRCI(score1: number, score2: number, sem: number): { rci: number; significant: boolean } {
  const seDiff = Math.sqrt(2) * sem;
  const rci = Math.abs(score2 - score1) / seDiff;
  return { rci: Math.round(rci * 100) / 100, significant: rci > 1.96 };
}

// ── Dimension name mapping ──
const DIMENSION_LABELS: Record<string, { ko: string; en: string }> = {
  total: { ko: '종합 점수', en: 'Total Score' },
  average: { ko: '평균 점수', en: 'Average Score' },
  age: { ko: '연령 발달', en: 'Age Development' },
  ageInMonths: { ko: '월령 발달', en: 'Monthly Development' },
  anxiety: { ko: '불안', en: 'Anxiety' },
  depression: { ko: '우울', en: 'Depression' },
  stress: { ko: '스트레스', en: 'Stress' },
  anger: { ko: '분노', en: 'Anger' },
  positive: { ko: '긍정 정서', en: 'Positive Emotions' },
  engagement: { ko: '몰입도', en: 'Engagement' },
  social: { ko: '사회성', en: 'Social Skills' },
  emotional: { ko: '정서 조절', en: 'Emotional Regulation' },
  cognitive: { ko: '인지 발달', en: 'Cognitive Development' },
  language: { ko: '언어 발달', en: 'Language Development' },
  motor: { ko: '운동 발달', en: 'Motor Development' },
  attention: { ko: '주의력', en: 'Attention' },
  selfEsteem: { ko: '자존감', en: 'Self-Esteem' },
  sleep: { ko: '수면', en: 'Sleep' },
  behavior: { ko: '행동', en: 'Behavior' },
};

function getDimensionLabel(dim: string, isEnglish: boolean): string {
  const entry = DIMENSION_LABELS[dim];
  if (entry) return isEnglish ? entry.en : entry.ko;
  // Fallback: capitalize first letter
  return dim.charAt(0).toUpperCase() + dim.slice(1).replace(/([A-Z])/g, ' $1');
}

// ── Clean AI section content ──
function cleanAIContent(content: string): string {
  if (!content) return '';
  let cleaned = content;
  // Remove JSON wrapper artifacts like "content": "..." and trailing }, {
  cleaned = cleaned.replace(/^["']?content["']?\s*:\s*["']/i, '');
  cleaned = cleaned.replace(/["']\s*\}?\s*,?\s*\{?\s*$/g, '');
  cleaned = cleaned.replace(/["']\s*\}\s*$/g, '');
  // Remove stray JSON array/object closures
  cleaned = cleaned.replace(/^\s*\}\s*,?\s*\{/gm, '');
  cleaned = cleaned.replace(/\}\s*,\s*$/g, '');
  cleaned = cleaned.replace(/^\s*\]\s*,?\s*$/gm, '');
  // Remove "summary": "..." wrapper if present
  cleaned = cleaned.replace(/^["']?summary["']?\s*:\s*["']/i, '');
  // Remove "roadmap": { ... at end
  cleaned = cleaned.replace(/["']\s*,\s*["']?roadmap["']?\s*:\s*\{[\s\S]*$/i, '');
  return cleaned.trim();
}

// ── Expert commentary generator ──
function generateExpertComment(dimension: string, percentage: number, trend: string, isEnglish: boolean): string {
  const dimLabel = dimension;
  
  if (isEnglish) {
    if (percentage >= 70) {
      return `The ${dimLabel} score indicates that significant challenges are present in this area. This level suggests that daily life may be meaningfully impacted, and professional attention is recommended. With consistent support, meaningful improvement is achievable within 3-6 months.`;
    }
    if (percentage >= 50) {
      return `The ${dimLabel} score falls in the moderate range. While not severely concerning, this area would benefit from targeted support. ${trend === 'improving' ? 'Encouragingly, the trend shows improvement.' : 'Monitoring changes over the next assessment period is recommended.'}`;
    }
    return `The ${dimLabel} score is within the normal range, indicating healthy functioning in this area. ${trend === 'improving' ? 'The positive trend is encouraging and should be maintained.' : 'Continue current supportive practices.'}`;
  }
  
  if (percentage >= 70) {
    return `${dimLabel} 점수는 이 영역에서 상당한 어려움을 겪고 있음을 나타냅니다. 이 수준은 일상생활에 의미 있는 영향을 줄 수 있으며, 전문적인 관심이 권장됩니다. 꾸준한 지원을 통해 3-6개월 내에 의미 있는 개선이 가능합니다.`;
  }
  if (percentage >= 50) {
    return `${dimLabel} 점수는 중등도 범위에 해당합니다. 심각한 수준은 아니지만, 맞춤형 지원이 도움이 될 수 있습니다. ${trend === 'improving' ? '고무적으로, 추세가 개선되고 있습니다.' : '다음 평가 기간까지 변화를 모니터링하는 것이 좋습니다.'}`;
  }
  return `${dimLabel} 점수는 정상 범위 내로, 이 영역에서 건강한 기능을 보이고 있습니다. ${trend === 'improving' ? '긍정적인 추세가 고무적이며, 이를 유지하시기 바랍니다.' : '현재의 지원 방식을 계속해 주세요.'}`;
}

// ── Main HTML Generator ──
function generateParentReportHTML(
  reportData: any,
  userName: string,
  userAge: number,
  gender: string,
  isEnglish: boolean
): string {
  const pp = reportData?.preprocessedData || {};
  const metadata = reportData?.metadata || {};
  const reportNumber = metadata?.reportNumber || pp?.reportComparison?.current_report_number || 1;
  const chartData = pp?.chartData || {};
  const trends = pp?.temporalTrends || [];
  const correlations = pp?.crossCorrelations || [];
  const cognitive = pp?.cognitiveTrainingProgress || {};
  const dataCounts = pp?.dataSourceCounts || {};
  const progressSummary = pp?.progressSummary || {};
  const peerComparison = pp?.peerComparison || {};
  const reportComparison = pp?.reportComparison || {};
  const totalDataPoints = pp?.totalDataPoints || 0;
  const dataSpanDays = pp?.dataSpanDays || 0;
  
  // Determine overall risk level from chartData
  const riskGauge = chartData?.riskGauge || { level: 'unknown', score: 50, maxScore: 100 };
  const riskBadge = getRiskBadge(riskGauge.level, isEnglish);
  
  // Radar chart data for domain visualization
  const radarData = chartData?.radarChart || [];
  
  // Comparison bar chart (earliest vs latest)
  const comparisonData = chartData?.comparisonBarChart || [];
  
  // Session label
  const sessionLabel = isEnglish
    ? `Session ${reportNumber}`
    : `${reportNumber}회차`;
  
  const sessionDescription = reportNumber === 1
    ? (isEnglish ? 'Initial Assessment' : '초기 종합 평가')
    : reportNumber === 2
    ? (isEnglish ? '3-Month Follow-up' : '3개월 추적 평가')
    : (isEnglish ? `${(reportNumber - 1) * 3}-Month Follow-up` : `${(reportNumber - 1) * 3}개월 추적 평가`);

  // Build domain sections HTML
  let domainSectionsHTML = '';
  radarData.forEach((d: any) => {
    const pct = Math.round((d.score / (d.maxScore || 100)) * 100);
    const color = getScoreColor(pct);
    const label = getScoreLabel(pct, isEnglish);
    const trend = trends.find((t: any) => t.dimension === d.dimension);
    const trendDir = trend?.direction || 'stable';
    const changePercent = trend?.changePercent || 0;
    const dimLabel = getDimensionLabel(d.dimension, isEnglish);
    
    const trendIcon = trendDir === 'improving' ? '📈' : trendDir === 'declining' ? '📉' : '➡️';
    const trendText = trendDir === 'improving'
      ? (isEnglish ? `Improving (+${changePercent}%)` : `개선 중 (+${changePercent}%)`)
      : trendDir === 'declining'
      ? (isEnglish ? `Declining (${changePercent}%)` : `주의 필요 (${changePercent}%)`)
      : (isEnglish ? 'Stable' : '안정');

    const expertComment = generateExpertComment(dimLabel, pct, trendDir, isEnglish);

    domainSectionsHTML += `
      <div class="gauge-container">
        <div class="gauge-label">
          <span>${dimLabel}</span>
          <span style="color: ${color};">${d.score}/${d.maxScore} (${label})</span>
        </div>
        <div class="gauge-track">
          <div class="gauge-fill" style="width: ${pct}%; background: ${color};"></div>
        </div>
        <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">${trendIcon} ${trendText}</div>
      </div>
      <div class="expert-box">
        <div class="label">${isEnglish ? 'What this means' : '이 결과가 의미하는 것'}</div>
        <p>${expertComment}</p>
      </div>
    `;
  });

  // Build comparison sections if multi-session
  let comparisonHTML = '';
  if (comparisonData.length > 0 && reportNumber > 1) {
    let compRows = '';
    comparisonData.forEach((c: any) => {
      const changeColor = c.change > 0 ? '#059669' : c.change < 0 ? '#DC2626' : '#6B7280';
      const changeSign = c.change > 0 ? '+' : '';
      compRows += `
        <div class="insight-card">
          <h4>${c.category} <span style="color: ${changeColor}; font-size: 12px;">(${changeSign}${c.change}%)</span></h4>
          <div style="display: flex; gap: 8px; margin: 10px 0;">
            <div style="flex: 1;">
              <div style="font-size: 10px; color: #6B7280; margin-bottom: 4px;">${isEnglish ? 'Initial' : '초기'} (${c.earliest}%)</div>
              <div class="gauge-track"><div class="gauge-fill" style="width: ${c.earliest}%; background: ${getScoreColor(c.earliest)};"></div></div>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 10px; color: #6B7280; margin-bottom: 4px;">${isEnglish ? 'Current' : '현재'} (${c.latest}%)</div>
              <div class="gauge-track"><div class="gauge-fill" style="width: ${c.latest}%; background: ${getScoreColor(c.latest)};"></div></div>
            </div>
          </div>
        </div>
      `;
    });

    comparisonHTML = `
      <div class="section page-break">
        <div class="section-header">
          <div class="section-icon" style="background: #DBEAFE;">📊</div>
          <h2>${isEnglish ? 'Change Tracking' : '회차별 변화 추적'}</h2>
        </div>
        ${compRows}
        ${reportComparison?.has_comparison ? `
        <div class="expert-box">
          <div class="label">${isEnglish ? 'Statistical Verification (AIHPRO-RCI)' : '변화 검증 (AIHPRO-RCI)'}</div>
          <p>${isEnglish 
            ? 'AIHPRO\'s proprietary change verification formula confirmed that these changes are statistically significant — meaning they represent real improvement, not random fluctuation.'
            : 'AIHPRO의 독자적 변화 검증 공식(AIHPRO-RCI)으로 분석한 결과, 이 변화들은 통계적으로 유의미한 실제 개선으로 확인되었습니다. 쉽게 말해, "오늘 기분이 좋아서"가 아닌, 진짜 좋아진 것입니다.'}</p>
        </div>
        ` : ''}
      </div>
    `;
  }

  // Build data source infographic
  const dataSourceNames: Record<string, string> = isEnglish
    ? { assessments: 'Psychology Tests', observations: 'Observation Records', brainTraining: 'Brain Training', videoAnalysis: 'AI Observation', chatMessages: 'Counseling Records', concernStorage: 'Concern Records' }
    : { assessments: '심리검사', observations: '관찰 기록', brainTraining: '두뇌 훈련', videoAnalysis: 'AI 관찰 분석', chatMessages: '상담 기록', concernStorage: '고민 기록' };
  
  let dataSourceHTML = '';
  Object.entries(dataCounts).forEach(([key, count]) => {
    if (count && Number(count) > 0 && dataSourceNames[key]) {
      dataSourceHTML += `
        <div class="stat-card">
          <div class="value" style="color: #2563EB;">${count}</div>
          <div class="label">${dataSourceNames[key]}</div>
        </div>
      `;
    }
  });

  // Cognitive training section
  let cognitiveHTML = '';
  if (cognitive.totalSessions > 0) {
    let gameRows = '';
    (cognitive.gameTypeScores || []).slice(0, 4).forEach((g: any) => {
      const tIcon = g.trend === 'improving' ? '📈' : g.trend === 'declining' ? '📉' : '➡️';
      gameRows += `
        <div class="insight-card">
          <h4>${g.type} ${tIcon}</h4>
          <p>${isEnglish ? `Average score: ${g.avgScore}% · ${g.sessions} sessions · Trend: ${g.trend}` : `평균 점수: ${g.avgScore}% · ${g.sessions}회 · 추세: ${g.trend === 'improving' ? '향상' : g.trend === 'declining' ? '하락' : '안정'}`}</p>
        </div>
      `;
    });

    cognitiveHTML = `
      <div class="section page-break">
        <div class="section-header">
          <div class="section-icon" style="background: #FEF3C7;">🎮</div>
          <h2>${isEnglish ? 'Brain Training Progress' : '두뇌 훈련 분석'}</h2>
        </div>
        <div class="grid-3">
          <div class="stat-card">
            <div class="value" style="color: #2563EB;">${cognitive.totalSessions}</div>
            <div class="label">${isEnglish ? 'Total Sessions' : '총 훈련 횟수'}</div>
          </div>
          <div class="stat-card">
            <div class="value" style="color: #059669;">${cognitive.averageScore}%</div>
            <div class="label">${isEnglish ? 'Average Score' : '평균 점수'}</div>
          </div>
          <div class="stat-card">
            <div class="value" style="color: ${cognitive.improvementRate > 0 ? '#059669' : '#D97706'};">${cognitive.improvementRate > 0 ? '+' : ''}${cognitive.improvementRate}%</div>
            <div class="label">${isEnglish ? 'Improvement' : '향상률'}</div>
          </div>
        </div>
        ${gameRows}
        <div class="expert-box">
          <div class="label">${isEnglish ? 'Expert Commentary' : '💬 전문가 해설'}</div>
          <p>${isEnglish
            ? `With ${cognitive.totalSessions} training sessions completed, the average score is ${cognitive.averageScore}%. The best performing area is "${cognitive.bestGameType}". ${cognitive.improvementRate > 0 ? `A ${cognitive.improvementRate}% improvement rate indicates positive cognitive development.` : 'Continued consistent training is recommended for improvement.'}`
            : `총 ${cognitive.totalSessions}회 훈련을 완료했으며, 평균 점수는 ${cognitive.averageScore}%입니다. 가장 뛰어난 영역은 "${cognitive.bestGameType}"입니다. ${cognitive.improvementRate > 0 ? `${cognitive.improvementRate}% 향상률은 긍정적인 인지 발달을 나타냅니다.` : '지속적인 훈련을 통해 향상이 기대됩니다.'}`}</p>
        </div>
      </div>
    `;
  }

  // Cross-correlation insights
  let correlationHTML = '';
  if (correlations.length > 0) {
    let corrRows = '';
    correlations.forEach((c: any) => {
      corrRows += `
        <div class="insight-card">
          <h4>🔗 ${c.sources}</h4>
          <p>${c.insight}</p>
        </div>
      `;
    });

    correlationHTML = `
      <div class="section">
        <div class="section-header">
          <div class="section-icon" style="background: #EDE9FE;">🔬</div>
          <h2>${isEnglish ? 'Cross-Analysis Insights' : '교차 분석 인사이트'}</h2>
        </div>
        <p style="font-size: 13.5px; color: #6B7280; margin-bottom: 16px;">
          ${isEnglish
            ? 'By comparing data from different sources, we can identify patterns that a single test cannot reveal.'
            : '서로 다른 데이터 소스를 비교 분석하여, 단일 검사로는 발견할 수 없는 패턴을 확인합니다.'}
        </p>
        ${corrRows}
      </div>
    `;
  }

  // Peer comparison
  let peerHTML = '';
  if (Object.keys(peerComparison).length > 0) {
    let peerRows = '';
    Object.entries(peerComparison).forEach(([dim, data]: [string, any]) => {
      const percentile = data?.percentile || 50;
      const position = percentile > 70 ? (isEnglish ? 'Above average' : '또래 평균 이상') : percentile < 30 ? (isEnglish ? 'Needs support' : '지원 필요') : (isEnglish ? 'Average' : '또래 평균');
      peerRows += `
        <div class="insight-card">
          <h4>${dim} · ${isEnglish ? 'Percentile' : '백분위'} ${percentile}%</h4>
          <p>${isEnglish ? `Among 100 peers, your child ranks at the ${percentile}th percentile. Status: ${position}.` : `같은 나이 100명 중 ${percentile}번째 위치입니다. 평가: ${position}.`}</p>
        </div>
      `;
    });

    peerHTML = `
      <div class="section">
        <div class="section-header">
          <div class="section-icon" style="background: #FCE7F3;">👥</div>
          <h2>${isEnglish ? 'Peer Comparison' : '또래 비교 분석'}</h2>
        </div>
        ${peerRows}
      </div>
    `;
  }

  // Progress summary
  let progressHTML = '';
  if (progressSummary.totalRecords > 0) {
    const improved = (progressSummary.improvedDimensions || []).join(', ') || (isEnglish ? 'None detected' : '해당 없음');
    const declined = (progressSummary.declinedDimensions || []).join(', ') || (isEnglish ? 'None detected' : '해당 없음');
    const stable = (progressSummary.stableDimensions || []).join(', ') || (isEnglish ? 'None detected' : '해당 없음');

    progressHTML = `
      <div class="section">
        <div class="section-header">
          <div class="section-icon" style="background: #D1FAE5;">📈</div>
          <h2>${isEnglish ? 'Progress Summary' : '변화 추적 요약'}</h2>
        </div>
        <div class="insight-card" style="border-left: 3px solid #059669;">
          <h4>🟢 ${isEnglish ? 'Improved Areas' : '개선된 영역'}</h4>
          <p>${improved}</p>
        </div>
        <div class="insight-card" style="border-left: 3px solid #D97706;">
          <h4>🟡 ${isEnglish ? 'Stable Areas' : '안정 유지 영역'}</h4>
          <p>${stable}</p>
        </div>
        ${(progressSummary.declinedDimensions || []).length > 0 ? `
        <div class="insight-card" style="border-left: 3px solid #DC2626;">
          <h4>🔴 ${isEnglish ? 'Areas Needing Attention' : '주의 필요 영역'}</h4>
          <p>${declined}</p>
        </div>` : ''}
      </div>
    `;
  }

  // AI sections summary (from the main report)
  let aiSectionsHTML = '';
  const sections = reportData?.sections || [];
  if (sections.length > 0) {
    // Pick key sections: home guide and summary
    const homeGuide = sections.find((s: any) => s.title?.includes('가정') || s.title?.includes('Family') || s.title?.includes('Home'));
    const summary = sections.find((s: any) => s.title?.includes('요약') || s.title?.includes('Summary') || s.title?.includes('제언'));
    
    if (homeGuide) {
      aiSectionsHTML += `
        <div class="section page-break">
          <div class="section-header">
            <div class="section-icon" style="background: #D1FAE5;">🏠</div>
            <h2>${homeGuide.title}</h2>
          </div>
          <div class="ai-content">${homeGuide.content}</div>
        </div>
      `;
    }
    
    if (summary) {
      aiSectionsHTML += `
        <div class="section">
          <div class="section-header">
            <div class="section-icon" style="background: #DBEAFE;">📋</div>
            <h2>${summary.title}</h2>
          </div>
          <div class="ai-content">${summary.content}</div>
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'ko'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AIHPRO ${userName} ${sessionLabel} ${isEnglish ? 'Report' : '리포트'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans KR', -apple-system, sans-serif; background: #fff; color: #1F2937; line-height: 1.8; font-size: 14px; }
  .report { max-width: 800px; margin: 0 auto; padding: 40px 32px; }
  .cover { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%); border-radius: 24px; margin-bottom: 40px; border: 1px solid #E5E7EB; }
  .cover-badge { display: inline-block; background: #2563EB; color: white; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 16px; }
  .cover h1 { font-size: 28px; font-weight: 800; color: #111827; margin-bottom: 8px; line-height: 1.4; }
  .cover .subtitle { font-size: 15px; color: #4B5563; margin-bottom: 24px; }
  .cover-meta { display: flex; justify-content: center; gap: 24px; font-size: 13px; color: #6B7280; flex-wrap: wrap; }
  .section { margin-bottom: 36px; page-break-inside: avoid; }
  .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #E5E7EB; }
  .section-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .section-header h2 { font-size: 18px; font-weight: 700; color: #111827; }
  .section-header .badge { margin-left: auto; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 12px; }
  .score-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
  .score-main { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
  .score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; font-size: 28px; flex-shrink: 0; border: 3px solid; }
  .score-circle small { font-size: 10px; font-weight: 500; }
  .score-info h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .score-info p { font-size: 13px; color: #4B5563; }
  .gauge-container { margin-bottom: 14px; }
  .gauge-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .gauge-label span:first-child { font-size: 13px; font-weight: 600; color: #374151; }
  .gauge-label span:last-child { font-size: 12px; font-weight: 700; }
  .gauge-track { height: 10px; background: #E5E7EB; border-radius: 5px; overflow: hidden; }
  .gauge-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
  .expert-box { background: #FAFBFF; border: 1px solid #E0E7FF; border-left: 4px solid #2563EB; border-radius: 12px; padding: 20px; margin: 16px 0; }
  .expert-box .label { font-size: 11px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .expert-box p { font-size: 13.5px; line-height: 1.9; color: #374151; margin-bottom: 8px; }
  .expert-box p:last-child { margin-bottom: 0; }
  .insight-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
  .insight-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .insight-card p { font-size: 13px; line-height: 1.85; color: #4B5563; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .stat-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; text-align: center; }
  .stat-card .value { font-size: 24px; font-weight: 800; }
  .stat-card .label { font-size: 11px; color: #6B7280; margin-top: 4px; }
  .ai-content { font-size: 13.5px; line-height: 1.9; color: #374151; }
  .ai-content h3, .ai-content h4 { font-size: 15px; font-weight: 700; margin: 16px 0 8px; color: #111827; }
  .ai-content ul, .ai-content ol { padding-left: 20px; margin: 8px 0; }
  .ai-content li { margin-bottom: 6px; }
  .disclaimer { margin-top: 40px; padding: 20px; background: #F9FAFB; border-radius: 12px; border: 1px solid #E5E7EB; }
  .disclaimer p { font-size: 11px; color: #6B7280; line-height: 1.7; }
  .brand-footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
  .brand-footer .logo { font-size: 16px; font-weight: 800; color: #2563EB; }
  .brand-footer p { font-size: 11px; color: #6B7280; margin-top: 4px; }
  .page-break { page-break-before: always; margin-top: 40px; }
  @media print { .report { padding: 20px; } .page-break { page-break-before: always; } }
</style>
</head>
<body>
<div class="report">

<!-- Cover -->
<div class="cover">
  <div class="cover-badge">${sessionLabel} · ${sessionDescription}</div>
  <h1>${userName}${isEnglish ? "'s" : ' 님의'}<br>${isEnglish ? 'Comprehensive Analysis Report' : '심층 분석 리포트'}</h1>
  <p class="subtitle">${isEnglish ? `Based on ${totalDataPoints} data points across ${Object.keys(dataCounts).filter(k => dataCounts[k] > 0).length} analysis sources` : `${Object.keys(dataCounts).filter(k => dataCounts[k] > 0).length}가지 데이터 소스 · ${totalDataPoints}개 데이터 포인트 기반 전문가 심층 분석`}</p>
  <div class="cover-meta">
    <span>📅 ${formatDate(new Date().toISOString(), isEnglish)}</span>
    ${userAge ? `<span>👤 ${isEnglish ? `Age ${userAge}` : `만 ${userAge}세`}</span>` : ''}
    <span>📊 ${isEnglish ? `${dataSpanDays} days tracked` : `${dataSpanDays}일간 데이터 추적`}</span>
  </div>
</div>

<!-- Overall Summary -->
<div class="section">
  <div class="section-header">
    <div class="section-icon" style="background: ${riskBadge.bg};">📋</div>
    <h2>${isEnglish ? 'Overall Status at a Glance' : '한눈에 보는 종합 상태'}</h2>
    <span class="badge" style="background: ${riskBadge.bg}; color: ${riskBadge.color};">${riskBadge.label}</span>
  </div>
  
  <div class="score-card">
    <div class="score-main">
      <div class="score-circle" style="color: ${riskBadge.color}; border-color: ${riskBadge.color}; background: ${riskBadge.bg};">
        ${riskGauge.score}
        <small>/${riskGauge.maxScore}</small>
      </div>
      <div class="score-info">
        <h3>${isEnglish ? 'Overall Wellness Score' : '정서건강 종합 점수'}</h3>
        <p>${isEnglish 
          ? `Analysis based on ${totalDataPoints} data points collected over ${dataSpanDays} days.`
          : `${dataSpanDays}일간 수집된 ${totalDataPoints}개 데이터 포인트를 기반으로 분석한 결과입니다.`}</p>
      </div>
    </div>
  </div>
</div>

<!-- Data Sources -->
<div class="section">
  <div class="section-header">
    <div class="section-icon" style="background: #EDE9FE;">🔬</div>
    <h2>${isEnglish ? 'Analysis Data Sources' : '분석에 사용된 데이터'}</h2>
  </div>
  <p style="font-size: 13.5px; color: #6B7280; margin-bottom: 16px;">
    ${isEnglish
      ? 'Multiple independent data sources were cross-analyzed for a comprehensive and reliable assessment.'
      : '여러 독립적인 데이터 소스를 교차 분석하여 종합적이고 신뢰도 높은 평가를 수행했습니다.'}
  </p>
  <div class="grid-3">
    ${dataSourceHTML}
  </div>
</div>

<!-- Domain Analysis -->
<div class="section page-break">
  <div class="section-header">
    <div class="section-icon" style="background: #DBEAFE;">📊</div>
    <h2>${isEnglish ? 'Detailed Domain Analysis' : '영역별 상세 분석'}</h2>
  </div>
  ${domainSectionsHTML || `<p style="font-size: 13px; color: #6B7280;">${isEnglish ? 'Domain data will appear after assessments are completed.' : '검사 데이터가 쌓이면 영역별 분석이 표시됩니다.'}</p>`}
</div>

<!-- Comparison (multi-session) -->
${comparisonHTML}

<!-- Peer Comparison -->
${peerHTML}

<!-- Cognitive Training -->
${cognitiveHTML}

<!-- Cross-Correlation -->
${correlationHTML}

<!-- Progress Summary -->
${progressHTML}

<!-- AI-Generated Sections (Home Guide + Summary) -->
${aiSectionsHTML}

<!-- Disclaimer -->
<div class="disclaimer">
  <p>⚠️ <strong>${isEnglish ? 'Notice' : '안내사항'}</strong><br>
  ${isEnglish
    ? 'This report is generated by the AIHPRO Expert Analysis Engine and does not replace professional medical diagnosis. Please consult qualified healthcare professionals for accurate diagnosis and treatment.'
    : '본 리포트는 AIHPRO 전문가 심층분석 엔진을 기반으로 작성되었으며, 의학적 진단을 대체하지 않습니다. 정확한 진단과 치료는 반드시 전문 의료기관을 통해 받으시기 바랍니다.'}</p>
</div>

<div class="brand-footer">
  <div class="logo">AIHPRO</div>
  <p>${isEnglish ? 'Expert Analysis Report · aihpro.com' : '전문가 심층 분석 리포트 · aihpro.com'}</p>
</div>

</div>
</body>
</html>`;
}

// ── React Component ──
const ParentReportRenderer: React.FC<ParentReportRendererProps> = ({
  reportData, userName, userAge = 0, gender = '',
}) => {
  const { isEnglish } = useLanguage();

  const htmlContent = useMemo(() => {
    return generateParentReportHTML(reportData, userName, userAge, gender, isEnglish);
  }, [reportData, userName, userAge, gender, isEnglish]);

  const handleDownloadHTML = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIHPRO_${userName}_${isEnglish ? 'report' : '리포트'}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleDownloadHTML}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          📥 {isEnglish ? 'Download Report (HTML)' : '리포트 다운로드 (HTML)'}
        </button>
      </div>
      <iframe
        srcDoc={htmlContent}
        className="w-full border border-border rounded-xl shadow-sm"
        style={{ height: '80vh', minHeight: '600px' }}
        title="Parent Report"
      />
    </div>
  );
};

export { generateParentReportHTML };
export default ParentReportRenderer;
