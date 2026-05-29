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
      <Card className="p-5 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700">
          <History className="w-5 h-5 text-slate-500" />
          <p className="text-base font-medium">첫 번째 기록이에요! 다음에 다시 하면 변화를 추적할 수 있어요 📈</p>
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
    <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">변화 추적</h3>
        </div>
        <span className="text-sm font-medium text-slate-500">
          {daysDiff === 0 ? '오늘' : `${daysDiff}일 전`} 대비
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-emerald-700">{improved.length}</p>
          <p className="text-sm font-medium text-emerald-700/80 mt-0.5">성장</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <Minus className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-slate-700">{changes.length - improved.length - declined.length}</p>
          <p className="text-sm font-medium text-slate-600 mt-0.5">유지</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
          <TrendingDown className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-rose-700">{declined.length}</p>
          <p className="text-sm font-medium text-rose-700/80 mt-0.5">주의</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 mb-2 text-base font-semibold"
      >
        {expanded ? <ChevronUp className="w-5 h-5 mr-1" /> : <ChevronDown className="w-5 h-5 mr-1" />}
        {expanded ? '접기' : '상세 비교 보기'}
      </Button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden pt-2"
          >
            {changes.map((change, i) => (
              <motion.div
                key={change.key}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-800">{change.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{change.previous}</span>
                    <span className="text-slate-400">→</span>
                    <span className={`text-base font-bold ${
                      change.trend === 'up' ? 'text-emerald-700' :
                      change.trend === 'down' ? 'text-rose-700' : 'text-slate-700'
                    }`}>
                      {change.current}
                    </span>
                    {change.trend !== 'stable' && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        change.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {change.diff > 0 ? '+' : ''}{change.diff}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-slate-300 rounded-full"
                    style={{ width: `${change.previous}%` }}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${change.current}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      change.trend === 'up' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
                      change.trend === 'down' ? 'bg-gradient-to-r from-rose-500 to-orange-500' :
                      'bg-gradient-to-r from-slate-400 to-slate-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}

            {previousRecords.length > 1 && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">이전 기록 ({previousRecords.length}건)</p>
                <div className="flex flex-wrap gap-2">
                  {previousRecords.slice(0, 5).map((record) => (
                    <button
                      key={record.id}
                      onClick={() => setSelectedPrev(record)}
                      className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
                        comparisonTarget?.id === record.id
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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

      {!expanded && (improved.length > 0 || declined.length > 0) && (
        <div className="text-base text-slate-700 space-y-1.5 mt-2">
          {improved.length > 0 && (
            <p>📈 <span className="font-bold text-emerald-700">{improved.map(c => c.label).join(', ')}</span> 영역이 성장했어요!</p>
          )}
          {declined.length > 0 && (
            <p>💡 <span className="font-bold text-rose-700">{declined.map(c => c.label).join(', ')}</span> 영역에 관심이 필요해요</p>
          )}
        </div>
      )}
    </Card>
  );
}
