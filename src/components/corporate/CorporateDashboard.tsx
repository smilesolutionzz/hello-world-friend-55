import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  DollarSign,
  BarChart3,
  UserCheck,
  Brain,
  Shield,
  Lightbulb,
  Calendar,
  PieChart,
  Activity
} from 'lucide-react';
import { useCorporateAnalytics } from '@/hooks/useCorporateAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const CorporateDashboard = () => {
  const {
    loading,
    wellnessData,
    turnoverPrediction,
    teamConflicts,
    interventionStrategies,
    roiAnalysis,
    organizations,
    currentOrganization,
    analyzeOrganizationalWellness,
    predictTurnoverRisk,
    detectTeamConflicts,
    generateInterventionStrategies,
    calculateROIMetrics,
    loadOrganizations,
    loadOrganizationData,
    loadWellnessHistory,
    loadCorporatePrograms
  } = useCorporateAnalytics();

  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [wellnessHistory, setWellnessHistory] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      loadOrganizationData(selectedOrgId);
      loadData();
    }
  }, [selectedOrgId]);

  const loadData = async () => {
    if (!selectedOrgId) return;

    try {
      await Promise.all([
        analyzeOrganizationalWellness(selectedOrgId),
        predictTurnoverRisk(selectedOrgId),
        detectTeamConflicts(selectedOrgId),
        loadWellnessHistory(selectedOrgId).then(setWellnessHistory),
        loadCorporatePrograms(selectedOrgId).then(setPrograms)
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelVariant = (level: string) => {
    switch (level) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  if (!selectedOrgId) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                기업 조직 선택
              </CardTitle>
              <CardDescription>
                분석할 조직을 선택해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {organizations.map((org) => (
                  <Card key={org.id} className="cursor-pointer hover:bg-accent" onClick={() => setSelectedOrgId(org.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{org.name}</h3>
                          <p className="text-sm text-muted-foreground">{org.industry} • {org.employee_count}명</p>
                        </div>
                        <Badge variant="outline">{org.size_category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">기업 심리건강 분석 대시보드</h1>
          <p className="text-muted-foreground mt-1">
            {currentOrganization?.name} • {currentOrganization?.employee_count}명
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedOrgId('')}>
            조직 변경
          </Button>
          <Button onClick={loadData} disabled={loading}>
            {loading ? '분석 중...' : '데이터 새로고침'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">전체 현황</TabsTrigger>
          <TabsTrigger value="wellness">웰빙 분석</TabsTrigger>
          <TabsTrigger value="predictions">예측 분석</TabsTrigger>
          <TabsTrigger value="interventions">개입 전략</TabsTrigger>
          <TabsTrigger value="roi">ROI 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">전체 웰빙 지수</p>
                    <p className="text-2xl font-bold">{wellnessData?.overall_wellness_score || 0}/100</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={wellnessData?.overall_wellness_score || 0} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">번아웃 위험군</p>
                    <p className="text-2xl font-bold text-red-500">{wellnessData?.burnout_risk_count || 0}명</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">팀 결속력</p>
                    <p className="text-2xl font-bold">{wellnessData?.team_cohesion_score?.toFixed(1) || 0}/10</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={(wellnessData?.team_cohesion_score || 0) * 10} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">생산성 지수</p>
                    <p className="text-2xl font-bold">{wellnessData?.productivity_index?.toFixed(1) || 0}/10</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={(wellnessData?.productivity_index || 0) * 10} className="mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* Department Analysis */}
          {wellnessData?.department_scores && (
            <Card>
              <CardHeader>
                <CardTitle>부서별 웰빙 현황</CardTitle>
                <CardDescription>각 부서의 심리건강 상태를 비교 분석합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(wellnessData.department_scores).map(([dept, score]) => ({ 
                    department: dept, 
                    score: Number(score) 
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Team Conflict Analysis */}
          {teamConflicts && (
            <Card>
              <CardHeader>
                <CardTitle>팀 갈등 위험 분석</CardTitle>
                <CardDescription>부서별 갈등 위험도와 개입 필요성을 평가합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {teamConflicts.departments_analysis.map((dept) => (
                    <div key={dept.department_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{dept.department_name}</h4>
                        <p className="text-sm text-muted-foreground">팀 조화도: {dept.team_harmony_score}/100</p>
                      </div>
                      <Badge variant={getRiskLevelVariant(dept.conflict_risk_level)}>
                        {dept.conflict_risk_level.toUpperCase()} 위험
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wellness" className="space-y-6">
          {/* Wellness Trends */}
          <Card>
            <CardHeader>
              <CardTitle>웰빙 지수 추이</CardTitle>
              <CardDescription>지난 30일간의 조직 웰빙 변화를 추적합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={wellnessHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric_date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="overall_wellness_score" stroke="#8884d8" name="전체 웰빙" />
                  <Line type="monotone" dataKey="employee_satisfaction" stroke="#82ca9d" name="직원 만족도" />
                  <Line type="monotone" dataKey="productivity_index" stroke="#ffc658" name="생산성 지수" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Level Analysis */}
          {wellnessData?.level_scores && (
            <Card>
              <CardHeader>
                <CardTitle>직급별 웰빙 분석</CardTitle>
                <CardDescription>직급에 따른 심리건강 상태 차이를 분석합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(wellnessData.level_scores).map(([level, score]) => ({ 
                    level, 
                    score: Number(score) 
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* Turnover Risk */}
          {turnoverPrediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  이직 위험 예측
                </CardTitle>
                <CardDescription>심리적 요인을 기반으로 한 이직 위험도 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      고위험군 {turnoverPrediction.high_risk_employees.length}명 감지됨
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-semibold">부서별 이직 위험도</h4>
                    {Object.entries(turnoverPrediction.department_risk_levels).map(([dept, risk]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span>{dept}</span>
                        <Badge variant={getRiskLevelVariant(risk as string)}>
                          {(risk as string).toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">주요 예측 요인</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {turnoverPrediction.predictive_factors.map((factor, index) => (
                        <li key={index} className="text-sm">{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">유지 전략</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {turnoverPrediction.retention_strategies.map((strategy, index) => (
                        <li key={index} className="text-sm">{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Conflict Predictions */}
          {teamConflicts && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  팀 갈등 예측
                </CardTitle>
                <CardDescription>팀 내 갈등 발생 가능성과 예방 전략</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      {teamConflicts.overall_team_health}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-semibold">우선 개입 필요 사항</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {teamConflicts.priority_interventions.map((intervention, index) => (
                        <li key={index} className="text-sm">{intervention}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">개입 전략</h2>
              <p className="text-muted-foreground">맞춤형 조직 개선 프로그램</p>
            </div>
            <Button 
              onClick={() => generateInterventionStrategies(selectedOrgId, { type: 'comprehensive' })}
              disabled={loading}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              전략 생성
            </Button>
          </div>

          {interventionStrategies.length > 0 && (
            <div className="grid gap-6">
              {interventionStrategies.map((strategy, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{strategy.title}</CardTitle>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">대상</h4>
                        <div className="space-y-1">
                          <p className="text-sm">직급: {strategy.target_demographic.level.join(', ')}</p>
                          <p className="text-sm">부서: {strategy.target_demographic.department.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">기간</h4>
                        <p className="text-sm">{strategy.duration_weeks}주</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">예상 결과</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {strategy.expected_outcomes.map((outcome, i) => (
                            <li key={i} className="text-sm">{outcome}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">성공 지표</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {strategy.success_metrics.map((metric, i) => (
                            <li key={i} className="text-sm">{metric}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">실행 단계</h4>
                      <ol className="list-decimal pl-5 space-y-1">
                        {strategy.implementation_steps.map((step, i) => (
                          <li key={i} className="text-sm">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">ROI 분석</h2>
              <p className="text-muted-foreground">심리건강 투자 대비 비즈니스 성과</p>
            </div>
            <Button 
              onClick={() => calculateROIMetrics(selectedOrgId, { 
                start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                investment_amount: 100000
              })}
              disabled={loading}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              ROI 계산
            </Button>
          </div>

          {roiAnalysis && (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">투자 수익률</p>
                      <p className="text-3xl font-bold text-green-600">{roiAnalysis.roi_percentage}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">생산성 향상</p>
                      <p className="text-3xl font-bold text-blue-600">{roiAnalysis.productivity_improvement}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">이직률 감소</p>
                      <p className="text-3xl font-bold text-purple-600">{roiAnalysis.turnover_reduction}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>비용 절약 분석</CardTitle>
                  <CardDescription>심리건강 프로그램을 통한 구체적 절약 효과</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">이직률 감소</p>
                      <p className="text-2xl font-bold">₩{roiAnalysis.cost_savings.reduced_turnover?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">생산성 향상</p>
                      <p className="text-2xl font-bold">₩{roiAnalysis.cost_savings.increased_productivity?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">결근 감소</p>
                      <p className="text-2xl font-bold">₩{roiAnalysis.cost_savings.reduced_absenteeism?.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>핵심 성과 지표</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {roiAnalysis.key_performance_indicators.map((kpi, index) => (
                      <li key={index} className="text-sm">{kpi}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ROI 향상 권장사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {roiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};