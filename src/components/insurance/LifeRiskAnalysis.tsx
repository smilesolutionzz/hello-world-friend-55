import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, AlertTriangle, Heart, Home, Car } from "lucide-react";

interface LifeRiskAnalysisProps {
  assessmentData: {
    stressLevel?: number;
    anxietyLevel?: number;
    depressionLevel?: number;
    overallScore?: number;
    ageGroup?: string;
  };
  familyData?: {
    members?: number;
    hasChildren?: boolean;
  };
}

const LifeRiskAnalysis: React.FC<LifeRiskAnalysisProps> = ({ 
  assessmentData, 
  familyData = {} 
}) => {
  // 생활 위험도 계산
  const calculateRiskLevel = () => {
    const { stressLevel = 50, anxietyLevel = 50, overallScore = 75 } = assessmentData;
    const riskScore = (stressLevel + anxietyLevel + (100 - overallScore)) / 3;
    
    if (riskScore > 70) return { level: 'high', label: '높음', color: 'destructive' };
    if (riskScore > 40) return { level: 'medium', label: '보통', color: 'warning' };
    return { level: 'low', label: '낮음', color: 'success' };
  };

  // 맞춤형 보험 카테고리 추천
  const getInsuranceRecommendations = () => {
    const risk = calculateRiskLevel();
    const { members = 1, hasChildren = false } = familyData;
    const recommendations = [];

    // 스트레스/불안 기반 건강보험 추천
    if (assessmentData.stressLevel && assessmentData.stressLevel > 60) {
      recommendations.push({
        type: '정신건강보험',
        reason: '높은 스트레스 수준으로 인한 정신건강 관리 필요',
        priority: 'high',
        icon: Heart
      });
    }

    // 가족 구성 기반 추천
    if (hasChildren) {
      recommendations.push({
        type: '가족보험',
        reason: '자녀가 있는 가정의 종합적 보장 필요',
        priority: 'medium',
        icon: Home
      });
    }

    // 연령대별 추천
    if (assessmentData.ageGroup === 'adult') {
      recommendations.push({
        type: '종합보험',
        reason: '성인기 라이프스타일에 맞는 종합 보장',
        priority: 'medium',
        icon: Shield
      });
    }

    return recommendations;
  };

  const riskLevel = calculateRiskLevel();
  const recommendations = getInsuranceRecommendations();

  return (
    <Card className="mt-6 border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          생활 안전도 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 위험도 레벨 */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div>
            <h4 className="font-medium">현재 생활 위험도</h4>
            <p className="text-sm text-muted-foreground">
              심리 상태 기반 생활 안전 지수
            </p>
          </div>
          <div className="text-right">
            <Badge variant={riskLevel.color as any} className="mb-1">
              {riskLevel.label}
            </Badge>
            <div className="text-xs text-muted-foreground">
              정기 점검 권장
            </div>
          </div>
        </div>

        {/* 맞춤형 보험 정보 */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">맞춤형 보장 정보</h4>
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <rec.icon className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{rec.type}</div>
                  <div className="text-xs text-muted-foreground">{rec.reason}</div>
                </div>
                <Badge 
                  variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {rec.priority === 'high' ? '권장' : '고려'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">생활 안전도 정보</p>
              <p>이 분석은 심리검사 결과를 바탕으로 한 참고용 정보입니다. 실제 보험 가입 시에는 전문가와 상담하시기 바랍니다.</p>
            </div>
          </div>
        </div>

        {/* 자연스러운 보험 정보 버튼 */}
        <Button 
          variant="outline" 
          className="w-full mt-4 border-blue-200 hover:bg-blue-50"
          onClick={() => {
            // 향후 보험 파트너십 페이지로 연결
            console.log('보험 정보 더보기 클릭');
          }}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          생활 보장 정보 더보기
        </Button>
      </CardContent>
    </Card>
  );
};

export default LifeRiskAnalysis;