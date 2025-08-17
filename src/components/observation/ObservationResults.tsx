import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  FileText, 
  Brain, 
  Target,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ObservationResultsProps {
  session: any;
  onBack: () => void;
}

const ObservationResults = ({ session, onBack }: ObservationResultsProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const calculateOverallAverage = (scores: any): string => {
    const validScores = Object.values(scores)
      .filter((s: any) => s && typeof s.average === 'number')
      .map((s: any) => s.average as number);
    
    if (validScores.length === 0) return 'N/A';
    
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return (sum / validScores.length).toFixed(1);
  };

  const getDomainDisplayName = (domain: string) => {
    const names = {
      child_development: '아동발달',
      psychology: '심리상담',
      elderly_care: '노인케어',
      workplace: '직장적응',
      learning: '학습능력',
      family: '가족상담',
      medical: '의료재활'
    };
    return names[domain as keyof typeof names] || domain;
  };

  const getRiskLevelInfo = (level: string) => {
    const info = {
      low: { text: '양호', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
      medium: { text: '보통', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
      high: { text: '주의', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle }
    };
    return info[level as keyof typeof info] || info.medium;
  };

  const generatePDFReport = async () => {
    try {
      setGenerating(true);

      const { data, error } = await supabase.functions.invoke('generate-observation-report', {
        body: {
          sessionData: session,
          reportType: 'comprehensive'
        }
      });

      if (error) throw error;

      // In a real implementation, this would trigger PDF download
      toast({
        title: "PDF 리포트 생성 완료",
        description: "전문 관찰 리포트가 생성되었습니다.",
      });

      // For demo purposes, show the generated content
      console.log('Generated report:', data);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF 생성 오류",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const analysisData = session.analysis_data || {};
  const scores = analysisData.scores || {};
  const riskLevel = analysisData.riskLevel || 'medium';
  const riskInfo = getRiskLevelInfo(riskLevel);

  // Prepare chart data
  const radarData = Object.entries(scores).map(([category, data]: [string, any]) => ({
    category: category.length > 8 ? category.substring(0, 8) + '...' : category,
    score: data.average || 0,
    fullCategory: category
  }));

  const barData = Object.entries(scores).map(([category, data]: [string, any]) => ({
    category: category.length > 10 ? category.substring(0, 10) + '...' : category,
    score: data.average || 0,
    fullCategory: category
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{session.session_name}</h2>
          <p className="text-muted-foreground">{getDomainDisplayName(session.domain)} 관찰 결과</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={generatePDFReport}
            disabled={generating}
            className="bg-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'PDF 생성 중...' : 'PDF 다운로드'}
          </Button>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">관찰자</div>
                <div className="font-medium">{session.observer_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">관찰 기간</div>
                <div className="font-medium">
                  {new Date(session.observation_period_start).toLocaleDateString('ko-KR')} ~{' '}
                  {new Date(session.observation_period_end).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <riskInfo.icon className={`h-5 w-5 ${riskInfo.color}`} />
              <div>
                <div className="text-sm text-muted-foreground">위험도</div>
                <Badge className={`${riskInfo.bgColor} ${riskInfo.color}`}>
                  {riskInfo.text}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">전체 평균</div>
                <div className="font-medium">
                  {calculateOverallAverage(scores)}/5.0
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">종합 개요</TabsTrigger>
          <TabsTrigger value="scores">점수 분석</TabsTrigger>
          <TabsTrigger value="analysis">AI 분석</TabsTrigger>
          <TabsTrigger value="recommendations">권고사항</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  영역별 점수 분포
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value, name) => [value, '점수']} />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  종합 프로파일
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar
                      name="점수"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(scores).map(([category, data]: [string, any]) => (
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {data.average.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{category}</div>
                    <Progress value={(data.average / 5) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>상세 점수 분석</CardTitle>
              <CardDescription>
                각 영역별 세부 점수와 통계 정보
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(scores).map(([category, data]: [string, any]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{category}</h3>
                      <Badge variant="outline">{data.average.toFixed(1)}점</Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">평균 점수</div>
                        <div className="font-medium">{data.average.toFixed(1)}/5.0</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">총점</div>
                        <div className="font-medium">{data.total}/{data.count * 5}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">항목 수</div>
                        <div className="font-medium">{data.count}개</div>
                      </div>
                    </div>
                    
                    <Progress value={(data.average / 5) * 100} className="mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI 전문 분석
              </CardTitle>
              <CardDescription>
                관찰 데이터를 바탕으로 한 전문가급 AI 분석 결과
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-muted p-6 rounded-lg whitespace-pre-line">
                  {session.ai_analysis || '분석 결과가 없습니다.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                맞춤형 권고사항
              </CardTitle>
              <CardDescription>
                분석 결과를 바탕으로 한 개별화된 개입 전략
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.recommendations && session.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {session.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 
                                  rec.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {rec.priority === 'high' ? '높음' : 
                           rec.priority === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{rec.description}</p>
                      {rec.actions && (
                        <div>
                          <h4 className="font-medium mb-2">구체적 실행방안:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {rec.actions.map((action: string, actionIndex: number) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  권고사항이 생성되지 않았습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ObservationResults;