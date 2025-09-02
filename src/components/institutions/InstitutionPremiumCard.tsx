import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "./PremiumBadge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Star, 
  MapPin, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  TrendingUp,
  Eye,
  Zap
} from "lucide-react";

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  address: string;
  phone?: string;
  rating: number;
  review_count: number;
  specializations?: string[];
  services_offered?: string[];
  voucher_types?: string[];
  operating_hours?: any;
  is_voucher_approved?: boolean;
}

interface PremiumFeatures {
  plan_type: 'basic' | 'standard' | 'premium';
  features: string[];
  priority_listing: boolean;
  featured_badge: boolean;
  analytics_dashboard: boolean;
  custom_profile: boolean;
}

interface InstitutionPremiumCardProps {
  institution: Institution;
  onViewDetails: (institutionId: string) => void;
  onContactInstitution: (institutionId: string) => void;
  isPriority?: boolean;
}

export function InstitutionPremiumCard({ 
  institution, 
  onViewDetails, 
  onContactInstitution,
  isPriority = false
}: InstitutionPremiumCardProps) {
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPremiumFeatures();
  }, [institution.id]);

  const fetchPremiumFeatures = async () => {
    try {
      // 프리미엄 플랜 정보 가져오기
      const { data: planData } = await supabase
        .from('institution_premium_plans')
        .select('plan_type, features, is_active')
        .eq('institution_id', institution.id)
        .eq('is_active', true)
        .single();

      // 프리미엄 기능 정보 가져오기
      const { data: featuresData } = await supabase
        .from('institution_premium_features')
        .select('feature_type, is_enabled, settings')
        .eq('institution_id', institution.id)
        .eq('is_enabled', true);

      if (planData && featuresData) {
        const enabledFeatures = featuresData.map(f => f.feature_type);
        const planType = planData.plan_type as 'basic' | 'standard' | 'premium';
        setPremiumFeatures({
          plan_type: planType,
          features: enabledFeatures,
          priority_listing: enabledFeatures.includes('priority_listing'),
          featured_badge: enabledFeatures.includes('featured_badge'),
          analytics_dashboard: enabledFeatures.includes('analytics_dashboard'),
          custom_profile: enabledFeatures.includes('custom_profile')
        });
      }
    } catch (error) {
      console.error('프리미엄 기능 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPremiumInstitution = premiumFeatures && premiumFeatures.plan_type !== 'basic';
  const hasPriorityListing = premiumFeatures?.priority_listing || isPriority;

  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 hover:shadow-lg',
      hasPriorityListing && 'ring-2 ring-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5',
      isPremiumInstitution && 'border-primary/30'
    )}>
      {/* 우선 노출 표시 */}
      {hasPriorityListing && (
        <div className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>우선 추천 기관</span>
          <TrendingUp className="w-4 h-4 ml-auto" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg">{institution.name}</h3>
              {isPremiumInstitution && (
                <PremiumBadge 
                  planType={premiumFeatures.plan_type}
                  features={premiumFeatures.features}
                  size="sm"
                />
              )}
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{institution.rating}</span>
              <span className="text-xs text-muted-foreground">({institution.review_count})</span>
              {premiumFeatures?.featured_badge && (
                <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-200">
                  <Eye className="w-3 h-3 mr-1" />
                  인기
                </Badge>
              )}
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {institution.institution_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-sm text-muted-foreground">{institution.address}</span>
        </div>

        {/* 전문분야 */}
        {institution.specializations && institution.specializations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-primary">전문분야</h4>
            <div className="flex flex-wrap gap-1">
              {institution.specializations.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {institution.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{institution.specializations.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* 바우처 정보 */}
        {institution.voucher_types && institution.voucher_types.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-secondary">사용가능한 바우처</h4>
            <div className="space-y-1">
              {institution.voucher_types.slice(0, 2).map((voucher, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-700 font-medium">{voucher}</span>
                </div>
              ))}
              {institution.voucher_types.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  외 {institution.voucher_types.length - 2}개
                </div>
              )}
            </div>
          </div>
        )}

        {/* 서비스 */}
        {institution.services_offered && institution.services_offered.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-primary">제공 서비스</h4>
            <div className="space-y-1">
              {institution.services_offered.slice(0, 3).map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                  <span className="text-xs">{service}</span>
                </div>
              ))}
              {institution.services_offered.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  외 {institution.services_offered.length - 3}개 서비스
                </div>
              )}
            </div>
          </div>
        )}

        {/* 연락처 정보 */}
        <div className="pt-3 border-t">
          {institution.phone && (
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs">{institution.phone}</span>
            </div>
          )}
          {institution.operating_hours && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                운영시간: {typeof institution.operating_hours === 'object' 
                  ? institution.operating_hours.monday || '평일 9-18시' 
                  : '평일 9-18시'}
              </span>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="pt-3 space-y-2">
          <Button 
            onClick={() => onViewDetails(institution.id)}
            className={cn(
              'w-full',
              isPremiumInstitution ? 'btn-brand' : ''
            )}
            variant={isPremiumInstitution ? 'default' : 'outline'}
          >
            {isPremiumInstitution ? '상세보기 (프리미엄)' : '기관 상세보기'}
          </Button>
          
          {isPremiumInstitution && (
            <Button 
              onClick={() => onContactInstitution(institution.id)}
              variant="outline"
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              빠른 상담 문의
            </Button>
          )}
        </div>

        {/* 프리미엄 기능 표시 */}
        {isPremiumInstitution && premiumFeatures && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">프리미엄 서비스</div>
            <div className="flex flex-wrap gap-1">
              {premiumFeatures.analytics_dashboard && (
                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                  전문 분석
                </Badge>
              )}
              {premiumFeatures.custom_profile && (
                <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                  맞춤 프로필
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// cn 함수가 없다면 추가
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}