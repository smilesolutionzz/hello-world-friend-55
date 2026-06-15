import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Heart, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Child = { client_id: string; center_id: string; center_name: string; child_name: string };

const REACTIONS = ["❤️", "👏", "🥹", "🌱", "🙏"];

export default function ParentCenterPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setAuthed(false); setLoading(false); return; }
      setAuthed(true);
      const { data: kids } = await supabase.rpc("get_my_linked_children");
      setChildren((kids as any) || []);
      if (kids?.[0]) setSelected(kids[0].client_id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selected) { setReports([]); return; }
    supabase
      .from("center_parent_reports")
      .select("*")
      .eq("client_id", selected)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => setReports(data || []));
  }, [selected]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-3">로그인이 필요해요</h1>
          <p className="text-neutral-600 mb-6 break-keep">치료노트를 보려면 AIHPRO 계정으로 로그인해주세요.</p>
          <button onClick={() => navigate("/auth?redirect=/parent/center")} className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm">로그인</button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <Sparkles className="w-8 h-8 mx-auto text-[#C8B88A] mb-3" />
          <h1 className="text-2xl font-semibold mb-3">연결된 아동이 없어요</h1>
          <p className="text-neutral-600 mb-6 break-keep">센터에서 보내드린 초대 링크로 먼저 자녀와 계정을 연결해주세요.</p>
          <p className="text-xs text-neutral-400">초대 링크가 없다면 센터 담당 선생님께 문의해주세요.</p>
        </div>
      </div>
    );
  }

  const currentChild = children.find(c => c.client_id === selected);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Helmet><title>치료노트 — 보호자 페이지 | AIHPRO</title></Helmet>

      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest text-[#C8B88A]">PARENT</p>
            <h1 className="font-semibold">치료노트</h1>
          </div>
          {children.length > 1 && (
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm bg-white">
              {children.map(c => <option key={c.client_id} value={c.client_id}>{c.child_name}</option>)}
            </select>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {currentChild && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-700">
            <span className="text-neutral-400">기관 · </span>{currentChild.center_name}
          </div>
        )}

        {reports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
            <FileText className="w-8 h-8 mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500">아직 발행된 치료노트가 없어요.</p>
            <p className="text-xs text-neutral-400 mt-1">매주 선생님이 노트를 작성하면 여기에 표시돼요.</p>
          </div>
        ) : (
          reports.map(r => <ReportCard key={r.id} report={r} />)
        )}
      </main>
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  const draft = report.ai_draft_json || {};
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const loadComments = async () => {
    const { data } = await supabase.from("center_parent_report_comments").select("*").eq("report_id", report.id).order("created_at", { ascending: true });
    setComments(data || []);
  };

  useEffect(() => { loadComments(); /* eslint-disable-next-line */ }, [report.id]);

  const addReaction = async (emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("center_parent_report_comments").insert({
      report_id: report.id,
      center_id: report.center_id,
      author_user_id: user.id,
      author_role: "parent",
      body: emoji,
      emoji,
    });
    loadComments();
  };

  const postComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPosting(false); return; }
    const { error } = await supabase.from("center_parent_report_comments").insert({
      report_id: report.id,
      center_id: report.center_id,
      author_user_id: user.id,
      author_role: "parent",
      body: commentText.trim(),
    });
    setPosting(false);
    if (error) { toast({ title: "댓글 실패", description: error.message, variant: "destructive" }); return; }
    setCommentText("");
    loadComments();
  };

  const reactions = comments.filter(c => c.emoji);
  const textComments = comments.filter(c => !c.emoji);

  return (
    <article className="bg-white rounded-3xl border border-neutral-200 overflow-hidden">
      <div className="bg-gradient-to-br from-[#FAF6E8] to-white p-6">
        <p className="text-[10px] tracking-widest text-[#C8B88A] mb-1">{report.week_key || report.period_yyyymm || `${report.period_start} ~ ${report.period_end}`}</p>
        <h2 className="text-lg font-semibold mb-3 break-keep">{draft.title || report.title || "이번 주 치료 노트"}</h2>
        {draft.greeting && <p className="text-sm text-neutral-700 leading-relaxed break-keep">{draft.greeting}</p>}
      </div>

      <div className="p-6 space-y-5">
        {draft.highlights?.length > 0 && (
          <Section label="이번 주 하이라이트">
            <ul className="space-y-1.5">
              {draft.highlights.map((h: string, i: number) => <li key={i} className="text-sm flex gap-2 break-keep"><span className="text-[#C8B88A] mt-1.5">●</span>{h}</li>)}
            </ul>
          </Section>
        )}

        {draft.activities_summary && <Section label="이번 주 활동"><p className="text-sm leading-relaxed text-neutral-700 break-keep">{draft.activities_summary}</p></Section>}

        {draft.growth?.length > 0 && (
          <Section label="관찰된 성장">
            <ul className="space-y-1.5">
              {draft.growth.map((g: string, i: number) => <li key={i} className="text-sm flex gap-2 break-keep"><span className="text-emerald-500 mt-1.5">↑</span>{g}</li>)}
            </ul>
          </Section>
        )}

        {draft.home_tips?.length > 0 && (
          <Section label="가정에서 해볼 활동">
            <div className="bg-[#FAF6E8]/50 rounded-2xl p-4 space-y-2">
              {draft.home_tips.map((t: string, i: number) => <p key={i} className="text-sm flex gap-2 break-keep"><span className="text-[#C8B88A]">{i + 1}.</span>{t}</p>)}
            </div>
          </Section>
        )}

        {draft.next_week_focus && <Section label="다음 주 집중 방향"><p className="text-sm leading-relaxed text-neutral-700 break-keep">{draft.next_week_focus}</p></Section>}
      </div>

      {/* Reactions */}
      <div className="border-t border-neutral-100 px-6 py-3 flex items-center gap-2 flex-wrap">
        {REACTIONS.map(e => (
          <button key={e} onClick={() => addReaction(e)} className="text-lg hover:scale-110 transition-transform">{e}</button>
        ))}
        {reactions.length > 0 && (
          <span className="text-xs text-neutral-500 ml-auto">{reactions.map(r => r.emoji).join("")} {reactions.length}</span>
        )}
        <button onClick={() => setShowComments(!showComments)} className="text-xs text-neutral-500 inline-flex items-center gap-1 ml-2"><MessageCircle className="w-3.5 h-3.5" />댓글 {textComments.length}</button>
      </div>

      {showComments && (
        <div className="border-t border-neutral-100 px-6 py-4 space-y-3">
          {textComments.length === 0 && <p className="text-xs text-neutral-400">첫 댓글을 남겨주세요.</p>}
          {textComments.map(c => (
            <div key={c.id} className="text-sm">
              <p className="text-[10px] text-neutral-400 mb-0.5">{c.author_role === "therapist" ? "선생님" : "보호자"} · {new Date(c.created_at).toLocaleString("ko-KR")}</p>
              <p className="break-keep">{c.body}</p>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="감사 인사·질문을 남겨주세요" className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm" />
            <button onClick={postComment} disabled={posting} className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm">등록</button>
          </div>
        </div>
      )}
    </article>
  );
}

function Section({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <p className="text-[10px] tracking-widest text-neutral-400 mb-2">{label}</p>
      {children}
    </div>
  );
}
