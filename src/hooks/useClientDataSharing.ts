import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DataConsent {
  id: string;
  client_user_id: string;
  institution_id: string;
  consent_status: 'active' | 'revoked' | 'expired';
  shared_data_types: string[];
  consent_note: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  institution?: {
    id: string;
    institution_name: string;
    institution_type: string;
    logo_url: string | null;
  };
}

export const DATA_TYPE_OPTIONS = [
  { key: 'assessments', label: '심리검사 결과', description: '모든 심리검사 점수 및 분석 결과' },
  { key: 'observations', label: '관찰일지', description: '행동 관찰 및 AI 분석 기록' },
  { key: 'reports', label: 'AI 리포트', description: '프리미엄 종합 리포트' },
  { key: 'brain_training', label: '두뇌 훈련', description: '인지 훈련 점수 및 추이' },
  { key: 'counseling', label: '상담 기록', description: '금쪽상담소 대화 요약' },
  { key: 'progress', label: '변화 추적', description: '장기 발달 변화 추이 데이터' },
  { key: 'aba', label: 'ABA 7일 트랙 요약', description: '표적행동 빈도·지속·인터벌·ABC 요약 (개인정보 마스킹 후 집계)' },
] as const;

export const useClientDataSharing = () => {
  const { toast } = useToast();
  const [consents, setConsents] = useState<DataConsent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);

  const fetchConsents = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('client_data_consents')
        .select('*')
        .eq('client_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch institution info for each consent
      if (data && data.length > 0) {
        const institutionIds = [...new Set(data.map(c => c.institution_id))];
        const { data: instData } = await supabase
          .from('b2b_partner_institutions')
          .select('id, institution_name, institution_type, logo_url')
          .in('id', institutionIds);

        const enriched = data.map(consent => ({
          ...consent,
          consent_status: consent.consent_status as 'active' | 'revoked' | 'expired',
          institution: instData?.find(i => i.id === consent.institution_id)
        }));
        setConsents(enriched);
      } else {
        setConsents([]);
      }
    } catch (error: any) {
      console.error('동의 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    const { data } = await supabase
      .from('b2b_partner_institutions')
      .select('id, institution_name, institution_type, logo_url, specializations')
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('institution_name');
    
    setInstitutions(data || []);
  };

  const grantConsent = async (params: {
    institutionId: string;
    sharedDataTypes: string[];
    expiresAt?: string;
    note?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from('client_data_consents')
        .upsert({
          client_user_id: user.id,
          institution_id: params.institutionId,
          consent_status: 'active',
          shared_data_types: params.sharedDataTypes,
          expires_at: params.expiresAt || null,
          consent_note: params.note || null,
          revoked_at: null,
        }, { onConflict: 'client_user_id,institution_id' })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '데이터 공유 동의 완료',
        description: '선택한 기관에 데이터 접근 권한이 부여되었습니다.',
      });

      await fetchConsents();
      return data;
    } catch (error: any) {
      toast({
        title: '동의 처리 실패',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const revokeConsent = async (consentId: string) => {
    try {
      const { error } = await supabase
        .from('client_data_consents')
        .update({
          consent_status: 'revoked',
          revoked_at: new Date().toISOString(),
        })
        .eq('id', consentId);

      if (error) throw error;

      toast({
        title: '공유 철회 완료',
        description: '데이터 공유가 중단되었습니다. 기관은 더 이상 데이터에 접근할 수 없습니다.',
      });

      await fetchConsents();
    } catch (error: any) {
      toast({
        title: '철회 실패',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchConsents();
    fetchInstitutions();
  }, []);

  return {
    consents,
    institutions,
    isLoading,
    grantConsent,
    revokeConsent,
    fetchConsents,
  };
};
