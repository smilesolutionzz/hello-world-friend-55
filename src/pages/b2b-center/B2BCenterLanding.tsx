import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, ArrowRight, FileText, ShieldCheck, CreditCard, Upload, LogIn, LayoutDashboard } from "lucide-react";
import { B2B_CENTER_MONTHLY, B2B_CENTER_COMPETITOR_PRICE } from "@/constants/tokenCosts";
import CenterOnboardingStepper from "@/components/b2b-center/CenterOnboardingStepper";
import { supabase } from "@/integrations/supabase/client";

const KRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

// 틔움 김선길 대표 피드백 반영: "원장이 돈 내는 이유 = 행정 고통 해방"
// 부모리포트는 보조, 원장 행정 자동화 4종을 wedge로.
const coreFeatures = [
  {
    icon: FileText,
    num: "01",
    title: "바우처 일지 자동 작성",
    desc: "한 줄 메모 또는 사진 한 장 → AI가 회기 일지 장문으로 자동 작성. 출력해서 철하면 끝. 6개월치 몰아쓰기도 일자별 백필.",
  },
  {
    icon: ShieldCheck,
    num: "02",
    title: "지도점검 대응 키트",
    desc: "연 1회 감사, 더 이상 야근 금지. 누락 서류 자동 진단 + 행정서류 양식 자동 생성. D-30 준비 가이드까지.",
  },
  {
    icon: CreditCard,
    num: "03",
    title: "수납·미수금 자동화",
    desc: "매달 본인부담금 안내 문자 자동 발송, 입금 대조, 미수금 독촉까지. 원장이 직접 챙길 일 없게.",
  },
  {
    icon: Upload,
    num: "04",
    title: "케어플에서 1클릭 이전",
    desc: "기존 케어플 데이터 그대로 이관. 이용자·치료사·회기·바우처 — AI가 컬럼 자동 매핑, 초기 셋팅 0분.",
  },
];

const compare = [
  ["월 이용료", `${KRW(B2B_CENTER_COMPETITOR_PRICE)}/월`, `${KRW(B2B_CENTER_MONTHLY)}/월`],
  ["무료 체험", "—", "60일 (카드 등록 없음)"],
  ["케어플에서 이관", "수동 입력", "AI 매핑 · 1클릭"],
  ["바우처 일지 작성", "원장·치료사 직접", "한 줄 메모 → AI 장문 자동"],
  ["지도점검 대응", "수기 준비", "체크리스트 + 누락 서류 자동 생성"],
  ["수납 안내·미수금", "수기 문자·전화", "자동 발송 + 입금 대조"],
  ["전자바우처 대조", "수동", "자동"],
  ["부모 월간 리포트", "별도 작성", "AI 자동 생성 (보조)"],
];

export default function B2BCenterLanding() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setIsAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleConsoleEntry = () => {
    if (isAuthed) navigate("/b2b-center/app");
    else navigate("/auth?redirect=/b2b-center/app");
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Helmet>
        <title>발달치료센터 행정 자동화 ERP · 60일 무료 — AIHPRO Center</title>
        <meta name="description" content="바우처 일지·지도점검·수납을 AI가 대신. 케어플에서 1클릭 이전, 60일 무료, 월 ₩39,000. 원장님이 서류지옥에서 해방되는 센터 ERP." />
      </Helmet>

      {/* Top bar with console entry */}
      <header className="absolute top-0 inset-x-0 z-20 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/b2b-center" className="text-sm font-semibold tracking-tight text-neutral-900">
          AIHPRO <span className="text-[#C8B88A]">Center</span>
        </Link>
        <button
          onClick={handleConsoleEntry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition"
        >
          {isAuthed ? (
            <><LayoutDashboard className="w-3.5 h-3.5" /> 콘솔 입장</>
          ) : (
            <><LogIn className="w-3.5 h-3.5" /> 로그인 후 콘솔 입장</>
          )}
        </button>
      </header>


      {/* Hero */}
      <section className="px-6 pt-24 pb-20 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6E8] text-xs text-[#8C7A3D] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8B88A]" />
          60일 무료 · 카드 등록 없음 · 베타 모집 중
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6 break-keep">
          바우처 일지·지도점검·수납.<br/>
          <span className="text-[#C8B88A]">AI가 다 합니다.</span>
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto break-keep mb-10">
          한 줄 메모만 쓰면 AI가 일지를 풀어 쓰고, 지도점검 서류를 자동 정리하고,
          매달 수납 문자를 대신 보냅니다. 케어플 데이터는 1클릭으로 이전, 60일 무료 후에도 월 {KRW(B2B_CENTER_MONTHLY)}.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/b2b-center/import" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition">
            60일 무료로 시작 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>


        <div className="mt-16">
          <CenterOnboardingStepper step={1} />
        </div>
      </section>

      {/* 핵심 4기능 — 원장 행정 자동화 */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">01 · 원장이 매일 하던 일, AI가 대신</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 break-keep">서류지옥에서 해방되는 네 가지.</h2>
          <p className="text-neutral-600 mb-12 break-keep max-w-xl">
            현장 원장님들의 실제 페인을 그대로 자동화했습니다. 일지·감사·수납·이관 — 이 넷이 잡히면, 센터 운영의 80%가 끝납니다.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 border border-neutral-100">
                <p className="text-xs tracking-widest text-[#C8B88A] mb-4">{f.num}</p>
                <f.icon className="w-7 h-7 text-neutral-900 mb-5" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold mb-2 break-keep">{f.title}</h3>
                <p className="text-sm text-neutral-600 break-keep leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-xs tracking-widest text-neutral-500 mb-3">02 · vs 케어플</p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-10 break-keep">같은 일을, 원장님 손 떼고.</h2>
        <div className="rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="grid grid-cols-3 bg-neutral-100 text-sm font-medium">
            <div className="p-4">항목</div>
            <div className="p-4 text-neutral-500">케어플</div>
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
