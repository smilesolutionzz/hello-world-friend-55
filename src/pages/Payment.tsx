import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Payment 페이지를 구독 페이지로 리다이렉트
const Payment = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/token-subscription', { replace: true });
  }, [navigate]);
  return null;
};

export default Payment;
