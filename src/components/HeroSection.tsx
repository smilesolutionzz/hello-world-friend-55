import ChatInterface from "./ChatInterface";

const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-warm-lavender/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
        {/* Main Headline */}
        <div className="text-center mb-8 sm:mb-16 space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
            <span className="block text-foreground mb-1 sm:mb-2">데이터로 읽는 마음,</span>
            <span className="block text-brand-gradient">AI하이라이트프로</span>
          </h1>
          
          <div className="space-y-2 sm:space-y-3 text-lg sm:text-xl md:text-2xl">
            <p className="text-brand-gradient font-semibold">
              "불안을 데이터로 안심을 리포트로"
            </p>
            <p className="text-muted-foreground text-base sm:text-lg">
              한 문장으로 시작해보세요
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface />
      </div>
    </div>
  );
};

export default HeroSection;