import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Brain, Zap, CheckCircle, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useLanguage } from "@/i18n/LanguageContext";

const DailyCheckin = () => {
  const navigate = useNavigate();
  const { isEnglish, localePath } = useLanguage();
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

  useEffect(() => { checkTodayCheckin(); loadStreak(); }, []);

  const checkTodayCheckin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate(localePath('/mind-diary')); return; }
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.from('daily_checkins' as any).select('*').eq('user_id', user.id).eq('checkin_date', today).maybeSingle();
      if (error) { console.error('Checkin load error:', error); navigate(localePath('/mind-diary')); return; }
      if (data) { setCheckinComplete(true); setMood((data as any).mood_score); setEnergy((data as any).energy_level); setStress((data as any).stress_level); }
    } catch (err) { console.error('Checkin error:', err); navigate(localePath('/mind-diary')); }
  };

  const loadStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('daily_checkins' as any).select('checkin_date').eq('user_id', user.id).order('checkin_date', { ascending: false });
    if (data) {
      let currentStreak = 0;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      for (let dayOffset = 0; dayOffset < data.length; dayOffset++) {
        const expected = new Date(today); expected.setDate(today.getDate() - dayOffset);
        const hasCheckin = data.some(c => new Date((c as any).checkin_date).toDateString() === expected.toDateString());
        if (hasCheckin) currentStreak++; else break;
      }
      setStreak(currentStreak);
    }
  };

  const handleSubmitCheckin = async () => {
    if (mood === null || energy === null || stress === null) {
      toast({ title: isEnglish ? "Incomplete" : "체크인 미완료", description: isEnglish ? "Please check all items!" : "모든 항목을 체크해주세요!", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('daily_checkins' as any).upsert({ user_id: user.id, checkin_date: today, mood_score: mood, energy_level: energy, stress_level: stress });
    if (error) { console.error('Checkin save error:', error); navigate(localePath('/mind-diary')); return; }
    await loadStreak();
    await updateGrowthPoints(user.id, 'story', 1);
    setCheckinComplete(true);
    toast({ title: isEnglish ? "Check-in complete! 🎉" : "체크인 완료! 🎉", description: isEnglish ? `${streak + 1}-day streak! +1 point earned!` : `${streak + 1}일 연속 체크인 달성! +1점 획득!` });
    setLoading(false);
  };

  const updateGrowthPoints = async (userId: string, pointType: 'story' | 'challenge' | 'reversal', points: number) => {
    try {
      const { data: currentPoints } = await supabase.from('user_growth_points').select('*').eq('user_id', userId).single();
      if (currentPoints) {
        const updateData: any = { last_activity_date: new Date().toISOString().split('T')[0] };
        updateData[`${pointType}_points`] = (currentPoints[`${pointType}_points`] || 0) + points;
        await supabase.from('user_growth_points').update(updateData).eq('user_id', userId);
      } else {
        await supabase.from('user_growth_points').insert({
          user_id: userId,
          story_points: pointType === 'story' ? points : 0,
          challenge_points: pointType === 'challenge' ? points : 0,
          reversal_points: pointType === 'reversal' ? points : 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) { console.error('Failed to update growth points:', error); }
  };

  return (
    <div className="min-h-screen bg-modern">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <TypingAnimation 
                phrases={isEnglish ? ["Daily Mind Check-in", "Today's Wellness"] : ["오늘의 마음 체크인", "Daily Mind Check-in"]}
                className="text-gradient"
              />
            </h1>
            <p className="text-lg text-muted-foreground">
              {isEnglish ? '3 minutes a day to track and grow your mental wellness' : '매일 3분, 내 마음 상태를 기록하고 성장해요'}
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              {isEnglish ? `${streak}-day streak` : `${streak}일 연속 체크인`}
            </Badge>
          </div>

          {checkinComplete ? (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-700">{isEnglish ? "Today's check-in complete!" : '오늘 체크인 완료!'}</CardTitle>
                <CardDescription className="text-green-600">
                  {isEnglish ? `You've been consistent for ${streak} days! 🎉` : `${streak}일 연속으로 꾸준히 기록하고 계시네요! 🎉`}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/50 rounded-lg p-4">
                    <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{isEnglish ? 'Mood' : '기분'}</p>
                    <p className="text-2xl">{moodEmojis[mood! - 1]}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{isEnglish ? 'Energy' : '에너지'}</p>
                    <p className="text-2xl">{energyEmojis[energy! - 1]}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{isEnglish ? 'Stress' : '스트레스'}</p>
                    <p className="text-2xl">{stressEmojis[stress! - 1]}</p>
                  </div>
                </div>
                <Button onClick={() => window.location.href = localePath('/growth-tracker')} className="w-full">
                  {isEnglish ? 'View Growth Tracker' : '성장 기록 보러가기'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    {isEnglish ? 'How are you feeling today?' : '오늘 기분은 어떠세요?'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between gap-2">
                    {moodEmojis.map((emoji, index) => (
                      <Button key={index} variant={mood === index + 1 ? "default" : "outline"} className="flex-1 h-16 text-2xl" onClick={() => setMood(index + 1)}>{emoji}</Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    {isEnglish ? 'Energy level?' : '에너지 레벨은?'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between gap-2">
                    {energyEmojis.map((emoji, index) => (
                      <Button key={index} variant={energy === index + 1 ? "default" : "outline"} className="flex-1 h-16 text-2xl" onClick={() => setEnergy(index + 1)}>{emoji}</Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    {isEnglish ? 'Stress level?' : '스트레스 정도는?'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between gap-2">
                    {stressEmojis.map((emoji, index) => (
                      <Button key={index} variant={stress === index + 1 ? "default" : "outline"} className="flex-1 h-16 text-2xl" onClick={() => setStress(index + 1)}>{emoji}</Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSubmitCheckin} disabled={loading || mood === null || energy === null || stress === null} className="w-full h-14 text-lg">
                {loading ? (isEnglish ? "Saving..." : "저장 중...") : (isEnglish ? "Complete Today's Check-in" : "오늘 체크인 완료하기")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyCheckin;
