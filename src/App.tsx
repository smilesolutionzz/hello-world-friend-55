import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IEPGenerator from "./pages/IEPGenerator";
import DevelopmentalScreening from "./pages/AutismScreening";
import Assessment from "./pages/Assessment";
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
import HighlightSubscription from "./pages/HighlightSubscription";
import { TypebotEmbed } from "./components/highlight/TypebotEmbed";
import { TestResults } from "./components/highlight/TestResults";

import Family from "./pages/Family";
import CounselingFlow from "./pages/CounselingFlow";
import Corporate from "./pages/Corporate";
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
import Expert from "./pages/Expert";
import ExpertList from "./pages/ExpertList";
import ExpertHiring from "./pages/ExpertHiring";
import Institutions from "./pages/Institutions";
import NotFound from "./pages/NotFound";
import ShareView from "./pages/ShareView";
import TokenTest from "./pages/TokenTest";
import StressPackage from "./pages/StressPackage";
import DepressionPackage from "./pages/DepressionPackage";
import AnxietyPackage from "./pages/AnxietyPackage";
import FocusPackage from "./pages/FocusPackage";
import ChildPackage from "./pages/ChildPackage";
import ComprehensivePackage from "./pages/ComprehensivePackage";

import AssessmentHistory from "./components/history/AssessmentHistory";
import FunTestResult from "./components/assessment/FunTestResult";
import HanMedicineTest from "./pages/HanMedicineTest";
import IEPView from "./pages/IEPView";
import AdminDashboard from "./pages/AdminDashboard";
import InstitutionAdmin from "./pages/InstitutionAdmin";

import { SessionManager } from "./components/SessionManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionManager />
        <Routes>
          {/* Main Routes - Simplified User Journey */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<HighlightAuth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/premium-assessment" element={<PremiumAssessment />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/fun-tests" element={<Assessment />} />
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
          <Route path="/comprehensive-package" element={<ComprehensivePackage />} />
          <Route path="/han-medicine-test" element={<HanMedicineTest />} />
          <Route path="/iep-generator" element={<IEPGenerator />} />
          <Route path="/iep-view/:id" element={<IEPView />} />
          <Route path="/autism-screening" element={<DevelopmentalScreening />} />
          <Route path="/family" element={<Family />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/token-subscription" element={<TokenSubscription />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/institution-admin" element={<InstitutionAdmin />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/share/:shareId" element={<ShareView />} />
          <Route path="/observation" element={<Observation />} />
          <Route path="/expert" element={<Expert />} />
          <Route path="/experts" element={<ExpertList />} />
          <Route path="/expert-hiring" element={<ExpertHiring />} />
          <Route path="/expert-list" element={<ExpertList />} />
          <Route path="/institutions" element={<Institutions />} />
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
          
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
