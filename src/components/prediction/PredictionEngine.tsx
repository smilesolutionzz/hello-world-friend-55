import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  AlertTriangle, 
  Users, 
  Star,
  Calendar,
  BarChart3,
  Brain,
  Heart
} from "lucide-react";

interface PredictionData {
  [key: string]: any;
}

interface PredictionEngineProps {
  predictions: PredictionData;
  confidence: string;
  ageGroup: 'infant' | 'child' | 'adult';
  age: number;
}

const PredictionEngine = ({ predictions, confidence, ageGroup, age }: PredictionEngineProps) => {
  const [selectedTab, setSelectedTab] = useState("treatment");

  // Helper functions to safely access Korean prediction data
  const getTreatmentData = () => {
    const treatmentKey = "개인별 치료 성과 예측";
    return predictions[treatmentKey] || {};
  };

  const getDevelopmentData = () => {
    const developmentKey = "발달/증상 예측 모델";
    return predictions[developmentKey] || {};
  };

  const getFamilyData = () => {
    const familyKey = "가족 상호작용 예측";
    return predictions[familyKey] || {};
  };

  const getConfidenceColor = (conf: string) => {
    return conf === 'high' ? 'text-green-600' : conf === 'medium' ? 'text-yellow-600' : 'text-red-600';
  };

  const getConfidenceBadge = (conf: string) => {
    const configs = {
      high: { color: "bg-green-100 text-green-700", label: "높음", icon: "🎯" },
      medium: { color: "bg-yellow-100 text-yellow-700", label: "보통", icon: "⚡" },
      low: { color: "bg-red-100 text-red-700", label: "낮음", icon: "⚠️" }
    };
    
    const config = configs[conf as keyof typeof configs] || configs.medium;
    
    return (
      <Badge className={config.color}>
        {config.icon} 신뢰도 {config.label}
      </Badge>
    );
  };

  const getRiskBadge = (level: string) => {
    const configs = {
      low: { color: "bg-green-100 text-green-700", label: "낮음" },
      medium: { color: "bg-yellow-100 text-yellow-700", label: "보통" },
      high: { color: "bg-red-100 text-red-700", label: "높음" }
    };
    
    const config = configs[level?.toLowerCase() as keyof typeof configs] || configs.medium;
    
    return <Badge className={config.color}>위험도 {config.label}</Badge>;
  };

  const getTimingLabel = (timing: string) => {
    const labels = {
      immediate: "즉시 시작 (권장)",
      within_month: "1개월 내 시작",
      within_3months: "3개월 내 시작",
      "지금": "지금 시작 (권장)"
    };
    return labels[timing as keyof typeof labels] || timing;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-brand-gradient">AI 미래 예측 분석</h2>
        </div>
        
        <p className="text-muted-foreground">
          과거 유사 사례 데이터를 기반으로 한 개인 맞춤형 예측 결과입니다
        </p>
        
        <div className="flex items-center justify-center gap-4">
          {getConfidenceBadge(confidence)}
          <Badge variant="outline">
            {ageGroup === 'infant' ? '유아' : ageGroup === 'child' ? '아동/청소년' : '성인'} ({age}세)
          </Badge>
        </div>
      </div>

      {/* Prediction Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="treatment" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            치료 성과 예측
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            발달 예측
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            가족 영향 예측
          </TabsTrigger>
        </TabsList>

        <TabsContent value="treatment" className="space-y-6">
          {/* Treatment Success Prediction */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {getTreatmentData()["유사 케이스 100명 중 성공률"]?.성공률 || 0}%
                </div>
                <p className="text-lg text-muted-foreground">
                  당신과 비슷한 상황 100명 중 <span className="font-semibold text-primary">{getTreatmentData()["유사 케이스 100명 중 성공률"]?.성공률 || 0}명</span>이 상담으로 개선되었습니다
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Expected Sessions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    예상 상담 횟수
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {getTreatmentData()["예상 상담 횟수"]?.최소 || 5}-{getTreatmentData()["예상 상담 횟수"]?.최대 || 12}회
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        평균 {getTreatmentData()["예상 상담 횟수"]?.평균 || 8}회
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improvement Probability */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    개선 확률
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">3개월 후:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${getTreatmentData()["3개월 후 개선 확률"]?.확률 || 70}%` }}
                          />
                        </div>
                        <span className="font-semibold text-primary">
                          {getTreatmentData()["3개월 후 개선 확률"]?.확률 || 70}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">6개월 후:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${getTreatmentData()["6개월 후 개선 확률"]?.확률 || 85}%` }}
                          />
                        </div>
                        <span className="font-semibold text-green-600">
                          {getTreatmentData()["6개월 후 개선 확률"]?.확률 || 85}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropout Risk */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-yellow-800">중도 포기 위험도</h3>
                      {getRiskBadge(getTreatmentData()["중도 포기 위험도"]?.위험도 || "보통")}
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      중도 포기 가능성이 있습니다
                    </p>
                    <div className="space-y-1">
                      <h4 className="font-medium text-yellow-800 text-sm">예방 전략:</h4>
                      <div className="flex items-center gap-2 text-sm text-yellow-700">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full" />
                        {getTreatmentData()["중도 포기 위험도"]?.["구체적 방지 전략"] || "상담 초기 단계에서 목표 설정 및 지속적인 동기 부여"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Current vs Future Development */}
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  {ageGroup === 'infant' ? '발달 수준' : ageGroup === 'child' ? '발달/학습 능력' : '심리적 웰빙'} 예측
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg text-muted-foreground mb-1">현재 상태</div>
                    <div className="text-3xl font-bold text-gray-600">
                      {getDevelopmentData()["현재 상태"] || "안정적"}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg text-muted-foreground mb-1">개입 없을 시</div>
                    <div className="text-3xl font-bold text-red-500">
                      {getDevelopmentData()["개입하지 않을 경우 위험도"]?.위험도 || 40}%
                    </div>
                    <div className="text-xs text-red-600 mt-1">위험도</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg text-muted-foreground mb-1">상담 받을 시</div>
                    <div className="text-3xl font-bold text-green-500">
                      {getDevelopmentData()["상담 받을 경우 개선 확률"]?.확률 || 85}%
                    </div>
                    <div className="text-xs text-green-600 mt-1">개선 확률</div>
                  </div>
                </div>
              </div>

              {/* Risk and Timing */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    개입하지 않을 경우
                  </h4>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {getDevelopmentData()["개입하지 않을 경우 위험도"]?.위험도 || 40}%
                    </div>
                    <div className="text-sm text-red-700">
                      {ageGroup === 'infant' ? '발달 지연' : ageGroup === 'child' ? '학습/정서 문제' : '증상 악화'} 위험
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    최적 개입 시기
                  </h4>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 mb-1">
                      {getTimingLabel(getDevelopmentData()["최적 개입 시기"] || "지금")}
                    </div>
                    <div className="text-sm text-green-700">
                      지금이 골든타임입니다
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Care Impact */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  가족 케어 효과
                </h4>
                <p className="text-blue-700">
                  {getDevelopmentData()["부모/가족 케어 필요도 및 효과"]?.효과 || "가족의 정서적 지원은 도움이 됩니다"}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Individual Change Impact */}
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-foreground">가족 전체에 미치는 영향</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        +{getFamilyData()["개인 변화가 가족에 미치는 긍정적 영향"]?.영향도 || 60}%
                      </div>
                      <div className="text-sm text-green-700">
                        개인 변화가 가족에 미치는 긍정적 영향
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {getFamilyData()["가족 전체 만족도 변화 예측"]?.변화 || "긍정적"}
                      </div>
                      <div className="text-sm text-blue-700">
                        가족 전체 만족도 상승 예상
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crisis Risk Prediction */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-800 mb-2">가족 위기 상황 예측</h4>
                    <p className="text-sm text-orange-700 mb-3">
                      현재 패턴이 지속될 경우 <span className="font-bold">{getFamilyData()["가족 위기 상황 예측"]?.시기 || "1년 이내"}</span> 후 
                      <span className="font-bold"> {getFamilyData()["가족 위기 상황 예측"]?.위험도 || "보통"}</span> 위험도로 갈등 심화 우려
                    </p>
                    <div className="space-y-1">
                      <h5 className="font-medium text-orange-800 text-sm">예방 행동:</h5>
                      <div className="flex items-center gap-2 text-sm text-orange-700">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                        {getFamilyData()["가족 위기 상황 예측"]?.근거 || "지속적인 관찰이 필요함"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Therapy Recommendation */}
              {(getFamilyData()["가족 치료 필요성 판단"]?.필요성 !== "낮음") && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-1">가족 상담 권장</h4>
                      <p className="text-sm text-purple-700">
                        {getFamilyData()["가족 치료 필요성 판단"]?.근거 || "개인 상담과 함께 가족 상담을 병행하시면 더 큰 효과를 얻을 수 있습니다"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => window.print()}>
          <BarChart3 className="w-4 h-4 mr-2" />
          예측 결과 저장
        </Button>
        <Button onClick={() => navigate('/assessment')}>
          <Target className="w-4 h-4 mr-2" />
          전문가 상담 신청
        </Button>
      </div>
    </div>
  );
};

export default PredictionEngine;