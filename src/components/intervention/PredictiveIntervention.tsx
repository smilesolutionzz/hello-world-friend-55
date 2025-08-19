import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  AlertTriangle, 
  Shield, 
  Clock, 
  TrendingDown, 
  Phone,
  MessageCircle,
  Calendar,
  Activity,
  Zap
} from "lucide-react";

interface InterventionAlert {
  id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  prediction: string;
  probability: number;
  time_to_crisis: string;
  triggers: string[];
  recommended_actions: InterventionAction[];
  auto_triggered: boolean;
  status: 'pending' | 'active' | 'resolved' | 'dismissed';
  created_at: string;
}

interface InterventionAction {
  type: 'ai_chat' | 'expert_call' | 'family_alert' | 'breathing_exercise' | 'emergency_contact';
  title: string;
  description: string;
  urgency: number;
  estimated_duration: string;
}

export default function PredictiveIntervention() {
  const [alerts, setAlerts] = useState<InterventionAlert[]>([]);
  const [activeInterventions, setActiveInterventions] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [riskScore, setRiskScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadInterventionAlerts();
    startRealTimeMonitoring();
  }, []);

  const loadInterventionAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 임시 데이터 (실제로는 AI 예측 시스템에서 생성)
      const mockAlerts: InterventionAlert[] = [
        {
          id: '1',
          risk_level: 'high',
          prediction: '다음 24시간 내 심각한 스트레스 증가 가능성이 높습니다',
          probability: 0.85,
          time_to_crisis: '18-24시간',
          triggers: ['업무 마감 압박', '수면 부족', '가족 갈등 신호'],
          recommended_actions: [
            {
              type: 'ai_chat',
              title: 'AI 상담사와 즉시 대화',
              description: '현재 상황을 AI와 상의하여 즉시 완화 방법을 찾아보세요',
              urgency: 9,
              estimated_duration: '15-20분'
            },
            {
              type: 'breathing_exercise',
              title: '4-7-8 호흡법 실시',
              description: '즉시 스트레스 완화를 위한 호흡 운동을 시작하세요',
              urgency: 8,
              estimated_duration: '5분'
            },
            {
              type: 'family_alert',
              title: '가족에게 상황 알림',
              description: '가족 구성원들에게 현재 상태를 알려 지원을 요청하세요',
              urgency: 7,
              estimated_duration: '즉시'
            }
          ],
          auto_triggered: false,
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          risk_level: 'medium',
          prediction: '감정 불안정성이 증가하고 있어 주의가 필요합니다',
          probability: 0.65,
          time_to_crisis: '2-3일',
          triggers: ['기분 변화 패턴', '사회적 고립 증가'],
          recommended_actions: [
            {
              type: 'expert_call',
              title: '전문가 상담 예약',
              description: '전문 상담사와의 세션을 예약하여 근본적인 해결책을 찾아보세요',
              urgency: 6,
              estimated_duration: '50분'
            },
            {
              type: 'ai_chat',
              title: '일일 감정 체크인',
              description: '매일 AI와 감정 상태를 점검하여 패턴을 파악하세요',
              urgency: 5,
              estimated_duration: '10분'
            }
          ],
          auto_triggered: true,
          status: 'active',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setAlerts(mockAlerts);
      
      // 위험 점수 계산
      const maxRisk = Math.max(...mockAlerts.map(alert => alert.probability * 100));
      setRiskScore(maxRisk);

    } catch (error) {
      console.error('Error loading intervention alerts:', error);
    }
  };

  const startRealTimeMonitoring = () => {
    setIsMonitoring(true);
    
    // 실시간 모니터링 시뮬레이션
    const interval = setInterval(() => {
      // 5% 확률로 새로운 알림 생성
      if (Math.random() < 0.05) {
        generateNewAlert();
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(interval);
  };

  const generateNewAlert = () => {
    const newAlert: InterventionAlert = {
      id: Date.now().toString(),
      risk_level: 'medium',
      prediction: '스트레스 수준이 임계치에 접근하고 있습니다',
      probability: 0.7,
      time_to_crisis: '12시간',
      triggers: ['심박수 변화 감지', '활동 패턴 변화'],
      recommended_actions: [
        {
          type: 'breathing_exercise',
          title: '즉시 호흡 운동',
          description: '지금 바로 깊은 호흡으로 스트레스를 완화하세요',
          urgency: 7,
          estimated_duration: '3분'
        }
      ],
      auto_triggered: true,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev]);
    
    toast({
      title: "새로운 개입 알림",
      description: newAlert.prediction,
      variant: "destructive"
    });
  };

  const executeAction = async (alertId: string, action: InterventionAction) => {
    setActiveInterventions(prev => [...prev, `${alertId}-${action.type}`]);
    
    try {
      switch (action.type) {
        case 'ai_chat':
          // AI 채팅 화면으로 이동
          window.location.href = '/ai-counselor';
          break;
        case 'breathing_exercise':
          // 호흡 운동 시작
          startBreathingExercise();
          break;
        case 'expert_call':
          // 전문가 연결
          toast({
            title: "전문가 연결",
            description: "전문가와 연결을 시도합니다...",
          });
          break;
        case 'family_alert':
          // 가족 알림
          sendFamilyAlert(alertId);
          break;
        default:
          break;
      }
      
      // 액션 실행 후 알림 상태 업데이트
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'active' as const }
          : alert
      ));

    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setTimeout(() => {
        setActiveInterventions(prev => 
          prev.filter(id => id !== `${alertId}-${action.type}`)
        );
      }, 3000);
    }
  };

  const startBreathingExercise = () => {
    toast({
      title: "호흡 운동 시작",
      description: "4초 들이마시고, 7초 참고, 8초 내쉬세요",
    });
  };

  const sendFamilyAlert = async (alertId: string) => {
    toast({
      title: "가족 알림 전송",
      description: "가족 구성원들에게 알림을 전송했습니다",
    });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'dismissed' as const }
        : alert
    ));
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge className="bg-red-600 text-white">긴급</Badge>;
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">보통</Badge>;
      case 'low':
        return <Badge className="bg-success text-success-foreground">낮음</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ai_chat':
        return <MessageCircle className="h-4 w-4" />;
      case 'expert_call':
        return <Phone className="h-4 w-4" />;
      case 'breathing_exercise':
        return <Activity className="h-4 w-4" />;
      case 'family_alert':
        return <Shield className="h-4 w-4" />;
      case 'emergency_contact':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const pendingAlerts = alerts.filter(alert => alert.status === 'pending' || alert.status === 'active');

  return (
    <div className="space-y-6">
      {/* 모니터링 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            예측적 개입 시스템
            {isMonitoring && <div className="w-2 h-2 bg-success rounded-full animate-pulse" />}
          </CardTitle>
          <CardDescription>
            AI가 실시간으로 위험 신호를 감지하고 즉시 개입을 제안합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pendingAlerts.length}</div>
              <div className="text-sm text-muted-foreground">활성 알림</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${riskScore > 70 ? 'text-destructive' : riskScore > 40 ? 'text-warning' : 'text-success'}`}>
                {riskScore.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">위험 점수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {isMonitoring ? '활성' : '비활성'}
              </div>
              <div className="text-sm text-muted-foreground">모니터링 상태</div>
            </div>
          </div>
          
          <Progress value={riskScore} className="mt-4" />
        </CardContent>
      </Card>

      {/* 활성 알림 */}
      {pendingAlerts.length > 0 && (
        <div className="space-y-4">
          {pendingAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-destructive">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-destructive" />
                    예측적 개입 알림
                    {alert.auto_triggered && <Badge variant="outline">자동감지</Badge>}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getRiskBadge(alert.risk_level)}
                    <Badge variant="outline">{(alert.probability * 100).toFixed(0)}% 확률</Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  예상 발생 시기: {alert.time_to_crisis}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <TrendingDown className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    {alert.prediction}
                  </AlertDescription>
                </Alert>

                {/* 트리거 요인 */}
                <div>
                  <h4 className="font-semibold mb-2">감지된 위험 신호:</h4>
                  <div className="flex flex-wrap gap-2">
                    {alert.triggers.map((trigger, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 추천 액션 */}
                <div>
                  <h4 className="font-semibold mb-3">추천 개입 방법:</h4>
                  <div className="space-y-3">
                    {alert.recommended_actions
                      .sort((a, b) => b.urgency - a.urgency)
                      .map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          {getActionIcon(action.type)}
                          <div>
                            <div className="font-medium">{action.title}</div>
                            <div className="text-sm text-muted-foreground">{action.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              소요시간: {action.estimated_duration} | 긴급도: {action.urgency}/10
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => executeAction(alert.id, action)}
                          disabled={activeInterventions.includes(`${alert.id}-${action.type}`)}
                          size="sm"
                          variant={action.urgency > 7 ? "destructive" : action.urgency > 5 ? "default" : "outline"}
                        >
                          {activeInterventions.includes(`${alert.id}-${action.type}`) ? "실행중..." : "실행"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                  <Button
                    onClick={() => dismissAlert(alert.id)}
                    variant="ghost"
                    size="sm"
                  >
                    알림 해제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pendingAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">모든 것이 정상입니다</h3>
            <p className="text-muted-foreground">
              현재 위험 신호가 감지되지 않았습니다. AI가 계속 모니터링하고 있습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}