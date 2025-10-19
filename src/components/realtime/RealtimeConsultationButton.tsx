import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export const RealtimeConsultationButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/ai-counselor');
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-40 rounded-full h-14 w-14 shadow-lg"
      size="icon"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
};