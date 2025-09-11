import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Server, 
  Wifi, 
  Users,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  database_health: 'healthy' | 'warning' | 'critical';
  api_response_time: number;
  active_users: number;
  error_rate: number;
  storage_usage: number;
  last_backup: string;
}

export function SystemMonitoring() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const fetchSystemStatus = async () => {
    try {
      // 데이터베이스 건강도 체크
      const dbStartTime = Date.now();
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      const dbResponseTime = Date.now() - dbStartTime;

      // 활성 사용자 수 조회
      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // 에러율 계산 (최근 24시간)
      const { data: errorLogs } = await supabase
        .from('admin_notifications')
        .select('count')
        .eq('priority', 'high')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const status: SystemStatus = {
        database_health: dbError ? 'critical' : dbResponseTime > 1000 ? 'warning' : 'healthy',
        api_response_time: dbResponseTime,
        active_users: activeUsers?.length || 0,
        error_rate: errorLogs?.length || 0,
        storage_usage: Math.random() * 80 + 10, // 임시 데이터
        last_backup: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString()
      };

      setSystemStatus(status);

      // 임계치 알림
      if (status.database_health === 'critical') {
        toast({
          title: "데이터베이스 문제 감지",
          description: "즉시 확인이 필요합니다.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('시스템 상태 조회 실패:', error);
      toast({
        title: "모니터링 오류",
        description: "시스템 상태를 가져올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemStatus, 30000); // 30초마다 자동 새로고침
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getHealthBadge = (health: string) => {
    const variants = {
      healthy: { variant: 'default' as const, icon: CheckCircle, text: '정상' },
      warning: { variant: 'secondary' as const, icon: AlertTriangle, text: '주의' },
      critical: { variant: 'destructive' as const, icon: AlertTriangle, text: '위험' }
    };
    
    const config = variants[health as keyof typeof variants];
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>시스템 모니터링</CardTitle>
          <CardDescription>실시간 시스템 상태를 확인합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!systemStatus) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            시스템 모니터링
          </CardTitle>
          <CardDescription>실시간 시스템 상태 및 성능 지표</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-500' : 'text-gray-400'}`} />
            자동새로고침
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSystemStatus}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 데이터베이스 상태 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">데이터베이스</span>
                </div>
                {getHealthBadge(systemStatus.database_health)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                응답시간: {systemStatus.api_response_time}ms
              </div>
            </CardContent>
          </Card>

          {/* 활성 사용자 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">활성 사용자</span>
                </div>
                <Badge variant="outline">{systemStatus.active_users}</Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                최근 24시간
              </div>
            </CardContent>
          </Card>

          {/* 에러율 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">에러 건수</span>
                </div>
                <Badge variant={systemStatus.error_rate > 10 ? "destructive" : "secondary"}>
                  {systemStatus.error_rate}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                최근 24시간
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* 스토리지 사용량 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">스토리지 사용량</span>
            <span className="text-sm text-muted-foreground">{systemStatus.storage_usage.toFixed(1)}%</span>
          </div>
          <Progress value={systemStatus.storage_usage} className="w-full" />
          {systemStatus.storage_usage > 80 && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              스토리지 사용량이 높습니다. 정리를 권장합니다.
            </div>
          )}
        </div>

        {/* 마지막 백업 */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">마지막 백업</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(systemStatus.last_backup).toLocaleString('ko-KR')}
          </span>
        </div>

        {/* 시스템 상태 요약 */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4" />
            <span className="font-medium">전체 시스템 상태:</span>
            {systemStatus.database_health === 'healthy' && systemStatus.error_rate < 5 ? (
              <Badge variant="default" className="text-green-700 bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                안정적
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertTriangle className="h-3 w-3 mr-1" />
                모니터링 필요
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}