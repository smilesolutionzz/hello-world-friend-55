import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Play, Star, AlertTriangle, Clock, CheckCircle2, ArrowRight, Sparkles, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

const EmotionalHookSection = () => {
  const navigate = useNavigate();
  const [activeStory, setActiveStory] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  const emotionalStories = [
    { emoji: "😢", situation: t.emotionalHook.story1Situation, pain: t.emotionalHook.story1Pain, discovery: t.emotionalHook.story1Discovery, result: t.emotionalHook.story1Result, quote: t.emotionalHook.story1Quote, author: t.emotionalHook.story1Author, authorDetail: t.emotionalHook.story1Detail, tags: t.emotionalHook.story1Tags, highlight: t.emotionalHook.story1Highlight },
    { emoji: "💔", situation: t.emotionalHook.story2Situation, pain: t.emotionalHook.story2Pain, discovery: t.emotionalHook.story2Discovery, result: t.emotionalHook.story2Result, quote: t.emotionalHook.story2Quote, author: t.emotionalHook.story2Author, authorDetail: t.emotionalHook.story2Detail, tags: t.emotionalHook.story2Tags, highlight: t.emotionalHook.story2Highlight },
    { emoji: "😰", situation: t.emotionalHook.story3Situation, pain: t.emotionalHook.story3Pain, discovery: t.emotionalHook.story3Discovery, result: t.emotionalHook.story3Result, quote: t.emotionalHook.story3Quote, author: t.emotionalHook.story3Author, authorDetail: t.emotionalHook.story3Detail, tags: t.emotionalHook.story3Tags, highlight: t.emotionalHook.story3Highlight },
    { emoji: "🥺", situation: t.emotionalHook.story4Situation, pain: t.emotionalHook.story4Pain, discovery: t.emotionalHook.story4Discovery, result: t.emotionalHook.story4Result, quote: t.emotionalHook.story4Quote, author: t.emotionalHook.story4Author, authorDetail: t.emotionalHook.story4Detail, tags: t.emotionalHook.story4Tags, highlight: t.emotionalHook.story4Highlight },
    { emoji: "😤", situation: t.emotionalHook.story5Situation, pain: t.emotionalHook.story5Pain, discovery: t.emotionalHook.story5Discovery, result: t.emotionalHook.story5Result, quote: t.emotionalHook.story5Quote, author: t.emotionalHook.story5Author, authorDetail: t.emotionalHook.story5Detail, tags: t.emotionalHook.story5Tags, highlight: t.emotionalHook.story5Highlight },
  ];

  const urgencyStats = [
    { icon: AlertTriangle, value: t.emotionalHook.stat1Value, label: t.emotionalHook.stat1Label, color: "text-red-400" },
    { icon: Clock, value: t.emotionalHook.stat2Value, label: t.emotionalHook.stat2Label, color: "text-amber-400" },
    { icon: CheckCircle2, value: t.emotionalHook.stat3Value, label: t.emotionalHook.stat3Label, color: "text-green-400" },
  ];

  const storyCount = emotionalStories.length;
  const currentStory = emotionalStories[activeStory];

  // 자동 슬라이드: 8초마다 다음 스토리로 이동
  useEffect(() => {
    if (userInteracted) {
      // 사용자가 클릭 후 10초 뒤 다시 자동 슬라이드 재개
      const resume = setTimeout(() => setUserInteracted(false), 10000);
      return () => clearTimeout(resume);
    }
    const timer = setInterval(() => {
      setActiveStory(prev => (prev + 1) % storyCount);
    }, 8000);
    return () => clearInterval(timer);
  }, [userInteracted, storyCount]);

  const handleStoryClick = useCallback((index: number) => {
    setActiveStory(index);
    setUserInteracted(true);
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-white to-slate-50">
      <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/20 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-full mb-4">
            <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
            <span className="text-sm font-semibold text-rose-600">{t.emotionalHook.badge}</span>
          </div>
          <h2 className="text-xl md:text-4xl font-bold text-slate-900 mb-3 leading-snug break-keep">
            {t.emotionalHook.heading1}<br />
            <span className="text-rose-500">{t.emotionalHook.heading2}</span>
          </h2>
          <p className="text-slate-600 text-xs md:text-base max-w-xl mx-auto leading-relaxed px-2 break-keep">
            {t.emotionalHook.subtext} <span className="text-slate-900 font-semibold">{t.emotionalHook.subtextBold}</span>{t.emotionalHook.subtextEnd}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto mb-12">
          {urgencyStats.map((stat, index) => (
            <div key={index} className="text-center p-3 md:p-4 bg-white shadow-sm rounded-xl border border-slate-200">
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 ${stat.color.replace('-400', '-500')}`} />
              <div className={`text-xl md:text-2xl font-bold ${stat.color.replace('-400', '-600')}`}>{stat.value}</div>
              <div className="text-[10px] md:text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2">
          {emotionalStories.map((story, index) => (
            <button key={index} onClick={() => handleStoryClick(index)} className={`flex-shrink-0 px-3 py-2 rounded-full text-sm transition-all ${activeStory === index ? 'bg-rose-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <span className="mr-1">{story.emoji}</span>
              <span className="hidden sm:inline">{story.situation.slice(0, 10)}...</span>
            </button>
          ))}
        </div>

        <motion.div key={activeStory} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
          <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{currentStory.emoji}</span>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">"{currentStory.situation}"</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{currentStory.pain}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 my-4 pl-10">
              <div className="h-px flex-1 bg-gradient-to-r from-rose-300 to-transparent" />
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-xs text-rose-600 font-medium">{t.emotionalHook.afterTest}</span>
              <div className="h-px flex-1 bg-gradient-to-l from-rose-300 to-transparent" />
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4">
              <p className="text-rose-700 text-sm font-medium">💡 {currentStory.discovery}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold text-sm">{t.common.result}</span>
              </div>
              <p className="text-emerald-700 text-sm">{currentStory.result}</p>
              <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">✨ {currentStory.highlight}</Badge>
            </div>
            <div className="border-l-2 border-rose-300 pl-4 mb-5">
              <p className="text-slate-700 italic text-sm md:text-base">"{currentStory.quote}"</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{currentStory.author.charAt(0)}</div>
                <div>
                  <p className="text-slate-800 text-sm font-medium">{currentStory.author}</p>
                  <p className="text-slate-400 text-xs">{currentStory.authorDetail}</p>
                </div>
                <div className="flex gap-0.5 ml-auto">
                  {[...Array(5)].map((_, i) => (<Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentStory.tags.map((tag, i) => (<Badge key={i} variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">#{tag}</Badge>))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-12 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{t.emotionalHook.videoTitle}</h3>
            <p className="text-slate-500 text-sm">{t.emotionalHook.videoSubtitle}</p>
          </div>
          <div className="relative aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group" onClick={() => setShowVideo(true)}>
            {showVideo ? (
              <iframe src="https://www.youtube-nocookie.com/embed/26ss_PllVrQ?autoplay=1&rel=0&modestbranding=1" title="AIHUMANPRO Demo" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-purple-100" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 shadow-lg flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
                    <Play className="w-8 h-8 text-rose-500 ml-1" fill="currentColor" />
                  </motion.div>
                  <span className="text-slate-800 font-medium text-sm md:text-base">{t.emotionalHook.videoPlay}</span>
                  <span className="text-slate-500 text-xs mt-1">{t.emotionalHook.videoDuration}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  {[t.emotionalHook.videoStep1, t.emotionalHook.videoStep2, t.emotionalHook.videoStep3].map((step, i) => (
                    <div key={i} className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-slate-200">
                      <span className="text-[10px] md:text-xs text-slate-700">{i + 1}. {step}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 md:p-6 bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl border border-rose-200">
            <div className="text-left">
              <p className="text-slate-900 font-bold text-base md:text-lg mb-1">{t.emotionalHook.finalCtaTitle}</p>
              <p className="text-slate-600 text-sm">{t.emotionalHook.finalCtaDesc} <span className="text-amber-600 font-semibold">{t.emotionalHook.finalCtaFree}</span>.</p>
            </div>
            <Button onClick={() => navigate(localePath('/premium-assessment'))} className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold px-6 py-6 rounded-xl shadow-lg shadow-rose-500/25">
              {t.emotionalHook.finalCtaButton}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-slate-500 text-xs">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {t.emotionalHook.trustAnonymous}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t.emotionalHook.trustUsers}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {t.emotionalHook.trustInstant}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmotionalHookSection;
