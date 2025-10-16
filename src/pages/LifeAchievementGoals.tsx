import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalTracker } from "@/components/life-achievement/GoalTracker";
import { ShareInvite } from "@/components/life-achievement/ShareInvite";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LifeAchievementGoals() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          홈으로
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            목표 & 친구
          </h1>
          <p className="text-muted-foreground">
            목표를 추적하고 친구들과 함께 성장하세요
          </p>
        </div>

        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals">목표 관리</TabsTrigger>
            <TabsTrigger value="share">친구 초대</TabsTrigger>
          </TabsList>
          
          <TabsContent value="goals" className="mt-6">
            <GoalTracker />
          </TabsContent>
          
          <TabsContent value="share" className="mt-6">
            <ShareInvite />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}