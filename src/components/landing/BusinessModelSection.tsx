import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Coins, 
  Brain, 
  Users, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Zap,
  Crown,
  Gift
} from 'lucide-react';
import { TOKEN_PACKAGES, TOKEN_COSTS } from '@/constants/tokenCosts';
import { motion } from 'framer-motion';

const BusinessModelSection: React.FC = () => {
  const navigate = useNavigate();

  const cashPackages = [
    { ...TOKEN_PACKAGES.STARTER, icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { ...TOKEN_PACKAGES.PRO, icon: Crown, color: 'from-purple-500 to-pink-500', isPopular: true },
    { ...TOKEN_PACKAGES.PREMIUM, icon: Sparkles, color: 'from-amber-500 to-orange-500' },
  ];

  const serviceHighlights = [
    { name: '무료 서비스', items: ['꿈해석', '사주분석', 'IEP 생성'], cost: '0캐시' },
    { name: '간편테스트', items: ['심리검사', 'ADHD체크', '발달검사'], cost: '5캐시' },
    { name: '심층분석', items: ['프리미엄 리포트', '전문가급 분석'], cost: '30캐시' },
    { name: '엔터테인먼트', items: ['전생직업', '닮은동물', '내면동물'], cost: '1캐시' },
  ];

  const b2bBenefits = [
    '학생/원생 통합 관리 대시보드',
    '실시간 위험도 모니터링',
    'AI 기반 발달 로드맵 자동 생성',
    '학부모 연결 및 상담 추적',
    '맞춤형 기관 리포트 생성',
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Coins className="w-3 h-3 mr-1" />
            합리적인 캐시 시스템
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            필요한 만큼만, 부담 없이 시작하세요
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            캐시 한 번 충전하면 영구 보관! 원하는 서비스만 골라 사용하세요
          </p>
        </motion.div>

        {/* Service Usage Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {serviceHighlights.map((service, i) => (
            <Card key={i} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-primary mb-1">{service.cost}</p>
                <p className="font-semibold text-sm mb-2">{service.name}</p>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {service.items.map((item, j) => (
                    <p key={j}>{item}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Cash Packages */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {cashPackages.map((pkg, i) => {
            const isPopular = i === 1; // PRO package
            return (
              <Card 
                key={i}
                className={`relative hover:shadow-xl transition-all ${isPopular ? 'ring-2 ring-primary scale-[1.02]' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Gift className="w-3 h-3 mr-1" />
                      가장 인기
                    </Badge>
                  </div>
                )}
              <CardHeader className="text-center pb-2">
                <div className={`w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r ${pkg.color} flex items-center justify-center`}>
                  <pkg.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{pkg.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-primary font-medium">{pkg.tokens}캐시</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-center text-muted-foreground">{pkg.value_highlight}</p>
                <ul className="space-y-1.5">
                  {pkg.best_for.slice(0, 3).map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            );
          })}
        </motion.div>

        {/* B2B Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div>
                <Badge className="mb-4 bg-white/10 text-white border-white/20">
                  <Building2 className="w-3 h-3 mr-1" />
                  B2B 기관용
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  어린이집 · 유치원 · 학원 · 발달센터<br />
                  <span className="text-amber-400">기관 맞춤 솔루션</span>
                </h3>
                <p className="text-white/70 mb-6">
                  AI 기반 학생 관리, 위험도 모니터링, 학부모 연결까지<br />
                  기관 운영에 필요한 모든 기능을 제공합니다.
                </p>
                <ul className="space-y-2 mb-6">
                  {b2bBenefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => navigate('/b2b')}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    기관 도입 상담
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/institution-admin')}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    데모 체험하기
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/10 border-white/20 p-4 text-center">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                    <p className="text-sm font-medium">AI 발달 분석</p>
                  </Card>
                  <Card className="bg-white/10 border-white/20 p-4 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                    <p className="text-sm font-medium">학부모 연결</p>
                  </Card>
                  <Card className="bg-white/10 border-white/20 p-4 text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                    <p className="text-sm font-medium">맞춤 로드맵</p>
                  </Card>
                  <Card className="bg-white/10 border-white/20 p-4 text-center">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                    <p className="text-sm font-medium">기관 리포트</p>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button 
            size="lg"
            onClick={() => navigate('/payment')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg"
          >
            <Coins className="w-5 h-5 mr-2" />
            캐시 충전하러 가기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            💡 무료 서비스도 많아요! 먼저 체험해보세요
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BusinessModelSection;
