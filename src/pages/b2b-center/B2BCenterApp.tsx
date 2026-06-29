import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, Outlet, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, BookOpen, CreditCard, Building2,
  UserCog, FileText, Upload, Sparkles, ShieldAlert, Compass, FileSpreadsheet,
  Store, Menu, X, PanelLeftClose, PanelLeftOpen, Wallet,
} from "lucide-react";
import { listMyCenters, getActiveCenterId, setActiveCenterId, resolveActiveCenter, createCenter, type CenterOrg } from "@/lib/b2bCenter/centerClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EmptyCenterState from "@/components/b2b-center/EmptyCenterState";
import DemoModeBanner from "@/components/b2b-center/DemoModeBanner";
import TrialBanner from "@/components/b2b-center/TrialBanner";
import { DEMO_CENTER, isDemoMode } from "@/lib/b2bCenter/demoData";
import { BETA_MODE } from "@/config/betaMode";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import NotificationBell from "@/components/b2b-center/NotificationBell";
import AuthMenu from "@/components/b2b-center/AuthMenu";

const NAV: Array<{ to: string; label: string; icon: any; group?: string; betaVisible: boolean }> = [
  // 시작
  { to: "setup", label: "시작 가이드", icon: Sparkles, group: "시작", betaVisible: true },
  { to: "intelligence/ops-dashboard", label: "대시보드", icon: Sparkles, group: "시작", betaVisible: false },
  { to: "guide", label: "운영 가이드", icon: Compass, group: "시작", betaVisible: false },
  // 일정
  { to: "schedule", label: "일정", icon: Calendar, group: "일정", betaVisible: true },
  // 이용자 및 상담/평가
  { to: "clients", label: "이용자 관리", icon: Users, group: "이용자 및 상담/평가", betaVisible: true },
  { to: "groups", label: "그룹(반) · 동시 전송", icon: Users, group: "이용자 및 상담/평가", betaVisible: true },
  { to: "assessments", label: "상담 및 평가 관리", icon: BookOpen, group: "이용자 및 상담/평가", betaVisible: false },
  // 재활 서비스 — 케어플 구조
  { to: "services/monthly", label: "월 서비스 관리", icon: LayoutDashboard, group: "재활 서비스", betaVisible: false },
  // 일일 서비스 관리(회기기록)는 치료노트로 통합되어 별도 메뉴 제거 (services/records → intelligence/therapy-notes 리다이렉트)
  { to: "services/by-therapist", label: "선생님별 이용자 현황", icon: UserCog, group: "재활 서비스", betaVisible: false },
  { to: "services/attendance", label: "일별 접수인원 현황", icon: Users, group: "재활 서비스", betaVisible: false },
  // 인텔리전스 / 스토어
  { to: "intelligence/therapy-notes", label: "치료노트 (회기기록·주간노트)", icon: Sparkles, group: "인텔리전스", betaVisible: true },
  { to: "intelligence/parent-reports", label: "부모 월간 리포트", icon: FileText, group: "인텔리전스", betaVisible: true },
  { to: "intelligence/parent-reports/whitelabel", label: "화이트라벨 미리보기", icon: Sparkles, group: "인텔리전스", betaVisible: true },
  { to: "storefront", label: "스토어 (프로그램·교구)", icon: Store, group: "인텔리전스", betaVisible: false },
  // 마케팅 스튜디오
  { to: "marketing/landing", label: "랜딩 페이지 만들기", icon: Sparkles, group: "마케팅 스튜디오", betaVisible: true },
  { to: "marketing/leads", label: "신규 문의함", icon: FileText, group: "마케팅 스튜디오", betaVisible: true },
  { to: "marketing/card-news", label: "카드뉴스 · SNS 카피", icon: Sparkles, group: "마케팅 스튜디오", betaVisible: true },
  // 관리자
  { to: "admin/organization", label: "기관 정보 및 옵션", icon: Building2, group: "관리자", betaVisible: false },
  { to: "admin/therapists", label: "선생님 관리 · 초대", icon: UserCog, group: "관리자", betaVisible: true },
  { to: "admin/programs", label: "프로그램 관리", icon: BookOpen, group: "관리자", betaVisible: false },
  // 데이터 연동
  { to: "data/voucher-excel", label: "전자바우처 엑셀 등록", icon: FileSpreadsheet, group: "데이터 연동", betaVisible: false },
  // 수납 — 케어플 스타일
  { to: "billing/process", label: "수납처리", icon: Wallet, group: "수납", betaVisible: false },
  { to: "billing/stats", label: "수납 통계·미수금", icon: CreditCard, group: "수납", betaVisible: false },
  { to: "billing/voucher-claims", label: "전자바우처 청구", icon: FileSpreadsheet, group: "수납", betaVisible: false },
  { to: "billing/voucher-audit", label: "부정결제 찾기", icon: ShieldAlert, group: "수납", betaVisible: false },
];


const WELCOME_KEY = "b2b_center_welcome_seen";

export default function B2BCenterApp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const demo = isDemoMode() || searchParams.get("demo") === "1";
  const { isAdmin } = useAdminCheck();

  const [centers, setCenters] = useState<CenterOrg[]>([]);
  const [adding, setAdding] = useState(false);

  async function handleAddCenter() {
    const name = window.prompt("새 기관 이름을 입력하세요");
    if (!name?.trim()) return;
    setAdding(true);
    try {
      const c = await createCenter(name.trim());
      setCenters((prev) => [...prev, c]);
      setActive(c.id);
      setActiveCenterId(c.id);
      toast({ title: "기관이 추가됐어요", description: c.name });
    } catch (e: any) {
      toast({ title: "기관 추가 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setAdding(false);
    }
  }
  const [userId, setUserId] = useState<string | null>(null);
  const [activeId, setActive] = useState<string | null>(getActiveCenterId());
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("b2b_center_nav_collapsed") === "1";
  });
  const location = useLocation();
  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);
  // Sidebar stays open by default everywhere; only collapses when the user clicks the toggle.
  const isSchedule = location.pathname.includes("/schedule");

  function toggleDesktopNav() {
    setDesktopNavCollapsed((v) => {
      const next = !v;
      localStorage.setItem("b2b_center_nav_collapsed", next ? "1" : "0");
      return next;
    });
  }


  useEffect(() => {
    if (demo) {
      setAuthed(true);
      setCenters([DEMO_CENTER]);
      setActive(DEMO_CENTER.id);
      setLoaded(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      if (data.user) {
        listMyCenters().then((cs) => {
          setCenters(cs);
          if (cs.length > 0 && !localStorage.getItem(WELCOME_KEY)) {
            setShowWelcome(true);
            localStorage.setItem(WELCOME_KEY, "1");
          }
          if (!activeId && cs[0]) { setActive(cs[0].id); setActiveCenterId(cs[0].id); }
        }).finally(() => setLoaded(true));
      } else {
        setLoaded(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  if (!loaded || authed === null) return null;

  if (!demo && authed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-3 break-keep">먼저 로그인이 필요해요</h1>
          <p className="text-neutral-600 mb-2 break-keep">센터 콘솔은 기관 구성원만 사용할 수 있어요.</p>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6 break-keep">
            ⚠️ 로그인 없이 입력한 일정·이용자 정보는 <b>저장되지 않습니다.</b> 반드시 먼저 로그인해주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <button onClick={() => navigate("/auth?redirect=/b2b-center/app")} className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium whitespace-nowrap">로그인하고 시작</button>
            <button onClick={() => navigate("/b2b-center/import")} className="px-6 py-3 rounded-full border border-neutral-200 text-sm font-medium whitespace-nowrap">60일 무료 시작</button>
            <button onClick={() => navigate("/b2b-center/app?demo=1")} className="px-6 py-3 rounded-full border border-neutral-200 text-neutral-600 text-sm font-medium whitespace-nowrap">데모만 둘러보기</button>
          </div>
        </div>
      </div>
    );
  }

  if (centers.length === 0) {
    return <EmptyCenterState onCreated={(c) => { setCenters([c]); setActive(c.id); }} />;
  }

  const baseNav = BETA_MODE ? NAV.filter((n) => n.betaVisible) : NAV;
  const visibleNav = isAdmin
    ? [...baseNav, { to: "admin/beta-tracker", label: "베타 트래커", icon: Star, group: "AIHPRO 운영", betaVisible: true }]
    : baseNav;
  const grouped = visibleNav.reduce((acc, n) => {
    const g = n.group ?? "기타";
    (acc[g] ||= []).push(n);
    return acc;
  }, {} as Record<string, typeof NAV>);

  const activeCenter = centers.find((c) => c.id === activeId) ?? centers[0];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Helmet><title>{activeCenter.name} — AIHPRO 센터 콘솔</title></Helmet>

      {demo && <DemoModeBanner />}

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 flex items-center justify-between px-4 py-3">
        <button onClick={() => setMobileNavOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-neutral-100" aria-label="메뉴 열기">
          <Menu className="w-5 h-5" />
        </button>
        <p className="text-sm font-semibold truncate">{activeCenter.name}</p>
        <div className="w-9" />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar overlay (mobile) — drawer 백드롭 */}
        {mobileNavOpen && (
          <div
            className="md:hidden fixed inset-0 z-[55] bg-black/50 animate-in fade-in-0"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
        )}
        {/* Sidebar — 모바일은 드로어(슬라이드 인), 데스크톱은 정적 사이드바 */}
        <aside
          className={`${mobileNavOpen ? "fixed translate-x-0" : "fixed -translate-x-full"} ${desktopNavCollapsed ? "md:hidden" : "md:flex md:translate-x-0"} md:static md:transform-none top-0 bottom-0 left-0 z-[60] md:z-30 w-[85vw] max-w-[320px] md:w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-out shadow-2xl md:shadow-none h-[100dvh] md:h-auto`}
        >
          <div className="p-4 border-b border-neutral-200 flex items-start justify-between gap-2 shrink-0">
            <div className="flex-1 min-w-0">
              {BETA_MODE && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C8B88A]/15 text-[#8C7A3E] text-[10px] font-semibold tracking-wider mb-2">
                  BETA
                  <span className="font-normal text-[#8C7A3E]/80">베타 모드</span>
                </span>
              )}
              <p className="text-xs text-neutral-500 mb-1 mt-1">기관</p>
              <select
                value={activeId ?? ""}
                onChange={(e) => { setActive(e.target.value); setActiveCenterId(e.target.value); }}
                className="w-full text-sm font-medium bg-transparent focus:outline-none mb-2"
                disabled={demo}
              >
                {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {!demo && (
                <button
                  onClick={handleAddCenter}
                  disabled={adding}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {adding ? "추가 중…" : "새 기관 추가"}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={toggleDesktopNav}
                className="hidden md:inline-flex p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
                aria-label="사이드바 접기"
                title="사이드바 접기"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
              <button onClick={() => setMobileNavOpen(false)} className="md:hidden p-2 -mr-2 rounded-lg hover:bg-neutral-100" aria-label="메뉴 닫기">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-4">
            {Object.entries(grouped).map(([group, items]) => {
              const isIntel = group === "인텔리전스";
              return (
                <div
                  key={group}
                  className={isIntel ? "rounded-xl bg-gradient-to-b from-[#FAF6E8] to-white border border-[#C8B88A]/30 p-2" : ""}
                >
                  <div className="flex items-center gap-1.5 px-3 mb-1">
                    {isIntel && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8B88A]" />}
                    <p className={`text-[10px] tracking-widest uppercase ${isIntel ? "text-[#8C7A3E] font-semibold" : "text-neutral-400"}`}>
                      {isIntel ? `${group} · AI` : group}
                    </p>
                    {isIntel && <span className="ml-auto text-[9px] tracking-wider text-[#8C7A3E]/70">NEW</span>}
                  </div>
                  {items.map((n) => (
                    <NavLink
                      key={n.to}
                      to={demo ? `${n.to}?demo=1` : n.to}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          isActive
                            ? isIntel
                              ? "bg-[#C8B88A] text-white shadow-sm"
                              : "bg-neutral-900 text-white"
                            : isIntel
                              ? "text-[#5B4E26] hover:bg-[#C8B88A]/15"
                              : "text-neutral-700 hover:bg-neutral-100"
                        }`
                      }
                    >
                      <n.icon className={`w-4 h-4 ${isIntel ? "text-[#C8B88A]" : ""}`} />
                      {n.label}
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </nav>
          <div
            className="p-3 border-t border-neutral-200 shrink-0"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
          >
            <button onClick={() => navigate("/b2b-center/import")} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-neutral-100 hover:bg-neutral-200">
              <Upload className="w-4 h-4" /> 엑셀 추가 업로드
            </button>
          </div>
        </aside>

        {/* Floating expand button (desktop, when sidebar collapsed) */}
        {desktopNavCollapsed && (
          <button
            onClick={toggleDesktopNav}
            className="hidden md:inline-flex fixed top-3 left-3 z-40 items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 shadow-sm text-xs text-neutral-700 hover:bg-neutral-50"
            aria-label="사이드바 열기"
            title="사이드바 열기"
          >
            <PanelLeftOpen className="w-4 h-4" />
            메뉴
          </button>
        )}

        <main
          className="flex-1 min-w-0 overflow-auto pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-0"
        >
          {!demo && activeCenter?.id && (
            <div className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-neutral-100 px-4 md:px-6 py-2 flex items-center justify-end gap-2">
              <NotificationBell centerId={activeCenter.id} />
              <AuthMenu />
            </div>
          )}
          <div className={`${isSchedule ? "max-w-none" : "max-w-5xl"} mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-4`}>
            {showWelcome && (
              <div className="rounded-2xl bg-[#FAF6E8] border border-[#C8B88A]/30 p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-widest text-[#C8B88A] mb-1">WELCOME</p>
                  <h3 className="font-semibold mb-1">센터가 준비됐어요</h3>
                  <p className="text-sm text-neutral-700 break-keep">먼저 좌측 메뉴에서 일정·이용자를 확인해보세요. 구성원 초대는 관리자 → 기관 정보에서 가능합니다.</p>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-xs text-neutral-500 hover:text-neutral-900 shrink-0">닫기</button>
              </div>
            )}
          </div>
          <Outlet context={{ centerId: activeCenter.id, demo }} />
          {!demo && (
            <div className={`${isSchedule ? "max-w-none" : "max-w-5xl"} mx-auto px-4 md:px-6 py-6`}>
              <TrialBanner
                trialEndsAt={activeCenter.trial_ends_at}
                trialStatus={activeCenter.trial_status}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
