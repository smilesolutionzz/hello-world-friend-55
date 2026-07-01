import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Check, ArrowRight, Users, Calendar, CreditCard, LogIn, LayoutDashboard,
  FileText, Sparkles, Palette, Share2, ShieldCheck, MessageSquare, Image as ImageIcon,
  UserPlus, Layers, Smartphone,
} from "lucide-react";
import { B2B_CENTER_MONTHLY } from "@/constants/tokenCosts";
import CenterOnboardingStepper from "@/components/b2b-center/CenterOnboardingStepper";
import { supabase } from "@/integrations/supabase/client";

const KRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

// 운영 핵심 3가지 — 처음 만나는 얼굴
const coreFeatures = [
  {
    icon: Users,
    num: "01",
    title: "이용자 관리",
    desc: "엑셀 한 번에 이관. 가족·바우처·계약 만료까지 한 화면. 검색·담당 치료사 필터·중복 감지·되돌리기 삭제.",
  },
  {
    icon: Calendar,
    num: "02",
    title: "일정 관리",
    desc: "주간 캘린더 + 치료사별 색상. 완료·예정·취소 원클릭 전환. 평생 반복 등록·삭제. 모바일 7일 스크롤.",
  },
  {
    icon: CreditCard,
    num: "03",
    title: "수납 관리",
    desc: "전자바우처 자동 대조로 누락·중복결제 발견. 월별 매출·미수금 한 줄 요약. 월말 마감 워크플로우.",
  },
];

// 지난 두 달간 실제로 만들어진 업그레이드
const upgradeSuite = [
  {
    icon: FileText,
    tag: "치료 기록",
    title: "치료노트 + AI 확장",
    desc: "일일 서비스와 주간 노트가 하나로. 키워드 한 줄이면 활동·회기 관찰·특이사항까지 AI가 확장. 촬영 사진도 함께 반영.",
  },
  {
    icon: Layers,
    tag: "그룹 작성",
    title: "그룹 단위 일괄 작성",
    desc: "같은 반 아이들 공통 활동은 한 번만. 개인 특이사항은 분리 저장. 프로그램명 한 줄로 전체 자동 생성도 가능.",
  },
  {
    icon: Sparkles,
    tag: "부모 리포트",
    title: "월간 리포트 · 치료별 페이지",
    desc: "미술·특수체육 등 실제 작성된 치료만 페이지로 분리. 실시간 업데이트, 재발행 즉시 부모 공유.",
  },
  {
    icon: Palette,
    tag: "화이트라벨",
    title: "기관 브랜딩 템플릿",
    desc: "로고·색상·주간/월간 노트 양식을 기관에 맞게 편집. 저장하면 실제 발행되는 리포트에 즉시 반영.",
  },
  {
    icon: Share2,
    tag: "안전 공유",
    title: "보호자 SMS + OTP 링크",
    desc: "부모 인증 후에만 열람. 6자리 인증코드, 짧은 링크, SMS 한 통에 안 끊김. 재발행 시 부모 공유 버튼 바로 노출.",
  },
  {
    icon: ShieldCheck,
    tag: "그룹 배치 발송",
    title: "반 단위 안전 발송",
    desc: "그룹으로 묶어 각 보호자에게 1:1 매칭 발송. 서버가 오배송을 원천 차단하는 3단계 확인 마법사.",
  },
  {
    icon: UserPlus,
    tag: "치료사 셀프",
    title: "치료사 초대 · 개인 계정",
    desc: "6자리 초대코드 SMS 발송 → 개인 계정 연동. 자기 아동만 조회·주간노트 작성·부모 공유까지 모바일에서.",
  },
  {
    icon: MessageSquare,
    tag: "마케팅 스튜디오",
    title: "랜딩 · 리드 인박스",
    desc: "기관 유형별 템플릿으로 상담 랜딩 즉시 발행. 문의는 실시간 인박스로. 대량 발송·SMS 자동은 제외.",
  },
  {
    icon: ImageIcon,
    tag: "카드뉴스",
    title: "치료노트 → 카드뉴스",
    desc: "실 노트를 익명화한 뒤 카드 5장 자동 생성. 실사·다큐 배경 AI 생성, 콘텐츠 기반 장면 묘사, 인스타·블로그 카피.",
  },
];

const compare = [
  ["주간 일정표 가독성", "꽉 찬 색 블록 · 이름 잘림", "흰 카드 + 좌측 컬러 바, 한눈에"],
  ["월 이용료", "고가형 (별도 문의)", "합리적 정액제 · 베타 무료"],
  ["무료 체험", "—", "60일 (카드 등록 없음)"],
  ["엑셀 일괄 이관", "수동 입력", "포맷 자동 감지 · 1클릭"],
  ["전자바우처 대조", "수동", "자동"],
  ["치료노트 AI 확장", "—", "키워드 한 줄로 자동 완성"],
  ["그룹 일괄 작성", "—", "공통/개인 영역 분리"],
  ["부모 월간 리포트", "별도 작성", "치료별 페이지 자동 생성"],
  ["화이트라벨 · 브랜딩", "—", "로고·색·양식 실시간 반영"],
  ["보호자 SMS + OTP", "—", "인증 후 열람, 짧은 링크"],
  ["치료사 개인 계정", "—", "초대코드 연동 · 자기 아동만"],
  ["마케팅 스튜디오", "—", "랜딩 + 리드 인박스 + 카드뉴스"],
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
        <title>발달치료센터 ERP · 60일 무료 — AIHPRO</title>
        <meta name="description" content="이용자·일정·수납부터 치료노트 AI·부모 리포트·화이트라벨·마케팅 스튜디오까지. 60일 무료, 카드 등록 없음." />
      </Helmet>

      {/* Top bar */}
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
          운영부터 부모 소통까지,<br/>
          <span className="text-[#C8B88A]">한 화면에서.</span>
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto break-keep mb-10">
          이용자·일정·수납 기본기 위에 치료노트 AI, 월간 리포트, 화이트라벨, 보호자 안전 공유, 마케팅 스튜디오까지.
          60일 동안 전 기능 무제한 — 그 다음에도 월 {KRW(B2B_CENTER_MONTHLY)}.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/b2b-center/import" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition">
            60일 무료로 시작 <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#upgrades" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-neutral-800 text-sm font-medium hover:bg-neutral-50 transition">
            새로 추가된 기능 보기
          </a>
        </div>

        <div className="mt-16">
          <CenterOnboardingStepper step={1} />
        </div>
      </section>

      {/* 핵심 3기능 */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">01 · 운영 핵심</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 break-keep">센터 운영의 본질, 세 가지부터.</h2>
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

      {/* 업그레이드 스위트 */}
      <section id="upgrades" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
            <p className="text-xs tracking-widest text-neutral-500">02 · 최근 업그레이드</p>
            <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wide text-[#8C7A3D] bg-[#FAF6E8] rounded-full px-2.5 py-1">
              <Smartphone className="w-3 h-3" /> 데스크톱 · 모바일 동일
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 break-keep">
            기록·리포트·브랜딩·마케팅까지 <span className="text-[#C8B88A]">한 세트</span>로.
          </h2>
          <p className="text-neutral-600 mb-12 break-keep max-w-2xl">
            지난 두 달간 실제 센터 피드백으로 붙인 기능들입니다. 별도 툴 없이 콘솔 안에서 전부 동작합니다.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {upgradeSuite.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-[#C8B88A]/60 transition">
                <div className="flex items-center gap-2 mb-4">
                  <f.icon className="w-5 h-5 text-neutral-900" strokeWidth={1.5} />
                  <span className="text-[10px] tracking-widest uppercase text-[#8C7A3D] bg-[#FAF6E8] rounded-full px-2 py-0.5">{f.tag}</span>
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-600 break-keep leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="px-6 py-20 max-w-5xl mx-auto">
        <p className="text-xs tracking-widest text-neutral-500 mb-3">03 · vs C사</p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-10 break-keep">같은 일을, 더 저렴하게 — 그리고 더 넓게.</h2>
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
