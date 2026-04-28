import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowRight, Sparkles, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

type ChatMsg = { sender: 'parent' | 'expert'; text: string; time: string; highlight?: boolean };
type Highlight = { emoji: string; before: string; after: string; reaction: string };

type Persona = {
  id: string;
  badge: string;
  badgeEn: string;
  title: React.ReactNode;
  titleEn: React.ReactNode;
  subtitle: string;
  subtitleEn: string;
  chatTitle: string;
  chatTitleEn: string;
  messages: ChatMsg[];
  messagesEn: ChatMsg[];
  highlights: Highlight[];
  highlightsEn: Highlight[];
  cta: { label: string; labelEn: string; href: string };
  accent: string; // tailwind gradient classes for badge
};

const PERSONAS: Persona[] = [
  {
    id: 'parent-young',
    badge: '실제 학부모 반응',
    badgeEn: 'Real Parent Feedback',
    title: (
      <>
        “내가 잘못 키운 줄 알았는데,”
        <br className="md:hidden" />{' '}
        <span className="text-emerald-400 text-lg md:text-4xl">리포트를 보고 아이를<br className="md:hidden" /> 이해하게 됐어요.</span>
      </>
    ),
    titleEn: (
      <>
        "I thought I was a <span className="text-rose-400">bad parent</span>"
        <br />
        <span className="text-emerald-400">Then the report changed everything</span>
      </>
    ),
    subtitle: '리포트를 받은 후 실제 학부모와 나눈 대화를 재구성했습니다',
    subtitleEn: 'A real conversation between a parent and our team',
    chatTitle: 'AIHPRO 전문 상담',
    chatTitleEn: 'AIHPRO Expert Chat',
    messages: [
      { sender: 'parent', text: '아침마다 어린이집 가기 싫다고 30분씩 울어요. 제가 뭘 잘못한 걸까요?', time: '12:04' },
      { sender: 'expert', text: '아이가 게으른 게 아니라, 환경 전환에 적응 시간이 더 필요한 기질일 수 있어요.', time: '12:04' },
      { sender: 'parent', text: '아, 그래서 그랬구나… 와….', time: '12:05', highlight: true },
      { sender: 'parent', text: '맨날 “빨리빨리”만 외쳤어요.', time: '12:06' },
      { sender: 'expert', text: '재촉이 아이에겐 “준비도 안 됐는데 떠밀린다”는 불안으로 느껴져 더 큰 저항을 만든 거예요.', time: '12:06' },
      { sender: 'parent', text: '아… 이제 좀 이해가 돼요.', time: '12:07', highlight: true },
      { sender: 'parent', text: '이런 고민 생길 때마다 계속 받아볼 수 있나요?', time: '12:09' },
      { sender: 'expert', text: '네! 30일 마음 챌린지(₩19,900) 한 번이면 매일 워크북·검사·전문가 코칭까지 30일간 함께해요.', time: '12:09' },
      { sender: 'parent', text: '상담 한 번 값으로 30일이라니 🤩', time: '12:10', highlight: true },
    ],
    messagesEn: [
      { sender: 'parent', text: 'My child cries 30 min every morning before daycare. Am I doing something wrong?', time: '12:04' },
      { sender: 'expert', text: "Not at all — your child has a slow-to-warm-up temperament that needs more transition time.", time: '12:04' },
      { sender: 'parent', text: 'Oh… that explains so much.', time: '12:05', highlight: true },
      { sender: 'parent', text: "All I did was yell 'Hurry up!'", time: '12:06' },
      { sender: 'expert', text: "To the child it felt like 'pushed out unprepared' — that's why resistance grew.", time: '12:06' },
      { sender: 'parent', text: 'Now it finally makes sense.', time: '12:07', highlight: true },
      { sender: 'parent', text: 'Can I keep getting these insights whenever I worry?', time: '12:09' },
      { sender: 'expert', text: 'Yes — the 30-Day Mind Track (₩19,900) gives you 30 days of workbooks, tests, and expert coaching.', time: '12:09' },
      { sender: 'parent', text: '30 days for the price of one session 🤩', time: '12:10', highlight: true },
    ],
    highlights: [
      { emoji: '😢', before: '“제가 뭘 잘못한 걸까요?”', after: '환경 전환에 시간이 더 필요한 기질 — 부모 잘못이 아니에요.', reaction: '“아, 그래서 그랬구나… 와….”' },
      { emoji: '💡', before: '“빨리빨리 좀 해!”', after: '“준비도 안 됐는데 떠밀린다” → 저항 행동 유발', reaction: '“아… 이제 좀 이해가 돼요.”' },
      { emoji: '🤩', before: '“이거 얼마예요?”', after: '30일 마음 챌린지 — ₩19,900 (1회 결제)', reaction: '“상담 한 번 값으로 30일이라니!”' },
    ],
    highlightsEn: [
      { emoji: '😢', before: '"Am I a bad parent?"', after: 'Slow-to-warm-up temperament — not your fault', reaction: '"Oh, that explains so much."' },
      { emoji: '💡', before: '"Hurry up!"', after: 'Felt as "pushed out unprepared" → resistance', reaction: '"Now it makes sense."' },
      { emoji: '🤩', before: '"How much?"', after: '30-Day Mind Track — ₩19,900', reaction: '"30 days for one session price!"' },
    ],
    cta: { label: '30일 마음 변화 트랙 — ₩19,900', labelEn: '30-Day Mind Track — ₩19,900', href: '/report-generator' },
    accent: 'from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-300',
  },
  {
    id: 'teen-parent',
    badge: '청소년 부모 반응',
    badgeEn: 'Parent of Teens',
    title: (
      <>
        “사춘기라 어쩔 수 없다 했는데,”
        <br className="md:hidden" />{' '}
        <span className="text-sky-400 text-lg md:text-4xl">진짜 신호를<br className="md:hidden" /> 놓치고 있었어요.</span>
      </>
    ),
    titleEn: (
      <>
        "I blamed it on <span className="text-rose-400">puberty</span>"
        <br />
        <span className="text-sky-400">Turns out I was missing real signals</span>
      </>
    ),
    subtitle: '중2 자녀의 우울·번아웃 신호를 분석한 학부모 사례',
    subtitleEn: 'A parent who discovered hidden depression signals in a 14-year-old',
    chatTitle: 'AIHPRO 청소년 분석',
    chatTitleEn: 'AIHPRO Teen Analysis',
    messages: [
      { sender: 'parent', text: '애가 방에만 있고 말도 안 해요. 그냥 사춘기겠죠?', time: '21:14' },
      { sender: 'expert', text: '리포트상 우울 지표(PHQ-A)가 중상 구간이에요. 사춘기보다 회복 케어가 우선이에요.', time: '21:14' },
      { sender: 'parent', text: '네…? 그 정도였어요?', time: '21:15', highlight: true },
      { sender: 'parent', text: '학원 빠지는 거 게을러서인 줄 알았어요….', time: '21:16' },
      { sender: 'expert', text: '에너지 고갈 + 회피 패턴이에요. 야단보다 “오늘 뭐가 가장 힘들었어?” 한 마디가 더 효과적이에요.', time: '21:16' },
      { sender: 'parent', text: '오늘 그렇게 물어볼게요.', time: '21:18', highlight: true },
      { sender: 'parent', text: '이런 거 매주 추적도 되나요?', time: '21:20' },
      { sender: 'expert', text: '30일 마음 챌린지(₩19,900)면 주간 변화 추적 + 위험 신호 알림까지 받아보실 수 있어요.', time: '21:20' },
      { sender: 'parent', text: '이건 진짜 필요했던 거예요.', time: '21:22', highlight: true },
    ],
    messagesEn: [
      { sender: 'parent', text: 'He stays in his room, never talks. Just puberty, right?', time: '21:14' },
      { sender: 'expert', text: 'His PHQ-A depression score is moderately high. Recovery care comes before "puberty".', time: '21:14' },
      { sender: 'parent', text: 'Wait… that high?', time: '21:15', highlight: true },
      { sender: 'parent', text: 'I thought skipping academy was just laziness…', time: '21:16' },
      { sender: 'expert', text: 'Energy depletion + avoidance pattern. Ask "what was hardest today?" instead of scolding.', time: '21:16' },
      { sender: 'parent', text: "I'll ask him tonight.", time: '21:18', highlight: true },
      { sender: 'parent', text: 'Can I track this weekly?', time: '21:20' },
      { sender: 'expert', text: '30-Day Mind Track (₩19,900) gives you weekly tracking + risk alerts.', time: '21:20' },
      { sender: 'parent', text: 'This is exactly what I needed.', time: '21:22', highlight: true },
    ],
    highlights: [
      { emoji: '🚨', before: '“그냥 사춘기겠지.”', after: 'PHQ-A 우울 중상 구간 — 즉시 케어가 필요해요.', reaction: '“네…? 그 정도였어요?”' },
      { emoji: '💬', before: '“왜 또 빠졌어?”', after: '“오늘 뭐가 가장 힘들었어?” — 추궁보다 공감이 먼저예요.', reaction: '“오늘 그렇게 물어볼게요.”' },
      { emoji: '📈', before: '“매번 검사 따로 받기 부담돼요.”', after: '주간 추적 + 위험 신호 알림 — ₩19,900', reaction: '“진짜 필요했던 거예요.”' },
    ],
    highlightsEn: [
      { emoji: '🚨', before: '"Just puberty"', after: 'PHQ-A moderate depression — needs care', reaction: '"That high?"' },
      { emoji: '💬', before: '"Why did you skip again?"', after: '"What was hardest today?" — empathy first', reaction: '"I\'ll ask tonight."' },
      { emoji: '📈', before: '"Repeat tests are expensive"', after: 'Weekly tracking + risk alerts — ₩19,900', reaction: '"Exactly what I needed."' },
    ],
    cta: { label: '청소년 마음 추적 트랙 — ₩19,900', labelEn: 'Teen Mind Track — ₩19,900', href: '/report-generator' },
    accent: 'from-sky-500/10 to-blue-500/10 border-sky-500/20 text-sky-300',
  },
  {
    id: 'burnout-worker',
    badge: '직장인 번아웃 사례',
    badgeEn: 'Burnout Worker',
    title: (
      <>
        “그냥 피곤한 줄 알았는데,”
        <br className="md:hidden" />{' '}
        <span className="text-amber-400 text-lg md:text-4xl">번아웃 3단계에<br className="md:hidden" /> 이미 진입했더라고요.</span>
      </>
    ),
    titleEn: (
      <>
        "I thought I was just <span className="text-rose-400">tired</span>"
        <br />
        <span className="text-amber-400">I was already in burnout stage 3</span>
      </>
    ),
    subtitle: '5년차 직장인의 스트레스·번아웃 진단 후 회복 코칭 사례',
    subtitleEn: 'A 5-year professional discovering hidden burnout',
    chatTitle: 'AIHPRO 마음 코칭',
    chatTitleEn: 'AIHPRO Mind Coaching',
    messages: [
      { sender: 'parent', text: '주말에 12시간 자도 안 풀려요. 그냥 체력 문제겠죠?', time: '09:32' },
      { sender: 'expert', text: '리포트상 정서적 소진 + 비인간화 점수가 임상 기준을 초과했어요. 번아웃 3단계입니다.', time: '09:32' },
      { sender: 'parent', text: '…진짜요? 그렇게 심해요?', time: '09:33', highlight: true },
      { sender: 'parent', text: '회사 그만둬야 하나요?', time: '09:34' },
      { sender: 'expert', text: '아직은 아니에요. 30일 회복 루틴(아침 5분 호흡 + 주 2회 코칭)으로 70%는 한 달 안에 회복돼요.', time: '09:34' },
      { sender: 'parent', text: '진짜요? 다행이다….', time: '09:35', highlight: true },
      { sender: 'parent', text: '병원 가는 것보단 가벼운 게 좋아요.', time: '09:36' },
      { sender: 'expert', text: '30일 마음 챌린지(₩19,900) — 매일 측정 + 회복 가이드 + 전문가 코칭이 다 포함돼요.', time: '09:36' },
      { sender: 'parent', text: '오늘 바로 시작할게요.', time: '09:38', highlight: true },
    ],
    messagesEn: [
      { sender: 'parent', text: '12 hours of sleep on weekends and still drained. Just stamina?', time: '09:32' },
      { sender: 'expert', text: 'Your emotional exhaustion + depersonalization scores exceed clinical thresholds. Burnout stage 3.', time: '09:32' },
      { sender: 'parent', text: '…seriously? That bad?', time: '09:33', highlight: true },
      { sender: 'parent', text: 'Should I quit my job?', time: '09:34' },
      { sender: 'expert', text: 'Not yet. A 30-day routine (5-min morning breath + 2x weekly coaching) recovers 70% in a month.', time: '09:34' },
      { sender: 'parent', text: 'Really? What a relief…', time: '09:35', highlight: true },
      { sender: 'parent', text: 'I prefer something lighter than seeing a doctor.', time: '09:36' },
      { sender: 'expert', text: '30-Day Mind Track (₩19,900) — daily measurement + recovery guide + expert coaching.', time: '09:36' },
      { sender: 'parent', text: "I'll start today.", time: '09:38', highlight: true },
    ],
    highlights: [
      { emoji: '⚠️', before: '“그냥 체력 문제겠지.”', after: '번아웃 3단계 — 임상 기준 초과', reaction: '“진짜요? 그렇게 심해요?”' },
      { emoji: '🌱', before: '“회사 그만둬야 하나….”', after: '30일 회복 루틴이면 70%가 회복돼요.', reaction: '“진짜요? 다행이다….”' },
      { emoji: '💼', before: '“병원은 부담돼요.”', after: '매일 측정 + 코칭 — ₩19,900', reaction: '“오늘 바로 시작할게요.”' },
    ],
    highlightsEn: [
      { emoji: '⚠️', before: '"Just stamina"', after: 'Burnout stage 3 — exceeds clinical level', reaction: '"That bad?"' },
      { emoji: '🌱', before: '"Should I quit?"', after: '30-day routine recovers 70%', reaction: '"What a relief."' },
      { emoji: '💼', before: '"Hospital is too much"', after: 'Daily check + coaching — ₩19,900', reaction: '"Starting today."' },
    ],
    cta: { label: '번아웃 회복 트랙 — ₩19,900', labelEn: 'Burnout Recovery — ₩19,900', href: '/report-generator' },
    accent: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-300',
  },
  {
    id: 'senior-care',
    badge: '시니어 돌봄 가족',
    badgeEn: 'Senior Care Family',
    title: (
      <>
        "치매 초기인가 무서웠는데"
        <br className="md:hidden" />{' '}
        <span className="text-rose-400 text-lg md:text-4xl">정확히 어디부터<br className="md:hidden" />챙기면 되는지 알게 됐어요</span>
      </>
    ),
    titleEn: (
      <>
        "I feared <span className="text-rose-400">early dementia</span>"
        <br />
        <span className="text-rose-300">Now I know exactly where to start</span>
      </>
    ),
    subtitle: '70대 부모님의 인지 변화를 추적한 가족 사례',
    subtitleEn: 'A family tracking cognitive change in a 70-year-old parent',
    chatTitle: 'AIHPRO 인지 케어',
    chatTitleEn: 'AIHPRO Cognitive Care',
    messages: [
      { sender: 'parent', text: '엄마가 같은 말 자주 반복하세요. 치매 초기일까요?', time: '15:02' },
      { sender: 'expert', text: 'DRSA-AIH 인지 검사 결과 단기기억은 정상, 실행기능에서 약한 신호가 있어요. 치매보다는 우울·수면 영향이 커요.', time: '15:02' },
      { sender: 'parent', text: '아... 치매는 아닌 거네요', time: '15:03', highlight: true },
      { sender: 'parent', text: '그럼 뭘 챙기면 돼요?', time: '15:04' },
      { sender: 'expert', text: '햇빛 산책 20분 + 수면 일정 + 주 2회 인지 게임이 1순위예요. 30일 후 재측정으로 변화 확인 가능합니다.', time: '15:04' },
      { sender: 'parent', text: '그 정도면 충분히 할 수 있어요', time: '15:05', highlight: true },
      { sender: 'parent', text: '저희 가족이 같이 추적할 수 있나요?', time: '15:07' },
      { sender: 'expert', text: '네, 30일 마음 챌린지(₩19,900)로 가족이 함께 변화 추적 + 위험 알림을 받으실 수 있어요.', time: '15:07' },
      { sender: 'parent', text: '병원 가기 전에 이걸 먼저 봤어야 했네요', time: '15:09', highlight: true },
    ],
    messagesEn: [
      { sender: 'parent', text: 'Mom repeats herself often. Early dementia?', time: '15:02' },
      { sender: 'expert', text: 'Memory is normal but executive function shows mild signal. More likely depression + sleep impact.', time: '15:02' },
      { sender: 'parent', text: 'Oh… so not dementia.', time: '15:03', highlight: true },
      { sender: 'parent', text: 'What should we do?', time: '15:04' },
      { sender: 'expert', text: '20-min sunlight walk + sleep schedule + 2x weekly cognitive games. Re-measure in 30 days.', time: '15:04' },
      { sender: 'parent', text: 'We can do that.', time: '15:05', highlight: true },
      { sender: 'parent', text: 'Can our family track together?', time: '15:07' },
      { sender: 'expert', text: 'Yes, 30-Day Mind Track (₩19,900) lets family share tracking + risk alerts.', time: '15:07' },
      { sender: 'parent', text: 'Should have used this before the hospital.', time: '15:09', highlight: true },
    ],
    highlights: [
      { emoji: '🧠', before: '"치매 초기 같아요"', after: '실행기능 약한 신호 — 우울·수면 영향', reaction: '"치매는 아닌 거네요"' },
      { emoji: '☀️', before: '"뭘 해야 할지 모르겠어요"', after: '햇빛 + 수면 + 인지게임 3종', reaction: '"충분히 할 수 있어요"' },
      { emoji: '👨‍👩‍👧', before: '"가족이 따로 챙기기 힘들어"', after: '가족 공유 추적 — ₩19,900', reaction: '"이걸 먼저 봤어야 했네요"' },
    ],
    highlightsEn: [
      { emoji: '🧠', before: '"Early dementia?"', after: 'Mild executive signal — depression/sleep', reaction: '"Not dementia."' },
      { emoji: '☀️', before: '"Don\'t know what to do"', after: 'Sunlight + sleep + cognitive games', reaction: '"We can do that."' },
      { emoji: '👨‍👩‍👧', before: '"Hard to track together"', after: 'Family shared tracking — ₩19,900', reaction: '"Wish I knew earlier."' },
    ],
    cta: { label: '시니어 인지 케어 트랙 — ₩19,900', labelEn: 'Senior Cognitive Track — ₩19,900', href: '/report-generator' },
    accent: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-300',
  },
];

const RealFeedbackSection = () => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const [active, setActive] = useState(0);

  const persona = PERSONAS[active];
  const messages = isEnglish ? persona.messagesEn : persona.messages;
  const highlights = isEnglish ? persona.highlightsEn : persona.highlights;

  const goPrev = () => setActive((i) => (i - 1 + PERSONAS.length) % PERSONAS.length);
  const goNext = () => setActive((i) => (i + 1) % PERSONAS.length);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 via-indigo-950/30 to-slate-900" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Persona tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {PERSONAS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-all break-keep ${
                i === active
                  ? `bg-gradient-to-r ${p.accent} border-current shadow-lg scale-105`
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
              }`}
            >
              {isEnglish ? p.badgeEn : p.badge}
            </button>
          ))}
        </div>

        {/* Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${persona.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-center mb-10"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r ${persona.accent} border rounded-full mb-4`}>
              <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-semibold">
                {isEnglish ? persona.badgeEn : persona.badge}
              </span>
            </div>
            <h2 className="text-xl md:text-4xl font-bold text-white mb-3 leading-snug break-keep">
              {isEnglish ? persona.titleEn : persona.title}
            </h2>
            <p className="text-white/50 text-xs md:text-sm max-w-lg mx-auto break-keep">
              {isEnglish ? persona.subtitleEn : persona.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="relative max-w-5xl mx-auto">
          {/* Slide arrows (desktop) */}
          <button
            onClick={goPrev}
            aria-label="prev"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white items-center justify-center transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="next"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white items-center justify-center transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 gap-8 items-start"
            >
              {/* 카카오톡 스타일 채팅 목업 */}
              <div className="relative">
                <div className="bg-[#b2c7d9] rounded-2xl border border-white/10 p-4 shadow-2xl max-h-[520px] overflow-y-auto space-y-2">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">AI</div>
                      <span className="text-slate-900 text-sm font-extrabold">{isEnglish ? persona.chatTitleEn : persona.chatTitle}</span>
                    </div>
                    <span className="text-slate-700 text-xs font-medium">{isEnglish ? 'Today' : '오늘'}</span>
                  </div>

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex ${msg.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[80%]">
                        <div
                          className={`px-3 py-2 rounded-xl text-sm leading-relaxed break-keep ${
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
              </div>

              {/* 핵심 피드백 하이라이트 */}
              <div className="space-y-4">
                {highlights.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                          <p className="text-white/50 text-xs line-through leading-relaxed break-keep">{item.before}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          <p className="text-white/90 text-xs font-medium leading-relaxed break-keep">{item.after}</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                          <p className="text-amber-300 text-xs font-semibold flex items-center gap-1 break-keep">
                            <Quote className="w-3 h-3 flex-shrink-0" /> {item.reaction}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/20 p-4 text-center"
                >
                  <p className="text-white/80 text-sm font-bold mb-1">
                    {isEnglish ? 'Fear → Understanding → Action' : '공포 → 이해 → 실천'}
                  </p>
                  <p className="text-white/50 text-xs mb-3 break-keep">
                    {isEnglish ? 'One report transforms how you see them' : '리포트 하나로 바라보는 시선이 달라집니다'}
                  </p>
                  <Button
                    onClick={() => navigate(persona.cta.href)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isEnglish ? persona.cta.labelEn : persona.cta.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots + mobile arrows */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={goPrev}
              aria-label="prev"
              className="md:hidden w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {PERSONAS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === active ? 'w-8 bg-emerald-400' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              aria-label="next"
              className="md:hidden w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealFeedbackSection;
