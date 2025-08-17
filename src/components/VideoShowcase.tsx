import { Play, Volume2, Users, Award } from "lucide-react";
import { useState } from "react";

const VideoShowcase = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-brand-gradient">3분</span>으로 이해하는
            <br />AI하이라이트프로
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            실제 이용자들의 경험과 전문가 인터뷰를 통해 
            우리 플랫폼이 어떻게 도움이 되는지 확인해보세요
          </p>
        </div>

        {/* Main Video */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative bg-card rounded-2xl overflow-hidden shadow-2xl border">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
              {!isPlaying ? (
                <div className="text-center">
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-105 mb-4"
                  >
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </button>
                  <h3 className="text-xl font-semibold mb-2">플랫폼 소개 영상</h3>
                  <p className="text-muted-foreground">AI 정신건강 케어의 새로운 경험</p>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/90">
                  {/* YouTube 임베드 예시 - 실제 영상 URL로 교체 필요 */}
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="AI하이라이트프로 소개 영상"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Highlights */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-6 shadow-lg border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">사용자 후기</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              "처음엔 AI 상담이 어색했는데, 정말 정확하게 제 마음을 읽어주더라고요"
            </p>
            <div className="text-xs text-muted-foreground">김○○님 (30대)</div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">전문가 추천</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              "데이터 기반 분석으로 더 정확한 진단이 가능해졌습니다"
            </p>
            <div className="text-xs text-muted-foreground">박○○ 정신건강의학과 전문의</div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">라이브 데모</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              "실시간으로 AI 분석 과정을 보여드립니다"
            </p>
            <button 
              onClick={() => window.location.href = '/assessment'}
              className="text-xs text-primary hover:underline"
            >
              직접 체험해보기 →
            </button>
          </div>
        </div>

        {/* Video CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <Play className="w-4 h-4" />
            더 많은 영상은 유튜브 채널에서 확인하세요
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;