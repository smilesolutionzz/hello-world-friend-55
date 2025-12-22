import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Sparkles, Shield, Users, Brain, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import InstagramAnalysisResult from "@/components/assessment/InstagramAnalysisResult";

type Step = "intro" | "input" | "demographics" | "analyzing" | "result";

interface AnalysisResult {
  unconsciousType: {
    name: string;
    englishName: string;
    icon: string;
    description: string;
  };
  profileSummary: string;
  visualPatterns: {
    colorPreference: string;
    compositionStyle: string;
    emotionalTone: string;
  };
  languagePatterns: {
    communicationStyle: string;
    emotionalExpression: string;
    selfPresentation: string;
  };
  unconsciousIndicators: {
    socialNeedLevel: number;
    selfExpressionLevel: number;
    authenticityLevel: number;
    stabilityLevel: number;
  };
  deepAnalysis: string;
  growthSuggestions: string[];
  relationshipPatterns: string;
  hiddenDesires: string;
}

const InstagramAnalysis = () => {
  const location = useLocation();
  const prefilledId = (location.state as { prefilledId?: string })?.prefilledId;
  
  const [step, setStep] = useState<Step>(prefilledId ? "input" : "intro");
  const [username, setUsername] = useState(prefilledId || "");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthYear, setBirthYear] = useState<number>(1990);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const { toast } = useToast();

  const unconsciousTypes = [
    { name: "거울에 갇힌 여왕", english: "The Queen Trapped in Her Mirror" },
    { name: "바지 벗고 춤추는 인형", english: "The Clown Dancing with No Pants" },
    { name: "줄 없이 춤추는 인형", english: "The Puppet Dancing Without Strings" },
    { name: "소원에 갇힌 요정", english: "The Fairy Trapped in Others' Wishes" },
    { name: "노래를 잃은 세이렌", english: "The Siren Who Forgot Her Song" },
    { name: "아무도 오지 않는 등대지기", english: "The Lighthouse Keeper No One Visits" },
    { name: "스스로 갇힌 탑의 마법사", english: "The Wizard Locked in His Own Tower" },
    { name: "왕관을 벗지 못하는 왕", english: "The King Who Cannot Remove His Crown" },
  ];

  const startAnalysis = async () => {
    setStep("analyzing");
    setAnalysisProgress(0);
    
    const progressSteps = [
      { progress: 15, text: "인스타그램 프로필 수집 중..." },
      { progress: 35, text: "시각적 패턴 분석 중..." },
      { progress: 55, text: "언어 패턴 분석 중..." },
      { progress: 75, text: "무의식 지표 도출 중..." },
      { progress: 90, text: "심층 분석 리포트 생성 중..." },
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysisProgress(step.progress);
      setProgressText(step.text);
    }

    try {
      const { data, error } = await supabase.functions.invoke('instagram-analyzer', {
        body: { 
          username: username.replace('@', ''),
          gender,
          birthYear,
        }
      });

      if (error) throw error;

      setAnalysisProgress(100);
      setProgressText("분석 완료!");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisResult(data);
      setStep("result");
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 실패",
        description: "프로필 분석 중 오류가 발생했습니다. 공개 계정인지 확인해주세요.",
        variant: "destructive"
      });
      setStep("input");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: "아이디 입력 필요",
        description: "인스타그램 아이디를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    setStep("demographics");
  };

  const handleDemographicsSubmit = () => {
    startAnalysis();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="p-4 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-black" />
                </div>
                <div>
                  <p className="font-bold text-lg">마음연구소</p>
                  <p className="text-xs text-amber-500">심리분석</p>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full mb-8">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-gray-300">AI 기반 무의식 분석</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                <span className="text-amber-500">무의식</span>의 8가지 얼굴
              </h1>
              <p className="text-gray-400 text-center mb-8">8 FACES OF THE SUBCONSCIOUS</p>

              {/* Type Cards */}
              <div className="grid grid-cols-4 gap-2 mb-12 max-w-lg">
                {unconsciousTypes.map((type, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-[3/4] bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2 flex flex-col items-center justify-center text-center border-2 border-amber-400"
                  >
                    <p className="text-[8px] text-gray-600 uppercase mb-1 leading-tight">{type.english}</p>
                    <p className="text-[10px] text-gray-800 font-medium">{type.name}</p>
                  </motion.div>
                ))}
              </div>

              <p className="text-gray-400 text-center mb-2">테스트 없이, <span className="text-white font-semibold">인스타그램 계정만 입력하세요.</span></p>
              <p className="text-gray-500 text-center mb-8">AI가 당신의 무의식 유형을 분석합니다.</p>

              <Button 
                onClick={() => setStep("input")}
                className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6 text-lg"
              >
                분석 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Stats & Trust */}
              <div className="mt-12 space-y-6 max-w-sm text-center">
                <p className="text-gray-400">
                  현재까지 <span className="text-amber-500 font-bold">182,649명</span>이 분석 완료
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">당신의 정보는 암호화 및 익명화 되어 100% 안전하게 보호됩니다</span>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="px-6 py-12 border-t border-white/10">
              <p className="text-amber-500 text-center text-sm mb-2">HOW IT WORKS</p>
              <h2 className="text-2xl font-bold text-center mb-8">
                어떻게 인스타그램으로<br />
                <span className="text-amber-500">무의식을 분석</span>하나요?
              </h2>

              <div className="space-y-4 max-w-md mx-auto">
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="text-2xl mb-2">📸</div>
                  <h3 className="text-amber-500 font-semibold mb-2">시각 패턴</h3>
                  <p className="text-gray-400 text-sm">색감, 구도, 필터, 표정이 드러내는 당신의 감정 상태와 내면의 욕구</p>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="text-2xl mb-2">✍️</div>
                  <h3 className="text-amber-500 font-semibold mb-2">언어 패턴</h3>
                  <p className="text-gray-400 text-sm">어조, 이모지, 문장 구조가 보여주는 사고방식과 감정 처리 방식</p>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="text-2xl mb-2">🔬</div>
                  <h3 className="text-amber-500 font-semibold mb-2">연구 기반</h3>
                  <p className="text-gray-400 text-sm">Carl Jung의 그림자 이론과 현대 심리학 모델을 기반으로 개발</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <div className="w-full max-w-sm">
              <h2 className="text-2xl font-bold text-center mb-2">인스타그램 계정 입력</h2>
              <p className="text-gray-400 text-center mb-8">공개 계정만 분석 가능합니다</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="instagram_id"
                    className="pl-10 bg-white/5 border-amber-500/30 focus:border-amber-500 h-14 text-lg"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6 text-lg"
                >
                  분석 시작하기
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("intro")}
                  className="w-full text-gray-400"
                >
                  돌아가기
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {step === "demographics" && (
          <motion.div
            key="demographics"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <div className="w-full max-w-sm">
              <h2 className="text-3xl font-bold text-center mb-2">하나만 더!</h2>
              <p className="text-gray-400 text-center mb-2">성별과 나이를 입력하면</p>
              <p className="text-center mb-8">
                <span className="text-amber-500 font-semibold">더 정확한 분석</span>이 가능해요
              </p>

              <div className="space-y-6">
                <div>
                  <p className="text-center text-gray-400 mb-3">성별</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={gender === "male" ? "default" : "outline"}
                      onClick={() => setGender("male")}
                      className={`py-6 text-lg ${gender === "male" ? "bg-amber-500 text-black" : "border-amber-500/30 text-white hover:bg-amber-500/10"}`}
                    >
                      남성
                    </Button>
                    <Button
                      type="button"
                      variant={gender === "female" ? "default" : "outline"}
                      onClick={() => setGender("female")}
                      className={`py-6 text-lg ${gender === "female" ? "bg-amber-500 text-black" : "border-amber-500/30 text-white hover:bg-amber-500/10"}`}
                    >
                      여성
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-center text-gray-400 mb-3">출생년도</p>
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(Number(e.target.value))}
                    className="w-full bg-white/5 border border-amber-500/30 rounded-lg px-4 py-4 text-white text-lg focus:border-amber-500 focus:outline-none"
                  >
                    {Array.from({ length: 60 }, (_, i) => 2010 - i).map(year => (
                      <option key={year} value={year} className="bg-gray-900">{year}년</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleDemographicsSubmit}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-6 text-lg"
                >
                  분석 시작하기
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={startAnalysis}
                  className="w-full text-gray-500"
                >
                  건너뛰기
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <div className="w-full max-w-sm text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              
              <p className="text-amber-500 font-semibold mb-2">@{username.replace('@', '')}</p>
              <h2 className="text-2xl font-bold mb-4">무의식의 8가지 얼굴</h2>
              <p className="text-gray-400 mb-8">당신의 숨겨진 무의식을 탐색 중</p>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <p className="text-amber-500 mb-6">{progressText}</p>

              {/* Testimonial */}
              <div className="bg-white/5 rounded-xl p-4 mt-8">
                <p className="text-gray-500 text-sm mb-2">생생한 사용자 리뷰</p>
                <p className="text-white font-medium mb-2">"진짜 소름 돋을 정도로 정확한 분석"</p>
                <p className="text-gray-500 text-sm">gooo***@gmail.com</p>
              </div>

              <p className="text-gray-500 mt-6 text-sm">무의식 패턴을 분석하고 있습니다...</p>
              <p className="text-amber-500 text-sm font-medium mt-2">1분만 기다리면 소름돋게 놀라운 결과를 볼 수 있습니다. 절대 나가지 마세요!</p>
            </div>
          </motion.div>
        )}

        {step === "result" && analysisResult && (
          <InstagramAnalysisResult 
            result={analysisResult} 
            username={username}
            onRestart={() => {
              setStep("intro");
              setUsername("");
              setGender(null);
              setAnalysisResult(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstagramAnalysis;
