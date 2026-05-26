import { Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function DemoModeBanner({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="bg-[#FAF6E8] border-b border-[#C8B88A]/40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-neutral-800">
          <Sparkles className="w-4 h-4 text-[#C8B88A]" />
          <span className="font-medium">데모 모드</span>
          <span className="text-neutral-600 hidden sm:inline">— 샘플 데이터로 둘러보고 있어요. 변경 사항은 저장되지 않습니다.</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/b2b-center/import"
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800"
          >
            지금 시작하기
          </Link>
          {onDismiss && (
            <button onClick={onDismiss} className="p-1 text-neutral-500 hover:text-neutral-900">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
