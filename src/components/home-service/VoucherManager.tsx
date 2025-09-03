import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { VoucherRegistrationDialog } from './VoucherRegistrationDialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface UserVoucher {
  id: string;
  voucher_number: string;
  issue_date: string;
  expire_date: string;
  total_amount: number;
  used_amount: number;
  remaining_amount: number;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  status: string;
  notes: string;
  voucher_types: {
    id: string;
    name: string;
    description: string;
    monthly_amount: number;
    session_limit: number;
  };
}

export const VoucherManager = () => {
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthGuard();

  useEffect(() => {
    if (user) {
      fetchVouchers();
    }
  }, [user]);

  const fetchVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_vouchers')
        .select(`
          *,
          voucher_types (
            id,
            name,
            description,
            monthly_amount,
            session_limit
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast({
        title: "오류",
        description: "바우처 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, expireDate: string) => {
    const today = new Date();
    const expiry = new Date(expireDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (status === 'expired' || expiry < today) {
      return <Badge variant="destructive">만료됨</Badge>;
    } else if (status === 'suspended') {
      return <Badge variant="secondary">일시정지</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">만료 임박</Badge>;
    } else {
      return <Badge variant="default">사용가능</Badge>;
    }
  };

  const getUsageProgress = (used: number, total: number) => {
    return total > 0 ? (used / total) * 100 : 0;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">로그인이 필요합니다</p>
            <p className="text-muted-foreground">바우처 정보를 확인하려면 로그인해주세요.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">바우처 관리</h2>
            <p className="text-muted-foreground">보유하신 바우처 정보를 확인하고 관리하세요</p>
          </div>
          <Button onClick={() => setRegistrationDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            바우처 등록
          </Button>
        </div>

        {/* 바우처 목록 */}
        {vouchers.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">등록된 바우처가 없습니다</p>
                <p className="text-muted-foreground mb-4">
                  바우처를 등록하여 재가방문 서비스를 이용해보세요.
                </p>
                <Button onClick={() => setRegistrationDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  바우처 등록하기
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vouchers.map((voucher) => {
              const amountProgress = getUsageProgress(voucher.used_amount, voucher.total_amount);
              const sessionProgress = getUsageProgress(voucher.used_sessions, voucher.total_sessions);
              const expireDate = new Date(voucher.expire_date);
              const daysUntilExpiry = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <Card key={voucher.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{voucher.voucher_types.name}</CardTitle>
                        <CardDescription>바우처 번호: {voucher.voucher_number}</CardDescription>
                      </div>
                      {getStatusBadge(voucher.status, voucher.expire_date)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 금액 사용량 */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>사용 금액</span>
                        <span>
                          {voucher.used_amount.toLocaleString()}원 / {voucher.total_amount.toLocaleString()}원
                        </span>
                      </div>
                      <Progress value={amountProgress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        잔여: {voucher.remaining_amount.toLocaleString()}원
                      </div>
                    </div>

                    {/* 회차 사용량 */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>사용 회차</span>
                        <span>
                          {voucher.used_sessions}회 / {voucher.total_sessions}회
                        </span>
                      </div>
                      <Progress value={sessionProgress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        잔여: {voucher.remaining_sessions}회
                      </div>
                    </div>

                    {/* 유효기간 */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(voucher.issue_date).toLocaleDateString()} ~ {expireDate.toLocaleDateString()}
                      </span>
                    </div>

                    {daysUntilExpiry > 0 && daysUntilExpiry <= 30 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            {daysUntilExpiry}일 후 만료 예정
                          </span>
                        </div>
                      </div>
                    )}

                    {voucher.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{voucher.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <VoucherRegistrationDialog
        open={registrationDialogOpen}
        onOpenChange={setRegistrationDialogOpen}
        onRegistrationComplete={() => {
          setRegistrationDialogOpen(false);
          fetchVouchers();
        }}
      />
    </>
  );
};