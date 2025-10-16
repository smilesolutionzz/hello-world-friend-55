import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share2, Award, Target, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Share {
  id: string;
  user_id: string;
  share_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  achievement_data: any;
  likes_count: number;
  created_at: string;
  isLiked?: boolean;
}

export const SocialFeed = () => {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: sharesData, error } = await supabase
        .from('life_achievement_shares')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // 사용자가 좋아요한 게시물 확인
      if (user) {
        const { data: likesData } = await supabase
          .from('life_achievement_share_likes')
          .select('share_id')
          .eq('user_id', user.id);

        const likedShareIds = new Set(likesData?.map(l => l.share_id) || []);

        setShares((sharesData || []).map(share => ({
          ...share,
          isLiked: likedShareIds.has(share.id)
        })));
      } else {
        setShares(sharesData || []);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (shareId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인이 필요합니다",
          variant: "destructive"
        });
        return;
      }

      const share = shares.find(s => s.id === shareId);
      if (!share) return;

      if (share.isLiked) {
        // 좋아요 취소
        await supabase
          .from('life_achievement_share_likes')
          .delete()
          .eq('share_id', shareId)
          .eq('user_id', user.id);
      } else {
        // 좋아요
        await supabase
          .from('life_achievement_share_likes')
          .insert({
            share_id: shareId,
            user_id: user.id
          });
      }

      loadFeed();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getShareIcon = (shareType: string) => {
    switch (shareType) {
      case 'goal_completed': return Target;
      case 'milestone': return TrendingUp;
      case 'badge_earned': return Award;
      case 'weekly_report': return Calendar;
      default: return Award;
    }
  };

  const getShareTypeLabel = (shareType: string) => {
    switch (shareType) {
      case 'goal_completed': return '목표 달성';
      case 'milestone': return '마일스톤';
      case 'badge_earned': return '배지 획득';
      case 'weekly_report': return '주간 리포트';
      default: return '업적';
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          커뮤니티 피드
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          다른 사람들의 성장 여정을 확인하세요
        </p>
      </div>

      {shares.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 공유된 업적이 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              첫 번째로 업적을 공유해보세요!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {shares.map((share) => {
            const ShareIcon = getShareIcon(share.share_type);
            
            return (
              <Card key={share.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-primary/10">
                          <ShareIcon className="h-3 w-3 mr-1" />
                          {getShareTypeLabel(share.share_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(share.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{share.title}</CardTitle>
                      {share.description && (
                        <CardDescription className="mt-2">
                          {share.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {share.image_url && (
                  <div className="px-6">
                    <img 
                      src={share.image_url} 
                      alt={share.title}
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(share.id)}
                      className={share.isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${share.isLiked ? 'fill-current' : ''}`} />
                      {share.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      댓글
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      공유
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};