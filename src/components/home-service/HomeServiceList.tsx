import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, CreditCard, Filter, Search } from 'lucide-react';
import { HomeServiceBookingDialog } from './HomeServiceBookingDialog';
import { useToast } from '@/hooks/use-toast';

interface HomeService {
  id: string;
  service_name: string;
  service_type: string;
  target_age_min: number;
  target_age_max: number;
  session_duration: number;
  price_per_session: number;
  voucher_types_accepted: string[];
  service_area: any;
  max_travel_distance: number;
  description: string;
  institution_id: string;
  institutions: {
    institution_name: string;
    address: string;
    phone: string;
  };
}

interface VoucherType {
  id: string;
  name: string;
  description: string;
  monthly_amount: number;
  session_limit: number;
  age_min: number;
  age_max: number;
}

export const HomeServiceList = () => {
  const [services, setServices] = useState<HomeService[]>([]);
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<HomeService | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('');

  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
    fetchVoucherTypes();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_home_services')
        .select(`
          *,
          institutions (
            institution_name,
            address,
            phone
          )
        `)
        .eq('is_active', true);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "오류",
        description: "서비스 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('voucher_types')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setVoucherTypes(data || []);
    } catch (error) {
      console.error('Error fetching voucher types:', error);
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      therapy: '치료',
      education: '교육',
      development: '발달',
      counseling: '상담',
    };
    return labels[type] || type;
  };

  const getCompatibleVouchers = (service: HomeService) => {
    return voucherTypes.filter(voucher => 
      service.voucher_types_accepted?.includes(voucher.id)
    );
  };

  const filteredServices = services.filter(service => {
    // 검색어 필터
    if (searchTerm && !service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !service.institutions?.institution_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // 서비스 타입 필터
    if (selectedServiceType !== 'all' && service.service_type !== selectedServiceType) {
      return false;
    }

    // 바우처 타입 필터
    if (selectedVoucherType !== 'all' && 
        !service.voucher_types_accepted?.includes(selectedVoucherType)) {
      return false;
    }

    // 연령 필터
    if (ageFilter) {
      const age = parseInt(ageFilter);
      if (age < service.target_age_min || age > service.target_age_max) {
        return false;
      }
    }

    return true;
  });

  const handleBookingClick = (service: HomeService) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* 검색 및 필터 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              검색 및 필터
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="서비스명 또는 기관명 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="서비스 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 유형</SelectItem>
                  <SelectItem value="therapy">치료</SelectItem>
                  <SelectItem value="education">교육</SelectItem>
                  <SelectItem value="development">발달</SelectItem>
                  <SelectItem value="counseling">상담</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedVoucherType} onValueChange={setSelectedVoucherType}>
                <SelectTrigger>
                  <SelectValue placeholder="바우처 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 바우처</SelectItem>
                  {voucherTypes.map((voucher) => (
                    <SelectItem key={voucher.id} value={voucher.id}>
                      {voucher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="아동 연령"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                min="0"
                max="18"
              />
            </div>
          </CardContent>
        </Card>

        {/* 서비스 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const compatibleVouchers = getCompatibleVouchers(service);
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.service_name}</CardTitle>
                      <CardDescription>{service.institutions?.institution_name}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {getServiceTypeLabel(service.service_type)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>세션당 {service.session_duration}분</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>반경 {service.max_travel_distance}km 이내</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">대상연령:</span>
                      <span>{service.target_age_min}세 - {service.target_age_max}세</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>{service.price_per_session?.toLocaleString()}원/회</span>
                    </div>
                  </div>

                  {compatibleVouchers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">사용 가능한 바우처:</p>
                      <div className="flex flex-wrap gap-1">
                        {compatibleVouchers.map((voucher) => (
                          <Badge key={voucher.id} variant="outline" className="text-xs">
                            {voucher.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => handleBookingClick(service)}
                    className="w-full"
                  >
                    예약 신청하기
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              검색 조건에 맞는 서비스가 없습니다.
            </p>
            <p className="text-muted-foreground mt-2">
              필터를 조정하거나 다른 검색어를 사용해보세요.
            </p>
          </div>
        )}
      </div>

      {selectedService && (
        <HomeServiceBookingDialog
          service={selectedService}
          voucherTypes={voucherTypes}
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          onBookingComplete={() => {
            setBookingDialogOpen(false);
            setSelectedService(null);
          }}
        />
      )}
    </>
  );
};