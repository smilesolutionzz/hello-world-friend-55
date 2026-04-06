import { useParams, useNavigate } from "react-router-dom";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, ArrowRight, User } from "lucide-react";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { blogPosts } from "@/data/blogPosts";
import blogChildEmotion from "@/assets/blog/blog-child-emotion.jpg";
import blogSeniorBrain from "@/assets/blog/blog-senior-brain.jpg";

const thumbnailMap: Record<string, string> = {
  "blog-child-emotion.jpg": blogChildEmotion,
  "blog-senior-brain.jpg": blogSeniorBrain,
};

const getThumb = (path: string) => {
  const file = path.split("/").pop() || "";
  return thumbnailMap[file] || path;
};

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-foreground/60">글을 찾을 수 없습니다</p>
          <Button onClick={() => navigate("/column")}>목록으로</Button>
        </div>
      </div>
    );
  }

  const otherPosts = blogPosts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <>
      <SEOHead
        title={`${post.title} | AIHPro 블로그`}
        description={post.excerpt}
        ogType="article"
        author={post.author}
      />
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />

        <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
          {/* Back */}
          <button
            onClick={() => navigate("/column")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            블로그 목록
          </button>

          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/9]">
            <img
              src={getThumb(post.thumbnail)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="secondary" className="rounded-full">
              {post.category}
            </Badge>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} 읽기
            </span>
          </div>

          {/* Content */}
          <article className="prose prose-lg max-w-none">
            {post.content.split("\n").map((line, idx) => {
              if (!line.trim()) return null;
              if (/^\d+\.\s/.test(line)) {
                return (
                  <h3
                    key={idx}
                    className="text-xl font-bold text-foreground mt-10 mb-3"
                  >
                    {line}
                  </h3>
                );
              }
              if (line.startsWith("·")) {
                return (
                  <li
                    key={idx}
                    className="ml-4 text-foreground/80 leading-relaxed mb-1"
                  >
                    {line.replace("· ", "")}
                  </li>
                );
              }
              if (
                line.startsWith("집에서 해볼") ||
                line.startsWith("부모가 먼저") ||
                line.startsWith("기록해보세요") ||
                line.startsWith("참고 기준") ||
                line.startsWith("가족이 할") ||
                line.startsWith("매일 할 수")
              ) {
                return (
                  <div
                    key={idx}
                    className="bg-primary/5 border-l-4 border-primary px-5 py-3 rounded-r-lg my-4"
                  >
                    <p className="text-foreground/80 leading-relaxed text-base font-medium">
                      {line}
                    </p>
                  </div>
                );
              }
              return (
                <p
                  key={idx}
                  className="text-foreground/80 leading-relaxed mb-4 text-base"
                >
                  {line}
                </p>
              );
            })}
          </article>

          {/* Platform tip card */}
          {post.platformTip && (
            <div className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                이런 방법도 있어요
              </p>
              <h4 className="text-lg font-bold text-foreground mb-2">
                {post.platformTip.title}
              </h4>
              <p className="text-foreground/60 text-sm mb-4">
                {post.platformTip.description}
              </p>
              <Button
                onClick={() => navigate(post.platformTip!.ctaLink)}
                className="rounded-full"
              >
                {post.platformTip.ctaText}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Author */}
          <div className="mt-10 pt-8 border-t border-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              이
            </div>
            <div>
              <p className="font-semibold text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.authorRole}</p>
            </div>
          </div>

          {/* Related posts */}
          {otherPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-lg font-bold text-foreground mb-6">
                다른 글 읽기
              </h3>
              <div className="grid gap-4">
                {otherPosts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/column/${p.slug}`)}
                    className="flex gap-4 p-4 rounded-xl border border-border/50 hover:border-border cursor-pointer transition-all group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={getThumb(p.thumbnail)}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">
                        {p.category}
                      </p>
                      <p className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {p.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="mt-12 text-xs text-muted-foreground/60 text-center">
            본 콘텐츠는 정보 제공 목적이며, 전문 의료 진단을 대체하지 않습니다.
          </p>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
