import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientLink {
  id: string;
  institution_id: string;
  client_user_id: string;
  consent_id: string | null;
  client_label: string | null;
  internal_notes: string | null;
  treatment_status: string;
  assigned_therapist: string | null;
  priority: string;
  tags: string[];
  last_viewed_at: string | null;
  created_at: string;
  consent?: {
    consent_status: string;
    shared_data_types: string[];
    expires_at: string | null;
  };
  profile?: {
    display_name: string | null;
  };
}

interface TreatmentReport {
  id: string;
  report_type: string;
  report_title: string;
  html_content: string | null;
  status: string;
  created_at: string;
  client_user_id: string;
}

export const useInstitutionClients = (institutionId?: string) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientLink[]>([]);
  const [reports, setReports] = useState<TreatmentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClients = async () => {
    if (!institutionId) return;
    setIsLoading(true);
    try {
      // Get all consents for this institution
      const { data: consents, error: consentErr } = await supabase
        .from('client_data_consents')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('consent_status', 'active');

      if (consentErr) throw consentErr;

      // Get existing client links
      const { data: links, error: linkErr } = await supabase
        .from('institution_client_links')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (linkErr) throw linkErr;

      // Auto-create links for new consents
      if (consents) {
        for (const consent of consents) {
          const existing = links?.find(l => l.client_user_id === consent.client_user_id);
          if (!existing) {
            await supabase.from('institution_client_links').insert({
              institution_id: institutionId,
              client_user_id: consent.client_user_id,
              consent_id: consent.id,
            });
          }
        }
      }

      // Re-fetch with enriched data
      const { data: enrichedLinks } = await supabase
        .from('institution_client_links')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (enrichedLinks) {
        const clientIds = enrichedLinks.map(l => l.client_user_id);
        
        // Get profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', clientIds);

        // Get consents
        const { data: allConsents } = await supabase
          .from('client_data_consents')
          .select('*')
          .eq('institution_id', institutionId)
          .in('client_user_id', clientIds);

        const enriched: ClientLink[] = enrichedLinks.map(link => ({
          ...link,
          profile: profiles?.find(p => p.user_id === link.client_user_id) 
            ? { display_name: profiles.find(p => p.user_id === link.client_user_id)?.display_name || null }
            : undefined,
          consent: allConsents?.find(c => c.client_user_id === link.client_user_id)
            ? {
                consent_status: allConsents.find(c => c.client_user_id === link.client_user_id)!.consent_status,
                shared_data_types: allConsents.find(c => c.client_user_id === link.client_user_id)!.shared_data_types,
                expires_at: allConsents.find(c => c.client_user_id === link.client_user_id)!.expires_at,
              }
            : undefined,
        }));

        setClients(enriched);
      }
    } catch (error: any) {
      console.error('고객 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientData = async (clientUserId: string, dataTypes: string[]) => {
    if (!institutionId) return null;
    
    // Log access
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('institution_data_access_logs').insert({
        institution_id: institutionId,
        accessed_by: user.id,
        client_user_id: clientUserId,
        access_type: 'view_data',
        data_types_accessed: dataTypes,
      });
    }

    const result: Record<string, any> = {};

    if (dataTypes.includes('assessments')) {
      const { data } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', clientUserId)
        .order('created_at', { ascending: false })
        .limit(20);
      result.assessments = data || [];
    }

    if (dataTypes.includes('observations')) {
      const { data } = await supabase
        .from('observation_logs')
        .select('*')
        .eq('user_id', clientUserId)
        .order('created_at', { ascending: false })
        .limit(20);
      result.observations = data || [];
    }

    if (dataTypes.includes('brain_training')) {
      const { data } = await supabase
        .from('brain_training_sessions')
        .select('*')
        .eq('user_id', clientUserId)
        .order('created_at', { ascending: false })
        .limit(20);
      result.brain_training = data || [];
    }

    if (dataTypes.includes('progress')) {
      const { data } = await (supabase
        .from('timeline_activities')
        .select('*')
        .eq('user_id', clientUserId)
        .order('created_at', { ascending: false })
        .limit(30) as any);
      result.progress = data || [];
    }

    return result;
  };

  const updateClientLink = async (linkId: string, updates: Partial<ClientLink>) => {
    try {
      const { error } = await supabase
        .from('institution_client_links')
        .update({
          client_label: updates.client_label,
          internal_notes: updates.internal_notes,
          treatment_status: updates.treatment_status,
          assigned_therapist: updates.assigned_therapist,
          priority: updates.priority,
          tags: updates.tags,
        })
        .eq('id', linkId);

      if (error) throw error;
      
      toast({ title: '고객 정보 업데이트 완료' });
      await fetchClients();
    } catch (error: any) {
      toast({ title: '업데이트 실패', description: error.message, variant: 'destructive' });
    }
  };

  const fetchReports = async () => {
    if (!institutionId) return;
    const { data } = await supabase
      .from('institution_treatment_reports')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });
    setReports(data || []);
  };

  const generateTreatmentReport = async (params: {
    clientUserId: string;
    reportType: string;
    reportTitle: string;
    clientData: Record<string, any>;
  }) => {
    if (!institutionId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase.functions.invoke('generate-treatment-report', {
        body: {
          institutionId,
          clientUserId: params.clientUserId,
          reportType: params.reportType,
          clientData: params.clientData,
        }
      });

      if (error) throw error;

      // Save report
      const { error: saveErr } = await supabase
        .from('institution_treatment_reports')
        .insert({
          institution_id: institutionId,
          client_user_id: params.clientUserId,
          generated_by: user.id,
          report_type: params.reportType,
          report_title: params.reportTitle,
          html_content: data?.htmlContent || '',
          source_data_summary: params.clientData,
          ai_model_used: 'gemini-3.1-flash',
          status: 'draft',
        });

      if (saveErr) throw saveErr;

      toast({ title: '치료방향 리포트 생성 완료' });
      await fetchReports();
      return data;
    } catch (error: any) {
      toast({ title: '리포트 생성 실패', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  useEffect(() => {
    if (institutionId) {
      fetchClients();
      fetchReports();
    }
  }, [institutionId]);

  return {
    clients,
    reports,
    isLoading,
    fetchClients,
    fetchClientData,
    updateClientLink,
    generateTreatmentReport,
    fetchReports,
  };
};
