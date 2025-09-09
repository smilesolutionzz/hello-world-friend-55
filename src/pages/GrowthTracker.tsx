import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Target, Award, Heart, Zap, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { TypingAnimation } from "@/components/ui/typing-animation";

const GrowthTracker = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalDays: 0,
    avgMood: 0,
    avgEnergy: 0,
    avgStress: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrowthData();
  }, []);

  const loadGrowthData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('daily_checkins' as any)
      .select('*')
      .eq('user_id', user.id)
      .gte('checkin_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('checkin_date', { ascending: true });

    if (data) {
      // Process weekly data for charts
      const processedData = data.map((item: any) => ({
        date: new Date((item as any).checkin_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        mood: (item as any).mood_score,
        energy: (item as any).energy_level,
        stress: 6 - (item as any).stress_level, // Invert stress so higher is better
        wellness: Math.round(((item as any).mood_score + (item as any).energy_level + (6 - (item as any).stress_level)) / 3)
      }));

      setWeeklyData(processedData);

      // Calculate monthly stats
      const totalDays = data.length;
      const avgMood = data.reduce((sum: number, item: any) => sum + item.mood_score, 0) / totalDays;
      const avgEnergy = data.reduce((sum: number, item: any) => sum + item.energy_level, 0) / totalDays;
      const avgStress = data.reduce((sum: number, item: any) => sum + item.stress_level, 0) / totalDays;

      // Calculate current streak
      let streak = 0;
      const today = new Date();
      for (let i = data.length - 1; i >= 0; i--) {
        const checkinDate = new Date((data[i] as any).checkin_date);
        const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === (data.length - 1 - i)) {
          streak++;
        } else {
          break;
        }
      }

      setMonthlyStats({
        totalDays,
        avgMood: Math.round(avgMood * 10) / 10,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        streak
      });
    }

    setLoading(false);
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
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <TypingAnimation 
                phrases={["성장 추적 대시보드", "Growth Tracker", "Wellness Journey"]}
                className="text-gradient"
              />
            </h1>
            <p className="text-lg text-muted-foreground">
              내 마음의 변화와 성장을 한눈에 확인하세요
            </p>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default GrowthTracker;