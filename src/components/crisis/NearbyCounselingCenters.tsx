import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Building2,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface CounselingCenter {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  region: string;
  type: string;
  available24h: boolean;
  distance?: number | null;
}

interface Props {
  isYouth?: boolean;
  crisisLevel?: 'critical' | 'high' | 'medium' | 'low';
}

export const NearbyCounselingCenters = ({ isYouth = true, crisisLevel }: Props) => {
  const { toast } = useToast();
  const [centers, setCenters] = useState<CounselingCenter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  // 위치 가져오기
  const getUserLocation = () => {
    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  };

  // 상담센터 검색
  const searchCenters = async () => {
    setIsLoading(true);
    try {
      const location = await getUserLocation();
      setUserLocation(location);

      const { data, error } = await supabase.functions.invoke('nearby-counseling-centers', {
        body: {
          latitude: location?.lat,
          longitude: location?.lng,
          radius: 50,
          isYouth,
          limit: 10
        }
      });

      if (error) throw error;

      if (data?.success) {
        setCenters(data.nearbyCenters || []);
        setEmergencyContacts(data.emergencyContacts || []);
      }
    } catch (error) {
      console.error('[NearbyCounselingCenters] Error:', error);
      toast({
        title: '검색 오류',
        description: '상담센터 정보를 가져오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchCenters();
  }, [isYouth]);

  const openNavigation = (center: CounselingCenter) => {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(center.name)},${center.lat},${center.lng}`;
    window.open(url, '_blank');
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mental_health: '정신건강복지센터',
      suicide_prevention: '자살예방센터',
      youth: '청소년상담센터',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 긴급 연락처 (위기 상황) */}
      {(crisisLevel === 'critical' || crisisLevel === 'high') && emergencyContacts.length > 0 && (
        <Card className="p-4 border-red-300 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-700 dark:text-red-300">긴급 연락처</h3>
          </div>
          <div className="grid gap-2">
            {emergencyContacts.slice(0, 3).map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-background rounded">
                <div>
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open(`tel:${contact.number}`, '_self')}
                  className={contact.priority === 1 ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  {contact.number}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 상담센터 목록 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              {isYouth ? '청소년 상담센터' : '정신건강 상담센터'}
            </h3>
          </div>
          <Button variant="outline" size="sm" onClick={searchCenters} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-1" />
                위치 새로고침
              </>
            )}
          </Button>
        </div>

        {userLocation && (
          <p className="text-sm text-muted-foreground mb-4">
            📍 현재 위치 기반으로 가까운 센터를 찾았습니다
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : centers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>주변 상담센터를 찾을 수 없습니다</p>
            <p className="text-sm mt-1">위치 권한을 허용해주세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {centers.map((center, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{center.name}</h4>
                      {center.available24h && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          24시간
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {center.address}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(center.type)}
                      </Badge>
                      {center.distance && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {center.distance.toFixed(1)}km
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(`tel:${center.phone}`, '_self')}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      전화
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openNavigation(center)}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      길찾기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 플랫폼 내 전문가 연결 */}
      <Card className="p-4 bg-muted/30">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4" />
          긴급 전문가 지원
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-start col-span-2"
            onClick={() => window.open('/expert-hiring?urgent=true', '_self')}
          >
            <Phone className="w-4 h-4 mr-2 text-red-500" />
            긴급 전문가 매칭
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => window.open('/expert-hiring', '_self')}
          >
            <Phone className="w-4 h-4 mr-2 text-blue-500" />
            전문가 상담 신청
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
          >
            <Phone className="w-4 h-4 mr-2 text-green-500" />
            카카오톡 상담
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NearbyCounselingCenters;
