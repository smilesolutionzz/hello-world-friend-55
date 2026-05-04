import React, { useEffect } from 'react';
import BusinessSEO from '@/components/b2b/BusinessSEO';
import B2BJobCoachSection from '@/components/b2b/B2BJobCoachSection';
import HRDataPipelineDiagram from '@/components/b2b/HRDataPipelineDiagram';
import BusinessBreadcrumb from '@/components/b2b/BusinessBreadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GOLD = '#C8B88A';

const B2BJobCoach: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <BusinessSEO
        title="AIHPRO 잡코치 — 직장 마음건강 솔루션"
        description="번아웃·이직 위험을 조기 감지하고 임상 전문가와 익명 연결하는 차세대 EAP 솔루션."
        path="/b2b-jobcoach"
      />

      <div className="min-h-screen bg-white text-foreground">
        <BusinessBreadcrumb current="잡코치 솔루션" />

        {/* 흰색 미니멀 히어로 */}
        <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="mx-auto max-w-4xl text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide text-foreground/70 mb-6"
              style={{ borderColor: `${GOLD}66` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
              For HR Leaders
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight break-keep leading-tight">
              임직원의 마음건강이 <br className="hidden md:block" />
              <span style={{ color: GOLD }}>회사의 생산성</span>입니다
            </h1>
            <p className="mt-6 text-base md:text-lg text-foreground/60 break-keep max-w-2xl mx-auto">
              AI가 위험 신호를 조기에 감지하고, 검증된 전문가가 직접 연결됩니다.
              <br className="hidden md:block" />
              직원에게는 익명성을, HR에게는 집계 데이터를.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="rounded-full px-8 h-12 bg-foreground text-background hover:bg-foreground/90"
                onClick={() => {
                  document.getElementById('jobcoach-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                플랜 살펴보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12"
                onClick={() => navigate('/b2b-demo-report')}
              >
                <FileText className="w-4 h-4 mr-2" />
                샘플 리포트 보기
              </Button>
            </div>
          </div>
        </section>

        {/* HR 데이터 파이프라인 */}
        <HRDataPipelineDiagram />

        <div id="jobcoach-section">
          <B2BJobCoachSection />
        </div>

        {/* 이미 도입한 회사용 진입 */}
        <section className="border-t border-border/60 bg-white py-14">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-sm text-foreground/60 mb-3">이미 잡코치를 도입한 회사이신가요?</p>
            <Button
              onClick={() => navigate('/b2b-hr-dashboard')}
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              HR 대시보드 바로가기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>

        {/* 도입 문의 통합 CTA */}
        <section className="px-6 py-16 bg-white border-t border-border/60">
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
    </>
  );
};

export default B2BJobCoach;
