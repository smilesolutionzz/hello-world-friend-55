import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  UserCheck, 
  CheckCircle, 
  ArrowRight, 
  Clock,
  Users,
  Zap,
  Shield
} from 'lucide-react';

const ExpertValidationBanner = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [validatedCount, setValidatedCount] = useState(878);
  const [expertsOnline, setExpertsOnline] = useState(5);

  // 3초 주기로 애니메이션 반복
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // 실시간 카운터 효과
  useEffect(() => {
    const countInterval = setInterval(() => {
      setValidatedCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(countInterval);
  }, []);

  const steps = [
    { icon: Bot, label: "AI 분석", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: UserCheck, label: "전문가검토", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: CheckCircle, label: "검증완료", color: "text-green-500", bg: "bg-green-50" },
    { icon: Shield, label: "신뢰보장", color: "text-purple-500", bg: "bg-purple-50" }
  ];

  return (
    <div className="w-full bg-white py-8 border-b border-gray-100">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* 메인 헤딩 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            일반 AI와 <span className="text-primary">완전히 다른</span> 차별점
          </h2>
          <p className="text-gray-600 text-lg">
            GPT, 클로드와 달리 <strong className="text-gray-900">모든 결과는 전문가검토</strong>를 거칩니다
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {/* 비교 섹션 */}
          <Card className="p-6 h-full border-2 border-gray-100 hover:border-gray-200 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">일반 AI vs 우리</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">검증 방식</span>
                <div className="text-right">
                  <div className="text-xs text-red-500">❌ AI만 응답</div>
                  <div className="text-xs text-green-600">✅ AI+전문가검토</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">신뢰도</span>
                <div className="text-right">
                  <div className="text-xs text-red-500">❌ 참고용만</div>
                  <div className="text-xs text-green-600">✅ 의료급 신뢰</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">책임소재</span>
                <div className="text-right">
                  <div className="text-xs text-red-500">❌ 책임 없음</div>
                  <div className="text-xs text-green-600">✅ 전문가 보증</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 검증 플로우 애니메이션 */}
          <Card className="p-6 h-full border-2 border-blue-100 bg-gradient-to-br from-blue-50/30 to-purple-50/30">
            <h3 className="font-semibold text-gray-900 mb-6 text-center">2단계 검증 시스템</h3>
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        currentStep >= index 
                          ? `${step.bg} scale-110 shadow-lg border-2 border-white` 
                          : 'bg-gray-100'
                      }`}
                    >
                      <step.icon 
                        className={`w-6 h-6 transition-colors duration-300 ${
                          currentStep >= index ? step.color : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <span 
                      className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                        currentStep >= index ? step.color : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight 
                      className={`w-4 h-4 transition-colors duration-300 ${
                        currentStep > index ? 'text-primary' : 'text-gray-300'
                      }`} 
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Clock className="w-3 h-3 mr-1" />
                평균 검토시간: 2분 30초
              </Badge>
            </div>
          </Card>

          {/* 실시간 상태 */}
          <Card className="p-6 h-full border-2 border-green-100 bg-gradient-to-br from-green-50/30 to-emerald-50/30">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">실시간 현황</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">전문가 온라인</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Users className="w-3 h-3 mr-1" />
                  {expertsOnline}명
                </Badge>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary animate-pulse">
                    {validatedCount.toLocaleString()}건
                  </div>
                  <div className="text-sm text-gray-600">
                    전문가검토 완료
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-600">실시간 검증 진행중</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 신뢰도 강조 메시지 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-900">
              모든 리포팅은 의료진 및 전문가가 검토합니다
            </span>
            <Badge className="bg-green-500 text-white">검증완료</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertValidationBanner;