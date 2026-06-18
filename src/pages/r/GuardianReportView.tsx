import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import GuardianReportGate from "@/components/guardian-report/GuardianReportGate";
import MobileParentReport from "@/components/guardian-report/MobileParentReport";

export default function GuardianReportView() {
  const { token = "" } = useParams<{ token: string }>();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
    const sub = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    unsub = () => sub.data.subscription.unsubscribe();
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!hasSession || !token) return;
    let cancelled = false;
    (async () => {
      setError(null);
      const { data, error } = await supabase.rpc("get_parent_report_by_token", { _token: token });
      if (cancelled) return;
      if (error) {
        const msg = error.message || "";
        if (msg.includes("phone_mismatch")) setError("이 번호로는 이 리포트를 볼 수 없어요. 센터에 등록된 보호자 번호로 인증해주세요.");
        else if (msg.includes("report_not_found")) setError("리포트를 찾을 수 없어요. 링크를 다시 확인해주세요.");
        else if (msg.includes("phone_required")) setError("휴대폰 번호 인증이 필요합니다.");
        else setError("리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        return;
      }
      setReportData(Array.isArray(data) ? data[0] : data);
    })();
    return () => { cancelled = true; };
  }, [hasSession, token]);

  return (
    <>
      <Helmet>
        <title>월간 리포트 · AIHPRO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#FAF7F0]">
        {hasSession === null ? (
          <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">불러오는 중…</div>
        ) : !hasSession ? (
          <GuardianReportGate token={token} />
        ) : error ? (
          <ErrorState message={error} onSignOut={async () => { await supabase.auth.signOut(); }} />
        ) : !reportData ? (
          <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">리포트를 불러오는 중…</div>
        ) : (
          <MobileParentReport report={reportData} />
        )}
      </div>
    </>
  );
}

function ErrorState({ message, onSignOut }: { message: string; onSignOut: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-neutral-200 p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">접근할 수 없어요</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">{message}</p>
        <button onClick={onSignOut} className="w-full py-3 rounded-2xl bg-neutral-900 text-white text-sm font-medium">다른 번호로 인증하기</button>
      </div>
    </div>
  );
}
