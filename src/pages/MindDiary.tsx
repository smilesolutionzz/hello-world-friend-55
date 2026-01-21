import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, 
  Gift, 
  Users, 
  Share2, 
  Crown, 
  AlertTriangle,
  Phone,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { motion, AnimatePresence } from "framer-motion";

// 10초 이모지 입력 - 습관 형성 핵심
const MOOD_OPTIONS = [
  { emoji: "😊", label: "행복해", value: 5, color: "from-green-400 to-emerald-500" },
  { emoji: "😐", label: "그냥그래", value: 3, color: "from-yellow-400 to-amber-500" },
  { emoji: "😔", label: "우울해", value: 2, color: "from-blue-400 to-indigo-500" },
  { emoji: "😰", label: "불안해", value: 1, color: "from-orange-400 to-red-500" },
  { emoji: "😢", label: "힘들어", value: 0, color: "from-purple-400 to-pink-500" },
];

const MindDiary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [todayComplete, setTodayComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 오늘 체크인 확인
    const today = new Date().toISOString().split('T')[0];
    const { data: todayData } = await supabase
      .from('daily_checkins' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .maybeSingle();

    if (todayData) {
      setTodayComplete(true);
      setSelectedMood((todayData as any).mood_score);
    }

    // 연속 기록 계산
    const { data: allData } = await supabase
      .from('daily_checkins' as any)
      .select('checkin_date')
      .eq('user_id', user.id)
      .order('checkin_date', { ascending: false });

    if (allData) {
      setTotalEntries(allData.length);
      
      let currentStreak = 0;
      const now = new Date();
      for (let i = 0; i < allData.length; i++) {
        const expected = new Date(now);
        expected.setDate(now.getDate() - i);
        const checkinDate = new Date((allData[i] as any).checkin_date);
        
        if (checkinDate.toDateString() === expected.toDateString()) {
          currentStreak++;
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    }

    // 친구 초대 수 (추천인 수)
    const { data: referrals } = await supabase
      .from('referral_rewards' as any)
      .select('id')
      .eq('referrer_id', user.id);
    
    if (referrals) {
      setFriendCount(referrals.length);
    }
  };

  const handleMoodSelect = async (mood: typeof MOOD_OPTIONS[0]) => {
    if (todayComplete) return;
    
    setSelectedMood(mood.value);
    setLoading(true);

    // 위기 감지 (힘들어 선택 시)
    if (mood.value <= 1) {
      setShowCrisisAlert(true);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // 비회원도 체험 가능 - 하지만 저장 안됨
      toast({
        title: "마음 기록 완료! 💙",
        description: "회원가입하면 기록이 저장되고 친구 초대 보상도 받아요!",
      });
      setLoading(false);
      setTodayComplete(true);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('daily_checkins' as any)
      .upsert({
        user_id: user.id,
        checkin_date: today,
        mood_score: mood.value,
        energy_level: 3,
        stress_level: mood.value <= 2 ? 4 : 2,
      });

    if (!error) {
      setTodayComplete(true);
      setStreak(prev => prev + 1);
      setTotalEntries(prev => prev + 1);
      
      toast({
        title: `${streak + 1}일 연속 기록! 🔥`,
        description: streak >= 6 ? "7일 달성하면 프리미엄 3일 무료!" : "계속해서 기록해보세요!",
      });
    }
    
    setLoading(false);
  };

  const handleShareInvite = async () => {
    const shareUrl = `${window.location.origin}?ref=${user?.id?.slice(0, 8) || 'guest'}`;
    
    if (navigator.share) {
      await navigator.share({
        title: '마음일기 - 하루 10초 마음 체크',
        text: '친구야, 같이 마음 기록하자! 🫶',
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "링크 복사 완료!",
        description: "친구에게 공유하면 둘 다 보상 받아요 💝",
      });
    }
  };

  const handleCrisisHelp = () => {
    window.open('tel:1388', '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-6 pb-24 max-w-md">
        {/* 헤더 - 스트릭 강조 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-4 py-2 border-0">
              <Flame className="w-5 h-5 mr-2" />
              {streak}일 연속
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            오늘 기분 어때? 💭
          </h1>
          <p className="text-slate-400 text-sm">
            10초면 충분해요
          </p>
        </motion.div>

        {/* 메인 - 이모지 선택 (Product Hook) */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6 overflow-hidden">
          <CardContent className="p-6">
            {todayComplete ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">
                  {MOOD_OPTIONS.find(m => m.value === selectedMood)?.emoji || "✅"}
                </div>
                <p className="text-xl font-bold text-white mb-2">오늘 기록 완료!</p>
                <p className="text-slate-400 text-sm">내일 다시 와서 기록해줘 🫶</p>
                
                <div className="mt-6 p-4 bg-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">7일 연속 달성까지</span>
                    <span className="text-primary font-bold">{Math.max(0, 7 - streak)}일 남음</span>
                  </div>
                  <Progress value={(streak / 7) * 100} className="mt-2 h-2" />
                  <p className="text-xs text-slate-500 mt-2">
                    🎁 7일 달성 시 프리미엄 3일 무료!
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-5 gap-3">
                {MOOD_OPTIONS.map((mood, index) => (
                  <motion.button
                    key={mood.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleMoodSelect(mood)}
                    disabled={loading}
                    className={`
                      flex flex-col items-center p-3 rounded-2xl transition-all
                      ${selectedMood === mood.value 
                        ? `bg-gradient-to-br ${mood.color} scale-110 shadow-lg` 
                        : 'bg-slate-700/50 hover:bg-slate-600/50 active:scale-95'}
                    `}
                  >
                    <span className="text-3xl mb-1">{mood.emoji}</span>
                    <span className="text-xs text-slate-300 whitespace-nowrap">{mood.label}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 위기 감지 알림 */}
        <AnimatePresence>
          {showCrisisAlert && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">
                        힘든 시간을 보내고 있구나 💙
                      </p>
                      <p className="text-slate-300 text-sm mb-3">
                        혼자 감당하지 않아도 돼. 24시간 전문 상담사가 기다리고 있어.
                      </p>
                      <Button 
                        onClick={handleCrisisHelp}
                        className="w-full bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        1388 청소년전화 연결
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 친구 초대 (Distribution Hook) */}
        <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">친구 초대하기</p>
                  <p className="text-slate-400 text-xs">
                    {friendCount > 0 ? `${friendCount}명 초대 완료!` : '초대하면 둘 다 보상!'}
                  </p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleShareInvite}
                className="bg-primary/20 hover:bg-primary/30 text-primary"
              >
                <Share2 className="w-4 h-4 mr-1" />
                초대
              </Button>
            </div>
            
            {friendCount >= 3 && (
              <div className="mt-3 p-2 bg-green-500/20 rounded-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs">프리미엄 7일 무료 혜택 달성!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{streak}</p>
              <p className="text-xs text-slate-400">연속</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{totalEntries}</p>
              <p className="text-xs text-slate-400">총 기록</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{friendCount}</p>
              <p className="text-xs text-slate-400">친구</p>
            </CardContent>
          </Card>
        </div>

        {/* 부모 연결 (Moat - 수익화) */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/30 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">부모님 연결하기</p>
                  <p className="text-slate-400 text-xs">주간 리포트 받기</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/parent-connect')}
                className="text-amber-400 hover:text-amber-300"
              >
                연결 <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 비회원 가입 유도 */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent"
          >
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full h-12 bg-gradient-to-r from-primary to-purple-500 text-white font-bold"
            >
              무료 회원가입하고 기록 저장하기
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MindDiary;
