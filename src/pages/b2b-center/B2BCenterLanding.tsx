import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Users, Calendar, CreditCard, PlayCircle } from "lucide-react";
import { B2B_CENTER_MONTHLY, B2B_CENTER_COMPETITOR_PRICE } from "@/constants/tokenCosts";
import CenterOnboardingStepper from "@/components/b2b-center/CenterOnboardingStepper";

const KRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

// 이수석 피드백: "2-3개로 추리는게 핵심" — 운영 핵심 3가지만
const coreFeatures = [
  {
    icon: Users,
    num: "01",
    title: "이용자 관리",
    desc: "엑셀 한 번에 이관. 가족·바우처·계약 만료까지 한 화면. C사 다운로드 파일 그대로 인식.",
  },
  {
    icon: Calendar,
    num: "02",
    title: "일정 관리",
    desc: "주간 캘린더 + 치료사별 색상. 회기 상태·노쇼·대체 일정 자동 정리. 모바일에서도 그대로.",
  },
  {
    icon: CreditCard,
    num: "03",
    title: "수납 관리",
    desc: "전자바우처 자동 대조로 누락·중복결제 발견. 월별 매출·미수금 한 줄 요약.",
  },
];

const compare = [
  ["주간 일정표 가독성", "꽉 찬 색 블록 · 이름 잘림", "흰 카드 + 좌측 컬러 바, 한눈에"],
  ["월 이용료", `${KRW(B2B_CENTER_COMPETITOR_PRICE)}/월`, `${KRW(B2B_CENTER_MONTHLY)}/월`],
  ["무료 체험", "—", "60일 (카드 등록 없음)"],
  ["엑셀 일괄 이관", "수동 입력", "포맷 자동 감지 · 1클릭"],
  ["전자바우처 대조", "수동", "자동"],
  ["부모 월간 리포트", "별도 작성", "AI 자동 생성"],
  ["전문가 매칭", "—", "AIHPRO 전문가 네트워크 연결"],
  ["보호자 앱", "—", "B2C 앱 무료 제공"],
];

export default function B2BCenterLanding() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Helmet>
        <title>발달치료센터 ERP · 60일 무료 — AIHPRO</title>
        <meta name="description" content="이용자·일정·수납. 기존 ERP 엑셀 그대로 이관, 60일 무료 체험. 카드 등록 없음." />
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6E8] text-xs text-[#8C7A3D] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8B88A]" />
          60일 무료 · 카드 등록 없음 · 베타 모집 중
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6 break-keep">
          이용자·일정·수납.<br/>
          <span className="text-[#C8B88A]">한 화면, 60일 무료.</span>
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto break-keep mb-10">
          기존 ERP 엑셀 파일 하나 올리면 이용자·치료사·회기·수납이 그대로 옮겨와요.
          두 달 동안 모든 기능 무제한 — 그 다음에도 월 {KRW(B2B_CENTER_MONTHLY)}.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/b2b-center/import" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition">
            60일 무료로 시작 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/b2b-center/app?demo=1" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition">
            <PlayCircle className="w-4 h-4" /> 데모로 둘러보기
          </Link>
        </div>


        <div className="mt-16">
          <CenterOnboardingStepper step={1} />
        </div>
      </section>

      {/* 핵심 3기능 */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">01 · 운영 핵심</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 break-keep">센터 운영의 본질, 세 가지만.</h2>
          <p className="text-neutral-600 mb-12 break-keep max-w-xl">
            나머지 기능은 이 세 가지가 잡힌 다음에 따라옵니다. 처음 한 달, 이 셋부터 익혀보세요.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {coreFeatures.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 border border-neutral-100">
                <p className="text-xs tracking-widest text-[#C8B88A] mb-4">{f.num}</p>
                <f.icon className="w-7 h-7 text-neutral-900 mb-5" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-600 break-keep leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-xs tracking-widest text-neutral-500 mb-3">02 · vs C사</p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-10 break-keep">같은 일을, 더 저렴하게.</h2>
        <div className="rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="grid grid-cols-3 bg-neutral-100 text-sm font-medium">
            <div className="p-4">항목</div>
            <div className="p-4 text-neutral-500">C사</div>
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
          <p className="text-xs tracking-widest text-[#C8B88A] mb-4">FREE TRIAL · 60 DAYS</p>
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 break-keep">
            카드 없이, 두 달.<br/>충분히 써보고 결정하세요.
          </h2>
          <p className="text-neutral-400 mb-10 break-keep">
            업로드 5분, 분석 1분. 60일 동안 전 기능 무제한.
          </p>
          <Link to="/b2b-center/import" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-neutral-900 font-medium hover:bg-neutral-100 transition">
            엑셀 한 파일로 시작 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
