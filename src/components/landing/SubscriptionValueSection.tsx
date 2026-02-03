import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Lock, 
  Brain, 
  FileText, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  TrendingUp,
  Shield,
  Infinity,
  Calendar
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
    <section className="py-20 px-4 bg-gradient-to-b from-slate-100/80 via-violet-50/50 to-slate-100/80 dark:from-slate-900 dark:via-violet-950/30 dark:to-slate-900">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-4 py-1">
            <Crown className="w-3 h-3 mr-1" />
            프리미엄 멤버십
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            왜 <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">프리미엄</span>이 필요할까요?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            검사만으로는 변화가 없습니다. <br className="md:hidden" />
            <strong className="text-foreground">전문가급 분석과 맞춤 솔루션</strong>이 진정한 변화를 만듭니다.
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 h-full shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                  <Lock className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">무료 이용</h3>
                  <p className="text-sm text-muted-foreground">기본 기능만 제공</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {feature.available ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      )}
                      <span className={feature.available ? 'text-foreground' : 'text-muted-foreground line-through'}>
                        {feature.name}
                      </span>
                    </div>
                    {!feature.available && (
                      <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
                        잠금
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-center mb-4">
                <p className="text-sm">
                  <span className="text-amber-600">⚠️</span> 검사는 할 수 있지만...<br />
                  <span className="text-amber-600 font-bold">정작 중요한 AI 분석은 볼 수 없어요</span>
                </p>
              </div>

              <Button 
                onClick={() => navigate('/token-subscription')}
                variant="outline"
                className="w-full border-slate-300 dark:border-slate-600 font-medium py-5"
                size="lg"
              >
                <Lock className="w-4 h-4 mr-2" />
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
            <Card className="p-6 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/50 dark:via-slate-800 dark:to-purple-950/50 border-2 border-violet-300 dark:border-violet-700 h-full relative overflow-hidden shadow-xl shadow-violet-500/10">
              {/* Popular badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg">
                  <Zap className="w-3 h-3 mr-1" />
                  인기
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
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
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? 'text-violet-500' : 'text-emerald-500'}`} />
                    <span className="text-foreground">
                      {feature.name}
                    </span>
                    {feature.highlight && (
                      <Badge className="ml-auto text-xs bg-emerald-500 text-white border-0">NEW</Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-violet-200 dark:border-violet-800">
                  <div>
                    <p className="text-sm text-muted-foreground line-through">월 49,900원</p>
                    <p className="text-2xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      월 29,900원
                    </p>
                  </div>
                  <Badge className="bg-rose-500 text-white border-0 font-bold">40% 할인</Badge>
                </div>

                <Button 
                  onClick={() => navigate('/token-subscription')}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-6 shadow-lg shadow-violet-500/30"
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
            프리미엄이 제공하는 <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">특별한 가치</span>
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {valueProps.map((prop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur hover:shadow-lg transition-all border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                      <prop.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h4 className="font-bold text-sm">{prop.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{prop.description}</p>
                  <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
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
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>안전한 결제</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />
            <span>7일 환불 보장</span>
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
