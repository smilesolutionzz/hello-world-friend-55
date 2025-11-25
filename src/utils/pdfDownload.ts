import html2pdf from 'html2pdf.js';

export const downloadResultAsPDF = async (
  elementId: string,
  filename: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('결과 컨텐츠를 찾을 수 없습니다.');
    }

    // PDF에서 페이지 브레이크를 위한 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .page-break {
          page-break-before: always;
          break-before: page;
        }
        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(style);

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] as any,
        before: '.page-break',
        avoid: ['.no-break', 'Card']
      }
    };

    await html2pdf().set(opt).from(element).save();
    
    // 추가한 스타일 제거
    document.head.removeChild(style);
    
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
