import React, { Suspense, lazy } from "react";

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
import { ConversionTracker } from "@/components/analytics/ConversionTracker";
import { useB2BFunnelAutoTrack } from "@/hooks/useB2BFunnelTracking";

function B2BFunnelTracker() {
  useB2BFunnelAutoTrack();
  return null;
}

// Eagerly loaded (landing + fallback)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy: Core
const MobileHome = lazy(() => import("./pages/MobileHome"));
const WhatsNew = lazy(() => import("./pages/WhatsNew"));
const Store = lazy(() => import("./pages/Store"));
const CheckFlow = lazy(() => import("./pages/lite/CheckFlow"));
const CheckDone = lazy(() => import("./pages/lite/CheckDone"));
const TherapistSubscriptionTeaser = lazy(() => import("./pages/lite/TherapistSubscriptionTeaser"));
const TherapistMySchedule = lazy(() => import("./pages/TherapistMySchedule"));
const TherapistInviteRedirect = lazy(() => import("./pages/TherapistInviteRedirect"));
const TherapistMyNotes = lazy(() => import("./pages/TherapistMyNotes"));
const MktStudioDemo = lazy(() => import("./pages/internal/MktStudioDemo"));
const TherapistMyClients = lazy(() => import("./pages/TherapistMyClients"));
const FindCenter = lazy(() => import("./pages/lite/FindCenter"));
const PublicCenter = lazy(() => import("./pages/PublicCenter"));
const HighlightAuth = lazy(() => import("./pages/HighlightAuth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const BookingManagement = lazy(() => import("./pages/BookingManagement"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const GuardianNotice = lazy(() => import("./pages/GuardianNotice"));
const GuardianReportView = lazy(() => import("./pages/r/GuardianReportView"));

// Lazy: AI Analysis & Core Features
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const AiCopilotPage = lazy(() => import("./pages/AiCopilotPage"));
const ConcernStorage = lazy(() => import("./pages/ConcernStorage"));
const WriteConcern = lazy(() => import("./pages/WriteConcern"));
const ReportGenerator = lazy(() => import("./pages/ReportGenerator"));
const ReportGeneratorPro = lazy(() => import("./pages/ReportGeneratorPro"));
const MyJourney = lazy(() => import("./pages/MyJourney"));
const CoachingPreferences = lazy(() => import("./pages/CoachingPreferences"));
const VerifyReport = lazy(() => import("./pages/VerifyReport"));
const VoucherFinder = lazy(() => import("./pages/VoucherFinder"));
const MetaverseVoice = lazy(() => import("./pages/MetaverseVoice"));
const VoiceCounselingNew = lazy(() => import("./pages/VoiceCounselingNew"));
const VoiceCounselingHistory = lazy(() => import("./pages/VoiceCounselingHistory"));

// Lazy: Assessment & Tests
const Assessment = lazy(() => import("./pages/Assessment"));
const PremiumAssessment = lazy(() => import("./pages/PremiumAssessment"));
const UnifiedAssessmentHub = lazy(() => import("./components/assessment/UnifiedAssessmentHub"));
const FreeTrialAssessment = lazy(() => import("./pages/FreeTrialAssessment"));
const FreeTrialResult = lazy(() => import("./pages/FreeTrialResult"));
const BasicMentalHealthTest = lazy(() => import("./components/assessment/BasicMentalHealthTest"));
const PastLifeJobTestFree = lazy(() => import("./components/assessment/PastLifeJobTestFree"));
const PersonalityLoveTest = lazy(() =>
  import("./components/assessment/PersonalityLoveTest").then(m => ({ default: m.PersonalityLoveTest }))
);
const RelationshipStyleTest = lazy(() => import("./pages/RelationshipStyleTest"));
const CommunicationStyleTest = lazy(() => import("./pages/CommunicationStyleTest"));
const DefenseMechanismTest = lazy(() => import("./pages/DefenseMechanismTest"));
const AttachmentStyleTest = lazy(() => import("./pages/AttachmentStyleTest"));
const MBTITest = lazy(() => import("./pages/MBTITest"));
const EnergyFlowTest = lazy(() => import("./pages/EnergyFlowTest"));
const RelationshipDynamicsTest = lazy(() => import("./pages/RelationshipDynamicsTest"));
const LifePurposeTest = lazy(() => import("./pages/LifePurposeTest"));
const ResilienceTest = lazy(() => import("./pages/ResilienceTest"));
const PatternIQTest = lazy(() => import("./pages/PatternIQTest"));
const InstagramAnalysis = lazy(() => import("./pages/InstagramAnalysis"));
const InstagramFeedAnalysis = lazy(() => import("./pages/InstagramFeedAnalysis"));
const BusinessMetacognitionTest = lazy(() => import("./pages/BusinessMetacognitionTest"));
const AssessmentDetail = lazy(() => import("./pages/AssessmentDetail"));
const FunTests = lazy(() => import("./pages/FunTests"));
const FunTestResult = lazy(() => import("./pages/FunTestResult"));
const B2BMyRequests = lazy(() => import("./pages/B2BMyRequests"));
const AdvancedAdhdTest = lazy(() => import("./pages/AdvancedAdhdTest"));
const ADHDScreening = lazy(() => import("./pages/ADHDScreening"));
const FingerprintTemperamentTest = lazy(() => import("./pages/FingerprintTemperamentTest"));
const DrawingDiaryHTP = lazy(() => import("./pages/DrawingDiaryHTP"));
const GrowthDevelopmentReport = lazy(() => import("./pages/GrowthDevelopmentReport"));
const AssessmentHistory = lazy(() => import("./components/history/AssessmentHistory"));
const SampleReport = lazy(() => import("./pages/SampleReport"));
const ComprehensiveReporting = lazy(() => import("./pages/ComprehensiveReporting"));
const ENFJvsINFPCompatibility = lazy(() => import("./pages/ENFJvsINFPCompatibility"));
const SharedReport = lazy(() => import("./pages/SharedReport"));
const DemoSharedReport = lazy(() => import("./pages/DemoSharedReport"));

// Lazy: Observation
const ObservationNew = lazy(() => import("./pages/ObservationNew"));
const ObservationList = lazy(() => import("./pages/ObservationList"));
const ObservationDetail = lazy(() => import("./pages/ObservationDetail"));

// Lazy: Expert Finding
const ExpertHiring = lazy(() => import("./pages/ExpertHiring"));
const UrgentExpertMatch = lazy(() => import("./pages/UrgentExpertMatch"));
const ExpertDetail = lazy(() => import("./pages/ExpertDetail"));
const InstitutionDetailPage = lazy(() => import("./pages/InstitutionDetailPage"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail"));
const PartnerConsole = lazy(() => import("./pages/PartnerConsole"));
const InstitutionApplication = lazy(() => import("./pages/InstitutionApplication"));
const DataSharingConsent = lazy(() => import("./pages/DataSharingConsent"));
const InstitutionClientDashboard = lazy(() => import("./pages/InstitutionClientDashboard"));
const ExpertApplication = lazy(() => import("./pages/ExpertApplication"));
const ExpertContract = lazy(() => import("./pages/ExpertContract"));
const ExpertContractSuccess = lazy(() => import("./pages/ExpertContractSuccess"));

// Lazy: Payment
const Payment = lazy(() => import("./pages/Payment"));
const TokenSubscription = lazy(() => import("./pages/TokenSubscription"));
const CoachingGoals = lazy(() => import("./pages/CoachingGoals"));
const BusinessSubscription = lazy(() => import("./pages/BusinessSubscription"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const MindTrackOnboarding = lazy(() => import("./pages/MindTrackOnboarding"));
const MindTrackOnboardingFunnel = lazy(() => import("./pages/MindTrackOnboardingFunnel"));
const DevMindTrackGrant = lazy(() => import("./pages/DevMindTrackGrant"));
const PaymentComplete = lazy(() => import("./pages/PaymentComplete"));
const PaymentFail = lazy(() => import("./pages/PaymentFail"));
const Pricing = lazy(() => import("./pages/Pricing"));

// Lazy: Mind Diary
const MindDiary = lazy(() => import("./pages/MindDiary"));

// Lazy: Mind Track (killer product)
const MindTrack = lazy(() => import("./pages/MindTrack"));
const MindTrackStart = lazy(() => import("./pages/MindTrackStart"));
const MindTrackWorkbook = lazy(() => import("./pages/MindTrackWorkbook"));
const MindTrackDashboard = lazy(() => import("./pages/MindTrackDashboard"));
const MindTrackWorkbookPreview = lazy(() => import("./pages/MindTrackWorkbookPreview"));
const TrackMissions = lazy(() => import("./pages/TrackMissions"));
const MindTrackCheckResult = lazy(() => import("./pages/MindTrackCheckResult"));
const Quiz = lazy(() => import("./pages/Quiz"));

// Lazy: Content & Column
const Column = lazy(() => import("./pages/Column"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const IEPGenerator = lazy(() => import("./pages/IEPGenerator"));
const IEPView = lazy(() => import("./pages/IEPView"));

// Lazy: IR / Business Docs
const IRDeck = lazy(() => import("./pages/IRDeck"));
const PlatformOnePager = lazy(() => import("./pages/PlatformOnePager"));
const B2BProposal = lazy(() => import("./pages/B2BProposal"));
const B2BJobCoach = lazy(() => import("./pages/B2BJobCoach"));
const Business = lazy(() => import("./pages/Business"));
const BusinessCaseStudies = lazy(() => import("./pages/BusinessCaseStudies"));
const BusinessSecurity = lazy(() => import("./pages/BusinessSecurity"));
const BusinessPricing = lazy(() => import("./pages/BusinessPricing"));
const B2BDemoReport = lazy(() => import("./pages/B2BDemoReport"));
const B2BABADemoDashboard = lazy(() => import("./pages/B2BABADemoDashboard"));
const B2BHRDashboard = lazy(() => import("./pages/B2BHRDashboard"));
const B2BKindergartenConsole = lazy(() => import("./pages/B2BKindergartenConsole"));
const ParentAssessment = lazy(() => import("./pages/ParentAssessment"));
const StartupPackage = lazy(() => import("./pages/StartupPackage"));

// Lazy: Legal
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const CrisisPolicy = lazy(() => import("./pages/legal/CrisisPolicy"));
const MedicalDisclaimerPage = lazy(() => import("./pages/legal/MedicalDisclaimerPage"));

// Lazy: Admin
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminMindTrackContent = lazy(() => import("./pages/AdminMindTrackContent"));
const AdminPaymentMonitor = lazy(() => import("./pages/AdminPaymentMonitor"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));
const PartnerLeads = lazy(() => import("./pages/PartnerLeads"));

// Lazy: Utility
const ShareView = lazy(() => import("./pages/ShareView"));
const Referral = lazy(() => import("./pages/Referral"));
const Rewards = lazy(() => import("./pages/Rewards"));
const InstallGuide = lazy(() => import("./pages/InstallGuide"));
const WellnessLifestyle = lazy(() => import("./pages/WellnessLifestyle"));
const About = lazy(() => import("./pages/About"));
const TrackAdult = lazy(() => import("./pages/TrackAdult"));
const TrackParent = lazy(() => import("./pages/TrackParent"));
const TrackTeenComingSoon = lazy(() => import("./pages/TrackTeenComingSoon"));
const CenterReferralLanding = lazy(() => import("./pages/CenterReferralLanding"));
const CenterLandingPublic = lazy(() => import("./pages/CenterLandingPublic"));
const LandingBuilderPage = lazy(() => import("./pages/b2b-center/console/LandingBuilderPage"));
const LeadsInboxPage = lazy(() => import("./pages/b2b-center/console/LeadsInboxPage"));
const PartnerCenterDashboard = lazy(() => import("./pages/PartnerCenterDashboard"));
const PartnerCenterReferrals = lazy(() => import("./pages/PartnerCenterReferrals"));
const BetaRecruitment = lazy(() => import("./pages/BetaRecruitment"));
const Reviews = lazy(() => import("./pages/Reviews"));
const AboutExpert = lazy(() => import("./pages/AboutExpert"));

// Lazy: B2B 발달치료센터
const B2BCenterLanding = lazy(() => import("./pages/b2b-center/B2BCenterLanding"));
const B2BCenterImport = lazy(() => import("./pages/b2b-center/B2BCenterImport"));
const B2BCenterMigrate = lazy(() => import("./pages/b2b-center/B2BCenterMigrate"));
const B2BCenterApp = lazy(() => import("./pages/b2b-center/B2BCenterApp"));
const CenterStorefrontPage = lazy(() => import("./pages/b2b-center/console/CenterStorefrontPage"));
const CenterStorefrontPublic = lazy(() => import("./pages/b2b-center/CenterStorefrontPublic"));
const CenterClientsPage = lazy(() => import("./pages/b2b-center/console/ClientsPage"));
const CenterByTherapistPage = lazy(() => import("./pages/b2b-center/console/ByTherapistPage"));
const CenterAttendancePage = lazy(() => import("./pages/b2b-center/console/AttendancePage"));
const CenterBillingStatsPage = lazy(() => import("./pages/b2b-center/console/BillingStatsPage"));
const CenterBillingProcessPage = lazy(() => import("./pages/b2b-center/console/BillingProcessPage"));
const CenterTherapistsAdminPage = lazy(() => import("./pages/b2b-center/console/TherapistsAdminPage"));
const CenterPlaceholderBase = lazy(() => import("./pages/b2b-center/console/PlaceholderPage"));
const CenterOrganizationPage = lazy(() => import("./pages/b2b-center/console/OrganizationPage"));
const CenterSchedulePage = lazy(() => import("./pages/b2b-center/console/SchedulePage"));
const CenterAssessmentsPage = lazy(() => import("./pages/b2b-center/console/AssessmentsPage"));
const CenterMonthlyServicesPage = lazy(() => import("./pages/b2b-center/console/MonthlyServicesPage"));
const CenterVoucherAuditPage = lazy(() => import("./pages/b2b-center/console/VoucherAuditPage"));
const CenterProgramsPage = lazy(() => import("./pages/b2b-center/console/ProgramsPage"));
const CenterParentReportsPage = lazy(() => import("./pages/b2b-center/console/ParentReportsPage"));
const CenterWhitelabelReportPreviewPage = lazy(() => import("./pages/b2b-center/console/WhitelabelReportPreviewPage"));
const CenterTherapyNotesPage = lazy(() => import("./pages/b2b-center/console/TherapyNotesPage"));
const ParentCenterPage = lazy(() => import("./pages/parent/ParentCenterPage"));
const ParentShareLandingPage = lazy(() => import("./pages/parent/ParentShareLandingPage"));
const ParentResourceViewPage = lazy(() => import("./pages/parent/ParentResourceViewPage"));
const CenterOpsDashboardPage = lazy(() => import("./pages/b2b-center/console/OpsDashboardPage"));
const B2BCenterInvite = lazy(() => import("./pages/b2b-center/B2BCenterInvite"));
const CenterInviteClaim = lazy(() => import("./pages/CenterInviteClaim"));
const CenterGuidePage = lazy(() => import("./pages/b2b-center/console/GuidePage"));
const CenterVoucherExcelImportPage = lazy(() => import("./pages/b2b-center/console/VoucherExcelImportPage"));
const CenterVoucherClaimsPage = lazy(() => import("./pages/b2b-center/console/VoucherClaimsPage"));
const CenterOnboardingWizardPage = lazy(() => import("./pages/b2b-center/console/OnboardingWizardPage"));
const CenterSessionRecordsPage = lazy(() => import("./pages/b2b-center/console/SessionRecordsPage"));
const CenterBetaTrackerPage = lazy(() => import("./pages/b2b-center/admin/BetaTrackerPage"));

// Lazy: SEO Package Landing Pages
const StressPackage = lazy(() => import("./pages/StressPackage"));
const DepressionPackage = lazy(() => import("./pages/DepressionPackage"));
const AnxietyPackage = lazy(() => import("./pages/AnxietyPackage"));
const FocusPackage = lazy(() => import("./pages/FocusPackage"));
const ChildPackage = lazy(() => import("./pages/ChildPackage"));
const RelationshipPackage = lazy(() => import("./pages/RelationshipPackage"));
const ComprehensivePackage = lazy(() => import("./pages/ComprehensivePackage"));
const CareerPackage = lazy(() => import("./pages/CareerPackage"));

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

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="h-6 w-6 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
  </div>
);

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

              <Suspense fallback={<RouteFallback />}>
              <Routes>
          {/* ===== Core Routes ===== */}
          <Route path="/" element={<Navigate to="/b2b-center" replace />} />
          <Route path="/c2c" element={<Index />} />
          <Route path="/internal/mkt-studio-demo" element={<MktStudioDemo />} />
          <Route path="/home" element={<MobileHome />} />
          <Route path="/whats-new" element={<WhatsNew />} />
          <Route path="/store" element={<Store />} />
          {/* ===== Lite Check (Day 2) — 비회원 발달체크 ===== */}
          <Route path="/check" element={<CheckFlow />} />
          <Route path="/check/done" element={<CheckDone />} />
          <Route path="/therapist-subscription" element={<TherapistSubscriptionTeaser />} />
          <Route path="/therapist/my-schedule" element={<TherapistMySchedule />} />
          <Route path="/t" element={<TherapistInviteRedirect />} />
          <Route path="/therapist/my-notes" element={<TherapistMyNotes />} />
          <Route path="/therapist/my-clients" element={<TherapistMyClients />} />
          <Route path="/therapist/my-clients/:id" element={<TherapistMyClients />} />
          <Route path="/therapist/claim" element={<TherapistMySchedule />} />
          <Route path="/g/:token" element={<GuardianNotice />} />
          <Route path="/r/:token" element={<GuardianReportView />} />
          <Route path="/parent-share/:token" element={<ParentShareLandingPage />} />
          <Route path="/parent/reports/:id" element={<ParentResourceViewPage />} />
          <Route path="/parent/notes/:id" element={<ParentResourceViewPage />} />
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
          <Route path="/write-concern" element={<WriteConcern />} />
          <Route path="/en/write-concern" element={<WriteConcern />} />
          <Route path="/report-generator" element={<ReportGenerator />} />
          <Route path="/report-generator-pro" element={<ReportGeneratorPro />} />
          <Route path="/my-journey" element={<MyJourney />} />
          <Route path="/coaching-preferences" element={<CoachingPreferences />} />
          <Route path="/en/my-journey" element={<MyJourney />} />
          <Route path="/en/coaching-preferences" element={<CoachingPreferences />} />
          <Route path="/verify-report/:token" element={<VerifyReport />} />
          <Route path="/en/verify-report/:token" element={<VerifyReport />} />
          <Route path="/voucher-finder" element={<VoucherFinder />} />
          <Route path="/en/voucher-finder" element={<VoucherFinder />} />
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
         <Route path="/partner/:slug" element={<PartnerDetail />} />
         <Route path="/partner-console" element={<PartnerConsole />} />
         <Route path="/expert-hiring/urgent-match" element={<UrgentExpertMatch />} />
         <Route path="/en/expert-hiring/urgent-match" element={<UrgentExpertMatch />} />
         <Route path="/booking-management" element={<BookingManagement />} />
         <Route path="/my-bookings" element={<BookingManagement />} />
          <Route path="/expert-detail/:id" element={<ExpertDetail />} />
          <Route path="/institution-detail/:id" element={<InstitutionDetailPage />} />
           <Route path="/find-center" element={<FindCenter />} />
           <Route path="/c/:id" element={<PublicCenter />} />
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
          <Route path="/column/:slug" element={<BlogPost />} />
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
          <Route path="/b2b/aba-demo" element={<B2BABADemoDashboard />} />
          <Route path="/en/b2b/aba-demo" element={<B2BABADemoDashboard />} />
          <Route path="/b2b-hr-dashboard" element={<B2BHRDashboard />} />
          <Route path="/b2b-kindergarten-console" element={<B2BKindergartenConsole />} />
          <Route path="/parent-assessment/:token" element={<ParentAssessment />} />
          <Route path="/startup-package" element={<StartupPackage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/mind-track-content" element={<AdminMindTrackContent />} />
          <Route path="/admin/payment-monitor" element={<AdminPaymentMonitor />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/partner/leads" element={<PartnerLeads />} />

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
          <Route path="/legal/terms" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/legal/refund" element={<RefundPolicy />} />
          <Route path="/legal/crisis" element={<CrisisPolicy />} />
          <Route path="/legal/medical-disclaimer" element={<MedicalDisclaimerPage />} />
          <Route path="/en/legal/terms" element={<TermsOfService />} />
          <Route path="/en/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/en/legal/refund" element={<RefundPolicy />} />
          <Route path="/en/legal/crisis" element={<CrisisPolicy />} />
          <Route path="/en/legal/medical-disclaimer" element={<MedicalDisclaimerPage />} />
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
          <Route path="/en/column/:slug" element={<BlogPost />} />
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
          <Route path="/track/child" element={<Navigate to="/mind-track?audience=child" replace />} />
          <Route path="/track/adult" element={<TrackAdult />} />
          <Route path="/track/parent" element={<TrackParent />} />
          <Route path="/track/teen" element={<TrackTeenComingSoon />} />
          <Route path="/tests/child-development" element={<Navigate to="/child-package" replace />} />
          <Route path="/b2b" element={<Navigate to="/business" replace />} />
          <Route path="/b2b/dev-center" element={<Navigate to="/b2b-proposal?segment=dev-center" replace />} />
          <Route path="/b2b/counseling" element={<Navigate to="/b2b-proposal?segment=counseling" replace />} />
          <Route path="/eap-service" element={<Navigate to="/business#eap" replace />} />
          <Route path="/en/eap-service" element={<Navigate to="/en/business#eap" replace />} />
          <Route path="/b2b-consulting" element={<Navigate to="/business#solutions" replace />} />
          <Route path="/en/b2b-consulting" element={<Navigate to="/en/business#solutions" replace />} />
          <Route path="/for-business" element={<Navigate to="/business" replace />} />
          <Route path="/app/parent" element={<Navigate to="/dashboard" replace />} />
          <Route path="/app/center" element={<PartnerCenterDashboard />} />
          <Route path="/app/center/referrals" element={<PartnerCenterReferrals />} />
          <Route path="/app/center/clients" element={<Navigate to="/institution-client-dashboard" replace />} />
          <Route path="/c/:slug" element={<CenterReferralLanding />} />
          <Route path="/lp/:slug" element={<CenterLandingPublic />} />
          <Route path="/beta" element={<BetaRecruitment />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about/expert" element={<AboutExpert />} />

          {/* B2B 발달치료센터 (Phase 1: Landing + Import + Read-only console) */}
          <Route path="/b2b-center" element={<B2BCenterLanding />} />
          <Route path="/b2b-center/import" element={<B2BCenterImport />} />
          <Route path="/b2b-center/migrate" element={<B2BCenterMigrate />} />
          <Route path="/b2b-center/invite/:token" element={<B2BCenterInvite />} />
          <Route path="/center-invite" element={<CenterInviteClaim />} />
          <Route path="/center-invite/:token" element={<CenterInviteClaim />} />
          <Route path="/b2b-center/app" element={<B2BCenterApp />}>
            <Route index element={<Navigate to="intelligence/ops-dashboard" replace />} />
            <Route path="clients" element={<CenterClientsPage />} />
            <Route path="services/by-therapist" element={<CenterByTherapistPage />} />
            <Route path="services/attendance" element={<CenterAttendancePage />} />
            <Route path="billing/process" element={<CenterBillingProcessPage />} />
            <Route path="billing/stats" element={<CenterBillingStatsPage />} />
            <Route path="admin/therapists" element={<CenterTherapistsAdminPage />} />
            <Route path="schedule" element={<CenterSchedulePage />} />
            <Route path="assessments" element={<CenterAssessmentsPage />} />
            <Route path="services/monthly" element={<CenterMonthlyServicesPage />} />
            <Route path="services/records" element={<Navigate to="../intelligence/therapy-notes" replace />} />
            <Route path="billing/voucher-audit" element={<CenterVoucherAuditPage />} />
            <Route path="admin/programs" element={<CenterProgramsPage />} />
            <Route path="admin/organization" element={<CenterOrganizationPage />} />
            <Route path="intelligence/parent-reports" element={<CenterParentReportsPage />} />
            <Route path="intelligence/parent-reports/whitelabel" element={<CenterWhitelabelReportPreviewPage />} />
            <Route path="intelligence/therapy-notes" element={<CenterTherapyNotesPage />} />
            <Route path="intelligence/ops-dashboard" element={<CenterOpsDashboardPage />} />
            <Route path="guide" element={<CenterGuidePage />} />
            <Route path="data/voucher-excel" element={<CenterVoucherExcelImportPage />} />
            <Route path="billing/voucher-claims" element={<CenterVoucherClaimsPage />} />
            <Route path="setup" element={<CenterOnboardingWizardPage />} />
            <Route path="storefront" element={<CenterStorefrontPage />} />
            <Route path="admin/beta-tracker" element={<CenterBetaTrackerPage />} />
          </Route>
          <Route path="/center/:slug" element={<CenterStorefrontPublic />} />
          <Route path="/parent/center" element={<ParentCenterPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />

              </Routes>
              </Suspense>
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
