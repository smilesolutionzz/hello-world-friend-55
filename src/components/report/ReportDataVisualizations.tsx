import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell, AreaChart, Area, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Brain, Heart, Users, Target, Zap, Shield } from 'lucide-react';

interface DomainScore {
  domain: string;
  score: number;
  maxScore: number;
  label: string;
}

interface TrendPoint {
  date: string;
  score: number;
  label?: string;
}

interface StrengthItem {
  area: string;
  level: number; // 0-100
  status: 'strength' | 'moderate' | 'support';
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200"
    >
      {title && <h4 className="text-sm font-bold text-slate-800 mb-4 text-center">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <Radar
            name="점수"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      {/* 점수 요약 그리드 */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {domains.map((d, i) => {
          const pct = Math.round((d.score / d.maxScore) * 100);
          const color = pct >= 75 ? 'text-emerald-600 bg-emerald-50' : pct >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
          return (
            <div key={i} className={`text-center p-2 rounded-lg ${color}`}>
              <p className="text-lg font-black">{pct}%</p>
              <p className="text-[10px] font-medium">{d.label}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   2. 종단적 변화 트렌드 라인
   ═══════════════════════════════════════════ */
export const TrendLineChart = ({ data, title, yLabel }: { data: TrendPoint[]; title?: string; yLabel?: string }) => {
  if (!data || data.length < 2) return null;

  const firstScore = data[0].score;
  const lastScore = data[data.length - 1].score;
  const delta = lastScore - firstScore;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200"
    >
      <div className="flex items-center justify-between mb-4">
        {title && <h4 className="text-sm font-bold text-slate-800">{title}</h4>}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-bold">{delta > 0 ? '+' : ''}{delta.toFixed(1)}%</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#94a3b8' } } : undefined} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(value: number) => [`${value}점`, '점수']}
          />
          <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} fill="url(#trendGradient)" dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   3. 강점/약점 히트맵 바 차트
   ═══════════════════════════════════════════ */
export const StrengthWeaknessChart = ({ items, title }: { items: StrengthItem[]; title?: string }) => {
  const sorted = [...items].sort((a, b) => b.level - a.level);
  const getColor = (status: string) => {
    switch (status) {
      case 'strength': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'support': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200"
    >
      {title && <h4 className="text-sm font-bold text-slate-800 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 40)}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis type="category" dataKey="area" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} width={80} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(value: number, _: any, entry: any) => [
              `${value}%`,
              entry.payload.status === 'strength' ? '강점' : entry.payload.status === 'support' ? '지원 필요' : '보통'
            ]}
          />
          <Bar dataKey="level" radius={[0, 6, 6, 0]} barSize={20}>
            {sorted.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* 범례 */}
      <div className="flex justify-center gap-4 mt-3">
        {[
          { label: '강점 영역', color: '#10b981', icon: '🌟' },
          { label: '보통', color: '#f59e0b', icon: '📊' },
          { label: '지원 필요', color: '#ef4444', icon: '🔍' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            {l.icon} {l.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   4. 위험도 게이지 미터
   ═══════════════════════════════════════════ */
export const RiskGauge = ({ score, maxScore = 100, label, riskLevel }: {
  score: number; maxScore?: number; label: string; riskLevel: string;
}) => {
  const pct = Math.round((score / maxScore) * 100);
  const rotation = (pct / 100) * 180 - 90; // -90 to 90 degrees
  const riskColor = pct <= 30 ? '#10b981' : pct <= 60 ? '#f59e0b' : pct <= 80 ? '#f97316' : '#ef4444';
  const riskBg = pct <= 30 ? 'from-emerald-50 to-green-50' : pct <= 60 ? 'from-amber-50 to-yellow-50' : 'from-red-50 to-orange-50';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-gradient-to-br ${riskBg} rounded-xl p-6 border text-center`}
      style={{ borderColor: riskColor + '40' }}
    >
      <div className="relative w-48 h-24 mx-auto mb-4 overflow-hidden">
        {/* 반원 배경 */}
        <div className="absolute inset-0 rounded-t-full border-[12px] border-slate-200" style={{ borderBottom: 'none' }} />
        {/* 채워진 부분 */}
        <div
          className="absolute inset-0 rounded-t-full border-[12px] transition-all duration-1000"
          style={{
            borderColor: riskColor,
            borderBottom: 'none',
            clipPath: `polygon(0 100%, 0 0, ${Math.min(pct, 100)}% 0, ${Math.min(pct, 100)}% 100%)`,
          }}
        />
        {/* 중앙 점수 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="text-3xl font-black" style={{ color: riskColor }}>{pct}</p>
          <p className="text-[10px] text-slate-500 font-medium">/100</p>
        </div>
      </div>
      <p className="text-sm font-bold text-slate-800">{label}</p>
      <span
        className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: riskColor }}
      >
        {riskLevel}
      </span>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   5. 데이터 소스 인포그래픽
   ═══════════════════════════════════════════ */
export const DataSourceInfographic = ({ sources }: {
  sources: { label: string; count: number; icon: React.ElementType; color: string }[];
}) => {
  const total = sources.reduce((a, s) => a + s.count, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
    >
      <h4 className="text-sm font-bold text-slate-800 mb-4 text-center">📊 분석 데이터 소스</h4>
      <div className="flex items-center justify-center gap-1 mb-4">
        {sources.map((s, i) => {
          const widthPct = total > 0 ? (s.count / total) * 100 : 0;
          if (widthPct === 0) return null;
          return (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(widthPct, 8)}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="h-3 rounded-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: s.color }}
            />
          );
        })}
      </div>
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
   6. 주차별 로드맵 타임라인
   ═══════════════════════════════════════════ */
export const RoadmapTimeline = ({ weeks }: {
  weeks: { week: number; title: string; goals: string[]; activities: string[]; platformLinks?: string[] }[];
}) => {
  if (!weeks || weeks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200"
    >
      <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Target className="w-4 h-4 text-violet-600" /> 맞춤형 실행 로드맵
      </h4>
      <div className="space-y-4">
        {weeks.map((w, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-8"
          >
            {/* 타임라인 라인 */}
            {i < weeks.length - 1 && (
              <div className="absolute left-3 top-8 w-0.5 h-full bg-violet-200" />
            )}
            {/* 타임라인 점 */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              {w.week}
            </div>
            <div className="bg-white rounded-lg p-4 border border-violet-100 shadow-sm">
              <h5 className="text-sm font-bold text-violet-800 mb-2">Week {w.week}: {w.title}</h5>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 mb-1">🎯 목표</p>
                  <ul className="space-y-0.5">
                    {w.goals.map((g, gi) => (
                      <li key={gi} className="text-xs text-slate-600 flex items-start gap-1">
                        <span className="text-violet-500 mt-0.5">•</span> {g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 mb-1">📋 활동</p>
                  <ul className="space-y-0.5">
                    {w.activities.map((a, ai) => (
                      <li key={ai} className="text-xs text-slate-600 flex items-start gap-1">
                        <span className="text-emerald-500 mt-0.5">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {w.platformLinks && w.platformLinks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {w.platformLinks.map((link, li) => (
                    <span key={li} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                      🔗 {link}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   7. 교차상관 인사이트 카드
   ═══════════════════════════════════════════ */
export const CrossCorrelationInsight = ({ correlations }: {
  correlations: { source1: string; source2: string; insight: string; confidence: number }[];
}) => {
  if (!correlations || correlations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-6 border border-cyan-200"
    >
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
