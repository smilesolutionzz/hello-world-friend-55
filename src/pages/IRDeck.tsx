import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download,
  ArrowRight,
  Users,
  TrendingUp,
  Target,
  Brain,
  Crown,
  Wallet,
  Building2,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Rocket,
  Globe,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

// 실제 데이터 기반 (2026년 1월)
const REAL_DATA = {
  totalUsers: 164,
  monthlySignups: 27,
  testConversionRate: 39.6,
  assessmentsCompleted: 391,
  monthlyGrowthRate: 15,
};

const slides = [
  {
    id: 'cover',
    title: 'AIHUMANPRO',
    subtitle: 'AI와 전문가가 함께하는 통합 케어 플랫폼',
    content: null,
  },
  {
    id: 'problem',
    title: '문제 정의',
    subtitle: '부모들의 해결되지 않는 고민',
    content: 'problem',
  },
  {
    id: 'solution',
    title: '솔루션',
    subtitle: '3분 AI 분석 → 전문가 매칭',
    content: 'solution',
  },
  {
    id: 'product',
    title: '제품 소개',
    subtitle: '핵심 기능 데모',
    content: 'product',
  },
  {
    id: 'traction',
    title: '트랙션',
    subtitle: '실제 성장 데이터',
    content: 'traction',
  },
  {
    id: 'market',
    title: '시장 규모',
    subtitle: 'TAM / SAM / SOM',
    content: 'market',
  },
  {
    id: 'business-model',
    title: '비즈니스 모델',
    subtitle: '수익 구조',
    content: 'business-model',
  },
  {
    id: 'competition',
    title: '경쟁 우위',
    subtitle: '차별화 포인트',
    content: 'competition',
  },
  {
    id: 'roadmap',
    title: '로드맵',
    subtitle: '12개월 성장 계획',
    content: 'roadmap',
  },
  {
    id: 'team',
    title: '팀 소개',
    subtitle: '핵심 역량',
    content: 'team',
  },
  {
    id: 'financials',
    title: '재무 계획',
    subtitle: 'ARR 예측 & 자금 사용',
    content: 'financials',
  },
  {
    id: 'ask',
    title: '투자 요청',
    subtitle: 'Investment Ask',
    content: 'ask',
  },
];

const IRDeck = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderSlideContent = (slide: typeof slides[0]) => {
    switch (slide.content) {
      case 'problem':
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-destructive/30 bg-destructive/5">
                <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold mb-2">병원 대기 3개월</h3>
                <p className="text-muted-foreground">발달센터 예약까지 평균 90일 소요</p>
              </Card>
              <Card className="p-6 border-destructive/30 bg-destructive/5">
                <Wallet className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold mb-2">고비용 진단</h3>
                <p className="text-muted-foreground">1회 상담 10-30만원, 종합검사 50-100만원</p>
              </Card>
              <Card className="p-6 border-destructive/30 bg-destructive/5">
                <Heart className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-xl font-bold mb-2">부모 죄책감</h3>
                <p className="text-muted-foreground">"내가 뭘 잘못했을까" 심리적 장벽</p>
              </Card>
            </div>
            <Card className="p-6 bg-primary/5 border-primary/30">
              <p className="text-xl text-center">
                <span className="font-bold text-primary">73%</span>의 발달 문제는 부모가 먼저 알아차림
                <br />
                <span className="text-muted-foreground">하지만 적절한 도움을 받기까지 평균 <span className="font-bold text-destructive">18개월</span> 소요</span>
              </p>
            </Card>
          </div>
        );

      case 'solution':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Card className="p-6 text-center min-w-[200px]">
                <Brain className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-bold">3분 AI 선별검사</h3>
                <p className="text-sm text-muted-foreground">무료, 익명, 즉시 결과</p>
              </Card>
              <ArrowRight className="w-8 h-8 text-primary" />
              <Card className="p-6 text-center min-w-[200px] border-primary">
                <BarChart3 className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-bold">전문가급 AI 분석</h3>
                <p className="text-sm text-muted-foreground">9개 섹션 심층 리포트</p>
              </Card>
              <ArrowRight className="w-8 h-8 text-primary" />
              <Card className="p-6 text-center min-w-[200px]">
                <Users className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-bold">전문가 매칭</h3>
                <p className="text-sm text-muted-foreground">검증된 상담사 즉시 연결</p>
              </Card>
            </div>
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">90%</p>
                  <p className="text-sm">비용 절감</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">3분</p>
                  <p className="text-sm">즉시 결과</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">24/7</p>
                  <p className="text-sm">언제든 이용</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'product':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  심리검사 Suite
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>ADHD / 우울증 / 불안 검사</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>발달선별검사 (영유아~청소년)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>언어발달 77문항 검사</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>성격검사 (Big5, HEXACO)</span>
                  </li>
                </ul>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-500" />
                  AI 분석 엔진
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Gemini 2.5 Flash 기반</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>실시간 웹 리서치 통합</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>9개 섹션 종합 리포트</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>PDF 다운로드 / 공유</span>
                  </li>
                </ul>
              </Card>
            </div>
            <Card className="p-6 border-primary">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                전문가 매칭 시스템
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">15-20%</p>
                  <p className="text-sm text-muted-foreground">매칭 수수료</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">+5,000원</p>
                  <p className="text-sm text-muted-foreground">긴급 매칭 프리미엄</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">위기 감지</p>
                  <p className="text-sm text-muted-foreground">AI 기반 자동 연결</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'traction':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-primary/5 border-primary/30">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="text-4xl font-bold text-primary">{REAL_DATA.totalUsers}</p>
                <p className="text-sm text-muted-foreground">총 사용자</p>
              </Card>
              <Card className="p-6 text-center bg-green-50 border-green-200">
                <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <p className="text-4xl font-bold text-green-600">{REAL_DATA.monthlySignups}</p>
                <p className="text-sm text-muted-foreground">월 평균 가입</p>
              </Card>
              <Card className="p-6 text-center bg-blue-50 border-blue-200">
                <Target className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <p className="text-4xl font-bold text-blue-600">{REAL_DATA.testConversionRate}%</p>
                <p className="text-sm text-muted-foreground">검사 전환율</p>
              </Card>
              <Card className="p-6 text-center bg-purple-50 border-purple-200">
                <BarChart3 className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <p className="text-4xl font-bold text-purple-600">{REAL_DATA.assessmentsCompleted}</p>
                <p className="text-sm text-muted-foreground">검사 완료</p>
              </Card>
            </div>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">월별 성장 추이</h3>
              <div className="flex items-end gap-2 h-40">
                {[28, 27, 38, 29, 32, 10].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${(value / 40) * 100}%` }}
                    />
                    <p className="text-xs mt-2 text-muted-foreground">
                      {['8월', '9월', '10월', '11월', '12월', '1월'][index]}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center border-2 border-muted">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">TAM</p>
                <p className="text-3xl font-bold">2.5조</p>
                <p className="text-sm text-muted-foreground">국내 심리상담 시장</p>
              </Card>
              <Card className="p-6 text-center border-2 border-primary/50">
                <Target className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">SAM</p>
                <p className="text-3xl font-bold text-primary">3,000억</p>
                <p className="text-sm text-muted-foreground">영유아 발달검사 시장</p>
              </Card>
              <Card className="p-6 text-center border-2 border-primary bg-primary/5">
                <Rocket className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">SOM</p>
                <p className="text-3xl font-bold text-primary">300억</p>
                <p className="text-sm text-muted-foreground">초기 목표 시장</p>
              </Card>
            </div>
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
              <h3 className="text-xl font-bold mb-4">시장 성장 드라이버</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium">출산율 저하 → 투자 집중</p>
                    <p className="text-sm text-muted-foreground">1자녀에 대한 교육/건강 투자 증가</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium">디지털 헬스케어 확산</p>
                    <p className="text-sm text-muted-foreground">비대면 진료/상담 규제 완화</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium">정부 정책 지원</p>
                    <p className="text-sm text-muted-foreground">발달바우처, 심리상담 지원 확대</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium">AI 기술 성숙</p>
                    <p className="text-sm text-muted-foreground">LLM 기반 분석 정확도 향상</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'business-model':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-primary">
                <Crown className="w-10 h-10 text-amber-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">B2C 구독</h3>
                <p className="text-3xl font-bold text-primary mb-2">29,900원/월</p>
                <p className="text-sm text-muted-foreground mb-4">프리미엄 패스</p>
                <ul className="text-sm space-y-1">
                  <li>• 무제한 검사</li>
                  <li>• AI 심층분석</li>
                  <li>• PDF 리포트</li>
                  <li>• 전문가 우선 매칭</li>
                </ul>
              </Card>
              <Card className="p-6 border-blue-500">
                <Wallet className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">건별 결제</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">5,000원~</p>
                <p className="text-sm text-muted-foreground mb-4">AI 심층분석</p>
                <ul className="text-sm space-y-1">
                  <li>• ADHD 분석 5,000원</li>
                  <li>• 발달검사 5,000원</li>
                  <li>• 언어발달 5,000원</li>
                  <li>• 종합 리포트 15,000원</li>
                </ul>
              </Card>
              <Card className="p-6 border-green-500">
                <Users className="w-10 h-10 text-green-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">매칭 수수료</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">15-20%</p>
                <p className="text-sm text-muted-foreground mb-4">전문가 상담</p>
                <ul className="text-sm space-y-1">
                  <li>• 일반 상담 15%</li>
                  <li>• 긴급 매칭 20%</li>
                  <li>• 위기 개입 +10,000원</li>
                  <li>• 패키지 할인</li>
                </ul>
              </Card>
            </div>
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                B2B 기관용 플랜
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold">Starter</p>
                  <p className="text-2xl font-bold text-primary">49,000원/월</p>
                  <p className="text-sm text-muted-foreground">~20명</p>
                </div>
                <div className="p-4 bg-background rounded-lg border-2 border-primary">
                  <p className="font-bold">Standard</p>
                  <p className="text-2xl font-bold text-primary">149,000원/월</p>
                  <p className="text-sm text-muted-foreground">~50명</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-bold">Pro</p>
                  <p className="text-2xl font-bold text-primary">299,000원/월</p>
                  <p className="text-sm text-muted-foreground">무제한</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'competition':
        return (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">기능</th>
                    <th className="text-center p-3 bg-primary/10">AIHUMANPRO</th>
                    <th className="text-center p-3">마인드카페</th>
                    <th className="text-center p-3">트로스트</th>
                    <th className="text-center p-3">병원</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">AI 분석</td>
                    <td className="text-center p-3 bg-primary/5"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3">부분</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">전문가 매칭</td>
                    <td className="text-center p-3 bg-primary/5"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3">제한적</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">발달검사</td>
                    <td className="text-center p-3 bg-primary/5"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">가격</td>
                    <td className="text-center p-3 bg-primary/5 font-bold text-green-600">29,900원/월</td>
                    <td className="text-center p-3">5만원~/회</td>
                    <td className="text-center p-3">4만원~/회</td>
                    <td className="text-center p-3">10-30만원</td>
                  </tr>
                  <tr>
                    <td className="p-3">접근성</td>
                    <td className="text-center p-3 bg-primary/5 font-bold text-green-600">즉시</td>
                    <td className="text-center p-3">예약</td>
                    <td className="text-center p-3">예약</td>
                    <td className="text-center p-3">3개월 대기</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Card className="p-6 border-primary bg-primary/5">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                핵심 경쟁 우위
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-primary text-primary-foreground">1</Badge>
                  <div>
                    <p className="font-medium">AI + 전문가 통합</p>
                    <p className="text-sm text-muted-foreground">1st Screening → Deep Analysis → Expert Matching</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-primary text-primary-foreground">2</Badge>
                  <div>
                    <p className="font-medium">발달검사 특화</p>
                    <p className="text-sm text-muted-foreground">0-7세 발달 케어 원스톱 솔루션</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'roadmap':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-blue-500">
                <p className="text-sm text-blue-600 font-medium mb-2">Q1 2026</p>
                <h3 className="font-bold mb-2">Product-Market Fit</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 유료 전환 10명 달성</li>
                  <li>• 전문가 10명 온보딩</li>
                  <li>• 핵심 검사 7종 완성</li>
                </ul>
              </Card>
              <Card className="p-4 border-l-4 border-l-green-500">
                <p className="text-sm text-green-600 font-medium mb-2">Q2 2026</p>
                <h3 className="font-bold mb-2">Growth</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 월 100명 가입</li>
                  <li>• B2B 5개 기관 계약</li>
                  <li>• MRR 500만원</li>
                </ul>
              </Card>
              <Card className="p-4 border-l-4 border-l-amber-500">
                <p className="text-sm text-amber-600 font-medium mb-2">Q3 2026</p>
                <h3 className="font-bold mb-2">Scale</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 월 500명 가입</li>
                  <li>• 전문가 50명</li>
                  <li>• MRR 2,000만원</li>
                </ul>
              </Card>
              <Card className="p-4 border-l-4 border-l-purple-500">
                <p className="text-sm text-purple-600 font-medium mb-2">Q4 2026</p>
                <h3 className="font-bold mb-2">Series A Ready</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• MAU 5,000</li>
                  <li>• ARR 5억원</li>
                  <li>• Series A 투자 유치</li>
                </ul>
              </Card>
            </div>
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
              <h3 className="text-xl font-bold mb-4">핵심 마일스톤</h3>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">1월</p>
                  <p className="text-sm">첫 유료 전환</p>
                </div>
                <ArrowRight className="text-muted-foreground" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">3월</p>
                  <p className="text-sm">MRR 100만원</p>
                </div>
                <ArrowRight className="text-muted-foreground" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">6월</p>
                  <p className="text-sm">MRR 500만원</p>
                </div>
                <ArrowRight className="text-muted-foreground" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">12월</p>
                  <p className="text-sm">ARR 5억원</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    CEO
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">대표</h3>
                    <p className="text-muted-foreground">CEO / Founder</p>
                  </div>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 풀스택 개발 & AI 엔지니어링</li>
                  <li>• 스타트업 창업 경험</li>
                  <li>• 심리학 도메인 전문성</li>
                </ul>
              </Card>
              <Card className="p-6 border-dashed">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">채용 예정</h3>
                    <p className="text-muted-foreground">핵심 팀원</p>
                  </div>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 마케팅/그로스 리드</li>
                  <li>• 임상심리 전문 자문</li>
                  <li>• B2B 세일즈</li>
                </ul>
              </Card>
            </div>
            <Card className="p-6 bg-primary/5">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                자문단
              </h3>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-background rounded-lg">
                  <p className="font-medium">임상심리</p>
                  <p className="text-sm text-muted-foreground">검사 타당성 자문</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="font-medium">소아정신과</p>
                  <p className="text-sm text-muted-foreground">발달 콘텐츠 감수</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="font-medium">법률</p>
                  <p className="text-sm text-muted-foreground">컴플라이언스</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="font-medium">투자</p>
                  <p className="text-sm text-muted-foreground">IR/재무 자문</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'financials':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center border-blue-500">
                <p className="text-sm text-muted-foreground mb-2">보수적 (3% 전환)</p>
                <p className="text-4xl font-bold text-blue-600">1,900만</p>
                <p className="text-sm text-muted-foreground">12개월 ARR</p>
              </Card>
              <Card className="p-6 text-center border-2 border-primary bg-primary/5">
                <Badge className="mb-2 bg-primary text-primary-foreground">목표</Badge>
                <p className="text-sm text-muted-foreground mb-2">중립적 (5% 전환)</p>
                <p className="text-4xl font-bold text-primary">4,200만</p>
                <p className="text-sm text-muted-foreground">12개월 ARR</p>
              </Card>
              <Card className="p-6 text-center border-green-500">
                <p className="text-sm text-muted-foreground mb-2">낙관적 (8% 전환)</p>
                <p className="text-4xl font-bold text-green-600">8,100만</p>
                <p className="text-sm text-muted-foreground">12개월 ARR</p>
              </Card>
            </div>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">자금 사용 계획</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">마케팅</div>
                  <div className="flex-1 bg-muted rounded-full h-6">
                    <div className="bg-primary h-6 rounded-full flex items-center justify-end pr-2" style={{ width: '50%' }}>
                      <span className="text-xs text-primary-foreground font-medium">50%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">개발</div>
                  <div className="flex-1 bg-muted rounded-full h-6">
                    <div className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2" style={{ width: '30%' }}>
                      <span className="text-xs text-white font-medium">30%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">운영</div>
                  <div className="flex-1 bg-muted rounded-full h-6">
                    <div className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2" style={{ width: '20%' }}>
                      <span className="text-xs text-white font-medium">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'ask':
        return (
          <div className="space-y-8 text-center">
            <div>
              <Badge className="mb-4 text-lg px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                Investment Ask
              </Badge>
              <h3 className="text-5xl font-bold text-primary mb-4">5,000만원</h3>
              <p className="text-xl text-muted-foreground">Pre-Seed / 초기창업패키지</p>
            </div>
            <Card className="p-8 max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-purple-500/10">
              <h4 className="text-xl font-bold mb-6">투자 후 12개월 목표</h4>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-primary">5,000</p>
                  <p className="text-sm text-muted-foreground">MAU</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">5억</p>
                  <p className="text-sm text-muted-foreground">ARR</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">Series A</p>
                  <p className="text-sm text-muted-foreground">후속 투자</p>
                </div>
              </div>
            </Card>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600">
                <Rocket className="w-5 h-5 mr-2" />
                투자 문의하기
              </Button>
              <Button size="lg" variant="outline">
                <Download className="w-5 h-5 mr-2" />
                PDF 다운로드
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      {/* Slide Navigation */}
      <div className="fixed top-20 left-4 right-4 z-40 flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="bg-background/80 backdrop-blur"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          이전
        </Button>
        <Badge variant="secondary" className="bg-background/80 backdrop-blur">
          {currentSlide + 1} / {slides.length}
        </Badge>
        <Button 
          variant="outline" 
          size="sm"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="bg-background/80 backdrop-blur"
        >
          다음
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Slide Content */}
      <div className="container mx-auto px-4 py-24 max-w-5xl min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {/* Slide Header */}
            <div className="text-center mb-12">
              {slides[currentSlide].id === 'cover' ? (
                <div className="py-20">
                  <Badge className="mb-6 text-lg px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white">
                    Investor Deck 2026
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-2xl text-muted-foreground mb-8">
                    {slides[currentSlide].subtitle}
                  </p>
                  <div className="flex justify-center gap-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      <Brain className="w-5 h-5 mr-2" />
                      AI 심리분석
                    </Badge>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      <Users className="w-5 h-5 mr-2" />
                      전문가 매칭
                    </Badge>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      <Heart className="w-5 h-5 mr-2" />
                      발달 케어
                    </Badge>
                  </div>
                </div>
              ) : (
                <>
                  <Badge variant="secondary" className="mb-4">
                    {slides[currentSlide].id.toUpperCase()}
                  </Badge>
                  <h2 className="text-4xl font-bold mb-2">{slides[currentSlide].title}</h2>
                  <p className="text-xl text-muted-foreground">{slides[currentSlide].subtitle}</p>
                </>
              )}
            </div>

            {/* Slide Content */}
            {renderSlideContent(slides[currentSlide])}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Dots */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-primary w-6' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default IRDeck;
