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

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        {/* Main Headline */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="block text-foreground mb-2">랜챗음적을 넣어서면</span>
            <span className="block text-brand-gradient">해질이 시작되죠</span>
          </h1>
          
          <div className="space-y-3 text-xl md:text-2xl">
            <p className="text-brand-gradient font-semibold">
              "불안을 데이터로 안심을 리포트로"
            </p>
            <p className="text-muted-foreground text-lg">
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