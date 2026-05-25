import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Brain, Users, FileText, BarChart3, ArrowRight, CheckCircle2, Rocket, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

const B2BShowcaseSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  const solutions = [
    { icon: Brain, title: t.b2b.sol1Title, target: t.b2b.sol1Target, price: t.b2b.sol1Price },
    { icon: Users, title: t.b2b.sol2Title, target: t.b2b.sol2Target, price: t.b2b.sol2Price },
    { icon: FileText, title: t.b2b.sol3Title, target: t.b2b.sol3Target, price: t.b2b.sol3Price },
    { icon: BarChart3, title: t.b2b.sol4Title, target: t.b2b.sol4Target, price: t.b2b.sol4Price }
  ];

  const stats = [
    { value: t.b2b.stat1Value, label: t.b2b.stat1Label, source: 'McKinsey' },
    { value: t.b2b.stat2Value, label: t.b2b.stat2Label, source: '2025' },
    { value: t.b2b.stat3Value, label: t.b2b.stat3Label, source: 'MHI' }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Badge className="mb-4 bg-white/10 text-white border-white/20"><Building2 className="w-3 h-3 mr-1" />{t.b2b.badgeText}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.b2b.heading}</h2>
          <p className="text-white/70 max-w-2xl mx-auto">{t.b2b.subheading} <strong className="text-white">{t.b2b.subheadingBold}</strong>{t.b2b.subheadingEnd}</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs md:text-sm text-white/60">{stat.label}</p>
              <Badge variant="outline" className="mt-1 text-[10px] border-white/20 text-white/50">{stat.source}</Badge>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {solutions.map((solution, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + index * 0.1 }}>
              <Card glassMorphism={false} className="!bg-white/5 border-white/10 backdrop-blur h-full hover:!bg-white/10 transition-colors">
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <solution.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{solution.title}</h3>
                  <p className="text-xs text-white/60 mb-2">{solution.target}</p>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">{solution.price}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-r from-blue-600 to-purple-700 border-0">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center"><Rocket className="w-7 h-7 text-white" /></div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{t.b2b.pilotTitle}</h3>
                    <p className="text-white/80 text-sm">{t.b2b.pilotDesc}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" onClick={() => navigate(localePath('/business'))} className="bg-white text-blue-700 hover:bg-white/90 font-semibold">{t.b2b.consultButton}<ArrowRight className="w-4 h-4 ml-2" /></Button>
                  <Button size="lg" variant="outline" onClick={() => navigate(localePath('/business#eap'))} className="border-white/30 text-white hover:bg-white/10">{t.b2b.eapButton}</Button>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />{t.b2b.trust1}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />{t.b2b.trust2}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />{t.b2b.trust3}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default B2BShowcaseSection;
