import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionGuardReturn {
  allowed: boolean;
  loading: boolean;
  tier: string | null;
}

export const useSubscriptionGuard = (): SubscriptionGuardReturn => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session?.user) {
          navigate('/auth');
          return;
        }

        // Check subscription tier from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          navigate('/subscription');
          return;
        }

        const userTier = profile?.subscription_tier || 'free';
        setTier(userTier);

        if (userTier !== 'premium') {
          navigate('/subscription');
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (error) {
        console.error('Subscription check error:', error);
        navigate('/subscription');
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [navigate]);

  return { allowed, loading, tier };
};