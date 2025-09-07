import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Search, MapPin, Filter, X, Star, Clock, Car, Building, Users, ChevronDown } from "lucide-react";

interface FilterState {
  search: string;
  institution_type: string;
  region: string;
  voucher_only: boolean;
  parking_only: boolean;
  accessibility_only: boolean;
  specialization: string;
  rating_filter: number;
  operating_hours: string;
  expert_count: string;
}

interface InstitutionFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultsCount: number;
}

export function InstitutionFilters({ filters, onFiltersChange, resultsCount }: InstitutionFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      institution_type: 'all',
      region: 'all',
      voucher_only: false,
      parking_only: false,
      accessibility_only: false,
      specialization: 'all',
      rating_filter: 0,
      operating_hours: 'all',
      expert_count: 'all'
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false;
    return value !== 'all' && value !== '' && value !== false;
  }).length;

  return (
    <Card className="sticky top-4 shadow-lg border-0">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">필터</h3>
            {activeFiltersCount > 0 && (
              <Badge className="bg-primary text-white">
                {activeFiltersCount}개 적용
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="text-muted-foreground hover:text-primary"
            >
              <X className="w-4 h-4 mr-1" />
              필터 초기화
            </Button>
          )}
        </div>

        {/* 기관정보 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <Label className="font-semibold text-base">기관정보</Label>
          </div>
          
          {/* 검색 */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">목록 보기</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="기관명을 입력하세요"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 h-11 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* 기관 유형 섹션 */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">기관 유형</Label>
          <div className="space-y-3">
            {['전체', '발달센터', '의료기관', '상담센터', '한의원'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={type}
                  checked={filters.institution_type === 'all' ? type === '전체' : 
                           type === '발달센터' ? filters.institution_type === 'development_center' :
                           type === '의료기관' ? filters.institution_type === 'medical_center' :
                           type === '상담센터' ? filters.institution_type === 'counseling_center' :
                           type === '한의원' ? filters.institution_type === 'oriental_clinic' : false}
                  onCheckedChange={() => {
                    const value = type === '전체' ? 'all' :
                                  type === '발달센터' ? 'development_center' :
                                  type === '의료기관' ? 'medical_center' :
                                  type === '상담센터' ? 'counseling_center' :
                                  type === '한의원' ? 'oriental_clinic' : 'all';
                    updateFilter('institution_type', value);
                  }}
                />
                <Label htmlFor={type} className="text-sm cursor-pointer">{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* 지역 섹션 */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">지역</Label>
          <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
            <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
              <SelectValue placeholder="전체 지역" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectItem value="all">전체 지역</SelectItem>
              <SelectItem value="seoul">서울특별시</SelectItem>
              <SelectItem value="busan">부산광역시</SelectItem>
              <SelectItem value="daegu">대구광역시</SelectItem>
              <SelectItem value="incheon">인천광역시</SelectItem>
              <SelectItem value="gwangju">광주광역시</SelectItem>
              <SelectItem value="daejeon">대전광역시</SelectItem>
              <SelectItem value="ulsan">울산광역시</SelectItem>
              <SelectItem value="sejong">세종특별자치시</SelectItem>
              <SelectItem value="gyeonggi">경기도</SelectItem>
              <SelectItem value="gangwon">강원도</SelectItem>
              <SelectItem value="chungbuk">충청북도</SelectItem>
              <SelectItem value="chungnam">충청남도</SelectItem>
              <SelectItem value="jeonbuk">전라북도</SelectItem>
              <SelectItem value="jeonnam">전라남도</SelectItem>
              <SelectItem value="gyeongbuk">경상북도</SelectItem>
              <SelectItem value="gyeongnam">경상남도</SelectItem>
              <SelectItem value="jeju">제주특별자치도</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-gray-200" />

        {/* 전문분야 섹션 */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">전문분야</Label>
          <Select value={filters.specialization} onValueChange={(value) => updateFilter('specialization', value)}>
            <SelectTrigger className="h-11 bg-gray-50 border-gray-200">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="발달지연">발달지연</SelectItem>
              <SelectItem value="자폐스펙트럼">자폐스펙트럼</SelectItem>
              <SelectItem value="ADHD">ADHD</SelectItem>
              <SelectItem value="언어발달지연">언어발달지연</SelectItem>
              <SelectItem value="감각통합치료">감각통합치료</SelectItem>
              <SelectItem value="학습장애">학습장애</SelectItem>
              <SelectItem value="지적장애">지적장애</SelectItem>
              <SelectItem value="우울증">우울증</SelectItem>
              <SelectItem value="불안장애">불안장애</SelectItem>
              <SelectItem value="트라우마">트라우마</SelectItem>
              <SelectItem value="수면장애">수면장애</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-gray-200" />

        {/* 특성 섹션 */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">특성</Label>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">바우처 승인기관</span>
              </div>
              <Switch
                checked={filters.voucher_only}
                onCheckedChange={(checked) => updateFilter('voucher_only', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">주차 가능</span>
              </div>
              <Switch
                checked={filters.parking_only}
                onCheckedChange={(checked) => updateFilter('parking_only', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">접근성 우수</span>
              </div>
              <Switch
                checked={filters.accessibility_only}
                onCheckedChange={(checked) => updateFilter('accessibility_only', checked)}
              />
            </div>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* 평점 필터 */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">평점</Label>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox 
                  id={`rating-${rating}`}
                  checked={filters.rating_filter === rating}
                  onCheckedChange={() => updateFilter('rating_filter', filters.rating_filter === rating ? 0 : rating)}
                />
                <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center gap-1">
                  {Array.from({ length: rating }, (_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-muted-foreground">이상</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* 운영시간 */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">오픈 / 휴무</Label>
          <div className="space-y-2">
            {['전체', '지금 열림', '24시간', '주말 운영'].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox 
                  id={option}
                  checked={filters.operating_hours === 'all' ? option === '전체' : 
                           option === '지금 열림' ? filters.operating_hours === 'open_now' :
                           option === '24시간' ? filters.operating_hours === '24h' :
                           option === '주말 운영' ? filters.operating_hours === 'weekend' : false}
                  onCheckedChange={() => {
                    const value = option === '전체' ? 'all' :
                                  option === '지금 열림' ? 'open_now' :
                                  option === '24시간' ? '24h' :
                                  option === '주말 운영' ? 'weekend' : 'all';
                    updateFilter('operating_hours', value);
                  }}
                />
                <Label htmlFor={option} className="text-sm cursor-pointer flex items-center gap-1">
                  {option === '지금 열림' && <Clock className="w-3 h-3 text-green-500" />}
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* 전문가 수 */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">전문가 수</Label>
          <div className="space-y-2">
            {['전체', '5명 이상', '10명 이상', '20명 이상'].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox 
                  id={option}
                  checked={filters.expert_count === 'all' ? option === '전체' : 
                           option === '5명 이상' ? filters.expert_count === '5+' :
                           option === '10명 이상' ? filters.expert_count === '10+' :
                           option === '20명 이상' ? filters.expert_count === '20+' : false}
                  onCheckedChange={() => {
                    const value = option === '전체' ? 'all' :
                                  option === '5명 이상' ? '5+' :
                                  option === '10명 이상' ? '10+' :
                                  option === '20명 이상' ? '20+' : 'all';
                    updateFilter('expert_count', value);
                  }}
                />
                <Label htmlFor={option} className="text-sm cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* 결과 개수 */}
        <div className="pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">검색 결과</span>
            </div>
            <Badge className="bg-primary text-white">
              {resultsCount}개 기관
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}