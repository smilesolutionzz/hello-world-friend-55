import { Shield, Award, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerTrustSection = () => {
  const trustBadges = [
    { icon: Shield, title: "의료기관 인증" },
    { icon: Lock, title: "SSL 암호화" },
    { icon: Award, title: "ISO 인증" },
    { icon: CheckCircle, title: "AI 투명성" }
  ];

  const partners = [
    "디딤돌언어사회성연구소", "APA발달센터", "디앤알운동발달센터", "삼성웰니스의원",
    "한점미소발달센터", "우아함발달센터 안산점", "메이플 ABA 목동센터", "엘림아동발달센터",
    "해웃음 심리발달센터", "핌발달센터", "정관언어발달센터", "해오름 아동발달센터",
    "넘나들발달센터", "별하 아동발달센터", "정아동심리상담소", "소리엘 언어치료센터"
  ];

  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-slate-900">
      <div className="container mx-auto px-4 relative z-10">
        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-6">
            신뢰할 수 있는 플랫폼
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-slate-800 border border-white/5 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs text-white/50">{badge.title}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Partner Logos */}
        <div className="border-t border-white/5 pt-10">
          <p className="text-center text-xs font-medium text-white/40 uppercase tracking-wider mb-6">
            파트너 기관 네트워크
          </p>
          <div 
            className="relative overflow-hidden"
            style={{ ['--marquee-duration' as string]: '30s' } as React.CSSProperties}
          >
            <div className="marquee-track">
              {[...partners, ...partners].map((partner, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 px-4 py-2 bg-slate-800/50 border border-white/5 rounded-lg"
                >
                  <p className="text-xs text-white/60 whitespace-nowrap">{partner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 1rem;
          min-width: max-content;
          animation: marquee var(--marquee-duration, 30s) linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnerTrustSection;
