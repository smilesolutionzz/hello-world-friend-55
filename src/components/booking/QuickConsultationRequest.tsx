import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MessageCircle, Zap, Star, Award, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Expert {
  id: string;
  full_name: string;
  profile_image_url?: string;
  specializations: string[];
  hourly_rate: number;
  average_rating?: number;
  years_experience?: number;
}

interface QuickConsultationRequestProps {
  open: boolean;
  onClose: () => void;
  expert: Expert;
}


export const QuickConsultationRequest = ({ open, onClose, expert }: QuickConsultationRequestProps) => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { balance, consumeTokens, checkTokenAvailability } = useTokens();
  const navigate = useNavigate();

  // 전문가의 hourly_rate를 토큰 비용으로 사용
  const CONSULTATION_COST = expert.hourly_rate || 30000;

  const handleSubmit = async () => {
    if (!topic.trim()) {
      toast({
        title: '상담 주제를 입력해주세요',
        description: '상담받고 싶은 내용을 간단히 적어주세요.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: '상담 날짜를 선택해주세요',
        description: '희망하시는 상담 날짜를 선택해주세요.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: '상담 시간을 입력해주세요',
        description: '희망하시는 상담 시간을 선택해주세요.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: '로그인 필요',
          description: '상담 신청을 위해 로그인해주세요.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      // 토큰 확인
      const hasEnoughTokens = checkTokenAvailability(CONSULTATION_COST);
      if (!hasEnoughTokens) {
        toast({
          title: '토큰이 부족합니다',
          description: `상담 신청에는 ${CONSULTATION_COST.toLocaleString()} 토큰이 필요합니다.`,
          variant: 'destructive'
        });
        navigate('/token-subscription');
        return;
      }

      // 상담 예약 생성
      const bookingDate = format(selectedDate, 'yyyy-MM-dd');
      const endTime = calculateEndTime(selectedTime, 60); // 60분 상담 기준


      const bookingData = {
        user_id: user.id,
        expert_id: expert.id,
        expert_name: expert.full_name,
        booking_date: bookingDate,
        start_time: selectedTime,
        end_time: endTime,
        duration_minutes: 60,
        status: 'pending' as const,
        consultation_type: 'quick' as const,
        is_quick_consultation: true,
        notes: `${topic}\n\n희망 날짜: ${bookingDate}\n희망 시간: ${selectedTime}\n\n${notes}`,
        total_price: expert.hourly_rate,
        tokens_paid: CONSULTATION_COST
      };

      const { data: booking, error: bookingError } = await supabase
        .from('consultation_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 토큰 차감
      const tokenConsumed = await consumeTokens(CONSULTATION_COST);

      if (!tokenConsumed) {
        // 예약 취소
        await supabase.from('consultation_bookings').delete().eq('id', booking.id);
        throw new Error('토큰 차감 실패');
      }

      // 알림 생성
      await supabase.from('user_notifications').insert({
        user_id: user.id,
        type: 'booking_confirmed',
        title: '상담 신청 완료',
        message: `${expert.full_name} 전문가에게 상담 신청이 완료되었습니다. (${bookingDate} ${selectedTime}) 전문가가 확인 후 24시간 이내 연락드릴 예정입니다.`,
        booking_id: booking.id
      });

      toast({
        title: '상담 신청 완료! 🎉',
        description: `${expert.full_name} 전문가가 24시간 이내 연락드릴 예정입니다.`
      });

      onClose();
      navigate('/booking-management');
    } catch (error) {
      console.error('상담 신청 오류:', error);
      toast({
        title: '신청 실패',
        description: '상담 신청 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 종료 시간 계산 함수
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            상담 신청
          </DialogTitle>
          <DialogDescription>
            전문가가 24시간 이내 연락드립니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 전문가 정보 */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={expert.profile_image_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-lg">
                    {expert.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{expert.full_name} 에이전트</h3>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      기관장
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {expert.average_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{expert.average_rating}</span>
                      </div>
                    )}
                    {expert.years_experience && (
                      <span>경력 {expert.years_experience}년</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {expert.specializations?.slice(0, 3).map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상담 주제 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              상담 주제 <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="어떤 내용으로 상담받고 싶으신가요? (예: 아이 발달 문제, 심리 상담 등)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* 희망 상담 날짜 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              희망 상담 날짜 <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: ko }) : "날짜를 선택하세요"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 희망 상담 시간 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              희망 상담 시간 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* 추가 메모 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">추가 메모 (선택)</label>
            <Textarea
              placeholder="전문가에게 미리 전달하고 싶은 내용이 있다면 적어주세요"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* 비용 안내 */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">소요 토큰 (1시간 기준)</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {CONSULTATION_COST.toLocaleString()} 토큰
                  </div>
                  <div className="text-xs text-muted-foreground">
                    잔액: {balance?.current_tokens?.toLocaleString() || 0} 토큰
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 안내 사항 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    전문가가 확인 후 24시간 이내 연락드립니다
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    카카오톡 또는 전화로 상담이 진행됩니다
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    상담 시간은 1시간 기준입니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading || !topic.trim() || !selectedDate || !selectedTime}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  신청 중...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  상담 신청하기
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
