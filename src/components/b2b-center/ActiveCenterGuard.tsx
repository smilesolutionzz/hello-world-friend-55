import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  getActiveCenterId,
  setActiveCenterId,
  resolveActiveCenter,
  listMyCenters,
  type CenterOrg,
} from "@/lib/b2bCenter/centerClient";

/**
 * 활성 기관이 없을 때(다른 브라우저/시크릿/기기 진입 등) 자동 복구하는 가드.
 * - 내 기관이 1개면 자동 선택 후 화면 갱신
 * - 여러 개면 선택 카드 노출
 * - 없으면 기관 등록 페이지로 보냄
 */
export default function ActiveCenterGuard({ children }: { children: React.ReactNode }) {
  const [centerId, setCenterId] = useState<string | null>(() => getActiveCenterId());
  const [loading, setLoading] = useState(!centerId);
  const [orgs, setOrgs] = useState<CenterOrg[]>([]);

  useEffect(() => {
    if (centerId) return;
    let mounted = true;
    (async () => {
      try {
        const mine = await listMyCenters();
        if (!mounted) return;
        if (mine.length === 1) {
          setActiveCenterId(mine[0].id);
          setCenterId(mine[0].id);
        } else {
          setOrgs(mine);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [centerId]);

  if (centerId) return <>{children}</>;

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> 기관 정보를 불러오는 중…
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <Building2 className="w-10 h-10 mx-auto text-neutral-400" />
        <h2 className="text-lg font-semibold">등록된 기관이 없어요</h2>
        <p className="text-sm text-neutral-500">먼저 기관을 만들거나 초대 코드로 합류해주세요.</p>
        <div className="flex gap-2 justify-center">
          <Button asChild className="rounded-2xl"><Link to="/b2b-center">기관 만들기</Link></Button>
          <Button asChild variant="outline" className="rounded-2xl"><Link to="/b2b-center/invite">초대 코드 입력</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <div>
        <div className="text-[11px] tracking-[0.18em] text-neutral-400">SELECT WORKSPACE</div>
        <h2 className="text-xl font-semibold mt-1">사용할 기관을 선택하세요</h2>
        <p className="text-sm text-neutral-500 mt-1">이 브라우저에서 활성 기관으로 저장됩니다.</p>
      </div>
      <div className="space-y-2">
        {orgs.map((o) => (
          <button
            key={o.id}
            onClick={() => { setActiveCenterId(o.id); setCenterId(o.id); }}
            className="w-full flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-4 py-3 hover:bg-neutral-50 transition text-left"
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{o.name}</div>
              <div className="text-xs text-neutral-400 truncate">{o.plan || "free"}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
