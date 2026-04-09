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
  Download, Share2, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';

const SECTION_ICONS: Record<string, React.ElementType> = {
  Brain, Heart, TrendingUp, Target, LineChart, Users, Shield, Activity, BarChart3
};

/* ─── 데모 리포트 데이터 ─── */
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
      '인지 기능': 78
    },
    sections: [
      {
        title: '종합 분석 요약',
        icon: 'Brain',
        body: `<p>검사 결과, 전반적으로 <strong>경계 수준(Moderate)</strong>의 심리적 부담이 관찰됩니다. 총점 24점은 PHQ-9 기준 중등도 우울에 해당하며, 특히 <strong>스트레스 반응성(72점)</strong>과 <strong>우울감(68점)</strong> 영역에서 주의가 필요합니다.</p>
<p>인지 기능(78점)은 양호한 수준을 유지하고 있어, 현재의 심리적 부담이 인지 능력에 미치는 영향은 제한적입니다. 그러나 수면의 질(45점)이 저하되어 있어, 이로 인한 이차적 영향이 우려됩니다.</p>`
      },
      {
        title: '응답 신뢰도 분석',
        icon: 'Shield',
        body: `<p><strong>4단계 신뢰도 검증 결과:</strong></p>
<ul>
<li>✅ <strong>일관성 지수:</strong> 0.87 (높음) — 문항 간 응답이 일관적입니다</li>
<li>✅ <strong>극단 응답 편향:</strong> 8% (정상) — 극단 선택이 적절한 범위입니다</li>
<li>✅ <strong>묵종 편향:</strong> 15% (정상) — 일방적 동의 경향이 없습니다</li>
<li>⚠️ <strong>응답 변산성:</strong> 0.62 (주의) — 일부 영역에서 응답 패턴 변동이 관찰됩니다</li>
</ul>
<p>전반적 신뢰도: <strong>85% (양호)</strong> — 본 결과를 참고자료로 활용할 수 있습니다.</p>`
      },
      {
        title: '95% 신뢰구간 분석',
        icon: 'BarChart3',
        body: `<p>표준측정오차(SEM)를 기반으로 산출한 점수 범위입니다:</p>
<ul>
<li><strong>총점:</strong> 24점 (95% CI: 20.3 ~ 27.7)</li>
<li><strong>우울 영역:</strong> 68점 (95% CI: 63.1 ~ 72.9)</li>
<li><strong>불안 영역:</strong> 55점 (95% CI: 50.8 ~ 59.2)</li>
<li><strong>스트레스:</strong> 72점 (95% CI: 67.4 ~ 76.6)</li>
</ul>
<p>신뢰구간이 좁을수록 측정의 정밀도가 높음을 의미합니다. 현재 결과는 <strong>표준 수준의 정밀도</strong>를 보입니다.</p>`
      },
      {
        title: '예후 시나리오 분석',
        icon: 'TrendingUp',
        body: `<p><strong>3×3 예후 매트릭스</strong> (개입 수준 × 예측 기간)</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:8px;border:1px solid #e2e8f0;text-align:left;">개입 수준</th>
<th style="padding:8px;border:1px solid #e2e8f0;">3개월 후</th>
<th style="padding:8px;border:1px solid #e2e8f0;">6개월 후</th>
<th style="padding:8px;border:1px solid #e2e8f0;">12개월 후</th>
</tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">🟢 적극 개입</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#16a34a;">18점 (↓25%)</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#16a34a;">12점 (↓50%)</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#16a34a;">8점 (↓67%)</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">🟡 현 상태 유지</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#ca8a04;">24점 (→)</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#ca8a04;">26점 (↑8%)</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#ca8a04;">28점 (↑17%)</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:600;">🔴 미개입</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#dc2626;">28점 (↑17%)</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#dc2626;">33점 (↑38%)</td>
<td style="padding:8px;border:1px solid #e2e8f0;color:#dc2626;">38점 (↑58%)</td></tr>
</tbody></table>
<p>적극적 개입(전문 상담 + 자기관리) 시 <strong>12개월 내 경미 수준으로 회복</strong>이 기대됩니다.</p>`
      },
      {
        title: '동일 연령대 비교 (Peer Benchmarking)',
        icon: 'Users',
        body: `<p>30대 성인 기준 동일 연령대 비교 결과:</p>
<ul>
<li>📊 상위 <strong>32%</strong> — 동일 연령대 100명 중 32번째 수준</li>
<li>📈 우울감 영역: 상위 28% (평균 대비 +1.2 SD)</li>
<li>📉 인지 기능: 상위 75% (양호한 수준 유지)</li>
<li>🏥 전문 상담 권장 기준: 상위 25% 이내 시 권장 → <strong>경계선에 위치</strong></li>
</ul>
<p><em>※ 비교 데이터는 2024-2026년 AIHPRO 플랫폼 이용자 기반 통계입니다.</em></p>`
      },
      {
        title: '맞춤형 권고사항',
        icon: 'Target',
        body: `<p><strong>12주 단계별 관리 로드맵:</strong></p>
<p><strong>[1-4주] 기초 안정화</strong></p>
<ul>
<li>수면 위생 개선: 취침 1시간 전 전자기기 차단, 규칙적 수면 시간 유지</li>
<li>일일 10분 마음챙김 호흡 실습</li>
<li>스트레스 일지 작성 (하루 3줄)</li>
</ul>
<p><strong>[5-8주] 능동적 대처</strong></p>
<ul>
<li>주 3회 30분 이상 유산소 운동</li>
<li>사회적 관계 복원: 주 1회 이상 대면 만남</li>
<li>인지행동치료(CBT) 기반 자기 대화 기법 연습</li>
</ul>
<p><strong>[9-12주] 성장 및 재평가</strong></p>
<ul>
<li>2차 검사를 통한 변화 추적</li>
<li>전문 상담 필요 여부 재평가</li>
<li>장기 자기관리 계획 수립</li>
</ul>`
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
      '인지 기능': 82
    },
    sections: [
      {
        title: '종합 분석 요약',
        icon: 'Brain',
        body: `<p>2차 검사 결과, 이전 대비 <strong>유의미한 개선</strong>이 관찰됩니다. 총점이 24점에서 <strong>18점으로 25% 감소</strong>하여 경미한 수준으로 전환되었습니다.</p>
<p>특히 <strong>수면의 질(45→62점, +37.8%)</strong>과 <strong>사회적 기능(60→71점, +18.3%)</strong>에서 뚜렷한 호전이 나타났습니다. 스트레스 반응성도 72점에서 58점으로 감소했습니다.</p>`
      },
      {
        title: '변화 추이 분석 (Delta Tracking)',
        icon: 'LineChart',
        body: `<p><strong>1차 → 2차 검사 변화량:</strong></p>
<ul>
<li>📉 총점: 24 → 18 (<strong>-6점, -25.0%</strong>)</li>
<li>📉 우울감: 68 → 52 (<strong>-16점, -23.5%</strong>)</li>
<li>📉 불안: 55 → 42 (<strong>-13점, -23.6%</strong>)</li>
<li>📉 스트레스: 72 → 58 (<strong>-14점, -19.4%</strong>)</li>
<li>📈 수면 질: 45 → 62 (<strong>+17점, +37.8%</strong>)</li>
<li>📈 사회적 기능: 60 → 71 (<strong>+11점, +18.3%</strong>)</li>
<li>📈 인지 기능: 78 → 82 (<strong>+4점, +5.1%</strong>)</li>
</ul>
<p>전 영역에서 긍정적 변화가 확인되며, 예후 시나리오 "적극 개입" 경로와 일치합니다.</p>`
      },
      {
        title: '현재 상태 평가 및 향후 계획',
        icon: 'Target',
        body: `<p>현재 상태는 PHQ-9 기준 <strong>경미한 우울(Mild)</strong>에 해당합니다. 지속적인 자기관리를 통해 정상 범위 진입이 기대됩니다.</p>
<p><strong>향후 권고:</strong></p>
<ul>
<li>현재 관리 방법을 최소 4주 더 유지</li>
<li>3차 검사를 4주 후 시행하여 안정성 확인</li>
<li>수면 개선이 가장 큰 효과를 보였으므로 수면 위생 지속 강화</li>
</ul>`
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

  const demoShareUrl = `${window.location.origin}/shared-report/demo`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(demoShareUrl);
    setCopied(true);
    toast.success('공유 링크가 복사되었습니다!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHTML = () => {
    const reportEl = document.getElementById('demo-report-content');
    if (!reportEl) return;
    
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AIHPRO 프리미엄 분석 리포트</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
body{font-family:'Noto Sans KR',sans-serif;margin:0;padding:20px;background:#f8fafc;color:#1e293b;}
.container{max-width:800px;margin:0 auto;}
.header{text-align:center;padding:24px;border-bottom:2px solid #e2e8f0;margin-bottom:24px;}
.header h1{font-size:20px;margin:0 0 4px 0;} .header p{color:#64748b;font-size:12px;margin:0;}
.score-card{background:white;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:16px;}
.score-card .score{font-size:36px;font-weight:900;} .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;}
.section{background:white;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:12px;overflow:hidden;}
.section-title{padding:16px;font-size:14px;font-weight:700;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:8px;}
.section-body{padding:16px;font-size:13px;line-height:1.8;color:#334155;}
.section-body ul{padding-left:20px;} .section-body li{margin-bottom:6px;}
.section-body table{width:100%;border-collapse:collapse;margin:12px 0;}
.section-body th,.section-body td{padding:8px;border:1px solid #e2e8f0;font-size:12px;}
.section-body th{background:#f1f5f9;text-align:left;}
.bar-container{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.bar-label{width:80px;font-size:12px;font-weight:600;flex-shrink:0;}
.bar-track{flex:1;height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;}
.bar-fill{height:100%;border-radius:4px;transition:width 0.5s;}
.bar-value{width:32px;text-align:right;font-size:12px;font-weight:700;}
.footer{text-align:center;padding:24px;color:#94a3b8;font-size:10px;margin-top:24px;border-top:1px solid #e2e8f0;}
.footer a{color:#6366f1;text-decoration:none;}
</style>
</head>
<body>
<div class="container">
<div class="header">
<p style="font-size:10px;color:#6366f1;font-weight:600;letter-spacing:2px;">AIHPRO.COM</p>
<h1>🧠 프리미엄 AI 심리 분석 리포트</h1>
<p>${new Date(currentReport.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
</div>
<div class="score-card">
<div style="display:flex;justify-content:space-between;align-items:center;">
<div>
<p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#64748b;margin:0;">종합 점수</p>
<p class="score" style="margin:4px 0 0 0;">${currentReport.total_score}</p>
</div>
<span class="badge" style="background:${currentReport.risk_level === 'high' ? '#fef2f2;color:#dc2626' : currentReport.risk_level === 'medium' ? '#fffbeb;color:#ca8a04' : '#f0fdf4;color:#16a34a'}">
${currentReport.risk_level === 'high' ? '⚠️ 고위험' : currentReport.risk_level === 'medium' ? '⚡ 경계' : '✅ 정상'}
</span>
</div>
<div style="margin-top:16px;">
${Object.entries(currentReport.dimension_scores).map(([key, val]) => `
<div class="bar-container">
<span class="bar-label">${key}</span>
<div class="bar-track"><div class="bar-fill" style="width:${val}%;background:${val > 70 ? '#ef4444' : val > 50 ? '#f59e0b' : '#22c55e'};"></div></div>
<span class="bar-value">${val}</span>
</div>`).join('')}
</div>
</div>
${sections.map(s => `
<div class="section">
<div class="section-title">${s.title}</div>
<div class="section-body">${s.body}</div>
</div>`).join('')}
<div class="footer">
<p>© AIHPRO.COM · 본 리포트는 참고용이며 의학적 진단을 대체하지 않습니다.</p>
<p style="margin-top:8px;"><a href="https://aihpro.app">🧠 나도 AI 심리 분석 받아보기 →</a></p>
</div>
</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIHPRO_리포트_${activeReport + 1}회차.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML 파일이 다운로드되었습니다!');
  };

  return (
    <>
      <SEOHead title="AIHPRO 공유 리포트 데모" description="AI 기반 프리미엄 심리·발달 분석 리포트 데모" />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* 헤더 */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">AIHPRO</span>
              <Badge variant="secondary" className="text-[10px]">공유 리포트</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleDownloadHTML}>
                <Download className="w-3.5 h-3.5" />
                HTML
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                링크 복사
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-20" id="demo-report-content">
          {/* 공유 링크 배너 */}
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">공유 링크:</span>
                <code className="text-xs bg-background px-2 py-0.5 rounded border break-all">
                  {demoShareUrl}
                </code>
              </div>
              <Badge variant="outline" className="text-[10px]">영구 링크</Badge>
            </div>
          </div>

          {/* 리포트 메타 정보 */}
          <div className="pt-6 pb-4">
            <h1 className="text-xl font-bold text-foreground">
              나의 AI 심리 분석 리포트
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              프리미엄 AI 분석 엔진 기반 종합 심리 건강 리포트
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('ko-KR')}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                12회 열람
              </span>
            </div>
          </div>

          {/* 회차별 네비게이션 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {DEMO_REPORTS.map((r, i) => {
                const date = new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                return (
                  <button
                    key={i}
                    onClick={() => { setActiveReport(i); setExpandedSections(new Set([0])); }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                      activeReport === i 
                        ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                        : 'bg-card border-border/40 text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-bold">{i + 1}회차</span>
                      <span className="text-[10px] opacity-80">{date}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* 타임라인 */}
            <div className="mt-3 p-3 bg-card rounded-xl border border-border/40">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">📊 검사 이력 타임라인</p>
              <div className="flex items-center gap-1">
                {DEMO_REPORTS.map((_, i) => (
                  <React.Fragment key={i}>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      i <= activeReport ? 'bg-primary' : 'bg-muted'
                    }`} />
                    {i < DEMO_REPORTS.length - 1 && (
                      <div className={`flex-1 h-0.5 ${
                        i < activeReport ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* 리포트 본문 */}
          <div className="space-y-3">
            {/* 총점 요약 카드 */}
            <Card className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">종합 점수</p>
                    <p className="text-3xl font-black text-foreground mt-1">
                      {currentReport.total_score}
                    </p>
                  </div>
                  <Badge className={`text-xs ${
                    currentReport.risk_level === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                    currentReport.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-green-100 text-green-700 border-green-200'
                  }`}>
                    {currentReport.risk_level === 'high' ? '⚠️ 고위험' :
                     currentReport.risk_level === 'medium' ? '⚡ 경계' : '✅ 정상'}
                  </Badge>
                </div>
                {/* 영역별 점수 */}
                <div className="mt-4 space-y-2">
                  {Object.entries(currentReport.dimension_scores).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20 truncate">{key}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            val > 70 ? 'bg-red-400' : val > 50 ? 'bg-yellow-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 섹션별 콘텐츠 */}
            {sections.map((section, idx) => {
              const IconComp = SECTION_ICONS[section.icon] || FileText;
              const isOpen = expandedSections.has(idx);
              return (
                <Collapsible key={idx} open={isOpen} onOpenChange={() => toggleSection(idx)}>
                  <Card className="border-border/40 overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left">
                        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <IconComp className="w-4 h-4 text-primary" />
                          {section.title}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4 px-4">
                        <div 
                          className="text-[13px] leading-[1.8] text-foreground/85 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sanitizeAIContent(section.body) }}
                        />
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>

          {/* 푸터 */}
          <div className="mt-8 text-center space-y-3">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
              <p className="text-sm font-semibold text-foreground mb-1">
                🧠 나도 AI 심리 분석 받아보기
              </p>
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
            <p className="text-[10px] text-muted-foreground/50">
              © AIHPRO.COM · 본 리포트는 참고용이며 의학적 진단을 대체하지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoSharedReport;
