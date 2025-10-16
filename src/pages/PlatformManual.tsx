import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, Download, Sparkles, MessageSquare, Users } from "lucide-react";
import ReactMarkdown from 'react-markdown';

const PlatformManual = () => {
  const navigate = useNavigate();
  const [manualContent, setManualContent] = useState('');

  useEffect(() => {
    // Load the manual content
    fetch('/AIHPRO_Manual.md')
      .then(response => response.text())
      .then(text => setManualContent(text))
      .catch(error => console.error('Error loading manual:', error));
  }, []);

  const handleDownload = () => {
    const blob = new Blob([manualContent], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AIHPRO_플랫폼_매뉴얼.md';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="hover:bg-primary/10 transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
                className="bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-primary/20 transition-all"
              >
                <Download className="mr-2 h-4 w-4" />
                매뉴얼 다운로드
              </Button>
            </div>
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
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent leading-tight">
                AIHPRO 플랫폼 메뉴얼
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                데이터로 읽는 마음
                <br />
                <span className="text-primary font-semibold">AI 기반 심리건강 플랫폼</span> 사용 가이드
              </p>
            </div>
          </div>

          {/* Manual Content Card */}
          <Card className="shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm mb-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            
            <CardContent className="relative p-0">
              <div className="p-8 md:p-12 lg:p-16">
                <div className="prose prose-slate prose-lg max-w-none dark:prose-invert
                  prose-headings:scroll-mt-24
                  prose-headings:font-bold
                  
                  prose-h1:text-4xl prose-h1:md:text-5xl 
                  prose-h1:mb-8 prose-h1:mt-16 prose-h1:first:mt-0
                  prose-h1:pb-6 prose-h1:border-b-2 prose-h1:border-gradient-to-r prose-h1:from-primary prose-h1:to-accent
                  prose-h1:bg-gradient-to-r prose-h1:from-primary prose-h1:to-accent prose-h1:bg-clip-text prose-h1:text-transparent
                  
                  prose-h2:text-3xl prose-h2:md:text-4xl
                  prose-h2:mb-6 prose-h2:mt-12
                  prose-h2:text-primary prose-h2:relative
                  prose-h2:pl-6 prose-h2:border-l-4 prose-h2:border-primary/50
                  
                  prose-h3:text-2xl prose-h3:md:text-3xl
                  prose-h3:mb-5 prose-h3:mt-10
                  prose-h3:text-foreground/90 prose-h3:font-semibold
                  
                  prose-h4:text-xl prose-h4:md:text-2xl
                  prose-h4:mb-4 prose-h4:mt-8
                  prose-h4:text-foreground/80
                  
                  prose-p:text-base prose-p:md:text-lg
                  prose-p:leading-8 prose-p:md:leading-9
                  prose-p:mb-6 prose-p:text-foreground/90
                  
                  prose-ul:my-8 prose-ul:space-y-3
                  prose-ol:my-8 prose-ol:space-y-3
                  prose-li:text-foreground/90 prose-li:leading-8 prose-li:text-base prose-li:md:text-lg
                  prose-li:pl-2
                  
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
                  prose-pre:p-6 prose-pre:rounded-xl 
                  prose-pre:border-2 prose-pre:border-border/50
                  prose-pre:shadow-lg
                  
                  prose-blockquote:border-l-4 prose-blockquote:border-primary 
                  prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg
                  prose-blockquote:pl-6 prose-blockquote:pr-6 prose-blockquote:py-4
                  prose-blockquote:italic prose-blockquote:text-muted-foreground
                  prose-blockquote:shadow-sm
                  
                  prose-table:my-8 prose-table:shadow-lg prose-table:rounded-lg prose-table:overflow-hidden
                  prose-thead:bg-muted/80
                  prose-th:bg-muted/80 prose-th:p-4 prose-th:text-left 
                  prose-th:font-bold prose-th:border prose-th:border-border/50
                  prose-th:text-primary
                  prose-td:p-4 prose-td:border prose-td:border-border/30
                  prose-tr:hover:bg-muted/20 prose-tr:transition-colors
                  
                  prose-img:rounded-xl prose-img:shadow-xl prose-img:border-2 prose-img:border-border/50
                  prose-img:my-8
                  
                  prose-hr:border-border/50 prose-hr:my-12
                ">
                  <ReactMarkdown>{manualContent}</ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>

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
