import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import HeroSection from "@/components/HeroSection";
import ProblemVisionSection from "@/components/landing/ProblemVisionSection";
import CoreServiceSection from "@/components/landing/CoreServiceSection";
import DataDrivenReportSection from "@/components/landing/DataDrivenReportSection";
import ResultReportSection from "@/components/landing/ResultReportSection";
import CTABannerSection from "@/components/landing/CTABannerSection";
import PartnerTrustSection from "@/components/landing/PartnerTrustSection";

import ValueComparisonSection from "@/components/landing/ValueComparisonSection";
import FixedCTAButton from "@/components/landing/FixedCTAButton";
import TestimonialSection from "@/components/TestimonialSection";
import ClientLogos from "@/components/ClientLogos";
import { NewFeaturesSection } from "@/components/landing/NewFeaturesSection";
import FounderLetterSection from "@/components/landing/FounderLetterSection";
import BackToTop from "@/components/common/BackToTop";
import SEOHead from "@/components/common/SEOHead";
import { SkipLink } from "@/components/ui/skip-link";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import Footer from '@/components/ui/footer';
import { LazyLoad } from '@/components/ui/lazy-load';
import CompanyIntroVideoSection from '@/components/landing/CompanyIntroVideoSection';
import CompanyServicesSection from '@/components/landing/CompanyServicesSection';
import InsurancePartnerSection from '@/components/landing/InsurancePartnerSection';

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
        title="AIHUMANPRO - AI 심리검사 및 전문가 상담 플랫폼"
        description="3분 만에 완성하는 AI 심리검사. ADHD, 우울증, 스트레스 검사부터 전문가 상담까지. 검증된 전문가와 함께하는 전생애 통합 케어 서비스."
        keywords="AI심리검사,ADHD검사,우울증테스트,스트레스검사,심리상담,발달평가,온라인상담,정신건강,아동발달,심리분석"
        canonicalUrl="https://aihpro.com"
        structuredData={structuredData}
      />
      <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
      
      <div className="min-h-screen max-w-full overflow-x-hidden">
        <ScrollProgressBar />
        <UnifiedNavigation />
        
        <main id="main-content" className="w-full">
          {/* 1️⃣ Hero Section */}
          <HeroSection />
          
          {/* 🎬 회사 소개 영상 */}
          <LazyLoad className="animate-fade-in">
            <CompanyIntroVideoSection />
          </LazyLoad>
          
          {/* 2️⃣ 가치 비교 - 왜 우리를 선택해야 하는가 */}
          <LazyLoad className="animate-fade-in">
            <ValueComparisonSection />
          </LazyLoad>
          
          {/* 3️⃣ Problem & Vision */}
          <LazyLoad className="animate-fade-in">
            <ProblemVisionSection />
          </LazyLoad>
          
          {/* 4️⃣ Core Service */}
          <LazyLoad className="animate-fade-in">
            <CoreServiceSection />
          </LazyLoad>
          
          {/* 5️⃣ 데이터 기반 초개인화 리포트 (통합 섹션) */}
          <LazyLoad className="animate-fade-in">
            <DataDrivenReportSection />
          </LazyLoad>
          
          {/* 🎯 New Features Section - 매주 업데이트 */}
          <LazyLoad className="animate-fade-in">
            <NewFeaturesSection />
          </LazyLoad>
          
          {/* 6️⃣ Result / Report */}
          <LazyLoad className="animate-fade-in">
            <ResultReportSection />
          </LazyLoad>
          
          {/* Trust & Partner Section */}
          <LazyLoad className="animate-fade-in">
            <PartnerTrustSection />
          </LazyLoad>
          
          {/* Social Proof */}
          <LazyLoad className="animate-fade-in">
            <TestimonialSection />
          </LazyLoad>
          
          <LazyLoad className="animate-fade-in">
            <ClientLogos />
          </LazyLoad>
          
          {/* 📝 Founder's Letter - 창립자의 손편지 */}
          <LazyLoad className="animate-fade-in">
            <FounderLetterSection />
          </LazyLoad>
          
          {/* 🤝 Insurance Partnership Section */}
          <LazyLoad className="animate-fade-in">
            <InsurancePartnerSection />
          </LazyLoad>
          
          {/* 7️⃣ Call to Action */}
          <LazyLoad className="animate-fade-in">
            <CTABannerSection />
          </LazyLoad>
          
          {/* 🏢 회사 서비스 소개 */}
          <LazyLoad className="animate-fade-in">
            <CompanyServicesSection />
          </LazyLoad>
          
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
