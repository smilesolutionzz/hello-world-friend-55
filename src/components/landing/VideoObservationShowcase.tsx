import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Video, 
  Brain, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Baby,
  User,
  Heart,
  Activity,
  MessageCircle,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

const analysisCategories = [
  {
    icon: Baby,
    title: "아동 행동 분석",
    description: "놀이, 상호작용, 일상 행동 패턴 분석",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: MessageCircle,
    title: "언어 발달 평가",
    description: "발화량, 어휘력, 의사소통 능력 분석",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Brain,
    title: "자폐 스크리닝",
    description: "ASD 조기 선별을 위한 행동 분석",
    color: "from-purple-500 to-violet-500"
  },
  {
    icon: User,
    title: "성인 심리 분석",
    description: "표정, 제스처, 정서 상태 분석",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Heart,
    title: "노인 인지 평가",
    description: "인지 기능, 일상 수행 능력 분석",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Activity,
    title: "운동 기능 분석",
    description: "대근육, 소근육 발달 상태 평가",
    color: "from-teal-500 to-cyan-500"
  }
];

const features = [
  "30초 영상으로 심층 분석",
  "Gemini 2.5 AI 기반",
  "6개 전문 분석 영역",
  "맞춤형 관찰 포인트 제공",
  "결과 저장 및 히스토리",
  "전문가 연결 서비스"
];

export const VideoObservationShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full mb-6">
            <Video className="w-4 h-4" />
            NEW 🔥 AI 영상 관찰 분석
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white whitespace-nowrap">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              30초 영상
            </span>
            으로 전문가급 분석
          </h2>
          
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            <span className="block">아이의 놀이 영상, 일상 모습을 업로드하면</span>
            <span className="text-purple-400 font-semibold">AI가 발달 상태를 심층 분석</span>해드립니다
          </p>
        </motion.div>

        {/* Analysis Categories Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {analysisCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index}
                className="group p-4 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1 whitespace-nowrap">{category.title}</h3>
                <p className="text-xs text-slate-400 leading-tight whitespace-nowrap">{category.description}</p>
              </Card>
            );
          })}
        </motion.div>

        {/* Features + CTA */}
        <motion.div 
          className="flex flex-col lg:flex-row items-center gap-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl p-8 border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Features List */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">왜 영상 분석인가요?</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 lg:min-w-[280px]">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">분석 소요시간: 약 1분</span>
            </div>
            
            <Button 
              onClick={() => navigate('/observation')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg rounded-xl group"
            >
              <Video className="w-5 h-5 mr-2" />
              영상 분석 시작하기
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-xs text-slate-500 text-center">
              최대 30초, 50MB 이하 영상 지원
            </p>
          </div>
        </motion.div>

        {/* Trust Badge */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-4 text-slate-400 text-sm">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>전문가급 리포트</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              <span>Gemini 2.5 Flash AI</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>무료 체험 가능</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
