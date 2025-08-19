import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  Network, 
  Target,
  AlertTriangle,
  Heart,
  Brain,
  Activity,
  BarChart3,
  Calendar,
  Settings,
  Lightbulb,
  TreePine,
  Zap,
  Clock,
  ArrowLeft,
  Home
} from "lucide-react";
import { useFamilyEcosystem } from "@/hooks/useFamilyEcosystem";
import TimelineTab from "@/components/timeline/TimelineTab";
import { useNavigate } from "react-router-dom";

const FamilyEcosystemDashboard = () => {
  const navigate = useNavigate();
  const {
    familyMembers,
    familyDynamics,
    interventionStrategies,
    generationalPatterns,
    wellnessMetrics,
    emotionalContagions,
    isLoading,
    analyzeFamilyDynamics,
    detectEmotionalContagion,
    generateInterventionStrategies,
    analyzeGenerationalPatterns,
    calculateWellnessIndex,
    runComprehensiveAnalysis,
    trackFamilyEvent
  } = useFamilyEcosystem();

  const [selectedTab, setSelectedTab] = useState("overview");
  const [newEvent, setNewEvent] = useState({
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    impactLevel: 5,
    affectedMembers: []
  });

  const handleTrackEvent = async () => {
    await trackFamilyEvent(newEvent);
    setNewEvent({
      type: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      impactLevel: 5,
      affectedMembers: []
    });
  };

  const getMemberWeatherIcon = (member: any) => {
    if (!member.currentState) return '❓';
    return member.currentState.weatherIcon || '☁️';
  };

  const getWellnessColor = (index: number) => {
    if (index >= 80) return 'text-green-600';
    if (index >= 60) return 'text-yellow-600';
    if (index >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Button>
          <div className="flex-1" />
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-gradient">가족 생태계 분석</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          가족 전체를 하나의 시스템으로 분석하여 구성원 간의 상호작용과 영향을 실시간으로 모니터링합니다.
        </p>
      </div>

      {/* Family Wellness Overview */}
      {wellnessMetrics && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">가족 웰빙 지수</h2>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Family Wellness Index
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getWellnessColor(wellnessMetrics.overall_wellness_index)}`}>
                {wellnessMetrics.overall_wellness_index?.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">전체 지수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {wellnessMetrics.collective_harmony?.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">가족 조화</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {wellnessMetrics.communication_quality?.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">소통 품질</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {wellnessMetrics.resilience_index?.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">회복력</div>
            </div>
          </div>

          {/* Family Members Weather */}
          <div className="space-y-3">
            <h3 className="font-semibold">구성원별 현재 상태</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {familyDynamics?.memberStates?.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <div className="text-2xl">{getMemberWeatherIcon(member)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            개요
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            타임라인
          </TabsTrigger>
          <TabsTrigger value="dynamics" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            가족 역학
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            개입 전략
          </TabsTrigger>
          <TabsTrigger value="generations" className="flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            세대 분석
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            이벤트 추적
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 hover-glow cursor-pointer" onClick={runComprehensiveAnalysis}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">종합 분석</h3>
                <p className="text-sm text-muted-foreground">가족 전체 생태계 분석</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={detectEmotionalContagion}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-warm-coral/20 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-warm-coral" />
                </div>
                <h3 className="font-semibold">감정 전염</h3>
                <p className="text-sm text-muted-foreground">구성원 간 감정 영향 분석</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={generateInterventionStrategies}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-calm-blue/20 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-calm-blue" />
                </div>
                <h3 className="font-semibold">개입 전략</h3>
                <p className="text-sm text-muted-foreground">맞춤형 치료 계획 수립</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={analyzeGenerationalPatterns}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-soft-mint/20 rounded-2xl flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-soft-mint" />
                </div>
                <h3 className="font-semibold">세대 패턴</h3>
                <p className="text-sm text-muted-foreground">3세대 패턴 분석</p>
              </div>
            </Card>
          </div>

          {/* Recent Insights */}
          {familyDynamics?.insights && familyDynamics.insights.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                최근 가족 인사이트
              </h3>
              <div className="space-y-4">
                {familyDynamics.insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-background rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        insight.severity === 'high' ? 'bg-red-100 text-red-600' :
                        insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">{insight.message}</p>
                        {insight.recommendations && (
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {insight.recommendations.map((rec: string, i: number) => (
                              <li key={i}>• {rec}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <TimelineTab familyId={""} members={[]} />
        </TabsContent>

        <TabsContent value="dynamics" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">가족 역학 분석</h2>
            <Button onClick={analyzeFamilyDynamics} disabled={isLoading}>
              {isLoading ? '분석 중...' : '새로 분석'}
            </Button>
          </div>

          {/* Correlation Network */}
          {familyDynamics?.correlations && familyDynamics.correlations.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                구성원 간 상관관계
              </h3>
              <div className="space-y-4">
                {familyDynamics.correlations.map((corr, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{corr.member1}</div>
                      <div className="text-muted-foreground">→</div>
                      <div className="font-medium">{corr.member2}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={corr.strength > 0.7 ? 'destructive' : corr.strength > 0.5 ? 'default' : 'secondary'}>
                        {corr.type}
                      </Badge>
                      <div className="text-right">
                        <div className="font-semibold">{Math.round(corr.strength * 100)}%</div>
                        <div className="text-xs text-muted-foreground">강도</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Emotional Contagion */}
          {emotionalContagions.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                감정 전염 패턴
              </h3>
              <div className="space-y-3">
                {emotionalContagions.map((contagion, index) => (
                  <div key={index} className="p-3 bg-background rounded border">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        {contagion.emotionType} 감정이 {contagion.timeDelay}시간 지연으로 전파됨
                      </div>
                      <Progress value={contagion.strength * 100} className="w-24 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">개입 전략</h2>
            <Button onClick={generateInterventionStrategies} disabled={isLoading}>
              새 전략 생성
            </Button>
          </div>

          <div className="grid gap-4">
            {interventionStrategies.map((strategy, index) => (
              <Card key={strategy.id || index} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {strategy.strategy_type === 'family_therapy' && '👨‍👩‍👧‍👦 가족 치료'}
                        {strategy.strategy_type === 'individual_counseling' && '🧑‍⚕️ 개별 상담'}
                        {strategy.strategy_type === 'group_activity' && '🤝 그룹 활동'}
                        {strategy.strategy_type === 'environmental_change' && '🏠 환경 변화'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        순서: {strategy.intervention_order}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">효과 예측:</div>
                      <div className="font-semibold text-primary">
                        {Math.round((strategy.predicted_effectiveness || 0) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-foreground">{strategy.strategy_content?.description}</p>
                    
                    {strategy.strategy_content?.timeline && (
                      <div className="text-sm text-muted-foreground">
                        예상 기간: {strategy.strategy_content.timeline}
                      </div>
                    )}
                    
                    {strategy.strategy_content?.successMetrics && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">성공 지표:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {strategy.strategy_content.successMetrics.map((metric: string, i: number) => (
                            <li key={i}>• {metric}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={
                      strategy.status === 'completed' ? 'default' :
                      strategy.status === 'in_progress' ? 'secondary' :
                      'outline'
                    }>
                      {strategy.status === 'recommended' && '권장됨'}
                      {strategy.status === 'scheduled' && '예정됨'}
                      {strategy.status === 'in_progress' && '진행 중'}
                      {strategy.status === 'completed' && '완료됨'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}

            {interventionStrategies.length === 0 && (
              <Card className="p-8 text-center">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  아직 개입 전략이 생성되지 않았습니다.
                </p>
                <Button onClick={generateInterventionStrategies}>
                  첫 번째 전략 생성하기
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="generations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">3세대 케어 연계</h2>
            <Button onClick={analyzeGenerationalPatterns} disabled={isLoading}>
              패턴 분석
            </Button>
          </div>

          <div className="grid gap-4">
            {generationalPatterns.map((pattern, index) => (
              <Card key={pattern.id || index} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {pattern.pattern_type === 'trauma_transmission' && '🔄 트라우마 전수'}
                      {pattern.pattern_type === 'coping_mechanisms' && '🛡️ 대처 방식'}
                      {pattern.pattern_type === 'communication_styles' && '💬 소통 스타일'}
                    </h3>
                    <Badge variant="outline">
                      강도: {Math.round((pattern.pattern_strength || 0) * 100)}%
                    </Badge>
                  </div>

                  <p className="text-muted-foreground">{pattern.pattern_description}</p>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">영향받는 세대:</span>
                    {pattern.generations_involved?.map((gen: number) => (
                      <Badge key={gen} variant="secondary">
                        {gen}세대
                      </Badge>
                    ))}
                  </div>

                  {pattern.intervention_recommendations && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">권장 개입:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {pattern.intervention_recommendations.interventions?.map((intervention: string, i: number) => (
                          <li key={i}>• {intervention}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {generationalPatterns.length === 0 && (
              <Card className="p-8 text-center">
                <TreePine className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  세대 간 패턴 분석이 아직 실행되지 않았습니다.
                </p>
                <Button onClick={analyzeGenerationalPatterns}>
                  패턴 분석 시작하기
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">가족 이벤트 추적</h2>
          </div>

          {/* Add New Event */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">새 이벤트 추가</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">이벤트 유형</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="">선택하세요</option>
                  <option value="academic_stress">학업 스트레스</option>
                  <option value="job_change">직장 변화</option>
                  <option value="moving">이사</option>
                  <option value="birth">출산</option>
                  <option value="illness">질병</option>
                  <option value="relationship">관계 변화</option>
                  <option value="financial">경제적 변화</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">영향 수준 (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEvent.impactLevel}
                  onChange={(e) => setNewEvent({...newEvent, impactLevel: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {newEvent.impactLevel}/10
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">설명</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="이벤트에 대한 자세한 설명을 입력하세요"
              />
            </div>
            
            <Button 
              onClick={handleTrackEvent}
              disabled={!newEvent.type || !newEvent.description}
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              이벤트 기록하기
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyEcosystemDashboard;