import React, { useEffect, useState } from 'react';
import { Grid3X3, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

interface TestScore {
  testName: string;
  score: number;
  maxScore: number;
  date: string;
}

interface CrossTestMatrixCardProps {
  currentTestName: string;
  currentScore: number;
  currentMaxScore: number;
  className?: string;
}

const correlationColor = (r: number): string => {
  if (r >= 0.7) return 'bg-red-500/80 text-white';
  if (r >= 0.4) return 'bg-orange-400/70 text-white';
  if (r >= 0.1) return 'bg-yellow-300/60 text-foreground';
  if (r >= -0.1) return 'bg-muted/40 text-muted-foreground';
  if (r >= -0.4) return 'bg-blue-300/60 text-foreground';
  return 'bg-blue-500/80 text-white';
};

const correlationLabel = (r: number, isEn: boolean): string => {
  const abs = Math.abs(r);
  if (abs >= 0.7) return isEn ? 'Strong' : '강한';
  if (abs >= 0.4) return isEn ? 'Moderate' : '보통';
  if (abs >= 0.1) return isEn ? 'Weak' : '약한';
  return isEn ? 'None' : '없음';
};

export const CrossTestMatrixCard: React.FC<CrossTestMatrixCardProps> = ({
  currentTestName, currentScore, currentMaxScore, className = ''
}) => {
  const { isEnglish } = useLanguage();
  const [otherTests, setOtherTests] = useState<TestScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data } = await supabase
          .from('assessment_enhanced_analysis')
          .select('assessment_type, score_interpretation, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          const latest = new Map<string, TestScore>();
          for (const row of data) {
            if (row.assessment_type === currentTestName) continue;
            if (latest.has(row.assessment_type)) continue;
            const interp = row.score_interpretation as Record<string, any> | null;
            const score = interp?.total_score ?? interp?.score ?? null;
            const maxScore = interp?.max_score ?? 100;
            if (score != null) {
              latest.set(row.assessment_type, {
                testName: row.assessment_type,
                score: Number(score),
                maxScore: Number(maxScore),
                date: new Date(row.created_at).toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', { month: 'short', day: 'numeric' }),
              });
            }
          }
          setOtherTests(Array.from(latest.values()).slice(0, 5));
        }
      } catch (e) {
        console.error('Failed to fetch cross-test data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [currentTestName, isEnglish]);

  // Simple correlation estimation based on normalized scores
  const calcPseudoCorrelation = (scoreA: number, maxA: number, scoreB: number, maxB: number): number => {
    const normA = scoreA / maxA;
    const normB = scoreB / maxB;
    // Pseudo-correlation: how similarly extreme both scores are
    const diff = Math.abs(normA - normB);
    const direction = (normA > 0.5 && normB > 0.5) || (normA <= 0.5 && normB <= 0.5) ? 1 : -1;
    return direction * Math.max(0, 1 - diff * 2) * 0.85;
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border border-border/40 bg-card p-4 ${className}`}>
        <div className="flex items-center justify-center py-6 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{isEnglish ? 'Loading...' : '불러오는 중...'}</span>
        </div>
      </div>
    );
  }

  if (otherTests.length === 0) {
    return (
      <div className={`rounded-2xl border border-border/40 bg-card p-4 ${className}`}>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <Grid3X3 className="w-4 h-4 text-primary" />
          {isEnglish ? 'Cross-Test Analysis' : '교차분석 매트릭스'}
        </h3>
        <p className="text-[11px] text-muted-foreground text-center py-4">
          {isEnglish
            ? 'Complete 2+ different assessments to see cross-test correlations.'
            : '2개 이상의 검사를 완료하면 교차분석 결과를 확인할 수 있습니다.'}
        </p>
      </div>
    );
  }

  const allTests: TestScore[] = [
    { testName: currentTestName, score: currentScore, maxScore: currentMaxScore, date: isEnglish ? 'Today' : '오늘' },
    ...otherTests,
  ];

  return (
    <div className={`rounded-2xl border border-border/40 bg-card p-4 ${className}`}>
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
        <Grid3X3 className="w-4 h-4 text-primary" />
        {isEnglish ? 'Cross-Test Correlation' : '다검사 교차분석'}
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">
        {isEnglish
          ? 'Estimated correlations between your assessment results'
          : '검사 결과 간 추정 상관관계입니다. 동시에 높거나 낮은 패턴을 파악할 수 있습니다.'}
      </p>

      {/* Matrix */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-[9px]">
          <thead>
            <tr>
              <th className="p-1.5 text-left font-medium text-muted-foreground w-20"></th>
              {allTests.map((t, i) => (
                <th key={i} className="p-1.5 text-center font-medium text-foreground/70 max-w-[60px]">
                  <div className="truncate">{t.testName.length > 6 ? t.testName.slice(0, 6) + '..' : t.testName}</div>
                  <div className="text-[8px] text-muted-foreground font-normal">{Math.round(t.score / t.maxScore * 100)}%</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTests.map((rowTest, ri) => (
              <tr key={ri}>
                <td className="p-1.5 font-medium text-foreground/80 truncate max-w-[80px]">
                  {rowTest.testName.length > 8 ? rowTest.testName.slice(0, 8) + '..' : rowTest.testName}
                </td>
                {allTests.map((colTest, ci) => {
                  if (ri === ci) {
                    return (
                      <td key={ci} className="p-1 text-center">
                        <div className="rounded bg-primary/20 text-primary font-bold py-1">1.00</div>
                      </td>
                    );
                  }
                  const r = calcPseudoCorrelation(rowTest.score, rowTest.maxScore, colTest.score, colTest.maxScore);
                  return (
                    <td key={ci} className="p-1 text-center">
                      <div className={`rounded py-1 font-medium ${correlationColor(r)}`}>
                        {r >= 0 ? '+' : ''}{r.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 pt-2 border-t border-border/30 flex flex-wrap gap-2 justify-center">
        {[
          { r: 0.8, label: isEnglish ? 'Strong +' : '강한 양의' },
          { r: 0.5, label: isEnglish ? 'Moderate +' : '보통 양의' },
          { r: 0, label: isEnglish ? 'None' : '상관없음' },
          { r: -0.5, label: isEnglish ? 'Moderate -' : '보통 음의' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${correlationColor(item.r)}`} />
            <span className="text-[8px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Insight */}
      {otherTests.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border/30">
          <p className="text-[10px] text-foreground/70 leading-relaxed">
            <span className="font-semibold">{isEnglish ? 'Insight: ' : '인사이트: '}</span>
            {(() => {
              const highest = otherTests.reduce((best, t) => {
                const r = Math.abs(calcPseudoCorrelation(currentScore, currentMaxScore, t.score, t.maxScore));
                return r > best.r ? { name: t.testName, r } : best;
              }, { name: '', r: 0 });
              
              return isEnglish
                ? `Your ${currentTestName} result shows the strongest association with ${highest.name} (${correlationLabel(highest.r, true)}). Consider addressing both areas together for more effective improvement.`
                : `${currentTestName} 결과가 ${highest.name}과(와) 가장 높은 연관성(${correlationLabel(highest.r, false)})을 보입니다. 두 영역을 함께 관리하면 더 효과적인 개선이 기대됩니다.`;
            })()}
          </p>
        </div>
      )}

      <p className="text-[8px] text-muted-foreground/50 mt-2 text-center">
        {isEnglish
          ? '※ Correlations are estimated from score patterns and may differ from clinical findings.'
          : '※ 점수 패턴 기반 추정치이며, 임상적 상관분석과 다를 수 있습니다.'}
      </p>
    </div>
  );
};

export default CrossTestMatrixCard;
