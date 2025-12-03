import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, ArrowRight, Heart, Shield, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import bgImage from '@/assets/value-comparison-bg.jpg';
import { AnimatedBackground } from '@/components/3d/AnimatedBackground';
import { motion } from 'framer-motion';

const ValueComparisonSection = () => {
  const navigate = useNavigate();

  const problems = [
    {
      icon: Building2,
      title: "병원·센터 방문이 부담스럽다",
      description: "두려움과 낙인 때문에 전문기관 방문을 망설이게 돼요"
    },
    {
      icon: Shield,
      title: "예방적 관리가 필요하다",
      description: "심각해지기 전에 조기 발견하고 관리하는 것이 중요해요"
    },
    {
      icon: Heart,
      title: "발달·심리 케어가 복잡하다",
      description: "어디서부터 시작해야 할지, 누구에게 도움을 받아야 할지 막막해요"
    },
    {
      icon: Users,
      title: "전문가 연결이 어렵다",
      description: "내게 맞는 전문가를 찾기 어렵고 비용 부담도 커요"
    }
  ];

  const comparison = [
    {
      feature: "이용 방법",
      traditional: "예약 필요 (1~2주 대기)",
      aiHighlight: "지금 바로 시작 (0분)",
      highlighted: true
    },
    {
      feature: "소요 시간",
      traditional: "50분 + 이동 시간",
      aiHighlight: "3분 완료"
    },
    {
      feature: "비용",
      traditional: "회당 10~20만원",
      aiHighlight: "무료 체험 → 월 2.9만원",
      highlighted: true
    },
    {
      feature: "접근성",
      traditional: "오프라인 방문 필수",
      aiHighlight: "24시간 모바일 접속"
    },
    {
      feature: "전문성",
      traditional: "상담사 개인 역량 차이",
      aiHighlight: "AI + 검증된 전문가",
      highlighted: true
    },
    {
      feature: "연속성",
      traditional: "회당 단발성 상담",
      aiHighlight: "지속적 관리 & 모니터링"
    },
    {
      feature: "프라이버시",
      traditional: "대면 상담 (불편함)",
      aiHighlight: "완전 익명 (편안함)",
      highlighted: true
    }
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 z-0 opacity-20 md:opacity-30">
        <AnimatedBackground 
          particleColor="#10B981" 
          shapeColors={["#059669", "#10B981", "#34D399"]}
          particleCount={2000}
        />
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-background/85" />
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-[400px] h-[400px] bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-[100px] z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/25 to-cyan-500/25 rounded-full blur-[120px] z-0" 
      />
      
      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-md rounded-full mb-4 md:mb-6"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-semibold text-primary">왜 AIHumanPro인가요?</span>
          </motion.div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight px-4">
            왜 AiHumanPro를 선택해야 할까요?
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            이런 고민이 있으셨다면, 저희가 해결해 드릴게요
          </p>
        </motion.div>

        {/* Problems Grid - 4개 카드 */}
        <div className="mb-12 md:mb-16">
          {/* Mobile: 2x2 Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="p-4 md:p-6 bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-foreground mb-2">{problem.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Solution Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-base md:text-lg font-semibold text-foreground max-w-3xl mx-auto leading-relaxed">
            AIHumanPro는 <span className="text-primary">AI 기술과 전문가의 협업</span>으로 예방부터 회복까지 함께 돕습니다
          </p>
        </motion.div>

        {/* Comparison Table - Accordion for all devices */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {comparison.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className={`border rounded-lg overflow-hidden ${
                  item.highlighted ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-sm md:text-base font-bold text-foreground flex-1 text-left">
                      {item.feature}
                    </span>
                    {item.highlighted && <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 md:flex md:gap-4 md:space-y-0">
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg md:flex-1">
                      <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">전통적 상담</p>
                        <p className="text-sm text-foreground">{item.traditional}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg md:flex-1">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-primary font-medium mb-1">AiHumanPro</p>
                        <p className="text-sm font-semibold text-foreground">{item.aiHighlight}</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* CTA */}
          <div className="mt-6 p-6 md:p-8 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg text-center">
            <p className="text-sm md:text-lg font-semibold mb-4">
              지금 시작하면 <span className="text-primary">첫 테스트 무료</span> + 
              <span className="text-primary"> 10개 토큰 증정</span>
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/assessment')}
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 md:px-8 py-6 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                무료로 시작하기
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              신용카드 등록 불필요 · 언제든 해지 가능
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ValueComparisonSection;
