import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const RealtimeConsultation = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // AI 상담 페이지로 리다이렉트
    navigate('/ai-counselor');
  }, [navigate]);

  return null;
};