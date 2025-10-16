import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, Sparkles, MessageSquare, Users } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PlatformManual = () => {
  const navigate = useNavigate();
  const [manualContent, setManualContent] = useState('');
  const [sections, setSections] = useState<Array<{ title: string; content: string; id: string }>>([]);

  useEffect(() => {
    // Load the manual content
    fetch('/AIHPRO_Manual.md')
      .then(response => response.text())
      .then(text => {
        setManualContent(text);
        // Parse sections
        const parsedSections = parseManualSections(text);
        setSections(parsedSections);
      })
      .catch(error => console.error('Error loading manual:', error));
  }, []);

  const parseManualSections = (content: string) => {
    const lines = content.split('\n');
    const sections: Array<{ title: string; content: string; id: string }> = [];
    let currentSection: { title: string; content: string; id: string } | null = null;
    
    lines.forEach((line, index) => {
      // Check if line is a main section (## heading)
      if (line.startsWith('## ') && !line.includes('목차')) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        // Start new section
        const title = line.replace('## ', '').trim();
        currentSection = {
          title,
          content: '',
          id: `section-${sections.length}`
        };
      } else if (currentSection && line !== '---') {
        // Add content to current section
        currentSection.content += line + '\n';
      }
    });
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };


  return (
    <>
      <Helmet>
        <title>플랫폼 메뉴얼 - AIHPRO</title>
        <meta name="description" content="AIHPRO 플랫폼 사용자 매뉴얼 - 심리검사, AI 상담, 전문가 서비스 이용 방법" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="hover:bg-primary/10 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative container mx-auto px-4 py-16 max-w-5xl">
          {/* Hero Section */}
          <div className="mb-16 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4 animate-float">
              <BookOpen className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent leading-tight whitespace-nowrap">
                AIHPRO 플랫폼 메뉴얼
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                데이터로 읽는 마음
                <br />
                <span className="text-primary font-semibold">AI 기반 심리건강 플랫폼</span> 사용 가이드
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="shadow-xl border-border/50 bg-card/50 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">📑 목차</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-primary/10 transition-colors group"
                  >
                    <span className="text-primary font-semibold">{index + 1}.</span>
                    <span className="group-hover:text-primary transition-colors">{section.title}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Manual Sections */}
          <Accordion type="multiple" className="space-y-4 mb-16">
            {sections.map((section) => (
              <AccordionItem 
                key={section.id} 
                value={section.id}
                id={section.id}
                className="border-none"
              >
                <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:shadow-xl transition-all">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]]:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {section.title}
                      </h2>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 pb-6 pt-2">
                      <div className="prose prose-slate prose-base max-w-none dark:prose-invert
                        prose-headings:scroll-mt-24
                        prose-headings:font-bold
                        
                        prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                        prose-h1:text-primary
                        
                        prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
                        prose-h2:text-foreground/90
                        
                        prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                        prose-h3:text-foreground/80 prose-h3:font-semibold
                        
                        prose-h4:text-lg prose-h4:mb-3 prose-h4:mt-5
                        prose-h4:text-foreground/70
                        
                        prose-p:text-sm prose-p:md:text-base
                        prose-p:leading-7 prose-p:mb-4 prose-p:text-foreground/90
                        
                        prose-ul:my-4 prose-ul:space-y-2
                        prose-ol:my-4 prose-ol:space-y-2
                        prose-li:text-foreground/90 prose-li:leading-7 prose-li:text-sm prose-li:md:text-base
                        
                        prose-strong:text-primary prose-strong:font-bold prose-strong:bg-primary/5 prose-strong:px-1 prose-strong:rounded
                        
                        prose-a:text-primary prose-a:font-semibold 
                        prose-a:no-underline prose-a:border-b-2 prose-a:border-primary/30
                        hover:prose-a:border-primary hover:prose-a:bg-primary/5
                        prose-a:transition-all prose-a:px-1
                        
                        prose-code:bg-muted/80 prose-code:text-primary 
                        prose-code:px-2 prose-code:py-1 
                        prose-code:rounded-md prose-code:text-sm prose-code:font-mono
                        prose-code:border prose-code:border-border/50
                        
                        prose-pre:bg-muted/50 prose-pre:backdrop-blur-sm
                        prose-pre:p-4 prose-pre:rounded-lg 
                        prose-pre:border prose-pre:border-border/50
                        prose-pre:shadow-md prose-pre:text-sm
                        
                        prose-blockquote:border-l-4 prose-blockquote:border-primary 
                        prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg
                        prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:py-3
                        prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:text-sm
                        
                        prose-table:my-6 prose-table:shadow-md prose-table:rounded-lg prose-table:overflow-hidden prose-table:text-sm
                        prose-thead:bg-muted/80
                        prose-th:bg-muted/80 prose-th:p-3 prose-th:text-left 
                        prose-th:font-bold prose-th:border prose-th:border-border/50
                        prose-th:text-primary
                        prose-td:p-3 prose-td:border prose-td:border-border/30
                        prose-tr:hover:bg-muted/20 prose-tr:transition-colors
                        
                        prose-img:rounded-lg prose-img:shadow-lg prose-img:border prose-img:border-border/50
                        prose-img:my-6
                        
                        prose-hr:border-border/50 prose-hr:my-8
                      ">
                        <ReactMarkdown>{section.content}</ReactMarkdown>
                      </div>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Quick Links Section */}
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                빠른 시작하기
              </h2>
              <p className="text-muted-foreground text-lg">
                AIHPRO의 주요 서비스를 지금 바로 시작해보세요
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:-translate-y-1" 
                onClick={() => navigate('/assessment')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                    심리검사 시작하기
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    다양한 심리검사를 체험하고<br />나의 마음을 이해해보세요
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="group relative overflow-hidden hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300 cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:-translate-y-1" 
                onClick={() => navigate('/ai-counselor')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MessageSquare className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-xl group-hover:text-accent transition-colors">
                    AI 상담사
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    24시간 언제든지<br />무료 AI 상담 서비스 이용
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:-translate-y-1" 
                onClick={() => navigate('/experts')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
                    전문가 상담
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    자격을 갖춘 전문가와<br />1:1 심층 상담 진행
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlatformManual;
