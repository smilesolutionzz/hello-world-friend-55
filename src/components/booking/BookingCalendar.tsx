import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CreditCard } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

const CONSULTATION_PRICE = 39000; // 시간당 (시간 구독형)
const CONSULTATION_DURATION = 60;

interface Expert {
  id: string;
  full_name: string;
  professional_title: string;
  hourly_rate: number;
  specializations: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export const BookingCalendar = ({ expertId }: { expertId: string }) => {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { locale: ko }), i)
  );

  useEffect(() => {
    loadExpert();
  }, [expertId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimeSlots();
    }
  }, [selectedDate, expertId]);

  const loadExpert = async () => {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('id, full_name, professional_title, hourly_rate, specializations')
        .eq('id', expertId)
        .single();

      if (error) throw error;
      setExpert(data);
    } catch (error) {
      console.error('전문가 정보 로딩 실패:', error);
      toast({
        title: '로딩 실패',
        description: '전문가 정보를 불러올 수 없습니다.',
        variant: 'destructive'
      });
    }
  };

  const loadAvailableTimeSlots = async () => {
    try {
      const dayOfWeek = selectedDate.getDay();
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      const { data: schedules, error: schedError } = await supabase
        .from('expert_schedules')
        .select('start_time, end_time')
        .eq('expert_id', expertId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (schedError) throw schedError;

      const { data: timeOff } = await supabase
        .from('expert_time_off')
        .select('id')
        .eq('expert_id', expertId)
        .lte('start_date', dateStr)
        .gte('end_date', dateStr);

      if (timeOff && timeOff.length > 0) {
        setTimeSlots([]);
        return;
      }

      const { data: bookings } = await supabase
        .from('consultation_bookings')
        .select('start_time, end_time')
        .eq('expert_id', expertId)
        .eq('booking_date', dateStr)
        .in('status', ['pending', 'confirmed']);

      const slots: TimeSlot[] = [];
      
      if (!schedules || schedules.length === 0) {
        setTimeSlots(slots);
        return;
      }

      for (const schedule of schedules) {
        const startHour = parseInt(schedule.start_time.split(':')[0]);
        const endHour = parseInt(schedule.end_time.split(':')[0]);

        for (let hour = startHour; hour < endHour; hour++) {
          const timeStr = `${String(hour).padStart(2, '0')}:00:00`;
          
          const isBooked = bookings?.some(booking => {
            return timeStr >= booking.start_time && timeStr < booking.end_time;
          });

          slots.push({
            time: timeStr,
            available: !isBooked,
            reason: isBooked ? '예약됨' : undefined
          });
        }
      }

      setTimeSlots(slots);
    } catch (error) {
      console.error('시간대 로딩 실패:', error);
    }
  };

  const handleBooking = async () => {
    if (!selectedTime) {
      toast({ title: '시간 선택 필요', description: '예약 시간을 선택해주세요.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({ title: '로그인 필요', description: '로그인 후 이용해주세요.', variant: 'destructive' });
        navigate('/auth');
        return;
      }

      // Create payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('unified-payment', {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
        body: {
          action: 'create-payment',
          productId: `consultation_${expertId}`,
          productType: 'single',
          productName: `${expert?.full_name} 전문가 상담 (${CONSULTATION_DURATION}분)`,
          amount: CONSULTATION_PRICE,
          tokens: 0,
          metadata: {
            expertId,
            expertName: expert?.full_name,
            bookingDate: format(selectedDate, 'yyyy-MM-dd'),
            startTime: selectedTime,
            durationMinutes: CONSULTATION_DURATION,
            notes: notes || '',
          }
        }
      });

      if (paymentError || !paymentData?.success) {
        throw new Error(paymentData?.error || '결제 준비 실패');
      }

      const { loadTossPayments } = await import('@tosspayments/payment-sdk');
      
      const { data: keyData } = await supabase.functions.invoke('unified-payment', {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
        body: { action: 'get-client-key' }
      });

      if (!keyData?.clientKey) throw new Error('결제 키 로드 실패');

      const tossPayments = await loadTossPayments(keyData.clientKey);

      sessionStorage.setItem('pendingBooking', JSON.stringify({
        expertId,
        expertName: expert?.full_name,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        durationMinutes: CONSULTATION_DURATION,
        notes: notes || '',
        amount: CONSULTATION_PRICE,
      }));

      await tossPayments.requestPayment('카드', {
        amount: paymentData.paymentData.amount,
        orderId: paymentData.paymentData.orderId,
        orderName: paymentData.paymentData.orderName,
        customerEmail: paymentData.paymentData.customerEmail,
        customerName: paymentData.paymentData.customerName,
        successUrl: `${window.location.origin}/payment-complete?type=consultation`,
        failUrl: `${window.location.origin}/payment-complete?status=fail&type=consultation`,
      });

    } catch (error: any) {
      console.error('예약 결제 실패:', error);
      if (!error.message?.includes('사용자가 결제를 취소')) {
        toast({ title: '결제 실패', description: error.message || '다시 시도해주세요.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!expert) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          상담 예약
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <User className="w-4 h-4" />
            {expert.full_name} | {expert.professional_title}
          </div>
          <div className="mt-1 text-sm font-medium">
            {CONSULTATION_PRICE.toLocaleString()}원 / {CONSULTATION_DURATION}분
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 날짜 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">날짜 선택</label>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <Button
                key={day.toISOString()}
                variant={format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? 'default' : 'outline'}
                onClick={() => setSelectedDate(day)}
                className="flex flex-col p-2 h-auto"
              >
                <span className="text-xs">{format(day, 'E', { locale: ko })}</span>
                <span className="text-lg font-bold">{format(day, 'd')}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* 시간 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            시간 선택 ({format(selectedDate, 'M월 d일 (E)', { locale: ko })})
          </label>
          {timeSlots.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              이 날짜에는 예약 가능한 시간이 없습니다
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(slot => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className="relative"
                >
                  {slot.time.substring(0, 5)}
                  {!slot.available && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">상담 내용 (선택)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="상담하고 싶은 내용을 간단히 적어주세요..."
            rows={3}
          />
        </div>

        {/* 예약 정보 및 버튼 */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex justify-between text-sm">
            <span>상담 비용:</span>
            <span className="font-semibold text-lg">{CONSULTATION_PRICE.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>상담 시간:</span>
            <span>{CONSULTATION_DURATION}분</span>
          </div>
          <Button
            onClick={handleBooking}
            disabled={!selectedTime || loading}
            className="w-full"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading ? '처리 중...' : `${CONSULTATION_PRICE.toLocaleString()}원 카드 결제`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
