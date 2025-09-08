import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coffee, Share2, Download, RefreshCw, Star, Heart } from 'lucide-react';

interface SeniorFunResultProps {
  results: {
    seniorType: string;
    description: string;
    advice: string;
    charm: string;
    totalScore: number;
    answers: number[];
  };
  onBack: () => void;
}

export const SeniorFunResult = ({ results, onBack }: SeniorFunResultProps) => {
  const getMainEmoji = () => {
    if (results.totalScore >= 28) return "🌈";
    if (results.totalScore >= 22) return "🎯";
    if (results.totalScore >= 16) return "🌱";
    return "🏠";
  };

  const getFunnyComments = () => {
    if (results.totalScore >= 28) {
      return [
        "젊은이들이 부러워할 에너지! ⚡",
        "나이는 정말 숫자일 뿐이네요 😄",
        "손자손녀들의 영원한 친구 💕"
      ];
    } else if (results.totalScore >= 22) {
      return [
        "경험이 만들어낸 진짜 어른 👨‍🎓",
        "가족들의 든든한 버팀목 🛡️",
        "지혜로운 조언의 달인 💡"
      ];
    } else if (results.totalScore >= 16) {
      return [
        "배움에 나이가 없다는 걸 보여주는 분! 📚",
        "새로운 도전을 두려워하지 않는 용기 🦁",
        "젊은 마음의 소유자 💖"
      ];
    } else {
      return [
        "평온함 속에 숨겨진 깊이 🌊",
        "여유로운 삶의 진정한 의미 🍃",
        "안정감 있는 어른의 품격 👑"
      ];
    }
  };

  const getLifeAdvice = () => {
    const advices = [
      "하루에 한 번은 크게 웃어보세요! 😂",
      "젊은 사람들과 대화해보세요 - 서로 배울 게 많아요! 👥",
      "새로운 취미 하나쯤은 도전해볼 만해요! 🎨",
      "건강한 몸에 건강한 정신이 깃들어요! 💪",
      "과거의 추억을 나누는 것도 좋은 일이에요! 📖"
    ];
    return advices[Math.floor(Math.random() * advices.length)];
  };

  const handleShare = async () => {
    const text = `🌟 나의 시니어 매력 테스트 결과 🌟

🎯 유형: ${results.seniorType}
💫 매력 지수: ${Math.round((results.totalScore / 32) * 100)}%

${results.description}

✨ 특별한 매력: ${results.charm}

📍 테스트 해보기: ${window.location.origin}/assessment?test=senior`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: '🌈 시니어 매력 테스트 결과',
          text: text,
          url: `${window.location.origin}/assessment?test=senior`
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert('✅ 결과가 클립보드에 복사되었습니다!\n카카오톡이나 문자로 공유해보세요!');
      }
    } catch (error) {
      console.error('공유 실패:', error);
      // fallback으로 텍스트만 복사
      try {
        await navigator.clipboard.writeText(text);
        alert('✅ 결과가 클립보드에 복사되었습니다!');
      } catch (clipboardError) {
        alert('❌ 공유에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleSave = () => {
    try {
      // PDF로 저장하기 위해 window.print() 사용
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const content = `
          <html>
            <head>
              <title>시니어 매력 테스트 결과</title>
              <style>
                body { font-family: 'Malgun Gothic', sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .result-card { border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 10px; }
                .score { font-size: 24px; font-weight: bold; color: #f59e0b; }
                .description { margin: 15px 0; line-height: 1.6; }
                .charm { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 10px 0; }
                .advice { background: #fef9e7; padding: 15px; border-radius: 8px; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🌟 시니어 매력 테스트 결과 🌟</h1>
                <p>테스트 일시: ${new Date().toLocaleDateString('ko-KR')}</p>
              </div>
              
              <div class="result-card">
                <h2>${results.seniorType}</h2>
                <div class="score">매력 지수: ${Math.round((results.totalScore / 32) * 100)}%</div>
                
                <div class="description">
                  <h3>🌟 매력 포인트</h3>
                  <p>${results.description}</p>
                </div>
                
                <div class="charm">
                  <h3>💖 특별한 매력</h3>
                  <p>${results.charm}</p>
                </div>
                
                <div class="advice">
                  <h3>💡 인생 꿀팁</h3>
                  <p>${results.advice}</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <p><strong>점수: ${results.totalScore}/32점</strong></p>
                  <p style="font-size: 12px; color: #666;">심리톡톡 - 당신의 마음을 이해합니다</p>
                </div>
              </div>
            </body>
          </html>
        `;
        
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('❌ 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-amber-700">👴👵 시니어 매력 분석 결과</h1>
            <Coffee className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 메인 결과 카드 */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border-amber-200 md:col-span-2">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getMainEmoji()}</div>
              <h2 className="text-3xl font-bold text-amber-700 mb-2">
                {results.seniorType}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-amber-500 text-white text-lg px-4 py-2">
                  매력 지수: {Math.round((results.totalScore / 32) * 100)}%
                </Badge>
              </div>
              <Progress 
                value={(results.totalScore / 32) * 100} 
                className="w-full max-w-md mx-auto h-3"
              />
            </div>

            <div className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                <h3 className="text-xl font-bold text-amber-700 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  시니어님의 매력 포인트
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {results.description}
                </p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h3 className="text-xl font-bold text-orange-700 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  특별한 매력
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {results.charm}
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-xl font-bold text-yellow-700 mb-3 flex items-center gap-2">
                  💡 인생 꿀팁
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {results.advice}
                </p>
              </div>
            </div>
          </Card>

          {/* 재미있는 분석 */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-amber-200">
            <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
              😄 재미있는 분석
            </h3>
            <div className="space-y-3">
              {getFunnyComments().map((comment, index) => (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">{comment}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 오늘의 조언 */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-amber-200">
            <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
              🌟 오늘의 조언
            </h3>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
              <p className="text-gray-700 text-center font-medium">
                {getLifeAdvice()}
              </p>
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-amber-600">
                점수: {results.totalScore}/32점
              </Badge>
            </div>
          </Card>
        </div>

        {/* 액션 버튼들 */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button
            onClick={handleShare}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            결과 공유하기
          </Button>
          
          <Button
            onClick={handleSave}
            variant="outline"
            className="border-amber-300 text-amber-600 hover:bg-amber-50"
          >
            <Download className="w-4 h-4 mr-2" />
            결과 저장하기
          </Button>
          
          <Button
            onClick={onBack}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 테스트하기
          </Button>
        </div>

        {/* 따뜻한 메시지 */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <h3 className="text-lg font-bold text-amber-600 mb-3 text-center">
            💝 시니어님께 드리는 말씀
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🌺</div>
              <p className="text-sm text-gray-600">
                살아오신 모든 순간이<br/>
                귀중한 경험이자 지혜입니다
              </p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎈</div>
              <p className="text-sm text-gray-600">
                나이는 정말 숫자일 뿐!<br/>
                마음만은 언제나 청춘이세요
              </p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🌈</div>
              <p className="text-sm text-gray-600">
                앞으로도 건강하고<br/>
                행복한 날들만 가득하시길!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};