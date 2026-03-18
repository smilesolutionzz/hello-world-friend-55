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

export interface FootnoteResult {
  text: string;
  footnotes: string[];
}

/**
 * 학자명, 이론명, 학술 인용(예: "Bowlby의 애착이론", "DSM-5-TR",
 * "Mikulincer & Shaver(2007)")을 본문에서 추출하여
 * 각주 번호로 대체하고, 각주 목록을 반환합니다.
 */
export function extractFootnotes(text: string): FootnoteResult {
  if (!text) return { text: '', footnotes: [] };

  const footnotes: string[] = [];
  const seen = new Set<string>();

  const addFootnote = (ref: string): string => {
    const normalized = ref.trim();
    if (seen.has(normalized)) {
      const idx = footnotes.indexOf(normalized) + 1;
      return `[${idx}]`;
    }
    seen.add(normalized);
    footnotes.push(normalized);
    return `[${footnotes.length}]`;
  };

  let result = text;

  // 1) "저자 & 저자(년도, 출판사)" 또는 "저자 & 저자(년도)" 패턴
  result = result.replace(
    /([A-Z][a-z]+(?:\s*[&,]\s*[A-Z][a-z]+)*)\s*\((\d{4}(?:,\s*[^)]+)?)\)/g,
    (_, authors, yearInfo) => addFootnote(`${authors}(${yearInfo})`)
  );

  // 2) "DSM-5-TR", "DSM-5", "ICD-11" 등 진단 매뉴얼 참조
  result = result.replace(
    /\b(DSM-[\w-]+|ICD-\d+)\b(?:상\s*)?/g,
    (match) => addFootnote(match.trim()) + ' '
  );

  // 3) "학자의 이론명" 패턴 (예: "Bowlby의 애착이론", "Beck의 인지치료이론")
  result = result.replace(
    /([A-Z][a-z]+(?:\s*[&,]\s*[A-Z][a-z]+)*)(?:의\s+)([가-힣]+(?:\s*[가-힣]+){0,3}(?:이론|모델|척도|검사|기법|분석|관점|접근|프레임워크|패러다임|가설|법칙|효과|증후군|개념|체계))/g,
    (_, scholar, theory) => {
      const ref = `${scholar} — ${theory}`;
      return `${theory}${addFootnote(ref)}`;
    }
  );

  // 4) 단독 학자명 + "에 따르면", "에 의하면", "이 제안한", "이 주장한" 등
  result = result.replace(
    /([A-Z][a-z]+(?:\s*[&,]\s*[A-Z][a-z]+)*)(?:의\s+메타분석|의\s+연구|에\s+따르면|에\s+의하면|이\s+제안한|이\s+주장한|이\s+개발한|이\s+정의한)/g,
    (match, scholar) => {
      addFootnote(scholar);
      return match.replace(scholar, '관련 연구');
    }
  );

  // 중복 공백 정리
  result = result.replace(/\s{2,}/g, ' ').trim();

  return { text: result, footnotes };
}
