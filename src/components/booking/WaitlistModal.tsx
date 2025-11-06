import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WaitlistModalProps {
  expertId: string;
  expertName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  expertId,
  expertName,
  isOpen,
  onClose,
}) => {
  const [preferredDate, setPreferredDate] = useState('');
  const [timeStart, setTimeStart] = useState('09:00');
  const [timeEnd, setTimeEnd] = useState('18:00');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      const { error } = await supabase
        .from('booking_waitlist')
        .insert({
          user_id: user.id,
          expert_id: expertId,
          preferred_date: preferredDate,
          preferred_time_start: timeStart,
          preferred_time_end: timeEnd,
          duration_minutes: 60,
        });

      if (error) throw error;

      toast({
        title: '대기 신청 완료',
        description: '예약 가능 시 알림을 보내드리겠습니다.',
      });

      onClose();
    } catch (error: any) {
      console.error('Error adding to waitlist:', error);
      toast({
        title: '신청 실패',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>대기자 명단 신청</DialogTitle>
          <DialogDescription>
            {expertName} 전문가의 예약이 취소되면 자동으로 알림을 받습니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">희망 날짜</Label>
            <Input
              id="date"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time-start">희망 시작 시간</Label>
              <Input
                id="time-start"
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="time-end">희망 종료 시간</Label>
              <Input
                id="time-end"
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '신청 중...' : '대기 신청'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
