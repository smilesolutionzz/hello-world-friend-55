import { useState, useEffect } from "react";
import { Copy, Mail, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCenterInvite, listCenterInvites, buildInviteUrl, type CenterInvite } from "@/lib/b2bCenter/inviteClient";

export default function InviteMemberPanel({ centerId }: { centerId: string }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "therapist" | "viewer">("therapist");
  const [creating, setCreating] = useState(false);
  const [invites, setInvites] = useState<CenterInvite[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    try { setInvites(await listCenterInvites(centerId)); } catch {}
  }
  useEffect(() => { load(); }, [centerId]);

  async function handleCreate() {
    const e = email.trim();
    if (!e) { toast({ title: "이메일을 입력하세요", variant: "destructive" }); return; }
    setCreating(true);
    try {
      const inv = await createCenterInvite(centerId, e, role);
      toast({ title: "초대 생성 완료", description: "링크를 복사해 전달하세요." });
      setEmail("");
      setInvites((prev) => [inv, ...prev]);
    } catch (err: any) {
      toast({ title: "초대 실패", description: err?.message ?? String(err), variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  function copy(inv: CenterInvite) {
    const url = buildInviteUrl(inv.token);
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 1500);
    toast({ title: "링크 복사됨" });
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-[#C8B88A]" />
        <h3 className="font-semibold">구성원 초대</h3>
      </div>
      <p className="text-xs text-neutral-500 mb-5">초대 링크를 카카오톡·이메일로 전달하세요. 7일 후 자동 만료됩니다.</p>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="초대할 이메일"
          className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white"
        >
          <option value="admin">관리자</option>
          <option value="therapist">치료사</option>
          <option value="viewer">조회 전용</option>
        </select>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          초대 생성
        </button>
      </div>

      <div className="space-y-2">
        {invites.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-4">아직 생성된 초대가 없어요.</p>
        )}
        {invites.map((inv) => {
          const expired = new Date(inv.expires_at) < new Date();
          const used = !!inv.accepted_at;
          return (
            <div key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{inv.email}</p>
                <p className="text-xs text-neutral-500">
                  {inv.role} · {used ? "수락됨" : expired ? "만료됨" : "대기 중"}
                </p>
              </div>
              {!used && !expired && (
                <button
                  onClick={() => copy(inv)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-medium hover:bg-neutral-100"
                >
                  {copiedId === inv.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  링크 복사
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
