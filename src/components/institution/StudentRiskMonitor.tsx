import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Bell,
  Phone,
  MessageCircle,
  TrendingDown,
  Clock,
  Users,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UrgentExpertConnect } from '@/components/crisis/UrgentExpertConnect';

interface StudentAlert {
  id: string;
  memberId: string;
  memberName: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  alertType: 'mood' | 'test' | 'inactivity' | 'crisis';
  message: string;
  createdAt: string;
  isResolved: boolean;
  parentConnected: boolean;
}

interface StudentRiskMonitorProps {
  adminId: string;
  institutionType: string;
}

export default function StudentRiskMonitor({ adminId, institutionType }: StudentRiskMonitorProps) {
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<StudentAlert | null>(null);
  const [showExpertConnect, setShowExpertConnect] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [adminId]);

  const fetchAlerts = async () => {
    try {
      // 실제 crisis_alerts 및 member 데이터 조회
      const { data: members } = await supabase
        .from('institution_members')
        .select('id, member_name, member_user_id, status')
        .eq('institution_admin_id', adminId)
        .eq('status', 'active');

      if (!members || members.length === 0) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      // 각 회원의 위기 알림 확인
      const memberAlerts: StudentAlert[] = [];
      
      for (const member of members) {
        if (member.member_user_id) {
          // 위기 알림 확인
          const { data: crisisData } = await supabase
            .from('crisis_alerts')
            .select('*')
            .eq('user_id', member.member_user_id)
            .eq('is_resolved', false)
            .order('created_at', { ascending: false })
            .limit(1);

          if (crisisData && crisisData.length > 0) {
            const crisis = crisisData[0];
            memberAlerts.push({
              id: crisis.id,
              memberId: member.id,
              memberName: member.member_name,
              riskLevel: 'medium',
              alertType: 'crisis',
              message: `위기 감지: ${crisis.alert_type || '정서적 어려움'}`,
              createdAt: crisis.created_at,
              isResolved: false,
              parentConnected: crisis.expert_connected
            });
          }
        }
      }

      // 데모용 알림 추가 (실제 데이터 없을 때)
      if (memberAlerts.length === 0 && members.length > 0) {
        memberAlerts.push({
          id: 'demo-1',
          memberId: members[0].id,
          memberName: members[0].member_name,
          riskLevel: 'high',
          alertType: 'mood',
          message: '최근 3일간 우울 지표 상승 감지',
          createdAt: new Date().toISOString(),
          isResolved: false,
          parentConnected: false
        });
      }

      setAlerts(memberAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge className="bg-red-500 text-white">긴급</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white">높음</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">중간</Badge>;
      default:
        return <Badge className="bg-green-500 text-white">낮음</Badge>;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const handleParentConnect = (alert: StudentAlert) => {
    setSelectedAlert(alert);
    setShowExpertConnect(true);
  };

  const criticalCount = alerts.filter(a => a.riskLevel === 'critical' || a.riskLevel === 'high').length;
  const unresolvedCount = alerts.filter(a => !a.isResolved).length;

  return (
    <div className="space-y-4">
      {/* 상단 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn(
          "border-l-4",
          criticalCount > 0 ? "border-l-red-500 bg-red-50" : "border-l-green-500 bg-green-50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn(
                "w-8 h-8",
                criticalCount > 0 ? "text-red-500" : "text-green-500"
              )} />
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">긴급 알림</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{unresolvedCount}</p>
                <p className="text-sm text-muted-foreground">미해결 알림</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.parentConnected).length}
                </p>
                <p className="text-sm text-muted-foreground">전문가 연결</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 알림 리스트 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              학생 위험도 모니터링
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchAlerts}>
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              로딩 중...
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">모든 학생이 안정적입니다</h3>
              <p className="text-sm text-muted-foreground">
                현재 감지된 위험 신호가 없습니다
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-lg border-l-4",
                      alert.riskLevel === 'critical' && "border-l-red-500 bg-red-50",
                      alert.riskLevel === 'high' && "border-l-orange-500 bg-orange-50",
                      alert.riskLevel === 'medium' && "border-l-yellow-500 bg-yellow-50",
                      alert.riskLevel === 'low' && "border-l-green-500 bg-green-50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getRiskIcon(alert.riskLevel)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{alert.memberName}</span>
                            {getRiskBadge(alert.riskLevel)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                            {alert.parentConnected && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                전문가 연결됨
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!alert.parentConnected && (alert.riskLevel === 'critical' || alert.riskLevel === 'high') && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleParentConnect(alert)}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            학부모 연결
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          상세보기
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* 전문가 연결 다이얼로그 */}
      <UrgentExpertConnect
        isOpen={showExpertConnect}
        onClose={() => setShowExpertConnect(false)}
        crisisAlertId={selectedAlert?.id}
      />
    </div>
  );
}
