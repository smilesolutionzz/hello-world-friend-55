import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  MessageCircle, 
  DollarSign, 
  Star, 
  Clock, 
  Users,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AIAssistantDashboard } from './AIAssistantDashboard';

interface Expert {
  id: string;
  full_name: string;
  professional_title: string;
  is_available: boolean;
  total_sessions: number;
  average_rating: number;
  hourly_rate: number;
}

interface Consultation {
  id: string;
  user_id: string;
  status: string;
  consultation_type: string;
  scheduled_at: string;
  price: number;
  created_at: string;
}

interface DashboardStats {
  todayConsultations: number;
  weeklyEarnings: number;
  monthlyConsultations: number;
  averageRating: number;
}

export const ExpertDashboard: React.FC = () => {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayConsultations: 0,
    weeklyEarnings: 0,
    monthlyConsultations: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadExpertData();
    loadConsultations();
    loadStats();
  }, []);

  const loadExpertData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 전문가 프로필이 없음
          toast({
            title: "전문가 등록 필요",
            description: "전문가로 등록하시려면 관리자에게 문의하세요.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        throw error;
      }

      setExpert(data);
    } catch (error) {
      console.error('전문가 정보 로드 실패:', error);
      toast({
        title: "오류",
        description: "전문가 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const loadConsultations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('expert_id', expert?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('상담 목록 로드 실패:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !expert) return;

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 오늘 상담 수
      const { count: todayCount } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('expert_id', expert.id)
        .gte('scheduled_at', today.toISOString().split('T')[0]);

      // 이번 주 수익
      const { data: weeklyData } = await supabase
        .from('consultations')
        .select('price')
        .eq('expert_id', expert.id)
        .eq('status', 'completed')
        .gte('created_at', weekAgo.toISOString());

      const weeklyEarnings = weeklyData?.reduce((sum, c) => sum + (c.price * 0.7), 0) || 0;

      // 이번 달 상담 수
      const { count: monthlyCount } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('expert_id', expert.id)
        .gte('created_at', monthAgo.toISOString());

      setStats({
        todayConsultations: todayCount || 0,
        weeklyEarnings: Math.round(weeklyEarnings),
        monthlyConsultations: monthlyCount || 0,
        averageRating: expert.average_rating
      });
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const toggleAvailability = async () => {
    if (!expert) return;

    try {
      const newStatus = !expert.is_available;
      
      const { error } = await supabase
        .from('experts')
        .update({ is_available: newStatus })
        .eq('id', expert.id);

      if (error) throw error;

      setExpert(prev => prev ? { ...prev, is_available: newStatus } : null);
      
      toast({
        title: newStatus ? "상담 활성화됨" : "상담 비활성화됨",
        description: newStatus 
          ? "새로운 상담 요청을 받을 수 있습니다." 
          : "새로운 상담 요청을 받지 않습니다.",
      });
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast({
        title: "오류",
        description: "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'confirmed': return '확정';
      case 'in_progress': return '진행중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  if (loading || !expert) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-lg">
              {expert.full_name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{expert.full_name}</h1>
            <p className="text-muted-foreground">{expert.professional_title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{expert.average_rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({expert.total_sessions}회)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">상담 가능</span>
            <Switch
              checked={expert.is_available}
              onCheckedChange={toggleAvailability}
            />
          </div>
          <Badge variant={expert.is_available ? 'default' : 'secondary'}>
            {expert.is_available ? '온라인' : '오프라인'}
          </Badge>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">오늘 상담</p>
              <p className="text-2xl font-bold">{stats.todayConsultations}건</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">이번 주 수익</p>
              <p className="text-2xl font-bold">{stats.weeklyEarnings.toLocaleString()}원</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">이번 달 상담</p>
              <p className="text-2xl font-bold">{stats.monthlyConsultations}건</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">평균 평점</p>
              <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}점</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 탭 섹션 */}
      <Tabs defaultValue="consultations" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="consultations">상담 관리</TabsTrigger>
          <TabsTrigger value="schedule">일정 관리</TabsTrigger>
          <TabsTrigger value="earnings">수익 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">최근 상담 요청</h2>
              <Badge variant="outline">{consultations.length}건</Badge>
            </div>

            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>아직 상담 요청이 없습니다.</p>
                </div>
              ) : (
                consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(consultation.status)}>
                          {getStatusLabel(consultation.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {consultation.consultation_type === 'text' ? '텍스트' : 
                           consultation.consultation_type === 'voice' ? '음성' : '화상'} 상담
                        </span>
                      </div>
                      <p className="font-medium">
                        {new Date(consultation.scheduled_at).toLocaleDateString('ko-KR')} {' '}
                        {new Date(consultation.scheduled_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">{consultation.price.toLocaleString()}원</p>
                      <div className="flex gap-2 mt-2">
                        {consultation.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline">거절</Button>
                            <Button size="sm">수락</Button>
                          </>
                        )}
                        {consultation.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/consultation/${consultation.id}`)}
                          >
                            상담 시작
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">일정 관리</h2>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>일정 관리 기능은 곧 추가될 예정입니다.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">AI 업무 지원 시스템</h2>
              <AIAssistantDashboard />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};