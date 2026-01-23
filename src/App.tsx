import React from "react";

import { InstitutionMarketingPresentation } from "@/components/institutions/InstitutionMarketingPresentation";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary from "@/components/ui/error-boundary";
import NetworkStatus from "@/components/common/NetworkStatus";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import Analytics from "@/components/common/Analytics";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { ConversionTracker } from "@/components/analytics/ConversionTracker";

import Index from "./pages/Index";
import IEPGenerator from "./pages/IEPGenerator";
import ConcernStorage from "./pages/ConcernStorage";
import DailyParentingTip from "./pages/DailyParentingTip";

import Payment from "./pages/Payment";

import Assessment from "./pages/Assessment";
import FreeTrialAssessment from "./pages/FreeTrialAssessment";
import BasicMentalHealthTest from "./components/assessment/BasicMentalHealthTest";
import PremiumAssessment from "./pages/PremiumAssessment";
import AICounselor from "./pages/AICounselor";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NeedsAssessment from "./pages/NeedsAssessment";
import ExpertOnboarding from "./pages/ExpertOnboarding";
import InstitutionOnboarding from "./pages/InstitutionOnboarding";
import QuickNeeds from "./pages/QuickNeeds";

// HIGHLIGHT MVP Pages
import HighlightAuth from "./pages/HighlightAuth";
import HighlightDashboard from "./pages/HighlightDashboard";
import HighlightAI from "./pages/HighlightAI";
import AITherapyStudio from "./pages/AITherapyStudio";

import { TypebotEmbed } from "./components/highlight/TypebotEmbed";
import { PersonalityLoveTest } from "./components/assessment/PersonalityLoveTest";
import { PersonalityLoveResult } from "./components/assessment/PersonalityLoveResult";
import RelationshipStyleTest from "./pages/RelationshipStyleTest";
import CommunicationStyleTest from "./pages/CommunicationStyleTest";
import AssessmentDetail from "./pages/AssessmentDetail";
import ComprehensiveReporting from "./pages/ComprehensiveReporting";

import CounselingFlow from "./pages/CounselingFlow";
import Corporate from "./pages/Corporate";
import Community from "./pages/Community";
import Subscription from "./pages/Subscription";
import TokenSubscription from "./pages/TokenSubscription";
import TokenPurchase from "./pages/TokenPurchase";
import TokenHistory from "./pages/TokenHistory";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentComplete from "./pages/PaymentComplete";
import PaymentFail from "./pages/PaymentFail";
import TokenPaymentSuccess from "./pages/TokenPaymentSuccess";
import TokenPaymentFail from "./pages/TokenPaymentFail";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import Pricing from "./pages/Pricing";
import LifetimePayment from "./pages/LifetimePayment";
import Observation from "./pages/Observation";
import ObservationNew from "./pages/ObservationNew";
import ObservationList from "./pages/ObservationList";
import ObservationDetail from "./pages/ObservationDetail";
import Expert from "./pages/Expert";
import Experts from "./pages/Experts";
import ExpertConsultation from "./pages/ExpertConsultation";
import ExpertDashboard from "./pages/ExpertDashboard";
import ExpertApplication from "./pages/ExpertApplication";
import ExpertContract from "./pages/ExpertContract";
import ExpertContractSuccess from "./pages/ExpertContractSuccess";
import ExpertHiring from "./pages/ExpertHiring";
import ExpertDetail from "./pages/ExpertDetail";
import BookingManagement from "./pages/BookingManagement";
import Institutions from "./pages/Institutions";
import HomeService from "./pages/HomeService";
import NotFound from "./pages/NotFound";
import ShareView from "./pages/ShareView";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import GrowthCommunity from "./pages/GrowthCommunity";
import TokenTest from "./pages/TokenTest";
import StressPackage from "./pages/StressPackage";
import DepressionPackage from "./pages/DepressionPackage";
import InstagramContentGenerator from "./pages/InstagramContentGenerator";
import AnxietyPackage from "./pages/AnxietyPackage";
import FocusPackage from "./pages/FocusPackage";
import ChildPackage from "./pages/ChildPackage";
import RelationshipPackage from "./pages/RelationshipPackage";
import ComprehensivePackage from "./pages/ComprehensivePackage";
import CareerPackage from "./pages/CareerPackage";
import GrowthStories from "./pages/GrowthStories";
import VoiceEmotionAnalysis from "./pages/VoiceEmotionAnalysis";
import VoiceDiary from "./pages/VoiceDiary";
import PersonalizedAICoaching from "./pages/PersonalizedAICoaching";
import EnhancedDesignShowcase from "./pages/EnhancedDesignShowcase";
import VoiceCounseling from "./pages/VoiceCounseling";
import VoiceToText from "./pages/VoiceToText";
import MeditationPage from "./pages/MeditationPage";
import RealtimeMeditation from "./pages/RealtimeMeditation";
import VoiceEmotionDiary from "./pages/VoiceEmotionDiary";
import B2BConsulting from "./pages/B2BConsulting";
import B2BProposal from "./pages/B2BProposal";
import EAPService from "./pages/EAPService";

// New Retention Features
import WellnessHub from "./pages/WellnessHub";
import DailyCheckin from "./pages/DailyCheckin";
import ChallengesPage from "./pages/ChallengesPage";
import GrowthTracker from "./pages/GrowthTracker";
import AIAssistant from "./pages/AIAssistant";
import WellnessLifestyle from "./pages/WellnessLifestyle";
import TestProgressTracker from "./pages/TestProgressTracker";
import ProgressTracking from "./pages/ProgressTracking";

import AssessmentHistory from "./components/history/AssessmentHistory";
import FunTests from "./pages/FunTests";
import FunTestResult from "./pages/FunTestResult";
import FreeTrialResult from "./pages/FreeTrialResult";
import FreeTrialSuccess from "./pages/FreeTrialSuccess";
import PastLifeJobTestFree from "./components/assessment/PastLifeJobTestFree";
import LifeAchievementHistory from "./pages/LifeAchievementHistory";
import LifeAchievementStats from "./pages/LifeAchievementStats";
import LifeAchievementCommunity from "./pages/LifeAchievementCommunity";
import LifeAchievementLeaderboard from "./pages/LifeAchievementLeaderboard";
import LifeAchievementBadges from "./pages/LifeAchievementBadges";
import LifeAchievementGoals from "./pages/LifeAchievementGoals";
import DefenseMechanismTest from "./pages/DefenseMechanismTest";
import AttachmentStyleTest from "./pages/AttachmentStyleTest";
import EducationFeed from "./pages/EducationFeed";
import MBTITest from "./pages/MBTITest";
import ENFJvsINFPCompatibility from "./pages/ENFJvsINFPCompatibility";
import FingerprintTemperamentTest from "./pages/FingerprintTemperamentTest";
import DrawingDiaryHTP from "./pages/DrawingDiaryHTP";
import GrowthDevelopmentReport from "./pages/GrowthDevelopmentReport";
import ADHDScreening from "./pages/ADHDScreening";
import EnergyFlowTest from "./pages/EnergyFlowTest";
import RelationshipDynamicsTest from "./pages/RelationshipDynamicsTest";
import LifePurposeTest from "./pages/LifePurposeTest";
import PatternIQTest from "./pages/PatternIQTest";
import InstagramAnalysis from "./pages/InstagramAnalysis";
import InstagramFeedAnalysis from "./pages/InstagramFeedAnalysis";

import HanMedicineTest from "./pages/HanMedicineTest";
import IEPView from "./pages/IEPView";
import AdminDashboard from "./pages/AdminDashboard";
import AdvancedAdhdTest from "./pages/AdvancedAdhdTest";
import InstitutionAdmin from "./pages/InstitutionAdmin";

import PMFDashboard from "./pages/PMFDashboard";
import KPIDashboard from "./pages/KPIDashboard";
import PlatformManual from "./pages/PlatformManual";
import ReportGenerator from "./pages/ReportGenerator";
import Column from "./pages/Column";
import SampleReport from "./pages/SampleReport";
import MarketingAIAssistant from "./pages/MarketingAIAssistant";
import CrossPromotionReward from "./pages/CrossPromotionReward";
import InstallGuide from "./pages/InstallGuide";
import MetaverseVoice from "./pages/MetaverseVoice";
import ParentLanding from "./pages/ParentLanding";
import AcademyLanding from "./pages/AcademyLanding";
import DevelopmentCenterLanding from "./pages/DevelopmentCenterLanding";
import DaycareLanding from "./pages/DaycareLanding";
import DashboardRouter from "./pages/DashboardRouter";
import Referral from "./pages/Referral";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import B2BAdvertising from "./pages/B2BAdvertising";
import B2BLanding from "./pages/B2BLanding";
import B2BAcademy from "./pages/B2BAcademy";
import AppStoreGuide from "./pages/AppStoreGuide";
import BusinessPlanGenerator from "./pages/BusinessPlanGenerator";
import PartnerBenefits from "./pages/PartnerBenefits";
import IRDeck from "./pages/IRDeck";

// Mind Diary - Unicorn Framework MVP
import MindDiary from "./pages/MindDiary";
import ParentDashboard from "./pages/ParentDashboard";
import ParentConnect from "./pages/ParentConnect";

import { SessionManager } from "./components/SessionManager";
import { UpdatePrompt } from "./components/pwa/UpdatePrompt";
import { InstallPromptBanner } from "./components/pwa/InstallPromptBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log('🎯 App.tsx: App component rendering...');
  
  return (
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <ErrorBoundary>
              <PerformanceMonitor enableConsoleLogging={process.env.NODE_ENV === 'development'} />
              <Analytics />
              <ConversionTracker />
              <NetworkStatus />
              <SessionManager />
              <UpdatePrompt />
              <InstallPromptBanner />
              
              <Routes>
          {/* Main Routes - Simplified User Journey */}
          <Route path="/" element={<Index />} />
          
          {/* Target-specific Landing Pages */}
          <Route path="/parent" element={<ParentLanding />} />
          <Route path="/academy" element={<AcademyLanding />} />
          <Route path="/development-center" element={<DevelopmentCenterLanding />} />
          <Route path="/daycare" element={<DaycareLanding />} />
          
          <Route path="/pmf-dashboard" element={<PMFDashboard />} />
          <Route path="/design-showcase" element={<EnhancedDesignShowcase />} />
          <Route path="/auth" element={<HighlightAuth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/dashboard-old" element={<Dashboard />} />
          <Route path="/progress-tracking" element={<ProgressTracking />} />
          <Route path="/premium-assessment" element={<PremiumAssessment />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/free-trial" element={<FreeTrialAssessment />} />
          <Route path="/assessment/mental-health-quick-test" element={<BasicMentalHealthTest />} />
          <Route path="/assessment/personality-love-test" element={
            <PersonalityLoveTest onComplete={(result) => {
              // Handle test completion - you might want to navigate to results or save data
              console.log('Test completed:', result);
            }} />
          } />
          <Route path="/assessment/stress-test" element={<Assessment />} />
          <Route path="/assessment/past-life-job-test" element={<PastLifeJobTestFree />} />
          <Route path="/free-trial-result" element={<FreeTrialResult />} />
          <Route path="/free-trial-success" element={<FreeTrialSuccess />} />
          <Route path="/assessment/relationship-style-test" element={<RelationshipStyleTest />} />
          <Route path="/assessment/communication-style-test" element={<CommunicationStyleTest />} />
          <Route path="/assessment/defense-mechanism-test" element={<DefenseMechanismTest />} />
          <Route path="/assessment/attachment-style-test" element={<AttachmentStyleTest />} />
          <Route path="/assessment/mbti-test" element={<MBTITest />} />
          <Route path="/assessment/:id" element={<AssessmentDetail />} />
          <Route path="/assessment-detail/:id" element={<AssessmentDetail />} />
          <Route path="/fun-tests" element={<FunTests />} />
           <Route path="/fun-test-result" element={<FunTestResult />} />
           <Route path="/enfj-infp-compatibility" element={<ENFJvsINFPCompatibility />} />
           <Route path="/fingerprint-temperament" element={<FingerprintTemperamentTest />} />
           <Route path="/drawing-diary-htp" element={<DrawingDiaryHTP />} />
           <Route path="/growth-report" element={<GrowthDevelopmentReport />} />
           <Route path="/adhd-screening" element={<ADHDScreening />} />
           <Route path="/assessment/energy-flow" element={<EnergyFlowTest />} />
           <Route path="/assessment/relationship-dynamics" element={<RelationshipDynamicsTest />} />
            <Route path="/assessment/life-purpose" element={<LifePurposeTest />} />
            <Route path="/assessment/pattern-iq-test" element={<PatternIQTest />} />
            <Route path="/assessment/instagram-analysis" element={<InstagramAnalysis />} />
            <Route path="/assessment/feed-analysis" element={<InstagramFeedAnalysis />} />
          
          <Route path="/assessment-history" element={<AssessmentHistory />} />
          <Route path="/life-achievement-history" element={<LifeAchievementHistory />} />
          <Route path="/life-achievement-stats" element={<LifeAchievementStats />} />
          <Route path="/life-achievement-leaderboard" element={<LifeAchievementLeaderboard />} />
          <Route path="/life-achievement-badges" element={<LifeAchievementBadges />} />
          <Route path="/life-achievement-community" element={<LifeAchievementCommunity />} />
          <Route path="/life-achievement-goals" element={<LifeAchievementGoals />} />
          <Route path="/counseling" element={<CounselingFlow />} />
          <Route path="/ai-counselor" element={<AICounselor />} />
          <Route path="/needs-assessment" element={<NeedsAssessment />} />
          <Route path="/quick-needs" element={<QuickNeeds />} />
          <Route path="/expert-onboarding" element={<ExpertOnboarding />} />
          <Route path="/institution-onboarding" element={<InstitutionOnboarding />} />
          <Route path="/stress-package" element={<StressPackage />} />
          <Route path="/depression-package" element={<DepressionPackage />} />
          <Route path="/instagram-content" element={<InstagramContentGenerator />} />
          <Route path="/anxiety-package" element={<AnxietyPackage />} />
          <Route path="/focus-package" element={<FocusPackage />} />
          <Route path="/child-package" element={<ChildPackage />} />
          <Route path="/relationship-package" element={<RelationshipPackage />} />
          <Route path="/career-package" element={<CareerPackage />} />
          <Route path="/comprehensive-package" element={<ComprehensivePackage />} />
          <Route path="/family" element={<ChildPackage />} />
          <Route path="/han-medicine-test" element={<HanMedicineTest />} />
          <Route path="/advanced-adhd-test" element={<AdvancedAdhdTest />} />
          <Route path="/iep-generator" element={<IEPGenerator />} />
          <Route path="/iep-view/:id" element={<IEPView />} />
          
          {/* New Retention Features */}
          <Route path="/wellness-hub" element={<WellnessHub />} />
          <Route path="/wellness-lifestyle" element={<WellnessLifestyle />} />
          <Route path="/daily-checkin" element={<DailyCheckin />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/growth-tracker" element={<GrowthTracker />} />
          <Route path="/test-progress" element={<TestProgressTracker />} />
           <Route path="/ai-assistant" element={<AIAssistant />} />
           <Route path="/ai-counselor" element={<AIAssistant />} />
           <Route path="/ai-coach" element={<AIAssistant />} />
           <Route path="/ai-therapy-studio" element={<AITherapyStudio />} />
            <Route path="/voice-emotion-analysis" element={<VoiceEmotionAnalysis />} />
            <Route path="/voice-diary" element={<VoiceDiary />} />
            <Route path="/personalized-ai-coaching" element={<PersonalizedAICoaching />} />
            <Route path="/voice-counseling" element={<VoiceCounseling />} />
            <Route path="/voice-to-text" element={<VoiceToText />} />
            <Route path="/meditation" element={<MeditationPage />} />
            <Route path="/realtime-meditation" element={<RealtimeMeditation />} />
            <Route path="/voice-emotion-diary" element={<VoiceEmotionDiary />} />
            <Route path="/metaverse-voice" element={<MetaverseVoice />} />
          
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/community" element={<Community />} />
          <Route path="/growth-community" element={<GrowthCommunity />} />
          <Route path="/growth-stories" element={<GrowthStories />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/token-subscription" element={<TokenSubscription />} />
          <Route path="/token-purchase" element={<TokenPurchase />} />
          <Route path="/token-history" element={<TokenHistory />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/kpi-dashboard" element={<KPIDashboard />} />
          <Route path="/institution-admin" element={<InstitutionAdmin />} />
        <Route path="/pricing" element={<Pricing />} />
          <Route path="/lifetime-payment" element={<LifetimePayment />} />
          <Route path="/share/:shareId" element={<ShareView />} />
          <Route path="/observation" element={<ObservationNew />} />
          <Route path="/observation-old" element={<Observation />} />
          <Route path="/observation-list" element={<ObservationList />} />
          <Route path="/observation/:id" element={<ObservationDetail />} />
          <Route path="/comprehensive-reporting" element={<ComprehensiveReporting />} />
          <Route path="/report-generator" element={<ReportGenerator />} />
          <Route path="/sample-report" element={<SampleReport />} />
          <Route path="/concern-storage" element={<ConcernStorage />} />
          <Route path="/expert" element={<Expert />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/expert-dashboard" element={<ExpertDashboard />} />
          <Route path="/consultation/:roomId" element={<ExpertConsultation />} />
          <Route path="/expert-contract/:expertId" element={<ExpertContract />} />
          <Route path="/expert-contract-success" element={<ExpertContractSuccess />} />
          <Route path="/expert-hiring" element={<ExpertHiring />} />
          <Route path="/expert-detail/:id" element={<ExpertDetail />} />
          <Route path="/booking-management" element={<BookingManagement />} />
          <Route path="/expert-application" element={<ExpertApplication />} />
          <Route path="/institutions" element={<Institutions />} />
          <Route path="/home-service" element={<HomeService />} />
          <Route path="/institution-marketing" element={<InstitutionMarketingPresentation />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-fail" element={<PaymentFail />} />
          <Route path="/payment-complete" element={<PaymentComplete />} />
          <Route path="/token-payment-success" element={<TokenPaymentSuccess />} />
          <Route path="/token-payment-fail" element={<TokenPaymentFail />} />
          <Route path="/token-test" element={<TokenTest />} />
          <Route path="/cross-promotion-reward" element={<CrossPromotionReward />} />
          
          <Route path="/platform-manual" element={<PlatformManual />} />
          <Route path="/column" element={<Column />} />
          <Route path="/marketing-ai-assistant" element={<MarketingAIAssistant />} />
          <Route path="/install" element={<InstallGuide />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/education-feed" element={<EducationFeed />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/daily-tip" element={<DailyParentingTip />} />
          <Route path="/ir-deck" element={<IRDeck />} />
          
          {/* Stripe subscription routes removed
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/subscription-cancel" element={<SubscriptionCancel />} />
          */}
          
          {/* B2B Advertising */}
          <Route path="/b2b-advertising" element={<B2BAdvertising />} />
          <Route path="/b2b" element={<B2BLanding />} />
          <Route path="/b2b-academy" element={<B2BAcademy />} />
          <Route path="/b2b-benefits" element={<PartnerBenefits />} />
          <Route path="/partner-benefits" element={<PartnerBenefits />} />
          <Route path="/b2b-consulting" element={<B2BConsulting />} />
          <Route path="/b2b-proposal" element={<B2BProposal />} />
          <Route path="/eap-service" element={<EAPService />} />
          <Route path="/app-store-guide" element={<AppStoreGuide />} />
          <Route path="/business-plan" element={<BusinessPlanGenerator />} />
          
          {/* Mind Diary - Unicorn Framework MVP */}
          <Route path="/mind-diary" element={<MindDiary />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/parent-connect" element={<ParentConnect />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
              </Routes>
              <FeedbackButton />
            </ErrorBoundary>
          </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
};

export default App;