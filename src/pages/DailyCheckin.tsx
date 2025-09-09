import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Brain, Zap, CheckCircle, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { TypingAnimation } from "@/components/ui/typing-animation";

const DailyCheckin = () => {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [checkinComplete, setCheckinComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const moodEmojis = ["😢", "😕", "😐", "😊", "😁"];
  const energyEmojis = ["🔋", "⚡", "🔥", "💪", "🚀"];
  const stressEmojis = ["😌", "😴", "😐", "😰", "🤯"];

  useEffect(() => {
    checkTodayCheckin();
    loadStreak();
  }, []);

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

    setLoading(true);
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
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <TypingAnimation 
                phrases={["오늘의 마음 체크인", "Daily Mind Check-in", "Today's Wellness"]}
                className="text-gradient"
              />
            </h1>
            <p className="text-lg text-muted-foreground">
              매일 3분, 내 마음 상태를 기록하고 성장해요
            </p>
          </div>

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
                  onClick={() => window.location.href = '/growth-tracker'} 
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
                disabled={loading || mood === null || energy === null || stress === null}
                className="w-full h-14 text-lg"
              >
                {loading ? "저장 중..." : "오늘 체크인 완료하기"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyCheckin;