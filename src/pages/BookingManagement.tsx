import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingList } from '@/components/booking/BookingList';
import { useSmartBack } from '@/hooks/useSmartBack';

const BookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/expert-hiring');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> 이전
          </Button>
          <h1 className="text-2xl font-bold">내 예약 내역</h1>
        </div>
        <BookingList userView />
      </div>
    </div>
  );
};

export default BookingManagement;
