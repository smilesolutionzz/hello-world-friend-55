import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstitutionCard } from "@/components/institutions/InstitutionCard";
import { InstitutionFilters } from "@/components/institutions/InstitutionFilters";
import { InstitutionMap } from "@/components/institutions/InstitutionMap";
import { mockInstitutions } from "@/data/mockInstitutions";
import { Building, MapPin, Users, Award, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FilterState {
  search: string;
  institution_type: string;
  region: string;
  voucher_only: boolean;
  parking_only: boolean;
  accessibility_only: boolean;
  specialization: string;
}

export default function Institutions() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState(mockInstitutions);
  const [filteredInstitutions, setFilteredInstitutions] = useState(mockInstitutions);
  const [selectedInstitution, setSelectedInstitution] = useState<string | undefined>();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    institution_type: '',
    region: '',
    voucher_only: false,
    parking_only: false,
    accessibility_only: false,
    specialization: ''
  });

  useEffect(() => {
    let filtered = institutions;

    // 검색 필터
    if (filters.search) {
      filtered = filtered.filter(institution =>
        institution.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        institution.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // 기관 유형 필터
    if (filters.institution_type) {
      filtered = filtered.filter(institution =>
        institution.institution_type === filters.institution_type
      );
    }

    // 지역 필터
    if (filters.region) {
      filtered = filtered.filter(institution =>
        institution.address.toLowerCase().includes(getRegionName(filters.region).toLowerCase())
      );
    }

    // 바우처 필터
    if (filters.voucher_only) {
      filtered = filtered.filter(institution => institution.is_voucher_approved);
    }

    // 주차 필터
    if (filters.parking_only) {
      filtered = filtered.filter(institution => institution.parking_available);
    }

    // 접근성 필터
    if (filters.accessibility_only) {
      filtered = filtered.filter(institution => 
        institution.accessibility_features && institution.accessibility_features.length > 0
      );
    }

    // 전문분야 필터
    if (filters.specialization) {
      filtered = filtered.filter(institution =>
        institution.specializations.includes(filters.specialization)
      );
    }

    setFilteredInstitutions(filtered);
  }, [filters, institutions]);

  const getRegionName = (region: string) => {
    const regionMap: Record<string, string> = {
      'seoul': '서울',
      'busan': '부산',
      'daegu': '대구',
      'incheon': '인천',
      'gwangju': '광주',
      'daejeon': '대전',
      'ulsan': '울산',
      'sejong': '세종',
      'gyeonggi': '경기',
      'gangwon': '강원',
      'chungbuk': '충북',
      'chungnam': '충남',
      'jeonbuk': '전북',
      'jeonnam': '전남',
      'gyeongbuk': '경북',
      'gyeongnam': '경남',
      'jeju': '제주'
    };
    return regionMap[region] || region;
  };

  const handleViewDetails = (institutionId: string) => {
    // 특정 기관은 외부 링크로 연결
    const institution = institutions.find(inst => inst.id === institutionId);
    if (institution) {
      if (institution.name.includes('한정미소발달센터') || institution.name.includes('한점미소발달센터')) {
        window.open('https://naver.me/FgTH9V07', '_blank');
        return;
      }
      if (institution.name.includes('인애한의원') && institution.name.includes('강남점')) {
        window.open('https://blog.naver.com/koreamedicininae', '_blank');
        return;
      }
    }
    
    navigate(`/institutions/${institutionId}`);
  };

  const handleContactInstitution = (institutionId: string) => {
    // 제휴 문의 모달 또는 페이지로 이동
    console.log('제휴 문의:', institutionId);
  };

  const handleInstitutionSelect = (institutionId: string) => {
    setSelectedInstitution(institutionId);
  };

  const totalVoucherInstitutions = institutions.filter(i => i.is_voucher_approved).length;
  const totalExperts = institutions.reduce((sum, i) => sum + i.total_experts, 0);
  const averageRating = (institutions.reduce((sum, i) => sum + i.rating, 0) / institutions.length).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              홈으로
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building className="w-6 h-6" />
                제휴기관 찾기
              </h1>
              <p className="text-muted-foreground">믿을 수 있는 전문기관과 함께하세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Building className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">{institutions.length}</div>
              <p className="text-sm text-muted-foreground">총 제휴기관</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{totalVoucherInstitutions}</div>
              <p className="text-sm text-muted-foreground">바우처 승인기관</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{totalExperts}</div>
              <p className="text-sm text-muted-foreground">총 전문가</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
              <p className="text-sm text-muted-foreground">평균 만족도</p>
            </CardContent>
          </Card>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 필터 사이드바 */}
          <div className="lg:col-span-1">
            <InstitutionFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultsCount={filteredInstitutions.length}
            />
          </div>

          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="list" className="flex-1">
                  목록 보기
                </TabsTrigger>
                <TabsTrigger value="map" className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  지도 보기
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {filteredInstitutions.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                      <p className="text-muted-foreground">다른 조건으로 검색해보세요</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredInstitutions.map(institution => (
                      <InstitutionCard
                        key={institution.id}
                        institution={institution}
                        onViewDetails={handleViewDetails}
                        onContactInstitution={handleContactInstitution}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="map">
                <InstitutionMap
                  institutions={filteredInstitutions}
                  selectedInstitution={selectedInstitution}
                  onInstitutionSelect={handleInstitutionSelect}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}