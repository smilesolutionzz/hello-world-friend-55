import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/highlight/AuthForm';

export default function HighlightAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const resolveRedirect = (): string => {
      const fromQuery = searchParams.get('redirect');
      if (fromQuery && fromQuery.startsWith('/')) return fromQuery;
      try {
        const stored = localStorage.getItem('auth_redirect_after');
        if (stored && stored.startsWith('/')) return stored;
      } catch {}
      return '/';
    };

    const go = () => {
      const target = resolveRedirect();
      try { localStorage.removeItem('auth_redirect_after'); } catch {}
      navigate(target, { replace: true });
    };

    // Already logged in?
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) go();
    });

    // Listen for new sign-ins
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) go();
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  return <AuthForm />;
}
