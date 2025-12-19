import React, { useState } from 'react';
import { Play } from 'lucide-react';
import companyIntroBg from '@/assets/company-intro-bg.jpg';

const CompanyIntroVideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url(${companyIntroBg})` }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/80" />
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block">
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              회사 소개
            </span>
          </div>
          <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            <span className="text-brand-gradient">AIHUMANPRO</span>를 소개합니다
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-foreground drop-shadow-md max-w-2xl mx-auto">
            AI와 전문가가 함께하는 전생애 통합 케어 서비스,<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>3분 만에 시작하는 당신의 심리건강 여정
          </p>
        </div>

        {/* Video Container */}
        <div className="relative group">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-primary/20">
            {!isPlaying ? (
              /* Thumbnail with Play Button */
              <div 
                className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <div className="text-center space-y-6">
                  {/* Play Button */}
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/50">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                  
                  {/* Text */}
                  <div className="space-y-1">
                    <p className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                      소개 영상 보기
                    </p>
                    <p className="text-xs sm:text-sm text-foreground drop-shadow-md">
                      3분 동화로 알아보는 AIHUMANPRO
                    </p>
                  </div>
                </div>

                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ) : (
              /* YouTube Player */
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/EAYwe4C8nds?autoplay=1&rel=0&modestbranding=1"
                  title="AIHUMANPRO 회사 소개 영상"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
    </section>
  );
};

export default CompanyIntroVideoSection;
