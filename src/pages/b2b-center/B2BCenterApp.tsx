import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, BookOpen, CreditCard, Building2,
  UserCog, FileText, Upload, Sparkles, ShieldAlert, Compass,
} from "lucide-react";
import { listMyCenters, getActiveCenterId, setActiveCenterId, type CenterOrg } from "@/lib/b2bCenter/centerClient";
import { supabase } from "@/integrations/supabase/client";
import EmptyCenterState from "@/components/b2b-center/EmptyCenterState";
import DemoModeBanner from "@/components/b2b-center/DemoModeBanner";
import TrialBanner from "@/components/b2b-center/TrialBanner";
import { DEMO_CENTER, isDemoMode } from "@/lib/b2bCenter/demoData";

const NAV: Array<{ to: string; label: string; icon: any; group?: string }> = [
  { to: "intelligence/ops-dashboard", label: "대시보드", icon: Sparkles, group: "시작" },
  { to: "guide", label: "운영 가이드", icon: Compass, group: "시작" },
  { to: "schedule", label: "일정", icon: Calendar, group: "운영" },
  { to: "clients", label: "이용자", icon: Users, group: "운영" },
  { to: "assessments", label: "상담·평가", icon: BookOpen, group: "운영" },
  { to: "services/monthly", label: "월 서비스", icon: LayoutDashboard, group: "재활 서비스" },
  { to: "services/by-therapist", label: "선생님별 이용자", icon: UserCog, group: "재활 서비스" },
  { to: "services/attendance", label: "일별 접수인원", icon: Users, group: "재활 서비스" },
  { to: "billing/stats", label: "수납 통계", icon: CreditCard, group: "수납" },
  { to: "billing/voucher-audit", label: "부정결제 찾기", icon: ShieldAlert, group: "수납" },
  { to: "admin/therapists", label: "선생님 관리", icon: UserCog, group: "관리자" },
  { to: "admin/programs", label: "프로그램", icon: BookOpen, group: "관리자" },
  { to: "admin/organization", label: "기관 정보", icon: Building2, group: "관리자" },
  { to: "intelligence/parent-reports", label: "부모 리포트", icon: FileText, group: "인텔리전스" },
];

const WELCOME_KEY = "b2b_center_welcome_seen";

export default function B2BCenterApp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const demo = isDemoMode() || searchParams.get("demo") === "1";

  const [centers, setCenters] = useState<CenterOrg[]>([]);
  const [activeId, setActive] = useState<string | null>(getActiveCenterId());
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

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
          <h1 className="text-2xl font-semibold mb-3 break-keep">로그인이 필요합니다</h1>
          <p className="text-neutral-600 mb-6 break-keep">센터 콘솔은 기관 구성원만 사용할 수 있어요. 먼저 로그인하고 진행해주세요.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/auth?redirect=/b2b-center/app")} className="px-6 py-3 rounded-full bg-neutral-900 text-white">로그인</button>
            <button onClick={() => navigate("/b2b-center/app?demo=1")} className="px-6 py-3 rounded-full border border-neutral-200">데모 둘러보기</button>
          </div>
        </div>
      </div>
    );
  }

  if (centers.length === 0) {
    return <EmptyCenterState onCreated={(c) => { setCenters([c]); setActive(c.id); }} />;
  }

  const grouped = NAV.reduce((acc, n) => {
    const g = n.group ?? "기타";
    (acc[g] ||= []).push(n);
    return acc;
  }, {} as Record<string, typeof NAV>);

  const activeCenter = centers.find((c) => c.id === activeId) ?? centers[0];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Helmet><title>{activeCenter.name} — AIHPRO 센터 콘솔</title></Helmet>

      {demo && <DemoModeBanner />}

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
          <div className="p-4 border-b border-neutral-200">
            <p className="text-xs text-neutral-500 mb-1">기관</p>
            <select
              value={activeId ?? ""}
              onChange={(e) => { setActive(e.target.value); setActiveCenterId(e.target.value); }}
              className="w-full text-sm font-medium bg-transparent focus:outline-none"
              disabled={demo}
            >
              {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="text-[10px] tracking-widest text-neutral-400 px-3 mb-1 uppercase">{group}</p>
                {items.map((n) => (
                  <NavLink
                    key={n.to}
                    to={demo ? `${n.to}?demo=1` : n.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`
                    }
                  >
                    <n.icon className="w-4 h-4" />
                    {n.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-3 border-t border-neutral-200">
            <button onClick={() => navigate("/b2b-center/import")} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-neutral-100 hover:bg-neutral-200">
              <Upload className="w-4 h-4" /> 엑셀 추가 업로드
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          {showWelcome && (
            <div className="max-w-5xl mx-auto px-6 pt-6">
              <div className="rounded-2xl bg-[#FAF6E8] border border-[#C8B88A]/30 p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-widest text-[#C8B88A] mb-1">WELCOME</p>
                  <h3 className="font-semibold mb-1">센터가 준비됐어요</h3>
                  <p className="text-sm text-neutral-700 break-keep">먼저 좌측 메뉴에서 일정·이용자를 확인해보세요. 구성원 초대는 관리자 → 기관 정보에서 가능합니다.</p>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-xs text-neutral-500 hover:text-neutral-900 shrink-0">닫기</button>
              </div>
            </div>
          )}
          <Outlet context={{ centerId: activeCenter.id, demo }} />
        </main>
      </div>
    </div>
  );
}
