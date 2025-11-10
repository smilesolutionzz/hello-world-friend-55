import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Organization {
  id: string;
  name: string;
  org_type: 'academy' | 'daycare' | 'kindergarten' | 'development_center' | 'none';
  address?: string;
  phone?: string;
  email?: string;
  registration_number?: string;
  admin_user_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  is_active: boolean;
}

export const useOrganization = () => {
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserOrganization();
  }, []);

  const fetchUserOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 먼저 프로필에서 organization_id 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single();

        if (org) {
          setOrganization(org as any);
        }
      }

      // 조직 멤버십도 확인 (나중에 구현될 기능)
      // const { data: member } = await supabase
      //   .from('organization_members')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .eq('is_active', true)
      //   .single();

      // if (member) {
      //   setMembership(member);
      // }

    } catch (error) {
      console.error('조직 정보 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (orgData: {
    name: string;
    org_type: Organization['org_type'];
    address?: string;
    phone?: string;
    email?: string;
    registration_number?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgData.name,
          org_type: orgData.org_type,
          address: orgData.address,
          phone: orgData.phone,
          email: orgData.email,
          registration_number: orgData.registration_number,
          admin_user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // 프로필 업데이트
      await supabase
        .from('profiles')
        .update({ organization_id: data.id })
        .eq('user_id', user.id);

      setOrganization(data as any);
      
      toast({
        title: '조직 생성 완료',
        description: `${orgData.name}이(가) 성공적으로 생성되었습니다.`
      });

      return data;
    } catch (error: any) {
      toast({
        title: '조직 생성 실패',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;

      setOrganization({ ...organization, ...updates } as any);
      
      toast({
        title: '조직 정보 수정 완료',
        description: '조직 정보가 업데이트되었습니다.'
      });
    } catch (error: any) {
      toast({
        title: '조직 정보 수정 실패',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const isOrganizationAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return organization?.admin_user_id === user?.id;
  };

  return {
    loading,
    organization,
    membership,
    createOrganization,
    updateOrganization,
    isOrganizationAdmin,
    refreshOrganization: fetchUserOrganization
  };
};
