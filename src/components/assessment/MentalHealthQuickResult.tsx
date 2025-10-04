import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SocialShareButtons from '@/components/social/SocialShareButtons';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExpertAnalysisSection } from './ExpertAnalysisSection';
import { PremiumTestCTA } from './PremiumTestCTA';
import { 
  Brain, 
  Heart, 
  Lightbulb, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

const levelConfig = {
  excellent: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    icon: CheckCircle,
    message: '훌륭한 통합건강 상태입니다!'
  },
  good: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    icon: TrendingUp,
    message: '양호한 통합건강 상태입니다.'
  },
  fair: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-800',
    icon: AlertTriangle,
    message: '관리가 필요한 상태입니다.'
  },
  poor: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-800',
    icon: AlertTriangle,
    message: '전문적인 도움이 필요할 수 있습니다.'
  }
};

const recommendations = {
  excellent: [
    '현재 상태를 잘 유지하세요',
    '꾸준한 자기관리가 중요합니다',
    '주변 사람들과의 관계를 소중히 하세요',
    '새로운 도전을 통해 성장해보세요'
  ],
  good: [
    '규칙적인 운동을 해보세요',
    '충분한 수면을 취하세요',
    '스트레스 관리법을 익혀보세요',
    '취미 활동을 늘려보세요'
  ],
  fair: [
    '전문가와 상담을 고려해보세요',
    '휴식과 여가시간을 늘리세요',
    '신뢰할 수 있는 사람과 대화하세요',
    '명상이나 요가를 시도해보세요'
  ],
  poor: [
    '전문가 상담을 강력히 권합니다',
    '충분한 휴식을 취하세요',
    '가족이나 친구의 도움을 받으세요',
    '작은 목표부터 차근차근 시작하세요'
  ]
};

interface MentalHealthQuickResultProps {
  result: any;
  onRestart: () => void;
}

export const MentalHealthQuickResult: React.FC<MentalHealthQuickResultProps> = ({ 
  result, 
  onRestart 
}) => {
  const navigate = useNavigate();
  const config = levelConfig[result.level as keyof typeof levelConfig];
  const IconComponent = config.icon;
  const progressValue = (result.averageScore / 5) * 100;
  const [expertAnalysis, setExpertAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    analyzeResults();
  }, [result]);

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-test-results', {
        body: {
          testType: 'mental-health-quick',
          results: {
            score: result.averageScore,
            level: result.level,
            total: result.totalScore,
            average: result.averageScore
          }
        }
      });

      if (error) throw error;
      setExpertAnalysis(data.analysis || '분석 결과를 생성하는 중 문제가 발생했습니다.');
    } catch (error) {
      console.error('Analysis error:', error);
      setExpertAnalysis('전문가 분석을 불러오는데 실패했습니다. 나중에 다시 시도해주세요.');
      toast({
        title: "분석 실패",
        description: "전문가 분석을 생성할 수 없습니다.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 주요 결과 */}
      <Card className={`${config.bgColor}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`${config.color} p-4 rounded-full`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">통합건강 검사 결과</CardTitle>
          <CardDescription className="text-lg">
            {config.message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 점수 표시 */}
          <div className="text-center space-y-4">
            <div>
              <Badge className={`${config.color} text-white text-lg px-6 py-2 mb-4`}>
                {result.levelText}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>종합 점수</span>
                <span>{result.averageScore.toFixed(1)}/5.0</span>
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>
          </div>

          {/* 상세 분석 */}
          <div className="bg-white/70 rounded-lg p-6 space-y-4">
            <h4 className="font-semibold flex items-center text-lg">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              ✨ AI 전문가 분석 결과
            </h4>
            <div className="prose max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed">
                총 {Object.keys(result.answers).length}개 항목을 종합 분석한 결과, 
                평균 {result.averageScore.toFixed(1)}점으로 '{result.levelText}' 상태입니다.
              </p>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {result.level === 'excellent' 
                    ? `🌟 **탁월한 통합건강 상태입니다!**

현재 매우 안정적이고 건강한 정신건강 상태를 유지하고 계십니다. 스트레스 관리, 감정 조절, 대인관계 등 모든 영역에서 우수한 균형을 보이고 있습니다.

**유지 및 발전 방법:**
• 현재의 건강한 패턴과 습관들을 지속적으로 유지하세요
• 주변 사람들에게 긍정적 영향을 미치는 멘토 역할을 고려해보세요  
• 새로운 도전과 성장 기회를 적극적으로 추구하세요
• 정기적인 자기 점검을 통해 현재 상태를 모니터링하세요

현재 상태를 자랑스러워하시고, 이를 바탕으로 더 큰 목표를 향해 나아가시기 바랍니다.`
                    : result.level === 'good'
                    ? `✨ **양호한 통합건강 상태입니다.**

전반적으로 건강한 정신상태를 유지하고 있으나, 일부 영역에서 개선의 여지가 있습니다. 적절한 관리를 통해 더욱 안정적인 상태로 발전시킬 수 있습니다.

**개선 및 발전 방법:**
• 규칙적인 운동과 충분한 수면으로 기본 컨디션을 더욱 강화하세요
• 스트레스 관리 기법(명상, 호흡법 등)을 학습하고 실천하세요
• 긍정적인 인간관계를 더욱 적극적으로 발전시켜 나가세요
• 취미나 여가 활동을 통해 정서적 만족감을 높이세요

현재 상태가 양호하므로 조금만 더 노력하면 탁월한 수준에 도달할 수 있습니다.`
                    : result.level === 'fair'
                    ? `⚠️ **관리가 필요한 상태입니다.**

일부 영역에서 어려움을 겪고 있으며, 적극적인 관리와 개선 노력이 필요한 상태입니다. 조기에 적절한 대처를 한다면 충분히 회복 가능합니다.

**구체적 개선 방법:**
• 스트레스 요인을 파악하고 단계적으로 해결해 나가세요
• 신뢰할 수 있는 사람들과 고민을 나누고 지지를 받으세요
• 충분한 휴식과 자기 돌봄 시간을 의무적으로 확보하세요
• 전문가 상담을 고려해보시기 바랍니다

현재 상태는 일시적일 가능성이 높으므로, 포기하지 마시고 꾸준히 관리해 나가시기 바랍니다.`
                    : `🚨 **전문적인 도움이 필요합니다.**

현재 여러 영역에서 어려움을 겪고 있는 상태로, 전문가의 도움을 받으시는 것을 강력히 권장합니다. 혼자 해결하려 하지 마시고 적절한 지원을 받으시기 바랍니다.

**즉시 실행 방법:**
• 정신건강 전문가나 상담사와 상담 일정을 잡으세요
• 가족이나 가까운 친구들에게 현재 상황을 알리고 도움을 요청하세요
• 기본적인 자기 관리(수면, 식사, 운동)부터 차근차근 시작하세요
• 위기 상황 시 연락할 수 있는 지원 체계를 마련하세요

어려운 시기이지만 적절한 도움을 받으면 반드시 회복할 수 있습니다. 용기를 내어 첫 걸음을 내디디세요.`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 맞춤 추천사항 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              맞춤 추천사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations[result.level as keyof typeof recommendations].map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              예방 관리법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">규칙적인 생활</p>
                  <p className="text-xs text-muted-foreground">일정한 수면과 식사 패턴 유지</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Brain className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">스트레스 관리</p>
                  <p className="text-xs text-muted-foreground">명상, 운동, 취미활동</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">사회적 관계</p>
                  <p className="text-xs text-muted-foreground">가족, 친구와의 소통 증진</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 전문가 상세 해석 */}
      <ExpertAnalysisSection 
        analysis={expertAnalysis}
        isLoading={isAnalyzing}
        testType="mental-health-quick"
      />

      {/* 프리미엄 테스트 CTA */}
      <PremiumTestCTA 
        currentTestType="mental-health-quick"
        title="더 정확한 정신건강 진단이 필요하신가요?"
        description="프리미엄 정신건강 전문 검사로 30개 이상의 심층 질문과 전문의 수준의 상세 분석을 받아보세요."
      />

      {/* 주의사항 및 안내 */}
      {(result.level === 'fair' || result.level === 'poor') && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-800 mb-2">전문가 상담 권장</h4>
                <p className="text-sm text-orange-700">
                  현재 상태가 지속되거나 악화된다면 통합건강 전문가와의 상담을 받으시길 권합니다. 
                  조기 개입이 빠른 회복에 도움이 됩니다.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  전문가 상담 알아보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onRestart}>
          다시 검사하기
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          결과 저장하기
        </Button>
      </div>
    </div>
  );
};