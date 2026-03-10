import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Users, Mountain, ArrowRight, Clock, Crown } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

const NewAITestsSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const n = t.newAITests;

  const newTests = [
    {
      id: "energy-flow",
      title: n.energyTitle,
      subtitle: n.energySubtitle,
      description: n.energyDesc,
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      duration: `3${n.duration}`,
      questions: 10,
      type: n.energyType,
      isNew: true,
      path: "/assessment/energy-flow"
    },
    {
      id: "relationship-dynamics",
      title: n.relationshipTitle,
      subtitle: n.relationshipSubtitle,
      description: n.relationshipDesc,
      icon: Users,
      color: "from-pink-500 to-purple-500",
      bgColor: "bg-pink-50",
      duration: `10${n.duration}`,
      questions: 35,
      type: n.relationshipType,
      isPremium: true,
      path: "/assessment/relationship-dynamics"
    },
    {
      id: "life-purpose",
      title: n.lifePurposeTitle,
      subtitle: n.lifePurposeSubtitle,
      description: n.lifePurposeDesc,
      icon: Mountain,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      duration: `12${n.duration}`,
      questions: 40,
      type: n.lifePurposeType,
      isPremium: true,
      path: "/assessment/life-purpose"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-4 py-1">
              {n.badge}
            </Badge>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {n.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400">{n.titleHighlight}</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">{n.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {newTests.map((test) => (
            <Card 
              key={test.id}
              className="group relative overflow-hidden border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => navigate(test.path)}
            >
              <div className="absolute top-3 right-3 flex gap-2">
                {test.isNew && <Badge className="bg-green-500 text-white text-xs">NEW</Badge>}
                {test.isPremium && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" />PREMIUM
                  </Badge>
                )}
              </div>

              <div className={`bg-gradient-to-r ${test.color} p-5 pt-8`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <test.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{test.title}</h3>
                    <p className="text-white/70 text-xs">{test.subtitle}</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-5">
                <p className="text-slate-300 mb-4 text-sm min-h-[40px]">{test.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{test.duration}</span>
                    <span>{test.questions}{n.questions}</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">{test.type}</Badge>
                </div>

                <Button className={`w-full bg-gradient-to-r ${test.color} hover:opacity-90 text-white group-hover:shadow-lg transition-all`}>
                  {n.startBtn}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-white/10 hover:text-white px-8"
            onClick={() => navigate('/premium-assessment')}
          >
            {n.viewAllBtn}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewAITestsSection;
