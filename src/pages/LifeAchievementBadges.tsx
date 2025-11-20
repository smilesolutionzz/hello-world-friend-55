import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Lock, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Badge {
  id: string;
  badge_type: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned?: boolean;
  earned_at?: string;
}

export default function LifeAchievementBadges() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 모든 배지 가져오기
      const { data: allBadges, error: badgesError } = await supabase
        .from('life_achievement_badges')
        .select('*')
        .order('rarity', { ascending: false });

      if (badgesError) throw badgesError;

      if (!user) {
        setBadges(allBadges || []);
        setLoading(false);
        return;
      }

      // 사용자가 획득한 배지
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_life_achievement_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user.id);

      if (userBadgesError) throw userBadgesError;

      const userBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
      const userBadgeMap = new Map(userBadges?.map(ub => [ub.badge_id, ub.earned_at]) || []);

      const badgesWithStatus = (allBadges || []).map(badge => ({
        ...badge,
        earned: userBadgeIds.has(badge.id),
        earned_at: userBadgeMap.get(badge.id)
      }));

      setBadges(badgesWithStatus);
    } catch (error) {
      console.error('Failed to load badges:', error);
      toast({
        title: "로딩 실패",
        description: "배지를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'rare': return 'from-purple-500 to-pink-500';
      case 'uncommon': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '전설';
      case 'rare': return '희귀';
      case 'uncommon': return '고급';
      default: return '일반';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse" />
            <div className="h-4 w-64 bg-secondary/30 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-6 space-y-3">
                <div className="h-16 w-16 bg-secondary/50 rounded-full animate-pulse mx-auto" />
                <div className="h-4 w-32 bg-secondary/50 rounded animate-pulse mx-auto" />
                <div className="h-3 w-full bg-secondary/30 rounded animate-pulse" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                업적 배지
              </h1>
              <p className="text-muted-foreground">
                특별한 업적을 달성하고 배지를 모아보세요!
              </p>
            </div>
            <Card className="px-4 py-2">
              <div className="text-sm text-muted-foreground">획득한 배지</div>
              <div className="text-2xl font-bold">
                {earnedCount} / {totalCount}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge, index) => (
            <Card 
              key={badge.id}
              className={`p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
                badge.earned ? 'hover:-translate-y-1' : 'opacity-60'
              } animate-in fade-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {badge.earned && (
                <div className="absolute top-0 right-0">
                  <div className={`px-3 py-1 bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white text-xs rounded-bl-lg flex items-center gap-1`}>
                    <Sparkles className="h-3 w-3" />
                    {getRarityName(badge.rarity)}
                  </div>
                </div>
              )}

              <div className="text-center space-y-3">
                <div className={`text-6xl ${!badge.earned && 'grayscale'} transition-all duration-300`}>
                  {badge.earned ? badge.icon : <Lock className="h-16 w-16 mx-auto text-muted-foreground/50" />}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>

                {badge.earned && badge.earned_at && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    획득: {new Date(badge.earned_at).toLocaleDateString('ko-KR')}
                  </div>
                )}

                {!badge.earned && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                    <Lock className="h-3 w-3" />
                    잠금 해제 필요
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
