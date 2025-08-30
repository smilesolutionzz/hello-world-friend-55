import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingCart, Star, Gift } from "lucide-react";

interface ProductRecommendationProps {
  category: string;
  severity?: string;
  ageGroup?: string;
  domain?: string;
}

const ProductRecommendation = ({ category, severity, ageGroup, domain }: ProductRecommendationProps) => {
  const getRecommendedProducts = () => {
    // 카테고리별 맞춤 상품 추천 로직
    const baseProducts = [
      {
        id: 1,
        name: "심리상담 전문서적 세트",
        description: "전문가가 추천하는 심리건강 관리 도서",
        price: "29,000원",
        originalPrice: "35,000원",
        image: "/placeholder.svg",
        rating: 4.8,
        category: ["depression", "anxiety", "adult", "all"]
      },
      {
        id: 2,
        name: "명상 및 마음챙김 키트",
        description: "스트레스 해소와 정서적 안정을 위한 명상 도구",
        price: "45,000원",
        originalPrice: "55,000원",
        image: "/placeholder.svg",
        rating: 4.6,
        category: ["anxiety", "stress", "meditation", "all"]
      },
      {
        id: 3,
        name: "아동발달 교육완구 세트",
        description: "연령별 맞춤 발달 촉진 교육용 완구",
        price: "68,000원",
        originalPrice: "85,000원",
        image: "/placeholder.svg",
        rating: 4.9,
        category: ["child", "development", "education"]
      },
      {
        id: 4,
        name: "집중력 향상 브레인 트레이닝 보드게임",
        description: "ADHD 아동을 위한 집중력 개선 게임",
        price: "32,000원",
        originalPrice: "40,000원",
        image: "/placeholder.svg",
        rating: 4.7,
        category: ["adhd", "concentration", "child"]
      },
      {
        id: 5,
        name: "감정조절 및 소통 카드 게임",
        description: "가족 관계 개선과 감정 표현 능력 향상",
        price: "25,000원",
        originalPrice: "30,000원",
        image: "/placeholder.svg",
        rating: 4.5,
        category: ["family", "communication", "emotion"]
      },
      {
        id: 6,
        name: "수면의 질 개선 아로마 테라피 세트",
        description: "우울감과 불안감 완화를 위한 천연 아로마",
        price: "38,000원",
        originalPrice: "48,000원",
        image: "/placeholder.svg",
        rating: 4.4,
        category: ["depression", "sleep", "aromatherapy"]
      }
    ];

    // 카테고리와 심각도에 따른 필터링
    let filteredProducts = baseProducts.filter(product => {
      if (category === "adhd") return product.category.includes("adhd") || product.category.includes("concentration");
      if (category === "depression") return product.category.includes("depression") || product.category.includes("meditation");
      if (category === "anxiety") return product.category.includes("anxiety") || product.category.includes("meditation");
      if (category === "adult") return product.category.includes("adult") || product.category.includes("all");
      if (category === "child") return product.category.includes("child") || product.category.includes("development");
      if (domain === "child_development") return product.category.includes("child") || product.category.includes("development");
      if (domain === "family") return product.category.includes("family") || product.category.includes("communication");
      return product.category.includes("all");
    });

    // 심각도가 높으면 더 전문적인 제품 우선 추천
    if (severity === "심한 우울" || severity === "심각한 수준" || severity === "심각한 증상") {
      filteredProducts = filteredProducts.sort((a, b) => b.rating - a.rating);
    }

    return filteredProducts.slice(0, 3);
  };

  const recommendedProducts = getRecommendedProducts();

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">🛍️ 맞춤 상품 추천</CardTitle>
          <Badge variant="secondary">스마일솔루션 제공</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          검사 결과를 바탕으로 회복과 개선에 도움이 되는 상품을 추천해드립니다.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {recommendedProducts.map((product) => (
            <Card key={product.id} className="border border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100"></div>
                  <div className="relative z-10 text-center">
                    <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground font-medium">상품 이미지</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm line-clamp-2">{product.name}</h4>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{product.rating}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{product.price}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      {product.originalPrice}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open('https://smilesolution.kr/', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    구매하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">🎁 특별 할인 혜택</p>
              <p className="text-xs text-muted-foreground">
                검사 완료 고객 대상 10% 추가 할인 (쿠폰코드: HEALTH10)
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('https://smilesolution.kr/', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              쇼핑몰 방문
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductRecommendation;