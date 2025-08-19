import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, AlertTriangle, TrendingUp, Users, Brain, Zap } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  current_mood: number;
  stress_level: number;
  last_update: string;
}

interface EmotionTransfer {
  source_member: string;
  target_member: string;
  emotion_type: string;
  intensity: number;
  correlation_score: number;
  detected_at: string;
}

interface FamilyEmotionPattern {
  pattern_type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  recommendation: string;
  confidence: number;
}

export default function FamilyEmotionDashboard() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [emotionTransfers, setEmotionTransfers] = useState<EmotionTransfer[]>([]);
  const [patterns, setPatterns] = useState<FamilyEmotionPattern[]>([]);
  const [overallHarmony, setOverallHarmony] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFamilyData();
    analyzeEmotionPatterns();
  }, []);

  const loadFamilyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 임시 데이터 (실제로는 DB에서 가져올 데이터)
      const mockFamilyMembers: FamilyMember[] = [
        {
          id: '1',
          name: '엄마',
          role: 'parent',
          current_mood: 6,
          stress_level: 7,
          last_update: new Date().toISOString()
        },
        {
          id: '2',
          name: '아빠',
          role: 'parent',
          current_mood: 5,
          stress_level: 8,
          last_update: new Date().toISOString()
        },
        {
          id: '3',
          name: '민수 (7세)',
          role: 'child',
          current_mood: 4,
          stress_level: 6,
          last_update: new Date().toISOString()
        }
      ];

      const mockTransfers: EmotionTransfer[] = [
        {
          source_member: '아빠',
          target_member: '민수 (7세)',
          emotion_type: 'stress',
          intensity: 0.8,
          correlation_score: 0.75,
          detected_at: new Date().toISOString()
        },
        {
          source_member: '엄마',
          target_member: '아빠',
          emotion_type: 'anxiety',
          intensity: 0.6,
          correlation_score: 0.65,
          detected_at: new Date().toISOString()
        }
      ];

      setFamilyMembers(mockFamilyMembers);
      setEmotionTransfers(mockTransfers);
      
      // 전체 조화도 계산
      const avgMood = mockFamilyMembers.reduce((sum, member) => sum + member.current_mood, 0) / mockFamilyMembers.length;
      const avgStress = mockFamilyMembers.reduce((sum, member) => sum + member.stress_level, 0) / mockFamilyMembers.length;
      const harmony = (avgMood - avgStress + 10) * 5; // 0-100 스케일로 조정
      setOverallHarmony(Math.max(0, Math.min(100, harmony)));

    } catch (error) {
      console.error('Error loading family data:', error);
    }
  };

  const analyzeEmotionPatterns = async () => {
    setIsAnalyzing(true);
    
    try {
      // AI 분석 시뮬레이션 (실제로는 edge function 호출)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPatterns: FamilyEmotionPattern[] = [
        {
          pattern_type: 'stress_cascade',
          description: '아빠의 업무 스트레스가 아이에게 전이되고 있습니다',
          risk_level: 'high',
          recommendation: '아빠와 아이의 1:1 시간을 늘리고, 스트레스 해소 활동을 함께 해보세요',
          confidence: 0.85
        },
        {
          pattern_type: 'mood_synchronization',
          description: '가족 구성원들의 기분 변화가 동조화되는 경향이 있습니다',
          risk_level: 'medium',
          recommendation: '개별적인 감정 처리 시간을 갖고, 가족 회의를 통해 소통을 늘려보세요',
          confidence: 0.72
        },
        {
          pattern_type: 'emotional_buffer',
          description: '엄마가 가족의 감정적 완충 역할을 하고 있어 과부하 위험이 있습니다',
          risk_level: 'medium',
          recommendation: '엄마의 개인 시간과 스트레스 관리에 더 신경써야 합니다',
          confidence: 0.68
        }
      ];
      
      setPatterns(mockPatterns);
      
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: "분석 실패",
        description: "감정 패턴 분석에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">보통</Badge>;
      case 'low':
        return <Badge className="bg-success text-success-foreground">낮음</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  const getEmotionIcon = (type: string) => {
    switch (type) {
      case 'stress':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'anxiety':
        return <Brain className="h-4 w-4 text-orange-500" />;
      default:
        return <Heart className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            가족 감정 대시보드
          </CardTitle>
          <CardDescription>
            실시간으로 가족 구성원들의 감정 상태와 상호 영향을 분석합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">전체 가족 조화도</h3>
                <div className="text-2xl font-bold text-primary">{overallHarmony.toFixed(0)}%</div>
              </div>
              <Progress value={overallHarmony} className="h-3" />
              <div className="text-sm text-muted-foreground">
                {overallHarmony > 70 ? "가족 분위기가 좋습니다" : 
                 overallHarmony > 40 ? "주의 깊은 관찰이 필요합니다" : 
                 "적극적인 개입이 필요합니다"}
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={analyzeEmotionPatterns} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "분석 중..." : "감정 패턴 재분석"}
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                마지막 분석: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">구성원 상태</TabsTrigger>
          <TabsTrigger value="transfers">감정 전이</TabsTrigger>
          <TabsTrigger value="patterns">패턴 분석</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-4">
          {familyMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">기분</div>
                      <div className={`text-lg font-bold ${member.current_mood > 6 ? 'text-success' : member.current_mood > 4 ? 'text-warning' : 'text-destructive'}`}>
                        {member.current_mood}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">스트레스</div>
                      <div className={`text-lg font-bold ${member.stress_level < 4 ? 'text-success' : member.stress_level < 7 ? 'text-warning' : 'text-destructive'}`}>
                        {member.stress_level}/10
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Progress value={member.current_mood * 10} className="flex-1 h-2" />
                  <Progress value={(10 - member.stress_level) * 10} className="flex-1 h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                감정 전이 현황
              </CardTitle>
              <CardDescription>
                가족 구성원 간 감정 영향도를 실시간으로 추적합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emotionTransfers.map((transfer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEmotionIcon(transfer.emotion_type)}
                      <div>
                        <div className="font-medium">
                          {transfer.source_member} → {transfer.target_member}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {transfer.emotion_type} 전이
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">강도</div>
                        <div className="font-bold">{(transfer.intensity * 100).toFixed(0)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">상관도</div>
                        <div className="font-bold">{(transfer.correlation_score * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {patterns.map((pattern, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pattern.pattern_type.replace('_', ' ').toUpperCase()}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getRiskBadge(pattern.risk_level)}
                    <Badge variant="outline">{(pattern.confidence * 100).toFixed(0)}% 확신</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{pattern.description}</p>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    추천 개입 방법
                  </h4>
                  <p className="text-sm">{pattern.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}