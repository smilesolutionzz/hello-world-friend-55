import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
import Corporate from "./pages/Corporate";
import Subscription from "./pages/Subscription";
import TokenSubscription from "./pages/TokenSubscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import Pricing from "./pages/Pricing";
import Observation from "./pages/Observation";
import Expert from "./pages/Expert";
import ExpertList from "./pages/ExpertList";
import ExpertHiring from "./pages/ExpertHiring";
import NotFound from "./pages/NotFound";
import ShareView from "./pages/ShareView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* HIGHLIGHT MVP Routes */}
          <Route path="/auth" element={<HighlightAuth />} />
          <Route path="/highlight-dashboard" element={<HighlightDashboard />} />
          <Route path="/highlight-ai" element={<HighlightAI />} />
          <Route path="/test/:testId" element={<TypebotEmbed />} />
          <Route path="/results/:resultId" element={<TestResults />} />
          <Route path="/subscription" element={<HighlightSubscription />} />
          
          {/* Main Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/premium-assessment" element={<PremiumAssessment />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/ai-counselor" element={<AICounselor />} />
          <Route path="/legacy-auth" element={<Auth />} />
          <Route path="/needs-assessment" element={<NeedsAssessment />} />
          <Route path="/quick-needs" element={<QuickNeeds />} />
          
          <Route path="/family" element={<Family />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/legacy-subscription" element={<Subscription />} />
          <Route path="/token-subscription" element={<TokenSubscription />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/share/:shareId" element={<ShareView />} />
          <Route path="/observation" element={<Observation />} />
          <Route path="/expert" element={<Expert />} />
          <Route path="/experts" element={<ExpertHiring />} />
          <Route path="/expert-list" element={<ExpertList />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-fail" element={<PaymentFail />} />
          
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
