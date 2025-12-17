import React, { useState } from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Rocket, Gift, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CrossPromotionReward = () => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedService, setSelectedService] = useState<'memory_legacy' | 'make_one_project' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    {
      id: 'memory_legacy' as const,
      name: 'Memory Legacy',
      description: '가족의 추억을 책으로',
      icon: BookOpen,
      color: 'purple',
      reward: 10,
      url: 'https://memolegacy.com?ref=highlight'
    },
    {
      id: 'make_one_project' as const,
      name: 'Make One Project',
      description: '7일 만에 MVP 제작',
      icon: Rocket,
      color: 'blue',
      reward: 15,
      url: 'https://makeoneproject.com?ref=highlight'
    }
  ];

  const handleClaimReward = async () => {
    if (!selectedService || !verificationCode.trim()) {
      toast({
        title: "입력 오류",
        description: "서비스를 선택하고 인증 코드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('claim_cross_promotion_reward', {
        p_service_name: selectedService,
        p_verification_code: verificationCode
      });

      if (error) throw error;

      const result = data as { success: boolean; reward_tokens?: number; message?: string; error?: string };

      if (result?.success) {
        toast({
          title: "🎉 보상 지급 완료!",
          description: result.message || `${result.reward_tokens}캐시가 지급되었습니다!`,
        });
        setVerificationCode('');
        setSelectedService(null);
      } else {
        toast({
          title: "보상 신청 실패",
          description: result?.error || "보상 신청 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "오류 발생",
        description: "보상 신청 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-4">
              <Gift className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-brand-gradient">
              자매 서비스 가입 보상
            </h1>
            <p className="text-xl text-muted-foreground">
              다른 서비스에 가입하고 캐시를 받으세요!
            </p>
          </div>

          {/* 서비스 선택 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {services.map((service) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.id;
              
              return (
                <Card 
                  key={service.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary shadow-xl' : ''
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg bg-${service.color}-100 dark:bg-${service.color}-900/30`}>
                          <Icon className={`w-6 h-6 text-${service.color}-600 dark:text-${service.color}-400`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-primary animate-in fade-in zoom-in" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        +{service.reward} 캐시
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(service.url, '_blank');
                        }}
                      >
                        가입하러 가기
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 인증 코드 입력 */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                보상 받기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="verification-code">인증 코드</Label>
                <Input
                  id="verification-code"
                  placeholder="가입 후 받은 인증 코드를 입력하세요"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  * 다른 서비스에 가입하면 이메일로 인증 코드가 발송됩니다
                </p>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-sm">📋 보상 받는 방법</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>위에서 원하는 서비스를 선택하세요</li>
                  <li>"가입하러 가기" 버튼을 눌러 해당 서비스에 가입하세요</li>
                  <li>가입 완료 후 이메일로 받은 인증 코드를 입력하세요</li>
                  <li>"보상 받기" 버튼을 누르면 캐시가 지급됩니다!</li>
                </ol>
              </div>

              <Button
                onClick={handleClaimReward}
                disabled={!selectedService || !verificationCode.trim() || isSubmitting}
                className="w-full btn-brand"
                size="lg"
              >
                {isSubmitting ? '처리 중...' : '보상 받기'}
              </Button>
            </CardContent>
          </Card>

          {/* 주의사항 */}
          <Card className="mt-8 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-800 dark:text-orange-400">
                ⚠️ 주의사항
              </h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• 각 서비스당 1회만 보상을 받을 수 있습니다</li>
                <li>• 본인 명의로 가입한 계정만 인정됩니다</li>
                <li>• 부정한 방법으로 보상을 받을 경우 계정이 정지될 수 있습니다</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CrossPromotionReward;