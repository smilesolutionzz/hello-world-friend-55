import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCenter, setActiveCenterId, type CenterOrg } from "@/lib/b2bCenter/centerClient";

export default function EmptyCenterState({ onCreated }: { onCreated: (c: CenterOrg) => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteToken, setInviteToken] = useState("");

  async function quickCreate() {
    const n = name.trim();
    if (!n) { toast({ title: "기관 이름을 입력하세요", variant: "destructive" }); return; }
    setCreating(true);
    try {
      const c = await createCenter(n);
      setActiveCenterId(c.id);
      toast({ title: "기관 등록 완료", description: `${c.name} · 콘솔로 이동합니다` });
      onCreated(c);
    } catch (e: any) {
      toast({ title: "기관 등록 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  function acceptInvite() {
    const t = inviteToken.trim();
    if (!t) return;
    navigate(`/b2b-center/invite/${t}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">CENTER SETUP</p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3 break-keep">기관 이름만 입력하면 시작돼요</h1>
          <p className="text-neutral-600 break-keep text-sm leading-relaxed">
            먼저 기관을 만들고 콘솔에 들어가서 <b>이용자 · 일정 · 선생님</b>을 각 페이지에서 엑셀로 따로 올릴 수 있어요.
            <br />처음부터 한 번에 올리면 전화번호 같은 항목이 누락될 수 있어요.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <p className="text-xs tracking-widest text-[#C8B88A] mb-2">01 · 기관 만들기</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && quickCreate()}
            placeholder="예) 햇살 발달치료센터"
            className="w-full px-4 py-3 mb-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400"
          />
          <button
            onClick={quickCreate}
            disabled={creating}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            기관 만들고 콘솔 열기
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-neutral-500 mt-3 break-keep">
            콘솔 진입 후 <b>이용자 관리 · 일정 · 선생님</b> 페이지에서 각각 엑셀을 업로드하세요.
          </p>
        </div>

        <div className="mt-8 bg-neutral-50 rounded-2xl border border-neutral-200 p-5">
          <p className="text-xs tracking-widest text-neutral-500 mb-2">초대 받았나요?</p>
          <div className="flex gap-2">
            <input
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && acceptInvite()}
              placeholder="초대 링크 또는 토큰"
              className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 bg-white"
            />
            <button
              onClick={acceptInvite}
              className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium hover:bg-white whitespace-nowrap"
            >
              합류
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/b2b-center/app?demo=1")}
            className="text-sm text-neutral-500 hover:text-neutral-900 underline underline-offset-4"
          >
            먼저 데모로 둘러볼게요
          </button>
        </div>
      </div>
    </div>
  );
}
