import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Share2, Download, RefreshCw, Star } from 'lucide-react';

interface CoupleCompatibilityResultProps {
  results: {
    compatibilityType: string;
    description: string;
    advice: string;
    percentage: number;
    totalScore: number;
    answers: number[];
  };
  onBack: () => void;
}

export const CoupleCompatibilityResult = ({ results, onBack }: CoupleCompatibilityResultProps) => {
  const getEmoji = () => {
    if (results.percentage >= 90) return "🏆";
    if (results.percentage >= 80) return "💖";
    if (results.percentage >= 65) return "🌟";
    return "🧲";
  };

  const getFunnyQuotes = () => {
    if (results.percentage >= 90) {
      return [
        "다른 커플들은 질투할 수 있습니다 😏",
        "혹시 전생에 한 몸이었나요? 🤔",
        "이런 케미는 K-드라마 수준이에요! 📺"
      ];
    } else if (results.percentage >= 80) {
      return [
        "싸워도 금방 화해하는 타입이네요 😊",
        "현실적이면서도 로맨틱한 밸런스 👍",
        "친구들이 부러워하는 커플상 💕"
      ];
    } else if (results.percentage >= 65) {
      return [
        "아직 서로를 탐험 중인 모험가들! 🗺️",
        "시간이 갈수록 더 찰떡궁합 예정 ⏰",
        "성장형 커플의 미래는 밝아요 🌅"
      ];
    } else {
      return [
        "정반대의 매력이 오히려 신선해요 🔄",
        "다양성이 관계의 스파이스! 🌶️",
        "서로 다르니까 배울 게 많아요 📚"
      ];
    }
  };

  const handleShare = () => {
    const text = `우리 커플 케미 테스트 결과: ${results.compatibilityType} (${results.percentage}%)\n${results.description}`;
    if (navigator.share) {
      navigator.share({
        title: '커플 케미 테스트 결과',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-red-100 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-pink-600">💕 커플 케미 분석 결과</h1>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 메인 결과 카드 */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border-pink-200 md:col-span-2">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getEmoji()}</div>
              <h2 className="text-3xl font-bold text-pink-600 mb-2">
                {results.compatibilityType}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-pink-500 text-white text-lg px-4 py-2">
                  케미 지수: {results.percentage}%
                </Badge>
              </div>
              <Progress 
                value={results.percentage} 
                className="w-full max-w-md mx-auto h-3"
              />
            </div>

            <div className="space-y-6">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="text-xl font-bold text-pink-700 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  우리 커플의 특징
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {results.description}
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  전문가의 한 마디
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {results.advice}
                </p>
              </div>
            </div>
          </Card>

          {/* 재미있는 분석 */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-pink-200">
            <h3 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              😂 웃긴 분석
            </h3>
            <div className="space-y-3">
              {getFunnyQuotes().map((quote, index) => (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">{quote}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 점수 분석 */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-pink-200">
            <h3 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              📊 상세 분석
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총점</span>
                <Badge variant="outline">{results.totalScore}/32점</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">궁합도</span>
                <Badge className="bg-pink-500 text-white">
                  {results.percentage >= 90 ? "최상" : 
                   results.percentage >= 80 ? "상" :
                   results.percentage >= 65 ? "중상" : "중"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">미래 전망</span>
                <Badge variant="outline" className="text-green-600">
                  {results.percentage >= 80 ? "🌈 무지개" : 
                   results.percentage >= 65 ? "☀️ 맑음" : "🌱 성장 중"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* 액션 버튼들 */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button
            onClick={handleShare}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            결과 공유하기
          </Button>
          
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            <Download className="w-4 h-4 mr-2" />
            결과 저장하기
          </Button>
          
          <Button
            onClick={onBack}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 테스트하기
          </Button>
        </div>

        {/* 재미있는 추가 정보 */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <h3 className="text-lg font-bold text-pink-600 mb-3 text-center">
            🎉 재미있는 사실
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm text-gray-600">
                이 테스트는 100% 재미용입니다.<br/>
                진짜 궁합은 서로를 아끼는 마음!
              </p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-2xl mb-2">💡</div>
              <p className="text-sm text-gray-600">
                싸울 때는 치킨을 시켜보세요.<br/>
                음식 앞에서는 모두가 평등해요!
              </p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-2xl mb-2">❤️</div>
              <p className="text-sm text-gray-600">
                가장 중요한 건 서로를<br/>
                웃게 만들어 주는 것!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};