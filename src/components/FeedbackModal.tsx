import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart, ThumbsUp, Smile, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  testType: string;
  onFeedbackSubmitted?: () => void;
}

const FeedbackModal = ({ isOpen, onClose, testType, onFeedbackSubmitted }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const emojis = ['😊', '😍', '🥰', '🤩', '💯', '🎉', '👍', '🙏', '😭', '🤖'];
  
  const handleSubmit = async () => {
    if (rating === 0 || message.trim() === '') {
      toast({
        title: "입력 오류",
        description: "평점과 후기를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "후기 작성을 위해 로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          test_type: testType,
          rating,
          message: message.trim(),
          emoji: selectedEmoji,
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "후기 작성 완료",
        description: "소중한 후기를 남겨주셔서 감사합니다!",
      });

      onFeedbackSubmitted?.();
      onClose();
      
      // 폼 리셋
      setRating(0);
      setMessage('');
      setSelectedEmoji('😊');
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "오류 발생",
        description: "후기 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              검사 후기 남기기
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* 평점 */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              <span className="font-medium">{testType}</span> 검사는 어떠셨나요?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:scale-110 transition-transform"
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-300'
                    }`}
                  />
                </Button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 5 && "정말 만족하셨군요! 🎉"}
                {rating === 4 && "좋은 경험이셨군요! 👍"}
                {rating === 3 && "괜찮으셨군요 😊"}
                {rating === 2 && "아쉬운 점이 있으셨나요? 🤔"}
                {rating === 1 && "개선이 필요하겠네요 💭"}
              </p>
            )}
          </div>

          {/* 이모지 선택 */}
          <div>
            <p className="text-sm font-medium mb-2">기분을 표현해주세요</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant={selectedEmoji === emoji ? "default" : "outline"}
                  size="sm"
                  className="text-xl h-10 w-10 p-0"
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* 후기 메시지 */}
          <div>
            <p className="text-sm font-medium mb-2">한줄 후기를 남겨주세요</p>
            <Textarea
              placeholder="검사에 대한 솔직한 후기를 남겨주세요. 다른 이용자들에게 도움이 됩니다!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {message.length}/200
            </p>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              나중에
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || message.trim() === ''}
            >
              {isSubmitting ? "저장 중..." : "후기 남기기"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            작성하신 후기는 공개되어 다른 이용자들에게 도움이 됩니다
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;