import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Award, Lock, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned_at?: string;
  is_new?: boolean;
}

export default function BadgeShowcase({ userId }: { userId?: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      const { data: allBadges } = await supabase
        .from('life_achievement_badges')
        .select('*')
        .order('rarity', { ascending: false });

      if (userId) {
        const { data: userBadges } = await supabase
          .from('user_life_achievement_badges')
          .select('badge_id, earned_at, is_new')
          .eq('user_id', userId);

        const earnedIds = new Set(userBadges?.map(b => b.badge_id) || []);
        setEarnedBadgeIds(earnedIds);

        const badgesWithStatus = allBadges?.map(badge => ({
          ...badge,
          earned_at: userBadges?.find(ub => ub.badge_id === badge.id)?.earned_at,
          is_new: userBadges?.find(ub => ub.badge_id === badge.id)?.is_new
        })) || [];

        setBadges(badgesWithStatus);
      } else {
        setBadges(allBadges || []);
      }
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'rare': return 'from-purple-400 to-pink-500';
      case 'uncommon': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '전설';
      case 'rare': return '희귀';
      case 'uncommon': return '고급';
      default: return '일반';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Card key={i} className="p-4 space-y-3 animate-pulse">
            <div className="h-16 w-16 mx-auto bg-secondary rounded-full" />
            <div className="h-4 bg-secondary rounded" />
            <div className="h-3 bg-secondary/50 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          배지 컬렉션
        </h3>
        <div className="text-sm text-muted-foreground">
          {earnedBadgeIds.size} / {badges.length} 획득
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          return (
            <Card
              key={badge.id}
              className={`p-4 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 ${
                isEarned ? 'border-2' : 'opacity-60 grayscale'
              }`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                borderColor: isEarned ? `hsl(var(--primary))` : undefined
              }}
            >
              {badge.is_new && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center gap-1 animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  NEW
                </div>
              )}

              <div className={`relative mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center text-3xl mb-3 ${
                isEarned ? 'shadow-lg' : ''
              }`}>
                {isEarned ? (
                  <span className="animate-in zoom-in duration-500">{badge.icon}</span>
                ) : (
                  <Lock className="h-8 w-8 text-white" />
                )}
              </div>

              <div className="text-center space-y-2">
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold inline-block bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white`}>
                  {getRarityLabel(badge.rarity)}
                </div>
                <h4 className="font-semibold text-sm">{badge.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {badge.description}
                </p>
                {isEarned && badge.earned_at && (
                  <p className="text-xs text-primary">
                    {new Date(badge.earned_at).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
