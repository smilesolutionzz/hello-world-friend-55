import Navigation from "@/components/Navigation";
import FamilyEcosystemDashboard from "@/components/family/FamilyEcosystemDashboard";

const Family = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30">
      <Navigation />
      <div className="pt-4">
        <FamilyEcosystemDashboard />
      </div>
    </div>
  );
};

export default Family;