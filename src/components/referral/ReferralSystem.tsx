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
  user_id: string;
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
      let existingProfile = profiles?.find((p: any) => p.user_id === user.id);

      if (existingProfile) {
        // referral_code가 없으면 생성
        if (!existingProfile.referral_code) {
          const newReferralCode = generateReferralCode();
          const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .update({ referral_code: newReferralCode })
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating referral code:', updateError);
          } else {
            existingProfile = updatedProfile as UserProfile;
          }
        }
        setProfile(existingProfile as UserProfile);
      } else {
        // 프로필 생성
        const newReferralCode = generateReferralCode();
        const insertData: any = {
          user_id: user.id,
          referral_code: newReferralCode,
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

  // Referral Code 생성 함수
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const fetchReferrals = async () => {
    try {
      if (!profile) return;

      // 이번 달 첫날과 마지막 날 계산
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('referral_records')
        .select('*')
        .eq('referrer_code', profile.referral_code)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const getReferralLink = () => {
    if (!profile || !profile.referral_code) return '';
    // 커스텀 도메인 사용 (aihpro.com)
    const baseUrl = 'https://aihpro.com';
    return `${baseUrl}/auth?ref=${profile.referral_code}`;
  };

  const copyReferralLink = async () => {
    if (isLimitReached) {
      toast({
        title: "이번 달 추천 제한 도달",
        description: "이번 달은 최대 10명까지 추천할 수 있습니다 (다음 달에 리셋)",
        variant: "destructive"
      });
      return;
    }

    const link = getReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "🎉 링크 복사 완료!",
        description: `친구에게 공유하면 서로 10토큰씩! (이번 달 ${remainingReferrals}명 남음)`,
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
    if (isLimitReached) {
      toast({
        title: "이번 달 추천 제한 도달",
        description: "이번 달은 최대 10명까지 추천할 수 있습니다 (다음 달에 리셋)",
        variant: "destructive"
      });
      return;
    }

    const link = getReferralLink();
    const shareMessage = `🎉 AI 심리 상담 플랫폼 초대장!\n\n친구도 10토큰, 나도 10토큰 받아요!\n지금 가입하고 무료로 시작하세요 ✨\n\n${link}`;
    
    // 카카오톡이 설치되어 있는지 확인
    if (/kakaotalk/i.test(navigator.userAgent)) {
      // 모바일 카카오톡 앱에서 열기
      window.location.href = `kakaotalk://share?text=${encodeURIComponent(shareMessage)}`;
    } else {
      // 웹에서 공유 API 사용
      if (navigator.share) {
        navigator.share({
          title: 'AI 심리 상담 플랫폼 초대',
          text: shareMessage,
        }).then(() => {
          toast({
            title: "공유 완료!",
            description: "친구가 가입하면 10토큰을 받아요",
          });
        }).catch(() => {
          // 공유 취소 또는 실패시 링크 복사
          copyReferralLink();
        });
      } else {
        // Web Share API 미지원시 링크 복사
        copyReferralLink();
      }
    }
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
  const MAX_REFERRALS = 10;
  const remainingReferrals = Math.max(0, MAX_REFERRALS - completedReferrals);
  const isLimitReached = completedReferrals >= MAX_REFERRALS;

  // 현재 월 표시
  const currentMonth = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/20">
        <div className="space-y-6">
          {/* 헤더 - 통계 대시보드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 보유 토큰 */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">보유 토큰</span>
              </div>
              <div className="text-3xl font-bold text-primary">{profile.tokens}</div>
            </div>

            {/* 초대 성공 */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-xs text-muted-foreground font-medium">초대 성공</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {completedReferrals}/{MAX_REFERRALS}
              </div>
            </div>

            {/* 획득한 토큰 */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-muted-foreground font-medium">획득한 토큰</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">{earnedTokens}</div>
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-1">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              친구 추천하고 토큰 받기
            </h3>
            <p className="text-sm text-muted-foreground">
              친구가 가입하면 <strong className="text-primary">10토큰</strong>을 무료로 받아요! 
              {!isLimitReached && <span className="text-orange-600 font-semibold"> (이번 달 {MAX_REFERRALS}명, {remainingReferrals}명 남음)</span>}
              {isLimitReached && <span className="text-red-600 font-semibold"> ⚠️ 이번 달 최대 추천 인원 도달</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              📅 {currentMonth} • 매달 1일 자정에 리셋됩니다
            </p>
          </div>

          {/* 초대 현황 프로그레스 */}
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">이번 달 초대 진행률</span>
              <span className="font-semibold">{completedReferrals}/{MAX_REFERRALS}명</span>
            </div>
            <Progress value={(completedReferrals / MAX_REFERRALS) * 100} className="h-3" />
            <div className="text-xs text-center">
              {!isLimitReached && earnedTokens > 0 && (
                <span className="text-green-600 font-semibold">💰 이번 달 {earnedTokens}토큰 획득!</span>
              )}
              {!isLimitReached && remainingReferrals > 0 && (
                <span className="text-muted-foreground"> • {remainingReferrals}명 더 초대 가능</span>
              )}
              {isLimitReached && (
                <span className="text-orange-600 font-semibold">🎉 이번 달 최대 추천 인원 달성! 다음 달 1일에 리셋</span>
              )}
            </div>
          </div>

          {/* 초대 링크 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">내 초대 링크</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm font-mono truncate">
                {getReferralLink()}
              </div>
              <Button 
                onClick={copyReferralLink} 
                size="lg" 
                className="shrink-0"
                disabled={isLimitReached}
              >
                <Copy className="w-4 h-4 mr-2" />
                복사
              </Button>
            </div>
            {isLimitReached && (
              <p className="text-xs text-orange-600 font-medium">
                ⚠️ 이번 달 최대 추천 인원({MAX_REFERRALS}명)에 도달했습니다 • 다음 달 1일에 리셋
              </p>
            )}
          </div>

          {/* CTA 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setShowDialog(true)}
              variant="outline"
              size="default"
              className="w-full text-sm font-medium"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              초대 현황
            </Button>
            <Button 
              onClick={shareViaKakao}
              size="default"
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black text-sm font-semibold"
              disabled={isLimitReached}
            >
              <span className="mr-1">💬</span>
              카톡 공유
            </Button>
          </div>

          {/* 작동 방식 */}
          <div className="bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl p-5 space-y-3 border border-border/50">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              이렇게 작동해요
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-xl">1️⃣</span>
                <span><strong className="text-primary">초대 링크</strong>를 친구에게 공유하세요</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">2️⃣</span>
                <span>친구가 가입하면 <strong className="text-green-600">친구도 10토큰</strong>, <strong className="text-orange-600">나도 10토큰</strong>!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">3️⃣</span>
                <span><strong className="text-primary">매달 {MAX_REFERRALS}명</strong>까지 초대 가능 (월 최대 {MAX_REFERRALS * 10}토큰)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">🔄</span>
                <span className="text-xs text-muted-foreground">매달 1일 자정에 초대 횟수가 리셋됩니다</span>
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
              {completedReferrals}명의 친구가 가입했어요 (이번 달 최대 {MAX_REFERRALS}명)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 통계 요약 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 text-center border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-1">{earnedTokens}</div>
                <div className="text-xs text-muted-foreground">획득한 토큰</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 text-center border border-green-500/20">
                <div className="text-3xl font-bold text-green-600 mb-1">{remainingReferrals}</div>
                <div className="text-xs text-muted-foreground">남은 초대 가능 인원</div>
              </div>
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
                    <div className="flex items-center gap-2">
                      <div className={`text-xs font-semibold px-2 py-1 rounded ${
                        referral.reward_status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {referral.reward_status === 'completed' ? '✓ 완료' : '⏳ 대기중'}
                      </div>
                      {referral.reward_status === 'completed' && (
                        <span className="text-xs font-bold text-orange-600">+10</span>
                      )}
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

            {isLimitReached && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-orange-700">
                  🎉 이번 달 최대 추천 인원에 도달했습니다!
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  이번 달 {earnedTokens}토큰 획득 • 다음 달 1일에 리셋
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};