import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  TrendingUp,
  Heart,
  AlertCircle,
  CheckCircle,
  Activity,
  Calendar,
  FileText,
  ArrowRight,
  Target,
  Sparkles,
  BarChart3,
  Download
} from "lucide-react";

const SampleReport = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="종합 심리 리포트 예시 - AI하이라이트PRO"
        description="AI와 전문가가 함께 만드는 초개인화 종합 심리 분석 리포트 예시를 확인해보세요."
        keywords="심리리포트,AI심리분석,개인화리포트,정신건강리포트,심리검사결과"
      />

      <div className="min-h-screen bg-background">
        <UnifiedNavigation />

        <main className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">초개인화 AI 리포트</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              종합 심리 분석 리포트
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              이름: 김○○ 님 (가명) · 분석 기간: 2025.09 - 2025.10 (30일)
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>생성일: 2025년 10월 26일</span>
            </div>
          </div>

          {/* Summary Card */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                종합 요약
              </CardTitle>
              <CardDescription>
                30일간 수집된 데이터를 기반으로 AI가 분석한 종합 심리 상태입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-1">73점</div>
                  <div className="text-sm text-muted-foreground">전반적 정신건강</div>
                  <Badge variant="outline" className="mt-2 border-green-500/50 text-green-600">양호</Badge>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-secondary mb-1">14회</div>
                  <div className="text-sm text-muted-foreground">검사 참여 횟수</div>
                  <Badge variant="outline" className="mt-2 border-primary/50">활발</Badge>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                  <div className="text-3xl font-bold text-primary mb-1">87%</div>
                  <div className="text-sm text-muted-foreground">데이터 신뢰도</div>
                  <Badge variant="outline" className="mt-2 border-primary/50">높음</Badge>
                </div>
              </div>

              <div className="bg-background/80 p-6 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  AI 종합 분석 결과
                </h3>
                <p className="text-foreground/90 leading-relaxed">
                  김○○ 님은 전반적으로 <strong className="text-primary">안정적인 심리 상태</strong>를 유지하고 계십니다. 
                  다만, 주중 업무 스트레스가 주말보다 <strong className="text-secondary">42% 높게</strong> 측정되어 
                  업무-생활 균형 관리가 필요해 보입니다. 특히 목요일 오후 시간대에 스트레스 지수가 상승하는 패턴이 
                  지속적으로 관찰되었습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className="space-y-6 mb-8">
            {/* 스트레스 분석 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  스트레스 패턴 분석
                </CardTitle>
                <CardDescription>
                  일주일 단위로 측정된 스트레스 수치와 주요 트리거 요인
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium">업무 관련 스트레스</span>
                      <span className="text-muted-foreground">68/100</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium">대인관계 스트레스</span>
                      <span className="text-muted-foreground">42/100</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-medium">건강 관련 스트레스</span>
                      <span className="text-muted-foreground">35/100</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                </div>

                <Separator />

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">주요 발견사항</h4>
                      <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                        <li>• 주 52시간 근무로 인한 업무 피로도 누적</li>
                        <li>• 목요일 오후 3-5시 사이 집중력 저하 및 스트레스 급증</li>
                        <li>• 주말 회복이 불충분하여 월요일 컨디션 저조</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 정서 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  정서 상태 분석
                </CardTitle>
                <CardDescription>
                  감정 일기 및 AI 음성 분석 기반 정서 변화 추이
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="text-2xl mb-1">😊</div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">긍정</div>
                    <div className="text-xs text-green-600 dark:text-green-400">43%</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="text-2xl mb-1">😌</div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">평온</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">28%</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                    <div className="text-2xl mb-1">😟</div>
                    <div className="text-sm font-medium text-amber-700 dark:text-amber-300">불안</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400">19%</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="text-2xl mb-1">😔</div>
                    <div className="text-sm font-medium text-red-700 dark:text-red-300">우울</div>
                    <div className="text-xs text-red-600 dark:text-red-400">10%</div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-900 dark:text-green-100">긍정적 변화</h4>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                        <li>• 지난 주 대비 긍정 정서 12% 증가</li>
                        <li>• 아침 명상 실천 후 하루 시작이 더 평온함</li>
                        <li>• 주말 취미 활동으로 정서적 충전 효과 확인</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 수면 및 생활 패턴 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  생활 패턴 분석
                </CardTitle>
                <CardDescription>
                  수면, 운동, 식사 등 일상 생활 패턴 분석
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">수면 패턴</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>평균 수면 시간</span>
                        <span className="font-medium">6시간 20분</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>취침 시간</span>
                        <span className="font-medium">자정 12:30</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>기상 시간</span>
                        <span className="font-medium">오전 6:50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>수면 품질</span>
                        <Badge variant="outline" className="border-amber-500/50 text-amber-600">개선 필요</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">활동 패턴</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>주간 운동 횟수</span>
                        <span className="font-medium">2-3회</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>규칙적 식사</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>휴식 시간</span>
                        <span className="font-medium">불충분</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>전체 활동성</span>
                        <Badge variant="outline" className="border-primary/50">보통</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 전문가 추천사항 */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  AI 기반 개선 제안
                </CardTitle>
                <CardDescription>
                  전문가 검토를 거친 맞춤형 솔루션
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-background/80 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                      업무 스트레스 관리
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      목요일 오후 시간대 스트레스 집중 관리를 위한 단기 휴식 패턴 도입을 권장합니다.
                    </p>
                    <ul className="text-sm space-y-1 text-foreground/80">
                      <li>• 오후 3시 10분 스트레칭 브레이크</li>
                      <li>• 업무 블록 단위 분할 (50분 집중 + 10분 휴식)</li>
                      <li>• 주 1회 재택근무 요청 고려</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-background/80 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                      수면 품질 개선
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      최소 7시간 수면 확보를 위해 취침 시간을 30분 앞당기는 것을 추천합니다.
                    </p>
                    <ul className="text-sm space-y-1 text-foreground/80">
                      <li>• 취침 1시간 전 스마트폰 사용 중단</li>
                      <li>• 저녁 카페인 섭취 제한 (오후 4시 이후)</li>
                      <li>• 수면 전 10분 명상 또는 독서</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-background/80 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
                      정서적 웰빙 강화
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      긍정 정서 유지를 위한 일상 속 작은 습관 형성이 필요합니다.
                    </p>
                    <ul className="text-sm space-y-1 text-foreground/80">
                      <li>• 주 3회 이상 30분 야외 활동</li>
                      <li>• 감사 일기 작성 (매일 3가지)</li>
                      <li>• 사회적 연결 강화 (주 1회 친구/가족 만남)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    전문가 상담으로 더 정확한 분석을 받아보세요
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    AI 리포트를 바탕으로 전문가와 1:1 상담을 진행하면<br />
                    더욱 깊이 있는 분석과 맞춤형 솔루션을 받으실 수 있습니다.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={() => navigate('/expert-hiring')}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      전문가 상담 신청
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/assessment')}
                      className="border-primary/30"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      추가 검사 받기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                * 본 리포트는 AI 분석 기반 예시이며, 실제 리포트는 개인의 데이터에 따라 다르게 생성됩니다.
              </p>
              <p>
                * 의학적 진단이나 치료를 대체할 수 없으며, 필요시 전문의 상담을 받으시기 바랍니다.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SampleReport;
