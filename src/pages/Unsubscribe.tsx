import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, MailMinus } from "lucide-react";

const SUPABASE_URL = "https://hrcqxjetmzxoephgyjlb.supabase.co";
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  "";

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid", message: "유효한 수신 거부 토큰이 없습니다." });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (!res.ok) {
          setState({
            kind: "invalid",
            message: data?.error || "토큰이 유효하지 않거나 만료되었습니다.",
          });
          return;
        }
        if (data?.valid === false && data?.reason === "already_unsubscribed") {
          setState({ kind: "already" });
          return;
        }
        if (data?.valid) {
          setState({ kind: "valid" });
          return;
        }
        setState({ kind: "invalid", message: "토큰을 확인할 수 없습니다." });
      } catch (e: any) {
        setState({ kind: "error", message: e?.message || "네트워크 오류" });
      }
    })();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const { data, error } = await supabase.functions.invoke(
        "handle-email-unsubscribe",
        { body: { token } }
      );
      if (error) {
        setState({ kind: "error", message: error.message });
        return;
      }
      if (data?.success) {
        setState({ kind: "success" });
      } else if (data?.reason === "already_unsubscribed") {
        setState({ kind: "already" });
      } else {
        setState({ kind: "error", message: data?.error || "처리에 실패했습니다." });
      }
    } catch (e: any) {
      setState({ kind: "error", message: e?.message || "네트워크 오류" });
    }
  };

  return (
    <>
      <Helmet>
        <title>이메일 수신 거부 · AIHPRO</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <MailMinus className="w-7 h-7 text-foreground/70" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            이메일 수신 거부
          </h1>

          {state.kind === "loading" && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>토큰을 확인하고 있어요…</p>
            </div>
          )}

          {state.kind === "valid" && (
            <>
              <p className="text-muted-foreground">
                AIHPRO에서 보내는 알림 이메일 수신을 중단할까요?
                인증·결제 등 필수 안내는 계속 발송됩니다.
              </p>
              <Button onClick={handleConfirm} size="lg" className="w-full">
                수신 거부 확인
              </Button>
            </>
          )}

          {state.kind === "submitting" && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>처리 중이에요…</p>
            </div>
          )}

          {state.kind === "success" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-primary" />
              <p className="text-foreground font-medium">수신 거부가 완료됐어요.</p>
              <p className="text-sm text-muted-foreground">
                앞으로 알림 메일을 보내드리지 않을게요.
              </p>
            </div>
          )}

          {state.kind === "already" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-primary" />
              <p className="text-foreground font-medium">
                이미 수신 거부된 주소예요.
              </p>
            </div>
          )}

          {(state.kind === "invalid" || state.kind === "error") && (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{state.message}</p>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
