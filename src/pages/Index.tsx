import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import HeroSection from "@/components/HeroSection";
import ProblemVisionSection from "@/components/landing/ProblemVisionSection";
import CoreServiceSection from "@/components/landing/CoreServiceSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ResultReportSection from "@/components/landing/ResultReportSection";
import CTABannerSection from "@/components/landing/CTABannerSection";
import PartnerTrustSection from "@/components/landing/PartnerTrustSection";
import SafetyFirstSection from "@/components/landing/SafetyFirstSection";
import FixedCTAButton from "@/components/landing/FixedCTAButton";
import TestimonialSection from "@/components/TestimonialSection";
import ClientLogos from "@/components/ClientLogos";
import BackToTop from "@/components/common/BackToTop";
import SEOHead from "@/components/common/SEOHead";
import { SkipLink } from "@/components/ui/skip-link";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import Footer from '@/components/ui/footer';

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
        title="AI하이라이트PRO - 전생애 통합 케어 플랫폼"
        description="AI와 전문가가 함께하는 통합 케어 서비스. ADHD, 우울증, 스트레스 검사부터 심리상담, 발달평가, 건강관리까지 전생애 케어를 제공합니다."
        keywords="AI케어,통합케어,심리상담,발달평가,건강관리,ADHD검사,우울증검사,전문상담"
      />
      <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
      
      <div className="min-h-screen max-w-full overflow-x-hidden">
        <ScrollProgressBar />
        <UnifiedNavigation />
        
        <main id="main-content" className="w-full">
          {/* 1️⃣ Hero Section */}
          <HeroSection />
          
          {/* 2️⃣ Problem & Vision */}
          <ProblemVisionSection />
          
          {/* 3️⃣ Safety First - Hippocratic AI 스타일 */}
          <SafetyFirstSection />
          
          {/* 4️⃣ Core Service */}
          <CoreServiceSection />
          
          {/* 5️⃣ How It Works */}
          <HowItWorksSection />
          
          {/* 6️⃣ Result / Report */}
          <ResultReportSection />
          
          {/* Trust & Partner Section */}
          <PartnerTrustSection />
          
          {/* Social Proof */}
          <TestimonialSection />
          <ClientLogos />
          
          {/* 7️⃣ Call to Action */}
          <CTABannerSection />
          
          {/* 8️⃣ Footer */}
          <Footer />
        </main>
        
        {/* Fixed CTA Button (Mobile + Desktop) */}
        <FixedCTAButton />
        
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
