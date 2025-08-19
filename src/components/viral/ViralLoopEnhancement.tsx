import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useReferrals } from "@/hooks/useReferrals";
import { supabase } from "@/integrations/supabase/client";
import { 
  Share2, 
  Gift, 
  Trophy, 
  Users, 
  Zap, 
  Target, 
  Copy,
  MessageCircle,
  Star,
  TrendingUp
} from "lucide-react";

interface ViralMilestone {
  id: string;
  title: string;
  description: string;
  target_referrals: number;
  reward_tokens: number;
  bonus_features: string[];
  unlocked: boolean;
  progress: number;
}

interface SocialSharing {
  platform: string;
  template: string;
  cta: string;
  tracking_id: string;
}

export default function ViralLoopEnhancement() {
  const [milestones, setMilestones] = useState<ViralMilestone[]>([]);
  const [sharingTemplates, setSharingTemplates] = useState<SocialSharing[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [referralStats, setReferralStats] = useState({ total: 0, successful: 0, pending: 0 });
  const { referrals, generateReferralCode, loading } = useReferrals();
  const { toast } = useToast();

  useEffect(() => {
    loadViralData();
    loadReferralStats();
  }, [referrals]);

  const loadViralData = () => {
    const mockMilestones: ViralMilestone[] = [
      {
        id: '1',
        title: '첫 번째 친구 초대',
        description: '첫 친구를 초대하여 AI 심리 상담의 혜택을 나누세요',
        target_referrals: 1,
        reward_tokens: 10,
        bonus_features: ['프리미엄 평가 1회 무료'],
        unlocked: false,
        progress: 0
      },
      {
        id: '2',
        title: '네트워크 빌더',
        description: '5명의 친구를 초대하여 작은 커뮤니티를 만들어보세요',
        target_referrals: 5,
        reward_tokens: 50,
        bonus_features: ['가족 대시보드 무료 이용 1개월', 'AI 코치 우선 접근'],
        unlocked: false,
        progress: 0
      },
      {
        id: '3',
        title: '커뮤니티 리더',
        description: '10명 이상 초대하여 정신건강 인식 개선에 기여하세요',
        target_referrals: 10,
        reward_tokens: 100,
        bonus_features: ['전문가 상담 할인권', '프리미엄 기능 영구 할인'],
        unlocked: false,
        progress: 0
      },
      {
        id: '4',
        title: '앰배서더',
        description: '25명 초대로 AIHPRO 앰배서더가 되어보세요',
        target_referrals: 25,
        reward_tokens: 250,
        bonus_features: ['베타 기능 우선 체험', '월간 전문가 그룹 세션 참여'],
        unlocked: false,
        progress: 0
      }
    ];

    const mockSharing: SocialSharing[] = [
      {
        platform: 'kakao',
        template: '🧠 AI 심리 상담 서비스 AIHPRO를 발견했어요! 가족의 정신건강을 AI와 전문가가 함께 돌봐줍니다. {referral_link}',
        cta: '카카오톡으로 공유하기',
        tracking_id: 'kakao_share'
      },
      {
        platform: 'sms',
        template: 'AI 심리 상담 AIHPRO 추천드려요. 정신건강 관리가 이렇게 쉬울 줄 몰랐어요! {referral_link}',
        cta: '문자로 공유하기',
        tracking_id: 'sms_share'
      },
      {
        platform: 'email',
        template: '안녕하세요! 정신건강 관리에 도움이 되는 AI 서비스를 발견해서 공유드립니다. AIHPRO는 AI와 전문가가 함께하는 심리 상담 플랫폼으로, 가족 모두의 정신건강을 체계적으로 관리할 수 있어요. {referral_link}',
        cta: '이메일로 공유하기',
        tracking_id: 'email_share'
      }
    ];

    setSharingTemplates(mockSharing);
    setMilestones(mockMilestones);
  };

  const loadReferralStats = () => {
    const successful = referrals?.filter(r => r.status === 'completed').length || 0;
    const pending = referrals?.filter(r => r.status === 'pending').length || 0;
    const total = referrals?.length || 0;

    setReferralStats({ total, successful, pending });

    // Update milestone progress
    setMilestones(prev => prev.map(milestone => ({
      ...milestone,
      progress: Math.min(100, (successful / milestone.target_referrals) * 100),
      unlocked: successful >= milestone.target_referrals
    })));
  };

  const handleShare = async (template: SocialSharing) => {
    try {
      const referralCode = await generateReferralCode();
      const baseUrl = window.location.origin;
      const referralLink = `${baseUrl}?ref=${referralCode}`;
      
      let shareText = template.template.replace('{referral_link}', referralLink);
      
      if (customMessage.trim()) {
        shareText = `${customMessage}\n\n${shareText}`;
      }

      switch (template.platform) {
        case 'kakao':
          // 카카오톡 공유 (실제 구현 시 카카오 SDK 사용)
          if (navigator.share) {
            await navigator.share({
              title: 'AIHPRO - AI 심리 상담',
              text: shareText,
              url: referralLink
            });
          } else {
            await navigator.clipboard.writeText(shareText);
            toast({
              title: "링크 복사 완료",
              description: "카카오톡에서 붙여넣기 하세요",
            });
          }
          break;
          
        case 'sms':
          window.open(`sms:?body=${encodeURIComponent(shareText)}`);
          break;
          
        case 'email':
          window.open(`mailto:?subject=AIHPRO 추천&body=${encodeURIComponent(shareText)}`);
          break;
      }

      // 공유 추적
      await trackShare(template.tracking_id, referralCode);
      
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "공유 실패",
        description: "공유 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const trackShare = async (trackingId: string, referralCode: string) => {
    try {
      // 공유 이벤트 추적 (실제 구현 시 analytics 서비스 사용)
      console.log('Share tracked:', { trackingId, referralCode });
      
      toast({
        title: "공유 완료",
        description: "친구가 가입하면 보상을 받을 수 있어요!",
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  const copyReferralLink = async () => {
    try {
      const referralCode = await generateReferralCode();
      const baseUrl = window.location.origin;
      const referralLink = `${baseUrl}?ref=${referralCode}`;
      
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "링크 복사 완료",
        description: "친구들에게 공유해보세요!",
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "복사 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  const claimMilestoneReward = async (milestone: ViralMilestone) => {
    try {
      // 실제로는 보상 지급 API 호출
      toast({
        title: "보상 지급 완료",
        description: `${milestone.reward_tokens} 토큰과 특별 혜택을 받았습니다!`,
      });
      
      // 마일스톤 상태 업데이트
      setMilestones(prev => prev.map(m => 
        m.id === milestone.id ? { ...m, unlocked: false } : m
      ));
      
    } catch (error) {
      console.error('Reward claim error:', error);
      toast({
        title: "보상 지급 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 추천 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            추천 현황
          </CardTitle>
          <CardDescription>
            친구들을 초대하고 함께 정신건강을 관리해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{referralStats.successful}</div>
              <div className="text-sm text-muted-foreground">성공한 추천</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{referralStats.pending}</div>
              <div className="text-sm text-muted-foreground">대기 중인 추천</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{referralStats.total}</div>
              <div className="text-sm text-muted-foreground">총 추천 수</div>
            </div>
          </div>

          <Button onClick={copyReferralLink} className="w-full" disabled={loading}>
            <Copy className="h-4 w-4 mr-2" />
            추천 링크 복사하기
          </Button>
        </CardContent>
      </Card>

      {/* 마일스톤 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            추천 마일스톤
          </CardTitle>
          <CardDescription>
            목표를 달성하고 특별한 보상을 받아보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${milestone.progress >= 100 ? 'bg-success text-success-foreground' : 'bg-secondary'}`}>
                      {milestone.progress >= 100 ? <Star className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">{milestone.reward_tokens} 토큰</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {referralStats.successful}/{milestone.target_referrals} 달성
                    </div>
                  </div>
                </div>

                <Progress value={milestone.progress} className="mb-3" />

                {milestone.bonus_features.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">추가 혜택:</div>
                    <div className="flex flex-wrap gap-1">
                      {milestone.bonus_features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {milestone.progress >= 100 && milestone.unlocked && (
                  <Button 
                    onClick={() => claimMilestoneReward(milestone)}
                    className="w-full"
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    보상 받기
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 스마트 공유 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            스마트 공유 도구
          </CardTitle>
          <CardDescription>
            개인화된 메시지로 더 효과적으로 공유하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">개인 메시지 추가 (선택)</label>
            <Input
              placeholder="친구들에게 전하고 싶은 메시지를 작성해보세요..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mb-4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sharingTemplates.map((template) => (
              <Button
                key={template.platform}
                onClick={() => handleShare(template)}
                variant="outline"
                className="h-auto p-4 text-left"
                disabled={loading}
              >
                <div>
                  <div className="font-medium mb-1">{template.cta}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {template.template.substring(0, 80)}...
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 추천 팁 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            추천 성공 팁
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <strong>가족과 친구부터:</strong> 정신건강에 관심이 있는 가까운 사람들부터 추천해보세요
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <strong>개인적인 경험 공유:</strong> AIHPRO를 사용하며 느낀 긍정적인 변화를 함께 나누세요
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Gift className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <strong>혜택 강조:</strong> 무료 토큰과 프리미엄 기능 체험 기회를 알려주세요
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}