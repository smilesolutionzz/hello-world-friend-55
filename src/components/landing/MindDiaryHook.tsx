import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Gift, 
  Heart,
  ChevronRight,
  Sparkles,
  Users,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

const MindDiaryHook = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Heart, text: "10초 마음 체크인", color: "text-pink-400" },
    { icon: Flame, text: "연속 기록 보상", color: "text-orange-400" },
    { icon: Gift, text: "친구 초대 혜택", color: "text-purple-400" },
    { icon: Shield, text: "24시간 위기 감지", color: "text-blue-400" },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              NEW 청소년 전용
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              마음일기 📔
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              하루 10초, 이모지로 기분 체크하고<br className="md:hidden" />
              <span className="text-primary font-medium">친구 초대하면 둘 다 보상!</span>
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center"
              >
                <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-2`} />
                <p className="text-white text-sm font-medium">{feature.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 md:p-8 mb-8"
          >
            <p className="text-center text-slate-400 text-sm mb-6">오늘 기분 어때?</p>
            <div className="flex justify-center gap-4 md:gap-6">
              {["😊", "😐", "😔", "😰", "😢"].map((emoji, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-4xl md:text-5xl bg-slate-700/50 hover:bg-slate-600/50 rounded-2xl p-3 transition-colors"
                  onClick={() => navigate('/mind-diary')}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            <p className="text-center text-slate-500 text-xs mt-4">
              탭해서 시작하기
            </p>
          </motion.div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/mind-diary')}
              className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white font-bold text-lg"
            >
              마음일기 시작하기
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/parent-dashboard')}
              className="w-full sm:w-auto h-14 px-8 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <Users className="w-5 h-5 mr-2" />
              부모님이신가요?
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <div className="flex -space-x-2">
                {["😊", "😁", "🥰"].map((emoji, i) => (
                  <span key={i} className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-lg border-2 border-slate-800">
                    {emoji}
                  </span>
                ))}
              </div>
              <span>오늘 <span className="text-primary font-medium">127명</span>이 기록했어요</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MindDiaryHook;
