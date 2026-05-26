import { useEffect, useState } from "react";
import { X, Copy, Check, Loader2, Send } from "lucide-react";
import {
  createParentInvite,
  inviteUrl,
  listInvitesForClient,
  markOnboardingStep,
  revokeInvite,
  type ParentInvite,
} from "@/lib/b2bCenter/parentInvites";
import { toast } from "sonner";

interface Props {
  open: boolean;
  centerId: string;
  client: { id: string; name: string };
  demo?: boolean;
  onClose: () => void;
}

export default function InviteParentDialog({ open, centerId, client, demo, onClose }: Props) {
  const [invite, setInvite] = useState<ParentInvite | null>(null);
  const [history, setHistory] = useState<ParentInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  useEffect(() => {
    if (!open) return;
    setInvite(null);
    if (demo) {
      setHistory([]);
      return;
    }
    listInvitesForClient(client.id).then(setHistory).catch(() => setHistory([]));
  }, [open, client.id, demo]);

  if (!open) return null;

  async function handleCreate() {
    setLoading(true);
    try {
      if (demo) {
        const fake: ParentInvite = {
          id: "demo-" + Math.random().toString(36).slice(2, 8),
          client_id: client.id,
          invite_token: "demo-token-" + Math.random().toString(36).slice(2, 10),
          center_code: "DEMO" + Math.floor(Math.random() * 90 + 10),
          status: "pending",
          claimed_at: null,
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
          created_at: new Date().toISOString(),
        };
        setInvite(fake);
        toast.success("데모 초대가 발급되었습니다");
      } else {
        const next = await createParentInvite(centerId, client.id);
        setInvite(next);
        await markOnboardingStep(centerId, "first_invite_sent").catch(() => {});
        toast.success("초대 링크가 발급되었습니다");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "초대 발급 실패");
    } finally {
      setLoading(false);
    }
  }

  function copy(value: string, kind: "link" | "code") {
    navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  }

  const url = invite ? inviteUrl(invite.invite_token) : "";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <p className="text-xs tracking-widest text-[#C8B88A] mb-1">01 · PARENT INVITE</p>
            <h2 className="text-lg font-semibold">{client.name} 보호자에게 AIHPRO 보내기</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-600 break-keep">
            보호자가 AIHPRO 무료권(자가검사 무제한 · Mind Track 7일 · 기본 리포트)을
            받게 됩니다. 가입 즉시 센터 인텔리전스로 결과가 연동됩니다.
          </p>

          {!invite ? (
            <button onClick={handleCreate} disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              초대 링크 발급
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-neutral-200 p-4">
                <p className="text-[10px] tracking-widest text-neutral-400 mb-1">초대 링크</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-neutral-700 truncate flex-1">{url}</code>
                  <button onClick={() => copy(url, "link")} className="p-2 rounded-full hover:bg-neutral-100">
                    {copied === "link" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-4">
                <p className="text-[10px] tracking-widest text-neutral-400 mb-1">센터 코드 (수동 입력용)</p>
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-mono tracking-widest text-neutral-900">{invite.center_code}</code>
                  <button onClick={() => copy(invite.center_code, "code")} className="p-2 rounded-full hover:bg-neutral-100">
                    {copied === "code" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-neutral-500 mt-2">aihpro.app/center-invite 에서 입력</p>
              </div>
              <p className="text-xs text-neutral-400">
                30일간 유효 · 한 번 가입 후에는 자동 만료됩니다.
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div className="pt-3 border-t border-neutral-100">
              <p className="text-xs tracking-widest text-neutral-400 mb-2">이전 초대</p>
              <ul className="space-y-1.5">
                {history.slice(0, 5).map((h) => (
                  <li key={h.id} className="text-xs flex items-center justify-between">
                    <span className="text-neutral-600">
                      {new Date(h.created_at).toLocaleDateString("ko-KR")} · 코드 {h.center_code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      h.status === "claimed" ? "bg-emerald-50 text-emerald-700"
                        : h.status === "revoked" ? "bg-neutral-100 text-neutral-500"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {h.status === "claimed" ? "수락됨" : h.status === "revoked" ? "취소됨" : "대기"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
