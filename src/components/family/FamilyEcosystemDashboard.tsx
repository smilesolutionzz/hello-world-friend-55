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
import FamilyDataManager from "@/components/family/FamilyDataManager";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    await trackFamilyEvent();
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

  const handlePDFDownload = async () => {
    try {
      const reportData = {
        assessmentType: "family_comprehensive",
        results: {
          overall_wellness_index: wellnessMetrics?.overall_wellness_index || 0,
          collective_harmony: wellnessMetrics?.collective_harmony || 0,
          communication_quality: wellnessMetrics?.communication_quality || 0,
          resilience_index: wellnessMetrics?.resilience_index || 0,
          family_members_count: familyMembers.length,
          completed_assessments: familyMembers.length * 2
        },
        assessmentInfo: {
          title: "가족 생태계 종합 분석 보고서",
          subtitle: "Family Ecosystem Comprehensive Analysis",
          disclaimer: "이 분석은 AI 기반 종합 분석 결과이며, 가족 상담 전문가와의 상담을 권장합니다."
        },
        aiAnalysis: `
가족 생태계 종합 분석 결과

1. 전체 웰빙 지수: ${wellnessMetrics?.overall_wellness_index?.toFixed(1) || 'N/A'}점
   - 가족 조화: ${wellnessMetrics?.collective_harmony?.toFixed(1) || 'N/A'}점
   - 소통 품질: ${wellnessMetrics?.communication_quality?.toFixed(1) || 'N/A'}점
   - 회복력: ${wellnessMetrics?.resilience_index?.toFixed(1) || 'N/A'}점

2. 가족 구성: 총 ${familyMembers.length}명의 구성원

3. 분석 소견:
   - 가족 전체적으로 안정적인 소통 패턴을 보이고 있습니다.
   - 구성원 간의 상호작용이 긍정적으로 나타나고 있습니다.
   - 지속적인 관찰과 개선을 통해 더 나은 가족 관계를 구축할 수 있습니다.

4. 권장사항:
   - 정기적인 가족 회의 시간을 가져보세요.
   - 서로의 감정을 표현하는 시간을 만들어보세요.
   - 가족 구성원별 개별 상담을 고려해보세요.
        `,
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase.functions.invoke('generate-premium-pdf', {
        body: reportData
      });

      if (error) throw error;

      if (data?.htmlContent) {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.htmlContent);
          newWindow.document.close();
          setTimeout(() => {
            newWindow.print();
          }, 500);
        }
      }
    } catch (error) {
      console.error('PDF 생성 오류:', error);
    }
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
                    <div className="text-xs text-muted-foreground">{member.relationship}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            개요
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            가족관리
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            활동기록
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            AI 인사이트
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            종합리포트
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 hover-glow cursor-pointer" onClick={() => setSelectedTab('management')}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">가족 구성원</h3>
                <p className="text-sm text-muted-foreground">구성원 추가 및 관리</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={() => setSelectedTab('timeline')}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-warm-coral/20 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warm-coral" />
                </div>
                <h3 className="font-semibold">활동 기록</h3>
                <p className="text-sm text-muted-foreground">검사 및 상담 이력 확인</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={() => setSelectedTab('insights')}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-calm-blue/20 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-calm-blue" />
                </div>
                <h3 className="font-semibold">AI 분석</h3>
                <p className="text-sm text-muted-foreground">개인화된 인사이트 확인</p>
              </div>
            </Card>

            <Card className="p-4 hover-glow cursor-pointer" onClick={() => setSelectedTab('reports')}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-soft-mint/20 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-soft-mint" />
                </div>
                <h3 className="font-semibold">종합 리포트</h3>
                <p className="text-sm text-muted-foreground">월간/연간 발달 보고서</p>
              </div>
            </Card>
          </div>

          {/* 가족 상태 요약 */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="font-semibold">이번 주 활동</h4>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {familyMembers.length * 2}개
              </div>
              <p className="text-sm text-muted-foreground">검사 및 관찰 기록</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold">발달 진전도</h4>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">87%</div>
              <p className="text-sm text-muted-foreground">지난 달 대비 향상</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-semibold">가족 만족도</h4>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">92점</div>
              <p className="text-sm text-muted-foreground">100점 만점</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <FamilyDataManager />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <TimelineTab 
            familyId={familyMembers[0]?.family_id || ""} 
            members={familyMembers.map(m => ({
              id: m.id,
              name: m.name,
              age_group: m.age && m.age < 3 ? 'infant' : m.age && m.age < 18 ? 'child' : 'adult',
              relation: m.relationship
            }))} 
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">AI 맞춤 인사이트</h2>
            <Button onClick={runComprehensiveAnalysis} disabled={isLoading}>
              {isLoading ? "분석 중..." : "새로고침"}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                이번 주 주요 발견
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-green-800 mb-2">✨ 긍정적 변화</p>
                  <p className="text-sm text-green-700">아이의 언어 표현이 지난주 대비 30% 증가했습니다.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-800 mb-2">📈 발달 진전</p>
                  <p className="text-sm text-blue-700">사회성 점수가 꾸준히 향상되고 있습니다.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                맞춤 추천
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="font-medium text-yellow-800 mb-2">🎯 집중 영역</p>
                  <p className="text-sm text-yellow-700">감정 조절 영역에 더 관심을 기울여보세요.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-medium text-purple-800 mb-2">💡 활동 제안</p>
                  <p className="text-sm text-purple-700">주 2-3회 함께하는 독서 시간을 만들어보세요.</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">종합 발달 리포트</h2>
            <Button onClick={handlePDFDownload}>
              <Download className="w-4 h-4 mr-2" />
              PDF 다운로드
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">이번 달 요약</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>완료한 검사</span>
                  <Badge variant="secondary">8개</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>평균 점수</span>
                  <Badge variant="default">78점</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>진전 영역</span>
                  <Badge className="bg-green-100 text-green-800">언어발달</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">다음 달 목표</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  감정 조절 능력 향상
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  사회성 기술 강화
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  정기 평가 지속
                </li>
              </ul>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyEcosystemDashboard;