import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Share2, Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import { Award, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface Props {
  chapterNo: string;
  chapterTitle: string;
  shortTitle: string;
  desc: string;
  day: number;
  nickname?: string;
  trackTheme?: string;
  /** 공유 카피 — 링크 공유시 사용. 비워두면 자동 생성 */
  customCopy?: string;
}

/**
 * 챕터 잠금 해제 시 사용하는 공유 버튼.
 * - 링크 복사 (사용자 본인 인증 없이도 워크북 콘셉트 안내)
 * - 이미지 생성 (off-screen 카드를 html2canvas로 PNG 캡처)
 * - Web Share API (모바일)
 */
export default function ChapterShareButton({
  chapterNo,
  chapterTitle,
  shortTitle,
  desc,
  day,
  nickname = "내가",
  trackTheme,
  customCopy,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : "https://aihpro.app"}/mind-track`;
  const shareText =
    customCopy ||
    `${nickname} 30일 마음 트랙 ${chapterTitle}을 열었어요. 하루 한 장씩 쌓이는 나만의 마음 워크북.`;

  const captureBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#faf6ec",
      logging: false,
    });
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png", 1.0)
    );
  };

  const handleImage = async () => {
    setBusy(true);
    try {
      const blob = await captureBlob();
      if (!blob) throw new Error("capture failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mind-track-chapter-${chapterNo}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("챕터 카드 이미지를 저장했어요");
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("이미지 생성에 실패했어요");
    } finally {
      setBusy(false);
    }
  };

  const handleLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("공유 링크를 복사했어요");
      setOpen(false);
    } catch {
      toast.error("링크 복사에 실패했어요");
    }
  };

  const handleNativeShare = async () => {
    setBusy(true);
    try {
      const blob = await captureBlob();
      if (blob && navigator.canShare?.({ files: [new File([blob], "chapter.png", { type: "image/png" })] })) {
        const file = new File([blob], `mind-track-chapter-${chapterNo}.png`, { type: "image/png" });
        await navigator.share({
          title: `${chapterTitle} 잠금 해제`,
          text: shareText,
          url: shareUrl,
          files: [file],
        });
        setOpen(false);
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: chapterTitle, text: shareText, url: shareUrl });
        setOpen(false);
        return;
      }
      // 폴백
      handleLink();
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      console.error(e);
      toast.error("공유에 실패했어요");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a7a4d] hover:bg-[#C8B88A]/15 transition-colors flex-shrink-0"
            aria-label={`${chapterTitle} 공유`}
            onClick={(e) => e.stopPropagation()}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-44 p-1.5 rounded-2xl border-[#C8B88A]/30">
          <button
            onClick={handleNativeShare}
            disabled={busy}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12.5px] font-bold text-slate-800 hover:bg-[#C8B88A]/10 transition-colors disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8a7a4d]" /> 공유하기
          </button>
          <button
            onClick={handleImage}
            disabled={busy}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12.5px] font-bold text-slate-800 hover:bg-[#C8B88A]/10 transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#8a7a4d]" /> 이미지 저장
          </button>
          <button
            onClick={handleLink}
            disabled={busy}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12.5px] font-bold text-slate-800 hover:bg-[#C8B88A]/10 transition-colors disabled:opacity-50"
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#8a7a4d]" /> 링크 복사
          </button>
        </PopoverContent>
      </Popover>

      {/* off-screen 캡처 대상 카드 (보이지 않게 좌측 -9999px) */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: -9999,
              top: 0,
              width: 540,
              pointerEvents: "none",
              zIndex: -1,
            }}
            aria-hidden
          >
            <div
              ref={cardRef}
              style={{
                width: 540,
                background:
                  "radial-gradient(circle at 50% 0%, #fbf7eb 0%, #faf6ec 60%, #f5efdc 100%)",
                padding: 36,
                borderRadius: 28,
                fontFamily: "Pretendard Variable, system-ui, sans-serif",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  fontWeight: 700,
                  color: "#8a7a4d",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                AIHPRO Mind Track · 30 Days
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 28,
                  border: "1px solid rgba(200,184,138,0.4)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #f5efdc, #C8B88A)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen size={22} color="#8a7a4d" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7a4d", letterSpacing: "0.18em" }}>
                      CHAPTER {chapterNo} · DAY {day}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      잠금 해제 · {new Date().toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 30,
                    lineHeight: 1.25,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 10,
                  }}
                >
                  {chapterTitle}
                </div>
                <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>{desc}</div>

                <div style={{ height: 1, background: "rgba(200,184,138,0.4)", margin: "20px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "0.1em" }}>WORKBOOK BY</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{nickname}</div>
                  </div>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, #f5efdc 0%, #C8B88A 60%, #8a7a4d 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Award size={26} color="white" strokeWidth={1.8} />
                  </div>
                </div>

                {trackTheme && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(200,184,138,0.12)",
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: 1.6,
                    }}
                  >
                    {trackTheme}
                  </div>
                )}
              </div>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 18,
                  fontSize: 11,
                  color: "#8a7a4d",
                  fontFamily: "monospace",
                }}
              >
                aihpro.app · 하루 한 장의 마음 워크북
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
