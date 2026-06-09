import { AlertTriangle, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function DemoModeBanner({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="sticky top-0 z-40 bg-amber-500 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-semibold shrink-0">데모 모드</span>
          <span className="hidden sm:inline opacity-95 truncate">
            샘플 데이터입니다. 입력·수정·삭제 모두 <u>저장되지 않으며</u> 새로고침 시 사라집니다.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/b2b-center/import"
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-amber-700 hover:bg-amber-50 whitespace-nowrap"
          >
            60일 무료로 진짜 시작 →
          </Link>
          {onDismiss && (
            <button onClick={onDismiss} className="p-1 text-white/80 hover:text-white" aria-label="닫기">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
