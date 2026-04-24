import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Flame, Target } from "lucide-react";
import { differenceInDays, subDays } from "date-fns";

interface Observation {
  id: string;
  content: string;
  expert_advice: string | null;
  created_at: string;
}

interface Props {
  observations: Observation[];
}

const STOP_WORDS = new Set([
  "있다", "없다", "그리고", "하지만", "그런데", "오늘", "어제", "내일",
  "그래서", "정말", "너무", "조금", "많이", "계속", "다시", "이런",
  "저런", "그런", "이렇게", "저렇게", "그렇게", "같이", "함께",
]);

export default function ObservationInsightCard({ observations }: Props) {
  const insights = useMemo(() => {
    if (observations.length === 0) return null;

    // 키워드 추출 (한글 2자 이상)
    const wordCount = new Map<string, number>();
    observations.forEach((o) => {
      const words = (o.content || "").match(/[가-힣]{2,}/g) || [];
      words.forEach((w) => {
        if (STOP_WORDS.has(w) || w.length > 6) return;
        wordCount.set(w, (wordCount.get(w) || 0) + 1);
      });
    });
    const topKeywords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 연속 기록일 (streak)
    const dateSet = new Set(
      observations.map((o) => new Date(o.created_at).toDateString())
    );
    let streak = 0;
    let cursor = new Date();
    while (dateSet.has(cursor.toDateString())) {
      streak++;
      cursor = subDays(cursor, 1);
    }

    // 최근 30일 기록 수
    const last30 = observations.filter(
      (o) => differenceInDays(new Date(), new Date(o.created_at)) <= 30
    ).length;
    const prev30 = observations.filter((o) => {
      const d = differenceInDays(new Date(), new Date(o.created_at));
      return d > 30 && d <= 60;
    }).length;
    const trend = prev30 === 0 ? 100 : Math.round(((last30 - prev30) / prev30) * 100);

    const aiAnalyzed = observations.filter((o) => o.expert_advice).length;

    return { topKeywords, streak, last30, trend, aiAnalyzed };
  }, [observations]);

  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm mb-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900">AI 누적 인사이트</h3>
          <p className="text-xs text-amber-600">최근 기록을 종합 분석한 결과예요</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-3 rounded-xl bg-white/70 border border-amber-100">
          <div className="flex items-center gap-1 text-amber-600 mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">연속 기록</span>
          </div>
          <p className="text-xl font-bold text-amber-900">{insights.streak}<span className="text-xs font-normal ml-0.5">일</span></p>
        </div>
        <div className="p-3 rounded-xl bg-white/70 border border-amber-100">
          <div className="flex items-center gap-1 text-orange-600 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">30일 추세</span>
          </div>
          <p className={`text-xl font-bold ${insights.trend >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
            {insights.trend >= 0 ? "+" : ""}{insights.trend}<span className="text-xs font-normal ml-0.5">%</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/70 border border-amber-100">
          <div className="flex items-center gap-1 text-amber-700 mb-1">
            <Target className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">AI 분석</span>
          </div>
          <p className="text-xl font-bold text-amber-900">{insights.aiAnalyzed}<span className="text-xs font-normal ml-0.5">건</span></p>
        </div>
      </div>

      {insights.topKeywords.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-700 mb-2">자주 등장한 키워드</p>
          <div className="flex flex-wrap gap-1.5">
            {insights.topKeywords.map(([word, count]) => (
              <span
                key={word}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/80 border border-amber-200 text-amber-800"
              >
                {word} <span className="text-amber-500">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
