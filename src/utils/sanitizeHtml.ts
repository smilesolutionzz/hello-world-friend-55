import DOMPurify from 'dompurify';

/**
 * AI 생성 HTML 콘텐츠를 안전하게 정제합니다
 * XSS 공격을 방지하기 위해 악성 스크립트를 제거합니다
 */
export const sanitizeAIContent = (html: string): string => {
  return DOMPurify.sanitize(html, {
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
