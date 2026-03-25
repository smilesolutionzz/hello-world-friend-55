import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { ArrowLeft, ShoppingCart, TrendingDown, Gift, Award, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { useLanguage } from '@/i18n/LanguageContext';

interface PurchaseHistory {
  id: string;
  amount: number;
  token_amount: number;
  status: string;
  created_at: string;
  subscription_type: string;
}

interface UsageHistory {
  id: string;
  feature_type: string;
  count: number;
  usage_date: string;
  created_at: string;
}

const TokenHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [usages, setUsages] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchase' | 'usage'>('purchase');

  const loc = isEnglish ? enUS : ko;

  useEffect(() => { if (user) fetchHistory(); }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('payment_history').select('*').eq('user_id', user.id).eq('status', 'completed')
        .order('created_at', { ascending: false }).limit(100);
      if (purchaseError) throw purchaseError;
      setPurchases(purchaseData || []);

      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking').select('*').eq('user_id', user.id)
        .in('feature_type', ['token_consumption', 'assessment_tokens', 'observation_analysis', 'ai_analysis', 'dream_interpretation', 'premium_assessment'])
        .order('created_at', { ascending: false }).limit(100);
      if (usageError) throw usageError;
      setUsages(usageData || []);
    } catch (error) {
      console.error('Token history error:', error);
      toast({ title: isEnglish ? 'Failed to load history' : '이력 조회 실패', description: isEnglish ? 'Could not load token history.' : '토큰 이력을 불러오는데 실패했습니다.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const getFeatureTypeLabel = (type: string) => {
    const labels: Record<string, string> = isEnglish
      ? { token_consumption: 'Token Usage', assessment_tokens: 'Assessment', observation_analysis: 'Observation Analysis', ai_analysis: 'AI Analysis', dream_interpretation: 'Dream Interpretation', premium_assessment: 'Premium Assessment' }
      : { token_consumption: '토큰 소비', assessment_tokens: '발달 평가', observation_analysis: '관찰일지 분석', ai_analysis: 'AI 분석', dream_interpretation: '꿈 해석', premium_assessment: '프리미엄 평가' };
    return labels[type] || type;
  };

  const getFeatureTypeIcon = (type: string) => {
    switch (type) {
      case 'token_consumption': case 'assessment_tokens': case 'premium_assessment': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'observation_analysis': case 'ai_analysis': return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'dream_interpretation': return <TrendingDown className="w-4 h-4 text-purple-500" />;
      default: return <TrendingDown className="w-4 h-4" />;
    }
  };

  const getPurchaseTypeLabel = (type: string) => {
    if (type === 'token') return isEnglish ? 'Token Purchase' : '토큰 구매';
    if (type === 'subscription') return isEnglish ? 'Subscription Payment' : '구독 결제';
    return isEnglish ? 'Payment' : '결제';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEnglish ? 'Back' : '돌아가기'}
          </Button>
          <h1 className="text-3xl font-bold mb-2">{isEnglish ? 'Token History' : '토큰 이력'}</h1>
          <p className="text-muted-foreground">{isEnglish ? 'View your token purchase and usage history' : '토큰 구매 및 사용 내역을 확인할 수 있습니다'}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === 'purchase' ? 'default' : 'outline'} onClick={() => setActiveTab('purchase')} className="flex-1">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isEnglish ? `Purchases (${purchases.length})` : `구매 이력 (${purchases.length})`}
          </Button>
          <Button variant={activeTab === 'usage' ? 'default' : 'outline'} onClick={() => setActiveTab('usage')} className="flex-1">
            <TrendingDown className="w-4 h-4 mr-2" />
            {isEnglish ? `Usage (${usages.length})` : `사용 이력 (${usages.length})`}
          </Button>
        </div>

        {loading ? (
          <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">{isEnglish ? 'Loading history...' : '이력을 불러오는 중...'}</p></CardContent></Card>
        ) : activeTab === 'purchase' ? (
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">{isEnglish ? 'No purchase history' : '구매 이력이 없습니다'}</p></CardContent></Card>
            ) : purchases.map((purchase) => (
              <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg"><Gift className="w-5 h-5 text-green-600" /></div>
                      <div>
                        <CardTitle className="text-lg">{getPurchaseTypeLabel(purchase.subscription_type)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{format(new Date(purchase.created_at), 'PPP', { locale: loc })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">+{purchase.token_amount}</p>
                      <p className="text-sm text-muted-foreground">₩{purchase.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(purchase.created_at), 'PPP p', { locale: loc })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {usages.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><TrendingDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">{isEnglish ? 'No usage history' : '사용 이력이 없습니다'}</p></CardContent></Card>
            ) : usages.map((usage) => (
              <Card key={usage.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">{getFeatureTypeIcon(usage.feature_type)}</div>
                      <div>
                        <CardTitle className="text-lg">{getFeatureTypeLabel(usage.feature_type)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{format(new Date(usage.usage_date), 'PPP', { locale: loc })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">-{usage.count}</p>
                      <p className="text-sm text-muted-foreground">{isEnglish ? 'tokens' : '토큰'}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(usage.created_at), 'PPP p', { locale: loc })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-1">{isEnglish ? 'Transparent Token Management' : '투명한 토큰 관리'}</p>
                <p className="text-muted-foreground">{isEnglish ? 'All token purchases and usage are transparently recorded. You can check them anytime on this page.' : '모든 토큰 구매 및 사용 내역이 투명하게 기록됩니다. 언제든지 이 페이지에서 확인할 수 있습니다.'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenHistory;
