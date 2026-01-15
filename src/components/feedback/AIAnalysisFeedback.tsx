import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Star, MessageSquare, Send, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIAnalysisFeedbackProps {
  analysisType: string;
  inputData: Record<string, any>;
  aiOutput: string;
  onFeedbackSubmit?: () => void;
}

const feedbackTypes = [
  { id: 'helpful', label: '도움됨', icon: ThumbsUp, color: 'bg-green-500' },
  { id: 'too_generic', label: '너무 일반적', icon: MessageSquare, color: 'bg-yellow-500' },
  { id: 'inaccurate', label: '부정확함', icon: ThumbsDown, color: 'bg-red-500' },
  { id: 'needs_detail', label: '더 상세했으면', icon: Star, color: 'bg-blue-500' },
];

export const AIAnalysisFeedback = ({
  analysisType,
  inputData,
  aiOutput,
  onFeedbackSubmit
}: AIAnalysisFeedbackProps) => {
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDetailForm, setShowDetailForm] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

  const handleQuickFeedback = async (quickRating: number, feedbackType: string) => {
    setRating(quickRating);
    setSelectedType(feedbackType);
    
    // 긍정적 피드백은 즉시 제출
    if (feedbackType === 'helpful') {
      await submitFeedback(quickRating, feedbackType, "");
    } else {
      setShowDetailForm(true);
    }
  };

  const submitFeedback = async (
    finalRating: number,
    feedbackType: string | null,
    userComment: string
  ) => {
    setIsSubmitting(true);
    
    try {
      const sessionId = !user ? localStorage.getItem('guestSessionId') || crypto.randomUUID() : null;
      if (!user && sessionId) {
        localStorage.setItem('guestSessionId', sessionId);
      }

      const { error } = await supabase
        .from('ai_analysis_feedback')
        .insert({
          user_id: user?.id || null,
          analysis_type: analysisType,
          input_data: inputData,
          ai_output: aiOutput,
          rating: finalRating,
          feedback_type: feedbackType,
          user_comment: userComment || null,
          session_id: sessionId
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("피드백 감사합니다! AI 개선에 활용됩니다 🙏");
      onFeedbackSubmit?.();
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error("피드백 저장 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithComment = () => {
    submitFeedback(rating || 3, selectedType, comment);
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="flex items-center justify-center gap-2 py-4">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-700 dark:text-green-400 font-medium">
            피드백이 저장되었습니다!
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardContent className="py-4 space-y-4">
        {!showDetailForm ? (
          <>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                이 분석이 도움이 되셨나요? 피드백으로 AI를 개선합니다
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {feedbackTypes.map((type) => (
                <Button
                  key={type.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFeedback(
                    type.id === 'helpful' ? 5 : type.id === 'needs_detail' ? 3 : 2,
                    type.id
                  )}
                  className="flex items-center gap-1.5 hover:scale-105 transition-transform"
                  disabled={isSubmitting}
                >
                  <type.icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </Button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {feedbackTypes.find(t => t.id === selectedType)?.label}
              </Badge>
              
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="어떤 점이 아쉬웠나요? (선택사항)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] text-sm"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailForm(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitWithComment}
                disabled={isSubmitting || rating === 0}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                제출
              </Button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          피드백은 AI 모델 학습 데이터로 활용됩니다
        </p>
      </CardContent>
    </Card>
  );
};
