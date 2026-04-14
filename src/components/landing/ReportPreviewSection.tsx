import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Brain, Target, Heart, Lightbulb, Users, TrendingUp, BookOpen, ArrowRight, Sparkles, CheckCircle2, Download, Share2, Mail, Eye, GraduationCap, MapPin, Map, AlertTriangle, BarChart3, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import ReportPreviewDialog from './ReportPreviewDialog';

const ReportPreviewSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const reportSections = [
    { icon: BookOpen, title: t.reportPreview.sec1, preview: t.reportPreview.sec1Preview, color: 'amber' },
    { icon: Brain, title: t.reportPreview.sec2, preview: t.reportPreview.sec2Preview, color: 'emerald' },
    { icon: Target, title: t.reportPreview.sec3, preview: t.reportPreview.sec3Preview, color: 'rose' },
    { icon: Users, title: t.reportPreview.sec4, preview: t.reportPreview.sec4Preview, color: 'blue' },
    { icon: TrendingUp, title: t.reportPreview.sec5, preview: t.reportPreview.sec5Preview, color: 'violet' },
    { icon: Map, title: t.reportPreview.sec6, preview: t.reportPreview.sec6Preview, color: 'orange' },
    { icon: Stethoscope, title: t.reportPreview.sec7, preview: t.reportPreview.sec7Preview, color: 'cyan' },
    { icon: BarChart3, title: t.reportPreview.sec8, preview: t.reportPreview.sec8Preview, color: 'indigo' },
    { icon: Lightbulb, title: t.reportPreview.sec9, preview: t.reportPreview.sec9Preview, color: 'amber' },
  ];

  const colorClasses: Record<string, { icon: string }> = {
    amber: { icon: 'text-amber-600 bg-amber-100' },
    emerald: { icon: 'text-emerald-600 bg-emerald-100' },
    rose: { icon: 'text-rose-600 bg-rose-100' },
    blue: { icon: 'text-blue-600 bg-blue-100' },
    violet: { icon: 'text-violet-600 bg-violet-100' },
    orange: { icon: 'text-orange-600 bg-orange-100' },
    cyan: { icon: 'text-cyan-600 bg-cyan-100' },
    indigo: { icon: 'text-indigo-600 bg-indigo-100' },
  };

  const features = [
    { icon: Download, text: t.reportPreview.featDownload },
    { icon: Share2, text: t.reportPreview.featShare },
    { icon: Mail, text: t.reportPreview.featEmail },
  ];

  const benefits = [
    t.reportPreview.benefit1, t.reportPreview.benefit2, t.reportPreview.benefit3,
    t.reportPreview.benefit4, t.reportPreview.benefit5, t.reportPreview.benefit6,
  ];

  // Radar chart data for visual preview
  const radarData = [
    { label: '자기주도성', score: 85 },
    { label: '규범적 성숙도', score: 80 },
    { label: '인지적 유연성', score: 35 },
    { label: '스트레스 대처', score: 40 },
    { label: '수면·활력', score: 20 },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-bold mb-4">
            <Sparkles className="w-4 h-4" />
            {t.reportPreview.badge}
          </span>
          <h2 className="text-xl md:text-4xl font-bold text-white mb-3 break-keep">{t.reportPreview.heading}</h2>
          <p className="text-white/60 text-xs md:text-base max-w-2xl mx-auto px-2 break-keep">{t.reportPreview.subheading}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          {/* Report Header */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-t-2xl p-4 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-white/50 text-xs">{t.reportPreview.dateGenerated}</p>
                  <span className="text-[10px] text-white/30 font-mono">{t.reportPreview.reportId}</span>
                </div>
                <h3 className="text-white font-bold text-sm md:text-lg break-keep">{t.reportPreview.reportTitle}</h3>
              </div>
              <div className="text-right space-y-1">
                <p className="text-white/50 text-xs">{t.reportPreview.from}</p>
                <p className="text-amber-400 font-bold text-sm">AIHPRO</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-300">{t.reportPreview.riskLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">{t.reportPreview.aiConfidence}</span>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '94.2%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  />
                </div>
                <span className="text-xs font-bold text-emerald-400">{t.reportPreview.aiConfidenceScore}</span>
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl p-4 md:p-6 space-y-5">
            {/* Executive Summary */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-800">{t.reportPreview.summaryTitle}</h4>
              </div>
              <div className="space-y-2.5 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 font-bold">▸</span>
                  <span><strong className="text-slate-800">{t.reportPreview.summaryObs}</strong> {t.reportPreview.summaryObsText}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 font-bold">▸</span>
                  <span><strong className="text-slate-800">{t.reportPreview.summaryStrength}</strong> {t.reportPreview.summaryStrengthText}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5 font-bold">▸</span>
                  <span><strong className="text-slate-800">{t.reportPreview.summaryAction}</strong> {t.reportPreview.summaryActionText}</span>
                </p>
              </div>
            </div>

            {/* Radar Chart Preview */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-800">심리 프로파일 레이더</h4>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {radarData.map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="relative mx-auto w-12 h-12 mb-1">
                      <svg viewBox="0 0 48 48" className="w-full h-full">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                        <motion.circle
                          cx="24" cy="24" r="20"
                          fill="none"
                          stroke={item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${(item.score / 100) * 125.6} 125.6`}
                          transform="rotate(-90 24 24)"
                          initial={{ strokeDasharray: '0 125.6' }}
                          whileInView={{ strokeDasharray: `${(item.score / 100) * 125.6} 125.6` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.15 }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">{item.score}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 10 Analysis Sections */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-800">{t.reportPreview.detailedTitle}</h4>
              </div>
              <div className="space-y-1.5">
                {reportSections.map((section, index) => {
                  const colors = colorClasses[section.color] || colorClasses.amber;
                  return (
                    <div key={index} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className={`p-1.5 rounded-lg shrink-0 ${colors.icon}`}>
                        <section.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-slate-700 text-sm">{index + 1}. {section.title}</h5>
                        <p className="text-xs text-slate-500 line-clamp-1">{section.preview}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview Button */}
            <Button
              onClick={() => setIsPreviewOpen(true)}
              variant="outline"
              className="w-full py-5 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold"
            >
              <Eye className="w-5 h-5 mr-2" />
              {t.reportPreview.previewButton}
            </Button>

            <p className="text-center text-xs text-slate-400 pt-1">{t.reportPreview.disclaimer}</p>
          </div>

          <p className="text-center text-white/40 text-xs mt-4">{t.reportPreview.sampleNote}</p>
        </motion.div>

        {/* Features & Benefits */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto mt-10">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-full">
                <feature.icon className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs md:text-sm text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center space-y-2">
            <Button
              onClick={() => navigate('/report-generator')}
              className="px-6 md:px-10 py-5 md:py-7 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm md:text-lg rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] max-w-full"
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 flex-shrink-0" />
              {t.reportPreview.ctaButton}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1.5 md:ml-2 flex-shrink-0" />
            </Button>
            <p className="text-white/50 text-[10px] md:text-sm whitespace-nowrap">{t.reportPreview.ctaSubtext}</p>
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-amber-400/80 text-xs font-medium"
            >
              {t.reportPreview.ctaUrgency}
            </motion.p>
          </div>
        </motion.div>
      </div>

      <ReportPreviewDialog isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen} />
    </section>
  );
};

export default ReportPreviewSection;
