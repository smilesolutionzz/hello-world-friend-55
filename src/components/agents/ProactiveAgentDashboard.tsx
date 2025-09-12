import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Heart, GraduationCap, Shield, Users, AlertTriangle,
  CheckCircle, Clock, Zap, MessageSquare, Target, TrendingUp,
  Lightbulb, Settings, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { aiAgentService, type ProactiveInsight, type AIAgent, type UserMemory } from '@/services/aiAgentService';
import { supabase } from '@/integrations/supabase/client';

interface AgentStats {
  totalInteractions: number;
  successRate: number;
  avgResponseTime: number;
  specialtyMatch: number;
}

const ProactiveAgentDashboard = () => {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingConfirmation, setProcessingConfirmation] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 에이전트 목록 로드
      const agentList = aiAgentService.getAgents();
      setAgents(agentList);

      // 사용자 메모리 로드
      const memory = await aiAgentService.loadUserMemory(user.id);
      setUserMemory(memory);

      // 능동적 인사이트 생성
      const proactiveInsights = await aiAgentService.generateProactiveInsights(user.id);
      setInsights(proactiveInsights);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('대시보드 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsightConfirmation = async (insight: ProactiveInsight, accepted: boolean) => {
    setProcessingConfirmation(insight.agentId);
    
    try {
      if (accepted) {
        // 에이전트 협업 계획 생성
        if (insight.suggestedAgentCollaboration) {
          const collaborationPlan = await aiAgentService.generateCollaborationPlan(
            [insight.agentId, ...insight.suggestedAgentCollaboration],
            userMemory!
          );
          
          toast.success('에이전트 협업이 시작되었습니다!', {
            description: collaborationPlan.slice(0, 100) + '...'
          });
        } else {
          toast.success(`${aiAgentService.getAgent(insight.agentId)?.name}가 지원을 시작합니다!`);
        }

        // 메모리 업데이트 (수락된 제안 기록)
        if (userMemory) {
          const updatedMemory = {
            ...userMemory,
            shortTermMemory: {
              ...userMemory.shortTermMemory,
              acceptedInsights: [
                ...(userMemory.shortTermMemory.acceptedInsights || []),
                { ...insight, acceptedAt: new Date() }
              ]
            }
          };
          await aiAgentService.updateUserMemory(updatedMemory);
          setUserMemory(updatedMemory);
        }
      } else {
        toast.info('제안이 거절되었습니다. 다른 방법을 찾아보겠습니다.');
      }

      // 해당 인사이트 제거
      setInsights(prev => prev.filter(i => i.agentId !== insight.agentId));

    } catch (error) {
      console.error('Error processing confirmation:', error);
      toast.error('처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingConfirmation(null);
    }
  };

  const getAgentIcon = (specialty: string) => {
    switch (specialty) {
      case 'development': return <Brain className="h-5 w-5" />;
      case 'emotion': return <Heart className="h-5 w-5" />;
      case 'education': return <GraduationCap className="h-5 w-5" />;
      case 'health': return <Shield className="h-5 w-5" />;
      case 'family': return <Users className="h-5 w-5" />;
      case 'crisis': return <AlertTriangle className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <Brain className="h-16 w-16 mx-auto text-primary animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI 에이전트 분석 중</h3>
            <p className="text-muted-foreground text-sm">
              당신의 데이터를 분석하여 맞춤형 제안을 준비하고 있습니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 능동적 제안 카드들 */}
      {insights.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    지금 이런 지원이 필요하신 것 같아요
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI가 분석한 맞춤형 제안입니다
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              실시간 분석
            </Badge>
          </div>
          
          {insights.map((insight) => {
            const agent = aiAgentService.getAgent(insight.agentId);
            if (!agent) return null;

            return (
              <Card key={insight.agentId} className="group border-l-4 border-l-primary shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                        {getAgentIcon(agent.specialty)}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg text-gray-800">{agent.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-3">
                          <Badge 
                            variant={getUrgencyColor(insight.urgency)}
                            className="font-medium"
                          >
                            {insight.urgency === 'high' ? '🚨 긴급' : 
                             insight.urgency === 'medium' ? '⚡ 중요' : '💡 일반'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            신뢰도: {Math.round(insight.confidence * 100)}%
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Progress value={insight.confidence * 100} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">정확도</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="p-4 bg-white/80 rounded-lg border border-primary/10">
                    <p className="text-foreground leading-relaxed">{insight.message}</p>
                  </div>
                  
                  {insight.actionItems.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-primary" />
                        제안 사항
                      </h4>
                      <div className="grid gap-2">
                        {insight.actionItems.map((item, index) => (
                          <div key={index} className="flex items-start text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                            <CheckCircle className="h-4 w-4 mr-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-green-800">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insight.suggestedAgentCollaboration && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold mb-3 flex items-center text-gray-800">
                        <Users className="h-4 w-4 mr-2 text-purple-600" />
                        협업 에이전트
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {insight.suggestedAgentCollaboration.map((agentId) => {
                          const collaborator = aiAgentService.getAgent(agentId);
                          return collaborator ? (
                            <Badge key={agentId} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                              {getAgentIcon(collaborator.specialty)}
                              <span className="ml-1">{collaborator.name}</span>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {insight.needsConfirmation && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => handleInsightConfirmation(insight, true)}
                        disabled={processingConfirmation === insight.agentId}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium"
                        size="lg"
                      >
                        {processingConfirmation === insight.agentId ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            처리 중...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            네, 도움 받겠습니다
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleInsightConfirmation(insight, false)}
                        disabled={processingConfirmation === insight.agentId}
                        className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                        size="lg"
                      >
                        나중에 하겠습니다
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 에이전트 없이도 상태 표시 */}
      {insights.length === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <CardContent className="py-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">모든 것이 순조롭네요! 🎉</h3>
              <p className="text-muted-foreground">
                현재 특별한 지원이 필요한 상황은 없습니다. AI 에이전트들이 계속 모니터링하고 있어요.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="agents" className="data-[state=active]:bg-white">AI 에이전트</TabsTrigger>
          <TabsTrigger value="memory" className="data-[state=active]:bg-white">개인화 메모리</TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-white">인사이트 히스토리</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                      {getAgentIcon(agent.specialty)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-gray-800">{agent.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {agent.personality}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-800 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-primary" />
                      전문 능력
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">능동성 수준</span>
                      <span className="font-medium text-gray-800">{Math.round(agent.proactiveThreshold * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${agent.proactiveThreshold * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          {userMemory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    단기 메모리 (최근 7일)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>활동 기록: {Object.keys(userMemory.shortTermMemory).length}개</div>
                    <div>감정 상태: {userMemory.shortTermMemory.emotionalEntries?.length || 0}개 기록</div>
                    <div>학습 진행: {Object.keys(userMemory.shortTermMemory.learningProgress || {}).length}개 목표</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    장기 메모리 (프로필)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>발달 히스토리: {Object.keys(userMemory.longTermMemory.developmentProgress || {}).length}개 영역</div>
                    <div>교육 목표: {userMemory.longTermMemory.educationGoals?.length || 0}개</div>
                    <div>가족 구성원: {userMemory.familyContext.members?.length || 0}명</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">아직 개인화 메모리가 구축되지 않았습니다.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  플랫폼을 더 사용하시면 AI가 당신을 더 잘 이해하게 됩니다.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {userMemory?.shortTermMemory.acceptedInsights?.length > 0 ? (
            <div className="space-y-3">
              {userMemory.shortTermMemory.acceptedInsights.map((insight: any, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{insight.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(insight.acceptedAt).toLocaleDateString()} - 
                          {aiAgentService.getAgent(insight.agentId)?.name}
                        </p>
                      </div>
                      <Badge variant="outline">완료</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">아직 수락한 제안이 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProactiveAgentDashboard;