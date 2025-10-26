import { useState } from "react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, ArrowRight, Sparkles, Brain, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";

interface Column {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

const columns: Column[] = [
  {
    id: "1",
    title: "피할 수 없는 AI 시대, 하지만 결국 사람이 포함되고 터치되어야 합니다",
    excerpt: "우리는 지금 거대한 변화의 한가운데 서 있습니다. AI가 모든 것을 대체할 것만 같은 이 시대에, 저는 오히려 더 큰 확신을 갖게 되었습니다. 기술은 도구일 뿐, 진정한 치유와 성장은 '사람'에게서 시작된다는 것을요.",
    category: "비전",
    date: "2025년 10월",
    readTime: "5분",
    featured: true
  },
  {
    id: "2",
    title: "데이터가 쌓이면 보이는 것들 - 초개인화 리포트의 힘",
    excerpt: "AI하이라이트PRO는 단순한 AI 플랫폼이 아닙니다. 여러분의 일상 속 작은 순간들을 기록하고, 그 데이터가 쌓여 초개인화된 종합 리포트로 탄생합니다. 하지만 여기서 멈추지 않습니다. 그 리포트는 반드시 전문가의 검토를 거쳐, 정확한 회복과 예방의 길로 안내됩니다.",
    category: "방법론",
    date: "2025년 10월",
    readTime: "6분"
  },
  {
    id: "3",
    title: "AI는 패턴을 발견하고, 전문가는 마음을 이해합니다",
    excerpt: "매일 수많은 분들이 이 플랫폼에서 자신의 이야기를 기록하고 있습니다. 그 하나하나가 모여 의미 있는 변화를 만들어냅니다. 여러분의 데이터는 단순한 숫자가 아닌, 여러분만의 성장 스토리가 됩니다. AI가 패턴을 발견하고, 전문가가 마음을 이해할 때, 비로소 진정한 변화가 시작됩니다.",
    category: "인사이트",
    date: "2025년 10월",
    readTime: "5분"
  },
  {
    id: "4",
    title: "기술이 사람을 대체하는 것이 아닌, 사람을 더 깊이 이해하고 돕는 도구로",
    excerpt: "우리는 AI 시대를 피할 수 없습니다. 하지만 우리는 선택할 수 있습니다. 기술이 사람을 대체하는 것이 아닌, 사람을 더 깊이 이해하고 돕는 도구로 만들어가는 것을요. 여러분의 여정에 함께할 수 있어 진심으로 감사합니다.",
    category: "비전",
    date: "2025년 10월",
    readTime: "4분"
  }
];

const Column = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  const categories = ["전체", "비전", "인사이트", "방법론", "성장스토리"];

  const filteredColumns = selectedCategory === "전체" 
    ? columns 
    : columns.filter(col => col.category === selectedCategory);

  const featuredColumn = columns.find(col => col.featured);
  const regularColumns = columns.filter(col => !col.featured);

  return (
    <>
      <SEOHead 
        title="창립자 칼럼 - AI하이라이트PRO"
        description="AI와 사람이 함께하는 미래, 데이터 기반 개인화 케어에 대한 창립자의 생각과 비전을 공유합니다."
        keywords="AI심리상담,데이터기반케어,개인화리포트,심리분석,전문가상담,정신건강,AI비전"
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <main className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">매달 업데이트</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              창립자의 칼럼
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI와 사람이 함께 만드는 더 나은 내일,<br />
              진심을 담아 여러분께 전합니다
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
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

          {/* Featured Column */}
          {featuredColumn && selectedCategory === "전체" && (
            <Card className="mb-12 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                    <Badge variant="outline">{featuredColumn.category}</Badge>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                    {featuredColumn.title}
                  </h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {featuredColumn.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featuredColumn.date}
                    </div>
                    <div>· {featuredColumn.readTime} 읽기</div>
                  </div>
                  
                  <Button 
                    size="lg"
                    className="group bg-gradient-to-r from-primary to-primary/80"
                    onClick={() => navigate('/')}
                  >
                    전체 글 읽기
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="hidden md:flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl opacity-20 animate-pulse" />
                    <div className="relative bg-card/50 backdrop-blur-xl rounded-2xl p-8 border border-primary/20">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center space-y-2">
                          <Brain className="w-8 h-8 text-primary mx-auto" />
                          <div className="text-2xl font-bold text-primary">AI</div>
                          <div className="text-xs text-muted-foreground">패턴 발견</div>
                        </div>
                        <div className="text-center space-y-2">
                          <Users className="w-8 h-8 text-secondary mx-auto" />
                          <div className="text-2xl font-bold text-secondary">전문가</div>
                          <div className="text-xs text-muted-foreground">마음 이해</div>
                        </div>
                        <div className="col-span-2 text-center space-y-2 pt-4 border-t border-border">
                          <TrendingUp className="w-10 h-10 text-primary mx-auto" />
                          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            진정한 변화
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Regular Columns Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedCategory === "전체" ? regularColumns : filteredColumns).map((column) => (
              <Card key={column.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="border-primary/30">
                      {column.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {column.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {column.excerpt}
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {column.date}
                    </div>
                    <div>· {column.readTime}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group-hover:text-primary"
                    onClick={() => navigate('/')}
                  >
                    읽기
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="mt-16 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="text-center py-12 space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                여러분의 성장 여정에 함께하고 싶습니다
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AI와 전문가가 함께하는 초개인화 케어,<br />
                지금 바로 시작해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/assessment')}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  무료 체험 시작
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/expert-hiring')}
                  className="border-primary/30"
                >
                  <Users className="w-4 h-4 mr-2" />
                  전문가 상담 받기
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Column;
