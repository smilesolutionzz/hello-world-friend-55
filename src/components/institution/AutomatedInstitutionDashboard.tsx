import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  MessageSquare,
  Shield,
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';

interface AutomationSettings {
  auto_schedule_approval: boolean;
  auto_payment_processing: boolean;
  auto_reminder_sending: boolean;
  auto_report_generation: boolean;
  ai_screening_enabled: boolean;
  smart_scheduling: boolean;
}

interface Metrics {
  totalConsultations: number;
  pendingApprovals: number;
  automatedTasks: number;
  efficiencyScore: number;
  monthlySavings: number;
  clientSatisfaction: number;
  errorRate: number;
}

interface AutomatedInstitutionDashboardProps {
  institutionId: string;
}

export function AutomatedInstitutionDashboard({ institutionId }: AutomatedInstitutionDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AutomationSettings>({
    auto_schedule_approval: false,
    auto_payment_processing: false,
    auto_reminder_sending: false,
    auto_report_generation: false,
    ai_screening_enabled: false,
    smart_scheduling: false,
  });
  
  const [metrics, setMetrics] = useState<Metrics>({
    totalConsultations: 0,
    pendingApprovals: 0,
    automatedTasks: 0,
    efficiencyScore: 0,
    monthlySavings: 0,
    clientSatisfaction: 0,
    errorRate: 0,
  });

  const { toast } = useToast();

  const updateSettings = async (key: keyof AutomationSettings, value: boolean) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "설정이 업데이트되었습니다",
        description: `${key}가 ${value ? '활성화' : '비활성화'}되었습니다.`,
      });
    } catch (error) {
      console.error('Settings update error:', error);
      toast({
        title: "설정 업데이트 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const mockMetrics = {
    totalConsultations: 245,
    pendingApprovals: 8,
    automatedTasks: 156,
    efficiencyScore: 87,
    monthlySavings: 1250000,
    clientSatisfaction: 92,
    errorRate: 2.1,
  };

  useEffect(() => {
    setMetrics(mockMetrics);
  }, [institutionId]);

  const automationFeatures = [
    {
      key: 'auto_schedule_approval' as keyof AutomationSettings,
      title: '자동 일정 승인',
      description: '기본 조건을 만족하는 예약을 자동으로 승인합니다',
      icon: Calendar,
      risk: 'low',
      savings: '주 3시간 절약'
    },
    {
      key: 'auto_payment_processing' as keyof AutomationSettings,
      title: '자동 결제 처리',
      description: '정기 결제와 바우처 사용을 자동으로 처리합니다',
      icon: CheckCircle,
      risk: 'medium',
      savings: '주 5시간 절약'
    },
    {
      key: 'auto_reminder_sending' as keyof AutomationSettings,
      title: '자동 리마인더',
      description: '예약 전 알림과 후속 조치를 자동으로 발송합니다',
      icon: MessageSquare,
      risk: 'low',
      savings: '주 2시간 절약'
    },
    {
      key: 'auto_report_generation' as keyof AutomationSettings,
      title: '자동 보고서 생성',
      description: '월간/주간 성과 보고서를 자동으로 생성합니다',
      icon: BarChart3,
      risk: 'low',
      savings: '주 4시간 절약'
    },
    {
      key: 'ai_screening_enabled' as keyof AutomationSettings,
      title: 'AI 사전 스크리닝',
      description: '신규 클라이언트를 AI로 사전 평가합니다',
      icon: Bot,
      risk: 'medium',
      savings: '상담 효율 30% 향상'
    },
    {
      key: 'smart_scheduling' as keyof AutomationSettings,
      title: '스마트 스케줄링',
      description: 'AI가 최적의 일정을 추천하고 자동 배치합니다',
      icon: Zap,
      risk: 'medium',
      savings: '스케줄 효율 40% 향상'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return '낮은 위험';
      case 'medium': return '중간 위험';
      case 'high': return '높은 위험';
      default: return '미확인';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">자동화 운영 센터</h2>
          <p className="text-muted-foreground">AI와 자동화로 기관 운영을 최적화하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <Badge variant="outline" className="bg-primary/10 text-primary">
            자동화 활성
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">운영 현황</TabsTrigger>
          <TabsTrigger value="automation">자동화 설정</TabsTrigger>
          <TabsTrigger value="analytics">성과 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">이번 달 상담</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.totalConsultations}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">대기 중인 승인</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.pendingApprovals}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">자동화된 작업</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.automatedTasks}</p>
                  </div>
                  <Bot className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">효율성 점수</p>
                    <p className="text-2xl font-bold text-foreground">{metrics.efficiencyScore}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>자동화 성과</CardTitle>
                <CardDescription>이번 달 자동화로 절약된 시간과 비용</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">시간 절약</span>
                  <span className="font-semibold">주 14시간</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">비용 절약</span>
                  <span className="font-semibold">₩{metrics.monthlySavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">오류율</span>
                  <span className="font-semibold text-green-600">{metrics.errorRate}%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">고객 만족도</span>
                    <span className="font-semibold">{metrics.clientSatisfaction}%</span>
                  </div>
                  <Progress value={metrics.clientSatisfaction} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>시스템 상태</CardTitle>
                <CardDescription>자동화 시스템의 현재 상태</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">AI 엔진</span>
                  </div>
                  <Badge className="bg-green-50 text-green-700">정상</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">자동 스케줄러</span>
                  </div>
                  <Badge className="bg-green-50 text-green-700">정상</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">알림 시스템</span>
                  </div>
                  <Badge className="bg-yellow-50 text-yellow-700">점검 중</Badge>
                </div>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    모든 자동화 작업은 보안 프로토콜에 따라 암호화되어 처리됩니다.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automationFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.key} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={settings[feature.key]}
                        onCheckedChange={(checked) => updateSettings(feature.key, checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(feature.risk)}>
                          {getRiskText(feature.risk)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {feature.savings}
                        </span>
                      </div>
                      {settings[feature.key] && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          활성화됨
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>자동화 추천</CardTitle>
              <CardDescription>
                현재 운영 패턴을 분석하여 추천드리는 자동화 설정입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>자동 일정 승인</strong>을 활성화하시면 주당 약 3시간의 업무를 절약할 수 있습니다.
                  현재 승인 대기 중인 예약이 8건 있습니다.
                </AlertDescription>
              </Alert>
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI 사전 스크리닝</strong>을 도입하시면 상담 효율성이 30% 향상될 것으로 예상됩니다.
                  비슷한 규모의 기관에서 평균 만족도가 15% 증가했습니다.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>월간 성과 트렌드</CardTitle>
                <CardDescription>최근 6개월간의 자동화 성과</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 flex items-center justify-center border rounded-lg">
                    <p className="text-muted-foreground">성과 차트 영역</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    * 자동화 도입 후 평균 효율성이 47% 향상되었습니다.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>비용 절감 분석</CardTitle>
                <CardDescription>자동화로 인한 운영비 절감 효과</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">인건비 절약</span>
                    <span className="font-semibold">₩890,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">오류 감소 효과</span>
                    <span className="font-semibold">₩230,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">시간 효율성</span>
                    <span className="font-semibold">₩180,000</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-semibold">
                    <span>총 절감액</span>
                    <span className="text-lg text-green-600">₩{metrics.monthlySavings.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>자동화 ROI 분석</CardTitle>
              <CardDescription>투자 대비 수익률과 회수 기간</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-2xl font-bold text-primary">284%</div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">2.3개월</div>
                  <div className="text-sm text-muted-foreground">투자 회수 기간</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">₩3,750,000</div>
                  <div className="text-sm text-muted-foreground">연간 예상 절감액</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}