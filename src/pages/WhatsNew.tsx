import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Building2, Home, UserCog, Calendar } from "lucide-react";
import {
  MIND_TRACK_7_PRICE,
  MIND_TRACK_PRICE,
  MIND_TRACK_EXTEND_PRICE,
} from "@/constants/tokenCosts";

const GOLD = "#C8B88A";

interface Section {
  kicker: string;
  icon: any;
  title: string;
  lead: string;
  before: string;
  after: string;
  impact: string;
  to: string;
  cta: string;
  bullets: string[];
  /** 미팅 시 카드 클릭 후 보여줄 라이브 데모 스크립트 (순서대로 읽으면 됨). */
  demoScript: string[];
}

const sections: Section[] = [
  {
    kicker: "01 · MIND TRACK",
    icon: Sparkles,
    title: "7일 · 2주 마인드 트랙 워크북",
    lead: "FIFA 카드처럼 뒤집히는 액션 카드 + Hybrid Day 구조로 완주율을 끌어올린 PMF 핵심 제품.",
    before: "단건 검사 결제 → 1회성 리포트",
    after: "코칭 → 일지 → 피드백 3-step 세션이 매일 이어지는 워크북",
    impact: `PMF 베타 기간 전액 무료 · 보조 30일 ₩${MIND_TRACK_PRICE.toLocaleString()} · 7일 완주자 업셀 ₩${MIND_TRACK_EXTEND_PRICE.toLocaleString()}`,
    to: "/mind-track/workbook",
    cta: "워크북 열기",
    bullets: [
      "7일 트랙: Day 1·4·7 무거움 / 2·3·5·6 가벼움 (audience별 미션 풀)",
      "2주 트랙: 14일 4세션(Day 1·4·8·11) — 비세션은 쉬는 날+회고",
      "액션 처방 카드 — 탭하면 카드가 뒤집히며 솔루션 공개",
      "Day 4 페이월은 PMF 기간 비활성, 카드 없이 즉시 체험",
    ],
    demoScript: [
      "오늘의 Day 헤더 — 'Day N · 키워드' 와 진행 게이지 확인",
      "상단 3-step 탭(코칭 → 일지 → 피드백) 한 바퀴 보여주기",
      "액션 처방 카드 한 장 탭 → 뒷면 솔루션 공개(게이미피케이션 포인트)",
      "오른쪽 상단 '트랙 전환'에서 7일 ↔ 2주 토글이 가능한 것 시연",
    ],
  },
  {
    kicker: "02 · B2B CENTER",
    icon: Building2,
    title: "발달치료센터 콘솔 + 케어플 엑셀 호환",
    lead: "60일 무료 트라이얼, 케어플 일일/월 서비스관리 엑셀을 그대로 인식하는 임포트 마법사.",
    before: "ERP 신규 도입 = 데이터 수기 이관 + 학습 비용",
    after: "케어플 표준 템플릿 업로드 → 헤더 자동 매핑 → 즉시 콘솔 활성",
    impact: "운영 핵심 3기능(이용자·일정·수납)으로 진입 장벽 최소화",
    to: "/b2b-center/app?demo=1",
    cta: "데모 콘솔 들어가기",
    bullets: [
      "엑셀 임포트: '일일서비스관리' 8컬럼 표준 자동 인식",
      "콘솔 구조: 운영 / 재활 서비스 / 수납 / 관리자 / 인텔리전스",
      "부정결제 찾기 · 부모 리포트 · 선생님별 이용자 통계",
      "60일 무료 트라이얼 배너 + 구성원 초대",
    ],
    demoScript: [
      "상단 트라이얼 배너 — 60일 카운트다운 노출 확인",
      "좌측 사이드바 5개 그룹(운영/재활/수납/관리자/인텔리전스) 한 번 훑기",
      "운영 > 일일 서비스 관리 → '엑셀 가져오기' 버튼 → 케어플 템플릿 업로드 시연",
      "헤더가 자동 매핑되어 미리보기에 표가 채워지는 흐름 강조",
      "수납 > 부정결제 찾기, 부모 리포트, 선생님별 통계 메뉴 가볍게 클릭",
    ],
  },
  {
    kicker: "03 · HOME ENTRY",
    icon: Home,
    title: "홈 → 워크북 1탭 직행",
    lead: "MobileHome 캠페인 카드를 모바일·PC 공통으로 워크북으로 바로 보내 진입 마찰 제거.",
    before: "홈 → 마인드 트랙 랜딩 → 시작 버튼 → 워크북",
    after: "홈 캠페인 카드 → 워크북 (1탭)",
    impact: "PMF 베타 가입→1일차 활성화 전환율 개선",
    to: "/home",
    cta: "홈 진입 확인",
    bullets: [
      "캠페인 카드 = 모바일·데스크탑 공통 직링크",
      "Sparkles 아이콘 반응형, hover shadow",
      "복귀 사용자 동선: '지금 바로 이어서 하기'",
    ],
    demoScript: [
      "모바일 뷰포트로 전환 → 홈 상단 캠페인 카드 위치 확인",
      "카드 1탭 → 중간 랜딩 없이 바로 /mind-track/workbook 로 진입하는지 시연",
      "복귀 사용자 시나리오: 진행 중인 Day로 자동 이어가기 동선 설명",
    ],
  },
  {
    kicker: "04 · EXPERT NETWORK",
    icon: UserCog,
    title: "전문가 시간팩 구독 모델",
    lead: "단건 상담 결제 → 시간 단위 구독 패키지로 단가·LTV 동시 상승.",
    before: "전문가 상담 1회 단건 결제",
    after: "5/10/20/30시간 패키지 — 시간당 ₩39,000",
    impact: "구독자 추가 할인 + 월 무료 크레딧 자동 지급",
    to: "/expert-hiring",
    cta: "전문가 매칭 보기",
    bullets: [
      "시간팩: 5h / 10h / 20h / 30h",
      "홈티 이용 시 1.5배 차감",
      "AI 매칭(`match-consultation-expert`) — 번아웃·수면·성인 상담 태깅",
    ],
    demoScript: [
      "/expert-hiring 진입 → 상단 4종 시간팩(5/10/20/30h) 가격표 비교",
      "AI 매칭 입력창에 고민 한 줄 입력 → 추천 전문가 1~3명 노출 시연",
      "구독자 가격 토글로 할인 적용가가 자동 변경되는 것 보여주기",
      "홈티 선택 시 시간이 1.5배로 차감되는 룰 설명",
    ],
  },
];

interface RoadmapItem {
  when: string;
  area: string;
  title: string;
  detail: string;
}

const roadmap: RoadmapItem[] = [
  {
    when: "6월 1–2주",
    area: "MAIN UI",
    title: "메인 UI 간소화 · 통합",
    detail:
      "홈/랜딩 다중 진입점 → '마인드 트랙 1개 핵심 CTA + 보조 2개' 구조로 정리, 모바일 헤더·바텀바 톤 통일.",
  },
  {
    when: "6월 2–3주",
    area: "B2B CENTER",
    title: "케어플 호환 확장 + 수납 자동화",
    detail:
      "월 서비스관리 템플릿 매핑, 부정결제 자동 탐지 룰셋 v2, 부모 리포트 PDF 일괄 발송, 60일 트라이얼 → 유료 전환 플로우.",
  },
  {
    when: "6월 3–4주",
    area: "STORE",
    title: "스토어(이용권/상품) 리뉴얼",
    detail:
      "mind_track 단일 라인업 + 전문가 시간팩을 한 화면에서 비교·결제. 옛 단건/월·연 상품 잔재 제거, 가격은 코드 상수에서 동적 노출.",
  },
  {
    when: "7월 1–2주",
    area: "QA",
    title: "QA 스프린트 + 회귀 테스트 셋업",
    detail:
      "결제·워크북·B2B 임포트 핵심 시나리오 E2E, 모바일/PC 크로스 디바이스 체크리스트, Sentry·로그 모니터링 정비.",
  },
  {
    when: "7월 2–4주",
    area: "APP",
    title: "Capacitor 기반 모바일 앱 빌드",
    detail:
      "iOS/Android 앱 패키징, 소셜 로그인(외부 브라우저) 검증, 푸시 알림(워크북 Day 리마인더) 1차, 스토어 심사 자료 준비.",
  },
  {
    when: "8월",
    area: "EXPERT",
    title: "전문가 매칭 고도화",
    detail:
      "AI 매칭 응답 품질 튜닝, 구독자 월 무료 크레딧 자동 지급 안정화, 홈티 1.5배 차감 규칙의 결제·정산 정합성 점검.",
  },
];

export default function WhatsNew() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>2026.05 Product Update — AIHPRO</title>
        <meta name="description" content="AIHPRO 2026년 5월 UI·UX 업데이트 — 마인드 트랙 워크북, B2B 센터, 전문가 시간팩 구독." />
      </Helmet>

      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <p
          className="text-xs tracking-[0.3em] mb-4"
          style={{ color: GOLD }}
        >
          AIHPRO · PRODUCT UPDATE · 2026.05
        </p>
        <h1
          className="text-4xl md:text-6xl leading-tight break-keep mb-6"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          최근 변경된 UI·UX
          <br />
          한눈에 보기
        </h1>
        <p className="text-base md:text-lg text-neutral-600 max-w-2xl break-keep">
          공동 파트너 공유용 라이브 투어. 각 섹션을 누르면 실제 화면으로 이동하고,
          카드 안의 <b>데모 스크립트</b>를 그대로 따라가며 보여주면 됩니다.
          PMF 베타 기간 동안 7일 마인드 트랙은 카드 없이 무료로 제공됩니다.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/mind-track/workbook"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 text-white text-sm hover:bg-neutral-800"
          >
            지금 워크북 열기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/b2b-center/app?demo=1"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-neutral-200 text-sm hover:border-neutral-400"
          >
            B2B 콘솔 데모
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-neutral-200" />
      </div>

      {/* Sections */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.kicker}
              to={s.to}
              className="group block bg-white rounded-3xl border border-neutral-200 hover:border-neutral-400 hover:shadow-xl transition-all p-8 md:p-10"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p
                    className="text-[10px] tracking-[0.3em] mb-3"
                    style={{ color: GOLD }}
                  >
                    {s.kicker}
                  </p>
                  <h2
                    className="text-2xl md:text-3xl leading-snug break-keep"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {s.title}
                  </h2>
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${GOLD}1A` }}
                >
                  <Icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
              </div>

              <p className="text-neutral-700 break-keep mb-6 md:text-lg">{s.lead}</p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-[10px] tracking-widest text-neutral-400 mb-1">BEFORE</p>
                  <p className="text-sm text-neutral-700 break-keep">{s.before}</p>
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: `${GOLD}14` }}
                >
                  <p
                    className="text-[10px] tracking-widest mb-1"
                    style={{ color: GOLD }}
                  >
                    AFTER
                  </p>
                  <p className="text-sm text-neutral-900 break-keep">{s.after}</p>
                </div>
                <div className="rounded-2xl bg-neutral-900 text-white p-4">
                  <p className="text-[10px] tracking-widest text-white/60 mb-1">IMPACT</p>
                  <p className="text-sm break-keep">{s.impact}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {s.bullets.map((b) => (
                  <li key={b} className="text-sm text-neutral-700 flex gap-3 break-keep">
                    <span
                      className="mt-2 w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: GOLD }}
                    />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Demo script (미팅에서 그대로 따라 읽기) */}
              <div
                className="rounded-2xl p-5 mb-6 border"
                style={{ borderColor: `${GOLD}55`, backgroundColor: `${GOLD}0D` }}
              >
                <p
                  className="text-[10px] tracking-[0.3em] mb-3"
                  style={{ color: GOLD }}
                >
                  LIVE DEMO SCRIPT — 클릭 후 이 순서대로
                </p>
                <ol className="space-y-2">
                  {s.demoScript.map((step, i) => (
                    <li
                      key={step}
                      className="text-sm text-neutral-800 break-keep flex gap-3"
                    >
                      <span
                        className="shrink-0 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-medium"
                        style={{ backgroundColor: GOLD, color: "white" }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 group-hover:gap-3 transition-all">
                {s.cta}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </main>

      {/* Roadmap — 앞으로 해야 할 개발 */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5" style={{ color: GOLD }} />
          <p className="text-xs tracking-[0.3em]" style={{ color: GOLD }}>
            UPCOMING · 6–8월 개발 로드맵
          </p>
        </div>
        <h2
          className="text-3xl md:text-4xl leading-snug break-keep mb-8"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          앞으로 해야 할 것들
        </h2>

        <div className="rounded-3xl border border-neutral-200 overflow-hidden">
          {roadmap.map((r, i) => (
            <div
              key={r.title}
              className={`grid md:grid-cols-[120px_140px_1fr] gap-4 p-6 md:p-7 ${
                i !== roadmap.length - 1 ? "border-b border-neutral-200" : ""
              }`}
            >
              <div className="text-sm font-medium text-neutral-900">{r.when}</div>
              <div
                className="text-[10px] tracking-[0.25em] self-start px-2 py-1 rounded-full inline-block w-fit"
                style={{ backgroundColor: `${GOLD}1F`, color: "#8a7a4a" }}
              >
                {r.area}
              </div>
              <div>
                <p className="text-base font-medium text-neutral-900 mb-1 break-keep">
                  {r.title}
                </p>
                <p className="text-sm text-neutral-600 break-keep leading-relaxed">
                  {r.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <footer className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-neutral-200 p-8 bg-neutral-50">
          <p className="text-xs tracking-widest text-neutral-400 mb-2">NOTE</p>
          <p className="text-sm text-neutral-700 break-keep leading-relaxed">
            본 페이지는 공동 파트너 공유용 라이브 투어로, 메인 네비게이션에는 노출되지 않습니다.
            가격·정책은 모두 코드 상수(`src/constants/tokenCosts.ts`)에서 동적으로 읽으며,
            PMF 베타 기간 동안 7일 마인드 트랙은 결제 게이트 없이 제공됩니다.
            상단 카드 = 이미 적용된 변경, 하단 로드맵 = 앞으로 6–8월 작업 예정 사항입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
