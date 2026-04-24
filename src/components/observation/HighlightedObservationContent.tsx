import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

interface Props {
  content: string;
  expertAdvice?: string | null;
  detailedAdvice?: string | null;
}

const STOP = new Set([
  "있다","없다","그리고","하지만","그런데","오늘","어제","내일","그래서","정말",
  "너무","조금","많이","계속","다시","이런","저런","그런","이렇게","저렇게",
  "그렇게","같이","함께","경우","상황","모습","행동","아이","부모","엄마","아빠",
  "보이","느끼","생각","대해","통해","위해","관련","대한","따라","때문","우리",
]);

// AI 텍스트에서 본문에 등장하는 의미있는 한글 키워드 추출
function extractKeywords(content: string, advice: string): string[] {
  if (!content || !advice) return [];
  const adviceWords = (advice.match(/[가-힣]{2,5}/g) || []).filter(
    (w) => !STOP.has(w)
  );
  const contentSet = new Set(content.match(/[가-힣]{2,5}/g) || []);
  const freq = new Map<string, number>();
  adviceWords.forEach((w) => {
    if (contentSet.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
  });
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}

export default function HighlightedObservationContent({
  content,
  expertAdvice,
  detailedAdvice,
}: Props) {
  const [active, setActive] = useState(true);

  const keywords = useMemo(
    () => extractKeywords(content, `${expertAdvice ?? ""} ${detailedAdvice ?? ""}`),
    [content, expertAdvice, detailedAdvice]
  );

  const rendered = useMemo(() => {
    if (!active || keywords.length === 0) return content;
    // 긴 키워드 우선
    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    const escaped = sorted.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`(${escaped.join("|")})`, "g");
    const parts = content.split(re);
    return parts.map((p, i) =>
      keywords.includes(p) ? (
        <mark
          key={i}
          className="bg-amber-200/70 text-amber-900 px-0.5 rounded-sm font-medium"
          title="AI 분석에서 강조된 키워드"
        >
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  }, [content, keywords, active]);

  if (keywords.length === 0) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-amber-700">
          <Sparkles className="w-3.5 h-3.5" />
          AI가 짚은 핵심 키워드 {keywords.length}개
        </div>
        <button
          onClick={() => setActive((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-md border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
        >
          {active ? "하이라이트 끄기" : "하이라이트 켜기"}
        </button>
      </div>

      {active && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => (
            <span
              key={k}
              className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 border border-amber-200"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm leading-relaxed whitespace-pre-wrap">{rendered}</p>
    </div>
  );
}
