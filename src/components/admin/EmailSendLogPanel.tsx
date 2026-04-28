import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RefreshCw, Mail, Send, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

type EmailLogRow = {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  metadata: any;
  created_at: string;
};

type DailyLogRow = {
  id: string;
  user_id: string;
  send_date: string;
  day_number: number | null;
  status: string;
  subject: string | null;
  error_message: string | null;
  created_at: string;
};

type MindTrackRow = {
  id: string;
  user_id: string;
  trigger_day: number | null;
  trigger_type: string;
  offering_key: string | null;
  status: string;
  suggested_at: string;
  acted_at: string | null;
};

const statusColor = (s: string) => {
  if (s === "sent") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s === "failed") return "bg-rose-100 text-rose-700 border-rose-200";
  if (s === "warning") return "bg-amber-100 text-amber-700 border-amber-200";
  if (s === "suppressed") return "bg-zinc-100 text-zinc-600 border-zinc-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
};

export function EmailSendLogPanel() {
  const [loading, setLoading] = useState(true);
  const [emailLogs, setEmailLogs] = useState<EmailLogRow[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLogRow[]>([]);
  const [mindTrack, setMindTrack] = useState<MindTrackRow[]>([]);

  // Manual send state
  const [testEmail, setTestEmail] = useState("");
  const [testReportId, setTestReportId] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, b, c] = await Promise.all([
        supabase.from("email_send_log")
          .select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("daily_coaching_email_log")
          .select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("mind_track_interventions")
          .select("*").order("suggested_at", { ascending: false }).limit(100),
      ]);
      setEmailLogs((a.data as any[]) || []);
      setDailyLogs((b.data as any[]) || []);
      setMindTrack((c.data as any[]) || []);
    } catch (e: any) {
      toast.error("로그 조회 실패: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sendDailyTest = async () => {
    if (!testEmail) return toast.error("이메일을 입력하세요");
    setSending("daily");
    try {
      const { data, error } = await supabase.functions.invoke("send-daily-coaching-email", {
        body: { test_email: testEmail },
      });
      if (error) throw error;
      toast.success(`30일 트랙 메일 발송 완료 → ${testEmail}`, {
        description: `영상 ${data?.videoCount ?? 0}개 포함`,
      });
      await load();
    } catch (e: any) {
      toast.error("발송 실패: " + (e.message || String(e)));
    } finally {
      setSending(null);
    }
  };

  const sendReportTest = async () => {
    if (!testEmail) return toast.error("이메일을 입력하세요");
    setSending("report");
    try {
      const payload: any = {
        recipientEmail: testEmail,
        reportTitle: "[테스트] 종합 발달 코칭 리포트",
        summary: "이것은 관리자 수동 테스트 발송입니다. 카드형 레이아웃·골드 액센트가 정상 적용되는지 확인합니다.",
        highlights: [
          "테스트 인사이트 1",
          "테스트 인사이트 2",
          "테스트 인사이트 3",
        ],
      };
      if (testReportId) payload.reportHistoryId = testReportId;

      const { data, error } = await supabase.functions.invoke("send-report-email", {
        body: payload,
      });
      if (error) throw error;
      if (data?.warning) {
        toast.warning("발송 완료 (HTML 잔존 경고)", { description: data.warning });
      } else {
        toast.success(`리포트 요약 메일 발송 완료 → ${testEmail}`);
      }
      await load();
    } catch (e: any) {
      toast.error("발송 실패: " + (e.message || String(e)));
    } finally {
      setSending(null);
    }
  };

  const stats = {
    sent: emailLogs.filter(r => r.status === "sent").length,
    failed: emailLogs.filter(r => r.status === "failed").length,
    warning: emailLogs.filter(r => r.status === "warning").length,
    dailyFailed: dailyLogs.filter(r => r.status === "failed").length,
    dailySent: dailyLogs.filter(r => r.status === "sent").length,
  };

  if (loading) return <Skeleton className="h-[400px] rounded-xl" />;

  return (
    <div className="space-y-4">
      {/* Manual test send */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Send className="h-4 w-4" /> 수동 테스트 발송
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              type="email"
              placeholder="수신 이메일 (예: kijung_kku@naver.com)"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="md:col-span-2"
            />
            <Input
              placeholder="(선택) 리포트 ID"
              value={testReportId}
              onChange={(e) => setTestReportId(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={sendDailyTest}
              disabled={sending !== null}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              {sending === "daily" ? "발송 중..." : "30일 트랙 메일 테스트"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={sendReportTest}
              disabled={sending !== null}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              {sending === "report" ? "발송 중..." : "리포트 요약 메일 테스트"}
            </Button>
            <Button size="sm" variant="ghost" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> 새로고침
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            • 30일 트랙: <code>send-daily-coaching-email</code> 의 test 모드 (스트레스 카테고리 샘플)
            <br />• 리포트 요약: <code>send-report-email</code> (리포트 ID 미입력시 더미 본문)
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <StatCard icon={<CheckCircle2 className="h-3 w-3" />} label="App 메일 성공" value={stats.sent} tone="emerald" />
        <StatCard icon={<XCircle className="h-3 w-3" />} label="App 메일 실패" value={stats.failed} tone="rose" />
        <StatCard icon={<AlertTriangle className="h-3 w-3" />} label="HTML 경고" value={stats.warning} tone="amber" />
        <StatCard icon={<CheckCircle2 className="h-3 w-3" />} label="트랙 메일 성공" value={stats.dailySent} tone="emerald" />
        <StatCard icon={<XCircle className="h-3 w-3" />} label="트랙 메일 실패" value={stats.dailyFailed} tone="rose" />
      </div>

      {/* Logs */}
      <Tabs defaultValue="email_log" className="space-y-3">
        <TabsList className="bg-white border border-gray-100 p-0.5 h-auto">
          <TabsTrigger value="email_log" className="text-xs px-3 py-1.5">앱 메일 로그 ({emailLogs.length})</TabsTrigger>
          <TabsTrigger value="daily" className="text-xs px-3 py-1.5">30일 트랙 ({dailyLogs.length})</TabsTrigger>
          <TabsTrigger value="mind_track" className="text-xs px-3 py-1.5">마음 트랙 개입 ({mindTrack.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="email_log">
          <Card className="border-gray-200">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">시각</th>
                    <th className="text-left px-3 py-2 font-medium">템플릿</th>
                    <th className="text-left px-3 py-2 font-medium">수신</th>
                    <th className="text-left px-3 py-2 font-medium">상태</th>
                    <th className="text-left px-3 py-2 font-medium">에러/경고</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map(r => (
                    <tr key={r.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{new Date(r.created_at).toLocaleString("ko-KR")}</td>
                      <td className="px-3 py-2 font-mono">{r.template_name}</td>
                      <td className="px-3 py-2">{r.recipient_email}</td>
                      <td className="px-3 py-2"><Badge className={statusColor(r.status) + " border"}>{r.status}</Badge></td>
                      <td className="px-3 py-2 text-rose-600 max-w-md truncate" title={r.error_message || ""}>{r.error_message}</td>
                    </tr>
                  ))}
                  {emailLogs.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">로그 없음</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card className="border-gray-200">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">발송일</th>
                    <th className="text-left px-3 py-2 font-medium">Day</th>
                    <th className="text-left px-3 py-2 font-medium">제목</th>
                    <th className="text-left px-3 py-2 font-medium">상태</th>
                    <th className="text-left px-3 py-2 font-medium">에러</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyLogs.map(r => (
                    <tr key={r.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.send_date}</td>
                      <td className="px-3 py-2">{r.day_number}</td>
                      <td className="px-3 py-2 max-w-md truncate" title={r.subject || ""}>{r.subject}</td>
                      <td className="px-3 py-2"><Badge className={statusColor(r.status) + " border"}>{r.status}</Badge></td>
                      <td className="px-3 py-2 text-rose-600 max-w-md truncate" title={r.error_message || ""}>{r.error_message}</td>
                    </tr>
                  ))}
                  {dailyLogs.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">로그 없음</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mind_track">
          <Card className="border-gray-200">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">제안 시각</th>
                    <th className="text-left px-3 py-2 font-medium">트리거</th>
                    <th className="text-left px-3 py-2 font-medium">Day</th>
                    <th className="text-left px-3 py-2 font-medium">오퍼링</th>
                    <th className="text-left px-3 py-2 font-medium">상태</th>
                    <th className="text-left px-3 py-2 font-medium">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {mindTrack.map(r => (
                    <tr key={r.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{new Date(r.suggested_at).toLocaleString("ko-KR")}</td>
                      <td className="px-3 py-2 font-mono">{r.trigger_type}</td>
                      <td className="px-3 py-2">{r.trigger_day}</td>
                      <td className="px-3 py-2">{r.offering_key}</td>
                      <td className="px-3 py-2"><Badge className={statusColor(r.status) + " border"}>{r.status}</Badge></td>
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                        {r.acted_at ? new Date(r.acted_at).toLocaleString("ko-KR") : "-"}
                      </td>
                    </tr>
                  ))}
                  {mindTrack.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">로그 없음</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone] || "bg-gray-50 border-gray-100"}`}>
      <div className="flex items-center gap-1 text-[10px] uppercase opacity-70">{icon}{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default EmailSendLogPanel;
