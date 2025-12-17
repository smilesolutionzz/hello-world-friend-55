import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Share2, 
  Users, 
  Trophy, 
  Gift, 
  Zap,
  Target,
  Heart,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ViralChallengeComponent = () => {
  const { toast } = useToast();
  const [participantCount, setParticipantCount] = useState(847);
  const [userShares, setUserShares] = useState(0);
  const [earnedTokens, setEarnedTokens] = useState(0);

  const challenges = [
    {
      id: 1,
      title: "7일 마음챙김 챌린지",
      description: "7일 동안 매일 심리상태를 체크하고 친구들과 공유하세요",
      participants: 234,
      reward: "완주 시 무료 2,000캐시 + 프리미엄 1주일",
      progress: 3,
      total: 7,
      icon: Heart,
      color: "bg-pink-100 text-pink-600",
      trending: true
    },
    {
      id: 2,
      title: "가족 심리건강 체크",
      description: "가족 구성원 모두의 심리상태를 체크하고 결과를 공유해보세요",
      participants: 156,
      reward: "가족 모두 무료 1,500캐시씩",
      progress: 1,
      total: 4,
      icon: Users,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 3,
      title: "친구 추천 챌린지",
      description: "친구 5명을 초대하여 함께 심리테스트를 받아보세요",
      participants: 89,
      reward: "친구 1명당 1,000캐시 (최대 5,000캐시)",
      progress: userShares,
      total: 5,
      icon: Share2,
      color: "bg-green-100 text-green-600",
      hot: true
    }
  ];

  const milestones = [
    { shares: 1, reward: "무료 500캐시", achieved: userShares >= 1 },
    { shares: 3, reward: "무료 1,500캐시 + 기본 프리미엄 3일", achieved: userShares >= 3 },
    { shares: 5, reward: "무료 3,000캐시 + 프리미엄 1주일", achieved: userShares >= 5 },
    { shares: 10, reward: "무료 5,000캐시 + 프리미엄 1개월", achieved: userShares >= 10 }
  ];

  const handleShare = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const shareText = `🧠 ${challenge.title} 참여 중!\n\n${challenge.description}\n\n너도 함께 해볼래? 👇\n\nhttps://mindgrowth.co.kr/challenges/${challengeId}`;
    
    if (navigator.share) {
      navigator.share({
        title: challenge.title,
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "링크 복사 완료!",
        description: "친구들에게 공유해서 함께 챌린지에 참여해보세요!",
      });
    }

    // 공유 수 증가 (실제로는 백엔드에서 처리)
    setUserShares(prev => prev + 1);
    setEarnedTokens(prev => prev + 5);
    setParticipantCount(prev => prev + 1);
  };

  const handleJoinChallenge = (challengeId: number) => {
    toast({
      title: "챌린지 참여 완료!",
      description: "친구들을 초대하고 더 많은 보상을 받아보세요!",
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold">바이럴 챌린지</h2>
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          친구들과 함께 참여하고 <span className="font-semibold text-primary">무료 캐시와 프리미엄 혜택</span>을 받아보세요!
        </p>
      </div>

      {/* 현재 진행 상황 */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{participantCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">총 참여자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userShares}</div>
              <div className="text-sm text-muted-foreground">내 공유 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{(earnedTokens * 100).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">획득한 캐시</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 챌린지 목록 */}
      <div className="grid gap-6">
        {challenges.map((challenge) => {
          const Icon = challenge.icon;
          const progressPercentage = (challenge.progress / challenge.total) * 100;
          
          return (
            <Card key={challenge.id} className="relative">
              {challenge.trending && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  🔥 인기
                </Badge>
              )}
              {challenge.hot && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                  ⚡ HOT
                </Badge>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${challenge.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {challenge.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {challenge.participants}명 참여
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>진행률</span>
                    <span>{challenge.progress}/{challenge.total}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">보상: {challenge.reward}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleJoinChallenge(challenge.id)}
                    className="flex-1"
                    disabled={challenge.progress > 0}
                  >
                    {challenge.progress > 0 ? '참여 중' : '챌린지 참여'}
                  </Button>
                  <Button 
                    onClick={() => handleShare(challenge.id)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    공유하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 마일스톤 보상 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            공유 마일스톤 보상
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  milestone.achieved 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.achieved ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {milestone.achieved ? (
                      <Star className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-sm font-bold">{milestone.shares}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      친구 {milestone.shares}명 초대
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {milestone.reward}
                    </div>
                  </div>
                </div>
                {milestone.achieved && (
                  <Badge className="bg-green-500 text-white">
                    달성 완료!
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-white">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-xl font-bold">지금 바로 시작하세요!</h3>
          <p className="text-primary-foreground/90">
            친구들과 함께 마음 건강을 챙기고 특별한 보상도 받아보세요
          </p>
          <Button 
            onClick={() => handleShare(1)}
            className="bg-white text-primary hover:bg-gray-100"
          >
            <Share2 className="w-4 h-4 mr-2" />
            지금 공유하고 캐시 받기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViralChallengeComponent;