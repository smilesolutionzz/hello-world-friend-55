const HTML_TAG_RE = /<\/?(p|div|ul|ol|li|h\d|strong|em|br|blockquote|table|tr|td|th)\b/i;

// ── JSON artifact detection ──

// "key": { or "key": [
const JSON_KEY_LINE_RE = /^\s*["']?[A-Za-z_][\w-]*["']?\s*:\s*(?:\{|\[)?\s*$/;

// "key": "value", or "key": 123,
const JSON_VALUE_LINE_RE = /^\s*["']?[A-Za-z_][\w-]*["']?\s*:\s*(?:".*?"|'.*?'|-?\d+(?:\.\d+)?|true|false|null)\s*,?\s*$/i;

// standalone quoted strings: "리포트", "관찰일지"
const JSON_STRING_LINE_RE = /^\s*["'][^"']{0,80}["']\s*,?\s*$/;

// multiple quoted strings on one line: "a", "b", "c"
const JSON_MULTI_STRING_LINE_RE = /^\s*(?:["'][^"']*["']\s*,?\s*){2,}$/;

// known JSON keys that should never render
const KNOWN_JSON_KEYS_RE = /^\s*["']?(week|weeks\d*|goal|activities|milestone|platformFeatures|dimension|score|maxScore|overallWellbeing|socialAdaptation|emotionalStability|cognitiveFunction|behavioralRegulation|riskLevel|riskScore|summary|content|chartData|roadmap|radarScores|keyMetrics|preprocessedData|metadata|sections|behavioralPatterns|interventionPriorities|funnel_strategy|revenue_forecast|target_audience)["']?\s*:/i;

// lines with only syntax characters
const STRAY_ONLY_LINE_RE = /^\s*[\[\]{}(),"'`]+\s*$/;

// lines with only punctuation
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

/**
 * Remove wrapper artifacts and large trailing JSON blobs
 */
function sanitizeWrapperArtifacts(value: string): string {
  return value
    .replace(/```(?:json|html)?/gi, '')
    .replace(/```/g, '')
    // Remove "summary": " or "content": " wrappers
    .replace(/["']\s*["']?summary["']?\s*:\s*["']?/gi, '')
    .replace(/["']\s*["']?content["']?\s*:\s*["']?/gi, '')
    .replace(/^["']?(summary|content)["']?\s*:\s*["']?/gim, '')
    // Remove everything from a trailing "roadmap" / "preprocessedData" / etc. key onward
    .replace(/["']\s*,?\s*["']?roadmap["']?\s*:\s*[\[{][\s\S]*$/i, '')
    .replace(/["']\s*,?\s*["']?(preprocessedData|metadata|sections|chartData|radarScores|keyMetrics)["']?\s*:\s*[\[{"'][\s\S]*$/i, '')
    // Remove trailing "chartData": { ... to end
    .replace(/["']?chartData["']?\s*:\s*\{[\s\S]*$/i, '')
    .replace(/["']?radarScores["']?\s*:\s*\[[\s\S]*$/i, '')
    .replace(/["']?keyMetrics["']?\s*:\s*\{[\s\S]*$/i, '')
    .replace(/["']?weeks\d*["']?\s*:\s*\[[\s\S]*$/i, '')
    // Korean sentinel patterns
    .replace(/본 리포트는 전처리 데이터[\s\S]*$/i, '')
    .replace(/\r/g, '');
}

/**
 * Check if a plain-text line is meaningful human-readable content
 * (i.e., not a JSON artifact, stray punctuation, etc.)
 */
function isJsonArtifactLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false; // empty is not "JSON artifact" — handled separately

  // Stray syntax or punctuation
  if (STRAY_ONLY_LINE_RE.test(trimmed)) return true;
  if (PUNCT_ONLY_LINE_RE.test(trimmed)) return true;

  // Known JSON keys
  if (KNOWN_JSON_KEYS_RE.test(trimmed)) return true;

  // Generic JSON key-value patterns
  if (JSON_KEY_LINE_RE.test(trimmed)) return true;
  if (JSON_VALUE_LINE_RE.test(trimmed)) return true;

  // Standalone or multiple quoted strings (array items)
  if (JSON_STRING_LINE_RE.test(trimmed)) return true;
  if (JSON_MULTI_STRING_LINE_RE.test(trimmed)) return true;

  // Null/undefined
  if (/^(null|undefined)$/i.test(trimmed)) return true;

  return false;
}

function isMeaningfulLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return !isJsonArtifactLine(trimmed);
}

/**
 * Strip HTML tags and remove JSON artifacts, returning clean plain text.
 */
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

/**
 * Convert clean plain text into structured HTML (headings, lists, paragraphs).
 */
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

/**
 * Remove JSON artifact lines from HTML content while preserving HTML tags.
 * Works by extracting text nodes, testing them, and removing artifact nodes.
 */
function cleanHtmlContent(html: string): string {
  // Split into segments: HTML tags vs text
  const segments = html.split(/(<[^>]+>)/);
  const cleaned: string[] = [];

  for (const segment of segments) {
    // Keep HTML tags as-is
    if (segment.startsWith('<')) {
      cleaned.push(segment);
      continue;
    }

    // For text segments, filter line by line
    const textLines = segment.split('\n');
    const filteredLines = textLines.filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true; // keep blank lines for spacing
      return !isJsonArtifactLine(trimmed);
    });

    cleaned.push(filteredLines.join('\n'));
  }

  let result = cleaned.join('');

  // Remove empty HTML elements left behind
  result = result.replace(/<(p|div|li|span)[^>]*>\s*<\/\1>/gi, '');
  result = result.replace(/<(ul|ol)[^>]*>\s*<\/\1>/gi, '');

  // Collapse excessive whitespace
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Main entry: sanitise AI report content for rendering.
 * Handles both HTML-rich and plain-text inputs.
 */
export function formatReportContent(content: string): string {
  if (!content) return '';

  const sanitized = sanitizeWrapperArtifacts(content).trim();
  if (!sanitized) return '';

  // If content has HTML tags, clean while preserving structure
  if (HTML_TAG_RE.test(sanitized)) {
    return cleanHtmlContent(sanitized);
  }

  // Plain text: convert to structured HTML
  const plainText = cleanReportPlainText(sanitized);
  return convertPlainTextToHtml(plainText);
}

/**
 * Extract ordered/bullet list items from content, cleaned of JSON.
 */
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

/**
 * Extract a readable snippet for summaries / visual notes.
 */
export function extractReadableSnippet(content: string, maxLength = 140): string {
  const plainText = cleanReportPlainText(content).replace(/\n+/g, ' ').trim();
  if (!plainText) return '';

  if (plainText.length <= maxLength) return plainText;

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 40 ? lastSpace : maxLength).trim()}…`;
}
