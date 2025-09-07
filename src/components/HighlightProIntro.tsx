import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

const HighlightProIntro = () => {
  const handlePlayVideo = () => {
    window.open('https://mblogvideo-phinf.pstatic.net/MjAyNTA5MDRfMTAy/MDAxNzU2OTY3MzUyMjIw.1lxNFQYvs6QQf8-rqL1BTTMvdg_oGua8HwIEO9i7VKkg.aK6OFSLJp8G-WbHFVWa8HUNyNNurgt5odaoWjCneuJIg.GIF/000000000000.gif?type=mp4w800', '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          3분으로 이해하는
        </h2>
        <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
          HIGHLIGHT PRO
        </h3>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          이용자들의 경험과 AI와야나운서를 통해 우리 플랫폼이 어떻게 도움이 되는지 
          확인해보세요
        </p>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 border-muted/20">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              {/* Play Button */}
              <Button
                onClick={handlePlayVideo}
                size="lg"
                className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </Button>
            </div>
            
            {/* Video Info */}
            <div className="p-6 text-center">
              <h4 className="text-xl font-semibold mb-2">플랫폼 소개 영상</h4>
              <p className="text-muted-foreground">AI 통합건강 케어의 새로운 경험</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">3분</div>
            <div className="text-sm text-muted-foreground">빠른 이해</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">AI + 전문가</div>
            <div className="text-sm text-muted-foreground">2단계 검증</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">언제든 이용</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightProIntro;