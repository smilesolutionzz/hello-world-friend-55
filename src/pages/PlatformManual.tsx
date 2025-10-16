import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet-async';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
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

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4 max-w-6xl">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                매뉴얼 다운로드
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Title Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AIHPRO 플랫폼 메뉴얼</h1>
            <p className="text-xl text-muted-foreground">
              데이터로 읽는 마음 - AI 기반 심리건강 플랫폼 사용 가이드
            </p>
          </div>

          {/* Manual Content */}
          <div className="prose prose-slate prose-lg max-w-none dark:prose-invert
            prose-headings:scroll-mt-20
            prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-primary/20
            prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:text-primary
            prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
            prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6
            prose-p:text-base prose-p:leading-8 prose-p:mb-6 prose-p:text-foreground/90
            prose-ul:my-6 prose-ul:space-y-2
            prose-ol:my-6 prose-ol:space-y-2
            prose-li:text-foreground/90 prose-li:leading-7
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-code:bg-muted prose-code:text-foreground prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-muted prose-pre:p-6 prose-pre:rounded-lg prose-pre:border prose-pre:border-border
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
            prose-table:my-8
            prose-th:bg-muted prose-th:p-4 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-border
            prose-td:p-4 prose-td:border prose-td:border-border
            prose-img:rounded-lg prose-img:shadow-md
          ">
            <ReactMarkdown>{manualContent}</ReactMarkdown>
          </div>

          {/* Quick Links */}
          <div className="mt-16 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-6 text-center">빠른 시작하기</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group" onClick={() => navigate('/assessment')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">심리검사 시작하기</h3>
                  <p className="text-sm text-muted-foreground">다양한 심리검사를 체험해보세요</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group" onClick={() => navigate('/ai-counselor')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">AI 상담사</h3>
                  <p className="text-sm text-muted-foreground">24시간 무료 AI 상담 서비스</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group" onClick={() => navigate('/experts')}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">전문가 상담</h3>
                  <p className="text-sm text-muted-foreground">자격을 갖춘 전문가와 연결</p>
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
