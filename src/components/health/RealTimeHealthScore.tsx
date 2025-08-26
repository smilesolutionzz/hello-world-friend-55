import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, 
  Heart, 
  Brain, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";

interface HealthMetrics {
  mental_health: number;
  emotional_stability: number;
  stress_level: number;
  social_connection: number;
  overall_score: number;
  last_updated: string;
  trend: 'up' | 'down' | 'stable';
  risk_factors: string[];
  protective_factors: string[];
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'critical' | 'improvement';
  message: string;
  recommendations: string[];
  timestamp: string;
  acknowledged: boolean;
}

export default function RealTimeHealthScore() {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(updateHealthScore, 300000); // 5분마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const loadHealthData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 임시 데이터 (실제로는 AI 분석 결과)
      const mockMetrics: HealthMetrics = {
        mental_health: 72,
        emotional_stability: 68,
        stress_level: 75, // 높을수록 스트레스가 많음
        social_connection: 85,
        overall_score: 73,
        last_updated: new Date().toISOString(),
        trend: 'stable',
        risk_factors: ['높은 업무 스트레스', '수면 부족', '운동 부족'],
        protective_factors: ['강한 가족 유대', '정기적 상담', '건강한 사회적 관계']
      };

      const mockAlerts: HealthAlert[] = [
        {
          id: '1',
          type: 'warning',
          message: '스트레스 수준이 지난 3일간 지속적으로 상승하고 있습니다',
          recommendations: [
            '깊은 호흡 운동을 하루 10분씩 시도해보세요',
            '업무 시간을 조정하거나 휴식을 늘려보세요',
            'AI 상담사와 스트레스 관리 방법을 상의해보세요'
          ],
          timestamp: new Date().toISOString(),
          acknowledged: false
        },
        {
          id: '2',
          type: 'improvement',
          message: '사회적 연결성이 이번 주에 현저히 개선되었습니다',
          recommendations: [
            '현재의 긍정적인 사회활동을 계속 유지하세요',
            '가족과의 시간을 더 늘려보세요'
          ],
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          acknowledged: false
        }
      ];

      setHealthMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setLastSync(new Date());

    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  const updateHealthScore = async () => {
    setIsUpdating(true);
    
    try {
      // 실제로는 AI 분석 edge function 호출
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 점수 업데이트 시뮬레이션
      if (healthMetrics) {
        const variation = (Math.random() - 0.5) * 6; // -3 ~ +3 변동
        const newOverallScore = Math.max(0, Math.min(100, healthMetrics.overall_score + variation));
        
        setHealthMetrics(prev => prev ? {
          ...prev,
          overall_score: newOverallScore,
          mental_health: Math.max(0, Math.min(100, prev.mental_health + variation)),
          last_updated: new Date().toISOString(),
          trend: newOverallScore > prev.overall_score ? 'up' : 
                 newOverallScore < prev.overall_score ? 'down' : 'stable'
        } : null);
        
        setLastSync(new Date());
      }

      toast({
        title: "건강 점수 업데이트 완료",
        description: "최신 데이터를 반영했습니다.",
      });

    } catch (error) {
      console.error('Error updating health score:', error);
      toast({
        title: "업데이트 실패",
        description: "건강 점수 업데이트에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'improvement':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Activity className="h-5 w-5 text-primary" />;
    }
  };

  if (!healthMetrics) {
    return <div>건강 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 전체 건강 점수 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              실시간 통합건강 점수
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lastSync?.toLocaleTimeString()}
            </div>
          </CardTitle>
          <CardDescription>
            AI가 실시간으로 분석한 종합 통합건강 상태입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className={`relative w-32 h-32 rounded-full ${getScoreBackground(healthMetrics.overall_score)} flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(healthMetrics.overall_score)}`}>
                  {healthMetrics.overall_score.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">/ 100</div>
              </div>
              <div className="absolute top-2 right-2">
                {getTrendIcon(healthMetrics.trend)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-sm text-muted-foreground">통합건강</div>
              <div className={`font-bold ${getScoreColor(healthMetrics.mental_health)}`}>
                {healthMetrics.mental_health}/100
              </div>
            </div>
            
            <div className="text-center">
              <Brain className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-muted-foreground">감정안정</div>
              <div className={`font-bold ${getScoreColor(healthMetrics.emotional_stability)}`}>
                {healthMetrics.emotional_stability}/100
              </div>
            </div>
            
            <div className="text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-sm text-muted-foreground">스트레스</div>
              <div className={`font-bold ${getScoreColor(100 - healthMetrics.stress_level)}`}>
                {healthMetrics.stress_level}/100
              </div>
            </div>
            
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-sm text-muted-foreground">사회연결</div>
              <div className={`font-bold ${getScoreColor(healthMetrics.social_connection)}`}>
                {healthMetrics.social_connection}/100
              </div>
            </div>
          </div>

          <Button 
            onClick={updateHealthScore} 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? "업데이트 중..." : "지금 업데이트"}
          </Button>
        </CardContent>
      </Card>

      {/* 위험 요소 및 보호 요소 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              위험 요소
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthMetrics.risk_factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-destructive/10 rounded">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              보호 요소
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthMetrics.protective_factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-success/10 rounded">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 알림 및 추천사항 */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              건강 알림
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.filter(alert => !alert.acknowledged).map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="font-medium mb-2">{alert.message}</div>
                      <div className="space-y-1">
                        {alert.recommendations.map((rec, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          확인
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}