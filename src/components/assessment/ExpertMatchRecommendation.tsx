import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Heart, Star, ExternalLink, Sparkles, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Expert {
  id: string;
  full_name: string;
  professional_title: string;
  specializations: string[];
  years_experience: number;
  hourly_rate: number;
  average_rating: number;
  bio: string;
  certifications: string[];
  consultation_methods: string[];
  kakao_link?: string;
  is_available: boolean;
}

interface ExpertMatchRecommendationProps {
  testType: 'depression' | 'anxiety' | 'stress' | 'adhd' | 'autism' | 'child_development' | 'general';
  severity: string;
  ageGroup?: string;
  scores?: {
    total: number;
    average: number;
  };
}

// 검사 유형별 관련 전문 분야 매핑
const testTypeSpecializations: Record<string, string[]> = {
  depression: ['심리상담', '우울증', '정서', '인지치료', '임상심리'],
  anxiety: ['불안', '심리상담', '인지치료', '정서', '임상심리'],
  stress: ['스트레스', '심리상담', '번아웃', '직장스트레스', '정서'],
  adhd: ['ADHD', '행동치료', '인지치료', '아동발달', '행동분석'],
  autism: ['자폐스펙트럼', '발달재활', '행동분석', 'ABA치료', '언어치료'],
  child_development: ['아동발달', '발달재활', '언어치료', '인지치료', '특수체육'],
  general: ['심리상담', '상담', '치료']
};

// 적합도 계산 함수
const calculateMatchScore = (
  expert: Expert, 
  testType: string, 
  severity: string,
  ageGroup?: string
): number => {
  let score = 60; // 기본 점수
  
  const relevantSpecs = testTypeSpecializations[testType] || testTypeSpecializations.general;
  
  // 전문 분야 매칭 (최대 25점)
  const matchingSpecs = expert.specializations?.filter(spec => 
    relevantSpecs.some(rs => spec.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(spec.toLowerCase()))
  ) || [];
  score += Math.min(matchingSpecs.length * 8, 25);
  
  // 경력에 따른 점수 (최대 10점)
  if (expert.years_experience >= 10) score += 10;
  else if (expert.years_experience >= 5) score += 7;
  else if (expert.years_experience >= 3) score += 4;
  
  // 심각도에 따른 경력 보정
  if (severity === '심한 우울' || severity === '고위험' || severity === '심각') {
    if (expert.years_experience >= 10) score += 5;
  }
  
  // 평점에 따른 점수 (최대 5점)
  if (expert.average_rating >= 4.5) score += 5;
  else if (expert.average_rating >= 4.0) score += 3;
  
  return Math.min(score, 98); // 최대 98%
};

export const ExpertMatchRecommendation = ({ 
  testType, 
  severity, 
  ageGroup,
  scores 
}: ExpertMatchRecommendationProps) => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'counseling'>('all');

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const { data, error } = await supabase
          .from('experts')
          .select('*')
          .eq('is_verified', true)
          .eq('is_available', true)
          .limit(10);

        if (error) throw error;

        // 적합도 점수 계산 및 정렬
        const expertsWithScore = (data || []).map(expert => ({
          ...expert,
          matchScore: calculateMatchScore(expert, testType, severity, ageGroup)
        })).sort((a, b) => b.matchScore - a.matchScore);

        setExperts(expertsWithScore.slice(0, 6));
      } catch (error) {
        console.error('Error fetching experts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperts();
  }, [testType, severity, ageGroup]);

  const filteredExperts = filter === 'all' 
    ? experts 
    : experts.filter(e => e.specializations?.some(s => 
        s.includes('상담') || s.includes('심리') || s.includes('치료')
      ));

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (experts.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">당신을 위한 맞춤 전문가 추천</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          검사 결과를 바탕으로 {experts.length}개의 전문가/제휴기관을 추천합니다. 심리상담, 미술치료 등 전문 서비스를 받아보세요.
        </p>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-full"
          >
            전체
          </Button>
          <Button
            variant={filter === 'counseling' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('counseling')}
            className="rounded-full"
          >
            심리상담
          </Button>
        </div>
      </div>

      {/* Expert Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredExperts.map((expert: any) => (
          <Card key={expert.id} className="p-5 hover:shadow-lg transition-shadow">
            {/* Header with type and match score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>전문가</span>
                <Heart className="w-4 h-4 text-pink-400" />
                <span>심리상담</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Sparkles className="w-3 h-3 mr-1" />
                {expert.matchScore}%
              </Badge>
            </div>

            {/* Name and Experience */}
            <div className="mb-3">
              <h4 className="text-lg font-bold text-foreground">{expert.full_name}</h4>
              <p className="text-sm text-muted-foreground">
                {expert.years_experience}년 경력의 검증된 전문가
              </p>
            </div>

            {/* Key Feature */}
            <div className="flex items-center gap-2 text-sm text-primary mb-3">
              <Star className="w-4 h-4 fill-primary" />
              <span>개인별 맞춤 상담 및 치료 프로그램</span>
            </div>

            {/* Match Reason */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-green-800 font-medium">
                🎯 추천 이유
              </p>
              <p className="text-sm text-green-700">
                검사 결과 기반 추천 전문가
              </p>
            </div>

            {/* Specializations */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">전문 분야</p>
              <div className="flex flex-wrap gap-1">
                {expert.specializations?.slice(0, 5).map((spec: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Footer - Price and CTA */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">상담 문의</span>
                <Badge className="bg-primary/10 text-primary">경력 {expert.years_experience}년</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">상담료</p>
                <p className="font-bold text-primary">
                  {expert.hourly_rate > 0 
                    ? `₩${expert.hourly_rate.toLocaleString()}/시간`
                    : '문의'}
                </p>
              </div>
            </div>

            {/* Consultation Button */}
            <Button 
              className="w-full mt-3 bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                if (expert.kakao_link) {
                  window.open(expert.kakao_link, '_blank');
                } else {
                  navigate(`/experts/${expert.id}`);
                }
              }}
            >
              전문가 상담 <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ))}
      </div>

      {/* View More Button */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/experts')}
          className="mt-4"
        >
          <Building2 className="w-4 h-4 mr-2" />
          더 많은 전문가 보기
        </Button>
      </div>
    </div>
  );
};

export default ExpertMatchRecommendation;
