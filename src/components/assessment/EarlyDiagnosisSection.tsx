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

interface EarlyDiagnosisSectionProps {
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

const EarlyDiagnosisSection = ({ assessmentType, results, isAnalyzing }: EarlyDiagnosisSectionProps) => {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [overallRiskLevel, setOverallRiskLevel] = useState<'low' | 'moderate' | 'high'>('low');

  useEffect(() => {
    if (!isAnalyzing && Object.keys(results).length > 0) {
      analyzeRiskFactors();
    }
  }, [isAnalyzing, results, assessmentType]);

  const analyzeRiskFactors = () => {
    const factors: RiskFactor[] = [];
    
    // 평균 점수 계산
    const averageScore = Object.values(results).reduce((sum, score) => sum + score, 0) / Object.values(results).length;
    
    // 검사 유형별 위험요소 분석
    switch (assessmentType) {
      case 'work_stress':
        factors.push(
          {
            id: 'burnout_risk',
            name: '번아웃 위험',
            description: '직무 스트레스로 인한 번아웃 증후군 발생 가능성',
            level: averageScore > 5 ? 'high' : averageScore > 3.5 ? 'moderate' : 'low',
            score: Math.min(averageScore * 14.3, 100), // 7점 만점을 100점으로 환산
            icon: <Brain className="w-5 h-5" />,
            recommendation: '정기적인 휴식과 스트레스 관리 기법 실천이 필요합니다.'
          },
          {
            id: 'depression_risk',
            name: '우울증 위험',
            description: '지속적인 직무 스트레스로 인한 우울 증상 발생 위험',
            level: averageScore > 4.5 ? 'high' : averageScore > 3 ? 'moderate' : 'low',
            score: Math.min((averageScore - 1) * 16.7, 100),
            icon: <Heart className="w-5 h-5" />,
            recommendation: '전문가 상담을 통한 조기 개입을 고려하세요.'
          }
        );
        break;
        
      case 'temperament':
        factors.push(
          {
            id: 'anxiety_tendency',
            name: '불안 경향성',
            description: '성격 특성상 불안장애 발생 가능성',
            level: (results.harm_avoidance || 0) > 5 ? 'high' : (results.harm_avoidance || 0) > 3.5 ? 'moderate' : 'low',
            score: Math.min((results.harm_avoidance || 0) * 14.3, 100),
            icon: <Shield className="w-5 h-5" />,
            recommendation: '위험회피 성향이 높아 불안 관리 기법이 도움이 됩니다.'
          },
          {
            id: 'social_isolation',
            name: '사회적 고립 위험',
            description: '낮은 사회적 민감성으로 인한 관계 문제 발생 가능성',
            level: (results.reward_dependence || 0) < 2 ? 'high' : (results.reward_dependence || 0) < 3.5 ? 'moderate' : 'low',
            score: Math.max(100 - (results.reward_dependence || 0) * 14.3, 0),
            icon: <Eye className="w-5 h-5" />,
            recommendation: '사회적 관계 개선을 위한 소통 기술 향상이 필요합니다.'
          }
        );
        break;
        
      case 'cognitive':
        factors.push(
          {
            id: 'cognitive_decline',
            name: '인지기능 저하',
            description: '기억력, 집중력 등 인지능력 감소 위험',
            level: averageScore < 3 ? 'high' : averageScore < 4 ? 'moderate' : 'low',
            score: Math.max(100 - averageScore * 14.3, 0),
            icon: <Brain className="w-5 h-5" />,
            recommendation: '인지기능 훈련과 정기적인 검진이 권장됩니다.'
          },
          {
            id: 'attention_deficit',
            name: '주의력 결핍',
            description: '집중력 저하 및 주의산만 증상 위험',
            level: (results.attention || averageScore) < 3.5 ? 'high' : (results.attention || averageScore) < 4.5 ? 'moderate' : 'low',
            score: Math.max(100 - (results.attention || averageScore) * 14.3, 0),
            icon: <Eye className="w-5 h-5" />,
            recommendation: '주의력 향상을 위한 집중력 훈련이 도움이 됩니다.'
          }
        );
        break;
        
      default:
        factors.push(
          {
            id: 'general_mental_health',
            name: '전반적 정신건강',
            description: '심리적 웰빙 상태 및 정신건강 위험도',
            level: averageScore > 5 ? 'low' : averageScore > 3.5 ? 'moderate' : 'high',
            score: averageScore * 14.3,
            icon: <Heart className="w-5 h-5" />,
            recommendation: '정기적인 자기관리와 스트레스 관리가 중요합니다.'
          },
          {
            id: 'stress_vulnerability',
            name: '스트레스 취약성',
            description: '스트레스 상황에 대한 적응력 및 회복력',
            level: averageScore < 3 ? 'high' : averageScore < 4.5 ? 'moderate' : 'low',
            score: Math.max(100 - averageScore * 14.3, 0),
            icon: <TrendingUp className="w-5 h-5" />,
            recommendation: '스트레스 관리 기법 습득과 회복력 강화가 필요합니다.'
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
            <strong>중요 안내:</strong> 본 조기 위험요소 체크는 AI 기반 참고자료이며 전문적 평가를 대체하지 않습니다. 
            실제 증상이 있거나 우려사항이 있는 경우 반드시 전문의와 상담하시기 바랍니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarlyDiagnosisSection;