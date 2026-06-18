import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Phone, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Stage = "loading" | "confirm_phone" | "enter_otp" | "verified" | "error";

export default function ParentShareLandingPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>("loading");
  const [meta, setMeta] = useState<{ phone_last4: string; child_name: string | null; resource_type: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [last4, setLast4] = useState("");
  const [code, setCode] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resourceInfo, setResourceInfo] = useState<{ resource_type: string; resource_id: string; child_id: string | null } | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase.functions.invoke("parent-share-resolve", { body: { token } });
      if (error || (data as any)?.error) {
        setErrorMsg((data as any)?.error ?? error?.message ?? "링크를 불러올 수 없어요");
        setStage("error");
        return;
      }
      setMeta(data as any);

      // Existing parent session for this link → skip OTP
      const existing = localStorage.getItem(`aihpro_parent_session_${token}`);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          setResourceInfo({
            resource_type: parsed.resource_type,
            resource_id: parsed.resource_id,
            child_id: parsed.child_id,
          });
          setStage("verified");
          return;
        } catch {
          /* ignore */
        }
      }

      setStage("confirm_phone");
    })();
  }, [token]);

  const requestOtp = async () => {
    if (last4.length !== 4) {
      toast({ title: "전화번호 끝 4자리를 입력해주세요", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("parent-otp-send", {
        body: { token, last4 },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setPhoneE164((data as any).phone);
      setStage("enter_otp");
      toast({ title: "인증번호를 발송했어요", description: "문자로 6자리 코드가 도착합니다." });
    } catch (e: any) {
      toast({ title: "인증번호 발송 실패", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (code.length !== 6) {
      toast({ title: "인증번호 6자리를 입력해주세요", variant: "destructive" });
      return;
    }
    setVerifying(true);
    try {
      const { data: vData, error: vErr } = await supabase.functions.invoke("parent-otp-verify", {
        body: { token, code },
      });
      if (vErr) throw vErr;
      if ((vData as any)?.error) throw new Error((vData as any).error);

      const payload = vData as any;
      // Persist parent session for auto-login on revisits
      localStorage.setItem(
        `aihpro_parent_session_${token}`,
        JSON.stringify({
          parent_session_token: payload.parent_session_token,
          resource_type: payload.resource_type,
          resource_id: payload.resource_id,
          child_id: payload.child_id,
        }),
      );
      setResourceInfo(payload);
      setStage("verified");
    } catch (e: any) {
      toast({ title: "인증 실패", description: e.message, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  // Once verified — redirect to the proper resource page
  useEffect(() => {
    if (stage === "verified" && resourceInfo) {
      const t = setTimeout(() => {
        if (resourceInfo.resource_type === "parent_report") {
          navigate(`/parent/reports/${resourceInfo.resource_id}`, { replace: true });
        } else {
          navigate(`/parent/notes/${resourceInfo.resource_id}`, { replace: true });
        }
      }, 600);
      return () => clearTimeout(t);
    }
  }, [stage, resourceInfo, navigate]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#FAF6E8] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#C8B88A]" />
          </div>
          <div>
            <div className="text-xs text-neutral-500">AIHPRO 보호자 인증</div>
            <div className="text-sm font-semibold">자녀 리포트 열람</div>
          </div>
        </div>

        {stage === "loading" && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> 링크 확인 중…
          </div>
        )}

        {stage === "error" && (
          <div className="py-8 text-center space-y-2">
            <div className="text-base font-medium text-neutral-800">링크를 열 수 없어요</div>
            <div className="text-sm text-neutral-500">
              {errorMsg === "expired" ? "만료된 링크입니다." :
               errorMsg === "revoked" ? "취소된 링크입니다." :
               errorMsg === "not_found" ? "유효하지 않은 링크입니다." :
               errorMsg === "locked" ? "5회 이상 잘못된 시도로 30분간 잠겼습니다." :
               "다시 시도해주세요."}
            </div>
            <div className="text-xs text-neutral-400 mt-4">치료사에게 새 링크를 요청해주세요.</div>
          </div>
        )}

        {stage === "confirm_phone" && meta && (
          <div className="space-y-4">
            <div className="text-sm text-neutral-700">
              {meta.child_name ? <><b>{meta.child_name}</b> 자녀의 </> : null}
              {meta.resource_type === "parent_report" ? "월간 리포트가" : "치료 노트가"} 도착했어요.
            </div>
            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3 text-xs text-neutral-600">
              본인 확인을 위해 등록된 휴대폰 번호 <b className="text-neutral-900">끝 4자리</b>를 입력해주세요.
              <div className="mt-1">힌트: <span className="font-mono">***-****-{meta.phone_last4}</span></div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm"><Phone className="w-3.5 h-3.5" /> 전화번호 끝 4자리</Label>
              <Input
                inputMode="numeric"
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button onClick={requestOtp} disabled={sending || last4.length !== 4} className="w-full">
              {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              인증번호 받기
            </Button>
          </div>
        )}

        {stage === "enter_otp" && (
          <div className="space-y-4">
            <div className="text-sm text-neutral-700">
              <b>{phoneE164.replace(/^\+82/, "0")}</b> 으로 6자리 인증번호를 보냈어요.
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm"><KeyRound className="w-3.5 h-3.5" /> 인증번호</Label>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
            <Button onClick={verifyOtp} disabled={verifying || code.length < 6} className="w-full">
              {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              인증 완료
            </Button>
            <button onClick={() => setStage("confirm_phone")} className="w-full text-xs text-neutral-500 hover:text-neutral-700">
              번호 다시 확인하기
            </button>
          </div>
        )}

        {stage === "verified" && (
          <div className="py-8 text-center space-y-2">
            <div className="text-emerald-600 text-sm">✓ 인증 완료</div>
            <div className="text-sm text-neutral-500">리포트로 이동 중…</div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-neutral-100 text-[10px] text-neutral-400 text-center">
          이 링크는 본인 확인 후에만 열람할 수 있으며 90일 후 자동 만료됩니다.
        </div>
      </div>
    </div>
  );
}
