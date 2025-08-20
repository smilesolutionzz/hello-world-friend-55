import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import PlatformOverview from "@/components/PlatformOverview";
import VideoShowcase from "@/components/VideoShowcase";
import TrustIndicators from "@/components/TrustIndicators";
import KakaoTalkWidget from "@/components/KakaoTalkWidget";
import ReferralWidget from "@/components/ReferralWidget";
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
      <Navigation />
      <HeroSection />
      <PlatformOverview />
      <div className="container mx-auto px-4 py-8">
        <ReferralWidget />
      </div>
      <VideoShowcase />
      <TrustIndicators />
      <KakaoTalkWidget />
    </div>
  );
};

export default Index;
