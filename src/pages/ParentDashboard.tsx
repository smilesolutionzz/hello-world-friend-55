import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Calendar,
  Bell,
  Lock,
  CheckCircle,
  Flame,
  Heart,
  Brain,
  Phone,
  MessageCircle,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from '@/hooks/useSubscription';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { motion } from "framer-motion";

// 가격 설정 (수익 모델)
const SUBSCRIPTION_PRICE = 9900; // 월 9,900원

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const isSubscribed = isPremiumUser() || isLifetimeUser();
  const [childData, setChildData] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    // 구독 상태 확인 (실제로는 Stripe 연동)
    const { data: subscription } = await supabase
      .from('user_subscriptions' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    // subscription is now handled by useSubscription hook

    // 자녀 데이터 시뮬레이션 (실제로는 연결된 자녀 계정에서)
    // 데모용 Mock 데이터
    setChildData({
      name: "우리 아이",
      streak: 12,
      avgMood: 3.5,
      moodTrend: "up",
      lastCheckin: new Date().toISOString(),
    });

    setWeeklyReport({
      avgMood: 3.8,
      moodChange: +0.5,
      stressLevel: 2.3,
      totalEntries: 7,
      highlights: [
        "이번 주 기분이 전반적으로 좋았어요",
        "목요일에 약간 스트레스를 받았던 것 같아요",
        "친구 관계가 안정적으로 보여요"
      ],
      concerns: [],
    });

    setAlerts([
      // 위기 알림이 있을 경우 여기에 추가
    ]);

    setLoading(false);
  };

  const handleSubscribe = async () => {
    toast({
      title: "구독 페이지로 이동합니다",
      description: "월 9,900원으로 자녀의 마음 상태를 확인하세요",
    });
    navigate('/token-subscription');
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 4) return "😊";
    if (score >= 3) return "😐";
    if (score >= 2) return "😔";
    return "😢";
  };

  const getMoodColor = (score: number) => {
    if (score >= 4) return "text-green-400";
    if (score >= 3) return "text-yellow-400";
    if (score >= 2) return "text-orange-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-6 pb-12 max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-4">
            <Crown className="w-4 h-4 mr-1" />
            부모 대시보드
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            우리 아이 마음 리포트
          </h1>
          <p className="text-slate-400">
            {isSubscribed ? "실시간으로 아이의 마음 상태를 확인하세요" : "구독하고 자녀의 마음을 확인하세요"}
          </p>
        </div>

        {/* 위기 알림 (가장 중요) */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-red-500/20 border-red-500/50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-white font-bold">위기 알림</p>
                    <p className="text-red-200 text-sm">자녀가 도움이 필요할 수 있습니다</p>
                  </div>
                  <Button size="sm" className="ml-auto bg-red-500 hover:bg-red-600">
                    <Phone className="w-4 h-4 mr-1" />
                    전문가 상담
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 구독 안내 (비구독자) */}
        {!isSubscribed && (
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-amber-500/30 rounded-2xl flex items-center justify-center">
                  <Lock className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">프리미엄 구독</h3>
                  <p className="text-amber-200">월 {SUBSCRIPTION_PRICE.toLocaleString()}원</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  "실시간 기분 모니터링",
                  "주간 AI 분석 리포트",
                  "위기 감지 즉시 알림",
                  "전문가 상담 연결"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleSubscribe}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
              >
                <Crown className="w-5 h-5 mr-2" />
                지금 구독하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 자녀 현재 상태 (구독자만) */}
        {isSubscribed && childData && (
          <>
            {/* 오늘 기분 */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  오늘 기분
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{getMoodEmoji(childData.avgMood)}</span>
                    <div>
                      <p className={`text-2xl font-bold ${getMoodColor(childData.avgMood)}`}>
                        {childData.avgMood >= 3 ? "좋음" : "관심 필요"}
                      </p>
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        {childData.moodTrend === "up" ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">상승 추세</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">하락 추세</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Flame className="w-4 h-4 mr-1" />
                    {childData.streak}일 연속
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 주간 리포트 */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    주간 리포트
                  </CardTitle>
                  <Badge variant="outline" className="text-slate-400">
                    {weeklyReport.totalEntries}일 기록
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">평균 기분</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMoodEmoji(weeklyReport.avgMood)}</span>
                      <span className={`font-bold ${getMoodColor(weeklyReport.avgMood)}`}>
                        {weeklyReport.avgMood.toFixed(1)}
                      </span>
                      {weeklyReport.moodChange > 0 && (
                        <span className="text-green-400 text-xs">+{weeklyReport.moodChange}</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">스트레스</p>
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-bold">
                        {weeklyReport.stressLevel <= 2 ? "낮음" : weeklyReport.stressLevel <= 3 ? "보통" : "높음"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm font-medium">AI 분석 요약</p>
                  {weeklyReport.highlights.map((highlight: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 빠른 액션 */}
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
                onClick={() => navigate('/expert-list')}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">전문가 상담</p>
                      <p className="text-slate-400 text-xs">바로 연결</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </CardContent>
              </Card>
              
              <Card 
                className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors"
                onClick={() => navigate('/growth-tracker')}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">성장 기록</p>
                      <p className="text-slate-400 text-xs">전체 보기</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* 미리보기 (비구독자) */}
        {!isSubscribed && (
          <Card className="bg-slate-800/30 border-slate-700 relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/60 z-10 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">구독 후 확인 가능</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4 opacity-50">
                <div className="h-20 bg-slate-700 rounded-lg"></div>
                <div className="h-32 bg-slate-700 rounded-lg"></div>
                <div className="h-16 bg-slate-700 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
