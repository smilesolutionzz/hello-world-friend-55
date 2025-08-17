import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Calendar, 
  MessageCircle, 
  TrendingUp, 
  Settings,
  LogOut,
  Heart,
  Clock,
  AlertTriangle,
  User,
  Baby,
  Users as ChildIcon,
  UserCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import FamilyManagement from "@/components/family/FamilyManagement";
import AssessmentHistory from "@/components/history/AssessmentHistory";
import ConsultationHistory from "@/components/history/ConsultationHistory";

interface Profile {
  id: string;
  display_name: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  role: string;
  avatar_url?: string;
}

interface FamilyMember {
  id: string;
  relationship: string;
  is_primary_caregiver: boolean;
  profile: Profile;
}

interface Family {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  family_members: FamilyMember[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);

      // Load families
      const { data: familiesData } = await supabase
        .from('families')
        .select(`
          *,
          family_members(
            *,
            profile:profiles(*)
          )
        `)
        .order('created_at', { ascending: false });

      setFamilies(familiesData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getAgeGroupIcon = (birthDate?: string) => {
    if (!birthDate) return <User className="w-4 h-4" />;
    
    const age = getAgeFromBirthDate(birthDate);
    if (age < 3) return <Baby className="w-4 h-4" />;
    if (age < 18) return <ChildIcon className="w-4 h-4" />;
    return <UserCheck className="w-4 h-4" />;
  };

  const getAgeGroupLabel = (birthDate?: string) => {
    if (!birthDate) return "연령 미입력";
    
    const age = getAgeFromBirthDate(birthDate);
    if (age < 3) return `유아 (${age}세)`;
    if (age < 18) return `아동/청소년 (${age}세)`;
    return `성인 (${age}세)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">가족 케어 대시보드</h1>
                <p className="text-sm text-muted-foreground">안녕하세요, {profile?.display_name}님</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/ai-counselor')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                AI 상담
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/assessment')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                진단하기
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="family">가족 관리</TabsTrigger>
            <TabsTrigger value="assessments">검사 기록</TabsTrigger>
            <TabsTrigger value="consultations">상담 기록</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {families.reduce((total, family) => total + family.family_members.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">가족 구성원</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">완료된 검사</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">예정된 상담</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">24시간</p>
                    <p className="text-sm text-muted-foreground">AI 상담 가능</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Family Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">가족 구성원</h2>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  구성원 추가
                </Button>
              </div>

              {families.length > 0 ? (
                <div className="space-y-4">
                  {families.map(family => (
                    <Card key={family.id} className="p-6">
                      <h3 className="font-semibold text-lg mb-4">{family.name}</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {family.family_members.map(member => (
                          <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              {getAgeGroupIcon(member.profile.birth_date)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{member.profile.display_name}</p>
                              <p className="text-xs text-muted-foreground">{member.relationship}</p>
                              <Badge variant="outline" className="text-xs">
                                {getAgeGroupLabel(member.profile.birth_date)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">가족을 등록해보세요</h3>
                  <p className="text-muted-foreground mb-4">
                    가족 구성원을 추가하여 통합 케어를 시작하세요
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    첫 번째 가족 만들기
                  </Button>
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 hover-glow cursor-pointer" onClick={() => navigate('/assessment')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">3분 심리검사</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      연령별 맞춤 진단으로 정확한 상태를 파악하세요
                    </p>
                    <Badge className="bg-primary/20 text-primary">지금 시작</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover-glow cursor-pointer" onClick={() => navigate('/ai-counselor')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">24시간 AI 상담</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      언제든지 마음 편히 상담받으세요
                    </p>
                    <Badge className="bg-green-100 text-green-700">즉시 이용</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="family">
            <FamilyManagement families={families} onUpdate={loadDashboardData} />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentHistory />
          </TabsContent>

          <TabsContent value="consultations">
            <ConsultationHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;