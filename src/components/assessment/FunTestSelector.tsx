import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Heart, Crown, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TOKEN_COSTS } from "@/constants/tokenCosts";

interface FunTest {
  id: string;
  title: string;
  description: string;
  targetAge: string;
  tokenCost: number;
  icon: React.ReactNode;
  gradient: string;
  popularity: "HOT" | "NEW" | "TREND";
}

const funTests: FunTest[] = [
  {
    id: "past-life-job",
    title: "내 전생은 어떤 직업?",
    description: "AI가 분석하는 나의 전생 직업과 운명! MZ세대가 가장 좋아하는 신비로운 테스트",
    targetAge: "MZ세대",
    tokenCost: TOKEN_COSTS.PAST_LIFE_JOB,
    icon: <Crown className="w-6 h-6" />,
    gradient: "from-purple-500 to-pink-500",
    popularity: "HOT"
  },
  {
    id: "animal-face-match",
    title: "내 얼굴 닮은 동물 찾기",
    description: "카메라로 얼굴을 찍으면 AI가 닮은 동물을 찾아줘! 친구들과 비교해보며 웃음폭탄",
    targetAge: "초등·청소년",
    tokenCost: TOKEN_COSTS.ANIMAL_FACE_MATCH,
    icon: <Camera className="w-6 h-6" />,
    gradient: "from-orange-500 to-yellow-500",
    popularity: "TREND"
  },
  {
    id: "inner-animal",
    title: "나의 내면 동물 찾기",
    description: "깊은 심리 분석으로 알아보는 나의 진짜 성격! 40대 이상이 가장 많이 하는 인기 테스트",
    targetAge: "40대+",
    tokenCost: TOKEN_COSTS.INNER_ANIMAL,
    icon: <Heart className="w-6 h-6" />,
    gradient: "from-green-500 to-blue-500",
    popularity: "NEW"
  }
];

export default function FunTestSelector() {
  const navigate = useNavigate();

  const handleStartTest = (testId: string) => {
    navigate(`/assessment?type=fun&test=${testId}`);
  };

  const getPopularityBadge = (popularity: string) => {
    switch (popularity) {
      case "HOT":
        return <Badge variant="destructive" className="animate-pulse">🔥 HOT</Badge>;
      case "NEW":
        return <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-green-600 text-white">✨ NEW</Badge>;
      case "TREND":
        return <Badge variant="outline" className="border-orange-500 text-orange-600">📈 TREND</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            재미있는 3분 테스트
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          친구들과 함께 즐기는 AI 심리 테스트! 연령별 맞춤 추천
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {funTests.map((test) => (
          <Card key={test.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-full bg-gradient-to-r ${test.gradient} text-white`}>
                  {test.icon}
                </div>
                {getPopularityBadge(test.popularity)}
              </div>
              
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {test.title}
              </CardTitle>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {test.targetAge}
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold">
                  <Zap className="w-3 h-3 mr-1" />
                  {test.tokenCost}토큰
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {test.description}
              </p>
              
              <Button 
                onClick={() => handleStartTest(test.id)}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                테스트 시작하기
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">🎉 더 많은 재미를 원한다면?</h3>
          <p className="text-muted-foreground mb-4">
            모든 테스트를 완료하고 친구들과 결과를 비교해보세요!
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/assessment')}
            className="border-primary/30 hover:bg-primary/10"
          >
            다른 심리검사 보러가기
          </Button>
        </div>
      </div>
    </div>
  );
}