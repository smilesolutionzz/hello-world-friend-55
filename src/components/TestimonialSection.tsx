import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, Quote, Award } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const TestimonialSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const { t } = useTranslation();

  const testimonials = t.testimonials.items.map(item => ({ ...item, rating: 5 }));
  const cardsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / cardsPerPage);

  const getPageItems = (page: number) => {
    const start = page * cardsPerPage;
    return testimonials.slice(start, start + cardsPerPage);
  };

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentPage(prev => prev === 0 ? totalPages - 1 : prev - 1);
  }, [totalPages]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentPage(prev => prev === totalPages - 1 ? 0 : prev + 1);
  }, [totalPages]);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 10000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
    touchStartX.current = null;
  };

  const currentItems = getPageItems(currentPage);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

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

        <div className="max-w-6xl mx-auto" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="relative min-h-[380px] md:min-h-[320px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {currentItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col"
                  >
                    <Quote className="w-6 h-6 text-purple-400/50 mb-3" />
                    <div className="flex gap-1 mb-3">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-4 flex-1 line-clamp-4">{item.content}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-[10px] px-2 py-0.5">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <Avatar className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500">
                        <AvatarFallback className="text-white text-xs font-bold">{item.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-white">{item.name}</p>
                        <p className="text-[10px] text-white/50">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 스와이프 힌트 애니메이션 */}
          <motion.div
            className="flex items-center justify-center gap-2 mt-4 text-white/40 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronLeft className="w-3 h-3" />
            <span>밀어서 더 많은 후기 보기</span>
            <ChevronRight className="w-3 h-3" />
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-3">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > currentPage ? 1 : -1); setCurrentPage(i); }}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-purple-400 w-6' : 'bg-white/20 w-2 hover:bg-white/40'}`}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={handleNext} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* 총 리뷰 수 표시 */}
          <p className="text-center text-white/30 text-xs mt-3">
            {currentPage + 1} / {totalPages} 페이지 · 총 {testimonials.length}개의 실제 후기
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
