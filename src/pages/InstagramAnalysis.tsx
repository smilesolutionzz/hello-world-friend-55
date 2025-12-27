import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Sparkles, Shield, Users, Brain, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import InstagramAnalysisResult from "@/components/assessment/InstagramAnalysisResult";

type Step = "intro" | "input" | "demographics" | "analyzing" | "result";

interface FeedAnalysisItem {
  index: number;
  insight: string;
  keyword: string;
}

interface AnalysisResult {
  unconsciousType: {
    name: string;
    englishName: string;
    icon: string;
    description: string;
  };
  profileSummary: string;
  feedImages?: string[];
  feedAnalysis?: FeedAnalysisItem[];
  visualPatterns: {
    colorPreference: string;
    compositionStyle: string;
    emotionalTone: string;
    dominantTheme?: string;
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
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [feedInsights, setFeedInsights] = useState<string[]>([]);
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

  // Real feed images will be fetched from the API
  const [realFeedImages, setRealFeedImages] = useState<string[]>([]);
  const [realInsights, setRealInsights] = useState<string[]>([]);

  const startAnalysis = async () => {
    setStep("analyzing");
    setAnalysisProgress(0);
    setCurrentFeedIndex(0);
    setFeedInsights([]);
    setRealFeedImages([]);
    setRealInsights([]);
    
    // Phase 1: Collecting profile - API 호출
    setProgressText("인스타그램 프로필 수집 중...");
    setAnalysisProgress(10);

    try {
      // Use RapidAPI-based analyzer for direct Instagram ID analysis
      const { data, error } = await supabase.functions.invoke('instagram-rapidapi', {
        body: { 
          username: username.replace('@', ''),
          gender,
          birthYear,
        }
      });

      if (error) throw error;

      // 피드 이미지가 없으면 실패 처리
      if (!data.feedImages || data.feedImages.length === 0) {
        toast({
          title: "피드 수집 실패",
          description: "인스타그램 피드를 가져올 수 없습니다. 공개 계정인지 확인하거나 잠시 후 다시 시도해주세요.",
          variant: "destructive"
        });
        setStep("input");
        return;
      }

      const images = data.feedImages;
      const feedAnalysisData = data.feedAnalysis || [];
      
      setRealFeedImages(images);
      setRealInsights(feedAnalysisData.map((item: FeedAnalysisItem) => item.insight));

      // Phase 2: Show feed images one by one with insights
      for (let i = 0; i < images.length; i++) {
        setCurrentFeedIndex(i);
        setProgressText(`피드 ${i + 1}/${images.length} 분석 중...`);
        setAnalysisProgress(15 + (i / images.length) * 50);
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        if (feedAnalysisData[i]?.insight) {
          setFeedInsights(prev => [...prev, feedAnalysisData[i].insight]);
        }
      }

      // Phase 3: Deep analysis
      setProgressText("무의식 패턴 도출 중...");
      setAnalysisProgress(70);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgressText("심층 분석 리포트 생성 중...");
      setAnalysisProgress(85);
      await new Promise(resolve => setTimeout(resolve, 500));

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
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">AIHPRO</p>
                  <p className="text-xs text-pink-400">피드 심리분석</p>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full mb-8">
                <Instagram className="h-4 w-4 text-pink-400" />
                <span className="text-sm text-gray-300">피드 기반 AI 분석</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">피드</span>가 말하는 <span className="text-pink-400">무의식</span>
              </h1>
              <p className="text-gray-400 text-center mb-8">FEED ANALYSIS × SHADOW PSYCHOLOGY</p>

              {/* Type Cards */}
              <div className="grid grid-cols-4 gap-2 mb-12 max-w-lg">
                {unconsciousTypes.map((type, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-[3/4] bg-gradient-to-br from-pink-50 to-purple-100 rounded-lg p-2 flex flex-col items-center justify-center text-center border-2 border-pink-400"
                  >
                    <p className="text-[8px] text-gray-600 uppercase mb-1 leading-tight">{type.english}</p>
                    <p className="text-[10px] text-gray-800 font-medium">{type.name}</p>
                  </motion.div>
                ))}
              </div>

              <p className="text-gray-400 text-center mb-2">아이디만 입력하면</p>
              <p className="text-white font-semibold text-center mb-2">피드 하나하나를 AI가 분석합니다</p>
              <p className="text-gray-500 text-center mb-8">사진 속에 숨겨진 당신의 무의식을 발견하세요</p>

              <Button 
                onClick={() => setStep("input")}
                className="w-full max-w-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-6 text-lg"
              >
                피드 분석 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Stats & Trust */}
              <div className="mt-12 space-y-6 max-w-sm text-center">
                <p className="text-gray-400">
                  현재까지 <span className="text-pink-400 font-bold">182,649명</span>이 분석 완료
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">공개 계정의 피드만 분석됩니다</span>
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
                    className="pl-10 bg-white/5 border-pink-500/30 focus:border-pink-500 h-14 text-lg"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-6 text-lg"
                >
                  다음
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
                <span className="text-pink-400 font-semibold">더 정확한 분석</span>이 가능해요
              </p>

              <div className="space-y-6">
                <div>
                  <p className="text-center text-gray-400 mb-3">성별</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={gender === "male" ? "default" : "outline"}
                      onClick={() => setGender("male")}
                      className={`py-6 text-lg ${gender === "male" ? "bg-pink-500 text-white" : "border-pink-500/30 text-white hover:bg-pink-500/10"}`}
                    >
                      남성
                    </Button>
                    <Button
                      type="button"
                      variant={gender === "female" ? "default" : "outline"}
                      onClick={() => setGender("female")}
                      className={`py-6 text-lg ${gender === "female" ? "bg-pink-500 text-white" : "border-pink-500/30 text-white hover:bg-pink-500/10"}`}
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
                    className="w-full bg-white/5 border border-pink-500/30 rounded-lg px-4 py-4 text-white text-lg focus:border-pink-500 focus:outline-none"
                  >
                    {Array.from({ length: 60 }, (_, i) => 2010 - i).map(year => (
                      <option key={year} value={year} className="bg-gray-900">{year}년</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleDemographicsSubmit}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-6 text-lg"
                >
                  피드 분석 시작
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
            className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
          >
            <div className="w-full max-w-md text-center">
              {/* Profile Header */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-pink-400 font-semibold">@{username.replace('@', '')}</p>
                  <p className="text-gray-500 text-sm">피드 분석 중</p>
                </div>
              </div>
              
              {/* Feed Gallery with Current Analysis */}
              <div className="relative mb-6">
                {/* Current Feed Image */}
                {realFeedImages.length > 0 ? (
                  <motion.div
                    key={currentFeedIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-pink-500/30"
                  >
                    <img
                      src={realFeedImages[currentFeedIndex]}
                      alt={`Feed ${currentFeedIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Scanning Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-pink-500/20 to-purple-600/20"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    
                    {/* Scanning Line */}
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Feed Number Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 rounded-full text-sm">
                      <span className="text-pink-400">{currentFeedIndex + 1}</span>
                      <span className="text-gray-400">/{realFeedImages.length}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-600/10 flex items-center justify-center">
                    <div className="text-center">
                      <Instagram className="h-12 w-12 text-pink-400 mx-auto mb-3 animate-pulse" />
                      <p className="text-gray-400 text-sm">피드 수집 중...</p>
                    </div>
                  </div>
                )}

                {/* Thumbnails */}
                {realFeedImages.length > 0 && (
                  <div className="flex gap-2 mt-4 justify-center overflow-x-auto">
                    {realFeedImages.map((img, idx) => (
                      <motion.div
                        key={idx}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                          idx === currentFeedIndex ? 'border-pink-500' : 
                          idx < currentFeedIndex ? 'border-green-500/50 opacity-70' : 'border-white/10 opacity-40'
                        }`}
                        animate={idx === currentFeedIndex ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {idx < currentFeedIndex && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <span className="text-green-400 text-xs">✓</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Insight */}
              <AnimatePresence mode="wait">
                {feedInsights[currentFeedIndex] && (
                  <motion.div
                    key={currentFeedIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-xl p-4 mb-6"
                  >
                    <p className="text-white text-sm leading-relaxed">
                      "{feedInsights[currentFeedIndex]}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <p className="text-pink-400 font-medium mb-2">{progressText}</p>
              <p className="text-gray-500 text-sm">{analysisProgress}% 완료</p>

              {/* Warning */}
              <div className="mt-8 p-4 bg-gradient-to-r from-pink-500/5 to-purple-600/5 rounded-xl border border-pink-500/10">
                <p className="text-pink-300 text-sm font-medium">⚠️ 분석 중 페이지를 벗어나지 마세요!</p>
                <p className="text-gray-500 text-xs mt-1">잠시만 기다리시면 놀라운 결과를 보실 수 있습니다</p>
              </div>
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
              setFeedInsights([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstagramAnalysis;
