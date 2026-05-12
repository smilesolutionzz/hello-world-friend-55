import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Building2, CheckCircle2, Users, Award } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent } from "@/components/common/Analytics";

/**
 * 자녀 마음트랙 중심 Hero (2026 GA 1차)
 * - 화이트 미니멀 + 라벤더(#9b87f5) 액센트
 * - 트랙 선택 카드 3종 (자녀 / 성인 / 청소년)
 * - 신뢰 시그널 3종
 */
const HeroSection = () => {
  const navigate = useNavigate();

  const handlePrimaryCTA = () => {
    trackEvent("hero_cta_child_track");
    navigate("/track/child");
  };

  const handleSecondaryCTA = () => {
    trackEvent("hero_cta_b2b_partner");
    navigate("/b2b");
  };

  const tracks = [
    {
      id: "child",
      title: "자녀 마음트랙",
      desc: "발달센터 14년 전문가가 설계한 자녀 30일 코칭",
      badge: "지금 시작 가능",
      badgeTone: "live" as const,
      featured: true,
      onClick: handlePrimaryCTA,
    },
    {
      id: "adult",
      title: "성인 마음트랙",
      desc: "직장인·부모를 위한 30일 마음 케어",
      badge: "7월 오픈 예정",
      badgeTone: "soon" as const,
      featured: false,
      onClick: () => trackEvent("hero_track_adult_pending"),
    },
    {
      id: "teen",
      title: "청소년 마음트랙",
      desc: "사춘기·학업 스트레스 관리 30일 코칭",
      badge: "8월 오픈 예정",
      badgeTone: "soon" as const,
      featured: false,
      onClick: () => trackEvent("hero_track_teen_pending"),
    },
  ];

  const trustSignals = [
    {
      icon: Award,
      text: "한점미소발달센터 2곳을 14년간 운영해온 임상 전문가가 직접 설계",
    },
    {
      icon: Users,
      text: "발달센터·심리상담센터 20곳 파트너와 함께 출시",
    },
    {
      icon: CheckCircle2,
      text: "임상 검증된 표준 검사 도구로 변화를 측정",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* 배경 라벤더/크림 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 10%, rgba(155,135,245,0.10) 0%, transparent 60%), radial-gradient(50% 40% at 90% 20%, rgba(255,221,193,0.25) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-16 md:pb-24">
        {/* 상단 카피 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* 배지 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9b87f5]/10 border border-[#9b87f5]/20 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7c66e8]" />
            <span className="text-xs font-medium text-[#5b48c4] tracking-wide">
              발달센터 14년 임상 전문가 직접 설계
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-[26px] sm:text-4xl md:text-[44px] lg:text-[52px] font-extrabold leading-[1.25] tracking-tight text-[#1a1a1a] mb-6 break-keep">
            30일 후, 자녀의 마음 점수가
            <br className="hidden sm:block" />
            <span className="text-[#7c66e8]"> 얼마나 바뀌었는지 숫자로</span> 보여드립니다
          </h1>

          {/* Sub */}
          <p className="text-[#4a4a4a] text-base md:text-lg leading-relaxed mb-9 max-w-2xl mx-auto break-keep">
            발달센터 14년 임상 전문가가 설계한 자녀 마음 코칭. 매일 1분 체크인 + 임상 검증 검사(PHQ-A·CBCL·K-DST) +
            AI 변화 분석.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Button
              onClick={handlePrimaryCTA}
              className="group h-14 px-8 text-base font-bold rounded-2xl bg-[#1a1a1a] text-white hover:bg-[#000] shadow-[0_10px_30px_-12px_rgba(155,135,245,0.55)] transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5 mr-2 text-[#c4b5fd]" />
              자녀 마음트랙 시작하기
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={handleSecondaryCTA}
              variant="outline"
              className="h-14 px-7 text-base font-semibold rounded-2xl bg-white border-[#e5e5e5] text-[#1a1a1a] hover:bg-[#fafafa]"
            >
              <Building2 className="w-4 h-4 mr-2 text-[#7c66e8]" />
              발달센터·상담센터 파트너 신청
            </Button>
          </div>
        </motion.div>

        {/* 트랙 선택 카드 3개 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14 md:mt-20 grid md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto"
        >
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={track.onClick}
              disabled={!track.featured}
              className={`group relative text-left rounded-3xl p-6 md:p-7 border transition-all ${
                track.featured
                  ? "bg-white border-[#9b87f5]/30 shadow-[0_20px_60px_-30px_rgba(155,135,245,0.45)] hover:shadow-[0_28px_70px_-30px_rgba(155,135,245,0.6)] hover:-translate-y-1 cursor-pointer"
                  : "bg-[#fafafa] border-[#eee] opacity-80 cursor-not-allowed"
              }`}
            >
              {/* Featured 강조 라인 */}
              {track.featured && (
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#9b87f5] via-[#b8a5ff] to-[#9b87f5]" />
              )}

              {/* 배지 */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mb-4 ${
                  track.badgeTone === "live"
                    ? "bg-[#9b87f5]/12 text-[#5b48c4]"
                    : "bg-[#f1f1f1] text-[#888]"
                }`}
              >
                {track.badgeTone === "live" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9b87f5] animate-pulse" />
                )}
                {track.badge}
              </div>

              <h3 className="text-[#1a1a1a] text-xl md:text-[22px] font-bold mb-2 break-keep">
                {track.title}
              </h3>
              <p className="text-[#666] text-sm leading-relaxed break-keep mb-5">{track.desc}</p>

              {track.featured ? (
                <div className="flex items-center gap-1.5 text-[#7c66e8] text-sm font-semibold">
                  지금 시작하기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              ) : (
                <div className="text-[#aaa] text-sm font-medium">알림 신청 준비 중</div>
              )}
            </button>
          ))}
        </motion.div>

        {/* 신뢰 시그널 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 md:mt-24 max-w-4xl mx-auto"
        >
          <div className="rounded-3xl bg-white border border-[#f0f0f0] p-6 md:p-8 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.06)]">
            <div className="grid md:grid-cols-3 gap-5 md:gap-7">
              {trustSignals.map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-[#9b87f5]/10 flex items-center justify-center">
                    <s.icon className="w-4.5 h-4.5 text-[#7c66e8]" />
                  </div>
                  <p className="text-[#333] text-sm leading-relaxed break-keep">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
