import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Share2, RotateCcw, Star, Users, Calendar, Copy, MessageCircle, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useShareText, formatFunTestResult } from "@/utils/shareUtils";
import { ImageGenerator } from "@/components/ai-image/ImageGenerator";
import GrandmaRelationshipResult from "./GrandmaRelationshipResult";
import GrandpaMarriageResult from "./GrandpaMarriageResult";
import MZNaggingResult from "./MZNaggingResult";

export default function FunTestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { shareAsText } = useShareText();
  const { result, testType } = location.state || {};

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getShareTitle(),
          text: getShareText(),
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying to clipboard
      const shareText = `${getShareTitle()}\n${getShareText()}\n${window.location.href}`;
      navigator.clipboard.writeText(shareText);
      toast({
        title: "링크 복사됨!",
        description: "클립보드에 결과가 복사되었습니다."
      });
    }
  };

  const handleRetry = () => {
    navigate('/');
  };

  const handleShareText = () => {
    const formattedText = formatFunTestResult(result, testType);
    shareAsText(formattedText, getShareTitle());
  };

  const getShareTitle = () => {
    switch (testType) {
      case 'past_life_job':
        return `나의 전생은 ${result?.pastLifeJob}! 🏺`;
      case 'animal_face_match':
        return `내 얼굴은 ${result?.matchedAnimal} 닮음! ${result?.emoji || '🐾'}`;
      case 'inner_animal':
        return `내 내면은 ${result?.innerAnimal}! 🦋`;
      case 'otrovert':
        return `나는 ${result?.personalityType}! 🎭`;
      case 'joseon_name':
        return `내 조선시대 이름은 ${result?.joseonName}! 🏯`;
      case 'joseon_job':
        return `내 조선시대 직업은 ${result?.job}! 👨‍💼`;
      case 'joseon_status':
        return `내 조선시대 신분은 ${result?.status}! 👑`;
      case 'grandma_relationship':
        return `할머니가 우리 연애를 진단했다! 👵`;
      case 'wisdom_advice':
        return `${result?.title} 🌟`;
      default:
        return "재미있는 테스트 결과!";
    }
  };

  const getShareText = () => {
    switch (testType) {
      case 'past_life_job':
        return `${result?.era}에 ${result?.pastLifeJob}이었던 나! ${result?.modernConnection}`;
      case 'animal_face_match':
        return `AI가 분석한 결과 ${result?.similarity}% 유사도로 ${result?.matchedAnimal}과 닮았다고! ${result?.advice}`;
      case 'inner_animal':
        return `심리 분석 결과 내 내면은 ${result?.innerAnimal}! 매칭도 ${result?.personalityMatch}%`;
      case 'otrovert':
        return `오트로버트 점수 ${result?.score}점! 외향과 내향 사이의 나만의 성격을 발견했어요. MBTI보다 더 정확한 나의 진짜 모습!`;
      case 'grandma_relationship':
        return `궁합 점수 ${result?.compatibility_score}점! "${result?.grandma_verdict}"`;
      case 'wisdom_advice':
        return `${result?.description} ${result?.funFact}`;
      default:
        return "나도 테스트 해보러 가기!";
    }
  };

  if (!result || !testType) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground mb-4">결과를 찾을 수 없습니다.</p>
            <Button onClick={() => navigate('/')}>
              메인으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'past_life_job') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8" />
              <CardTitle className="text-3xl text-center">전생 직업 분석 결과</CardTitle>
            </div>
            <div className="text-center">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                {result.era}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* 메인 결과 */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {result.pastLifeJob}
              </h2>
              <p className="text-lg text-muted-foreground">
                {result.description}
              </p>
            </div>

            {/* AI 이미지 생성 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-800">🎨 AI가 그려본 당신의 전생</h3>
              <ImageGenerator 
                initialPrompt={`${result.pastLifeJob} in ${result.era}, ${result.description}, professional historical illustration, detailed artwork`}
                type="test_result"
                context={`past_life_job_${result.pastLifeJob}`}
              />
            </div>

            {/* 성격 분석 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                성격 분석
              </h3>
              <p className="text-gray-700">{result.personality}</p>
            </div>

            {/* 특별한 능력들 */}
            <div>
              <h3 className="text-xl font-bold mb-4">✨ 전생의 특별한 능력</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.abilities?.map((ability, index) => (
                  <Badge key={index} variant="outline" className="p-3 text-center justify-center">
                    {ability}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 전생 이야기 */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold mb-3 text-amber-800">📜 전생의 이야기</h3>
              <p className="text-amber-700 leading-relaxed">{result.lifestory}</p>
            </div>

            {/* 현재와의 연결점 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold mb-3 text-blue-800">🔗 현재와의 연결점</h3>
              <p className="text-blue-700">{result.modernConnection}</p>
            </div>

            {/* 조언 */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-bold mb-3 text-green-800">💡 전생에서 얻는 지혜</h3>
              <p className="text-green-700">{result.advice}</p>
            </div>

            {/* 직업 호환성 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-2">✅ 잘 맞는 현재 직업</h4>
                <p className="text-emerald-700">{result.compatibility?.bestMatch}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">❌ 피해야 할 직업</h4>
                <p className="text-red-700">{result.compatibility?.worstMatch}</p>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShare} size="lg" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  친구들에게 공유하기
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  메인으로 돌아가기
                </Button>
              </div>
              <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                📋 텍스트로 복사하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'animal_face_match') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl">{result.emoji}</div>
              <CardTitle className="text-3xl text-center">얼굴 분석 결과</CardTitle>
            </div>
            <div className="text-center">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                유사도 {result.similarity}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* 메인 결과 */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                {result.matchedAnimal}
              </h2>
              <p className="text-lg text-muted-foreground">
                AI가 당신의 얼굴을 분석한 결과입니다!
              </p>
            </div>

            {/* AI 이미지 생성 */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-800">🎨 AI가 그려본 당신과 닮은 동물</h3>
              <ImageGenerator 
                initialPrompt={`cute ${result.matchedAnimal}, kawaii style, adorable character illustration, friendly and approachable`}
                type="test_result"
                context={`animal_face_${result.matchedAnimal}`}
              />
            </div>

            {/* 얼굴 특징 분석 */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-800">🔍 얼굴 특징 분석</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">👀 눈</h4>
                  <p className="text-sm text-gray-700">{result.facialFeatures?.eyes}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">👃 코</h4>
                  <p className="text-sm text-gray-700">{result.facialFeatures?.nose}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">😊 얼굴형</h4>
                  <p className="text-sm text-gray-700">{result.facialFeatures?.face_shape}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">✨ 전체 인상</h4>
                  <p className="text-sm text-gray-700">{result.facialFeatures?.overall}</p>
                </div>
              </div>
            </div>

            {/* 동물 특성 */}
            <div>
              <h3 className="text-xl font-bold mb-4">🐾 이 동물의 특성</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold mb-3">성격</h4>
                  <div className="space-y-2">
                    {result.animalCharacteristics?.personality?.map((trait, index) => (
                      <Badge key={index} variant="secondary">{trait}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-3">강점</h4>
                  <div className="space-y-2">
                    {result.animalCharacteristics?.strengths?.map((strength, index) => (
                      <Badge key={index} variant="outline">{strength}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-3">서식지</h4>
                  <p className="text-sm text-muted-foreground">{result.animalCharacteristics?.habitat}</p>
                </div>
              </div>
            </div>

            {/* 재미있는 사실들 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-blue-800">🤔 재미있는 사실들</h3>
              <div className="space-y-3">
                {result.funFacts?.map((fact, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge className="bg-blue-600 text-white text-xs px-2 py-1 mt-1">{index + 1}</Badge>
                    <p className="text-blue-700">{fact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 호환성 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  잘 맞는 친구들
                </h4>
                <div className="space-y-2">
                  {result.compatibility?.friends?.map((friend, index) => (
                    <Badge key={index} className="bg-green-600 text-white mr-2">{friend}</Badge>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  라이벌 관계
                </h4>
                <div className="space-y-2">
                  {result.compatibility?.rivals?.map((rival, index) => (
                    <Badge key={index} variant="outline" className="border-red-300 text-red-700 mr-2">{rival}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 조언 */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 text-center">
              <h3 className="text-xl font-bold mb-3 text-purple-800">💫 이 동물처럼 살아보세요!</h3>
              <p className="text-purple-700 text-lg">{result.advice}</p>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShare} size="lg" className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  친구들에게 자랑하기
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  메인으로 돌아가기
                </Button>
              </div>
              <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                📋 텍스트로 복사하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'inner_animal') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-8 h-8" />
              <CardTitle className="text-3xl text-center">내면 동물 분석 결과</CardTitle>
            </div>
            <div className="text-center">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                매칭도 {result.personalityMatch}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* 메인 결과 */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {result.innerAnimal}
              </h2>
              <p className="text-lg text-muted-foreground">
                {result.animalType}
              </p>
            </div>

            {/* AI 이미지 생성 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-800">🎨 AI가 표현한 당신의 내면 동물</h3>
              <ImageGenerator 
                initialPrompt={`spiritual ${result.innerAnimal}, mystical aura, psychology visualization, ethereal and meaningful artwork`}
                type="test_result"
                context={`inner_animal_${result.innerAnimal}`}
              />
            </div>

            {/* 핵심 특성 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-800">🎯 당신의 핵심 특성</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold mb-2 text-green-700">주요 특성</h4>
                  <p className="text-sm">{result.coreTraits?.primary}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-2 text-blue-700">부차 특성</h4>
                  <p className="text-sm">{result.coreTraits?.secondary}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-2 text-purple-700">숨겨진 특성</h4>
                  <p className="text-sm">{result.coreTraits?.hidden}</p>
                </div>
              </div>
            </div>

            {/* 심리 분석 */}
            <div>
              <h3 className="text-xl font-bold mb-4">🧠 심리 분석</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h4 className="font-semibold mb-3 text-emerald-800">💪 강점</h4>
                  <div className="space-y-2">
                    {result.psychologicalAnalysis?.strengths?.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="block text-center">{strength}</Badge>
                    ))}
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="font-semibold mb-3 text-amber-800">🎯 동기</h4>
                  <div className="space-y-2">
                    {result.psychologicalAnalysis?.motivations?.map((motivation, index) => (
                      <Badge key={index} variant="outline" className="block text-center">{motivation}</Badge>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold mb-3 text-red-800">⚡ 과제</h4>
                  <div className="space-y-2">
                    {result.psychologicalAnalysis?.challenges?.map((challenge, index) => (
                      <Badge key={index} variant="destructive" className="block text-center text-xs">{challenge}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 라이프스타일 조언 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">💼 업무 환경</h4>
                <p className="text-blue-700 text-sm">{result.lifestyleAdvice?.workEnvironment}</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                <h4 className="font-bold text-pink-800 mb-2">👥 인간관계</h4>
                <p className="text-pink-700 text-sm">{result.lifestyleAdvice?.relationships}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                <h4 className="font-bold text-violet-800 mb-2">🧘 자기관리</h4>
                <p className="text-violet-700 text-sm">{result.lifestyleAdvice?.selfCare}</p>
              </div>
            </div>

            {/* 동물의 지혜 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold mb-4 text-amber-800">🦉 동물의 지혜</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">본능의 지혜</h4>
                  <p className="text-amber-700">{result.animalWisdom?.instincts}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">생존 전략</h4>
                  <p className="text-amber-700">{result.animalWisdom?.survival}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">성장 조언</h4>
                  <p className="text-amber-700">{result.animalWisdom?.evolution}</p>
                </div>
              </div>
            </div>

            {/* 현재 인생 단계 */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold mb-4 text-purple-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                인생 단계 분석
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">현재 단계</h4>
                  <p className="text-purple-700">{result.lifePhase?.current}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">다음 성장</h4>
                  <p className="text-purple-700">{result.lifePhase?.next}</p>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShare} size="lg" className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  지혜 공유하기
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다른 테스트 해보기
                </Button>
              </div>
              <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                📋 텍스트로 복사하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'grandma_relationship') {
    return <GrandmaRelationshipResult result={result} onRetake={handleRetry} />;
  }

  if (testType === 'grandpa_marriage') {
    return <GrandpaMarriageResult result={result} onRetake={handleRetry} />;
  }

  if (testType === 'mz_nagging') {
    return <MZNaggingResult result={result} onRetake={handleRetry} />;
  }

  // 조선시대 테스트 결과들
  if (testType === 'joseon_name') {
    return (
      <div className="space-y-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🏯 당신의 조선시대 이름 🏯
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">{result.joseonName}</h2>
              <p className="text-lg text-muted-foreground">{result.meaning}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">🏛️ 예상 신분</h3>
                <p>{result.status}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">💼 예상 직업</h3>
                <p>{result.job}</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">💡 현대 조언</h3>
              <p>{result.modernAdvice}</p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                공유하기
              </Button>
              <Button onClick={handleShareText} variant="outline">
                텍스트 공유
              </Button>
              <Button onClick={handleRetry} variant="default">
                다시 테스트
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'joseon_job') {
    return (
      <div className="space-y-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              👨‍💼 당신의 조선시대 직업 👩‍💼
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">{result.job}</h2>
              <p className="text-lg text-muted-foreground">{result.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">📋 주요 업무</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.duties?.map((duty: string, index: number) => (
                    <li key={index}>{duty}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">💰 예상 수입</h3>
                  <p>{result.salary}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">🏅 관직 품계</h3>
                  <p>{result.status}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">💡 현대 조언</h3>
                <p>{result.modernAdvice}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                공유하기
              </Button>
              <Button onClick={handleShareText} variant="outline">
                텍스트 공유
              </Button>
              <Button onClick={handleRetry} variant="default">
                다시 테스트
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'joseon_status') {
    return (
      <div className="space-y-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              👑 당신의 조선시대 신분 👑
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">{result.status}</h2>
              <p className="text-lg text-muted-foreground">{result.level}</p>
              <p className="mt-2">{result.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">🏅 신분 특권</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.privileges?.map((privilege: string, index: number) => (
                    <li key={index}>{privilege}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">🏠 생활 방식</h3>
                <p>{result.lifestyle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">🎯 현대 직업</h3>
                  <p>{result.modernEquivalent}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">📊 인구 비율</h3>
                  <p>{result.percentage}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">💡 현대 조언</h3>
                <p>{result.modernAdvice}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                공유하기
              </Button>
              <Button onClick={handleShareText} variant="outline">
                텍스트 공유
              </Button>
              <Button onClick={handleRetry} variant="default">
                다시 테스트
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 지혜 조언 테스트 결과
  if (testType === 'wisdom_advice') {
    // 안전한 기본값 설정
    const safeResult = {
      title: result?.title || '지혜로운 인생의 멘토 🌟',
      description: result?.description || '당신은 풍부한 인생 경험을 가진 분입니다.',
      advice: result?.advice || '당신의 경험과 지혜를 주변과 나누어 주세요.',
      funFact: result?.funFact || '당신같은 분이 있어서 세상이 더 따뜻해집니다!',
      recommendation: result?.recommendation || '오늘 하루 여유롭게 보내보세요.',
      scores: result?.scores || { family: 0, health: 0, wisdom: 0, experience: 0 },
      adviceType: result?.adviceType || 'wisdom'
    };

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl">🌟</div>
              <CardTitle className="text-3xl text-center">지혜 조언 테스트 결과</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* 메인 결과 */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {safeResult.title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {safeResult.description}
              </p>
            </div>

            {/* AI 이미지 생성 */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-800">🎨 당신을 표현한 AI 아트</h3>
              <ImageGenerator 
                initialPrompt={`wise elderly person giving advice, warm and caring expression, traditional Korean style, beautiful watercolor illustration`}
                type="test_result"
                context={`wisdom_advice_${safeResult.adviceType}`}
              />
            </div>

            {/* 인생 조언 */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                당신을 위한 특별한 조언
              </h3>
              <p className="text-orange-700 text-lg leading-relaxed">{safeResult.advice}</p>
            </div>

            {/* 재미있는 사실 */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="text-xl font-bold mb-3 text-yellow-800">✨ 특별한 메시지</h3>
              <p className="text-yellow-700 text-lg">{safeResult.funFact}</p>
            </div>

            {/* 오늘의 실천 방법 */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-bold mb-3 text-green-800">🌱 오늘의 실천 방법</h3>
              <p className="text-green-700 text-lg">{safeResult.recommendation}</p>
            </div>

            {/* 점수 차트 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📊 당신의 지혜 유형 분석</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-pink-100 flex items-center justify-center mb-2">
                    <Heart className="w-8 h-8 text-pink-600" />
                  </div>
                  <h4 className="font-semibold text-pink-800">가족사랑</h4>
                  <p className="text-2xl font-bold text-pink-600">{safeResult.scores.family}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800">건강관리</h4>
                  <p className="text-2xl font-bold text-green-600">{safeResult.scores.health}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <Crown className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800">지혜통찰</h4>
                  <p className="text-2xl font-bold text-blue-600">{safeResult.scores.wisdom}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-800">경험멘토</h4>
                  <p className="text-2xl font-bold text-purple-600">{safeResult.scores.experience}</p>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShare} size="lg" className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  소중한 사람들과 공유하기
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다른 테스트 해보기
                </Button>
              </div>
              <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                📋 텍스트로 복사하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'otrovert') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-indigo-200 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-8 h-8" />
                <CardTitle className="text-3xl text-center">오트로버트 성격 진단 결과</CardTitle>
              </div>
              <div className="text-center">
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                  점수: {result.score}점
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* 메인 결과 */}
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {result.personalityType}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {result.typeDescription}
                </p>
              </div>

              {/* 핵심 특성 */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-indigo-800 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  당신의 핵심 특성
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.characteristics?.map((char: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 bg-white/60 rounded-lg p-3">
                      <span className="text-lg">{char}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 강점 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-green-800 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {result.strengthsTitle}
                </h3>
                <div className="space-y-2">
                  {result.strengths?.map((strength: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 주의할 점 */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-orange-800 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {result.weaknessesTitle}
                </h3>
                <div className="space-y-2">
                  {result.weaknesses?.map((weakness: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">⚠</span>
                      <span className="text-gray-700">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 추천 사항 */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  나를 위한 추천
                </h3>
                <div className="space-y-2">
                  {result.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">💡</span>
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 공유 안내 */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-pink-800 flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    친구들과 비교해보세요!
                  </h3>
                  <p className="text-gray-700">
                    오트로버트는 MBTI처럼 친구들과 비교하면 더 재미있어요!<br />
                    나와 친구의 성격 차이를 발견하고 서로를 더 잘 이해할 수 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      #오트로버트
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      #성격테스트
                    </Badge>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                      #MBTI대안
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex flex-col gap-3 pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleShare} 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    친구들에게 공유하기
                  </Button>
                  <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    다른 테스트 해보기
                  </Button>
                </div>
                <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  📋 결과 텍스트로 복사하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}