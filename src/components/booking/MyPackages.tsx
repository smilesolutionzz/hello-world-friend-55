import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UserPackage {
  id: string;
  sessions_remaining: number;
  sessions_total: number;
  expires_at: string;
  is_active: boolean;
  consultation_packages: {
    name: string;
    description: string;
  };
}

export const MyPackages = () => {
  const [packages, setPackages] = useState<UserPackage[]>([]);

  useEffect(() => {
    loadMyPackages();
  }, []);

  const loadMyPackages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_packages')
        .select(`
          *,
          consultation_packages (
            name,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPackages((data || []) as UserPackage[]);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  if (packages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="w-5 h-5" />
        내 패키지
      </h3>
      {packages.map((pkg) => {
        const progress = ((pkg.sessions_total - pkg.sessions_remaining) / pkg.sessions_total) * 100;
        return (
          <Card key={pkg.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{pkg.consultation_packages.name}</CardTitle>
                <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                  {pkg.is_active ? '사용 가능' : '만료'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>사용 현황</span>
                  <span className="font-medium">
                    {pkg.sessions_total - pkg.sessions_remaining} / {pkg.sessions_total}회
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  만료일: {format(new Date(pkg.expires_at), 'yyyy년 M월 d일', { locale: ko })}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
