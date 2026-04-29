import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, Sparkles, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nickname?: string;
  trackTheme?: string;
  startedAt?: string;
  completedAt?: string;
  totalCheckins?: number;
  onDownloadWorkbook?: () => void;
}

/**
 * 30일 완주 시 풀스크린 축하 화면 — "완료증 / 배지" + 공유용 이미지 자동 생성.
 * 골드 액센트의 미니멀한 증서 형태. html2canvas로 PNG 다운로드 또는 Web Share.
 */
export default function WorkbookCompletionCelebration({
  open,
  onOpenChange,
  nickname = "당신",
  trackTheme = "30일 마음 트랙",
  startedAt,
  completedAt,
  totalCheckins,
  onDownloadWorkbook,
}: Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 첫 진입 시 confetti 효과 살짝
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2400);
      return () => clearTimeout(t);
    }
  }, [open]);

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const captureAsImage = async (): Promise<Blob | null> => {
    if (!certRef.current) return null;
    setIsCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#faf6ec",
        logging: false,
      });
      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 1.0)
      );
    } catch (e) {
      console.error("[Celebration] capture failed", e);
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadImage = async () => {
    const blob = await captureAsImage();
    if (!blob) {
      toast.error("이미지 생성에 실패했어요");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `30일_완주_배지_${nickname}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("완주 배지 이미지를 저장했어요");
  };

  const handleShare = async () => {
    const blob = await captureAsImage();
    if (!blob) {
      toast.error("이미지 생성에 실패했어요");
      return;
    }
    const file = new File([blob], `30일_완주_배지_${nickname}.png`, { type: "image/png" });

    // Web Share API (모바일)
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "30일 마음 트랙 완주",
          text: `${nickname}님이 30일 마음 트랙을 완주했어요!`,
          files: [file],
        });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    // 폴백: 다운로드
    handleDownloadImage();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] sm:max-w-md p-0 overflow-hidden bg-[#faf6ec] border-[#C8B88A]/30 rounded-3xl">
        {/* 닫기 */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 컨페티 */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              {Array.from({ length: 28 }).map((_, i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 0.6;
                const duration = 1.4 + Math.random() * 1.0;
                const colors = ["#C8B88A", "#8a7a4d", "#e8dcb6", "#f5efdc"];
                const color = colors[i % colors.length];
                const size = 5 + Math.random() * 6;
                return (
                  <motion.div
                    key={i}
                    initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      y: 600,
                      x: (Math.random() - 0.5) * 80,
                      opacity: 0,
                      rotate: Math.random() * 720,
                    }}
                    transition={{ duration, delay, ease: "easeIn" }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${left}%`,
                      width: size,
                      height: size,
                      backgroundColor: color,
                      borderRadius: i % 3 === 0 ? "50%" : "2px",
                    }}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>

        <div className="px-5 pt-8 pb-5">
          {/* 증서 (캡처 영역) */}
          <div
            ref={certRef}
            className="bg-white rounded-2xl border border-[#C8B88A]/40 px-6 py-8 relative overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 0%, rgba(200,184,138,0.10), transparent 60%)",
            }}
          >
            {/* 상하 골드 라인 */}
            <div className="absolute top-4 left-6 right-6 h-px bg-[#C8B88A]/40" />
            <div className="absolute bottom-4 left-6 right-6 h-px bg-[#C8B88A]/40" />

            {/* 헤더 */}
            <div className="text-center mb-5 mt-3">
              <div className="text-[9px] font-bold tracking-[0.3em] text-[#8a7a4d] uppercase">
                AIHPRO Mind Track
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-mono">
                Certificate of Completion · Vol. 01
              </div>
            </div>

            {/* 메달 */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 14 }}
              className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 relative"
              style={{
                background:
                  "radial-gradient(circle, #f5efdc 0%, #C8B88A 60%, #8a7a4d 100%)",
                boxShadow: "0 10px 30px -8px rgba(138,122,77,0.4)",
              }}
            >
              <Award className="w-11 h-11 text-white" strokeWidth={1.6} />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#8a7a4d]" />
            </motion.div>

            {/* 본문 */}
            <div className="text-center px-2">
              <div
                className="text-[22px] font-bold text-slate-900 leading-tight break-keep"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                30일 마음 트랙
                <br />
                완주를 인증합니다
              </div>
              <div className="w-12 h-px bg-[#8a7a4d] mx-auto my-3.5" />
              <div className="text-[15px] font-bold text-slate-900 break-keep">
                {nickname}
              </div>
              <div className="text-[12px] text-slate-600 mt-1 break-keep">
                {trackTheme}
              </div>
            </div>

            {/* 통계 */}
            {(totalCheckins != null || startedAt) && (
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100">
                <Stat label="총 체크인" value={`${totalCheckins ?? 30}일`} />
                <Stat label="기간" value="30일" />
                <Stat label="배지" value="GOLD" tone="gold" />
              </div>
            )}

            {/* 푸터 */}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 text-[9px] text-slate-400">
              <span className="font-mono">aihpro.app</span>
              <span>
                {formatDate(startedAt)} — {formatDate(completedAt) || formatDate(new Date().toISOString())}
              </span>
            </div>
          </div>

          {/* 액션 */}
          <div className="space-y-2 mt-4">
            {onDownloadWorkbook && (
              <Button
                onClick={onDownloadWorkbook}
                className="w-full h-11 rounded-xl bg-[#8a7a4d] hover:bg-[#6f6240] text-white font-bold text-[13px]"
              >
                <Download className="w-4 h-4 mr-1.5" />
                완성된 워크북 PDF 받기
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleDownloadImage}
                disabled={isCapturing}
                variant="outline"
                className="h-10 rounded-xl border-[#C8B88A]/50 text-[#8a7a4d] hover:bg-[#C8B88A]/10 hover:text-[#8a7a4d] font-bold text-[12px]"
              >
                <ImageIcon className="w-3.5 h-3.5 mr-1" />
                배지 저장
              </Button>
              <Button
                onClick={handleShare}
                disabled={isCapturing}
                variant="outline"
                className="h-10 rounded-xl border-[#C8B88A]/50 text-[#8a7a4d] hover:bg-[#C8B88A]/10 hover:text-[#8a7a4d] font-bold text-[12px]"
              >
                <Share2 className="w-3.5 h-3.5 mr-1" />
                공유
              </Button>
            </div>
          </div>

          <p className="text-[10.5px] text-center text-slate-400 mt-3 break-keep leading-relaxed">
            오늘의 한 걸음이 30일 후 한 권의 책이 되었어요. 다음 30일도 함께 갈게요.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="text-center">
      <div
        className={`text-sm font-bold ${
          tone === "gold" ? "text-[#8a7a4d]" : "text-slate-900"
        }`}
      >
        {value}
      </div>
      <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
