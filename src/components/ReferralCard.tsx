import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Gift, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateReferralCode, generateReferralLink, REFERRAL_REWARDS } from '@/utils/referral';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const ReferralCard = () => {
  const { user } = useAuthGuard();
  const { toast } = useToast();
  const [referralCode] = useState(() => user ? generateReferralCode(user.id) : '');
  const referralLink = generateReferralLink(referralCode);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료!",
      description: "클립보드에 복사되었습니다.",
    });
  };

  const shareToSocial = async (platform: 'kakao' | 'twitter' | 'facebook') => {
    const message = `마음AI와 함께 우리 아이 마음 건강 케어하세요! 🎁 지금 가입하면 ${REFERRAL_REWARDS.invitee}토큰 무료!`;
    
    switch (platform) {
      case 'kakao':
        // Kakao share implementation
        window.open(`https://www.kakaocorp.com/page/service/service/KakaoTalk`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`);
        break;
    }
    
    // SNS 공유 보상 처리
    try {
      const { data, error } = await supabase.functions.invoke('share-social', {
        body: { platform }
      });

      if (error) throw error;

      toast({
        title: "공유 완료!",
        description: data.message,
      });
    } catch (error) {
      console.error('Share reward error:', error);
      toast({
        title: "공유 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Gift className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-1">
            친구 초대하고 무료 기간 연장! 🎉
          </h3>
          <p className="text-sm text-muted-foreground">
            친구 1명당 {REFERRAL_REWARDS.inviter}토큰 · SNS 공유 시 {REFERRAL_REWARDS.socialShare}토큰
          </p>
        </div>
      </div>

      {/* 리퍼럴 코드 */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            내 초대 코드
          </label>
          <div className="flex gap-2">
            <Input 
              value={referralCode}
              readOnly
              className="bg-background font-mono"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(referralCode)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            초대 링크
          </label>
          <div className="flex gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="bg-background text-sm"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(referralLink)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* SNS 공유 버튼 */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          SNS에 공유하고 {REFERRAL_REWARDS.socialShare}토큰 받기
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareToSocial('kakao')}
            className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-black border-0"
          >
            카카오톡
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareToSocial('twitter')}
            className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white border-0"
          >
            트위터
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareToSocial('facebook')}
            className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-0"
          >
            페이스북
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>초대한 친구: <strong className="text-foreground">0명</strong></span>
        </div>
        <div className="text-muted-foreground">
          누적 보너스: <strong className="text-primary">+0토큰</strong>
        </div>
      </div>
    </Card>
  );
};

export default ReferralCard;
