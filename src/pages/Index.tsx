import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import HeroSection from "@/components/HeroSection";
import PlatformOverview from "@/components/PlatformOverview";
import VideoShowcase from "@/components/VideoShowcase";
import TrustIndicators from "@/components/TrustIndicators";
import ClientLogos from "@/components/ClientLogos";

import ReferralWidget from "@/components/ReferralWidget";
import ReferralCodeInput from "@/components/ReferralCodeInput";
import ProductSidebar from "@/components/ProductSidebar";
import { TechBadgeShowcase } from "@/components/TechBadgeShowcase";
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
        
        try {
          // 안전하게 유저 정보 확인
          const { data: { user }, error } = await supabase.auth.getUser();
          
          // JWT 토큰 관련 에러는 무시하고 진행
          if (error && !error.message.includes('invalid claim') && !error.message.includes('bad_jwt')) {
            console.error('Auth error:', error);
            return;
          }
          
          if (user && !error) {
            // 사용자가 로그인된 상태에서만 추천 보상 처리
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
        } catch (error) {
          console.error('Referral check error:', error);
          // 에러가 발생해도 토스트는 표시
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
        {/* Product Sidebar */}
        <div className="hidden lg:block fixed left-0 top-16 z-30 h-full">
          <ProductSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-72">
          <HeroSection />
          <TechBadgeShowcase />
          <PlatformOverview />
          <ClientLogos />
          <div className="container mx-auto px-4 py-8 space-y-6">
            <ReferralWidget />
            <ReferralCodeInput />
          </div>
          <VideoShowcase />
          <TrustIndicators />
          
        </div>
      </div>
    </div>
  );
};

export default Index;
