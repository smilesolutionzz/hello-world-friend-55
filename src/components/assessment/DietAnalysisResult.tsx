import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useShareText } from '@/utils/shareUtils';
import { 
  Weight, 
  Target, 
  Apple, 
  Activity, 
  Pill, 
  Clock,
  CheckCircle,
  Star,
  Phone,
  Calendar,
  Download,
  Share2,
  RefreshCw,
  MapPin
} from 'lucide-react';
import logo from '@/assets/gakkai-logo.png';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface DietAnalysisResultProps {
  result: any;
  onRestart: () => void;
}

const DietAnalysisResult: React.FC<DietAnalysisResultProps> = ({ result, onRestart }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { shareAsText } = useShareText();
  const navigate = useNavigate();

  const handleDietPlan = () => {
    window.open('https://naver.me/xk1XPBhl', '_blank');
  };

  const handleHerbalConsult = () => {
    window.open('https://naver.me/xk1XPBhl', '_blank');
  };

  const handlePDFDownload = async () => {
    try {
      await downloadResultAsPDF(
        'diet-analysis-result',
        `체질분석_${result.constitutionType}_${new Date().toLocaleDateString()}`,
        () => {
          toast({
            title: "다운로드 완료",
            description: "PDF 파일이 다운로드되었습니다.",
          });
        },
        (error) => {
          toast({
            title: "다운로드 실패",
            description: error.message,
            variant: "destructive"
          });
        }
      );
    } catch (error) {
      console.error('PDF download error:', error);
    }
  };

  const handleShare = () => {
    const shareText = `
체질분석 결과

체질: ${result.constitutionType}
${getConstitutionDescription(result.constitutionType)}

📋 목표: ${result.targetWeight}

🍎 권장 식품
${result.dietPlan.diet}

⚠️ 주의사항
${result.dietPlan.caution}

💪 운동 처방
${result.dietPlan.exercise}

🌿 한약재
${result.dietPlan.herbs.join(', ')}
    `.trim();

    shareAsText(shareText, "체질분석 결과");
  };

  const constitutionColors = {
    "태음인": "bg-blue-50 border-blue-200 text-blue-700",
    "소양인": "bg-red-50 border-red-200 text-red-700", 
    "소음인": "bg-green-50 border-green-200 text-green-700",
    "태양인": "bg-yellow-50 border-yellow-200 text-yellow-700"
  };

  const getConstitutionDescription = (type: string) => {
    const descriptions = {
      "태음인": "체격이 크고 골격이 굵으며, 소화기능이 좋아 살이 잘 찌는 체질입니다.",
      "소양인": "상체가 발달하고 열이 많으며, 급한 성격을 가진 체질입니다.",
      "소음인": "소화기능이 약하고 추위를 타며, 신중한 성격의 체질입니다.",
      "태양인": "어깨가 넓고 허리가 가늘며, 진취적인 성격의 체질입니다."
    };
    return descriptions[type as keyof typeof descriptions] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto" id="diet-analysis-result">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="가까이한의원" className="h-24 object-contain" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-purple-600 mr-2" />
            <h1 className="text-3xl font-bold text-foreground">가까이한의원 체질분석 완료</h1>
          </div>
          <p className="text-lg font-semibold text-purple-700 mb-2">
            맞춤형 한방 다이어트 프로그램
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-600" />
              <span className="font-medium">상담문의: 1234-5678</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span>서울시 강남구 테헤란로</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 메인 결과 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 체질 분석 결과 */}
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center text-xl">
                  <Target className="h-6 w-6 mr-2 text-purple-600" />
                  당신의 체질은 <Badge className={`ml-2 ${constitutionColors[result.constitutionType as keyof typeof constitutionColors]}`}>
                    {result.constitutionType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  {getConstitutionDescription(result.constitutionType)}
                </p>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">가까이한의원 맞춤 다이어트</h4>
                  <p className="text-purple-700 text-sm">
                    {result.targetWeight}을 목표로 하는 {result.constitutionType} 맞춤 한방 다이어트 프로그램입니다.
                    가까이한의원의 30년 임상 경험을 바탕으로 한 체질별 맞춤 처방을 제공합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 맞춤 식단 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Apple className="h-6 w-6 mr-2 text-orange-500" />
                  체질별 맞춤 식단
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">권장 식품</h4>
                    <p className="text-blue-700">{result.dietPlan.diet}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">주의사항</h4>
                    <p className="text-red-700">{result.dietPlan.caution}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 운동 처방 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-6 w-6 mr-2 text-purple-500" />
                  체질별 운동법
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-700">{result.dietPlan.exercise}</p>
                </div>
              </CardContent>
            </Card>

            {/* 한약 처방 */}
            <Card className="border-2 border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center">
                  <Pill className="h-6 w-6 mr-2 text-amber-600" />
                  맞춤 한방 다이어트 처방
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.dietPlan.herbs.map((herb: string, index: number) => (
                    <div key={index} className="flex items-center p-3 bg-amber-50 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                      <span className="font-medium text-amber-800">{herb}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    전문가 처방 안내
                  </h4>
                  <p className="text-amber-700 text-sm">
                    위 한약재들을 기반으로 개인 맞춤 처방이 가능합니다. 
                    정확한 용법과 용량은 전문 한의사와 상담 후 결정됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 - 액션 */}
          <div className="space-y-6">
            {/* 가까이한의원 비대면 진료 */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-green-600">대표 제휴기관</Badge>
                <CardTitle className="text-lg text-green-900">가까이한의원 비대면진료</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-green-700 mb-3">검사 결과 기반 맞춤 한약 처방</p>
                <div className="flex items-center gap-2 text-xs text-green-600 mb-3">
                  <Clock className="h-3 w-3" />
                  <span>평일 09:00-18:00 | 토요일 09:00-15:00</span>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => window.open('tel:010-6624-9990', '_self')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  전화 상담: 010-6624-9990
                </Button>
              </CardContent>
            </Card>

            {/* 가까이한의원 정보 */}
            <Card className="bg-gradient-to-br from-purple-100 to-blue-100 border-purple-300 border-2">
              <CardHeader>
                <CardTitle className="text-lg text-purple-900 flex items-center justify-center">
                  <img src={logo} alt="가까이한의원" className="h-12 mr-2" />
                  가까이한의원
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-2">체질별 다이어트 전문</h4>
                    <p className="text-sm text-purple-700 mb-3">30년 임상 경험 기반 맞춤 한방 처방</p>
                    <div className="space-y-2 text-xs text-purple-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>상담: 1234-5678</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>서울시 강남구 테헤란로</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    지금 바로 상담받기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 결과 공유 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">결과 관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handlePDFDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF 다운로드
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  결과 공유하기
                </Button>
                <Separator />
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={onRestart}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  다시 검사하기
                </Button>
              </CardContent>
            </Card>

            {/* 추가 검사 추천 */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">정밀 검사</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-purple-700">더 정확한 체질 분석을 위한</p>
                  <Button size="sm" variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                    가까이한의원 프리미엄 분석
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="가까이한의원" className="h-16" />
          </div>
          <h3 className="font-bold text-center text-purple-900 mb-3 text-lg">
            가까이한의원과 함께하는 건강한 다이어트
          </h3>
          <p className="text-sm text-center text-purple-700 mb-4">
            체질별 맞춤 한방 다이어트는 꾸준한 관리가 핵심입니다. 
            가까이한의원의 전문 한의사 상담으로 더 빠르고 안전한 결과를 경험하세요.
          </p>
          <div className="flex flex-col gap-2 items-center text-sm text-purple-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span>검사 결과는 3개월간 유효 (정기 재검사 권장)</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-purple-800">
              <Phone className="h-4 w-4" />
              <span>상담문의: 1234-5678</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DietAnalysisResult };