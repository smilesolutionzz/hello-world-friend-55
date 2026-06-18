import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, Calendar, Download } from "lucide-react";

type Draft = {
  title?: string;
  greeting?: string;
  highlights?: string[];
  activities_summary?: string;
  growth?: string[];
  home_tips?: string[];
  next_week_focus?: string;
};

function draftToSections(d: Draft) {
  const J = (v: any) => Array.isArray(v) ? v.filter(Boolean).map((x) => `• ${x}`).join("\n") : (v ?? "");
  return [
    { label: "보호자께 인사", value: d?.greeting ?? "" },
    { label: "이번 주 하이라이트", value: Array.isArray(d?.highlights) && d.highlights.length ? J(d.highlights) : "" },
    { label: "이번 주 활동 요약", value: d?.activities_summary ?? "" },
    { label: "관찰된 성장", value: Array.isArray(d?.growth) && d.growth.length ? J(d.growth) : "" },
    { label: "가정에서 해볼 활동", value: Array.isArray(d?.home_tips) && d.home_tips.length ? J(d.home_tips) : "" },
    { label: "다음 주 집중 방향", value: d?.next_week_focus ?? "" },
  ];
}

function findParentSession(resourceId: string): { token: string; shareToken: string } | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("aihpro_parent_session_")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const v = JSON.parse(raw);
      if (v?.resource_id === resourceId && v?.parent_session_token) {
        return { token: v.parent_session_token, shareToken: key.replace("aihpro_parent_session_", "") };
      }
    }
  } catch { /* ignore */ }
  return null;
}

export default function ParentResourceViewPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const sess = findParentSession(id);
      if (!sess) {
        setError("세션이 만료되었어요. 받으신 링크를 다시 열어 인증해주세요.");
        setLoading(false);
        return;
      }
      try {
        const { data: res, error: err } = await supabase.functions.invoke("parent-resource-fetch", {
          body: { parent_session_token: sess.token, resource_id: id },
        });
        if (err) throw err;
        if ((res as any)?.error) throw new Error((res as any).error);
        setData(res);
      } catch (e: any) {
        setError(e?.message ?? "리포트를 불러올 수 없어요");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const draft: Draft = data?.report?.ai_draft_json ?? {};
  const sections = useMemo(() => draftToSections(draft).filter((s) => s.value), [draft]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" /> 리포트 불러오는 중…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 p-8 text-center space-y-3">
          <div className="text-base font-medium text-neutral-800">리포트를 열 수 없어요</div>
          <div className="text-sm text-neutral-500 break-keep">{error ?? "다시 시도해주세요."}</div>
          <Link to="/" className="inline-block mt-3 text-xs text-neutral-500 hover:text-neutral-900">홈으로</Link>
        </div>
      </div>
    );
  }

  const r = data.report;
  const isReport = data.resource_type === "parent_report";

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4 text-xs text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C8B88A]" />
          본인 인증된 보호자 전용 화면
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-7 md:p-9">
          <div className="mb-6 pb-5 border-b border-neutral-100">
            <p className="text-[11px] tracking-[0.2em] text-[#C8B88A] mb-2">
              {isReport ? "MONTHLY PARENT REPORT" : "WEEKLY THERAPY NOTE"}
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-neutral-900 break-keep">
              {draft.title || (isReport ? "월간 리포트" : "주간 치료노트")}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-500">
              {data.child_name && <span className="font-medium text-neutral-700">{data.child_name}</span>}
              {r.week_key && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {r.week_key}
                </span>
              )}
              {r.published_at && (
                <span>발행 {new Date(r.published_at).toLocaleDateString("ko-KR")}</span>
              )}
              {data.center_name && <span>· {data.center_name}</span>}
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="text-sm text-neutral-500 py-8 text-center">아직 표시할 내용이 없어요.</div>
          ) : (
            <div className="space-y-6">
              {sections.map((s, i) => (
                <div key={i}>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">{s.label}</div>
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-neutral-800 break-keep">{s.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
            <div className="text-[11px] text-neutral-400">
              이 화면은 본인 인증된 보호자만 열람할 수 있어요.
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs hover:bg-neutral-50"
            >
              <Download className="w-3.5 h-3.5" /> 인쇄 / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
