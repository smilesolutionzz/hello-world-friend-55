import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, UserCheck, Building2, DollarSign, Shield, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const navigate = useNavigate();

  const institutionFAQs = [
    {
      question: "수수료율이 어떻게 되나요?",
      answer: (
        <div className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">기본 수익분배</h4>
            <div className="text-2xl font-bold">제휴기관 75% | 플랫폼 25%</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-3 rounded border">
              <div className="text-sm text-muted-foreground">상담/치료</div>
              <div className="font-semibold">80% / 20%</div>
            </div>
            <div className="bg-card p-3 rounded border">
              <div className="text-sm text-muted-foreground">검사/평가</div>
              <div className="font-semibold">70% / 30%</div>
            </div>
            <div className="bg-card p-3 rounded border">
              <div className="text-sm text-muted-foreground">관찰일지 리뷰</div>
              <div className="font-semibold">75% / 25%</div>
            </div>
            <div className="bg-card p-3 rounded border">
              <div className="text-sm text-muted-foreground">보고서 작성</div>
              <div className="font-semibold">65% / 35%</div>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "성과 기반 인센티브가 있나요?",
      answer: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">⭐ 우수기관 보너스</h4>
            <ul className="space-y-1 text-sm">
              <li>• 월 매출 500만원 이상: <Badge variant="secondary">+2% 보너스</Badge></li>
              <li>• 고객 만족도 4.8점 이상: <Badge variant="secondary">+1% 보너스</Badge></li>
              <li>• 신규 고객 10명 이상: <Badge variant="secondary">+1% 보너스</Badge></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">🏆 등급별 혜택</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-center">
                <div className="font-semibold text-yellow-700">골드</div>
                <div className="text-sm">+3%</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2 rounded text-center">
                <div className="font-semibold text-gray-700">실버</div>
                <div className="text-sm">+1%</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 p-2 rounded text-center">
                <div className="font-semibold text-orange-700">브론즈</div>
                <div className="text-sm">기본</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "정산은 언제 받나요?",
      answer: (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="font-semibold text-green-700">매월 말일 정산 → 익월 10일 지급</div>
          </div>
          <ul className="space-y-2 text-sm">
            <li>• 실시간 매출 대시보드 제공</li>
            <li>• 투명한 정산 내역서 제공</li>
            <li>• 세금계산서 자동 발행</li>
            <li>• 입금 확인 SMS/이메일 발송</li>
          </ul>
        </div>
      )
    },
    {
      question: "초기 비용이 있나요?",
      answer: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-700 mb-2">💰 초기 비용 ZERO</h4>
            <ul className="space-y-1 text-sm text-blue-600">
              <li>• 플랫폼 입점비: 무료</li>
              <li>• 초기 설정비: 무료</li>
              <li>• 시스템 사용료: 무료</li>
              <li>• 교육 및 지원: 무료</li>
            </ul>
          </div>
          <div className="text-sm text-muted-foreground">
            ✅ 완전한 성과 연동형 수익 모델
          </div>
        </div>
      )
    },
    {
      question: "어떤 마케팅 지원을 받나요?",
      answer: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">📱 디지털 마케팅</h4>
            <ul className="text-sm space-y-1">
              <li>• SEO 최적화</li>
              <li>• SNS 마케팅</li>
              <li>• 구글 광고 지원</li>
              <li>• 네이버 플레이스 관리</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">⭐ 평판 관리</h4>
            <ul className="text-sm space-y-1">
              <li>• 고객 리뷰 관리</li>
              <li>• 전문가 프로필 최적화</li>
              <li>• 성과 분석 리포트</li>
              <li>• 경쟁사 벤치마킹</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const therapistFAQs = [
    {
      question: "개별 치료사 수수료는 어떻게 되나요?",
      answer: (
        <div className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">개별 치료사 수익분배</h4>
            <div className="text-2xl font-bold">치료사 70% | 플랫폼 30%</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <div className="text-sm font-medium text-yellow-700">
              제휴기관(75%) 대비 5% 낮은 이유
            </div>
            <ul className="text-sm text-yellow-600 mt-1 space-y-1">
              <li>• 마케팅/홍보를 플랫폼이 전담</li>
              <li>• 고객관리 시스템 제공</li>
              <li>• 예약/결제 시스템 제공</li>
              <li>• 개별 운영비 부담 없음</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      question: "서비스별 수익구조가 다른가요?",
      answer: (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card p-3 rounded border">
            <div className="text-sm text-muted-foreground">1:1 상담</div>
            <div className="font-semibold text-green-600">75% / 25%</div>
          </div>
          <div className="bg-card p-3 rounded border">
            <div className="text-sm text-muted-foreground">그룹 치료</div>
            <div className="font-semibold">70% / 30%</div>
          </div>
          <div className="bg-card p-3 rounded border">
            <div className="text-sm text-muted-foreground">온라인 상담</div>
            <div className="font-semibold">65% / 35%</div>
          </div>
          <div className="bg-card p-3 rounded border">
            <div className="text-sm text-muted-foreground">평가/검사</div>
            <div className="font-semibold">60% / 40%</div>
          </div>
        </div>
      )
    },
    {
      question: "치료사 등록 조건이 있나요?",
      answer: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">📋 필수 자격</h4>
            <ul className="text-sm space-y-1">
              <li>• 관련 학과 학사 이상</li>
              <li>• 국가자격증 또는 민간자격증</li>
              <li>• 3년 이상 실무 경험</li>
              <li>• 무사고 경력 증명</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">📄 제출 서류</h4>
            <ul className="text-sm space-y-1">
              <li>• 자격증 사본</li>
              <li>• 경력증명서</li>
              <li>• 포트폴리오</li>
              <li>• 신원조회서</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      question: "수익 예상액은 얼마정도인가요?",
      answer: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-semibold text-green-700 mb-2">월 수익 시뮬레이션</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>주 20시간 활동시:</span>
                <span className="font-semibold">월 280만원</span>
              </div>
              <div className="flex justify-between">
                <span>주 30시간 활동시:</span>
                <span className="font-semibold">월 420만원</span>
              </div>
              <div className="flex justify-between">
                <span>주 40시간 활동시:</span>
                <span className="font-semibold">월 560만원</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            * 시간당 2만원 기준, 실제 수익은 서비스 단가에 따라 달라질 수 있습니다.
          </div>
        </div>
      )
    }
  ];

  const userFAQs = [
    {
      question: "서비스 이용료는 얼마인가요?",
      answer: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-50 border p-4 rounded-lg text-center">
              <div className="font-semibold">기본 검사</div>
              <div className="text-lg font-bold text-primary">무료</div>
              <div className="text-sm text-muted-foreground">AI 분석 포함</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
              <div className="font-semibold">전문가 상담</div>
              <div className="text-lg font-bold text-blue-600">5-15만원</div>
              <div className="text-sm text-muted-foreground">1회 50분</div>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <div className="font-semibold">종합 평가</div>
              <div className="text-lg font-bold text-green-600">20-40만원</div>
              <div className="text-sm text-muted-foreground">리포트 포함</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            * 가격은 서비스 제공기관에 따라 다를 수 있습니다.
          </div>
        </div>
      )
    },
    {
      question: "결제 방법은 무엇이 있나요?",
      answer: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card p-3 rounded border text-center">
            <div className="font-semibold">신용카드</div>
            <div className="text-sm text-muted-foreground">모든 카드사</div>
          </div>
          <div className="bg-card p-3 rounded border text-center">
            <div className="font-semibold">계좌이체</div>
            <div className="text-sm text-muted-foreground">실시간</div>
          </div>
          <div className="bg-card p-3 rounded border text-center">
            <div className="font-semibold">간편결제</div>
            <div className="text-sm text-muted-foreground">카카오페이 등</div>
          </div>
          <div className="bg-card p-3 rounded border text-center">
            <div className="font-semibold">바우처</div>
            <div className="text-sm text-muted-foreground">정부지원</div>
          </div>
        </div>
      )
    },
    {
      question: "취소/환불 정책은 어떻게 되나요?",
      answer: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600">✅ 전액 환불</h4>
            <ul className="text-sm space-y-1">
              <li>• 서비스 시작 전 취소: 100% 환불</li>
              <li>• 전문가 사정으로 인한 취소: 100% 환불</li>
              <li>• 시스템 오류: 100% 환불</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-600">⚠️ 부분 환불</h4>
            <ul className="text-sm space-y-1">
              <li>• 서비스 진행 중 고객 취소: 50% 환불</li>
              <li>• 노쇼(No-show): 환불 불가</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      question: "개인정보는 안전한가요?",
      answer: (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="font-semibold text-blue-700 mb-2">🔒 보안 인증</div>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• 개인정보보호법 완전 준수</li>
              <li>• SSL 암호화 적용</li>
              <li>• 정기 보안 감사</li>
              <li>• 전문가와 정보 제한 공유</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            홈으로 돌아가기
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            자주 묻는 질문
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            제휴기관, 치료사, 사용자 분들이 궁금해하시는 모든 것들을 정리했습니다
          </p>
        </div>

        {/* FAQ Tabs */}
        <Tabs defaultValue="institutions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="institutions" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              제휴기관
            </TabsTrigger>
            <TabsTrigger value="therapists" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              치료사
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              사용자
            </TabsTrigger>
          </TabsList>

          {/* Institution FAQs */}
          <TabsContent value="institutions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  제휴기관을 위한 FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {institutionFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`institution-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Therapist FAQs */}
          <TabsContent value="therapists">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  개별 치료사를 위한 FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {therapistFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`therapist-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User FAQs */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  사용자를 위한 FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {userFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`user-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <Phone className="h-5 w-5" />
              추가 문의사항이 있으신가요?
            </h3>
            <p className="text-muted-foreground mb-4">
              언제든지 연락주세요. 빠르고 정확하게 답변드리겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2">
                <span className="font-semibold">📧 이메일:</span>
                <span>support@platform.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">📞 전화:</span>
                <span>1588-0000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;