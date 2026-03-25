import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Target, Award, Heart, Zap, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useLanguage } from "@/i18n/LanguageContext";

const GrowthTracker = () => {
  const { isEnglish } = useLanguage();
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ totalDays: 0, avgMood: 0, avgEnergy: 0, avgStress: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGrowthData(); }, []);

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
        date: new Date((item as any).checkin_date).toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', { month: 'short', day: 'numeric' }),
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

      let streak = 0;
      const today = new Date();
      for (let i = data.length - 1; i >= 0; i--) {
        const checkinDate = new Date((data[i] as any).checkin_date);
        const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === (data.length - 1 - i)) streak++;
        else break;
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
    if (score >= 4.5) return { label: isEnglish ? "Excellent" : "훌륭함", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 3.5) return { label: isEnglish ? "Good" : "좋음", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 2.5) return { label: isEnglish ? "Average" : "보통", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: isEnglish ? "Needs Attention" : "관리필요", color: "text-red-600", bg: "bg-red-100" };
  };

  const overallWellness = (monthlyStats.avgMood + monthlyStats.avgEnergy + (6 - monthlyStats.avgStress)) / 3;
  const wellnessStatus = getWellnessLevel(overallWellness);

  const moodLabel = isEnglish ? 'Mood' : '기분';
  const energyLabel = isEnglish ? 'Energy' : '에너지';
  const stressLabel = isEnglish ? 'Stress Mgmt' : '스트레스 관리';

  return (
    <div className="min-h-screen bg-modern">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <TypingAnimation 
                phrases={isEnglish ? ["Growth Tracker", "Wellness Journey"] : ["성장 추적 대시보드", "Growth Tracker", "Wellness Journey"]}
                className="text-gradient"
              />
            </h1>
            <p className="text-lg text-muted-foreground">
              {isEnglish ? 'Track your mental wellness and growth at a glance' : '내 마음의 변화와 성장을 한눈에 확인하세요'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{isEnglish ? 'Streak' : '연속 기록'}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.streak}{isEnglish ? ' days' : '일'}</div>
                <p className="text-xs text-muted-foreground">{isEnglish ? `${monthlyStats.totalDays} days total` : `총 ${monthlyStats.totalDays}일 기록`}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{isEnglish ? 'Avg Mood' : '평균 기분'}</CardTitle>
                <Heart className="h-4 w-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.avgMood}/5</div>
                <Progress value={(monthlyStats.avgMood / 5) * 100} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{isEnglish ? 'Avg Energy' : '평균 에너지'}</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.avgEnergy}/5</div>
                <Progress value={(monthlyStats.avgEnergy / 5) * 100} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{isEnglish ? 'Wellness Score' : '웰니스 점수'}</CardTitle>
                <Award className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(overallWellness * 10) / 10}/5</div>
                <Badge className={`${wellnessStatus.bg} ${wellnessStatus.color} border-0`}>{wellnessStatus.label}</Badge>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends">{isEnglish ? 'Trends' : '변화 추이'}</TabsTrigger>
              <TabsTrigger value="wellness">{isEnglish ? 'Wellness Score' : '웰니스 스코어'}</TabsTrigger>
              <TabsTrigger value="comparison">{isEnglish ? 'Comparison' : '비교 분석'}</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {isEnglish ? 'Daily Trends (Last 30 Days)' : '일별 변화 추이 (최근 30일)'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} name={moodLabel} />
                      <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={2} name={energyLabel} />
                      <Line type="monotone" dataKey="stress" stroke="#8b5cf6" strokeWidth={2} name={stressLabel} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wellness" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>{isEnglish ? 'Overall Wellness Score' : '전체 웰니스 스코어'}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="wellness" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} name={isEnglish ? 'Wellness Score' : '웰니스 스코어'} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>{isEnglish ? 'Weekly Average Comparison' : '주간 평균 비교'}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={weeklyData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Bar dataKey="mood" fill="#ec4899" name={moodLabel} />
                      <Bar dataKey="energy" fill="#eab308" name={energyLabel} />
                      <Bar dataKey="stress" fill="#8b5cf6" name={stressLabel} />
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
