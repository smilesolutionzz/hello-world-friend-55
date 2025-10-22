import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Heart, 
  Brain, 
  Eye, 
  Volume2, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

interface EarlyScreeningSectionProps {
  assessmentType: string;
  results: Record<string, number>;
  isAnalyzing: boolean;
}

interface RiskFactor {
  id: string;
  name: string;
  description: string;
  level: 'low' | 'moderate' | 'high';
  score: number;
  icon: React.ReactNode;
  recommendation: string;
}

const EarlyScreeningSection = ({ assessmentType, results, isAnalyzing }: EarlyScreeningSectionProps) => {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [overallRiskLevel, setOverallRiskLevel] = useState<'low' | 'moderate' | 'high'>('low');

  useEffect(() => {
    if (!isAnalyzing && Object.keys(results).length > 0) {
      analyzeRiskFactors();
    }
  }, [isAnalyzing, results, assessmentType]);

  const analyzeRiskFactors = () => {
    const factors: RiskFactor[] = [];
    
    // 점수 배열과 평균 계산
    const scoreValues = Object.values(results);
    const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / scoreValues.length;
    const maxPossibleScore = scoreValues.length * 7; // 각 문항 최대 7점
    const scorePercentage = (totalScore / maxPossibleScore) * 100;
    
    console.log(`${assessmentType} 검사 점수 분석:`, {
      assessmentType,
      results,
      scoreValues,
      totalScore,
      averageScore,
      maxPossibleScore,
      scorePercentage
    });
    
    // 검사 유형별 위험요소 분석
    switch (assessmentType) {
      case 'work_stress':
        // 번아웃 위험도 계산 (높은 점수 = 높은 위험)
        const burnoutScore = scorePercentage;
        const burnoutLevel = burnoutScore >= 70 ? 'high' : burnoutScore >= 50 ? 'moderate' : 'low';
        
        // 우울증 위험도 계산 (번아웃과 연관성 고려)
        const depressionScore = Math.min(burnoutScore * 0.8, 100); // 번아웃 점수의 80% 반영
        const depressionLevel = depressionScore >= 60 ? 'high' : depressionScore >= 40 ? 'moderate' : 'low';
        
        factors.push(
          {
            id: 'burnout_risk',
            name: '번아웃 위험',
            description: '직무 스트레스로 인한 번아웃 증후군 발생 가능성',
            level: burnoutLevel,
            score: burnoutScore,
            icon: <Brain className="w-5 h-5" />,
            recommendation: burnoutLevel === 'high' ? '즉시 전문가 상담과 업무 조정이 필요합니다.' :
                           burnoutLevel === 'moderate' ? '정기적인 휴식과 스트레스 관리 기법 실천이 필요합니다.' :
                           '현재 상태를 유지하되 예방적 관리를 계속하세요.'
          },
          {
            id: 'depression_risk',
            name: '우울증 위험',
            description: '지속적인 직무 스트레스로 인한 우울 증상 발생 위험',
            level: depressionLevel,
            score: depressionScore,
            icon: <Heart className="w-5 h-5" />,
            recommendation: depressionLevel === 'high' ? '전문가 상담을 통한 즉시 개입이 필요합니다.' :
                           depressionLevel === 'moderate' ? '전문가 상담을 통한 조기 개입을 고려하세요.' :
                           '전문가 상담을 통한 조기 개입을 고려하세요.'
          }
        );
        break;
        
      case 'temperament':
        // 기질 검사는 각 특성별로 다른 기준을 적용
        const harmAvoidanceScore = Math.min((results.harm_avoidance || 0) * 14.3, 100);
        const rewardDependenceScore = Math.min((results.reward_dependence || 0) * 14.3, 100);
        
        factors.push(
          {
            id: 'anxiety_tendency',
            name: '불안 경향성',
            description: '성격 특성상 불안장애 발생 가능성',
            level: (results.harm_avoidance || 0) > 5 ? 'high' : (results.harm_avoidance || 0) > 3.5 ? 'moderate' : 'low',
            score: harmAvoidanceScore,
            icon: <Shield className="w-5 h-5" />,
            recommendation: harmAvoidanceScore > 70 ? '불안 관리 전문가 상담이 권장됩니다.' :
                           harmAvoidanceScore > 50 ? '위험회피 성향이 높아 불안 관리 기법이 도움이 됩니다.' :
                           '건강한 수준의 신중함을 보이고 있습니다.'
          },
          {
            id: 'social_isolation',
            name: '사회적 고립 위험',
            description: '낮은 사회적 민감성으로 인한 관계 문제 발생 가능성',
            level: (results.reward_dependence || 0) < 2 ? 'high' : (results.reward_dependence || 0) < 3.5 ? 'moderate' : 'low',
            score: Math.max(100 - rewardDependenceScore, 0), // 사회적 민감성이 낮을수록 고립 위험 높음
            icon: <Eye className="w-5 h-5" />,
            recommendation: rewardDependenceScore < 30 ? '사회적 관계 개선을 위한 전문가 도움이 필요합니다.' :
                           rewardDependenceScore < 50 ? '사회적 관계 개선을 위한 소통 기술 향상이 필요합니다.' :
                           '적절한 사회적 관계를 유지하고 있습니다.'
          }
        );
        break;
        
      case 'cognitive':
        // 인지 검사는 높은 점수가 더 좋은 것임 (주의: 다른 검사와 반대!)
        const cognitiveScorePercentage = (averageScore / 7) * 100; // 7점 만점을 100점으로 환산
        const attentionScorePercentage = ((results.attention || averageScore) / 7) * 100;
        
        console.log(`[인지검사 위험도 분석] 평균점수: ${averageScore}, 백분율: ${cognitiveScorePercentage}%`);
        
        factors.push(
          {
            id: 'cognitive_decline',
            name: '인지기능 저하',
            description: '기억력, 집중력 등 인지능력 감소 위험 (점수가 높을수록 인지능력이 좋음)',
            level: cognitiveScorePercentage >= 70 ? 'low' : cognitiveScorePercentage >= 50 ? 'moderate' : 'high',
            score: Math.max(100 - cognitiveScorePercentage, 0), // 인지점수가 낮을수록 위험도 높음
            icon: <Brain className="w-5 h-5" />,
            recommendation: cognitiveScorePercentage >= 70 ? '양호한 인지기능을 유지하고 있습니다. 현재 상태를 유지하세요.' :
                           cognitiveScorePercentage >= 50 ? '인지기능 유지를 위한 지속적 관리가 필요합니다.' :
                           '인지기능 훈련과 정기적인 검진이 권장됩니다.'
          },
          {
            id: 'attention_deficit',
            name: '주의력 결핍',
            description: '집중력 저하 및 주의산만 증상 위험 (점수가 높을수록 주의력이 좋음)',
            level: attentionScorePercentage >= 70 ? 'low' : attentionScorePercentage >= 50 ? 'moderate' : 'high',
            score: Math.max(100 - attentionScorePercentage, 0), // 주의력 점수가 낮을수록 위험도 높음
            icon: <Eye className="w-5 h-5" />,
            recommendation: attentionScorePercentage >= 70 ? '좋은 주의집중력을 보이고 있습니다. 현재 수준을 유지하세요.' :
                           attentionScorePercentage >= 50 ? '주의력 향상을 위한 집중력 훈련이 도움이 됩니다.' :
                           '주의력 향상을 위한 전문적 훈련이 필요합니다.'
          }
        );
        break;
        
      default:
        // 일반 정신건강 검사 - 높은 점수가 더 좋은 정신건강 상태
        const mentalHealthPercentage = (averageScore / 7) * 100;
        
        factors.push(
          {
            id: 'general_mental_health',
            name: '전반적 정신건강',
            description: '심리적 웰빙 상태 및 정신건강 위험도',
            level: mentalHealthPercentage >= 70 ? 'low' : mentalHealthPercentage >= 50 ? 'moderate' : 'high',
            score: Math.max(100 - mentalHealthPercentage, 0), // 정신건강 점수가 낮을수록 위험도 높음
            icon: <Heart className="w-5 h-5" />,
            recommendation: mentalHealthPercentage < 50 ? '전문가 상담을 통한 정신건강 관리가 필요합니다.' :
                           mentalHealthPercentage < 70 ? '정기적인 자기관리와 스트레스 관리가 중요합니다.' :
                           '좋은 정신건강 상태를 유지하고 있습니다.'
          },
          {
            id: 'stress_vulnerability',
            name: '스트레스 취약성',
            description: '스트레스 상황에 대한 적응력 및 회복력',
            level: mentalHealthPercentage >= 70 ? 'low' : mentalHealthPercentage >= 50 ? 'moderate' : 'high',
            score: Math.max(100 - mentalHealthPercentage, 0), // 정신건강과 연관
            icon: <TrendingUp className="w-5 h-5" />,
            recommendation: mentalHealthPercentage < 50 ? '스트레스 관리 전문가의 도움이 필요합니다.' :
                           mentalHealthPercentage < 70 ? '스트레스 관리 기법 습득과 회복력 강화가 필요합니다.' :
                           '적절한 스트레스 대처능력을 갖추고 있습니다.'
          }
        );
    }
    
    setRiskFactors(factors);
    
    // 전체 위험도 계산
    const highRiskCount = factors.filter(f => f.level === 'high').length;
    const moderateRiskCount = factors.filter(f => f.level === 'moderate').length;
    
    if (highRiskCount > 0) {
      setOverallRiskLevel('high');
    } else if (moderateRiskCount > 0) {
      setOverallRiskLevel('moderate');
    } else {
      setOverallRiskLevel('low');
    }
  };

  const getRiskLevelColor = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelText = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'high': return '높음';
      case 'moderate': return '보통';
      case 'low': return '낮음';
      default: return '알 수 없음';
    }
  };

  const getOverallRiskIcon = () => {
    switch (overallRiskLevel) {
      case 'high': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'moderate': return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-6xl mx-auto mb-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AIH 조기 위험요소 체크</h2>
                <p className="text-sm text-muted-foreground">AI 기반 예방적 건강관리 분석</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground">위험요소 분석 중...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <Card className="overflow-hidden border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">AIH 조기 위험요소 체크</h2>
              <p className="text-sm text-muted-foreground">AI 기반 예방적 건강관리 분석 • 차별화된 AIH만의 기능</p>
            </div>
            <div className="flex items-center gap-2">
              {getOverallRiskIcon()}
              <span className="text-sm font-medium">
                전체 위험도: {getRiskLevelText(overallRiskLevel)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* 전체 위험도 요약 */}
          <Alert className={`mb-6 ${overallRiskLevel === 'high' ? 'border-red-200 bg-red-50' : 
            overallRiskLevel === 'moderate' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
            <Info className="h-4 w-4" />
            <AlertDescription className={
              overallRiskLevel === 'high' ? 'text-red-800' : 
              overallRiskLevel === 'moderate' ? 'text-yellow-800' : 'text-green-800'
            }>
              {overallRiskLevel === 'high' && '일부 위험요소가 발견되었습니다. 예방적 관리와 전문가 상담을 권장합니다.'}
              {overallRiskLevel === 'moderate' && '보통 수준의 위험요소가 있습니다. 생활습관 개선과 정기적인 관찰이 필요합니다.'}
              {overallRiskLevel === 'low' && '현재 특별한 위험요소는 발견되지 않았습니다. 현재 상태를 유지하시기 바랍니다.'}
            </AlertDescription>
          </Alert>

          {/* 위험요소별 상세 분석 */}
          <div className="grid md:grid-cols-2 gap-6">
            {riskFactors.map((factor) => (
              <Card key={factor.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {factor.icon}
                      <h3 className="font-semibold">{factor.name}</h3>
                    </div>
                    <Badge className={`${getRiskLevelColor(factor.level)} text-white`}>
                      {getRiskLevelText(factor.level)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {factor.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>위험도</span>
                      <span className="font-medium">{factor.score.toFixed(0)}%</span>
                    </div>
                    <Progress value={factor.score} className="h-2" />
                  </div>
                  
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    💡 {factor.recommendation}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 개인맞춤 예방 가이드 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              개인맞춤 예방 가이드
            </h4>
            <div className="text-sm text-purple-700 space-y-1">
              <p>• 정기적인 자가진단을 통해 변화를 모니터링하세요</p>
              <p>• 스트레스 관리와 충분한 휴식을 취하세요</p>
              <p>• 위험요소가 높은 영역은 전문가 상담을 고려하세요</p>
              <p>• 건강한 생활습관 유지로 예방 효과를 높이세요</p>
            </div>
          </div>

          {/* 법적 고지사항 */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600 border-l-4 border-gray-300">
            <strong>중요 안내:</strong> 본 조기 위험요소 선별은 AI 기반 참고자료이며 의료적 평가를 대체하지 않습니다. 
            실제 증상이 있거나 우려사항이 있는 경우 반드시 의료기관에서 전문의와 상담하시기 바랍니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarlyScreeningSection;