import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Users, Calendar, CheckCircle, Star, Zap, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { UserLevelDisplay } from "@/components/growth/UserLevelDisplay";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_days: number;
  reward_points: number;
  difficulty: string;
  participants_count: number;
  completion_rate: number;
  is_joined: boolean;
  progress: number;
}

const ChallengesPage = () => {
  const [activeTab, setActiveTab] = useState("featured");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for MVP
  const mockChallenges: Challenge[] = [
    {
      id: "1",
      title: "30일 마음챙김 여행",
      description: "매일 5분씩 명상과 감정 체크인으로 마음을 돌보는 습관을 만들어보세요",
      category: "mindfulness",
      duration_days: 30,
      reward_points: 300,
      difficulty: "쉬움",
      participants_count: 1247,
      completion_rate: 73,
      is_joined: false,
      progress: 0
    },
    {
      id: "2", 
      title: "7일 스트레스 제로 챌린지",
      description: "일주일 동안 스트레스 관리 기술을 배우고 실천해보세요",
      category: "stress",
      duration_days: 7,
      reward_points: 150,
      difficulty: "보통",
      participants_count: 892,
      completion_rate: 85,
      is_joined: true,
      progress: 43
    },
    {
      id: "3",
      title: "14일 에너지 부스터",
      description: "건강한 루틴으로 에너지를 회복하고 활력을 찾아보세요",
      category: "energy",
      duration_days: 14,
      reward_points: 200,
      difficulty: "보통", 
      participants_count: 654,
      completion_rate: 78,
      is_joined: false,
      progress: 0
    },
    {
      id: "4",
      title: "21일 긍정 마인드셋",
      description: "매일 감사 일기와 긍정적 사고 연습으로 마인드셋을 바꿔보세요",
      category: "positivity",
      duration_days: 21,
      reward_points: 250,
      difficulty: "쉬움",
      participants_count: 1156,
      completion_rate: 69,
      is_joined: false,
      progress: 0
    }
  ];

  useEffect(() => {
    loadChallenges();
    loadUserPoints();
  }, []);

  const loadChallenges = async () => {
    // For MVP, use mock data
    setChallenges(mockChallenges);
    setLoading(false);
  };

  const loadUserPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 실제 성장 포인트 불러오기
    const { data: growthPoints } = await supabase
      .from('user_growth_points')
      .select('story_points, challenge_points, reversal_points, total_points')
      .eq('user_id', user.id)
      .single();

    if (growthPoints) {
      const totalPoints = (growthPoints.story_points || 0) + 
                         (growthPoints.challenge_points || 0) + 
                         (growthPoints.reversal_points || 0);
      setUserPoints(totalPoints);
    } else {
      setUserPoints(0);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // 챌린지 참가 시 즉시 5점 지급
    await updateGrowthPoints(user.id, 'challenge', 5);

    const updatedChallenges = challenges.map(challenge =>
      challenge.id === challengeId 
        ? { ...challenge, is_joined: true, participants_count: challenge.participants_count + 1 }
        : challenge
    );
    setChallenges(updatedChallenges);

    toast({
      title: "챌린지 참가 완료! 🎉",
      description: "챌린지 시작으로 +5점 획득! 매일 완료하면 추가 점수를 얻을 수 있어요!",
    });
  };

  const updateGrowthPoints = async (userId: string, pointType: 'story' | 'challenge' | 'reversal', points: number) => {
    try {
      // 현재 포인트 가져오기
      const { data: currentPoints } = await supabase
        .from('user_growth_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (currentPoints) {
        // 기존 데이터 업데이트
        const updateData: any = { last_activity_date: new Date().toISOString().split('T')[0] };
        updateData[`${pointType}_points`] = (currentPoints[`${pointType}_points`] || 0) + points;

        await supabase
          .from('user_growth_points')
          .update(updateData)
          .eq('user_id', userId);
      } else {
        // 새 데이터 생성
        const insertData: any = {
          user_id: userId,
          story_points: pointType === 'story' ? points : 0,
          challenge_points: pointType === 'challenge' ? points : 0,
          reversal_points: pointType === 'reversal' ? points : 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        };

        await supabase
          .from('user_growth_points')
          .insert(insertData);
      }
    } catch (error) {
      console.error('Failed to update growth points:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "mindfulness": return <Brain className="w-5 h-5" />;
      case "stress": return <Target className="w-5 h-5" />;
      case "energy": return <Zap className="w-5 h-5" />;
      case "positivity": return <Star className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "mindfulness": return "text-purple-600 bg-purple-100";
      case "stress": return "text-red-600 bg-red-100";
      case "energy": return "text-yellow-600 bg-yellow-100";
      case "positivity": return "text-green-600 bg-green-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움": return "text-green-600 bg-green-100";
      case "보통": return "text-yellow-600 bg-yellow-100";
      case "어려움": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === "featured") return true;
    if (activeTab === "my") return challenge.is_joined;
    if (activeTab === "completed") return challenge.is_joined && challenge.progress === 100;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <TypingAnimation 
                phrases={["30일 마인드 챌린지", "Mind Growth Challenge", "Wellness Journey"]}
                className="text-gradient"
              />
            </h1>
            <p className="text-lg text-muted-foreground">
              함께 도전하고 성장하는 마음 건강 여행
            </p>
          </div>

          {/* User Level Display */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
              <CardHeader>
                <CardTitle className="text-lg">내 성장 레벨</CardTitle>
              </CardHeader>
              <CardContent>
                <UserLevelDisplay totalPoints={userPoints} />
              </CardContent>
            </Card>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">내 포인트</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{userPoints}P</div>
                <p className="text-xs text-yellow-600">활동으로 점수 획득!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">참여 중인 챌린지</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{challenges.filter(c => c.is_joined).length}</div>
                <p className="text-xs text-muted-foreground">현재 진행 중</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">완료한 챌린지</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{challenges.filter(c => c.progress === 100).length}</div>
                <p className="text-xs text-muted-foreground">성공적으로 완주</p>
              </CardContent>
            </Card>
          </div>

          {/* Challenge Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="featured">추천 챌린지</TabsTrigger>
              <TabsTrigger value="my">내 챌린지</TabsTrigger>
              <TabsTrigger value="completed">완료한 챌린지</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredChallenges.map((challenge) => (
                  <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(challenge.category)}>
                            {getCategoryIcon(challenge.category)}
                            {challenge.category}
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <Badge variant="secondary">
                          {challenge.duration_days}일
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress for joined challenges */}
                        {challenge.is_joined && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>진행률</span>
                              <span>{challenge.progress}%</span>
                            </div>
                            <Progress value={challenge.progress} className="h-2" />
                          </div>
                        )}

                        {/* Challenge Stats */}
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants_count.toLocaleString()}명 참여
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {challenge.reward_points}P
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          완주율: {challenge.completion_rate}%
                        </div>

                        {/* Action Button */}
                        {challenge.is_joined ? (
                          <Button variant="outline" className="w-full" disabled>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            참여 중
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleJoinChallenge(challenge.id)}
                            className="w-full"
                          >
                            챌린지 시작하기
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredChallenges.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">해당하는 챌린지가 없습니다.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;