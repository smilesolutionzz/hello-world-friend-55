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

const LifeCareHub = () => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">라이프케어 허브</h2>
          <p className="text-muted-foreground">일상 관리와 성장을 위한 통합 대시보드</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          {streak}일 연속
        </Badge>
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
              <div className="space-y-6">
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
                  disabled={mood === null || energy === null || stress === null || checkinLoading}
                  className="w-full h-12 text-lg"
                >
                  {checkinLoading ? "저장 중..." : "오늘의 체크인 완료하기"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          {/* Points and Progress Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">현재 포인트</h3>
                    <p className="text-3xl font-bold text-primary">{userPoints}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Level 3
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <div>
            <h3 className="text-lg font-semibold mb-4">참여 중인 챌린지</h3>
            <div className="space-y-4">
              {challenges.filter(c => c.is_joined).map(challenge => (
                <Card key={challenge.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(challenge.category)}`}>
                          {getCategoryIcon(challenge.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>진행률</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                      <span>{challenge.duration_days}일 챌린지</span>
                      <span>{challenge.reward_points} 포인트</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Available Challenges */}
          <div>
            <h3 className="text-lg font-semibold mb-4">추천 챌린지</h3>
            <div className="space-y-4">
              {challenges.filter(c => !c.is_joined).map(challenge => (
                <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(challenge.category)}`}>
                          {getCategoryIcon(challenge.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {challenge.participants_count.toLocaleString()}명 참여
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        완주율 {challenge.completion_rate}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {challenge.reward_points} 포인트
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="w-full"
                    >
                      챌린지 시작하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Growth Tracker Tab */}
        <TabsContent value="tracker" className="space-y-6">
          {/* Monthly Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{monthlyStats.totalDays}</p>
                <p className="text-sm text-muted-foreground">체크인 일수</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{monthlyStats.avgMood}</p>
                <p className="text-sm text-muted-foreground">평균 기분</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{monthlyStats.avgEnergy}</p>
                <p className="text-sm text-muted-foreground">평균 에너지</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{monthlyStats.avgStress}</p>
                <p className="text-sm text-muted-foreground">평균 스트레스</p>
              </CardContent>
            </Card>
          </div>

          {/* Overall Wellness Status */}
          <Card>
            <CardHeader>
              <CardTitle>전체 라이프케어 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallWellness.toFixed(1)}/5</p>
                  <Badge className={`${wellnessStatus.bg} ${wellnessStatus.color}`}>
                    {wellnessStatus.label}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">지난 30일 평균</p>
                  <p className="text-sm text-muted-foreground">총 {monthlyStats.totalDays}일 기록</p>
                </div>
              </div>
              <Progress value={(overallWellness / 5) * 100} className="h-3" />
            </CardContent>
          </Card>

          {/* 30-Day Trend Chart */}
          {weeklyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>30일 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#f472b6" 
                        strokeWidth={2}
                        name="기분"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#facc15" 
                        strokeWidth={2}
                        name="에너지"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        name="스트레스 (역순)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LifeCareHub;