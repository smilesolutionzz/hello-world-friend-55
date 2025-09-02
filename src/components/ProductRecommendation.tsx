import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingCart, Star, Gift } from "lucide-react";
import childCounselingImage from "@/assets/product-child-counseling.jpg";
import adultCounselingImage from "@/assets/product-adult-counseling.jpg";

interface ProductRecommendationProps {
  category: string;
  severity?: string;
  ageGroup?: string;
  domain?: string;
}

const ProductRecommendation = ({ category, severity, ageGroup, domain }: ProductRecommendationProps) => {
  const getRecommendedProducts = () => {
    // 실제 스마일솔루션 상품 정보
    const actualProducts = [
      {
        id: 1,
        name: "심리상담 패키지 (아동/청소년)",
        description: "아동과 청소년을 위한 전문 심리상담 서비스",
        price: "150,000원",
        originalPrice: "200,000원",
        image: childCounselingImage,
        rating: 4.9,
        category: ["child", "development", "adhd", "counseling"]
      },
      {
        id: 2,
        name: "심리상담 패키지 (성인)",
        description: "흔들리는 지금, 정확한 나를 알아보는 시간",
        price: "150,000원",
        originalPrice: "200,000원",
        image: adultCounselingImage,
        rating: 4.8,
        category: ["adult", "career", "anxiety", "depression", "counseling"]
      },
      {
        id: 3,
        name: "종합 심리분석 패키지",
        description: "전문가 상담과 맞춤형 심리 솔루션 제공",
        price: "120,000원",
        originalPrice: "160,000원",
        image: adultCounselingImage,
        rating: 4.7,
        category: ["all", "comprehensive", "counseling"]
      }
    ];

    // 카테고리와 연령대에 따른 필터링
    let filteredProducts = actualProducts;
    
    if (ageGroup === "child" || category === "child" || domain === "child_development") {
      filteredProducts = actualProducts.filter(product => 
        product.category.includes("child") || product.category.includes("all")
      );
    } else if (ageGroup === "adult" || category === "adult") {
      filteredProducts = actualProducts.filter(product => 
        product.category.includes("adult") || product.category.includes("all")
      );
    }

    return filteredProducts.slice(0, 2);
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
                <div className="aspect-square rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
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
                    onClick={() => {
                      const isChildRelated = product.category.includes("child") || 
                                            product.category.includes("development") || 
                                            product.category.includes("adhd") ||
                                            ageGroup === "child";
                      
                      const url = isChildRelated 
                        ? 'https://smilesolution.kr/product/%EC%8B%AC%EB%A6%AC%EC%83%81%EB%8B%B4-%ED%8C%A8%ED%82%A4%EC%A7%80/29/category/1/display/2/'
                        : 'https://smilesolution.kr/product/%EC%8B%AC%EB%A6%AC%EC%83%81%EB%8B%B4-%ED%8C%A8%ED%82%A4%EC%A7%80-%EC%84%B1%EC%9D%B8/24/category/1/display/3/';
                      
                      window.open(url, '_blank');
                    }}
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