import { AlertCircle, DollarSign, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ProblemVisionSection = () => {
  const problems = [
    {
      icon: AlertCircle,
      title: "상담 접근이 어렵다",
      description: "전문 상담사를 찾기 어렵고 예약도 오래 걸려요"
    },
    {
      icon: DollarSign,
      title: "비용 부담이 크다",
      description: "전문 상담 비용이 부담스러워 망설여져요"
    },
    {
      icon: Target,
      title: "정확한 진단이 어렵다",
      description: "내 상태를 정확히 파악하기가 쉽지 않아요"
    }
  ];

  return (
    <section className="py-32 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary mb-4 tracking-wide uppercase">Why AI Highlight Pro?</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            왜 AI하이라이트PRO가 필요한가요?
          </h2>
        </div>

        {/* 3단 카드 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <Card 
                key={index}
                className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Solution Statement */}
        <div className="text-center">
          <p className="text-2xl font-semibold text-foreground max-w-3xl mx-auto leading-relaxed">
            AI하이라이트PRO는 이 문제를<br className="sm:hidden" /> 
            <span className="text-primary"> 기술과 사람의 협업</span>으로 해결합니다
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemVisionSection;
