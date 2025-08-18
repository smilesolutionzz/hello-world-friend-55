import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Brain, Briefcase, Heart, Crown, CheckCircle, DollarSign, UserCheck, AlertTriangle } from "lucide-react";

interface PremiumAssessmentCardProps {
  assessmentKey: string;
  info: {
    title: string;
    subtitle: string; 
    description: string;
    duration: string;
    questions_count: number;
    premium_features: string[];
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
      teenMmpi: UserCheck,
      teenCbcl: AlertTriangle
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
      teenMmpi: "from-indigo-500 to-purple-600",
      teenCbcl: "from-red-500 to-pink-600"
    };
    return gradients[key as keyof typeof gradients] || "from-gray-500 to-gray-600";
  };

  const IconComponent = getIcon(assessmentKey);

  return (
    <Card className="relative overflow-hidden hover-glow transition-all duration-300 hover:scale-[1.02]">
      {/* Premium Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          <Crown className="w-3 h-3 mr-1" />
          프리미엄
        </Badge>
      </div>

      {/* Header with Gradient */}
      <div className={`bg-gradient-to-r ${getGradient(assessmentKey)} p-6 text-white relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{info.title}</CardTitle>
              <p className="text-sm opacity-90">{info.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {info.description}
        </p>

        {/* Test Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {info.duration}
          </div>
          <div className="text-muted-foreground">
            {info.questions_count}개 문항
          </div>
        </div>

        {/* Premium Features */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">프리미엄 분석 내용</h4>
          <div className="space-y-1">
            {info.premium_features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
            {info.premium_features.length > 3 && (
              <div className="text-xs text-muted-foreground ml-5">
                외 {info.premium_features.length - 3}가지...
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {isSubscribed ? (
            <Button 
              onClick={() => onStart(assessmentKey)}
              className={`w-full bg-gradient-to-r ${getGradient(assessmentKey)} hover:opacity-90`}
            >
              검사 시작하기
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full border-2 border-dashed"
                disabled
              >
                구독 후 이용 가능
              </Button>
              <p className="text-xs text-center text-muted-foreground">
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