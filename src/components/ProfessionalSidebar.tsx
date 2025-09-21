import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Users, 
  Award, 
  Clock, 
  Brain, 
  MessageCircle, 
  FileText,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

const ProfessionalSidebar = () => {
  const navigate = useNavigate();

  const journeySteps = [
    {
      id: 1,
      title: "무료 체험하기",
      description: "AI 상담사와 대화해보세요",
      icon: <MessageCircle className="w-5 h-5" />,
      action: "시작하기",
      route: "/ai-counselor",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: 2,
      title: "3분 심리체크",
      description: "빠른 기본 상태 확인",
      icon: <Clock className="w-5 h-5" />,
      action: "체크하기",
      route: "/assessment",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    {
      id: 3,
      title: "관찰일지 작성",
      description: "체계적인 행동 기록",
      icon: <FileText className="w-5 h-5" />,
      action: "작성하기",
      route: "/observation",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    },
    {
      id: 4,
      title: "전문가 상담",
      description: "실제 전문가와 상담",
      icon: <Users className="w-5 h-5" />,
      action: "상담받기",
      route: "/expert-hiring",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      buttonColor: "bg-orange-600 hover:bg-orange-700"
    },
    {
      id: 5,
      title: "나만의 맞춤리포팅 신청",
      description: "개인화된 종합 분석 보고서",
      icon: <FileText className="w-5 h-5" />,
      action: "신청하기",
      route: "/dashboard",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      buttonColor: "bg-pink-600 hover:bg-pink-700"
    }
  ];

  const trustIndicators = [
    { icon: <Users className="w-4 h-4" />, text: "15,000+ 이용자" },
    { icon: <Award className="w-4 h-4" />, text: "30+ 제휴기관" },
    { icon: <Shield className="w-4 h-4" />, text: "의료진 검증" },
    { icon: <Star className="w-4 h-4" />, text: "4.8점 만족도" }
  ];

  return (
    <div className="w-72 bg-white h-[calc(100vh-4rem)] border-r border-gray-200 overflow-y-auto">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div>
            <h2 className="font-bold text-gray-900">AI하이라이트PRO</h2>
            <p className="text-sm text-gray-500">AI 기반 통합 케어 플랫폼</p>
          </div>
        </div>
        
        {/* 신뢰도 지표 */}
        <div className="grid grid-cols-2 gap-2">
          {trustIndicators.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 플랫폼 소개 */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">서비스 소개</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">AI + 전문가 2단계 검증</p>
              <p className="text-xs text-gray-500">모든 리포팅은 전문가검토를 거칩니다</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">개인정보 완전 보호</p>
              <p className="text-xs text-gray-500">익명성과 보안을 최우선으로</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">24시간 이용 가능</p>
              <p className="text-xs text-gray-500">언제든지 필요할 때 상담</p>
            </div>
          </div>
        </div>
      </div>

      {/* 이용 가이드 */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">단계별 이용 가이드</h3>
        <div className="space-y-4">
          {journeySteps.map((step, index) => (
            <Card 
              key={step.id} 
              className={`${step.bgColor} border-none cursor-pointer hover:shadow-sm transition-shadow`}
              onClick={() => navigate(step.route)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${step.textColor}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.textColor}`}>{step.title}</p>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="p-6 border-t border-gray-100">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">처음 이용하시나요?</h4>
            <p className="text-sm text-gray-600 mb-3">
              회원가입하면 무료 토큰을 드려요
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/auth')}
            >
              회원가입하고 시작하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalSidebar;