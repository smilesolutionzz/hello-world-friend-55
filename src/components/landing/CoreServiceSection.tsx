import { Brain, FileText, Users, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CoreServiceSection = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      icon: Brain,
      title: "AI 자가진단",
      description: "3분 만에 정확한 상태 분석",
      path: "/pmf-onboarding",
      gradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600"
    },
    {
      icon: FileText,
      title: "AI 리포트",
      description: "개인화된 분석 결과 제공",
      path: "/dashboard",
      gradient: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600"
    },
    {
      icon: Users,
      title: "전문가 연계",
      description: "맞춤형 상담사 매칭",
      path: "/expert-hiring",
      gradient: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600"
    }
  ];

  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            주요 서비스
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI와 전문가가 함께하는 통합 케어
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className={`group relative p-8 bg-gradient-to-br ${service.gradient} border-0 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden`}
                onClick={() => navigate(service.path)}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-8 h-8 ${service.iconColor}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3">{service.title}</h3>
                  <p className="text-card-foreground mb-6 leading-relaxed">{service.description}</p>
                  
                  <Button 
                    variant="ghost" 
                    className="group-hover:translate-x-2 transition-transform duration-300 p-0 h-auto text-primary font-semibold"
                  >
                    자세히 보기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoreServiceSection;
