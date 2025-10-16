import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Zap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const newFeatures = [
  {
    id: 'defense_mechanism',
    title: '🛡️ 방어기제 분석',
    description: '무의식적 심리 패턴 발견! 24문항으로 8가지 방어기제 분석',
    date: '2025-10-16',
    badge: 'NEW',
    color: 'from-purple-500 to-pink-500',
    path: '/assessment/defense-mechanism-test'
  },
  {
    id: 'hexaco_personality',
    title: '🧠 6차원 성격진단',
    description: '48문항 심층 성격 분석! AI가 당신의 성격을 6차원으로 분석',
    date: '2025-10-16',
    badge: 'NEW',
    color: 'from-blue-500 to-cyan-500',
    path: '/premium-assessment'
  },
  {
    id: 'life_achievement',
    title: '🏆 인생 업적 달성률',
    description: '게임처럼 체크하는 나의 인생 목표 달성도! AI 이미지 생성 포함',
    date: '2025-10-14',
    badge: 'HOT',
    color: 'from-orange-500 to-red-500',
    path: '/fun-tests'
  }
];

export const NewFeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full mb-4 animate-pulse">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">매주 업데이트</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            이번 주 NEW 기능
          </h2>
          <p className="text-xl text-gray-600">
            매주 새로운 AI 기능이 업데이트됩니다 ✨
          </p>
        </div>

        {/* 신규 기능 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {newFeatures.map((feature, index) => (
            <Card 
              key={feature.id}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-purple-300 overflow-hidden"
              onClick={() => navigate(feature.path)}
            >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0 shadow-lg`}>
                    {feature.badge}
                  </Badge>
                  <span className="text-sm text-gray-500">{feature.date}</span>
                </div>
                <CardTitle className="text-2xl group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                  <span>지금 해보기</span>
                  <Zap className="w-4 h-4 group-hover:animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 통계 및 업데이트 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-800 mb-2">11+</div>
              <p className="text-purple-700">AI 기능 개발</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-pink-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-pink-800 mb-2">매주</div>
              <p className="text-pink-700">새로운 업데이트</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-800 mb-2">100%</div>
              <p className="text-orange-700">AI 기반 분석</p>
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