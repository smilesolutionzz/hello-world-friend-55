import React, { useState, useRef, useMemo } from 'react';
import SEOHead from '@/components/common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2, Download, FileText, Sparkles, Users, BarChart3,
  Brain, Heart, TrendingUp, Shield, CheckCircle2, Loader2, Image as ImageIcon,
  School, Briefcase, HeartHandshake, Quote, AlertTriangle, DollarSign
} from 'lucide-react';
import CoachingBadge from '@/components/branding/CoachingBadge';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import { useNavigate } from 'react-router-dom';

/**
 * B2B 통합 데모 리포트 생성기
 * 기관 유형(학교/상담센터/복지기관/기업)을 선택하면 그에 맞는 화이트라벨 리포트가 즉석 생성됩니다.
 */

type InstitutionType = 'school' | 'counseling' | 'welfare' | 'corporate';

interface BrandConfig {
  institutionType: InstitutionType;
  institutionName: string;
  contactName: string;
  contactEmail: string;
  primaryColor: string;
  logoDataUrl: string | null;
}

const TYPE_PRESETS: Record<InstitutionType, {
  label: string;
  icon: any;
  defaultName: string;
  defaultContact: string;
  defaultColor: string;
  reportTitle: string;
  subjectLabel: string;
}> = {
  school: {
    label: '학교/교육기관',
    icon: School,
    defaultName: '○○ 초등학교',
    defaultContact: '홍길동 상담교사',
    defaultColor: '#2563eb',
    reportTitle: '월간 발달 코칭 종합 리포트',
    subjectLabel: '학생',
  },
  counseling: {
    label: '상담센터',
    icon: HeartHandshake,
    defaultName: '○○ 심리상담센터',
    defaultContact: '김상담 센터장',
    defaultColor: '#7c3aed',
    reportTitle: '월간 내담자 케어 종합 리포트',
    subjectLabel: '내담자',
  },
  welfare: {
    label: '복지기관',
    icon: Heart,
    defaultName: '○○ 종합복지관',
    defaultContact: '이복지 관장',
    defaultColor: '#0891b2',
    reportTitle: '월간 이용자 케어 종합 리포트',
    subjectLabel: '이용자',
  },
  corporate: {
    label: '기업/HR',
    icon: Briefcase,
    defaultName: '○○ 주식회사',
    defaultContact: '박인사 HR팀장',
    defaultColor: '#0f766e',
    reportTitle: '월간 임직원 정신건강 종합 리포트',
    subjectLabel: '임직원',
  },
};

/* ─── 학교/상담/복지 공통 케이스 데이터 ─── */
const CARE_CASES = [
  { id: 'C-2026-0142', name: 'A님 (가명)', age: 11, score: 72, risk: 'low', trend: '+8' },
  { id: 'C-2026-0143', name: 'B님 (가명)', age: 9, score: 54, risk: 'medium', trend: '-3' },
  { id: 'C-2026-0144', name: 'C님 (가명)', age: 13, score: 38, risk: 'high', trend: '-12' },
  { id: 'C-2026-0145', name: 'D님 (가명)', age: 10, score: 81, risk: 'low', trend: '+15' },
  { id: 'C-2026-0146', name: 'E님 (가명)', age: 12, score: 61, risk: 'medium', trend: '+2' },
];

const CARE_DIMENSIONS = [
  { label: '인지 발달', value: 68, change: '+5' },
  { label: '정서 안정', value: 54, change: '-2' },
  { label: '사회성', value: 71, change: '+8' },
  { label: '행동 조절', value: 49, change: '-4' },
  { label: '자기효능감', value: 63, change: '+3' },
];

/* ─── 기업용 데이터 ─── */
const CORPORATE_DEPARTMENTS = [
  { dept: '개발팀', burnout: 78, stress: 72, satisfaction: 48, turnover: 'high' },
  { dept: '영업팀', burnout: 65, stress: 68, satisfaction: 55, turnover: 'medium' },
  { dept: '마케팅팀', burnout: 52, stress: 54, satisfaction: 67, turnover: 'low' },
  { dept: '디자인팀', burnout: 61, stress: 58, satisfaction: 62, turnover: 'medium' },
  { dept: '경영지원', burnout: 44, stress: 47, satisfaction: 71, turnover: 'low' },
  { dept: 'CS팀', burnout: 81, stress: 76, satisfaction: 42, turnover: 'high' },
];

const CORPORATE_DIMENSIONS = [
  { label: '직무 만족도', value: 58, change: '-3' },
  { label: '심리적 안정감', value: 51, change: '-5' },
  { label: '업무 몰입도', value: 64, change: '+2' },
  { label: '동료 신뢰', value: 69, change: '+4' },
  { label: '워라밸 인식', value: 47, change: '-6' },
];

const COACHING_SNIPPETS = [
  {
    persona: '5년차 개발자 / 익명',
    issue: '번아웃 + 이직 고민',
    excerpt: '"매일 야근에 의미를 못 느끼겠어요. 이직해도 똑같을까봐 무서워요."',
    coachReply: '"지금 느끼시는 건 가치관 충돌 신호예요. 무엇이 빠져있는지 같이 정리해볼까요?"',
    sessions: 4,
    outcome: '재직 결정 + 팀 변경 요청',
  },
  {
    persona: '3년차 영업 / 익명',
    issue: '상사와의 갈등',
    excerpt: '"매번 보고할 때마다 위축되고 출근이 두려워요."',
    coachReply: '"상사의 피드백 중 사실과 해석을 분리해보는 연습부터 시작해볼게요."',
    sessions: 3,
    outcome: '소통 패턴 개선, 스트레스 -32%',
  },
  {
    persona: '7년차 디자이너 / 익명',
    issue: '경력 정체감',
    excerpt: '"같은 일만 7년째예요. 내가 성장하고 있는지 모르겠어요."',
    coachReply: '"성장의 정의를 외부 평가가 아닌 내적 기준으로 다시 잡아봅시다."',
    sessions: 5,
    outcome: '사내 신규 프로젝트 리드 자원',
  },
];

const turnoverColor = (t: string) =>
  t === 'high' ? 'bg-red-100 text-red-700 border-red-200'
  : t === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200'
  : 'bg-emerald-100 text-emerald-700 border-emerald-200';

const turnoverLabel = (t: string) =>
  t === 'high' ? '고위험' : t === 'medium' ? '주의' : '안정';

const heatColor = (v: number) => {
  if (v >= 70) return 'bg-red-500';
  if (v >= 55) return 'bg-orange-400';
  if (v >= 40) return 'bg-yellow-300';
  return 'bg-emerald-400';
};

const B2BDemoReport: React.FC = () => {
  const [brand, setBrand] = useState<BrandConfig>({
    institutionType: 'school',
    institutionName: TYPE_PRESETS.school.defaultName,
    contactName: TYPE_PRESETS.school.defaultContact,
    contactEmail: 'demo@institution.kr',
    primaryColor: TYPE_PRESETS.school.defaultColor,
    logoDataUrl: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const preset = TYPE_PRESETS[brand.institutionType];
  const isCorporate = brand.institutionType === 'corporate';

  const handleTypeChange = (type: InstitutionType) => {
    const p = TYPE_PRESETS[type];
    setBrand(prev => ({
      ...prev,
      institutionType: type,
      institutionName: p.defaultName,
      contactName: p.defaultContact,
      primaryColor: p.defaultColor,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('로고 파일은 2MB 이하만 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBrand(prev => ({ ...prev, logoDataUrl: reader.result as string }));
      toast.success('로고가 적용되었습니다.');
    };
    reader.readAsDataURL(file);
  };

  const downloadWhiteLabelPDF = async () => {
    if (!previewRef.current) return;
    setIsGenerating(true);

    // 파일명 안전 처리 (특수문자/공백/콜론 제거)
    const safeName = (brand.institutionName || 'AIHPRO_Report')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 40);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}_AIHPRO_DemoReport_${dateStr}.pdf`;

    // PDF 생성 시 색상 충돌 방지용 임시 스타일 (oklch/var() 차단)
    const style = document.createElement('style');
    style.id = 'b2b-pdf-style';
    style.textContent = `
      .pdf-rendering * {
        animation: none !important;
        transition: none !important;
      }
      .pdf-rendering .pdf-page-break {
        page-break-before: always;
        break-before: page;
      }
    `;
    document.head.appendChild(style);
    previewRef.current.classList.add('pdf-rendering');

    try {
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: previewRef.current.scrollWidth,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        } as any)
        .from(previewRef.current)
        .save();
      toast.success('화이트라벨 PDF 다운로드 완료');
    } catch (err) {
      console.error('[B2BDemoReport] PDF 생성 실패:', err);
      toast.error('PDF 생성에 실패했습니다. 새로고침 후 다시 시도해주세요.');
    } finally {
      previewRef.current?.classList.remove('pdf-rendering');
      document.getElementById('b2b-pdf-style')?.remove();
      setIsGenerating(false);
    }
  };

  /* ROI 추정 (기업용) */
  const roiData = useMemo(() => {
    const employees = 100;
    const avgSalary = 4500000; // 월 평균
    const lossRate = 0.18; // 번아웃으로 인한 생산성 손실률
    const reductionRate = 0.42; // 도입 후 절감률
    const monthlyLoss = employees * avgSalary * lossRate;
    const monthlySaving = monthlyLoss * reductionRate;
    const programCost = 1490000; // ₩14,900 × 100명
    const netROI = monthlySaving - programCost;
    return {
      employees,
      monthlyLoss: Math.round(monthlyLoss / 10000),
      monthlySaving: Math.round(monthlySaving / 10000),
      programCost: Math.round(programCost / 10000),
      netROI: Math.round(netROI / 10000),
      roiPercent: Math.round((netROI / programCost) * 100),
    };
  }, []);

  const careRiskColor = (risk: string) =>
    risk === 'high' ? 'bg-red-100 text-red-700 border-red-200'
    : risk === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const careRiskLabel = (risk: string) =>
    risk === 'high' ? '집중 관찰' : risk === 'medium' ? '주의 관찰' : '안정';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="기관·기업용 데모 리포트 생성기 | AIHPRO B2B"
        description="학교·상담센터·복지기관·기업을 위한 화이트라벨 리포트를 즉석 생성하고 PDF로 다운로드하세요."
        canonicalUrl="https://aihpro.app/b2b-demo-report"
      />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-3 gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                B2B SaaS · 기관 & 기업 전용
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight break-keep">
                기관·기업 데모 리포트 자동 생성기
              </h1>
              <p className="text-slate-600 mt-2 max-w-2xl break-keep">
                학교·상담센터·복지기관·기업 중 유형을 선택하면 30초 안에 화이트라벨 리포트가 완성됩니다.
                기업 모드에서는 조직 번아웃 히트맵, 이직 위험 예측, 익명 코칭 스니펫, ROI 추정까지 포함됩니다.
              </p>
            </div>
            <CoachingBadge variant="card" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 기관 유형 선택 */}
        <div className="mb-6">
          <Label className="text-sm font-semibold mb-3 block">기관 유형 선택</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(TYPE_PRESETS) as InstitutionType[]).map(type => {
              const p = TYPE_PRESETS[type];
              const Icon = p.icon;
              const active = brand.institutionType === type;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    active
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${active ? 'text-primary' : 'text-slate-500'}`} />
                  <p className="font-semibold text-sm text-slate-900">{p.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 break-keep">{p.reportTitle}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          {/* Brand config sidebar */}
          <aside className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  브랜드 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inst">{isCorporate ? '회사명' : '기관명'}</Label>
                  <Input
                    id="inst"
                    value={brand.institutionName}
                    onChange={e => setBrand({ ...brand, institutionName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact">담당자</Label>
                  <Input
                    id="contact"
                    value={brand.contactName}
                    onChange={e => setBrand({ ...brand, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">담당자 이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={brand.contactEmail}
                    onChange={e => setBrand({ ...brand, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="color">브랜드 컬러</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input
                      id="color"
                      type="color"
                      value={brand.primaryColor}
                      onChange={e => setBrand({ ...brand, primaryColor: e.target.value })}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={brand.primaryColor}
                      onChange={e => setBrand({ ...brand, primaryColor: e.target.value })}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="logo" className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    로고 (선택)
                  </Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                  />
                  {brand.logoDataUrl && (
                    <div className="mt-2 p-2 border rounded-lg bg-slate-50">
                      <img src={brand.logoDataUrl} alt="logo preview" className="h-12 mx-auto object-contain" />
                    </div>
                  )}
                </div>

                <Separator />

                <Button
                  onClick={downloadWhiteLabelPDF}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 생성 중...</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> 화이트라벨 PDF 다운로드</>
                  )}
                </Button>

                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5">
                  <p className="font-semibold text-slate-700">실제 도입 시 자동화 항목</p>
                  {isCorporate ? (
                    <>
                      <p>· 부서별 익명 진단 데이터 자동 집계</p>
                      <p>· 월별 HR 대시보드 + 이직 위험 알림</p>
                      <p>· 익명 코칭 세션 자동 매칭 + 리포트</p>
                    </>
                  ) : (
                    <>
                      <p>· 누적 케이스 데이터 자동 집계</p>
                      <p>· 월별/분기별 자동 발송</p>
                      <p>· 지자체·교육청 보고 양식 자동 변환</p>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(isCorporate ? '/b2b-jobcoach' : '/b2b-proposal')}
                >
                  {isCorporate ? '기업 잡코치 도입 문의 →' : '₩590,000/월 도입 문의 →'}
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Live Preview */}
          <main>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="w-3.5 h-3.5" />
              실시간 미리보기 — 좌측 입력값이 즉시 반영됩니다
            </div>

            <div
              ref={previewRef}
              className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8"
            >
              {/* White-label header */}
              <header
                className="flex items-center justify-between pb-6 border-b-2"
                style={{ borderColor: brand.primaryColor }}
              >
                <div className="flex items-center gap-4">
                  {brand.logoDataUrl ? (
                    <img src={brand.logoDataUrl} alt="" className="h-14 object-contain" />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: brand.primaryColor }}
                    >
                      {brand.institutionName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{brand.institutionName}</h2>
                    <p className="text-sm text-slate-500">{preset.reportTitle}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>리포트 ID: AIH-{new Date().getFullYear()}-{Math.floor(Math.random() * 9000 + 1000)}</p>
                  <p className="mt-1">발행일: {new Date().toLocaleDateString('ko-KR')}</p>
                  <p className="mt-1">담당: {brand.contactName}</p>
                </div>
              </header>

              {/* Executive summary */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: brand.primaryColor }} />
                  Executive Summary
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {(isCorporate ? [
                    { label: '대상 임직원', value: '124명', icon: Users },
                    { label: '평균 번아웃', value: '63.2', icon: BarChart3 },
                    { label: '고위험군', value: '12명', icon: AlertTriangle },
                    { label: '전월 대비', value: '-2.4', icon: TrendingUp },
                  ] : [
                    { label: '관리 대상', value: '124명', icon: Users },
                    { label: '평균 발달 점수', value: '63.2', icon: BarChart3 },
                    { label: '집중 관찰군', value: '8명', icon: Shield },
                    { label: '전월 대비', value: '+4.1', icon: TrendingUp },
                  ]).map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <stat.icon className="w-4 h-4 mb-2" style={{ color: brand.primaryColor }} />
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Dimension breakdown */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5" style={{ color: brand.primaryColor }} />
                  {isCorporate ? '조직 심리 영역별 평균' : '영역별 평균 분석'}
                </h3>
                <div className="space-y-2.5">
                  {(isCorporate ? CORPORATE_DIMENSIONS : CARE_DIMENSIONS).map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-28 text-sm text-slate-700">{d.label}</div>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${d.value}%`, backgroundColor: brand.primaryColor }}
                        />
                      </div>
                      <div className="w-12 text-sm font-semibold text-slate-900 text-right">{d.value}</div>
                      <div className={`w-12 text-xs font-medium text-right ${
                        d.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                      }`}>{d.change}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ===== 기업 전용 섹션 ===== */}
              {isCorporate && (
                <>
                  {/* 부서별 번아웃·스트레스 히트맵 */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" style={{ color: brand.primaryColor }} />
                      부서별 번아웃·스트레스 히트맵
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                          <tr>
                            <th className="text-left p-3 font-semibold">부서</th>
                            <th className="text-center p-3 font-semibold">번아웃</th>
                            <th className="text-center p-3 font-semibold">스트레스</th>
                            <th className="text-center p-3 font-semibold">만족도</th>
                            <th className="text-center p-3 font-semibold">이직 위험</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CORPORATE_DEPARTMENTS.map((d, i) => (
                            <tr key={d.dept} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="p-3 font-semibold text-slate-900">{d.dept}</td>
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <div className={`flex-1 h-6 rounded ${heatColor(d.burnout)}`} style={{ width: `${d.burnout}%` }} />
                                  <span className="text-xs font-mono w-8 text-right">{d.burnout}</span>
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <div className={`flex-1 h-6 rounded ${heatColor(d.stress)}`} style={{ width: `${d.stress}%` }} />
                                  <span className="text-xs font-mono w-8 text-right">{d.stress}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center font-semibold text-slate-900">{d.satisfaction}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${turnoverColor(d.turnover)}`}>
                                  {turnoverLabel(d.turnover)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      * 색상이 진할수록 위험도가 높음. 개별 임직원 데이터는 익명 처리되어 부서 단위로만 집계됩니다.
                    </p>
                  </section>

                  {/* 이직 위험도 예측 + Top 3 액션 */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" style={{ color: brand.primaryColor }} />
                      이직 위험도 예측 + 추천 액션 Top 3
                    </h3>
                    <div className="p-4 rounded-xl border-2" style={{ borderColor: brand.primaryColor }}>
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-3xl font-bold" style={{ color: brand.primaryColor }}>23%</span>
                        <span className="text-sm text-slate-600">향후 6개월 내 이직 가능성 (전사 평균)</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { rank: 1, action: 'CS팀 야간 응대 인력 충원 — 번아웃 81 임계치 초과', impact: '예상 이직 -8명' },
                          { rank: 2, action: '개발팀 1:1 익명 코칭 우선 배정 (월 2회 → 주 1회)', impact: '예상 이직 -5명' },
                          { rank: 3, action: '전사 워라밸 캠페인 + 재택 옵션 확대', impact: '예상 이직 -4명' },
                        ].map(a => (
                          <div key={a.rank} className="flex gap-3 p-3 rounded-lg bg-slate-50">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: brand.primaryColor }}>
                              {a.rank}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-900 font-medium break-keep">{a.action}</p>
                              <p className="text-xs text-emerald-700 mt-0.5">→ {a.impact}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* 익명 1:1 코칭 사례 */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Quote className="w-5 h-5" style={{ color: brand.primaryColor }} />
                      익명 1:1 휴먼 코칭 사례 스니펫
                    </h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {COACHING_SNIPPETS.map((s, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px]">{s.persona}</Badge>
                            <span className="text-[10px] text-slate-500">{s.sessions}회 진행</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700">{s.issue}</p>
                          <p className="text-xs italic text-slate-600 leading-relaxed break-keep">{s.excerpt}</p>
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-[10px] text-slate-500 mb-1">코치 응답</p>
                            <p className="text-xs text-slate-700 leading-relaxed break-keep">{s.coachReply}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-[10px] text-emerald-700 font-semibold">결과: {s.outcome}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      * 모든 상담은 익명 처리되며 HR에는 부서 단위 통계만 공유됩니다.
                    </p>
                  </section>

                  {/* ROI 추정 */}
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" style={{ color: brand.primaryColor }} />
                      ROI 추정 (생산성 손실 절감액)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                        <p className="text-[11px] text-red-700 font-semibold">현재 월 손실</p>
                        <p className="text-xl font-bold text-red-900 mt-1">{roiData.monthlyLoss.toLocaleString()}만원</p>
                        <p className="text-[10px] text-red-600 mt-0.5">번아웃 생산성 -18%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <p className="text-[11px] text-emerald-700 font-semibold">도입 시 절감</p>
                        <p className="text-xl font-bold text-emerald-900 mt-1">{roiData.monthlySaving.toLocaleString()}만원</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">42% 회복 가정</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[11px] text-slate-700 font-semibold">프로그램 비용</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{roiData.programCost.toLocaleString()}만원</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{roiData.employees}명 × ₩14,900</p>
                      </div>
                      <div className="p-4 rounded-xl text-white" style={{ backgroundColor: brand.primaryColor }}>
                        <p className="text-[11px] opacity-80 font-semibold">순 ROI</p>
                        <p className="text-xl font-bold mt-1">+{roiData.netROI.toLocaleString()}만원</p>
                        <p className="text-[10px] opacity-80 mt-0.5">월간 +{roiData.roiPercent}%</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      * 100명 기준, 평균 월급 450만원, 번아웃 생산성 손실률 18% 가정. 실제 도입 시 사전 진단 데이터로 재산출.
                    </p>
                  </section>
                </>
              )}

              {/* ===== 학교/상담/복지 케이스 테이블 ===== */}
              {!isCorporate && (
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5" style={{ color: brand.primaryColor }} />
                    주요 케이스 요약 (Top 5)
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                        <tr>
                          <th className="text-left p-3 font-semibold">케이스 ID</th>
                          <th className="text-left p-3 font-semibold">대상자</th>
                          <th className="text-center p-3 font-semibold">연령</th>
                          <th className="text-center p-3 font-semibold">발달점수</th>
                          <th className="text-center p-3 font-semibold">변화</th>
                          <th className="text-center p-3 font-semibold">분류</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CARE_CASES.map((c, i) => (
                          <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-3 font-mono text-xs text-slate-500">{c.id}</td>
                            <td className="p-3 text-slate-900">{c.name}</td>
                            <td className="p-3 text-center text-slate-700">{c.age}세</td>
                            <td className="p-3 text-center font-semibold text-slate-900">{c.score}</td>
                            <td className={`p-3 text-center font-medium ${
                              c.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                            }`}>{c.trend}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${careRiskColor(c.risk)}`}>
                                {careRiskLabel(c.risk)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Recommendations */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" style={{ color: brand.primaryColor }} />
                  {isCorporate ? 'HR 액션 권고' : '코칭 권고 사항'}
                </h3>
                <div className="space-y-2">
                  {(isCorporate ? [
                    'CS팀·개발팀 고위험군 12명에 대한 익명 코칭 우선 매칭 (이번 주 내)',
                    '워라밸 인식 평균 -6 하락 — 야근 모니터링 + 재택 정책 재검토 필요',
                    '디자인팀 경력 정체감 코칭 사례 5건 — 사내 이동 프로그램 검토',
                    '월간 익명 펄스 서베이 자동화 권고 (응답률 78% 유지)',
                  ] : [
                    '집중 관찰군 8명에 대한 개별 코칭 세션 주 1회 이상 권장',
                    '행동 조절 영역 평균 점수 하락(-4) — 그룹 활동 프로그램 강화 필요',
                    '사회성 향상군 우수 사례 5건을 운영 매뉴얼에 반영 검토',
                    '학부모 대상 월간 코칭 가이드 발송 자동화 권고',
                  ]).map((rec, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50 border-l-4" style={{ borderColor: brand.primaryColor }}>
                      <span className="text-sm text-slate-700 break-keep">{rec}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Footer / Disclaimer */}
              <footer className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-2">
                <p>
                  본 리포트는 <strong>{brand.institutionName}</strong>의 운영 보조를 위한
                  {isCorporate ? ' 임직원 정신건강 의사결정 지원 자료' : ' 발달 코칭 의사결정 지원 자료'}이며,
                  의료적 진단이나 치료 권고를 대체하지 않습니다.
                  {isCorporate && ' 모든 개별 응답은 익명 처리되며 HR에는 집계 통계만 제공됩니다.'}
                </p>
                <p>분석 엔진: AIHPRO Clinical Statistical Model v3.1 · 검토 주기: 월 1회</p>
                <p className="text-right">Powered by AIHPRO · aihpro.app</p>
              </footer>
            </div>
          </main>
        </div>

        {/* Bottom value proposition */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-6 md:p-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Badge className="mb-2">SaaS 도입 효과</Badge>
              <h3 className="text-xl font-bold text-slate-900">
                {isCorporate ? (
                  <>임직원당 <span className="text-blue-600">₩14,900/월</span> · 100명 기준 ROI {roiData.roiPercent}%</>
                ) : (
                  <>객단가 ₩9,900 → <span className="text-blue-600">₩590,000/월</span> 전환 모델</>
                )}
              </h3>
              <p className="text-sm text-slate-600 mt-1 break-keep">
                {isCorporate
                  ? '번아웃·이직으로 인한 생산성 손실을 월 단위로 가시화하고 익명 코칭으로 회복합니다.'
                  : '100명 규모 기관 기준, 수기 리포트 작성 시간 월 40시간 → 0시간 절감'}
              </p>
            </div>
            <Tabs defaultValue="quote" className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="quote">견적 요청</TabsTrigger>
                <TabsTrigger value="trial">무료 트라이얼</TabsTrigger>
              </TabsList>
              <TabsContent value="quote" className="mt-3">
                <Button onClick={() => navigate(isCorporate ? '/b2b-jobcoach' : '/b2b-proposal')} size="lg">
                  {isCorporate ? '잡코치 도입 상담 →' : '기관 도입 상담 →'}
                </Button>
              </TabsContent>
              <TabsContent value="trial" className="mt-3">
                <Button onClick={() => navigate(isCorporate ? '/b2b-jobcoach' : '/b2b-proposal')} variant="outline" size="lg">
                  14일 무료 체험 신청 →
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default B2BDemoReport;
