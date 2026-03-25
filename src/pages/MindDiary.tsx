import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Flame, Gift, Users, Share2, Crown, AlertTriangle, Bot, MessageSquare, Phone,
  ChevronRight, Sparkles, TrendingUp, Shuffle, Send, MessageCircle, ArrowLeft,
  CheckCircle, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { UrgentExpertConnect } from "@/components/crisis/UrgentExpertConnect";
import { useLanguage } from "@/i18n/LanguageContext";

const MOOD_OPTIONS_KO = [
  { emoji: "😊", label: "행복해", value: 5, color: "from-green-400 to-emerald-500" },
  { emoji: "😐", label: "그냥그래", value: 3, color: "from-yellow-400 to-amber-500" },
  { emoji: "😔", label: "우울해", value: 2, color: "from-blue-400 to-indigo-500" },
  { emoji: "😰", label: "불안해", value: 1, color: "from-orange-400 to-red-500" },
  { emoji: "😢", label: "힘들어", value: 0, color: "from-purple-400 to-pink-500" },
];

const MOOD_OPTIONS_EN = [
  { emoji: "😊", label: "Happy", value: 5, color: "from-green-400 to-emerald-500" },
  { emoji: "😐", label: "Meh", value: 3, color: "from-yellow-400 to-amber-500" },
  { emoji: "😔", label: "Down", value: 2, color: "from-blue-400 to-indigo-500" },
  { emoji: "😰", label: "Anxious", value: 1, color: "from-orange-400 to-red-500" },
  { emoji: "😢", label: "Struggling", value: 0, color: "from-purple-400 to-pink-500" },
];

const DAILY_QUESTIONS_KO = [
  { q: "오늘 가장 웃긴 일은 뭐였어?", emoji: "😂" },
  { q: "지금 듣고 싶은 노래 있어?", emoji: "🎵" },
  { q: "오늘 누구랑 얘기했어?", emoji: "💬" },
  { q: "요즘 빠진 거 있어?", emoji: "🎮" },
  { q: "오늘 맛있게 먹은 거 있어?", emoji: "🍜" },
  { q: "지금 하고 싶은 거 있어?", emoji: "✨" },
  { q: "오늘 짜증났던 일 있어?", emoji: "😤" },
  { q: "요즘 기대되는 일 있어?", emoji: "🎉" },
  { q: "친구한테 하고 싶은 말 있어?", emoji: "💭" },
  { q: "오늘 나에게 한마디?", emoji: "💪" },
  { q: "요즘 보는 유튜브/틱톡 있어?", emoji: "📱" },
  { q: "오늘 학교/집에서 뭐했어?", emoji: "🏠" },
];

const DAILY_QUESTIONS_EN = [
  { q: "What was the funniest thing today?", emoji: "😂" },
  { q: "Any song you want to listen to?", emoji: "🎵" },
  { q: "Who did you talk to today?", emoji: "💬" },
  { q: "What are you into lately?", emoji: "🎮" },
  { q: "Eat anything good today?", emoji: "🍜" },
  { q: "What do you feel like doing now?", emoji: "✨" },
  { q: "Anything annoying happen today?", emoji: "😤" },
  { q: "Anything exciting coming up?", emoji: "🎉" },
  { q: "What would you say to a friend?", emoji: "💭" },
  { q: "A word to yourself today?", emoji: "💪" },
  { q: "Watching anything on YouTube/TikTok?", emoji: "📱" },
  { q: "What did you do at school/home?", emoji: "🏠" },
];

const AI_RESPONSES_KO: Record<number, string[]> = {
  5: ["와 좋은 하루였구나! 🎉", "행복한 게 느껴져!", "오늘 진짜 좋았나봐 😊"],
  3: ["그럴 수 있지~", "평범한 하루도 소중해!", "내일은 더 좋은 일 있을 거야 ✨"],
  2: ["힘들었구나... 괜찮아?", "우울할 때도 있는 거야", "내가 들어줄게 💙"],
  1: ["불안할 수 있어, 괜찮아", "심호흡 한번 해볼까?", "네 마음 이해해 🤗"],
  0: ["많이 힘들었구나...", "혼자 감당하지 마", "언제든 얘기해도 돼 💙"],
};

const AI_RESPONSES_EN: Record<number, string[]> = {
  5: ["Sounds like a great day! 🎉", "I can feel the happiness!", "Today must've been awesome 😊"],
  3: ["That's totally okay~", "An ordinary day is still valuable!", "Tomorrow might be even better ✨"],
  2: ["Sounds rough... you okay?", "It's okay to feel down sometimes", "I'm here for you 💙"],
  1: ["It's okay to feel anxious", "How about taking a deep breath?", "I understand how you feel 🤗"],
  0: ["That sounds really tough...", "Don't carry it alone", "You can talk anytime 💙"],
};

const MindDiary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish, localePath } = useLanguage();
  
  const MOOD_OPTIONS = isEnglish ? MOOD_OPTIONS_EN : MOOD_OPTIONS_KO;
  const DAILY_QUESTIONS = isEnglish ? DAILY_QUESTIONS_EN : DAILY_QUESTIONS_KO;
  const AI_RESPONSES = isEnglish ? AI_RESPONSES_EN : AI_RESPONSES_KO;

  const [step, setStep] = useState<'mood' | 'question' | 'done'>('mood');
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(DAILY_QUESTIONS[0]);
  const [diaryText, setDiaryText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showUrgentConnect, setShowUrgentConnect] = useState(false);
  const [crisisAlertId, setCrisisAlertId] = useState<string | null>(null);
  const [friendCount, setFriendCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => { checkAuth(); loadStats(); shuffleQuestion(); }, []);

  const shuffleQuestion = () => {
    const randomIndex = Math.floor(Math.random() * DAILY_QUESTIONS.length);
    setCurrentQuestion(DAILY_QUESTIONS[randomIndex]);
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data: todayData } = await supabase.from('daily_checkins' as any).select('*').eq('user_id', user.id).eq('checkin_date', today).maybeSingle();
    if (todayData) {
      setStep('done');
      const moodValue = (todayData as any).mood_score;
      setSelectedMood(MOOD_OPTIONS.find(m => m.value === moodValue) || null);
    }
    const { data: allData } = await supabase.from('daily_checkins' as any).select('checkin_date').eq('user_id', user.id).order('checkin_date', { ascending: false });
    if (allData) {
      setTotalEntries(allData.length);
      let currentStreak = 0;
      const now = new Date();
      for (let i = 0; i < allData.length; i++) {
        const expected = new Date(now); expected.setDate(now.getDate() - i);
        if (new Date((allData[i] as any).checkin_date).toDateString() === expected.toDateString()) currentStreak++;
        else break;
      }
      setStreak(currentStreak);
    }
    const { data: referrals } = await supabase.from('referral_rewards' as any).select('id').eq('referrer_id', user.id);
    if (referrals) setFriendCount(referrals.length);
  };

  const handleMoodSelect = async (mood: typeof MOOD_OPTIONS[0]) => {
    setSelectedMood(mood);
    if (mood.value <= 1) {
      setShowCrisisAlert(true);
      if (user) {
        try {
          const { data, error } = await supabase.rpc('create_crisis_alert', {
            p_user_id: user.id, p_alert_type: 'mood_crisis',
            p_severity_level: mood.value === 0 ? 'critical' : 'high',
            p_trigger_source: 'mind_diary', p_trigger_data: { mood_value: mood.value, mood_label: mood.label }
          });
          if (data && !error) setCrisisAlertId(data);
        } catch (err) { console.error('Crisis alert creation failed:', err); }
      }
    }
    const responses = AI_RESPONSES[mood.value] || AI_RESPONSES[3];
    setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
    setTimeout(() => setStep('question'), 500);
  };

  const handleSubmitDiary = async () => {
    if (!selectedMood) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: isEnglish ? "Recorded! 💙" : "마음 기록 완료! 💙", description: isEnglish ? "Sign up to save your records and earn rewards!" : "회원가입하면 기록이 저장되고 친구 초대 보상도 받아요!" });
      setStep('done'); setLoading(false); return;
    }
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('daily_checkins' as any).upsert({
      user_id: user.id, checkin_date: today, mood_score: selectedMood.value,
      energy_level: 3, stress_level: selectedMood.value <= 2 ? 4 : 2, notes: diaryText || null,
    });
    if (!error) {
      setStreak(prev => prev + 1); setTotalEntries(prev => prev + 1); setStep('done');
      toast({ title: isEnglish ? `${streak + 1}-day streak! 🔥` : `${streak + 1}일 연속 기록! 🔥`, description: isEnglish ? (streak >= 6 ? "7 days = 3 free Premium days!" : "Great job today!") : (streak >= 6 ? "7일 달성하면 프리미엄 3일 무료!" : "오늘도 잘했어!") });
    }
    setLoading(false);
  };

  const handleShareInvite = async () => {
    const shareUrl = `${window.location.origin}/mind-diary?ref=${user?.id?.slice(0, 8) || 'guest'}`;
    if (navigator.share) {
      await navigator.share({ title: isEnglish ? 'Mind Diary - 1 min daily check' : '마음일기 - 하루 1분 마음 체크', text: isEnglish ? "Let's track our mood together! 🫶" : '친구야, 같이 마음 기록하자! 🫶', url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: isEnglish ? "Link copied!" : "링크 복사 완료!", description: isEnglish ? "Share with friends for mutual rewards 💝" : "친구에게 공유하면 둘 다 보상 받아요 💝" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 pt-6 pb-24 max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-base px-4 py-1.5 border-0 mb-3">
            <Flame className="w-4 h-4 mr-1.5" />
            {isEnglish ? `${streak}-day streak` : `${streak}일 연속`}
          </Badge>
          <h1 className="text-2xl font-bold text-white">
            {step === 'mood' && (isEnglish ? "How do you feel? 💭" : "오늘 기분 어때? 💭")}
            {step === 'question' && `${currentQuestion.emoji} ${isEnglish ? 'Quick Diary' : '한줄 일기'}`}
            {step === 'done' && (isEnglish ? "Today's record complete! ✨" : "오늘 기록 완료! ✨")}
          </h1>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {['mood', 'question', 'done'].map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step === s ? 'w-8 bg-primary' : ['mood', 'question', 'done'].indexOf(step) > i ? 'w-4 bg-primary/50' : 'w-4 bg-slate-700'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'mood' && (
            <motion.div key="mood" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="p-6">
                  <p className="text-center text-slate-400 text-sm mb-4">{isEnglish ? 'Tap to select' : '탭해서 선택해줘'}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {MOOD_OPTIONS.map((mood, index) => (
                      <motion.button key={mood.value} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                        onClick={() => handleMoodSelect(mood)}
                        className={`flex flex-col items-center p-3 rounded-2xl transition-all ${selectedMood?.value === mood.value ? `bg-gradient-to-br ${mood.color} scale-105` : 'bg-slate-700/50 hover:bg-slate-600/50 active:scale-95'}`}
                      >
                        <span className="text-3xl mb-1">{mood.emoji}</span>
                        <span className="text-[10px] text-slate-300">{mood.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'question' && (
            <motion.div key="question" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/30 rounded-full flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{aiResponse}</p>
                      <p className="text-slate-400 text-sm mt-1">
                        {selectedMood?.emoji} {isEnglish ? `You selected "${selectedMood?.label}"` : `${selectedMood?.label}를 선택했구나`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-slate-400 text-sm">{isEnglish ? "Today's question" : '오늘의 질문'}</p>
                    <Button variant="ghost" size="sm" onClick={shuffleQuestion} className="text-slate-400 hover:text-white h-8 px-2">
                      <Shuffle className="w-4 h-4 mr-1" />
                      {isEnglish ? 'Another' : '다른 질문'}
                    </Button>
                  </div>
                  <p className="text-white text-lg font-medium mb-4">{currentQuestion.emoji} {currentQuestion.q}</p>
                  <Textarea
                    placeholder={isEnglish ? "Write freely! (optional)" : "자유롭게 적어봐! (선택)"}
                    value={diaryText} onChange={(e) => setDiaryText(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px] resize-none"
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('mood')} className="text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-1" />{isEnglish ? 'Back' : '뒤로'}
                </Button>
                <Button onClick={handleSubmitDiary} disabled={loading} className="flex-1 h-12 bg-gradient-to-r from-primary to-purple-500">
                  {loading ? (isEnglish ? "Saving..." : "저장 중...") : (
                    <><Send className="w-4 h-4 mr-2" />{diaryText ? (isEnglish ? "Done!" : "기록 완료!") : (isEnglish ? "Skip & Done" : "건너뛰고 완료")}</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-7xl mb-4">
                    {selectedMood?.emoji || "✨"}
                  </motion.div>
                  <h2 className="text-xl font-bold text-white mb-2">{isEnglish ? "All done for today! 🎉" : "오늘도 기록 완료! 🎉"}</h2>
                  <p className="text-slate-400 text-sm mb-6">{isEnglish ? "Come back tomorrow! 🫶" : "내일 다시 와서 기록해줘 🫶"}</p>
                  
                  <div className="p-4 bg-slate-700/50 rounded-xl mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">{isEnglish ? '7-day challenge' : '7일 연속 챌린지'}</span>
                      <span className="text-primary font-bold">{streak}/7{isEnglish ? ' days' : '일'}</span>
                    </div>
                    <Progress value={(streak / 7) * 100} className="h-3" />
                    {streak >= 7 ? (
                      <p className="text-green-400 text-xs mt-2 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />{isEnglish ? '3 free Premium days unlocked!' : '프리미엄 3일 무료 달성!'}
                      </p>
                    ) : (
                      <p className="text-slate-500 text-xs mt-2">🎁 {isEnglish ? `${7 - streak} more days for 3 free Premium days!` : `${7 - streak}일 더 기록하면 프리미엄 3일 무료!`}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{isEnglish ? 'Invite Friends' : '친구 초대하기'}</p>
                        <p className="text-slate-400 text-xs">
                          {friendCount > 0 ? (isEnglish ? `${friendCount} invited!` : `${friendCount}명 초대 완료!`) : (isEnglish ? 'Both get rewards!' : '초대하면 둘 다 보상!')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={handleShareInvite} className="bg-primary/20 hover:bg-primary/30 text-primary">
                      <Share2 className="w-4 h-4 mr-1" />{isEnglish ? 'Invite' : '초대'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-3 text-center">
                    <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{streak}</p>
                    <p className="text-xs text-slate-400">{isEnglish ? 'Streak' : '연속'}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-3 text-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{totalEntries}</p>
                    <p className="text-xs text-slate-400">{isEnglish ? 'Total' : '총 기록'}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-3 text-center">
                    <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{friendCount}</p>
                    <p className="text-xs text-slate-400">{isEnglish ? 'Friends' : '친구'}</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCrisisAlert && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-20 left-4 right-4 z-50">
              <Card className="bg-gradient-to-r from-red-500/90 to-orange-500/90 border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-white shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">{isEnglish ? "Going through a tough time 💙" : "힘든 시간을 보내고 있구나 💙"}</p>
                      <p className="text-white/80 text-sm mb-3">{isEnglish ? "You don't have to go through this alone. Get help now!" : "혼자 감당하지 않아도 돼. 지금 바로 상담받을 수 있어!"}</p>
                      <div className="space-y-2 mb-3">
                        <Button size="sm" onClick={() => { setShowCrisisAlert(false); setShowUrgentConnect(true); }} className="w-full bg-white text-red-600 hover:bg-white/90 font-bold">
                          <Zap className="w-4 h-4 mr-2" />{isEnglish ? 'Connect with Expert Now' : '지금 바로 전문가 연결하기'}
                        </Button>
                        <Button size="sm" onClick={() => navigate(localePath('/ai-counselor'))} className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30">
                          <Bot className="w-4 h-4 mr-2" />{isEnglish ? 'Chat with AI Counselor' : 'AI 상담사와 대화하기'}
                        </Button>
                        <Button size="sm" onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')} className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E]">
                          <MessageSquare className="w-4 h-4 mr-2" />{isEnglish ? 'KakaoTalk Counselor' : '카톡으로 전문상담사 연결'}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => window.open('tel:1388', '_self')} className="flex-1 bg-white text-red-600 hover:bg-white/90">
                          <Phone className="w-4 h-4 mr-1" />{isEnglish ? 'Call 1388' : '1388 전화'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowCrisisAlert(false)} className="text-white/80 hover:text-white hover:bg-white/10">
                          {isEnglish ? 'Close' : '닫기'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!user && step === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
            <Button onClick={() => navigate(localePath('/auth'))} className="w-full h-12 bg-gradient-to-r from-primary to-purple-500 text-white font-bold">
              {isEnglish ? 'Sign up free to save your records' : '무료 회원가입하고 기록 저장하기'}
            </Button>
          </motion.div>
        )}

        <UrgentExpertConnect
          isOpen={showUrgentConnect} onClose={() => setShowUrgentConnect(false)}
          userId={user?.id} crisisAlertId={crisisAlertId || undefined}
          severityLevel={selectedMood?.value === 0 ? 'critical' : selectedMood?.value === 1 ? 'high' : 'medium'}
        />
      </div>
    </div>
  );
};

export default MindDiary;
