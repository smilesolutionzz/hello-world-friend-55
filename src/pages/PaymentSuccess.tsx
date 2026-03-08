import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// 레거시 /payment-success → /payment-complete 리다이렉트
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 기존 쿼리 파라미터를 그대로 전달
    const params = searchParams.toString();
    navigate(`/payment-complete${params ? `?${params}` : ''}`, { replace: true });
  }, [navigate, searchParams]);

  return null;
};

export default PaymentSuccess;
