import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, FileText, Brain, Calendar, User, Phone, Mail, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserData {
  user_id: string;
  display_name: string;
  phone: string;
  created_at: string;
  current_tokens: number;
  test_count: number;
  observation_count: number;
}

interface TestResult {
  id: string;
  test_type_id: string;
  created_at: string;
  scores: any;
  completed_at: string;
}

interface ObservationResult {
  id: string;
  title: string;
  created_at: string;
  description: string;
  behavior_type: string;
}

export const UserDataViewer = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [observations, setObservations] = useState<ObservationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'observations'>('overview');
  const { toast } = useToast();

  const searchUser = async () => {
    if (!searchUserId.trim()) {
      toast({
        title: "사용자 ID 입력 필요",
        description: "검색할 사용자의 ID를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 먼저 사용자 기본 정보 조회
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', searchUserId);

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        toast({
          title: "사용자를 찾을 수 없습니다",
          description: "입력한 ID의 사용자가 존재하지 않습니다.",
          variant: "destructive"
        });
        return;
      }

      const profile = profiles[0];

      // 토큰 정보 조회
      const { data: tokenData } = await supabase
        .from('user_tokens')
        .select('current_tokens')
        .eq('user_id', searchUserId)
        .single();

      // 테스트 개수 조회
      const { count: testCount } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', searchUserId);

      // 관찰일지 개수 조회
      const { count: observationCount } = await supabase
        .from('observation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', searchUserId);

      setUserData({
        user_id: profile.user_id,
        display_name: profile.display_name || '이름 없음',
        phone: profile.phone || '전화번호 없음',
        created_at: profile.created_at,
        current_tokens: tokenData?.current_tokens || 0,
        test_count: testCount || 0,
        observation_count: observationCount || 0
      });

      toast({
        title: "사용자 정보 조회 완료",
        description: `${profile.display_name || '사용자'}의 정보를 불러왔습니다.`
      });

    } catch (error) {
      console.error('User search error:', error);
      toast({
        title: "조회 실패",
        description: "사용자 정보 조회 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTestResults = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('id, test_type_id, created_at, scores, completed_at')
        .eq('user_id', userData.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestResults(data || []);
    } catch (error) {
      console.error('Test results error:', error);
      toast({
        title: "테스트 결과 조회 실패",
        description: "테스트 결과를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadObservations = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('observation_logs')
        .select('id, title, created_at, description, behavior_type')
        .eq('user_id', userData.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObservations(data || []);
    } catch (error) {
      console.error('Observations error:', error);
      toast({
        title: "관찰일지 조회 실패",
        description: "관찰일지를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'overview' | 'tests' | 'observations') => {
    setActiveTab(tab);
    if (tab === 'tests' && testResults.length === 0) {
      loadTestResults();
    } else if (tab === 'observations' && observations.length === 0) {
      loadObservations();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            사용자 데이터 조회
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="사용자 ID를 입력하세요..."
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUser()}
            />
            <Button onClick={searchUser} disabled={loading}>
              {loading ? '검색 중...' : '검색'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {userData && (
        <>
          {/* 사용자 개요 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                사용자 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">이름</p>
                    <p className="font-medium">{userData.display_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">전화번호</p>
                    <p className="font-medium">{userData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">보유 토큰</p>
                    <p className="font-medium">{userData.current_tokens}개</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">가입일</p>
                    <p className="font-medium">{format(new Date(userData.created_at), 'yyyy-MM-dd')}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  검사 {userData.test_count}개
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  관찰일지 {userData.observation_count}개
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 탭 메뉴 */}
          <div className="flex space-x-1 border-b">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('overview')}
            >
              개요
            </Button>
            <Button
              variant={activeTab === 'tests' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('tests')}
            >
              검사 결과 ({userData.test_count})
            </Button>
            <Button
              variant={activeTab === 'observations' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('observations')}
            >
              관찰일지 ({userData.observation_count})
            </Button>
          </div>

          {/* 검사 결과 */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              {testResults.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">검사 ID: {test.test_type_id}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      완료일: {format(new Date(test.completed_at), 'yyyy-MM-dd HH:mm')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      생성일: {format(new Date(test.created_at), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">검사 점수:</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                          {JSON.stringify(test.scores, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {testResults.length === 0 && !loading && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">검사 결과가 없습니다.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* 관찰일지 */}
          {activeTab === 'observations' && (
            <div className="space-y-4">
              {observations.map((observation) => (
                <Card key={observation.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{observation.title || '관찰일지'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(observation.created_at), 'yyyy-MM-dd HH:mm')}
                    </p>
                    {observation.behavior_type && (
                      <Badge variant="outline">{observation.behavior_type}</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {observation.description && (
                        <div>
                          <h4 className="font-medium mb-2">관찰 내용:</h4>
                          <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                            {observation.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {observations.length === 0 && !loading && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">관찰일지가 없습니다.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};