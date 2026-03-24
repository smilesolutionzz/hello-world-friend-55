import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  CreditCard,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CONSULTATION_PRICE = 49000;
const CONSULTATION_DURATION = 40;

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
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      // Get session for auth
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({ title: '로그인 필요', description: '로그인 후 이용해주세요.', variant: 'destructive' });
        navigate('/auth');
        return;
      }

      // Create payment via unified-payment edge function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('unified-payment', {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
        body: {
          action: 'create-payment',
          productId: `consult_${expert.id.slice(0, 8)}`,
          productType: 'single',
          productName: `${expert.name} 전문가 상담 (${CONSULTATION_DURATION}분)`,
          amount: CONSULTATION_PRICE,
          tokens: 0,
          metadata: {
            expertId: expert.id,
            expertName: expert.name,
            bookingDate: format(selectedDate, 'yyyy-MM-dd'),
            startTime: `${selectedTime}:00`,
            durationMinutes: CONSULTATION_DURATION,
            notes: notes || '',
          }
        }
      });

      if (paymentError || !paymentData?.success) {
        throw new Error(paymentData?.error || paymentError?.message || '결제 준비에 실패했습니다.');
      }

      // Load Toss Payments and redirect
      const { loadTossPayments } = await import('@tosspayments/payment-sdk');
      
      // Get client key
      const { data: keyData } = await supabase.functions.invoke('unified-payment', {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
        body: { action: 'get-client-key' }
      });

      if (!keyData?.clientKey) {
        throw new Error('결제 키를 가져올 수 없습니다.');
      }

      const tossPayments = await loadTossPayments(keyData.clientKey);
      
      // Store booking info in sessionStorage for post-payment processing
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        expertId: expert.id,
        expertName: expert.name,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: `${selectedTime}:00`,
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
      console.error('Booking payment error:', error);
      if (!error.message?.includes('사용자가 결제를 취소')) {
        toast({
          title: "결제 실패",
          description: error.message || "결제 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
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
              상담 시간 * <span className="text-muted-foreground font-normal">({CONSULTATION_DURATION}분)</span>
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
          <div className="p-4 rounded-xl bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">상담 비용</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {CONSULTATION_PRICE.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  {CONSULTATION_DURATION}분 상담
                </div>
              </div>
            </div>
          </div>

          {/* 안내 사항 */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>카드 결제 후 예약이 확정됩니다</span>
            </div>
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
            <Button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || isSubmitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isSubmitting ? '처리 중...' : `${CONSULTATION_PRICE.toLocaleString()}원 결제하기`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
