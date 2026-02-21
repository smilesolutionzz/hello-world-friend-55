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
import OtrovertResult from "./OtrovertResult";
import LifeAchievementResult from "./LifeAchievementResult";
import ParentChildPlayResult from "./ParentChildPlayResult";
import { PersonalizedProductRecommendation } from "@/components/product/PersonalizedProductRecommendation";
import { useLanguage } from "@/i18n/LanguageContext";

export default function FunTestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { shareAsText } = useShareText();
  const { isEnglish } = useLanguage();
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
      const shareText = `${getShareTitle()}\n${getShareText()}\n${window.location.href}`;
      navigator.clipboard.writeText(shareText);
      toast({
        title: isEnglish ? "Link copied!" : "링크 복사됨!",
        description: isEnglish ? "Results copied to clipboard." : "클립보드에 결과가 복사되었습니다."
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
        return isEnglish ? `My past life was ${result?.pastLifeJob}! 🏺` : `나의 전생은 ${result?.pastLifeJob}! 🏺`;
      case 'animal_face_match':
        return isEnglish ? `I look like a ${result?.matchedAnimal}! ${result?.emoji || '🐾'}` : `내 얼굴은 ${result?.matchedAnimal} 닮음! ${result?.emoji || '🐾'}`;
      case 'inner_animal':
        return isEnglish ? `My inner animal is ${result?.innerAnimal}! 🦋` : `내 내면은 ${result?.innerAnimal}! 🦋`;
      case 'otrovert':
        return isEnglish ? `I'm a ${result?.personalityType}! 🎭` : `나는 ${result?.personalityType}! 🎭`;
      case 'joseon_name':
        return `내 조선시대 이름은 ${result?.joseonName}! 🏯`;
      case 'joseon_job':
        return `내 조선시대 직업은 ${result?.job}! 👨‍💼`;
      case 'joseon_status':
        return `내 조선시대 신분은 ${result?.status}! 👑`;
      case 'grandma_relationship':
        return isEnglish ? `Grandma diagnosed our relationship! 👵` : `할머니가 우리 연애를 진단했다! 👵`;
      case 'wisdom_advice':
        return `${result?.title} 🌟`;
      default:
        return isEnglish ? "Fun Test Results!" : "재미있는 테스트 결과!";
    }
  };

  const getShareText = () => {
    switch (testType) {
      case 'past_life_job':
        return `${result?.era}에 ${result?.pastLifeJob}이었던 나! ${result?.modernConnection}`;
      case 'animal_face_match':
        return isEnglish 
          ? `AI analysis shows ${result?.similarity}% similarity to ${result?.matchedAnimal}! ${result?.advice}`
          : `AI가 분석한 결과 ${result?.similarity}% 유사도로 ${result?.matchedAnimal}과 닮았다고! ${result?.advice}`;
      case 'inner_animal':
        return isEnglish
          ? `My inner animal is ${result?.innerAnimal}! Match: ${result?.personalityMatch}%`
          : `심리 분석 결과 내 내면은 ${result?.innerAnimal}! 매칭도 ${result?.personalityMatch}%`;
      case 'otrovert':
        return isEnglish
          ? `Otrovert score: ${result?.score}! Discover my true personality between extrovert and introvert!`
          : `오트로버트 점수 ${result?.score}점! 외향과 내향 사이의 나만의 성격을 발견했어요.`;
      case 'grandma_relationship':
        return `궁합 점수 ${result?.compatibility_score}점! "${result?.grandma_verdict}"`;
      case 'wisdom_advice':
        return `${result?.description} ${result?.funFact}`;
      default:
        return isEnglish ? "Try this test too!" : "나도 테스트 해보러 가기!";
    }
  };

  const t = {
    noResult: isEnglish ? "Results not found." : "결과를 찾을 수 없습니다.",
    goHome: isEnglish ? "Go to Home" : "메인으로 돌아가기",
    shareWithFriends: isEnglish ? "Share with Friends" : "친구들에게 공유하기",
    retakeTest: isEnglish ? "Retake Test" : "다시 테스트하기",
    copyAsText: isEnglish ? "📋 Copy as Text" : "📋 텍스트로 복사하기",
    share: isEnglish ? "Share" : "공유하기",
    shareText: isEnglish ? "Copy Text" : "텍스트 공유",
    retake: isEnglish ? "Retake" : "다시 테스트",
    personalityAnalysis: isEnglish ? "Personality Analysis" : "성격 분석",
    pastLifeAbilities: isEnglish ? "Past Life Special Abilities" : "전생의 특별한 능력",
    pastLifeStory: isEnglish ? "Past Life Story" : "전생의 이야기",
    modernConnection: isEnglish ? "Connection to Present" : "현재와의 연결점",
    wisdomFromPastLife: isEnglish ? "Wisdom from Past Life" : "전생에서 얻는 지혜",
    bestMatch: isEnglish ? "Best Career Match" : "잘 맞는 현재 직업",
    worstMatch: isEnglish ? "Careers to Avoid" : "피해야 할 직업",
    aiPastLife: isEnglish ? "🎨 AI Illustration of Your Past Life" : "🎨 AI가 그려본 당신의 전생",
    faceAnalysis: isEnglish ? "Face Analysis Results" : "얼굴 분석 결과",
    aiAnimalFace: isEnglish ? "🎨 AI Drawing of Your Animal Match" : "🎨 AI가 그려본 당신과 닮은 동물",
    facialFeatures: isEnglish ? "🔍 Facial Feature Analysis" : "🔍 얼굴 특징 분석",
    animalTraits: isEnglish ? "🐾 Animal Characteristics" : "🐾 이 동물의 특성",
    funFacts: isEnglish ? "🤔 Fun Facts" : "🤔 재미있는 사실들",
    goodFriends: isEnglish ? "Best Friends" : "잘 맞는 친구들",
    rivals: isEnglish ? "Rivals" : "라이벌 관계",
    livelikeAnimal: isEnglish ? "💫 Live Like This Animal!" : "💫 이 동물처럼 살아보세요!",
    innerAnimalResult: isEnglish ? "Inner Animal Analysis" : "내면 동물 분석 결과",
    aiInnerAnimal: isEnglish ? "🎨 AI Expression of Your Inner Animal" : "🎨 AI가 표현한 당신의 내면 동물",
    coreTraits: isEnglish ? "🎯 Your Core Traits" : "🎯 당신의 핵심 특성",
    psychAnalysis: isEnglish ? "🧠 Psychological Analysis" : "🧠 심리 분석",
    strengths: isEnglish ? "💪 Strengths" : "💪 강점",
    motivations: isEnglish ? "🎯 Motivations" : "🎯 동기",
    challenges: isEnglish ? "⚡ Challenges" : "⚡ 과제",
    workEnv: isEnglish ? "💼 Work Environment" : "💼 업무 환경",
    relationships: isEnglish ? "👥 Relationships" : "👥 인간관계",
    selfCare: isEnglish ? "🧘 Self-Care" : "🧘 자기관리",
    animalWisdom: isEnglish ? "🦉 Animal Wisdom" : "🦉 동물의 지혜",
    lifePhase: isEnglish ? "Life Phase Analysis" : "인생 단계 분석",
    primaryTrait: isEnglish ? "Primary Trait" : "주요 특성",
    secondaryTrait: isEnglish ? "Secondary Trait" : "부차 특성",
    hiddenTrait: isEnglish ? "Hidden Trait" : "숨겨진 특성",
    instincts: isEnglish ? "Instinct Wisdom" : "본능의 지혜",
    survival: isEnglish ? "Survival Strategy" : "생존 전략",
    growth: isEnglish ? "Growth Advice" : "성장 조언",
    currentPhase: isEnglish ? "Current Phase" : "현재 단계",
    nextGrowth: isEnglish ? "Next Growth" : "다음 성장",
    personality: isEnglish ? "Personality" : "성격",
    habitat: isEnglish ? "Habitat" : "서식지",
    wisdomTitle: isEnglish ? "Wisdom Advice Test Results" : "지혜 조언 테스트 결과",
    aiArt: isEnglish ? "🎨 AI Art of You" : "🎨 당신을 표현한 AI 아트",
    specialAdvice: isEnglish ? "Special Advice for You" : "당신을 위한 특별한 조언",
    specialMessage: isEnglish ? "✨ Special Message" : "✨ 특별한 메시지",
    todaysPractice: isEnglish ? "🌱 Today's Practice" : "🌱 오늘의 실천 방법",
    wisdomTypeAnalysis: isEnglish ? "📊 Your Wisdom Type Analysis" : "📊 당신의 지혜 유형 분석",
    familyLove: isEnglish ? "Family Love" : "가족사랑",
    healthCare: isEnglish ? "Health" : "건강관리",
    wisdomInsight: isEnglish ? "Wisdom" : "지혜통찰",
    experienceMentor: isEnglish ? "Experience" : "경험멘토",
    shareWithLoved: isEnglish ? "Share with Loved Ones" : "소중한 사람들과 공유하기",
    tryOtherTest: isEnglish ? "Try Another Test" : "다른 테스트 해보기",
  };

  if (!result || !testType) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground mb-4">{t.noResult}</p>
            <Button onClick={() => navigate('/')}>{t.goHome}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'past_life_job') {
    return (
      <div className="container mx-auto p-6 max-w-4xl pb-32">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8" />
              <CardTitle className="text-3xl text-center">
                {isEnglish ? 'Past Life Job Analysis' : '전생 직업 분석 결과'}
              </CardTitle>
            </div>
            <div className="text-center">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">{result.era}</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {result.pastLifeJob}
              </h2>
              <p className="text-lg text-muted-foreground">{result.description}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-purple-800">{t.aiPastLife}</h3>
              <ImageGenerator initialPrompt={`${result.pastLifeJob} in ${result.era}, ${result.description}, professional historical illustration, detailed artwork`} type="test_result" context={`past_life_job_${result.pastLifeJob}`} />
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                {t.personalityAnalysis}
              </h3>
              <p className="text-gray-700">{result.personality}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">✨ {t.pastLifeAbilities}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.abilities?.map((ability: string, index: number) => (
                  <Badge key={index} variant="outline" className="p-3 text-center justify-center">{ability}</Badge>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold mb-3 text-amber-800">📜 {t.pastLifeStory}</h3>
              <p className="text-amber-700 leading-relaxed">{result.lifestory}</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold mb-3 text-blue-800">🔗 {t.modernConnection}</h3>
              <p className="text-blue-700">{result.modernConnection}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-bold mb-3 text-green-800">💡 {t.wisdomFromPastLife}</h3>
              <p className="text-green-700">{result.advice}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-2">✅ {t.bestMatch}</h4>
                <p className="text-emerald-700">{result.compatibility?.bestMatch}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-2">❌ {t.worstMatch}</h4>
                <p className="text-red-700">{result.compatibility?.worstMatch}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShare} size="lg" className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <Share2 className="w-5 h-5 mr-2" />
                  {t.shareWithFriends}
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1 border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  {t.retakeTest}
                </Button>
              </div>
              <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full bg-white border-2 border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md">
                <Copy className="w-5 h-5 mr-2" />
                {t.copyAsText}
              </Button>
            </div>
          </CardContent>
        </Card>
        <PersonalizedProductRecommendation testType="past_life_job" testResult={result} />
      </div>
    );
  }

  if (testType === 'animal_face_match') {
    return (
      <div className="container mx-auto p-6 max-w-4xl pb-32">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl">{result.emoji}</div>
              <CardTitle className="text-3xl text-center">{t.faceAnalysis}</CardTitle>
            </div>
            <div className="text-center">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                {isEnglish ? `Similarity ${result.similarity}%` : `유사도 ${result.similarity}%`}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">{result.matchedAnimal}</h2>
              <p className="text-lg text-muted-foreground">
                {isEnglish ? "AI analyzed your face and here are the results!" : "AI가 당신의 얼굴을 분석한 결과입니다!"}
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-800">{t.aiAnimalFace}</h3>
              <ImageGenerator initialPrompt={`cute ${result.matchedAnimal}, kawaii style, adorable character illustration, friendly and approachable`} type="test_result" context={`animal_face_${result.matchedAnimal}`} />
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-800">{t.facialFeatures}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><h4 className="font-semibold mb-2">👀 {isEnglish ? 'Eyes' : '눈'}</h4><p className="text-sm text-gray-700">{result.facialFeatures?.eyes}</p></div>
                <div><h4 className="font-semibold mb-2">👃 {isEnglish ? 'Nose' : '코'}</h4><p className="text-sm text-gray-700">{result.facialFeatures?.nose}</p></div>
                <div><h4 className="font-semibold mb-2">😊 {isEnglish ? 'Face Shape' : '얼굴형'}</h4><p className="text-sm text-gray-700">{result.facialFeatures?.face_shape}</p></div>
                <div><h4 className="font-semibold mb-2">✨ {isEnglish ? 'Overall' : '전체 인상'}</h4><p className="text-sm text-gray-700">{result.facialFeatures?.overall}</p></div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">{t.animalTraits}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold mb-3">{t.personality}</h4>
                  <div className="space-y-2">{result.animalCharacteristics?.personality?.map((trait: string, index: number) => <Badge key={index} variant="secondary">{trait}</Badge>)}</div>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-3">{t.strengths}</h4>
                  <div className="space-y-2">{result.animalCharacteristics?.strengths?.map((s: string, i: number) => <Badge key={i} variant="outline">{s}</Badge>)}</div>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-3">{t.habitat}</h4>
                  <p className="text-sm text-muted-foreground">{result.animalCharacteristics?.habitat}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-blue-800">{t.funFacts}</h3>
              <div className="space-y-3">
                {result.funFacts?.map((fact: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge className="bg-blue-600 text-white text-xs px-2 py-1 mt-1">{index + 1}</Badge>
                    <p className="text-blue-700">{fact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2"><Users className="w-4 h-4" />{t.goodFriends}</h4>
                <div className="space-y-2">{result.compatibility?.friends?.map((f: string, i: number) => <Badge key={i} className="bg-green-600 text-white mr-2">{f}</Badge>)}</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2"><Star className="w-4 h-4" />{t.rivals}</h4>
                <div className="space-y-2">{result.compatibility?.rivals?.map((r: string, i: number) => <Badge key={i} variant="outline" className="border-red-300 text-red-700 mr-2">{r}</Badge>)}</div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 text-center">
              <h3 className="text-xl font-bold mb-3 text-purple-800">{t.livelikeAnimal}</h3>
              <p className="text-purple-700 text-lg">{result.advice}</p>
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShare} size="lg" className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <Share2 className="w-5 h-5 mr-2" />{t.shareWithFriends}
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1 border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50">
                  <RotateCcw className="w-5 h-5 mr-2" />{t.retakeTest}
                </Button>
              </div>
              <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full bg-white border-2 border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md">
                <Copy className="w-5 h-5 mr-2" />{t.copyAsText}
              </Button>
            </div>
          </CardContent>
        </Card>
        <PersonalizedProductRecommendation testType="animal_face_match" testResult={result} />
      </div>
    );
  }

  if (testType === 'inner_animal') {
    return (
      <div className="container mx-auto p-6 max-w-4xl pb-32">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-8 h-8" />
              <CardTitle className="text-3xl text-center">{t.innerAnimalResult}</CardTitle>
            </div>
            <div className="text-center">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                {isEnglish ? `Match ${result.personalityMatch}%` : `매칭도 ${result.personalityMatch}%`}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{result.innerAnimal}</h2>
              <p className="text-lg text-muted-foreground">{result.animalType}</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-800">{t.aiInnerAnimal}</h3>
              <ImageGenerator initialPrompt={`spiritual ${result.innerAnimal}, mystical aura, psychology visualization, ethereal and meaningful artwork`} type="test_result" context={`inner_animal_${result.innerAnimal}`} />
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-800">{t.coreTraits}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center"><h4 className="font-semibold mb-2 text-green-700">{t.primaryTrait}</h4><p className="text-sm">{result.coreTraits?.primary}</p></div>
                <div className="text-center"><h4 className="font-semibold mb-2 text-blue-700">{t.secondaryTrait}</h4><p className="text-sm">{result.coreTraits?.secondary}</p></div>
                <div className="text-center"><h4 className="font-semibold mb-2 text-purple-700">{t.hiddenTrait}</h4><p className="text-sm">{result.coreTraits?.hidden}</p></div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">{t.psychAnalysis}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h4 className="font-semibold mb-3 text-emerald-800">{t.strengths}</h4>
                  <div className="space-y-2">{result.psychologicalAnalysis?.strengths?.map((s: string, i: number) => <Badge key={i} variant="secondary" className="block text-center">{s}</Badge>)}</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="font-semibold mb-3 text-amber-800">{t.motivations}</h4>
                  <div className="space-y-2">{result.psychologicalAnalysis?.motivations?.map((m: string, i: number) => <Badge key={i} variant="outline" className="block text-center">{m}</Badge>)}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold mb-3 text-red-800">{t.challenges}</h4>
                  <div className="space-y-2">{result.psychologicalAnalysis?.challenges?.map((c: string, i: number) => <Badge key={i} variant="destructive" className="block text-center text-xs">{c}</Badge>)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200"><h4 className="font-bold text-blue-800 mb-2">{t.workEnv}</h4><p className="text-blue-700 text-sm">{result.lifestyleAdvice?.workEnvironment}</p></div>
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-200"><h4 className="font-bold text-pink-800 mb-2">{t.relationships}</h4><p className="text-pink-700 text-sm">{result.lifestyleAdvice?.relationships}</p></div>
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-200"><h4 className="font-bold text-violet-800 mb-2">{t.selfCare}</h4><p className="text-violet-700 text-sm">{result.lifestyleAdvice?.selfCare}</p></div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-xl font-bold mb-4 text-amber-800">{t.animalWisdom}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><h4 className="font-semibold mb-2">{t.instincts}</h4><p className="text-amber-700">{result.animalWisdom?.instincts}</p></div>
                <div><h4 className="font-semibold mb-2">{t.survival}</h4><p className="text-amber-700">{result.animalWisdom?.survival}</p></div>
                <div><h4 className="font-semibold mb-2">{t.growth}</h4><p className="text-amber-700">{result.animalWisdom?.evolution}</p></div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold mb-4 text-purple-800 flex items-center gap-2"><Calendar className="w-5 h-5" />{t.lifePhase}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><h4 className="font-semibold mb-2">{t.currentPhase}</h4><p className="text-purple-700">{result.lifePhase?.current}</p></div>
                <div><h4 className="font-semibold mb-2">{t.nextGrowth}</h4><p className="text-purple-700">{result.lifePhase?.next}</p></div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShare} size="lg" className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <Share2 className="w-5 h-5 mr-2" />{t.shareWithFriends}
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1 border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50">
                  <RotateCcw className="w-5 h-5 mr-2" />{t.retakeTest}
                </Button>
              </div>
              <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full bg-white border-2 border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md">
                <Copy className="w-5 h-5 mr-2" />{t.copyAsText}
              </Button>
            </div>
          </CardContent>
        </Card>
        <PersonalizedProductRecommendation testType="inner_animal" testResult={result} />
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

  if (testType === 'joseon_name') {
    return (
      <div className="space-y-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🏯 {isEnglish ? 'Your Joseon Dynasty Name' : '당신의 조선시대 이름'} 🏯
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">{result.joseonName}</h2>
              <p className="text-lg text-muted-foreground">{result.meaning}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">🏛️ {isEnglish ? 'Expected Status' : '예상 신분'}</h3><p>{result.status}</p></div>
              <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">💼 {isEnglish ? 'Expected Job' : '예상 직업'}</h3><p>{result.job}</p></div>
            </div>
            <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">💡 {isEnglish ? 'Modern Advice' : '현대 조언'}</h3><p>{result.modernAdvice}</p></div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2"><Share2 className="h-4 w-4" />{t.share}</Button>
              <Button onClick={handleShareText} variant="outline">{t.shareText}</Button>
              <Button onClick={handleRetry} variant="default">{t.retake}</Button>
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
              👨‍💼 {isEnglish ? 'Your Joseon Dynasty Job' : '당신의 조선시대 직업'} 👩‍💼
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">{result.job}</h2>
              <p className="text-lg text-muted-foreground">{result.description}</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">📋 {isEnglish ? 'Main Duties' : '주요 업무'}</h3>
                <ul className="list-disc list-inside space-y-1">{result.duties?.map((duty: string, index: number) => <li key={index}>{duty}</li>)}</ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">💰 {isEnglish ? 'Expected Income' : '예상 수입'}</h3><p>{result.salary}</p></div>
                <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">🏅 {isEnglish ? 'Official Rank' : '관직 품계'}</h3><p>{result.status}</p></div>
              </div>
              <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">💡 {isEnglish ? 'Modern Advice' : '현대 조언'}</h3><p>{result.modernAdvice}</p></div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2"><Share2 className="h-4 w-4" />{t.share}</Button>
              <Button onClick={handleShareText} variant="outline">{t.shareText}</Button>
              <Button onClick={handleRetry} variant="default">{t.retake}</Button>
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
              👑 {isEnglish ? 'Your Joseon Dynasty Status' : '당신의 조선시대 신분'} 👑
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
                <h3 className="font-semibold mb-2">🏅 {isEnglish ? 'Status Privileges' : '신분 특권'}</h3>
                <ul className="list-disc list-inside space-y-1">{result.privileges?.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
              </div>
              <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">🏠 {isEnglish ? 'Lifestyle' : '생활 방식'}</h3><p>{result.lifestyle}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">🎯 {isEnglish ? 'Modern Equivalent' : '현대 직업'}</h3><p>{result.modernEquivalent}</p></div>
                <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">📊 {isEnglish ? 'Population %' : '인구 비율'}</h3><p>{result.percentage}</p></div>
              </div>
              <div className="p-4 bg-muted rounded-lg"><h3 className="font-semibold mb-2">💡 {isEnglish ? 'Modern Advice' : '현대 조언'}</h3><p>{result.modernAdvice}</p></div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2"><Share2 className="h-4 w-4" />{t.share}</Button>
              <Button onClick={handleShareText} variant="outline">{t.shareText}</Button>
              <Button onClick={handleRetry} variant="default">{t.retake}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testType === 'wisdom_advice') {
    const safeResult = {
      title: result?.title || (isEnglish ? 'Wise Life Mentor 🌟' : '지혜로운 인생의 멘토 🌟'),
      description: result?.description || (isEnglish ? 'You have rich life experience.' : '당신은 풍부한 인생 경험을 가진 분입니다.'),
      advice: result?.advice || (isEnglish ? 'Share your experience and wisdom with those around you.' : '당신의 경험과 지혜를 주변과 나누어 주세요.'),
      funFact: result?.funFact || (isEnglish ? 'The world is warmer because of people like you!' : '당신같은 분이 있어서 세상이 더 따뜻해집니다!'),
      recommendation: result?.recommendation || (isEnglish ? 'Take it easy today.' : '오늘 하루 여유롭게 보내보세요.'),
      scores: result?.scores || { family: 0, health: 0, wisdom: 0, experience: 0 },
      adviceType: result?.adviceType || 'wisdom'
    };

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl">🌟</div>
              <CardTitle className="text-3xl text-center">{t.wisdomTitle}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{safeResult.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{safeResult.description}</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-800">{t.aiArt}</h3>
              <ImageGenerator initialPrompt={`wise elderly person giving advice, warm and caring expression, traditional Korean style, beautiful watercolor illustration`} type="test_result" context={`wisdom_advice_${safeResult.adviceType}`} />
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-800 flex items-center gap-2"><MessageCircle className="w-5 h-5" />{t.specialAdvice}</h3>
              <p className="text-orange-700 text-lg leading-relaxed">{safeResult.advice}</p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="text-xl font-bold mb-3 text-yellow-800">{t.specialMessage}</h3>
              <p className="text-yellow-700 text-lg">{safeResult.funFact}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-bold mb-3 text-green-800">{t.todaysPractice}</h3>
              <p className="text-green-700 text-lg">{safeResult.recommendation}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">{t.wisdomTypeAnalysis}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-pink-100 flex items-center justify-center mb-2"><Heart className="w-8 h-8 text-pink-600" /></div>
                  <h4 className="font-semibold text-pink-800">{t.familyLove}</h4>
                  <p className="text-2xl font-bold text-pink-600">{safeResult.scores.family}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2"><Star className="w-8 h-8 text-green-600" /></div>
                  <h4 className="font-semibold text-green-800">{t.healthCare}</h4>
                  <p className="text-2xl font-bold text-green-600">{safeResult.scores.health}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2"><Crown className="w-8 h-8 text-blue-600" /></div>
                  <h4 className="font-semibold text-blue-800">{t.wisdomInsight}</h4>
                  <p className="text-2xl font-bold text-blue-600">{safeResult.scores.wisdom}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-2"><Users className="w-8 h-8 text-purple-600" /></div>
                  <h4 className="font-semibold text-purple-800">{t.experienceMentor}</h4>
                  <p className="text-2xl font-bold text-purple-600">{safeResult.scores.experience}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShare} size="lg" className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                  <Share2 className="w-4 h-4 mr-2" />{t.shareWithLoved}
                </Button>
                <Button onClick={handleRetry} variant="outline" size="lg" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />{t.tryOtherTest}
                </Button>
              </div>
              <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full">
                <Copy className="w-4 h-4 mr-2" />{t.copyAsText}
              </Button>
            </div>
          </CardContent>
        </Card>
        <PersonalizedProductRecommendation testType="wisdom_advice" testResult={safeResult} />
      </div>
    );
  }

  if (testType === 'otrovert') {
    return <OtrovertResult result={result} onShare={handleShare} onRetry={handleRetry} onShareText={handleShareText} />;
  }

  if (testType === 'life_achievement') {
    return <LifeAchievementResult result={result} onRestart={handleRetry} />;
  }

  if (testType === 'parent_child_play') {
    return <ParentChildPlayResult result={result} />;
  }

  return null;
}
