import DOMPurify from 'dompurify';

/**
 * AI 생성 HTML 콘텐츠를 안전하게 정제합니다
 * XSS 공격을 방지하기 위해 악성 스크립트를 제거합니다
 */
export const sanitizeAIContent = (html: string): string => {
  // 깨진 문자(replacement character)와 이모지 없이 숫자만 있는 라인 정리
  let cleanedHtml = html
    // 깨진 문자(replacement character U+FFFD) 제거
    .replace(/\uFFFD/g, '')
    // "숫자. 제목" 다음에 "다음번호. ?" 패턴 제거 (예: "2. ?", "3. ?")
    .replace(/^\s*\d+\.\s*\??\s*$/gm, '')
    // 숫자만 있는 라인 제거 (예: 단독 "2", "3")
    .replace(/^\s*\d+\s*$/gm, '')
    // "숫자. " 뒤에 아무 내용 없는 패턴 제거
    .replace(/^\s*\d+\.\s*$/gm, '')
    // "?" 만 단독으로 있는 라인 제거
    .replace(/^\s*\?\s*$/gm, '')
    // 빈 라인만 있는 문단 정리
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<div>\s*<\/div>/gi, '')
    // 빈 <p> 또는 <div> 안에 숫자?만 있는 경우 제거
    .replace(/<p>\s*\d+\.?\s*\??\s*<\/p>/gi, '')
    .replace(/<div>\s*\d+\.?\s*\??\s*<\/div>/gi, '')
    // 연속된 빈 라인 정리
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return DOMPurify.sanitize(cleanedHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'a', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id',
      'colspan', 'rowspan'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // 링크는 새 탭에서 열리도록 강제 (보안)
    ADD_ATTR: ['target'],
    // data URI는 차단 (XSS 위험)
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button']
  });
};

/**
 * 마크다운 스타일 콘텐츠용 기본 정제
 */
export const sanitizeMarkdown = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'code', 'pre'],
    ALLOWED_ATTR: ['class']
  });
};

/**
 * 텍스트만 허용 (모든 HTML 태그 제거)
 */
export const sanitizeTextOnly = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};
