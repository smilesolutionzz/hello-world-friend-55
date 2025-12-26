import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { 
  Instagram, ArrowRight, Brain, Sparkles, Eye, Heart, AtSign
} from 'lucide-react';

const unconsciousTypes = [
  { icon: "🎬", name: "무대 뒤의 연출가" },
  { icon: "🔊", name: "메아리를 찾는 사람" },
  { icon: "🎭", name: "가면 수집가" },
  { icon: "🌋", name: "잠든 화산" },
  { icon: "🌉", name: "보이지 않는 다리" },
  { icon: "❄️", name: "얼어붙은 몽상가" },
  { icon: "👻", name: "배고픈 유령" },
  { icon: "🏰", name: "유리 성의 주인" },
];

const FeedAnalysisSection = () => {
  const navigate = useNavigate();
  const [instagramId, setInstagramId] = useState('');

  const handleAnalyze = () => {
    navigate('/instagram-analysis', { 
      state: { prefilledId: instagramId.replace('@', '').trim() } 
    });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full mb-6">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-bold text-pink-300">인스타그램 피드 분석</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            아이디만 입력하면<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400">
              숨겨진 무의식이 보입니다
            </span>
          </h2>
          
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">
            인스타그램 아이디만 입력하면<br />
            AI가 피드에서 무의식적 심리 패턴을 읽어드려요
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-10"
        >
          <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <AtSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">인스타그램 아이디 입력</p>
                <p className="text-white/50 text-xs">공개 계정만 분석 가능합니다</p>
              </div>
            </div>
            
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 font-medium">@</span>
              <Input
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value)}
                placeholder="instagram_id"
                className="pl-10 bg-slate-900/50 border-pink-500/30 focus:border-pink-500 h-14 text-lg text-white placeholder:text-white/30"
                onKeyDown={(e) => e.key === 'Enter' && instagramId.trim() && handleAnalyze()}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!instagramId.trim()}
              className="w-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 hover:from-pink-600 hover:via-fuchsia-600 hover:to-purple-600 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain className="w-5 h-5 mr-2" />
              무의식 분석 시작
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Type Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <p className="text-center text-white/50 text-sm mb-4">8가지 무의식 유형</p>
          <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-lg mx-auto">
            {unconsciousTypes.map((type, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="bg-slate-800/60 border border-white/10 rounded-xl p-2 md:p-3 text-center hover:border-pink-500/30 transition-colors"
              >
                <div className="text-2xl md:text-3xl mb-1">{type.icon}</div>
                <p className="text-[9px] md:text-[10px] text-white/70 leading-tight">{type.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Eye, text: "피드 패턴 분석", color: "text-pink-400" },
            { icon: Brain, text: "무의식 유형 진단", color: "text-fuchsia-400" },
            { icon: Heart, text: "숨겨진 욕망 해석", color: "text-purple-400" },
          ].map((feature, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-white/5 rounded-full"
            >
              <feature.icon className={`w-4 h-4 ${feature.color}`} />
              <span className="text-sm text-white/80">{feature.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Trust */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-white/40 text-sm"
        >
          <Sparkles className="w-3.5 h-3.5 inline mr-1" />
          현재까지 182,649명이 분석 완료
        </motion.p>
      </div>
    </section>
  );
};

export default FeedAnalysisSection;
