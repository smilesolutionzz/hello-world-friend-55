import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import HeroSection from "@/components/HeroSection";
import PlatformOverview from "@/components/PlatformOverview";
import VideoShowcase from "@/components/VideoShowcase";
import TrustIndicators from "@/components/TrustIndicators";
import ClientLogos from "@/components/ClientLogos";
import KakaoTalkWidget from "@/components/KakaoTalkWidget";
import ReferralWidget from "@/components/ReferralWidget";
import ProductSidebar from "@/components/ProductSidebar";
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchParams] = useSearchParams();
  const { processReferralReward } = useReferrals();
  const { toast } = useToast();

  useEffect(() => {
    const checkReferralCode = async () => {
      const refCode = searchParams.get('ref');
      if (refCode) {
        // Store referral code in localStorage for later use during signup
        localStorage.setItem('referralCode', refCode);
        
        // Check if user is already logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Process immediately if user is already logged in
          const success = await processReferralReward(refCode);
          if (success !== undefined) {
            localStorage.removeItem('referralCode');
          }
        } else {
          toast({
            title: "🎉 추천 링크로 접속했습니다!",
            description: "회원가입하시면 추천인에게 10토큰이 지급됩니다.",
          });
        }
      }
    };

    checkReferralCode();
  }, [searchParams, processReferralReward, toast]);

  return (
    <div className="min-h-screen">
      <UnifiedNavigation />
      <div className="flex">
        {/* Product Sidebar with Badge */}
        <div className="hidden lg:block fixed left-0 top-16 z-30 h-full">
          {/* Floating Badge above sidebar */}
          <div className="absolute -top-4 left-4 z-40">
            <div className="relative">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg animate-pulse">✨</span>
                  <span className="text-sm font-bold">AI 심리분석 1위</span>
                  <span className="text-lg animate-bounce">🏆</span>
                </div>
              </div>
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full blur-lg opacity-50 -z-10"></div>
            </div>
          </div>
          <ProductSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-72">
          <HeroSection />
          <PlatformOverview />
          <ClientLogos />
          <div className="container mx-auto px-4 py-8">
            <ReferralWidget />
          </div>
          <VideoShowcase />
          <TrustIndicators />
          <KakaoTalkWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;
