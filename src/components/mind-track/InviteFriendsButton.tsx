import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserPlus, MessageCircle, Instagram, Link2, Check } from "lucide-react";
import { shareToKakao } from "@/lib/kakaoShare";
import { toast } from "sonner";

interface Props {
  /** 30일 트랙 진행 일수 (옵션) */
  currentDay?: number;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
}

/**
 * 친구 초대 통합 위젯
 * - 카카오톡 공유
 * - 인스타그램 스토리 (이미지 클립보드 복사 + 안내)
 * - 링크 복사
 */
export default function InviteFriendsButton({ currentDay, variant = "outline", size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = `https://aihpro.app/mind-track`;
  const message = currentDay
    ? `저는 30일 마음 챌린지 ${currentDay}일째 진행 중이에요. 같이 해볼래요?`
    : `30일이면 마음이 진짜 가벼워져요. 같이 해볼래요?`;

  const handleKakao = async () => {
    await shareToKakao({
      title: "🌱 30일 마음 챌린지, 같이 할래요?",
      description: message,
      url: inviteUrl,
      buttonText: "나도 시작하기",
    });
    setOpen(false);
  };

  const handleInstagram = async () => {
    try {
      const text = `${message}\n\n👉 ${inviteUrl}`;
      await navigator.clipboard.writeText(text);
      toast.success("문구 복사 완료! 인스타그램 스토리에 붙여넣어주세요 📸");
    } catch {
      toast.error("복사에 실패했어요");
    }
    // 인스타 앱 직접 호출 시도 (모바일)
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = "instagram://story-camera";
    }
    setOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${message}\n\n${inviteUrl}`);
      setCopied(true);
      toast.success("링크 복사 완료!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했어요");
    }
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="w-4 h-4" />
        친구 초대
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>친구를 초대해보세요</DialogTitle>
            <DialogDescription>
              함께하면 완주율이 3배 높아져요 ✨
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3 py-3">
            <button
              onClick={handleKakao}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#3C1E1E]" />
              </div>
              <span className="text-xs font-medium text-slate-700">카카오톡</span>
            </button>

            <button
              onClick={handleInstagram}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-pink-400 hover:bg-pink-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-700">인스타</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                {copied ? (
                  <Check className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Link2 className="w-6 h-6 text-slate-700" />
                )}
              </div>
              <span className="text-xs font-medium text-slate-700">링크 복사</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-100 break-keep">
            * 인스타는 문구가 복사되어요. 스토리에 붙여넣기 해주세요.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
