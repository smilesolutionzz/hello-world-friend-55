/**
 * DOCX 다운로드 유틸리티
 * HTML 리포트 콘텐츠를 DOCX로 변환하여 다운로드
 */

export const downloadReportAsDocx = async (
  reportData: any,
  userName: string,
  filename: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  try {
    // HTML 콘텐츠를 텍스트로 추출
    const sections = reportData?.sections || [];
    const summary = reportData?.summary?.replace(/<[^>]*>/g, '') || '';
    
    // DOCX용 HTML 구성
    const docxHtml = buildDocxHtml(reportData, userName, summary, sections);
    
    // Blob으로 변환 (.doc 호환 HTML 형식)
    const blob = new Blob(
      [`<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${filename}</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]--><style>@page { size: A4; margin: 2cm; } body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 11pt; line-height: 1.8; color: #1a1a1a; } h1 { font-size: 18pt; color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 8px; margin-bottom: 16px; } h2 { font-size: 14pt; color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 10px; margin: 20px 0 10px 0; } h3 { font-size: 12pt; color: #334155; margin: 16px 0 8px 0; } .header-info { color: #64748b; font-size: 9pt; margin-bottom: 4px; } .section { margin: 16px 0; page-break-inside: avoid; } .highlight-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 12px 16px; margin: 12px 0; } .warning-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 16px; margin: 12px 0; } .footer { border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 12px; font-size: 9pt; color: #94a3b8; text-align: center; } table { width: 100%; border-collapse: collapse; margin: 10px 0; } th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; font-size: 10pt; } td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 10pt; } tr:nth-child(even) td { background: #f8fafc; } .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 48pt; color: rgba(0,0,0,0.03); pointer-events: none; }</style></head><body>${docxHtml}</body></html>`],
      { type: 'application/msword' }
    );
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onSuccess?.();
  } catch (error) {
    console.error('DOCX 생성 오류:', error);
    onError?.(error instanceof Error ? error : new Error('DOCX 생성 실패'));
  }
};

function buildDocxHtml(reportData: any, userName: string, summary: string, sections: any[]): string {
  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let html = `<div class="watermark">AIHPRO</div>`;
  
  // Header
  html += `
    <h1>종합 분석 리포트</h1>
    <p class="header-info">대상: ${userName} | 생성일: ${date}</p>
    <p class="header-info">AIHPRO 프리미엄 분석 시스템 | aihpro.app</p>
    <p class="header-info" style="font-size:8pt; color:#94a3b8;">본 리포트는 AI 분석 결과이며, 전문가의 임상 판단을 보조하기 위한 참고 자료입니다.</p>
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:16px 0;">
  `;
  
  // Executive Summary
  if (summary) {
    html += `
      <div class="highlight-box">
        <h3>📋 총괄 요약 (Executive Summary)</h3>
        <p>${summary}</p>
      </div>
    `;
  }
  
  // Data Source info
  const ds = reportData?.dataSource;
  if (ds) {
    html += `
      <div class="section">
        <h3>📊 분석 데이터 소스</h3>
        <table>
          <tr><th>데이터 유형</th><th>건수</th></tr>
          ${ds.assessments ? `<tr><td>심리 검사</td><td>${ds.assessments}건</td></tr>` : ''}
          ${ds.observations ? `<tr><td>AI 관찰일지</td><td>${ds.observations}건</td></tr>` : ''}
          ${ds.observationSessions ? `<tr><td>관찰 세션</td><td>${ds.observationSessions}건</td></tr>` : ''}
          ${ds.chatMessages ? `<tr><td>음성 상담</td><td>${ds.chatMessages}건</td></tr>` : ''}
          <tr style="font-weight:bold;"><td>총 데이터</td><td>${ds.totalDataCount || 0}건</td></tr>
        </table>
      </div>
    `;
  }
  
  // Sections
  sections.forEach((section: any, idx: number) => {
    const cleanContent = (section.content || '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');
    
    html += `
      <div class="section">
        <h2>${idx + 1}. ${section.title || `섹션 ${idx + 1}`}</h2>
        <div>${cleanContent}</div>
      </div>
    `;
  });
  
  // Footer
  html += `
    <div class="footer">
      <p>AIHPRO | aihpro.app | 프리미엄 종합 분석 리포트</p>
      <p>본 문서는 ${date}에 생성되었습니다. 무단 복제 및 배포를 금합니다.</p>
    </div>
  `;
  
  return html;
}
