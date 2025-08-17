import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'expert' | 'viewer' | null;

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } else if (data && data.length > 0) {
        setUserRole(data[0].role as UserRole);
      } else {
        // Default role for new users
        setUserRole('viewer');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
    }
    setLoading(false);
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userRole || !requiredRole) return false;
    
    const roleHierarchy = { admin: 3, expert: 2, viewer: 1 };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  const canEdit = (): boolean => {
    return userRole === 'admin' || userRole === 'expert';
  };

  const canInvite = (): boolean => {
    return userRole === 'admin';
  };

  const canViewExpertNotes = (): boolean => {
    return userRole === 'admin' || userRole === 'expert';
  };

  const canWriteExpertNotes = (): boolean => {
    return userRole === 'expert' || userRole === 'admin';
  };

  return {
    userRole,
    loading,
    hasPermission,
    canEdit,
    canInvite,
    canViewExpertNotes,
    canWriteExpertNotes,
    refreshRole: checkUserRole
  };
};