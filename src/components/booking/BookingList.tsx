import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, X, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BookingReviewModal } from './BookingReviewModal';

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  tokens_paid: number;
  notes: string | null;
  expert_id: string;
  meeting_link?: string;
  meeting_platform?: 'zoom' | 'kakao' | 'google_meet' | 'other';
  experts: {
    full_name: string;
    professional_title: string;
  };
  created_at: string;
}

const STATUS_LABELS = {
  pending: { label: '대기 중', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '확정됨', color: 'bg-green-100 text-green-700' },
  completed: { label: '완료됨', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-700' },
  no_show: { label: '노쇼', color: 'bg-red-100 text-red-700' },
};

export const BookingList = ({ userView = true }: { userView?: boolean }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    loadUser();
  }, []);

  useEffect(() => {
    loadBookings();
    
    // Realtime subscription
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultation_bookings'
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('consultation_bookings')
        .select(`
          *,
          experts (
            full_name,
            professional_title
          )
        `)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (userView) {
        query = query.eq('user_id', user.id);
      } else {
        // Expert view - get bookings for their expert profile
        const { data: expertProfile } = await supabase
          .from('experts')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (expertProfile) {
          query = query.eq('expert_id', expertProfile.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings((data || []) as Booking[]);
    } catch (error) {
      console.error('예약 목록 로딩 실패:', error);
      toast({
        title: '로딩 실패',
        description: '예약 목록을 불러올 수 없습니다.',
        variant: 'destructive'
      });
    }
  };

  const cancelBooking = async (bookingId: string, bookingDate: string, startTime: string) => {
    // Calculate refund policy
    const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
    const now = new Date();
    const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let refundInfo = '';
    if (hoursUntil >= 24) {
      refundInfo = '24시간 이상 전 취소 - 100% 환불';
    } else if (hoursUntil >= 12) {
      refundInfo = '12-24시간 전 취소 - 50% 환불';
    } else if (hoursUntil >= 0) {
      refundInfo = '12시간 미만 취소 - 환불 없음';
    } else {
      toast({
        title: '취소 불가',
        description: '지난 예약은 취소할 수 없습니다.',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`정말 예약을 취소하시겠습니까?\n\n${refundInfo}`)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-booking', {
        body: {
          bookingId,
          reason: '사용자 취소'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || '취소 실패');
      }

      toast({
        title: '예약 취소 완료',
        description: data.message
      });

      loadBookings();
    } catch (error: any) {
      console.error('예약 취소 실패:', error);
      toast({
        title: '취소 실패',
        description: error.message || '예약 취소에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId: string) => {
    const meetingLink = prompt('화상 상담 링크를 입력하세요 (Zoom, 카카오톡 등):');
    if (!meetingLink) return;

    const platform = prompt('플랫폼을 선택하세요 (zoom, kakao, google_meet, other):', 'zoom');
    if (!platform) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          meeting_link: meetingLink,
          meeting_platform: platform as 'zoom' | 'kakao' | 'google_meet' | 'other'
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: '예약 확정 완료',
        description: '예약이 확정되고 상담 링크가 전송되었습니다.'
      });

      loadBookings();
    } catch (error) {
      console.error('예약 확정 실패:', error);
      toast({
        title: '확정 실패',
        description: '예약 확정에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(b => 
    (b.status === 'pending' || b.status === 'confirmed') &&
    new Date(`${b.booking_date}T${b.start_time}`) >= new Date()
  );

  const pastBookings = bookings.filter(b =>
    b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show' ||
    new Date(`${b.booking_date}T${b.start_time}`) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            예정된 예약 ({upcomingBookings.length})
          </CardTitle>
          <CardDescription>
            다가오는 상담 일정을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              예정된 예약이 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {booking.experts.full_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {booking.experts.professional_title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(booking.booking_date), 'M월 d일 (E)', { locale: ko })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                        ({booking.duration_minutes}분)
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground">
                        {booking.notes}
                      </p>
                    )}
                    {booking.meeting_link && (
                      <a 
                        href={booking.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-block"
                      >
                        🔗 {booking.meeting_platform === 'zoom' ? 'Zoom' : booking.meeting_platform === 'kakao' ? '카카오톡' : booking.meeting_platform === 'google_meet' ? 'Google Meet' : '상담'} 링크 열기
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_LABELS[booking.status].color}>
                        {STATUS_LABELS[booking.status].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {booking.tokens_paid}토큰
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!userView && booking.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => confirmBooking(booking.id)}
                        disabled={loading}
                      >
                        확정
                      </Button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelBooking(booking.id, booking.booking_date, booking.start_time)}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>이전 예약 ({pastBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastBookings.map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 border rounded-lg opacity-75"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {booking.experts.full_name}
                      </span>
                      <span className="text-muted-foreground">
                        {format(new Date(booking.booking_date), 'M/d')} {booking.start_time.substring(0, 5)}
                      </span>
                    </div>
                    <Badge className={STATUS_LABELS[booking.status].color} variant="outline">
                      {STATUS_LABELS[booking.status].label}
                    </Badge>
                  </div>
                  {userView && booking.status === 'completed' && currentUserId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setReviewModalOpen(true);
                      }}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      리뷰
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedBooking && currentUserId && (
        <BookingReviewModal
          bookingId={selectedBooking.id}
          expertId={selectedBooking.expert_id}
          userId={currentUserId}
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};
