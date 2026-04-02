import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { lazy, Suspense } from 'react';

const HighlightDashboard = lazy(() => import('./HighlightDashboard'));

type AccountType = 'parent' | 'teacher' | 'therapist' | 'admin';

const DashboardRouter = () => {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccountType();
  }, []);

  const checkAccountType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.account_type) {
        setAccountType(profile.account_type as AccountType);
      } else {
        setAccountType('parent');
      }
    } catch (error) {
      console.error('계정 타입 확인 오류:', error);
      setAccountType('parent');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!accountType) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
      <HighlightDashboard />
    </Suspense>
  );
};

export default DashboardRouter;
