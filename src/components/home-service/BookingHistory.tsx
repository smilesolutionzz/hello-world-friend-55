import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Phone, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface HomeServiceBooking {
  id: string;
  child_name: string;
  child_age: number;
  service_address: string;
  contact_phone: string;
  preferred_schedule: any;
  special_requests: string;
  payment_method: string;
  estimated_cost: number;
  voucher_coverage: number;
  self_pay_amount: number;
  status: string;
  booking_date: string;
  confirmed_at: string;
  notes: string;
  institution_home_services: {
    id: string;
    service_name: string;
    service_type: string;
    session_duration: number;
    institutions: {
      institution_name: string;
      phone: string;
    };
  };
  user_vouchers: {
    voucher_number: string;
    voucher_types: {
      name: string;
    };
  } | null;
}

export const BookingHistory = () => {
  const [bookings, setBookings] = useState<HomeServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { user } = useAuthGuard();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('home_service_bookings')
        .select(`
          *,
          institution_home_services (
            id,
            service_name,
            service_type,
            session_duration,
            institutions (
              institution_name,
              phone
            )
          ),
          user_vouchers (
            voucher_number,
            voucher_types (
              name
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "오류",
        description: "예약 내역을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '대기중', variant: 'secondary' as const },
      confirmed: { label: '확정', variant: 'default' as const },
      in_progress: { label: '진행중', variant: 'default' as const },
      completed: { label: '완료', variant: 'default' as const },
      cancelled: { label: '취소', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      therapy: '치료',
      education: '교육',
      development: '발달',
      counseling: '상담',
    };
    return labels[type] || type;
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('home_service_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "취소 완료",
        description: "예약이 취소되었습니다.",
      });

      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "오류",
        description: "예약 취소에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return booking.status === 'pending';
    if (activeTab === 'confirmed') return ['confirmed', 'in_progress'].includes(booking.status);
    if (activeTab === 'completed') return booking.status === 'completed';
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">로그인이 필요합니다</p>
            <p className="text-muted-foreground">예약 내역을 확인하려면 로그인해주세요.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">예약 내역</h2>
        <p className="text-muted-foreground">재가방문 서비스 예약 현황을 확인하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="pending">대기중</TabsTrigger>
          <TabsTrigger value="confirmed">확정</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="cancelled">취소</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">예약 내역이 없습니다</p>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' ? '아직 예약한 서비스가 없습니다.' : `${activeTab} 상태의 예약이 없습니다.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {booking.institution_home_services.service_name}
                        </CardTitle>
                        <CardDescription>
                          {booking.institution_home_services.institutions?.institution_name} | 
                          {getServiceTypeLabel(booking.institution_home_services.service_type)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.child_name} ({booking.child_age}세)</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{booking.service_address}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.contact_phone}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.institution_home_services.session_duration}분/회</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">결제 방법:</span>
                          <span className="ml-2">
                            {booking.payment_method === 'voucher' ? '바우처' : 
                             booking.payment_method === 'self_pay' ? '자부담' : '혼합'}
                          </span>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">예상 비용:</span>
                          <span className="ml-2">{booking.estimated_cost.toLocaleString()}원</span>
                        </div>

                        {booking.voucher_coverage > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">바우처 지원:</span>
                            <span className="ml-2">{booking.voucher_coverage.toLocaleString()}원</span>
                          </div>
                        )}

                        {booking.self_pay_amount > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">자부담:</span>
                            <span className="ml-2">{booking.self_pay_amount.toLocaleString()}원</span>
                          </div>
                        )}

                        {booking.user_vouchers && (
                          <div className="text-sm">
                            <span className="font-medium">사용 바우처:</span>
                            <span className="ml-2">{booking.user_vouchers.voucher_types.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-1">특별 요청사항:</p>
                        <p className="text-sm text-gray-700">{booking.special_requests}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        신청일: {new Date(booking.booking_date).toLocaleDateString()}
                        {booking.confirmed_at && (
                          <span className="ml-4">
                            확정일: {new Date(booking.confirmed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {booking.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          예약 취소
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};