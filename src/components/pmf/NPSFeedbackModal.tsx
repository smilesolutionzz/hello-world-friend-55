import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePMFTracking, PMF_EVENTS } from '@/hooks/usePMFTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NPSFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

const NPSFeedbackModal: React.FC<NPSFeedbackModalProps> = ({ 
  isOpen, 
  onClose,
  context = 'general'
}) => {
  const [step, setStep] = useState<'nps' | 'reason' | 'thanks'>('nps');
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [wouldPay, setWouldPay] = useState<boolean | null>(null);
  const { trackEvent } = usePMFTracking();
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      trackEvent({ event_type: PMF_EVENTS.NPS_SHOWN, event_data: { context } });
    }
  }, [isOpen, context, trackEvent]);

  const handleNPSSelect = (score: number) => {
    setNpsScore(score);
  };

  const handleSubmitNPS = () => {
    if (npsScore !== null) {
      setStep('reason');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // RPC 호출로 피드백 저장
      await supabase.rpc('insert_pmf_feedback' as any, {
        p_user_id: user?.id || null,
        p_nps_score: npsScore,
        p_feedback_text: feedback || null,
        p_would_pay: wouldPay,
        p_context: context,
      });

      trackEvent({ 
        event_type: PMF_EVENTS.NPS_SUBMITTED, 
        event_data: { 
          nps_score: npsScore, 
          would_pay: wouldPay,
          context,
          has_feedback: feedback.length > 0
        } 
      });

      setStep('thanks');
      
      setTimeout(() => {
        onClose();
        setStep('nps');
        setNpsScore(null);
        setFeedback('');
        setWouldPay(null);
      }, 2000);

    } catch (error) {
      console.error('피드백 저장 실패:', error);
      // 로컬에 저장
      const feedbackData = {
        nps_score: npsScore,
        feedback_text: feedback,
        would_pay: wouldPay,
        context,
        created_at: new Date().toISOString(),
      };
      const feedbacks = JSON.parse(localStorage.getItem('pmf_feedback_queue') || '[]');
      feedbacks.push(feedbackData);
      localStorage.setItem('pmf_feedback_queue', JSON.stringify(feedbacks));
      
      setStep('thanks');
      setTimeout(() => {
        onClose();
        setStep('nps');
        setNpsScore(null);
        setFeedback('');
        setWouldPay(null);
      }, 2000);
    }
  };

  const getNPSCategory = (score: number): 'detractor' | 'passive' | 'promoter' => {
    if (score <= 6) return 'detractor';
    if (score <= 8) return 'passive';
    return 'promoter';
  };

  const getReasonPrompt = () => {
    if (npsScore === null) return '';
    const category = getNPSCategory(npsScore);
    switch (category) {
      case 'detractor':
        return '어떤 점이 아쉬우셨나요? 개선하면 더 좋을까요?';
      case 'passive':
        return '어떤 기능이 추가되면 더 만족하실까요?';
      case 'promoter':
        return '가장 마음에 드셨던 점은 무엇인가요?';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'nps' && '🎯 서비스 만족도 조사'}
            {step === 'reason' && '💬 더 나은 서비스를 위해'}
            {step === 'thanks' && '🙏 감사합니다!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'nps' && (
          <div className="space-y-6 py-4">
            <p className="text-center text-muted-foreground">
              이 서비스를 친구나 동료에게 추천할 의향이 얼마나 되시나요?
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>전혀 추천 안함</span>
                <span>매우 추천함</span>
              </div>
              <div className="grid grid-cols-11 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleNPSSelect(score)}
                    className={`
                      h-10 rounded-md text-sm font-medium transition-all
                      ${npsScore === score 
                        ? score <= 6 
                          ? 'bg-red-500 text-white' 
                          : score <= 8 
                            ? 'bg-yellow-500 text-white'
                            : 'bg-green-500 text-white'
                        : 'bg-muted hover:bg-muted/80'
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>
              {npsScore !== null && (
                <div className="flex justify-center">
                  <Badge 
                    variant={
                      npsScore <= 6 ? 'destructive' : 
                      npsScore <= 8 ? 'secondary' : 
                      'default'
                    }
                  >
                    {npsScore <= 6 && '개선이 필요해요'}
                    {npsScore > 6 && npsScore <= 8 && '괜찮아요'}
                    {npsScore > 8 && '정말 좋아요!'}
                  </Badge>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSubmitNPS} 
              disabled={npsScore === null}
              className="w-full"
            >
              다음
            </Button>
          </div>
        )}

        {step === 'reason' && (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">{getReasonPrompt()}</p>
              <Textarea
                placeholder="자유롭게 의견을 남겨주세요 (선택)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">
                이 서비스가 유료라면 사용하실 의향이 있으신가요?
              </p>
              <div className="flex gap-3">
                <Button
                  variant={wouldPay === true ? 'default' : 'outline'}
                  onClick={() => setWouldPay(true)}
                  className="flex-1"
                >
                  네, 사용할 것 같아요
                </Button>
                <Button
                  variant={wouldPay === false ? 'default' : 'outline'}
                  onClick={() => setWouldPay(false)}
                  className="flex-1"
                >
                  아니요
                </Button>
              </div>
            </div>

            <Button onClick={handleSubmitFeedback} className="w-full">
              제출하기
            </Button>
          </div>
        )}

        {step === 'thanks' && (
          <div className="text-center py-8 space-y-4">
            <div className="text-6xl">🎉</div>
            <p className="text-lg font-medium">소중한 의견 감사합니다!</p>
            <p className="text-sm text-muted-foreground">
              더 나은 서비스로 보답하겠습니다
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NPSFeedbackModal;
