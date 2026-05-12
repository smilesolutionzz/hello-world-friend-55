import React from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n";

import ErrorBoundary from "@/components/ui/error-boundary";
import NetworkStatus from "@/components/common/NetworkStatus";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import Analytics from "@/components/common/Analytics";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { ConversionTracker } from "@/components/analytics/ConversionTracker";
import { useB2BFunnelAutoTrack } from "@/hooks/useB2BFunnelTracking";

function B2BFunnelTracker() {
  useB2BFunnelAutoTrack();
  return null;
}

// Core Pages
import Index from "./pages/Index";
import HighlightAuth from "./pages/HighlightAuth";
import ResetPassword from "./pages/ResetPassword";
import DashboardRouter from "./pages/DashboardRouter";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import BookingManagement from "./pages/BookingManagement";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";

// AI Analysis & Core Features
import AIAssistant from "./pages/AIAssistant";
import AiCopilotPage from "./pages/AiCopilotPage";
import ConcernStorage from "./pages/ConcernStorage";
import ReportGenerator from "./pages/ReportGenerator";
import ReportGeneratorPro from "./pages/ReportGeneratorPro";
import MyJourney from "./pages/MyJourney";
import CoachingPreferences from "./pages/CoachingPreferences";
import VerifyReport from "./pages/VerifyReport";
import MetaverseVoice from "./pages/MetaverseVoice";
import VoiceCounselingNew from "./pages/VoiceCounselingNew";
import VoiceCounselingHistory from "./pages/VoiceCounselingHistory";
// GameCounseling integrated into MetaverseVoice

// Assessment & Tests
import Assessment from "./pages/Assessment";
import PremiumAssessment from "./pages/PremiumAssessment";
import UnifiedAssessmentHub from "./components/assessment/UnifiedAssessmentHub";
import FreeTrialAssessment from "./pages/FreeTrialAssessment";
import FreeTrialResult from "./pages/FreeTrialResult";
import BasicMentalHealthTest from "./components/assessment/BasicMentalHealthTest";
import PastLifeJobTestFree from "./components/assessment/PastLifeJobTestFree";
import { PersonalityLoveTest } from "./components/assessment/PersonalityLoveTest";
import RelationshipStyleTest from "./pages/RelationshipStyleTest";
import CommunicationStyleTest from "./pages/CommunicationStyleTest";
import DefenseMechanismTest from "./pages/DefenseMechanismTest";
import AttachmentStyleTest from "./pages/AttachmentStyleTest";
import MBTITest from "./pages/MBTITest";
import EnergyFlowTest from "./pages/EnergyFlowTest";
import RelationshipDynamicsTest from "./pages/RelationshipDynamicsTest";
import LifePurposeTest from "./pages/LifePurposeTest";
import ResilienceTest from "./pages/ResilienceTest";
import PatternIQTest from "./pages/PatternIQTest";
import InstagramAnalysis from "./pages/InstagramAnalysis";
import InstagramFeedAnalysis from "./pages/InstagramFeedAnalysis";
import BusinessMetacognitionTest from "./pages/BusinessMetacognitionTest";
import AssessmentDetail from "./pages/AssessmentDetail";
import FunTests from "./pages/FunTests";
import FunTestResult from "./pages/FunTestResult";
// import HanMedicineTest from "./pages/HanMedicineTest"; // 한의/사상체질 영역 비활성화
import B2BMyRequests from "./pages/B2BMyRequests";
import AdvancedAdhdTest from "./pages/AdvancedAdhdTest";
import ADHDScreening from "./pages/ADHDScreening";
import FingerprintTemperamentTest from "./pages/FingerprintTemperamentTest";
import DrawingDiaryHTP from "./pages/DrawingDiaryHTP";
import GrowthDevelopmentReport from "./pages/GrowthDevelopmentReport";
import AssessmentHistory from "./components/history/AssessmentHistory";
import SampleReport from "./pages/SampleReport";
import ComprehensiveReporting from "./pages/ComprehensiveReporting";
import ENFJvsINFPCompatibility from "./pages/ENFJvsINFPCompatibility";
import SharedReport from "./pages/SharedReport";
import DemoSharedReport from "./pages/DemoSharedReport";

// Observation
import ObservationNew from "./pages/ObservationNew";
import ObservationList from "./pages/ObservationList";
import ObservationDetail from "./pages/ObservationDetail";

// Expert Finding (info only)
import ExpertHiring from "./pages/ExpertHiring";
import UrgentExpertMatch from "./pages/UrgentExpertMatch";
import ExpertDetail from "./pages/ExpertDetail";
import InstitutionDetailPage from "./pages/InstitutionDetailPage";
import InstitutionApplication from "./pages/InstitutionApplication";
import DataSharingConsent from "./pages/DataSharingConsent";
import InstitutionClientDashboard from "./pages/InstitutionClientDashboard";
import ExpertApplication from "./pages/ExpertApplication";
import ExpertContract from "./pages/ExpertContract";
import ExpertContractSuccess from "./pages/ExpertContractSuccess";

// Payment
import Payment from "./pages/Payment";
import TokenSubscription from "./pages/TokenSubscription";
import CoachingGoals from "./pages/CoachingGoals";
import BusinessSubscription from "./pages/BusinessSubscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import MindTrackOnboarding from "./pages/MindTrackOnboarding";
import MindTrackOnboardingFunnel from "./pages/MindTrackOnboardingFunnel";
import DevMindTrackGrant from "./pages/DevMindTrackGrant";
import PaymentComplete from "./pages/PaymentComplete";
import PaymentFail from "./pages/PaymentFail";
import Pricing from "./pages/Pricing";

// Mind Diary
import MindDiary from "./pages/MindDiary";

// Killer Product: 30 Day Mind Track
import MindTrack from "./pages/MindTrack";
import MindTrackStart from "./pages/MindTrackStart";
import MindTrackWorkbook from "./pages/MindTrackWorkbook";
import MindTrackDashboard from "./pages/MindTrackDashboard";
import MindTrackWorkbookPreview from "./pages/MindTrackWorkbookPreview";
import TrackMissions from "./pages/TrackMissions";
import MindTrackCheckResult from "./pages/MindTrackCheckResult";
import Quiz from "./pages/Quiz";

// Content & Column
import Column from "./pages/Column";
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
import IEPGenerator from "./pages/IEPGenerator";
import IEPView from "./pages/IEPView";

// IR / Business Docs
import IRDeck from "./pages/IRDeck";
import PlatformOnePager from "./pages/PlatformOnePager";
import B2BProposal from "./pages/B2BProposal";
import B2BJobCoach from "./pages/B2BJobCoach";
import Business from "./pages/Business";
import BusinessCaseStudies from "./pages/BusinessCaseStudies";
import BusinessSecurity from "./pages/BusinessSecurity";
import BusinessPricing from "./pages/BusinessPricing";
import B2BDemoReport from "./pages/B2BDemoReport";
import B2BHRDashboard from "./pages/B2BHRDashboard";
import B2BKindergartenConsole from "./pages/B2BKindergartenConsole";
import ParentAssessment from "./pages/ParentAssessment";
import StartupPackage from "./pages/StartupPackage";

// Legal
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminMindTrackContent from "./pages/AdminMindTrackContent";

// Utility
import ShareView from "./pages/ShareView";
import Referral from "./pages/Referral";
import Rewards from "./pages/Rewards";
import InstallGuide from "./pages/InstallGuide";
import WellnessLifestyle from "./pages/WellnessLifestyle";
import About from "./pages/About";
import TrackAdultComingSoon from "./pages/TrackAdultComingSoon";
import TrackTeenComingSoon from "./pages/TrackTeenComingSoon";
import CenterReferralLanding from "./pages/CenterReferralLanding";
import PartnerCenterDashboard from "./pages/PartnerCenterDashboard";
import BetaRecruitment from "./pages/BetaRecruitment";
import Reviews from "./pages/Reviews";
import AboutExpert from "./pages/AboutExpert";

// Packages (SEO landing pages)
import StressPackage from "./pages/StressPackage";
import DepressionPackage from "./pages/DepressionPackage";
import AnxietyPackage from "./pages/AnxietyPackage";
import FocusPackage from "./pages/FocusPackage";
import ChildPackage from "./pages/ChildPackage";
import RelationshipPackage from "./pages/RelationshipPackage";
import ComprehensivePackage from "./pages/ComprehensivePackage";
import CareerPackage from "./pages/CareerPackage";

import { SessionManager } from "./components/SessionManager";
import { UpdatePrompt } from "./components/pwa/UpdatePrompt";
import { InstallPromptBanner } from "./components/pwa/InstallPromptBanner";
import { MobileBottomTab } from "./components/navigation/MobileBottomTab";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <ErrorBoundary>
              <LanguageProvider>
              <PerformanceMonitor enableConsoleLogging={process.env.NODE_ENV === 'development'} />
              <Analytics />
              <ConversionTracker />
              <B2BFunnelTracker />
              <NetworkStatus />
              <SessionManager />
              <UpdatePrompt />
              <InstallPromptBanner />
              
              <Routes>
          {/* ===== Core Routes ===== */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<HighlightAuth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* AI Analysis */}
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/ai-counselor" element={<AIAssistant />} />
          <Route path="/ai-coach" element={<AIAssistant />} />
          <Route path="/ai-copilot" element={<AiCopilotPage />} />
          <Route path="/concern-storage" element={<ConcernStorage />} />
          <Route path="/report-generator" element={<ReportGenerator />} />
          <Route path="/report-generator-pro" element={<ReportGeneratorPro />} />
          <Route path="/my-journey" element={<MyJourney />} />
          <Route path="/coaching-preferences" element={<CoachingPreferences />} />
          <Route path="/en/my-journey" element={<MyJourney />} />
          <Route path="/en/coaching-preferences" element={<CoachingPreferences />} />
          <Route path="/verify-report/:token" element={<VerifyReport />} />
          <Route path="/en/verify-report/:token" element={<VerifyReport />} />
          <Route path="/sample-report" element={<SampleReport />} />
          <Route path="/comprehensive-reporting" element={<ComprehensiveReporting />} />
          <Route path="/mind-track" element={<MindTrack />} />
          <Route path="/mind-track/dashboard" element={<MindTrackDashboard />} />
          <Route path="/mind-track/start" element={<MindTrackStart />} />
          <Route path="/mind-track/workbook" element={<MindTrackWorkbook />} />
          {/* 별칭: /mind-track-workbook 도 동일하게 동작 (?day=N 파라미터 그대로 전달) */}
          <Route path="/mind-track-workbook" element={<MindTrackWorkbook />} />
          <Route path="/mind-track/workbook-preview" element={<MindTrackWorkbookPreview />} />
          <Route path="/track-missions" element={<TrackMissions />} />
          <Route path="/mind-track/missions" element={<TrackMissions />} />
          <Route path="/onboarding/mind-track" element={<MindTrackOnboarding />} />
          <Route path="/onboarding/mind-track/funnel" element={<MindTrackOnboardingFunnel />} />
          <Route path="/dev/mind-track-grant" element={<DevMindTrackGrant />} />
          <Route path="/mind-track/check/:shareId" element={<MindTrackCheckResult />} />
          <Route path="/en/mind-track" element={<MindTrack />} />
          <Route path="/en/mind-track/dashboard" element={<MindTrackDashboard />} />

          {/* AI Azit */}
          <Route path="/metaverse-voice" element={<MetaverseVoice />} />
          <Route path="/voice-counseling" element={<VoiceCounselingNew />} />
          <Route path="/voice-counseling/history" element={<VoiceCounselingHistory />} />
          <Route path="/game-counseling" element={<Navigate to="/metaverse-voice" replace />} />

          {/* Assessment & Tests */}
          <Route path="/assessment" element={<UnifiedAssessmentHub />} />
          <Route path="/premium-assessment" element={<UnifiedAssessmentHub />} />
          <Route path="/assessment-classic" element={<Assessment />} />
          <Route path="/premium-assessment-classic" element={<PremiumAssessment />} />
          <Route path="/free-trial" element={<FreeTrialAssessment />} />
          <Route path="/free-trial-result" element={<FreeTrialResult />} />
          <Route path="/assessment/mental-health-quick-test" element={<BasicMentalHealthTest />} />
          <Route path="/assessment/personality-love-test" element={
            <PersonalityLoveTest onComplete={(result) => console.log('Test completed:', result)} />
          } />
          <Route path="/assessment/stress-test" element={<Assessment />} />
          <Route path="/assessment/past-life-job-test" element={<PastLifeJobTestFree />} />
          <Route path="/assessment/relationship-style-test" element={<RelationshipStyleTest />} />
          <Route path="/assessment/communication-style-test" element={<CommunicationStyleTest />} />
          <Route path="/assessment/defense-mechanism-test" element={<DefenseMechanismTest />} />
          <Route path="/assessment/attachment-style-test" element={<AttachmentStyleTest />} />
          <Route path="/assessment/mbti-test" element={<MBTITest />} />
          <Route path="/assessment/energy-flow" element={<EnergyFlowTest />} />
          <Route path="/assessment/relationship-dynamics" element={<RelationshipDynamicsTest />} />
          <Route path="/assessment/life-purpose" element={<LifePurposeTest />} />
          <Route path="/assessment/pattern-iq-test" element={<PatternIQTest />} />
          <Route path="/assessment/resilience" element={<ResilienceTest />} />
          <Route path="/assessment/instagram-analysis" element={<InstagramAnalysis />} />
          <Route path="/assessment/feed-analysis" element={<InstagramFeedAnalysis />} />
          <Route path="/assessment/business-metacognition" element={<BusinessMetacognitionTest />} />
          <Route path="/assessment/:id" element={<AssessmentDetail />} />
          <Route path="/assessment-detail/:id" element={<AssessmentDetail />} />
          <Route path="/assessment-history" element={<AssessmentHistory />} />
          <Route path="/fun-tests" element={<FunTests />} />
          <Route path="/fun-test-result" element={<FunTestResult />} />
          <Route path="/enfj-infp-compatibility" element={<ENFJvsINFPCompatibility />} />
          <Route path="/fingerprint-temperament" element={<FingerprintTemperamentTest />} />
          <Route path="/drawing-diary-htp" element={<DrawingDiaryHTP />} />
          <Route path="/growth-report" element={<GrowthDevelopmentReport />} />
          <Route path="/adhd-screening" element={<ADHDScreening />} />
          {/* 한의/사상체질 검사 영역 비활성화 — Assessment로 리다이렉트 */}
          <Route path="/han-medicine-test" element={<Navigate to="/assessment" replace />} />
          <Route path="/b2b/my-requests" element={<B2BMyRequests />} />
          <Route path="/advanced-adhd-test" element={<AdvancedAdhdTest />} />

          {/* Observation */}
          <Route path="/observation" element={<ObservationNew />} />
          <Route path="/observation-list" element={<ObservationList />} />
          <Route path="/observation/:id" element={<ObservationDetail />} />

          {/* Mind Diary */}
          <Route path="/mind-diary" element={<MindDiary />} />

          {/* Expert Finding */}
         <Route path="/expert-hiring" element={<ExpertHiring />} />
         <Route path="/expert-hiring/urgent-match" element={<UrgentExpertMatch />} />
         <Route path="/en/expert-hiring/urgent-match" element={<UrgentExpertMatch />} />
         <Route path="/booking-management" element={<BookingManagement />} />
         <Route path="/my-bookings" element={<BookingManagement />} />
          <Route path="/expert-detail/:id" element={<ExpertDetail />} />
          <Route path="/institution-detail/:id" element={<InstitutionDetailPage />} />
          <Route path="/partner-benefits" element={<InstitutionDetailPage />} />
          <Route path="/institution-application" element={<InstitutionApplication />} />
          <Route path="/data-sharing" element={<DataSharingConsent />} />
          <Route path="/institution-clients" element={<InstitutionClientDashboard />} />
          <Route path="/expert-application" element={<ExpertApplication />} />
          <Route path="/expert-contract/:expertId" element={<ExpertContract />} />
          <Route path="/expert-contract-success" element={<ExpertContractSuccess />} />

          {/* Payment & Pricing */}
          <Route path="/token-subscription" element={<TokenSubscription />} />
          <Route path="/subscription" element={<TokenSubscription />} />
          <Route path="/coaching-goals" element={<CoachingGoals />} />
          <Route path="/en/coaching-goals" element={<CoachingGoals />} />
          <Route path="/subscription/business" element={<BusinessSubscription />} />
          <Route path="/en/subscription/business" element={<BusinessSubscription />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/en/quiz" element={<Quiz />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-fail" element={<PaymentFail />} />
          <Route path="/payment-complete" element={<PaymentComplete />} />
          <Route path="/token-payment-success" element={<Navigate to="/payment-success" replace />} />
          <Route path="/token-payment-fail" element={<Navigate to="/payment-fail" replace />} />

          {/* SEO Package Landing Pages */}
          <Route path="/stress-package" element={<StressPackage />} />
          <Route path="/depression-package" element={<DepressionPackage />} />
          <Route path="/anxiety-package" element={<AnxietyPackage />} />
          <Route path="/focus-package" element={<FocusPackage />} />
          <Route path="/child-package" element={<ChildPackage />} />
          <Route path="/family" element={<ChildPackage />} />
          <Route path="/relationship-package" element={<RelationshipPackage />} />
          <Route path="/comprehensive-package" element={<ComprehensivePackage />} />
          <Route path="/career-package" element={<CareerPackage />} />

          {/* Content */}
          <Route path="/column" element={<Column />} />
          <Route path="/column/:slug" element={<React.Suspense fallback={<div />}><BlogPost /></React.Suspense>} />
          <Route path="/iep-generator" element={<IEPGenerator />} />
          <Route path="/iep-view/:id" element={<IEPView />} />
          <Route path="/wellness-lifestyle" element={<WellnessLifestyle />} />

          {/* IR & Business Docs */}
          <Route path="/ir-deck" element={<IRDeck />} />
          <Route path="/platform-summary" element={<PlatformOnePager />} />
          <Route path="/business" element={<Business />} />
          <Route path="/en/business" element={<Business />} />
          <Route path="/business/case-studies" element={<BusinessCaseStudies />} />
          <Route path="/business/case-studies/:slug" element={<BusinessCaseStudies />} />
          <Route path="/en/business/case-studies" element={<BusinessCaseStudies />} />
          <Route path="/en/business/case-studies/:slug" element={<BusinessCaseStudies />} />
          <Route path="/business/security" element={<BusinessSecurity />} />
          <Route path="/en/business/security" element={<BusinessSecurity />} />
          <Route path="/b2b-pricing" element={<BusinessPricing />} />
          <Route path="/en/b2b-pricing" element={<BusinessPricing />} />
          <Route path="/b2b-proposal" element={<B2BProposal />} />
          <Route path="/b2b-jobcoach" element={<B2BJobCoach />} />
          <Route path="/b2b-demo-report" element={<B2BDemoReport />} />
          <Route path="/en/b2b-demo-report" element={<B2BDemoReport />} />
          <Route path="/b2b-hr-dashboard" element={<B2BHRDashboard />} />
          <Route path="/b2b-kindergarten-console" element={<B2BKindergartenConsole />} />
          <Route path="/parent-assessment/:token" element={<ParentAssessment />} />
          <Route path="/startup-package" element={<StartupPackage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/mind-track-content" element={<AdminMindTrackContent />} />

          {/* Utility */}
          <Route path="/shared-report/demo" element={<DemoSharedReport />} />
          <Route path="/shared-report/:token" element={<SharedReport />} />
          <Route path="/share/:shareId" element={<ShareView />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/install" element={<InstallGuide />} />

          {/* Legal */}
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/about" element={<About />} />

          {/* English routes - mirror all Korean routes under /en prefix */}
          <Route path="/en" element={<Index />} />
          <Route path="/en/auth" element={<HighlightAuth />} />
          <Route path="/en/reset-password" element={<ResetPassword />} />
          <Route path="/en/dashboard" element={<DashboardRouter />} />
          <Route path="/en/profile" element={<Profile />} />
          <Route path="/en/settings" element={<Settings />} />
          <Route path="/en/ai-assistant" element={<AIAssistant />} />
          <Route path="/en/ai-counselor" element={<AIAssistant />} />
          <Route path="/en/ai-coach" element={<AIAssistant />} />
          <Route path="/en/concern-storage" element={<ConcernStorage />} />
          <Route path="/en/report-generator" element={<ReportGenerator />} />
          <Route path="/en/report-generator-pro" element={<ReportGeneratorPro />} />
          <Route path="/en/sample-report" element={<SampleReport />} />
          <Route path="/en/comprehensive-reporting" element={<ComprehensiveReporting />} />
          <Route path="/en/metaverse-voice" element={<MetaverseVoice />} />
          <Route path="/en/assessment" element={<UnifiedAssessmentHub />} />
          <Route path="/en/premium-assessment" element={<UnifiedAssessmentHub />} />
          <Route path="/en/free-trial" element={<FreeTrialAssessment />} />
          <Route path="/en/free-trial-result" element={<FreeTrialResult />} />
          <Route path="/en/assessment/mental-health-quick-test" element={<BasicMentalHealthTest />} />
          <Route path="/en/assessment/personality-love-test" element={
            <PersonalityLoveTest onComplete={(result) => console.log('Test completed:', result)} />
          } />
          <Route path="/en/assessment/stress-test" element={<Assessment />} />
          <Route path="/en/assessment/past-life-job-test" element={<PastLifeJobTestFree />} />
          <Route path="/en/assessment/relationship-style-test" element={<RelationshipStyleTest />} />
          <Route path="/en/assessment/communication-style-test" element={<CommunicationStyleTest />} />
          <Route path="/en/assessment/defense-mechanism-test" element={<DefenseMechanismTest />} />
          <Route path="/en/assessment/attachment-style-test" element={<AttachmentStyleTest />} />
          <Route path="/en/assessment/mbti-test" element={<MBTITest />} />
          <Route path="/en/assessment/energy-flow" element={<EnergyFlowTest />} />
          <Route path="/en/assessment/relationship-dynamics" element={<RelationshipDynamicsTest />} />
          <Route path="/en/assessment/life-purpose" element={<LifePurposeTest />} />
          <Route path="/en/assessment/pattern-iq-test" element={<PatternIQTest />} />
          <Route path="/en/assessment/resilience" element={<ResilienceTest />} />
          <Route path="/en/assessment/instagram-analysis" element={<InstagramAnalysis />} />
          <Route path="/en/assessment/feed-analysis" element={<InstagramFeedAnalysis />} />
          <Route path="/en/assessment/business-metacognition" element={<BusinessMetacognitionTest />} />
          <Route path="/en/assessment/:id" element={<AssessmentDetail />} />
          <Route path="/en/assessment-detail/:id" element={<AssessmentDetail />} />
          <Route path="/en/assessment-history" element={<AssessmentHistory />} />
          <Route path="/en/fun-tests" element={<FunTests />} />
          <Route path="/en/fun-test-result" element={<FunTestResult />} />
          <Route path="/en/enfj-infp-compatibility" element={<ENFJvsINFPCompatibility />} />
          <Route path="/en/fingerprint-temperament" element={<FingerprintTemperamentTest />} />
          <Route path="/en/drawing-diary-htp" element={<DrawingDiaryHTP />} />
          <Route path="/en/growth-report" element={<GrowthDevelopmentReport />} />
          <Route path="/en/adhd-screening" element={<ADHDScreening />} />
          <Route path="/en/han-medicine-test" element={<Navigate to="/en/assessment" replace />} />
          <Route path="/en/b2b/my-requests" element={<B2BMyRequests />} />
          <Route path="/en/advanced-adhd-test" element={<AdvancedAdhdTest />} />
          <Route path="/en/observation" element={<ObservationNew />} />
          <Route path="/en/observation-list" element={<ObservationList />} />
          <Route path="/en/observation/:id" element={<ObservationDetail />} />
          <Route path="/en/mind-diary" element={<MindDiary />} />
          <Route path="/en/expert-hiring" element={<ExpertHiring />} />
          <Route path="/en/expert-detail/:id" element={<ExpertDetail />} />
          <Route path="/en/institution/:id" element={<InstitutionDetailPage />} />
          <Route path="/en/expert-application" element={<ExpertApplication />} />
          <Route path="/en/token-subscription" element={<TokenSubscription />} />
          <Route path="/en/pricing" element={<TokenSubscription />} />
          <Route path="/en/payment" element={<Payment />} />
          <Route path="/en/payment-success" element={<PaymentSuccess />} />
          <Route path="/en/payment-fail" element={<PaymentFail />} />
          <Route path="/en/column" element={<Column />} />
          <Route path="/en/column/:slug" element={<React.Suspense fallback={<div />}><BlogPost /></React.Suspense>} />
          <Route path="/en/wellness-lifestyle" element={<WellnessLifestyle />} />
          <Route path="/en/referral" element={<Referral />} />
          <Route path="/en/install" element={<InstallGuide />} />
          <Route path="/en/terms-of-service" element={<TermsOfService />} />
          <Route path="/en/terms" element={<TermsOfService />} />
          <Route path="/en/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/en/privacy" element={<PrivacyPolicy />} />
          <Route path="/en/refund-policy" element={<RefundPolicy />} />
          <Route path="/en/refund" element={<RefundPolicy />} />
          <Route path="/en/about" element={<About />} />
          <Route path="/en/share/:shareId" element={<ShareView />} />

          {/* Email unsubscribe */}
          <Route path="/unsubscribe" element={<Unsubscribe />} />

          {/* New track / b2b / partner routes (placeholders + aliases) */}
          <Route path="/track/child" element={<Navigate to="/mind-track" replace />} />
          <Route path="/track/adult" element={<TrackAdultComingSoon />} />
          <Route path="/track/teen" element={<TrackTeenComingSoon />} />
          <Route path="/tests/child-development" element={<Navigate to="/child-package" replace />} />
          <Route path="/b2b" element={<Navigate to="/business" replace />} />
          <Route path="/b2b/dev-center" element={<Navigate to="/b2b-proposal?segment=dev-center" replace />} />
          <Route path="/b2b/counseling" element={<Navigate to="/b2b-proposal?segment=counseling" replace />} />
          <Route path="/app/parent" element={<Navigate to="/dashboard" replace />} />
          <Route path="/app/center" element={<PartnerCenterDashboard />} />
          <Route path="/app/center/clients" element={<Navigate to="/institution-client-dashboard" replace />} />
          <Route path="/c/:slug" element={<CenterReferralLanding />} />
          <Route path="/beta" element={<BetaRecruitment />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about/expert" element={<AboutExpert />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
              </Routes>
               {/* <FeedbackButton /> */}
               <MobileBottomTab />
              </LanguageProvider>
            </ErrorBoundary>
          </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
  );
};

export default App;
