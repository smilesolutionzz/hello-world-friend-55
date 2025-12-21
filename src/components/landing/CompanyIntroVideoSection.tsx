import React, { useState } from 'react';
import { Play } from 'lucide-react';

const CompanyIntroVideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-10 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            🎬 실제 검사는 이렇게 진행돼요
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            3분이면 끝나는 간편 검사 과정
          </h2>
        </div>

        {/* Video Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-card border border-border">
          {!isPlaying ? (
            <div 
              className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center cursor-pointer group"
              onClick={handlePlayClick}
            >
              {/* Play Button */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                </div>
                <p className="text-foreground/80 font-medium">영상 재생하기</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/26ss_PllVrQ?autoplay=1&rel=0&modestbranding=1"
                title="AIHUMANPRO 시연 영상"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CompanyIntroVideoSection;
