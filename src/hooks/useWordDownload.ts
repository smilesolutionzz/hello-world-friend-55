import { useToast } from "@/hooks/use-toast";

interface WordDownloadData {
  title: string;
  date: string;
  sections: {
    title: string;
    content: string;
  }[];
}

export const useWordDownload = () => {
  const { toast } = useToast();

  const generateWordDocument = (data: WordDownloadData) => {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${data.title}</title>
<style>
  body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.8; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 10px; font-size: 24px; }
  h2 { color: #6366f1; margin-top: 30px; font-size: 18px; background: #f0f0ff; padding: 10px; border-radius: 5px; }
  p { margin: 15px 0; text-align: justify; }
  .date { color: #666; font-size: 14px; margin-bottom: 20px; }
  .section { margin-bottom: 25px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888; text-align: center; }
</style>
</head>
<body>
<h1>${data.title}</h1>
<p class="date">검사일: ${data.date}</p>
${data.sections.map(section => `
<div class="section">
<h2>${section.title}</h2>
<p>${section.content.replace(/\n/g, '</p><p>')}</p>
</div>
`).join('')}
<div class="footer">
본 보고서는 AI 기반 심리검사 결과이며, 전문 상담사의 해석과 함께 활용하시기 바랍니다.<br>
© 마음케어 - 심리검사 플랫폼
</div>
</body>
</html>`;

      const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.title}_${data.date.replace(/[\/\s:]/g, '-')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "다운로드 완료",
        description: "Word 문서가 성공적으로 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('Word download failed:', error);
      toast({
        title: "다운로드 실패",
        description: "문서 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const printDocument = (data: WordDownloadData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${data.title}</title>
<style>
  body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.8; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 10px; font-size: 24px; }
  h2 { color: #6366f1; margin-top: 30px; font-size: 18px; background: #f0f0ff; padding: 10px; border-radius: 5px; }
  p { margin: 15px 0; text-align: justify; }
  .date { color: #666; font-size: 14px; margin-bottom: 20px; }
  .section { margin-bottom: 25px; page-break-inside: avoid; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888; text-align: center; }
  @media print {
    body { padding: 20px; }
    .section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>${data.title}</h1>
<p class="date">검사일: ${data.date}</p>
${data.sections.map(section => `
<div class="section">
<h2>${section.title}</h2>
<p>${section.content.replace(/\n/g, '</p><p>')}</p>
</div>
`).join('')}
<div class="footer">
본 보고서는 AI 기반 심리검사 결과이며, 전문 상담사의 해석과 함께 활용하시기 바랍니다.<br>
© 마음케어 - 심리검사 플랫폼
</div>
</body>
</html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return { generateWordDocument, printDocument };
};
