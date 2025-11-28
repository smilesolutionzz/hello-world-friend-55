import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Zap, Trophy, Brush, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import newFeaturesBg from '@/assets/new-features-bg.jpg';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedBackground } from '@/components/3d/AnimatedBackground';
import { motion } from 'framer-motion';

const newFeatures = [
  {
    id: 'drawing_test',
    title: '✏️ 그림 심리 검사',
    description: 'HTP, KFD 등 전문 그림 검사를 직접 그리고 AI 분석을 받으세요',
    date: '2025-11-29',
    badge: 'NEW',
    color: 'from-violet-500 to-purple-500',
    path: '/premium-assessment'
  },
  {
    id: 'visual_analysis',
    title: '📸 시각 자료 AI 분석',
    description: '사진이나 영상으로 빠르게 AI 심리 분석을 받아보세요',
    date: '2025-11-29',
    badge: 'NEW',
    color: 'from-cyan-500 to-blue-500',
    path: '/free-trial'
  },
  {
    id: 'ai_metaverse',
    title: '🎭 AI 메타버스 상담실',
    description: '실시간 음성 API로 가상공간에서 실제 상담사와 자연스러운 대화하듯 구현',
    date: '2025-11-08',
    badge: 'HOT',
    color: 'from-cyan-500 to-blue-500',
    path: '/metaverse-voice'
  },
  {
    id: 'attachment_deep',
    title: '💞 애착 유형 심층 분석',
    description: 'OpenAI 전문가 분석 + 차트! 4가지 애착 유형 30문항 심층 분석',
    date: '2025-10-17',
    badge: 'HOT',
    color: 'from-pink-500 to-purple-500',
    path: '/assessment/attachment-style-test'
  },
  {
    id: 'defense_mechanism',
    title: '🛡️ 방어기제 분석',
    description: '무의식적 심리 패턴 발견! 24문항으로 8가지 방어기제 분석',
    date: '2025-10-16',
    badge: 'HOT',
    color: 'from-purple-500 to-pink-500',
    path: '/assessment/defense-mechanism-test'
  }
];

export const NewFeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 z-0 opacity-25 md:opacity-35">
        <AnimatedBackground 
          particleColor="#EC4899" 
          shapeColors={["#F472B6", "#EC4899", "#DB2777"]}
          particleCount={2000}
        />
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${newFeaturesBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/90" />
      </div>

      {/* Animated Gradient Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-20 left-10 w-[400px] h-[400px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-[100px] z-0" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [360, 180, 0],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/25 to-pink-500/25 rounded-full blur-[120px] z-0" 
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* 헤더 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 md:px-6 py-2 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-bold text-sm md:text-base">매주 업데이트</span>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            이번 주 NEW 기능
          </h2>
          <p className="text-sm md:text-xl text-muted-foreground">
            매주 새로운 AI 기능이 업데이트됩니다 ✨
          </p>
        </motion.div>

        {/* 신규 기능 카드들 - Mobile: Accordion */}
        <div className="md:hidden mb-8">
          <Accordion type="single" collapsible className="space-y-3">
            {newFeatures.map((feature, index) => (
              <AccordionItem 
                key={feature.id}
                value={`feature-${index}`}
                className="border-2 rounded-lg overflow-hidden bg-white"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0 shadow-lg text-xs`}>
                        {feature.badge}
                      </Badge>
                      <span className="text-sm font-bold text-left">{feature.title}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className={`h-1 bg-gradient-to-r ${feature.color} mb-3`} />
                  <p className="text-sm text-foreground mb-3">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{feature.date}</span>
                    <Button
                      size="sm"
                      onClick={() => navigate(feature.path)}
                      className={`bg-gradient-to-r ${feature.color} text-white`}
                    >
                      <span className="flex items-center gap-1">
                        지금 해보기
                        <Zap className="w-3 h-3" />
                      </span>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* 신규 기능 카드들 - Desktop: Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {newFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              <Card 
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-purple-300 overflow-hidden bg-card/80 backdrop-blur-md h-full"
                onClick={() => navigate(feature.path)}
              >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0 shadow-lg`}>
                    {feature.badge}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{feature.date}</span>
                </div>
                <CardTitle className="text-2xl group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-3 transition-all">
                  <span>지금 해보기</span>
                  <Zap className="w-4 h-4 group-hover:animate-pulse" />
                </div>
              </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 통계 및 업데이트 정보 - Mobile: Accordion */}
        <div className="md:hidden mb-8">
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="stats-1" className="border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-800">AI 기능 개발</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-2">35+</div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">다양한 AI 심리 검사 및 분석 기능</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stats-2" className="border-2 border-pink-200 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  <span className="text-sm font-bold text-pink-800">새로운 업데이트</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-800 dark:text-pink-300 mb-2">매주</div>
                  <p className="text-sm text-pink-700 dark:text-pink-300">계속 추가되는 새로운 기능</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stats-3" className="border-2 border-orange-200 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-bold text-orange-800">AI 기반 분석</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-800 dark:text-orange-300 mb-2">100%</div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">최신 AI 기술로 정확한 분석</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* 통계 및 업데이트 정보 - Desktop: Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-2">35+</div>
              <p className="text-purple-700 dark:text-purple-300">AI 기능 개발</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-700">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-pink-600 dark:text-pink-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-pink-800 dark:text-pink-300 mb-2">매주</div>
              <p className="text-pink-700 dark:text-pink-300">새로운 업데이트</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-800 dark:text-orange-300 mb-2">100%</div>
              <p className="text-orange-700 dark:text-orange-300">AI 기반 분석</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA 버튼 */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/fun-tests')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            모든 기능 체험하기
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};