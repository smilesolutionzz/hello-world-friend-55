import html2pdf from 'html2pdf.js';

interface PDFOptions {
  filename?: string;
  margin?: [number, number, number, number];
  image?: { type?: 'jpeg' | 'png' | 'webp'; quality?: number };
  html2canvas?: { scale?: number; useCORS?: boolean };
  jsPDF?: { unit?: string; format?: string; orientation?: 'landscape' | 'portrait' };
}

export const generatePDF = async (elementId: string, options: PDFOptions = {}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const defaultOptions = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: options.filename || 'test-result.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  const pdfOptions = { ...defaultOptions, ...options };

  try {
    await html2pdf().set(pdfOptions).from(element).save();
  } catch (error) {
    console.error('PDF 생성 중 오류:', error);
    throw new Error('PDF 생성에 실패했습니다.');
  }
};

export const generateTestResultPDF = async (
  testName: string, 
  userName: string = '사용자', 
  testDate: string,
  elementId: string = 'pdf-content'
) => {
  const filename = `${testName}_${userName}_${testDate.replace(/[^0-9]/g, '')}.pdf`;
  
  await generatePDF(elementId, {
    filename,
    margin: [15, 10, 15, 10],
    html2canvas: { 
      scale: 2, 
      useCORS: true
    }
  });
};