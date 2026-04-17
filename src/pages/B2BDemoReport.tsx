import React, { useState, useRef } from 'react';
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
  Brain, Heart, TrendingUp, Shield, CheckCircle2, Loader2, Image as ImageIcon
} from 'lucide-react';
import { CoachingBadge } from '@/components/branding/CoachingBadge';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import { useNavigate } from 'react-router-dom';

/**
 * STEP 5: B2B 전환 퍼널 강화
 * 기관용 데모 리포트 자동 생성 + 화이트라벨 PDF 다운로드
 *
 * - 기관명/로고/담당자 입력 → 즉석에서 샘플 리포트 미리보기
 * - 화이트라벨 PDF 다운로드 (기관 브랜드 적용)
 * - ₩590,000/월 SaaS 전환 유도
 */

interface BrandConfig {
  institutionName: string;
  contactName: string;
  contactEmail: string;
  primaryColor: string;
  logoDataUrl: string | null;
}

const DEFAULT_BRAND: BrandConfig = {
  institutionName: '○○ 상담센터',
  contactName: '홍길동 센터장',
  contactEmail: 'demo@institution.kr',
  primaryColor: '#2563eb',
  logoDataUrl: null,
};

const SAMPLE_CASES = [
  { id: 'C-2026-0142', name: '학생 A (가명)', age: 11, score: 72, risk: 'low', trend: '+8' },
  { id: 'C-2026-0143', name: '학생 B (가명)', age: 9, score: 54, risk: 'medium', trend: '-3' },
  { id: 'C-2026-0144', name: '학생 C (가명)', age: 13, score: 38, risk: 'high', trend: '-12' },
  { id: 'C-2026-0145', name: '학생 D (가명)', age: 10, score: 81, risk: 'low', trend: '+15' },
  { id: 'C-2026-0146', name: '학생 E (가명)', age: 12, score: 61, risk: 'medium', trend: '+2' },
];

const DIMENSION_DATA = [
  { label: '인지 발달', value: 68, change: '+5' },
  { label: '정서 안정', value: 54, change: '-2' },
  { label: '사회성', value: 71, change: '+8' },
  { label: '행동 조절', value: 49, change: '-4' },
  { label: '자기효능감', value: 63, change: '+3' },
];

const B2BDemoReport: React.FC = () => {
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    try {
      const filename = `${brand.institutionName}_데모리포트_${new Date().toISOString().slice(0, 10)}.pdf`;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(previewRef.current)
        .save();
      toast.success('화이트라벨 PDF 다운로드 완료');
    } catch (err) {
      console.error(err);
      toast.error('PDF 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const riskColor = (risk: string) =>
    risk === 'high' ? 'bg-red-100 text-red-700 border-red-200'
    : risk === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const riskLabel = (risk: string) =>
    risk === 'high' ? '집중 관찰' : risk === 'medium' ? '주의 관찰' : '안정';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="기관용 데모 리포트 생성기 | AIHPRO B2B"
        description="학교·상담센터·복지기관을 위한 화이트라벨 발달 코칭 리포트를 즉석에서 생성하고 PDF로 다운로드하세요."
        canonicalUrl="https://aihpro.app/b2b-demo-report"
      />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-3 gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                B2B SaaS · 기관 전용
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight break-keep">
                기관 데모 리포트 자동 생성기
              </h1>
              <p className="text-slate-600 mt-2 max-w-2xl break-keep">
                기관 브랜드(로고·기관명·담당자)를 입력하면 30초 안에 화이트라벨 발달 코칭 리포트가 완성됩니다.
                실제 운영 환경에서는 누적 케이스 데이터를 기반으로 자동 생성됩니다.
              </p>
            </div>
            <CoachingBadge variant="card" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          {/* Brand config sidebar */}
          <aside className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  기관 브랜드 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inst">기관명</Label>
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
                    기관 로고 (선택)
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
                  <p>· 누적 케이스 데이터 자동 집계</p>
                  <p>· 월별/분기별 자동 발송</p>
                  <p>· 지자체·교육청 보고 양식 자동 변환</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/b2b-proposal')}
                >
                  ₩590,000/월 도입 문의 →
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
                    <p className="text-sm text-slate-500">월간 발달 코칭 종합 리포트</p>
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
                  {[
                    { label: '관리 대상', value: '124명', icon: Users },
                    { label: '평균 발달 점수', value: '63.2', icon: BarChart3 },
                    { label: '집중 관찰군', value: '8명', icon: Shield },
                    { label: '전월 대비', value: '+4.1', icon: TrendingUp },
                  ].map((stat, i) => (
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
                  영역별 평균 분석
                </h3>
                <div className="space-y-2.5">
                  {DIMENSION_DATA.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-slate-700">{d.label}</div>
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

              {/* Case table */}
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
                      {SAMPLE_CASES.map((c, i) => (
                        <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="p-3 font-mono text-xs text-slate-500">{c.id}</td>
                          <td className="p-3 text-slate-900">{c.name}</td>
                          <td className="p-3 text-center text-slate-700">{c.age}세</td>
                          <td className="p-3 text-center font-semibold text-slate-900">{c.score}</td>
                          <td className={`p-3 text-center font-medium ${
                            c.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                          }`}>{c.trend}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${riskColor(c.risk)}`}>
                              {riskLabel(c.risk)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Recommendations */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" style={{ color: brand.primaryColor }} />
                  코칭 권고 사항
                </h3>
                <div className="space-y-2">
                  {[
                    '집중 관찰군 8명에 대한 개별 코칭 세션 주 1회 이상 권장',
                    '행동 조절 영역 평균 점수 하락(-4) — 그룹 활동 프로그램 강화 필요',
                    '사회성 향상군 우수 사례 5건을 운영 매뉴얼에 반영 검토',
                    '학부모 대상 월간 코칭 가이드 발송 자동화 권고',
                  ].map((rec, i) => (
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
                  발달 코칭 의사결정 지원 자료이며, 의료적 진단이나 치료 권고를 대체하지 않습니다.
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
                객단가 ₩9,900 → <span className="text-blue-600">₩590,000/월</span> 전환 모델
              </h3>
              <p className="text-sm text-slate-600 mt-1 break-keep">
                100명 규모 기관 기준, 수기 리포트 작성 시간 월 40시간 → 0시간 절감
              </p>
            </div>
            <Tabs defaultValue="quote" className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="quote">견적 요청</TabsTrigger>
                <TabsTrigger value="trial">무료 트라이얼</TabsTrigger>
              </TabsList>
              <TabsContent value="quote" className="mt-3">
                <Button onClick={() => navigate('/b2b-proposal')} size="lg">
                  기관 도입 상담 →
                </Button>
              </TabsContent>
              <TabsContent value="trial" className="mt-3">
                <Button onClick={() => navigate('/b2b-proposal')} variant="outline" size="lg">
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
