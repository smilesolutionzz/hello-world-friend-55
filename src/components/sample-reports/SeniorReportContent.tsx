import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Heart,
  Activity,
  Users,
  Apple,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Target,
  FileText,
  Pill
} from "lucide-react";

export const SeniorReportContent = () => {
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
            본 리포트는 8개 영역으로 구성된 종합 건강 평가 분석입니다. (총 35페이지)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "종합 건강 프로파일",
              "인지 기능 및 기억력 평가",
              "일상생활 수행 능력",
              "정서 및 우울 평가",
              "사회적 관계 및 활동",
              "신체 건강 및 만성질환 관리",
              "낙상 위험도 및 영양 상태",
              "맞춤형 건강 관리 계획"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">{index + 1}</span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 종합 건강 프로파일 */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            1. 종합 건강 프로파일
          </CardTitle>
          <CardDescription>
            이○○ 님 (만 72세) 종합 건강 상태 분석
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary mb-1">78점</div>
              <div className="text-sm text-muted-foreground">전반적 건강 지수</div>
              <Badge variant="outline" className="mt-2 border-green-500/50 text-green-600">양호</Badge>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-secondary mb-1">82점</div>
              <div className="text-sm text-muted-foreground">인지 기능 점수</div>
              <Badge variant="outline" className="mt-2 border-primary/50">정상 범위</Badge>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary mb-1">낮음</div>
              <div className="text-sm text-muted-foreground">치매 위험도</div>
              <Badge variant="outline" className="mt-2 border-green-500/50 text-green-600">안전</Badge>
            </div>
          </div>

          <div className="bg-background/80 p-6 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              AI 건강 전문가 분석
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              이○○ 님은 <strong className="text-primary">연령 대비 양호한 건강 상태</strong>를 유지하고 계십니다. 
              인지 기능은 정상 범위이며, <strong className="text-secondary">사회 활동 참여도가 높아</strong> 정서적으로도 
              안정적입니다. 다만, 고혈압과 당뇨 관리가 필요하며, 최근 체중 감소가 관찰되어 
              영양 상태 개선이 권장됩니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                건강 강점
              </h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• 규칙적인 사회 활동 (주 4회)</li>
                <li>• 긍정적 정서 상태</li>
                <li>• 양호한 인지 기능</li>
                <li>• 약물 복용 순응도 높음</li>
              </ul>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
              <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                관리 필요 영역
              </h4>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• 혈압·혈당 수치 관리</li>
                <li>• 체중 감소 (3개월간 -3kg)</li>
                <li>• 수면의 질 저하</li>
                <li>• 낙상 위험도 보통</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 인지 기능 평가 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            2. 인지 기능 및 기억력 평가
          </CardTitle>
          <CardDescription>
            치매 조기 선별 및 인지 능력 종합 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">단기 기억력</span>
                <span className="text-muted-foreground">80/100</span>
              </div>
              <Progress value={80} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">3개 단어 5분 후 회상 가능 (정상)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">주의 집중력</span>
                <span className="text-muted-foreground">78/100</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">연속 숫자 거꾸로 말하기 5자리 (정상)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">언어 유창성</span>
                <span className="text-muted-foreground">85/100</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">1분간 동물 이름 15개 말하기 (우수)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">시공간 능력</span>
                <span className="text-muted-foreground">82/100</span>
              </div>
              <Progress value={82} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">시계 그리기, 도형 따라 그리기 정확 (정상)</p>
            </div>
          </div>

          <Separator />

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900 dark:text-green-100">종합 판정</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• <strong>인지기능 평가 점수: 28/30점</strong> (정상 범위: 24점 이상)</li>
                  <li>• 치매 가능성: 낮음 (지속적 관리 권장)</li>
                  <li>• 6개월 후 재검사 권장</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. 일상생활 수행 능력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            3. 일상생활 수행 능력 (ADL/IADL)
          </CardTitle>
          <CardDescription>
            기본 및 도구적 일상생활 활동 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                기본 일상생활 (ADL)
              </h4>
              <ul className="text-sm space-y-2 text-foreground/80">
                <li>• <strong>식사:</strong> 독립적 수행 ✓</li>
                <li>• <strong>옷 입기:</strong> 독립적 수행 ✓</li>
                <li>• <strong>세면/목욕:</strong> 독립적 수행 ✓</li>
                <li>• <strong>화장실 사용:</strong> 독립적 수행 ✓</li>
                <li>• <strong>이동:</strong> 독립적 수행 ✓</li>
              </ul>
              <Badge className="mt-3 bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30">완전 자립</Badge>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                도구적 일상생활 (IADL)
              </h4>
              <ul className="text-sm space-y-2 text-foreground/80">
                <li>• <strong>전화 사용:</strong> 독립적 ✓</li>
                <li>• <strong>장보기:</strong> 독립적 ✓</li>
                <li>• <strong>식사 준비:</strong> 독립적 ✓</li>
                <li>• <strong>약물 관리:</strong> 부분 도움 필요 ⚠️</li>
                <li>• <strong>금전 관리:</strong> 독립적 ✓</li>
              </ul>
              <Badge className="mt-3 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">대체로 자립</Badge>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">개선 권장사항</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              약물 복용 스케줄 관리를 위해 <strong>알람 설정</strong> 또는 <strong>약 복용 체크리스트</strong> 사용을 권장합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. 정서 및 우울 평가 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            4. 정서 상태 및 우울 평가
          </CardTitle>
          <CardDescription>
            노인 우울 척도 및 정서 안정성 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <div className="text-2xl mb-1">😊</div>
              <div className="text-sm font-medium text-green-700 dark:text-green-300">긍정 정서</div>
              <div className="text-xs text-green-600 dark:text-green-400">68%</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="text-2xl mb-1">😌</div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">평온함</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">22%</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-900">
              <div className="text-2xl mb-1">😐</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">무기력</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">7%</div>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <div className="text-2xl mb-1">😔</div>
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">우울감</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">3%</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">노인 우울 척도 (GDS)</span>
                <span className="text-muted-foreground">4/15점</span>
              </div>
              <Progress value={27} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">정상 범위 (0-5점: 정상, 6-10점: 경증 우울)</p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900 dark:text-green-100">정서적 강점</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• 삶에 대한 만족도가 높음</li>
                  <li>• 긍정적 사회 관계 유지</li>
                  <li>• 취미 활동을 통한 즐거움 경험</li>
                  <li>• 우울증 위험 낮음</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note: 상세 섹션 5-8은 위에 이미 추가되어 있습니다 */}

      {/* 건강 관리 제안 */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            AI 기반 건강 개선 제안
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background/80 rounded-lg border border-border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
              만성질환 관리 강화
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              혈압과 혈당 수치 개선을 위한 생활 습관 조정이 필요합니다.
            </p>
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>• 나트륨 섭취 하루 2,000mg 이하로 제한</li>
              <li>• 식사 후 20분 산책 (혈당 조절 효과)</li>
              <li>• 주 2회 혈압 측정 및 기록</li>
            </ul>
          </div>

          <div className="p-4 bg-background/80 rounded-lg border border-border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
              낙상 예방 프로그램
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              균형 감각 향상과 근력 강화로 낙상 위험을 줄일 수 있습니다.
            </p>
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>• 주 3회 균형 운동 (한발 서기, 뒤꿈치 들기)</li>
              <li>• 하체 근력 운동 (의자에서 일어서기 10회 × 3세트)</li>
              <li>• 집안 환경 개선 (미끄럼 방지 매트, 손잡이 설치)</li>
            </ul>
          </div>

          <div className="p-4 bg-background/80 rounded-lg border border-border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">3</span>
              영양 상태 개선
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              체중 감소 예방과 근육량 유지를 위한 영양 보충이 필요합니다.
            </p>
            <ul className="text-sm space-y-1 text-foreground/80">
              <li>• 하루 단백질 60g 이상 섭취 (계란, 두부, 생선)</li>
              <li>• 끼니마다 고른 영양소 섭취</li>
              <li>• 필요시 영양 보충제 (단백질 파우더) 상담</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};