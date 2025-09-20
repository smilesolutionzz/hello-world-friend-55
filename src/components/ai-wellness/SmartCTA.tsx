import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, MessageCircle, Heart, Zap, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SmartCTA: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testAIInsights = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "AI 인사이트를 이용하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: {
          userId: user.id,
          checkinData: {
            mood: 4,
            energy: 3,
            stress: 2,
            date: new Date().toISOString()
          },
          challengeHistory: []
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "AI 인사이트 테스트 성공! 🎯",
          description: `${data.insights.length}개의 개인맞춤 인사이트가 생성되었습니다.`
        });
      }
    } catch (error) {
      console.error('AI insights test error:', error);
      toast({
        title: "AI 인사이트 테스트 실패",
        description: "OpenAI 연결을 확인해주세요.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testAICoach = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "AI 코칭을 이용하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          userId: user.id,
          sessionType: 'mood_coaching',
          message: '오늘 기분이 좋지 않아요.',
          conversationHistory: [],
          moodBefore: 2
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "AI 코칭 테스트 성공! 🤖",
          description: "AI 코치가 응답했습니다."
        });
      }
    } catch (error) {
      console.error('AI coach test error:', error);
      toast({
        title: "AI 코칭 테스트 실패",
        description: "OpenAI 연결을 확인해주세요.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all cursor-pointer">
        <CardHeader className="text-center pb-3">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <CardTitle className="text-lg text-blue-700">AI 건강 인사이트</CardTitle>
          <CardDescription className="text-blue-600">
            개인맞춤 건강 분석과 추천
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={testAIInsights}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? '생성 중...' : '인사이트 생성하기'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all cursor-pointer">
        <CardHeader className="text-center pb-3">
          <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <CardTitle className="text-lg text-green-700">AI 개인 코칭</CardTitle>
          <CardDescription className="text-green-600">
            맞춤형 건강 코칭과 상담
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={testAICoach}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {loading ? '대화 중...' : 'AI 코칭 시작하기'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all cursor-pointer">
        <CardHeader className="text-center pb-3">
          <Target className="w-12 h-12 text-purple-600 mx-auto mb-2" />
          <CardTitle className="text-lg text-purple-700">스마트 챌린지</CardTitle>
          <CardDescription className="text-purple-600">
            AI 추천 개인맞춤 챌린지
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            disabled
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Heart className="w-4 h-4 mr-2" />
            곧 출시 예정
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};