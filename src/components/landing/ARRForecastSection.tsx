import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Crown, 
  Wallet, 
  Target, 
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const ARRForecastSection = () => {
  const navigate = useNavigate();

  // 실제 데이터 기반 (2026년 1월 기준)
  const realData = {
    totalUsers: 164,
    monthlySignups: 27, // 6개월 평균
    assessmentsPerMonth: 65, // 평균
    currentMRR: 0, // 현재 매출
  };

  // 전환율 시나리오 (업계 평균 기반)
  const scenarios = {
    conservative: {
      name: '보수적',
      signupToTest: 0.40, // 40% 검사 완료
      testToPaid: 0.03, // 3% 유료 전환
      avgRevenue: 29900, // 구독 월 평균
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    moderate: {
      name: '중립적',
      signupToTest: 0.50,
      testToPaid: 0.05,
      avgRevenue: 35000,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    optimistic: {
      name: '낙관적',
      signupToTest: 0.60,
      testToPaid: 0.08,
      avgRevenue: 40000,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  };

  // 12개월 후 예측 계산
  const calculateForecast = (scenario: typeof scenarios.conservative) => {
    const monthlyGrowthRate = 1.15; // 15% 월 성장 가정
    let totalPaidUsers = 0;
    let monthlySignups = realData.monthlySignups;

    for (let month = 1; month <= 12; month++) {
      const newTesters = monthlySignups * scenario.signupToTest;
      const newPaidUsers = newTesters * scenario.testToPaid;
      totalPaidUsers += newPaidUsers;
      monthlySignups *= monthlyGrowthRate;
    }

    const monthlyRevenue = totalPaidUsers * scenario.avgRevenue;
    const arr = monthlyRevenue * 12;

    return {
      paidUsers: Math.round(totalPaidUsers),
      mrr: Math.round(monthlyRevenue),
      arr: Math.round(arr),
    };
  };

  const forecasts = {
    conservative: calculateForecast(scenarios.conservative),
    moderate: calculateForecast(scenarios.moderate),
    optimistic: calculateForecast(scenarios.optimistic),
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-primary to-purple-600 text-white border-0">
            <BarChart3 className="w-3 h-3 mr-1" />
            실시간 트래픽 기반 예측
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            우리 서비스의 <span className="text-primary">성장 가능성</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            실제 {realData.totalUsers}명의 사용자 데이터를 기반으로 한 ARR 예측
          </p>
        </motion.div>

        {/* Current Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <Card className="p-4 text-center border-primary/20">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{realData.totalUsers}</p>
            <p className="text-sm text-muted-foreground">총 사용자</p>
          </Card>
          <Card className="p-4 text-center border-primary/20">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{realData.monthlySignups}</p>
            <p className="text-sm text-muted-foreground">월 평균 가입</p>
          </Card>
          <Card className="p-4 text-center border-primary/20">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{realData.assessmentsPerMonth}</p>
            <p className="text-sm text-muted-foreground">월 검사 완료</p>
          </Card>
          <Card className="p-4 text-center border-primary/20">
            <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">39.6%</p>
            <p className="text-sm text-muted-foreground">검사 전환율</p>
          </Card>
        </motion.div>

        {/* ARR Forecast Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-center mb-6">
            12개월 후 <span className="text-primary">ARR 예측</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(forecasts).map(([key, forecast], index) => {
              const scenario = scenarios[key as keyof typeof scenarios];
              const isModerate = key === 'moderate';
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-6 h-full ${isModerate ? 'border-2 border-primary shadow-lg' : 'border-border'}`}>
                    {isModerate && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                        <Sparkles className="w-3 h-3 mr-1" />
                        가장 현실적
                      </Badge>
                    )}
                    
                    <div className="text-center mb-4">
                      <Badge variant="outline" className={`${scenario.bgColor} ${scenario.color} border-0`}>
                        {scenario.name} 시나리오
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">예상 유료 사용자</p>
                        <p className={`text-2xl font-bold ${scenario.color}`}>
                          {forecast.paidUsers}명
                        </p>
                      </div>

                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">예상 MRR</p>
                        <p className={`text-xl font-bold ${scenario.color}`}>
                          {formatCurrency(forecast.mrr)}
                        </p>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">예상 ARR</p>
                        <p className={`text-3xl font-bold ${scenario.color}`}>
                          {formatCurrency(forecast.arr)}
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                        <p>• 유료 전환율: {(scenario.testToPaid * 100).toFixed(0)}%</p>
                        <p>• 월 성장률: 15%</p>
                        <p>• 평균 객단가: {formatCurrency(scenario.avgRevenue)}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30">
            <h3 className="text-2xl font-bold mb-4">
              지금 가입하면 <span className="text-primary">70% 할인</span> 혜택!
            </h3>
            <p className="text-muted-foreground mb-6">
              얼리어답터 특별 혜택 • 정가 99,000원 → <span className="font-bold text-primary">월 29,900원</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/token-purchase?type=subscription&id=premium_pass')}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
              >
                <Crown className="w-5 h-5 mr-2" />
                프리미엄 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={() => navigate('/token-purchase?type=cash&id=cash_5000&price=5000')}
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Wallet className="w-5 h-5 mr-2" />
                캐시 충전하기
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ARRForecastSection;
