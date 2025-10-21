import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrganizationStats } from '@/components/organization/OrganizationStats';
import { OrganizationChart } from '@/components/organization/OrganizationChart';
import { TestInsights } from '@/components/organization/TestInsights';
import { TestResultsList } from '@/components/organization/TestResultsList';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    end: new Date()
  });

  const categories = [
    { id: 'all', name: '전체 검사', color: 'bg-primary' },
    { id: 'adhd', name: 'ADHD 검사', color: 'bg-red-500' },
    { id: 'depression', name: '우울 검사', color: 'bg-blue-500' },
    { id: 'anxiety', name: '불안 검사', color: 'bg-yellow-500' },
    { id: 'stress', name: '스트레스 검사', color: 'bg-orange-500' },
    { id: 'bigfive', name: '성격 검사', color: 'bg-purple-500' },
    { id: 'attachment', name: '애착 검사', color: 'bg-pink-500' },
  ];

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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-6 space-y-6">
          {/* Organization Info */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="w-full justify-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로
            </Button>
            <h2 className="text-lg font-bold px-2">{organization.name}</h2>
          </div>

          {/* Category Menu */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sm font-semibold hover:bg-accent rounded-md">
              결과별 분류
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {categories.find(c => c.id === selectedCategory)?.name || '전체 검사'} 결과
            </p>
          </div>

          {/* Date Range Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex gap-2 items-center">
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
                    className="px-3 py-2 border rounded-md bg-background"
                  />
                  <span>~</span>
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
                    className="px-3 py-2 border rounded-md bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <OrganizationStats 
            organizationId={organization.id} 
            dateRange={dateRange}
            selectedCategory={selectedCategory}
          />

          {/* Charts */}
          <OrganizationChart 
            organizationId={organization.id} 
            dateRange={dateRange}
            selectedCategory={selectedCategory}
          />

          {/* Insights */}
          <TestInsights 
            organizationId={organization.id} 
            dateRange={dateRange}
            selectedCategory={selectedCategory}
          />

          {/* Test Results List */}
          <TestResultsList
            organizationId={organization.id}
            dateRange={dateRange}
            selectedCategory={selectedCategory}
          />
        </div>
      </main>
    </div>
  );
};

export default OrganizationDashboard;
