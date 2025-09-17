import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WelfareService {
  id: string;
  name: string;
  description: string;
  target_audience: string[];
  eligibility_criteria: string[];
  application_process: string[];
  required_documents: string[];
  benefit_amount: string;
  duration: string;
  contact_info: any;
  website_url?: string;
  application_deadline?: string;
  service_type: string;
  region?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovernmentPolicy {
  id: string;
  title: string;
  summary: string;
  policy_type: string;
  target_group: string[];
  implementation_date?: string;
  expiry_date?: string;
  budget?: string;
  responsible_agency: string;
  contact_info: any;
  related_links: string[];
  key_changes: string[];
  impact_analysis: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerServiceInfo {
  id: string;
  partner_institution_id: string;
  service_name: string;
  service_description: string;
  target_audience: string[];
  cost_info: string;
  coverage_area: string[];
  availability_schedule: any;
  booking_method: string;
  special_benefits: string[];
  eligibility_requirements: string[];
  contact_info: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useWelfareServices() {
  const [welfareServices, setWelfareServices] = useState<WelfareService[]>([]);
  const [policies, setPolicies] = useState<GovernmentPolicy[]>([]);
  const [partnerServices, setPartnerServices] = useState<PartnerServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWelfareData();
  }, []);

  const fetchWelfareData = async () => {
    try {
      setLoading(true);
      
      // 복지서비스 가져오기 (수동 타입 캐스팅)
      const { data: servicesData, error: servicesError } = await supabase
        .from('welfare_services' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (servicesError) {
        console.error('복지서비스 조회 오류:', servicesError);
      } else {
        const normalizedServices = ((servicesData as any[]) || []).map((row) => ({
          id: row.id,
          name: row.service_name || row.name || '',
          description: row.description || '',
          target_audience: Array.isArray(row.target_audience)
            ? row.target_audience
            : (row.target_group ? [row.target_group] : []),
          eligibility_criteria: Array.isArray(row.eligibility_criteria)
            ? row.eligibility_criteria
            : (row.eligibility_criteria ? [row.eligibility_criteria] : []),
          application_process: Array.isArray(row.application_process)
            ? row.application_process
            : (row.application_method ? [row.application_method] : []),
          required_documents: Array.isArray(row.required_documents)
            ? row.required_documents
            : (row.required_documents ? [row.required_documents] : []),
          benefit_amount: row.benefit_amount || row.benefits || '',
          duration: row.duration || row.service_period || '',
          contact_info: row.contact_info || {},
          website_url: row.website_url || undefined,
          application_deadline: row.application_deadline || undefined,
          service_type: row.service_type || '',
          region: row.region || undefined,
          is_active: row.is_active ?? true,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setWelfareServices(normalizedServices);
      }

      // 정부정책 가져오기 (수동 타입 캐스팅)
      const { data: policiesData, error: policiesError } = await supabase
        .from('government_policies' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (policiesError) {
        console.error('정부정책 조회 오류:', policiesError);
      } else {
        const normalizedPolicies = ((policiesData as any[]) || []).map((row) => ({
          id: row.id,
          title: row.title || row.policy_name || '',
          summary: row.summary || row.policy_details || '',
          policy_type: row.policy_type || '',
          target_group: Array.isArray(row.target_group)
            ? row.target_group
            : (row.target_group ? [row.target_group] : []),
          implementation_date: row.implementation_date || row.application_start_date || row.announcement_date || undefined,
          expiry_date: row.expiry_date || row.application_end_date || undefined,
          budget: row.budget || (row.budget_amount != null ? String(row.budget_amount) : undefined),
          responsible_agency: row.responsible_agency || row.ministry || '',
          contact_info: row.contact_info || {},
          related_links: Array.isArray(row.related_links) ? row.related_links : [],
          key_changes: Array.isArray(row.key_changes) ? row.key_changes : [],
          impact_analysis: row.impact_analysis || {},
          is_active: row.is_active ?? true,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setPolicies(normalizedPolicies);
      }

      // 제휴기관 서비스 가져오기 (수동 타입 캐스팅)
      const { data: partnerData, error: partnerError } = await supabase
        .from('partner_service_info' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (partnerError) {
        console.error('제휴기관 서비스 조회 오류:', partnerError);
      } else {
        const normalizedPartners = ((partnerData as any[]) || []).map((row) => ({
          id: row.id,
          partner_institution_id: row.partner_institution_id || row.institution_id || '',
          service_name: row.service_name || row.name || '',
          service_description: row.service_description || row.description || '',
          target_audience: Array.isArray(row.target_audience)
            ? row.target_audience
            : (row.target_group ? [row.target_group] : []),
          cost_info: row.cost_info || '',
          coverage_area: Array.isArray(row.coverage_area)
            ? row.coverage_area
            : (row.region ? [row.region] : []),
          availability_schedule: row.availability_schedule || {},
          booking_method: row.booking_method || row.contact_info?.website || '',
          special_benefits: Array.isArray(row.special_benefits) ? row.special_benefits : [],
          eligibility_requirements: Array.isArray(row.eligibility_requirements) ? row.eligibility_requirements : [],
          contact_info: row.contact_info || {},
          is_active: row.is_active ?? true,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setPartnerServices(normalizedPartners);
      }

    } catch (error) {
      console.error('복지 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchWelfareServices = (query: string, targetAudience?: string, serviceType?: string) => {
    const q = (query || '').toLowerCase();
    return welfareServices.filter(service => {
      const name = (service.name || '').toLowerCase();
      const desc = (service.description || '').toLowerCase();
      const matchesQuery = !q || name.includes(q) || desc.includes(q);
      
      const audienceArr = service.target_audience || [];
      const matchesAudience = !targetAudience || 
        audienceArr.some(audience => 
          (audience || '').toLowerCase().includes((targetAudience || '').toLowerCase())
        );
      
      const matchesType = !serviceType || (service.service_type || '') === serviceType;
      
      return matchesQuery && matchesAudience && matchesType;
    });
  };

  const searchPolicies = (query: string, targetGroup?: string, policyType?: string) => {
    const q = (query || '').toLowerCase();
    return policies.filter(policy => {
      const title = (policy.title || '').toLowerCase();
      const summary = (policy.summary || '').toLowerCase();
      const matchesQuery = !q || title.includes(q) || summary.includes(q);
      
      const groupArr = policy.target_group || [];
      const matchesGroup = !targetGroup || 
        groupArr.some(group => 
          (group || '').toLowerCase().includes((targetGroup || '').toLowerCase())
        );
      
      const matchesType = !policyType || (policy.policy_type || '') === policyType;
      
      return matchesQuery && matchesGroup && matchesType;
    });
  };

  const searchPartnerServices = (query: string, targetAudience?: string) => {
    const q = (query || '').toLowerCase();
    return partnerServices.filter(service => {
      const name = (service.service_name || '').toLowerCase();
      const desc = (service.service_description || '').toLowerCase();
      const matchesQuery = !q || name.includes(q) || desc.includes(q);
      
      const audienceArr = service.target_audience || [];
      const matchesAudience = !targetAudience || 
        audienceArr.some(audience => 
          (audience || '').toLowerCase().includes((targetAudience || '').toLowerCase())
        );
      
      return matchesQuery && matchesAudience;
    });
  };

  return {
    welfareServices,
    policies,
    partnerServices,
    loading,
    searchWelfareServices,
    searchPolicies,
    searchPartnerServices,
    refreshData: fetchWelfareData
  };
}