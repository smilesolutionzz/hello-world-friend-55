import { Shield, Award, Lock, CheckCircle, Building2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerTrustSection = () => {
  const trustBadges = [
    { icon: Shield, title: "의료기관 인증" },
    { icon: Lock, title: "SSL 암호화" },
    { icon: Award, title: "ISO 인증" },
    { icon: CheckCircle, title: "AI 투명성" }
  ];

  // 50개 협력기관 리스트
  const partners = [
    // 발달센터
    "디딤돌언어사회성연구소", "APA발달센터", "디앤알운동발달센터", "한점미소발달센터",
    "우아함발달센터 안산점", "메이플 ABA 목동센터", "엘림아동발달센터", "해웃음 심리발달센터",
    "핌발달센터", "정관언어발달센터", "해오름 아동발달센터", "넘나들발달센터",
    "별하 아동발달센터", "정아동심리상담소", "소리엘 언어치료센터", "이든아동발달센터",
    "푸른솔발달센터", "해맑은발달센터", "참좋은발달센터", "아이조아발달센터",
    // 심리상담센터
    "마음숲심리상담센터", "행복한마음심리센터", "열린마음상담센터", "새봄심리상담소",
    "마음드림상담센터", "함께심리상담센터", "밝은마음상담센터", "치유의숲심리센터",
    // 치료센터
    "언어발달치료센터", "감각통합치료센터", "놀이치료연구소", "미술치료센터",
    "음악치료연구소", "운동발달치료센터", "인지발달치료센터", "사회성발달센터",
    // 의원 및 병원
    "삼성웰니스의원", "서울아동발달클리닉", "행복한소아청소년과", "마음편한정신건강의학과",
    "아이들세상소아과", "청소년마음클리닉", "발달전문소아과", "마음건강의원",
    // 교육기관
    "아이사랑어린이집", "푸른숲유치원", "해바라기학교", "꿈나무교육센터",
    "미래인재학원", "창의력교육센터"
  ];

  // 앞뒤로 3줄 표시를 위해 그룹 나누기
  const row1 = partners.slice(0, 17);
  const row2 = partners.slice(17, 34);
  const row3 = partners.slice(34, 50);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-slate-900">
      <div className="container mx-auto px-4 relative z-10">
        {/* 협력기관 헤더 - 강조 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">전국 협력 네트워크</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-primary">50개+</span> 전문기관과 함께합니다
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            발달센터, 심리상담센터, 치료센터, 의료기관까지<br className="hidden md:block" />
            검증된 전문기관들이 AIHPRO와 함께 아이들의 성장을 돕고 있습니다.
          </p>
          
          {/* 통계 */}
          <div className="flex justify-center gap-8 md:gap-16 mt-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-white/50">협력기관</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400">1,000+</div>
              <div className="text-sm text-white/50">전문가 연결</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400">전국</div>
              <div className="text-sm text-white/50">서비스 지역</div>
            </div>
          </div>
        </motion.div>

        {/* Partner Logos - 3줄 마퀴 */}
        <div className="space-y-4">
          {/* Row 1 - 왼쪽으로 */}
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-left">
              {[...row1, ...row1].map((partner, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg transition-colors ${
                    partner === "삼성웰니스의원" 
                      ? "bg-gradient-to-r from-primary/20 to-blue-500/20 border-2 border-primary/50 shadow-lg shadow-primary/10" 
                      : "bg-slate-800/80 border border-white/10 hover:border-primary/30 hover:bg-slate-800"
                  }`}
                >
                  <p className={`text-sm whitespace-nowrap font-medium ${
                    partner === "삼성웰니스의원" 
                      ? "text-primary font-bold" 
                      : "text-white/70"
                  }`}>{partner}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - 오른쪽으로 */}
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-right">
              {[...row2, ...row2].map((partner, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 px-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-lg hover:border-primary/30 hover:bg-slate-800 transition-colors"
                >
                  <p className="text-sm text-white/70 whitespace-nowrap font-medium">{partner}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3 - 왼쪽으로 */}
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-left-slow">
              {[...row3, ...row3].map((partner, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 px-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-lg hover:border-primary/30 hover:bg-slate-800 transition-colors"
                >
                  <p className="text-sm text-white/70 whitespace-nowrap font-medium">{partner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-12 border-t border-white/5"
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
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-track {
          display: flex;
          gap: 1rem;
          min-width: max-content;
        }
        .marquee-left {
          animation: marquee-left 40s linear infinite;
        }
        .marquee-right {
          animation: marquee-right 45s linear infinite;
        }
        .marquee-left-slow {
          animation: marquee-left 50s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnerTrustSection;
