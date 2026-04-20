// Score-based detailed fallback when AI analysis is unavailable.
// Never returns a generic "전문가 상담을 권장합니다" — always builds a structured,
// data-driven clinical-style narrative from the actual scores.

interface FallbackDomain {
  label?: string;
  name?: string;
  domain?: string;
  score?: number;        // either raw or percentage
  maxScore?: number;
  percentage?: number;
  level?: string;
}

interface FallbackInput {
  testLabel: string;             // e.g. "학습장애 검사", "발달지연 검사"
  total?: number;
  average?: number;
  severity?: string;
  ageGroup?: string;
  domains?: FallbackDomain[];
  isEnglish?: boolean;
}

const pct = (d: FallbackDomain): number => {
  if (typeof d.percentage === 'number') return d.percentage;
  if (typeof d.score === 'number' && typeof d.maxScore === 'number' && d.maxScore > 0) {
    return Math.round((d.score / d.maxScore) * 100);
  }
  return Number(d.score ?? 0);
};

const labelOf = (d: FallbackDomain) => d.label ?? d.name ?? d.domain ?? '영역';

export function buildScoreBasedFallback(input: FallbackInput): string {
  const { testLabel, total = 0, average = 0, severity = '보통', ageGroup = '', domains = [], isEnglish } = input;

  const sorted = [...domains].sort((a, b) => pct(b) - pct(a));
  const top = sorted.slice(0, 3);
  const low = [...sorted].reverse().slice(0, 3);

  const sev = severity.toLowerCase();
  const isHigh = /high|위험|심각|severe|중증/.test(sev);
  const isMid = /mod|중간|보통|경미|mild/.test(sev);
  const sevLabel = isHigh ? '높은 주의가 필요한 수준' : isMid ? '관리가 필요한 중간 수준' : '대체로 안정적인 수준';

  if (isEnglish) {
    return `## 1. Comprehensive Assessment
Your **${testLabel}** results show a total of **${total}** (avg ${average.toFixed(1)}), classified as **${severity}** for the ${ageGroup} group. The pattern suggests ${isHigh ? 'meaningful clinical attention is warranted' : isMid ? 'targeted self-management can produce visible change' : 'a stable baseline with room for optimization'}.

## 2. Domain Analysis
${domains.length ? domains.map(d => `- **${labelOf(d)}**: ${pct(d)}% (${d.level ?? '-'})`).join('\n') : '- Detailed domain data not provided.'}

Areas of highest load: ${top.map(d => `**${labelOf(d)}** (${pct(d)}%)`).join(', ') || 'n/a'}.
Stable strengths: ${low.map(d => `**${labelOf(d)}** (${pct(d)}%)`).join(', ') || 'n/a'}.

## 3. Hidden Strengths
The stable areas above are not just "no-problem zones" — they are the leverage points. Coping habits, routines, and relational skills you already use there can be deliberately transferred to the high-load domains.

## 4. Risk Signals
${isHigh
  ? 'If the current pattern persists for 2+ weeks, expect cumulative effects on sleep, focus, and relationships. A professional baseline evaluation is recommended.'
  : 'Day-to-day functioning is intact. Watch for sudden environmental stressors that could amplify the high-load domain.'}

## 5. Action Plan (start today)
1. Log triggers in the high-load domain for 5 min/day (trigger → response → outcome)
2. Lock in 3+ weekly sessions of your strongest stable activity
3. Stabilize sleep window within ±30 min
4. 10 min of physical movement daily
5. Verbalize state to one trusted person weekly

## 6. Professional Guidance
${isHigh
  ? 'Consider a one-time clinical evaluation; short-term CBT-style coaching is often effective at this score range.'
  : 'Self-tracking is sufficient now; revisit if no improvement in 30 days.'}

## 7. 📋 Summary
- Status: ${sevLabel} · main load = ${labelOf(top[0] ?? {})}
- Use the 30-day Mind Track to compare baseline → day 14 → day 30 numerically.
- Scores are a starting point for change, not a verdict on you.`;
  }

  return `## 1. 종합 평가 및 점수 해석
이번 **${testLabel}** 결과는 총점 **${total}점**, 평균 **${average.toFixed(1)}점**으로 ${sevLabel}으로 분석됩니다. ${ageGroup ? `${ageGroup} 연령대 기준` : '일반 기준'}에서 볼 때, ${isHigh ? '현재 패턴이 일정 기간 누적될 경우 일상 기능에 분명한 영향이 예상됩니다' : isMid ? '즉각적 개입이 필수적인 단계는 아니지만, 일상 속 작은 변화를 만들기에 가장 적절한 시점입니다' : '전반적으로 안정적이지만, 더 나은 균형을 만들 여지가 충분합니다'}. 점수 자체보다 중요한 것은 어떤 영역에서 균형이 흔들리고 있는가이며, 이번 결과는 그 단서를 명확히 보여주고 있습니다.

## 2. 영역별 상세 분석
${domains.length
  ? domains.map(d => `- **${labelOf(d)}**: ${pct(d)}% (${d.level ?? '-'})`).join('\n')
  : '- 영역 세부 데이터가 제공되지 않아 총점 기반으로만 해석합니다.'}

가장 높은 부담을 보인 영역은 ${top.map(d => `**${labelOf(d)}** (${pct(d)}%)`).join(', ') || '없음'}이며, 이는 현재 스트레스나 어려움이 집중되는 지점입니다. 반대로 ${low.map(d => `**${labelOf(d)}** (${pct(d)}%)`).join(', ') || '없음'} 영역은 상대적으로 안정적이며, 회복 자원으로 활용할 수 있는 강점입니다.

## 3. 숨겨진 강점 및 잠재력
검사 결과는 어려움뿐 아니라 회복 가능성도 함께 보여줍니다. 위에서 안정적으로 나타난 영역은 단순히 '문제가 없는 곳'이 아니라, 부담 영역을 끌어올리는 지렛대입니다. 안정 영역에서 사용해 온 대처 방식(루틴, 관계, 표현 방식 등)을 부담 영역에 의식적으로 적용해 보면 변화가 빠르게 나타나는 경우가 많습니다.

## 4. 위험 요인 및 주의사항
${isHigh
  ? '현재 수준이 2주 이상 지속될 경우 수면, 집중력, 대인관계에 누적 영향을 줄 수 있습니다. 객관적 평가를 위해 전문가의 1회 평가를 권장합니다.'
  : '현재 수준에서는 일상 기능에 큰 지장은 없으나, 갑작스러운 환경 변화나 스트레스 사건이 겹치면 부담 영역이 빠르게 악화될 수 있어 자가 모니터링을 권장합니다.'}

## 5. 맞춤형 실천 전략
**지금 바로 시작할 수 있는 5가지**
1. 부담 영역과 관련된 상황을 하루 1회 5분간 기록 (트리거 → 반응 → 결과)
2. 안정 영역의 활동을 의식적으로 주 3회 이상 유지
3. 수면-기상 시간을 ±30분 이내로 고정
4. 하루 10분 신체 활동(산책·스트레칭) 확보
5. 주 1회 신뢰할 수 있는 사람과 상태를 언어로 공유

**중장기 방향**
- 30일 단위로 같은 검사를 재측정해 변화 추이 확인
- 부담 영역에 특화된 워크북·코칭 프로그램 활용
- 안정 영역을 지속 가능한 일상 루틴으로 정착

## 6. 전문가 권고사항
${isHigh
  ? '현재 점수대는 자가 관리만으로 호전이 더딜 수 있습니다. 임상심리·정신건강 전문가의 1회 평가를 권장하며, 필요 시 단기 인지행동 기반 코칭이 효과적일 수 있습니다.'
  : '현재는 자가 관리와 데이터 추적으로 충분히 관리 가능한 수준입니다. 다만 한 달간 변화가 없거나 악화된다면 전문가 상담을 고려하시기 바랍니다.'}

## 7. 📋 요약 및 제언
- 핵심 상태: ${sevLabel} · 주요 부담 영역은 ${labelOf(top[0] ?? {})}
- 즉시 실행: ① 트리거 5분 기록 ② 안정 영역 루틴화 ③ 수면 시간 고정
- 30일 마음 챌린지를 통해 baseline → 14일 → 30일 변화량을 수치로 확인하실 수 있습니다.
- 점수는 '나'를 평가하는 도구가 아니라, 변화를 설계하기 위한 출발점입니다. 작은 한 걸음이 다음 검사에서 분명한 차이로 나타날 것입니다.`;
}
