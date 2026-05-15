import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame, TrendingUp, Stethoscope, MessageSquareHeart, Shield, ChevronRight } from 'lucide-react';
import { MIND_TRACK_FOCUSES } from '@/lib/mindTrackFocusTracks';
import { MIND_TRACK_7_PRICE } from '@/constants/tokenCosts';
import { Badge } from '@/components/ui/badge';

/**
 * 인플런 스타일 허브 섹션 — 메인 홈에서
 * BEST 7일 마음 트랙 9종 + 전문가 1:1 상담 + 무료 체험 검사 + 인기 검색어/실시간 급상승
 *
 * 디자인 원칙: 흰색 미니멀, rounded-2xl/3xl, 그라데이션 금지 (메모리 정책)
 */

const CATEGORY_CHIPS = [
  { id: 'all', label: '전체' },
  { id: 'personal', label: '나' },
  { id: 'family', label: '가족·아이' },
  { id: 'sleep', label: '수면' },
  { id: 'stress', label: '스트레스' },
  { id: 'mood', label: '감정' },
  { id: 'relationship', label: '관계' },
];

const EXPERT_PACKAGES = [
  {
    id: 'first15',
    title: '첫 15분 무료 상담',
    desc: '7일 트랙 결제자에게 제공되는 첫 매칭 무료 세션',
    badge: 'FREE',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    price: '무료',
    sub: '구독자 한정',
  },
  {
    id: 'single50',
    title: '50분 1:1 심층 상담',
    desc: '전문 임상가/코치와 단회 깊이 있는 세션',
    badge: 'POPULAR',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    price: '₩60,000~',
    sub: '구독자 20% 할인',
  },
  {
    id: 'urgent',
    title: '긴급 매칭 (24h)',
    desc: '오늘 안에 전문가 연결이 필요할 때',
    badge: 'URGENT',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    price: '24h 매칭',
    sub: '/expert-hiring?urgent=true',
  },
] as const;

const FREE_TESTS = [
  { id: 'depression', label: '우울감 체크', desc: '15문항 · 약 3분', tag: '무료' },
  { id: 'stress', label: '스트레스 진단', desc: '20문항 · 약 4분', tag: '무료' },
  { id: 'adhd', label: '집중력·ADHD 체크', desc: '18문항 · 약 4분', tag: '무료' },
  { id: 'anxiety', label: '불안 셀프체크', desc: '20문항 · 약 5분', tag: '무료' },
];

/** 트랙별 썸네일 — 솔리드 컬러 블록 + 패턴 + 후킹 카피 (그라데이션 금지) */
const TRACK_THUMBS: Record<string, {
  bg: string;        // 카드 배경
  ink: string;       // 본문 텍스트
  sub: string;       // 서브 텍스트
  accent: string;    // 도형 색
  hook: string;      // 후킹 한 줄
  tag: string;       // 우상단 태그
  pattern: 'dots' | 'rings' | 'wave' | 'grid' | 'beam';
}> = {
  sleep: {
    bg: 'bg-[#0F1B3D]', ink: 'text-white', sub: 'text-indigo-200', accent: 'bg-indigo-400/30',
    hook: '잠 못 드는 밤, 7일 안에 끝.', tag: '수면 회복', pattern: 'rings',
  },
  stress: {
    bg: 'bg-[#0E3B2E]', ink: 'text-white', sub: 'text-emerald-200', accent: 'bg-emerald-400/30',
    hook: '꽉 막힌 가슴이 풀리는 7일.', tag: '스트레스', pattern: 'wave',
  },
  mood: {
    bg: 'bg-[#3A1F0B]', ink: 'text-white', sub: 'text-amber-200', accent: 'bg-amber-400/30',
    hook: '가라앉은 기분, 다시 떠오르게.', tag: '감정 안정', pattern: 'beam',
  },
  focus: {
    bg: 'bg-[#0B2A4A]', ink: 'text-white', sub: 'text-sky-200', accent: 'bg-sky-400/30',
    hook: '산만한 뇌, 7일이면 다릅니다.', tag: '집중력', pattern: 'grid',
  },
  relationship: {
    bg: 'bg-[#3B0F1F]', ink: 'text-white', sub: 'text-rose-200', accent: 'bg-rose-400/30',
    hook: '말 한 마디로 관계가 바뀝니다.', tag: '관계 개선', pattern: 'dots',
  },
  self: {
    bg: 'bg-[#22143E]', ink: 'text-white', sub: 'text-violet-200', accent: 'bg-violet-400/30',
    hook: '나를 가장 정확히 보는 7일.', tag: '자기 이해', pattern: 'rings',
  },
  parenting: {
    bg: 'bg-[#3D0E2A]', ink: 'text-white', sub: 'text-pink-200', accent: 'bg-pink-400/30',
    hook: '엄마·아빠의 회복이 먼저입니다.', tag: '육아 번아웃', pattern: 'wave',
  },
  child_development: {
    bg: 'bg-[#0E3531]', ink: 'text-white', sub: 'text-teal-200', accent: 'bg-teal-400/30',
    hook: '우리 아이, 지금이 결정적 시기.', tag: '아이 발달', pattern: 'grid',
  },
  family_communication: {
    bg: 'bg-[#3A0E36]', ink: 'text-white', sub: 'text-fuchsia-200', accent: 'bg-fuchsia-400/30',
    hook: '훈육 말고, 닿는 대화로.', tag: '아이와 소통', pattern: 'dots',
  },
};

const ThumbPattern: React.FC<{ kind: TrackThumbKind; accent: string }> = ({ kind, accent }) => {
  if (kind === 'dots') {
    return (
      <div className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1.2px)',
          backgroundSize: '14px 14px',
        }}
      />
    );
  }
  if (kind === 'grid') {
    return (
      <div className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    );
  }
  if (kind === 'rings') {
    return (
      <>
        <div className={`absolute -right-12 -top-12 w-44 h-44 rounded-full border ${accent} border-white/20`} />
        <div className={`absolute -right-4 top-6 w-28 h-28 rounded-full border ${accent} border-white/20`} />
        <div className={`absolute right-8 top-16 w-14 h-14 rounded-full ${accent}`} />
      </>
    );
  }
  if (kind === 'wave') {
    return (
      <svg className="absolute inset-x-0 bottom-0 w-full h-20 opacity-50" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0,40 C80,80 160,0 240,40 C320,80 400,20 400,40 L400,80 L0,80 Z" fill="rgba(255,255,255,0.18)" />
        <path d="M0,55 C100,90 200,20 300,55 C360,75 400,40 400,55 L400,80 L0,80 Z" fill="rgba(255,255,255,0.10)" />
      </svg>
    );
  }
  // beam
  return (
    <>
      <div className="absolute -left-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute right-6 bottom-6 w-24 h-24 rounded-full bg-white/15 blur-xl" />
    </>
  );
};

type TrackThumbKind = 'dots' | 'rings' | 'wave' | 'grid' | 'beam';

const POPULAR_KEYWORDS = [
  '잠이 안 와요', '번아웃', '육아 번아웃', '직장 스트레스', '관계 갈등',
  '감정 조절', '집중력 저하', '아이 발달', '자기 이해', '회복 루틴',
];

const TRENDING_KEYWORDS = [
  { word: '7일 마음 트랙', delta: 'NEW' },
  { word: '전문가 1:1', delta: '+62' },
  { word: '수면 회복', delta: '+48' },
  { word: '감정일기', delta: '+33' },
  { word: '아이 발달 코칭', delta: '+29' },
  { word: '자기관찰', delta: '+21' },
  { word: '루틴 만들기', delta: '+17' },
  { word: '회복탄력성', delta: '+14' },
  { word: '관계 회복', delta: '+11' },
  { word: '변화 리포트', delta: '+9' },
];

const InflearnStyleHubSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeChip, setActiveChip] = useState('all');

  const tracks = useMemo(() => {
    if (activeChip === 'all') return MIND_TRACK_FOCUSES;
    if (activeChip === 'personal' || activeChip === 'family') {
      return MIND_TRACK_FOCUSES.filter((f) => f.category === activeChip);
    }
    return MIND_TRACK_FOCUSES.filter((f) => f.id === activeChip);
  }, [activeChip]);

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto space-y-16 md:space-y-20">

        {/* ─── BEST 7일 마음 트랙 ─── */}
        <div>
          <div className="flex items-end justify-between gap-3 mb-2 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] text-rose-600 uppercase mb-2">
                <Flame className="w-3.5 h-3.5" />
                BEST · 7 Day Mind Track
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 break-keep">
                지금 가장 인기 있는 7일 마음 트랙
              </h2>
              <p className="text-sm md:text-base text-slate-500 mt-2 break-keep">
                매일 5분, ₩{MIND_TRACK_7_PRICE.toLocaleString()}으로 7일 안에 발가벗겨진 듯 나를 봅니다.
              </p>
            </div>
            <button
              onClick={() => navigate('/mind-track')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
            >
              전체 보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 카테고리 칩 */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-5 scrollbar-hide">
            {CATEGORY_CHIPS.map((c) => {
              const active = c.id === activeChip;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChip(c.id)}
                  className={`shrink-0 h-9 px-4 rounded-full text-sm font-semibold border transition-all ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* 트랙 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((t, i) => (
              <button
                key={t.id}
                onClick={() => navigate(`/mind-track?goal=${t.id}`)}
                className="group text-left bg-white border border-slate-200 hover:border-slate-900 rounded-2xl overflow-hidden transition-all hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]"
              >
                {/* 상단 비주얼 영역 */}
                <div className="relative aspect-[16/9] bg-slate-50 flex items-center justify-center overflow-hidden">
                  <span className="text-[64px] leading-none">{t.icon}</span>
                  {i < 3 && (
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      <Flame className="w-3 h-3" />
                      LIVE BEST
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full">
                    7 Days
                  </div>
                </div>

                {/* 본문 */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Badge className={`${t.badgeClass} text-[10px] font-semibold border`}>
                      {t.category === 'family' ? '가족·아이' : '나'}
                    </Badge>
                    <span className="text-[10px] text-slate-400">Day 01–07</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug break-keep group-hover:text-slate-900">
                    {t.label}
                  </h3>
                  <p className="text-xs text-slate-500 break-keep leading-relaxed line-clamp-2">
                    {t.desc}
                  </p>
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 line-through">전문가 단회 ₩60,000~</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ₩{MIND_TRACK_7_PRICE.toLocaleString()}
                        <span className="text-[10px] font-medium text-slate-500 ml-1">/ 7일 전체</span>
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 전문가 1:1 상담 패키지 ─── */}
        <div>
          <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] text-blue-600 uppercase mb-2">
                <MessageSquareHeart className="w-3.5 h-3.5" />
                EXPERT · 1:1 Consultation
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 break-keep">
                AI로 부족할 땐, 사람이 닿습니다
              </h2>
              <p className="text-sm md:text-base text-slate-500 mt-2 break-keep">
                임상심리·코칭 전문가와 1:1로 — 7일 트랙 결제자는 첫 15분 무료.
              </p>
            </div>
            <button
              onClick={() => navigate('/expert-hiring')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
            >
              전문가 전체 보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXPERT_PACKAGES.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(p.id === 'urgent' ? '/expert-hiring?urgent=true' : '/expert-hiring')}
                className="text-left bg-white border-2 border-slate-200 hover:border-slate-900 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${p.badgeClass} text-[10px] font-bold border`}>{p.badge}</Badge>
                  <Stethoscope className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg break-keep mb-1">{p.title}</h3>
                <p className="text-xs text-slate-500 break-keep leading-relaxed mb-4">{p.desc}</p>
                <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-xl font-extrabold text-slate-900">{p.price}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{p.sub}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 무료 체험 검사 + 인기 검색어 (2단) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 무료 체험 검사 */}
          <div className="bg-slate-50 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 uppercase">
                Free · 무료 체험 검사
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 break-keep">
              가입 없이 3분, 내 마음 상태부터
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {FREE_TESTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate('/free-trial')}
                  className="text-left bg-white border border-slate-200 hover:border-slate-900 rounded-2xl p-4 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      {t.tag}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                  <div className="font-bold text-slate-900 text-sm break-keep">{t.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 인기 검색어 / 실시간 급상승 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
            <div className="grid grid-cols-2 gap-6">
              {/* 월간 인기 검색어 */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Flame className="w-3.5 h-3.5 text-slate-700" />
                  <h4 className="text-sm font-bold text-slate-900">인기 검색어</h4>
                </div>
                <ol className="space-y-2.5">
                  {POPULAR_KEYWORDS.slice(0, 10).map((k, i) => (
                    <li key={k}>
                      <button
                        onClick={() => navigate(`/mind-track?goal=${
                          ['sleep', 'stress', 'parenting', 'stress', 'relationship',
                           'mood', 'focus', 'child_development', 'self', 'self'][i] || 'stress'
                        }`)}
                        className="w-full text-left flex items-center gap-3 hover:text-slate-900 group"
                      >
                        <span className={`w-5 text-xs font-bold ${i < 3 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-700 group-hover:text-slate-900 break-keep">
                          {k}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 실시간 급상승 */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  <h4 className="text-sm font-bold text-slate-900">실시간 급상승</h4>
                </div>
                <ol className="space-y-2.5">
                  {TRENDING_KEYWORDS.map((k, i) => (
                    <li key={k.word}>
                      <button
                        onClick={() => navigate('/mind-track')}
                        className="w-full text-left flex items-center gap-3 hover:text-slate-900 group"
                      >
                        <span className={`w-5 text-xs font-bold ${i < 3 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-700 group-hover:text-slate-900 break-keep flex-1 truncate">
                          {k.word}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          k.delta === 'NEW' ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          {k.delta === 'NEW' ? 'NEW' : `▲${k.delta.replace('+', '')}`}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <button
                onClick={() => navigate('/mind-track')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <Sparkles className="w-3.5 h-3.5" />
                내 고민에 맞는 트랙 찾기
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InflearnStyleHubSection;
