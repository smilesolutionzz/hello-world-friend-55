import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Subscription 페이지를 TokenSubscription으로 리다이렉트
const Subscription = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/token-subscription', { replace: true });
  }, [navigate]);

  return null;
};

export default Subscription;
