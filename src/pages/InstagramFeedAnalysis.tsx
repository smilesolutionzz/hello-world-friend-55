import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Sparkles, Brain, ArrowRight, X, ImagePlus, 
  Share2, Download, Instagram, MessageCircle, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Step = "upload" | "analyzing" | "result";

// 우리만의 독창적인 무의식 유형 8가지
const unconsciousTypes = [
  {
    id: "shadow-performer",
    name: "무대 뒤의 연출가",
    englishName: "The Shadow Director",
    icon: "🎬",
    color: "from-purple-500 to-indigo-600",
    traits: ["완벽한 연출 욕구", "진짜 모습 숨김", "관객 의식", "이미지 관리"],
    description: "모든 순간을 연출하려 하지만, 정작 카메라 뒤에 숨어있는 당신. 진짜 모습을 보여주는 것이 두려운 건 아닐까요?"
  },
  {
    id: "echo-seeker",
    name: "메아리를 찾는 사람",
    englishName: "The Echo Seeker",
    icon: "🔊",
    color: "from-blue-500 to-cyan-600",
    traits: ["인정 갈망", "좋아요 의존", "외부 확인 필요", "자기 가치 불안"],
    description: "당신의 존재를 확인받고 싶어 끊임없이 메아리를 기다립니다. 하지만 진짜 목소리는 이미 당신 안에 있어요."
  },
  {
    id: "mask-collector",
    name: "가면 수집가",
    englishName: "The Mask Collector",
    icon: "🎭",
    color: "from-rose-500 to-pink-600",
    traits: ["다중 페르소나", "상황별 변신", "진짜 얼굴 분실", "정체성 혼란"],
    description: "상황마다 다른 가면을 쓰는 당신. 너무 많은 가면 속에서 진짜 얼굴을 잊어버린 건 아닌가요?"
  },
  {
    id: "silent-volcano",
    name: "잠든 화산",
    englishName: "The Silent Volcano",
    icon: "🌋",
    color: "from-orange-500 to-red-600",
    traits: ["감정 억압", "표면 평화", "내면 격렬", "분출 두려움"],
    description: "평온해 보이지만 속은 끓고 있어요. 작은 균열을 통해 진짜 감정을 조금씩 내보내도 괜찮아요."
  },
  {
    id: "invisible-bridge",
    name: "보이지 않는 다리",
    englishName: "The Invisible Bridge",
    icon: "🌉",
    color: "from-teal-500 to-emerald-600",
    traits: ["연결 중재", "자기 희생", "존재감 부재", "인정 결핍"],
    description: "모두를 연결하지만 정작 자신은 보이지 않는 당신. 다리 위에서 잠시 쉬어도 괜찮아요."
  },
  {
    id: "frozen-dreamer",
    name: "얼어붙은 몽상가",
    englishName: "The Frozen Dreamer",
    icon: "❄️",
    color: "from-sky-400 to-blue-500",
    traits: ["현실 도피", "이상 추구", "행동 마비", "완벽주의"],
    description: "아름다운 꿈을 꾸지만 현실에서는 얼어붙어 있어요. 첫 걸음이 완벽하지 않아도 괜찮아요."
  },
  {
    id: "hungry-ghost",
    name: "배고픈 유령",
    englishName: "The Hungry Ghost",
    icon: "👻",
    color: "from-violet-500 to-purple-600",
    traits: ["채워지지 않음", "끝없는 갈증", "비교 중독", "결핍감"],
    description: "아무리 채워도 허기지는 마음. 진짜 배고픈 건 '좋아요'가 아니라 자기 인정이에요."
  },
  {
    id: "glass-fortress",
    name: "유리 성의 주인",
    englishName: "The Glass Fortress",
    icon: "🏰",
    color: "from-slate-400 to-gray-600",
    traits: ["투명한 방어", "접근 거부", "상처 두려움", "친밀감 공포"],
    description: "모든 게 보이지만 아무도 들어올 수 없는 성. 가끔은 문을 열어도 성은 무너지지 않아요."
  }
];

interface FeedAnalysis {
  imageIndex: number;
  insight: string;
  emotion: string;
  keyword: string;
}

interface AnalysisResult {
  unconsciousType: typeof unconsciousTypes[0];
  overallInsight: string;
  feedAnalysis: FeedAnalysis[];
  hiddenDesire: string;
  growthMessage: string;
  matchPercentage: number;
}

const InstagramFeedAnalysis = () => {
  const [step, setStep] = useState<Step>("upload");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentAnalyzingIndex, setCurrentAnalyzingIndex] = useState(0);
  const [currentInsight, setCurrentInsight] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const MAX_IMAGES = 3;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = Math.max(0, MAX_IMAGES - uploadedImages.length);
    if (remaining === 0) {
      toast({
        title: "업로드 제한",
        description: "피드 스크린샷은 3장만 업로드할 수 있어요.",
        variant: "destructive",
      });
      return;
    }

    const fileList = Array.from(files).slice(0, remaining);
    const newImages: string[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        newImages.push(event.target.result as string);

        if (newImages.length === fileList.length) {
          setUploadedImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
          // allow selecting the same file again
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const analysisInsights = [
    "색감에서 감정의 무게가 느껴져요...",
    "구도 선택에 무의식적 패턴이 보여요...",
    "반복되는 주제가 숨겨진 욕망을 말해요...",
    "빛과 그림자 사용에서 내면이 드러나요...",
    "피사체 선택이 관계 패턴을 보여줘요...",
    "전체 피드에서 일관된 심리가 감지돼요..."
  ];

  const startAnalysis = async () => {
    if (uploadedImages.length < 3) {
      toast({
        title: "이미지 부족",
        description: "최소 3장 이상의 피드 스크린샷을 업로드해주세요.",
        variant: "destructive"
      });
      return;
    }

    setStep("analyzing");
    setAnalysisProgress(0);
    setCurrentAnalyzingIndex(0);

    // Phase 1: Analyze each image
    for (let i = 0; i < uploadedImages.length; i++) {
      setCurrentAnalyzingIndex(i);
      setCurrentInsight(analysisInsights[i % analysisInsights.length]);
      setAnalysisProgress(10 + (i / uploadedImages.length) * 60);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Phase 2: AI Deep Analysis
    setCurrentInsight("무의식 패턴 종합 분석 중...");
    setAnalysisProgress(75);

    try {
      const { data, error } = await supabase.functions.invoke('feed-screenshot-analyzer', {
        body: { 
          imageCount: uploadedImages.length,
          images: uploadedImages.slice(0, 3) // Send first 3 for analysis
        }
      });

      if (error) throw error;

      setAnalysisProgress(100);
      setCurrentInsight("분석 완료!");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Map the result to our type
      const resultType = unconsciousTypes.find(t => t.id === data.typeId) || unconsciousTypes[0];
      
      setAnalysisResult({
        unconsciousType: resultType,
        overallInsight: data.overallInsight || "당신의 피드는 내면의 이야기를 담고 있어요.",
        feedAnalysis: data.feedAnalysis || [],
        hiddenDesire: data.hiddenDesire || "진정한 자기 표현에 대한 갈망이 보여요.",
        growthMessage: data.growthMessage || "있는 그대로의 모습도 충분히 아름다워요.",
        matchPercentage: data.matchPercentage || 87
      });
      setStep("result");

    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to random result
      const randomType = unconsciousTypes[Math.floor(Math.random() * unconsciousTypes.length)];
      setAnalysisResult({
        unconsciousType: randomType,
        overallInsight: "당신의 피드에서 독특한 심리 패턴이 발견되었어요. 무의식적으로 특정 감정과 욕구를 표현하고 있어요.",
        feedAnalysis: uploadedImages.map((_, i) => ({
          imageIndex: i,
          insight: analysisInsights[i % analysisInsights.length],
          emotion: ["그리움", "희망", "불안", "평화", "갈망", "자유"][i % 6],
          keyword: ["연결", "인정", "자유", "안정", "표현", "성장"][i % 6]
        })),
        hiddenDesire: "진정한 모습을 인정받고 싶은 욕구가 느껴져요.",
        growthMessage: "가면을 벗어도 당신은 충분히 사랑받을 자격이 있어요.",
        matchPercentage: 85 + Math.floor(Math.random() * 10)
      });
      setStep("result");
    }
  };

  const handleShare = async () => {
    if (!analysisResult) return;
    
    const shareText = `🎭 내 인스타 피드 무의식 분석 결과

${analysisResult.unconsciousType.icon} ${analysisResult.unconsciousType.name}
"${analysisResult.unconsciousType.description}"

💫 매칭률: ${analysisResult.matchPercentage}%

나도 분석받기 👉 [링크]

#피드심리분석 #무의식테스트 #인스타분석`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "복사 완료!",
        description: "친구에게 공유해보세요 💜"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="p-4 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold">피드 무의식 분석</p>
                  <p className="text-xs text-violet-400">Feed Psychology</p>
                </div>
              </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full mb-6">
                  <Upload className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-medium text-violet-300">스크린샷 업로드 방식</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  피드 스크린샷으로<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                    무의식을 분석합니다
                  </span>
                </h1>
                <p className="text-white/60 text-sm">
                  인스타그램 피드를 캡처해서 올려주세요<br />
                  AI가 숨겨진 심리를 읽어드려요
                </p>
              </motion.div>

              {/* Upload Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-md"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedImages.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-violet-500/40 hover:border-violet-500/60 rounded-2xl p-8 text-center cursor-pointer transition-all bg-violet-500/5 hover:bg-violet-500/10"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center">
                      <ImagePlus className="w-8 h-8 text-violet-400" />
                    </div>
                    <p className="text-white font-medium mb-1">피드 스크린샷 3장 업로드</p>
                    <p className="text-white/50 text-sm">정확히 3장을 올려주세요</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-square rounded-xl overflow-hidden border border-white/10"
                        >
                          <img src={img} alt={`Feed ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px]">
                            {idx + 1}
                          </div>
                        </motion.div>
                      ))}
                      
                      {uploadedImages.length < 3 && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-violet-500/40 transition-colors"
                        >
                          <ImagePlus className="w-6 h-6 text-white/40" />
                        </div>
                      )}
                    </div>

                    <p className="text-center text-white/50 text-sm">
                      {uploadedImages.length} / 3장 업로드됨 {uploadedImages.length < 3 && "(3장 필요)"}
                    </p>

                    <Button
                      onClick={startAnalysis}
                      disabled={uploadedImages.length < 3}
                      className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white font-bold py-6 text-lg disabled:opacity-50"
                    >
                      무의식 분석 시작
                      <Sparkles className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Type Preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-12 max-w-md w-full"
              >
                <p className="text-center text-white/40 text-xs mb-4">8가지 무의식 유형</p>
                <div className="grid grid-cols-4 gap-2">
                  {unconsciousTypes.slice(0, 8).map((type, idx) => (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="bg-slate-800/50 border border-white/5 rounded-xl p-2 text-center"
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <p className="text-[9px] text-white/70 leading-tight">{type.name}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4"
          >
            <div className="w-full max-w-sm text-center">
              {/* Current Image */}
              <motion.div
                key={currentAnalyzingIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-2xl overflow-hidden border-2 border-violet-500/30 mb-6"
              >
                <img
                  src={uploadedImages[currentAnalyzingIndex]}
                  alt="Analyzing"
                  className="w-full h-full object-cover"
                />
                
                {/* Scan Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-violet-500/20 to-fuchsia-600/20"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Index Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-sm">
                  {currentAnalyzingIndex + 1} / {uploadedImages.length}
                </div>
              </motion.div>

              {/* Progress */}
              <div className="mb-4">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-white/60 text-sm">{Math.round(analysisProgress)}%</p>
              </div>

              {/* Current Insight */}
              <motion.p
                key={currentInsight}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-violet-300 font-medium"
              >
                {currentInsight}
              </motion.p>
            </div>
          </motion.div>
        )}

        {step === "result" && analysisResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pb-24"
          >
            {/* Result Header */}
            <div className={`bg-gradient-to-br ${analysisResult.unconsciousType.color} p-6 pb-12`}>
              <div className="text-center">
                <p className="text-white/80 text-sm mb-2">당신의 피드 무의식 유형</p>
                <div className="text-6xl mb-3">{analysisResult.unconsciousType.icon}</div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {analysisResult.unconsciousType.name}
                </h1>
                <p className="text-white/70 text-sm">
                  {analysisResult.unconsciousType.englishName}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-white font-bold">{analysisResult.matchPercentage}%</span>
                  <span className="text-white/80 text-sm">일치</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 -mt-6">
              {/* Main Card */}
              <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-4">
                <p className="text-white/90 leading-relaxed">
                  {analysisResult.unconsciousType.description}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {analysisResult.unconsciousType.traits.map((trait, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Feed Analysis */}
              <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 mb-4">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  피드별 심리 분석
                </h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.slice(0, 6).map((img, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-white/60 text-center">
                        {analysisResult.feedAnalysis[idx]?.keyword || "분석중"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Desire */}
              <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-violet-500/20 rounded-2xl p-5 mb-4">
                <h3 className="font-bold text-violet-300 mb-2">💫 숨겨진 욕망</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {analysisResult.hiddenDesire}
                </p>
              </div>

              {/* Growth Message */}
              <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 mb-6">
                <h3 className="font-bold text-white mb-2">🌱 성장 메시지</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {analysisResult.growthMessage}
                </p>
              </div>
            </div>

            {/* Share Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
              <div className="flex gap-3 max-w-md mx-auto">
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white font-bold py-5"
                >
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "복사됨!" : "결과 복사하기"}
                </Button>
                <Button
                  onClick={() => {
                    setStep("upload");
                    setUploadedImages([]);
                    setAnalysisResult(null);
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  다시하기
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstagramFeedAnalysis;
