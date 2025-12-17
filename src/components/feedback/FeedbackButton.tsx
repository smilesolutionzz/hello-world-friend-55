import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from './FeedbackModal';
import { isBetaTestPeriod } from '@/utils/betaTest';

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  // 베타 테스트 기간에만 표시
  if (!isBetaTestPeriod()) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-0 animate-bounce hover:animate-none"
        title="피드백 보내기"
      >
        <MessageSquarePlus className="h-6 w-6" />
      </Button>
      
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
