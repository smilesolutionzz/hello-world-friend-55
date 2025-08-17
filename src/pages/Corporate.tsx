import Navigation from "@/components/Navigation";
import { CorporateDashboard } from "@/components/corporate/CorporateDashboard";

const Corporate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30">
      <Navigation />
      <div className="pt-4">
        <CorporateDashboard />
      </div>
    </div>
  );
};

export default Corporate;