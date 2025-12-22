import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Instagram, ArrowRight, Eye, Brain, Heart, 
  Sparkles, Lock, Shield, Users
} from 'lucide-react';

const InstagramAnalysisSection = () => {
  const navigate = useNavigate();
  const [instagramId, setInstagramId] = useState('');

  const handleAnalyze = () => {
    if (instagramId.trim()) {
      navigate('/assessment/instagram-analysis', { 
        state: { prefilledId: instagramId.replace('@', '') } 
      });
    } else {
      navigate('/assessment/instagram-analysis');
    }
  };

  const features = [
    { icon: Eye, text: "피드 패턴 분석", color: "text-pink-400" },
    { icon: Brain, text: "무의식 유형 진단", color: "text-purple-400" },
    { icon: Heart, text: "숨겨진 욕망 해석", color: "text-rose-400" },
    { icon: Users, text: "관계 심리 분석", color: "text-blue-400" },
  ];

  const analysisItems = [
    "당신이 자주 올리는 사진 속 숨겨진 심리",
    "팔로워들에게 보여주고 싶은 '가면'",
    "무의식적으로 드러나는 진짜 욕망",
    "SNS 속 당신만의 관계 패턴"
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-black to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-l from-rose-500/10 to-pink-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full mb-6">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-bold text-pink-300">SNS 심리 분석</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
            인스타그램 아이디만 입력하면<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400">
              숨겨진 무의식이 드러납니다
            </span>
          </h2>
          
          <p className="text-white/60 text-sm md:text-base max-w-lg mx-auto">
            당신의 피드 패턴을 AI가 분석하여<br />
            표면 아래 숨겨진 진짜 심리를 해석합니다
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 mb-8"
        >
          {/* Input Section */}
          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
              <Input
                type="text"
                placeholder="인스타그램 아이디 입력"
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value)}
                className="pl-12 pr-4 py-6 bg-slate-900/60 border-white/10 text-white placeholder:text-white/40 rounded-xl text-lg focus:border-pink-500/50 focus:ring-pink-500/20"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 hover:from-pink-600 hover:via-purple-600 hover:to-violet-600 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/40"
            >
              <span className="hidden md:inline">무의식 분석하기</span>
              <span className="md:hidden">분석하기</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Feature Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-white/5 rounded-full"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm text-white/80">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Analysis Items */}
          <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5">
            <div className="text-center mb-4">
              <span className="text-amber-400 font-semibold text-sm">분석으로 알 수 있는 것</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-pink-400">{idx + 1}</span>
                  </div>
                  <span className="text-sm text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/50"
        >
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>개인정보 암호화</span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>공개 계정만 분석 가능</span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 심리 분석 기술 적용</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InstagramAnalysisSection;
