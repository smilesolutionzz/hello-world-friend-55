/**
 * 개발/QA 전용 페이지 — 결제 우회로 mind_track_30 권한을 임시 발급해서
 * /onboarding/mind-track 부터 곧장 테스트한다.
 * 프로덕션 도메인에서는 edge function이 admin만 통과시킨다.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert, Sparkles, Trash2, ArrowRight } from "lucide-react";

export default function DevMindTrackGrant() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState<"grant" | "reset" | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? null);
        setUid(data.user.id);
      }
    });
  }, []);

  const grant = async () => {
    if (!uid) { toast({ title: "로그인이 필요합니다", variant: "destructive" }); return; }
    setLoading("grant");
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("dev-grant-mind-track", {
        body: { action: "grant" },
      });
      if (error) throw error;
      setLastResult(JSON.stringify(data, null, 2));
      // 로컬 온보딩 상태 초기화 후 진입
      localStorage.removeItem("mt_onboarding_stage");
      localStorage.removeItem("mt_onboarding_state");
      toast({ title: "권한 발급 완료", description: "/onboarding/mind-track 으로 이동합니다." });
      setTimeout(() => nav("/onboarding/mind-track"), 600);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastResult(msg);
      toast({ title: "발급 실패", description: msg, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const reset = async () => {
    if (!confirm("본인의 mind_track 데이터(이벤트/프로필/한줄/등록)를 모두 삭제합니다. 진행할까요?")) return;
    setLoading("reset");
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("dev-grant-mind-track", {
        body: { action: "reset" },
      });
      if (error) throw error;
      localStorage.removeItem("mt_onboarding_stage");
      localStorage.removeItem("mt_onboarding_state");
      setLastResult(JSON.stringify(data, null, 2));
      toast({ title: "초기화 완료" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastResult(msg);
      toast({ title: "초기화 실패", description: msg, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-5 py-12 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[11px] tracking-widest font-semibold text-amber-700">DEV / QA ONLY</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">30일 마음 트랙 — 결제 우회 진입</h1>
          <p className="text-sm text-slate-500 break-keep">
            결제 없이 본인 계정에 mind_track_30 권한을 임시로 활성화해서
            <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-100">/onboarding/mind-track</code>
            부터 곧장 테스트할 수 있습니다.
            프로덕션 도메인에서는 관리자만 호출 가능합니다.
          </p>
        </div>

        <Card className="p-5 rounded-2xl border border-slate-100 space-y-2">
          <p className="text-xs text-slate-500">현재 로그인</p>
          <p className="font-mono text-sm text-slate-900">{email ?? "(로그인 필요)"}</p>
          <p className="font-mono text-[11px] text-slate-400 truncate">{uid ?? ""}</p>
        </Card>

        <div className="grid gap-3">
          <Button
            onClick={grant}
            disabled={!uid || loading !== null}
            className="bg-[#1a1a1a] text-white hover:bg-black rounded-2xl py-6 text-base"
          >
            {loading === "grant" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            mind_track_30 권한 발급 후 온보딩 시작
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            onClick={reset}
            disabled={!uid || loading !== null}
            variant="outline"
            className="rounded-2xl"
          >
            {loading === "reset" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            본인 mind_track 데이터 초기화
          </Button>

          <Button
            variant="ghost"
            onClick={() => nav("/onboarding/mind-track")}
            className="text-slate-500"
          >
            권한 부여 없이 /onboarding/mind-track 으로 이동
          </Button>
        </div>

        {lastResult && (
          <Card className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] text-slate-500 mb-1">마지막 응답</p>
            <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap break-all">{lastResult}</pre>
          </Card>
        )}
      </div>
    </div>
  );
}
