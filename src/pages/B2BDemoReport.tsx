import React, { useState, useRef, useMemo } from 'react';
import SEOHead from '@/components/common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Building2, Download, FileText, Sparkles, Users, BarChart3,
  Brain, Heart, TrendingUp, Shield, CheckCircle2, Loader2, Image as ImageIcon,
  School, Briefcase, HeartHandshake, Quote, AlertTriangle, DollarSign, Mail
} from 'lucide-react';
import CoachingBadge from '@/components/branding/CoachingBadge';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';
import { getInstitutionPool, formatKRW, type InstitutionType } from '@/data/institutionExperts';
type RequestType = 'free_trial' | 'paid_inquiry' | 'demo_download';

interface BrandConfig {
  institutionType: InstitutionType;
  institutionName: string;
  contactName: string;
  contactEmail: string;
  primaryColor: string;
  logoDataUrl: string | null;
}

const TYPE_PRESETS: Record<InstitutionType, {
  label: string; icon: any; defaultName: string; defaultContact: string;
  defaultColor: string; reportTitle: string; subjectLabel: string;
}> = {
  school: { label: '학교/교육기관', icon: School, defaultName: '○○ 초등학교', defaultContact: '홍길동 상담교사', defaultColor: '#2563eb', reportTitle: '월간 학생 발달 코칭 리포트', subjectLabel: '학생' },
  counseling: { label: '상담센터', icon: HeartHandshake, defaultName: '○○ 심리상담센터', defaultContact: '김상담 센터장', defaultColor: '#7c3aed', reportTitle: '월간 내담자 케이스 진척 리포트', subjectLabel: '내담자' },
  welfare: { label: '복지기관', icon: Heart, defaultName: '○○ 종합복지관', defaultContact: '이복지 관장', defaultColor: '#0891b2', reportTitle: '월간 이용자 케어 운영 리포트', subjectLabel: '이용자' },
  corporate: { label: '기업/HR', icon: Briefcase, defaultName: '○○ 주식회사', defaultContact: '박인사 HR팀장', defaultColor: '#0f766e', reportTitle: '월간 임직원 정신건강 종합 리포트', subjectLabel: '임직원' },
};

const TYPE_CASES: Record<InstitutionType, Array<{ id: string; name: string; age: number; score: number; risk: string; trend: string; note: string }>> = {
  school: [
    { id: 'STU-2026-0142', name: '학생 A (가명)', age: 11, score: 72, risk: 'low', trend: '+8', note: '교우관계 양호' },
    { id: 'STU-2026-0143', name: '학생 B (가명)', age: 9, score: 54, risk: 'medium', trend: '-3', note: '학습 집중력 저하' },
    { id: 'STU-2026-0144', name: '학생 C (가명)', age: 13, score: 38, risk: 'high', trend: '-12', note: '학교폭력 노출 의심' },
    { id: 'STU-2026-0145', name: '학생 D (가명)', age: 10, score: 81, risk: 'low', trend: '+15', note: '리더십 우수' },
    { id: 'STU-2026-0146', name: '학생 E (가명)', age: 12, score: 61, risk: 'medium', trend: '+2', note: '시험불안 관찰' },
  ],
  counseling: [
    { id: 'CNS-2026-0142', name: '내담자 A (가명)', age: 28, score: 64, risk: 'medium', trend: '+6', note: '회기 8회차 진행' },
    { id: 'CNS-2026-0143', name: '내담자 B (가명)', age: 35, score: 41, risk: 'high', trend: '-9', note: '우울감 재발 신호' },
    { id: 'CNS-2026-0144', name: '내담자 C (가명)', age: 22, score: 78, risk: 'low', trend: '+18', note: '종결 상담 권고' },
    { id: 'CNS-2026-0145', name: '내담자 D (가명)', age: 41, score: 56, risk: 'medium', trend: '-1', note: '부부 동반 회기 필요' },
    { id: 'CNS-2026-0146', name: '내담자 E (가명)', age: 19, score: 33, risk: 'high', trend: '-14', note: '자살사고 모니터링' },
  ],
  welfare: [
    { id: 'WEL-2026-0142', name: '이용자 A (가명)', age: 67, score: 70, risk: 'low', trend: '+5', note: '주간 프로그램 참여 우수' },
    { id: 'WEL-2026-0143', name: '이용자 B (가명)', age: 72, score: 48, risk: 'medium', trend: '-4', note: '고립감 호소' },
    { id: 'WEL-2026-0144', name: '이용자 C (가명)', age: 58, score: 82, risk: 'low', trend: '+11', note: '자조모임 리더 자원' },
    { id: 'WEL-2026-0145', name: '이용자 D (가명)', age: 79, score: 36, risk: 'high', trend: '-15', note: '인지저하 의심 — 정밀평가 권고' },
    { id: 'WEL-2026-0146', name: '이용자 E (가명)', age: 65, score: 59, risk: 'medium', trend: '+1', note: '복약 순응도 점검' },
  ],
  corporate: [],
};

const TYPE_DIMENSIONS: Record<InstitutionType, Array<{ label: string; value: number; change: string }>> = {
  school: [
    { label: '학습 집중력', value: 68, change: '+5' }, { label: '정서 안정', value: 54, change: '-2' },
    { label: '교우 관계', value: 71, change: '+8' }, { label: '행동 조절', value: 49, change: '-4' },
    { label: '자기효능감', value: 63, change: '+3' },
  ],
  counseling: [
    { label: '우울 지표(↓ 좋음)', value: 52, change: '-6' }, { label: '불안 지표(↓ 좋음)', value: 58, change: '-3' },
    { label: '회기 동맹 강도', value: 74, change: '+9' }, { label: '자기인식', value: 67, change: '+4' },
    { label: '대인관계 만족', value: 55, change: '+2' },
  ],
  welfare: [
    { label: '일상생활 수행', value: 71, change: '+3' }, { label: '사회적 연결', value: 58, change: '+6' },
    { label: '정서 안정', value: 62, change: '-1' }, { label: '신체 활력', value: 54, change: '-3' },
    { label: '인지 기능', value: 65, change: '+2' },
  ],
  corporate: [
    { label: '직무 만족도', value: 58, change: '-3' }, { label: '심리적 안정감', value: 51, change: '-5' },
    { label: '업무 몰입도', value: 64, change: '+2' }, { label: '동료 신뢰', value: 69, change: '+4' },
    { label: '워라밸 인식', value: 47, change: '-6' },
  ],
};

const TYPE_RECOMMENDATIONS: Record<InstitutionType, string[]> = {
  school: [
    '집중 관찰 학생 8명 — 담임·전문상담교사 협력 사례회의 주 1회',
    '학교폭력 의심 사례 1건 — Wee센터 연계 및 보호자 면담 즉시 권고',
    '행동 조절 영역 평균 점수 -4 하락 — 사회성 그룹 프로그램 도입 검토',
    '학부모 대상 월간 소통 리포트 자동 발송 권고',
  ],
  counseling: [
    '고위험 내담자 2명에 대한 회기 빈도 상향 + 슈퍼비전 케이스 상정',
    '자살사고 모니터링 1건 — 안전계획 재검토 및 보호자 동의 절차 진행',
    '회기 동맹 강도 평균 +9 상승 — 종결 단계 사례 5건 워크숍 발표 검토',
    '내담자 동의 기반 월간 진척 리포트 발송 자동화 권고',
  ],
  welfare: [
    '인지저하 의심 이용자 1명 — 정밀 인지평가 외부 기관 연계',
    '고립감 호소 이용자 6명 — 자조모임 신규 개설 및 가정방문 일정 조정',
    '바우처 운영 월간 보고서 자동 변환 — 행정업무 시간 80% 절감 가능',
    '가족 대상 월간 케어 가이드 발송 자동화 권고',
  ],
  corporate: [
    'CS팀·개발팀 고위험군 12명에 대한 익명 코칭 우선 매칭 (이번 주 내)',
    '워라밸 인식 평균 -6 하락 — 야근 모니터링 + 재택 정책 재검토 필요',
    '디자인팀 경력 정체감 코칭 사례 5건 — 사내 이동 프로그램 검토',
    '월간 익명 펄스 서베이 자동화 권고 (응답률 78% 유지)',
  ],
};

const TYPE_SUMMARY: Record<InstitutionType, Array<{ label: string; value: string; icon: any }>> = {
  school: [
    { label: '관리 학생 수', value: '124명', icon: Users }, { label: '평균 발달 점수', value: '63.2', icon: BarChart3 },
    { label: '집중 관찰군', value: '8명', icon: Shield }, { label: '전월 대비', value: '+4.1', icon: TrendingUp },
  ],
  counseling: [
    { label: '진행 중 케이스', value: '86건', icon: Users }, { label: '평균 회기 동맹', value: '7.2/10', icon: BarChart3 },
    { label: '고위험 사례', value: '5건', icon: AlertTriangle }, { label: '종결 권고', value: '+9건', icon: TrendingUp },
  ],
  welfare: [
    { label: '월 이용자 수', value: '218명', icon: Users }, { label: '평균 케어 점수', value: '60.8', icon: BarChart3 },
    { label: '집중 케어군', value: '14명', icon: Shield }, { label: '신규 가입', value: '+12명', icon: TrendingUp },
  ],
  corporate: [
    { label: '대상 임직원', value: '124명', icon: Users }, { label: '평균 번아웃', value: '63.2', icon: BarChart3 },
    { label: '고위험군', value: '12명', icon: AlertTriangle }, { label: '전월 대비', value: '-2.4', icon: TrendingUp },
  ],
};

const CORPORATE_DEPARTMENTS = [
  { dept: '개발팀', burnout: 78, stress: 72, satisfaction: 48, turnover: 'high' },
  { dept: '영업팀', burnout: 65, stress: 68, satisfaction: 55, turnover: 'medium' },
  { dept: '마케팅팀', burnout: 52, stress: 54, satisfaction: 67, turnover: 'low' },
  { dept: '디자인팀', burnout: 61, stress: 58, satisfaction: 62, turnover: 'medium' },
  { dept: '경영지원', burnout: 44, stress: 47, satisfaction: 71, turnover: 'low' },
  { dept: 'CS팀', burnout: 81, stress: 76, satisfaction: 42, turnover: 'high' },
];

const COACHING_SNIPPETS = [
  { persona: '5년차 개발자 / 익명', issue: '번아웃 + 이직 고민', excerpt: '"매일 야근에 의미를 못 느끼겠어요."', coachReply: '"가치관 충돌 신호예요. 무엇이 빠져있는지 정리해볼까요?"', sessions: 4, outcome: '재직 결정 + 팀 변경' },
  { persona: '3년차 영업 / 익명', issue: '상사와의 갈등', excerpt: '"보고할 때마다 위축되고 출근이 두려워요."', coachReply: '"피드백 중 사실과 해석을 분리해보는 연습부터요."', sessions: 3, outcome: '스트레스 -32%' },
  { persona: '7년차 디자이너 / 익명', issue: '경력 정체감', excerpt: '"같은 일만 7년째예요. 성장하고 있는지 모르겠어요."', coachReply: '"성장의 정의를 내적 기준으로 다시 잡아봅시다."', sessions: 5, outcome: '신규 프로젝트 리드 자원' },
];

const turnoverColor = (t: string) => t === 'high' ? 'bg-red-100 text-red-700 border-red-200' : t === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
const turnoverLabel = (t: string) => (t === 'high' ? '고위험' : t === 'medium' ? '주의' : '안정');
const heatColor = (v: number) => (v >= 70 ? 'bg-red-500' : v >= 55 ? 'bg-orange-400' : v >= 40 ? 'bg-yellow-300' : 'bg-emerald-400');
const careRiskColor = (risk: string) => risk === 'high' ? 'bg-red-100 text-red-700 border-red-200' : risk === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
const careRiskLabel = (risk: string) => risk === 'high' ? '집중 관찰' : risk === 'medium' ? '주의 관찰' : '안정';

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
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>('free_trial');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ institutionName: '', contactName: '', contactEmail: '', contactPhone: '', employeeCount: '', message: '' });

  const preset = TYPE_PRESETS[brand.institutionType];
  const isCorporate = brand.institutionType === 'corporate';

  const handleTypeChange = (type: InstitutionType) => {
    const p = TYPE_PRESETS[type];
    setBrand(prev => ({ ...prev, institutionType: type, institutionName: p.defaultName, contactName: p.defaultContact, primaryColor: p.defaultColor }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('로고 파일은 2MB 이하만 가능합니다.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setBrand(prev => ({ ...prev, logoDataUrl: reader.result as string })); toast.success('로고가 적용되었습니다.'); };
    reader.readAsDataURL(file);
  };

  const openRequestDialog = (type: RequestType) => { setRequestType(type); setRequestOpen(true); };

  const submitRequest = async () => {
    if (!form.institutionName.trim() || !form.contactName.trim() || !form.contactEmail.trim()) {
      toast.error('기관명, 담당자명, 이메일은 필수입니다.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) { toast.error('이메일 형식을 확인해 주세요.'); return; }
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      const payload = {
        id,
        institution_type: brand.institutionType,
        institution_name: form.institutionName.trim(),
        contact_name: form.contactName.trim(),
        contact_email: form.contactEmail.trim(),
        contact_phone: form.contactPhone.trim() || null,
        employee_count: form.employeeCount ? parseInt(form.employeeCount, 10) : null,
        request_type: requestType,
        message: form.message.trim() || null,
        source: 'b2b_demo_report',
      };
      const { error } = await supabase.from('b2b_demo_requests').insert(payload);
      if (error) throw error;

      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'b2b-demo-request-confirmation',
          recipientEmail: payload.contact_email,
          idempotencyKey: `b2b-confirm-${id}`,
          templateData: {
            contactName: payload.contact_name,
            institutionName: payload.institution_name,
            institutionType: payload.institution_type,
            requestType: payload.request_type,
          },
        },
      }).catch((e) => console.warn('[B2B] confirm email failed', e));

      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'b2b-demo-request-admin',
          recipientEmail: 'kijung_kku@naver.com',
          idempotencyKey: `b2b-admin-${id}`,
          templateData: {
            contactName: payload.contact_name, contactEmail: payload.contact_email,
            contactPhone: payload.contact_phone, institutionName: payload.institution_name,
            institutionType: payload.institution_type, employeeCount: payload.employee_count,
            requestType: payload.request_type, message: payload.message, source: payload.source,
          },
        },
      }).catch((e) => console.warn('[B2B] admin email failed', e));

      toast.success('신청이 접수되었습니다. 확인 메일을 보내드렸어요.', {
        description: '영업일 1일 이내 전담 매니저가 회신드립니다.',
        action: {
          label: '내 신청 내역 보기',
          onClick: () => { window.location.href = '/b2b/my-requests'; },
        },
        duration: 8000,
      });
      setRequestOpen(false);
      setForm({ institutionName: '', contactName: '', contactEmail: '', contactPhone: '', employeeCount: '', message: '' });
    } catch (e: any) {
      console.error('[B2B] request submit failed', e);
      toast.error('신청 접수에 실패했습니다', { description: e?.message || '잠시 후 다시 시도해 주세요.' });
    } finally { setSubmitting(false); }
  };

  const downloadWhiteLabelPDF = async () => {
    if (!previewRef.current) return;
    setIsGenerating(true);
    const safeName = (brand.institutionName || 'AIHPRO_Report').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_').slice(0, 40);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}_AIHPRO_DemoReport_${dateStr}.pdf`;
    const style = document.createElement('style');
    style.id = 'b2b-pdf-style';
    style.textContent = `.pdf-rendering * { animation: none !important; transition: none !important; }`;
    document.head.appendChild(style);
    previewRef.current.classList.add('pdf-rendering');
    try {
      await html2pdf().set({
        margin: [10, 10, 10, 10], filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, windowWidth: previewRef.current.scrollWidth },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      } as any).from(previewRef.current).save();
      toast.success('화이트라벨 PDF 다운로드 완료');
    } catch (err) {
      console.error('[B2BDemoReport] PDF 생성 실패:', err);
      toast.error('PDF 생성에 실패했습니다.');
    } finally {
      previewRef.current?.classList.remove('pdf-rendering');
      document.getElementById('b2b-pdf-style')?.remove();
      setIsGenerating(false);
    }
  };

  const roiData = useMemo(() => {
    const employees = 100, monthlyLoss = employees * 4500000 * 0.18;
    const monthlySaving = monthlyLoss * 0.42, programCost = 1490000, netROI = monthlySaving - programCost;
    return {
      employees, monthlyLoss: Math.round(monthlyLoss / 10000),
      monthlySaving: Math.round(monthlySaving / 10000), programCost: Math.round(programCost / 10000),
      netROI: Math.round(netROI / 10000), roiPercent: Math.round((netROI / programCost) * 100),
    };
  }, []);

  const cases = TYPE_CASES[brand.institutionType];
  const dimensions = TYPE_DIMENSIONS[brand.institutionType];
  const summaryStats = TYPE_SUMMARY[brand.institutionType];
  const recommendations = TYPE_RECOMMENDATIONS[brand.institutionType];

  return (
    <div className="min-h-screen bg-white">
      <BusinessBreadcrumb current="화이트라벨 데모 리포트" />
      <SEOHead title="기관·기업용 데모 리포트 생성기 | AIHPRO B2B"
        description="학교·상담센터·복지기관·기업을 위한 화이트라벨 리포트를 즉석 생성하고 PDF로 다운로드하세요."
        canonicalUrl="https://aihpro.app/b2b-demo-report" />

      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-3 gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> B2B SaaS · 기관 & 기업 전용
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight break-keep">
                기관·기업 데모 리포트 자동 생성기
              </h1>
              <p className="text-slate-600 mt-2 max-w-2xl break-keep">
                학교·상담센터·복지기관·기업 중 유형을 선택하면 30초 안에 화이트라벨 리포트가 완성됩니다.
                각 유형마다 분석 지표·케이스·권고가 다르게 구성됩니다.
              </p>
            </div>
            <CoachingBadge variant="card" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Label className="text-sm font-semibold mb-3 block">기관 유형 선택</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(TYPE_PRESETS) as InstitutionType[]).map(type => {
              const p = TYPE_PRESETS[type]; const Icon = p.icon; const active = brand.institutionType === type;
              return (
                <button key={type} onClick={() => handleTypeChange(type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${active ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <Icon className={`w-5 h-5 mb-2 ${active ? 'text-primary' : 'text-slate-500'}`} />
                  <p className="font-semibold text-sm text-slate-900">{p.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 break-keep">{p.reportTitle}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <aside className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> 브랜드 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="inst">{isCorporate ? '회사명' : '기관명'}</Label>
                  <Input id="inst" value={brand.institutionName} onChange={e => setBrand({ ...brand, institutionName: e.target.value })} /></div>
                <div><Label htmlFor="contact">담당자</Label>
                  <Input id="contact" value={brand.contactName} onChange={e => setBrand({ ...brand, contactName: e.target.value })} /></div>
                <div><Label htmlFor="email">담당자 이메일</Label>
                  <Input id="email" type="email" value={brand.contactEmail} onChange={e => setBrand({ ...brand, contactEmail: e.target.value })} /></div>
                <div><Label htmlFor="color">브랜드 컬러</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input id="color" type="color" value={brand.primaryColor} onChange={e => setBrand({ ...brand, primaryColor: e.target.value })} className="w-14 h-10 p-1 cursor-pointer" />
                    <Input value={brand.primaryColor} onChange={e => setBrand({ ...brand, primaryColor: e.target.value })} className="flex-1 font-mono text-xs" />
                  </div></div>
                <div><Label htmlFor="logo" className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />로고 (선택)</Label>
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer" />
                  {brand.logoDataUrl && (<div className="mt-2 p-2 border rounded-lg bg-slate-50">
                    <img src={brand.logoDataUrl} alt="logo preview" className="h-12 mx-auto object-contain" /></div>)}
                </div>
                <Separator />
                <Button onClick={downloadWhiteLabelPDF} disabled={isGenerating} className="w-full" size="lg" style={{ backgroundColor: brand.primaryColor }}>
                  {isGenerating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 생성 중...</>) : (<><Download className="w-4 h-4 mr-2" /> 화이트라벨 PDF 다운로드</>)}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => openRequestDialog('paid_inquiry')}>
                  <Mail className="w-4 h-4 mr-2" />
                  {isCorporate ? '기업 잡코치 도입 문의' : '기관 도입 상담 신청'}
                </Button>
              </CardContent>
            </Card>
          </aside>

          <main>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="w-3.5 h-3.5" /> 실시간 미리보기 — 좌측 입력값이 즉시 반영됩니다
            </div>

            <div ref={previewRef} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
              <header className="flex items-center justify-between pb-6 border-b-2" style={{ borderColor: brand.primaryColor }}>
                <div className="flex items-center gap-4">
                  {brand.logoDataUrl ? <img src={brand.logoDataUrl} alt="" className="h-14 object-contain" /> : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: brand.primaryColor }}>
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

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: brand.primaryColor }} /> Executive Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {summaryStats.map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <stat.icon className="w-4 h-4 mb-2" style={{ color: brand.primaryColor }} />
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5" style={{ color: brand.primaryColor }} />
                  {isCorporate ? '조직 심리 영역별 평균' : '영역별 평균 분석'}
                </h3>
                <div className="space-y-2.5">
                  {dimensions.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-slate-700 break-keep">{d.label}</div>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${d.value}%`, backgroundColor: brand.primaryColor }} />
                      </div>
                      <div className="w-12 text-sm font-semibold text-slate-900 text-right">{d.value}</div>
                      <div className={`w-12 text-xs font-medium text-right ${d.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{d.change}</div>
                    </div>
                  ))}
                </div>
              </section>

              {isCorporate && (
                <>
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" style={{ color: brand.primaryColor }} /> 부서별 번아웃·스트레스 히트맵
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
                              <td className="p-2"><div className="flex items-center gap-2">
                                <div className={`flex-1 h-6 rounded ${heatColor(d.burnout)}`} style={{ width: `${d.burnout}%` }} />
                                <span className="text-xs font-mono w-8 text-right">{d.burnout}</span>
                              </div></td>
                              <td className="p-2"><div className="flex items-center gap-2">
                                <div className={`flex-1 h-6 rounded ${heatColor(d.stress)}`} style={{ width: `${d.stress}%` }} />
                                <span className="text-xs font-mono w-8 text-right">{d.stress}</span>
                              </div></td>
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
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Quote className="w-5 h-5" style={{ color: brand.primaryColor }} /> 익명 1:1 휴먼 코칭 사례
                    </h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {COACHING_SNIPPETS.map((s, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px]">{s.persona}</Badge>
                            <span className="text-[10px] text-slate-500">{s.sessions}회</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700">{s.issue}</p>
                          <p className="text-xs italic text-slate-600 leading-relaxed break-keep">{s.excerpt}</p>
                          <p className="text-xs text-slate-700 leading-relaxed break-keep pt-2 border-t border-slate-200">{s.coachReply}</p>
                          <p className="text-[10px] text-emerald-700 font-semibold pt-2 border-t border-slate-200">결과: {s.outcome}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" style={{ color: brand.primaryColor }} /> ROI 추정
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                        <p className="text-[11px] text-red-700 font-semibold">현재 월 손실</p>
                        <p className="text-xl font-bold text-red-900 mt-1">{roiData.monthlyLoss.toLocaleString()}만원</p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <p className="text-[11px] text-emerald-700 font-semibold">도입 시 절감</p>
                        <p className="text-xl font-bold text-emerald-900 mt-1">{roiData.monthlySaving.toLocaleString()}만원</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-[11px] text-slate-700 font-semibold">프로그램 비용</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{roiData.programCost.toLocaleString()}만원</p>
                      </div>
                      <div className="p-4 rounded-xl text-white" style={{ backgroundColor: brand.primaryColor }}>
                        <p className="text-[11px] opacity-80 font-semibold">순 ROI</p>
                        <p className="text-xl font-bold mt-1">+{roiData.netROI.toLocaleString()}만원</p>
                        <p className="text-[10px] opacity-80 mt-0.5">+{roiData.roiPercent}%</p>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {!isCorporate && cases.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5" style={{ color: brand.primaryColor }} />
                    주요 {preset.subjectLabel} 케이스 (Top 5)
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                        <tr>
                          <th className="text-left p-3 font-semibold">케이스 ID</th>
                          <th className="text-left p-3 font-semibold">{preset.subjectLabel}</th>
                          <th className="text-center p-3 font-semibold">연령</th>
                          <th className="text-center p-3 font-semibold">점수</th>
                          <th className="text-center p-3 font-semibold">변화</th>
                          <th className="text-center p-3 font-semibold">분류</th>
                          <th className="text-left p-3 font-semibold">메모</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.map((c, i) => (
                          <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-3 font-mono text-xs text-slate-500">{c.id}</td>
                            <td className="p-3 text-slate-900">{c.name}</td>
                            <td className="p-3 text-center text-slate-700">{c.age}세</td>
                            <td className="p-3 text-center font-semibold text-slate-900">{c.score}</td>
                            <td className={`p-3 text-center font-medium ${c.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{c.trend}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${careRiskColor(c.risk)}`}>
                                {careRiskLabel(c.risk)}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-slate-600 break-keep">{c.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" style={{ color: brand.primaryColor }} />
                  {isCorporate ? 'HR 액션 권고' : `${preset.subjectLabel} 케어 권고`}
                </h3>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50 border-l-4" style={{ borderColor: brand.primaryColor }}>
                      <span className="text-sm text-slate-700 break-keep">{rec}</span>
                    </div>
                  ))}
                </div>
              </section>

              {(() => {
                const pool = getInstitutionPool(brand.institutionType);
                return (
                  <section className="space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5" style={{ color: brand.primaryColor }} />
                      추천 전문가 풀 · {preset.label} 전용
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {pool.experts.map((ex) => (
                        <div key={ex.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-slate-900">{ex.name}</p>
                              <p className="text-xs text-slate-600 break-keep">{ex.role}</p>
                            </div>
                            <Badge variant="outline" className="text-[11px]">★ {ex.rating}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ex.specialties.map((s) => (
                              <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-700">
                            <div>경력 <strong>{ex.yearsExperience}년</strong></div>
                            <div>요금 <strong>{formatKRW(ex.pricePerSession)}</strong> / {ex.sessionMinutes}분</div>
                            <div className="col-span-2">일정 · {ex.availability}</div>
                            <div className="col-span-2 text-slate-500">진행 방식 · {ex.modality.join(' / ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" style={{ color: brand.primaryColor }} />
                          기관 운영 요금제
                        </h4>
                        <div className="space-y-2">
                          {pool.pricing.map((p) => (
                            <div key={p.tier} className="text-xs border-l-4 pl-3 py-1" style={{ borderColor: brand.primaryColor }}>
                              <div className="flex justify-between"><span className="font-semibold">{p.tier}</span><span className="font-bold">{formatKRW(p.monthlyFee)}/월</span></div>
                              <ul className="list-disc list-inside text-slate-600 mt-1 break-keep">
                                {p.includes.map((it) => <li key={it}>{it}</li>)}
                              </ul>
                              {p.note && <p className="text-[11px] text-slate-500 mt-1">※ {p.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" style={{ color: brand.primaryColor }} />
                          운영 일정 · 가용 자원
                        </h4>
                        <table className="w-full text-xs">
                          <thead className="text-slate-500"><tr><th className="text-left py-1">요일</th><th className="text-left py-1">운영 시간</th><th className="text-left py-1">수용</th></tr></thead>
                          <tbody>
                            {pool.schedule.map((s) => (
                              <tr key={s.day} className="border-t border-slate-100"><td className="py-1.5 font-semibold">{s.day}</td><td className="py-1.5 text-slate-700 break-keep">{s.hours}</td><td className="py-1.5 text-slate-700 break-keep">{s.capacity}</td></tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-[11px] text-slate-500 mt-3 break-keep">📋 {pool.contractNote}</p>
                      </div>
                    </div>
                  </section>
                );
              })()}

              <footer className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-2">
                <p>본 리포트는 <strong>{brand.institutionName}</strong>의 운영 보조를 위한
                  {isCorporate ? ' 임직원 정신건강 의사결정 지원 자료' : ` ${preset.subjectLabel} 케어 의사결정 지원 자료`}이며, 의료적 진단이나 치료 권고를 대체하지 않습니다.
                </p>
                <p>분석 엔진: AIHPRO Clinical Statistical Model v3.1 · 검토 주기: 월 1회</p>
                <p className="text-right">Powered by AIHPRO · aihpro.app</p>
              </footer>
            </div>
          </main>
        </div>

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-6 md:p-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Badge className="mb-2">SaaS 도입 효과</Badge>
              <h3 className="text-xl font-bold text-slate-900">
                {isCorporate ? <>임직원당 <span className="text-blue-600">₩14,900/월</span> · 100명 기준 ROI {roiData.roiPercent}%</>
                  : <>객단가 ₩9,900 → <span className="text-blue-600">₩590,000/월</span> 전환 모델</>}
              </h3>
              <p className="text-sm text-slate-600 mt-1 break-keep">
                {isCorporate ? '번아웃·이직으로 인한 생산성 손실을 월 단위로 가시화하고 익명 코칭으로 회복합니다.'
                  : '100명 규모 기관 기준, 수기 리포트 작성 시간 월 40시간 → 0시간 절감'}
              </p>
            </div>
            <Tabs defaultValue="trial" className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="trial">무료 체험</TabsTrigger>
                <TabsTrigger value="quote">견적/도입 상담</TabsTrigger>
              </TabsList>
              <TabsContent value="trial" className="mt-3">
                <Button onClick={() => openRequestDialog('free_trial')} size="lg">14일 무료 체험 시작 →</Button>
              </TabsContent>
              <TabsContent value="quote" className="mt-3">
                <Button onClick={() => openRequestDialog('paid_inquiry')} variant="outline" size="lg">
                  {isCorporate ? '잡코치 도입 상담' : '기관 도입 상담'} →
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {requestType === 'free_trial' ? '14일 무료 체험 신청' : '도입 상담 신청'}
            </DialogTitle>
            <DialogDescription className="break-keep">
              제출 즉시 접수되며, 신청자와 관리자에게 확인 메일이 자동 발송됩니다. 영업일 1일 이내 회신드립니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">기관명 *</Label>
                <Input value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })} placeholder={preset.defaultName} className="mt-1" /></div>
              <div><Label className="text-xs">대상자 수</Label>
                <Input type="number" value={form.employeeCount} onChange={(e) => setForm({ ...form, employeeCount: e.target.value })} placeholder="120" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">담당자명 *</Label>
                <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="홍길동" className="mt-1" /></div>
              <div><Label className="text-xs">연락처</Label>
                <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="010-1234-5678" className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">이메일 *</Label>
              <Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="contact@institution.kr" className="mt-1" /></div>
            <div><Label className="text-xs">문의 내용</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="현재 운영 현황, 도입 시점, 궁금한 점 등을 자유롭게 작성해 주세요." rows={3} className="mt-1" /></div>
            <Button onClick={submitRequest} disabled={submitting} className="w-full h-11 font-bold mt-2">
              {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 접수 중...</>) : '신청 보내기'}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center break-keep">
              제출하시면 개인정보 처리방침에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default B2BDemoReport;
