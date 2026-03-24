import { useState } from 'react';
import { Brain, FileText, Users, ArrowRight, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import bgImage from '@/assets/core-service-bg.jpg';

const CoreServiceSection = () => {
  const navigate = useNavigate();
  const [expandedService, setExpandedService] = useState<number | null>(null);
  
  
  const services = [
    {
      icon: Brain,
      title: "AI 자가체크",
      description: "3분 만에 정확한 상태 분석",
      details: "딥러닝 AI가 여러분의 응답을 실시간 분석하여 정확한 심리 상태를 파악합니다. 검증된 알고리즘으로 ADHD, 우울증, 스트레스 등 다양한 영역을 종합적으로 평가합니다.",
      path: "/assessment",
      gradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600"
    },
    {
      icon: FileText,
      title: "초개인화 AI 리포트",
      description: "데이터가 쌓일수록 정확해지는 분석",
      details: "일상 속 기록이 쌓이면 AI가 자동으로 종합 리포트를 생성합니다. 단순한 숫자가 아닌, 여러분만의 성장 스토리를 데이터로 보여드립니다. 전문가 검토를 거쳐 정확한 회복과 예방을 돕습니다.",
      path: "/report-generator",
      gradient: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600",
      highlight: true
    },
    {
      icon: Users,
      title: "전문가 연계",
      description: "AI 분석 + 전문가 검토",
      details: "AI가 발견한 패턴을 전문가가 검토하고, 여러분의 마음을 이해합니다. 1:1 맞춤형 상담으로 진정한 변화를 시작하세요.",
      path: "/expert-hiring",
      gradient: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600"
    }
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-background/85" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            주요 서비스
          </h2>
          <p className="text-xl text-foreground font-semibold max-w-2xl mx-auto">
            AI와 전문가가 함께하는 통합 케어
          </p>
        </div>

        <div className="space-y-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isExpanded = expandedService === index;
            return (
              <Card 
                key={index}
                className={`group relative p-8 bg-gradient-to-br ${service.gradient} border-2 ${service.highlight ? 'border-primary/30' : 'border-transparent'} rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}
              >
                {service.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      데이터 기반
                    </span>
                  </div>
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div 
                  className="relative z-10 cursor-pointer"
                  onClick={() => setExpandedService(isExpanded ? null : index)}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-8 h-8 ${service.iconColor}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-foreground">{service.title}</h3>
                        <ChevronDown 
                          className={`w-6 h-6 text-foreground/50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-card-foreground mb-4 leading-relaxed">{service.description}</p>
                      
                      {/* 확장 내용 */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-foreground/10 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-foreground/80 leading-relaxed mb-6">{service.details}</p>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(service.path);
                            }}
                            className="bg-primary hover:bg-primary/90"
                          >
                            시작하기
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
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
