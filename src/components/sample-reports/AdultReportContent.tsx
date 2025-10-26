import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  TrendingUp,
  Heart,
  AlertCircle,
  CheckCircle,
  Activity,
  Target,
  BarChart3,
  FileText,
  Users
} from "lucide-react";

export const AdultReportContent = () => {
  return (
    <div className="space-y-6">
      {/* Table of Contents */}
      <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-primary/20">
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
            {[
              "종합 요약 및 전체 건강 점수",
              "스트레스 패턴 심층 분석",
              "정서 상태 및 감정 트렌드",
              "수면 품질 및 생활 리듬",
              "인지 기능 및 집중력 평가",
              "대인관계 및 사회적 기능",
              "신체 건강 지표 연동 분석",
              "위험 요인 및 조기 경보 시스템",
              "맞춤형 개선 로드맵 (90일)"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">{index + 1}</span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            1. 종합 요약
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

      {/* 2. 스트레스 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            2. 스트레스 패턴 분석
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

      {/* 3. 정서 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            3. 정서 상태 분석
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

      {/* 4. 수면 품질 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            4. 수면 품질 및 생활 리듬
          </CardTitle>
          <CardDescription>
            수면 패턴 및 생체 리듬 분석
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">평균 수면 시간</span>
                <span className="text-muted-foreground">6시간 20분</span>
              </div>
              <Progress value={79} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">권장: 7-8시간</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">수면 효율</span>
                <span className="text-muted-foreground">73%</span>
              </div>
              <Progress value={73} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">침대에 있는 시간 대비 실제 수면 시간 비율</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">깊은 수면 비율</span>
                <span className="text-muted-foreground">18%</span>
              </div>
              <Progress value={18} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">권장: 20-25%</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">수면 패턴 분석</h4>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• 평균 입면 시간 25분 (정상: 10-20분)</li>
                  <li>• 야간 각성 횟수 평균 3회</li>
                  <li>• 주말 수면 시간이 평일보다 1.5시간 많음 (수면 부채 보상)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. 인지 기능 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            5. 인지 기능 및 집중력 평가
          </CardTitle>
          <CardDescription>
            작업 기억, 주의력, 실행 기능 종합 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">작업 기억력</span>
                <span className="text-muted-foreground">78/100</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">양호 (7±2 항목 기억 가능)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">지속적 주의력</span>
                <span className="text-muted-foreground">71/100</span>
              </div>
              <Progress value={71} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">보통 (45분 집중 후 저하)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">인지적 유연성</span>
                <span className="text-muted-foreground">82/100</span>
              </div>
              <Progress value={82} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">양호 (과제 전환 능력 우수)</p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900 dark:text-green-100">강점</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  복잡한 문제 해결 능력과 멀티태스킹 능력이 우수합니다. 다만 장시간 집중 시 피로도 증가.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. 대인관계 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            6. 대인관계 및 사회적 기능
          </CardTitle>
          <CardDescription>
            사회적 관계의 질과 만족도 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-3 text-sm">관계 만족도</h4>
              <ul className="text-sm space-y-2 text-foreground/80">
                <li>• <strong>가족 관계:</strong> 7.5/10 (양호)</li>
                <li>• <strong>친구 관계:</strong> 6.8/10 (보통)</li>
                <li>• <strong>직장 동료:</strong> 5.2/10 (개선 필요)</li>
                <li>• <strong>전반적 만족도:</strong> 6.2/10</li>
              </ul>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-3 text-sm">사회적 활동</h4>
              <ul className="text-sm space-y-2 text-foreground/80">
                <li>• 월 평균 모임: 3-4회</li>
                <li>• 친밀한 친구 수: 4명</li>
                <li>• 사회적 지지 체계: 보통</li>
                <li>• 외로움 지수: 낮음</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">개선 제안</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              직장 내 관계 개선을 위해 점심 식사나 팀 활동 참여를 늘리고, 
              주말 취미 활동을 통한 새로운 인맥 형성을 권장합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 7. 신체 건강 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            7. 신체 건강 지표 연동 분석
          </CardTitle>
          <CardDescription>
            생체 데이터 기반 신체 건강 상태 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">평균 심박수</span>
                <span className="text-muted-foreground">72 bpm</span>
              </div>
              <Progress value={72} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">정상 범위 (60-100 bpm)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">심박변이도 (HRV)</span>
                <span className="text-muted-foreground">42 ms</span>
              </div>
              <Progress value={42} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">낮음 (스트레스 회복력 저하)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">주간 운동량</span>
                <span className="text-muted-foreground">90분</span>
              </div>
              <Progress value={36} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">부족 (권장: 150분 이상)</p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">주의 필요</h4>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• HRV 감소로 만성 스트레스 상태 지속</li>
                  <li>• 규칙적인 유산소 운동 필요 (주 3회, 30분 이상)</li>
                  <li>• 심혈관 건강을 위한 생활 습관 개선 권장</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8. 위험 요인 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            8. 위험 요인 및 조기 경보 시스템
          </CardTitle>
          <CardDescription>
            번아웃, 우울증 등 주요 위험 요인 모니터링
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">번아웃 위험도</h4>
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300">중간</Badge>
              </div>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• 정서적 소진: 보통 수준</li>
                <li>• 직무 관련 피로도: 높음</li>
                <li>• 성취감 저하: 경미함</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-900 dark:text-green-100">우울증 위험도</h4>
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">낮음</Badge>
              </div>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• 우울 증상 점수: 8/27 (정상)</li>
                <li>• 흥미 저하: 없음</li>
                <li>• 자살 사고: 없음</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">불안장애 위험도</h4>
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300">낮음</Badge>
              </div>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• 불안 증상 점수: 5/21 (정상)</li>
                <li>• 신체화 증상: 경미함</li>
                <li>• 걱정 조절 능력: 양호</li>
              </ul>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              AI 조기 경보 알림
            </h4>
            <p className="text-sm text-foreground/80">
              현재 중증 정신건강 위험은 없으나, 번아웃 예방을 위한 워크-라이프 밸런스 개선이 필요합니다.
              스트레스 관리 프로그램 참여를 권장합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 9. 개선 로드맵 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            9. 맞춤형 개선 로드맵 (90일)
          </CardTitle>
          <CardDescription>
            단계별 실행 가능한 개선 계획
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 bg-background/80 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">1</div>
                <div>
                  <h4 className="font-semibold">1-30일: 수면 정상화 집중</h4>
                  <p className="text-xs text-muted-foreground">기초 체력 회복 단계</p>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-foreground/80 ml-13">
                <li>• 매일 밤 11시 취침, 오전 7시 기상</li>
                <li>• 취침 1시간 전 블루라이트 차단</li>
                <li>• 저녁 카페인 제한 (오후 4시 이후 금지)</li>
                <li>• 수면 환경 최적화 (온도 18-22℃, 암막커튼)</li>
                <li className="font-medium text-primary mt-2">목표: 평균 7시간 수면 달성</li>
              </ul>
            </div>

            <div className="p-4 bg-background/80 rounded-lg border border-secondary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary font-bold">2</div>
                <div>
                  <h4 className="font-semibold">31-60일: 운동 루틴 확립</h4>
                  <p className="text-xs text-muted-foreground">신체 활력 회복 단계</p>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-foreground/80 ml-13">
                <li>• 주 3회 유산소 운동 30분 (걷기, 조깅, 수영)</li>
                <li>• 주 2회 근력 운동 20분</li>
                <li>• 점심시간 10분 산책</li>
                <li>• 스트레칭 루틴 (아침 5분, 저녁 5분)</li>
                <li className="font-medium text-secondary mt-2">목표: 주 150분 이상 운동 달성</li>
              </ul>
            </div>

            <div className="p-4 bg-background/80 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">3</div>
                <div>
                  <h4 className="font-semibold">61-90일: 습관 자동화 및 고도화</h4>
                  <p className="text-xs text-muted-foreground">지속 가능한 시스템 구축</p>
                </div>
              </div>
              <ul className="text-sm space-y-1 text-foreground/80 ml-13">
                <li>• 명상 및 마음챙김 (하루 10분)</li>
                <li>• 스트레스 관리 기술 실천</li>
                <li>• 사회적 활동 확대 (주 1회 친구 만남)</li>
                <li>• 취미 활동 시간 확보 (주말 2시간)</li>
                <li className="font-medium text-primary mt-2">목표: 모든 습관 자동화 및 안정적 유지</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex gap-3">
              <Target className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900 dark:text-green-100">90일 후 예상 개선 효과</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• 전반적 정신건강 점수 73점 → 85점 이상</li>
                  <li>• 스트레스 수준 30% 감소</li>
                  <li>• 수면의 질 73% → 85% 이상</li>
                  <li>• 번아웃 위험도 중간 → 낮음</li>
                  <li>• 삶의 만족도 향상</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 전문가 제안 */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            AI 기반 핵심 개선 제안
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background/80 rounded-lg border border-border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
              업무 스트레스 관리
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              목요일 오후 시간대 스트레스 집중 관리를 위한 단기 휴식 패턴 도입을 권장합니다.
            </p>
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>• 오후 3시 10분 스트레칭 브레이크</li>
              <li>• 업무 블록 단위 분할 (50분 집중 + 10분 휴식)</li>
            </ul>
          </div>

          <div className="p-4 bg-background/80 rounded-lg border border-border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
              수면 품질 개선
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              최소 7시간 수면 확보를 위해 취침 시간을 30분 앞당기는 것을 추천합니다.
            </p>
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>• 취침 1시간 전 스마트폰 사용 중단</li>
              <li>• 저녁 카페인 섭취 제한 (오후 4시 이후)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};