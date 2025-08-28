import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, Quote, Star, Lightbulb, Heart } from "lucide-react";

interface LoadingEntertainmentProps {
  currentStep: string;
  progress: number;
}

const LoadingEntertainment = ({ currentStep, progress }: LoadingEntertainmentProps) => {
  const [currentContent, setCurrentContent] = useState(0);
  const [contentType, setContentType] = useState<'quotes' | 'tips' | 'videos'>('quotes');
  const [isPlaying, setIsPlaying] = useState(true);

  // 감동적인 명언들
  const inspirationalQuotes = [
    {
      text: "변화는 고통스럽지만, 변화하지 않는 것은 더 고통스럽다.",
      author: "버나드 쇼"
    },
    {
      text: "자신을 이해하는 것이 치유의 첫걸음이다.",
      author: "칼 융"
    },
    {
      text: "마음의 상처도 시간이 지나면 아물지만, 그 경험은 우리를 더 강하게 만든다.",
      author: "프리드리히 니체"
    },
    {
      text: "어제의 나보다 오늘의 내가 더 나은 사람이 되는 것, 그것이 진정한 성장이다.",
      author: "랄프 왈도 에머슨"
    },
    {
      text: "모든 문제에는 해답이 있다. 때로는 시간이 필요할 뿐이다.",
      author: "알버트 아인슈타인"
    }
  ];

  // 심리 건강 팁들
  const mentalHealthTips = [
    {
      title: "5-4-3-2-1 기법",
      description: "불안할 때: 5가지 보이는 것, 4가지 만질 수 있는 것, 3가지 들리는 것, 2가지 냄새, 1가지 맛을 찾아보세요.",
      icon: "🧘‍♀️"
    },
    {
      title: "감사 일기",
      description: "매일 밤 3가지 감사한 일을 적어보세요. 작은 것부터 시작해도 좋습니다.",
      icon: "📝"
    },
    {
      title: "심호흡 연습",
      description: "4초 들이마시고, 7초 참고, 8초에 걸쳐 내쉬는 478 호흡법을 시도해보세요.",
      icon: "💨"
    },
    {
      title: "디지털 디톡스",
      description: "하루 1시간씩 스마트폰을 멀리하고 자연이나 책과 함께 시간을 보내보세요.",
      icon: "📱"
    },
    {
      title: "긍정적 자기대화",
      description: "'나는 할 수 없어' 대신 '나는 아직 배우고 있어'라고 말해보세요.",
      icon: "💭"
    }
  ];

  // 유용한 동영상 리스트 (실제 유튜브 ID들)
  const helpfulVideos = [
    {
      title: "3분 명상으로 마음챙김",
      videoId: "inpok4MKVLM",
      description: "간단한 호흡 명상으로 마음을 차분하게 만들어보세요"
    },
    {
      title: "스트레스 해소 스트레칭",
      videoId: "g_tea8ZNk5A", 
      description: "집에서 쉽게 할 수 있는 목과 어깨 스트레칭"
    },
    {
      title: "긍정적 사고 훈련",
      videoId: "LO1mTELoj6o",
      description: "부정적 생각을 긍정적으로 바꾸는 방법"
    }
  ];

  // 자동 콘텐츠 로테이션
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (contentType === 'quotes') {
        setCurrentContent((prev) => (prev + 1) % inspirationalQuotes.length);
      } else if (contentType === 'tips') {
        setCurrentContent((prev) => (prev + 1) % mentalHealthTips.length);
      } else {
        setCurrentContent((prev) => (prev + 1) % helpfulVideos.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [contentType, isPlaying, inspirationalQuotes.length, mentalHealthTips.length, helpfulVideos.length]);

  const nextContent = () => {
    if (contentType === 'quotes') {
      setCurrentContent((prev) => (prev + 1) % inspirationalQuotes.length);
    } else if (contentType === 'tips') {
      setCurrentContent((prev) => (prev + 1) % mentalHealthTips.length);
    } else {
      setCurrentContent((prev) => (prev + 1) % helpfulVideos.length);
    }
  };

  const renderQuote = () => {
    const quote = inspirationalQuotes[currentContent];
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-8 text-center">
          <Quote className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <blockquote className="text-lg font-medium text-gray-800 mb-4 leading-relaxed">
            "{quote.text}"
          </blockquote>
          <cite className="text-purple-600 font-semibold">- {quote.author}</cite>
        </CardContent>
      </Card>
    );
  };

  const renderTip = () => {
    const tip = mentalHealthTips[currentContent];
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{tip.icon}</span>
            <h3 className="text-xl font-bold text-green-800">{tip.title}</h3>
          </div>
          <p className="text-green-700 leading-relaxed">{tip.description}</p>
          <Badge className="mt-4 bg-green-500 text-white">💡 건강한 마음 팁</Badge>
        </CardContent>
      </Card>
    );
  };

  const renderVideo = () => {
    const video = helpfulVideos[currentContent];
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">유튜브 영상 로딩중...</p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-orange-800 mb-2">{video.title}</h3>
          <p className="text-orange-700 text-sm">{video.description}</p>
          <Badge className="mt-3 bg-orange-500 text-white">🎥 추천 영상</Badge>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 콘텐츠 타입 선택 */}
      <div className="flex justify-center gap-2">
        <Button
          variant={contentType === 'quotes' ? 'default' : 'outline'}
          onClick={() => {setContentType('quotes'); setCurrentContent(0);}}
          size="sm"
          className="gap-2"
        >
          <Quote className="w-4 h-4" />
          명언
        </Button>
        <Button
          variant={contentType === 'tips' ? 'default' : 'outline'}
          onClick={() => {setContentType('tips'); setCurrentContent(0);}}
          size="sm"
          className="gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          팁
        </Button>
        <Button
          variant={contentType === 'videos' ? 'default' : 'outline'}
          onClick={() => {setContentType('videos'); setCurrentContent(0);}}
          size="sm"
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          영상
        </Button>
      </div>

      {/* 콘텐츠 표시 */}
      <div className="relative">
        {contentType === 'quotes' && renderQuote()}
        {contentType === 'tips' && renderTip()}
        {contentType === 'videos' && renderVideo()}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="gap-2"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? '일시정지' : '재생'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={nextContent}
          className="gap-2"
        >
          <SkipForward className="w-4 h-4" />
          다음
        </Button>
      </div>

      {/* 진행상황 표시 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4 text-red-400" />
          <span>분석이 완료될 때까지 힐링 콘텐츠를 즐겨보세요</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingEntertainment;