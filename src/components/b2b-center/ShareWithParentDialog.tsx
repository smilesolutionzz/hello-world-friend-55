import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Share2, MessageCircle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  resourceType: "therapy_note" | "parent_report";
  resourceId: string;
  childId?: string | null;
  centerId?: string | null;
  defaultPhone?: string;
  childName?: string;
};

export default function ShareWithParentDialog({
  open, onClose, resourceType, resourceId, childId, centerId, defaultPhone, childName,
}: Props) {
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [sendSms, setSendSms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; smsSent: boolean } | null>(null);

  const createLink = async () => {
    if (!/^[0-9+\-\s]{8,20}$/.test(phone.trim())) {
      toast({ title: "전화번호를 정확히 입력해주세요", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-parent-share-link", {
        body: {
          resource_type: resourceType,
          resource_id: resourceId,
          child_id: childId ?? null,
          center_id: centerId ?? null,
          parent_phone: phone.trim(),
          origin_url: window.location.origin,
          send_sms: sendSms,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult({ url: (data as any).share_url, smsSent: !!(data as any).sms_sent });
      if (sendSms && !(data as any).sms_sent) {
        const sr = (data as any).sms_result || {};
        const detail = sr.code
          ? `Twilio ${sr.code}: ${sr.message || ""}${sr.more_info ? ` (${sr.more_info})` : ""}`
          : sr.missing
            ? `시크릿 누락: ${(sr.missing as string[]).join(", ")}`
            : "Twilio 발신번호 설정을 확인해주세요.";
        toast({ title: "링크는 생성됐지만 SMS 발송 실패", description: detail, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "링크 생성 실패", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    toast({ title: "링크가 복사되었어요" });
  };

  const sharePlain = async () => {
    if (!result) return;
    const text = `[AIHPRO] ${childName ? childName + " " : ""}자녀 리포트가 도착했습니다.\n${result.url}\n전화번호 인증 후 열람하실 수 있어요.`;
    if (navigator.share) {
      try { await navigator.share({ title: "자녀 리포트", text, url: result.url }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "메시지가 복사되었어요. 카톡에 붙여넣으세요." });
    }
  };

  const close = () => { setResult(null); setPhone(defaultPhone ?? ""); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>부모님께 공유하기</DialogTitle>
          <DialogDescription>
            전화번호 인증을 거친 부모님만 열람할 수 있어요. 90일 후 자동 만료됩니다.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>부모님 휴대폰 번호</Label>
              <Input
                type="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-neutral-500">한국 번호는 +82 자동 변환됩니다.</p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox checked={sendSms} onCheckedChange={(v) => setSendSms(!!v)} className="mt-0.5" />
              <span className="text-sm">SMS로 링크 자동 발송 (Twilio 발신번호 필요)</span>
            </label>

            <Button onClick={createLink} disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              공유 링크 생성
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
              {result.smsSent ? "✓ SMS 발송 완료" : "✓ 링크 생성 완료"}
            </div>

            <div className="rounded-xl border border-neutral-200 p-3 text-xs break-all bg-neutral-50">
              {result.url}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={copy}>
                <Copy className="w-4 h-4 mr-2" /> 링크 복사
              </Button>
              <Button variant="outline" onClick={sharePlain}>
                <Share2 className="w-4 h-4 mr-2" /> 공유하기
              </Button>
            </div>

            <Button variant="ghost" className="w-full" onClick={close}>닫기</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
