import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Sparkles, Quote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import kakaoScreenshot from '@/assets/social-proof-kakao.png';

/**
 * 실제 카카오톡 대화 캡처 기반 소셜 프루프 섹션
 * 서현맘(CPRCM) 피드백 반영
 */
const RealFeedbackSection = () => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();

  const feedbackHighlights = [
    {
      emoji: '😢',
      before: '평소엔 괜찮다가 이러면 재 진짜 정신병인가 진심 그 생각 들거든요',
      after: '인지적 유연성이 급격히 저하됨을 시사합니다',
      reaction: '바로 이거에요. 와...',
    },
    {
      emoji: '💡',
      before: '늦었으면 눈곱만 떼고 가야지',
      after: '불완전한 상태로 사회적 무대에 서라는 압박으로 느껴져 정서적 저항을 불러일으켰습니다',
      reaction: '아... 이해가 되기 시작해요',
    },
    {
      emoji: '🤩',
      before: '3,900원? 한달동안 고민생길때마다?',
      after: '9,900원 무제한 구독',
      reaction: '완전 저렴한데요? 이거 대박이에요',
    },
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 via-indigo-950/30 to-slate-900" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
            <MessageCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-300">
              {isEnglish ? 'Real Parent Feedback' : '실제 학부모 반응'}
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            {isEnglish ? (
              <>
                "I thought something was <span className="text-rose-400">seriously wrong</span>"
                <br />
                <span className="text-emerald-400">Then the report changed everything</span>
              </>
            ) : (
              <>
                "정신병인가 싶었는데"
                <br />
                <span className="text-emerald-400">리포트를 보고 이해하려는 시도가 생겼어요</span>
              </>
            )}
          </h2>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            {isEnglish
              ? 'A real conversation between a parent and our team after receiving a behavioral analysis report'
              : '리포트를 받은 후 실제 학부모와 나눈 대화입니다'}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* 카카오톡 스크린샷 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/10 p-3 shadow-2xl">
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-white/40 text-xs ml-2">KakaoTalk</span>
              </div>
              <img
                src={kakaoScreenshot}
                alt="실제 학부모 카카오톡 피드백 대화"
                className="w-full rounded-xl"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ✅ 실제 대화 캡처
            </div>
          </motion.div>

          {/* 핵심 피드백 하이라이트 */}
          <div className="space-y-4">
            {feedbackHighlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div className="space-y-2 flex-1">
                    {/* 부모의 고민 (Before) */}
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <p className="text-white/50 text-xs line-through leading-relaxed">
                        "{item.before}"
                      </p>
                    </div>
                    {/* AI 리포트 해석 (After) */}
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <p className="text-white/90 text-xs font-medium leading-relaxed">
                        "{item.after}"
                      </p>
                    </div>
                    {/* 실제 반응 */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                      <p className="text-amber-300 text-xs font-semibold flex items-center gap-1">
                        <Quote className="w-3 h-3" /> {item.reaction}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* 핵심 메시지 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/20 p-4 text-center"
            >
              <p className="text-white/80 text-sm font-bold mb-1">
                {isEnglish
                  ? 'Fear → Understanding → Action'
                  : '공포 → 이해 → 실천'}
              </p>
              <p className="text-white/50 text-xs mb-3">
                {isEnglish
                  ? 'One report transforms how you see your child'
                  : '리포트 하나로 아이를 바라보는 시선이 달라집니다'}
              </p>
              <Button
                onClick={() => navigate('/report-generator')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isEnglish ? 'Get My Report — ₩3,900' : '나도 리포트 받아보기 — ₩3,900'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealFeedbackSection;
