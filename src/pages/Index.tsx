import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { User } from '@supabase/supabase-js';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import HeroSection from "@/components/HeroSection";
import CTABannerSection from "@/components/landing/CTABannerSection";
import PartnerTrustSection from "@/components/landing/PartnerTrustSection";
import TestimonialSection from "@/components/TestimonialSection";
import EmotionalHookSection from "@/components/landing/EmotionalHookSection";
import BackToTop from "@/components/common/BackToTop";
import SEOHead from "@/components/common/SEOHead";
import { SkipLink } from "@/components/ui/skip-link";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useReferrals } from '@/hooks/useReferrals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PostSignupOnboarding } from '@/components/onboarding/PostSignupOnboarding';

import Footer from '@/components/ui/footer';
import { LazyLoad } from '@/components/ui/lazy-load';
import ErrorBoundary from '@/components/ui/error-boundary';
import { VideoObservationShowcase } from '@/components/landing/VideoObservationShowcase';
import ExpertTeamSection from '@/components/landing/ExpertTeamSection';
import SubscriptionValueSection from '@/components/landing/SubscriptionValueSection';
import StickyConversionBar from '@/components/conversion/StickyConversionBar';
import ReportPreviewSection from '@/components/landing/ReportPreviewSection';
import { SocialProofToast } from '@/components/landing/SocialProofToast';
import RealFeedbackSection from '@/components/landing/RealFeedbackSection';
import TrialOnboarding from '@/components/onboarding/TrialOnboarding';
import { useTrialProfile } from '@/hooks/useTrialProfile';
import { CopilotBubble } from '@/components/copilot/CopilotBubble';
import HumanTouchManifesto from '@/components/branding/HumanTouchManifesto';
import B2BEntryBanner from '@/components/landing/B2BEntryBanner';
import { SmartScrollReveal } from '@/components/ui/smart-scroll-reveal';


const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AIHUMANPRO",
  "url": "https://aihpro.app",
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
  const { t } = useTranslation();
  const { hasProfile: hasTrialProfile } = useTrialProfile();
  const [showTrialOnboarding, setShowTrialOnboarding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // 1) Fast path: localStorage marker (avoids flash of dialog on repeat visits)
        if (localStorage.getItem('onboarding_completed')) return;

        // 2) Source of truth: DB. If onboarding row exists for this user, never show again.
        try {
          const { data: onboardingRow } = await (supabase as any)
            .from('user_onboarding_data')
            .select('user_id, onboarding_completed_at')
            .eq('user_id', user.id)
            .maybeSingle();

          if (onboardingRow) {
            localStorage.setItem('onboarding_completed', 'true');
            return;
          }
        } catch (err) {
          // Table query failed - fall back to showing onboarding once
          console.warn('Onboarding check failed:', err);
        }

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
        title={t.seo.title}
        description={t.seo.description}
        keywords="AIHPRO,AI심리검사,ADHD검사,우울증테스트,스트레스검사,심리상담,발달평가,온라인상담,정신건강,아동발달,심리분석"
        canonicalUrl="https://aihpro.app"
        structuredData={structuredData}
      />
      <SkipLink href="#main-content">메인 콘텐츠로 바로가기</SkipLink>
      
      <ErrorBoundary>
        <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-900 pb-16 md:pb-0">
          <ScrollProgressBar />
          <UnifiedNavigation />
          
            <main id="main-content" className="w-full">
            {/* 1️⃣ Hero */}
            <HeroSection />

            {/* 2️⃣ 실제 카톡 후기 — 사회적 증거 (Testimonial 통합) */}
            <LazyLoad rootMargin="200px">
              <SmartScrollReveal kind="cards"><RealFeedbackSection /></SmartScrollReveal>
            </LazyLoad>

            {/* 3️⃣ AI 전문가급 리포트 미리보기 — 결제 전환 핵심 */}
            <LazyLoad rootMargin="200px">
              <SmartScrollReveal kind="image"><ReportPreviewSection /></SmartScrollReveal>
            </LazyLoad>

            {/* 4️⃣ 영상 관찰 - WOW 팩터 */}
            <LazyLoad rootMargin="200px">
              <SmartScrollReveal kind="image"><VideoObservationShowcase /></SmartScrollReveal>
            </LazyLoad>

            {/* 5️⃣ 구독 + 최종 CTA (통합) */}
            <LazyLoad rootMargin="200px">
              <SmartScrollReveal kind="cta"><SubscriptionValueSection /></SmartScrollReveal>
            </LazyLoad>
            <LazyLoad rootMargin="200px">
              <SmartScrollReveal kind="cta"><CTABannerSection /></SmartScrollReveal>
            </LazyLoad>

            {/* 파트너 신뢰 - 슬림 1줄 (Footer 직전) */}
            <LazyLoad rootMargin="200px">
              <SmartScrollReveal kind="stats"><PartnerTrustSection /></SmartScrollReveal>
            </LazyLoad>

            {/* Footer */}
            <Footer />
          </main>
          
          <BackToTop />
          <StickyConversionBar />
          <SocialProofToast />
          
          <CopilotBubble />
          <PostSignupOnboarding 
            isOpen={showOnboarding} 
            onClose={handleOnboardingClose} 
          />
          
          {showTrialOnboarding && (
            <TrialOnboarding 
              onComplete={() => {
                setShowTrialOnboarding(false);
                navigate('/assessment');
              }} 
            />
          )}
        </div>
      </ErrorBoundary>
    </>
  );
};

export default Index;
