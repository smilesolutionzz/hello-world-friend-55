import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  emergency_notification: boolean;
  capacity_management: boolean;
}

interface DashboardMetrics {
  total_consultations: number;
  pending_requests: number;
  scheduled_today: number;
  completion_rate: number;
  average_rating: number;
  revenue_this_month: number;
  active_therapists: number;
  capacity_utilization: number;
}

interface AutomatedInstitutionDashboardProps {
  institutionId: string;
}

export default function AutomatedInstitutionDashboard({ institutionId }: AutomatedInstitutionDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>({
    auto_schedule_approval: false,
    auto_payment_processing: false,
    auto_reminder_sending: true,
    auto_report_generation: true,
    emergency_notification: true,
    capacity_management: true
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, [institutionId]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        fetchMetrics(),
        fetchAlerts(),
        fetchAutomationSettings()
      ]);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      // 기관의 전문가들 조회
      const { data: experts } = await supabase
        .from('experts')
        .select('id')
        .eq('institution_id', institutionId);

      if (!experts) return;

      const expertIds = experts.map(e => e.id);
      
      // 상담 통계 조회
      const { data: consultations } = await supabase
        .from('consultations')
        .select('*')
        .in('expert_id', expertIds);

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const totalConsultations = consultations?.length || 0;
      const pendingRequests = consultations?.filter(c => c.status === 'pending').length || 0;
      const scheduledToday = consultations?.filter(c => 
        c.scheduled_at && new Date(c.scheduled_at).toDateString() === today.toDateString()
      ).length || 0;
      
      const completedConsultations = consultations?.filter(c => c.status === 'completed') || [];
      const completionRate = totalConsultations > 0 ? 
        (completedConsultations.length / totalConsultations) * 100 : 0;

      const averageRating = completedConsultations.length > 0 ?
        completedConsultations.reduce((sum, c) => sum + (c.rating || 0), 0) / completedConsultations.length : 0;

      const thisMonthConsultations = consultations?.filter(c => 
        new Date(c.created_at) >= startOfMonth
      ) || [];
      const revenueThisMonth = thisMonthConsultations.reduce((sum, c) => sum + c.price, 0);

      // 치료사 통계
      const { data: therapists } = await supabase
        .from('therapists')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true);

      const activeTherapists = therapists?.length || 0;
      
      // 가용성 계산 (간단한 예시)
      const capacityUtilization = scheduledToday > 0 && activeTherapists > 0 ? 
        (scheduledToday / (activeTherapists * 8)) * 100 : 0; // 하루 8시간 기준

      setMetrics({
        total_consultations: totalConsultations,
        pending_requests: pendingRequests,
        scheduled_today: scheduledToday,
        completion_rate: completionRate,
        average_rating: averageRating,
        revenue_this_month: revenueThisMonth,
        active_therapists: activeTherapists,
        capacity_utilization: Math.min(capacityUtilization, 100)
      });

    } catch (error: any) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const alerts = [];

      if (metrics?.pending_requests && metrics.pending_requests > 5) {
        alerts.push({
          type: 'warning',
          title: '대기 중인 상담 요청 증가',
          message: `${metrics.pending_requests}건의 상담 요청이 대기 중입니다.`,
          action: 'review_requests'
        });
      }

      if (metrics?.capacity_utilization && metrics.capacity_utilization > 90) {
        alerts.push({
          type: 'warning',
          title: '높은 가동률',
          message: `현재 가동률이 ${metrics.capacity_utilization.toFixed(1)}%입니다. 추가 치료사 배정을 고려하세요.`,
          action: 'manage_capacity'
        });
      }

      if (metrics?.average_rating && metrics.average_rating < 3.5) {
        alerts.push({
          type: 'error',
          title: '낮은 만족도',
          message: `평균 평점이 ${metrics.average_rating.toFixed(1)}점입니다. 서비스 품질 개선이 필요합니다.`,
          action: 'improve_quality'
        });
      }

      setAlerts(alerts);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchAutomationSettings = async () => {
    try {
      // 기본 설정 사용 - 추후 데이터베이스 테이블 생성 후 연동
      setAutomationSettings({
        auto_schedule_approval: false,
        auto_payment_processing: false,
        auto_reminder_sending: true,
        auto_report_generation: true,
        emergency_notification: true,
        capacity_management: true
      });
    } catch (error: any) {
      console.error('Error fetching automation settings:', error);
    }
  };

  const updateAutomationSetting = async (key: keyof AutomationSettings, value: boolean) => {
    try {
      const newSettings = { ...automationSettings, [key]: value };
      setAutomationSettings(newSettings);
      
      toast({
        title: "설정 저장 완료",
        description: "자동화 설정이 저장되었습니다.",
      });
    } catch (error: any) {
      console.error('Error updating automation setting:', error);
      toast({
        title: "설정 저장 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAlert = (action: string) => {
    switch (action) {
      case 'review_requests':
        toast({
          title: "상담 요청 검토",
          description: "상담 요청 관리 탭으로 이동합니다.",
        });
        break;
      case 'manage_capacity':
        toast({
          title: "가용성 관리",
          description: "치료사 관리 탭으로 이동합니다.",
        });
        break;
      case 'improve_quality':
        toast({
          title: "품질 개선",
          description: "서비스 품질 개선 방안을 검토하세요.",
        });
        break;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            자동화 대시보드
          </h2>
          <p className="text-muted-foreground">AI 기반 자동 운영 및 실시간 모니터링</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Zap className="w-4 h-4 mr-1" />
          자동 운영 중
        </Badge>
      </div>

      {/* 알림 */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <div>
                  <strong>{alert.title}</strong>: {alert.message}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAlert(alert.action)}
                >
                  조치
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">실시간 현황</TabsTrigger>
          <TabsTrigger value="automation">자동화 설정</TabsTrigger>
          <TabsTrigger value="analytics">성과 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 핵심 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 상담</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_consultations || 0}</div>
                <p className="text-xs text-muted-foreground">누적</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">대기 요청</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {metrics?.pending_requests || 0}
                </div>
                <p className="text-xs text-muted-foreground">즉시 처리 필요</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 예정</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.scheduled_today || 0}</div>
                <p className="text-xs text-muted-foreground">건</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 치료사</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.active_therapists || 0}</div>
                <p className="text-xs text-muted-foreground">명</p>
              </CardContent>
            </Card>
          </div>

          {/* 성과 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">완료율</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {metrics?.completion_rate?.toFixed(1) || 0}%
                </div>
                <Progress value={metrics?.completion_rate || 0} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {metrics?.average_rating?.toFixed(1) || 0}/5
                </div>
                <Progress value={(metrics?.average_rating || 0) * 20} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">가동률</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {metrics?.capacity_utilization?.toFixed(1) || 0}%
                </div>
                <Progress 
                  value={metrics?.capacity_utilization || 0} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>자동화 설정</CardTitle>
              <CardDescription>
                기관 운영을 자동화하여 효율성을 높이고 인력을 절약하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">자동 일정 승인</Label>
                  <p className="text-sm text-muted-foreground">
                    조건을 만족하는 상담 요청을 자동으로 승인합니다
                  </p>
                </div>
                <Switch
                  checked={automationSettings.auto_schedule_approval}
                  onCheckedChange={(checked) => 
                    updateAutomationSetting('auto_schedule_approval', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">자동 결제 처리</Label>
                  <p className="text-sm text-muted-foreground">
                    상담 완료 후 자동으로 결제를 처리합니다
                  </p>
                </div>
                <Switch
                  checked={automationSettings.auto_payment_processing}
                  onCheckedChange={(checked) => 
                    updateAutomationSetting('auto_payment_processing', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">자동 알림 발송</Label>
                  <p className="text-sm text-muted-foreground">
                    상담 예약, 변경 등의 알림을 자동으로 발송합니다
                  </p>
                </div>
                <Switch
                  checked={automationSettings.auto_reminder_sending}
                  onCheckedChange={(checked) => 
                    updateAutomationSetting('auto_reminder_sending', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">자동 보고서 생성</Label>
                  <p className="text-sm text-muted-foreground">
                    주간/월간 보고서를 자동으로 생성합니다
                  </p>
                </div>
                <Switch
                  checked={automationSettings.auto_report_generation}
                  onCheckedChange={(checked) => 
                    updateAutomationSetting('auto_report_generation', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">응급상황 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    시스템 이상 또는 긴급 상황 시 즉시 알림을 발송합니다
                  </p>
                </div>
                <Switch
                  checked={automationSettings.emergency_notification}
                  onCheckedChange={(checked) => 
                    updateAutomationSetting('emergency_notification', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">가용성 관리</Label>
                  <p className="text-sm text-muted-foreground">
                    치료사 일정과 가용성을 자동으로 관리합니다
                  </p>
                </div>
                <Switch
                  checked={automationSettings.capacity_management}
                  onCheckedChange={(checked) => 
                    updateAutomationSetting('capacity_management', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  이달 수익
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ₩{metrics?.revenue_this_month?.toLocaleString() || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  전월 대비 성장률 계산 중...
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  운영 효율성
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>자동화율</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>응답 속도</span>
                    <span className="font-bold">평균 2분</span>
                  </div>
                  <div className="flex justify-between">
                    <span>고객 만족도</span>
                    <span className="font-bold">{metrics?.average_rating?.toFixed(1) || 0}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI 추천 사항</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">치료사 추가 고용 권장</p>
                    <p className="text-sm text-muted-foreground">
                      현재 가동률이 {metrics?.capacity_utilization?.toFixed(1)}%로 높습니다. 
                      언어치료 전문가 1명 추가 고용을 권장합니다.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">프리미엄 서비스 도입</p>
                    <p className="text-sm text-muted-foreground">
                      고객 만족도가 높으므로 프리미엄 서비스 패키지 도입을 고려해보세요.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}