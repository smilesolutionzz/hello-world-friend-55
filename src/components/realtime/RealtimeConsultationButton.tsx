import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { RealtimeConsultationChat } from './RealtimeConsultationChat';

export const RealtimeConsultationButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 rounded-full h-14 w-14 shadow-lg"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}
      
      {isOpen && <RealtimeConsultationChat onClose={() => setIsOpen(false)} />}
    </>
  );
};