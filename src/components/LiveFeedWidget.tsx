import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Activity, Heart, Star, ThumbsUp, X, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LiveFeedback {
  id: string;
  message: string;
  timestamp: Date;
  emoji: string;
  testType?: string;
}

interface LiveStats {
  dailyVisitors: number;
  currentOnline: number;
  totalTests: number;
}

const LiveFeedWidget = () => {
  const location = useLocation();
  const [feedbacks, setFeedbacks] = useState<LiveFeedback[]>([]);
  const [realFeedbacks, setRealFeedbacks] = useState<LiveFeedback[]>([]);
  
  // 시간대별 증가를 위한 기준값 계산
  const getHourlyTargetStats = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const morningStart = 9; // 오전 9시부터 시작
    const hoursFromMorning = Math.max(0, currentHour - morningStart);
    
    // 오전 9시 기준값
    const baseVisitors = 180;
    const baseTests = 85;
    
    // 시간당 30씩 증가, 최대 400까지
    const targetVisitors = Math.min(400, baseVisitors + (hoursFromMorning * 30));
    const targetTests = Math.min(200, baseTests + (hoursFromMorning * 15)); // 비례적으로 증가
    
    return { targetVisitors, targetTests };
  };

  const { targetVisitors, targetTests } = getHourlyTargetStats();
  
  const [stats, setStats] = useState<LiveStats>({
    dailyVisitors: Math.min(targetVisitors, 287), // 현재 시간대에 맞는 값
    currentOnline: 49,  // 더 현실적인 온라인 사용자 수
    totalTests: Math.min(targetTests, 143)     // 비례적으로 설정
  });
  const [currentFeedback, setCurrentFeedback] = useState<LiveFeedback | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [isStatsHidden, setIsStatsHidden] = useState(false);
  const [isFeedbackHidden, setIsFeedbackHidden] = useState(false);
  const [isWidgetHidden, setIsWidgetHidden] = useState(false);

  // 로컬스토리지에서 설정 불러오기
  useEffect(() => {
    const statsHidden = localStorage.getItem('liveStatsHidden') === 'true';
    const feedbackHidden = localStorage.getItem('liveFeedbackHidden') === 'true';
    const widgetHidden = localStorage.getItem('liveWidgetHidden') === 'true';
    
    setIsStatsHidden(statsHidden);
    setIsFeedbackHidden(feedbackHidden);
    setIsWidgetHidden(widgetHidden);
  }, []);

  // 통계 닫기
  const handleCloseStats = () => {
    setIsStatsHidden(true);
    localStorage.setItem('liveStatsHidden', 'true');
  };

  // 피드백 닫기
  const handleCloseFeedback = () => {
    setIsFeedbackHidden(true);
    localStorage.setItem('liveFeedbackHidden', 'true');
    setCurrentFeedback(null);
  };

  // 전체 위젯 닫기
  const handleCloseWidget = () => {
    setIsWidgetHidden(true);
    localStorage.setItem('liveWidgetHidden', 'true');
  };

  // 위젯 다시 보기
  const handleRestoreWidget = () => {
    setIsWidgetHidden(false);
    setIsStatsHidden(false);
    setIsFeedbackHidden(false);
    localStorage.removeItem('liveWidgetHidden');
    localStorage.removeItem('liveStatsHidden');
    localStorage.removeItem('liveFeedbackHidden');
  };

  // 실제 피드백 데이터 가져오기
  const fetchRealFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedFeedbacks: LiveFeedback[] = data.map(feedback => ({
        id: feedback.id,
        message: feedback.message,
        timestamp: new Date(feedback.created_at),
        emoji: feedback.emoji,
        testType: feedback.test_type
      }));

      setRealFeedbacks(formattedFeedbacks);
    } catch (error) {
      console.error('Error fetching real feedbacks:', error);
    }
  };

  // 다양한 시간대의 피드백 생성
  const getRandomTimestamp = () => {
    const now = new Date();
    const randomMinutes = Math.floor(Math.random() * 480); // 0-8시간 전
    return new Date(now.getTime() - randomMinutes * 60 * 1000);
  };

  // 샘플 피드백 데이터 (실제 피드백이 없을 때 사용)
  const sampleFeedbacks: LiveFeedback[] = [
    { id: "1", message: "너무 정확해서 놀랐어요! 믿고 구매합니다 ♡", emoji: "😍", timestamp: getRandomTimestamp(), testType: "발달검사" },
    { id: "2", message: "AI 분석이 정말 자세하네요~", emoji: "🤩", timestamp: getRandomTimestamp(), testType: "ADHD검사" },
    { id: "3", message: "아이 발달 상태를 정확히 알 수 있어서 감사해요", emoji: "🥰", timestamp: getRandomTimestamp(), testType: "언어발달" },
    { id: "4", message: "전문가 수준의 해석이에요!", emoji: "💯", timestamp: getRandomTimestamp(), testType: "프리미엄검사" },
    { id: "5", message: "무료로 이런 서비스를 이용할 수 있다니!", emoji: "🎉", timestamp: getRandomTimestamp(), testType: "기본검사" },
    { id: "6", message: "정말 도움이 많이 됐어요 ㅠㅠ", emoji: "😭", timestamp: getRandomTimestamp(), testType: "스트레스검사" },
    { id: "7", message: "친구들에게도 추천하고 싶어요", emoji: "👍", timestamp: getRandomTimestamp(), testType: "성격검사" },
    { id: "8", message: "AI가 이렇게까지 발전했다니...", emoji: "🤖", timestamp: getRandomTimestamp(), testType: "종합검사" }
  ];

  // 시간 차이를 한국어로 표시하는 함수
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffMinutes < 5) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return '오늘';
  };

  // 실시간 피드백 구독
  useEffect(() => {
    fetchRealFeedbacks();

    // 실시간 구독 설정
    const channel = supabase
      .channel('user_feedback_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_feedback'
        },
        (payload) => {
          const newFeedback: LiveFeedback = {
            id: payload.new.id,
            message: payload.new.message,
            timestamp: new Date(payload.new.created_at),
            emoji: payload.new.emoji,
            testType: payload.new.test_type
          };
          setRealFeedbacks(prev => [newFeedback, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 통계 실시간 업데이트 (시간대별 목표치를 향해 점진적 증가)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const { targetVisitors, targetTests } = getHourlyTargetStats();
        
        // 목표치를 향해 점진적으로 증가 (매 12초마다 1-2씩)
        const visitorIncrease = prev.dailyVisitors < targetVisitors ? 
          (Math.random() < 0.8 ? 1 : Math.random() < 0.9 ? 2 : 0) : 0;
        
        const testsIncrease = prev.totalTests < targetTests ? 
          (Math.random() < 0.7 ? 1 : 0) : 0;
        
        const onlineChange = Math.floor(Math.random() * 3) - 1; // -1, 0, 1 중 하나
        
        return {
          dailyVisitors: Math.min(targetVisitors, prev.dailyVisitors + visitorIncrease),
          currentOnline: Math.max(15, Math.min(80, prev.currentOnline + onlineChange)),
          totalTests: Math.min(targetTests, prev.totalTests + testsIncrease)
        };
      });
    }, 12000); // 12초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 피드백 슬라이드 애니메이션 (실제 피드백과 샘플 피드백 혼합)
  useEffect(() => {
    if (isFeedbackHidden || isWidgetHidden) return;
    
    const interval = setInterval(() => {
      const allFeedbacks = [...realFeedbacks, ...sampleFeedbacks];
      if (allFeedbacks.length === 0) return;

      const randomFeedback = allFeedbacks[Math.floor(Math.random() * allFeedbacks.length)];
      const newFeedback = {
        ...randomFeedback,
        id: Math.random().toString(),
        timestamp: realFeedbacks.some(f => f.id === randomFeedback.id) 
          ? randomFeedback.timestamp 
          : getRandomTimestamp()
      };
      
      setCurrentFeedback(newFeedback);
      setFeedbacks(prev => [newFeedback, ...prev.slice(0, 4)]);
      
      // 6초 후에 피드백 숨기기
      setTimeout(() => {
        setCurrentFeedback(null);
      }, 6000);
    }, 8000);

    return () => clearInterval(interval);
  }, [realFeedbacks, isFeedbackHidden, isWidgetHidden]);

  // 통계와 피드백 번갈아 표시
  useEffect(() => {
    const interval = setInterval(() => {
      setShowStats(prev => !prev);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // 결과 페이지에서는 완전히 숨김
  const hideOnRoutes = ['/fun-test-result', '/han-medicine-test'];
  if (hideOnRoutes.some(route => location.pathname.includes(route))) {
    return null;
  }

  // 전체 위젯이 숨겨진 경우 복원 버튼만 표시
  if (isWidgetHidden) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleRestoreWidget}
          size="sm"
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 backdrop-blur-sm shadow-lg"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          실시간 현황 보기
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2">
      {/* 실시간 통계 - 더 작고 투명하게 */}
      {showStats && !isStatsHidden && (
        <Card className="p-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white border-0 shadow-lg backdrop-blur-sm animate-slide-in-right relative">
          {/* 닫기 버튼 */}
          <Button
            onClick={handleCloseStats}
            size="sm"
            variant="ghost"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <X className="w-2 h-2" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-full">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-900">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium">실시간</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-900">
                <div className="text-center">
                  <div className="font-bold text-sm">{stats.dailyVisitors.toLocaleString()}</div>
                  <div className="opacity-90 text-xs">방문</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">{stats.currentOnline}</div>
                  <div className="opacity-90 text-xs">온라인</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">{stats.totalTests.toLocaleString()}</div>
                  <div className="opacity-90 text-xs">검사</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 실시간 피드백 - 더 작고 투명하게 */}
      {currentFeedback && !showStats && !isFeedbackHidden && (
        <Card className="p-2 bg-white/85 border-0 shadow-lg backdrop-blur-sm max-w-xs animate-slide-in-right relative">
          {/* 닫기 버튼 */}
          <Button
            onClick={handleCloseFeedback}
            size="sm"
            variant="ghost"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 rounded-full"
          >
            <X className="w-2 h-2" />
          </Button>
          <div className="flex items-start gap-2">
            <div className="text-lg">{currentFeedback.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Badge variant="secondary" className="text-xs py-0 px-1">
                  {currentFeedback.testType}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {getTimeAgo(currentFeedback.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-800 leading-relaxed">
                {currentFeedback.message}
              </p>
            </div>
          </div>
          
          {/* 하트 애니메이션 효과 */}
          <div className="absolute -top-1 -right-1">
            <Heart className="w-3 h-3 text-red-500 animate-pulse" fill="currentColor" />
          </div>
        </Card>
      )}

      {/* 피드백 히스토리 - 더 작고 투명하게 */}
      {feedbacks.length > 0 && !currentFeedback && !showStats && !isFeedbackHidden && (
        <Card className="p-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg max-w-xs max-h-32 overflow-y-auto animate-fade-in relative">
          {/* 닫기 버튼 */}
          <Button
            onClick={handleCloseFeedback}
            size="sm"
            variant="ghost"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-white/80 hover:bg-gray-100/80 text-gray-600 rounded-full shadow-sm"
          >
            <X className="w-2 h-2" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-2 h-2" />
                <span>최근 후기</span>
              </div>
              {/* 전체 위젯 닫기 버튼 */}
              <Button
                onClick={handleCloseWidget}
                size="sm"
                variant="ghost"
                className="h-3 w-3 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-2 h-2" />
              </Button>
            </div>
            {feedbacks.slice(0, 2).map((feedback) => (
              <div key={feedback.id} className="flex items-start gap-1 p-1 bg-gray-50/80 rounded-lg">
                <span className="text-sm">{feedback.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-700 leading-tight">{feedback.message}</p>
                  <Badge variant="outline" className="text-xs py-0 px-1 mt-0.5">
                    {feedback.testType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default LiveFeedWidget;