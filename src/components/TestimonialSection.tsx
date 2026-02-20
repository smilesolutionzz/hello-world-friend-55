import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, Quote, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const { t } = useTranslation();

  const testimonials = t.testimonials.items.map(item => ({ ...item, rating: 5 }));

  const handlePrev = () => setCurrentIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
  const handleNext = () => setCurrentIndex(prev => prev === testimonials.length - 1 ? 0 : prev + 1);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
  };

  const current = testimonials[currentIndex];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">{t.testimonials.badge}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white">{t.testimonials.heading}</h2>
        </motion.div>

        <div className="max-w-2xl mx-auto" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8">
            <Quote className="w-8 h-8 text-purple-400/50 mb-4" />
            <div className="flex gap-1 mb-4">
              {[...Array(current.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />))}
            </div>
            <h3 className="text-lg font-bold text-white mb-3">{current.title}</h3>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-5">{current.content}</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {current.tags.map((tag, i) => (<Badge key={i} variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs">{tag}</Badge>))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500">
                <AvatarFallback className="text-white text-sm font-bold">{current.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{current.name}</p>
                <p className="text-xs text-white/50">{current.role}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white"><ChevronLeft className="w-5 h-5" /></Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (<button key={i} onClick={() => setCurrentIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-purple-400 w-6' : 'bg-white/20'}`} />))}
            </div>
            <Button variant="ghost" size="icon" onClick={handleNext} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white"><ChevronRight className="w-5 h-5" /></Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
