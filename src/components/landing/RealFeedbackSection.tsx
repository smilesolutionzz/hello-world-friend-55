import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Sparkles, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const RealFeedbackSection = () => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();

  const chatMessages = [
    { sender: 'parent', text: '평소엔 괜찮다가 이러면 쟤 진짜 정신병인가 진심 그 생각 들거든요', time: '12:04' },
    { sender: 'expert', text: '상황이 통제 범위를 벗어났을 때 대안을 찾는 인지적 유연성이 급격히 저하됨을 시사합니다.', time: '12:04' },
    { sender: 'parent', text: '바로 이거에요. 와...', time: '12:05', highlight: true },
    { sender: 'parent', text: '늦었으면 눈곱만 떼고 가야지', time: '12:06' },
    { sender: 'expert', text: '불완전한 상태로 사회적 무대에 서라는 압박으로 느껴져 정서적 저항을 불러일으킨 겁니다.', time: '12:06' },
    { sender: 'parent', text: '아... 이해가 되기 시작해요', time: '12:07', highlight: true },
    { sender: 'parent', text: '이거 한 달 동안 고민 생길 때마다 쓸 수 있어요?', time: '12:09' },
    { sender: 'expert', text: '네! 구독하시면 무제한 리포트, 검사, 데이터 축적까지 전부 가능합니다.', time: '12:09' },
    { sender: 'parent', text: '완전 저렴한데요? 이거 대박이에요 🤩', time: '12:10', highlight: true },
  ];

  const feedbackHighlights = [
    {
      emoji: '😢',
      before: isEnglish ? '"Is something seriously wrong with my child?"' : '"쟤 진짜 정신병인가..."',
      after: isEnglish ? 'Cognitive inflexibility under stress — a natural response' : '인지적 유연성 저하 — 자연스러운 스트레스 반응',
      reaction: isEnglish ? '"This is exactly it. Wow..."' : '"바로 이거에요. 와..."',
    },
    {
      emoji: '💡',
      before: isEnglish ? '"Just wash your face and go!"' : '"늦었으면 눈곱만 떼고 가야지"',
      after: isEnglish ? 'Perceived as pressure to appear incomplete in public' : '불완전한 모습으로 무대에 서라는 압박',
      reaction: isEnglish ? '"Now I understand..."' : '"아... 이해가 되기 시작해요"',
    },
    {
      emoji: '🤩',
      before: isEnglish ? '"How much does this cost?"' : '"이거 얼마에요?"',
      after: isEnglish ? 'Unlimited reports & assessments with subscription' : '구독 시 리포트·검사 무제한',
      reaction: isEnglish ? '"This is amazing! So affordable!"' : '"완전 저렴한데요? 이거 대박이에요"',
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
          <h2 className="text-xl md:text-4xl font-bold text-white mb-3 leading-snug">
            {isEnglish ? (
              <>
                "I thought something was{' '}
                <span className="text-rose-400">seriously wrong</span>"
                <br />
                <span className="text-emerald-400">Then the report changed everything</span>
              </>
            ) : (
              <>
                "정신병인가 싶었는데"
                <br className="md:hidden" />
                {' '}
                <span className="text-emerald-400 text-lg md:text-4xl">
                  리포트를 보고
                  <br className="md:hidden" />
                  이해하려는 시도가 생겼어요
                </span>
              </>
            )}
          </h2>
          <p className="text-white/50 text-xs md:text-sm max-w-lg mx-auto">
            {isEnglish
              ? 'A real conversation between a parent and our team after receiving a behavioral analysis report'
              : '리포트를 받은 후 실제 학부모와 나눈 대화를 재구성했습니다'}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* 카카오톡 스타일 채팅 목업 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-[#b2c7d9] rounded-2xl border border-white/10 p-4 shadow-2xl max-h-[520px] overflow-y-auto space-y-2">
              {/* 채팅 헤더 */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">AI</div>
                  <span className="text-slate-900 text-sm font-extrabold">AIHPRO 전문 상담</span>
                </div>
                <span className="text-slate-700 text-xs font-medium">오늘</span>
              </div>

              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex ${msg.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] relative group`}>
                    <div
                      className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        msg.sender === 'parent'
                          ? 'bg-[#fee500] text-slate-900 rounded-tr-sm'
                          : 'bg-white text-slate-800 rounded-tl-sm'
                      } ${msg.highlight ? 'ring-2 ring-emerald-400/60' : ''}`}
                    >
                      {msg.text}
                    </div>
                    <span className={`text-[10px] text-slate-500 mt-0.5 block ${msg.sender === 'parent' ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ✅ {isEnglish ? 'Based on real feedback' : '실제 피드백 기반 재구성'}
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
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <p className="text-white/50 text-xs line-through leading-relaxed">
                        {item.before}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <p className="text-white/90 text-xs font-medium leading-relaxed">
                        {item.after}
                      </p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                      <p className="text-amber-300 text-xs font-semibold flex items-center gap-1">
                        <Quote className="w-3 h-3" /> {item.reaction}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/20 p-4 text-center"
            >
              <p className="text-white/80 text-sm font-bold mb-1">
                {isEnglish ? 'Fear → Understanding → Action' : '공포 → 이해 → 실천'}
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
