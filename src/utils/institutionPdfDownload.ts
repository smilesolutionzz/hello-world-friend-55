import html2pdf from 'html2pdf.js';
import { getPdfBrandingHeaderHtml } from './pdfBrandingHeader';

export interface InstitutionPDFOptions {
  filename: string;
  title?: string;
  institutionName?: string;
  reportType?: 'voucher' | 'member' | 'dashboard' | 'period';
  orientation?: 'portrait' | 'landscape';
  includeHeader?: boolean;
  includeFooter?: boolean;
  watermark?: string;
}

/**
 * 기관용 고품질 PDF 다운로드 유틸리티
 * HTML 콘텐츠를 전문적인 PDF 문서로 변환
 */
export const downloadInstitutionPDF = async (
  htmlContent: string,
  options: InstitutionPDFOptions,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  try {
    // 임시 컨테이너 생성
    const container = document.createElement('div');
    container.id = 'pdf-temp-container';
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 210mm;
      background: white;
      font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
    `;
    
    // 스타일 + HTML 콘텐츠 삽입
    container.innerHTML = `
      <style>
        /* PDF 전용 스타일 */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body, html {
          font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #1a1a1a;
        }
        .pdf-container {
          padding: 15mm 12mm;
          background: white;
        }
        
        /* 헤더 스타일 */
        .report-header {
          border-bottom: 3px solid #1e40af;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .report-header h1 {
          font-size: 18pt;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 4px;
        }
        .report-header .subtitle {
          font-size: 10pt;
          color: #64748b;
        }
        .report-header .institution-name {
          font-size: 12pt;
          font-weight: 600;
          color: #334155;
        }
        
        /* 정보 박스 */
        .info-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px 16px;
          margin: 12px 0;
        }
        .info-box.highlight {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-color: #93c5fd;
        }
        .info-box.warning {
          background: #fefce8;
          border-color: #fde047;
        }
        .info-box.success {
          background: #f0fdf4;
          border-color: #86efac;
        }
        
        /* 섹션 */
        .report-section {
          margin: 16px 0;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 13pt;
          font-weight: 700;
          color: #1e293b;
          border-left: 4px solid #3b82f6;
          padding-left: 10px;
          margin-bottom: 10px;
        }
        .section-content {
          padding-left: 14px;
        }
        
        /* 테이블 */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 10pt;
        }
        .data-table th {
          background: #1e40af;
          color: white;
          font-weight: 600;
          padding: 10px 8px;
          text-align: left;
          border: 1px solid #1e3a8a;
        }
        .data-table td {
          padding: 8px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        .data-table tr:nth-child(even) td {
          background: #f8fafc;
        }
        .data-table tr:hover td {
          background: #f1f5f9;
        }
        
        /* 평가 그리드 */
        .evaluation-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin: 10px 0;
        }
        .evaluation-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 10px;
        }
        .evaluation-item .label {
          font-size: 9pt;
          color: #64748b;
          margin-bottom: 4px;
        }
        .evaluation-item .value {
          font-size: 11pt;
          font-weight: 600;
          color: #1e293b;
        }
        
        /* 서명 영역 */
        .signature-area {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-around;
        }
        .signature-box {
          text-align: center;
          min-width: 120px;
        }
        .signature-line {
          border-bottom: 1px solid #334155;
          height: 40px;
          margin-bottom: 6px;
        }
        .signature-label {
          font-size: 9pt;
          color: #64748b;
        }
        
        /* 결재란 */
        .approval-box {
          border: 2px solid #334155;
          border-radius: 4px;
          overflow: hidden;
          margin: 20px 0;
          width: fit-content;
        }
        .approval-header {
          background: #334155;
          color: white;
          padding: 6px 12px;
          font-size: 10pt;
          font-weight: 600;
        }
        .approval-row {
          display: flex;
          border-top: 1px solid #e2e8f0;
        }
        .approval-cell {
          padding: 8px 16px;
          min-width: 80px;
          text-align: center;
          border-right: 1px solid #e2e8f0;
        }
        .approval-cell:last-child {
          border-right: none;
        }
        .approval-cell .title {
          font-size: 9pt;
          color: #64748b;
          margin-bottom: 4px;
        }
        .approval-cell .signature {
          height: 40px;
        }
        
        /* 페이지 나눔 */
        .page-break {
          page-break-before: always;
          break-before: page;
        }
        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* 푸터 */
        .report-footer {
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 9pt;
          color: #64748b;
          text-align: center;
        }
        
        /* 워터마크 */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 60pt;
          color: rgba(0, 0, 0, 0.03);
          pointer-events: none;
          z-index: 1000;
        }
        
        /* 하이라이트 */
        .highlight-text {
          background: linear-gradient(180deg, transparent 60%, #fef08a 60%);
          padding: 0 2px;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 9pt;
          font-weight: 600;
        }
        .badge-blue {
          background: #dbeafe;
          color: #1e40af;
        }
        .badge-green {
          background: #dcfce7;
          color: #166534;
        }
        .badge-yellow {
          background: #fef9c3;
          color: #854d0e;
        }
        .badge-red {
          background: #fee2e2;
          color: #991b1b;
        }
        
        /* 리스트 */
        .check-list {
          list-style: none;
          padding: 0;
        }
        .check-list li {
          padding: 6px 0 6px 24px;
          position: relative;
        }
        .check-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #22c55e;
          font-weight: bold;
        }
        
        /* 인쇄 최적화 */
        @media print {
          .pdf-container {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
      <div class="pdf-container">
        ${options.watermark ? `<div class="watermark">${options.watermark}</div>` : ''}
        ${htmlContent}
      </div>
    `;
    
    document.body.appendChild(container);
    
    // PDF 옵션 설정
    const pdfOptions = {
      margin: [8, 8, 8, 8] as [number, number, number, number],
      filename: `${options.filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2.5, // 고해상도
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: options.orientation || 'portrait' as const,
        compress: true,
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] as any,
        before: '.page-break',
        avoid: ['.no-break', '.report-section', '.info-box', '.evaluation-item']
      }
    };
    
    // PDF 생성 및 다운로드
    await html2pdf().set(pdfOptions).from(container).save();
    
    // 임시 컨테이너 제거
    document.body.removeChild(container);
    
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('기관용 PDF 생성 오류:', error);
    if (onError && error instanceof Error) {
      onError(error);
    }
  }
};

/**
 * HTML 요소를 직접 PDF로 변환 (기존 DOM 요소 사용)
 */
export const downloadElementAsPDF = async (
  elementId: string,
  options: InstitutionPDFOptions,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('PDF로 변환할 요소를 찾을 수 없습니다.');
    }
    
    // PDF 전용 스타일 주입
    const style = document.createElement('style');
    style.id = 'pdf-print-styles';
    style.textContent = `
      @media print {
        .page-break { page-break-before: always; break-before: page; }
        .no-break { page-break-inside: avoid; break-inside: avoid; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    
    const pdfOptions = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${options.filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: options.orientation || 'portrait' as const,
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] as any,
        before: '.page-break',
        avoid: ['.no-break']
      }
    };
    
    await html2pdf().set(pdfOptions).from(element).save();
    
    // 스타일 제거
    const injectedStyle = document.getElementById('pdf-print-styles');
    if (injectedStyle) {
      document.head.removeChild(injectedStyle);
    }
    
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    if (onError && error instanceof Error) {
      onError(error);
    }
  }
};

/**
 * HTML 문자열을 Blob으로 변환하여 다운로드 링크 생성
 */
export const getHTMLDownloadBlob = (htmlContent: string): Blob => {
  const fullHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>보고서</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  ${htmlContent}
</body>
</html>
  `;
  return new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
};

/**
 * HTML 파일 다운로드
 */
export const downloadAsHTML = (htmlContent: string, filename: string) => {
  const blob = getHTMLDownloadBlob(htmlContent);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
