import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, Brain, Heart, Crown, Star, Zap, MessageCircle } from 'lucide-react';
import PastLifeJobTest from '@/components/assessment/PastLifeJobTest';
import AnimalFaceTest from '@/components/assessment/AnimalFaceTest';
import InnerAnimalTest from '@/components/assessment/InnerAnimalTest';
import GrandmaRelationshipTest from '@/components/assessment/GrandmaRelationshipTest';
import { AIFeatureCard } from '@/components/AIFeatureCard';

const FunTests = () => {
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState<'menu' | 'past_life_job' | 'animal_face_match' | 'inner_animal' | 'grandma_relationship'>('menu');

  const handleTestComplete = (result: any, testType: string) => {
    navigate('/fun-test-result', { 
      state: { result, testType } 
    });
  };

  const handleBack = () => {
    setCurrentTest('menu');
  };

  if (currentTest === 'past_life_job') {
    return <PastLifeJobTest onComplete={handleTestComplete} onBack={handleBack} />;
  }

  if (currentTest === 'animal_face_match') {
    return <AnimalFaceTest onComplete={handleTestComplete} onBack={handleBack} />;
  }

  if (currentTest === 'inner_animal') {
    return <InnerAnimalTest onComplete={handleTestComplete} onBack={handleBack} />;
  }

  if (currentTest === 'grandma_relationship') {
    return <GrandmaRelationshipTest onComplete={handleTestComplete} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-violet-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              재미있는 AI 테스트
            </h1>
            <Sparkles className="w-12 h-12 text-pink-600" />
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            AI가 분석하는 신기하고 재미있는 나의 모습들
          </p>
          <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-6 py-2 text-lg">
            ✨ 친구들과 함께 즐겨보세요!
          </Badge>
        </div>

        {/* 테스트 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <AIFeatureCard
            title="내 전생은 어떤 직업?"
            description="답변을 토대로 AI가 분석하는 나의 전생 직업과 그 시대의 이야기. 현재와의 연결점도 발견해보세요!"
            icon={Crown}
            aiLevel="premium"
            onClick={() => setCurrentTest('past_life_job')}
            className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          />

          <AIFeatureCard
            title="내 얼굴 닮은 동물 찾기"
            description="얼굴 사진을 업로드하면 AI가 분석해서 가장 닮은 동물을 찾아드립니다. 재미있는 특징 분석도 함께!"
            icon={Camera}
            aiLevel="advanced"
            onClick={() => setCurrentTest('animal_face_match')}
            className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          />

          <AIFeatureCard
            title="나의 내면 동물 찾기"
            description="심리 질문을 통해 당신의 내면에 숨어있는 동물의 정체를 밝혀냅니다. 깊이있는 성격 분석까지!"
            icon={Brain}
            aiLevel="premium"
            onClick={() => setCurrentTest('inner_animal')}
            className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          />

          <AIFeatureCard
            title="욕쟁이 할머니의 연애 진단"
            description="할머니가 직설적으로 당신들의 연애를 진단해드립니다. 솔직한 조언을 들을 각오 되셨나요?"
            icon={MessageCircle}
            aiLevel="premium"
            onClick={() => setCurrentTest('grandma_relationship')}
            className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          />
        </div>

        {/* 특징 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-violet-100 to-violet-50 border-violet-200">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-violet-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-violet-800 mb-2">AI 이미지 생성</h3>
              <p className="text-violet-700">
                결과에 맞는 맞춤형 이미지를 허깅페이스 AI로 생성합니다
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-100 to-pink-50 border-pink-200">
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-pink-800 mb-2">재미있는 해석</h3>
              <p className="text-pink-700">
                단순한 결과가 아닌 스토리텔링이 있는 풍부한 해석을 제공합니다
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-orange-800 mb-2">공유하기 쉬워요</h3>
              <p className="text-orange-700">
                친구들과 쉽게 공유할 수 있는 텍스트와 이미지 형태로 결과를 제공합니다
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 공지사항 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-blue-800">재미있는 테스트 안내</h3>
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-3 text-blue-700">
              <p className="text-lg">
                🎯 <strong>토큰 시스템:</strong> 각 테스트마다 토큰이 소모됩니다 (1-2토큰)
              </p>
              <p className="text-lg">
                🎨 <strong>AI 이미지:</strong> 결과에 맞는 맞춤형 이미지를 자동 생성합니다
              </p>
              <p className="text-lg">
                📱 <strong>공유 기능:</strong> 재미있는 결과를 친구들과 쉽게 공유하세요
              </p>
              <p className="text-sm text-blue-600 mt-4">
                ※ 이 테스트들은 재미와 엔터테인먼트를 위한 것으로, 실제 심리 진단이나 예언과는 관련이 없습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunTests;