import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, FileText, Loader2, Download, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MILESTONES = [7, 14, 21, 28] as const;

interface Enrollment {
  id: string;
  started_at: string;
}

interface MilestoneReport {
  id: string;
  milestone_day: number;
  ai_narrative: string | null;
  baseline_snapshot: any;
  latest_snapshot: any;
  checkin_summary: any;
  created_at: string;
}

/**
 * One-click Day 7/14/21/28 self-diagnosis report generator for /my-journey.
 * - Calls mind-track-milestone-report edge function (idempotent)
 * - Lets the user preview the narrative + download as PDF (window.print)
 */
export default function MindTrackMilestoneReportFlow() {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [reports, setReports] = useState<Record<number, MilestoneReport>>({});
  const [loadingDay, setLoadingDay] = useState<number | null>(null);
  const [activeReport, setActiveReport] = useState<MilestoneReport | null>(null);
  const [currentDay, setCurrentDay] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: enrolls } = await supabase
        .from("mind_track_enrollments")
        .select("id, started_at")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(1);
      if (!enrolls || enrolls.length === 0) return;
      const en = enrolls[0] as Enrollment;
      setEnrollment(en);
      const days = Math.floor((Date.now() - new Date(en.started_at).getTime()) / 86400000) + 1;
      setCurrentDay(Math.min(Math.max(days, 1), 30));

      const { data: existing } = await supabase
        .from("mind_track_milestone_reports")
        .select("*")
        .eq("enrollment_id", en.id);
      const map: Record<number, MilestoneReport> = {};
      (existing ?? []).forEach((r: any) => { map[r.milestone_day] = r; });
      setReports(map);
    })();
  }, []);

  const generate = async (day: number) => {
    if (!enrollment) return;
    setLoadingDay(day);
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("mind-track-milestone-report", {
        headers: { Authorization: `Bearer ${session.session?.access_token}` },
        body: { enrollmentId: enrollment.id, milestoneDay: day },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "리포트 생성에 실패했어요");
      setReports((prev) => ({ ...prev, [day]: data.report }));
      setActiveReport(data.report);
      toast.success(data.cached ? "기존 리포트를 불러왔어요" : `Day ${day} 자가진단 리포트가 준비됐어요`);
    } catch (e: any) {
      toast.error(e.message || "리포트 생성 실패");
    } finally {
      setLoadingDay(null);
    }
  };

  const downloadPdf = () => {
    // Use the browser's print-to-PDF on the dialog content
    const node = document.getElementById("milestone-report-print-area");
    if (!node) { window.print(); return; }
    const w = window.open("", "_blank", "width=820,height=1024");
    if (!w) { window.print(); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Day ${activeReport?.milestone_day} 자가진단 리포트</title>
      <style>
        body{font-family:'Pretendard Variable',sans-serif;padding:32px;color:#0f172a;line-height:1.7;}
        h1{font-size:22px;margin-bottom:4px;}
        .badge{display:inline-block;font-size:11px;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:99px;margin-bottom:12px;}
        pre{white-space:pre-wrap;font-family:inherit;font-size:14px;}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:16px 0;}
        .stat{border:1px solid #e2e8f0;border-radius:12px;padding:10px;text-align:center;}
        .footer{margin-top:32px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px;}
      </style></head><body>${node.innerHTML}
      <div class="footer">AIHPRO 30일 마음 변화 트랙 · 본 리포트는 의료 진단/치료를 대체하지 않으며 코칭 보조 자료입니다.</div>
      </body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  if (!enrollment) return null;

  return (
    <Card className="p-5 sm:p-6 mb-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">마일스톤 자가진단 리포트</h3>
          </div>
          <p className="text-xs text-slate-600 break-keep">
            저장된 체크인·기준 점수를 바탕으로 Day 7·14·21·28 자가진단 리포트를 한 번에 만들고 PDF로 받을 수 있어요.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">현재 Day {currentDay}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MILESTONES.map((d) => {
          const reached = currentDay >= d;
          const existing = reports[d];
          const isLoading = loadingDay === d;
          return (
            <div key={d} className={`rounded-xl border-2 p-3 text-center transition-all ${
              existing ? "border-emerald-300 bg-emerald-50/60" : reached ? "border-primary/40 bg-white" : "border-slate-200 bg-slate-50 opacity-60"
            }`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                {existing ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <FileText className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-xs font-bold text-slate-700">Day {d}</span>
              </div>
              <Button
                size="sm"
                variant={existing ? "outline" : "default"}
                disabled={!reached || isLoading}
                onClick={() => existing ? setActiveReport(existing) : generate(d)}
                className="text-[11px] w-full mt-1"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : existing ? "보기" : reached ? "생성" : "잠김"}
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!activeReport} onOpenChange={(o) => !o && setActiveReport(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Day {activeReport?.milestone_day} 자가진단 리포트
            </DialogTitle>
          </DialogHeader>
          {activeReport && (
            <div id="milestone-report-print-area" className="space-y-4 pt-2">
              <span className="badge inline-block text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                AIHPRO · 30일 마음 변화 트랙
              </span>
              <h1 className="text-xl font-bold text-slate-900 break-keep">
                {activeReport.milestone_day}일 마음 변화 자가진단
              </h1>
              {activeReport.checkin_summary && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "체크인 완료", value: `${activeReport.checkin_summary.completed_count ?? 0}회` },
                    { label: "수행률", value: `${activeReport.checkin_summary.adherence_rate ?? 0}%` },
                    { label: "평균 기분", value: activeReport.checkin_summary.avg_mood ?? "-" },
                  ].map((s) => (
                    <div key={s.label} className="stat rounded-xl border border-slate-200 p-2 text-center">
                      <div className="text-[10px] text-slate-500">{s.label}</div>
                      <div className="text-sm font-bold text-slate-900">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
              <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans break-keep">
                {activeReport.ai_narrative ?? ""}
              </pre>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={downloadPdf} className="gap-1.5">
              <Download className="w-4 h-4" />
              PDF로 저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
