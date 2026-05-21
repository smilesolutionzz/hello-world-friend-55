import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Printer, FileText, Copy, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadInstitutionPDF, downloadAsHTML, InstitutionPDFOptions } from '@/utils/institutionPdfDownload';
import { sanitizeAIContent } from '@/utils/sanitizeHtml';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  title: string;
  filename: string;
  metadata?: Record<string, any>;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  htmlContent,
  title,
  filename,
  metadata
}: ReportPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handlePDFDownload = async () => {
    setIsDownloading(true);
    try {
      const options: InstitutionPDFOptions = {
        filename,
        title,
        reportType: metadata?.reportType || 'voucher'
      };

      await downloadInstitutionPDF(
        htmlContent,
        options,
        () => {
          toast({
            title: "PDF 다운로드 완료",
            description: "리포트가 PDF로 저장되었습니다.",
          });
        },
        (error) => {
          throw error;
        }
      );
    } catch (error: any) {
      toast({
        title: "PDF 다운로드 실패",
        description: error.message || "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleHTMLDownload = () => {
    downloadAsHTML(htmlContent, filename);
    toast({
      title: "HTML 다운로드 완료",
      description: "리포트가 HTML 파일로 저장되었습니다.",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "인쇄 실패",
        description: "팝업 차단을 해제해주세요.",
        variant: "destructive",
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      toast({
        title: "복사 완료",
        description: "HTML 코드가 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            생성된 리포트를 미리보고 다운로드하세요
          </DialogDescription>
        </DialogHeader>

        {/* 액션 버튼 */}
        <div className="flex flex-wrap gap-2 py-3 border-b">
          <Button
            onClick={handlePDFDownload}
            disabled={isDownloading}
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'PDF 생성 중...' : 'PDF 다운로드'}
          </Button>
          <Button variant="outline" onClick={handleHTMLDownload}>
            <Code className="w-4 h-4 mr-2" />
            HTML 다운로드
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            인쇄
          </Button>
          <Button variant="ghost" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            코드 복사
          </Button>
        </div>

        {/* 탭 콘텐츠 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              미리보기
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              HTML 코드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[60vh] border rounded-lg bg-white">
              <div 
                className="p-6"
                dangerouslySetInnerHTML={{ __html: sanitizeAIContent(htmlContent) }}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="code" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[60vh] border rounded-lg bg-muted/30">
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
                {htmlContent}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* 메타데이터 */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-4">
              {metadata.voucherType && (
                <span>바우처: {metadata.voucherType}</span>
              )}
              {metadata.generatedAt && (
                <span>생성일: {new Date(metadata.generatedAt).toLocaleString('ko-KR')}</span>
              )}
              {metadata.sections && (
                <span>섹션: {metadata.sections.join(', ')}</span>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
