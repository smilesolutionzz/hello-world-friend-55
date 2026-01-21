import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Lock, 
  Unlock, 
  Brain, 
  FileText, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  TrendingUp,
  Shield,
  Gift,
  Infinity
} from 'lucide-react';
import { motion } from 'framer-motion';

const SubscriptionValueSection = () => {
  const navigate = useNavigate();

  const freeFeatures = [
    { name: '기본 심리검사', available: true },
    { name: '간단 결과 요약', available: true },
    { name: 'AI 심층 분석', available: false },
    { name: '전문가 맞춤 추천', available: false },
    { name: 'PDF 리포트 다운로드', available: false },
    { name: '무제한 검사', available: false },
  ];

  const premiumFeatures = [
    { name: '기본 심리검사', available: true },
    { name: '간단 결과 요약', available: true },
    { name: 'AI 심층 분석', available: true, highlight: true },
    { name: '전문가 맞춤 추천', available: true, highlight: true },
    { name: 'PDF 리포트 다운로드', available: true, highlight: true },
    { name: '무제한 검사', available: true, highlight: true },
  ];

  const valueProps = [
    {
      icon: Brain,
      title: '전문가급 AI 분석',
      description: '박사급 전문가의 분석 수준을 AI로 제공',
      savings: '병원 상담 대비 90% 절약'
    },
    {
      icon: FileText,
      title: '9개 섹션 심층 리포트',
      description: '종합 진단, 개입 전략, 발달 로드맵 포함',
      savings: '전문기관 리포트 대비 80% 절약'
    },
    {
      icon: Users,
      title: '전문가 매칭 우선권',
      description: '검증된 전문가와 빠른 상담 연결',
      savings: '대기 시간 50% 단축'
    },
    {
      icon: Infinity,
      title: '무제한 검사 이용',
      description: '모든 심리검사 무제한 이용',
      savings: '건당 결제 대비 70% 절약'
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            프리미엄 멤버십
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            왜 <span className="text-primary">프리미엄</span>이 필요할까요?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            검사만으로는 변화가 없습니다. <br className="md:hidden" />
            <strong className="text-foreground">전문가급 분석과 맞춤 솔루션</strong>이 진정한 변화를 만듭니다.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 border-2 border-border bg-card h-full shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-muted rounded-full">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">무료 이용</h3>
                  <p className="text-sm text-muted-foreground">기본 기능만 제공</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.available ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                    <span className={feature.available ? 'text-foreground font-medium' : 'text-muted-foreground line-through'}>
                      {feature.name}
                    </span>
                    {!feature.available && (
                      <Badge variant="outline" className="ml-auto text-xs border-destructive/50 text-destructive">
                        잠금
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center mb-4">
                <p className="text-sm text-foreground font-medium">
                  ⚠️ 검사는 할 수 있지만...<br />
                  <span className="text-destructive font-bold">정작 중요한 AI 분석은 볼 수 없어요</span>
                </p>
              </div>

              <Button 
                onClick={() => navigate('/token-purchase?type=subscription&id=premium_pass')}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-5"
                size="lg"
              >
                <Unlock className="w-5 h-5 mr-2" />
                지금 프리미엄으로 업그레이드
              </Button>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 border-2 border-primary bg-gradient-to-br from-primary/10 to-amber-500/10 h-full relative overflow-hidden">
              {/* Popular badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  인기
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">프리미엄 패스</h3>
                  <p className="text-sm text-muted-foreground">모든 기능 무제한</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? 'text-amber-500' : 'text-green-500'}`} />
                    <span className={feature.highlight ? 'font-medium text-foreground' : 'text-foreground'}>
                      {feature.name}
                      {feature.highlight && (
                        <Badge variant="outline" className="ml-2 text-xs border-amber-500/50 text-amber-600">NEW</Badge>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground line-through">월 99,000원</p>
                    <p className="text-2xl font-bold text-primary">월 29,900원</p>
                  </div>
                  <Badge className="bg-red-500 text-white">70% 할인</Badge>
                </div>

                <Button 
                  onClick={() => navigate('/token-purchase?type=subscription&id=premium_pass')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6"
                  size="lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  프리미엄 시작하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Value Props */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            프리미엄이 제공하는 <span className="text-primary">특별한 가치</span>
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 h-full hover:shadow-lg transition-shadow border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <prop.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-bold">{prop.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{prop.description}</p>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {prop.savings}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span>안전한 결제</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <span>7일 무료 체험</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>언제든 해지 가능</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionValueSection;