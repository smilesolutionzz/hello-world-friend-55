import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/highlight/AuthForm';
import { applyPendingAccountType, resolveLandingRoute } from '@/lib/accountTypeRouting';

export default function HighlightAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const readStoredRedirect = (): string | null => {
      const fromQuery = searchParams.get('redirect');
      if (fromQuery && fromQuery.startsWith('/')) return fromQuery;
      try {
        const stored = localStorage.getItem('auth_redirect_after');
        if (stored && stored.startsWith('/')) return stored;
      } catch {}
      return null;
    };

    const go = async (userId: string) => {
      // Apply any pending account_type chosen at signup time
      await applyPendingAccountType(userId);

      // Explicit redirect (deep link or signup-time choice) wins
      const explicit = readStoredRedirect();
      const target = explicit ?? (await resolveLandingRoute(userId));

      try { localStorage.removeItem('auth_redirect_after'); } catch {}
      navigate(target, { replace: true });
    };

    // Already logged in?
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) void go(session.user.id);
    });

    // Listen for new sign-ins
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) void go(session.user.id);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  return <AuthForm />;
}
