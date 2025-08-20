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

// HIGHLIGHT MVP Pages
import HighlightAuth from "./pages/HighlightAuth";
import HighlightDashboard from "./pages/HighlightDashboard";
import HighlightAI from "./pages/HighlightAI";
import HighlightSubscription from "./pages/HighlightSubscription";
import { TypebotEmbed } from "./components/highlight/TypebotEmbed";
import { TestResults } from "./components/highlight/TestResults";
import Metaverse from "./pages/Metaverse";
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
          <Route path="/dashboard" element={<HighlightDashboard />} />
          <Route path="/highlight-ai" element={<HighlightAI />} />
          <Route path="/test/:testId" element={<TypebotEmbed />} />
          <Route path="/results/:resultId" element={<TestResults />} />
          <Route path="/subscription" element={<HighlightSubscription />} />
          
          {/* Legacy Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/premium-assessment" element={<PremiumAssessment />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/ai-counselor" element={<AICounselor />} />
          <Route path="/legacy-auth" element={<Auth />} />
          <Route path="/legacy-dashboard" element={<Dashboard />} />
          <Route path="/metaverse" element={<Metaverse />} />
          <Route path="/family" element={<Family />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/token-subscription" element={<TokenSubscription />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/share/:shareId" element={<ShareView />} />
          <Route path="/observation" element={<Observation />} />
          <Route path="/expert" element={<Expert />} />
          <Route path="/experts" element={<ExpertList />} />
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
