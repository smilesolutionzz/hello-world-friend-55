import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import HeroSection from "@/components/HeroSection";
import SimplifiedCoreServices from "@/components/landing/SimplifiedCoreServices";
import CTABannerSection from "@/components/landing/CTABannerSection";
import PartnerTrustSection from "@/components/landing/PartnerTrustSection";
import ValueComparisonSection from "@/components/landing/ValueComparisonSection";
import TestimonialSection from "@/components/TestimonialSection";
import EmotionalHookSection from "@/components/landing/EmotionalHookSection";
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
import ErrorBoundary from '@/components/ui/error-boundary';
import FeedAnalysisSection from '@/components/landing/FeedAnalysisSection';
import ReportPreviewSection from '@/components/landing/ReportPreviewSection';
import MainPromoSection from '@/components/promotion/MainPromoSection';
import ColumnHookBanner from '@/components/landing/ColumnHookBanner';
import { VideoObservationShowcase } from '@/components/landing/VideoObservationShowcase';
import MindDiaryHook from '@/components/landing/MindDiaryHook';
import BusinessModelSection from '@/components/landing/BusinessModelSection';


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
  const [searchParams] = useSearchParams();
  const { processReferralReward } = useReferrals();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user && !localStorage.getItem('onboarding_completed')) {
        setShowOnboarding(true);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const checkReferralCode = async () => {
      const refCode = searchParams.get('ref');
      if (refCode) {
        localStorage.setItem('referralCode', refCode);
        
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error && !error.message.includes('invalid claim') && !error.message.includes('bad_jwt')) {
            return;
          }
          
          if (!isMounted) return;
          
          if (user && !error) {
            const success = await processReferralReward(refCode);
            if (!isMounted) return;
            
            if (success !== undefined) {
              localStorage.removeItem('referralCode');
              if (success) {
                toast({
                  title: "🎉 추천 보상 완료!",
                  description: "500원 캐시를 받았고, 추천인은 1,000원 캐시를 받았습니다!",
                });
              }
            }
          } else {
            if (!isMounted) return;
            toast({
              title: "🎉 추천 링크로 접속했습니다!",
              description: "회원가입하시면 본인은 500원, 추천인은 1,000원 캐시를 받아요!",
            });
          }
        } catch (error) {
          if (!isMounted) return;
          toast({
            title: "🎉 추천 링크로 접속했습니다!",
            description: "회원가입하시면 본인은 500원, 추천인은 1,000원 캐시를 받아요!",
          });
        }
      }
    };

    checkReferralCode();
    
    return () => { isMounted = false; };
  }, [searchParams, processReferralReward, toast]);

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
        canonicalUrl="https://aihpro.app"
        structuredData={structuredData}
      />
      <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
      
      <ErrorBoundary>
        <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-900">
          <ScrollProgressBar />
          <UnifiedNavigation />
          
            <main id="main-content" className="w-full">
            {/* 1️⃣ Hero Section - AI 분석 입력창 포함 */}
            <HeroSection />
            
            {/* 🔥 마음일기 - 유니콘 킥 (청소년 바이럴 + 부모 수익화) */}
            <LazyLoad rootMargin="200px">
              <MindDiaryHook />
            </LazyLoad>
            
            {/* 🎬 AI 영상 관찰 분석 섹션 */}
            <LazyLoad rootMargin="200px">
              <VideoObservationShowcase />
            </LazyLoad>
            
            {/* 🆕 피드 스크린샷 무의식 분석 섹션 */}
            <LazyLoad rootMargin="200px">
              <FeedAnalysisSection />
            </LazyLoad>
            
            {/* 2️⃣ 가치 비교 - 왜 우리를 선택해야 하는가 */}
            <LazyLoad rootMargin="200px">
              <ValueComparisonSection />
            </LazyLoad>
            
            {/* 3️⃣ 3단계 핵심 서비스 */}
            <LazyLoad rootMargin="200px">
              <SimplifiedCoreServices />
            </LazyLoad>
            
            {/* 4️⃣ 전문가급 리포트 미리보기 */}
            <LazyLoad rootMargin="200px">
              <ReportPreviewSection />
            </LazyLoad>
            
            {/* 5️⃣ 감성 후킹 - 엄마들의 실제 사연 */}
            <LazyLoad rootMargin="200px">
              <EmotionalHookSection />
            </LazyLoad>
            
            {/* 6️⃣ 실제 후기 */}
            <LazyLoad rootMargin="200px">
              <TestimonialSection />
            </LazyLoad>
            
            {/* 📰 칼럼 후킹 배너 */}
            <LazyLoad rootMargin="200px">
              <ColumnHookBanner />
            </LazyLoad>
            
            {/* 6️⃣ 파트너 & 신뢰 */}
            <LazyLoad rootMargin="200px">
              <PartnerTrustSection />
            </LazyLoad>
            
            {/* 💰 비즈니스 모델 - 캐시 시스템 & B2B */}
            <LazyLoad rootMargin="200px">
              <BusinessModelSection />
            </LazyLoad>
            
            {/* 🔥 프로모션 배너 - 서비스 가치 확인 후 유도 */}
            <LazyLoad rootMargin="200px">
              <MainPromoSection />
            </LazyLoad>
            
            {/* 7️⃣ CTA 배너 */}
            <LazyLoad rootMargin="200px">
              <CTABannerSection />
            </LazyLoad>
            
            {/* 8️⃣ Footer */}
            <Footer />
          </main>
          
          <BackToTop />
          
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
