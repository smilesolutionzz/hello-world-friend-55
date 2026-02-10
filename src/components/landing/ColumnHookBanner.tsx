import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';

const ColumnHookBanner = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-blue-500/10">
      <div className="max-w-4xl mx-auto">
        <Link to="/column">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-6 md:p-8 cursor-pointer group"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center"
                >
                  <Heart className="w-8 h-8 text-white" fill="white" />
                </motion.div>
              </div>
              
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400 tracking-wider">2026년 2월 특별 칼럼</span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                  "새 학기 앞둔 엄마, 아빠에게"
                </h3>
                
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                  3월이 다가옵니다. 아이도, 부모도 설렘보다 걱정이 앞서는 계절. 
                  <span className="text-rose-400 font-medium"> 불안해도 괜찮습니다.</span>
                </p>
              </div>
              
              {/* CTA */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                  <span className="text-sm font-medium">읽어보기</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
};

export default ColumnHookBanner;
