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

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              className="mb-4"
            >
              <Download className="mr-2 h-4 w-4" />
              매뉴얼 다운로드
            </Button>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl font-bold">AIHPRO 플랫폼 메뉴얼</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    데이터로 읽는 마음 - AI 기반 심리건강 플랫폼 사용 가이드
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="p-8 prose prose-slate max-w-none dark:prose-invert
                  prose-headings:font-bold 
                  prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
                  prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:border-b prose-h2:pb-2
                  prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
                  prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-3
                  prose-p:text-base prose-p:leading-7 prose-p:mb-4
                  prose-ul:my-4 prose-ul:ml-6
                  prose-li:mb-2
                  prose-strong:text-primary prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
                  prose-table:border-collapse prose-table:w-full
                  prose-th:border prose-th:p-2 prose-th:bg-muted
                  prose-td:border prose-td:p-2
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                ">
                  <ReactMarkdown>{manualContent}</ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/assessment')}>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">심리검사 시작하기</h3>
                <p className="text-sm text-muted-foreground">다양한 심리검사를 체험해보세요</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/ai-counselor')}>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">AI 상담사</h3>
                <p className="text-sm text-muted-foreground">24시간 무료 AI 상담 서비스</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/experts')}>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">전문가 상담</h3>
                <p className="text-sm text-muted-foreground">자격을 갖춘 전문가와 연결</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlatformManual;
