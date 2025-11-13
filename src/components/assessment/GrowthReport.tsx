import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface GrowthReportProps {
  childAge: number;
  ageGroup: string;
}

const GrowthReport = ({ childAge, ageGroup }: GrowthReportProps) => {
  const [reportData, setReportData] = useState<any>(null);
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [reportPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 기간 계산
      const now = new Date();
      const startDate = new Date();
      if (reportPeriod === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setMonth(now.getMonth() - 3);
      }

      // 해당 기간의 평가 결과 가져오기
      const { data, error } = await supabase
        .from('play_assessment_results')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // 데이터 분석
        const firstAssessment = data[0];
        const lastAssessment = data[data.length - 1];

        const cognitiveChange = lastAssessment.cognitive_score - firstAssessment.cognitive_score;
        const emotionalChange = lastAssessment.emotional_score - firstAssessment.emotional_score;
        const socialChange = lastAssessment.social_score - firstAssessment.social_score;
        const physicalChange = lastAssessment.physical_score - firstAssessment.physical_score;

        const totalChange = cognitiveChange + emotionalChange + socialChange + physicalChange;
        const avgChange = totalChange / 4;

        // 차트 데이터 준비
        const chartData = data.map((item, index) => ({
          name: `${index + 1}회`,
          date: new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
          인지: item.cognitive_score,
          정서: item.emotional_score,
          사회성: item.social_score,
          신체: item.physical_score,
        }));

        setReportData({
          assessmentCount: data.length,
          firstDate: new Date(firstAssessment.created_at),
          lastDate: new Date(lastAssessment.created_at),
          changes: {
            cognitive: cognitiveChange,
            emotional: emotionalChange,
            social: socialChange,
            physical: physicalChange,
          },
          averageChange: avgChange,
          chartData,
          currentScores: {
            cognitive: lastAssessment.cognitive_score,
            emotional: lastAssessment.emotional_score,
            social: lastAssessment.social_score,
            physical: lastAssessment.physical_score,
          },
        });
      }
    } catch (error) {
      console.error('리포트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (change < -5) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return 'text-green-600';
    if (change < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendBadge = (change: number) => {
    if (change > 5) return <Badge className="bg-green-100 text-green-700">향상</Badge>;
    if (change < -5) return <Badge className="bg-red-100 text-red-700">주의</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">유지</Badge>;
  };

  if (loading) {
    return (
      <Card className="shadow-lg mb-6">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">리포트를 생성하고 있습니다...</p>
        </CardContent>
      </Card>
    );
  }

  if (!reportData || reportData.assessmentCount < 2) {
    return (
      <Card className="shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-500" />
            성장 리포트
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">
              성장 리포트를 생성하려면 최소 2회 이상의 평가가 필요합니다.
              <br />
              정기적으로 평가를 진행해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const periodLabel = reportPeriod === 'monthly' ? '월간' : '분기별';

  return (
    <Card className="shadow-lg mb-6">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-500" />
            {periodLabel} 성장 리포트
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={reportPeriod === 'monthly' ? 'default' : 'outline'}
              onClick={() => setReportPeriod('monthly')}
            >
              월간
            </Button>
            <Button
              size="sm"
              variant={reportPeriod === 'quarterly' ? 'default' : 'outline'}
              onClick={() => setReportPeriod('quarterly')}
            >
              분기
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* 요약 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reportData.assessmentCount}회</div>
            <div className="text-sm text-muted-foreground">평가 횟수</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {reportData.averageChange > 0 ? '+' : ''}{reportData.averageChange.toFixed(1)}점
            </div>
            <div className="text-sm text-muted-foreground">평균 변화</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">시작일</div>
            <div className="font-semibold">{reportData.firstDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">최근일</div>
            <div className="font-semibold">{reportData.lastDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</div>
          </div>
        </div>

        {/* 발달 영역별 변화 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4">발달 영역별 변화</h3>
          <div className="space-y-3">
            {[
              { key: 'cognitive', label: '인지 발달', score: reportData.currentScores.cognitive, change: reportData.changes.cognitive },
              { key: 'emotional', label: '정서 발달', score: reportData.currentScores.emotional, change: reportData.changes.emotional },
              { key: 'social', label: '사회성 발달', score: reportData.currentScores.social, change: reportData.changes.social },
              { key: 'physical', label: '신체 발달', score: reportData.currentScores.physical, change: reportData.changes.physical },
            ].map((domain) => (
              <div key={domain.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTrendIcon(domain.change)}
                  <div>
                    <div className="font-semibold">{domain.label}</div>
                    <div className="text-sm text-muted-foreground">현재 {domain.score}점</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${getTrendColor(domain.change)}`}>
                    {domain.change > 0 ? '+' : ''}{domain.change}점
                  </span>
                  {getTrendBadge(domain.change)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 변화 추이 차트 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4">전체 변화 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="인지" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="정서" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="사회성" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              <Area type="monotone" dataKey="신체" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI 인사이트 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="text-lg font-bold mb-2">📊 AI 분석 인사이트</h3>
          <div className="space-y-2 text-sm">
            {reportData.averageChange > 10 && (
              <p className="text-green-700">
                ✅ 전반적으로 뛰어난 발달 향상을 보이고 있습니다. 현재의 놀이 방식을 유지하세요!
              </p>
            )}
            {reportData.averageChange > 0 && reportData.averageChange <= 10 && (
              <p className="text-blue-700">
                👍 꾸준한 발달이 관찰됩니다. 지속적인 관심과 놀이 활동을 이어가세요.
              </p>
            )}
            {reportData.averageChange < 0 && (
              <p className="text-orange-700">
                💡 일부 영역에서 변화가 필요할 수 있습니다. 맞춤형 놀이 추천을 참고해주세요.
              </p>
            )}
            <p className="text-gray-700">
              • 가장 큰 향상: <strong>
                {(() => {
                  const sorted = Object.entries(reportData.changes).sort((a, b) => (b[1] as number) - (a[1] as number));
                  const topDomain = sorted[0][0];
                  const topChange = sorted[0][1] as number;
                  const domainName = topDomain === 'cognitive' ? '인지' : topDomain === 'emotional' ? '정서' : topDomain === 'social' ? '사회성' : '신체';
                  return `${domainName} 영역 (${topChange > 0 ? '+' : ''}${topChange}점)`;
                })()}
              </strong>
            </p>
            <p className="text-gray-700">
              • 다음 평가 권장일: <strong>{new Date(reportData.lastDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthReport;
