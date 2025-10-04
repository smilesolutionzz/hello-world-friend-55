import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, Shield, Heart, Sparkles } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  category: "보험" | "금융" | "건강" | "교육" | "라이프스타일";
  description: string;
  benefit: string;
  monthlyPrice?: string;
  discount?: string;
  partnerLogo?: string;
  ctaText: string;
  ctaUrl: string;
  tags: string[];
  matchScore: number;
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

  const getRecommendedProducts = (): Product[] => {
    const products: Product[] = [];

    // Otrovert 성격 테스트 기반 추천
    if (testType === "otrovert") {
      const personality = testResult?.personality?.type || "";
      
      if (personality.includes("외향")) {
        products.push({
          id: "p1",
          name: "삼성화재 다이렉트 운전자보험",
          category: "보험",
          description: "활동적인 당신을 위한 맞춤형 운전자 보험",
          benefit: "월 1만원대로 운전 중 사고 최대 5천만원 보장",
          monthlyPrice: "₩12,000",
          discount: "첫 3개월 50% 할인",
          ctaText: "무료 상담받기",
          ctaUrl: "https://www.samsungfire.com",
          tags: ["운전자보험", "활동적", "추천"],
          matchScore: 95
        });
      }

      if (personality.includes("내향")) {
        products.push({
          id: "p2",
          name: "KB손해보험 홈케어 보험",
          category: "보험",
          description: "안전한 집에서의 생활을 위한 종합 보장",
          benefit: "가전제품 고장부터 화재까지 올인원 보장",
          monthlyPrice: "₩15,000",
          discount: "온라인 가입 시 20% 할인",
          ctaText: "가입하기",
          ctaUrl: "https://www.kbinsure.co.kr",
          tags: ["홈케어", "안정적", "인기"],
          matchScore: 92
        });
      }

      products.push({
        id: "p3",
        name: "카카오페이 심리상담 구독",
        category: "건강",
        description: "당신의 성격 유형에 맞는 전문 심리상담",
        benefit: "월 4회 화상 상담 + 24시간 챗봇 상담",
        monthlyPrice: "₩49,000",
        discount: "첫 달 무료 체험",
        ctaText: "무료 체험하기",
        ctaUrl: "https://www.kakaopay.com",
        tags: ["심리상담", "멘탈케어", "NEW"],
        matchScore: 88
      });
    }

    // 스트레스/불안 테스트 기반 추천
    if (testType.includes("stress") || testType.includes("anxiety")) {
      const riskLevel = userProfile?.riskLevel || "";

      products.push({
        id: "p4",
        name: "메리츠화재 정신건강 보험",
        category: "보험",
        description: "정신건강 관리가 필요한 당신을 위한 보험",
        benefit: "심리상담 비용 월 최대 30만원 보장",
        monthlyPrice: "₩18,000",
        discount: "신규 가입 20% 할인",
        ctaText: "상담 신청",
        ctaUrl: "https://www.meritzfire.com",
        tags: ["정신건강", "심리상담", "베스트"],
        matchScore: 96
      });

      products.push({
        id: "p5",
        name: "마음챙김 명상 앱 프리미엄",
        category: "건강",
        description: "스트레스 관리를 위한 AI 맞춤형 명상 프로그램",
        benefit: "300개 이상의 명상 콘텐츠 무제한 이용",
        monthlyPrice: "₩9,900",
        discount: "연간 구독 시 40% 할인",
        ctaText: "7일 무료 체험",
        ctaUrl: "https://example.com/meditation",
        tags: ["명상", "스트레스관리", "추천"],
        matchScore: 90
      });
    }

    // 일반 추천 상품 (모든 테스트)
    products.push({
      id: "p6",
      name: "현대해상 다이렉트 실손의료보험",
      category: "보험",
      description: "예상치 못한 의료비 부담 걱정 끝",
      benefit: "입원/통원 의료비 최대 5천만원 보장",
      monthlyPrice: "₩25,000",
      discount: "온라인 가입 시 30% 할인",
      ctaText: "보험료 계산하기",
      ctaUrl: "https://www.hi.co.kr",
      tags: ["실손보험", "필수", "인기"],
      matchScore: 85
    });

    products.push({
      id: "p7",
      name: "토스뱅크 정기예금 특판",
      category: "금융",
      description: "건강한 재무 관리의 시작",
      benefit: "연 4.5% 금리 + 첫 가입 5만원 캐시백",
      monthlyPrice: "무료",
      discount: "신규 고객 한정",
      ctaText: "계좌 개설하기",
      ctaUrl: "https://www.tossbank.com",
      tags: ["저축", "고금리", "신규"],
      matchScore: 82
    });

    return products.sort((a, b) => b.matchScore - a.matchScore);
  };

  const products = getRecommendedProducts();
  const categories = ["전체", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = selectedCategory === "전체" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "보험": return <Shield className="w-4 h-4" />;
      case "건강": return <Heart className="w-4 h-4" />;
      case "금융": return <TrendingUp className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
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
              💎 당신을 위한 맞춤 추천
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              검사 결과를 바탕으로 AI가 선정한 {filteredProducts.length}개의 상품을 추천합니다.
              전문 파트너사와의 제휴를 통해 특별한 혜택을 받아보세요.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((product, index) => (
          <Card 
            key={product.id} 
            className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                {getCategoryIcon(product.category)}
                <Badge variant="secondary">{product.category}</Badge>
                {product.tags.includes("NEW") && (
                  <Badge className="bg-red-500">NEW</Badge>
                )}
                {product.tags.includes("베스트") && (
                  <Badge className="bg-yellow-500">베스트</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">{product.matchScore}% 매칭</span>
              </div>
            </div>

            <h4 className="text-lg font-bold mb-2">{product.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
            
            <div className="bg-primary/5 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-primary">✨ {product.benefit}</p>
            </div>

            <div className="flex items-center justify-between mb-4">
              {product.monthlyPrice !== "무료" ? (
                <div>
                  <p className="text-xs text-muted-foreground">월</p>
                  <p className="text-2xl font-bold">{product.monthlyPrice}</p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-green-600">무료</p>
              )}
              {product.discount && (
                <Badge variant="destructive" className="text-xs">
                  {product.discount}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => window.open(product.ctaUrl, '_blank')}
              >
                {product.ctaText}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex gap-1 mt-3 flex-wrap">
              {product.tags.filter(tag => !["NEW", "베스트"].includes(tag)).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

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
