import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Calendar,
  UserPlus,
  BarChart3,
  PieChart,
  ArrowLeft,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrganizationStats } from '@/components/organization/OrganizationStats';
import { OrganizationChart } from '@/components/organization/OrganizationChart';
import { MemberManagement } from '@/components/organization/MemberManagement';
import { TestInsights } from '@/components/organization/TestInsights';
import { Skeleton } from '@/components/ui/skeleton';

interface Organization {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    end: new Date()
  });

  useEffect(() => {
    checkOrganization();
  }, []);

  const checkOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // 관리자가 속한 기관 확인
      const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('admin_user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 기관이 없으면 생성 페이지로 이동
          toast({
            title: '기관 등록 필요',
            description: '먼저 기관을 등록해주세요.',
          });
          navigate('/organization/setup');
          return;
        }
        throw error;
      }

      setOrganization(org);
    } catch (error) {
      console.error('Error checking organization:', error);
      toast({
        title: '오류',
        description: '기관 정보를 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid md:grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">
              {organization.type === 'hospital' ? '병원' : 
               organization.type === 'school' ? '학교' :
               organization.type === 'clinic' ? '클리닉' : '기관'} 대시보드
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              보고서 다운로드
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex gap-2">
                <input
                  type="month"
                  value={`${dateRange.start.getFullYear()}-${String(dateRange.start.getMonth() + 1).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setDateRange({
                      ...dateRange,
                      start: new Date(parseInt(year), parseInt(month) - 1, 1)
                    });
                  }}
                  className="px-3 py-2 border rounded-md"
                />
                <span className="flex items-center">~</span>
                <input
                  type="month"
                  value={`${dateRange.end.getFullYear()}-${String(dateRange.end.getMonth() + 1).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setDateRange({
                      ...dateRange,
                      end: new Date(parseInt(year), parseInt(month), 0)
                    });
                  }}
                  className="px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              통계 개요
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              멤버 관리
            </TabsTrigger>
            <TabsTrigger value="insights">
              <PieChart className="w-4 h-4 mr-2" />
              인사이트
            </TabsTrigger>
            <TabsTrigger value="reports">
              <TrendingUp className="w-4 h-4 mr-2" />
              보고서
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OrganizationStats 
              organizationId={organization.id} 
              dateRange={dateRange}
            />
            <OrganizationChart 
              organizationId={organization.id} 
              dateRange={dateRange}
            />
          </TabsContent>

          <TabsContent value="members">
            <MemberManagement organizationId={organization.id} />
          </TabsContent>

          <TabsContent value="insights">
            <TestInsights 
              organizationId={organization.id} 
              dateRange={dateRange}
            />
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>검사 보고서</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  보고서 기능이 준비 중입니다
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
