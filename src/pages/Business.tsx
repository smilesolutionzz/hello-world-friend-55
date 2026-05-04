import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Users, BarChart3, FileText, Building2, Lock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BusinessROICalculator from '@/components/b2b/BusinessROICalculator';
import BusinessSEO from '@/components/b2b/BusinessSEO';

const GOLD = '#C8B88A';

const assets = [
  {
    title: '잡코치 솔루션 소개',
    desc: '직원 익명 코칭 · 부서별 집계 리포트 · 도입 흐름',
    path: '/b2b-jobcoach',
    icon: Building2,
  },
  {
    title: 'HR 대시보드 미리보기',
    desc: '집계 지표 · 5명 미만 자동 마스킹 · 위험 신호 추적',
    path: '/b2b-hr-dashboard',
    icon: BarChart3,
  },
  {
    title: '화이트라벨 데모 리포트',
    desc: '기관 로고 적용 PDF · 영업/검토용 샘플 출력',
    path: '/b2b-demo-report',
    icon: FileText,
  },
  {
    title: '도입 문의 / 견적',
    desc: '플랜 상담 · 직원 규모별 견적 · 파일럿 제안',
    path: '/b2b-proposal',
    icon: Users,
  },
  {
    title: '도입 사례 보기',
    desc: '제조·교육·유아교육 익명 사례 · 파일럿 결과 지표',
    path: '/business/case-studies',
    icon: BookOpen,
  },
];

const steps = [
  { n: '01', t: '도입 문의', d: '직원 규모와 목표 공유, 맞춤 플랜 제안' },
  { n: '02', t: '직원 익명 코칭 시작', d: '동의 기반으로 30일 마음 트랙 가동' },
  { n: '03', t: '부서별 집계 리포트', d: 'HR은 익명·집계 데이터만 열람' },
];

const trust = [
  { icon: Lock, t: '5명 미만 자동 마스킹', d: '소규모 그룹은 통계에서 제외되어 개인 식별 불가' },
  { icon: Shield, t: '직원 동의 기반 파이프라인', d: '개인 응답은 회사가 열람 불가, 집계만 공유' },
  { icon: FileText, t: '비의료 코칭 도구', d: '진단·치료가 아닌 발달적 코칭 및 의사결정 지원' },
];

export default function Business() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-foreground">
      <BusinessSEO
        title="AIHPRO 비즈니스 — 조직 마음건강 솔루션"
        description="직원 익명 코칭과 부서별 집계 리포트로 조직 마음건강을 데이터로 관리합니다."
        path="/business"
      />

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-5xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide text-foreground/70 mb-6"
            style={{ borderColor: `${GOLD}66` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
            AIHPRO for Business
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight break-keep leading-tight">
            조직의 마음건강을 <br className="hidden md:block" />
            <span style={{ color: GOLD }}>데이터로 관리</span>합니다
          </h1>
          <p className="mt-6 text-base md:text-lg text-foreground/60 break-keep max-w-2xl mx-auto">
            익명성 보장 · HR은 집계만 열람 · 5명 미만 자동 마스킹.
            <br className="hidden md:block" />
            직원은 안전하게, 회사는 신뢰할 수 있는 지표로.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 bg-foreground text-background hover:bg-foreground/90"
              onClick={() => navigate('/b2b-proposal')}
            >
              도입 상담 신청
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-12"
              onClick={() => navigate('/b2b-demo-report')}
            >
              데모 리포트 보기
            </Button>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl">
          <BusinessROICalculator />
        </div>
      </section>

      {/* 3-Step Flow */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3 text-center">HOW IT WORKS</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 break-keep">
            3단계 도입 흐름
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((s) => (
              <Card key={s.n} className="rounded-3xl border bg-white p-7 shadow-none">
                <div
                  className="text-sm font-mono mb-4 tracking-wider"
                  style={{ color: GOLD }}
                >
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold mb-2 break-keep">{s.t}</h3>
                <p className="text-sm text-foreground/60 break-keep leading-relaxed">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Asset Cards */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3 text-center">EXPLORE</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 break-keep">
            B2B 자산 살펴보기
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {assets.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="group text-left rounded-3xl border bg-white p-7 hover:border-foreground/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ background: `${GOLD}1A` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: GOLD }} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 break-keep">{a.title}</h3>
                  <p className="text-sm text-foreground/60 break-keep leading-relaxed">{a.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3 text-center">TRUST</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 break-keep">
            왜 안전한가
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {trust.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.t} className="rounded-3xl border bg-white p-7">
                  <Icon className="h-5 w-5 mb-4" style={{ color: GOLD }} />
                  <h3 className="text-base font-semibold mb-2 break-keep">{item.t}</h3>
                  <p className="text-sm text-foreground/60 break-keep leading-relaxed">{item.d}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/business/security')}
              className="text-sm underline-offset-4 hover:underline"
              style={{ color: GOLD }}
            >
              보안·익명성 백서 전체 보기 →
            </button>
          </div>
        </div>
      </section>
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 break-keep">
            우리 조직에는 어떻게 적용될까요?
          </h2>
          <p className="text-foreground/60 mb-8 break-keep">
            직원 규모와 목표를 알려주시면 맞춤 플랜을 제안드립니다.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 h-12 bg-foreground text-background hover:bg-foreground/90"
            onClick={() => navigate('/b2b-proposal')}
          >
            도입 상담 신청
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-6 text-xs text-foreground/40">
            본 서비스는 의료적 진단·치료가 아닌 발달적 코칭 및 의사결정 지원 도구입니다.
          </p>
        </div>
      </section>
    </div>
  );
}
