import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Share2, Download, RefreshCw, MessageSquare } from 'lucide-react';

interface GrandmaAnalysisResultProps {
  results: {
    analysisType: string;
    grandmaComment: string;
    harshAdvice: string;
    percentage: number;
    totalScore: number;
    answers: number[];
  };
  onBack: () => void;
}

export const GrandmaAnalysisResult = ({ results, onBack }: GrandmaAnalysisResultProps) => {
  const getEmoji = () => {
    if (results.percentage >= 90) return "👑";
    if (results.percentage >= 80) return "😊";
    if (results.percentage >= 60) return "😐";
    return "🤦‍♀️";
  };

  const getGrandmaReactions = () => {
    if (results.percentage >= 90) {
      return [
        "어휴, 넌들 보면 이가 시려서 못 보겠네!",
        "이렇게 달달하면 당뇨 걸리겠어!",
        "할머니 젊을 땐 이렇게 안 살았는데..."
      ];
    } else if (results.percentage >= 80) {
      return [
        "그나마 봐줄 만하네, 요즘 애들 치고는",
        "서로 좀 양보하면서 사는 게 보기 좋아",
        "계속 이렇게만 해라, 별일 없을 거야"
      ];
    } else if (results.percentage >= 60) {
      return [
        "좀 더 신경 써라, 이래서야 되겠냐",
        "서로 맞춰가는 게 연애지, 고집만 부리면 뭐해",
        "가끔은 참는 것도 필요해, 알았지?"
      ];
    } else {
      return [
        "야 이것들아! 이게 뭔 꼴이야?",
        "하루가 멀다 하고 싸우면서 뭘 하는 거냐",
        "이런 식으로 하면 오래 못 가!"
      ];
    }
  };

  const getHarshTruths = () => {
    return [
      "연애는 참는 게 반이야, 못 참으면 혼자 살아",
      "완벽한 사람은 없어, 서로 맞춰가는 거지",
      "싸워도 하루 넘기지 마라, 정 떨어져",
      "자존심 세우다가 좋은 사람 놓쳐도 모르겠냐?",
      "서로 다른 게 당연해, 똑같은 사람이 어디 있어"
    ];
  };

  const handleShare = () => {
    const text = `할머니의 독설 커플 진단 결과\n\n${results.analysisType} (${results.percentage}%)\n\n할머니 말씀: "${results.grandmaComment}"\n\n할머니 조언: "${results.harshAdvice}"`;
    
    if (navigator.share) {
      navigator.share({
        title: '할머니의 독설 커플 진단',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('할머니의 진단 결과가 복사되었어! 친구들한테 자랑해봐라!');
    }
  };

  const handleSave = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>할머니의 독설 커플 진단 결과</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .result { margin: 20px 0; padding: 20px; border: 2px solid #ff6b6b; border-radius: 10px; }
              .score { font-size: 24px; font-weight: bold; color: #ff6b6b; }
              .comment { font-size: 18px; margin: 10px 0; font-style: italic; }
              .advice { font-size: 16px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1>👵 할머니의 독설 커플 진단 결과</h1>
            <div class="result">
              <div class="score">${results.analysisType} (${results.percentage}%)</div>
              <div class="comment">"${results.grandmaComment}"</div>
              <div class="advice">조언: "${results.harshAdvice}"</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">👵</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              할머니의 촌철살인 진단 결과
            </h1>
            <span className="text-4xl">💥</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 메인 결과 카드 */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border-red-200 md:col-span-2">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getEmoji()}</div>
              <h2 className="text-3xl font-bold text-red-600 mb-2">
                {results.analysisType}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                  할머니 점수: {results.percentage}%
                </Badge>
              </div>
              <Progress 
                value={results.percentage} 
                className="w-full max-w-md mx-auto h-3"
              />
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  할머니의 한 마디
                </h3>
                <div className="bg-white p-4 rounded-lg border-l-4 border-red-400">
                  <p className="text-gray-700 text-lg leading-relaxed italic">
                    "{results.grandmaComment}"
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h3 className="text-xl font-bold text-orange-700 mb-3 flex items-center gap-2">
                  <span className="text-xl">🗯️</span>
                  할머니의 쓴소리 조언
                </h3>
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-400">
                  <p className="text-gray-700 text-lg leading-relaxed font-semibold">
                    "{results.harshAdvice}"
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 할머니 추가 코멘트 */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-red-200">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              👵 할머니 추가 코멘트
            </h3>
            <div className="space-y-3">
              {getGrandmaReactions().map((comment, index) => (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700 italic">"{comment}"</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 할머니의 인생 조언 */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-red-200">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              💎 할머니의 인생 조언
            </h3>
            <div className="space-y-3">
              {getHarshTruths().slice(0, 3).map((truth, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 font-medium">• {truth}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 액션 버튼들 */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button
            onClick={handleShare}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            할머니 진단 공유하기
          </Button>
          
          <Button
            onClick={handleSave}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Download className="w-4 h-4 mr-2" />
            진단서 저장하기
          </Button>
          
          <Button
            onClick={onBack}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 진단받기
          </Button>
        </div>

        {/* 할머니의 마지막 인사 */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <div className="text-center">
            <h3 className="text-lg font-bold text-red-600 mb-3">
              👵 할머니의 마지막 인사
            </h3>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-gray-600 italic">
                "야, 이 것들아! 할머니 말 안 들으면 나중에 후회한다? 
                서로 아끼고 사랑하는 거 좋지만 너무 달달하지도 말고, 
                너무 싸우지도 말고... 적당히 해라! 할머니는 이만 간다!"
              </p>
              <div className="text-2xl mt-2">👋</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};