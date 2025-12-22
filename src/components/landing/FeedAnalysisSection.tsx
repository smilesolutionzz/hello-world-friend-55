import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Upload, ArrowRight, Brain, Sparkles, Eye, Heart
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-full mb-6">
            <Upload className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-violet-300">피드 스크린샷 분석</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            인스타 피드를 캡처하면<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              숨겨진 무의식이 보입니다
            </span>
          </h2>
          
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">
            스크린샷만 올리면 AI가 당신의 피드에서<br />
            무의식적 심리 패턴을 읽어드려요
          </p>
        </motion.div>

        {/* Type Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2 md:gap-3 mb-10 max-w-lg mx-auto"
        >
          {unconsciousTypes.map((type, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="bg-slate-800/60 border border-white/10 rounded-xl p-2 md:p-3 text-center hover:border-violet-500/30 transition-colors"
            >
              <div className="text-2xl md:text-3xl mb-1">{type.icon}</div>
              <p className="text-[9px] md:text-[10px] text-white/70 leading-tight">{type.name}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {[
            { icon: Eye, text: "피드 패턴 분석", color: "text-violet-400" },
            { icon: Brain, text: "무의식 유형 진단", color: "text-fuchsia-400" },
            { icon: Heart, text: "숨겨진 욕망 해석", color: "text-pink-400" },
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={() => navigate('/assessment/feed-analysis')}
            size="lg"
            className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all"
          >
            <Upload className="w-5 h-5 mr-2" />
            피드 분석 시작하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="mt-4 text-white/40 text-sm">
            <Sparkles className="w-3.5 h-3.5 inline mr-1" />
            스크린샷 3~9장으로 분석 가능
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeedAnalysisSection;
