import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Share2, FileDown, RotateCcw, Heart, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PersonalizedProductRecommendation } from '@/components/product/PersonalizedProductRecommendation';

interface MZNaggingResultProps {
  result: {
    type: string;
    main_nagging: string;
    detailed_advice: string;
    life_lesson: string;
    worry_score: number;
  };
  onRetake: () => void;
}

export default function MZNaggingResult({ result, onRetake }: MZNaggingResultProps) {
  const { toast } = useToast();

  const handleShare = () => {
    const shareText = `🍲 국밥집 이모의 MZ잔소리 결과 🍲

📋 이모 유형: ${result.type}
📊 걱정도: ${result.worry_score}/100점

이모의 잔소리:
"${result.main_nagging}"

이모의 조언:
"${result.detailed_advice}"

이모의 인생 교훈:
"${result.life_lesson}"

🔗 나도 이모 잔소리 들어보기: ${window.location.origin}/fun-tests`;

    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "공유 텍스트 복사 완료!",
        description: "친구들에게도 이모 잔소리 들려주세요! 🍲",
      });
    }).catch(() => {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    });
  };

  const handleSave = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>국밥집 이모의 MZ잔소리 결과</title>
            <style>
              body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; background: linear-gradient(135deg, #fef7ed, #fff7ed); }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .title { color: #ea580c; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { color: #666; font-size: 16px; }
              .result-section { margin: 20px 0; padding: 20px; border-radius: 10px; }
              .nagging { background: #fef2f2; border-left: 5px solid #ef4444; }
              .advice { background: #fff7ed; border-left: 5px solid #ea580c; }
              .lesson { background: #fefce8; border-left: 5px solid #ca8a04; }
              .worry-chart { text-align: center; margin: 20px 0; }
              .worry-circle { display: inline-block; width: 100px; height: 100px; border-radius: 50%; background: #ea580c; color: white; line-height: 100px; font-size: 24px; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="title">🍲 국밥집 이모의 MZ잔소리</h1>
                <p class="subtitle">이모 유형: ${result.type}</p>
              </div>
              
              <div class="worry-chart">
                <div class="worry-circle">${result.worry_score}점</div>
                <p>이모 걱정도</p>
              </div>
              
              <div class="result-section nagging">
                <h3>🍲 이모의 잔소리</h3>
                <p>"${result.main_nagging}"</p>
              </div>
              
              <div class="result-section advice">
                <h3>💝 이모의 조언</h3>
                <p>"${result.detailed_advice}"</p>
              </div>
              
              <div class="result-section lesson">
                <h3>📚 이모의 인생 교훈</h3>
                <p>"${result.life_lesson}"</p>
              </div>
              
              <div class="footer">
                <p>※ 이모의 잔소리는 모두 사랑에서 나온 걱정입니다 💝</p>
                <p>생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast({
        title: "저장 실패",
        description: "팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  const getWorryColor = (score: number) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-orange-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getWorryMessage = (score: number) => {
    if (score >= 80) return "이모가 많이 걱정해요 😰";
    if (score >= 60) return "이모가 걱정되네요 😟";
    if (score >= 40) return "이모가 조금 걱정돼요 😊";
    return "이모가 안심해요 😌";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coffee className="w-12 h-12 text-orange-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              국밥집 이모의 잔소리 결과
            </h1>
            <Coffee className="w-12 h-12 text-red-600" />
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 text-lg">
            🍲 이모의 따뜻한 걱정
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 결과 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 걱정도 */}
            <Card className="border-2 border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 text-center">
                <CardTitle className="text-2xl text-orange-800">이모 걱정도</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center relative">
                    <div className={`absolute inset-0 rounded-full ${getWorryColor(result.worry_score)}`} 
                         style={{ 
                           background: `conic-gradient(${getWorryColor(result.worry_score).replace('bg-', '')} ${result.worry_score * 3.6}deg, #e5e7eb 0deg)`
                         }}>
                    </div>
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative z-10">
                      <span className="text-3xl font-bold text-orange-600">{result.worry_score}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xl font-semibold text-orange-700">{getWorryMessage(result.worry_score)}</p>
                <Badge variant="outline" className="mt-2 border-orange-300 text-orange-600">
                  {result.type}
                </Badge>
              </CardContent>
            </Card>

            {/* 이모의 잔소리 */}
            <Card className="border-2 border-red-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100">
                <CardTitle className="text-xl text-red-800 flex items-center gap-2">
                  🍲 이모의 잔소리
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400">
                  <p className="text-lg text-red-800 font-medium leading-relaxed">
                    "{result.main_nagging}"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 이모의 조언 */}
            <Card className="border-2 border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                  💝 이모의 조언
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-orange-800 leading-relaxed">
                  {result.detailed_advice}
                </p>
              </CardContent>
            </Card>

            {/* 이모의 인생 교훈 */}
            <Card className="border-2 border-yellow-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
                <CardTitle className="text-xl text-yellow-800 flex items-center gap-2">
                  📚 이모의 인생 교훈
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-lg text-yellow-800 font-medium leading-relaxed">
                    "{result.life_lesson}"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 액션 버튼들 */}
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                <CardTitle className="text-lg text-purple-800">결과 활용하기</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  친구들에게 공유하기
                </Button>
                
                <Button 
                  onClick={handleSave}
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  저장하기
                </Button>
                
                <Button 
                  onClick={onRetake}
                  variant="outline"
                  className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 테스트
                </Button>
              </CardContent>
            </Card>

            {/* 이모의 추가 조언 */}
            <Card className="border-2 border-pink-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-100 to-red-100">
                <CardTitle className="text-lg text-pink-800 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  이모의 추가 조언
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm text-pink-700">
                  <p>🍲 "밥은 굶지 말고 챙겨 먹어"</p>
                  <p>💝 "부모님께 안부 자주 드려"</p>
                  <p>🏠 "집안일도 조금씩 배워둬"</p>
                  <p>💰 "돈은 계획적으로 써"</p>
                  <p>❤️ "좋은 사람들과 어울려"</p>
                </div>
              </CardContent>
            </Card>

            {/* 면책 조항 */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  ※ 이모의 잔소리는 모두 사랑과 걱정에서 나온 것입니다. 
                  재미로 봐주시고, 실제 인생 조언이 필요하시면 전문가와 상의하세요. 💝
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 맞춤 추천 및 B2B 제안 */}
        <div className="mt-8">
          <PersonalizedProductRecommendation 
            testType="mz_nagging"
            testResult={result}
          />
        </div>
      </div>
    </div>
  );
}