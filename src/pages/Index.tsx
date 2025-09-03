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
import FloatingChatCTA from "@/components/FloatingChatCTA";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  console.log('🏠 Index.tsx: Index page component rendering...');
  
  const [searchParams] = useSearchParams();
  const { processReferralReward } = useReferrals();
  const { toast } = useToast();

  useEffect(() => {
    const checkReferralCode = async () => {
      const refCode = searchParams.get('ref');
      if (refCode) {
        console.log('📍 Referral code detected:', refCode);
        
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
            console.log('🔄 User logged in, processing referral reward...');
            // 사용자가 로그인된 상태에서만 추천 보상 처리
            const success = await processReferralReward(refCode);
            console.log('✅ Referral reward processed:', success);
            
            if (success !== undefined) {
              localStorage.removeItem('referralCode');
              if (success) {
                toast({
                  title: "🎉 추천 보상 완료!",
                  description: "5토큰을 받았고, 추천인은 10토큰을 받았습니다!",
                });
              }
            }
          } else {
            console.log('👋 No user, showing welcome toast');
            toast({
              title: "🎉 추천 링크로 접속했습니다!",
              description: "회원가입하시면 본인은 5토큰, 추천인은 10토큰을 받아요!",
            });
          }
        } catch (error) {
          console.error('Referral check error:', error);
          // 에러가 발생해도 토스트는 표시
          toast({
            title: "🎉 추천 링크로 접속했습니다!",
            description: "회원가입하시면 본인은 5토큰, 추천인은 10토큰을 받아요!",
          });
        }
      }
    };

    checkReferralCode();
  }, [searchParams, processReferralReward, toast]);

  return (
    <div className="min-h-screen">
      <ScrollProgressBar />
      <UnifiedNavigation />
      <div className="flex">
        {/* Product Sidebar */}
        <div className="hidden lg:block fixed left-0 top-16 z-30 h-full">
          <ProductSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-72">
          <div className="animate-fade-in">
            <HeroSection />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <TechBadgeShowcase />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <PlatformOverview />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <ClientLogos />
          </div>
          <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <ReferralWidget />
            <ReferralCodeInput />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <VideoShowcase />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <TrustIndicators />
          </div>
        </div>
      </div>
      
      {/* Floating Chat CTA */}
      <FloatingChatCTA />
    </div>
  );
};

export default Index;
