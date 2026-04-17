import { Shield, Award, Lock, CheckCircle, Building2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const PartnerTrustSection = () => {
  const { t } = useTranslation();

  const trustBadges = [
    { icon: Shield, title: t.partnerTrust.trustMedical },
    { icon: Lock, title: t.partnerTrust.trustSSL },
    { icon: Award, title: t.partnerTrust.trustISO },
    { icon: CheckCircle, title: t.partnerTrust.trustAI }
  ];

  // Partner names kept as-is (proper nouns)
  const partners = [
    "디딤돌언어사회성연구소", "APA발달센터", "디앤알운동발달센터", "한점미소발달센터",
    "우아함발달센터 안산점", "메이플 ABA 목동센터", "엘림아동발달센터", "해웃음 심리발달센터",
    "핌발달센터", "정관언어발달센터", "해오름 아동발달센터", "넘나들발달센터",
    "별하 아동발달센터", "정아동심리상담소", "소리엘 언어치료센터", "이든아동발달센터",
    "푸른솔발달센터", "해맑은발달센터", "참좋은발달센터", "아이조아발달센터",
    "마음숲심리상담센터", "행복한마음심리센터", "열린마음상담센터", "새봄심리상담소",
    "마음드림상담센터", "함께심리상담센터", "밝은마음상담센터", "치유의숲심리센터",
    "언어발달치료센터", "감각통합치료센터", "놀이치료연구소", "미술치료센터",
    "음악치료연구소", "운동발달치료센터", "인지발달치료센터", "사회성발달센터",
    "삼성웰니스의원", "서울아동발달클리닉", "행복한소아청소년과", "마음편한정신건강의학과",
    "아이들세상소아과", "청소년마음클리닉", "발달전문소아과", "마음건강의원",
    "아이사랑어린이집", "푸른숲유치원", "해바라기학교", "꿈나무교육센터",
    "미래인재학원", "창의력교육센터", "해담ABA아동발달센터", "별하언어심리상담센터 서울구로점"
  ];

  const row1 = partners.slice(0, 17);
  const row2 = partners.slice(17, 34);
  const row3 = partners.slice(34, 50);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-white">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t.partnerTrust.badge}</span>
          </div>
          <h2 className="text-xl md:text-4xl font-bold text-slate-900 mb-4 break-keep">
            <span className="text-primary">{t.partnerTrust.headingCount}</span>{t.partnerTrust.headingEnd}
          </h2>
          <p className="text-slate-600 text-xs md:text-lg max-w-2xl mx-auto leading-relaxed px-2 break-keep">
            {t.partnerTrust.description1}<br />
            {t.partnerTrust.description2}
          </p>
          <div className="flex justify-center gap-8 md:gap-16 mt-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-slate-500">{t.partnerTrust.statPartners}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-500">1,000+</div>
              <div className="text-sm text-slate-500">{t.partnerTrust.statExperts}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-500">{t.partnerTrust.statRegion}</div>
              <div className="text-sm text-slate-500">{t.partnerTrust.statRegion}</div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-left">
              {[...row1, ...row1].map((partner, index) => (
                <div key={index} className={`flex-shrink-0 px-4 py-2.5 rounded-lg transition-colors ${partner === "삼성웰니스의원" ? "bg-gradient-to-r from-primary/10 to-blue-100 border-2 border-primary/40 shadow-sm" : "bg-white border border-slate-200 hover:border-primary/30 hover:shadow-sm"}`}>
                  <p className={`text-sm whitespace-nowrap font-medium ${partner === "삼성웰니스의원" ? "text-primary font-bold" : "text-slate-600"}`}>{partner}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-right">
              {[...row2, ...row2].map((partner, index) => (
                <div key={index} className="flex-shrink-0 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-primary/30 hover:shadow-sm transition-colors">
                  <p className="text-sm text-slate-600 whitespace-nowrap font-medium">{partner}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-left-slow">
              {[...row3, ...row3].map((partner, index) => (
                <div key={index} className="flex-shrink-0 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-primary/30 hover:shadow-sm transition-colors">
                  <p className="text-sm text-slate-600 whitespace-nowrap font-medium">{partner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-16 pt-12 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-6">{t.partnerTrust.trustHeading}</p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-slate-500">{badge.title}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes marquee-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marquee-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .marquee-track { display: flex; gap: 1rem; min-width: max-content; }
        .marquee-left { animation: marquee-left 80s linear infinite; }
        .marquee-right { animation: marquee-right 90s linear infinite; }
        .marquee-left-slow { animation: marquee-left 100s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
};

export default PartnerTrustSection;
