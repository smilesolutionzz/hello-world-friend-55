import React, { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatReportContent } from './reportContentUtils';

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
  return dim.charAt(0).toUpperCase() + dim.slice(1).replace(/([A-Z])/g, ' $1');
}

// ── Clean AI section content ──
function cleanAIContent(content: string): string {
  return formatReportContent(content);
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

// ── Age-appropriate developmental context generator ──
function generateDevelopmentalIntro(userAge: number, gender: string, isEnglish: boolean): string {
  if (!userAge || userAge <= 0) return '';

  let ageGroup = '';
  let devFocus = '';
  let keyAreas = '';
  let emotionalNote = '';

  if (isEnglish) {
    if (userAge <= 2) {
      ageGroup = 'Infant/Toddler (0-2)';
      devFocus = 'sensory-motor development, attachment formation, and early communication';
      keyAreas = 'Motor milestones, social smile, babbling/first words, separation anxiety patterns';
      emotionalNote = 'At this age, emotional regulation is primarily dependent on caregiver responsiveness. Secure attachment is the foundation for all future development.';
    } else if (userAge <= 5) {
      ageGroup = 'Early Childhood (3-5)';
      devFocus = 'language explosion, social play, emotional identification, and self-regulation';
      keyAreas = 'Vocabulary growth, peer interaction, imaginative play, following rules, emotional expression';
      emotionalNote = 'This is a critical period for developing emotional vocabulary and learning to manage frustration. Play-based assessment provides the most accurate developmental picture.';
    } else if (userAge <= 9) {
      ageGroup = 'Middle Childhood (6-9)';
      devFocus = 'academic foundations, peer relationships, self-concept, and executive function';
      keyAreas = 'Reading/math skills, friendship formation, attention span, rule comprehension, self-esteem';
      emotionalNote = 'School entry marks a major transition. Academic performance, social belonging, and self-efficacy become interlinked developmental priorities.';
    } else if (userAge <= 12) {
      ageGroup = 'Late Childhood (10-12)';
      devFocus = 'abstract thinking, identity formation, and pre-adolescent emotional changes';
      keyAreas = 'Critical thinking, moral reasoning, body image, peer pressure management';
      emotionalNote = 'Pre-adolescence brings increased self-awareness and sensitivity to social evaluation. Early signs of mood or anxiety difficulties may emerge.';
    } else if (userAge <= 18) {
      ageGroup = 'Adolescence (13-18)';
      devFocus = 'identity development, emotional independence, and future planning';
      keyAreas = 'Identity exploration, emotional regulation, academic stress, peer/romantic relationships';
      emotionalNote = 'Adolescence is characterized by significant brain reorganization. Mood variability and risk-taking behavior are developmentally normative but require monitoring.';
    } else {
      ageGroup = 'Adult (19+)';
      devFocus = 'stress management, emotional well-being, and life satisfaction';
      keyAreas = 'Work-life balance, relationship quality, stress coping, self-care practices';
      emotionalNote = 'Adult mental health assessment focuses on current functioning, coping mechanisms, and the impact of life stressors on overall well-being.';
    }
  } else {
    if (userAge <= 2) {
      ageGroup = '영아기 (0~2세)';
      devFocus = '감각-운동 발달, 애착 형성, 초기 의사소통 능력';
      keyAreas = '대근육·소근육 발달, 사회적 미소, 옹알이/첫 단어, 분리불안 양상';
      emotionalNote = '이 시기의 정서 조절은 주 양육자의 반응성에 크게 의존합니다. 안정 애착은 이후 모든 발달의 토대가 됩니다.';
    } else if (userAge <= 5) {
      ageGroup = '유아기 (3~5세)';
      devFocus = '언어 폭발기, 사회적 놀이, 감정 인식, 자기 조절력';
      keyAreas = '어휘 성장, 또래 상호작용, 상상놀이, 규칙 이해, 감정 표현';
      emotionalNote = '감정 어휘를 발달시키고 좌절감을 관리하는 법을 배우는 결정적 시기입니다. 놀이 기반 평가가 가장 정확한 발달 상태를 보여줍니다.';
    } else if (userAge <= 9) {
      ageGroup = '학령기 (6~9세)';
      devFocus = '학업 기초, 또래 관계, 자기 개념, 실행 기능';
      keyAreas = '읽기·수학 능력, 우정 형성, 집중력, 규칙 이해, 자존감';
      emotionalNote = '학교 입학은 큰 전환점입니다. 학업 성취, 사회적 소속감, 자기효능감이 서로 연결된 핵심 발달 과제가 됩니다.';
    } else if (userAge <= 12) {
      ageGroup = '전사춘기 (10~12세)';
      devFocus = '추상적 사고, 정체성 형성, 사춘기 이전 정서 변화';
      keyAreas = '비판적 사고, 도덕적 판단, 신체 이미지, 또래 압력 대처';
      emotionalNote = '전사춘기에는 자기 인식이 높아지고 사회적 평가에 대한 민감성이 증가합니다. 기분이나 불안 문제의 초기 징후가 나타날 수 있습니다.';
    } else if (userAge <= 18) {
      ageGroup = '청소년기 (13~18세)';
      devFocus = '정체성 발달, 정서적 독립, 미래 계획';
      keyAreas = '정체성 탐색, 감정 조절, 학업 스트레스, 또래·이성 관계';
      emotionalNote = '청소년기는 뇌의 대대적 재구성이 일어나는 시기입니다. 기분 변동과 위험 감수 행동은 발달적으로 정상이지만 모니터링이 필요합니다.';
    } else {
      ageGroup = '성인 (19세 이상)';
      devFocus = '스트레스 관리, 정서적 안녕, 삶의 만족도';
      keyAreas = '일-생활 균형, 대인관계, 스트레스 대처, 자기 돌봄';
      emotionalNote = '성인 심리 평가는 현재 기능 수준, 대처 메커니즘, 생활 스트레서가 전반적 안녕에 미치는 영향에 초점을 맞춥니다.';
    }
  }

  const genderLabel = gender === 'male' ? (isEnglish ? 'Male' : '남') : gender === 'female' ? (isEnglish ? 'Female' : '여') : '';

  return `
    <div class="section">
      <div class="section-header">
        <div class="section-number">00</div>
        <h2>${isEnglish ? 'Developmental Context' : '발달 단계별 맥락 분석'}</h2>
        <span class="badge" style="background: #EFF6FF; color: #2563EB;">${isEnglish ? `Age ${userAge}` : `만 ${userAge}세`}${genderLabel ? ` · ${genderLabel}` : ''}</span>
      </div>
      <div class="expert-box" style="border-left-color: #6366F1;">
        <div class="label">${isEnglish ? `${ageGroup} — Key Developmental Focus` : `${ageGroup} — 핵심 발달 과제`}</div>
        <p><strong>${isEnglish ? 'Focus Areas:' : '주요 발달 영역:'}</strong> ${devFocus}</p>
        <p><strong>${isEnglish ? 'Key Indicators:' : '핵심 지표:'}</strong> ${keyAreas}</p>
        <p style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E0E7FF;">${emotionalNote}</p>
      </div>
    </div>
  `;
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
  
  // Fallback: merge dataSourceCounts from preprocessedData AND reportData.dataSource
  const ppCounts = pp?.dataSourceCounts || {};
  const dsCounts = reportData?.dataSource || {};
  const dataCounts: Record<string, number> = {
    assessments: ppCounts.assessments || dsCounts.assessments || 0,
    observations: ppCounts.observations || dsCounts.observations || 0,
    observationSessions: ppCounts.observationSessions || dsCounts.observationSessions || 0,
    chatMessages: ppCounts.chatMessages || dsCounts.chatMessages || 0,
    progressTracking: ppCounts.progressTracking || 0,
    videoAnalysis: ppCounts.videoAnalysis || 0,
    brainTraining: ppCounts.brainTraining || 0,
    concernStorage: ppCounts.concernStorage || 0,
  };
  
  const progressSummary = pp?.progressSummary || {};
  const peerComparison = pp?.peerComparison || {};
  const reportComparison = pp?.reportComparison || {};
  const activeSourceCount = Object.values(dataCounts).filter(v => v > 0).length;
  const totalDataPoints = pp?.totalDataPoints || dsCounts.totalDataCount || Object.values(dataCounts).reduce((a, b) => a + b, 0);
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
    
    const trendIcon = trendDir === 'improving' ? '▲' : trendDir === 'declining' ? '▼' : '—';
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
          <h4>${getDimensionLabel(c.category, isEnglish)} <span style="color: ${changeColor}; font-size: 12px;">(${changeSign}${c.change}%)</span></h4>
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
           <div class="section-number">04</div>
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

  // Build data source infographic with icons
  const dataSourceConfig: Record<string, { label: string; labelEn: string; color: string }> = {
    assessments: { label: '심리검사', labelEn: 'Assessments', color: '#6366F1' },
    observations: { label: '관찰일지', labelEn: 'Observations', color: '#8B5CF6' },
    observationSessions: { label: 'AI 관찰 분석', labelEn: 'AI Analysis', color: '#A855F7' },
    chatMessages: { label: '음성 상담', labelEn: 'Counseling', color: '#EC4899' },
    brainTraining: { label: '게임 상담', labelEn: 'Game Assessment', color: '#F59E0B' },
    videoAnalysis: { label: 'AI 영상 분석', labelEn: 'Video Analysis', color: '#14B8A6' },
    concernStorage: { label: '고민 기록', labelEn: 'Concerns', color: '#F97316' },
    progressTracking: { label: '변화 추적', labelEn: 'Progress', color: '#059669' },
  };
  
  let dataSourceHTML = '';
  Object.entries(dataCounts).forEach(([key, count]) => {
    const cfg = dataSourceConfig[key];
    if (count && Number(count) > 0 && cfg) {
      dataSourceHTML += `
        <div class="stat-card" style="border-top: 3px solid ${cfg.color};">
          <div class="value" style="color: ${cfg.color};">${count}</div>
          <div class="label">${isEnglish ? cfg.labelEn : cfg.label}</div>
        </div>
      `;
    }
  });

  // Cognitive training section
  let cognitiveHTML = '';
  if (cognitive.totalSessions > 0) {
    let gameRows = '';
    (cognitive.gameTypeScores || []).slice(0, 4).forEach((g: any) => {
      const tIcon = g.trend === 'improving' ? '▲' : g.trend === 'declining' ? '▼' : '—';
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
          <div class="section-number">05</div>
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
          <div class="label">${isEnglish ? 'Expert Commentary' : '전문가 해설'}</div>
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
          <h4>${c.sources}</h4>
          <p>${c.insight}</p>
        </div>
      `;
    });

    correlationHTML = `
      <div class="section">
        <div class="section-header">
           <div class="section-number">06</div>
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
          <h4>${getDimensionLabel(dim, isEnglish)} · ${isEnglish ? 'Percentile' : '백분위'} ${percentile}%</h4>
          <p>${isEnglish ? `Among 100 peers, your child ranks at the ${percentile}th percentile. Status: ${position}.` : `같은 나이 100명 중 ${percentile}번째 위치입니다. 평가: ${position}.`}</p>
        </div>
      `;
    });

    peerHTML = `
      <div class="section">
        <div class="section-header">
          <div class="section-number">07</div>
          <h2>${isEnglish ? 'Peer Comparison' : '또래 비교 분석'}</h2>
        </div>
        ${peerRows}
      </div>
    `;
  }

  // Progress summary
  let progressHTML = '';
  if (progressSummary.totalRecords > 0) {
    const improved = (progressSummary.improvedDimensions || []).map((d: string) => getDimensionLabel(d, isEnglish)).join(', ') || (isEnglish ? 'None detected' : '해당 없음');
    const declined = (progressSummary.declinedDimensions || []).map((d: string) => getDimensionLabel(d, isEnglish)).join(', ') || (isEnglish ? 'None detected' : '해당 없음');
    const stable = (progressSummary.stableDimensions || []).map((d: string) => getDimensionLabel(d, isEnglish)).join(', ') || (isEnglish ? 'None detected' : '해당 없음');

    progressHTML = `
      <div class="section">
        <div class="section-header">
          <div class="section-number">08</div>
          <h2>${isEnglish ? 'Progress Summary' : '변화 추적 요약'}</h2>
        </div>
        <div class="insight-card" style="border-left: 3px solid #059669;">
          <h4>${isEnglish ? 'Improved Areas' : '개선된 영역'}</h4>
          <p>${improved}</p>
        </div>
        <div class="insight-card" style="border-left: 3px solid #D97706;">
          <h4>${isEnglish ? 'Stable Areas' : '안정 유지 영역'}</h4>
          <p>${stable}</p>
        </div>
        ${(progressSummary.declinedDimensions || []).length > 0 ? `
        <div class="insight-card" style="border-left: 3px solid #DC2626;">
          <h4>${isEnglish ? 'Areas Needing Attention' : '주의 필요 영역'}</h4>
          <p>${declined}</p>
        </div>` : ''}
      </div>
    `;
  }

  // AI sections - include ALL sections from the full report
  let aiSectionsHTML = '';
  const sections = reportData?.sections || [];
  if (sections.length > 0) {
    sections.forEach((section: any, idx: number) => {
      const sectionNum = String(idx + 1).padStart(2, '0');
      const pageBreak = idx > 0 && idx % 2 === 0 ? 'page-break' : '';
      
      aiSectionsHTML += `
        <div class="section ${pageBreak}">
          <div class="section-header">
            <div class="section-number">${sectionNum}</div>
            <h2>${section.title}</h2>
          </div>
          <div class="ai-content">${cleanAIContent(section.content)}</div>
        </div>
      `;
    });
  }
  
  // Overall summary from reportData
  let overallSummaryHTML = '';
  if (reportData?.summary) {
    overallSummaryHTML = `
      <div class="section page-break">
        <div class="section-header">
          <div class="section-number" style="background: #D1FAE5; color: #059669;">S</div>
          <h2>${isEnglish ? 'Executive Summary & Recommendations' : '종합 요약 및 제언'}</h2>
        </div>
        <div class="expert-box" style="border-left-color: #059669;">
          <div class="label">${isEnglish ? 'AIHPRO Expert Summary' : 'AIHPRO 전문가 종합 소견'}</div>
          <div class="ai-content">${cleanAIContent(reportData.summary)}</div>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'ko'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AIHPRO ${userName} ${sessionLabel} ${isEnglish ? 'Report' : '리포트'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&family=Noto+Serif+KR:wght@400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans KR', -apple-system, sans-serif; background: #fff; color: #1F2937; line-height: 1.8; font-size: 14px; }
  .report { max-width: 800px; margin: 0 auto; padding: 40px 32px; }
  .cover { text-align: center; padding: 60px 20px 48px; margin-bottom: 48px; border-bottom: 3px solid #111827; }
  .cover-badge { display: inline-block; background: #111827; color: white; font-size: 11px; font-weight: 700; padding: 5px 16px; border-radius: 2px; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase; }
  .cover h1 { font-family: 'Noto Serif KR', serif; font-size: 32px; font-weight: 900; color: #111827; margin-bottom: 12px; line-height: 1.4; }
  .cover .subtitle { font-size: 14px; color: #6B7280; margin-bottom: 28px; letter-spacing: 0.3px; }
  .cover-meta { display: flex; justify-content: center; gap: 32px; font-size: 12px; color: #9CA3AF; flex-wrap: wrap; letter-spacing: 0.5px; }
  .section { margin-bottom: 40px; page-break-inside: avoid; }
  .section-header { display: flex; align-items: baseline; gap: 14px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #E5E7EB; }
  .section-number { font-family: 'Noto Serif KR', serif; font-size: 32px; font-weight: 900; color: #C8B88A; line-height: 1; flex-shrink: 0; }
  .section-header h2 { font-size: 18px; font-weight: 700; color: #111827; letter-spacing: -0.3px; }
  .section-header .badge { margin-left: auto; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 2px; }
  .score-card { background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 4px; padding: 24px; margin-bottom: 20px; }
  .score-main { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
  .score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; font-size: 28px; flex-shrink: 0; border: 3px solid; }
  .score-circle small { font-size: 10px; font-weight: 500; }
  .score-info h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .score-info p { font-size: 13px; color: #4B5563; }
  .gauge-container { margin-bottom: 14px; }
  .gauge-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .gauge-label span:first-child { font-size: 13px; font-weight: 600; color: #374151; }
  .gauge-label span:last-child { font-size: 12px; font-weight: 700; }
  .gauge-track { height: 8px; background: #E5E7EB; border-radius: 2px; overflow: hidden; }
  .gauge-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
  .expert-box { background: #FAFBFC; border: 1px solid #E0E7FF; border-left: 4px solid #2563EB; border-radius: 4px; padding: 20px; margin: 16px 0; }
  .expert-box .label { font-size: 11px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .expert-box p { font-size: 13.5px; line-height: 1.9; color: #374151; margin-bottom: 8px; }
  .expert-box p:last-child { margin-bottom: 0; }
  .insight-card { background: white; border: 1px solid #E5E7EB; border-radius: 4px; padding: 16px 20px; margin-bottom: 12px; }
  .insight-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; color: #111827; }
  .insight-card p { font-size: 13px; line-height: 1.85; color: #4B5563; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
  .stat-card { background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 4px; padding: 16px; text-align: center; }
  .stat-card .value { font-size: 24px; font-weight: 800; }
  .stat-card .label { font-size: 11px; color: #6B7280; margin-top: 4px; letter-spacing: 0.3px; }
  .ai-content { font-size: 13.5px; line-height: 1.9; color: #374151; }
  .ai-content h3, .ai-content h4 { font-size: 15px; font-weight: 700; margin: 16px 0 8px; color: #111827; }
  .ai-content ul, .ai-content ol { padding-left: 20px; margin: 8px 0; }
  .ai-content li { margin-bottom: 6px; }
  .tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .tag { display: inline-block; background: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 2px; padding: 4px 12px; font-size: 12px; font-weight: 500; color: #374151; }
  
  /* ── Professional Data Table ── */
  .data-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
  .data-table thead { background: #F8F6F1; }
  .data-table th { padding: 12px 16px; text-align: left; font-weight: 700; color: #374151; border-bottom: 2px solid #C8B88A; font-size: 12px; letter-spacing: 0.3px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #F3F4F6; color: #4B5563; }
  .data-table tbody tr:hover { background: #FAFAF8; }
  .data-table .rank-badge { display: inline-block; padding: 2px 10px; border-radius: 2px; font-size: 11px; font-weight: 700; }
  .data-table .rank-1 { background: #FEF3C7; color: #92400E; }
  .data-table .rank-2 { background: #EFF6FF; color: #1E40AF; }
  .data-table .rank-3 { background: #F0FDF4; color: #166534; }
  
  /* ── CSS Bar Chart ── */
  .bar-chart { margin: 16px 0; }
  .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .bar-label { width: 100px; font-size: 12px; font-weight: 600; color: #374151; text-align: right; flex-shrink: 0; }
  .bar-track { flex: 1; height: 28px; background: #F3F4F6; border-radius: 3px; overflow: hidden; position: relative; }
  .bar-fill { height: 100%; border-radius: 3px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; transition: width 0.6s ease; }
  .bar-fill span { font-size: 11px; font-weight: 800; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  .bar-value { width: 52px; font-size: 13px; font-weight: 800; color: #111827; text-align: right; flex-shrink: 0; }
  
  /* ── KPI Cards ── */
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
  .kpi-card { background: #FAFAF8; border: 1px solid #E5E7EB; border-top: 3px solid #C8B88A; border-radius: 4px; padding: 20px 16px; }
  .kpi-card .kpi-label { font-size: 11px; color: #9CA3AF; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
  .kpi-card .kpi-value { font-family: 'Noto Serif KR', serif; font-size: 28px; font-weight: 900; color: #111827; line-height: 1.2; }
  .kpi-card .kpi-sub { font-size: 12px; color: #6B7280; margin-top: 4px; }
  
  /* ── Callout Box ── */
  .callout { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 4px; padding: 16px 20px; margin: 16px 0; font-size: 13px; line-height: 1.8; color: #92400E; }
  .callout strong { color: #78350F; }
  
  .disclaimer { margin-top: 48px; padding: 20px; background: #FAFAFA; border-radius: 4px; border: 1px solid #E5E7EB; }
  .disclaimer p { font-size: 11px; color: #6B7280; line-height: 1.7; }
  .brand-footer { text-align: center; margin-top: 40px; padding-top: 24px; border-top: 2px solid #111827; }
  .brand-footer .logo { font-size: 18px; font-weight: 900; color: #111827; letter-spacing: 2px; }
  .brand-footer p { font-size: 11px; color: #9CA3AF; margin-top: 6px; letter-spacing: 0.5px; }
  .page-break { page-break-before: always; margin-top: 40px; }
  @media (max-width: 600px) { .kpi-grid { grid-template-columns: 1fr; } .grid-4 { grid-template-columns: 1fr 1fr; } .data-table { font-size: 11px; } .data-table th, .data-table td { padding: 8px 10px; } .bar-label { width: 72px; font-size: 11px; } }
  @media print { .report { padding: 20px; } .page-break { page-break-before: always; } }
</style>
</head>
<body>
<div class="report">

<!-- Cover -->
<div class="cover">
  <div class="cover-badge">${sessionLabel} · ${sessionDescription}</div>
  <h1>${userName}${isEnglish ? "'s" : ' 님의'}<br>${isEnglish ? 'Comprehensive Analysis Report' : '심층 분석 리포트'}</h1>
  <p class="subtitle">${isEnglish ? `Based on ${totalDataPoints} data points across ${activeSourceCount} analysis sources` : `${activeSourceCount}가지 데이터 소스 · ${totalDataPoints}개 데이터 포인트 기반 전문가 심층 분석`}</p>
  <div class="cover-meta">
    <span>${formatDate(new Date().toISOString(), isEnglish)}</span>
    ${userAge ? `<span>${isEnglish ? `Age ${userAge}` : `만 ${userAge}세`}</span>` : ''}
    ${dataSpanDays > 0 ? `<span>${isEnglish ? `${dataSpanDays} days tracked` : `${dataSpanDays}일간 데이터 추적`}</span>` : ''}
  </div>
</div>

<!-- Age-Appropriate Developmental Context -->
${generateDevelopmentalIntro(userAge, gender, isEnglish)}

<!-- Overall Summary -->
<div class="section">
  <div class="section-header">
    <div class="section-number">01</div>
    <h2>${isEnglish ? 'Overall Status at a Glance' : '한눈에 보는 종합 상태'}</h2>
    <span class="badge" style="background: ${riskBadge.bg}; color: ${riskBadge.color};">${riskBadge.label}</span>
  </div>
  
  <!-- KPI Summary Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">${isEnglish ? 'Wellness Score' : '종합 점수'}</div>
      <div class="kpi-value" style="color: ${riskBadge.color};">${riskGauge.score}<span style="font-size: 14px; color: #9CA3AF;">/${riskGauge.maxScore}</span></div>
      <div class="kpi-sub">${riskBadge.label}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${isEnglish ? 'Data Points' : '분석 데이터'}</div>
      <div class="kpi-value">${totalDataPoints}</div>
      <div class="kpi-sub">${isEnglish ? `${activeSourceCount} sources` : `${activeSourceCount}개 소스 교차 분석`}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${isEnglish ? 'Tracking Period' : '추적 기간'}</div>
      <div class="kpi-value">${dataSpanDays > 0 ? dataSpanDays : '-'}<span style="font-size: 14px; color: #9CA3AF;">${dataSpanDays > 0 ? (isEnglish ? ' days' : '일') : ''}</span></div>
      <div class="kpi-sub">${isEnglish ? `Session ${reportNumber}` : `${reportNumber}회차 분석`}</div>
    </div>
  </div>
  
  ${radarData.length > 0 ? `
  <!-- Domain Score Bar Chart -->
  <div class="bar-chart">
    ${radarData.map((d: any) => {
      const pct = Math.round((d.score / (d.maxScore || 100)) * 100);
      const color = getScoreColor(pct);
      const dimLabel = getDimensionLabel(d.dimension, isEnglish);
      return `
      <div class="bar-row">
        <div class="bar-label">${dimLabel}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${pct}%; background: ${color};">
            ${pct >= 20 ? `<span>${pct}%</span>` : ''}
          </div>
        </div>
        <div class="bar-value" style="color: ${color};">${d.score}/${d.maxScore}</div>
      </div>`;
    }).join('')}
  </div>
  
  <!-- Domain Summary Table -->
  <table class="data-table">
    <thead>
      <tr>
        <th>${isEnglish ? 'Domain' : '영역'}</th>
        <th>${isEnglish ? 'Score' : '점수'}</th>
        <th>${isEnglish ? 'Percentage' : '비율'}</th>
        <th>${isEnglish ? 'Level' : '수준'}</th>
        <th>${isEnglish ? 'Priority' : '우선순위'}</th>
      </tr>
    </thead>
    <tbody>
      ${[...radarData].sort((a: any, b: any) => {
        const pctA = (a.score / (a.maxScore || 100)) * 100;
        const pctB = (b.score / (b.maxScore || 100)) * 100;
        return pctB - pctA;
      }).map((d: any, idx: number) => {
        const pct = Math.round((d.score / (d.maxScore || 100)) * 100);
        const label = getScoreLabel(pct, isEnglish);
        const color = getScoreColor(pct);
        const dimLabel = getDimensionLabel(d.dimension, isEnglish);
        const rankClass = pct >= 70 ? 'rank-1' : pct >= 50 ? 'rank-2' : 'rank-3';
        const priority = pct >= 70 ? (isEnglish ? 'Urgent' : '1순위') : pct >= 50 ? (isEnglish ? 'Monitor' : '2순위') : (isEnglish ? 'Maintain' : '유지');
        return `
        <tr>
          <td style="font-weight: 600;">${dimLabel}</td>
          <td>${d.score}/${d.maxScore}</td>
          <td style="font-weight: 700; color: ${color};">${pct}%</td>
          <td><span style="color: ${color}; font-weight: 600;">${label}</span></td>
          <td><span class="rank-badge ${rankClass}">${priority}</span></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  ` : ''}
  
  ${radarData.length > 0 ? `
  <div class="callout">
    ${(() => {
      const highDomains = radarData.filter((d: any) => Math.round((d.score / (d.maxScore || 100)) * 100) >= 70);
      const normalDomains = radarData.filter((d: any) => Math.round((d.score / (d.maxScore || 100)) * 100) < 30);
      if (highDomains.length > 0) {
        const names = highDomains.map((d: any) => getDimensionLabel(d.dimension, isEnglish)).join(', ');
        return isEnglish
          ? `<strong>${names}</strong> ${highDomains.length > 1 ? 'are' : 'is'} showing elevated scores. Prioritizing support in ${highDomains.length > 1 ? 'these areas' : 'this area'} is recommended.`
          : `<strong>${names}</strong> 영역이 높은 점수를 보이고 있습니다. 해당 영역에 대한 <strong>우선적 지원</strong>이 권장됩니다.`;
      }
      if (normalDomains.length > 0) {
        return isEnglish
          ? 'All domains are within normal ranges. Continue current supportive practices.'
          : '전체적으로 양호한 수준입니다. 현재의 지원 방식을 유지하시기 바랍니다.';
      }
      return isEnglish ? 'Detailed domain analysis is shown below.' : '아래에서 각 영역별 상세 분석을 확인하실 수 있습니다.';
    })()}
  </div>
  ` : ''}
</div>

<!-- Data Sources -->
<div class="section">
  <div class="section-header">
    <div class="section-number">02</div>
    <h2>${isEnglish ? 'Analysis Data Sources' : '분석에 사용된 데이터'}</h2>
  </div>
  <p style="font-size: 13.5px; color: #6B7280; margin-bottom: 16px;">
    ${isEnglish
      ? 'Multiple independent data sources were cross-analyzed for a comprehensive and reliable assessment.'
      : '여러 독립적인 데이터 소스를 교차 분석하여 종합적이고 신뢰도 높은 평가를 수행했습니다.'}
  </p>
  <div class="grid-4">
    ${dataSourceHTML}
  </div>
</div>

<!-- Domain Analysis -->
<div class="section page-break">
  <div class="section-header">
    <div class="section-number">03</div>
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

<!-- AI Expert Analysis Sections -->
${aiSectionsHTML}

<!-- Executive Summary -->
${overallSummaryHTML}

<!-- Disclaimer -->
<div class="disclaimer">
  <p><strong>${isEnglish ? 'Notice' : '안내사항'}</strong><br>
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
          {isEnglish ? 'Download Report (HTML)' : '리포트 다운로드 (HTML)'}
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
