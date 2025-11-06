import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MessageCircle, Building, AlertCircle, Check, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  address: string;
  phone?: string;
  email?: string;
  services_offered: string[];
  voucher_types?: string[];
}

interface InstitutionBookingRequestProps {
  open: boolean;
  onClose: () => void;
  institution: Institution;
}

export const InstitutionBookingRequest = ({ open, onClose, institution }: InstitutionBookingRequestProps) => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!topic.trim()) {
      toast({
        title: '상담 주제를 입력해주세요',
        description: '상담받고 싶은 내용을 간단히 적어주세요.',
        variant: 'destructive'
      });
      return;
    }

    if (!userName.trim()) {
      toast({
        title: '성함을 입력해주세요',
        variant: 'destructive'
      });
      return;
    }

    if (!userPhone.trim()) {
      toast({
        title: '연락처를 입력해주세요',
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

      const bookingDate = format(selectedDate, 'yyyy-MM-dd');
      const endTime = calculateEndTime(selectedTime, 60);

      // 제휴기관 상담 예약 데이터
      const bookingNotes = `상담 주제: ${topic}\n\n희망 날짜: ${bookingDate}\n희망 시간: ${selectedTime}\n\n신청자: ${userName}\n연락처: ${userPhone}\n\n추가 메모:\n${notes}`;

      // user_notifications 테이블에 기록 (임시)
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          type: 'booking_confirmed',
          title: '제휴기관 상담 신청 완료',
          message: `${institution.name}에 상담 신청이 완료되었습니다.\n\n${bookingNotes}\n\n기관에서 확인 후 24시간 이내 연락드릴 예정입니다.`,
        });

      if (notificationError) {
        console.error('알림 생성 오류:', notificationError);
      }

      toast({
        title: '상담 신청 완료! 🎉',
        description: `${institution.name}에서 24시간 이내 연락드릴 예정입니다.`
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
            <Building className="w-6 h-6 text-primary" />
            제휴기관 상담 신청
          </DialogTitle>
          <DialogDescription>
            기관에서 24시간 이내 연락드립니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기관 정보 */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-12 h-12 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{institution.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {institution.institution_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{institution.address}</p>
                    {institution.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" />
                        <span>{institution.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {institution.services_offered?.slice(0, 4).map((service, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>

                {institution.voucher_types && institution.voucher_types.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">지원 바우처</p>
                    <div className="flex flex-wrap gap-1">
                      {institution.voucher_types.map((voucher, idx) => (
                        <Badge key={idx} className="text-xs bg-green-100 text-green-700">
                          {voucher}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 신청자 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                성함 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="이름을 입력하세요"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                연락처 <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="010-0000-0000"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
              />
            </div>
          </div>

          {/* 상담 주제 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              상담 주제 <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="어떤 내용으로 상담받고 싶으신가요?"
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
              placeholder="기관에 미리 전달하고 싶은 내용이 있다면 적어주세요"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* 안내 사항 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    기관에서 확인 후 24시간 이내 연락드립니다
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    전화 또는 문자로 상담 일정 확정 안내
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    바우처 이용 가능 여부는 기관과 상담 시 확인
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
              disabled={loading || !topic.trim() || !userName.trim() || !userPhone.trim() || !selectedDate || !selectedTime}
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
