import React from "react";
import { HelmetProvider } from "react-helmet-async";
import LiveFeedWidget from "@/components/LiveFeedWidget";
import { InstitutionMarketingPresentation } from "@/components/institutions/InstitutionMarketingPresentation";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ui/error-boundary";
import NetworkStatus from "@/components/common/NetworkStatus";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import Analytics from "@/components/common/Analytics";
import Index from "./pages/Index";
import IEPGenerator from "./pages/IEPGenerator";
import DevelopmentalScreening from "./pages/AutismScreening";
import Assessment from "./pages/Assessment";
import FreeTrialAssessment from "./pages/FreeTrialAssessment";
import BasicMentalHealthTest from "./components/assessment/BasicMentalHealthTest";
import PremiumAssessment from "./pages/PremiumAssessment";
import AICounselor from "./pages/AICounselor";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NeedsAssessment from "./pages/NeedsAssessment";
import QuickNeeds from "./pages/QuickNeeds";

// HIGHLIGHT MVP Pages
import HighlightAuth from "./pages/HighlightAuth";
import HighlightDashboard from "./pages/HighlightDashboard";
import HighlightAI from "./pages/HighlightAI";

import { TypebotEmbed } from "./components/highlight/TypebotEmbed";
import { TestResults } from "./components/highlight/TestResults";
import { PersonalityLoveTest } from "./components/assessment/PersonalityLoveTest";
import { PersonalityLoveResult } from "./components/assessment/PersonalityLoveResult";
import RelationshipStyleTest from "./pages/RelationshipStyleTest";
import CommunicationStyleTest from "./pages/CommunicationStyleTest";


import CounselingFlow from "./pages/CounselingFlow";
import Corporate from "./pages/Corporate";
import Community from "./pages/Community";
import Subscription from "./pages/Subscription";
import TokenSubscription from "./pages/TokenSubscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import TokenPaymentSuccess from "./pages/TokenPaymentSuccess";
import TokenPaymentFail from "./pages/TokenPaymentFail";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import Pricing from "./pages/Pricing";
import Observation from "./pages/Observation";
import ObservationNew from "./pages/ObservationNew";
import Expert from "./pages/Expert";
import Experts from "./pages/Experts";
import ExpertConsultation from "./pages/ExpertConsultation";
import ExpertDashboard from "./pages/ExpertDashboard";
import ExpertApplication from "./pages/ExpertApplication";
import ExpertContract from "./pages/ExpertContract";
import ExpertContractSuccess from "./pages/ExpertContractSuccess";
import ExpertHiring from "./pages/ExpertHiring";
import Institutions from "./pages/Institutions";
import HomeService from "./pages/HomeService";
import NotFound from "./pages/NotFound";
import ShareView from "./pages/ShareView";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import GrowthCommunity from "./pages/GrowthCommunity";
import TokenTest from "./pages/TokenTest";
import StressPackage from "./pages/StressPackage";
import DepressionPackage from "./pages/DepressionPackage";
import AnxietyPackage from "./pages/AnxietyPackage";
import FocusPackage from "./pages/FocusPackage";
import ChildPackage from "./pages/ChildPackage";
import RelationshipPackage from "./pages/RelationshipPackage";
import ComprehensivePackage from "./pages/ComprehensivePackage";
import GrowthStories from "./pages/GrowthStories";

import AssessmentHistory from "./components/history/AssessmentHistory";
import FunTests from "./pages/FunTests";
import FunTestResult from "./pages/FunTestResult";
import HanMedicineTest from "./pages/HanMedicineTest";
import IEPView from "./pages/IEPView";
import AdminDashboard from "./pages/AdminDashboard";
import InstitutionAdmin from "./pages/InstitutionAdmin";

import { SessionManager } from "./components/SessionManager";
import FloatingAIHAgent from "./components/FloatingAIHAgent";

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
              <NetworkStatus />
              <SessionManager />
              <Routes>
          {/* Main Routes - Simplified User Journey */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<HighlightAuth />} />
          <Route path="/dashboard" element={<Dashboard />} />
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
          <Route path="/assessment/relationship-style-test" element={<RelationshipStyleTest />} />
          <Route path="/assessment/communication-style-test" element={<CommunicationStyleTest />} />
          <Route path="/assessment/:id" element={<TestResults />} />
           <Route path="/fun-tests" element={<FunTests />} />
           <Route path="/fun-test-result" element={<FunTestResult />} />
          <Route path="/assessment-history" element={<AssessmentHistory />} />
          <Route path="/counseling" element={<CounselingFlow />} />
          <Route path="/ai-counselor" element={<AICounselor />} />
          <Route path="/needs-assessment" element={<NeedsAssessment />} />
          <Route path="/quick-needs" element={<QuickNeeds />} />
          <Route path="/stress-package" element={<StressPackage />} />
          <Route path="/depression-package" element={<DepressionPackage />} />
          <Route path="/anxiety-package" element={<AnxietyPackage />} />
          <Route path="/focus-package" element={<FocusPackage />} />
          <Route path="/child-package" element={<ChildPackage />} />
          <Route path="/relationship-package" element={<RelationshipPackage />} />
          <Route path="/comprehensive-package" element={<ComprehensivePackage />} />
          <Route path="/family" element={<ChildPackage />} />
          <Route path="/han-medicine-test" element={<HanMedicineTest />} />
          <Route path="/iep-generator" element={<IEPGenerator />} />
          <Route path="/iep-view/:id" element={<IEPView />} />
          <Route path="/autism-screening" element={<DevelopmentalScreening />} />
          
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/community" element={<Community />} />
          <Route path="/growth-community" element={<GrowthCommunity />} />
          <Route path="/growth-stories" element={<GrowthStories />} />
          <Route path="/subscription" element={<TokenSubscription />} />
          <Route path="/token-subscription" element={<TokenSubscription />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/institution-admin" element={<InstitutionAdmin />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/share/:shareId" element={<ShareView />} />
          <Route path="/observation" element={<ObservationNew />} />
          <Route path="/observation-old" element={<Observation />} />
          <Route path="/expert" element={<Expert />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/expert-dashboard" element={<ExpertDashboard />} />
          <Route path="/consultation/:roomId" element={<ExpertConsultation />} />
          <Route path="/expert-contract/:expertId" element={<ExpertContract />} />
          <Route path="/expert-contract-success" element={<ExpertContractSuccess />} />
          <Route path="/expert-hiring" element={<ExpertHiring />} />
          <Route path="/expert-application" element={<ExpertApplication />} />
          <Route path="/institutions" element={<Institutions />} />
          <Route path="/home-service" element={<HomeService />} />
          <Route path="/institution-marketing" element={<InstitutionMarketingPresentation />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-fail" element={<PaymentFail />} />
          <Route path="/token-payment-success" element={<TokenPaymentSuccess />} />
          <Route path="/token-payment-fail" element={<TokenPaymentFail />} />
          <Route path="/token-test" element={<TokenTest />} />
          
          {/* Stripe subscription routes removed
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/subscription-cancel" element={<SubscriptionCancel />} />
          */}
          
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
              </Routes>
              <LiveFeedWidget />
              <FloatingAIHAgent />
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
};

export default App;