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
import BackToTop from "@/components/common/BackToTop";
import SEOHead from "@/components/common/SEOHead";
import { PageContainer } from "@/components/ui/page-container";
import { SkipLink } from "@/components/ui/skip-link";
import IndexFallback from "@/components/IndexFallback";
import ErrorBoundary from "@/components/ui/error-boundary";

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
  try {
    console.log('🏠 Index.tsx: Index page component rendering...');
    console.log('🏠 Index.tsx: Starting initialization...');
    
    const [searchParams] = useSearchParams();
    const { processReferralReward } = useReferrals();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [showGuideComplete, setShowGuideComplete] = useState(false);

    console.log('🏠 Index.tsx: State initialized successfully');

  useEffect(() => {
    // Check for current user
    const checkUser = async () => {
      try {
        console.log('🏠 Index.tsx: Checking user...');
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('🏠 Index.tsx: Error getting user:', error);
        } else {
          console.log('🏠 Index.tsx: User check successful:', user ? 'logged in' : 'not logged in');
        }
        setUser(user);
      } catch (error) {
        console.error('🏠 Index.tsx: Exception in checkUser:', error);
      }
    };
    
    checkUser();
    
    // Listen for auth changes
    try {
      console.log('🏠 Index.tsx: Setting up auth listener...');
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('🏠 Index.tsx: Auth state changed:', event);
        setUser(session?.user ?? null);
      });

      return () => {
        console.log('🏠 Index.tsx: Cleaning up auth listener...');
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('🏠 Index.tsx: Error setting up auth listener:', error);
    }
  }, []); // 빈 dependency array로 한 번만 실행

  useEffect(() => {
    const checkReferralCode = async () => {
      try {
        console.log('🏠 Index.tsx: Starting referral code check...');
        const refCode = searchParams.get('ref');
        if (refCode) {
          console.log('📍 Referral code detected:', refCode);
          
          // Store referral code in localStorage for later use during signup
          localStorage.setItem('referralCode', refCode);
          
          try {
            // 안전하게 유저 정보 확인
            console.log('🏠 Index.tsx: Getting user for referral processing...');
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
        } else {
          console.log('🏠 Index.tsx: No referral code in URL');
        }
      } catch (error) {
        console.error('🏠 Index.tsx: Error in referral code check:', error);
        // 에러가 발생해도 페이지는 계속 로드되도록 함
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

  console.log('🏠 Index.tsx: About to render component...');

  return (
    <ErrorBoundary fallback={<IndexFallback />}>
      {/* SEOHead temporarily removed to fix HelmetProvider error */}
      <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
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
        <main id="main-content" className="w-full lg:ml-72">
          <ErrorBoundary fallback={<div className="p-8 text-center">Hero Section 로딩 중...</div>}>
            <div className="animate-fade-in w-full">
              <HeroSection />
            </div>
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div className="p-8 text-center">Video Showcase 로딩 중...</div>}>
            <div className="animate-fade-in w-full" style={{ animationDelay: '0.1s' }}>
              <VideoShowcase />
            </div>
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div className="p-8 text-center">Tech Badge 로딩 중...</div>}>
            <div className="animate-fade-in w-full" style={{ animationDelay: '0.2s' }}>
              <TechBadgeShowcase />
            </div>
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div className="p-8 text-center">Platform Overview 로딩 중...</div>}>
            <div className="animate-fade-in w-full" style={{ animationDelay: '0.3s' }}>
              <PlatformOverview />
            </div>
          </ErrorBoundary>
          
          {/* 보안 및 신뢰성 섹션 */}
          <ErrorBoundary fallback={<div className="p-8 text-center">Security 로딩 중...</div>}>
            <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.35s' }}>
              <SecurityTrustIndicators />
            </div>
          </ErrorBoundary>
          
          {/* 전문가 검증 데모 */}
          <ErrorBoundary fallback={<div className="p-8 text-center">Expert Verification 로딩 중...</div>}>
            <div className="container mx-auto px-4 py-4 animate-fade-in w-full" style={{ animationDelay: '0.37s' }}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">AI + 전문가 2단계 검증 시스템</h2>
                <p className="text-muted-foreground">모든 분석 결과는 전문가가 2차 검토합니다</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <ExpertVerificationBadge status="ai_analysis" />
                <ExpertVerificationBadge status="pending_expert" />
                <ExpertVerificationBadge status="expert_reviewed" expertName="매칭된 실제 전문가" />
                <ExpertVerificationBadge status="verified" />
              </div>
            </div>
          </ErrorBoundary>
          
          {/* 실제 사례 및 후기 */}
          <ErrorBoundary fallback={<div className="p-8 text-center">Testimonials 로딩 중...</div>}>
            <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold text-center mb-6">실제 이용 후기</h2>
              <TestimonialSection />
            </div>
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div className="p-8 text-center">Client Logos 로딩 중...</div>}>
            <div className="animate-fade-in w-full" style={{ animationDelay: '0.42s' }}>
              <ClientLogos />
            </div>
          </ErrorBoundary>
          
          {/* 커뮤니티 플랫폼 */}
          <ErrorBoundary fallback={<div className="p-8 text-center">Community 로딩 중...</div>}>
            <div className="container mx-auto px-4 py-8 animate-fade-in w-full" style={{ animationDelay: '0.45s' }}>
              <CommunityPlatform />
            </div>
          </ErrorBoundary>
          
          <ErrorBoundary fallback={<div className="p-8 text-center">Referral 로딩 중...</div>}>
            <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in w-full" style={{ animationDelay: '0.5s' }}>
              <ReferralWidget />
              <ReferralCodeInput />
            </div>
          </ErrorBoundary>
          
          {user && (
            <ErrorBoundary fallback={<div className="p-8 text-center">Next Step 로딩 중...</div>}>
              <div className="container mx-auto px-4 py-6 animate-fade-in w-full" style={{ animationDelay: '0.55s' }}>
                <NextStepSuggestion />
              </div>
            </ErrorBoundary>
          )}
          
          <ErrorBoundary fallback={<div className="p-8 text-center">Trust Indicators 로딩 중...</div>}>
            <div className="animate-fade-in w-full" style={{ animationDelay: '0.6s' }}>
              <TrustIndicators />
            </div>
          </ErrorBoundary>
        </main>
      </div>
      <BackToTop />
    </div>
    </ErrorBoundary>
  );
  } catch (error) {
    console.error('🚨 Index.tsx: Critical error in Index component:', error);
    // ErrorBoundary에서 처리할 수 있도록 에러를 다시 throw
    throw error;
  }
};

export default Index;
