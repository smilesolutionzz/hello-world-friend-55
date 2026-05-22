import { Shield, Award, Lock, CheckCircle, Building2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { PARTNER_INSTITUTIONS } from '@/data/partnerInstitutions';

const PartnerTrustSection = () => {
  const { t } = useTranslation();

  const trustBadges = [
    { icon: Shield, title: t.partnerTrust.trustMedical },
    { icon: Lock, title: t.partnerTrust.trustSSL },
    { icon: Award, title: t.partnerTrust.trustISO },
    { icon: CheckCircle, title: t.partnerTrust.trustAI }
  ];

  // 실제 협력기관 47곳 (ExpertHiring과 동일 소스)
  const partners = PARTNER_INSTITUTIONS.map((p) => p.name);

  const third = Math.ceil(partners.length / 3);
  const row1 = partners.slice(0, third);
  const row2 = partners.slice(third, third * 2);
  const row3 = partners.slice(third * 2);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-slate-900">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t.partnerTrust.badge}</span>
          </div>
          <h2 className="text-xl md:text-4xl font-bold text-white mb-4 break-keep">
            <span className="text-primary">{t.partnerTrust.headingCount}</span>{t.partnerTrust.headingEnd}
          </h2>
          <p className="text-white/60 text-xs md:text-lg max-w-2xl mx-auto leading-relaxed px-2 break-keep">
            {t.partnerTrust.description1}<br />
            {t.partnerTrust.description2}
          </p>
        </motion.div>

        <div className="space-y-4">
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-left">
              {[...row1, ...row1].map((partner, index) => (
                <div key={index} className={`flex-shrink-0 px-4 py-2.5 rounded-lg transition-colors ${partner === "삼성웰니스의원" ? "bg-gradient-to-r from-primary/20 to-blue-500/20 border-2 border-primary/50 shadow-lg shadow-primary/10" : "bg-slate-800/80 border border-white/10 hover:border-primary/30 hover:bg-slate-800"}`}>
                  <p className={`text-sm whitespace-nowrap font-medium ${partner === "삼성웰니스의원" ? "text-primary font-bold" : "text-white/70"}`}>{partner}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-right">
              {[...row2, ...row2].map((partner, index) => (
                <div key={index} className="flex-shrink-0 px-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-lg hover:border-primary/30 hover:bg-slate-800 transition-colors">
                  <p className="text-sm text-white/70 whitespace-nowrap font-medium">{partner}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden">
            <div className="marquee-track marquee-left-slow">
              {[...row3, ...row3].map((partner, index) => (
                <div key={index} className="flex-shrink-0 px-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-lg hover:border-primary/30 hover:bg-slate-800 transition-colors">
                  <p className="text-sm text-white/70 whitespace-nowrap font-medium">{partner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

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
