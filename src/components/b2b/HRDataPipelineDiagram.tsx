import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus, Activity, BarChart3, Target,
  ArrowRight, Lock, EyeOff, Users, Bell
} from 'lucide-react';

/**
 * "직원 데이터가 회사 HR 대시보드에 어떻게 적재되는가"
 * 4단계 파이프라인 시각화 — B2B 영업 자료 + HR 페이지 임베드용
 */
const HRDataPipelineDiagram = () => {
  const stages = [
    {
      step: 1,
      icon: UserPlus,
      title: '직원 가입·동의',
      who: '직원 본인',
      what: '회사 가입 코드 입력 → 익명 모드 자동 활성화',
      table: 'employee_organization_links',
      privacy: '실명 공유는 옵트인 토글',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-700',
    },
    {
      step: 2,
      icon: Activity,
      title: '셀프 체크·코칭',
      who: '직원 (앱 사용)',
      what: '번아웃·스트레스 검사, 1:1 AI 코칭',
      table: 'b2b_jobcoach_employee_sessions',
      privacy: '원본 데이터는 본인만 조회',
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-700',
    },
    {
      step: 3,
      icon: BarChart3,
      title: 'AI 익명 집계',
      who: '시스템 자동',
      what: '부서별 평균·고위험군 N명 (5명 미만 마스킹)',
      table: 'get_department_aggregated_stats()',
      privacy: '개인 식별 불가능',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-700',
    },
    {
      step: 4,
      icon: Target,
      title: 'HR 액션',
      who: 'HR 담당자',
      what: 'Top 3 액션 + 위험 알림 + 월간 PDF',
      table: 'b2b_jobcoach_team_reports',
      privacy: '실명 보기는 직원 동의 시만',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-700',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            데이터 파이프라인 · 프라이버시 우선 설계
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 break-keep">
            직원 데이터가 회사로 가는 4단계
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto break-keep">
            "어떻게 익명을 보장하면서도 HR이 실행 가능한 인사이트를 받느냐" — 모든 단계의 답.
          </p>
        </div>

        {/* Desktop: 4-column flow */}
        <div className="hidden md:grid grid-cols-4 gap-3 mb-6">
          {stages.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative">
                <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${s.iconText}`} />
                      </div>
                      <span className="text-3xl font-bold text-muted-foreground/20">0{s.step}</span>
                    </div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      {s.who}
                    </p>
                    <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 break-keep min-h-[3rem]">
                      {s.what}
                    </p>
                    <div className="space-y-1 pt-2 border-t">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{s.table}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700">
                        <EyeOff className="w-3 h-3" />
                        <span>{s.privacy}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {i < stages.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-3 mb-6">
          {stages.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.step}>
                <CardContent className="p-4 flex gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${s.iconText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">0{s.step}</span>
                      <p className="font-bold">{s.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 break-keep">{s.what}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 mt-2">
                      <EyeOff className="w-3 h-3" /> {s.privacy}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* What HR sees */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-emerald-900">기본 모드: 회사가 보는 것</h3>
              </div>
              <ul className="space-y-2 text-sm text-emerald-900">
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> 부서별 평균 스트레스·번아웃 점수</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> 부서별 고위험군 인원 수 (5명 이상)</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> 참여율, 코칭 이용률</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> 월간 PDF 리포트 자동 메일</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-rose-200 bg-rose-50/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-rose-700" />
                <h3 className="font-bold text-rose-900">기본 모드: 회사가 절대 못 보는 것</h3>
              </div>
              <ul className="space-y-2 text-sm text-rose-900">
                <li className="flex gap-2"><span className="text-rose-600">✗</span> 김OO이 어떤 점수를 받았는지</li>
                <li className="flex gap-2"><span className="text-rose-600">✗</span> 누가 코칭을 받았는지 (이름·내용)</li>
                <li className="flex gap-2"><span className="text-rose-600">✗</span> 5명 미만 부서의 평균 (자동 마스킹)</li>
                <li className="flex gap-2"><span className="text-rose-600">✗</span> 직원이 입력한 텍스트 원문</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Crisis exception */}
        <Card className="mt-4 border-amber-200 bg-amber-50/30">
          <CardContent className="p-5 flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-1">예외: 자살·번아웃 위기 신호</h3>
              <p className="text-sm text-amber-900 break-keep">
                생명에 직결된 위험이 감지될 경우, 직원 동의 없이도 HR과 EAP 담당자에게 <strong>익명 알림</strong>이 발송됩니다.
                (개인 식별 정보는 절대 포함하지 않으며, 부서·시간대 정보만 전달)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HRDataPipelineDiagram;
