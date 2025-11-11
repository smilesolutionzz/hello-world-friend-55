import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Gift, Users, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// 수동 타입 정의 (DB 스키마와 일치)
interface UserProfile {
  id: string;
  tokens: number;
  referral_code: string;
  display_name: string | null;
  email: string | null;
  referred_by_code: string | null;
  created_at: string;
  updated_at: string;
}

interface ReferralRecord {
  id: string;
  referred_user_id: string;
  tokens_awarded: number;
  reward_status: string;
  created_at: string;
}

export const ReferralSystem = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchReferrals();
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 프로필 확인 - 타입 단언 사용
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*');

      // user_id로 필터링 (클라이언트 사이드)
      const existingProfile = profiles?.find((p: any) => p.user_id === user.id);

      if (existingProfile) {
        setProfile(existingProfile as UserProfile);
      } else {
        // 프로필 생성
        const insertData: any = {
          user_id: user.id,
          referral_code: '', // 트리거에서 자동 생성
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
          tokens: 0
        };

        const { data: newProfile, error } = await supabase
          .from('user_profiles')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Error creating profile:', error);
          toast({
            title: "프로필 생성 실패",
            description: "다시 시도해주세요",
            variant: "destructive"
          });
          return;
        }
        setProfile(newProfile as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      if (!profile) return;

      const { data, error } = await supabase
        .from('referral_records')
        .select('*')
        .eq('referrer_code', profile.referral_code)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const getReferralLink = () => {
    if (!profile) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth?ref=${profile.referral_code}`;
  };

  const copyReferralLink = async () => {
    const link = getReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "링크 복사 완료!",
        description: "친구에게 공유하면 10토큰을 받을 수 있어요",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "링크를 수동으로 복사해주세요",
        variant: "destructive"
      });
    }
  };

  const shareViaKakao = () => {
    toast({
      title: "카카오톡 공유",
      description: "카카오톡 공유 기능을 준비 중입니다",
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">프로필을 불러올 수 없습니다</p>
      </Card>
    );
  }

  const completedReferrals = referrals.filter(r => r.reward_status === 'completed').length;
  const earnedTokens = completedReferrals * 10;

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/20">
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-primary" />
                친구 추천하고 토큰 받기
              </h3>
              <p className="text-sm text-muted-foreground">
                친구가 가입하면 <strong className="text-primary">10토큰</strong>을 무료로 받아요!
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{profile.tokens}</div>
              <div className="text-xs text-muted-foreground">보유 토큰</div>
            </div>
          </div>

          {/* 초대 현황 */}
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">초대한 친구</span>
              <span className="font-semibold">{completedReferrals}명</span>
            </div>
            <Progress value={(completedReferrals % 10) * 10} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {earnedTokens > 0 && `💰 ${earnedTokens}토큰 획득!`}
              {10 - (completedReferrals % 10) > 0 && ` • ${10 - (completedReferrals % 10)}명 더 초대하면 보너스 획득!`}
            </div>
          </div>

          {/* 초대 링크 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">내 초대 링크</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm font-mono truncate">
                {getReferralLink()}
              </div>
              <Button onClick={copyReferralLink} size="lg" className="shrink-0">
                <Copy className="w-4 h-4 mr-2" />
                복사
              </Button>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setShowDialog(true)}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              초대 현황
            </Button>
            <Button 
              onClick={shareViaKakao}
              size="lg"
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              카톡 공유
            </Button>
          </div>

          {/* 작동 방식 */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">작동 방식</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">⚡</span>
                <span>초대 링크 공유</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">👑</span>
                <span>가입하면 추가로 <strong>10크레딧</strong>을 받습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">💬</span>
                <span>첫 번째 웹사이트를 게시하면 <strong>10크레딧</strong>을 받게 됩니다</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 초대 현황 다이얼로그 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              친구 초대 현황
            </DialogTitle>
            <DialogDescription>
              {completedReferrals}명의 친구가 가입했어요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-primary mb-1">{earnedTokens}</div>
              <div className="text-sm text-muted-foreground">획득한 토큰</div>
            </div>

            {referrals.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {referrals.map((referral, idx) => (
                  <div key={referral.id} className="bg-background border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">친구 #{idx + 1}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded ${
                      referral.reward_status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {referral.reward_status === 'completed' ? '완료' : '대기중'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">아직 초대한 친구가 없어요</p>
                <p className="text-xs">링크를 공유해보세요!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};