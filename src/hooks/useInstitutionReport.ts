import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { downloadInstitutionPDF, downloadAsHTML, InstitutionPDFOptions } from '@/utils/institutionPdfDownload';

interface ReportGenerationOptions {
  reportType: 'voucher' | 'member' | 'dashboard' | 'period';
  voucherType?: string;
  memberId?: string;
  institutionId?: string;
  periodStart?: string;
  periodEnd?: string;
  additionalData?: Record<string, any>;
}

interface GeneratedReport {
  id: string;
  htmlContent: string;
  metadata: Record<string, any>;
  generatedAt: string;
}

export const useInstitutionReport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const { toast } = useToast();

  /**
   * 바우처 일지 생성
   */
  const generateVoucherReport = async (
    voucherType: string,
    sessionData: any[],
    clientInfo: any,
    periodStart: string,
    periodEnd: string,
    customNotes?: string
  ) => {
    try {
      setIsGenerating(true);
      setProgress(10);

      const response = await supabase.functions.invoke('generate-voucher-report', {
        body: {
          voucherType,
          sessionData,
          clientInfo,
          periodStart,
          periodEnd,
          customNotes
        }
      });

      setProgress(80);

      if (response.error) {
        throw new Error(response.error.message || '바우처 일지 생성 실패');
      }

      if (!response.data?.htmlContent) {
        throw new Error('일지 내용이 생성되지 않았습니다.');
      }

      setProgress(100);

      const report: GeneratedReport = {
        id: `voucher_${Date.now()}`,
        htmlContent: response.data.htmlContent,
        metadata: response.data.metadata || {},
        generatedAt: new Date().toISOString()
      };

      setGeneratedReport(report);

      toast({
        title: "바우처 일지 생성 완료",
        description: `${voucherType} 양식에 맞는 일지가 생성되었습니다.`,
      });

      return report;
    } catch (error: any) {
      console.error('바우처 일지 생성 오류:', error);
      toast({
        title: "생성 실패",
        description: error.message || '일지 생성 중 오류가 발생했습니다.',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  /**
   * 회원별 종합 리포트 생성
   */
  const generateMemberReport = async (
    memberData: any,
    assessmentHistory: any[],
    sessionHistory: any[],
    periodStart?: string,
    periodEnd?: string
  ) => {
    try {
      setIsGenerating(true);
      setProgress(10);

      const response = await supabase.functions.invoke('generate-institution-report', {
        body: {
          reportType: 'member',
          memberData,
          assessmentHistory,
          sessionHistory,
          periodStart,
          periodEnd
        }
      });

      setProgress(80);

      if (response.error) {
        throw new Error(response.error.message || '회원 리포트 생성 실패');
      }

      if (!response.data?.htmlContent) {
        throw new Error('리포트 내용이 생성되지 않았습니다.');
      }

      setProgress(100);

      const report: GeneratedReport = {
        id: `member_${Date.now()}`,
        htmlContent: response.data.htmlContent,
        metadata: response.data.metadata || {},
        generatedAt: new Date().toISOString()
      };

      setGeneratedReport(report);

      toast({
        title: "종합 리포트 생성 완료",
        description: `${memberData.name || '회원'} 종합 발달 리포트가 생성되었습니다.`,
      });

      return report;
    } catch (error: any) {
      console.error('회원 리포트 생성 오류:', error);
      toast({
        title: "생성 실패",
        description: error.message || '리포트 생성 중 오류가 발생했습니다.',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  /**
   * 기관 대시보드 리포트 생성
   */
  const generateDashboardReport = async (
    institutionData: any,
    memberStats: any,
    periodStart: string,
    periodEnd: string
  ) => {
    try {
      setIsGenerating(true);
      setProgress(10);

      const response = await supabase.functions.invoke('generate-institution-report', {
        body: {
          reportType: 'dashboard',
          institutionData,
          memberStats,
          periodStart,
          periodEnd
        }
      });

      setProgress(80);

      if (response.error) {
        throw new Error(response.error.message || '대시보드 리포트 생성 실패');
      }

      if (!response.data?.htmlContent) {
        throw new Error('리포트 내용이 생성되지 않았습니다.');
      }

      setProgress(100);

      const report: GeneratedReport = {
        id: `dashboard_${Date.now()}`,
        htmlContent: response.data.htmlContent,
        metadata: response.data.metadata || {},
        generatedAt: new Date().toISOString()
      };

      setGeneratedReport(report);

      toast({
        title: "대시보드 리포트 생성 완료",
        description: "기관 현황 리포트가 생성되었습니다.",
      });

      return report;
    } catch (error: any) {
      console.error('대시보드 리포트 생성 오류:', error);
      toast({
        title: "생성 실패",
        description: error.message || '리포트 생성 중 오류가 발생했습니다.',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  /**
   * PDF 다운로드
   */
  const downloadReportAsPDF = async (
    htmlContent: string,
    options: InstitutionPDFOptions
  ) => {
    try {
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
          toast({
            title: "PDF 다운로드 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } catch (error: any) {
      console.error('PDF 다운로드 오류:', error);
    }
  };

  /**
   * HTML 다운로드
   */
  const downloadReportAsHTML = (htmlContent: string, filename: string) => {
    try {
      downloadAsHTML(htmlContent, filename);
      toast({
        title: "HTML 다운로드 완료",
        description: "리포트가 HTML 파일로 저장되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "다운로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /**
   * 인쇄
   */
  const printReport = (htmlContent: string, title?: string) => {
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title || '리포트 인쇄'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
          }
        </style>
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

  return {
    isGenerating,
    progress,
    generatedReport,
    generateVoucherReport,
    generateMemberReport,
    generateDashboardReport,
    downloadReportAsPDF,
    downloadReportAsHTML,
    printReport,
    setGeneratedReport
  };
};
