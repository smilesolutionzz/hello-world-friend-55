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

          {/* Table of Contents */}
          <Card className="mb-8 bg-gradient-to-br from-secondary/5 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                목차
              </CardTitle>
              <CardDescription>
                본 리포트는 9개 섹션으로 구성되어 있으며, 총 32페이지 분량의 심층 분석 내용을 담고 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">1</span>
                  <span className="text-sm font-medium">종합 요약 및 전체 건강 점수</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">2</span>
                  <span className="text-sm font-medium">스트레스 패턴 심층 분석</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">3</span>
                  <span className="text-sm font-medium">정서 상태 및 감정 트렌드</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">4</span>
                  <span className="text-sm font-medium">수면 품질 및 생활 리듬</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">5</span>
                  <span className="text-sm font-medium">인지 기능 및 집중력 평가</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">6</span>
                  <span className="text-sm font-medium">대인관계 및 사회적 기능</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">7</span>
                  <span className="text-sm font-medium">신체 건강 지표 연동 분석</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">8</span>
                  <span className="text-sm font-medium">위험 요인 및 조기 경보 시스템</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">9</span>
                  <span className="text-sm font-medium">맞춤형 개선 로드맵 (90일)</span>
                </div>
              </div>
            </CardContent>
          </Card>

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

            {/* 4. 수면 품질 및 생활 리듬 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  4. 수면 품질 및 생활 리듬 분석
                </CardTitle>
                <CardDescription>
                  수면 패턴, 생체 리듬, 일상 활동 패턴의 종합 분석
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      <div className="flex justify-between text-sm">
                        <span>수면 효율성</span>
                        <span className="font-medium">73% (낮음)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>중도 각성 횟수</span>
                        <span className="font-medium">평균 2.4회</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">활동 패턴</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>주간 운동 횟수</span>
                        <span className="font-medium">2-3회 (부족)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>규칙적 식사</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>하루 물 섭취</span>
                        <span className="font-medium">1.2L (권장: 2L)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>스크린 타임</span>
                        <span className="font-medium">8시간 (과다)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>야외 활동</span>
                        <span className="font-medium">주 1-2회</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>전체 활동성</span>
                        <Badge variant="outline" className="border-primary/50">보통</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                  <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">생체 리듬 분석</h4>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <p>• <strong>크로노타입:</strong> 중간형 (Intermediate type)</p>
                    <p>• <strong>에너지 피크 시간:</strong> 오전 10-12시, 오후 3-5시</p>
                    <p>• <strong>집중력 최저점:</strong> 오후 2-3시 (점심 식후), 저녁 8시 이후</p>
                    <p>• <strong>수면 압력 축적:</strong> 저녁 10시부터 증가하나 실제 취침은 2.5시간 지연</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. 인지 기능 및 집중력 평가 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  5. 인지 기능 및 집중력 평가
                </CardTitle>
                <CardDescription>
                  작업 기억력, 주의력, 실행 기능, 처리 속도 등 인지 능력 종합 평가
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background/50 rounded-lg border border-border">
                    <h4 className="font-semibold mb-3 text-sm">인지 기능 점수</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>작업 기억력</span>
                          <span className="font-medium">78/100</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>지속적 주의력</span>
                          <span className="font-medium">71/100</span>
                        </div>
                        <Progress value={71} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>실행 기능</span>
                          <span className="font-medium">82/100</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>처리 속도</span>
                          <span className="font-medium">75/100</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-background/50 rounded-lg border border-border">
                    <h4 className="font-semibold mb-3 text-sm">집중력 패턴</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>평균 집중 지속 시간</span>
                        <span className="font-medium">42분</span>
                      </div>
                      <div className="flex justify-between">
                        <span>최적 집중 시간대</span>
                        <span className="font-medium">오전 10-12시</span>
                      </div>
                      <div className="flex justify-between">
                        <span>멀티태스킹 빈도</span>
                        <span className="font-medium">높음</span>
                      </div>
                      <div className="flex justify-between">
                        <span>방해 요인 대처</span>
                        <Badge variant="outline" className="border-amber-500/50 text-amber-600">개선 필요</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-900">
                  <h4 className="font-semibold mb-3 text-purple-900 dark:text-purple-100">주요 발견</h4>
                  <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                    <li>• 오전 시간대 인지 기능이 가장 우수하며, 복잡한 업무는 이 시간에 배치 권장</li>
                    <li>• 오후 2-3시 집중력 급감 (점심 식사 및 수면 부족의 복합 효과)</li>
                    <li>• 멀티태스킹으로 인한 작업 효율성 저하: 단일 업무 대비 27% 낮음</li>
                    <li>• 디지털 방해 요인(알림, SNS)이 집중력 유지에 가장 큰 장애물로 작용</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 6. 대인관계 및 사회적 기능 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  6. 대인관계 및 사회적 기능
                </CardTitle>
                <CardDescription>
                  사회적 연결, 의사소통 패턴, 관계 만족도 분석
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                    <div className="text-3xl font-bold text-primary mb-2">6.2점</div>
                    <div className="text-sm text-muted-foreground mb-2">전반적 관계 만족도</div>
                    <div className="text-xs text-muted-foreground">(10점 만점)</div>
                    <Badge variant="outline" className="mt-2 border-green-500/50 text-green-600">양호</Badge>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                    <div className="text-3xl font-bold text-secondary mb-2">주 4.2회</div>
                    <div className="text-sm text-muted-foreground mb-2">의미있는 대화</div>
                    <div className="text-xs text-muted-foreground">(30분 이상)</div>
                    <Badge variant="outline" className="mt-2 border-primary/50">보통</Badge>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                    <div className="text-3xl font-bold text-primary mb-2">68%</div>
                    <div className="text-sm text-muted-foreground mb-2">사회적 지지 체계</div>
                    <div className="text-xs text-muted-foreground">(친구, 가족)</div>
                    <Badge variant="outline" className="mt-2 border-primary/50">양호</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">관계 영역별 분석</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>가족 관계</span>
                        <span className="text-muted-foreground">7.5/10</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">부모님, 배우자/파트너와의 관계가 전반적으로 안정적</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>직장 동료 관계</span>
                        <span className="text-muted-foreground">5.8/10</span>
                      </div>
                      <Progress value={58} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">업무 협력은 원활하나 개인적 유대감은 약함</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>친구 관계</span>
                        <span className="text-muted-foreground">6.8/10</span>
                      </div>
                      <Progress value={68} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">가까운 친구 3-4명과 정기적 교류 유지</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                  <h4 className="font-semibold mb-3 text-green-900 dark:text-green-100">강점</h4>
                  <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                    <li>• 가족과의 정서적 유대감이 강하며, 주 2-3회 깊이 있는 대화 진행</li>
                    <li>• 갈등 상황에서 건설적인 의사소통 능력 보유</li>
                    <li>• 타인의 감정을 잘 이해하고 공감하는 능력 우수</li>
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                  <h4 className="font-semibold mb-3 text-amber-900 dark:text-amber-100">개선 영역</h4>
                  <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                    <li>• 업무 스트레스로 인한 사회 활동 감소 (월 평균 2회 → 주 1회 목표)</li>
                    <li>• 새로운 인간관계 형성에 대한 부담감 존재</li>
                    <li>• 디지털 소통 과다, 대면 소통 감소 (온라인 80% vs 오프라인 20%)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 7. 신체 건강 지표 연동 분석 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  7. 신체 건강 지표 연동 분석
                </CardTitle>
                <CardDescription>
                  심박수, 활동량, 신체 증상과 심리 상태의 상관관계 분석
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">생체 신호 측정</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>평균 심박수 (안정시)</span>
                        <span className="font-medium">72 bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>심박 변이도 (HRV)</span>
                        <span className="font-medium">42 ms (낮음)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>일평균 걸음 수</span>
                        <span className="font-medium">5,200보</span>
                      </div>
                      <div className="flex justify-between">
                        <span>활동 칼로리</span>
                        <span className="font-medium">280 kcal/일</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">신체 증상 보고</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>두통 빈도</span>
                        <span className="font-medium">주 2-3회</span>
                      </div>
                      <div className="flex justify-between">
                        <span>소화 불량</span>
                        <span className="font-medium">주 1-2회</span>
                      </div>
                      <div className="flex justify-between">
                        <span>근육 긴장/통증</span>
                        <span className="font-medium">거의 매일</span>
                      </div>
                      <div className="flex justify-between">
                        <span>피로감</span>
                        <span className="font-medium">중상 (7/10)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-900">
                  <h4 className="font-semibold mb-3 text-indigo-900 dark:text-indigo-100">심신 연관성 분석</h4>
                  <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
                    <li>• <strong>스트레스-신체 반응:</strong> 업무 스트레스 증가 시 심박수 15% 상승, 어깨/목 긴장도 심화</li>
                    <li>• <strong>수면-회복력:</strong> 수면 부족일수록 다음날 피로감 2배 증가, 스트레스 대처 능력 저하</li>
                    <li>• <strong>운동-기분:</strong> 운동 후 긍정 정서 38% 증가, 효과는 최대 6시간 지속</li>
                    <li>• <strong>식습관-에너지:</strong> 불규칙한 식사 시 오후 집중력 24% 저하</li>
                  </ul>
                </div>

                <div className="p-4 bg-background/50 rounded-lg border border-border">
                  <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    주의 필요 사항
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    낮은 심박변이도(HRV)는 만성 스트레스와 자율신경계 불균형을 시사합니다. 
                    규칙적인 운동, 호흡법 연습, 충분한 수면으로 개선 가능하며, 
                    지속될 경우 전문의 상담을 권장합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 8. 위험 요인 및 조기 경보 시스템 */}
            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  8. 위험 요인 및 조기 경보 시스템
                </CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-200">
                  잠재적 정신건강 위험 요인 탐지 및 예방적 개입 권고
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg border border-amber-200 dark:border-amber-900">
                    <div className="text-2xl font-bold text-amber-600 mb-2">중간</div>
                    <div className="text-sm text-muted-foreground">전체 위험도</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-amber-200 dark:border-amber-900">
                    <div className="text-2xl font-bold text-amber-600 mb-2">3개</div>
                    <div className="text-sm text-muted-foreground">주의 필요 영역</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-amber-200 dark:border-amber-900">
                    <div className="text-2xl font-bold text-green-600 mb-2">0개</div>
                    <div className="text-sm text-muted-foreground">긴급 개입 필요</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">탐지된 위험 요인</h4>
                  
                  <div className="p-4 bg-background rounded-lg border border-amber-300 dark:border-amber-800">
                    <div className="flex items-start gap-3 mb-3">
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">중간 위험</Badge>
                      <h5 className="font-semibold">만성 피로 및 수면 부족</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      지난 30일간 평균 수면 시간 6시간 20분으로 권장량(7-8시간) 대비 부족. 
                      피로도 점수 7/10으로 높은 수준 유지.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 dark:text-green-400">권장: 취침 시간 30분 앞당기기, 주말 보충 수면</span>
                    </div>
                  </div>

                  <div className="p-4 bg-background rounded-lg border border-amber-300 dark:border-amber-800">
                    <div className="flex items-start gap-3 mb-3">
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">중간 위험</Badge>
                      <h5 className="font-semibold">업무 소진(번아웃) 조기 징후</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      업무 스트레스 68/100, 직무 만족도 하락 추세(-12% in 30일). 
                      정서적 고갈 증상 주 3-4회 보고.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 dark:text-green-400">권장: 업무 경계 설정, 전문 상담 고려, 휴가 계획</span>
                    </div>
                  </div>

                  <div className="p-4 bg-background rounded-lg border border-amber-300 dark:border-amber-800">
                    <div className="flex items-start gap-3 mb-3">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">낮은 위험</Badge>
                      <h5 className="font-semibold">사회적 고립 경향</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      대면 사회 활동 빈도 감소 (주 3회 → 주 1회). 
                      주말 외부 활동 시간 평균 3시간 미만.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 dark:text-green-400">권장: 주 2회 이상 사회 활동 계획, 취미 모임 참여</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900">
                  <h4 className="font-semibold mb-3 text-red-900 dark:text-red-100 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    전문가 개입 권장 시점
                  </h4>
                  <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                    <li>• 2주 이상 지속되는 심한 우울감 또는 불안</li>
                    <li>• 일상 기능(업무, 관계, 자기관리)의 현저한 저하</li>
                    <li>• 자해 또는 자살 사고 출현</li>
                    <li>• 약물/알코올 사용 증가</li>
                    <li className="font-semibold text-red-900 dark:text-red-100">→ 현재 해당 사항 없음. 예방적 관리 단계 유지</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 9. 맞춤형 개선 로드맵 */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  9. 맞춤형 개선 로드맵 (90일)
                </CardTitle>
                <CardDescription>
                  단계별 실천 가능한 개선 계획 및 예상 효과
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-background/80 rounded-lg border border-primary/20">
                    <div className="text-xl font-bold text-primary mb-1">1단계</div>
                    <div className="text-sm text-muted-foreground">1-30일</div>
                    <div className="text-xs mt-1">기초 습관 형성</div>
                  </div>
                  <div className="text-center p-4 bg-background/80 rounded-lg border border-primary/20">
                    <div className="text-xl font-bold text-secondary mb-1">2단계</div>
                    <div className="text-sm text-muted-foreground">31-60일</div>
                    <div className="text-xs mt-1">습관 강화 및 확장</div>
                  </div>
                  <div className="text-center p-4 bg-background/80 rounded-lg border border-primary/20">
                    <div className="text-xl font-bold text-primary mb-1">3단계</div>
                    <div className="text-sm text-muted-foreground">61-90일</div>
                    <div className="text-xs mt-1">통합 및 유지</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-5">
                  {/* 1단계 */}
                  <div className="p-5 bg-background/80 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">1</div>
                      <div>
                        <h4 className="font-bold text-lg">1단계: 기초 습관 형성 (1-30일)</h4>
                        <p className="text-sm text-muted-foreground">핵심 목표: 수면 정상화 및 스트레스 관리 시작</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold mb-2 text-sm">🌙 수면 개선</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>주중 (1-2주차):</strong> 취침 시간 15분씩 앞당기기 (12:30 → 12:00)</li>
                          <li>• <strong>주중 (3-4주차):</strong> 추가로 15분 앞당기기 (12:00 → 11:45)</li>
                          <li>• <strong>매일:</strong> 취침 1시간 전 스마트폰 차단 (블루라이트 필터 앱 활용)</li>
                          <li>• <strong>주말:</strong> 평일 기상 시간 ±1시간 이내 유지 (생체리듬 보호)</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2 text-sm">💼 업무 스트레스 관리</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>매일:</strong> 포모도로 기법 적용 (50분 집중 + 10분 휴식)</li>
                          <li>• <strong>목요일 오후 3시:</strong> 필수 10분 산책 브레이크 (알람 설정)</li>
                          <li>• <strong>주 1회:</strong> 업무 우선순위 재정비 시간 (금요일 오전)</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2 text-sm">🧘 기초 이완 기법</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>매일 아침:</strong> 5분 심호흡 또는 간단한 스트레칭</li>
                          <li>• <strong>저녁:</strong> 10분 마음챙김 명상 (앱 활용: Calm, Headspace)</li>
                        </ul>
                      </div>

                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">예상 효과 (30일 후)</p>
                        <ul className="text-xs text-green-800 dark:text-green-200 space-y-0.5">
                          <li>• 평균 수면 시간 6시간 50분으로 증가 (+30분)</li>
                          <li>• 오후 피로도 15-20% 감소</li>
                          <li>• 목요일 스트레스 피크 10-15% 완화</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 2단계 */}
                  <div className="p-5 bg-background/80 rounded-lg border border-secondary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground font-bold">2</div>
                      <div>
                        <h4 className="font-bold text-lg">2단계: 습관 강화 및 확장 (31-60일)</h4>
                        <p className="text-sm text-muted-foreground">핵심 목표: 신체 활동 증가 및 사회적 연결 강화</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold mb-2 text-sm">🏃 운동 루틴 구축</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>주 3회:</strong> 30분 중강도 운동 (빠른 걷기, 조깅, 수영 중 선택)</li>
                          <li>• <strong>점심시간:</strong> 15분 산책 (일평균 걸음수 8,000보 목표)</li>
                          <li>• <strong>주말:</strong> 60분 이상 야외 활동 (등산, 자전거 등)</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2 text-sm">👥 사회적 활동 확대</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>주 2회:</strong> 친구/가족과 대면 만남 또는 전화 통화 (30분 이상)</li>
                          <li>• <strong>월 1회:</strong> 새로운 모임 또는 취미 활동 참여</li>
                          <li>• <strong>매주:</strong> 디지털 디톡스 시간 (토요일 오후 3시간, SNS 차단)</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2 text-sm">🧠 인지 기능 강화</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>매일:</strong> 단일 업무 집중 시간 확보 (멀티태스킹 최소화)</li>
                          <li>• <strong>주 3회:</strong> 독서, 퍼즐, 새로운 기술 학습 등 인지 활동 (30분)</li>
                          <li>• <strong>업무 중:</strong> 알림 차단 시간대 설정 (오전 10-12시)</li>
                        </ul>
                      </div>

                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">예상 효과 (60일 후)</p>
                        <ul className="text-xs text-green-800 dark:text-green-200 space-y-0.5">
                          <li>• 전반적 정신건강 점수 73 → 78-80점으로 개선</li>
                          <li>• 긍정 정서 비율 43% → 55% 증가</li>
                          <li>• 집중력 지속 시간 42분 → 55-60분</li>
                          <li>• 사회적 만족도 향상</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 3단계 */}
                  <div className="p-5 bg-background/80 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">3</div>
                      <div>
                        <h4 className="font-bold text-lg">3단계: 통합 및 장기 유지 (61-90일)</h4>
                        <p className="text-sm text-muted-foreground">핵심 목표: 습관 자동화 및 지속 가능한 라이프스타일 확립</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold mb-2 text-sm">🎯 개인화 최적화</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>데이터 리뷰:</strong> 2개월간 측정된 데이터 분석 및 맞춤 조정</li>
                          <li>• <strong>효과적 전략:</strong> 가장 효과적이었던 활동 파악 및 강화</li>
                          <li>• <strong>어려운 영역:</strong> 실천이 어려웠던 부분 대체 전략 수립</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2 text-sm">🌱 장기 목표 설정</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>6개월 목표:</strong> 전반적 정신건강 점수 85점 이상 유지</li>
                          <li>• <strong>1년 목표:</strong> 업무-생활 균형 완전 정착, 번아웃 재발 방지</li>
                          <li>• <strong>라이프스타일:</strong> 건강 습관의 자동화 (의지력 불필요 단계)</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2 text-sm">📊 정기 점검 체계</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>주간:</strong> 간단한 자가 평가 (5분, 체크리스트)</li>
                          <li>• <strong>월간:</strong> 종합 리포트 확인 및 전문가 피드백 (선택)</li>
                          <li>• <strong>분기:</strong> 심층 재평가 및 목표 재설정</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2 text-sm">🛡️ 재발 방지 전략</h5>
                        <ul className="text-sm space-y-1 text-foreground/80 ml-4">
                          <li>• <strong>조기 경보:</strong> 스트레스 증가 신호 인지 체계 (주간 자가 점검)</li>
                          <li>• <strong>대처 계획:</strong> 위기 상황별 대응 매뉴얼 준비</li>
                          <li>• <strong>지지 체계:</strong> 가족/친구에게 자신의 목표 공유, 응원 요청</li>
                          <li>• <strong>전문가 네트워크:</strong> 필요 시 즉시 상담 가능한 전문가 확보</li>
                        </ul>
                      </div>

                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">예상 효과 (90일 후)</p>
                        <ul className="text-xs text-green-800 dark:text-green-200 space-y-0.5">
                          <li>• 전반적 정신건강 점수 73 → 82-85점</li>
                          <li>• 수면 품질 및 시간 정상화 (평균 7시간 이상)</li>
                          <li>• 업무 스트레스 68 → 50-55점으로 감소</li>
                          <li>• 긍정 정서 비율 60% 이상 유지</li>
                          <li>• 신체 건강 지표 개선 (HRV, 활동량, 피로도)</li>
                          <li>• 자기 관리 능력 및 삶의 만족도 향상</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-lg border border-blue-200 dark:border-blue-900">
                  <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    성공을 위한 핵심 원칙
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                    <div>
                      <p className="font-semibold mb-2">✅ DO</p>
                      <ul className="space-y-1">
                        <li>• 작은 변화부터 시작하고 점진적으로 확대</li>
                        <li>• 매일 같은 시간에 실천 (습관화 촉진)</li>
                        <li>• 성공 경험 기록 및 자축</li>
                        <li>• 실패해도 자책하지 않고 다시 시작</li>
                        <li>• 전문가 도움 필요 시 주저하지 않기</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">❌ DON'T</p>
                      <ul className="space-y-1">
                        <li>• 한 번에 모든 것 바꾸려 하지 않기</li>
                        <li>• 완벽주의에 사로잡히지 않기</li>
                        <li>• 다른 사람과 비교하지 않기</li>
                        <li>• 단기적 결과에 집착하지 않기</li>
                        <li>• 위험 신호 무시하지 않기</li>
                      </ul>
                    </div>
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
