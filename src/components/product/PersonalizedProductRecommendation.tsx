import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, Building2, User, Sparkles, Heart, Brain, Palette, Dumbbell } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  id: string;
  name: string;
  type: "institution" | "expert" | "service";
  category: "심리상담" | "미술치료" | "특수체육" | "언어치료" | "작업치료" | "놀이치료";
  description: string;
  benefit: string;
  hourlyRate?: string;
  sessionCount?: string;
  specializations?: string[];
  yearsExperience?: number;
  ctaText: string;
  ctaUrl?: string;
  tags: string[];
  matchScore: number;
  matchReason: string;
}

interface PersonalizedProductRecommendationProps {
  testType: string;
  testResult: any;
  userProfile?: {
    ageGroup?: string;
    riskLevel?: string;
    personality?: string;
  };
}

export const PersonalizedProductRecommendation = ({ 
  testType, 
  testResult,
  userProfile 
}: PersonalizedProductRecommendationProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [testType, testResult]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    const recs: Recommendation[] = [];

    try {
      // 1. 전문가 추천 로드
      const { data: experts } = await supabase
        .from('experts')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true)
        .limit(5);

      // 2. 제휴기관 추천 로드
      const { data: institutions } = await supabase
        .from('partner_institutions')
        .select('*')
        .eq('partnership_status', 'active')
        .limit(3);

      // Otrovert 성격 테스트 기반 매칭
      if (testType === "otrovert") {
        const score = parseFloat(testResult?.score || 5);
        const isIntroverted = score > 6;
        const isExtroverted = score < 4;
        
        // 내향적인 경우 - 1:1 개별 상담 추천
        if (isIntroverted) {
          experts?.forEach((expert, idx) => {
            if (idx < 2 && expert.specializations?.includes('심리상담')) {
              recs.push({
                id: expert.id,
                name: expert.professional_title || '전문가',
                type: "expert",
                category: "심리상담",
                description: `${expert.years_experience}년 경력 전문가`,
                benefit: "1:1 맞춤 심리상담으로 내면의 힘을 키워보세요",
                hourlyRate: expert.hourly_rate ? `₩${expert.hourly_rate?.toLocaleString()}/시간` : undefined,
                specializations: expert.specializations,
                yearsExperience: expert.years_experience,
                ctaText: "상담 신청",
                ctaUrl: `/expert/${expert.id}`,
                tags: ["1:1상담", "심리케어", "검증됨"],
                matchScore: 95,
                matchReason: "내향적 성향에 맞는 개별 심리상담"
              });
            }
          });
        }

        // 외향적인 경우 - 그룹활동 추천
        if (isExtroverted) {
          institutions?.forEach((inst, idx) => {
            if (idx < 2) {
              recs.push({
                id: inst.id,
                name: inst.name,
                type: "institution",
                category: "특수체육",
                description: inst.description || "전문 제휴기관",
                benefit: "그룹 활동을 통한 사회성 향상 프로그램",
                sessionCount: "주 2-3회 그룹 세션",
                ctaText: "기관 정보 보기",
                tags: ["그룹활동", "사회성", "제휴기관"],
                matchScore: 92,
                matchReason: "외향적 성향에 맞는 그룹 활동 프로그램"
              });
            }
          });
        }

        // 균형잡힌 경우 - 다양한 옵션
        if (!isIntroverted && !isExtroverted) {
          experts?.forEach((expert, idx) => {
            if (idx < 1 && expert.specializations?.includes('미술치료')) {
              recs.push({
                id: expert.id,
                name: expert.professional_title || '미술치료사',
                type: "expert",
                category: "미술치료",
                description: `${expert.years_experience}년 경력 미술치료 전문가`,
                benefit: "창의적 표현을 통한 감정 조절 훈련",
                hourlyRate: expert.hourly_rate ? `₩${expert.hourly_rate?.toLocaleString()}/시간` : undefined,
                specializations: expert.specializations,
                yearsExperience: expert.years_experience,
                ctaText: "치료 상담",
                ctaUrl: `/expert/${expert.id}`,
                tags: ["미술치료", "창의성", "전문가"],
                matchScore: 90,
                matchReason: "균형잡힌 성향에 맞는 창의적 치료"
              });
            }
          });
        }
      }

      // 기본 추천 (모든 검사에 공통)
      experts?.slice(0, 3).forEach((expert) => {
        if (!recs.find(r => r.id === expert.id)) {
          const category = expert.specializations?.[0] === '심리상담' ? '심리상담' : 
                         expert.specializations?.[0] === '미술치료' ? '미술치료' : '심리상담';
          recs.push({
            id: expert.id,
            name: expert.professional_title || '전문가',
            type: "expert",
            category: category as any,
            description: `${expert.years_experience}년 경력의 검증된 전문가`,
            benefit: "개인별 맞춤 상담 및 치료 프로그램",
            hourlyRate: expert.hourly_rate ? `₩${expert.hourly_rate?.toLocaleString()}/시간` : undefined,
            specializations: expert.specializations,
            yearsExperience: expert.years_experience,
            ctaText: "전문가 상담",
            ctaUrl: `/expert/${expert.id}`,
            tags: ["전문가", "맞춤상담"],
            matchScore: 85,
            matchReason: "검사 결과 기반 추천 전문가"
          });
        }
      });

      institutions?.forEach((inst) => {
        if (!recs.find(r => r.id === inst.id)) {
          recs.push({
            id: inst.id,
            name: inst.name,
            type: "institution",
            category: "심리상담",
            description: inst.description || "우수 제휴기관",
            benefit: "종합 심리·정서 지원 프로그램",
            sessionCount: "맞춤형 프로그램 운영",
            ctaText: "기관 알아보기",
            tags: ["제휴기관", "심리지원"],
            matchScore: 80,
            matchReason: "종합적인 심리·정서 지원이 필요한 경우"
          });
        }
      });

    } catch (error) {
      console.error('추천 로드 오류:', error);
    }

    setRecommendations(recs.sort((a, b) => b.matchScore - a.matchScore));
    setIsLoading(false);
  };

  const categories = ["전체", ...Array.from(new Set(recommendations.map(r => r.category)))];
  const filteredRecommendations = selectedCategory === "전체" 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "심리상담": return <Heart className="w-4 h-4" />;
      case "미술치료": return <Palette className="w-4 h-4" />;
      case "특수체육": return <Dumbbell className="w-4 h-4" />;
      case "언어치료": return <Brain className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "institution" ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  return (
    <div className="w-full space-y-6 mt-8">
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">
              💎 당신을 위한 맞춤 전문가 추천
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              검사 결과를 바탕으로 {filteredRecommendations.length}개의 전문가·제휴기관을 추천합니다.
              심리상담, 미술치료 등 전문 서비스를 받아보세요.
            </p>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">맞춤 추천을 불러오는 중...</p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">현재 추천할 수 있는 전문가·기관이 없습니다.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecommendations.map((rec) => (
            <Card 
              key={rec.id} 
              className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {getTypeIcon(rec.type)}
                  <Badge variant="secondary">{rec.type === "expert" ? "전문가" : "제휴기관"}</Badge>
                  {getCategoryIcon(rec.category)}
                  <Badge variant="outline">{rec.category}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">{rec.matchScore}%</span>
                </div>
              </div>

              <h4 className="text-lg font-bold mb-2">{rec.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
              
              <div className="bg-primary/5 rounded-lg p-3 mb-4">
                <p className="text-sm font-semibold text-primary">✨ {rec.benefit}</p>
              </div>

              {/* 매칭 이유 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-green-800">🎯 추천 이유</p>
                <p className="text-xs text-green-700 mt-1">{rec.matchReason}</p>
              </div>

              {/* 전문 정보 */}
              {rec.specializations && rec.specializations.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">전문 분야</p>
                  <div className="flex gap-1 flex-wrap">
                    {rec.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 가격 정보 */}
              <div className="flex items-center justify-between mb-4">
                {rec.hourlyRate ? (
                  <div>
                    <p className="text-xs text-muted-foreground">상담료</p>
                    <p className="text-xl font-bold">{rec.hourlyRate}</p>
                  </div>
                ) : rec.sessionCount ? (
                  <div>
                    <p className="text-xs text-muted-foreground">세션</p>
                    <p className="text-sm font-semibold">{rec.sessionCount}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">상담 문의</p>
                  </div>
                )}
                {rec.yearsExperience && (
                  <Badge className="bg-blue-500">
                    경력 {rec.yearsExperience}년
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    if (rec.ctaUrl) {
                      window.location.href = rec.ctaUrl;
                    }
                  }}
                >
                  {rec.ctaText}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="flex gap-1 mt-3 flex-wrap">
                {rec.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 bg-muted/30">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold">🤝 제휴 문의</p>
          <p className="text-xs text-muted-foreground">
            B2B 제휴를 통해 당신의 상품을 추천하고 싶으신가요?
          </p>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/contact'}>
            제휴 제안하기
          </Button>
        </div>
      </Card>
    </div>
  );
};
