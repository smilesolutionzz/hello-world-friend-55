import React from 'react';
import { useParams } from 'react-router-dom';
import { ConsultationInterface } from '@/components/consultation/ConsultationInterface';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

const ExpertConsultation = () => {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return (
      <div className="min-h-screen">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">오류</h1>
            <p className="text-muted-foreground mt-2">
              유효하지 않은 상담방 ID입니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 py-8">
        <ConsultationInterface roomId={roomId} />
      </div>
    </div>
  );
};

export default ExpertConsultation;