import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Share2, FileDown, RotateCcw, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PersonalizedProductRecommendation } from '@/components/product/PersonalizedProductRecommendation';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface GrandmaRelationshipResultProps {
  result: {
    relationship_type: string;
    grandma_verdict: string;
    detailed_analysis: string;
    advice: string;
    compatibility_score: number;
  };
  onRetake: () => void;
}

export default function GrandmaRelationshipResult({ result, onRetake }: GrandmaRelationshipResultProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const handleShare = () => {
    const shareText = `👵 욕쟁이 할머니의 연애 분석 결과 👵

🏷️ 관계 유형: ${result.relationship_type}
📊 궁합 점수: ${result.compatibility_score}/100점

할머니의 한마디:
"${result.grandma_verdict}"

할머니의 조언:
"${result.advice}"

🔗 나도 테스트 해보기: ${window.location.origin}/fun-tests`;

    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "공유 텍스트 복사 완료!",
        description: "카카오톡이나 문자로 친구들에게 공유해보세요!",
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
            <title>욕쟁이 할머니의 연애 분석 결과</title>
            <style>
              body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; background: linear-gradient(135deg, #fef2f2, #fefbf3); }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .title { color: #dc2626; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { color: #666; font-size: 16px; }
              .result-section { margin: 20px 0; padding: 20px; border-radius: 10px; }
              .verdict { background: #fef2f2; border-left: 5px solid #dc2626; }
              .analysis { background: #fff7ed; border-left: 5px solid #ea580c; }
              .advice { background: #fefce8; border-left: 5px solid #ca8a04; }
              .score { text-align: center; margin: 20px 0; }
              .score-circle { display: inline-block; width: 100px; height: 100px; border-radius: 50%; background: #dc2626; color: white; line-height: 100px; font-size: 24px; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="title">👵 욕쟁이 할머니의 연애 진단</h1>
                <p class="subtitle">관계 유형: ${result.relationship_type}</p>
              </div>
              
              <div class="score">
                <div class="score-circle">${result.compatibility_score}점</div>
                <p>궁합 점수</p>
              </div>
              
              <div class="result-section verdict">
                <h3>👵 할머니의 한마디</h3>
                <p>"${result.grandma_verdict}"</p>
              </div>
              
              <div class="result-section analysis">
                <h3>📝 상세 분석</h3>
                <p>${result.detailed_analysis}</p>
              </div>
              
              <div class="result-section advice">
                <h3>💡 할머니의 조언</h3>
                <p>"${result.advice}"</p>
              </div>
              
              <div class="footer">
                <p>※ 이 결과는 재미를 위한 것으로 실제 연애 조언이 아닙니다.</p>
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "완벽한 커플! 👫";
    if (score >= 60) return "괜찮은 관계 💕";
    if (score >= 40) return "노력이 필요해 🤔";
    return "위험한 관계 ⚠️";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-12 h-12 text-red-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              욕쟁이 할머니의 진단 결과
            </h1>
            <MessageCircle className="w-12 h-12 text-orange-600" />
          </div>
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 text-lg">
            👵 할머니의 솔직한 조언
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 결과 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 궁합 점수 */}
            <Card className="border-2 border-red-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100 text-center">
                <CardTitle className="text-2xl text-red-800">궁합 점수</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center relative">
                    <div className={`absolute inset-0 rounded-full ${getScoreColor(result.compatibility_score)}`} 
                         style={{ 
                           background: `conic-gradient(${getScoreColor(result.compatibility_score).replace('bg-', '')} ${result.compatibility_score * 3.6}deg, #e5e7eb 0deg)`
                         }}>
                    </div>
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative z-10">
                      <span className="text-3xl font-bold text-red-600">{result.compatibility_score}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xl font-semibold text-red-700">{getScoreMessage(result.compatibility_score)}</p>
                <Badge variant="outline" className="mt-2 border-red-300 text-red-600">
                  {result.relationship_type}
                </Badge>
              </CardContent>
            </Card>

            {/* 할머니의 한마디 */}
            <Card className="border-2 border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                  👵 할머니의 한마디
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-400">
                  <p className="text-lg text-orange-800 font-medium leading-relaxed">
                    "{result.grandma_verdict}"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 상세 분석 */}
            <Card className="border-2 border-yellow-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
                <CardTitle className="text-xl text-yellow-800 flex items-center gap-2">
                  📝 할머니의 상세 분석
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-yellow-800 leading-relaxed">
                  {result.detailed_analysis}
                </p>
              </CardContent>
            </Card>

            {/* 할머니의 조언 */}
            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-100 to-yellow-100">
                <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                  💡 할머니의 조언
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                  <p className="text-lg text-green-800 font-medium leading-relaxed">
                    "{result.advice}"
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
                  공유하기
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
                  다시 테스트
                </Button>
              </CardContent>
            </Card>

            {/* 재미있는 팁 */}
            <Card className="border-2 border-pink-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-100 to-red-100">
                <CardTitle className="text-lg text-pink-800 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  할머니의 추가 팁
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm text-pink-700">
                  <p>👵 "연애는 참을성이 반이야!"</p>
                  <p>💕 "서로 다른 게 당연한 거다"</p>
                  <p>🤝 "소통이 제일 중요해"</p>
                  <p>😊 "웃으면서 지내라"</p>
                </div>
              </CardContent>
            </Card>

            {/* 전문 상담 연결 */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                <CardTitle className="text-lg text-blue-800">더 깊은 상담이 필요하신가요?</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-blue-700 mb-3">
                  전문 상담가와의 1:1 상담으로 관계를 더욱 발전시켜보세요.
                </p>
                <Button 
                  onClick={() => window.location.href = '/expert-counseling'}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  전문가 상담 신청하기
                </Button>
              </CardContent>
            </Card>

            {/* 면책 조항 */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  ※ 이 테스트는 재미를 위한 것으로, 실제 연애 상담이나 관계 조언을 대체할 수 없습니다. 
                  진지한 관계 고민이 있으시면 전문 상담사와 상의하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 맞춤 추천 및 B2B 제안 */}
        <div className="mt-8">
          <PersonalizedProductRecommendation 
            testType="grandma_relationship"
            testResult={result}
          />
        </div>
      </div>
    </div>
  );
}