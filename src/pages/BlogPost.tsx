import { useParams, useNavigate } from "react-router-dom";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, ArrowRight, User, Check, AlertTriangle, CheckCircle2 } from "lucide-react";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { blogPosts, type InfoGraphic, type InlineCTA } from "@/data/blogPosts";
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

/* ── Infographic Components ── */

const BarChart = ({ title, data }: { title?: string; data: { label: string; value: number; max: number }[] }) => (
  <div className="my-8 p-5 md:p-6 rounded-2xl bg-muted/50 border border-border/50">
    {title && <p className="text-sm font-bold text-foreground mb-4">{title}</p>}
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-foreground/70">{item.label}</span>
            <span className="font-semibold text-foreground">{item.value}{item.max === 100 ? '%' : `개`}</span>
          </div>
          <div className="h-3 bg-background rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
              style={{ width: `${(item.value / item.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
    <p className="text-[10px] text-muted-foreground mt-3">출처: 소아정신건강 현장 데이터 기반 평균치</p>
  </div>
);

const StatRow = ({ title, data }: { title?: string; data: { label: string; value: string; color: string }[] }) => (
  <div className="my-8 p-5 md:p-6 rounded-2xl bg-muted/50 border border-border/50">
    {title && <p className="text-sm font-bold text-foreground mb-4">{title}</p>}
    <div className="grid grid-cols-3 gap-3">
      {data.map((item, i) => (
        <div key={i} className="text-center p-3 rounded-xl bg-background border border-border/30">
          <div className={`text-2xl md:text-3xl font-black ${item.color === 'destructive' ? 'text-destructive' : item.color === 'secondary' ? 'text-secondary-foreground' : 'text-primary'}`}>
            {item.value}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{item.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const Checklist = ({ title, data }: { title?: string; data: string[] }) => (
  <div className="my-8 p-5 md:p-6 rounded-2xl bg-primary/5 border border-primary/20">
    {title && <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" />{title}</p>}
    <div className="space-y-2.5">
      {data.map((item, i) => (
        <label key={i} className="flex items-start gap-3 cursor-pointer group">
          <div className="mt-0.5 w-5 h-5 rounded-md border-2 border-primary/30 flex items-center justify-center group-hover:border-primary transition-colors shrink-0">
            <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-40 transition-opacity" />
          </div>
          <span className="text-sm text-foreground/80 leading-relaxed">{item}</span>
        </label>
      ))}
    </div>
  </div>
);

const ComparisonTable = ({ title, data }: { title?: string; data: { normal: string; warning: string }[] }) => (
  <div className="my-8 p-5 md:p-6 rounded-2xl bg-muted/50 border border-border/50 overflow-hidden">
    {title && <p className="text-sm font-bold text-foreground mb-4">{title}</p>}
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-xs font-semibold text-primary px-3 py-2 bg-primary/10 rounded-lg text-center">✅ 정상 범위</div>
        <div className="text-xs font-semibold text-destructive px-3 py-2 bg-destructive/10 rounded-lg text-center">⚠️ 주의 필요</div>
      </div>
      {data.map((row, i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <div className="text-xs text-foreground/70 p-3 bg-background rounded-lg border border-border/30 leading-relaxed">{row.normal}</div>
          <div className="text-xs text-foreground/70 p-3 bg-background rounded-lg border border-destructive/20 leading-relaxed">{row.warning}</div>
        </div>
      ))}
    </div>
  </div>
);

const renderInfographic = (info: InfoGraphic) => {
  switch (info.type) {
    case 'bar-chart': return <BarChart key={info.title} title={info.title} data={info.data} />;
    case 'stat-row': return <StatRow key={info.title} title={info.title} data={info.data} />;
    case 'checklist': return <Checklist key={info.title} title={info.title} data={info.data} />;
    case 'comparison': return <ComparisonTable key={info.title} title={info.title} data={info.data} />;
    default: return null;
  }
};

const InlineCTACard = ({ cta, onNavigate }: { cta: InlineCTA; onNavigate: (path: string) => void }) => (
  <div className="my-8 p-5 md:p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="text-3xl shrink-0">{cta.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0.5">{cta.label}</Badge>
        </div>
        <p className="font-bold text-foreground text-sm mb-1">{cta.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{cta.description}</p>
      </div>
      <Button
        size="sm"
        onClick={(e) => { e.stopPropagation(); onNavigate(cta.ctaLink); }}
        className="rounded-full shrink-0 text-xs"
      >
        {cta.ctaText}
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </div>
  </div>
);

/* ── Main Component ── */

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

  // Build insertion maps
  const infoMap = new Map<number, InfoGraphic[]>();
  post.infographics?.forEach((ig) => {
    const arr = infoMap.get(ig.insertAfterParagraph) || [];
    arr.push(ig);
    infoMap.set(ig.insertAfterParagraph, arr);
  });

  const ctaMap = new Map<number, InlineCTA[]>();
  post.inlineCTAs?.forEach((cta) => {
    const arr = ctaMap.get(cta.insertAfterParagraph) || [];
    arr.push(cta);
    ctaMap.set(cta.insertAfterParagraph, arr);
  });

  // Parse content into paragraphs
  const lines = post.content.split("\n").filter((l) => l.trim() !== "");

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

          {/* Content with infographics */}
          <article className="prose prose-lg max-w-none">
            {lines.map((line, idx) => {
              const elements: React.ReactNode[] = [];

              // Render the line
              if (/^\d+[\.\)]\s/.test(line)) {
                elements.push(
                  <h3 key={`h-${idx}`} className="text-xl font-bold text-foreground mt-10 mb-3">
                    {line}
                  </h3>
                );
              } else if (line.startsWith("·")) {
                elements.push(
                  <li key={`li-${idx}`} className="ml-4 text-foreground/80 leading-relaxed mb-1">
                    {line.replace("· ", "")}
                  </li>
                );
              } else if (
                line.startsWith("집에서 해볼") ||
                line.startsWith("부모가 먼저") ||
                line.startsWith("기록해보세요") ||
                line.startsWith("참고 기준") ||
                line.startsWith("가족이 할") ||
                line.startsWith("매일 할 수") ||
                line.startsWith("쉽게 말하면")
              ) {
                elements.push(
                  <div key={`tip-${idx}`} className="bg-primary/5 border-l-4 border-primary px-5 py-3 rounded-r-lg my-4">
                    <p className="text-foreground/80 leading-relaxed text-base font-medium">{line}</p>
                  </div>
                );
              } else {
                elements.push(
                  <p key={`p-${idx}`} className="text-foreground/80 leading-relaxed mb-4 text-base">
                    {line}
                  </p>
                );
              }

              // Check for infographics after this paragraph
              const infos = infoMap.get(idx);
              if (infos) {
                infos.forEach((ig) => elements.push(renderInfographic(ig)));
              }

              // Check for inline CTAs after this paragraph
              const ctas = ctaMap.get(idx);
              if (ctas) {
                ctas.forEach((cta) => elements.push(
                  <InlineCTACard key={`cta-${cta.ctaLink}-${idx}`} cta={cta} onNavigate={navigate} />
                ));
              }

              return elements;
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
