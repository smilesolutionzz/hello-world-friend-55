import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokens } from './useTokens';

interface TokenGuardReturn {
  allowed: boolean;
  loading: boolean;
  remainingTokens: number;
}

export const useTokenGuard = (requiredTokens: number = 1): TokenGuardReturn => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { balance, checkTokenAvailability } = useTokens();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokens = async () => {
      try {
        if (!balance) {
          setLoading(false);
          return;
        }

        const hasEnoughTokens = checkTokenAvailability(requiredTokens);
        
        if (!hasEnoughTokens) {
          navigate('/token-subscription');
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (error) {
        console.error('Token check error:', error);
        navigate('/token-subscription');
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkTokens();
  }, [balance, requiredTokens, navigate, checkTokenAvailability]);

  return { 
    allowed, 
    loading, 
    remainingTokens: balance?.current_tokens || 0 
  };
};