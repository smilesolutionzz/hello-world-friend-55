import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, MapPin, Phone, Star, Users, Building2, 
  ExternalLink, Filter, Loader2, Heart, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TherapyInstitution {
  id: string;
  institution_name: string;
  business_type: string;
  quality_grade: string;
  sido: string;
  sigungu: string;
  address?: string;
  phone?: string;
  website_url?: string;
  staff_count: number;
  user_count: number;
  service_type?: string;
  rating?: number;
}

const BUSINESS_TYPES = [
  '전체',
  '장애인활동지원사업',
  '산모신생아건강관리지원', 
  '지역사회서비스투자',
  '가사간병방문지원사업',
  '발달재활서비스',
  '언어발달지원사업',
  '발달장애인부모상담지원',
  '발달장애인 주간활동서비스',
  '발달장애학생 방과후활동서비스',
  '긴급돌봄지원',
  '지역이음바우처',
  '일상돌봄지원',
  '전국민마음투자지원사업',
  '최중증발달장애인 돌봄서비스'
];

const SIDO_LIST = [
  '전체',
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '대전광역시',
  '광주광역시', '울산광역시', '경기도', '강원특별자치도', '충청북도', 
  '충청남도', '경상북도', '경상남도', '전라남도', '전북특별자치도',
  '제주특별자치도', '세종특별자치시'
];

const QUALITY_GRADES = [
  '전체', 'A', 'B', 'C', 'D', 'F', 
  '현장평가 비대상기관', '평가 거부기관', '평가 제외기관', '평가 비대상기관', '-'
];

const TherapyInstitutionSearch = () => {
  const [institutions, setInstitutions] = useState<TherapyInstitution[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    institutionName: '',
    businessType: '전체',
    sido: '전체',
    qualityGrade: '전체',
    staffCountMin: '',
    userCountMin: ''
  });

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('therapy_institutions')
        .select('*')
        .eq('is_public', true);

      // 필터 적용
      if (searchFilters.institutionName.trim()) {
        query = query.ilike('institution_name', `%${searchFilters.institutionName}%`);
      }

      if (searchFilters.businessType !== '전체') {
        query = query.eq('business_type', searchFilters.businessType);
      }

      if (searchFilters.sido !== '전체') {
        query = query.eq('sido', searchFilters.sido);
      }

      if (searchFilters.qualityGrade !== '전체') {
        query = query.eq('quality_grade', searchFilters.qualityGrade);
      }

      if (searchFilters.staffCountMin) {
        query = query.gte('staff_count', parseInt(searchFilters.staffCountMin));
      }

      if (searchFilters.userCountMin) {
        query = query.gte('user_count', parseInt(searchFilters.userCountMin));
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;

      setInstitutions(data || []);
    } catch (error) {
      console.error('Error loading institutions:', error);
      toast.error('기관 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadInstitutions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const getQualityGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">평점 없음</span>;
    
    const stars = Math.round(rating);
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 검색 헤더 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              치료기관 찾기
            </h2>
            <p className="text-muted-foreground">
              사회서비스 전자바우처 제공기관을 검색하세요
            </p>
          </div>
        </div>
      </div>

      {/* 검색 필터 */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Filter className="h-5 w-5 mr-2" />
            검색 조건
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">기관명</Label>
              <Input
                id="institutionName"
                placeholder="기관명을 입력하세요"
                value={searchFilters.institutionName}
                onChange={(e) => handleFilterChange('institutionName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>사업구분</Label>
              <Select 
                value={searchFilters.businessType} 
                onValueChange={(value) => handleFilterChange('businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="사업구분 선택" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>시도</Label>
              <Select 
                value={searchFilters.sido} 
                onValueChange={(value) => handleFilterChange('sido', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="시도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {SIDO_LIST.map((sido) => (
                    <SelectItem key={sido} value={sido}>{sido}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>품질평가</Label>
              <Select 
                value={searchFilters.qualityGrade} 
                onValueChange={(value) => handleFilterChange('qualityGrade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="품질평가 선택" />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffCountMin">최소 직원 수</Label>
              <Input
                id="staffCountMin"
                type="number"
                placeholder="예: 10"
                value={searchFilters.staffCountMin}
                onChange={(e) => handleFilterChange('staffCountMin', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userCountMin">최소 이용자 수</Label>
              <Input
                id="userCountMin"
                type="number"
                placeholder="예: 50"
                value={searchFilters.userCountMin}
                onChange={(e) => handleFilterChange('userCountMin', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  검색하기
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 검색 결과 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            검색 결과 ({institutions.length}건)
          </h3>
          {institutions.length > 0 && (
            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
              총 {institutions.length}개 기관
            </Badge>
          )}
        </div>

        {institutions.length === 0 && !loading && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">
                다른 검색 조건으로 다시 시도해보세요
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {institutions.map((institution) => (
            <Card key={institution.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {institution.institution_name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getQualityGradeColor(institution.quality_grade)}
                      >
                        {institution.quality_grade}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {institution.business_type}
                      </Badge>
                    </div>
                  </div>
                  {renderStars(institution.rating)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                  {institution.sido} {institution.sigungu}
                </div>

                {institution.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-green-500" />
                    {institution.phone}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    <span>직원 {institution.staff_count}명</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    <span>이용자 {institution.user_count}명</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    상세정보
                  </Button>
                  {institution.website_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                      onClick={() => window.open(institution.website_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapyInstitutionSearch;