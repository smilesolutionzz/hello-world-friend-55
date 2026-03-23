/**
 * AIHPRO PDF 브랜딩 헤더
 * 모든 PDF 다운로드 시 최상단에 회사 정보를 삽입합니다.
 */

export const PDF_HEADER_ID = 'aihpro-pdf-header';

export const injectPdfBrandingHeader = (element: HTMLElement): HTMLDivElement => {
  const header = document.createElement('div');
  header.id = PDF_HEADER_ID;
  header.style.cssText = `
    width: 100%;
    padding: 16px 20px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
  `;

  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="
        width: 36px; height: 36px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 800; font-size: 14px; font-family: Arial, sans-serif;
      ">A</div>
      <div>
        <div style="color: #ffffff; font-weight: 700; font-size: 16px; font-family: Arial, sans-serif; letter-spacing: 0.5px;">
          AIHPRO
        </div>
        <div style="color: #94a3b8; font-size: 11px; font-family: Arial, sans-serif;">
          AI 심리·발달·건강 통합 케어 플랫폼
        </div>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="color: #818cf8; font-weight: 600; font-size: 13px; font-family: Arial, sans-serif;">
        aihpro.app
      </div>
      <div style="color: #64748b; font-size: 10px; font-family: Arial, sans-serif;">
        Powered by AIHUMANPRO
      </div>
    </div>
  `;

  element.insertBefore(header, element.firstChild);
  return header;
};

/**
 * HTML 문자열로 브랜딩 헤더를 반환 (HTML 템플릿 기반 PDF용)
 */
export const getPdfBrandingHeaderHtml = (): string => {
  return `
    <div style="
      width: 100%;
      padding: 16px 20px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 14px; font-family: Arial, sans-serif;
        ">A</div>
        <div>
          <div style="color: #ffffff; font-weight: 700; font-size: 16px; font-family: Arial, sans-serif; letter-spacing: 0.5px;">
            AIHPRO
          </div>
          <div style="color: #94a3b8; font-size: 11px; font-family: Arial, sans-serif;">
            AI 심리·발달·건강 통합 케어 플랫폼
          </div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="color: #818cf8; font-weight: 600; font-size: 13px; font-family: Arial, sans-serif;">
          aihpro.app
        </div>
        <div style="color: #64748b; font-size: 10px; font-family: Arial, sans-serif;">
          Powered by AIHUMANPRO
        </div>
      </div>
    </div>
  `;
};

export const removePdfBrandingHeader = (element: HTMLElement) => {
  const header = element.querySelector(`#${PDF_HEADER_ID}`);
  if (header) {
    header.remove();
  }
};
