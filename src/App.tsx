import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import PremiumAssessment from "./pages/PremiumAssessment";
import AICounselor from "./pages/AICounselor";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
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
          {/* Public pages without sidebar */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/share/:shareId" element={<ShareView />} />
          
          {/* Pages with sidebar */}
          <Route path="/premium-assessment" element={<AppLayout><PremiumAssessment /></AppLayout>} />
          <Route path="/assessment" element={<AppLayout><Assessment /></AppLayout>} />
          <Route path="/ai-counselor" element={<AppLayout><AICounselor /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/metaverse" element={<AppLayout><Metaverse /></AppLayout>} />
          <Route path="/family" element={<AppLayout><Family /></AppLayout>} />
          <Route path="/corporate" element={<AppLayout><Corporate /></AppLayout>} />
          <Route path="/subscription" element={<AppLayout><Subscription /></AppLayout>} />
          <Route path="/token-subscription" element={<AppLayout><TokenSubscription /></AppLayout>} />
          <Route path="/pricing" element={<AppLayout><Pricing /></AppLayout>} />
          <Route path="/observation" element={<AppLayout><Observation /></AppLayout>} />
          <Route path="/expert" element={<AppLayout><Expert /></AppLayout>} />
          <Route path="/experts" element={<AppLayout><ExpertList /></AppLayout>} />
          <Route path="/payment-success" element={<AppLayout><PaymentSuccess /></AppLayout>} />
          <Route path="/payment-fail" element={<AppLayout><PaymentFail /></AppLayout>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
