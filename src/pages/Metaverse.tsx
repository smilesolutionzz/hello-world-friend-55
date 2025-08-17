import Navigation from "@/components/Navigation";
import { MetaverseDashboard } from "@/components/metaverse/MetaverseDashboard";

const Metaverse = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30">
      <Navigation />
      <div className="pt-4">
        <MetaverseDashboard />
      </div>
    </div>
  );
};

export default Metaverse;