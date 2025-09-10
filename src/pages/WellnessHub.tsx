import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, Heart, Brain, Zap, CheckCircle, Flame, 
  Trophy, Target, Users, Star, TrendingUp, Award,
  LineChart as LineChartIcon, BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { TypingAnimation } from "@/components/ui/typing-animation";

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

const WellnessHub = () => {
  const [activeTab, setActiveTab] = useState("checkin");
  const { toast } = useToast();

  // Daily Check-in States
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [checkinComplete, setCheckinComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [checkinLoading, setCheckinLoading] = useState(false);

  // Challenges States
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [challengesLoading, setChallengesLoading] = useState(true);

  // Growth Tracker States
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalDays: 0,
    avgMood: 0,
    avgEnergy: 0,
    avgStress: 0,
    streak: 0
  });
  const [trackerLoading, setTrackerLoading] = useState(true);

  const moodEmojis = ["😢", "😕", "😐", "😊", "😁"];
  const energyEmojis = ["🔋", "⚡", "🔥", "💪", "🚀"];
  const stressEmojis = ["😌", "😴", "😐", "😰", "🤯"];

  // Mock challenges data
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
    }
  ];

  useEffect(() => {
    checkTodayCheckin();
    loadStreak();
    loadChallenges();
    loadUserPoints();
    loadGrowthData();
  }, []);

  // Daily Check-in Functions
  const checkTodayCheckin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_checkins' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .maybeSingle();

    if (data) {
      setCheckinComplete(true);
      setMood((data as any).mood_score);
      setEnergy((data as any).energy_level);
      setStress((data as any).stress_level);
    }
  };

  const loadStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('daily_checkins' as any)
      .select('checkin_date')
      .eq('user_id', user.id)
      .order('checkin_date', { ascending: false });

    if (data) {
      let currentStreak = 0;
      const today = new Date();
      
      for (let i = 0; i < data.length; i++) {
        const checkinDate = new Date((data[i] as any).checkin_date);
        const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    }
  };

  const handleSubmitCheckin = async () => {
    if (mood === null || energy === null || stress === null) {
      toast({
        title: "체크인 미완료",
        description: "모든 항목을 체크해주세요!",
        variant: "destructive",
      });
      return;
    }

    setCheckinLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('daily_checkins' as any)
      .upsert({
        user_id: user.id,
        checkin_date: new Date().toISOString().split('T')[0],
        mood_score: mood,
        energy_level: energy,
        stress_level: stress,
      });

    if (error) {
      toast({
        title: "오류 발생",
        description: "체크인 저장에 실패했습니다.",
        variant: "destructive",
      });
    } else {
      setCheckinComplete(true);
      setStreak(prev => prev + 1);
      toast({
        title: "체크인 완료! 🎉",
        description: `${streak + 1}일 연속 체크인 달성!`,
      });
    }
    setCheckinLoading(false);
  };

  // Challenges Functions
  const loadChallenges = async () => {
    setChallenges(mockChallenges);
    setChallengesLoading(false);
  };

  const loadUserPoints = async () => {
    setUserPoints(450);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const updatedChallenges = challenges.map(challenge =>
      challenge.id === challengeId 
        ? { ...challenge, is_joined: true, participants_count: challenge.participants_count + 1 }
        : challenge
    );
    setChallenges(updatedChallenges);

    toast({
      title: "챌린지 참가 완료! 🎉",
      description: "오늘부터 새로운 도전을 시작해보세요!",
    });
  };

  // Growth Tracker Functions
  const loadGrowthData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('daily_checkins' as any)
      .select('*')
      .eq('user_id', user.id)
      .gte('checkin_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('checkin_date', { ascending: true });

    if (data) {
      const processedData = data.map((item: any) => ({
        date: new Date((item as any).checkin_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        mood: (item as any).mood_score,
        energy: (item as any).energy_level,
        stress: 6 - (item as any).stress_level,
        wellness: Math.round(((item as any).mood_score + (item as any).energy_level + (6 - (item as any).stress_level)) / 3)
      }));

      setWeeklyData(processedData);

      const totalDays = data.length;
      const avgMood = data.reduce((sum: number, item: any) => sum + item.mood_score, 0) / totalDays;
      const avgEnergy = data.reduce((sum: number, item: any) => sum + item.energy_level, 0) / totalDays;
      const avgStress = data.reduce((sum: number, item: any) => sum + item.stress_level, 0) / totalDays;

      setMonthlyStats({
        totalDays,
        avgMood: Math.round(avgMood * 10) / 10,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        streak
      });
    }

    setTrackerLoading(false);
  };

  // Helper Functions
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

  const getWellnessLevel = (score: number) => {
    if (score >= 4.5) return { label: "훌륭함", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 3.5) return { label: "좋음", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 2.5) return { label: "보통", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "관리필요", color: "text-red-600", bg: "bg-red-100" };
  };

  const overallWellness = (monthlyStats.avgMood + monthlyStats.avgEnergy + (6 - monthlyStats.avgStress)) / 3;
  const wellnessStatus = getWellnessLevel(overallWellness);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <TypingAnimation 
                phrases={["웰니스 허브", "Wellness Hub", "마음 건강 센터"]}
                className="text-gradient"
              />
            </h1>
            <p className="text-lg text-muted-foreground">
              매일체크, 챌린지, 성장추적을 한 곳에서
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="checkin" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                매일체크
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                챌린지
              </TabsTrigger>
              <TabsTrigger value="tracker" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                성장추적
              </TabsTrigger>
            </TabsList>

            {/* Daily Check-in Tab */}
            <TabsContent value="checkin" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                {/* Streak Badge */}
                <div className="flex justify-center mb-8">
                  <Badge variant="secondary" className="text-lg px-6 py-2">
                    <Flame className="w-5 h-5 mr-2 text-orange-500" />
                    {streak}일 연속 체크인
                  </Badge>
                </div>

                {checkinComplete ? (
                  /* Completed State */
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <CardTitle className="text-2xl text-green-700">오늘 체크인 완료!</CardTitle>
                      <CardDescription className="text-green-600">
                        {streak}일 연속으로 꾸준히 기록하고 계시네요! 🎉
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/50 rounded-lg p-4">
                          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">기분</p>
                          <p className="text-2xl">{moodEmojis[mood! - 1]}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-4">
                          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">에너지</p>
                          <p className="text-2xl">{energyEmojis[energy! - 1]}</p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-4">
                          <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">스트레스</p>
                          <p className="text-2xl">{stressEmojis[stress! - 1]}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setActiveTab('tracker')} 
                        className="w-full"
                      >
                        성장 기록 보러가기
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  /* Check-in Form */
                  <div className="space-y-8">
                    {/* Mood */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-pink-500" />
                          오늘 기분은 어떠세요?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between gap-2">
                          {moodEmojis.map((emoji, index) => (
                            <Button
                              key={index}
                              variant={mood === index + 1 ? "default" : "outline"}
                              className="flex-1 h-16 text-2xl"
                              onClick={() => setMood(index + 1)}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Energy */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-500" />
                          에너지 레벨은?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between gap-2">
                          {energyEmojis.map((emoji, index) => (
                            <Button
                              key={index}
                              variant={energy === index + 1 ? "default" : "outline"}
                              className="flex-1 h-16 text-2xl"
                              onClick={() => setEnergy(index + 1)}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stress */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-500" />
                          스트레스 정도는?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between gap-2">
                          {stressEmojis.map((emoji, index) => (
                            <Button
                              key={index}
                              variant={stress === index + 1 ? "default" : "outline"}
                              className="flex-1 h-16 text-2xl"
                              onClick={() => setStress(index + 1)}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Button 
                      onClick={handleSubmitCheckin} 
                      disabled={checkinLoading || mood === null || energy === null || stress === null}
                      className="w-full h-14 text-lg"
                    >
                      {checkinLoading ? "저장 중..." : "오늘 체크인 완료하기"}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">내 포인트</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-700">{userPoints}P</div>
                    <p className="text-xs text-yellow-600">챌린지 완주로 포인트 획득!</p>
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

              {/* Challenges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((challenge) => (
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
            </TabsContent>

            {/* Growth Tracker Tab */}
            <TabsContent value="tracker" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">연속 기록</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{monthlyStats.streak}일</div>
                    <p className="text-xs text-muted-foreground">
                      총 {monthlyStats.totalDays}일 기록
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">평균 기분</CardTitle>
                    <Heart className="h-4 w-4 text-pink-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{monthlyStats.avgMood}/5</div>
                    <Progress value={(monthlyStats.avgMood / 5) * 100} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">평균 에너지</CardTitle>
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{monthlyStats.avgEnergy}/5</div>
                    <Progress value={(monthlyStats.avgEnergy / 5) * 100} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">웰니스 점수</CardTitle>
                    <Award className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(overallWellness * 10) / 10}/5</div>
                    <Badge className={`${wellnessStatus.bg} ${wellnessStatus.color} border-0`}>
                      {wellnessStatus.label}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Tabs defaultValue="trends" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="trends">변화 추이</TabsTrigger>
                  <TabsTrigger value="wellness">웰니스 스코어</TabsTrigger>
                  <TabsTrigger value="comparison">비교 분석</TabsTrigger>
                </TabsList>

                <TabsContent value="trends" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        일별 변화 추이 (최근 30일)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[1, 5]} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="mood" 
                            stroke="#ec4899" 
                            strokeWidth={2} 
                            name="기분"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="energy" 
                            stroke="#eab308" 
                            strokeWidth={2} 
                            name="에너지"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="stress" 
                            stroke="#8b5cf6" 
                            strokeWidth={2} 
                            name="스트레스 관리"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="wellness" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>전체 웰니스 스코어</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[1, 5]} />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="wellness" 
                            stroke="#06b6d4" 
                            fill="#06b6d4" 
                            fillOpacity={0.3}
                            name="웰니스 스코어"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>주간 평균 비교</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={weeklyData.slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[1, 5]} />
                          <Tooltip />
                          <Bar dataKey="mood" fill="#ec4899" name="기분" />
                          <Bar dataKey="energy" fill="#eab308" name="에너지" />
                          <Bar dataKey="stress" fill="#8b5cf6" name="스트레스 관리" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WellnessHub;