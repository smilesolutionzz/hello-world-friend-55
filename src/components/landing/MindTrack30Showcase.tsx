import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";

/**
 * MindTrack30Showcase
 * 메인 랜딩의 영상 섹션 — 30일 마음 트랙을 25초 영상으로 소개합니다.
 * 영상은 Remotion으로 자체 제작 (public/videos/mind-track-30.mp4).
 * 가격은 src/constants/tokenCosts.ts 기준이며, 표기는 영상 내부에만 노출.
 */
export const MindTrack30Showcase = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: Clock,
      title: "매일 7분 루틴",
      desc: "체크인·미션·영상",
    },
    {
      icon: Sparkles,
      title: "7일에 한 챕터씩",
      desc: "완주 시 23일 연장 옵션",
    },
    {
      icon: ShieldCheck,
      title: "전문가 검수 코칭",
      desc: "비의료 가이드",
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C8B88A]/40 text-[#8A7A4E] text-[11px] md:text-xs font-semibold tracking-[0.18em] mb-4">
            AIHPRO · MIND TRACK 7
          </div>
          <h2 className="text-2xl md:text-5xl font-black text-slate-900 leading-[1.15] tracking-[-0.02em] break-keep">
            하루 7분, <br className="md:hidden" />
            7일의 시작.
          </h2>
          <p className="mt-4 text-sm md:text-lg text-slate-500 break-keep max-w-xl mx-auto leading-relaxed">
            ₩7,900으로 시작하는 7일 마음 트랙, 25초 영상으로 보여드릴게요.<br className="hidden md:block" />
            <span className="text-slate-400 text-xs md:text-sm">처음부터 길게 가고 싶다면 30일(₩19,900) 옵션도 있어요.</span>
          </p>
        </motion.div>

        <motion.div
          className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-30px_rgba(14,14,16,0.25)] border border-slate-100 bg-slate-950"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="aspect-video w-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls
              className="w-full h-full object-cover"
              poster="/videos/mind-track-30-poster.jpg"
            >
              <source src="/videos/mind-track-30.mp4?v=2" type="video/mp4" />
            </video>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 hover:border-[#C8B88A]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF7EE] text-[#8A7A4E] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 break-keep">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-xs md:text-sm text-slate-500 leading-relaxed whitespace-nowrap">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={() => navigate('/mind-track')}
            size="lg"
            className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-7 h-12 font-semibold group"
          >
            30일 마음 트랙 시작하기
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={() => navigate('/mind-track')}
            variant="ghost"
            size="lg"
            className="rounded-full text-slate-600 hover:text-slate-900 h-12"
          >
            자세히 보기
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MindTrack30Showcase;
