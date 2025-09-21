import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Gift, Users, Trophy, Zap, Heart } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';
import SocialShareButtons from '@/components/social/SocialShareButtons';
import { MobileGrid, MobileCard, MobileButton } from '@/components/common/MobileOptimized';

interface ViralCampaign {
  title: string;
  description: string;
  reward: string;
  progress: number;
  target: number;
  type: 'share' | 'referral' | 'review' | 'streak';
  urgent?: boolean;
}

export const ViralMechanics: React.FC = () => {
  const { user } = useAuthGuard();
  const { referralCode, stats, generateReferralCode, copyReferralLink } = useReferrals();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<ViralCampaign[]>([]);
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadViralCampaigns();
      if (!referralCode) {
        generateReferralCode();
      }
    }
  }, [user, referralCode]);

  const loadViralCampaigns = () => {
    // APR 전략: 시급성과 희소성을 활용한 바이럴 캠페인
    const activeCampaigns: ViralCampaign[] = [
      {
        title: "친구 초대 미션",
        description: "친구 1명 초대할 때마다 무료 AI 분석권 증정",
        reward: "AI 분석권 × 1",
        progress: stats?.referralCount || 0,
        target: 3,
        type: 'referral'
      },
      {
        title: "결과 공유 챌린지",
        description: "분석 결과를 SNS에 공유하고 리워드 받기",
        reward: "프리미엄 7일 무료",
        progress: shareCount,
        target: 1,
        type: 'share',
        urgent: true
      },
      {
        title: "7일 연속 사용",
        description: "7일 연속 앱 사용으로 스페셜 혜택 획득",
        reward: "전문가 상담 50% 할인",
        progress: 0, // 실제로는 사용자 스트릭 데이터
        target: 7,
        type: 'streak'
      },
      {
        title: "리뷰 작성 이벤트",
        description: "앱스토어 리뷰 작성하고 토큰 받기",
        reward: "토큰 100개",
        progress: 0,
        target: 1,
        type: 'review'
      }
    ];

    setCampaigns(activeCampaigns);
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: "나의 AI 심리 분석 결과",
        text: "3분 만에 알아본 내 마음의 진짜 모습! 당신도 확인해보세요 🧠✨",
        url: `${window.location.origin}?ref=${referralCode}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        toast({
          title: "공유 링크 복사됨",
          description: "친구들에게 공유해보세요!"
        });
      }

      setShareCount(prev => prev + 1);
      
      // APR 전략: 즉시 보상으로 반복 행동 유도
      toast({
        title: "🎉 공유 완료!",
        description: "프리미엄 7일 무료 혜택이 지급됩니다"
      });

    } catch (error) {
      console.error('공유 오류:', error);
    }
  };

  const handleReferralShare = async () => {
    try {
      await copyReferralLink();
      toast({
        title: "추천 링크 복사 완료!",
        description: "친구가 가입하면 둘 다 혜택을 받아요"
      });
    } catch (error) {
      console.error('추천 링크 복사 오류:', error);
    }
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'share': return <Share2 className="h-5 w-5" />;
      case 'referral': return <Users className="h-5 w-5" />;
      case 'review': return <Heart className="h-5 w-5" />;
      case 'streak': return <Trophy className="h-5 w-5" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };

  const getCampaignColor = (type: string) => {
    switch (type) {
      case 'share': return 'bg-blue-500';
      case 'referral': return 'bg-green-500';
      case 'review': return 'bg-pink-500';
      case 'streak': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* APR 전략: FOMO 유발하는 긴급 이벤트 */}
      <Card className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-red-500 animate-pulse" />
            <div>
              <h3 className="text-xl font-bold text-red-800">⚡ 한정 시간 이벤트</h3>
              <p className="text-red-600">지금 참여하면 특별 혜택 2배!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-red-600">48시간</div>
              <div className="text-sm text-red-500">남은 시간</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-red-600">500명</div>
              <div className="text-sm text-red-500">한정 인원</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 바이럴 캠페인 목록 */}
      <MobileGrid cols={1} gap="md">
        {campaigns.map((campaign, index) => (
          <MobileCard key={index} className={`${campaign.urgent ? 'border-orange-300 bg-orange-50' : ''}`}>
            <div className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg text-white flex-shrink-0 ${getCampaignColor(campaign.type)}`}>
                    {getCampaignIcon(campaign.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm lg:text-base truncate">{campaign.title}</h3>
                    {campaign.urgent && (
                      <Badge variant="destructive" className="animate-pulse text-xs mt-1">
                        긴급
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-muted-foreground">보상</div>
                  <div className="font-semibold text-primary text-sm">{campaign.reward}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>진행률</span>
                  <span>{campaign.progress}/{campaign.target}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getCampaignColor(campaign.type)}`}
                    style={{ width: `${Math.min((campaign.progress / campaign.target) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                  {campaign.type === 'share' && (
                    <Button 
                      onClick={handleShare} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      결과 공유하기
                    </Button>
                  )}
                  
                  {campaign.type === 'referral' && (
                    <Button 
                      onClick={handleReferralShare} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      친구 초대하기
                    </Button>
                  )}
                  
                  {campaign.type === 'review' && (
                    <Button 
                      asChild 
                      className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <a 
                        href="https://apps.apple.com/app/your-app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        리뷰 작성하기
                      </a>
                    </Button>
                  )}
                  
                  {campaign.type === 'streak' && (
                    <Button 
                      variant="outline" 
                      className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50" 
                      disabled
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      진행 중
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </MobileCard>
        ))}
      </MobileGrid>

      {/* APR 전략: 소셜 공유 최적화 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            소셜 공유 허브
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              분석 결과를 공유하고 친구들과 함께 성장하세요
            </p>
            
            <SocialShareButtons
              title="나의 AI 심리 분석 결과"
              description="3분 만에 알아본 내 마음의 진짜 모습! 🧠✨"
              url={`${window.location.origin}?ref=${referralCode}`}
            />
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">공유 혜택</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 카카오톡 공유: 즉시 토큰 50개</li>
                <li>• 인스타그램 스토리: 프리미엄 3일 무료</li>
                <li>• 친구 가입 완료: AI 분석권 + 토큰 100개</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* APR 전략: 성과 기반 사회적 증명 */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">🌟 공유 리더보드</h3>
            <p className="mb-4 opacity-90">이번 주 가장 많이 공유한 사용자들</p>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl">🥇</div>
                <div className="text-sm opacity-90">김**님</div>
                <div className="text-xs">15회 공유</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl">🥈</div>
                <div className="text-sm opacity-90">이**님</div>
                <div className="text-xs">12회 공유</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl">🥉</div>
                <div className="text-sm opacity-90">박**님</div>
                <div className="text-xs">9회 공유</div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              className="mt-4 text-primary font-medium bg-white hover:bg-gray-50"
              onClick={handleShare}
            >
              나도 참여하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};