import { useOutletContext } from "react-router-dom";
import { Sparkles } from "lucide-react";

type Ctx = { centerId: string };

export default function PlaceholderPage({ title, desc }: { title: string; desc: string }) {
  useOutletContext<Ctx>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-neutral-500 mb-8">{desc}</p>
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
        <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#C8B88A]" />
        <p className="font-medium mb-1">곧 출시</p>
        <p className="text-sm text-neutral-500 break-keep">Phase 2에서 활성화됩니다. 지금은 엑셀 이관과 읽기 콘솔에 집중하세요.</p>
      </div>
    </div>
  );
}
