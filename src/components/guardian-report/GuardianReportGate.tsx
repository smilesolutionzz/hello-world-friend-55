import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props { token: string }

/** Convert Korean phone (e.g. "010-1234-5678") to E.164 "+821012345678". */
function toE164KR(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("82")) return "+" + digits;
  if (digits.startsWith("0")) return "+82" + digits.slice(1);
  return "+82" + digits;
}

export default function GuardianReportGate({ token }: Props) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<{ phone_hint: string | null; client_name: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("peek_parent_report_token", { _token: token });
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.exists_flag) setHint({ phone_hint: row.phone_hint, client_name: row.client_name });
    })();
  }, [token]);

  const sendOtp = async () => {
    const e164 = toE164KR(phone);
    if (!e164 || e164.length < 12) {
      toast({ title: "휴대폰 번호를 정확히 입력해주세요", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setLoading(false);
    if (error) {
      toast({ title: "인증번호 발송 실패", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "인증번호를 보냈어요", description: "잠시 후 6자리 숫자가 도착합니다." });
    setStep("otp");
  };

  const verify = async (code: string) => {
    const e164 = toE164KR(phone);
    if (!e164) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone: e164, token: code, type: "sms" });
    setLoading(false);
    if (error) {
      toast({ title: "인증 실패", description: "번호가 맞지 않아요. 다시 시도해주세요.", variant: "destructive" });
      setOtp("");
      return;
    }
    // onAuthStateChange in parent will swap to report view
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FAF6E8] mb-4">
            <Sparkles className="w-6 h-6 text-[#C8B88A]" />
          </div>
          <div className="text-[11px] tracking-[0.3em] text-[#C8B88A] uppercase mb-2">Monthly Parent Report</div>
          <h1 className="text-2xl font-serif text-neutral-900 leading-snug">
            {hint?.client_name ? <>{hint.client_name} 보호자님</> : <>월간 리포트가 도착했어요</>}
          </h1>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            아이의 발달 정보를 안전하게 보호하기 위해<br/>휴대폰 번호 인증이 필요합니다.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
          {step === "phone" ? (
            <>
              <label className="block text-xs text-neutral-500 mb-2">보호자 휴대폰 번호</label>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder={hint?.phone_hint || "010-0000-0000"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-base focus:outline-none focus:border-[#C8B88A]"
              />
              {hint?.phone_hint && (
                <p className="text-[11px] text-neutral-400 mt-2">센터에 등록된 번호: <span className="font-mono">{hint.phone_hint}</span></p>
              )}
              <button
                onClick={sendOtp}
                disabled={loading || !phone}
                className="mt-5 w-full py-3 rounded-2xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-50"
              >
                {loading ? "발송 중…" : "인증번호 받기"}
              </button>
            </>
          ) : (
            <>
              <label className="block text-xs text-neutral-500 mb-3 text-center">
                <span className="font-mono">{phone}</span> 로 전송된<br/>6자리 인증번호를 입력해주세요
              </label>
              <div className="flex justify-center my-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    if (v.length === 6) verify(v);
                  }}
                >
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <button
                onClick={() => { setStep("phone"); setOtp(""); }}
                className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-800"
              >
                번호 다시 입력하기
              </button>
              {loading && <p className="text-center text-xs text-neutral-400 mt-2">확인 중…</p>}
            </>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2 text-[11px] text-neutral-400 leading-relaxed">
          <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>본 링크는 등록된 보호자 번호로만 인증할 수 있어요. 한 번 인증하면 이 기기에서는 다음부터 자동으로 열립니다.</p>
        </div>
      </div>
    </div>
  );
}
