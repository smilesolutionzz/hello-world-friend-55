import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, History, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { useProgressTracking, type ProgressRecord } from '@/hooks/useProgressTracking';

interface ProgressComparisonProps {
  currentScores: Record<string, number>;
  sourceType: 'game_counseling' | 'voice_counseling' | 'assessment';
  sourceId?: string;
  dimensionLabels?: Record<string, string>;
}

interface DimensionChange {
  key: string;
  label: string;
  current: number;
  previous: number;
  diff: number;
  trend: 'up' | 'down' | 'stable';
}

export default function ProgressComparison({
  currentScores,
  sourceType,
  sourceId,
  dimensionLabels = {}
}: ProgressComparisonProps) {
  const { fetchHistory, history, loading } = useProgressTracking();
  const [expanded, setExpanded] = useState(false);
  const [selectedPrev, setSelectedPrev] = useState<ProgressRecord | null>(null);

  useEffect(() => {
    fetchHistory(sourceType, sourceId);
  }, [sourceType, sourceId]);

  // Filter previous records (exclude the current one just saved)
  const previousRecords = history.filter(h => {
    const scores = h.dimension_scores as Record<string, number>;
    // Don't match exact same scores (just saved)
    return JSON.stringify(scores) !== JSON.stringify(currentScores);
  });

  const comparisonTarget = selectedPrev || previousRecords[0];

  if (previousRecords.length === 0) {
    return (
      <Card className="p-4 bg-white/5 border-white/10">
        <div className="flex items-center gap-2 text-white/60">
          <History className="w-4 h-4" />
          <p className="text-sm">첫 번째 기록이에요! 다음에 다시 하면 변화를 추적할 수 있어요 📈</p>
        </div>
      </Card>
    );
  }

  const prevScores = comparisonTarget.dimension_scores as Record<string, number>;

  const changes: DimensionChange[] = Object.keys(currentScores).map(key => {
    const current = currentScores[key] || 0;
    const previous = prevScores[key] || 0;
    const diff = current - previous;
    return {
      key,
      label: dimensionLabels[key] || key,
      current,
      previous,
      diff,
      trend: diff > 3 ? 'up' : diff < -3 ? 'down' : 'stable'
    };
  });

  const improved = changes.filter(c => c.trend === 'up');
  const declined = changes.filter(c => c.trend === 'down');

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const daysDiff = comparisonTarget
    ? Math.round((Date.now() - new Date(comparisonTarget.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card className="p-5 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border-indigo-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white">변화 추적</h3>
        </div>
        <span className="text-xs text-white/50">
          {daysDiff === 0 ? '오늘' : `${daysDiff}일 전`} 대비
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-emerald-500/15 rounded-xl p-3 text-center">
          <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-emerald-400">{improved.length}</p>
          <p className="text-[10px] text-emerald-300/70">성장</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <Minus className="w-4 h-4 text-white/40 mx-auto mb-1" />
          <p className="text-lg font-bold text-white/60">{changes.length - improved.length - declined.length}</p>
          <p className="text-[10px] text-white/40">유지</p>
        </div>
        <div className="bg-rose-500/15 rounded-xl p-3 text-center">
          <TrendingDown className="w-4 h-4 text-rose-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-rose-400">{declined.length}</p>
          <p className="text-[10px] text-rose-300/70">주의</p>
        </div>
      </div>

      {/* Dimension bars */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-white/60 hover:text-white mb-2"
      >
        {expanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
        {expanded ? '접기' : '상세 비교 보기'}
      </Button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {changes.map((change, i) => (
              <motion.div
                key={change.key}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">{change.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-white/40">{change.previous}</span>
                    <span className="text-white/30">→</span>
                    <span className={`text-xs font-semibold ${
                      change.trend === 'up' ? 'text-emerald-400' :
                      change.trend === 'down' ? 'text-rose-400' : 'text-white/60'
                    }`}>
                      {change.current}
                    </span>
                    {change.trend !== 'stable' && (
                      <span className={`text-[10px] px-1 py-0.5 rounded ${
                        change.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {change.diff > 0 ? '+' : ''}{change.diff}
                      </span>
                    )}
                  </div>
                </div>
                {/* Comparison bars */}
                <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                  {/* Previous (behind) */}
                  <div
                    className="absolute inset-y-0 left-0 bg-white/10 rounded-full"
                    style={{ width: `${change.previous}%` }}
                  />
                  {/* Current (front) */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${change.current}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      change.trend === 'up' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
                      change.trend === 'down' ? 'bg-gradient-to-r from-rose-500 to-orange-500' :
                      'bg-gradient-to-r from-slate-400 to-slate-500'
                    }`}
                    style={{ opacity: 0.8 }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Previous records selector */}
            {previousRecords.length > 1 && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-white/40 mb-2">이전 기록 ({previousRecords.length}건)</p>
                <div className="flex flex-wrap gap-1.5">
                  {previousRecords.slice(0, 5).map((record, i) => (
                    <button
                      key={record.id}
                      onClick={() => setSelectedPrev(record)}
                      className={`text-[10px] px-2 py-1 rounded-full transition-all ${
                        comparisonTarget?.id === record.id
                          ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500/50'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {formatDate(record.created_at)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick insight */}
      {!expanded && (improved.length > 0 || declined.length > 0) && (
        <div className="text-xs text-white/60 space-y-1">
          {improved.length > 0 && (
            <p>📈 <span className="text-emerald-400">{improved.map(c => c.label).join(', ')}</span> 영역이 성장했어요!</p>
          )}
          {declined.length > 0 && (
            <p>💡 <span className="text-rose-400">{declined.map(c => c.label).join(', ')}</span> 영역에 관심이 필요해요</p>
          )}
        </div>
      )}
    </Card>
  );
}
