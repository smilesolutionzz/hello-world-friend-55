import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'expert' | 'user' | 'viewer';

export function useUserRole() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('user');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setRole('user');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Query user_roles table to get actual role
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
        }

        const userRole = (roleData?.role as UserRole) || 'user';
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
      } catch (error) {
        console.error('Role check failed:', error);
        setRole('user');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (checkRole: UserRole) => {
    return role === checkRole;
  };

  const canWriteExpertNotes = () => {
    return role === 'admin' || role === 'expert';
  };

  const canViewExpertNotes = () => {
    return true; // All users can view expert notes
  };

  const canInvite = () => {
    return role === 'admin';
  };

  return {
    loading,
    role,
    userRole: role,
    hasRole,
    isAdmin,
    canWriteExpertNotes,
    canViewExpertNotes,
    canInvite
  };
}