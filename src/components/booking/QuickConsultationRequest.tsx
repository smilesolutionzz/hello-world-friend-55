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

const QUICK_CONSULTATION_COST = 10; // 즉시 상담 토큰 비용

export const QuickConsultationRequest = ({ open, onClose, expert }: QuickConsultationRequestProps) => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredTime, setPreferredTime] = useState<'now' | 'within_1h' | 'within_3h'>('now');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { balance, consumeTokens, checkTokenAvailability } = useTokens();
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
      const hasEnoughTokens = checkTokenAvailability(QUICK_CONSULTATION_COST);
      if (!hasEnoughTokens) {
        toast({
          title: '토큰이 부족합니다',
          description: `즉시 상담 신청에는 ${QUICK_CONSULTATION_COST} 토큰이 필요합니다.`,
          variant: 'destructive'
        });
        navigate('/token-subscription');
        return;
      }

      // 즉시 상담 예약 생성
      const bookingData = {
        user_id: user.id,
        expert_id: expert.id,
        expert_name: expert.full_name,
        booking_date: new Date().toISOString().split('T')[0],
        start_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        end_time: new Date(Date.now() + 30 * 60 * 1000).toTimeString().split(' ')[0].slice(0, 5),
        duration_minutes: 30,
        status: 'pending' as const,
        consultation_type: 'quick' as const,
        is_quick_consultation: true,
        notes: `${topic}\n\n희망 시간: ${getPreferredTimeLabel(preferredTime)}\n\n${notes}`,
        total_price: expert.hourly_rate / 2, // 30분 기준
        tokens_paid: QUICK_CONSULTATION_COST
      };

      const { data: booking, error: bookingError } = await supabase
        .from('consultation_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 토큰 차감
      const tokenConsumed = await consumeTokens(QUICK_CONSULTATION_COST);

      if (!tokenConsumed) {
        // 예약 취소
        await supabase.from('consultation_bookings').delete().eq('id', booking.id);
        throw new Error('토큰 차감 실패');
      }

      // 알림 생성
      await supabase.from('user_notifications').insert({
        user_id: user.id,
        type: 'booking_confirmed',
        title: '즉시 상담 신청 완료',
        message: `${expert.full_name} 전문가에게 즉시 상담 신청이 완료되었습니다. 전문가가 확인 후 곧 연락드릴 예정입니다.`,
        booking_id: booking.id
      });

      toast({
        title: '즉시 상담 신청 완료! 🎉',
        description: `${expert.full_name} 전문가가 곧 연락드릴 예정입니다.`
      });

      onClose();
      navigate('/booking-management');
    } catch (error) {
      console.error('즉시 상담 신청 오류:', error);
      toast({
        title: '신청 실패',
        description: '즉시 상담 신청 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPreferredTimeLabel = (time: string) => {
    switch (time) {
      case 'now': return '지금 즉시';
      case 'within_1h': return '1시간 이내';
      case 'within_3h': return '3시간 이내';
      default: return '지금 즉시';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            즉시 상담 신청
          </DialogTitle>
          <DialogDescription>
            전문가가 빠른 시간 내에 연락드립니다
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

          {/* 희망 시간 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">희망 상담 시간</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'now', label: '지금 즉시', icon: Zap },
                { value: 'within_1h', label: '1시간 이내', icon: Clock },
                { value: 'within_3h', label: '3시간 이내', icon: Calendar }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPreferredTime(option.value as any)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    preferredTime === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <option.icon className={`w-5 h-5 mx-auto mb-2 ${
                    preferredTime === option.value ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
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
                  <span className="font-semibold">소요 토큰</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {QUICK_CONSULTATION_COST} 토큰
                  </div>
                  <div className="text-xs text-muted-foreground">
                    잔액: {balance?.current_tokens || 0} 토큰
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
                    전문가가 확인 후 빠른 시간 내에 연락드립니다
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    카카오톡 또는 전화로 상담이 진행됩니다
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    평균 응답 시간: 2시간 이내
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
              disabled={loading || !topic.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  신청 중...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  즉시 상담 신청하기
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
