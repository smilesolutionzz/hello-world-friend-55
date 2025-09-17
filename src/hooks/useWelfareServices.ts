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
        setWelfareServices((servicesData as any) || []);
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
        setPolicies((policiesData as any) || []);
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
        setPartnerServices((partnerData as any) || []);
      }

    } catch (error) {
      console.error('복지 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchWelfareServices = (query: string, targetAudience?: string, serviceType?: string) => {
    return welfareServices.filter(service => {
      const matchesQuery = !query || 
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesAudience = !targetAudience || 
        service.target_audience.some(audience => 
          audience.toLowerCase().includes(targetAudience.toLowerCase())
        );
      
      const matchesType = !serviceType || service.service_type === serviceType;
      
      return matchesQuery && matchesAudience && matchesType;
    });
  };

  const searchPolicies = (query: string, targetGroup?: string, policyType?: string) => {
    return policies.filter(policy => {
      const matchesQuery = !query || 
        policy.title.toLowerCase().includes(query.toLowerCase()) ||
        policy.summary.toLowerCase().includes(query.toLowerCase());
      
      const matchesGroup = !targetGroup || 
        policy.target_group.some(group => 
          group.toLowerCase().includes(targetGroup.toLowerCase())
        );
      
      const matchesType = !policyType || policy.policy_type === policyType;
      
      return matchesQuery && matchesGroup && matchesType;
    });
  };

  const searchPartnerServices = (query: string, targetAudience?: string) => {
    return partnerServices.filter(service => {
      const matchesQuery = !query || 
        service.service_name.toLowerCase().includes(query.toLowerCase()) ||
        service.service_description.toLowerCase().includes(query.toLowerCase());
      
      const matchesAudience = !targetAudience || 
        service.target_audience.some(audience => 
          audience.toLowerCase().includes(targetAudience.toLowerCase())
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