import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Sparkles, Quote, Zap, LineChart, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const RealFeedbackSection = () => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();

  // 핵심 임팩트만 남긴 4개 메시지 (이해도 우선)
  const chatMessages = [
    { sender: 'parent', text: isEnglish ? '"I really thought something was wrong with my child..."' : '쟤 진짜 정신병인가 싶을 때가 있어요', time: '12:04' },
    { sender: 'expert', text: isEnglish ? 'Cognitive flexibility drops sharply under uncontrolled stress — a normal reaction.' : '통제 밖 상황에서 인지적 유연성이 떨어지는 자연스러운 반응입니다.', time: '12:04' },
    { sender: 'parent', text: isEnglish ? '"Oh… I’m starting to understand."' : '아... 이해가 되기 시작해요', time: '12:05', highlight: true },
    { sender: 'parent', text: isEnglish ? '"Can I keep using this for a month?"' : '이거 한 달 동안 계속 쓸 수 있어요?', time: '12:06' },
    { sender: 'expert', text: isEnglish ? 'Yes — 30-day Mind Track + unlimited reports & assessments.' : '네! 30일 마음 트랙 + 리포트·검사 무제한이에요.', time: '12:06' },
    { sender: 'parent', text: isEnglish ? '"That’s actually so affordable. Amazing 🤩"' : '완전 저렴한데요? 대박이에요 🤩', time: '12:07', highlight: true },
  ];

  // 실제 만들어둔 서비스 흐름과 1:1 매핑되는 3단계 여정 카드
  const journey = [
    {
      step: isEnglish ? 'STEP 1' : 'STEP 1',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      title: isEnglish ? 'Instant AI Analysis' : '즉석 AI 분석',
      desc: isEnglish
        ? 'Type one sentence about a behavior → get a professional report in 30 seconds.'
        : '아이의 행동 한 줄을 적으면 → 30초 안에 전문 해석 리포트가 나와요.',
      price: isEnglish ? 'Free' : '무료 체험',
      cta: isEnglish ? 'Try Free' : '무료로 해보기',
      route: '/instant-analysis',
    },
    {
      step: 'STEP 2',
      icon: LineChart,
      color: 'from-indigo-500 to-purple-500',
      title: isEnglish ? '30-Day Mind Track' : '30일 마음 변화 트랙',
      desc: isEnglish
        ? 'Daily check-ins, expert touchpoints on Day 7/14/21/30, and a free care call when risk is detected.'
        : '매일 체크인 + Day 7·14·21·30 전문가 개입 + 위험 감지 시 무료 케어콜이 자동으로 떠요.',
      price: '₩19,900',
      cta: isEnglish ? 'Start Track' : '트랙 시작하기',
      route: '/mind-track-workbook',
      featured: true,
    },
    {
      step: 'STEP 3',
      icon: UserCheck,
      color: 'from-rose-500 to-orange-500',
      title: isEnglish ? 'Expert Matching When You Need It' : '필요할 때 전문가 1:1 매칭',
      desc: isEnglish
        ? 'Tap "It’s hard" anytime — get matched with a 1:1 video counselor in minutes.'
        : '“어려워요” 한 번이면 1:1 화상 상담 전문가와 바로 연결돼요.',
      price: '₩9,900~',
      cta: isEnglish ? 'See Experts' : '전문가 보기',
      route: '/expert-hiring',
    },
  ];

  // 하단 미니 라인업 — 우리가 운영 중인 기능 한눈에
  const lineup = isEnglish
    ? ['Instant AI Analysis', '20+ Assessments', 'AI Voice Chat', 'Expert Matching', 'Reports & Journal', 'Risk Care Call', 'Journey Dashboard', 'AI Copilot']
    : ['즉석 AI 분석', '20+ 심리검사', 'AI 음성 상담', '전문가 매칭', '리포트·저널', '위험 감지 케어콜', '종단 대시보드', 'AI 코파일럿'];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 via-indigo-950/30 to-slate-900" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header — 의도 명확화 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
            <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
            <span className="text-xs md:text-sm font-semibold text-emerald-300">
              {isEnglish ? 'How AIHPRO Works · 30-Second Tour' : '이렇게 작동해요 · 30초 요약'}
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-snug break-keep">
            {isEnglish ? (
              <>
                One sentence about your child →{' '}
                <span className="text-emerald-400">an AI insight</span> →{' '}
                <span className="text-indigo-300">a 30-day change track</span>
              </>
            ) : (
              <>
                아이의 행동 <span className="text-amber-300">한 마디</span>가
                <br className="md:hidden" />{' '}
                <span className="text-emerald-400">AI 분석 한 줄</span>이 되고
                <br />
                <span className="text-indigo-300">30일 변화 트랙</span>으로 이어집니다
              </>
            )}
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto break-keep">
            {isEnglish
              ? 'A real conversation, then the exact 3-step service flow we’ve built for you.'
              : '실제 학부모와 나눈 대화 + 우리가 만든 3단계 서비스 흐름을 한눈에 보여드릴게요.'}
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* 좌측: 채팅 목업 (축약) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] md:text-xs font-bold text-amber-300">
                {isEnglish ? 'STEP 1 · Parent → AI Interpretation' : 'STEP 1 · 부모님 한 마디 → AI 전문 해석'}
              </span>
            </div>
            <div className="bg-[#b2c7d9] rounded-2xl border border-white/10 p-4 shadow-2xl space-y-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">AI</div>
                  <span className="text-slate-900 text-sm font-extrabold">AIHPRO</span>
                </div>
                <span className="text-slate-700 text-xs font-medium">{isEnglish ? 'Today' : '오늘'}</span>
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
                  <div className="max-w-[82%] relative">
                    <div
                      className={`px-3 py-2 rounded-xl text-sm leading-relaxed break-keep ${
                        msg.sender === 'parent'
                          ? 'bg-[#fee500] text-slate-900 rounded-tr-sm'
                          : 'bg-white text-slate-800 rounded-tl-sm'
                      } ${msg.highlight ? 'ring-2 ring-emerald-500/70' : ''}`}
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

          {/* 우측: 3단계 여정 카드 + 통합 CTA */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 mb-1 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-[10px] md:text-xs font-bold text-indigo-300">
                {isEnglish ? 'Our 3-Step Service Flow' : '우리가 만든 3단계 서비스 흐름'}
              </span>
            </div>

            {journey.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => navigate(item.route)}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className={`w-full text-left bg-slate-800/60 backdrop-blur-sm rounded-xl border p-4 transition-all hover:bg-slate-800/80 hover:scale-[1.01] ${
                    item.featured ? 'border-indigo-400/40 ring-1 ring-indigo-400/20' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold text-white/50 tracking-wider">{item.step}</span>
                        <span className="text-xs font-bold text-amber-300">{item.price}</span>
                      </div>
                      <h3 className="text-white font-bold text-sm md:text-base mb-1 break-keep">{item.title}</h3>
                      <p className="text-white/65 text-xs md:text-[13px] leading-relaxed break-keep mb-2">{item.desc}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                        {item.cta} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {/* 통합 CTA — 이중 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-900/50 to-purple-900/40 rounded-xl border border-indigo-500/20 p-4 space-y-2"
            >
              <p className="text-white/80 text-sm font-bold text-center mb-2 break-keep">
                {isEnglish ? 'Fear → Understanding → Action' : '공포 → 이해 → 실천, 한 번에 시작하기'}
              </p>
              <Button
                onClick={() => navigate('/mind-track-workbook')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isEnglish ? '30-Day Mind Track — ₩19,900' : '30일 마음 변화 트랙 — ₩19,900'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/instant-analysis')}
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/5 font-semibold py-3 rounded-xl"
              >
                {isEnglish ? 'Try Free Analysis First' : '먼저 무료로 분석 받아보기'}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* 하단: 운영 중인 전체 기능 라인업 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-6xl mx-auto mt-10 pt-8 border-t border-white/10"
        >
          <p className="text-center text-white/50 text-xs md:text-sm mb-4 break-keep">
            <Quote className="inline w-3 h-3 mr-1" />
            {isEnglish ? 'And we’ve built much more — all included' : '이외에도 우리가 운영 중인 기능들 — 모두 포함되어 있어요'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {lineup.map((label, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] md:text-xs font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RealFeedbackSection;
