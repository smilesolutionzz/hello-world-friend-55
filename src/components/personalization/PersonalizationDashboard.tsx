import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Brain, 
  Users, 
  Activity, 
  Sparkles, 
  Clock, 
  TrendingUp,
  MessageCircle,
  Target,
  Zap
} from "lucide-react";
import { usePersonalization } from "@/hooks/usePersonalization";

const PersonalizationDashboard = () => {
  const {
    recommendations,
    insights,
    isLoading,
    getPersonalizedRecommendation,
    logLifestyle,
    findSocialMatches,
    engageWithRecommendation,
    loadRecommendations
  } = usePersonalization();
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [lifestyleForm, setLifestyleForm] = useState({
    sleep_hours: 7,
    sleep_quality: 3,
    mood_score: 5,
    stress_level: 5,
    exercise_minutes: 0,
    social_interactions: 1
  });

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleGetRecommendation = async (type: 'motivation' | 'meditation' | 'social' | 'lifestyle') => {
    await getPersonalizedRecommendation(type);
    loadRecommendations();
  };

  const handleLogLifestyle = async () => {
    await logLifestyle(lifestyleForm);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'typing_pattern': return <Zap className="w-4 h-4" />;
      case 'usage_pattern': return <Clock className="w-4 h-4" />;
      case 'engagement_pattern': return <Activity className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightMessage = (insight: any) => {
    switch (insight.insight_type) {
      case 'typing_pattern':
        return `타이핑 속도 분석: ${insight.insight_data.stressLevel === 'high' ? '스트레스 수준이 높아 보입니다' : '안정적인 상태입니다'}`;
      case 'usage_pattern':
        return `사용 패턴 분석: ${insight.insight_data.sleepPattern === 'night_owl' ? '밤형 인간이시네요' : '아침형 인간이시군요'}`;
      case 'engagement_pattern':
        return `앱 사용 패턴: ${insight.insight_data.engagementLevel} 집중도`;
      default:
        return '행동 패턴을 분석 중입니다';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-gradient">개인화 케어 센터</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          당신만의 맞춤형 정신건강 케어를 경험해보세요. AI가 분석한 개인 패턴을 바탕으로 최적의 케어를 제공합니다.
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            개요
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            맞춤 추천
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            행동 분석
          </TabsTrigger>
          <TabsTrigger value="lifestyle" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            라이프스타일
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 hover-glow cursor-pointer" onClick={() => handleGetRecommendation('motivation')}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-warm-coral/20 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-warm-coral" />
                </div>
                <h3 className="font-semibold">동기부여</h3>
                <p className="text-sm text-muted-foreground">개인 맞춤형 격려 메시지</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={() => handleGetRecommendation('meditation')}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-calm-blue/20 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-calm-blue" />
                </div>
                <h3 className="font-semibold">명상/호흡</h3>
                <p className="text-sm text-muted-foreground">현재 상태에 맞는 명상법</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={() => findSocialMatches()}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-soft-mint/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-soft-mint" />
                </div>
                <h3 className="font-semibold">소셜 연결</h3>
                <p className="text-sm text-muted-foreground">비슷한 관심사 사용자 매칭</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={() => handleGetRecommendation('lifestyle')}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-warm-lavender/20 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-warm-lavender" />
                </div>
                <h3 className="font-semibold">생활습관</h3>
                <p className="text-sm text-muted-foreground">개인화된 생활패턴 조언</p>
              </div>
            </Card>
          </div>

          {/* Recent Insights Summary */}
          {insights.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                최근 행동 인사이트
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {insights.slice(0, 4).map((insight, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                    {getInsightIcon(insight.insight_type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getInsightMessage(insight)}</p>
                      <Progress value={insight.confidence_score * 100} className="h-2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">개인 맞춤 추천</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleGetRecommendation('motivation')} 
                disabled={isLoading}
                size="sm"
              >
                새 추천 받기
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {rec.recommendation_type === 'motivation' && '💪 동기부여'}
                        {rec.recommendation_type === 'meditation' && '🧘 명상'}
                        {rec.recommendation_type === 'social' && '👥 소셜'}
                        {rec.recommendation_type === 'lifestyle' && '🌟 라이프스타일'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(rec.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <Badge 
                      variant={rec.status === 'pending' ? 'default' : 'secondary'}
                    >
                      {rec.status === 'pending' ? '대기중' : '확인됨'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {rec.content.message && (
                      <p className="text-foreground">{rec.content.message}</p>
                    )}
                    
                    {rec.content.technique && (
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">{rec.content.technique}</h4>
                        <p className="text-sm text-muted-foreground mb-2">소요시간: {rec.content.duration}</p>
                        {rec.content.steps && (
                          <ol className="text-sm space-y-1">
                            {rec.content.steps.map((step: string, index: number) => (
                              <li key={index}>{index + 1}. {step}</li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}
                    
                    {rec.content.suggestion && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">{rec.content.area}</h4>
                        <p className="text-green-700 text-sm mb-2">{rec.content.suggestion}</p>
                        <p className="text-xs text-green-600">예상 효과: {rec.content.impact}</p>
                      </div>
                    )}
                  </div>

                  {rec.status === 'pending' && (
                    <Button 
                      onClick={() => engageWithRecommendation(rec.id)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      이 추천이 도움되었어요
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {recommendations.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">아직 개인화 추천이 없습니다.</p>
                <Button onClick={() => handleGetRecommendation('motivation')}>
                  첫 번째 추천 받기
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <h2 className="text-2xl font-bold">행동 패턴 분석</h2>
          
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{getInsightMessage(insight)}</h3>
                      <Badge variant="outline">
                        신뢰도 {Math.round(insight.confidence_score * 100)}%
                      </Badge>
                    </div>
                    
                    <Progress value={insight.confidence_score * 100} className="h-2" />
                    
                    <div className="text-sm text-muted-foreground">
                      마지막 업데이트: {new Date(insight.last_updated).toLocaleString('ko-KR')}
                    </div>
                    
                    {insight.insight_data && (
                      <div className="bg-background p-3 rounded border text-xs">
                        <pre>{JSON.stringify(insight.insight_data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {insights.length === 0 && (
              <Card className="p-8 text-center">
                <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  아직 분석할 수 있는 행동 패턴이 충분하지 않습니다.
                </p>
                <p className="text-sm text-muted-foreground">
                  앱을 더 사용하시면 개인화된 인사이트를 제공해드릴게요!
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-6">
          <h2 className="text-2xl font-bold">라이프스타일 기록</h2>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">오늘의 컨디션 기록</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">수면 시간</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={lifestyleForm.sleep_hours}
                    onChange={(e) => setLifestyleForm({...lifestyleForm, sleep_hours: parseFloat(e.target.value)})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">수면 품질 (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={lifestyleForm.sleep_quality}
                    onChange={(e) => setLifestyleForm({...lifestyleForm, sleep_quality: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground mt-1">
                    {lifestyleForm.sleep_quality}/5
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">기분 점수 (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={lifestyleForm.mood_score}
                    onChange={(e) => setLifestyleForm({...lifestyleForm, mood_score: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground mt-1">
                    {lifestyleForm.mood_score}/10
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">스트레스 수준 (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={lifestyleForm.stress_level}
                    onChange={(e) => setLifestyleForm({...lifestyleForm, stress_level: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground mt-1">
                    {lifestyleForm.stress_level}/10
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">운동 시간 (분)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={lifestyleForm.exercise_minutes}
                    onChange={(e) => setLifestyleForm({...lifestyleForm, exercise_minutes: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">사회적 상호작용 횟수</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={lifestyleForm.social_interactions}
                    onChange={(e) => setLifestyleForm({...lifestyleForm, social_interactions: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleLogLifestyle}
              className="w-full mt-6"
            >
              <Activity className="w-4 h-4 mr-2" />
              오늘의 컨디션 저장
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizationDashboard;