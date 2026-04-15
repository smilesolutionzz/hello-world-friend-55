import React, { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell, AreaChart, Area, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus, Brain, Heart, Users, Target, Zap, Shield,
  CheckCircle2, Circle, Calendar, ArrowRight, Sparkles, BookOpen, Eye, MessageSquare, FileText,
  Gamepad2, Mic, ClipboardList, Video, GraduationCap, Clock
} from 'lucide-react';

// ═══ Type Definitions ═══
interface DomainScore { domain: string; score: number; maxScore: number; label: string; }
interface TrendPoint { date: string; score: number; label?: string; }
interface StrengthItem { area: string; level: number; status: 'strength' | 'moderate' | 'support'; }

interface RoadmapWeek {
  week: number;
  goal: string;
  activities: string[];
  platformFeatures?: string[];
  milestone?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface RoadmapData {
  weeks4?: RoadmapWeek[];
  weeks8?: RoadmapWeek[];
  weeks12?: RoadmapWeek[];
}

// ═══ Platform feature to route mapping ═══
const PLATFORM_FEATURE_MAP: Record<string, { path: string; icon: React.ElementType; label: string }> = {
  '간편검사': { path: '/assessment', icon: ClipboardList, label: '간편검사' },
  '심리검사': { path: '/assessment', icon: ClipboardList, label: '심리검사' },
  '심층검사': { path: '/premium-assessment', icon: GraduationCap, label: '심층검사' },
  '관찰일지': { path: '/observation', icon: Eye, label: '관찰일지' },
  '게임상담': { path: '/metaverse-voice', icon: Gamepad2, label: '게임상담' },
  '금쪽상담소': { path: '/metaverse-voice', icon: Gamepad2, label: '금쪽상담소' },
  '음성상담': { path: '/metaverse-voice', icon: Mic, label: '음성상담' },
  '영상분석': { path: '/video-observation', icon: Video, label: '영상분석' },
  '두뇌훈련': { path: '/brain-training', icon: Brain, label: '두뇌훈련' },
  '인지훈련': { path: '/brain-training', icon: Brain, label: '인지훈련' },
  '리포트': { path: '/report-generator-pro', icon: FileText, label: '리포트' },
  'ADHD검사': { path: '/assessment/adhd', icon: ClipboardList, label: 'ADHD검사' },
  '우울감검사': { path: '/assessment/depression', icon: Heart, label: '우울감검사' },
  '스트레스검사': { path: '/assessment/stress', icon: ClipboardList, label: '스트레스검사' },
  '불안검사': { path: '/assessment/anxiety-test', icon: Heart, label: '불안검사' },
  '성격검사': { path: '/assessment/big-five', icon: Users, label: '성격검사' },
};

function matchPlatformFeature(text: string): { path: string; icon: React.ElementType; label: string } | null {
  const normalized = text.replace(/\s/g, '').toLowerCase();
  for (const [key, value] of Object.entries(PLATFORM_FEATURE_MAP)) {
    if (normalized.includes(key.replace(/\s/g, '').toLowerCase())) {
      return value;
    }
  }
  return null;
}

/* ═══════════════════════════════════════════
   1. 멀티도메인 레이더 차트
   ═══════════════════════════════════════════ */
export const DomainRadarChart = ({ domains, title }: { domains: DomainScore[]; title?: string }) => {
  const data = domains.map(d => ({
    subject: d.label,
    score: Math.round((d.score / d.maxScore) * 100),
    fullMark: 100,
  }));

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
      {title && <h4 className="text-sm font-bold text-slate-800 mb-4 text-center">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <Radar name="점수" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   2. 종단적 변화 트렌드 라인
   ═══════════════════════════════════════════ */
export const TrendLineChart = ({ data, title, yLabel }: { data: TrendPoint[]; title?: string; yLabel?: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
    {title && <h4 className="text-sm font-bold text-slate-800 mb-4 text-center">{title}</h4>}
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: yLabel || '', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
        <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} fill="url(#scoreGradient)" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

/* ═══════════════════════════════════════════
   3. 강점/약점 수평 바 차트
   ═══════════════════════════════════════════ */
export const StrengthWeaknessChart = ({ items, title }: { items: StrengthItem[]; title?: string }) => {
  const getColor = (status: string) => status === 'strength' ? '#10b981' : status === 'moderate' ? '#f59e0b' : '#ef4444';
  const sorted = [...items].sort((a, b) => b.level - a.level);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
      {title && <h4 className="text-sm font-bold text-slate-800 mb-4 text-center">{title}</h4>}
      <div className="space-y-3">
        {sorted.map((item, i) => (
          <motion.div key={i} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 w-24 text-right truncate">{item.area}</span>
            <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.level}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className="h-full rounded-full" style={{ backgroundColor: getColor(item.status) }} />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-700">{item.level}%</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              item.status === 'strength' ? 'bg-emerald-100 text-emerald-700' :
              item.status === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }`}>{item.status === 'strength' ? '강점' : item.status === 'moderate' ? '보통' : '지원 필요'}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   4. 위험도 게이지
   ═══════════════════════════════════════════ */
export const RiskGauge = ({ score, label, riskLevel }: { score: number; label?: string; riskLevel?: string }) => {
  const getGaugeColor = (s: number) => s <= 30 ? '#10b981' : s <= 60 ? '#f59e0b' : s <= 80 ? '#f97316' : '#ef4444';
  const getGaugeLabel = (s: number) => s <= 30 ? '양호' : s <= 60 ? '주의' : s <= 80 ? '경계' : '심각';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 text-center">
      {label && <h4 className="text-sm font-bold text-slate-800 mb-4">{label}</h4>}
      <div className="relative w-48 h-28 mx-auto">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke={getGaugeColor(score)} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`} className="transition-all duration-1000" />
          <text x="100" y="70" textAnchor="middle" className="fill-slate-800 text-3xl font-black">{score}</text>
          <text x="100" y="90" textAnchor="middle" className="fill-slate-500 text-xs">{riskLevel || getGaugeLabel(score)}</text>
        </svg>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   5. 데이터 소스 인포그래픽
   ═══════════════════════════════════════════ */
export const DataSourceInfographic = ({ sources }: {
  sources: { label: string; count: number; icon: React.ElementType; color: string }[];
}) => {
  const total = sources.reduce((sum, s) => sum + s.count, 0);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-200">
      <h4 className="text-sm font-bold text-slate-800 mb-4 text-center flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 text-indigo-600" /> 교차 분석 데이터 소스
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sources.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800">{s.count}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500 mt-3">총 <strong className="text-indigo-600">{total}개</strong> 데이터 포인트 교차 분석</p>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   6. 인터랙티브 로드맵 엔진 (Phase 3)
   ═══════════════════════════════════════════ */
export const InteractiveRoadmap = ({ roadmapData }: { roadmapData: RoadmapData | RoadmapWeek[] }) => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState<'4' | '8' | '12'>('4');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Normalize data: handle both array format and object format
  let weeks4: RoadmapWeek[] = [];
  let weeks8: RoadmapWeek[] = [];
  let weeks12: RoadmapWeek[] = [];

  if (Array.isArray(roadmapData)) {
    // Legacy flat array format
    weeks4 = roadmapData.filter(w => w.week <= 4);
    weeks8 = roadmapData.filter(w => w.week > 4 && w.week <= 8);
    weeks12 = roadmapData.filter(w => w.week > 8 && w.week <= 12);
  } else if (roadmapData && typeof roadmapData === 'object') {
    weeks4 = roadmapData.weeks4 || [];
    weeks8 = roadmapData.weeks8 || [];
    weeks12 = roadmapData.weeks12 || [];
  }

  const phases = [
    { key: '4' as const, label: '1~4주', subtitle: '기초 형성기', weeks: weeks4, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { key: '8' as const, label: '5~8주', subtitle: '강화·성장기', weeks: weeks8, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    { key: '12' as const, label: '9~12주', subtitle: '안정·자립기', weeks: weeks12, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ];

  const currentPhase = phases.find(p => p.key === activePhase) || phases[0];
  const allWeeks = [...weeks4, ...weeks8, ...weeks12];
  const totalItems = allWeeks.reduce((acc, w) => acc + (w.activities?.length || 0), 0);
  const completedCount = completedItems.size;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const toggleComplete = (weekNum: number, actIdx: number) => {
    const key = `${weekNum}-${actIdx}`;
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (allWeeks.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-slate-200 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Target className="w-5 h-5" />
            </div>
            맞춤형 성장 로드맵
          </h3>
          <p className="text-xs text-slate-500 mt-1">AI가 분석 결과를 바탕으로 설계한 12주 실행 계획</p>
        </div>
        
        {/* Progress ring */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="#8b5cf6" strokeWidth="4"
                strokeDasharray={`${(progressPercent / 100) * 150.8} 150.8`}
                strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-violet-700">
              {progressPercent}%
            </span>
          </div>
          <div className="text-xs text-slate-500">
            <p className="font-semibold text-slate-700">{completedCount}/{totalItems}</p>
            <p>활동 완료</p>
          </div>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2">
        {phases.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePhase(p.key)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all text-center ${
              activePhase === p.key
                ? `${p.bg} ${p.border} shadow-md`
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className={`text-sm font-bold ${activePhase === p.key ? 'text-slate-800' : 'text-slate-500'}`}>{p.label}</p>
            <p className="text-[10px] text-slate-400">{p.subtitle}</p>
            {p.weeks.length > 0 && (
              <Badge variant="secondary" className="mt-1 text-[10px]">{p.weeks.length}주</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Week cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {currentPhase.weeks.map((w, wi) => (
            <motion.div
              key={w.week}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: wi * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Week header */}
              <div className={`bg-gradient-to-r ${currentPhase.color} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Week {w.week}</p>
                    <p className="text-white/80 text-[11px]">{w.goal}</p>
                  </div>
                </div>
                {w.milestone && (
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
                    {w.milestone}
                  </Badge>
                )}
              </div>

              {/* Activities checklist */}
              <div className="p-4 space-y-2">
                {w.activities?.map((activity, ai) => {
                  const itemKey = `${w.week}-${ai}`;
                  const isDone = completedItems.has(itemKey);
                  return (
                    <button
                      key={ai}
                      onClick={() => toggleComplete(w.week, ai)}
                      className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg transition-all ${
                        isDone ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {isDone
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        : <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                      }
                      <span className={`text-xs leading-relaxed ${isDone ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                        {activity}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Platform feature links */}
              {w.platformFeatures && w.platformFeatures.length > 0 && (
                <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                  {w.platformFeatures.map((feat, fi) => {
                    const matched = matchPlatformFeature(feat);
                    if (matched) {
                      const FeatIcon = matched.icon;
                      return (
                        <button
                          key={fi}
                          onClick={() => navigate(matched.path)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 text-violet-700 text-[11px] font-medium hover:shadow-md hover:border-violet-300 transition-all"
                        >
                          <FeatIcon className="w-3 h-3" />
                          {matched.label}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      );
                    }
                    return (
                      <span key={fi} className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                        🔗 {feat}
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}

          {currentPhase.weeks.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              이 단계의 로드맵이 아직 생성되지 않았습니다
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Quick start CTA */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <Sparkles className="w-5 h-5" />
          <div>
            <p className="text-sm font-bold">지금 바로 시작하세요</p>
            <p className="text-[11px] text-white/80">Week 1 활동부터 차근차근 진행해보세요</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/assessment')}
          className="bg-white text-violet-700 hover:bg-white/90 text-xs font-bold px-4"
          size="sm"
        >
          시작하기 <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};

// Legacy alias
export const RoadmapTimeline = ({ weeks }: { weeks: any }) => {
  return <InteractiveRoadmap roadmapData={weeks} />;
};

/* ═══════════════════════════════════════════
   7. 교차상관 인사이트 카드
   ═══════════════════════════════════════════ */
export const CrossCorrelationInsight = ({ correlations }: {
  correlations: { source1: string; source2: string; insight: string; confidence: number }[];
}) => {
  if (!correlations || correlations.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-6 border border-cyan-200">
      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-cyan-600" /> 교차 분석 인사이트
      </h4>
      <div className="space-y-3">
        {correlations.map((c, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-cyan-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">{c.source1}</span>
              <span className="text-slate-300">×</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">{c.source2}</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-bold">
                신뢰도 {c.confidence}%
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{c.insight}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
