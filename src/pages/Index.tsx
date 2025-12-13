import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import ModernNavigation from "@/components/navigation/ModernNavigation";
import ModernHeroSection from "@/components/landing/ModernHeroSection";
import InstantAIAnalysis from "@/components/InstantAIAnalysis";
import SimplifiedCoreServices from "@/components/landing/SimplifiedCoreServices";
import DataDrivenReportSection from "@/components/landing/DataDrivenReportSection";
import CTABannerSection from "@/components/landing/CTABannerSection";
import ValueComparisonSection from "@/components/landing/ValueComparisonSection";
import TestimonialSection from "@/components/TestimonialSection";
import ClientLogos from "@/components/ClientLogos";
import { NewFeaturesSection } from "@/components/landing/NewFeaturesSection";
import BackToTop from "@/components/common/BackToTop";
import SEOHead from "@/components/common/SEOHead";
import { SkipLink } from "@/components/ui/skip-link";
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import Footer from '@/components/ui/footer';
import { LazyLoad } from '@/components/ui/lazy-load';
import { MetaverseUnifiedSection } from '@/components/landing/MetaverseUnifiedSection';
import ErrorBoundary from '@/components/ui/error-boundary';
import { PlatformGuideFAQButton } from '@/components/faq/PlatformGuideFAQ';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AIHUMANPRO",
  "url": "https://aihpro.com",
  "description": "AI와 전문가가 함께하는 통합 케어 서비스. ADHD, 우울증, 스트레스 검사부터 심리상담, 발달평가, 건강관리까지 전생애 케어를 제공합니다.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "KRW"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1247"
  }
};

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
    let isMounted = true;
    
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
          
          if (!isMounted) return; // 컴포넌트가 unmount되면 중단
          
          if (user && !error) {
            console.log('🔄 User logged in, processing referral reward...');
            // 사용자가 로그인된 상태에서만 추천 보상 처리
            const success = await processReferralReward(refCode);
            console.log('✅ Referral reward processed:', success);
            
            if (!isMounted) return; // 컴포넌트가 unmount되면 중단
            
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
            if (!isMounted) return;
            console.log('👋 No user, showing welcome toast');
            toast({
              title: "🎉 추천 링크로 접속했습니다!",
              description: "회원가입하시면 본인은 5토큰, 추천인은 10토큰을 받아요!",
            });
          }
        } catch (error) {
          if (!isMounted) return;
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
    
    return () => {
      isMounted = false; // cleanup: 컴포넌트 unmount 시 플래그 설정
    };
  }, [searchParams, processReferralReward, toast]);

  const handleGuideComplete = useCallback(() => {
    setShowGuideComplete(true);
    toast({
      title: "가이드 완료! 🎉",
      description: "이제 HIGHLIGHT PRO와 함께 심리건강 여정을 시작해보세요!",
    });
  }, [toast]);

  const handleOnboardingClose = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding_completed', 'true');
  }, []);

  return (
    <>
      <SEOHead 
        title="AIHPRO | AI 기반 통합 케어 플랫폼 - 전생애 통합 건강관리 서비스"
        description="3분 만에 완성하는 AI 심리검사. ADHD, 우울증, 스트레스 검사부터 전문가 상담까지. 검증된 전문가와 함께하는 전생애 통합 케어 서비스."
        keywords="AIHPRO,AI심리검사,ADHD검사,우울증테스트,스트레스검사,심리상담,발달평가,온라인상담,정신건강,아동발달,심리분석"
        canonicalUrl="https://aihpro.com"
        structuredData={structuredData}
      />
      <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
      
      <ErrorBoundary>
        <div className="min-h-screen max-w-full overflow-x-hidden">
          <ModernNavigation />
          
          <main id="main-content" className="w-full">
          {/* Hero - 첫인상 */}
          <ModernHeroSection />
          
          {/* 핵심 기능: 한마디 입력 → AI 분석 리포트 */}
          <InstantAIAnalysis />
          
          {/* 가치 제안 - 왜 선택해야 하는가 */}
          <LazyLoad rootMargin="200px">
            <ValueComparisonSection />
          </LazyLoad>
          
          {/* 핵심 서비스 3가지 */}
          <LazyLoad rootMargin="200px">
            <SimplifiedCoreServices />
          </LazyLoad>
          
          {/* AI 분석 리포트 데모 */}
          <LazyLoad rootMargin="200px">
            <DataDrivenReportSection />
          </LazyLoad>
          
          {/* 메타버스 AI 섹션 */}
          <LazyLoad rootMargin="200px">
            <MetaverseUnifiedSection />
          </LazyLoad>
          
          {/* 새 기능 소개 */}
          <LazyLoad rootMargin="200px">
            <NewFeaturesSection />
          </LazyLoad>
          
          {/* 사회적 증거 - 리뷰 */}
          <LazyLoad rootMargin="200px">
            <TestimonialSection />
          </LazyLoad>
          
          {/* 파트너 & 신뢰 */}
          <LazyLoad rootMargin="200px">
            <ClientLogos />
          </LazyLoad>
          
          {/* CTA - 최종 전환 */}
          <LazyLoad rootMargin="200px">
            <CTABannerSection />
          </LazyLoad>
          
          {/* Footer */}
          <Footer />
        </main>
        
          <BackToTop />
          <PlatformGuideFAQButton />
          
          {/* 온보딩 모달 */}
          <WelcomeOnboarding 
            isOpen={showOnboarding} 
            onClose={handleOnboardingClose} 
          />
        </div>
      </ErrorBoundary>
    </>
  );
};

export default Index;
