import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquareHeart,
  Sparkles,
  FileText,
  Users,
  ClipboardCheck,
  Mic,
  Gamepad2,
  BookOpen,
  LineChart,
  Gift,
  Bell,
  ShieldCheck,
  ArrowRight,
  Search,
  ListChecks,
  ShoppingBag,
} from 'lucide-react';
import StoreSection from '@/components/store/StoreSection';
import aihproLogo from '@/assets/aihpro-logo.png';

/**
 * MobileHome — 흰 배경 모바일 홈
 */

type Tile = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  badge?: 'NEW' | 'HOT' | 'ON' | '주요';
  iconBg: string;
  iconColor: string;
};

const tiles: Tile[] = [
  { label: '고민 쓰기',   icon: MessageSquareHeart, to: '/report-generator',    badge: 'HOT',  iconBg: 'bg-violet-50',  iconColor: 'text-violet-600' },
  { label: '마음 트랙',   icon: Sparkles,           to: '/mind-track',          badge: 'HOT',  iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
  { label: '리포트',      icon: FileText,           to: '/report-generator-pro',badge: '주요', iconBg: 'bg-sky-50',     iconColor: 'text-sky-600' },
  { label: '전문가',      icon: Users,              to: '/expert-hiring',       badge: 'ON',   iconBg: 'bg-rose-50',    iconColor: 'text-rose-500' },
  { label: '검사 모음',   icon: ListChecks,         to: '/assessment',          badge: '주요', iconBg: 'bg-fuchsia-50', iconColor: 'text-fuchsia-600' },
  { label: '발달 체크',   icon: ClipboardCheck,     to: '/check',                              iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: '음성 상담',   icon: Mic,                to: '/voice-counseling',                   iconBg: 'bg-teal-50',    iconColor: 'text-teal-600' },
  { label: '게임 검사',   icon: Gamepad2,           to: '/metaverse-voice',     badge: 'NEW',  iconBg: 'bg-pink-50',    iconColor: 'text-pink-500' },
  { label: '나의 여정',   icon: LineChart,          to: '/my-journey',                         iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600' },
  { label: '고민 보관함', icon: BookOpen,           to: '/concern-storage',                    iconBg: 'bg-orange-50',  iconColor: 'text-orange-500' },
  { label: '리워드',      icon: Gift,               to: '/rewards',                            iconBg: 'bg-yellow-50',  iconColor: 'text-yellow-600' },
  { label: '구독 관리',   icon: ShieldCheck,        to: '/profile?tab=subscription',           iconBg: 'bg-cyan-50',    iconColor: 'text-cyan-600' },
  { label: '스토어',      icon: ShoppingBag,        to: '/store',               badge: 'NEW',  iconBg: 'bg-lime-50',    iconColor: 'text-lime-600' },
];

const quickKeywords = ['#불안', '#번아웃', '#아이발달', '#수면', '#관계', '#우울'];

const MobileHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-white text-slate-900 break-keep pb-28"
    >
      {/* 헤더 */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={aihproLogo} alt="AIHPRO" className="w-8 h-8 object-contain" />
          <span className="text-[17px] font-bold tracking-tight">
            AIH<span className="text-[#8a7a4d]">PRO</span>
          </span>
        </div>
        <button
          aria-label="알림"
          onClick={() => navigate('/profile?tab=notifications')}
          className="p-2 text-slate-600 active:scale-95 transition"
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="px-5 space-y-6">
        {/* 캠페인 카드 */}
        <Link
          to="/mind-track"
          className="block relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1320] via-[#161b2e] to-[#1f2742] p-5 shadow-sm active:scale-[0.99] transition"
        >
          <p className="text-[12px] font-medium text-[#C8B88A] tracking-wide mb-1">
            오늘의 핵심 프로그램
          </p>
          <h2 className="text-[22px] font-bold text-white leading-tight">
            7일 마음 트랙
            <br />
            3일 무료 체험
          </h2>
          <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-[13px] font-semibold text-white">
            지금 시작하기 <ArrowRight className="w-4 h-4" />
          </div>
          <Sparkles className="absolute right-5 top-5 w-12 h-12 text-[#C8B88A]/30" />
        </Link>

        {/* 기능 그리드 */}
        <section>
          <div className="grid grid-cols-4 gap-y-5 gap-x-2">
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.label}
                  to={t.to}
                  className="flex flex-col items-center gap-1.5 active:scale-95 transition"
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl ${t.iconBg} flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-6 h-6 ${t.iconColor}`} />
                    </div>
                    {t.badge && (
                      <span className={`absolute -top-1.5 -right-1 px-1.5 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white whitespace-nowrap ${
                        t.badge === 'HOT' ? 'bg-rose-500'
                        : t.badge === 'NEW' ? 'bg-emerald-500'
                        : t.badge === 'ON' ? 'bg-amber-500'
                        : 'bg-rose-400'
                      }`}>
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-medium text-slate-700 text-center leading-tight">
                    {t.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 오늘 한눈에 */}
        <section className="rounded-3xl border border-slate-100 p-5 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold">오늘 한눈에</h3>
            <Link to="/dashboard" className="text-[12px] text-slate-500 inline-flex items-center gap-0.5">
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="진행 검사" value="3" />
            <Stat label="저장 리포트" value="2" />
            <Stat label="전문가" value="12" />
          </div>
        </section>

        {/* 추천 스토어 (Cafe24 연동) */}
        <StoreSection />

        {/* AI 빠른 질문 */}
        <section>
          <button
            onClick={() => navigate('/ai-copilot')}
            className="w-full rounded-full border-2 border-[#C8B88A]/40 px-5 py-3.5 flex items-center justify-between bg-white active:scale-[0.99] transition"
          >
            <span className="text-[14px] text-slate-500 truncate">
              마음·발달·관계, AI에게 바로 물어보세요
            </span>
            <Search className="w-4 h-4 text-[#8a7a4d] shrink-0" />
          </button>
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 shrink-0">인기검색</span>
            {quickKeywords.map((k) => (
              <button
                key={k}
                onClick={() => navigate(`/quiz?q=${encodeURIComponent(k.replace('#',''))}`)}
                className="shrink-0 text-[11px] font-medium text-[#8a7a4d] border border-[#C8B88A]/40 rounded-full px-2.5 py-1"
              >
                {k}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 px-3 py-3">
    <div className="text-[18px] font-bold leading-tight">{value}</div>
    <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
  </div>
);

export default MobileHome;
