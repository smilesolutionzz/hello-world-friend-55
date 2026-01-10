import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  X, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Clock,
  Video,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCash } from '@/utils/tokenToCash';
import { isBetaTestPeriod } from '@/utils/betaTest';

interface ExpertBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expert: {
    id: string;
    name: string;
    specialty: string[];
    hourlyPrice: number;
    image?: string;
  };
}

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00'
];

export const ExpertBookingModal = ({ open, onOpenChange, expert }: ExpertBookingModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const { tokenBalance, consumeTokens, checkTokenAvailability, refreshTokenBalance } = useTokens();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [durationMinutes] = useState(50);
  
  // 상담 비용 (50분 기준)
  const consultationCost = expert.hourlyPrice;
  const isBeta = isBetaTestPeriod();
  const hasEnoughTokens = isBeta || checkTokenAvailability(consultationCost);
  const currentBalance = tokenBalance?.current_tokens || 0;

  useEffect(() => {
    if (open && selectedDate) {
      loadBookedSlots();
    }
  }, [open, selectedDate, expert.id]);

  const loadBookedSlots = async () => {
    if (!selectedDate) return;
    
    try {
      const { data: bookings, error } = await supabase
        .from('consultation_bookings')
        .select('start_time')
        .eq('expert_id', expert.id)
        .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;

      const slots = bookings?.map(b => b.start_time.substring(0, 5)) || [];
      setBookedSlots(slots);
    } catch (error) {
      console.error('Error loading booked slots:', error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "예약을 하려면 로그인이 필요합니다.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "예약 정보 필요",
        description: "날짜와 시간을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!hasEnoughTokens && !isBeta) {
      toast({
        title: "캐시 부족",
        description: "캐시를 충전해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 예약 데이터 생성
      const bookingDate = format(selectedDate, 'yyyy-MM-dd');
      const startTime = `${selectedTime}:00`;
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endHour = hours + Math.floor((minutes + durationMinutes) / 60);
      const endMinute = (minutes + durationMinutes) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;

      const bookingData = {
        user_id: user.id,
        expert_id: expert.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        tokens_paid: isBeta ? 0 : consultationCost,
        notes: notes || null,
        status: 'pending',
        meeting_platform: 'video'
      };

      const { data: booking, error: bookingError } = await supabase
        .from('consultation_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 캐시 차감 (베타 기간 제외)
      if (!isBeta && consultationCost > 0) {
        const tokenConsumed = await consumeTokens(consultationCost);
        if (!tokenConsumed) {
          // 예약 취소
          await supabase.from('consultation_bookings').delete().eq('id', booking.id);
          throw new Error('캐시 차감 실패');
        }
      }

      // 잔액 새로고침
      await refreshTokenBalance();

      toast({
        title: "예약 완료! 🎉",
        description: `${expert.name} 전문가와의 상담이 예약되었습니다.`,
      });

      onOpenChange(false);
      setSelectedTime(null);
      setNotes('');
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "예약 실패",
        description: error.message || "예약 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChargeTokens = () => {
    onOpenChange(false);
    navigate('/token-subscription');
  };

  const disabledDays = {
    before: addDays(new Date(), 1),
    after: addDays(new Date(), 30)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2 sticky top-0 bg-white z-10 border-b">
          <DialogTitle className="text-center text-lg font-bold">상담 예약</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-5">
          {/* 전문가 정보 */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <Avatar className="w-12 h-12 ring-2 ring-white shadow">
              <AvatarImage src={expert.image} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                {expert.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{expert.name}</h3>
              <p className="text-sm text-gray-600">{expert.specialty.slice(0, 2).join(', ')}</p>
            </div>
          </div>

          {/* 날짜 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상담 날짜 *
            </label>
            <div className="border rounded-xl p-3 bg-white">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                locale={ko}
                className="w-full"
              />
            </div>
            {selectedDate && (
              <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
              </p>
            )}
          </div>

          {/* 시간 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상담 시간 *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TIME_SLOTS.map((time) => {
                const isBooked = bookedSlots.includes(time);
                const isSelected = selectedTime === time;
                
                return (
                  <button
                    key={time}
                    onClick={() => !isBooked && setSelectedTime(time)}
                    disabled={isBooked}
                    className={cn(
                      "py-2.5 px-1 rounded-lg text-sm font-medium transition-all",
                      isBooked && "bg-gray-100 text-gray-400 cursor-not-allowed",
                      !isBooked && !isSelected && "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200",
                      isSelected && "bg-blue-600 text-white shadow-lg"
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 상담 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상담 내용 *
            </label>
            <Textarea
              placeholder="상담 받고 싶은 내용을 간단히 적어주세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl"
            />
          </div>

          {/* 비용 정보 */}
          <div className={cn(
            "p-4 rounded-xl",
            hasEnoughTokens ? "bg-blue-50" : "bg-red-50"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={cn("w-5 h-5", hasEnoughTokens ? "text-blue-600" : "text-red-500")} />
                <span className="font-medium text-gray-900">상담 비용</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {isBeta ? '무료 (베타)' : `${formatCash(consultationCost)}원`}
                </div>
                <div className="text-xs text-gray-500">
                  잔액: {formatCash(currentBalance)}원
                </div>
              </div>
            </div>
            
            {!hasEnoughTokens && !isBeta && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>캐시가 부족합니다. 충전 후 이용해주세요.</span>
              </div>
            )}
          </div>

          {/* 안내 사항 */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>전문가 확인 후 24시간 내 연락</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>화상 또는 전화로 상담 진행</span>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl"
            >
              취소
            </Button>
            {hasEnoughTokens || isBeta ? (
              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {isSubmitting ? '예약 중...' : '예약하기'}
              </Button>
            ) : (
              <Button
                onClick={handleChargeTokens}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                캐시 충전하기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
