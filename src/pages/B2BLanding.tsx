import React from 'react';
import { useNavigate } from 'react-router-dom';

// B2B 복잡한 요금제 페이지 → PartnerBenefits로 리다이렉트
const B2BLanding = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    navigate('/partner-benefits', { replace: true });
  }, [navigate]);

  return null;
};

export default B2BLanding;
