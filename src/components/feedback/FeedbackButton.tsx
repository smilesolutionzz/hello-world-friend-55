import React, { useState, useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from './FeedbackModal';


const FEEDBACK_SUBMITTED_KEY = 'feedback_submitted';

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const submitted = localStorage.getItem(FEEDBACK_SUBMITTED_KEY);
    if (submitted === 'true') {
      setHasSubmitted(true);
    }
  }, []);

  const handleFeedbackSubmitted = () => {
    setHasSubmitted(true);
    localStorage.setItem(FEEDBACK_SUBMITTED_KEY, 'true');
  };

  // 베타 테스트 기간이 아니거나 이미 피드백을 보낸 경우 숨김
  if (hasSubmitted) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-0 animate-bounce hover:animate-none"
        title="피드백 보내기"
      >
        <MessageSquarePlus className="h-5 w-5 md:h-6 md:w-6" />
      </Button>
      
      <FeedbackModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </>
  );
};
