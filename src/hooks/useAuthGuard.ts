import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AuthGuardReturn {
  authenticated: boolean;
  loading: boolean;
  user: any;
}

export const useAuthGuard = (): AuthGuardReturn => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session?.user) {
          navigate('/auth');
          return;
        }

        setUser(session.user);
        setAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth');
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return { authenticated, loading, user };
};