import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  Crown, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Camera, 
  Zap,
  Award,
  Settings,
  CreditCard,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumFeature {
  feature_type: string;
  is_enabled: boolean;
  settings: any;
  usage_count: number;
  usage_limit: number;
}

interface PremiumPlan {
  id: string;
  plan_type: 'basic' | 'standard' | 'premium';
  plan_name: string;
  monthly_price: number;
  features: string[];
  is_active: boolean;
  payment_status: string;
  expires_at?: string;
}

interface InstitutionPremiumSettingsProps {
  institutionId: string;
  institutionName: string;
}

export function InstitutionPremiumSettings({ 
  institutionId, 
  institutionName 
}: InstitutionPremiumSettingsProps) {
  const [currentPlan, setCurrentPlan] = useState<PremiumPlan | null>(null);
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentPlan();
    fetchFeatures();
  }, [institutionId]);

  const fetchCurrentPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_premium_plans')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setCurrentPlan({
          ...data,
          plan_type: data.plan_type as 'basic' | 'standard' | 'premium',
          features: Array.isArray(data.features) 
            ? data.features.map(f => String(f))
            : []
        });
      }
    } catch (error) {
      console.error('플랜 조회 오류:', error);
    }
  };

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_premium_features')
        .select('*')
        .eq('institution_id', institutionId);

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('기능 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureType: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('institution_premium_features')
        .upsert({
          institution_id: institutionId,
          feature_type: featureType,
          is_enabled: enabled
        });

      if (error) throw error;

      setFeatures(prev => 
        prev.map(f => 
          f.feature_type === featureType 
            ? { ...f, is_enabled: enabled }
            : f
        )
      );

      toast({
        title: enabled ? "기능이 활성화되었습니다" : "기능이 비활성화되었습니다",
        description: `${getFeatureName(featureType)} 기능을 ${enabled ? '켰습니다' : '껐습니다'}.`,
      });
    } catch (error) {
      console.error('기능 토글 오류:', error);
      toast({
        title: "오류 발생",
        description: "기능 설정을 변경할 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const getFeatureName = (featureType: string) => {
    const featureNames: Record<string, string> = {
      'priority_listing': '우선 노출',
      'featured_badge': '추천 배지',
      'analytics_dashboard': '분석 대시보드',
      'custom_profile': '맞춤 프로필',
      'virtual_tour': '가상 투어',
      'priority_matching': '우선 매칭',
      'marketing_tools': '마케팅 도구',
      'dedicated_manager': '전담 매니저'
    };
    return featureNames[featureType] || featureType;
  };

  const getFeatureIcon = (featureType: string) => {
    const icons: Record<string, any> = {
      'priority_listing': TrendingUp,
      'featured_badge': Star,
      'analytics_dashboard': BarChart3,
      'custom_profile': Camera,
      'virtual_tour': Camera,
      'priority_matching': Zap,
      'marketing_tools': Award,
      'dedicated_manager': Settings
    };
    return icons[featureType] || Settings;
  };

  const getFeatureDescription = (featureType: string) => {
    const descriptions: Record<string, string> = {
      'priority_listing': '검색 결과 상위에 우선 노출되어 더 많은 고객에게 발견됩니다',
      'featured_badge': '추천 기관 배지로 신뢰도와 클릭률을 높입니다',
      'analytics_dashboard': '상세한 방문자 분석과 성과 지표를 확인할 수 있습니다',
      'custom_profile': '더 많은 사진과 동영상으로 기관을 어필할 수 있습니다',
      'virtual_tour': '360도 가상 투어로 시설을 생생하게 보여줍니다',
      'priority_matching': 'AI 매칭 시스템에서 우선적으로 추천됩니다',
      'marketing_tools': '전문적인 마케팅 도구와 템플릿을 제공합니다',
      'dedicated_manager': '전담 매니저가 기관 운영을 지원합니다'
    };
    return descriptions[featureType] || '';
  };

  const planOptions = [
    {
      type: 'basic' as const,
      name: '기본 플랜',
      price: 0,
      features: ['기본 프로필', '표준 고객지원'],
      color: 'gray',
      icon: Award
    },
    {
      type: 'standard' as const,
      name: '스탠다드 플랜',
      price: 100000,
      features: ['우선 노출', '분석 대시보드', '마케팅 도구'],
      color: 'blue',
      icon: Star,
      popular: true
    },
    {
      type: 'premium' as const,
      name: '프리미엄 플랜',
      price: 200000,
      features: ['모든 기능', '전담 매니저', '가상 투어', '우선 매칭'],
      color: 'yellow',
      icon: Crown
    }
  ];

  const FeatureCard = ({ feature }: { feature: PremiumFeature }) => {
    const Icon = getFeatureIcon(feature.feature_type);
    const canToggle = currentPlan?.plan_type !== 'basic';
    
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">{getFeatureName(feature.feature_type)}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {getFeatureDescription(feature.feature_type)}
              </p>
              {feature.usage_limit > 0 && (
                <div className="text-xs text-muted-foreground">
                  사용량: {feature.usage_count} / {feature.usage_limit}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canToggle ? (
              <Switch
                checked={feature.is_enabled}
                onCheckedChange={(checked) => toggleFeature(feature.feature_type, checked)}
              />
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                업그레이드 필요
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const PlanCard = ({ plan, isCurrent }: { plan: any; isCurrent: boolean }) => {
    const Icon = plan.icon;
    
    return (
      <Card className={`p-6 ${isCurrent ? 'ring-2 ring-primary bg-primary/5' : ''} ${plan.popular ? 'border-primary' : ''}`}>
        {plan.popular && (
          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
            인기
          </Badge>
        )}
        
        <div className="text-center">
          <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${plan.color}-100 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${plan.color}-600`} />
          </div>
          
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="text-3xl font-bold mb-4">
            {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
            {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/월</span>}
          </div>
          
          <ul className="space-y-2 mb-6">
            {plan.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center justify-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
          
          {isCurrent ? (
            <Badge className="w-full py-2 bg-green-100 text-green-700">
              현재 플랜
            </Badge>
          ) : (
            <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
              {plan.price === 0 ? '다운그레이드' : '업그레이드'}
            </Button>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            프리미엄 설정
          </h2>
          <p className="text-muted-foreground">{institutionName}</p>
        </div>
        
        {currentPlan && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            {currentPlan.plan_name}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList>
          <TabsTrigger value="features">기능 관리</TabsTrigger>
          <TabsTrigger value="plans">플랜 변경</TabsTrigger>
          <TabsTrigger value="billing">결제 정보</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사용 가능한 기능</CardTitle>
              <p className="text-sm text-muted-foreground">
                현재 플랜에서 사용할 수 있는 기능들을 관리하세요.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <FeatureCard key={feature.feature_type} feature={feature} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planOptions.map((plan) => (
              <div key={plan.type} className="relative">
                <PlanCard 
                  plan={plan} 
                  isCurrent={currentPlan?.plan_type === plan.type}
                />
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>플랜 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">기능</th>
                      <th className="text-center py-3">기본</th>
                      <th className="text-center py-3">스탠다드</th>
                      <th className="text-center py-3">프리미엄</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      '기본 프로필',
                      '우선 노출',
                      '분석 대시보드',
                      '마케팅 도구',
                      '가상 투어',
                      '전담 매니저'
                    ].map((feature, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{feature}</td>
                        <td className="text-center py-3">
                          {index === 0 ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                        </td>
                        <td className="text-center py-3">
                          {index <= 2 ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                        </td>
                        <td className="text-center py-3">
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                결제 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPlan ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">현재 플랜</h4>
                      <p className="text-sm text-muted-foreground">{currentPlan.plan_name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">월 요금</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentPlan.monthly_price === 0 ? '무료' : `₩${currentPlan.monthly_price.toLocaleString()}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">결제 상태</h4>
                      <Badge variant={currentPlan.payment_status === 'paid' ? 'default' : 'destructive'}>
                        {currentPlan.payment_status === 'paid' ? '결제 완료' : '결제 대기'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium">다음 결제일</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentPlan.expires_at 
                          ? new Date(currentPlan.expires_at).toLocaleDateString('ko-KR')
                          : '없음'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="mr-2">
                      결제 방법 변경
                    </Button>
                    <Button variant="outline">
                      청구서 다운로드
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">활성화된 프리미엄 플랜이 없습니다.</p>
                  <Button>플랜 선택하기</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}