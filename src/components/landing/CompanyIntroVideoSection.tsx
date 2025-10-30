import React from 'react';
import YouTubePlayer from '@/components/ui/youtube-player';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CompanyIntroVideoSection = () => {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
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
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-brand-gradient">AI하이라이트PRO</span>를 소개합니다
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI와 전문가가 함께하는 전생애 통합 케어 서비스,
            <br />
            3분 만에 시작하는 당신의 심리건강 여정
          </p>
        </div>

        {/* Video Container */}
        <div className="relative group">
          {/* Video Thumbnail with Play Button */}
          <YouTubePlayer
            title="AI하이라이트PRO 회사 소개 영상"
            youtubeUrl="https://www.youtube.com/watch?v=oe7ZTRkqMf8&t=13s"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-primary/20 hover:scale-[1.02]">
              {/* Thumbnail Image */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center space-y-6">
                  {/* Play Button */}
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/50">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                  
                  {/* Text */}
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-foreground">
                      소개 영상 보기
                    </p>
                    <p className="text-muted-foreground">
                      2분으로 알아보는 AI하이라이트PRO
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </YouTubePlayer>

          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="text-3xl font-bold text-brand-gradient mb-2">3분</div>
            <p className="text-sm text-muted-foreground">빠른 AI 심리검사</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="text-3xl font-bold text-brand-gradient mb-2">1,247+</div>
            <p className="text-sm text-muted-foreground">누적 사용자</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="text-3xl font-bold text-brand-gradient mb-2">4.8/5.0</div>
            <p className="text-sm text-muted-foreground">사용자 만족도</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyIntroVideoSection;
