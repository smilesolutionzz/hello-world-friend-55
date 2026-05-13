import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, Phone, Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/common/SEOHead";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { fetchSelfCheckByShareId, LEVEL_META, type SavedSelfCheck } from "@/lib/mindTrackSelfCheck";
import { trackEvent } from "@/components/common/Analytics";

const ANSWER_LABEL = ["아니다", "가끔", "자주"];

export default function MindTrackCheckResult() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SavedSelfCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!shareId) return;
      const row = await fetchSelfCheckByShareId(shareId);
      if (!alive) return;
      setData(row);
      setLoading(false);
      if (row) trackEvent("mt_self_check_detail_view", { goal_id: row.goal_id, level: row.level });
    })();
    return () => { alive = false; };
  }, [shareId]);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const meta = data ? LEVEL_META[data.level] : null;

  const handleShare = async () => {
    if (!data) return;
    trackEvent("mt_self_check_detail_share", { goal_id: data.goal_id, level: data.level });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.goal_title} 결과`,
          text: `30일 마음 트랙 ${data.goal_title}: ${meta?.label} · ${data.score}/${data.max_score}`,
          url,
        });
        return;
      } catch { /* ignore */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("링크가 복사되었어요");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("복사 실패"); }
  };

  const goExpert = (urgent: boolean) => {
    if (!data) return;
    trackEvent("mt_self_check_detail_expert_cta", { goal_id: data.goal_id, level: data.level, urgent });
    const params = new URLSearchParams({
      from: "self_check",
      goal: data.goal_id,
      level: data.level,
      score: String(data.score),
      max: String(data.max_score),
      check: data.share_id,
    });
    if (urgent) params.set("urgent", "true");
    navigate(`/expert-hiring?${params.toString()}`);
  };

  return (
    <>
      <SEOHead
        title={data ? `${data.goal_title} 셀프체크 결과 | 30일 마음 트랙` : "셀프체크 결과 | 30일 마음 트랙"}
        description="30일 마음 트랙 목표별 셀프체크 결과를 확인하고, 다음 단계를 안내받아 보세요."
        canonicalUrl={url}
      />
      <UnifiedNavigation />
      <main className="min-h-screen bg-slate-50 pt-16 pb-24">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
          <Link
            to="/mind-track"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 30일 마음 트랙으로 돌아가기
          </Link>

          {loading && (
            <Card className="rounded-3xl border-slate-200 bg-white">
              <CardContent className="p-10 text-center text-sm text-slate-400">결과를 불러오는 중...</CardContent>
            </Card>
          )}

          {!loading && !data && (
            <Card className="rounded-3xl border-slate-200 bg-white">
              <CardContent className="p-10 text-center space-y-3">
                <p className="text-sm text-slate-500">결과를 찾을 수 없어요. 링크가 만료되었거나 잘못된 주소예요.</p>
                <Button onClick={() => navigate("/mind-track")} className="rounded-2xl bg-slate-900 hover:bg-black text-white">
                  새 셀프체크 하기
                </Button>
              </CardContent>
            </Card>
          )}

          {data && meta && (
            <>
              {/* Hero 결과 카드 */}
              <Card className={`rounded-3xl border-2 bg-white border-${meta.color}-200`}>
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <Badge variant="outline" className="mb-2 text-[11px]">목표 자가체크 결과</Badge>
                      <h1 className="text-xl md:text-2xl font-bold text-slate-900 break-keep">{data.goal_title}</h1>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(data.created_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs border-${meta.color}-200 bg-${meta.color}-50 text-${meta.color}-700`}
                    >
                      {meta.label} · {data.score}/{data.max_score}
                    </Badge>
                  </div>

                  {/* 점수 바 */}
                  <div className="space-y-1.5">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full bg-${meta.color}-500`}
                        style={{ width: `${Math.round((data.score / Math.max(1, data.max_score)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>안정</span><span>주의</span><span>도움 권장</span>
                    </div>
                  </div>

                  {data.summary && (
                    <div className={`rounded-2xl border p-4 border-${meta.color}-200 bg-${meta.color}-50/60`}>
                      <p className="text-sm text-slate-700 break-keep">{data.summary}</p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => {
                        const tag = (data.goal_id === 'child_development' || data.goal_id === 'family_communication')
                          ? 'family'
                          : data.goal_id;
                        navigate(`/mind-track?category=concern&tag=${encodeURIComponent(tag)}#goal-section`);
                      }}
                      className="flex-1 min-w-[160px] rounded-2xl bg-slate-900 hover:bg-black text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      30일 트랙 시작하기
                    </Button>
                    {data.level !== "calm" && (
                      <Button
                        variant="outline"
                        onClick={() => goExpert(data.level === "support")}
                        className="rounded-2xl"
                      >
                        <Phone className="w-4 h-4 mr-1.5" />
                        전문가 연결
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleShare} className="rounded-2xl">
                      {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Share2 className="w-4 h-4 mr-1.5" />}
                      공유
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 응답 상세 */}
              <Card className="rounded-3xl border-slate-200 bg-white">
                <CardContent className="p-6 md:p-8 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">응답 상세</h2>
                  {data.questions.map((q, idx) => {
                    const v = data.answers[idx] ?? 0;
                    return (
                      <div key={idx} className="border border-slate-100 rounded-2xl p-3">
                        <p className="text-sm text-slate-700 break-keep">
                          <span className="font-mono text-slate-400 mr-1">{String(idx + 1).padStart(2, "0")}</span>
                          {q}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">응답: <b className="text-slate-700">{ANSWER_LABEL[v] ?? v}</b></p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* 안내 */}
              <Card className="rounded-3xl border-slate-200 bg-white">
                <CardContent className="p-5 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-relaxed break-keep">
                    본 셀프체크는 자기이해 / 코칭 보조 도구이며 의료 진단을 대체하지 않습니다.
                    심리적 어려움이 지속된다면 전문가와의 1:1 상담을 권해드립니다.
                  </p>
                </CardContent>
              </Card>

              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  toast.success("링크 복사 완료");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="rounded-full text-xs text-slate-500"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                결과 링크 복사
              </Button>
            </>
          )}
        </div>
      </main>
    </>
  );
}
