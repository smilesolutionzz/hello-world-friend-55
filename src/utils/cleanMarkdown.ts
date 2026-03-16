/**
 * AI 분석 결과에서 마크다운 형식을 제거하여
 * 전문가가 직접 작성한 듯한 자연스러운 텍스트로 변환합니다.
 */
export function cleanMarkdown(text: string): string {
  if (!text) return '';

  return text
    // **bold** / __bold__
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // *italic* / _italic_ (단어 중간 언더스코어 제외)
    .replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, '$1')
    // # 헤더 (줄 시작)
    .replace(/^#{1,6}\s+/gm, '')
    // > 인용 블록
    .replace(/^>\s?/gm, '')
    // --- / *** / ___ 구분선
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // ![alt](url) → 제거
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // `inline code`
    .replace(/`([^`]+)`/g, '$1')
    // ```code blocks```
    .replace(/```[\s\S]*?```/g, '')
    // 불릿 기호 정리: - item 또는 * item → · item
    .replace(/^[\s]*[-*]\s+/gm, '· ')
    // 숫자 목록: 1. item → 그대로 유지
    // 이모지 제거 (선택적 — 이미지 참고에서 일부 이모지가 보이므로 유지)
    // 연속 빈 줄 정리
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 마크다운이 제거된 텍스트를 문단 배열로 분리합니다.
 * 빈 문단은 제거됩니다.
 */
export function splitParagraphs(text: string): string[] {
  return cleanMarkdown(text)
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean);
}
