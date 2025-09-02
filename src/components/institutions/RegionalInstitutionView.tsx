import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstitutionCard } from "./InstitutionCard";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin } from "lucide-react";

interface RegionalInstitutionViewProps {
  institutions: any[];
  onViewDetails: (institutionId: string) => void;
  onContactInstitution: (institutionId: string) => void;
}

export function RegionalInstitutionView({ 
  institutions, 
  onViewDetails, 
  onContactInstitution 
}: RegionalInstitutionViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('seoul');

  // 지역별로 기관을 그룹핑
  const groupByRegion = (institutions: any[]) => {
    const regions = {
      seoul: { name: '서울특별시', institutions: [] as any[] },
      busan: { name: '부산광역시', institutions: [] as any[] },
      daegu: { name: '대구광역시', institutions: [] as any[] },
      incheon: { name: '인천광역시', institutions: [] as any[] },
      gwangju: { name: '광주광역시', institutions: [] as any[] },
      daejeon: { name: '대전광역시', institutions: [] as any[] },
      ulsan: { name: '울산광역시', institutions: [] as any[] },
      sejong: { name: '세종특별자치시', institutions: [] as any[] },
      gyeonggi: { name: '경기도', institutions: [] as any[] },
      gangwon: { name: '강원도', institutions: [] as any[] },
      chungbuk: { name: '충청북도', institutions: [] as any[] },
      chungnam: { name: '충청남도', institutions: [] as any[] },
      jeonbuk: { name: '전라북도', institutions: [] as any[] },
      jeonnam: { name: '전라남도', institutions: [] as any[] },
      gyeongbuk: { name: '경상북도', institutions: [] as any[] },
      gyeongnam: { name: '경상남도', institutions: [] as any[] },
      jeju: { name: '제주특별자치도', institutions: [] as any[] },
    };

    institutions.forEach(institution => {
      const address = institution.address.toLowerCase();
      
      if (address.includes('서울')) {
        regions.seoul.institutions.push(institution);
      } else if (address.includes('부산')) {
        regions.busan.institutions.push(institution);
      } else if (address.includes('대구')) {
        regions.daegu.institutions.push(institution);
      } else if (address.includes('인천')) {
        regions.incheon.institutions.push(institution);
      } else if (address.includes('광주')) {
        regions.gwangju.institutions.push(institution);
      } else if (address.includes('대전')) {
        regions.daejeon.institutions.push(institution);
      } else if (address.includes('울산')) {
        regions.ulsan.institutions.push(institution);
      } else if (address.includes('세종')) {
        regions.sejong.institutions.push(institution);
      } else if (address.includes('경기')) {
        regions.gyeonggi.institutions.push(institution);
      } else if (address.includes('강원')) {
        regions.gangwon.institutions.push(institution);
      } else if (address.includes('충북') || address.includes('충청북')) {
        regions.chungbuk.institutions.push(institution);
      } else if (address.includes('충남') || address.includes('충청남')) {
        regions.chungnam.institutions.push(institution);
      } else if (address.includes('전북') || address.includes('전라북')) {
        regions.jeonbuk.institutions.push(institution);
      } else if (address.includes('전남') || address.includes('전라남')) {
        regions.jeonnam.institutions.push(institution);
      } else if (address.includes('경북') || address.includes('경상북')) {
        regions.gyeongbuk.institutions.push(institution);
      } else if (address.includes('경남') || address.includes('경상남')) {
        regions.gyeongnam.institutions.push(institution);
      } else if (address.includes('제주')) {
        regions.jeju.institutions.push(institution);
      } else {
        // 기본적으로 경기도로 분류
        regions.gyeonggi.institutions.push(institution);
      }
    });

    return regions;
  };

  const groupedInstitutions = groupByRegion(institutions);
  const regionsWithInstitutions = Object.entries(groupedInstitutions).filter(
    ([_, data]) => data.institutions.length > 0
  );

  if (regionsWithInstitutions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
          <p className="text-muted-foreground">다른 조건으로 검색해보세요</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 지역별 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {regionsWithInstitutions.map(([regionKey, regionData]) => (
          <Card 
            key={regionKey}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRegion === regionKey ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedRegion(regionKey)}
          >
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 mx-auto text-primary mb-2" />
              <h3 className="font-medium text-sm mb-1">{regionData.name}</h3>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {regionData.institutions.length}개
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {regionData.institutions.filter(i => i.is_voucher_approved).length}바우처
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 선택된 지역의 기관 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {groupedInstitutions[selectedRegion as keyof typeof groupedInstitutions]?.name} 제휴기관
            <Badge variant="secondary">
              {groupedInstitutions[selectedRegion as keyof typeof groupedInstitutions]?.institutions.length}개
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {groupedInstitutions[selectedRegion as keyof typeof groupedInstitutions]?.institutions.map(institution => (
              <InstitutionCard
                key={institution.id}
                institution={institution}
                onViewDetails={onViewDetails}
                onContactInstitution={onContactInstitution}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}