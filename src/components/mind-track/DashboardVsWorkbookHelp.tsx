import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, X, LayoutDashboard, BookOpen, ArrowRight } from "lucide-react";

type Mode = "dashboard" | "workbook";

const STORAGE_KEY = "mt_help_banner_dismissed_v1";

interface Props {
  mode: Mode;
  className?: string;
  /** 외부에서 강제로 다시 열기 (헤더 "이용 방법" 버튼 등) */
  forceOpen?: boolean;
}

/**
 * 대시보드 vs 워크북 차이를 한 줄로 안내하는 화이트 미니멀 배너.
 * - dismissed 상태는 localStorage(STORAGE_KEY)로 영구 저장
 * - forceOpen=true 면 dismissed 무시하고 표시
 */
export default function DashboardVsWorkbookHelp({ mode, className = "", forceOpen = false }: Props) {
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  if (dismissed && !forceOpen) return null;

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setDismissed(true);
  };

  const isDashboard = mode === "dashboard";

  return (
    <div
      className={`relative bg-white rounded-2xl border border-slate-200 ring-1 ring-[#C8B88A]/30 shadow-sm p-4 sm:p-5 ${className}`}
      role="note"
      aria-label="대시보드와 워크북 차이 안내"
    >
      <button
        onClick={close}
        className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        aria-label="안내 닫기"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-[#C8B88A]/15 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-[#8a7a4d]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold tracking-wider text-[#8a7a4d] uppercase mb-1">
            {isDashboard ? "지금 보는 곳 · 대시보드" : "지금 보는 곳 · 워크북"}
          </div>
          <div className="text-sm text-slate-800 break-keep leading-relaxed">
            {isDashboard ? (
              <>
                <strong className="text-slate-900">대시보드</strong>는 오늘 한눈에 보는 홈이에요.
                Day별 미션 자세히 보기와 체크인 작성은 <strong className="text-slate-900">워크북</strong>에서 진행해요.
              </>
            ) : (
              <>
                <strong className="text-slate-900">워크북</strong>은 Day별 상세 미션·체크인을 작성하는 곳이에요.
                오늘 진행률·연속 일수·다음 액션은 <strong className="text-slate-900">대시보드</strong>에서 한눈에 확인하세요.
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={isDashboard ? "/mind-track/workbook" : "/mind-track/dashboard"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-black transition"
            >
              {isDashboard ? (
                <>
                  <BookOpen className="w-3.5 h-3.5" /> 워크북으로 이동
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5" /> 대시보드로 이동
                </>
              )}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="inline-flex items-center text-[11px] text-slate-500">
              이 안내는 닫으면 더 이상 보이지 않아요
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
