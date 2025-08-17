import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import PlatformOverview from "@/components/PlatformOverview";
import VideoShowcase from "@/components/VideoShowcase";
import TrustIndicators from "@/components/TrustIndicators";
import KakaoTalkWidget from "@/components/KakaoTalkWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <PlatformOverview />
      <VideoShowcase />
      <TrustIndicators />
      <KakaoTalkWidget />
    </div>
  );
};

export default Index;
