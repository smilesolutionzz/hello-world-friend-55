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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">AI 에이전트들이 분석 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">초개인화 AI 에이전트</h2>
          <p className="text-muted-foreground">
            당신의 니즈를 미리 파악하여 능동적으로 최적화된 솔루션을 제안합니다
          </p>
        </div>
        <Button onClick={loadDashboard} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          실시간 분석
        </Button>
      </div>

      {/* 능동적 제안 카드들 */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            지금 이런 지원이 필요하신 것 같아요
          </h3>
          
          {insights.map((insight) => {
            const agent = aiAgentService.getAgent(insight.agentId);
            if (!agent) return null;

            return (
              <Card key={insight.agentId} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getAgentIcon(agent.specialty)}
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <Badge variant={getUrgencyColor(insight.urgency)}>
                            {insight.urgency === 'high' ? '긴급' : 
                             insight.urgency === 'medium' ? '중요' : '일반'}
                          </Badge>
                          <span>신뢰도: {Math.round(insight.confidence * 100)}%</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Progress value={insight.confidence * 100} className="w-20" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-foreground">{insight.message}</p>
                  
                  {insight.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">제안 사항:</h4>
                      <ul className="space-y-1">
                        {insight.actionItems.map((item, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insight.suggestedAgentCollaboration && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        협업 에이전트
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {insight.suggestedAgentCollaboration.map((agentId) => {
                          const collaborator = aiAgentService.getAgent(agentId);
                          return collaborator ? (
                            <Badge key={agentId} variant="outline" className="text-xs">
                              {collaborator.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {insight.needsConfirmation && (
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        onClick={() => handleInsightConfirmation(insight, true)}
                        disabled={processingConfirmation === insight.agentId}
                        className="flex-1"
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
                        className="flex-1"
                      >
                        다음에 하겠습니다
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">AI 에이전트</TabsTrigger>
          <TabsTrigger value="memory">개인화 메모리</TabsTrigger>
          <TabsTrigger value="insights">인사이트 히스토리</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {getAgentIcon(agent.specialty)}
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <CardDescription>{agent.personality}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">전문 능력</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-sm">
                        <span>능동성 수준</span>
                        <span>{Math.round(agent.proactiveThreshold * 100)}%</span>
                      </div>
                      <Progress value={agent.proactiveThreshold * 100} className="mt-1" />
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