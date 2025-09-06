import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import HeroSection from "@/components/HeroSection";
import PlatformOverview from "@/components/PlatformOverview";
import VideoShowcase from "@/components/VideoShowcase";
import TrustIndicators from "@/components/TrustIndicators";
import ClientLogos from "@/components/ClientLogos";
import SecurityTrustIndicators from "@/components/SecurityTrustIndicators";
import TestimonialSection from "@/components/TestimonialSection";
import CommunityPlatform from "@/components/CommunityPlatform";
import ExpertVerificationBadge from "@/components/ExpertVerificationBadge";

import ReferralWidget from "@/components/ReferralWidget";
import ReferralCodeInput from "@/components/ReferralCodeInput";
import ProductSidebar from "@/components/ProductSidebar";
import { TechBadgeShowcase } from "@/components/TechBadgeShowcase";
import FloatingChatCTA from "@/components/FloatingChatCTA";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';
import { PlatformGuide } from '@/components/onboarding/PlatformGuide';

const Index = () => {
  console.log('🏠 Index.tsx: Index page component rendering...');
  
  const [searchParams] = useSearchParams();
  const { processReferralReward } = useReferrals();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [showGuideComplete, setShowGuideComplete] = useState(false);

  useEffect(() => {
    // Check for current user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []); // 빈 dependency array로 한 번만 실행

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
  }, [searchParams]); // searchParams만 의존성으로 추가

  const handleGuideComplete = () => {
    setShowGuideComplete(true);
    toast({
      title: "가이드 완료! 🎉",
      description: "이제 HIGHLIGHT PRO와 함께 심리건강 여정을 시작해보세요!",
    });
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden">
      <PlatformGuide onComplete={handleGuideComplete} />
      <ScrollProgressBar />
      <UnifiedNavigation />
      <div className="flex max-w-full">
        {/* Product Sidebar - 모바일에서는 완전히 숨김 */}
        <div className="hidden lg:block fixed left-0 top-16 z-30 h-full">
          <ProductSidebar />
        </div>
        
        {/* Main Content - 모바일에서는 여백 없음 */}
        <div className="w-full lg:ml-72">
          <div className="animate-fade-in w-full">
            <HeroSection />
          </div>
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.1s' }}>
            <VideoShowcase />
          </div>
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.2s' }}>
            <TechBadgeShowcase />
          </div>
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.3s' }}>
            <PlatformOverview />
          </div>
          
          {/* 보안 및 신뢰성 섹션 */}
          <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.35s' }}>
            <SecurityTrustIndicators />
          </div>
          
          {/* 전문가 검증 데모 */}
          <div className="container mx-auto px-4 py-4 animate-fade-in w-full" style={{ animationDelay: '0.37s' }}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">AI + 전문가 2단계 검증 시스템</h2>
              <p className="text-muted-foreground">모든 분석 결과는 전문가가 2차 검토합니다</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <ExpertVerificationBadge status="ai_analysis" />
              <ExpertVerificationBadge status="pending_expert" />
              <ExpertVerificationBadge status="expert_reviewed" expertName="김소아과 원장" />
              <ExpertVerificationBadge status="verified" />
            </div>
          </div>
          
          {/* 실제 사례 및 후기 */}
          <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-bold text-center mb-6">실제 이용 후기</h2>
            <TestimonialSection />
          </div>
          
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.42s' }}>
            <ClientLogos />
          </div>
          
          {/* 커뮤니티 플랫폼 */}
          <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.45s' }}>
            <CommunityPlatform />
          </div>
          <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in w-full" style={{ animationDelay: '0.5s' }}>
            <ReferralWidget />
            <ReferralCodeInput />
          </div>
          {user && (
            <div className="container mx-auto px-4 py-6 animate-fade-in w-full" style={{ animationDelay: '0.55s' }}>
              <NextStepSuggestion />
            </div>
          )}
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.6s' }}>
            <TrustIndicators />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
