import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, Sparkles } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string;
  sessions_count: number;
  total_tokens: number;
  price_per_session: number;
  discount_percentage: number;
}

export const PackagesView = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_packages')
        .select('*')
        .eq('is_active', true)
        .order('sessions_count');

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const purchasePackage = async (pkg: Package) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      // Check tokens
      const { data: tokenData } = await supabase
        .from('user_tokens')
        .select('current_tokens')
        .eq('user_id', user.id)
        .single();

      if (!tokenData || tokenData.current_tokens < pkg.total_tokens) {
        toast({
          title: '토큰 부족',
          description: `${pkg.total_tokens}토큰이 필요합니다. 현재: ${tokenData?.current_tokens || 0}토큰`,
          variant: 'destructive',
        });
        return;
      }

      // Create user package
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6); // 6개월 유효

      const { error: packageError } = await supabase
        .from('user_packages')
        .insert({
          user_id: user.id,
          package_id: pkg.id,
          sessions_remaining: pkg.sessions_count,
          sessions_total: pkg.sessions_count,
          expires_at: expiresAt.toISOString(),
        });

      if (packageError) throw packageError;

      // Deduct tokens
      const { error: tokenError } = await supabase
        .from('user_tokens')
        .update({
          current_tokens: tokenData.current_tokens - pkg.total_tokens,
        })
        .eq('user_id', user.id);

      if (tokenError) throw tokenError;

      toast({
        title: '패키지 구매 완료',
        description: `${pkg.name}을(를) 구매했습니다!`,
      });
    } catch (error: any) {
      console.error('Error purchasing package:', error);
      toast({
        title: '구매 실패',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">상담 패키지</h2>
        <p className="text-muted-foreground">
          패키지로 구매하고 최대 30% 할인 받으세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="relative overflow-hidden">
            {pkg.discount_percentage >= 20 && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  인기
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{pkg.total_tokens}</span>
                  <span className="text-muted-foreground">토큰</span>
                </div>
                {pkg.discount_percentage > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-muted-foreground">
                      {Math.round(pkg.total_tokens / (1 - pkg.discount_percentage / 100))}토큰
                    </span>
                    <Badge variant="secondary">
                      {pkg.discount_percentage}% 할인
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{pkg.sessions_count}회 상담</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>회당 {pkg.price_per_session}토큰</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>6개월 유효</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => purchasePackage(pkg)}
                disabled={loading}
              >
                {loading ? '구매 중...' : '구매하기'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
