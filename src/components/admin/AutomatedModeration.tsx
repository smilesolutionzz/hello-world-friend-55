import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  Eye, 
  Ban,
  CheckCircle,
  XCircle,
  Settings,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModerationRule {
  id: string;
  type: 'spam_detection' | 'inappropriate_content' | 'user_behavior';
  enabled: boolean;
  threshold: number;
  action: 'warn' | 'temporary_ban' | 'permanent_ban' | 'content_removal';
  name: string;
  description: string;
}

interface ModerationAction {
  id: string;
  user_id: string;
  user_email: string;
  action_type: string;
  reason: string;
  created_at: string;
  status: 'pending' | 'applied' | 'reversed';
}

interface ModerationStats {
  total_actions_today: number;
  auto_actions: number;
  manual_reviews_needed: number;
  false_positive_rate: number;
}

export function AutomatedModeration() {
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [recentActions, setRecentActions] = useState<ModerationAction[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const defaultRules: ModerationRule[] = [
    {
      id: '1',
      type: 'spam_detection',
      enabled: true,
      threshold: 5,
      action: 'warn',
      name: '스팸 탐지',
      description: '짧은 시간 내 반복적인 게시물 작성'
    },
    {
      id: '2',
      type: 'inappropriate_content',
      enabled: true,
      threshold: 3,
      action: 'content_removal',
      name: '부적절한 콘텐츠',
      description: '욕설, 혐오 발언 등 부적절한 내용'
    },
    {
      id: '3',
      type: 'user_behavior',
      enabled: false,
      threshold: 7,
      action: 'temporary_ban',
      name: '비정상 행동 패턴',
      description: '과도한 신고 접수 또는 의심스러운 활동'
    }
  ];

  const fetchModerationData = async () => {
    try {
      setLoading(true);

      // 실제 환경에서는 이 데이터들을 실제 테이블에서 가져옵니다
      // 현재는 시뮬레이션 데이터 사용
      const mockActions: ModerationAction[] = [
        {
          id: '1',
          user_id: 'user1',
          user_email: 'user1@example.com',
          action_type: '콘텐츠 삭제',
          reason: '부적절한 언어 사용',
          created_at: new Date().toISOString(),
          status: 'applied'
        },
        {
          id: '2',
          user_id: 'user2',
          user_email: 'user2@example.com',
          action_type: '경고',
          reason: '스팸 의심 행동',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'applied'
        }
      ];

      const mockStats: ModerationStats = {
        total_actions_today: 12,
        auto_actions: 8,
        manual_reviews_needed: 3,
        false_positive_rate: 5.2
      };

      setRecentActions(mockActions);
      setStats(mockStats);
      setRules(defaultRules);

    } catch (error) {
      console.error('자동 조정 데이터 로딩 실패:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "자동 조정 데이터를 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<ModerationRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
    
    toast({
      title: "규칙 업데이트",
      description: "자동 조정 규칙이 업데이트되었습니다.",
    });
  };

  const reverseAction = async (actionId: string) => {
    setRecentActions(prev => prev.map(action =>
      action.id === actionId ? { ...action, status: 'reversed' } : action
    ));

    toast({
      title: "조치 취소",
      description: "자동 조치가 취소되었습니다.",
    });
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>자동 조정 시스템</CardTitle>
          <CardDescription>AI 기반 자동 콘텐츠 및 사용자 관리</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드들 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.total_actions_today}</p>
                  <p className="text-sm text-muted-foreground">오늘 총 조치</p>
                </div>
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.auto_actions}</p>
                  <p className="text-sm text-muted-foreground">자동 처리</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.manual_reviews_needed}</p>
                  <p className="text-sm text-muted-foreground">수동 검토 필요</p>
                </div>
                <Eye className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.false_positive_rate}%</p>
                  <p className="text-sm text-muted-foreground">오탐지율</p>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">자동 규칙 설정</TabsTrigger>
          <TabsTrigger value="actions">최근 조치</TabsTrigger>
          <TabsTrigger value="reports">신고 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                자동 조정 규칙
              </CardTitle>
              <CardDescription>
                AI가 자동으로 적용할 조정 규칙을 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => updateRule(rule.id, { enabled: checked })}
                    />
                  </div>

                  {rule.enabled && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">민감도 임계값: {rule.threshold}</Label>
                        <Slider
                          value={[rule.threshold]}
                          onValueChange={([value]) => updateRule(rule.id, { threshold: value })}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">조치 유형</Label>
                        <select
                          value={rule.action}
                          onChange={(e) => updateRule(rule.id, { action: e.target.value as any })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="warn">경고</option>
                          <option value="content_removal">콘텐츠 삭제</option>
                          <option value="temporary_ban">임시 정지</option>
                          <option value="permanent_ban">영구 정지</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>최근 자동 조치</CardTitle>
              <CardDescription>AI가 자동으로 수행한 조치들을 확인하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>조치</TableHead>
                    <TableHead>사유</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{action.user_email}</TableCell>
                      <TableCell>{action.action_type}</TableCell>
                      <TableCell>{action.reason}</TableCell>
                      <TableCell>
                        {new Date(action.created_at).toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          action.status === 'applied' ? 'default' :
                          action.status === 'reversed' ? 'secondary' : 'outline'
                        }>
                          {action.status === 'applied' ? '적용됨' :
                           action.status === 'reversed' ? '취소됨' : '대기중'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {action.status === 'applied' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reverseAction(action.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            취소
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>신고 관리</CardTitle>
              <CardDescription>사용자 신고를 자동으로 분류하고 처리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>아직 처리할 신고가 없습니다.</p>
                <p className="text-sm">신고가 접수되면 여기에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}