import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Target, Sparkles, Trophy } from "lucide-react";
import { GrowthStoryCard } from "@/components/growth/GrowthStoryCard";
import { ChallengeCard } from "@/components/growth/ChallengeCard";
import { ReversalStoryCard } from "@/components/growth/ReversalStoryCard";
import { GrowthLeaderboard } from "@/components/growth/GrowthLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function GrowthCommunity() {
  const [growthStories, setGrowthStories] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [reversalStories, setReversalStories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
    fetchData();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchData = async () => {
    try {
      const [storiesRes, challengesRes, reversalRes, leaderboardRes] = await Promise.all([
        supabase.from('growth_stories').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('challenge_posts').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('reversal_stories').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('user_growth_points').select('*').order('total_points', { ascending: false }).limit(20)
      ]);

      if (storiesRes.data) setGrowthStories(storiesRes.data);
      if (challengesRes.data) setChallenges(challengesRes.data);
      if (reversalRes.data) setReversalStories(reversalRes.data);
      if (leaderboardRes.data) setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First get current likes count
      const { data: currentData } = await supabase
        .from('growth_stories')
        .select('likes_count')
        .eq('id', storyId)
        .single();

      if (!currentData) throw new Error('Story not found');

      const { error } = await supabase
        .from('growth_stories')
        .update({ likes_count: currentData.likes_count + 1 })
        .eq('id', storyId);

      if (error) throw error;

      setGrowthStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, likes_count: story.likes_count + 1 }
          : story
      ));

      toast({
        title: "좋아요!",
        description: "스토리에 공감을 표현했습니다.",
      });
    } catch (error) {
      console.error('Error liking story:', error);
      toast({
        title: "오류",
        description: "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleReactToReversal = async (storyId: string, type: 'inspiring' | 'relatable' | 'helpful') => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "반응을 보내려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First get current reactions
      const { data: currentData } = await supabase
        .from('reversal_stories')
        .select('reactions')
        .eq('id', storyId)
        .single();

      if (!currentData) throw new Error('Story not found');

      const reactions = currentData.reactions as any || {};
      const updatedReactions = {
        inspiring: reactions.inspiring || 0,
        relatable: reactions.relatable || 0,
        helpful: reactions.helpful || 0,
        [type]: (reactions[type] || 0) + 1
      };

      const { error } = await supabase
        .from('reversal_stories')
        .update({ reactions: updatedReactions })
        .eq('id', storyId);

      if (error) throw error;

      setReversalStories(prev => prev.map(story => 
        story.id === storyId 
          ? { 
              ...story, 
              reactions: {
                ...story.reactions,
                [type]: story.reactions[type] + 1
              }
            }
          : story
      ));

      const reactionMessages = {
        inspiring: "영감을 받았어요!",
        relatable: "공감해요!",
        helpful: "도움이 되었어요!"
      };

      toast({
        title: reactionMessages[type],
        description: "반응을 보냈습니다.",
      });
    } catch (error) {
      console.error('Error reacting to story:', error);
      toast({
        title: "오류",
        description: "반응 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>성장 커뮤니티 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">성장 커뮤니티</h1>
        <p className="text-muted-foreground">
          실패에서 성공으로, 좌절에서 희망으로의 여정을 함께 나누어요
        </p>
      </div>

      <Tabs defaultValue="stories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            성장 스토리
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            고민 해결
          </TabsTrigger>
          <TabsTrigger value="reversals" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            반전 일기
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            성장 랭킹
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">성장 스토리</h2>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                if (!user) {
                  toast({
                    title: "로그인 필요",
                    description: "스토리를 공유하려면 로그인이 필요합니다.",
                    variant: "destructive",
                  });
                  return;
                }
                // TODO: 스토리 작성 모달 열기
                toast({
                  title: "준비 중",
                  description: "스토리 작성 기능을 곧 추가할 예정입니다.",
                });
              }}
            >
              <Plus className="h-4 w-4" />
              내 스토리 공유하기
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {growthStories.map((story) => (
              <GrowthStoryCard
                key={story.id}
                story={story}
                onLike={handleLikeStory}
              />
            ))}
          </div>
          
          {growthStories.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">첫 번째 성장 스토리를 공유해보세요!</h3>
              <p className="text-muted-foreground mb-4">
                당신의 변화 과정이 다른 사람들에게 큰 힘이 될 수 있어요
              </p>
              <Button
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "로그인 필요",
                      description: "스토리를 작성하려면 로그인이 필요합니다.",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "준비 중",
                    description: "스토리 작성 기능을 곧 추가할 예정입니다.",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                스토리 작성하기
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">고민 해결 챌린지</h2>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                if (!user) {
                  toast({
                    title: "로그인 필요",
                    description: "고민을 올리려면 로그인이 필요합니다.",
                    variant: "destructive",
                  });
                  return;
                }
                toast({
                  title: "준비 중",
                  description: "고민 올리기 기능을 곧 추가할 예정입니다.",
                });
              }}
            >
              <Plus className="h-4 w-4" />
              고민 올리기
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                currentUserId={user?.id}
              />
            ))}
          </div>
          
          {challenges.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">첫 번째 고민을 공유해보세요!</h3>
              <p className="text-muted-foreground mb-4">
                함께 해결하면 더 쉬워져요
              </p>
              <Button
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "로그인 필요",
                      description: "고민을 올리려면 로그인이 필요합니다.",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "준비 중",
                    description: "고민 올리기 기능을 곧 추가할 예정입니다.",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                고민 올리기
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reversals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">반전 일기</h2>
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                if (!user) {
                  toast({
                    title: "로그인 필요",
                    description: "반전 스토리를 쓰려면 로그인이 필요합니다.",
                    variant: "destructive",
                  });
                  return;
                }
                toast({
                  title: "준비 중",
                  description: "반전 스토리 작성 기능을 곧 추가할 예정입니다.",
                });
              }}
            >
              <Plus className="h-4 w-4" />
              반전 스토리 쓰기
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {reversalStories.map((story) => (
              <ReversalStoryCard
                key={story.id}
                story={story}
                onReact={handleReactToReversal}
              />
            ))}
          </div>
          
          {reversalStories.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">첫 번째 반전 스토리를 써보세요!</h3>
              <p className="text-muted-foreground mb-4">
                최악의 순간이 어떻게 최고의 순간이 되었나요?
              </p>
              <Button
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "로그인 필요",
                      description: "반전 스토리를 쓰려면 로그인이 필요합니다.",
                      variant: "destructive",
                    });
                    return;
                  }
                  toast({
                    title: "준비 중",
                    description: "반전 스토리 작성 기능을 곧 추가할 예정입니다.",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                반전 스토리 쓰기
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <GrowthLeaderboard entries={leaderboard} currentUserId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}