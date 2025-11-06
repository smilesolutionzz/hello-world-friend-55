import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingReviewModalProps {
  bookingId: string;
  expertId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingReviewModal: React.FC<BookingReviewModalProps> = ({
  bookingId,
  expertId,
  userId,
  isOpen,
  onClose,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('consultation_reviews')
        .insert({
          booking_id: bookingId,
          expert_id: expertId,
          user_id: userId,
          rating,
          comment,
        });

      if (error) throw error;

      toast({
        title: '리뷰 작성 완료',
        description: '소중한 의견 감사합니다!',
      });

      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: '오류',
        description: error.message || '리뷰 작성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>상담 리뷰 작성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">평점</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">상담 후기</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="전문가와의 상담은 어떠셨나요?"
              rows={4}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '제출 중...' : '리뷰 작성'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
