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
    createSampleData();
  }, []);

  const createSampleData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 이미 샘플 데이터가 있는지 확인
      const { data: existing } = await supabase
        .from('life_achievement_shares')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existing && existing.length > 0) return;

      // 샘플 데이터 생성
      const sampleShares = [
        {
          user_id: user.id,
          share_type: 'goal_completed',
          title: '드디어 3개월 연속 운동 목표 달성! 💪',
          description: '솔직히 처음엔 일주일도 못 버틸 줄 알았는데... 매일 아침 6시에 일어나서 운동하는 게 이제는 습관이 됐어요. 체중도 5kg 빠졌고 무엇보다 아침에 일어나는 게 행복해졌어요! 여러분도 할 수 있어요 🔥',
          achievement_data: { goal: '매일 아침 운동', duration: '3개월', achievement_rate: 95 },
          likes_count: 127,
          is_public: true
        },
        {
          user_id: user.id,
          share_type: 'milestone',
          title: '인생 성취도 테스트 90점 돌파했습니다 🎉',
          description: '6개월 전만 해도 60점대였는데... 매주 테스트하면서 부족한 영역을 하나씩 개선했더니 드디어 90점을 넘었어요! 특히 관계 영역이 많이 올랐는데, 가족들과 더 자주 대화하려고 노력한 게 큰 도움이 됐어요. 진짜 뿌듯합니다 😭',
          achievement_data: { previous_score: 63, current_score: 92, improvement: 29 },
          likes_count: 89,
          is_public: true
        },
        {
          user_id: user.id,
          share_type: 'badge_earned',
          title: '일주일 연속 테스트 완수 배지 획득! 🏆',
          description: '매일 하루도 빠짐없이 체크하는 게 쉽지 않았는데... 알람 맞춰놓고 습관으로 만들었더니 가능하더라구요. 이 배지가 그냥 배지가 아니라 제 노력의 증거 같아서 너무 뿌듯해요 ㅎㅎ',
          achievement_data: { badge: '일주일 연속 도전', streak_days: 7 },
          likes_count: 64,
          is_public: true
        },
        {
          user_id: user.id,
          share_type: 'goal_completed',
          title: '책 한 달에 5권 읽기 목표 달성했어요 📚',
          description: '직장 다니면서 책 읽기가 정말 힘들었는데, 출퇴근 시간에 전자책으로 조금씩 읽다보니 한 달에 5권도 가능하더라구요! 자기계발서 3권, 소설 2권 읽었는데 특히 "아침형 인간"이 도움 많이 됐어요. 다음 달 목표는 7권!',
          achievement_data: { goal: '한 달 독서', books_read: 5, target: 5 },
          likes_count: 52,
          is_public: true
        },
        {
          user_id: user.id,
          share_type: 'weekly_report',
          title: '이번 주 성장 리포트 공유합니다 ✨',
          description: '이번 주는 정말 알찬 한 주였어요. 목표 3개 모두 달성했고, 특히 새벽 명상 습관이 생긴 게 가장 큰 성과예요. 리포트 보니까 제가 생각한 것보다 훨씬 많이 성장했더라구요. 여러분도 주간 리포트 꼭 확인해보세요!',
          achievement_data: { week: '2025-W03', goals_completed: 3, total_goals: 3, score_change: '+8' },
          likes_count: 73,
          is_public: true
        },
        {
          user_id: user.id,
          share_type: 'milestone',
          title: '레벨 5 달성! 처음으로 중급자 되었습니다 🎯',
          description: '초보자 티를 벗었다는 게 이렇게 기쁠 줄 몰랐어요 ㅋㅋ 레벨업하는 과정이 힘들었지만, 한 단계 한 단계 오르는 재미가 있어서 포기하지 않았어요. 이제 레벨 10까지 도전해볼게요!',
          achievement_data: { level: 5, previous_level: 4, rank: '중급자' },
          likes_count: 38,
          is_public: true
        },
        {
          user_id: user.id,
          share_type: 'goal_completed',
          title: '물 하루 2L 마시기 한 달 달성 💧',
          description: '건강을 위해 시작했는데 피부도 좋아지고 컨디션도 훨씬 나아진 느낌이에요! 처음엔 화장실 자주 가는 게 불편했는데 이제는 자연스럽게 물병 들고 다니게 되네요. 작은 습관이 큰 변화를 만든다는 걸 체감했어요 👍',
          achievement_data: { goal: '물 2L 마시기', duration: '30일', success_rate: 97 },
          likes_count: 91,
          is_public: true
        },
        {
          user_id: user.id,
          share_type: 'badge_earned',
          title: '모든 카테고리 70% 이상 달성 배지! 🌟',
          description: '건강, 관계, 성장, 재무... 모든 영역에서 균형잡힌 삶을 살고 싶었는데 드디어 이뤘어요! 한 영역만 잘하는 것보다 전체적으로 고루 발전하는 게 훨씬 어려웠지만, 그만큼 보람차네요. 완벽주의보다는 꾸준함이 답인 것 같아요.',
          achievement_data: { badge: '올라운더', categories: ['건강', '관계', '성장', '재무', '여가'] },
          likes_count: 105,
          is_public: true
        }
      ];

      await supabase.from('life_achievement_shares').insert(sampleShares);
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

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