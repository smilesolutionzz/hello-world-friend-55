import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import FamilyEcosystemDashboard from "@/components/family/FamilyEcosystemDashboard";

const Family = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30">
      <UnifiedNavigation />
      <div className="pt-4">
        <FamilyEcosystemDashboard />
      </div>
    </div>
  );
};

export default Family;