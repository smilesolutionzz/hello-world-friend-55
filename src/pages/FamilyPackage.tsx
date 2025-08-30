import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, Heart, Shield, Star, Clock, CheckCircle } from "lucide-react";

export default function FamilyPackage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">가족케어 패키지</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            온 가족의 건강한 마음을 위한 종합 심리 케어 솔루션
          </p>
          <Badge className="mt-4 px-4 py-2 text-lg bg-primary/10 text-primary border-primary">
            가족 전용 특가 패키지
          </Badge>
        </div>

        {/* Package Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <CardTitle>부모-자녀 관계 분석</CardTitle>
              <CardDescription>
                가족 내 소통 패턴과 애착 관계를 깊이 있게 분석합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  부모양육태도 검사
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  애착관계 스타일 분석
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  가족 소통 패턴 진단
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <CardTitle>종합 발달 검사</CardTitle>
              <CardDescription>
                각 연령대별 맞춤 발달 상태를 정밀하게 평가합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  영유아 발달 선별검사
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  아동 종합 심리검사
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  청소년 성장역량 진단
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <CardTitle>AI 맞춤 솔루션</CardTitle>
              <CardDescription>
                가족별 특성에 맞는 개인화된 케어 플랜을 제공합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  AI 기반 맞춤 권고사항
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  전문가 매칭 서비스
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  24시간 AI 상담 서비스
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <Card className="max-w-4xl mx-auto mb-12 border-2 border-primary bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">가족케어 패키지 혜택</CardTitle>
            <CardDescription className="text-lg">
              개별 검사 대비 최대 60% 할인된 특가로 제공
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold mb-4">포함 검사 및 서비스</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span>부모양육태도 검사</span>
                    <span className="text-muted-foreground line-through">15,000원</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span>애착관계 스타일 분석</span>
                    <span className="text-muted-foreground line-through">12,000원</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span>아동 종합 심리검사</span>
                    <span className="text-muted-foreground line-through">25,000원</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span>AI 맞춤 상담 (월 10회)</span>
                    <span className="text-muted-foreground line-through">20,000원</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span>전문가 리포트</span>
                    <span className="text-muted-foreground line-through">30,000원</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>정가 총합</span>
                    <span className="line-through text-muted-foreground">102,000원</span>
                  </div>
                  <div className="flex items-center justify-between text-2xl font-bold text-primary">
                    <span>패키지 특가</span>
                    <span>39,900원</span>
                  </div>
                  <p className="text-sm text-green-600 text-right font-medium">61% 할인!</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold mb-4">추가 혜택</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>가족 구성원별 맞춤 분석</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>3개월 후속 관리 서비스</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Star className="h-5 w-5 text-purple-600" />
                    <span>전문가 직접 상담 1회 무료</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Users className="h-5 w-5 text-yellow-600" />
                    <span>가족 관계 개선 가이드북</span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full text-lg py-6"
                    onClick={() => navigate('/assessment?package=family')}
                  >
                    가족케어 패키지 시작하기
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    ✅ 7일 무료 체험 • 💯 100% 환불 보장 • 📞 24시간 고객지원
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">자주 묻는 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Q. 가족 구성원이 몇 명까지 이용 가능한가요?</h4>
                <p className="text-muted-foreground">
                  A. 부모 2명 + 자녀 3명까지 총 5명이 기본 패키지에 포함됩니다. 추가 구성원은 1인당 월 5,000원으로 이용 가능합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Q. 검사 결과는 언제 받을 수 있나요?</h4>
                <p className="text-muted-foreground">
                  A. 검사 완료 후 즉시 기본 분석을 받아보실 수 있으며, 전문가 상세 분석은 2-3일 내 제공됩니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Q. 취소 및 환불이 가능한가요?</h4>
                <p className="text-muted-foreground">
                  A. 7일 무료 체험 기간 내 언제든 취소 가능하며, 이후에도 서비스 이용 전이라면 100% 환불해드립니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}