import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, CheckCircle2, AlertCircle, Sparkles, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Phase = "checking" | "needs-auth" | "ready" | "claiming" | "done" | "error" | "code-entry";

export default function CenterInviteClaim() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>(token ? "checking" : "code-entry");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<{ centerName?: string; childName?: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setPhase("needs-auth"); return; }
      setPhase("ready");
      await claim({ token });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function claim(payload: { token?: string; code?: string }) {
    setPhase("claiming");
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke("claim-center-invite", { body: payload });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setInfo({
        centerName: (data as any)?.center?.name,
        childName: (data as any)?.client?.name,
      });
      setPhase("done");
    } catch (e: any) {
      setError(e?.message ?? "초대 처리 실패");
      setPhase("error");
    }
  }

  function loginRedirect() {
    const redirect = encodeURIComponent(window.location.pathname);
    navigate(`/auth?redirect=${redirect}`);
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <Helmet><title>AIHPRO 센터 초대</title></Helmet>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-neutral-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FAF6E8] flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5 text-[#C8B88A]" />
          </div>
          <p className="text-[10px] tracking-widest text-[#C8B88A] mb-1">CENTER INVITE</p>
          <h1 className="text-xl font-semibold">우리 센터에서 보낸 초대장</h1>
        </div>

        {phase === "code-entry" && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (code.length === 6) claim({ code }); }}>
            <p className="text-sm text-neutral-600 break-keep text-center">
              센터에서 받은 <strong>6자리 코드</strong>를 입력하세요. 가입 즉시 무료권이 부여됩니다.
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="예: A3K7P9"
              className="w-full text-center text-2xl font-mono tracking-widest py-4 rounded-2xl border border-neutral-200 focus:outline-none focus:border-neutral-400"
            />
            <button disabled={code.length !== 6} type="submit"
              className="w-full px-5 py-3 rounded-2xl bg-neutral-900 text-white font-medium disabled:opacity-50">
              무료권 받기
            </button>
          </form>
        )}

        {(phase === "checking" || phase === "claiming") && (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-400" />
            <p className="text-sm text-neutral-500 mt-3">초대를 확인하는 중…</p>
          </div>
        )}

        {phase === "needs-auth" && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 break-keep text-center">
              초대장을 수락하려면 먼저 AIHPRO에 가입하거나 로그인해주세요.
              가입 즉시 자가검사·Mind Track·기본 리포트가 무료로 열립니다.
            </p>
            <button onClick={loginRedirect} className="w-full px-5 py-3 rounded-2xl bg-neutral-900 text-white font-medium">
              가입 / 로그인
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <div>
              <h2 className="text-lg font-semibold mb-1">연결 완료</h2>
              <p className="text-sm text-neutral-600 break-keep">
                {info?.centerName ? `${info.centerName} · ` : ""}{info?.childName ?? "보호자"} 무료권이 활성화되었습니다.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 pt-2">
              <button onClick={() => navigate("/mind-track")}
                className="w-full px-5 py-3 rounded-2xl bg-neutral-900 text-white font-medium inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Mind Track 7일 시작
              </button>
              <button onClick={() => navigate("/assessments")}
                className="w-full px-5 py-3 rounded-2xl border border-neutral-200 text-neutral-700">
                자가검사 둘러보기
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="text-center space-y-4">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
            <p className="text-sm text-neutral-700 break-keep">{error || "초대를 확인할 수 없습니다."}</p>
            <button onClick={() => setPhase("code-entry")} className="text-sm text-neutral-600 underline">
              코드로 다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
