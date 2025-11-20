import { GoalTracker } from "@/components/life-achievement/GoalTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LifeAchievementGoals() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 border-b">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 hover:bg-background/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로
          </Button>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Life Achievement</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              나의 목표 달성
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              체계적인 목표 관리로 더 나은 미래를 만들어가세요
            </p>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-8">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <TrendingUp className="h-5 w-5" />
                  <span>0</span>
                </div>
                <p className="text-xs text-muted-foreground">진행중인 목표</p>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-500">
                  <Award className="h-5 w-5" />
                  <span>0</span>
                </div>
                <p className="text-xs text-muted-foreground">완료한 목표</p>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-purple-500">0%</div>
                <p className="text-xs text-muted-foreground">평균 달성률</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <GoalTracker />
      </div>
    </div>
  );
}