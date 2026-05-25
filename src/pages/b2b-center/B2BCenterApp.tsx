import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, BookOpen, CreditCard, Building2,
  UserCog, FileText, Upload, Sparkles, ShieldAlert,
} from "lucide-react";
import { listMyCenters, getActiveCenterId, setActiveCenterId, type CenterOrg } from "@/lib/b2bCenter/centerClient";
import { supabase } from "@/integrations/supabase/client";

const NAV: Array<{ to: string; label: string; icon: any; group?: string }> = [
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
  { to: "intelligence/ops-dashboard", label: "운영 KPI", icon: Sparkles, group: "인텔리전스" },
];

export default function B2BCenterApp() {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<CenterOrg[]>([]);
  const [activeId, setActive] = useState<string | null>(getActiveCenterId());
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      if (data.user) {
        listMyCenters().then((cs) => {
          setCenters(cs);
          if (!activeId && cs[0]) { setActive(cs[0].id); setActiveCenterId(cs[0].id); }
        });
      }
    });
  }, []);

  if (authed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-3">로그인이 필요합니다</h1>
          <button onClick={() => navigate("/auth")} className="px-6 py-3 rounded-full bg-neutral-900 text-white">로그인</button>
        </div>
      </div>
    );
  }
  if (authed === null) return null;

  if (centers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-semibold mb-3">아직 등록된 기관이 없습니다</h1>
          <p className="text-neutral-600 mb-6">먼저 엑셀 이관 페이지에서 기관을 만들고 데이터를 올리세요.</p>
          <button onClick={() => navigate("/b2b-center/import")} className="px-6 py-3 rounded-full bg-neutral-900 text-white inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> 엑셀 이관 시작
          </button>
        </div>
      </div>
    );
  }

  const grouped = NAV.reduce((acc, n) => {
    const g = n.group ?? "기타";
    (acc[g] ||= []).push(n);
    return acc;
  }, {} as Record<string, typeof NAV>);

  const activeCenter = centers.find((c) => c.id === activeId) ?? centers[0];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Helmet><title>{activeCenter.name} — AIHPRO 센터 콘솔</title></Helmet>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <p className="text-xs text-neutral-500 mb-1">기관</p>
          <select
            value={activeId ?? ""}
            onChange={(e) => { setActive(e.target.value); setActiveCenterId(e.target.value); }}
            className="w-full text-sm font-medium bg-transparent focus:outline-none"
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
                  to={n.to}
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
        <Outlet context={{ centerId: activeCenter.id }} />
      </main>
    </div>
  );
}
