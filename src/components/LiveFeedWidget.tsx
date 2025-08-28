import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Activity, Heart, Star, ThumbsUp } from "lucide-react";

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
  const [feedbacks, setFeedbacks] = useState<LiveFeedback[]>([]);
  const [stats, setStats] = useState<LiveStats>({
    dailyVisitors: 1247,
    currentOnline: 23,
    totalTests: 892
  });
  const [currentFeedback, setCurrentFeedback] = useState<LiveFeedback | null>(null);
  const [showStats, setShowStats] = useState(true);

  // 실시간 피드백 데이터 (실제로는 Supabase realtime에서 가져올 수 있음)
  const sampleFeedbacks: LiveFeedback[] = [
    { id: "1", message: "너무 정확해서 놀랐어요! 믿고 구매합니다 ♡", emoji: "😍", timestamp: new Date(), testType: "발달검사" },
    { id: "2", message: "AI 분석이 정말 자세하네요~", emoji: "🤩", timestamp: new Date(), testType: "ADHD검사" },
    { id: "3", message: "아이 발달 상태를 정확히 알 수 있어서 감사해요", emoji: "🥰", timestamp: new Date(), testType: "언어발달" },
    { id: "4", message: "전문가 수준의 해석이에요!", emoji: "💯", timestamp: new Date(), testType: "프리미엄검사" },
    { id: "5", message: "무료로 이런 서비스를 이용할 수 있다니!", emoji: "🎉", timestamp: new Date(), testType: "기본검사" },
    { id: "6", message: "정말 도움이 많이 됐어요 ㅠㅠ", emoji: "😭", timestamp: new Date(), testType: "스트레스검사" },
    { id: "7", message: "친구들에게도 추천하고 싶어요", emoji: "👍", timestamp: new Date(), testType: "성격검사" },
    { id: "8", message: "AI가 이렇게까지 발전했다니...", emoji: "🤖", timestamp: new Date(), testType: "종합검사" }
  ];

  // 통계 실시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        dailyVisitors: prev.dailyVisitors + Math.floor(Math.random() * 3),
        currentOnline: prev.currentOnline + Math.floor(Math.random() * 5) - 2,
        totalTests: prev.totalTests + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 피드백 슬라이드 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      const randomFeedback = sampleFeedbacks[Math.floor(Math.random() * sampleFeedbacks.length)];
      const newFeedback = {
        ...randomFeedback,
        id: Math.random().toString(),
        timestamp: new Date()
      };
      
      setCurrentFeedback(newFeedback);
      setFeedbacks(prev => [newFeedback, ...prev.slice(0, 4)]);
      
      // 6초 후에 피드백 숨기기
      setTimeout(() => {
        setCurrentFeedback(null);
      }, 6000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // 통계와 피드백 번갈아 표시
  useEffect(() => {
    const interval = setInterval(() => {
      setShowStats(prev => !prev);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {/* 실시간 통계 */}
      {showStats && (
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-2xl animate-slide-in-right">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="font-medium">실시간 현황</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="font-bold text-lg">{stats.dailyVisitors.toLocaleString()}</div>
                  <div className="opacity-90">오늘 방문</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-300">{stats.currentOnline}</div>
                  <div className="opacity-90">현재 온라인</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{stats.totalTests.toLocaleString()}</div>
                  <div className="opacity-90">오늘 검사</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 실시간 피드백 */}
      {currentFeedback && !showStats && (
        <Card className="p-4 bg-white border-0 shadow-2xl max-w-xs animate-slide-in-right">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{currentFeedback.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {currentFeedback.testType}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  방금 전
                </span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                {currentFeedback.message}
              </p>
            </div>
          </div>
          
          {/* 하트 애니메이션 효과 */}
          <div className="absolute -top-1 -right-1">
            <Heart className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" />
          </div>
        </Card>
      )}

      {/* 피드백 히스토리 (스크롤 가능) */}
      {feedbacks.length > 0 && !currentFeedback && !showStats && (
        <Card className="p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg max-w-xs max-h-48 overflow-y-auto animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <TrendingUp className="w-3 h-3" />
              <span>최근 후기</span>
            </div>
            {feedbacks.slice(0, 3).map((feedback) => (
              <div key={feedback.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="text-lg">{feedback.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-700">{feedback.message}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs py-0">
                      {feedback.testType}
                    </Badge>
                  </div>
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