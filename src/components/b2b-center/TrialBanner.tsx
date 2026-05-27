import { Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  trialEndsAt?: string | null;
  trialStatus?: string | null;
}

export default function TrialBanner({ trialEndsAt, trialStatus }: Props) {
  if (!trialEndsAt) return null;
  if (trialStatus && trialStatus !== "trial") return null;

  const end = new Date(trialEndsAt).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const expired = end < now;

  if (expired) {
    return (
      <div className="rounded-2xl bg-neutral-900 text-white p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest text-[#C8B88A] mb-1">TRIAL ENDED</p>
          <h3 className="font-semibold mb-1">무료 체험이 종료됐어요</h3>
          <p className="text-sm text-neutral-300 break-keep">계속 사용하려면 정식 플랜으로 전환해주세요.</p>
        </div>
        <Link to="/b2b-center#pricing" className="shrink-0 px-5 py-2.5 rounded-full bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100">
          플랜 보기
        </Link>
      </div>
    );
  }

  const tone = daysLeft <= 7 ? "warn" : "ok";
  return (
    <div className={`rounded-2xl border p-5 flex items-center justify-between gap-4 ${tone === "warn" ? "bg-[#FFF8E8] border-[#C8B88A]/40" : "bg-[#FAF6E8] border-[#C8B88A]/30"}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
          {tone === "warn" ? <Clock className="w-4 h-4 text-[#C8B88A]" /> : <Sparkles className="w-4 h-4 text-[#C8B88A]" />}
        </div>
        <div>
          <p className="text-xs tracking-widest text-[#C8B88A] mb-1">FREE TRIAL · 60일</p>
          <h3 className="font-semibold mb-0.5">남은 체험 기간 <span className="text-[#8C7A3D]">{daysLeft}일</span></h3>
          <p className="text-sm text-neutral-700 break-keep">
            엑셀 업로드·일정·수납·부모 리포트까지 모두 무제한으로 사용해보세요. 카드 등록 없음.
          </p>
        </div>
      </div>
      <Link to="/b2b-center#pricing" className="shrink-0 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800">
        정식 플랜
      </Link>
    </div>
  );
}
