import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Users, 
  Calendar,
  Heart,
  Activity,
  TrendingUp,
  UserPlus,
  Baby,
  User,
  UserCheck
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  user_id: string;
  family_id?: string;
  created_at: string;
}

interface Assessment {
  id: string;
  profile_id: string;
  age_group: string;
  results: any;
  analysis?: string;
  risk_level?: string;
  created_at: string;
}

const FamilyDataManager = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState({
    name: '',
    relationship: '',
    age: ''
  });

  const { toast } = useToast();

  // 가족 구성원 로드
  const loadFamilyMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  // 평가 기록 로드  
  const loadAssessments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 현재 사용자의 평가만 로드 (profiles 조인 없이)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        console.log('No profile found for user');
        return;
      }

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Assessments error:', error);
        return;
      }
      
      setAssessments(data || []);
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
  };

  // 가족 구성원 추가
  const addFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('사용자 인증이 필요합니다.');

      // family_id 대신 user_id만 사용해서 단순화
      const { error } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          name: memberData.name,
          relationship: memberData.relationship,
          age: memberData.age ? parseInt(memberData.age) : null
        });

      if (error) {
        console.error('Database error:', error);
        throw new Error(`구성원 추가 실패: ${error.message}`);
      }

      // 타임라인에 기록
      try {
        await supabase
          .from('timeline_activities')
          .insert({
            type: 'SYSTEM',
            title: `새 가족 구성원 추가: ${memberData.name}`,
            summary: `${memberData.relationship} 관계의 ${memberData.name}님이 가족에 추가되었습니다.`,
            tags: ['가족관리', '구성원추가'],
            actor: { role: 'user', name: user.email },
            meta: { 
              member_name: memberData.name,
              relationship: memberData.relationship,
              age: memberData.age
            }
          });
      } catch (timelineError) {
        console.error('Timeline error (non-critical):', timelineError);
        // 타임라인 저장 실패는 치명적이지 않으므로 계속 진행
      }

      setMemberData({ name: '', relationship: '', age: '' });
      setShowAddMember(false);
      loadFamilyMembers();

      toast({
        title: "구성원 추가 완료",
        description: `${memberData.name}님이 가족에 추가되었습니다.`
      });
    } catch (error: any) {
      console.error('Add member error:', error);
      toast({
        title: "추가 실패",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 평가 실행 및 저장
  const runAssessmentForMember = async (memberId: string) => {
    try {
      const member = familyMembers.find(m => m.id === memberId);
      if (!member) return;

      // 모의 평가 결과
      const mockResults = {
        language_development: Math.floor(Math.random() * 100),
        social_skills: Math.floor(Math.random() * 100), 
        emotional_regulation: Math.floor(Math.random() * 100),
        cognitive_development: Math.floor(Math.random() * 100)
      };

      const averageScore = Object.values(mockResults).reduce((a, b) => a + b, 0) / 4;
      const riskLevel = averageScore >= 80 ? 'low' : averageScore >= 60 ? 'medium' : 'high';

      // 현재 사용자의 프로필 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('사용자 인증이 필요합니다.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('프로필을 찾을 수 없습니다.');
      }

      if (!profile) {
        throw new Error('사용자 프로필이 존재하지 않습니다.');
      }

      const { error } = await supabase
        .from('assessments')
        .insert({
          profile_id: profile.id,
          age_group: member.age && member.age < 3 ? 'infant' : member.age && member.age < 18 ? 'child' : 'adult',
          age_at_assessment: member.age,
          results: mockResults,
          analysis: `${member.name}님의 발달 상태를 종합적으로 분석한 결과입니다.`,
          risk_level: riskLevel
        });

      if (error) {
        console.error('Assessment error:', error);
        throw new Error(`평가 저장 실패: ${error.message}`);
      }

      // 타임라인에 기록 (오류가 나더라도 평가는 성공으로 처리)
      try {
        await supabase
          .from('timeline_activities')
          .insert({
            member_id: memberId,
            type: 'TEST',
            title: `${member.name} 발달평가 완료`,
            summary: `종합 점수: ${Math.round(averageScore)}점 (${riskLevel === 'low' ? '양호' : riskLevel === 'medium' ? '보통' : '주의'})`,
            tags: ['발달평가', member.relationship],
            actor: { role: 'system', name: 'AI 평가 시스템' },
            meta: { 
              average_score: averageScore,
              risk_level: riskLevel,
              member_name: member.name
            }
          });
      } catch (timelineError) {
        console.error('Timeline error (non-critical):', timelineError);
      }

      loadAssessments();

      toast({
        title: "평가 완료",
        description: `${member.name}님의 발달평가가 완료되었습니다.`
      });
    } catch (error: any) {
      console.error('Assessment error:', error);
      toast({
        title: "평가 실패",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getAgeIcon = (age?: number) => {
    if (!age) return <User className="w-4 h-4" />;
    if (age < 3) return <Baby className="w-4 h-4" />;
    if (age < 18) return <User className="w-4 h-4" />;
    return <UserCheck className="w-4 h-4" />;
  };

  const getAgeGroupLabel = (age?: number) => {
    if (!age) return "연령 미입력";
    if (age < 3) return `유아 (${age}세)`;
    if (age < 18) return `아동/청소년 (${age}세)`;
    return `성인 (${age}세)`;
  };

  const getRiskBadge = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">양호</Badge>;
      case 'medium': 
        return <Badge className="bg-yellow-100 text-yellow-800">보통</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">주의</Badge>;
      default:
        return <Badge variant="outline">미평가</Badge>;
    }
  };

  useEffect(() => {
    loadFamilyMembers();
    loadAssessments();
  }, []);

  return (
    <div className="space-y-6">
      {/* 가족 구성원 관리 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              가족 구성원
            </h3>
            <p className="text-muted-foreground text-sm">가족 구성원을 추가하고 관리하세요</p>
          </div>
          
          <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                구성원 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 가족 구성원 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={addFamilyMember} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    placeholder="구성원 이름"
                    value={memberData.name}
                    onChange={(e) => setMemberData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="relationship">관계</Label>
                  <Select 
                    value={memberData.relationship}
                    onValueChange={(value) => setMemberData(prev => ({ ...prev, relationship: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="관계를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">부모</SelectItem>
                      <SelectItem value="child">자녀</SelectItem>
                      <SelectItem value="spouse">배우자</SelectItem>
                      <SelectItem value="sibling">형제자매</SelectItem>
                      <SelectItem value="grandparent">조부모</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">나이</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="나이 (선택사항)"
                    value={memberData.age}
                    onChange={(e) => setMemberData(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "추가 중..." : "구성원 추가"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map(member => {
            const recentAssessment = assessments.find(a => 
              a.profile_id === member.id // 실제로는 profile과 member를 연결하는 로직 필요
            );
            
            return (
              <Card key={member.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      {getAgeIcon(member.age)}
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.relationship}</p>
                    </div>
                  </div>
                  {getRiskBadge(recentAssessment?.risk_level)}
                </div>
                
                <div className="space-y-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {getAgeGroupLabel(member.age)}
                  </Badge>
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    가입일: {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => runAssessmentForMember(member.id)}
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    발달평가 실행
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {familyMembers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">아직 가족 구성원이 없습니다</p>
            <p className="text-sm text-muted-foreground">첫 번째 가족 구성원을 추가해보세요</p>
          </div>
        )}
      </Card>

      {/* 최근 평가 결과 */}
      {assessments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            최근 평가 결과
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {assessments.slice(0, 4).map(assessment => (
              <div key={assessment.id} className="p-4 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{assessment.age_group}</Badge>
                  {getRiskBadge(assessment.risk_level)}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(assessment.created_at).toLocaleDateString()}
                </p>
                
                {assessment.analysis && (
                  <p className="text-sm line-clamp-2">{assessment.analysis}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 가족 통계 요약 */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          가족 현황 요약
        </h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{familyMembers.length}</div>
            <div className="text-sm text-muted-foreground">총 구성원</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{assessments.length}</div>
            <div className="text-sm text-muted-foreground">완료된 평가</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {assessments.filter(a => a.risk_level === 'low').length}
            </div>
            <div className="text-sm text-muted-foreground">양호 상태</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {assessments.filter(a => a.risk_level === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">주의 필요</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FamilyDataManager;