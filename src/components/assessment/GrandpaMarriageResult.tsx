import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Share2, FileDown, RotateCcw, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PersonalizedProductRecommendation } from '@/components/product/PersonalizedProductRecommendation';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface GrandpaMarriageResultProps {
  result: {
    verdict: string;
    grandpa_rant: string;
    detailed_analysis: string;
    solution: string;
    blame_percentage: {
      husband: number;
      wife: number;
      external?: number;
    };
  };
  onRetake: () => void;
}

export default function GrandpaMarriageResult({ result, onRetake }: GrandpaMarriageResultProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const handleShare = () => {
    const shareText = `👴 욕쟁이 할아버지의 부부금술 분석 결과 👴

🏷️ 분석 결과: ${result.verdict}
📊 잘못 비율: 남편 ${result.blame_percentage.husband}% vs 아내 ${result.blame_percentage.wife}%

할아버지의 일침:
"${result.grandpa_rant}"

할아버지의 해결책:
"${result.solution}"

🔗 우리 부부도 분석받아보기: ${window.location.origin}/fun-tests`;

    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "공유 텍스트 복사 완료!",
        description: "배우자한테 보내서 반성하게 만드세요! 😤",
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
            <title>욕쟁이 할아버지의 부부금술진단 결과</title>
            <style>
              body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; background: linear-gradient(135deg, #eff6ff, #f0f9ff); }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .title { color: #1d4ed8; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { color: #666; font-size: 16px; }
              .result-section { margin: 20px 0; padding: 20px; border-radius: 10px; }
              .verdict { background: #fef2f2; border-left: 5px solid #dc2626; }
              .rant { background: #fff7ed; border-left: 5px solid #ea580c; }
              .analysis { background: #f0f9ff; border-left: 5px solid #1d4ed8; }
              .solution { background: #f0fdf4; border-left: 5px solid #16a34a; }
              .blame-chart { text-align: center; margin: 20px 0; }
              .blame-bar { display: flex; height: 40px; border-radius: 20px; overflow: hidden; margin: 10px 0; }
              .husband-bar { background: #dc2626; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
              .wife-bar { background: #1d4ed8; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="title">👴 욕쟁이 할아버지의 부부금술진단</h1>
                <p class="subtitle">누가 잘못했나 판정 결과</p>
              </div>
              
              <div class="blame-chart">
                <h3>잘못 비율</h3>
                <div class="blame-bar">
                  <div class="husband-bar" style="width: ${result.blame_percentage.husband}%">
                    남편 ${result.blame_percentage.husband}%
                  </div>
                  <div class="wife-bar" style="width: ${result.blame_percentage.wife}%">
                    아내 ${result.blame_percentage.wife}%
                  </div>
                </div>
              </div>
              
              <div class="result-section verdict">
                <h3>👴 할아버지 판정</h3>
                <h4>${result.verdict}</h4>
              </div>
              
              <div class="result-section rant">
                <h3>🔥 할아버지의 일침</h3>
                <p>"${result.grandpa_rant}"</p>
              </div>
              
              <div class="result-section analysis">
                <h3>📝 상세 분석</h3>
                <p>${result.detailed_analysis}</p>
              </div>
              
              <div class="result-section solution">
                <h3>💡 할아버지의 해결책</h3>
                <p>"${result.solution}"</p>
              </div>
              
              <div class="footer">
                <p>※ 이 결과는 재미를 위한 것입니다. 진짜 부부싸움은 대화로 해결하세요!</p>
                <p>생성일: ${new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR')}</p>
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

  const getBlameColor = (percentage: number) => {
    if (percentage >= 70) return "bg-red-500";
    if (percentage >= 50) return "bg-orange-500";
    if (percentage >= 30) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              욕쟁이 할아버지의 판정 결과
            </h1>
            <MessageCircle className="w-12 h-12 text-indigo-600" />
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 text-lg">
            👴 할아버지의 냉정한 판단
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 결과 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 잘못 비율 */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 text-center">
                <CardTitle className="text-2xl text-blue-800">누가 더 잘못했나?</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-700">남편</span>
                    <span className="font-bold text-red-700">{result.blame_percentage.husband}%</span>
                  </div>
                  <div className="flex h-8 rounded-full overflow-hidden border-2 border-gray-200">
                    <div 
                      className="bg-red-500 flex items-center justify-center text-white text-sm font-bold"
                      style={{ width: `${result.blame_percentage.husband}%` }}
                    >
                      {result.blame_percentage.husband > 20 && '남편'}
                    </div>
                    <div 
                      className="bg-blue-500 flex items-center justify-center text-white text-sm font-bold"
                      style={{ width: `${result.blame_percentage.wife}%` }}
                    >
                      {result.blame_percentage.wife > 20 && '아내'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-700">아내</span>
                    <span className="font-bold text-blue-700">{result.blame_percentage.wife}%</span>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2 border-blue-300 text-blue-700">
                    {result.verdict}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 할아버지의 일침 */}
            <Card className="border-2 border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
                <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                  🔥 할아버지의 일침
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-400">
                  <p className="text-lg text-orange-800 font-medium leading-relaxed">
                    "{result.grandpa_rant}"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 상세 분석 */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  📝 할아버지의 상세 분석
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-blue-800 leading-relaxed">
                  {result.detailed_analysis}
                </p>
              </CardContent>
            </Card>

            {/* 해결책 */}
            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100">
                <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                  💡 할아버지의 해결책
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                  <p className="text-lg text-green-800 font-medium leading-relaxed">
                    "{result.solution}"
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
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  남편/아내한테 공유하기
                </Button>
                
                <Button 
                  onClick={handleSave}
                  variant="outline"
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  저장하기
                </Button>
                
                <Button 
                  onClick={onRetake}
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 진단받기
                </Button>
              </CardContent>
            </Card>

            {/* 할아버지의 추가 조언 */}
            <Card className="border-2 border-indigo-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-100 to-blue-100">
                <CardTitle className="text-lg text-indigo-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  할아버지의 부부 생활 팁
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm text-indigo-700">
                  <p>👴 "부부싸움은 칼로 물 베기야"</p>
                  <p>💑 "서로 다른 게 당연한 거다"</p>
                  <p>🗣️ "대화가 제일 중요해"</p>
                  <p>😊 "아이 앞에서는 절대 싸우지 마라"</p>
                  <p>❤️ "사랑한다는 말 자주 해"</p>
                </div>
              </CardContent>
            </Card>

            {/* 면책 조항 */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  ※ 이 진단은 재미를 위한 것으로, 실제 부부 상담이나 갈등 해결을 대체할 수 없습니다. 
                  진지한 부부 갈등이 있으시면 전문 상담사와 상의하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 맞춤 추천 및 B2B 제안 */}
        <div className="mt-8">
          <PersonalizedProductRecommendation 
            testType="grandpa_marriage"
            testResult={result}
          />
        </div>
      </div>
    </div>
  );
}