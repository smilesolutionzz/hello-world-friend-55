import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  period: string;
  institution_info: any;
  summary: {
    total_members: number;
    active_members: number;
    total_tests: number;
    total_observations: number;
    avg_test_score: number;
    improvement_rate: number;
  };
  member_analytics: any[];
  top_performers: any[];
  areas_of_concern: any[];
  recommendations: string[];
}

interface ComprehensiveReportProps {
  adminId: string;
  institutionInfo: any;
}

export default function ComprehensiveReport({ adminId, institutionInfo }: ComprehensiveReportProps) {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    generateReportData();
  }, [adminId, selectedPeriod]);

  const generateReportData = async () => {
    try {
      setLoading(true);

      // 기간 계산
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '1month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // 기관 회원 조회
      const { data: members, error: membersError } = await supabase
        .from('institution_members')
        .select('*')
        .eq('institution_admin_id', adminId);

      if (membersError) throw membersError;

      const activeMembers = members.filter(m => m.status === 'active');
      let totalTests = 0;
      let totalObservations = 0;
      let totalScores = 0;
      let scoreCount = 0;
      const memberAnalytics: any[] = [];

      // 각 회원의 데이터 분석
      for (const member of members) {
        if (!member.member_user_id) continue;

        // 해당 기간의 테스트 조회
        const { data: tests, count: testCount } = await supabase
          .from('test_results')
          .select('*, test_types(name)', { count: 'exact' })
          .eq('user_id', member.member_user_id)
          .gte('completed_at', startDate.toISOString())
          .lte('completed_at', endDate.toISOString());

        // 해당 기간의 관찰일지 조회
        const { data: observations, count: obsCount } = await supabase
          .from('observation_logs')
          .select('*', { count: 'exact' })
          .eq('user_id', member.member_user_id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        const memberTestCount = testCount || 0;
        const memberObsCount = obsCount || 0;
        totalTests += memberTestCount;
        totalObservations += memberObsCount;

        // 평균 점수 계산
        const scores = tests?.map(t => t.scores?.total_score || 0).filter(s => s > 0) || [];
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        
        if (avgScore > 0) {
          totalScores += avgScore;
          scoreCount++;
        }

        // 개선율 계산
        const sortedTests = tests?.sort((a, b) => 
          new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
        ) || [];
        
        let improvementRate = 0;
        if (sortedTests.length >= 2) {
          const firstScore = sortedTests[0].scores?.total_score || 0;
          const lastScore = sortedTests[sortedTests.length - 1].scores?.total_score || 0;
          if (firstScore > 0) {
            improvementRate = ((lastScore - firstScore) / firstScore) * 100;
          }
        }

        memberAnalytics.push({
          member_name: member.member_name,
          test_count: memberTestCount,
          observation_count: memberObsCount,
          avg_score: avgScore,
          improvement_rate: improvementRate,
          status: member.status,
          last_activity: tests?.[0]?.completed_at || observations?.[0]?.created_at || member.created_at
        });
      }

      // 상위 성과자 (평균 점수 기준)
      const topPerformers = memberAnalytics
        .filter(m => m.avg_score > 0)
        .sort((a, b) => b.avg_score - a.avg_score)
        .slice(0, 5);

      // 주의 대상 (낮은 점수 또는 부진한 개선율)
      const areasOfConcern = memberAnalytics
        .filter(m => m.avg_score > 0 && (m.avg_score < 60 || m.improvement_rate < -10))
        .sort((a, b) => a.avg_score - b.avg_score)
        .slice(0, 5);

      // 권장사항 생성
      const recommendations = generateRecommendations(memberAnalytics, totalTests, totalObservations);

      const report: ReportData = {
        period: getPeriodLabel(selectedPeriod),
        institution_info: institutionInfo,
        summary: {
          total_members: members.length,
          active_members: activeMembers.length,
          total_tests: totalTests,
          total_observations: totalObservations,
          avg_test_score: scoreCount > 0 ? totalScores / scoreCount : 0,
          improvement_rate: calculateOverallImprovementRate(memberAnalytics)
        },
        member_analytics: memberAnalytics,
        top_performers: topPerformers,
        areas_of_concern: areasOfConcern,
        recommendations
      };

      setReportData(report);

    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "리포트 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (analytics: any[], totalTests: number, totalObservations: number) => {
    const recommendations: string[] = [];
    
    const lowPerformers = analytics.filter(m => m.avg_score > 0 && m.avg_score < 60).length;
    const inactiveMembers = analytics.filter(m => m.test_count === 0 && m.observation_count === 0).length;
    const improvingMembers = analytics.filter(m => m.improvement_rate > 10).length;
    
    if (lowPerformers > analytics.length * 0.3) {
      recommendations.push("30% 이상의 회원이 평균 점수 60점 미만입니다. 개별 맞춤 지원이 필요합니다.");
    }
    
    if (inactiveMembers > 0) {
      recommendations.push(`${inactiveMembers}명의 회원이 해당 기간 동안 활동이 없습니다. 참여 독려가 필요합니다.`);
    }
    
    if (improvingMembers > analytics.length * 0.5) {
      recommendations.push("50% 이상의 회원이 개선을 보이고 있습니다. 현재 프로그램을 유지하시기 바랍니다.");
    }
    
    if (totalTests < analytics.length * 2) {
      recommendations.push("회원당 평균 검사 횟수가 부족합니다. 정기적인 검사 일정을 수립하시기 바랍니다.");
    }
    
    if (totalObservations < analytics.length) {
      recommendations.push("관찰일지 작성이 부족합니다. 체계적인 관찰 기록을 권장합니다.");
    }
    
    return recommendations;
  };

  const calculateOverallImprovementRate = (analytics: any[]) => {
    const validRates = analytics.filter(m => m.improvement_rate !== 0);
    if (validRates.length === 0) return 0;
    return validRates.reduce((sum, m) => sum + m.improvement_rate, 0) / validRates.length;
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1month': return '최근 1개월';
      case '3months': return '최근 3개월';
      case '6months': return '최근 6개월';
      case '1year': return '최근 1년';
      default: return '최근 6개월';
    }
  };

  const generatePDFReport = async () => {
    if (!reportData) return;

    try {
      setGeneratingPDF(true);

      const { data, error } = await supabase.functions.invoke('generate-institution-report', {
        body: { reportData }
      });

      if (error) throw error;

      // PDF 다운로드
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.download = `${institutionInfo?.institution_name || '기관'}_종합리포트_${reportData.period}.pdf`;
      link.click();

      toast({
        title: "PDF 리포트 생성 완료",
        description: "리포트가 다운로드되었습니다.",
      });

    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF 생성 실패",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const formatScore = (score: number) => score.toFixed(1);
  const formatPercent = (rate: number) => rate.toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">종합 리포트</h2>
          <p className="text-muted-foreground">기관의 전체 현황과 회원 분석 리포트</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">최근 1개월</SelectItem>
              <SelectItem value="3months">최근 3개월</SelectItem>
              <SelectItem value="6months">최근 6개월</SelectItem>
              <SelectItem value="1year">최근 1년</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generatePDFReport} 
            disabled={!reportData || generatingPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            {generatingPDF ? '생성 중...' : 'PDF 다운로드'}
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">리포트를 생성하는 중...</p>
          </CardContent>
        </Card>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">총 회원</p>
                    <p className="text-2xl font-bold">{reportData.summary.total_members}</p>
                    <p className="text-xs text-muted-foreground">
                      활성: {reportData.summary.active_members}명
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">평균 점수</p>
                    <p className="text-2xl font-bold">{formatScore(reportData.summary.avg_test_score)}</p>
                    <p className="text-xs text-muted-foreground">
                      총 {reportData.summary.total_tests}회 검사
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">전체 개선율</p>
                    <p className="text-2xl font-bold">
                      {formatPercent(reportData.summary.improvement_rate)}%
                    </p>
                    <p className="text-xs text-muted-foreground">평균 개선도</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">관찰일지</p>
                    <p className="text-2xl font-bold">{reportData.summary.total_observations}</p>
                    <p className="text-xs text-muted-foreground">{reportData.period}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">전체 개요</TabsTrigger>
              <TabsTrigger value="top-performers">우수 회원</TabsTrigger>
              <TabsTrigger value="concerns">주의 대상</TabsTrigger>
              <TabsTrigger value="recommendations">권장사항</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>회원별 활동 현황</CardTitle>
                  <CardDescription>{reportData.period} 기간의 모든 회원 활동 데이터</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.member_analytics.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{member.member_name}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>검사: {member.test_count}회</span>
                              <span>관찰: {member.observation_count}회</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          {member.avg_score > 0 && (
                            <Badge variant="outline">
                              평균 {formatScore(member.avg_score)}점
                            </Badge>
                          )}
                          {member.improvement_rate !== 0 && (
                            <Badge variant={member.improvement_rate > 0 ? "default" : "destructive"}>
                              {member.improvement_rate > 0 ? '+' : ''}{formatPercent(member.improvement_rate)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="top-performers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                    우수 회원 (상위 5명)
                  </CardTitle>
                  <CardDescription>평균 점수 기준 상위 성과자</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData.top_performers.length > 0 ? (
                    <div className="space-y-3">
                      {reportData.top_performers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{member.member_name}</p>
                              <p className="text-sm text-muted-foreground">
                                검사 {member.test_count}회, 관찰 {member.observation_count}회
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800">
                              {formatScore(member.avg_score)}점
                            </Badge>
                            {member.improvement_rate > 0 && (
                              <p className="text-sm text-green-600">
                                +{formatPercent(member.improvement_rate)}% 개선
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      해당 기간에 검사를 완료한 회원이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="concerns">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                    주의 대상 회원
                  </CardTitle>
                  <CardDescription>특별한 관심이 필요한 회원들</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData.areas_of_concern.length > 0 ? (
                    <div className="space-y-3">
                      {reportData.areas_of_concern.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium">{member.member_name}</p>
                            <p className="text-sm text-muted-foreground">
                              검사 {member.test_count}회, 관찰 {member.observation_count}회
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive">
                              {formatScore(member.avg_score)}점
                            </Badge>
                            {member.improvement_rate < 0 && (
                              <p className="text-sm text-red-600">
                                {formatPercent(member.improvement_rate)}% 감소
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                      <p className="text-muted-foreground">모든 회원이 양호한 상태입니다!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>권장사항 및 개선방안</CardTitle>
                  <CardDescription>데이터 분석을 바탕으로 한 운영 개선 제안</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                    
                    {reportData.recommendations.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                        <p className="text-muted-foreground">현재 운영 상태가 양호합니다!</p>
                        <p className="text-sm text-muted-foreground">지속적인 모니터링을 권장합니다.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">기간을 선택하여 리포트를 생성하세요.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}