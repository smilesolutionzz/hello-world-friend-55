import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Phone, Users, Star, Clock, Shield, Car, Accessibility, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageGenerator } from "@/components/ai-image/ImageGenerator";

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  address: string;
  phone?: string; // Made optional since contact info is now protected
  email?: string; // Made optional since contact info is now protected
  description: string;
  is_voucher_approved: boolean;
  voucher_types: string[] | null;
  total_experts: number;
  rating: number;
  review_count: number;
  profile_image_url: string;
  services_offered: string[] | null;
  specializations: string[] | null;
  parking_available: boolean;
  accessibility_features: string[] | null;
  operating_hours?: Record<string, string>;
}

interface InstitutionCardProps {
  institution: Institution;
  onViewDetails: (institutionId: string) => void;
  onContactInstitution: (institutionId: string) => void;
}

export function InstitutionCard({ institution, onViewDetails, onContactInstitution }: InstitutionCardProps) {
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

  const getTodayHours = () => {
    if (!institution.operating_hours) {
      return 'closed';
    }
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = days[today];
    return institution.operating_hours[todayKey] || 'closed';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={institution.profile_image_url} 
              alt={institution.name}
              className="w-12 h-12 rounded-lg object-cover border"
            />
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {institution.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {getInstitutionTypeLabel(institution.institution_type)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{institution.rating}</span>
            <span className="text-xs text-muted-foreground">({institution.review_count})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 설명 */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {institution.description}
        </p>

        {/* 위치 및 연락처 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{institution.address}</span>
          </div>
          {institution.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{institution.phone}</span>
            </div>
          )}
        </div>

        {/* 운영시간 */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            오늘: {getTodayHours() === 'closed' ? '휴무' : getTodayHours()}
          </span>
        </div>

        {/* 특징 배지들 */}
        <div className="flex flex-wrap gap-1">
          {institution.is_voucher_approved && (
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              바우처 승인기관
            </Badge>
          )}
          {institution.parking_available && (
            <Badge variant="outline" className="text-xs">
              <Car className="w-3 h-3 mr-1" />
              주차가능
            </Badge>
          )}
          {institution.accessibility_features && institution.accessibility_features.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <Accessibility className="w-3 h-3 mr-1" />
              접근성 우수
            </Badge>
          )}
        </div>

        {/* 전문가 수 */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">전문가 {institution.total_experts}명</span>
        </div>

        {/* 전문 분야 */}
        {institution.specializations && institution.specializations.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">전문분야</p>
            <div className="flex flex-wrap gap-1">
              {institution.specializations.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {institution.specializations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{institution.specializations.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 바우처 종류 */}
        {institution.voucher_types && institution.voucher_types.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">지원 바우처</p>
            <div className="flex flex-wrap gap-1">
              {institution.voucher_types.map((voucher, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {voucher}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(institution.id)}
            className="flex-1"
          >
            상세보기
          </Button>
          <Button 
            size="sm" 
            onClick={() => onContactInstitution(institution.id)}
            className="flex-1"
          >
            제휴 문의
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ImageIcon className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{institution.name} 기관 로고 생성</DialogTitle>
              </DialogHeader>
              <ImageGenerator
                initialPrompt={`${institution.name} 심리상담센터 전문적이고 신뢰감 있는 로고`}
                context={`기관명: ${institution.name}, 전문분야: ${institution.specializations?.join(', ')}`}
                type="institution"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}