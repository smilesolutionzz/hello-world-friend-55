import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { lazy, Suspense } from 'react';
import { defaultRouteFor, readPendingExpertScope, type AccountType } from '@/lib/accountTypeRouting';

const HighlightDashboard = lazy(() => import('./HighlightDashboard'));

const DashboardRouter = () => {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) {
            setAuthed(false);
            setLoading(false);
          }
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!mounted) return;
        setAuthed(true);
        setAccountType((profile?.account_type as AccountType) || 'parent');
      } catch (e) {
        console.error('계정 타입 확인 오류:', e);
        if (mounted) {
          setAuthed(true);
          setAccountType('parent');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!authed) return <Navigate to="/auth" replace />;

  // Parent (B2C consumer) → in-app consumer dashboard
  if (accountType === 'parent') {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
        <HighlightDashboard />
      </Suspense>
    );
  }

  // Therapist / teacher / admin → route to their workspace
  const target = defaultRouteFor(accountType, readPendingExpertScope());
  return <Navigate to={target} replace />;
};

export default DashboardRouter;
