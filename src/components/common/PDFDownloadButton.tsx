import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useToast } from '@/hooks/use-toast';

interface PDFDownloadButtonProps {
  elementId: string;
  filename: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  elementId,
  filename,
  variant = 'outline',
  size = 'default',
  className = '',
  children
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadResultAsPDF(
        elementId,
        filename,
        () => {
          toast({
            title: "PDF 다운로드 완료",
            description: "검사 결과가 PDF로 저장되었습니다.",
          });
        },
        (error) => {
          toast({
            title: "PDF 다운로드 실패",
            description: error.message || "PDF 생성 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant={variant}
      size={size}
      className={className}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          PDF 생성 중...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          {children || 'PDF 다운로드'}
        </>
      )}
    </Button>
  );
};
