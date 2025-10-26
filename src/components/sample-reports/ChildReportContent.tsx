import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Heart,
  Smile,
  Users,
  BookOpen,
  Sparkles,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Target,
  FileText
} from "lucide-react";

export const ChildReportContent = () => {
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
            본 리포트는 7개 영역으로 구성된 종합 발달 평가 분석입니다. (총 28페이지)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "종합 발달 프로파일",
              "인지 발달 평가",
              "언어 및 의사소통 능력",
              "사회정서 발달",
              "신체 및 운동 발달",
              "주의력 및 실행 기능",
              "양육 가이드 및 발달 지원 계획"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">{index + 1}</span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 종합 발달 프로파일 */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            1. 종합 발달 프로파일
          </CardTitle>
          <CardDescription>
            박○○ 아동 (만 5세 3개월) 종합 발달 상태 분석
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary mb-1">92점</div>
              <div className="text-sm text-muted-foreground">전체 발달 지수</div>
              <Badge variant="outline" className="mt-2 border-green-500/50 text-green-600">우수</Badge>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-secondary mb-1">5세 9개월</div>
              <div className="text-sm text-muted-foreground">발달 연령</div>
              <Badge variant="outline" className="mt-2 border-primary/50">+6개월 앞섬</Badge>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary mb-1">상위 15%</div>
              <div className="text-sm text-muted-foreground">또래 대비</div>
              <Badge variant="outline" className="mt-2 border-primary/50">평균 이상</Badge>
            </div>
          </div>

          <div className="bg-background/80 p-6 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              AI 발달 전문가 분석
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              박○○ 아동은 <strong className="text-primary">전반적으로 연령 대비 우수한 발달</strong>을 보이고 있습니다. 
              특히 <strong className="text-secondary">언어 능력과 사회정서 발달</strong>이 뛰어나며, 
              또래와의 상호작용에서 리더십을 발휘합니다. 다만, 대근육 운동 발달이 또래 평균 수준으로 
              신체 활동을 통한 발달 자극이 추가로 필요해 보입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                강점 영역
              </h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• 언어 발달 (상위 10%)</li>
                <li>• 정서 인식 및 조절</li>
                <li>• 사회적 상호작용</li>
                <li>• 문제 해결 능력</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                발달 지원 필요 영역
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• 대근육 운동 (평균 수준)</li>
                <li>• 지속적 주의 집중</li>
                <li>• 좌절 인내력</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 인지 발달 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            2. 인지 발달 평가
          </CardTitle>
          <CardDescription>
            문제 해결, 기억력, 논리적 사고 능력 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">작업 기억</span>
                <span className="text-muted-foreground">88/100</span>
              </div>
              <Progress value={88} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">5-7개 항목 기억 가능 (우수)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">문제 해결</span>
                <span className="text-muted-foreground">92/100</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">다양한 전략 시도, 창의적 사고 (매우 우수)</p>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">논리적 사고</span>
                <span className="text-muted-foreground">85/100</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">인과관계 이해, 패턴 인식 능력 우수</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. 언어 및 의사소통 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            3. 언어 및 의사소통 능력
          </CardTitle>
          <CardDescription>
            표현 언어, 수용 언어, 대화 능력 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-3 text-sm">표현 언어</h4>
              <ul className="text-sm space-y-2 text-foreground/80">
                <li>• <strong>어휘력:</strong> 약 2,500단어 (6세 수준)</li>
                <li>• <strong>문장 구성:</strong> 복문 사용 가능</li>
                <li>• <strong>이야기 구성:</strong> 시간 순서대로 설명</li>
                <li>• <strong>발음:</strong> 명료도 95% 이상</li>
              </ul>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-3 text-sm">수용 언어</h4>
              <ul className="text-sm space-y-2 text-foreground/80">
                <li>• <strong>지시 이행:</strong> 3단계 지시 완수</li>
                <li>• <strong>이해력:</strong> 추상적 개념 이해</li>
                <li>• <strong>질문 이해:</strong> "왜", "어떻게" 질문 이해</li>
                <li>• <strong>문맥 파악:</strong> 이야기 맥락 이해 우수</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-green-900 dark:text-green-100">특별한 강점</h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• 자신의 감정과 생각을 명확하게 표현</li>
                  <li>• 이야기 듣기를 좋아하며 내용을 잘 기억</li>
                  <li>• 새로운 단어를 빠르게 습득하고 활용</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. 사회정서 발달 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            4. 사회정서 발달
          </CardTitle>
          <CardDescription>
            정서 조절, 또래 관계, 공감 능력 평가
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <div className="text-2xl mb-1">😊</div>
              <div className="text-sm font-medium text-green-700 dark:text-green-300">정서 인식</div>
              <div className="text-xs text-green-600 dark:text-green-400">매우 우수</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="text-2xl mb-1">🤝</div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">협동 놀이</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">우수</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
              <div className="text-2xl mb-1">❤️</div>
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">공감 능력</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">매우 우수</div>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <div className="text-2xl mb-1">😤</div>
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">정서 조절</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">보통</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">또래 관계</h4>
            <ul className="text-sm space-y-2 text-foreground/80">
              <li>• 친구들과 잘 어울리며 리더십을 발휘</li>
              <li>• 놀이 규칙을 이해하고 준수</li>
              <li>• 친구의 감정을 알아차리고 위로할 수 있음</li>
              <li>• 자신의 차례를 기다리는 데 어려움 (개선 필요)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 간략한 섹션들 (5-7번) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            5-7. 추가 발달 영역
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-foreground/80">
            <div>
              <p className="font-semibold mb-1">5. 신체 및 운동 발달</p>
              <p className="text-muted-foreground">• 소근육 운동: 가위질, 색칠하기 우수 (95점)</p>
              <p className="text-muted-foreground">• 대근육 운동: 달리기, 공 던지기 평균 수준 (73점) - 발달 자극 필요</p>
            </div>
            <div>
              <p className="font-semibold mb-1">6. 주의력 및 실행 기능</p>
              <p className="text-muted-foreground">• 선택적 주의력: 우수 (흥미 활동에 20분 이상 집중)</p>
              <p className="text-muted-foreground">• 지속적 주의력: 보통 (반복 과제에서 10분 정도 유지)</p>
              <p className="text-muted-foreground">• 충동 조절: 개선 필요 (즉각적 보상 선호)</p>
            </div>
            <div>
              <p className="font-semibold mb-1">7. 양육 가이드 및 발달 지원 계획</p>
              <p className="text-muted-foreground">• 대근육 발달: 주 3회 야외 활동, 자전거 타기 권장</p>
              <p className="text-muted-foreground">• 정서 조절: 감정 이름 붙이기, 진정 전략 연습</p>
              <p className="text-muted-foreground">• 주의력 향상: 짧은 과제로 시작하여 점진적으로 시간 연장</p>
            </div>
            <p className="text-xs mt-4 italic text-muted-foreground">* 실제 리포트에는 각 영역별 상세한 평가 결과, 관찰 사례, 맞춤 발달 활동이 포함됩니다.</p>
          </div>
        </CardContent>
      </Card>

      {/* 부모 가이드 */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-primary" />
            부모님을 위한 발달 지원 가이드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background/80 rounded-lg border border-border">
            <h4 className="font-semibold mb-3">이번 달 중점 발달 목표</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">1. 대근육 운동 강화 (주 3-4회)</p>
                <ul className="ml-4 space-y-1 text-muted-foreground">
                  <li>• 공원에서 자전거 타기 30분</li>
                  <li>• 공 던지기/받기 놀이</li>
                  <li>• 평균대 걷기, 한발 뛰기 연습</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">2. 정서 조절 능력 향상 (매일)</p>
                <ul className="ml-4 space-y-1 text-muted-foreground">
                  <li>• 감정 카드로 감정 이름 익히기</li>
                  <li>• 화났을 때: 깊게 숨쉬기 3번 연습</li>
                  <li>• 긍정적 행동에 즉각적인 칭찬</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">3. 집중력 훈련 (주 5회)</p>
                <ul className="ml-4 space-y-1 text-muted-foreground">
                  <li>• 10분 과제로 시작 → 점진적으로 15분까지 연장</li>
                  <li>• 퍼즐, 레고 등 집중 놀이</li>
                  <li>• 과제 완료 후 스티커 보상</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              전문가 개입 권장 시점
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 3개월 후 재평가 시 주의력 점수 향상 없을 경우</li>
              <li>• 또래와의 상호작용에 지속적 어려움 발생 시</li>
              <li>• 정서 폭발이 주 3회 이상 반복될 경우</li>
              <li className="font-semibold text-blue-900 dark:text-blue-100">→ 현재는 가정 내 발달 지원으로 충분</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};