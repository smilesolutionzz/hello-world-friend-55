import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Brain, Briefcase, Heart, Crown, CheckCircle, DollarSign, UserCheck, AlertTriangle, Eye } from "lucide-react";

interface PremiumAssessmentCardProps {
  assessmentKey: string;
  info: {
    title: string;
    subtitle: string; 
    description: string;
    duration: string;
    questions_count: number;
    premium_features: string[];
    rank?: number;
    badge?: string;
  };
  onStart: (assessmentKey: string) => void;
  isSubscribed: boolean;
}

const PremiumAssessmentCard = ({ assessmentKey, info, onStart, isSubscribed }: PremiumAssessmentCardProps) => {
  const getIcon = (key: string) => {
    const icons = {
      personality_type: Brain,
      temperament: Users,
      cognitive: Brain,
      work_stress: Briefcase,
      relationship: Heart,
      financialPsychology: DollarSign,
      teenMentalCompass: UserCheck,
      teenGrowthCapacity: AlertTriangle,
      socialDevelopmentScreening: Eye
    };
    return icons[key as keyof typeof icons] || Brain;
  };

  const getGradient = (key: string) => {
    const gradients = {
      personality_type: "from-purple-500 to-blue-600",
      temperament: "from-blue-500 to-teal-600", 
      cognitive: "from-green-500 to-emerald-600",
      work_stress: "from-orange-500 to-red-600",
      relationship: "from-pink-500 to-rose-600",
      financialPsychology: "from-yellow-500 to-amber-600",
      teenMentalCompass: "from-indigo-500 to-purple-600",
      teenGrowthCapacity: "from-red-500 to-pink-600",
      socialDevelopmentScreening: "from-cyan-500 to-blue-600"
    };
    return gradients[key as keyof typeof gradients] || "from-gray-500 to-gray-600";
  };

  const IconComponent = getIcon(assessmentKey);

  return (
    <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 bg-card border-border/50">
      {/* Glassmorphism Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* 인기 순위 배지 */}
      <div className="absolute top-3 right-3 z-20">
        <Badge className={`
          ${info.rank && info.rank <= 3 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
            info.rank && info.rank <= 5 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
            info.rank && info.rank === 6 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-primary to-primary-glow'}
          text-white border-0 text-xs px-2.5 py-1 shadow-lg font-semibold
        `}>
          {info.rank && info.rank <= 3 && <Crown className="w-3 h-3 mr-1" />}
          {info.badge || '프리미엄'}
        </Badge>
      </div>

      {/* Header with Premium Gradient */}
      <div className={`bg-gradient-to-r ${getGradient(assessmentKey)} p-6 pr-24 text-white relative overflow-hidden`}>
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
        
        {/* Animated Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold mb-1 leading-tight">{info.title}</CardTitle>
              <p className="text-sm opacity-90 leading-snug">{info.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="relative p-6 space-y-5">
        {/* Description */}
        <p className="text-foreground/80 leading-relaxed text-[15px]">
          {info.description}
        </p>

        {/* Test Info - Enhanced Design */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-foreground">{info.duration}</span>
          </div>
          <div className="text-sm font-medium text-foreground">
            {info.questions_count}개 문항
          </div>
        </div>

        {/* Premium Features - Improved Layout */}
        <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/10">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary-glow rounded-full" />
            프리미엄 분석 내용
          </h4>
          <div className="space-y-2">
            {info.premium_features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-start gap-2.5 text-sm group/feature">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0 group-hover/feature:scale-110 transition-transform" />
                <span className="text-foreground/70 leading-snug">{feature}</span>
              </div>
            ))}
            {info.premium_features.length > 3 && (
              <div className="text-xs text-muted-foreground ml-6 italic">
                외 {info.premium_features.length - 3}가지 더...
              </div>
            )}
          </div>
        </div>

        {/* Action Button - Enhanced */}
        <div className="pt-2">
          {isSubscribed ? (
            <Button 
              onClick={() => onStart(assessmentKey)}
              className={`w-full bg-gradient-to-r ${getGradient(assessmentKey)} hover:opacity-90 hover:shadow-lg transition-all duration-300 text-white font-semibold py-6 text-base group/btn`}
            >
              <span className="group-hover/btn:scale-105 transition-transform inline-block">
                검사 시작하기
              </span>
            </Button>
          ) : (
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all py-6"
                disabled
              >
                <span className="text-muted-foreground">구독 후 이용 가능</span>
              </Button>
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                전문 심리검사는 구독자만 이용하실 수 있습니다
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumAssessmentCard;