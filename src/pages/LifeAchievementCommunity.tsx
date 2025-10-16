import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import BadgeShowcase from '@/components/life-achievement/BadgeShowcase';
import Leaderboard from '@/components/life-achievement/Leaderboard';
import { WeeklyReport } from '@/components/life-achievement/WeeklyReport';
import { SocialFeed } from '@/components/life-achievement/SocialFeed';

export default function LifeAchievementCommunity() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            커뮤니티
          </h1>
          <p className="text-muted-foreground">
            함께 성장하고, 경쟁하고, 성취를 공유하세요
          </p>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">피드</TabsTrigger>
            <TabsTrigger value="leaderboard">리더보드</TabsTrigger>
            <TabsTrigger value="badges">배지</TabsTrigger>
            <TabsTrigger value="reports">리포트</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <SocialFeed />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard userId={userId} />
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <BadgeShowcase userId={userId} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <WeeklyReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
