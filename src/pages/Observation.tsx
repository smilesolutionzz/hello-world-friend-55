import { useState } from "react";
import AuthenticationGuard from "@/components/observation/AuthenticationGuard";
import { SimpleObservationForm } from "@/components/observation/SimpleObservationForm";
import { SimpleObservationList } from "@/components/observation/SimpleObservationList";

const Observation = () => {
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');

  const handleNewObservation = () => {
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
  };

  const handleSuccess = () => {
    setCurrentView('list');
  };

  return (
    <AuthenticationGuard fallbackMessage="관찰일지를 사용하려면 로그인이 필요합니다.">
      {currentView === 'list' ? (
        <SimpleObservationList onNewObservation={handleNewObservation} />
      ) : (
        <SimpleObservationForm 
          onBack={handleBackToList}
          onSuccess={handleSuccess}
        />
      )}
    </AuthenticationGuard>
  );
};

export default Observation;