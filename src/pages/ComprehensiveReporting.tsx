import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, BarChart3, Clock, Users } from 'lucide-react';

export default function ComprehensiveReporting() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const reportingFeatures = [
    "프리미엄 검사 결과 종합 분석",
    "전문의 패널 분석 및 검증 논문",
    "AI 상담 내용 기반 맞춤 추천 제공",
    "3일 내 전문가검토 진료"
  ];

  const stats = [
    { label: "검사", value: "10", icon: FileText },
    { label: "리포팅", value: "0", icon: BarChart3 },
    { label: "신청", value: "0", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">박사급 종합 리포팅</h1>
            <p className="text-muted-foreground">오늘 데이터를 종합한 진료 분석 리포트</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Reporting Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-primary" />
                <CardTitle>박사급 종합 리포팅</CardTitle>
              </div>
              <CardDescription>
                오늘 데이터를 종합한 진료 분석 리포트
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Features List */}
              <div className="space-y-3 mb-6">
                {reportingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Pricing and CTA */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      200토큰
                    </Badge>
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      인기상품
                    </Badge>
                  </div>
                  <Button size="lg" className="px-8">
                    종합 리포팅 신청
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                전문가 검토 과정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">데이터 수집 및 분석</h4>
                    <p className="text-sm text-muted-foreground">
                      완료된 검사 결과와 AI 상담 내용을 종합적으로 분석합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">전문의 패널 검토</h4>
                    <p className="text-sm text-muted-foreground">
                      박사급 전문의들이 분석 결과를 검토하고 검증합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">맞춤 리포트 제공</h4>
                    <p className="text-sm text-muted-foreground">
                      개인화된 종합 리포트와 전문가 권고사항을 제공합니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}