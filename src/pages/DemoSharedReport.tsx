import React, { useState } from 'react';
import SEOHead from '@/components/common/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { sanitizeAIContent } from '@/utils/sanitizeHtml';
import {
  FileText, ChevronDown, ChevronUp, Calendar, Eye, Shield,
  Brain, Heart, TrendingUp, Target, LineChart, Users, Activity, BarChart3,
  Download, Share2, Copy, Check, AlertTriangle, BookOpen, Stethoscope, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const SECTION_ICONS: Record<string, React.ElementType> = {
  Brain, Heart, TrendingUp, Target, LineChart, Users, Shield, Activity, BarChart3,
  AlertTriangle, BookOpen, Stethoscope, Sparkles
};

/* ─── 데모 리포트 데이터 (프리미엄 수준) ─── */
const DEMO_REPORTS = [
  {
    report_order: 1,
    created_at: '2026-03-15T09:00:00Z',
    total_score: 24,
    risk_level: 'medium',
    dimension_scores: {
      '우울감': 68,
      '불안': 55,
      '스트레스': 72,
      '수면 질': 45,
      '사회적 기능': 60,
      '인지 기능': 78,
      '자기효능감': 52,
      '정서 조절': 48
    },
    sections: [
      {
        title: '종합 분석 요약',
        icon: 'Brain',
        body: `<p>검사 결과, 전반적으로 <strong>경계 수준(Moderate)</strong>의 심리적 부담이 관찰됩니다. 총점 24점은 AIHPRO 심리건강 분석 기준 중등도 수준에 해당하며, 특히 <strong>스트레스 반응성(72점)</strong>과 <strong>우울감(68점)</strong> 영역에서 주의가 필요합니다.</p>
<p>인지 기능(78점)은 양호한 수준을 유지하고 있어, 현재의 심리적 부담이 인지 능력에 미치는 영향은 제한적입니다. 그러나 수면의 질(45점)이 저하되어 있어, 이로 인한 이차적 영향이 우려됩니다.</p>
<p>정서 조절 능력(48점)이 평균 이하로 측정되었으며, 이는 스트레스 상황에서 감정 폭발이나 회피 반응으로 이어질 가능성을 시사합니다. 자기효능감(52점) 또한 경계 수준으로, 현재 심리적 어려움이 자기 신뢰에도 부정적 영향을 미치고 있습니다.</p>
<p><strong>핵심 소견:</strong> 스트레스-수면 악순환 고리가 형성되어 있으며, 이것이 우울감과 정서 조절 저하의 주요 원인으로 판단됩니다. 우선적으로 수면 환경 개선과 스트레스 대처 기술 훈련이 권고됩니다.</p>`
      },
      {
        title: '영역별 상세 분석',
        icon: 'BarChart3',
        body: `<p><strong>1. 우울감 영역 (68/100)</strong></p>
<p>우울감 점수 68점은 동일 연령대 상위 28%에 해당하며, 임상적으로 <strong>중등도 수준</strong>에 속합니다. 세부 하위 요인 분석 결과:</p>
<ul>
<li><strong>무기력감:</strong> 71점 — 일상 활동에 대한 동기 저하가 뚜렷합니다</li>
<li><strong>흥미 상실:</strong> 65점 — 이전에 즐기던 활동에 대한 관심이 감소했습니다</li>
<li><strong>자기비판:</strong> 72점 — 자신에 대한 부정적 사고 패턴이 강화되어 있습니다</li>
<li><strong>신체 증상:</strong> 58점 — 식욕 변화, 피로감 등 신체적 우울 증상이 보통 수준입니다</li>
</ul>
<p>인지적 우울(무기력, 자기비판)이 신체적 우울보다 더 두드러지며, 이는 인지행동치료(CBT) 접근이 효과적일 수 있음을 시사합니다.</p>

<p><strong>2. 불안 영역 (55/100)</strong></p>
<p>불안 수준은 <strong>경미~중등도</strong> 사이에 위치합니다. 하위 요인 분석:</p>
<ul>
<li><strong>범불안:</strong> 58점 — 미래에 대한 과도한 걱정이 관찰됩니다</li>
<li><strong>사회 불안:</strong> 49점 — 대인관계 상황에서의 불안은 보통 수준입니다</li>
<li><strong>신체 불안:</strong> 52점 — 심박수 증가, 근육 긴장 등 신체 반응은 경미합니다</li>
<li><strong>공포/회피:</strong> 61점 — 특정 상황 회피 경향이 약간 높습니다</li>
</ul>

<p><strong>3. 스트레스 영역 (72/100)</strong></p>
<p>전체 영역 중 가장 높은 점수를 기록했습니다. 이는 현재 <strong>상당한 수준의 스트레스</strong>를 경험하고 있음을 의미합니다.</p>
<ul>
<li><strong>업무/학업 스트레스:</strong> 78점 — 주요 스트레스 원으로 확인됩니다</li>
<li><strong>대인관계 스트레스:</strong> 64점 — 관계에서의 갈등이 보통 수준입니다</li>
<li><strong>재정 스트레스:</strong> 70점 — 경제적 부담이 상당합니다</li>
<li><strong>자기관리 스트레스:</strong> 75점 — 개인 시간 부족, 건강 관리 소홀이 관찰됩니다</li>
</ul>

<p><strong>4. 수면 질 영역 (45/100)</strong></p>
<p>수면의 질이 <strong>현저히 낮은 수준</strong>입니다. 이는 다른 모든 영역에 부정적 영향을 미치는 핵심 요인입니다.</p>
<ul>
<li><strong>입면 잠복기:</strong> 평균 35분 이상 소요 (정상: 15분 이내)</li>
<li><strong>수면 유지:</strong> 야간 2-3회 각성이 보고됩니다</li>
<li><strong>수면 만족도:</strong> 주관적 만족도가 매우 낮습니다</li>
<li><strong>주간 기능:</strong> 낮 시간 졸음과 집중력 저하가 보고됩니다</li>
</ul>

<p><strong>5. 사회적 기능 (60/100)</strong></p>
<ul>
<li><strong>대인관계 만족:</strong> 62점 — 친밀한 관계는 유지되고 있으나 질적 저하가 시작되고 있습니다</li>
<li><strong>사회 참여:</strong> 55점 — 사교 활동 빈도가 감소하고 있습니다</li>
<li><strong>의사소통:</strong> 63점 — 기본적 소통 능력은 유지되고 있습니다</li>
</ul>

<p><strong>6. 인지 기능 (78/100)</strong></p>
<p>인지 기능은 <strong>양호한 수준</strong>을 유지하고 있어, 심리적 부담이 아직 인지 영역에는 큰 영향을 미치지 않았습니다.</p>
<ul>
<li><strong>집중력:</strong> 75점 — 약간의 저하가 관찰되나 기능적 수준입니다</li>
<li><strong>기억력:</strong> 80점 — 정상 범위입니다</li>
<li><strong>판단력:</strong> 82점 — 양호합니다</li>
<li><strong>실행 기능:</strong> 76점 — 계획 수립 능력이 유지되고 있습니다</li>
</ul>

<p><strong>7. 자기효능감 (52/100)</strong></p>
<p>자기효능감이 <strong>경계 수준</strong>으로, 목표 달성에 대한 자신감이 저하되어 있습니다. 이는 우울감과 상호작용하며 부정적 순환을 형성할 수 있습니다.</p>

<p><strong>8. 정서 조절 (48/100)</strong></p>
<p>정서 조절 능력이 <strong>평균 이하</strong>입니다. 감정 인식, 감정 표현, 충동 조절 모두에서 개선이 필요합니다.</p>
<ul>
<li><strong>감정 인식:</strong> 55점 — 자신의 감정을 인지하는 능력은 보통입니다</li>
<li><strong>감정 표현:</strong> 42점 — 감정을 적절히 표현하는 데 어려움이 있습니다</li>
<li><strong>충동 조절:</strong> 47점 — 스트레스 시 충동적 반응이 나타날 수 있습니다</li>
</ul>`
      },
      {
        title: '응답 신뢰도 분석 (4단계 검증)',
        icon: 'Shield',
        body: `<p>리포트의 임상적 활용 가능성을 판단하기 위해 <strong>4단계 응답 유효성 검증</strong>을 실시했습니다.</p>

<p><strong>Step 1. 일관성 지수 (Consistency Index)</strong></p>
<p>유사 의미의 문항 쌍 간 응답 차이를 분석합니다. 일관성 지수: <strong>0.87 (높음)</strong></p>
<ul>
<li>문항 3 ↔ 문항 15 (우울 관련): 응답 차이 0점 ✅</li>
<li>문항 7 ↔ 문항 19 (불안 관련): 응답 차이 1점 ✅</li>
<li>문항 5 ↔ 문항 12 (스트레스): 응답 차이 0점 ✅</li>
<li>문항 9 ↔ 문항 21 (수면): 응답 차이 1점 ✅</li>
</ul>
<p>→ 응답자가 문항을 충실히 읽고 일관되게 응답한 것으로 판단됩니다.</p>

<p><strong>Step 2. 극단 응답 편향 (Extreme Response Bias)</strong></p>
<p>최고점 또는 최저점만 선택한 비율: <strong>8.3% (정상 범위)</strong></p>
<ul>
<li>최고점(3점) 선택 문항: 4개 / 21개 (19.0%)</li>
<li>최저점(0점) 선택 문항: 2개 / 21개 (9.5%)</li>
<li>극단 응답 총합: 8.3% → 기준치 20% 미만 ✅</li>
</ul>

<p><strong>Step 3. 묵종 편향 (Acquiescence Bias)</strong></p>
<p>긍정형 문항에 일괄 동의하는 경향 분석: <strong>15.2% (정상)</strong></p>
<ul>
<li>역채점 문항 응답 일치율: 84.8% ✅</li>
<li>묵종 편향 지수 < 25% 기준 충족</li>
</ul>

<p><strong>Step 4. 응답 변산성 (Response Variability)</strong></p>
<p>응답의 다양성 분석: <strong>0.62 (주의)</strong></p>
<ul>
<li>⚠️ 스트레스 영역에서 응답 패턴이 다소 단조롭습니다</li>
<li>이는 해당 영역에서 모든 문항에 높은 점수를 부여한 것에 기인합니다</li>
<li>임상적 해석에 영향을 줄 정도는 아니나, 재검사 시 주의가 필요합니다</li>
</ul>

<p><strong>종합 신뢰도 판정: 85% (양호)</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;">검증 항목</th>
<th style="padding:8px;border:1px solid #e2e8f0;">수치</th>
<th style="padding:8px;border:1px solid #e2e8f0;">판정</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">일관성 지수</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.87</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">✅ 높음</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">극단 응답 편향</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">8.3%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">✅ 정상</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">묵종 편향</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">15.2%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">✅ 정상</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">응답 변산성</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.62</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">⚠️ 주의</td></tr>
</tbody></table>
<p>본 검사 결과는 <strong>참고 자료로 활용하기에 충분한 신뢰도</strong>를 갖추고 있습니다.</p>`
      },
      {
        title: '95% 신뢰구간 및 측정 오차 분석',
        icon: 'BarChart3',
        body: `<p>모든 심리 측정은 측정 오차(measurement error)를 포함합니다. 표준측정오차(SEM)를 기반으로 <strong>95% 신뢰구간(Confidence Interval)</strong>을 산출하여 점수의 실제 범위를 제시합니다.</p>

<p><strong>📐 측정 신뢰도 계수</strong></p>
<ul>
<li>Cronbach's α = 0.89 (높음)</li>
<li>SEM = σ × √(1-α) = 3.82</li>
<li>95% CI = 점수 ± 1.96 × SEM</li>
</ul>

<p><strong>📊 영역별 95% 신뢰구간</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">영역</th>
<th style="padding:8px;border:1px solid #e2e8f0;">측정값</th>
<th style="padding:8px;border:1px solid #e2e8f0;">하한</th>
<th style="padding:8px;border:1px solid #e2e8f0;">상한</th>
<th style="padding:8px;border:1px solid #e2e8f0;">해석</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">총점</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;">24</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">20.3</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">27.7</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">중등도 범위 내 안정</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">우울감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;">68</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">63.1</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">72.9</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">중등도~고위험 경계</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">불안</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;">55</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">50.8</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">59.2</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">경미~중등도</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">스트레스</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;">72</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">67.4</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">76.6</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">고위험 범위</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;">45</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">40.2</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">49.8</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">저하 상태 확정</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">정서 조절</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;">48</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">43.5</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">52.5</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">평균 이하 확정</td></tr>
</tbody></table>
<p><em>신뢰구간이 좁을수록 측정 정밀도가 높습니다. 현재 결과는 표준 수준의 정밀도를 보이며, 임상적 판단의 근거로 활용 가능합니다.</em></p>`
      },
      {
        title: '예후 시나리오 분석 (3×3 Matrix)',
        icon: 'TrendingUp',
        body: `<p>현재 점수를 기반으로 개입 수준별 향후 변화를 예측한 <strong>3×3 예후 매트릭스</strong>입니다. 이 모델은 AIHPRO의 독자적인 예측 알고리즘을 기반으로 산출됩니다.</p>

<p><strong>📈 총점 변화 예측</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:10px;border:1px solid #e2e8f0;text-align:left;">개입 수준</th>
<th style="padding:10px;border:1px solid #e2e8f0;">3개월 후</th>
<th style="padding:10px;border:1px solid #e2e8f0;">6개월 후</th>
<th style="padding:10px;border:1px solid #e2e8f0;">12개월 후</th>
</tr></thead>
<tbody>
<tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:700;">🟢 적극 개입<br/><span style="font-size:10px;color:#64748b;">전문상담 + 약물 + 자기관리</span></td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#16a34a;font-weight:600;">18점 (↓25%)</td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#16a34a;font-weight:600;">12점 (↓50%)</td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#16a34a;font-weight:600;">8점 (↓67%)</td></tr>
<tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:700;">🟡 부분 개입<br/><span style="font-size:10px;color:#64748b;">자기관리 위주 + 간헐적 상담</span></td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#ca8a04;font-weight:600;">22점 (↓8%)</td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#ca8a04;font-weight:600;">20점 (↓17%)</td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#ca8a04;font-weight:600;">16점 (↓33%)</td></tr>
<tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:700;">🔴 미개입<br/><span style="font-size:10px;color:#64748b;">현재 상태 방치</span></td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#dc2626;font-weight:600;">28점 (↑17%)</td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#dc2626;font-weight:600;">33점 (↑38%)</td>
<td style="padding:10px;border:1px solid #e2e8f0;color:#dc2626;font-weight:600;">38점 (↑58%)</td></tr>
</tbody></table>

<p><strong>📊 주요 영역별 예후 (적극 개입 시)</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0fdf4;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">영역</th>
<th style="padding:8px;border:1px solid #e2e8f0;">현재</th>
<th style="padding:8px;border:1px solid #e2e8f0;">3개월</th>
<th style="padding:8px;border:1px solid #e2e8f0;">6개월</th>
<th style="padding:8px;border:1px solid #e2e8f0;">12개월</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">우울감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">68</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">55</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">42</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">30</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">스트레스</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">72</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">58</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">45</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">35</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">45</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">58</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">70</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">78</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">정서 조절</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">48</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">55</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">65</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">72</td></tr>
</tbody></table>

<p><strong>해석:</strong> 적극적 개입(전문 상담 + 자기관리) 시 <strong>6개월 내 경미 수준으로, 12개월 내 정상 범위</strong> 진입이 기대됩니다. 특히 수면 질 개선이 가장 빠른 회복 효과를 보일 것으로 예측됩니다.</p>`
      },
      {
        title: '동일 연령대 비교 분석 (Peer Benchmarking)',
        icon: 'Users',
        body: `<p>30대 성인 기준, AIHPRO 플랫폼 이용자 데이터를 기반으로 한 <strong>또래 비교 분석</strong>입니다.</p>

<p><strong>📊 백분위 순위 (Percentile Rank)</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">영역</th>
<th style="padding:8px;border:1px solid #e2e8f0;">내 점수</th>
<th style="padding:8px;border:1px solid #e2e8f0;">동 연령 평균</th>
<th style="padding:8px;border:1px solid #e2e8f0;">백분위</th>
<th style="padding:8px;border:1px solid #e2e8f0;">해석</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">우울감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">68</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">42</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#dc2626;font-weight:700;">상위 28%</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">평균 이상 우울</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">불안</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">55</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">38</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#ca8a04;font-weight:700;">상위 35%</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">평균 이상 불안</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">스트레스</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">72</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">48</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#dc2626;font-weight:700;">상위 22%</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">높은 스트레스</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">45</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">62</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#dc2626;font-weight:700;">하위 30%</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">수면 질 저하</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">인지 기능</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">78</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">72</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">상위 65%</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">양호</td></tr>
</tbody></table>

<p><strong>🏥 전문 상담 권장 기준</strong></p>
<ul>
<li>우울감 상위 25% 이내 시 전문 상담 권장 → <strong>현재 28%로 경계선</strong></li>
<li>스트레스 상위 25% 이내 시 즉시 개입 권장 → <strong>현재 22%로 해당</strong></li>
<li>수면 질 하위 25% 이내 시 수면 클리닉 권장 → <strong>현재 30%로 근접</strong></li>
</ul>
<p><em>※ 비교 데이터: 2024-2026년 AIHPRO 30대 이용자 12,847명 기준</em></p>`
      },
      {
        title: '교차 분석 매트릭스 (Cross-Test Correlation)',
        icon: 'Activity',
        body: `<p>각 영역 간의 <strong>상관관계 분석</strong>을 통해 심리적 문제의 근본 원인과 연쇄 작용을 파악합니다.</p>

<p><strong>🔗 주요 상관관계 발견</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">영역 쌍</th>
<th style="padding:8px;border:1px solid #e2e8f0;">상관계수</th>
<th style="padding:8px;border:1px solid #e2e8f0;">강도</th>
<th style="padding:8px;border:1px solid #e2e8f0;">임상적 의미</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">스트레스 ↔ 수면 질</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#dc2626;">r = -0.82</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🔴 매우 강함</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">스트레스가 수면을 크게 방해</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">우울감 ↔ 정서 조절</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#dc2626;">r = -0.78</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🔴 강함</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">우울감이 정서 조절을 악화</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">수면 질 ↔ 인지 기능</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#ca8a04;">r = 0.65</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🟡 보통</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">수면 저하 시 인지 기능 위험</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">자기효능감 ↔ 우울감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#dc2626;">r = -0.75</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🔴 강함</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">우울-자기효능 악순환</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">사회적 기능 ↔ 불안</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#ca8a04;">r = -0.58</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🟡 보통</td><td style="padding:8px;border:1px solid #e2e8f0;font-size:11px;">불안이 사회 활동을 제한</td></tr>
</tbody></table>

<p><strong>🎯 핵심 인사이트</strong></p>
<ul>
<li><strong>1순위 개입점:</strong> 스트레스 → 수면 악순환 고리 차단이 가장 효과적</li>
<li><strong>2순위 개입점:</strong> 우울감 → 정서 조절 → 자기효능감 회복 경로</li>
<li><strong>보호 요인:</strong> 인지 기능(78점)이 아직 양호하여, 인지 기반 치료(CBT) 적용이 유리</li>
</ul>`
      },
      {
        title: '12주 맞춤형 관리 로드맵',
        icon: 'Target',
        body: `<p>현재 상태를 기반으로 설계된 <strong>12주 단계별 관리 계획</strong>입니다. 각 단계는 이전 단계의 성과를 기반으로 점진적으로 강도가 높아집니다.</p>

<p><strong>🟢 Phase 1: 기초 안정화 [1~4주]</strong></p>
<p style="font-size:11px;color:#64748b;margin-bottom:8px;">목표: 스트레스-수면 악순환 차단, 기본 루틴 확립</p>
<ul>
<li><strong>수면 위생 프로토콜:</strong>
  <ul>
  <li>취침 1시간 전 전자기기 완전 차단 (블루라이트 차단 안경 착용)</li>
  <li>취침/기상 시간 고정 (±30분 이내 유지)</li>
  <li>취침 전 10분 점진적 근이완법 실시</li>
  <li>카페인 오후 2시 이후 차단</li>
  </ul>
</li>
<li><strong>스트레스 관리:</strong>
  <ul>
  <li>매일 10분 마음챙김 호흡법 (4-7-8 기법)</li>
  <li>스트레스 일지 작성: 매일 저녁 3줄 기록</li>
  <li>주 1회 자연 속 30분 산책 (Forest Bathing)</li>
  </ul>
</li>
<li><strong>평가 지표:</strong> 수면 잠복기 25분 이내, 스트레스 점수 5% 감소</li>
</ul>

<p><strong>🟡 Phase 2: 능동적 대처 [5~8주]</strong></p>
<p style="font-size:11px;color:#64748b;margin-bottom:8px;">목표: 정서 조절 능력 강화, 사회적 기능 회복</p>
<ul>
<li><strong>운동 프로그램:</strong>
  <ul>
  <li>주 3-4회 30분 유산소 운동 (걷기, 수영, 자전거)</li>
  <li>주 2회 요가 또는 태극권 (정서 조절에 효과적)</li>
  </ul>
</li>
<li><strong>인지행동 훈련:</strong>
  <ul>
  <li>부정적 자동 사고 기록 및 반박 연습</li>
  <li>감정 일기: 감정 5단계 척도 활용</li>
  <li>행동 활성화: 즐거웠던 활동 목록 작성 후 주 2회 실행</li>
  </ul>
</li>
<li><strong>사회적 기능:</strong>
  <ul>
  <li>주 1회 이상 신뢰할 수 있는 사람과 대면 만남</li>
  <li>소규모 모임 참여 (동호회, 자조 모임)</li>
  </ul>
</li>
<li><strong>평가 지표:</strong> 우울감 10% 감소, 사회적 기능 10% 향상</li>
</ul>

<p><strong>🔵 Phase 3: 성장 및 강화 [9~12주]</strong></p>
<p style="font-size:11px;color:#64748b;margin-bottom:8px;">목표: 달성한 변화의 안정화, 재발 방지 전략 수립</p>
<ul>
<li><strong>자기효능감 강화:</strong>
  <ul>
  <li>주간 목표 설정 및 달성률 추적</li>
  <li>성취 일지 작성: 매일 작은 성공 3가지 기록</li>
  <li>자기 보상 시스템 구축</li>
  </ul>
</li>
<li><strong>재발 방지 계획:</strong>
  <ul>
  <li>조기 경고 신호 목록 작성 (수면 변화, 무기력 등)</li>
  <li>위기 시 대처 카드 제작</li>
  <li>지지 체계 점검 (가족, 친구, 전문가 연락처)</li>
  </ul>
</li>
<li><strong>2차 검사:</strong>
  <ul>
  <li>12주 후 동일 검사 재시행으로 변화 측정</li>
  <li>전문 상담 필요 여부 재평가</li>
  <li>장기 자기관리 계획 수립</li>
  </ul>
</li>
<li><strong>평가 지표:</strong> 총점 30% 이상 감소, 전 영역 경미 수준 이내</li>
</ul>`
      },
      {
        title: '참고용 전문가 소견서',
        icon: 'Stethoscope',
        body: `<div style="border:2px solid #e2e8f0;border-radius:12px;padding:20px;background:#fafafa;">
<p style="text-align:center;font-size:10px;color:#6366f1;font-weight:600;letter-spacing:3px;margin-bottom:4px;">AIHPRO.COM</p>
<p style="text-align:center;font-size:16px;font-weight:700;margin:0 0 16px 0;">심리 건강 참고 소견서 (Referral Summary)</p>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />

<p><strong>1. 기본 정보</strong></p>
<ul>
<li>검사 일시: 2026년 3월 15일</li>
<li>검사 도구: AIHPRO AI 통합 심리 평가</li>
<li>신뢰도 계수: Cronbach's α = 0.89</li>
</ul>

<p><strong>2. 검사 결과 요약</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<tr><td style="padding:6px;border:1px solid #e2e8f0;font-weight:600;width:40%;">총점</td><td style="padding:6px;border:1px solid #e2e8f0;">24 / 42 (57.1%)</td></tr>
<tr><td style="padding:6px;border:1px solid #e2e8f0;font-weight:600;">심각도 수준</td><td style="padding:6px;border:1px solid #e2e8f0;">중등도 (Moderate)</td></tr>
<tr><td style="padding:6px;border:1px solid #e2e8f0;font-weight:600;">주요 위험 영역</td><td style="padding:6px;border:1px solid #e2e8f0;">스트레스(72), 우울감(68), 정서조절(48)</td></tr>
<tr><td style="padding:6px;border:1px solid #e2e8f0;font-weight:600;">보호 요인</td><td style="padding:6px;border:1px solid #e2e8f0;">인지 기능(78), 사회적 기능(60)</td></tr>
<tr><td style="padding:6px;border:1px solid #e2e8f0;font-weight:600;">95% 신뢰구간</td><td style="padding:6px;border:1px solid #e2e8f0;">20.3 ~ 27.7</td></tr>
<tr><td style="padding:6px;border:1px solid #e2e8f0;font-weight:600;">동일 연령대 백분위</td><td style="padding:6px;border:1px solid #e2e8f0;">상위 32%</td></tr>
</table>

<p><strong>3. 소견</strong></p>
<p>검사 대상자는 스트레스 반응성과 우울감이 임상적 주의가 필요한 수준으로 확인됩니다. 특히 수면의 질 저하(45점)가 전반적 심리 건강에 부정적 연쇄 작용을 일으키고 있는 것으로 판단됩니다. 인지 기능이 양호하게 유지되고 있어, 인지행동치료(CBT) 기반 접근이 효과적일 것으로 사료됩니다.</p>

<p><strong>4. 권고 사항</strong></p>
<ul>
<li>전문 심리상담 또는 정신건강의학과 초진 권고</li>
<li>수면 클리닉 의뢰 고려</li>
<li>12주 후 재검사를 통한 변화 추적</li>
</ul>

<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
<p style="font-size:10px;color:#94a3b8;text-align:center;">⚠️ 본 소견서는 AI 기반 분석 결과이며, 의학적 진단서가 아닙니다. 전문 의료인의 판단을 대체하지 않습니다.<br/>참고 자료로만 활용하시기 바랍니다.</p>
</div>`
      },
      {
        title: '학술 참고문헌 및 분석 근거',
        icon: 'BookOpen',
        body: `<p>본 리포트의 분석 방법론과 해석 기준에 활용된 주요 참고 자료입니다.</p>

<p><strong>📚 분석 기반</strong></p>
<ol style="font-size:12px;line-height:2;">
<li>AIHPRO 독자적 심리건강 분석 엔진 — 우울감, 불안, 스트레스 통합 평가 모델 (2026).</li>
<li>AIHPRO 행동 패턴 인식 프레임워크 — 다차원 정서·인지 기능 평가 체계.</li>
</ol>

<p><strong>📊 통계 분석 방법론</strong></p>
<ol start="3" style="font-size:12px;line-height:2;">
<li>내적 일관성 계수(Cronbach's α)를 활용한 검사 신뢰도 검증.</li>
<li>임상적 유의미 변화 지수(AIHPRO-RCI) — 표준측정오차 기반 점수 변화 검증 모델.</li>
<li>심리측정 이론에 기반한 표준화 점수 산출 및 해석 체계.</li>
</ol>

<p><strong>🧠 개입 효과 근거</strong></p>
<ol start="7" style="font-size:12px;line-height:2;">
<li>Cuijpers, P., et al. (2024). The effects of psychotherapies for depression on response, remission, and recovery: A meta-analysis. <em>World Psychiatry</em>, 23(1), 45-57.</li>
<li>Irwin, M.R. (2024). Sleep and inflammation in resilient aging. <em>Interface Focus</em>, 14(1), 20230076.</li>
<li>Schuch, F.B., et al. (2025). Exercise as a treatment for depression: Updated meta-analysis adjusting for publication bias. <em>British Journal of Sports Medicine</em>, 59(2), 108-115.</li>
</ol>

<p style="font-size:11px;color:#64748b;margin-top:12px;"><em>본 리포트에서 인용된 연구는 참고 목적이며, 개별 적용 시 전문가의 해석이 필요합니다. 최신 연구 동향은 지속적으로 업데이트됩니다.</em></p>`
      }
    ]
  },
  {
    report_order: 2,
    created_at: '2026-04-05T09:00:00Z',
    total_score: 18,
    risk_level: 'low',
    dimension_scores: {
      '우울감': 52,
      '불안': 42,
      '스트레스': 58,
      '수면 질': 62,
      '사회적 기능': 71,
      '인지 기능': 82,
      '자기효능감': 65,
      '정서 조절': 61
    },
    sections: [
      {
        title: '종합 분석 요약',
        icon: 'Brain',
        body: `<p>2차 검사 결과, 이전 대비 <strong>유의미한 개선</strong>이 관찰됩니다. 총점이 24점에서 <strong>18점으로 25% 감소</strong>하여 경미한 수준으로 전환되었습니다.</p>
<p>특히 <strong>수면의 질(45→62점, +37.8%)</strong>과 <strong>사회적 기능(60→71점, +18.3%)</strong>에서 뚜렷한 호전이 나타났습니다. 스트레스 반응성도 72점에서 58점으로 19.4% 감소했습니다.</p>
<p>자기효능감(52→65점, +25.0%)과 정서 조절(48→61점, +27.1%)에서도 의미 있는 상승이 확인되어, 1차 검사 후 시행된 개입 전략이 효과적이었음을 시사합니다.</p>
<p><strong>핵심 소견:</strong> 전 영역에서 긍정적 변화가 확인되며, 예후 시나리오 "적극 개입" 경로와 일치합니다. 현재 경로를 유지하면 3차 검사에서 정상 범위 진입이 기대됩니다.</p>`
      },
      {
        title: '종단 변화 분석 (Longitudinal Delta Tracking)',
        icon: 'LineChart',
        body: `<p>1차(2026.03.15) → 2차(2026.04.05) 검사 간 <strong>21일간의 변화</strong>를 정밀 분석합니다.</p>

<p><strong>📊 영역별 변화량 상세</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">영역</th>
<th style="padding:8px;border:1px solid #e2e8f0;">1차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">2차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">변화</th>
<th style="padding:8px;border:1px solid #e2e8f0;">변화율</th>
<th style="padding:8px;border:1px solid #e2e8f0;">판정</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">우울감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">68</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">52</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">-16</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">-23.5%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">불안</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">55</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">42</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">-13</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">-23.6%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">스트레스</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">72</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">58</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">-14</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">-19.4%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">45</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">62</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">+17</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+37.8%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 대폭 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">사회적 기능</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">60</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">71</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">+11</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+18.3%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">인지 기능</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">78</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">82</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">+4</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+5.1%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">➡️ 유지</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">자기효능감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">52</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">65</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">+13</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+25.0%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">정서 조절</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">48</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">61</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">+13</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+27.1%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 개선</td></tr>
</tbody></table>

<p><strong>🎯 임상적 유의미 변화 지수(AIHPRO-RCI) 분석</strong></p>
<p>총점 변화(-6점)의 통계적 유의미성을 AIHPRO 표준측정오차 기반 공식으로 검증합니다:</p>
<ul>
<li>AIHPRO-RCI = (X₂ - X₁) / √(2 × SEM²) = (18-24) / √(2 × 3.82²) = <strong>-1.11</strong></li>
<li>|AIHPRO-RCI| > 1.96 기준 미충족 → 아직 통계적으로 "확정적" 변화는 아님</li>
<li>그러나 |AIHPRO-RCI| > 1.0으로 <strong>임상적으로 의미 있는 변화 추세</strong>로 판단</li>
<li>3차 검사에서 추가 감소 시 통계적 유의미 변화 달성 가능</li>
</ul>

<p><strong>📈 개선 속도 분석</strong></p>
<ul>
<li>일평균 점수 변화: -0.29점/일</li>
<li>가장 빠른 개선 영역: 수면 질 (+0.81점/일)</li>
<li>가장 느린 개선 영역: 인지 기능 (+0.19점/일) — 이미 양호했으므로 정상</li>
<li>예상 정상 범위 도달 시점: 약 6~8주 후 (현재 경로 유지 시)</li>
</ul>`
      },
      {
        title: '2차 응답 신뢰도 분석',
        icon: 'Shield',
        body: `<p><strong>종합 신뢰도 판정: 91% (매우 양호)</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;">검증 항목</th>
<th style="padding:8px;border:1px solid #e2e8f0;">1차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">2차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">변화</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">일관성 지수</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.87</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">0.92</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">↑ 향상</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">극단 응답 편향</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">8.3%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">5.1%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">↓ 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">묵종 편향</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">15.2%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">11.8%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">↓ 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">응답 변산성</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.62</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">0.78</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">↑ 정상화</td></tr>
</tbody></table>
<p>2차 검사에서 응답 신뢰도가 전반적으로 향상되었습니다. 특히 1차에서 "주의"였던 응답 변산성이 정상 범위로 회복되어, <strong>점수 개선이 실제 상태 변화를 반영</strong>하는 것으로 판단됩니다.</p>`
      },
      {
        title: '2차 또래 비교 분석',
        icon: 'Users',
        body: `<p>2차 검사 결과의 또래 비교 순위 변화:</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">영역</th>
<th style="padding:8px;border:1px solid #e2e8f0;">1차 백분위</th>
<th style="padding:8px;border:1px solid #e2e8f0;">2차 백분위</th>
<th style="padding:8px;border:1px solid #e2e8f0;">순위 변화</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">우울감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">상위 28%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">상위 45%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 +17%p</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">스트레스</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">상위 22%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">상위 38%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 +16%p</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">하위 30%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">상위 52%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 +22%p</td></tr>
</tbody></table>
<p>수면 질이 가장 극적인 순위 상승을 보였으며, 전문 상담 권장 기준(상위 25%)에서 벗어났습니다.</p>`
      },
      {
        title: '현재 상태 평가 및 3차 검사 계획',
        icon: 'Target',
        body: `<p>현재 상태는 AIHPRO 심리건강 분석 기준 <strong>경미한 수준(Mild)</strong>에 해당합니다. 지속적인 자기관리를 통해 정상 범위 진입이 기대됩니다.</p>

<p><strong>✅ 달성된 목표 (Phase 1 평가)</strong></p>
<ul>
<li>수면 잠복기: 35분 → 20분 (목표 25분 이내 ✅ 달성)</li>
<li>스트레스 점수: 72 → 58 (-19.4%, 목표 5% 감소 ✅ 초과 달성)</li>
<li>우울감: 68 → 52 (-23.5%, 목표 10% 감소 ✅ 초과 달성)</li>
</ul>

<p><strong>📋 Phase 2 진입 권고사항</strong></p>
<ul>
<li>현재 수면 관리 방법을 유지하면서 운동 프로그램 추가</li>
<li>인지행동 훈련(부정적 사고 기록) 시작</li>
<li>사회적 활동 빈도를 주 2회로 증가</li>
</ul>

<p><strong>📅 3차 검사 일정</strong></p>
<ul>
<li>권장 시기: 2026년 5월 초 (4주 후)</li>
<li>목표 점수: 총점 14점 이하 (경미 수준 안정화)</li>
<li>정상 범위 전환 예상: 6~8주 후</li>
</ul>`
      },
      {
        title: '학술 참고문헌 및 분석 근거',
        icon: 'BookOpen',
        body: `<p>2차 리포트에서 추가 활용된 분석 방법론:</p>
<ol style="font-size:12px;line-height:2;">
<li>AIHPRO 임상적 유의미 변화 지수(AIHPRO-RCI) — 표준측정오차 기반 종단 변화 검증 모델.</li>
<li>근거 기반 정신건강 평가에서의 임상적 유의미 변화 판정 방법론 적용.</li>
<li>심리치료 성과 분석을 위한 신뢰도 변화 및 임상적 유의미성 통합 평가 체계.</li>
</ol>`
      }
    ]
  },
  {
    report_order: 3,
    created_at: '2026-04-28T09:00:00Z',
    total_score: 11,
    risk_level: 'low',
    dimension_scores: {
      '우울감': 35,
      '불안': 30,
      '스트레스': 42,
      '수면 질': 75,
      '사회적 기능': 80,
      '인지 기능': 85,
      '자기효능감': 78,
      '정서 조절': 74
    },
    sections: [
      {
        title: '종합 분석 요약',
        icon: 'Brain',
        body: `<p>3차 검사 결과, <strong>정상 범위 진입</strong>이 확인됩니다. 총점이 18점에서 <strong>11점으로 38.9% 추가 감소</strong>하여 AIHPRO 분석 기준 정상~경미 수준으로 전환되었습니다.</p>
<p>1차(24점) 대비 <strong>총 54.2% 감소</strong>로, 12주 예후 시나리오의 "적극 개입" 경로를 초과 달성했습니다. 특히 수면 질(45→75, +66.7%)과 자기효능감(52→78, +50.0%)의 개선이 두드러집니다.</p>
<p><strong>핵심 소견:</strong> 스트레스-수면 악순환 고리가 해소되었으며, 정서 조절(48→74)과 사회적 기능(60→80) 모두 양호 수준에 도달했습니다. 현재 상태를 유지하기 위한 재발 방지 전략이 필요합니다.</p>`
      },
      {
        title: '3회차 종단 변화 분석 (1차→2차→3차)',
        icon: 'LineChart',
        body: `<p>6주간 3회 검사를 통한 <strong>전체 변화 궤적</strong>을 분석합니다.</p>

<p><strong>📊 전체 변화 추이 테이블</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">영역</th>
<th style="padding:8px;border:1px solid #e2e8f0;">1차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">2차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">3차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">총 변화</th>
<th style="padding:8px;border:1px solid #e2e8f0;">판정</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">총점</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">24</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">18</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">11</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">-54.2%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 대폭 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">우울감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">68</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">52</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">35</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">-48.5%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 정상화</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">불안</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">55</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">42</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">30</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">-45.5%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 정상화</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">스트레스</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">72</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">58</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">42</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">-41.7%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">45</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">62</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">75</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+66.7%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 대폭 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">사회적 기능</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">60</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">71</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">80</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+33.3%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">인지 기능</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">78</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">82</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">85</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+9.0%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">➡️ 유지</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">자기효능감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">52</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">65</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">78</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+50.0%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 대폭 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">정서 조절</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">48</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">61</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">74</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;">+54.2%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 대폭 개선</td></tr>
</tbody></table>

<p><strong>🎯 임상적 유의미 변화 지수(AIHPRO-RCI) 분석 — 1차→3차</strong></p>
<ul>
<li>AIHPRO-RCI = (11-24) / √(2 × 3.82²) = <strong>-2.41</strong></li>
<li>|AIHPRO-RCI| > 1.96 기준 충족 ✅ → <strong>통계적으로 유의미한 변화 확정</strong></li>
<li>AIHPRO 임상적 유의미 변화 기준: 임상적으로 유의미한 개선 달성</li>
</ul>

<p><strong>📈 회복 속도 분석</strong></p>
<ul>
<li>총 검사 기간: 44일</li>
<li>일평균 점수 변화: -0.30점/일</li>
<li>1차→2차 회복 속도: -0.29점/일</li>
<li>2차→3차 회복 속도: -0.30점/일 → <strong>회복 속도 안정적 유지</strong></li>
<li>가장 극적인 개선: 수면 질 (+30점, +66.7%)</li>
</ul>`
      },
      {
        title: '예후 시나리오 검증 (1차 예측 vs 실제)',
        icon: 'Sparkles',
        body: `<p>1차 검사 시 제시했던 예후 시나리오와 실제 결과를 비교합니다.</p>

<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0fdf4;">
<th style="padding:10px;border:1px solid #e2e8f0;text-align:left;">항목</th>
<th style="padding:10px;border:1px solid #e2e8f0;">예측값 (적극개입 3개월)</th>
<th style="padding:10px;border:1px solid #e2e8f0;">실제값 (6주)</th>
<th style="padding:10px;border:1px solid #e2e8f0;">달성률</th>
</tr></thead>
<tbody>
<tr><td style="padding:10px;border:1px solid #e2e8f0;">총점</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">18점</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">11점</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">🌟 초과 달성</td></tr>
<tr><td style="padding:10px;border:1px solid #e2e8f0;">우울감</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">55</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">35</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">🌟 초과 달성</td></tr>
<tr><td style="padding:10px;border:1px solid #e2e8f0;">스트레스</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">58</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">42</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">🌟 초과 달성</td></tr>
<tr><td style="padding:10px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">58</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:#16a34a;">75</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">🌟 초과 달성</td></tr>
</tbody></table>

<p><strong>결론:</strong> 6주 만에 3개월 예측치를 모두 초과 달성했습니다. 이는 수면 위생 개선을 중심으로 한 개입 전략이 예상보다 빠르게 효과를 발휘했음을 의미합니다. AIHPRO 예후 모델의 예측 정확도가 검증되었습니다.</p>`
      },
      {
        title: '3차 응답 신뢰도 분석',
        icon: 'Shield',
        body: `<p><strong>종합 신뢰도 판정: 94% (매우 우수)</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;">검증 항목</th>
<th style="padding:8px;border:1px solid #e2e8f0;">1차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">2차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">3차</th>
<th style="padding:8px;border:1px solid #e2e8f0;">추세</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">일관성 지수</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.87</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.92</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">0.95</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 지속 향상</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">극단 응답 편향</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">8.3%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">5.1%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">3.8%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 지속 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">묵종 편향</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">15.2%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">11.8%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">8.5%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 지속 개선</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">응답 변산성</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.62</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.78</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">0.85</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">📈 정상화 완료</td></tr>
</tbody></table>
<p>3회 연속 신뢰도 향상은 응답자의 <strong>자기 인식 능력(self-awareness)</strong>이 개선되고 있음을 시사합니다. 이는 심리적 회복의 부수적 지표로 해석됩니다.</p>`
      },
      {
        title: '3차 또래 비교 분석 — 정상 범위 진입',
        icon: 'Users',
        body: `<p>3차 검사 결과의 또래 비교 순위 변화:</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">영역</th>
<th style="padding:8px;border:1px solid #e2e8f0;">1차 백분위</th>
<th style="padding:8px;border:1px solid #e2e8f0;">2차 백분위</th>
<th style="padding:8px;border:1px solid #e2e8f0;">3차 백분위</th>
<th style="padding:8px;border:1px solid #e2e8f0;">총 변화</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">우울감</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#dc2626;">상위 28%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#ca8a04;">상위 45%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">상위 68%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 +40%p</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">스트레스</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#dc2626;">상위 22%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#ca8a04;">상위 38%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">상위 58%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 +36%p</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#dc2626;">하위 30%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#ca8a04;">상위 52%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">상위 72%</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">🌟 +42%p</td></tr>
</tbody></table>
<p>전 영역에서 <strong>전문 상담 권장 기준(상위 25%)을 벗어나</strong> 정상 범위에 안착했습니다.</p>`
      },
      {
        title: '재발 방지 및 유지 전략',
        icon: 'Target',
        body: `<p>정상 범위에 도달했으나, <strong>재발 방지</strong>를 위한 장기 유지 전략이 필요합니다.</p>

<p><strong>🛡️ 조기 경고 신호 체크리스트</strong></p>
<p>아래 항목 중 3개 이상이 2주 이상 지속되면 재검사를 권합니다:</p>
<ul>
<li>□ 수면 잠복기가 다시 30분 이상으로 증가</li>
<li>□ 이전에 즐기던 활동에 대한 흥미가 감소</li>
<li>□ 사회적 모임을 연속 3회 이상 회피</li>
<li>□ 원인 없는 피로감이 지속</li>
<li>□ 집중력 저하로 업무/학업에 지장</li>
<li>□ 부정적 자기 대화가 빈번해짐</li>
</ul>

<p><strong>📋 주간 유지 루틴</strong></p>
<ul>
<li>수면 위생: 취침/기상 시간 고정 유지</li>
<li>운동: 주 3-4회 30분 유산소 운동</li>
<li>마음챙김: 매일 5-10분 호흡 명상</li>
<li>사회 활동: 주 2회 이상 대면 만남</li>
<li>자기 점검: 월 1회 간이 자가 체크</li>
</ul>

<p><strong>📅 향후 검사 일정</strong></p>
<ul>
<li>4차 검사: 8주 후 (2026년 6월 말) — 안정성 확인</li>
<li>5차 검사: 6개월 후 (2026년 10월) — 장기 유지 확인</li>
<li>이후: 연 1-2회 정기 체크</li>
</ul>`
      },
      {
        title: '학술 참고문헌',
        icon: 'BookOpen',
        body: `<p>3차 리포트에서 추가 활용된 분석 방법론:</p>
<ol style="font-size:12px;line-height:2;">
<li>AIHPRO 임상적 유의미 변화 지수(AIHPRO-RCI) — 종단적 3회차 비교 검증.</li>
<li>심리치료 성과 연구에서의 임상적 유의미성 판정 절차 및 타당성 검증 체계.</li>
<li>우울 및 불안에 대한 심리적 개입 효과 — 최신 메타분석 근거 적용 (2024).</li>
<li>수면 개입과 정신건강 성과 — 체계적 문헌고찰 근거 적용 (2024).</li>
</ol>`
      }
    ]
  }
];

const DemoSharedReport = () => {
  const [activeReport, setActiveReport] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [copied, setCopied] = useState(false);

  const currentReport = DEMO_REPORTS[activeReport];
  const sections = currentReport.sections;

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections.map((_, i) => i)));
  };

  const demoShareUrl = `${window.location.origin}/shared-report/demo`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(demoShareUrl);
    setCopied(true);
    toast.success('공유 링크가 복사되었습니다!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 대상자 프로필
  const SUBJECT_PROFILE = {
    name: '김○○',
    id: 'SUBJ-2026-0412',
    birthDate: '2014.08.23',
    age: '만 11세 8개월',
    gender: '남',
    school: 'OO초등학교 5학년',
    guardian: '어머니 (박○○)',
    referralReason: '학교 부적응, 또래관계 어려움, 집중력 저하 호소',
    testTool: 'AIHPRO 종합 심리건강 분석 (다차원 정서·인지·행동 통합 평가)',
    examiner: 'AI 분석 엔진 v2 (임상심리전문가 감수)',
    testDates: '2026.03.15 / 2026.04.05 / 2026.04.28',
  };

  const handleDownloadHTML = () => {
    // 전체 3회차 통합 리포트 생성
    const allSessionsHtml = DEMO_REPORTS.map((report, rIdx) => {
      const sessionsHtml = report.sections.map(s => `
<div class="section">
<div class="section-title">${s.title}</div>
<div class="section-body">${s.body}</div>
</div>`).join('');

      const dimBars = Object.entries(report.dimension_scores).map(([key, val]) => `
<div class="bar-container">
<span class="bar-label">${key}</span>
<div class="bar-track"><div class="bar-fill" style="width:${val}%;background:${val > 70 ? '#ef4444' : val > 50 ? '#f59e0b' : '#22c55e'};"></div></div>
<span class="bar-value">${val}</span>
</div>`).join('');

      const riskStyle = report.risk_level === 'high' ? 'background:#fef2f2;color:#dc2626' : report.risk_level === 'medium' ? 'background:#fffbeb;color:#ca8a04' : 'background:#f0fdf4;color:#16a34a';
      const riskLabel = report.risk_level === 'high' ? '⚠️ 고위험' : report.risk_level === 'medium' ? '⚡ 경계' : '✅ 정상';
      const dateStr = new Date(report.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

      return `
<div class="session-divider">
<div class="session-badge">${rIdx + 1}회차 검사</div>
<span class="session-date">${dateStr}</span>
</div>
<div class="score-card">
<div style="display:flex;justify-content:space-between;align-items:center;">
<div>
<p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:0 0 4px 0;">종합 점수</p>
<p class="score" style="margin:0;">${report.total_score}</p>
</div>
<span class="badge" style="${riskStyle}">${riskLabel}</span>
</div>
<div style="margin-top:20px;">
${dimBars}
</div>
</div>
${sessionsHtml}`;
    }).join('\n<div style="page-break-before:always;margin:40px 0;border-top:3px solid #6366f1;"></div>\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AIHPRO 프리미엄 통합 리포트 (1~3회차)</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;}
body{font-family:'Noto Sans KR',sans-serif;margin:0;padding:24px;background:#f8fafc;color:#1e293b;line-height:1.7;font-size:13px;}
.container{max-width:800px;margin:0 auto;}
.header{text-align:center;padding:40px 20px 32px;border-bottom:3px solid #6366f1;margin-bottom:32px;}
.header .brand{font-size:11px;color:#6366f1;font-weight:600;letter-spacing:4px;margin-bottom:12px;}
.header h1{font-size:24px;margin:0 0 8px 0;font-weight:900;}
.header .subtitle{color:#64748b;font-size:13px;margin:0;}
.header .date{color:#94a3b8;font-size:11px;margin-top:10px;}
.header .summary-box{margin-top:20px;padding:16px;background:#f0f4ff;border:1px solid #c7d2fe;border-radius:12px;text-align:left;font-size:12px;line-height:1.8;color:#334155;}
.session-divider{display:flex;align-items:center;gap:12px;margin:32px 0 16px;padding:16px 0;border-bottom:2px solid #e2e8f0;}
.session-badge{background:#6366f1;color:white;padding:6px 16px;border-radius:8px;font-size:14px;font-weight:800;letter-spacing:1px;}
.session-date{color:#64748b;font-size:12px;}
.score-card{background:white;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);}
.score-card .score{font-size:48px;font-weight:900;line-height:1;}
.badge{display:inline-block;padding:6px 16px;border-radius:999px;font-size:12px;font-weight:700;}
.section{background:white;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:14px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.03);}
.section-title{padding:16px 20px;font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;background:#fafafa;}
.section-body{padding:20px;font-size:13px;line-height:1.9;color:#334155;}
.section-body p{margin:0 0 12px 0;}
.section-body ul{padding-left:20px;margin:8px 0;} .section-body li{margin-bottom:8px;}
.section-body ol{padding-left:20px;margin:8px 0;} .section-body ol li{margin-bottom:4px;}
.section-body table{width:100%;border-collapse:collapse;margin:14px 0;}
.section-body th,.section-body td{padding:10px;border:1px solid #e2e8f0;font-size:12px;}
.section-body th{background:#f1f5f9;text-align:left;font-weight:600;}
.section-body strong{color:#1e293b;}
.section-body em{color:#64748b;font-size:11px;}
.bar-container{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.bar-label{width:85px;font-size:12px;font-weight:600;flex-shrink:0;}
.bar-track{flex:1;height:10px;background:#f1f5f9;border-radius:5px;overflow:hidden;}
.bar-fill{height:100%;border-radius:5px;transition:width 0.3s;}
.bar-value{width:32px;text-align:right;font-size:12px;font-weight:700;}
.footer{text-align:center;padding:40px 20px;color:#94a3b8;font-size:10px;margin-top:40px;border-top:3px solid #6366f1;}
.footer a{color:#6366f1;text-decoration:none;font-weight:600;}
.toc{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;}
.toc h3{font-size:14px;font-weight:700;margin:0 0 16px 0;}
.toc ul{list-style:none;padding:0;margin:0;}
.toc li{padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#475569;}
.toc li:last-child{border-bottom:none;}
.toc .session-label{font-weight:700;color:#6366f1;margin-top:12px;display:block;}
.profile-card{background:white;border:2px solid #6366f1;border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:0 2px 8px rgba(99,102,241,0.08);}
.profile-card h3{font-size:15px;font-weight:800;color:#6366f1;margin:0 0 16px 0;padding-bottom:12px;border-bottom:2px solid #e0e7ff;}
.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;}
.profile-item{display:flex;gap:8px;font-size:12px;padding:6px 0;border-bottom:1px solid #f1f5f9;}
.profile-label{font-weight:700;color:#475569;min-width:90px;flex-shrink:0;}
.profile-value{color:#1e293b;}
.profile-full{grid-column:1/-1;}
@media print{body{padding:12px;font-size:11px;} .section{break-inside:avoid;} .session-divider{break-before:page;}}
</style>
</head>
<body>
<div class="container">
<div class="header">
<p class="brand">AIHPRO.COM</p>
<h1>🧠 프리미엄 AI 심리 분석 통합 리포트</h1>
<p class="subtitle">대상자: ${SUBJECT_PROFILE.name} (${SUBJECT_PROFILE.age}) · 1~3회차 종합 종단 분석</p>
<p class="date">리포트 생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
<div class="summary-box">
<strong>📋 리포트 개요</strong><br/>
• 대상자: ${SUBJECT_PROFILE.name} / ${SUBJECT_PROFILE.age} / ${SUBJECT_PROFILE.gender} / ${SUBJECT_PROFILE.school}<br/>
• 검사 횟수: 총 3회 (${SUBJECT_PROFILE.testDates})<br/>
• 총점 변화: 24점 → 18점 → 11점 (<strong>54.2% 감소</strong>)<br/>
• 위험도 변화: 경계 → 경미 → <strong>정상</strong><br/>
• RCI 판정: |RCI| = 2.41 > 1.96 → <strong>통계적 유의미 변화 확정</strong><br/>
• 분석 영역: 8개 차원, ${DEMO_REPORTS.reduce((sum, r) => sum + r.sections.length, 0)}개 세부 섹션<br/>
• 분석 엔진: AIHPRO Premium AI Engine v2 (Cronbach's α = 0.89~0.95)
</div>
</div>

<div class="profile-card">
<h3>👤 대상자 정보 (Subject Profile)</h3>
<div class="profile-grid">
<div class="profile-item"><span class="profile-label">관리번호</span><span class="profile-value">${SUBJECT_PROFILE.id}</span></div>
<div class="profile-item"><span class="profile-label">성명</span><span class="profile-value">${SUBJECT_PROFILE.name}</span></div>
<div class="profile-item"><span class="profile-label">생년월일</span><span class="profile-value">${SUBJECT_PROFILE.birthDate}</span></div>
<div class="profile-item"><span class="profile-label">연령</span><span class="profile-value">${SUBJECT_PROFILE.age}</span></div>
<div class="profile-item"><span class="profile-label">성별</span><span class="profile-value">${SUBJECT_PROFILE.gender}</span></div>
<div class="profile-item"><span class="profile-label">소속</span><span class="profile-value">${SUBJECT_PROFILE.school}</span></div>
<div class="profile-item"><span class="profile-label">보호자</span><span class="profile-value">${SUBJECT_PROFILE.guardian}</span></div>
<div class="profile-item"><span class="profile-label">검사도구</span><span class="profile-value">${SUBJECT_PROFILE.testTool}</span></div>
<div class="profile-item profile-full"><span class="profile-label">의뢰사유</span><span class="profile-value">${SUBJECT_PROFILE.referralReason}</span></div>
<div class="profile-item profile-full"><span class="profile-label">검사자</span><span class="profile-value">${SUBJECT_PROFILE.examiner}</span></div>
<div class="profile-item profile-full"><span class="profile-label">검사일시</span><span class="profile-value">${SUBJECT_PROFILE.testDates} (총 3회)</span></div>
</div>
</div>

<div class="toc">
<h3>📑 목차 (Table of Contents)</h3>
<ul>
${DEMO_REPORTS.map((report, rIdx) => `
<li class="session-label">━━ ${rIdx + 1}회차 (${new Date(report.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}) · 총점 ${report.total_score}점 ━━</li>
${report.sections.map((s, sIdx) => `<li>&nbsp;&nbsp;${rIdx + 1}-${sIdx + 1}. ${s.title}</li>`).join('\n')}
`).join('\n')}
</ul>
</div>

${allSessionsHtml}

<div class="section" style="border:2px solid #6366f1;margin-top:32px;">
<div class="section-title" style="background:#6366f1;color:white;font-size:15px;">📊 전체 여정 총괄 요약 (Executive Summary)</div>
<div class="section-body">
<p><strong>1. 핵심 성과</strong></p>
<ul>
<li>44일 만에 AIHPRO 심리건강 분석 기준 '중등도' → '정상' 전환 달성</li>
<li>8개 평가 영역 중 7개에서 유의미한 개선 확인</li>
<li>AIHPRO-RCI = -2.41로 통계적 유의미 변화(|AIHPRO-RCI| > 1.96) 충족</li>
<li>1차 예후 시나리오의 '적극 개입 3개월' 목표를 6주 만에 초과 달성</li>
</ul>

<p><strong>2. 가장 두드러진 변화 Top 3</strong></p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f0f4ff;">
<th style="padding:10px;border:1px solid #e2e8f0;">순위</th>
<th style="padding:10px;border:1px solid #e2e8f0;">영역</th>
<th style="padding:10px;border:1px solid #e2e8f0;">1차</th>
<th style="padding:10px;border:1px solid #e2e8f0;">3차</th>
<th style="padding:10px;border:1px solid #e2e8f0;">변화율</th>
</tr></thead>
<tbody>
<tr><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">🥇</td><td style="padding:10px;border:1px solid #e2e8f0;">수면 질</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">45</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">75</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">+66.7%</td></tr>
<tr><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">🥈</td><td style="padding:10px;border:1px solid #e2e8f0;">정서 조절</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">48</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">74</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">+54.2%</td></tr>
<tr><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">🥉</td><td style="padding:10px;border:1px solid #e2e8f0;">자기효능감</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">52</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">78</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">+50.0%</td></tr>
</tbody></table>

<p><strong>3. 응답 신뢰도 추이</strong></p>
<ul>
<li>1차: 85% (양호) → 2차: 91% (매우 양호) → 3차: 94% (매우 우수)</li>
<li>자기 인식 능력(self-awareness)의 지속적 향상으로 해석</li>
</ul>

<p><strong>4. 향후 권고</strong></p>
<ul>
<li>현재 상태 유지를 위한 재발 방지 전략 실행</li>
<li>4차 검사: 8주 후 안정성 확인</li>
<li>이후 연 1~2회 정기 체크로 전환</li>
</ul>

<p style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;font-size:12px;">
<strong>🎯 최종 판정:</strong> 본 내담자는 6주간의 적극적 개입을 통해 임상적으로 유의미한 회복을 달성했습니다. 
AIHPRO 임상적 유의미 변화 기준에 의거, <strong>임상적으로 유의미한 개선(Clinically Significant Improvement)</strong>이 확정되며, 
현 시점에서 정기 관찰 모드로의 전환을 권고합니다.
</p>
</div>
</div>

<div class="footer">
<p>© ${new Date().getFullYear()} AIHPRO.COM · AI 기반 심리·발달 분석 플랫폼</p>
<p style="margin-top:4px;">본 리포트는 AI 기반 참고용 분석이며 의학적 진단을 대체하지 않습니다.</p>
<p style="margin-top:4px;">분석 엔진: Premium AI Engine v2 · 응답 유효성 4단계 검증 · RCI/CSC 통계 모델 적용</p>
<p style="margin-top:16px;font-size:13px;"><a href="https://aihpro.app">🧠 나도 AI 심리 분석 받아보기 →</a></p>
</div>
</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIHPRO_${SUBJECT_PROFILE.name}_종합리포트_1-3회차.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${SUBJECT_PROFILE.name} 대상 전체 3회차 통합 리포트가 다운로드되었습니다!`);
  };

  return (
    <>
      <SEOHead title="AIHPRO 공유 리포트 데모" description="AI 기반 프리미엄 심리·발달 분석 리포트 데모" />
      <div className="min-h-screen bg-background">
        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-background/95 backdrop-blur-sm border-b border-border/20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm tracking-tight">AIHPRO</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">전문가 분석 리포트</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={expandAll}>
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleDownloadHTML}>
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-24" id="demo-report-content">
          {/* ── Title ── */}
          <div className="pt-6 pb-4">
            <h1 className="text-lg font-bold text-foreground leading-tight">종합 심리건강 분석 리포트</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              대상자: {SUBJECT_PROFILE.name} ({SUBJECT_PROFILE.age}) · 다차원 정서·인지·행동 통합 평가
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(currentReport.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* ── Score Summary Card ── */}
          <div className="rounded-2xl border border-border/30 bg-white dark:bg-card p-5 mb-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">종합 점수</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-4xl font-black text-foreground">{currentReport.total_score}</span>
                  <span className="text-sm text-muted-foreground">/ 63</span>
                </div>
              </div>
              <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                currentReport.risk_level === 'high' ? 'text-red-600 border-red-200 bg-red-50' :
                currentReport.risk_level === 'medium' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                'text-green-600 border-green-200 bg-green-50'
              }`}>
                {currentReport.risk_level === 'high' ? '고위험' :
                 currentReport.risk_level === 'medium' ? '경계 수준' : '정상'}
              </div>
            </div>
          </div>

          {/* ── Domain Scores ── */}
          <div className="rounded-2xl border border-border/30 bg-white dark:bg-card p-5 mb-3 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3">영역별 분석</h2>
            <div>
              {Object.entries(currentReport.dimension_scores).map(([key, val]) => {
                const pct = val;
                return (
                  <div key={key} className="flex items-center gap-3 py-2.5 border-b border-border/15 last:border-0">
                    <div className="w-[80px] shrink-0">
                      <span className="text-xs font-semibold text-foreground">{key}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            val > 70 ? 'bg-red-400' : val > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground w-8 text-right">{val}</span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground w-14 text-right">
                      {val > 70 ? '주의' : val > 50 ? '경계' : '양호'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Subject Profile Card ── */}
          <div className="rounded-2xl border border-border/30 bg-white dark:bg-card p-5 mb-3 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              대상자 정보
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {[
                ['관리번호', SUBJECT_PROFILE.id],
                ['성명', SUBJECT_PROFILE.name],
                ['생년월일', SUBJECT_PROFILE.birthDate],
                ['연령', SUBJECT_PROFILE.age],
                ['성별', SUBJECT_PROFILE.gender],
                ['소속', SUBJECT_PROFILE.school],
                ['보호자', SUBJECT_PROFILE.guardian],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-xs py-1.5 border-b border-border/10">
                  <span className="font-semibold text-muted-foreground min-w-[60px]">{label}</span>
                  <span className="text-foreground">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-1.5 space-y-0">
              {[
                ['의뢰사유', SUBJECT_PROFILE.referralReason],
                ['검사도구', SUBJECT_PROFILE.testTool],
                ['검사일시', SUBJECT_PROFILE.testDates],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-xs py-1.5 border-b border-border/10 last:border-0">
                  <span className="font-semibold text-muted-foreground min-w-[60px]">{label}</span>
                  <span className="text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Session Navigation ── */}
          <div className="mb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {DEMO_REPORTS.map((r, i) => {
                const date = new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                const riskColor = r.risk_level === 'high' ? 'text-red-500' : r.risk_level === 'medium' ? 'text-amber-500' : 'text-emerald-500';
                return (
                  <button
                    key={i}
                    onClick={() => { setActiveReport(i); setExpandedSections(new Set([0])); }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                      activeReport === i 
                        ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                        : 'bg-white dark:bg-card border-border/30 text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-bold">{i + 1}회차</span>
                      <span className="text-[10px] opacity-80">{date} · {r.total_score}점</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Timeline */}
            <div className="mt-2 p-3 bg-white dark:bg-card rounded-xl border border-border/30 shadow-sm">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">검사 이력</p>
              <div className="flex items-center gap-1">
                {DEMO_REPORTS.map((r, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                        i <= activeReport ? 'bg-primary border-primary' : 'bg-muted border-muted'
                      }`} />
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                    {i < DEMO_REPORTS.length - 1 && (
                      <div className={`flex-1 h-0.5 -mt-4 ${
                        i < activeReport ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* ── AI Analysis Sections ── */}
          <div className="rounded-2xl border border-border/30 bg-white dark:bg-card p-5 mb-3 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              전문가 종합 분석 리포트
            </h2>
            <div className="space-y-2">
              {sections.map((section, idx) => {
                const IconComp = SECTION_ICONS[section.icon] || FileText;
                const isOpen = expandedSections.has(idx);
                return (
                  <div key={idx} className="border border-border/30 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center justify-between p-3.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <IconComp className="w-4 h-4 text-primary" />
                        {section.title}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-2">
                        <div 
                          className="text-[13px] leading-[1.9] text-foreground/85 prose prose-sm max-w-none
                            [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-xs
                            [&_th]:bg-muted/40 [&_th]:p-2.5 [&_th]:border [&_th]:border-border/30 [&_th]:font-semibold [&_th]:text-foreground
                            [&_td]:p-2.5 [&_td]:border [&_td]:border-border/30
                            [&_ul]:space-y-1.5 [&_li]:text-[13px]
                            [&_strong]:text-foreground [&_em]:text-muted-foreground [&_em]:text-[11px]"
                          dangerouslySetInnerHTML={{ __html: sanitizeAIContent(section.body) }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Disclaimer ── */}
          <div className="mt-6 px-1">
            <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
              본 리포트는 AI 기반 참고용 분석이며 의학적 진단이나 치료를 대체하지 않습니다.<br />
              필요시 전문의 상담을 받으시기 바랍니다.
            </p>
            <p className="text-[9px] text-muted-foreground/40 text-center mt-1">© AIHPRO.COM</p>
          </div>

          {/* ── CTA Footer ── */}
          <div className="mt-6 p-5 bg-white dark:bg-card rounded-2xl border border-border/30 shadow-sm text-center">
            <p className="text-sm font-bold text-foreground mb-1">나도 분석 받아보기</p>
            <p className="text-xs text-muted-foreground mb-3">
              AIHPRO에서 무료 검사 후 프리미엄 리포트를 받아보세요
            </p>
            <Button 
              onClick={() => window.open('/', '_blank')}
              className="bg-primary text-primary-foreground"
              size="sm"
            >
              무료로 시작하기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoSharedReport;
