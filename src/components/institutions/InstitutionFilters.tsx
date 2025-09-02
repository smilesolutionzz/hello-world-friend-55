import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, MapPin, Filter, X } from "lucide-react";

interface FilterState {
  search: string;
  institution_type: string;
  region: string;
  voucher_only: boolean;
  parking_only: boolean;
  accessibility_only: boolean;
  specialization: string;
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
      specialization: 'all'
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false;
    return value !== 'all' && value !== '' && value !== false;
  }).length;

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <h3 className="font-semibold">필터</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-auto p-1 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              초기화
            </Button>
          )}
        </div>

        {/* 검색 */}
        <div className="space-y-2">
          <Label htmlFor="search">기관명 검색</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="기관명을 입력하세요"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 기관 유형 */}
        <div className="space-y-2">
          <Label>기관 유형</Label>
          <Select value={filters.institution_type} onValueChange={(value) => updateFilter('institution_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="development_center">발달센터</SelectItem>
              <SelectItem value="medical_center">의료기관</SelectItem>
              <SelectItem value="counseling_center">상담센터</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 지역 */}
        <div className="space-y-2">
          <Label>지역</Label>
          <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
            <SelectTrigger>
              <SelectValue placeholder="전체 지역" />
            </SelectTrigger>
            <SelectContent>
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

        {/* 전문분야 */}
        <div className="space-y-2">
          <Label>전문분야</Label>
          <Select value={filters.specialization} onValueChange={(value) => updateFilter('specialization', value)}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="자폐스펙트럼">자폐스펙트럼</SelectItem>
              <SelectItem value="ADHD">ADHD</SelectItem>
              <SelectItem value="언어발달지연">언어발달지연</SelectItem>
              <SelectItem value="학습장애">학습장애</SelectItem>
              <SelectItem value="지적장애">지적장애</SelectItem>
              <SelectItem value="우울증">우울증</SelectItem>
              <SelectItem value="불안장애">불안장애</SelectItem>
              <SelectItem value="트라우마">트라우마</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 특성 필터 */}
        <div className="space-y-3">
          <Label>특성</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">바우처 승인기관만</span>
              </div>
              <Switch
                checked={filters.voucher_only}
                onCheckedChange={(checked) => updateFilter('voucher_only', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">주차 가능</span>
              </div>
              <Switch
                checked={filters.parking_only}
                onCheckedChange={(checked) => updateFilter('parking_only', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">접근성 우수</span>
              </div>
              <Switch
                checked={filters.accessibility_only}
                onCheckedChange={(checked) => updateFilter('accessibility_only', checked)}
              />
            </div>
          </div>
        </div>

        {/* 결과 개수 */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            총 <span className="font-medium text-foreground">{resultsCount}</span>개 기관
          </p>
        </div>
      </CardContent>
    </Card>
  );
}