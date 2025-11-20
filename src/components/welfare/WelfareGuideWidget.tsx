import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Phone, Mail, MapPin, Calendar, DollarSign, FileText, Users, Building2 } from "lucide-react";
import { useWelfareServices, WelfareService, GovernmentPolicy, PartnerServiceInfo } from "@/hooks/useWelfareServices";

interface WelfareGuideWidgetProps {
  onServiceSelect?: (serviceInfo: string) => void;
  className?: string;
}

export const WelfareGuideWidget: React.FC<WelfareGuideWidgetProps> = ({ 
  onServiceSelect,
  className = ""
}) => {
  const { 
    welfareServices, 
    policies, 
    partnerServices, 
    loading,
    searchWelfareServices,
    searchPolicies,
    searchPartnerServices
  } = useWelfareServices();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const targetAudiences = [
    '장애인 부모', '영유아 부모', '임산부', '어르신', '청소년', 
    '다문화가족', '한부모가족', '저소득층', '취업준비생'
  ];

  const serviceTypes = [
    '육아지원', '의료지원', '교육지원', '주거지원', '생활지원', 
    '일자리지원', '돌봄서비스', '상담서비스'
  ];

  const handleServiceClick = (service: WelfareService | GovernmentPolicy | PartnerServiceInfo, type: 'welfare' | 'policy' | 'partner') => {
    let serviceInfo = '';
    
    if (type === 'welfare') {
      const welfare = service as WelfareService;
      serviceInfo = `🏛️ **복지서비스: ${welfare.name}**\n\n` +
        `📝 **서비스 내용**\n${welfare.description}\n\n` +
        `👥 **대상**: ${welfare.target_audience.join(', ')}\n` +
        `💰 **지원금액**: ${welfare.benefit_amount}\n` +
        `⏰ **지원기간**: ${welfare.duration}\n\n` +
        `📋 **신청자격**\n${welfare.eligibility_criteria.map(c => `• ${c}`).join('\n')}\n\n` +
        `📄 **필요서류**\n${welfare.required_documents.map(d => `• ${d}`).join('\n')}\n\n` +
        `🔗 **신청방법**\n${welfare.application_process.map(p => `${p}`).join(' → ')}\n\n` +
        `📞 **문의처**: ${welfare.contact_info?.phone || '문의처 정보 없음'}`;
    } else if (type === 'policy') {
      const policy = service as GovernmentPolicy;
      serviceInfo = `🏛️ **정부정책: ${policy.title}**\n\n` +
        `📝 **정책요약**\n${policy.summary}\n\n` +
        `👥 **대상그룹**: ${policy.target_group.join(', ')}\n` +
        `💰 **예산**: ${policy.budget || '미공개'}\n` +
        `🏢 **담당기관**: ${policy.responsible_agency}\n\n` +
        `🔄 **주요변경사항**\n${policy.key_changes.map(c => `• ${c}`).join('\n')}\n\n` +
        `📞 **문의처**: ${policy.contact_info?.phone || '문의처 정보 없음'}`;
    } else {
      const partner = service as PartnerServiceInfo;
      serviceInfo = `🏢 **제휴기관 서비스: ${partner.service_name}**\n\n` +
        `📝 **서비스 내용**\n${partner.service_description}\n\n` +
        `👥 **대상**: ${partner.target_audience.join(', ')}\n` +
        `💰 **비용정보**: ${partner.cost_info}\n` +
        `📍 **서비스지역**: ${partner.coverage_area.join(', ')}\n\n` +
        `✨ **특별혜택**\n${partner.special_benefits.map(b => `• ${b}`).join('\n')}\n\n` +
        `📋 **이용조건**\n${partner.eligibility_requirements.map(r => `• ${r}`).join('\n')}\n\n` +
        `📞 **예약방법**: ${partner.booking_method}\n` +
        `📞 **문의처**: ${partner.contact_info?.phone || '문의처 정보 없음'}`;
    }
    
    if (onServiceSelect) {
      onServiceSelect(serviceInfo);
    }
  };

  const filteredWelfareServices = searchWelfareServices(searchQuery, selectedAudience, selectedType);
  const filteredPolicies = searchPolicies(searchQuery, selectedAudience, selectedType);
  const filteredPartnerServices = searchPartnerServices(searchQuery, selectedAudience);

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            복지서비스 가이드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          복지서비스 가이드
        </CardTitle>
        <CardDescription>
          맞춤형 복지정보와 제휴기관 서비스를 찾아보세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 검색 및 필터 */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="복지서비스, 정책, 제휴기관 서비스 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedAudience} onValueChange={setSelectedAudience}>
              <SelectTrigger>
                <SelectValue placeholder="대상 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {targetAudiences.map(audience => (
                  <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="서비스 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {serviceTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs defaultValue="welfare" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="welfare">복지서비스</TabsTrigger>
            <TabsTrigger value="policies">정부정책</TabsTrigger>
            <TabsTrigger value="partners">제휴기관</TabsTrigger>
          </TabsList>

          <TabsContent value="welfare">
            <ScrollArea className="h-[300px] w-full">
              <div className="space-y-3">
                {filteredWelfareServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    조건에 맞는 복지서비스가 없습니다.
                  </div>
                ) : (
                  filteredWelfareServices.map(service => (
                    <Card 
                      key={service.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleServiceClick(service, 'welfare')}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm">{service.name}</h4>
                            <Badge variant="secondary">{service.service_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {(service.target_audience ?? []).slice(0, 2).join(', ')}
                              {(service.target_audience ?? []).length > 2 && '...'}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {service.benefit_amount}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="policies">
            <ScrollArea className="h-[300px] w-full">
              <div className="space-y-3">
                {filteredPolicies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    조건에 맞는 정부정책이 없습니다.
                  </div>
                ) : (
                  filteredPolicies.map(policy => (
                    <Card 
                      key={policy.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleServiceClick(policy, 'policy')}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm">{policy.title}</h4>
                            <Badge variant="outline">{policy.policy_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {policy.summary}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {(policy.target_group ?? []).slice(0, 2).join(', ')}
                              {(policy.target_group ?? []).length > 2 && '...'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {policy.responsible_agency}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="partners">
            <ScrollArea className="h-[300px] w-full">
              <div className="space-y-3">
                {filteredPartnerServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    조건에 맞는 제휴기관 서비스가 없습니다.
                  </div>
                ) : (
                  filteredPartnerServices.map(service => (
                    <Card 
                      key={service.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleServiceClick(service, 'partner')}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm">{service.service_name}</h4>
                            <Badge variant="secondary">제휴기관</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {service.service_description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {(service.target_audience ?? []).slice(0, 2).join(', ')}
                              {(service.target_audience ?? []).length > 2 && '...'}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {(service.coverage_area ?? []).slice(0, 2).join(', ')}
                              {(service.coverage_area ?? []).length > 2 && '...'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};