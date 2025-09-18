import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  RefreshCw
} from 'lucide-react';

interface DietAnalysisResultProps {
  result: any;
  onRestart: () => void;
}

const DietAnalysisResult: React.FC<DietAnalysisResultProps> = ({ result, onRestart }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-foreground">체질분석 완료</h1>
          </div>
          <p className="text-muted-foreground">
            맞춤형 한방다이어트 프로그램이 준비되었습니다
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 메인 결과 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 체질 분석 결과 */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center text-xl">
                  <Target className="h-6 w-6 mr-2 text-green-600" />
                  당신의 체질은 <Badge className={`ml-2 ${constitutionColors[result.constitutionType as keyof typeof constitutionColors]}`}>
                    {result.constitutionType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  {getConstitutionDescription(result.constitutionType)}
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">다이어트 특성</h4>
                  <p className="text-green-700 text-sm">
                    {result.targetWeight}을 목표로 하는 {result.constitutionType} 맞춤 다이어트 프로그램입니다.
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
            {/* 빠른 액션 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">다음 단계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}>
                  <Phone className="h-4 w-4 mr-2" />
                  맞춤한방 전화상담받기
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  다이어트 플랜 받기
                </Button>
                <Button variant="outline" className="w-full">
                  <Pill className="h-4 w-4 mr-2" />
                  한약 처방 문의
                </Button>
              </CardContent>
            </Card>

            {/* 가까이한의원 연계 */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">가까이한의원 연계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-blue-700">가까이한의원</h4>
                    <p className="text-xs text-blue-600">체질별 다이어트 전문 상담</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}
                  >
                    맞춤한방 전화상담받기
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
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  PDF 다운로드
                </Button>
                <Button variant="outline" className="w-full">
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
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">추가 검사</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-green-700">더 정확한 분석을 원한다면</p>
                  <Button size="sm" variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                    프리미엄 종합검사
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            지속적인 관리 안내
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            체질별 다이어트는 꾸준한 관리가 중요합니다. 정기적인 체크와 전문가 상담으로 더 나은 결과를 얻으실 수 있습니다.
          </p>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>검사 결과는 3개월간 유효하며, 정기적인 재검사를 권장합니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DietAnalysisResult };