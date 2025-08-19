import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Brain, TrendingUp, Calendar, Star } from "lucide-react";

interface EffectivenessScore {
  id: string;
  user_id: string;
  session_id?: string;
  mood_before: number;
  mood_after: number;
  stress_before: number;
  stress_after: number;
  clarity_after: number;
  satisfaction: number;
  notes?: string;
  created_at: string;
}

export default function CounselingEffectiveness() {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isPreSession, setIsPreSession] = useState(true);
  const [scores, setScores] = useState({
    mood_before: [5],
    mood_after: [5],
    stress_before: [5],
    stress_after: [5],
    clarity_after: [5],
    satisfaction: [5]
  });
  const [recentScores, setRecentScores] = useState<EffectivenessScore[]>([]);
  const [avgImprovement, setAvgImprovement] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentScores();
  }, []);

  const fetchRecentScores = async () => {
    // 임시 목 데이터 사용
    const mockData: EffectivenessScore[] = [
      {
        id: '1',
        user_id: 'user1',
        session_id: 'session1',
        mood_before: 4,
        mood_after: 7,
        stress_before: 8,
        stress_after: 5,
        clarity_after: 6,
        satisfaction: 8,
        created_at: new Date().toISOString()
      }
    ];
    
    setRecentScores(mockData);
    calculateAverageImprovement(mockData);
  };

  const calculateAverageImprovement = (data: EffectivenessScore[]) => {
    if (data.length === 0) return;
    
    const improvements = data.map(score => {
      const moodImprovement = score.mood_after - score.mood_before;
      const stressImprovement = score.stress_before - score.stress_after; // 스트레스는 감소가 개선
      return (moodImprovement + stressImprovement) / 2;
    });
    
    const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
    setAvgImprovement(avgImprovement);
  };

  const startSession = () => {
    const sessionId = `session_${Date.now()}`;
    setCurrentSession(sessionId);
    setIsPreSession(true);
  };

  const savePreSessionData = async () => {
    try {
      // 임시 저장 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsPreSession(false);
      toast({
        title: "세션 전 상태 저장완료",
        description: "상담을 진행해주세요. 종료 후 다시 측정하겠습니다.",
      });
    } catch (error) {
      console.error('Error saving pre-session data:', error);
      toast({
        title: "저장 실패",
        description: "데이터 저장에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const savePostSessionData = async () => {
    try {
      // 임시 저장 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentSession(null);
      setIsPreSession(true);
      fetchRecentScores();
      
      toast({
        title: "효과 측정 완료",
        description: "상담 효과가 기록되었습니다.",
      });
    } catch (error) {
      console.error('Error saving post-session data:', error);
      toast({
        title: "저장 실패",
        description: "데이터 저장에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const getImprovementBadge = (improvement: number) => {
    if (improvement > 2) return <Badge className="bg-success text-success-foreground">매우 좋음</Badge>;
    if (improvement > 1) return <Badge className="bg-warning text-warning-foreground">좋음</Badge>;
    if (improvement > 0) return <Badge className="bg-secondary">보통</Badge>;
    return <Badge variant="destructive">주의 필요</Badge>;
  };

  if (!currentSession) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              상담 효과 측정
            </CardTitle>
            <CardDescription>
              상담 전후 상태를 측정하여 효과를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{recentScores.length}</div>
                <div className="text-sm text-muted-foreground">총 세션 수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">+{avgImprovement.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">평균 개선도</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {recentScores.length > 0 ? recentScores[0].satisfaction : 0}/10
                </div>
                <div className="text-sm text-muted-foreground">최근 만족도</div>
              </div>
            </div>
            
            <Button onClick={startSession} className="w-full">
              새 상담 세션 시작하기
            </Button>
          </CardContent>
        </Card>

        {recentScores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                최근 세션 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentScores.slice(0, 5).map((score) => {
                  const moodImprovement = score.mood_after - score.mood_before;
                  const stressImprovement = score.stress_before - score.stress_after;
                  const overallImprovement = (moodImprovement + stressImprovement) / 2;
                  
                  return (
                    <div key={score.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {new Date(score.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">기분: {score.mood_before} → {score.mood_after}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">스트레스: {score.stress_before} → {score.stress_after}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getImprovementBadge(overallImprovement)}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{score.satisfaction}/10</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isPreSession ? "상담 전 상태 측정" : "상담 후 상태 측정"}
        </CardTitle>
        <CardDescription>
          {isPreSession 
            ? "상담을 시작하기 전 현재 상태를 측정해주세요"
            : "상담 종료 후 현재 상태와 만족도를 측정해주세요"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPreSession ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">현재 기분 상태 (1-10)</label>
                <Slider
                  value={scores.mood_before}
                  onValueChange={(value) => setScores(prev => ({ ...prev, mood_before: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  현재: {scores.mood_before[0]}/10
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">현재 스트레스 수준 (1-10)</label>
                <Slider
                  value={scores.stress_before}
                  onValueChange={(value) => setScores(prev => ({ ...prev, stress_before: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  현재: {scores.stress_before[0]}/10
                </div>
              </div>
            </div>

            <Button onClick={savePreSessionData} className="w-full">
              저장하고 상담 시작하기
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">상담 후 기분 상태 (1-10)</label>
                <Slider
                  value={scores.mood_after}
                  onValueChange={(value) => setScores(prev => ({ ...prev, mood_after: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  현재: {scores.mood_after[0]}/10
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">상담 후 스트레스 수준 (1-10)</label>
                <Slider
                  value={scores.stress_after}
                  onValueChange={(value) => setScores(prev => ({ ...prev, stress_after: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  현재: {scores.stress_after[0]}/10
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">문제 해결 명확도 (1-10)</label>
                <Slider
                  value={scores.clarity_after}
                  onValueChange={(value) => setScores(prev => ({ ...prev, clarity_after: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  현재: {scores.clarity_after[0]}/10
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">상담 만족도 (1-10)</label>
                <Slider
                  value={scores.satisfaction}
                  onValueChange={(value) => setScores(prev => ({ ...prev, satisfaction: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  현재: {scores.satisfaction[0]}/10
                </div>
              </div>
            </div>

            <Button onClick={savePostSessionData} className="w-full">
              측정 완료하기
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}