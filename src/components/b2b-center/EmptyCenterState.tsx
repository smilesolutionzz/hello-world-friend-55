import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Plus, Mail, ArrowRight, Loader2 } from "lucide-react";
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
      toast({ title: "기관 등록 완료", description: c.name });
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
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">CENTER SETUP</p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3 break-keep">시작 방법을 선택하세요</h1>
          <p className="text-neutral-600 break-keep">아직 등록된 기관이 없어요. 아래 3가지 중 하나로 진행할 수 있어요.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* 1. 엑셀 이관 */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Upload className="w-5 h-5 text-neutral-700" />
            </div>
            <p className="text-xs tracking-widest text-[#C8B88A] mb-1">01</p>
            <h3 className="font-semibold mb-2">엑셀 이관 시작</h3>
            <p className="text-sm text-neutral-600 break-keep flex-1 mb-5">
              케어플 다운로드 파일 또는 AIHPRO 템플릿을 업로드해 이용자·치료사·회기·수납을 한 번에 옮겨오세요.
            </p>
            <button
              onClick={() => navigate("/b2b-center/import")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800"
            >
              엑셀 마법사 열기 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. 빈 기관 생성 */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-neutral-700" />
            </div>
            <p className="text-xs tracking-widest text-[#C8B88A] mb-1">02</p>
            <h3 className="font-semibold mb-2">빈 기관 만들기</h3>
            <p className="text-sm text-neutral-600 break-keep flex-1 mb-5">
              기관 이름만 입력하면 즉시 생성됩니다. 데이터는 콘솔에서 직접 추가할 수 있어요.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && quickCreate()}
              placeholder="예) 햇살 발달치료센터"
              className="w-full px-3 py-2 mb-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400"
            />
            <button
              onClick={quickCreate}
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-neutral-300 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              지금 만들기
            </button>
          </div>

          {/* 3. 초대 받음 */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-neutral-700" />
            </div>
            <p className="text-xs tracking-widest text-[#C8B88A] mb-1">03</p>
            <h3 className="font-semibold mb-2">초대 받았나요?</h3>
            <p className="text-sm text-neutral-600 break-keep flex-1 mb-5">
              기관 운영자에게 받은 초대 링크를 붙여넣어 합류하세요. 링크 끝의 토큰만 입력해도 됩니다.
            </p>
            <input
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && acceptInvite()}
              placeholder="초대 링크 또는 토큰"
              className="w-full px-3 py-2 mb-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400"
            />
            <button
              onClick={acceptInvite}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-neutral-300 text-sm font-medium hover:bg-neutral-50"
            >
              합류하기
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
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
