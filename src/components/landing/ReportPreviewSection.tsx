import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Brain, Target, Heart, Lightbulb, Users, TrendingUp, Shield, BookOpen, ArrowRight, Sparkles, CheckCircle2, Download, Share2, Mail, X, Eye, ChevronDown, ChevronUp, GraduationCap, MessageCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/i18n/useTranslation';

const ReportPreviewSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const reportSections = [
    { icon: Brain, title: t.reportPreview.sec1, preview: t.reportPreview.sec1Preview },
    { icon: Target, title: t.reportPreview.sec2, preview: t.reportPreview.sec2Preview },
    { icon: Heart, title: t.reportPreview.sec3, preview: t.reportPreview.sec3Preview },
    { icon: Lightbulb, title: t.reportPreview.sec4, preview: t.reportPreview.sec4Preview },
    { icon: Users, title: t.reportPreview.sec5, preview: t.reportPreview.sec5Preview },
    { icon: TrendingUp, title: t.reportPreview.sec6, preview: t.reportPreview.sec6Preview },
  ];

  // Full report sections remain hardcoded as they're detailed sample content
  // Only the outer UI chrome needs translation
  const fullReportSections = [
    { icon: Brain, title: t.reportPreview.sec1, color: 'amber', content: `### ${t.reportPreview.sec1}\n${t.reportPreview.sec1Preview}` },
    { icon: Target, title: t.reportPreview.sec2, color: 'emerald', content: `### ${t.reportPreview.sec2}\n${t.reportPreview.sec2Preview}` },
    { icon: Heart, title: t.reportPreview.sec3, color: 'rose', content: `### ${t.reportPreview.sec3}\n${t.reportPreview.sec3Preview}` },
    { icon: Lightbulb, title: t.reportPreview.sec4, color: 'blue', content: `### ${t.reportPreview.sec4}\n${t.reportPreview.sec4Preview}` },
    { icon: Users, title: t.reportPreview.sec5, color: 'violet', content: `### ${t.reportPreview.sec5}\n${t.reportPreview.sec5Preview}` },
    { icon: TrendingUp, title: t.reportPreview.sec6, color: 'orange', content: `### ${t.reportPreview.sec6}\n${t.reportPreview.sec6Preview}` },
  ];

  const features = [
    { icon: Download, text: t.reportPreview.featDownload },
    { icon: Share2, text: t.reportPreview.featShare },
    { icon: Mail, text: t.reportPreview.featEmail },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600 bg-amber-100', border: 'border-amber-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600 bg-emerald-100', border: 'border-emerald-200' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600 bg-rose-100', border: 'border-rose-200' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600 bg-blue-100', border: 'border-blue-200' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600 bg-violet-100', border: 'border-violet-200' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600 bg-orange-100', border: 'border-orange-200' },
    cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600 bg-cyan-100', border: 'border-cyan-200' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600 bg-indigo-100', border: 'border-indigo-200' },
  };

  const benefits = [
    t.reportPreview.benefit1,
    t.reportPreview.benefit2,
    t.reportPreview.benefit3,
    t.reportPreview.benefit4,
    t.reportPreview.benefit5,
    t.reportPreview.benefit6,
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-bold mb-4">
            <Sparkles className="w-4 h-4" />
            {t.reportPreview.badge}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            {t.reportPreview.heading}
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            {t.reportPreview.subheading}
          </p>
        </motion.div>

        {/* Report Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {/* Report Header */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-t-2xl p-4 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white/50 text-xs mb-1">{t.reportPreview.dateGenerated}</p>
                <h3 className="text-white font-bold text-lg">{t.reportPreview.reportTitle}</h3>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs">{t.reportPreview.from}</p>
                <p className="text-amber-400 font-medium text-sm">AIHPRO</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-amber-50/95 border-x border-b border-amber-200/50 rounded-b-2xl p-4 md:p-6 space-y-4">
            {/* Summary Section */}
            <div className="bg-white rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-800">{t.reportPreview.summaryTitle}</h4>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span><strong>{t.reportPreview.summaryObs}</strong> {t.reportPreview.summaryObsText}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span><strong>{t.reportPreview.summaryStrength}</strong> {t.reportPreview.summaryStrengthText}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span><strong>{t.reportPreview.summaryAction}</strong> {t.reportPreview.summaryActionText}</span>
                </p>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="bg-white rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-800">{t.reportPreview.detailedTitle}</h4>
              </div>
              <div className="space-y-3">
                {reportSections.map((section, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                    <div className="p-1.5 bg-amber-100 rounded-lg shrink-0">
                      <section.icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-slate-700 text-sm">{section.title}</h5>
                      <p className="text-xs text-slate-500 truncate">{section.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Button */}
            <Button
              onClick={() => setIsPreviewOpen(true)}
              variant="outline"
              className="w-full py-5 border-amber-300 text-amber-700 hover:bg-amber-100 font-semibold"
            >
              <Eye className="w-5 h-5 mr-2" />
              {t.reportPreview.previewButton}
            </Button>

            {/* Disclaimer */}
            <p className="text-center text-xs text-slate-400 pt-2">
              {t.reportPreview.disclaimer}
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-white/40 text-xs mt-4">
            {t.reportPreview.sampleNote}
          </p>
        </motion.div>

        {/* Features & Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mt-10"
        >
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-full"
              >
                <feature.icon className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs md:text-sm text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/report-generator')}
              className="px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25"
            >
              {t.reportPreview.ctaButton}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Full Report Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-500 to-orange-500 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs opacity-80">Sample</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold">{t.reportPreview.reportTitle}</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(90vh-120px)]">
            <div className="p-4 md:p-6 space-y-4">
              {/* Report Sections */}
              <div className="space-y-3">
                {fullReportSections.map((section, index) => {
                  const colors = colorClasses[section.color] || colorClasses.amber;
                  const isExpanded = expandedSection === index;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl border ${colors.border} overflow-hidden`}
                    >
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : index)}
                        className={`w-full flex items-center justify-between p-4 ${colors.bg} hover:brightness-95 transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.icon}`}>
                            <section.icon className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-slate-800">{section.title}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white border-t border-slate-100">
                              <p className="text-sm text-slate-600">{section.content}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      setIsPreviewOpen(false);
                      navigate('/report-generator');
                    }}
                    className="flex-1 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                  >
                    {t.reportPreview.ctaButton}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewOpen(false)}
                    className="py-5"
                  >
                    {t.common.close}
                  </Button>
                </div>
                <p className="text-center text-xs text-slate-400 mt-3">
                  {t.reportPreview.sampleNote}
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ReportPreviewSection;
