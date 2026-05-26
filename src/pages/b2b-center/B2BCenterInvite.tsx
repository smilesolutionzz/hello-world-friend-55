import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { acceptCenterInvite } from "@/lib/b2bCenter/inviteClient";
import { setActiveCenterId } from "@/lib/b2bCenter/centerClient";

export default function B2BCenterInvite() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "needs-auth" | "ready" | "accepting" | "done" | "error">("checking");
  const [error, setError] = useState<string>("");
  const [centerName, setCenterName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const cleanToken = token.includes("/") ? token.split("/").pop()! : token;
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setStatus("needs-auth");
        return;
      }
      setStatus("ready");
    })();
  }, [token]);

  async function handleAccept() {
    setStatus("accepting");
    try {
      const cleanToken = token.includes("http") ? token.split("/").pop()! : token;
      const org = await acceptCenterInvite(cleanToken);
      if (org && (org as any).id) {
        setActiveCenterId((org as any).id);
        setCenterName((org as any).name ?? "");
      }
      setStatus("done");
      setTimeout(() => navigate("/b2b-center/app"), 1200);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setStatus("error");
    }
  }

  function goLogin() {
    const redirect = encodeURIComponent(`/b2b-center/invite/${token}`);
    navigate(`/auth?redirect=${redirect}`);
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <Helmet><title>센터 초대 — AIHPRO</title></Helmet>
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#FAF6E8] flex items-center justify-center">
          <Building2 className="w-7 h-7 text-[#C8B88A]" />
        </div>

        {status === "checking" && (
          <>
            <h1 className="text-xl font-semibold mb-2">초대 확인 중</h1>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-400" />
          </>
        )}

        {status === "needs-auth" && (
          <>
            <h1 className="text-2xl font-semibold mb-3 break-keep">발달치료센터 초대를 받으셨어요</h1>
            <p className="text-neutral-600 mb-8 break-keep">
              초대를 수락하려면 먼저 로그인해주세요. 로그인 후 이 페이지로 자동 복귀합니다.
            </p>
            <button onClick={goLogin} className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800">
              로그인하고 합류하기
            </button>
          </>
        )}

        {status === "ready" && (
          <>
            <h1 className="text-2xl font-semibold mb-3 break-keep">센터에 합류하시겠어요?</h1>
            <p className="text-neutral-600 mb-8 break-keep">
              수락하면 해당 센터의 콘솔에 즉시 접근할 수 있어요.
            </p>
            <button onClick={handleAccept} className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800">
              초대 수락
            </button>
          </>
        )}

        {status === "accepting" && (
          <>
            <h1 className="text-xl font-semibold mb-2">합류 처리 중</h1>
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-400" />
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto text-[#C8B88A] mb-3" />
            <h1 className="text-xl font-semibold mb-2">합류 완료</h1>
            <p className="text-sm text-neutral-600">{centerName} 콘솔로 이동합니다…</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
            <h1 className="text-xl font-semibold mb-2">초대 수락 실패</h1>
            <p className="text-sm text-neutral-600 mb-6 break-keep">
              {error === "INVITE_EXPIRED" && "초대가 만료되었습니다. 관리자에게 새 초대를 요청해주세요."}
              {error === "INVITE_USED" && "이미 사용된 초대입니다."}
              {error === "INVITE_NOT_FOUND" && "유효하지 않은 초대 링크입니다."}
              {!["INVITE_EXPIRED", "INVITE_USED", "INVITE_NOT_FOUND"].includes(error) && error}
            </p>
            <button onClick={() => navigate("/b2b-center")} className="text-sm underline text-neutral-600">
              B2B 센터 안내로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
