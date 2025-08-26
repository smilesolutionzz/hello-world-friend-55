import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Phone, Star } from "lucide-react";
import { useState } from "react";

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  is_voucher_approved: boolean;
  rating: number;
  review_count: number;
  total_experts: number;
}

interface InstitutionMapProps {
  institutions: Institution[];
  selectedInstitution?: string;
  onInstitutionSelect: (institutionId: string) => void;
}

export function InstitutionMap({ institutions, selectedInstitution, onInstitutionSelect }: InstitutionMapProps) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getInstitutionTypeLabel = (type: string) => {
    switch (type) {
      case 'development_center':
        return '발달센터';
      case 'medical_center':
        return '의료기관';
      case 'counseling_center':
        return '상담센터';
      default:
        return '기타';
    }
  };

  const institutionsWithDistance = institutions.map(institution => {
    let distance = null;
    if (userLocation) {
      distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        institution.latitude,
        institution.longitude
      );
    }
    return { ...institution, distance };
  }).sort((a, b) => {
    if (!a.distance && !b.distance) return 0;
    if (!a.distance) return 1;
    if (!b.distance) return -1;
    return a.distance - b.distance;
  });

  return (
    <div className="space-y-4">
      {/* 위치 기반 정렬 버튼 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">내 위치 기준 정렬</h3>
              <p className="text-sm text-muted-foreground">가까운 기관부터 보기</p>
            </div>
            <Button 
              variant="outline" 
              onClick={getCurrentLocation}
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              내 위치 찾기
            </Button>
          </div>
          {userLocation && (
            <p className="text-xs text-green-600 mt-2">✓ 위치 정보가 설정되었습니다</p>
          )}
        </CardContent>
      </Card>

      {/* 지도 영역 (실제 지도 API 연동 필요) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            기관 위치
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <p className="text-muted-foreground">지도 API 연동 예정</p>
            <p className="text-sm text-muted-foreground ml-2">
              (Kakao Map 또는 Google Maps)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 기관 목록 */}
      <div className="space-y-3">
        {institutionsWithDistance.map(institution => (
          <Card 
            key={institution.id}
            className={`cursor-pointer transition-colors ${
              selectedInstitution === institution.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => onInstitutionSelect(institution.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{institution.name}</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {getInstitutionTypeLabel(institution.institution_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{institution.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{institution.address}</span>
                  {institution.distance && (
                    <Badge variant="outline" className="text-xs">
                      {institution.distance.toFixed(1)}km
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{institution.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  {institution.is_voucher_approved && (
                    <Badge variant="outline" className="text-xs">
                      바우처 승인
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    전문가 {institution.total_experts}명
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}