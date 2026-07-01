import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, ArrowRight, Users, Calendar, CreditCard, LogIn, LayoutDashboard,
  FileText, Sparkles, Palette, Share2, ShieldCheck, MessageSquare, Image as ImageIcon,
  UserPlus, Layers, Smartphone, Plus,
} from "lucide-react";
import { B2B_CENTER_MONTHLY } from "@/constants/tokenCosts";
import CenterOnboardingStepper from "@/components/b2b-center/CenterOnboardingStepper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const KRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

type CoreItem = {
  icon: typeof Users;
  num: string;
  title: string;
  desc: string;
  guide: { step: string; text: string }[];
};

const coreFeatures: CoreItem[] = [
  {
    icon: Users, num: "01", title: "이용자 관리",
    desc: "엑셀 한 번에 이관. 가족·바우처·계약 만료까지 한 화면. 검색·담당 치료사 필터·중복 감지·되돌리기 삭제.",
    guide: [
      { step: "1", text: "이용자 페이지에서 '엑셀 업로드' → 포맷 자동 감지" },
      { step: "2", text: "이름/연락처 검색 · 담당 치료사 필터로 즉시 조회" },
      { step: "3", text: "저장 전 중복(연락처·생년월일) 자동 경고" },
      { step: "4", text: "삭제 시 10초 되돌리기(Undo)로 오조작 방지" },
    ],
  },
  {
    icon: Calendar, num: "02", title: "일정 관리",
    desc: "주간 캘린더 + 치료사별 색상. 완료·예정·취소 원클릭 전환. 평생 반복 등록·삭제. 모바일 7일 스크롤.",
    guide: [
      { step: "1", text: "일정표 엑셀 업로드 즉시 해당 주로 자동 이동" },
      { step: "2", text: "치료사별 색상으로 스케줄 겹침을 한눈에" },
      { step: "3", text: "매주 반복 등록 = 5년치 자동 생성 · 삭제도 시리즈 전체" },
      { step: "4", text: "일정 카드에서 완료/예정/취소 세그먼트로 원클릭 전환" },
    ],
  },
  {
    icon: CreditCard, num: "03", title: "수납 관리",
    desc: "전자바우처 자동 대조로 누락·중복결제 발견. 월별 매출·미수금 한 줄 요약. 월말 마감 워크플로우.",
    guide: [
      { step: "1", text: "결제/미수금 페이지에서 이달 매출 · 미수금 한 줄 요약" },
      { step: "2", text: "전자바우처 청구는 draft → approved 워크플로우" },
      { step: "3", text: ".xlsx 청구서 자동 생성 · 본인부담금 기본 10%" },
      { step: "4", text: "월말 마감 스냅샷으로 회계 마감을 확정" },
    ],
  },
];

type UpgradeItem = {
  icon: typeof Users;
  tag: string;
  title: string;
  desc: string;
  guide: { step: string; text: string }[];
};

const upgradeSuite: UpgradeItem[] = [
  {
    icon: FileText, tag: "치료 기록", title: "치료노트 + AI 확장",
    desc: "일일 서비스와 주간 노트가 하나로. 키워드 한 줄이면 활동·회기 관찰·특이사항까지 AI가 확장.",
    guide: [
      { step: "1", text: "이번 주 회기 기록에 활동 키워드 한 줄만 입력" },
      { step: "2", text: "AI 확장 버튼으로 활동·회기 관찰·특이사항 동시 생성" },
      { step: "3", text: "촬영한 회기 사진을 첨부하면 주간 노트에 자동 반영" },
    ],
  },
  {
    icon: Layers, tag: "그룹 작성", title: "그룹 단위 일괄 작성",
    desc: "같은 반 아이들 공통 활동은 한 번만. 개인 특이사항은 분리 저장. 프로그램명 한 줄로 전체 자동 생성도 가능.",
    guide: [
      { step: "1", text: "이용자 페이지에서 반(그룹) 배정" },
      { step: "2", text: "치료노트 → 그룹 작성으로 공통 영역 한 번만 입력" },
      { step: "3", text: "개인 특이사항은 아동별 분리 저장으로 섞임 원천 차단" },
    ],
  },
  {
    icon: Sparkles, tag: "부모 리포트", title: "월간 리포트 · 치료별 페이지",
    desc: "미술·특수체육 등 실제 작성된 치료만 페이지로 분리. 실시간 업데이트, 재발행 즉시 부모 공유.",
    guide: [
      { step: "1", text: "주간 노트가 작성된 치료 트랙만 월간 리포트에 포함" },
      { step: "2", text: "2개 이상은 페이지 분리(미술 / 특수체육 각 1페이지)" },
      { step: "3", text: "부모 화면은 Realtime — 재발행 시 즉시 반영" },
    ],
  },
  {
    icon: Palette, tag: "화이트라벨", title: "기관 브랜딩 템플릿",
    desc: "로고·색상·주간/월간 노트 양식을 기관에 맞게 편집. 저장하면 실제 발행되는 리포트에 즉시 반영.",
    guide: [
      { step: "1", text: "화이트라벨 페이지에서 로고·색상·헤더 편집" },
      { step: "2", text: "주간/월간 템플릿 항목을 켜고 끄기, 추가 섹션 삽입" },
      { step: "3", text: "저장 시 발행되는 모든 리포트에 스냅샷으로 고정" },
    ],
  },
  {
    icon: Share2, tag: "안전 공유", title: "보호자 SMS + OTP 링크",
    desc: "부모 인증 후에만 열람. 6자리 인증코드, 짧은 링크, SMS 한 통에 안 끊김.",
    guide: [
      { step: "1", text: "리포트에서 '부모 공유' → SMS로 짧은 링크 발송" },
      { step: "2", text: "부모는 6자리 OTP 인증 후에만 리포트 열람" },
      { step: "3", text: "열람 여부는 대시보드에서 실시간 확인" },
    ],
  },
  {
    icon: ShieldCheck, tag: "그룹 배치 발송", title: "반 단위 안전 발송",
    desc: "그룹으로 묶어 각 보호자에게 1:1 매칭 발송. 서버가 오배송을 원천 차단하는 3단계 확인 마법사.",
    guide: [
      { step: "1", text: "반(그룹) 선택 → 대상 보호자 자동 매칭" },
      { step: "2", text: "3단계 확인 마법사(대상·내용·발송) 통과 필수" },
      { step: "3", text: "서버가 아동↔보호자 1:1 검증 후 개별 링크 발송" },
    ],
  },
  {
    icon: UserPlus, tag: "치료사 셀프", title: "치료사 초대 · 개인 계정",
    desc: "6자리 초대코드 SMS 발송 → 개인 계정 연동. 자기 아동만 조회·주간노트 작성·부모 공유까지 모바일에서.",
    guide: [
      { step: "1", text: "치료사 관리에서 SMS로 6자리 초대코드 발송" },
      { step: "2", text: "치료사가 홈에서 코드 입력 → 자기 계정 연동" },
      { step: "3", text: "본인 담당 아동만 조회 · 주간노트 · 부모 공유" },
    ],
  },
  {
    icon: MessageSquare, tag: "마케팅 스튜디오", title: "랜딩 · 리드 인박스",
    desc: "기관 유형별 템플릿으로 상담 랜딩 즉시 발행. 문의는 실시간 인박스로.",
    guide: [
      { step: "1", text: "기관 유형 템플릿 선택 → 프로그램 정보 입력" },
      { step: "2", text: "aihpro.app/lp/{slug} 공개 랜딩 즉시 발행" },
      { step: "3", text: "리드는 실시간 인박스에서 상태 관리" },
    ],
  },
  {
    icon: ImageIcon, tag: "카드뉴스", title: "치료노트 → 카드뉴스",
    desc: "실 노트를 익명화한 뒤 카드 5장 자동 생성. 실사·다큐 배경 AI 생성, 인스타·블로그 카피.",
    guide: [
      { step: "1", text: "주간 노트 선택 → PII 검토 게이트 통과 필수" },
      { step: "2", text: "카드 5장 자동 생성 · 실사/다큐 배경 AI 선택" },
      { step: "3", text: "인스타·블로그 등 채널별 카피 함께 출력" },
    ],
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

// 스크롤 리빌 래퍼
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ExpandableCard({
  icon: Icon, title, tag, num, desc, guide, accent = "gold",
}: {
  icon: typeof Users; title: string; tag?: string; num?: string;
  desc: string; guide: { step: string; text: string }[]; accent?: "gold" | "dark";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="bg-white rounded-2xl border border-neutral-200 hover:border-[#C8B88A]/60 transition-all cursor-pointer overflow-hidden"
        onClick={() => setOpen(true)}
      >
        <div className="p-6 md:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {num && <p className="text-xs tracking-widest text-[#C8B88A] mb-3">{num}</p>}
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-neutral-900" strokeWidth={1.5} />
                {tag && (
                  <span className="text-[10px] tracking-widest uppercase text-[#8C7A3D] bg-[#FAF6E8] rounded-full px-2 py-0.5">
                    {tag}
                  </span>
                )}
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-neutral-600 break-keep leading-relaxed">{desc}</p>
            </div>
            <div className="shrink-0 w-8 h-8 rounded-full grid place-items-center border border-neutral-200 text-neutral-500">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-4 text-[11px] tracking-widest text-neutral-400">TAP TO OPEN USE GUIDE</p>
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-5 h-5 text-neutral-900" strokeWidth={1.5} />
              {tag && (
                <span className="text-[10px] tracking-widest uppercase text-[#8C7A3D] bg-[#FAF6E8] rounded-full px-2 py-0.5">
                  {tag}
                </span>
              )}
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 break-keep">{desc}</DialogDescription>
          </DialogHeader>
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <p className="text-[11px] tracking-widest text-neutral-400 mb-4">USE GUIDE</p>
            <ol className="space-y-3">
              {guide.map((g, i) => (
                <li key={i} className="flex gap-3 text-sm text-neutral-700">
                  <span className={`shrink-0 w-6 h-6 rounded-full grid place-items-center text-[11px] font-semibold ${
                    accent === "gold" ? "bg-[#FAF6E8] text-[#8C7A3D]" : "bg-neutral-900 text-white"
                  }`}>
                    {g.step}
                  </span>
                  <span className="break-keep leading-relaxed">{g.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6E8] text-xs text-[#8C7A3D] mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8B88A]" />
          60일 무료 · 카드 등록 없음 · 베타 모집 중
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6 break-keep"
        >
          운영부터 부모 소통까지,<br/>
          <span className="text-[#C8B88A]">한 화면에서.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
          className="text-lg text-neutral-600 max-w-2xl mx-auto break-keep mb-10"
        >
          이용자·일정·수납 기본기 위에 치료노트 AI, 월간 리포트, 화이트라벨, 보호자 안전 공유, 마케팅 스튜디오까지.
          60일 동안 전 기능 무제한 — 그 다음에도 월 {KRW(B2B_CENTER_MONTHLY)}.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Link to="/b2b-center/import" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition">
            60일 무료로 시작 <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#upgrades" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-neutral-800 text-sm font-medium hover:bg-neutral-50 transition">
            새로 추가된 기능 보기
          </a>
        </motion.div>

        <div className="mt-16">
          <CenterOnboardingStepper step={1} />
        </div>
      </section>

      {/* 핵심 3기능 */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-widest text-neutral-500 mb-3">01 · 운영 핵심</p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 break-keep">센터 운영의 본질, 세 가지부터.</h2>
            <p className="text-neutral-600 mb-4 break-keep max-w-xl">
              나머지 기능은 이 세 가지가 잡힌 다음에 따라옵니다. 카드를 눌러 사용 가이드를 확인하세요.
            </p>
            <p className="text-xs text-[#8C7A3D] mb-10 inline-flex items-center gap-1.5">
              <Plus className="w-3 h-3" /> 카드를 탭하면 단계별 가이드가 열립니다
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {coreFeatures.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <ExpandableCard
                  icon={f.icon} title={f.title} num={f.num}
                  desc={f.desc} guide={f.guide} accent="dark"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 업그레이드 스위트 */}
      <section id="upgrades" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <Reveal>
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
              지난 두 달간 실제 센터 피드백으로 붙인 기능들입니다. 카드를 눌러 상세 가이드를 확인하세요.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {upgradeSuite.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.06}>
                <ExpandableCard
                  icon={f.icon} title={f.title} tag={f.tag}
                  desc={f.desc} guide={f.guide}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="px-6 py-20 max-w-5xl mx-auto">
        <Reveal>
          <p className="text-xs tracking-widest text-neutral-500 mb-3">03 · vs C사</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-10 break-keep">같은 일을, 더 저렴하게 — 그리고 더 넓게.</h2>
        </Reveal>
        <div className="rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="grid grid-cols-3 bg-neutral-100 text-sm font-medium">
            <div className="p-4">항목</div>
            <div className="p-4 text-neutral-500">C사</div>
            <div className="p-4 text-neutral-900">AIHPRO 센터</div>
          </div>
          {compare.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              className="grid grid-cols-3 border-t border-neutral-100 text-sm"
            >
              <div className="p-4 text-neutral-700">{row[0]}</div>
              <div className="p-4 text-neutral-500">{row[1]}</div>
              <div className="p-4 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C8B88A]" /> {row[2]}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-neutral-900 text-white">
        <Reveal>
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
        </Reveal>
      </section>
    </div>
  );
}
