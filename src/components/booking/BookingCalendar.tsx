import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

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

const DURATION_OPTIONS = [
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 90, label: '1시간 30분' },
  { value: 120, label: '2시간' },
];

export const BookingCalendar = ({ expertId }: { expertId: string }) => {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTokens, setUserTokens] = useState<number>(0);
  const { toast } = useToast();

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { locale: ko }), i)
  );

  useEffect(() => {
    loadExpert();
    loadUserTokens();
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

  const loadUserTokens = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_tokens')
        .select('current_tokens')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserTokens(data?.current_tokens || 0);
    } catch (error) {
      console.error('토큰 정보 로딩 실패:', error);
    }
  };

  const loadAvailableTimeSlots = async () => {
    try {
      const dayOfWeek = selectedDate.getDay();
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Get expert's schedule for this day
      const { data: schedules, error: schedError } = await supabase
        .from('expert_schedules')
        .select('start_time, end_time')
        .eq('expert_id', expertId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (schedError) throw schedError;

      // Check if expert is on time off
      const { data: timeOff, error: timeOffError } = await supabase
        .from('expert_time_off')
        .select('id')
        .eq('expert_id', expertId)
        .lte('start_date', dateStr)
        .gte('end_date', dateStr);

      if (timeOffError) throw timeOffError;

      if (timeOff && timeOff.length > 0) {
        setTimeSlots([]);
        return;
      }

      // Get existing bookings
      const { data: bookings, error: bookingError } = await supabase
        .from('consultation_bookings')
        .select('start_time, end_time')
        .eq('expert_id', expertId)
        .eq('booking_date', dateStr)
        .in('status', ['pending', 'confirmed']);

      if (bookingError) throw bookingError;

      // Generate time slots
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
            const bookingStart = booking.start_time;
            const bookingEnd = booking.end_time;
            return timeStr >= bookingStart && timeStr < bookingEnd;
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
      toast({
        title: '시간대 로딩 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  };

  const calculateTokenCost = () => {
    if (!expert) return 0;
    return Math.ceil((expert.hourly_rate / 60) * duration);
  };

  const handleBooking = async () => {
    if (!selectedTime) {
      toast({
        title: '시간 선택 필요',
        description: '예약 시간을 선택해주세요.',
        variant: 'destructive'
      });
      return;
    }

    const tokenCost = calculateTokenCost();
    if (userTokens < tokenCost) {
      toast({
        title: '토큰 부족',
        description: `${tokenCost}토큰이 필요하지만 ${userTokens}토큰만 보유하고 있습니다.`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-consultation-booking', {
        body: {
          expertId,
          bookingDate: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTime,
          durationMinutes: duration,
          notes: notes || undefined
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || '예약 실패');
      }

      toast({
        title: '예약 완료',
        description: `${format(selectedDate, 'M월 d일 (E)', { locale: ko })} ${selectedTime.substring(0, 5)} 예약이 완료되었습니다.`
      });

      // Send confirmation notification
      try {
        await supabase.functions.invoke('send-booking-notification', {
          body: {
            bookingId: data.booking.id,
            notificationType: 'confirmation'
          }
        });
      } catch (notifError) {
        console.error('알림 전송 실패:', notifError);
        // Don't throw - booking is already created
      }

      // Reset form and reload data
      setSelectedTime('');
      setNotes('');
      loadUserTokens();
      loadAvailableTimeSlots();
    } catch (error: any) {
      console.error('예약 실패:', error);
      toast({
        title: '예약 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!expert) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  const tokenCost = calculateTokenCost();

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
          <div className="mt-1 text-sm">
            시간당 {expert.hourly_rate}토큰 | 보유: {userTokens}토큰
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

        {/* 상담 시간 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">상담 시간</label>
          <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <span>예상 비용:</span>
            <span className="font-semibold">{tokenCost}토큰</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>예약 후 잔액:</span>
            <span className={userTokens - tokenCost < 0 ? 'text-red-600' : 'text-green-600'}>
              {userTokens - tokenCost}토큰
            </span>
          </div>
          <Button
            onClick={handleBooking}
            disabled={!selectedTime || loading || userTokens < tokenCost}
            className="w-full"
          >
            {loading ? '예약 중...' : '예약하기'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
