import { useState } from "react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { blogPosts } from "@/data/blogPosts";
import blogChildEmotion from "@/assets/blog/blog-child-emotion.jpg";
import blogSeniorBrain from "@/assets/blog/blog-senior-brain.jpg";
import blogParentBurnout from "@/assets/blog/blog-parent-burnout.jpg";

const thumbnailMap: Record<string, string> = {
  "blog-child-emotion.jpg": blogChildEmotion,
  "blog-senior-brain.jpg": blogSeniorBrain,
  "blog-parent-burnout.jpg": blogParentBurnout,
};

const getThumb = (path: string) => {
  const file = path.split("/").pop() || "";
  return thumbnailMap[file] || path;
};

const Column = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const categories = ["전체", ...Array.from(new Set(blogPosts.map((p) => p.category)))];

  const filtered =
    selectedCategory === "전체"
      ? blogPosts
      : blogPosts.filter((p) => p.category === selectedCategory);

  const featured = blogPosts.find((p) => p.featured);
  const rest = filtered.filter((p) => p.id !== featured?.id || selectedCategory !== "전체");

  return (
    <>
      <SEOHead
        title="블로그 | 정신건강·발달 정보 | AIHPro"
        description="아동 정서, 시니어 인지 건강, 스트레스 관리 등 일상에서 바로 활용할 수 있는 정보를 전합니다."
        keywords="정신건강,발달심리,감정발달,치매예방,스트레스,육아,시니어,AIHPro"
        ogType="website"
        canonicalUrl="https://aihpro.app/column"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "AIHPro 블로그",
          description: "정신건강·발달 전문 블로그",
          url: "https://aihpro.app/column",
          publisher: {
            "@type": "Organization",
            name: "AIHumanPro",
          },
        }}
      />

      <div className="min-h-screen bg-background">
        <UnifiedNavigation />

        <main className="max-w-5xl mx-auto px-4 py-10 md:py-16">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
              블로그
            </h1>
            <p className="text-foreground/50 text-lg max-w-xl">
              일상에서 바로 확인하고 적용할 수 있는, 검증된 정보를 전합니다.
            </p>
          </header>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground/60 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured */}
          {featured && selectedCategory === "전체" && (
            <article
              onClick={() => navigate(`/column/${featured.slug}`)}
              className="mb-12 cursor-pointer group"
            >
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden">
                  <img
                    src={getThumb(featured.thumbnail)}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="rounded-full text-xs">
                      추천
                    </Badge>
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {featured.category}
                    </Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-foreground/50 leading-relaxed line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{featured.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-medium text-sm pt-2">
                    읽어보기
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Divider */}
          {featured && selectedCategory === "전체" && (
            <div className="border-t border-border mb-10" />
          )}

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {rest.map((post) => (
              <article
                key={post.id}
                onClick={() => navigate(`/column/${post.slug}`)}
                className="group cursor-pointer"
              >
                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4">
                  <img
                    src={getThumb(post.thumbnail)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {post.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {post.readTime} 읽기
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-foreground/50 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">해당 카테고리의 글이 아직 없습니다.</p>
            </div>
          )}

          {/* CTA */}
          <section className="mt-20 text-center">
            <div className="p-10 rounded-2xl bg-muted/50 border border-border/50">
              <h3 className="text-xl font-bold text-foreground mb-2">
                궁금한 게 있으신가요?
              </h3>
              <p className="text-foreground/50 mb-6 text-sm">
                3분이면 현재 상태를 확인할 수 있습니다
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate("/assessment")}
                  className="rounded-full px-8"
                >
                  무료 체크 시작
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/metaverse-voice")}
                  className="rounded-full px-8"
                >
                  두뇌 트레이닝
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Column;
