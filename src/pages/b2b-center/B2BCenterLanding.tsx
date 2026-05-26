import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Upload, Calendar, FileText, BarChart3, Shield, Sparkles, PlayCircle } from "lucide-react";
import { B2B_CENTER_MONTHLY, B2B_CENTER_COMPETITOR_PRICE } from "@/constants/tokenCosts";
import CenterOnboardingStepper from "@/components/b2b-center/CenterOnboardingStepper";

const KRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

const features = [
  { icon: Upload, title: "엑셀 한 번에 이관", desc: "케어플 다운로드 파일·AIHPRO 템플릿 자동 감지. 이용자·치료사·회기·수납 일괄 업로드." },
  { icon: Calendar, title: "주간 캘린더 & 회기 관리", desc: "치료사별 색상 라인, 상태 패턴, 유료계약 만료 D-day 자동 경고." },
  { icon: BarChart3, title: "수납 통계 & 부정결제 탐지", desc: "년간·분기·월별 매출, 출석율, 전자바우처 대조로 누락 결제 자동 발견." },
  { icon: FileText, title: "부모 월간 리포트 자동 생성", desc: "회기 기록을 모아 부모용 발달 리포트 PDF. 카카오·이메일 일괄 발송." },
  { icon: Sparkles, title: "치료사 코칭 리포트", desc: "담당 회기 패턴 분석으로 강점·개선점·다음달 목표 자동 제안." },
  { icon: Shield, title: "기관별 RLS 격리", desc: "같은 센터 구성원만 데이터 접근. 치료사·관리자·소유자 역할 분리." },
];

const compare = [
  ["월 이용료", `${KRW(B2B_CENTER_COMPETITOR_PRICE)}/월`, `${KRW(B2B_CENTER_MONTHLY)}/월`],
  ["엑셀 일괄 이관", "수동 입력", "포맷 자동 감지"],
  ["부모 월간 리포트", "—", "무제한 자동 생성"],
  ["치료사 코칭 리포트", "—", "월 1회 자동"],
  ["운영 KPI 대시보드", "기본 통계", "AI 위험신호 + 주간 인사이트 메일"],
  ["부정결제 탐지", "수동 대조", "전자바우처 자동 대조"],
];

export default function B2BCenterLanding() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Helmet>
        <title>AIHPRO 발달치료센터 ERP — 케어플 대체</title>
        <meta name="description" content="이용자·회기·수납·바우처를 한 번에. 엑셀 한 파일로 전체 이관, 부모 월간 리포트 자동 생성. 월 ₩39,000." />
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8B88A]" />
          발달치료센터 전용 ERP · 베타 모집 중
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6 break-keep">
          케어플이 못 하는<br/>
          <span className="text-[#C8B88A]">임상 인텔리전스</span>까지.
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl break-keep mb-10">
          이용자 187명·치료사 31명·회기 493개. 엑셀 한 파일로 전체 이관, 캘린더부터 부모 리포트까지 자동.
          월 {KRW(B2B_CENTER_MONTHLY)} — 케어플보다 {KRW(B2B_CENTER_COMPETITOR_PRICE - B2B_CENTER_MONTHLY)} 저렴.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/b2b-center/import" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition">
            엑셀로 시작하기 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/b2b-center/app?demo=1" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition">
            <PlayCircle className="w-4 h-4" /> 데모로 둘러보기
          </Link>
        </div>

        {/* 온보딩 스테퍼 */}
        <div className="mt-16">
          <CenterOnboardingStepper step={1} />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">01 · CAPABILITIES</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 break-keep">현장에서 필요한 모든 것, 한 화면.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-neutral-100">
                <f.icon className="w-6 h-6 text-[#C8B88A] mb-4" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-600 break-keep leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-xs tracking-widest text-neutral-500 mb-3">02 · vs 케어플센터</p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-10 break-keep">같은 일을, 더 저렴하게, 더 똑똑하게.</h2>
        <div className="rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="grid grid-cols-3 bg-neutral-100 text-sm font-medium">
            <div className="p-4">항목</div>
            <div className="p-4 text-neutral-500">케어플센터</div>
            <div className="p-4 text-neutral-900">AIHPRO 센터</div>
          </div>
          {compare.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-t border-neutral-100 text-sm">
              <div className="p-4 text-neutral-700">{row[0]}</div>
              <div className="p-4 text-neutral-500">{row[1]}</div>
              <div className="p-4 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C8B88A]" /> {row[2]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-neutral-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 break-keep">
            오늘 엑셀 한 파일로<br/>전체 데이터를 옮겨보세요.
          </h2>
          <p className="text-neutral-400 mb-10 break-keep">
            업로드 5분, 분석 1분. 첫 달 무료 체험.
          </p>
          <Link to="/b2b-center/import" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-neutral-900 font-medium hover:bg-neutral-100 transition">
            지금 시작하기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
