import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, PlusCircle, TrendingUp, Users, Heart } from 'lucide-react';
import GrowthStoryShare from '@/components/growth/GrowthStoryShare';
import GrowthStoryFeed from '@/components/growth/GrowthStoryFeed';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

const GrowthStories = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('feed');

  const handleStoryShared = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('feed');
  };

  const stats = [
    {
      icon: Heart,
      label: '공유된 성장 스토리',
      value: '128+',
      color: 'text-red-500'
    },
    {
      icon: Users,
      label: '도움받은 사람들',
      value: '1,200+',
      color: 'text-blue-500'
    },
    {
      icon: TrendingUp,
      label: '평균 만족도',
      value: '4.8/5',
      color: 'text-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-modern">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              성장 스토리
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            변화와 성장의 여정을 공유하고, 서로에게 희망과 용기를 전해주는 따뜻한 공간입니다
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/50">
                <TabsTrigger value="feed" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  스토리 보기
                </TabsTrigger>
                <TabsTrigger value="share" className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  스토리 공유하기
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="feed" className="mt-0">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">다른 분들의 성장 스토리</h2>
                    <p className="text-gray-600">
                      실제 경험담을 통해 희망과 용기를 얻어보세요
                    </p>
                  </div>
                  <GrowthStoryFeed refreshTrigger={refreshTrigger} />
                </div>
              </TabsContent>

              <TabsContent value="share" className="mt-0">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">나의 성장 스토리 공유하기</h2>
                    <p className="text-gray-600">
                      당신의 변화 경험이 누군가에게는 큰 힘이 됩니다
                    </p>
                  </div>
                  <GrowthStoryShare onStoryShared={handleStoryShared} />
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* 안내 섹션 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                안전한 공유 환경
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 익명 공유로 프라이버시 보호</li>
                <li>• 건전한 내용만 공유되도록 관리</li>
                <li>• 전문가 검토를 통한 신뢰성 확보</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                함께 성장하기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 서로의 경험에서 배우고 성장</li>
                <li>• 긍정적 변화에 대한 동기부여</li>
                <li>• 혼자가 아니라는 연대감 형성</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GrowthStories;