import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  School, Send, FileText, TrendingUp, ArrowRight,
  CheckCircle2, Sparkles, Heart, Users, Calendar
} from 'lucide-react';

/**
 * 어린이집·유치원 부모상담 솔루션 마케팅 섹션
 * /b2b-proposal 내부 '유아교육기관' 탭에 임베드
 */
const B2BKindergartenSection = () => {
  const navigate = useNavigate();

  const flow = [
    { step: 1, icon: Send, title: '교사가 케이스 생성', desc: '아동 닉네임·월령·상담 포커스 입력 → AI가 검사 자동 큐레이션 → 부모에게 익명 링크 발송', color: 'bg-blue-100 text-blue-700' },
    { step: 2, icon: FileText, title: '부모 5분 검사 (T0)', desc: '로그인 없이 가정에서 응답. 5개 영역 20문항 (인지·언어·사회성·행동·자조)', color: 'bg-purple-100 text-purple-700' },
    { step: 3, icon: Heart, title: '교사·부모용 PDF 2종 자동', desc: '교사용 (임상 톤) + 부모용 (쉬운말). 상담 자리에서 한 페이지로 공유', color: 'bg-rose-100 text-rose-700' },
    { step: 4, icon: TrendingUp, title: '30·60일 개선도 추적', desc: 'AI가 자동 재초대 → RCI(신뢰변화지수) 산출 → 교사·부모 액션 코멘트 갱신', color: 'bg-emerald-100 text-emerald-700' },
  ];

  const benefits = [
    { for: '원장님', items: ['학부모 만족도 상승 (전문 데이터 기반 상담)', '교사 상담 준비 시간 80% 절감', '아동 행동 개선 정량 증명 자료 확보'] },
    { for: '담임교사', items: ['상담 전 준비 자료 자동 생성', '딥한 1:1 상담 가능 (감으로가 아닌 데이터로)', '학부모 신뢰도·협조도 향상'] },
    { for: '학부모', items: ['우리 아이의 객관적 발달 지표 확인', '집에서 실천할 구체적 액션 가이드', '30·60일 후 개선도 시각화'] },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50/40 via-white to-rose-50/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3 gap-1.5 border-amber-300 text-amber-800">
            <School className="w-3.5 h-3.5" /> 어린이집·유치원 전용
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 break-keep">
            부모상담을 <span className="text-amber-700">'전문 데이터 기반'</span>으로
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto break-keep text-base">
            검사 1회로 끝나지 않습니다. 30·60일 후 개선도까지 추적해<br className="hidden md:block" />
            아동 행동 개선의 효과를 정량적으로 증명합니다.
          </p>
        </div>

        {/* 4-step flow */}
        <div className="grid md:grid-cols-4 gap-3 mb-12">
          {flow.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative">
                <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-3xl font-bold text-muted-foreground/15">0{s.step}</span>
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-sm">{s.title}</h3>
                    <p className="text-xs text-muted-foreground break-keep leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
                {i < flow.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* Benefits 3-up */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {benefits.map((b, i) => (
            <Card key={i} className="border-amber-200/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-foreground">{b.for}</h3>
                </div>
                <ul className="space-y-2">
                  {b.items.map((item, j) => (
                    <li key={j} className="flex gap-2 text-sm text-muted-foreground break-keep">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample report preview teaser */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30 mb-3">
                  실제 리포트 예시
                </Badge>
                <h3 className="text-xl md:text-2xl font-bold mb-3 break-keep">
                  PDF 2종 자동 생성
                </h3>
                <p className="text-slate-300 text-sm mb-4 break-keep">
                  같은 데이터, 다른 톤. 교사는 임상 용어로 깊이 있게,
                  부모는 쉬운 말로 안심하며 받아볼 수 있어요.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="border-white/30 text-white">교사용 임상 PDF</Badge>
                  <Badge variant="outline" className="border-white/30 text-white">부모용 가이드 PDF</Badge>
                  <Badge variant="outline" className="border-white/30 text-white">RCI 개선도 그래프</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/10">
                  <FileText className="w-6 h-6 text-amber-300 mb-2" />
                  <p className="text-xs font-bold mb-1">교사용</p>
                  <p className="text-[10px] text-slate-300 leading-relaxed">DSM-5 기반 임상 소견 + 교실 내 행동 관리 액션 5</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/10">
                  <Heart className="w-6 h-6 text-rose-300 mb-2" />
                  <p className="text-xs font-bold mb-1">부모용</p>
                  <p className="text-[10px] text-slate-300 leading-relaxed">우리 아이 강점 + 가정 실천 가이드 5 + 30/60일 체크리스트</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/b2b-kindergarten-console')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" /> 교사 콘솔 시작하기
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/b2b-demo-report')}
          >
            <FileText className="w-4 h-4 mr-2" /> 샘플 리포트 보기
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Users className="w-4 h-4 mr-2" /> 도입 상담 신청
          </Button>
        </div>
      </div>
    </section>
  );
};

export default B2BKindergartenSection;
