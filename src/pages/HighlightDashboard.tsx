import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TestSelector } from '@/components/highlight/TestSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, History, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  display_name: string;
  subscription_tier: string;
}

interface RecentTest {
  id: string;
  completed_at: string;
  scores: any;
  test_types: {
    name: string;
  };
}

export default function HighlightDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      await fetchProfile();
      await fetchRecentTests();
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "프로필 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchRecentTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('test_results')
        .select(`
          id,
          completed_at,
          scores,
          test_types (name)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentTests(data || []);
    } catch (error: any) {
      toast({
        title: "최근 검사 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              HIGHLIGHT
            </h1>
            {profile && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{profile.display_name || '사용자'}</span>
                <Badge variant={profile.subscription_tier === 'premium' ? 'default' : 'secondary'}>
                  {profile.subscription_tier === 'premium' ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      프리미엄
                    </>
                  ) : (
                    '무료'
                  )}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/subscription')}
            >
              구독 관리
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <TestSelector />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  최근 검사
                </CardTitle>
                <CardDescription>
                  최근 완료한 검사 결과를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTests.length > 0 ? (
                  <div className="space-y-3">
                    {recentTests.map((test) => (
                      <div 
                        key={test.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/results/${test.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{test.test_types.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(test.completed_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {test.scores.total_score || 0}점
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    아직 완료한 검사가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Subscription Info */}
            {profile?.subscription_tier === 'free' && (
              <Card>
                <CardHeader>
                  <CardTitle>프리미엄 업그레이드</CardTitle>
                  <CardDescription>
                    더 많은 기능을 이용해보세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2 mb-4">
                    <li>• 무제한 검사</li>
                    <li>• 전문가 피드백</li>
                    <li>• PDF 리포트 다운로드</li>
                    <li>• 카카오 알림톡</li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/subscription')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    프리미엄 구독하기
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}