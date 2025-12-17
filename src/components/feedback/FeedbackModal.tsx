import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Star, Send, Sparkles, Bug, Lightbulb, Heart } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_TYPES = [
  { value: 'feature', label: '기능 제안', icon: Lightbulb, color: 'text-yellow-500' },
  { value: 'bug', label: '버그 신고', icon: Bug, color: 'text-red-500' },
  { value: 'improvement', label: '개선 의견', icon: Sparkles, color: 'text-purple-500' },
  { value: 'praise', label: '칭찬/응원', icon: Heart, color: 'text-pink-500' },
];

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [feedbackType, setFeedbackType] = useState('improvement');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: '피드백을 입력해주세요',
        description: '소중한 의견을 기다리고 있어요!',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // pmf_feedback 테이블에 저장
      const { error } = await supabase.from('pmf_feedback').insert({
        user_id: user?.id || null,
        nps_score: rating || null,
        feedback_text: `[${FEEDBACK_TYPES.find(t => t.value === feedbackType)?.label}] ${feedbackText}`,
        would_pay: null,
        context: JSON.stringify({
          type: feedbackType,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });

      if (error) throw error;

      toast({
        title: '🎉 소중한 피드백 감사합니다!',
        description: '서비스 개선에 큰 도움이 됩니다.',
      });

      // 폼 초기화
      setFeedbackText('');
      setRating(0);
      setFeedbackType('improvement');
      onClose();
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      toast({
        title: '피드백 저장 실패',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            피드백 보내기
          </DialogTitle>
          <DialogDescription>
            여러분의 소중한 의견이 더 좋은 서비스를 만듭니다 ✨
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 피드백 유형 선택 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">어떤 피드백인가요?</Label>
            <RadioGroup
              value={feedbackType}
              onValueChange={setFeedbackType}
              className="grid grid-cols-2 gap-2"
            >
              {FEEDBACK_TYPES.map((type) => (
                <div key={type.value}>
                  <RadioGroupItem
                    value={type.value}
                    id={type.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={type.value}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all
                      ${feedbackType === type.value 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' 
                        : 'border-border hover:border-muted-foreground/50'
                      }`}
                  >
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                    <span className="text-sm">{type.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 별점 (선택사항) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">전체 만족도 (선택)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {rating === 5 ? '최고예요!' : rating === 4 ? '좋아요!' : rating === 3 ? '보통이에요' : rating === 2 ? '아쉬워요' : '개선이 필요해요'}
                </span>
              )}
            </div>
          </div>

          {/* 피드백 내용 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              피드백 내용 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="어떤 점이 좋았나요? 어떤 기능이 있으면 좋을까요? 불편한 점은 무엇인가요?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              구체적으로 작성해주시면 더 빠르게 반영할 수 있어요!
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !feedbackText.trim()}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                보내는 중...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                피드백 보내기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
