import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import ExpertValidationBanner from "@/components/ExpertValidationBanner";
import { BetaBanner } from "@/components/BetaBanner";
import HeroSection from "@/components/HeroSection";
import PlatformOverview from "@/components/PlatformOverview";
import VideoShowcase from "@/components/VideoShowcase";
import TrustIndicators from "@/components/TrustIndicators";
import ClientLogos from "@/components/ClientLogos";
import SecurityTrustIndicators from "@/components/SecurityTrustIndicators";
import TestimonialSection from "@/components/TestimonialSection";
import CommunityPlatform from "@/components/CommunityPlatform";
import ExpertVerificationBadge from "@/components/ExpertVerificationBadge";
import BackToTop from "@/components/common/BackToTop";
import SEOHead from "@/components/common/SEOHead";
import { PageContainer } from "@/components/ui/page-container";
import { SkipLink } from "@/components/ui/skip-link";

import ReferralWidget from "@/components/ReferralWidget";
import ReferralCodeInput from "@/components/ReferralCodeInput";
import ProfessionalSidebar from "@/components/ProfessionalSidebar";
import { TechBadgeShowcase } from "@/components/TechBadgeShowcase";
import FloatingChatCTA from "@/components/FloatingChatCTA";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';
import MobileOptimizedLayout from '@/components/MobileOptimizedLayout';
import { PlatformGuide } from '@/components/onboarding/PlatformGuide';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import SimplifiedFlow from '@/components/mvp/SimplifiedFlow';
import QuickOnboarding from '@/components/mvp/QuickOnboarding';
import { SocialProofDisplay } from '@/components/apr-strategy/SocialProofDisplay';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  console.log('🏠 Index.tsx: Index page component rendering...');
  
  const [searchParams] = useSearchParams();
  const { processReferralReward } = useReferrals();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showGuideComplete, setShowGuideComplete] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showQuickOnboarding, setShowQuickOnboarding] = useState(false);

  useEffect(() => {
    // Check for current user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // 신규 사용자 또는 첫 방문자에게 온보딩 표시
      if (user && !localStorage.getItem('onboarding_completed')) {
        setShowOnboarding(true);
      }
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

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  return (
    <>
      <SEOHead 
        title="AI하이라이트PRO - AI 기반 통합 케어 플랫폼"
        description="AI와 전문가가 함께하는 종합 케어 플랫폼. 심리상담, 발달평가, 건강관리부터 전문기관 연계까지 전생애 통합 케어 서비스를 제공합니다."
        keywords="AI케어, 통합케어, 심리상담, 발달평가, 건강관리, 전문상담, 전생애케어"
      />
      <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
      <div className="min-h-screen max-w-full overflow-x-hidden">
        <PlatformGuide onComplete={handleGuideComplete} />
        <ScrollProgressBar />
        <UnifiedNavigation />
        
        {/* Main Content - Full Width */}
        <main id="main-content" className="w-full">
          {/* 베타 배너 */}
          <div className="container mx-auto px-4 pt-4">
            <BetaBanner />
          </div>

          {/* 1. Hero Section - 서비스 소개 */}
          <div className="animate-fade-in w-full">
            <HeroSection />
          </div>

          {/* APR 전략: 실시간 소셜 증명만 메인페이지에 유지 */}
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.03s' }}>
            <div className="container mx-auto px-4 py-8">
              <SocialProofDisplay />
            </div>
          </div>

          {/* MVP 단순화된 플로우 */}
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.05s' }}>
            <SimplifiedFlow onStepComplete={(step) => console.log('Step completed:', step)} />
          </div>
          
          {/* 2. 차별점 섹션 - "왜 우리가 다른지" */}
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.1s' }}>
            <ExpertValidationBanner />
          </div>
          
          {/* 3. VideoShowcase - 시각적 설명 */}
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.2s' }}>
            <VideoShowcase />
          </div>
          
          {/* 4. 기술 배지 - 신뢰성 강화 */}
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.3s' }}>
            <TechBadgeShowcase />
          </div>
          
          {/* 보안 및 신뢰성 섹션 */}
          <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.4s' }}>
            <SecurityTrustIndicators />
          </div>
          
          {/* 실제 사례 및 후기 */}
          <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-2xl font-bold text-center mb-6">실제 이용 후기</h2>
            <TestimonialSection />
          </div>
          
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.65s' }}>
            <ClientLogos />
          </div>
          
          {/* 커뮤니티 플랫폼 */}
          <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.7s' }}>
            <CommunityPlatform />
          </div>
          
          <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in w-full" style={{ animationDelay: '0.75s' }}>
            <ReferralWidget />
            <ReferralCodeInput />
          </div>
          {user && (
            <div className="container mx-auto px-4 py-6 animate-fade-in w-full" style={{ animationDelay: '0.8s' }}>
              <NextStepSuggestion />
            </div>
          )}
          <div className="animate-fade-in w-full" style={{ animationDelay: '0.85s' }}>
            <TrustIndicators />
          </div>
        </main>
      <BackToTop />
      
      {/* 온보딩 모달 */}
      <WelcomeOnboarding 
        isOpen={showOnboarding} 
        onClose={handleOnboardingClose} 
      />
    </div>
    </>
  );
};

export default Index;
