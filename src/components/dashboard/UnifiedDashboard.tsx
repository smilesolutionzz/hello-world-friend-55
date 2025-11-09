import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageContainer } from '@/components/ui/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  School, 
  Brain, 
  Building2,
  Users,
  ClipboardList,
  TrendingUp
} from 'lucide-react';

type AccountType = 'parent' | 'teacher' | 'therapist' | 'admin';

interface DashboardProps {
  accountType?: AccountType;
}

const UnifiedDashboard = ({ accountType }: DashboardProps) => {
  const [userAccountType, setUserAccountType] = useState<AccountType>('parent');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, organization_id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserAccountType(profile.account_type || 'parent');
        
        if (profile.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', profile.organization_id)
            .single();
          
          if (org) {
            setOrganizationName(org.name);
          }
        }
      }
    } catch (error) {
      console.error('프로필 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentAccountType = accountType || userAccountType;

  // 계정 타입별 설정
  const accountConfig = {
    parent: {
      icon: User,
      title: '부모 대시보드',
      description: '우리 아이의 발달 기록을 확인하세요',
      color: 'text-blue-500',
      sections: [
        { id: 'observations', label: '관찰 기록', icon: ClipboardList },
        { id: 'analysis', label: 'AI 분석', icon: Brain },
        { id: 'progress', label: '발달 현황', icon: TrendingUp }
      ]
    },
    teacher: {
      icon: School,
      title: '교사 대시보드',
      description: `${organizationName} - 학생 관리`,
      color: 'text-green-500',
      sections: [
        { id: 'students', label: '학생 관리', icon: Users },
        { id: 'observations', label: '관찰 기록', icon: ClipboardList },
        { id: 'reports', label: '리포트', icon: TrendingUp }
      ]
    },
    therapist: {
      icon: Brain,
      title: '발달센터 대시보드',
      description: `${organizationName} - 아동 관리`,
      color: 'text-purple-500',
      sections: [
        { id: 'children', label: '아동 관리', icon: Users },
        { id: 'assessments', label: '발달 평가', icon: Brain },
        { id: 'interventions', label: '중재 계획', icon: ClipboardList }
      ]
    },
    admin: {
      icon: Building2,
      title: '관리자 대시보드',
      description: '전체 시스템 관리',
      color: 'text-orange-500',
      sections: [
        { id: 'organizations', label: '조직 관리', icon: Building2 },
        { id: 'users', label: '사용자 관리', icon: Users },
        { id: 'analytics', label: '통계', icon: TrendingUp }
      ]
    }
  };

  const config = accountConfig[currentAccountType];
  const Icon = config.icon;

  if (loading) {
    return <PageContainer loading={loading}><div /></PageContainer>;
  }

  return (
    <PageContainer
      title={config.title}
      description={config.description}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* 계정 타입 배지 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full bg-primary/10`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {config.title}
                  <Badge variant="secondary">
                    {currentAccountType === 'parent' && '부모'}
                    {currentAccountType === 'teacher' && '교사'}
                    {currentAccountType === 'therapist' && '치료사'}
                    {currentAccountType === 'admin' && '관리자'}
                  </Badge>
                </CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 탭 기반 섹션 */}
        <Tabs defaultValue={config.sections[0].id} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${config.sections.length}, 1fr)` }}>
            {config.sections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <TabsTrigger key={section.id} value={section.id}>
                  <SectionIcon className="w-4 h-4 mr-2" />
                  {section.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {config.sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{section.label}</CardTitle>
                  <CardDescription>
                    {section.id === 'observations' && '관찰 기록을 관리하고 확인하세요'}
                    {section.id === 'analysis' && 'AI가 분석한 발달 정보를 확인하세요'}
                    {section.id === 'progress' && '시간에 따른 발달 변화를 추적하세요'}
                    {section.id === 'students' && '학생들의 학습 현황을 관리하세요'}
                    {section.id === 'children' && '아동들의 발달 상태를 관리하세요'}
                    {section.id === 'assessments' && '전문적인 발달 평가를 진행하세요'}
                    {section.id === 'reports' && '상세 리포트를 생성하고 공유하세요'}
                    {section.id === 'interventions' && '개별 중재 계획을 수립하세요'}
                    {section.id === 'organizations' && '조직 정보를 관리하세요'}
                    {section.id === 'users' && '사용자 계정을 관리하세요'}
                    {section.id === 'analytics' && '시스템 사용 통계를 확인하세요'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>해당 기능은 곧 추가될 예정입니다</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* 퀵 액션 카드 */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">빠른 시작</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                새로운 {currentAccountType === 'parent' ? '관찰 기록' : '활동'}을 시작하세요
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                최근 활동 내역을 확인하세요
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">도움말</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                사용 가이드와 FAQ를 확인하세요
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default UnifiedDashboard;
