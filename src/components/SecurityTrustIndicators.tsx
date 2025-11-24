import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, UserCheck, Eye, Database, Award, Building2, TrendingUp } from 'lucide-react';

const SecurityTrustIndicators = () => {
  const securityFeatures = [
    {
      icon: <Shield className="w-5 h-5 text-green-600" />,
      title: '의료급 보안',
      description: 'HIPAA 수준 개인정보 보호'
    },
    {
      icon: <Lock className="w-5 h-5 text-blue-600" />,
      title: '256bit 암호화',
      description: '은행급 데이터 암호화 적용'
    },
    {
      icon: <UserCheck className="w-5 h-5 text-purple-600" />,
      title: '전문가 검증',
      description: '각 검사별 전문의 및 전문가 감수'
    },
    {
      icon: <Eye className="w-5 h-5 text-orange-600" />,
      title: '익명 처리',
      description: '개인 식별 정보 완전 분리'
    },
    {
      icon: <Database className="w-5 h-5 text-indigo-600" />,
      title: '안전한 저장',
      description: 'AWS 클라우드 보안 인프라'
    },
    {
      icon: <Award className="w-5 h-5 text-yellow-600" />,
      title: 'ISO 27001',
      description: '정보보안 국제 기준 준수'
    }
  ];

  return (
    <div className="space-y-4">
      {/* 과학기술정보통신부 개발 플랫폼 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">과학기술정보통신부 개발 플랫폼</h3>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            대한민국 정부 과학기술정보통신부 지원으로 개발된 공신력 있는 심리상담 플랫폼입니다.
          </p>
        </CardContent>
      </Card>

      {/* 메인 보안 메시지 */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-green-800 dark:text-green-200">안전한 심리상담 플랫폼</h3>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            여러분의 소중한 개인정보와 상담 내용은 의료급 보안 시스템으로 완벽하게 보호됩니다.
          </p>
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>실시간 보안 모니터링 가동 중</span>
          </div>
        </CardContent>
      </Card>

      {/* 보안 기능 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {feature.icon}
            <div>
              <div className="text-sm font-medium">{feature.title}</div>
              <div className="text-xs text-muted-foreground">{feature.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 추가 신뢰 요소 */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-800 dark:text-blue-200">전문가 2차 검토 시스템</span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          AI 분석 결과는 모두 실제 전문가가 2차 검토하여 신뢰성을 보장합니다.
        </p>
      </div>

      {/* 보안 고도화 계획 */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">지속적인 보안 고도화</h3>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
            현재 구축된 기본 보안 체계를 바탕으로, 향후 국가 R&D 지원 및 VC 투자를 통해 다음 영역의 보안을 강화할 예정입니다:
          </p>
          <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1 ml-4">
            <li>• 엔드투엔드 암호화 (E2EE) 고도화</li>
            <li>• 다중 인증 시스템 (2FA/MFA) 도입</li>
            <li>• 블록체인 기반 데이터 무결성 보장</li>
            <li>• AI 기반 실시간 보안 위협 탐지</li>
            <li>• 제로 트러스트 아키텍처 구현</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTrustIndicators;