const HTML_TAG_RE = /<\/?(p|div|ul|ol|li|h\d|strong|em|br|blockquote|table|tr|td|th)\b/i;
const JSON_KEY_LINE_RE = /^\s*["']?[A-Za-z_][\w-]*["']?\s*:\s*(?:\{|\[)?\s*$/;
const JSON_VALUE_LINE_RE = /^\s*["']?[A-Za-z_][\w-]*["']?\s*:\s*(?:".*?"|'.*?'|-?\d+(?:\.\d+)?|true|false|null)\s*,?\s*$/i;
const JSON_STRING_LINE_RE = /^\s*["'][^"']+["']\s*,?\s*$/;
const KNOWN_JSON_KEYS_RE = /^\s*["']?(week|goal|activities|milestone|platformFeatures|dimension|score|maxScore|overallWellbeing|socialAdaptation|emotionalStability|cognitiveFunction|behavioralRegulation|riskLevel|riskScore|summary|content|chartData|roadmap|radarScores|keyMetrics|preprocessedData|metadata|sections|weeks\d+)["']?\s*:/i;
const STRAY_ONLY_LINE_RE = /^\s*[\[\]{}(),"'`]+\s*$/;
const PUNCT_ONLY_LINE_RE = /^\s*[•·▪︎◦●\-–—.,:;]+\s*$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|li|h\d|ul|ol|section)>/gi, '\n')
    .replace(/<[^>]*>/g, '');
}

function sanitizeWrapperArtifacts(value: string): string {
  return value
    .replace(/```(?:json|html)?/gi, '')
    .replace(/```/g, '')
    .replace(/["']\s*["']?summary["']?\s*:\s*["']?/gi, '')
    .replace(/["']\s*["']?content["']?\s*:\s*["']?/gi, '')
    .replace(/^["']?(summary|content)["']?\s*:\s*["']?/gim, '')
    .replace(/["']\s*,\s*["']?roadmap["']?\s*:\s*\{[\s\S]*$/i, '')
    .replace(/["']\s*,?\s*["']?(preprocessedData|metadata|sections)["']?\s*:\s*[\[{"'][\s\S]*$/i, '')
    .replace(/본 리포트는 전처리 데이터[\s\S]*$/i, '')
    .replace(/\r/g, '');
}

function isMeaningfulLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^(null|undefined)$/i.test(trimmed)) return false;
  if (STRAY_ONLY_LINE_RE.test(trimmed) || PUNCT_ONLY_LINE_RE.test(trimmed)) return false;
  if (KNOWN_JSON_KEYS_RE.test(trimmed)) return false;
  if (JSON_KEY_LINE_RE.test(trimmed) || JSON_VALUE_LINE_RE.test(trimmed)) return false;
  if (JSON_STRING_LINE_RE.test(trimmed)) return false;
  return true;
}

export function cleanReportPlainText(content: string): string {
  if (!content) return '';

  const cleaned = stripHtml(sanitizeWrapperArtifacts(content));
  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .map((line) => line.replace(/^["']+|["']+$/g, '').trim())
    .filter(isMeaningfulLine);

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function convertPlainTextToHtml(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(isMeaningfulLine);

  if (lines.length === 0) return '';

  let html = '';
  let listType: 'ol' | 'ul' | null = null;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    html += `<p>${escapeHtml(paragraphBuffer.join(' '))}</p>`;
    paragraphBuffer = [];
  };

  const closeList = () => {
    if (!listType) return;
    html += `</${listType}>`;
    listType = null;
  };

  for (const line of lines) {
    const headingMatch = line.match(/^\[(.+)\]$/);
    const orderedMatch = line.match(/^\d+\.\s+(.+)/);
    const bulletMatch = line.match(/^(?:[-•●▪︎◦])\s+(.+)/);

    if (headingMatch) {
      flushParagraph();
      closeList();
      html += `<h3>${escapeHtml(headingMatch[1])}</h3>`;
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      if (listType !== 'ol') {
        closeList();
        html += '<ol>';
        listType = 'ol';
      }
      html += `<li>${escapeHtml(orderedMatch[1])}</li>`;
      continue;
    }

    if (bulletMatch) {
      flushParagraph();
      if (listType !== 'ul') {
        closeList();
        html += '<ul>';
        listType = 'ul';
      }
      html += `<li>${escapeHtml(bulletMatch[1])}</li>`;
      continue;
    }

    closeList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  closeList();

  return html;
}

export function formatReportContent(content: string): string {
  if (!content) return '';

  const sanitized = sanitizeWrapperArtifacts(content).trim();
  if (!sanitized) return '';

  if (HTML_TAG_RE.test(sanitized)) {
    return sanitized
      .split('\n')
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed ? !STRAY_ONLY_LINE_RE.test(trimmed) : true;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  const plainText = cleanReportPlainText(sanitized);
  return convertPlainTextToHtml(plainText);
}

export function extractOrderedListItems(content: string, maxItems = 3): string[] {
  const plainText = cleanReportPlainText(content);
  if (!plainText) return [];

  const items = plainText
    .split('\n')
    .map((line) => line.trim())
    .map((line) => line.replace(/^\d+\.\s+/, '').replace(/^(?:[-•●▪︎◦])\s+/, '').trim())
    .filter(Boolean)
    .filter((line, index, arr) => arr.indexOf(line) === index);

  return items.slice(0, maxItems);
}

export function extractReadableSnippet(content: string, maxLength = 140): string {
  const plainText = cleanReportPlainText(content).replace(/\n+/g, ' ').trim();
  if (!plainText) return '';

  if (plainText.length <= maxLength) return plainText;

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 40 ? lastSpace : maxLength).trim()}…`;
}
