import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Users, Building2, Sparkles, ArrowRight, Check, Calendar
} from 'lucide-react';
import { MIND_TRACK_PRICE, MIND_TRACK_ORIGINAL_PRICE, MIND_TRACK_DISCOUNT_PERCENT } from '@/constants/tokenCosts';
import { motion } from 'framer-motion';

const BusinessModelSection: React.FC = () => {
  const navigate = useNavigate();

  const trackBenefits = [
    '30일 맞춤 마음 변화 로드맵',
    'AI 심층 분석 리포트 무제한',
    '전문가 코칭 가이드 동봉',
    '주간 진척도 트래킹 & 리마인더',
    '종료 시 변화 종합 리포트(PDF)',
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <Calendar className="w-3 h-3 mr-1" />30일 단일 상품
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">하나의 가격, 30일의 변화</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            복잡한 플랜 없이, AI 분석부터 전문가 코칭까지 30일 동안 모두 이용하세요
          </p>
        </motion.div>

        {/* 30일 트랙 단일 카드 */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="max-w-lg mx-auto mb-16">
          <Card className="ring-2 ring-primary shadow-xl">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
              <Badge className="mb-3 bg-rose-50 text-rose-600 border-rose-100">
                {MIND_TRACK_DISCOUNT_PERCENT}% OFF · 일시불
              </Badge>
              <h3 className="text-2xl font-bold mb-2">30일 마음 변화 트랙</h3>
              <div className="mb-4">
                <span className="text-lg text-muted-foreground line-through">₩{MIND_TRACK_ORIGINAL_PRICE.toLocaleString()}</span>
                <div className="text-4xl font-black text-primary">
                  ₩{MIND_TRACK_PRICE.toLocaleString()}
                  <span className="text-base font-normal text-muted-foreground"> · 일시불</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">하루 약 ₩{Math.round(MIND_TRACK_PRICE / 30).toLocaleString()} · 자동 결제 없음</p>
              </div>
              <ul className="space-y-2 mb-6 text-left">
                {trackBenefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate('/mind-track')} size="lg" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                30일 트랙 시작하기 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* B2B */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div>
                <Badge className="mb-4 bg-white/10 text-white border-white/20"><Building2 className="w-3 h-3 mr-1" />B2B 기관용</Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">기관 맞춤 솔루션</h3>
                <ul className="space-y-2 mb-6">
                  {b2bBenefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />{b}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate('/b2b')} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  기관 도입 상담 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Brain, label: 'AI 발달 분석' },
                    { icon: Users, label: '학부모 연결' },
                    { icon: Sparkles, label: '맞춤 로드맵' },
                    { icon: Building2, label: '기관 리포트' },
                  ].map((item, i) => (
                    <Card key={i} className="bg-white/10 border-white/20 p-4 text-center">
                      <item.icon className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                      <p className="text-sm font-medium">{item.label}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default BusinessModelSection;
