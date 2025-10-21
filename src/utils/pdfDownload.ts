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

    const opt = {
      margin: 10,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    await html2pdf().set(opt).from(element).save();
    
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
