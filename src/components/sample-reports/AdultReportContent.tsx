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
  FileText
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

      {/* 간략한 섹션들 (4-9번은 제목만) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            4-9. 추가 심층 분석 섹션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• <strong>4. 수면 품질 및 생활 리듬:</strong> 평균 수면 6시간 20분, 수면 효율 73% - 개선 필요</p>
            <p>• <strong>5. 인지 기능 및 집중력:</strong> 작업 기억력 78점, 지속적 주의력 71점 - 양호</p>
            <p>• <strong>6. 대인관계 및 사회적 기능:</strong> 관계 만족도 6.2/10 - 보통</p>
            <p>• <strong>7. 신체 건강 지표:</strong> 심박변이도 낮음, 주간 운동 부족 - 주의 필요</p>
            <p>• <strong>8. 위험 요인:</strong> 만성 피로, 번아웃 조기 징후 - 중간 위험</p>
            <p>• <strong>9. 90일 개선 로드맵:</strong> 수면 정상화 → 운동 루틴 → 습관 자동화</p>
            <p className="text-xs mt-4 italic">* 실제 리포트에는 각 섹션별 상세한 데이터와 그래프, 맞춤 제안이 포함됩니다.</p>
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