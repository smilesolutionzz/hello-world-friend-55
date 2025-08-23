import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Copy, Check, Gift, Users, Sparkles } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';

const ReferralWidget: React.FC = () => {
  const { referrals, loading, generateReferralCode, stats, loadReferralStats } = useReferrals();
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateAndCopy = async () => {
    const code = await generateReferralCode();
    if (code) {
      const referralUrl = `${window.location.origin}?ref=${code}`;
      await navigator.clipboard.writeText(referralUrl);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
      
      toast({
        title: "추천 링크 복사 완료!",
        description: "친구들에게 공유하여 10토큰을 받아보세요!",
      });
    }
  };

  const copyReferralLink = async (code: string) => {
    const referralUrl = `${window.location.origin}?ref=${code}`;
    await navigator.clipboard.writeText(referralUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const completedReferrals = stats.referralCount;
  const totalEarned = stats.totalTokensEarned;

  // 컴포넌트 마운트 시 통계 로드
  React.useEffect(() => {
    loadReferralStats();
  }, []);

  return (
    <>
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">친구 추천하고 토큰 받기</h3>
                  <p className="text-sm text-muted-foreground">친구 1명당 10토큰 적립!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">추천 완료: {completedReferrals}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">적립: {totalEarned}토큰</span>
                </div>
              </div>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <Share2 className="w-4 h-4 mr-2" />
                  친구 초대
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    친구 추천하고 10토큰 받기
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">✨ 혜택 안내</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 친구가 회원가입하면 10토큰 즉시 지급</li>
                      <li>• 가입한 친구에게도 5토큰 환영 선물</li>
                      <li>• 무제한으로 친구를 초대할 수 있어요</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleGenerateAndCopy}
                      className="w-full"
                      disabled={loading}
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          링크 복사 완료!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          새 추천 링크 생성하기
                        </>
                      )}
                    </Button>

                    {stats.myReferralCode && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">내 추천 코드</h5>
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                              {stats.myReferralCode}
                            </code>
                            <Badge variant="secondary" className="text-xs">
                              활성화
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyReferralLink(stats.myReferralCode)}
                          >
                            {copiedCode === stats.myReferralCode ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ReferralWidget;