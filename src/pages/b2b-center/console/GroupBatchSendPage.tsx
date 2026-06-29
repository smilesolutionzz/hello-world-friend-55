import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useOutletContext, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertTriangle, Send, Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { toast as sonnerToast } from "sonner";

type Ctx = { centerId: string; demo?: boolean };

interface Client {
  id: string;
  name: string;
  guardian_phone: string | null;
  meta: any;
}
interface Report {
  id: string;
  client_id: string;
  period_type: string | null;
  week_key: string | null;
  period_yyyymm: string | null;
  period_start: string | null;
  period_end: string | null;
  status: string;
  title: string | null;
}
type ResourceType = "therapy_note" | "parent_report";

type Row = {
  client: Client;
  guardianName: string;
  resource: Report | null;
  reasons: string[]; // blocking reasons
  willSend: boolean;
};

export default function GroupBatchSendPage() {
  const { centerId } = useOutletContext<Ctx>();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState<string>("");
  const [clients, setClients] = useState<Client[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [resourceType, setResourceType] = useState<ResourceType>("therapy_note");
  const [periodKey, setPeriodKey] = useState<string>(""); // week_key or period_yyyymm
  const [sendSms, setSendSms] = useState(true);
  const [confirmStage, setConfirmStage] = useState<"compose" | "review" | "sent">("compose");
  const [sending, setSending] = useState(false);
  const [doubleCheck, setDoubleCheck] = useState(false);
  const [resultLog, setResultLog] = useState<any | null>(null);

  const load = useCallback(async () => {
    if (!groupId || !centerId) return;
    setLoading(true);
    const [g, gm] = await Promise.all([
      supabase.from("center_client_groups").select("name").eq("id", groupId).maybeSingle(),
      supabase.from("center_client_group_members").select("client_id").eq("group_id", groupId),
    ]);
    setGroupName((g.data as any)?.name ?? "그룹");
    const ids = (gm.data ?? []).map((m: any) => m.client_id as string);
    if (ids.length === 0) {
      setClients([]); setReports([]); setLoading(false); return;
    }
    const [c, r] = await Promise.all([
      supabase.from("center_clients").select("id,name,guardian_phone,meta")
        .in("id", ids).eq("center_id", centerId),
      supabase.from("center_parent_reports")
        .select("id,client_id,period_type,week_key,period_yyyymm,period_start,period_end,status,title")
        .in("client_id", ids).eq("center_id", centerId)
        .order("period_start", { ascending: false }),
    ]);
    setClients((c.data ?? []) as Client[]);
    setReports((r.data ?? []) as Report[]);
    setLoading(false);
  }, [groupId, centerId]);
  useEffect(() => { load(); }, [load]);

  // Available period options for the chosen resource type
  const periodOptions = useMemo(() => {
    const target = resourceType === "therapy_note" ? "weekly" : "monthly";
    const set = new Map<string, string>(); // key -> label
    for (const r of reports) {
      const t = r.period_type ?? (r.week_key ? "weekly" : r.period_yyyymm ? "monthly" : null);
      if (t !== target) continue;
      const key = target === "weekly" ? (r.week_key ?? r.period_start ?? "") : (r.period_yyyymm ?? r.period_start ?? "");
      if (!key) continue;
      const label = target === "weekly"
        ? `${key} 주차 (${r.period_start ?? "?"} ~ ${r.period_end ?? "?"})`
        : `${key}`;
      if (!set.has(key)) set.set(key, label);
    }
    return Array.from(set.entries()).map(([k, label]) => ({ key: k, label }));
  }, [reports, resourceType]);

  useEffect(() => {
    // Reset period when type changes; pick the first available
    if (periodOptions.length > 0 && !periodOptions.find((p) => p.key === periodKey)) {
      setPeriodKey(periodOptions[0].key);
    } else if (periodOptions.length === 0) {
      setPeriodKey("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceType, periodOptions.length]);

  // Build mapping rows: each client → one resource for chosen period (if any) → blocking reasons
  const rows: Row[] = useMemo(() => {
    if (!periodKey) return [];
    const target = resourceType === "therapy_note" ? "weekly" : "monthly";
    return clients.map((client) => {
      const guardianName = (client.meta?.guardian_label as string) ?? "보호자";
      const resource = reports.find((r) => {
        if (r.client_id !== client.id) return false;
        const t = r.period_type ?? (r.week_key ? "weekly" : r.period_yyyymm ? "monthly" : null);
        if (t !== target) return false;
        const k = target === "weekly" ? r.week_key : r.period_yyyymm;
        return k === periodKey;
      }) ?? null;
      const reasons: string[] = [];
      if (!resource) reasons.push("일지/리포트 없음");
      if (!client.guardian_phone) reasons.push("보호자 연락처 없음");
      return {
        client, guardianName, resource, reasons,
        willSend: reasons.length === 0,
      };
    });
  }, [clients, reports, periodKey, resourceType]);

  const sendable = rows.filter((r) => r.willSend);
  const blocked = rows.filter((r) => !r.willSend);

  async function dispatch() {
    if (!doubleCheck) { sonnerToast.error("확인 체크박스에 체크해주세요"); return; }
    if (sendable.length === 0) { sonnerToast.error("전송 대상이 없습니다"); return; }
    setSending(true);
    try {
      const items = sendable.map((r) => ({
        client_id: r.client.id,
        client_name: r.client.name,
        resource_id: r.resource!.id,
        parent_phone: r.client.guardian_phone!,
      }));
      const { data, error } = await supabase.functions.invoke("batch-share-parent-reports", {
        body: {
          center_id: centerId,
          group_id: groupId,
          resource_type: resourceType,
          period_label: periodKey,
          send_sms: sendSms,
          items,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResultLog(data);
      setConfirmStage("sent");
      sonnerToast.success(`전송 완료 · 성공 ${(data as any).success}건 · 실패 ${(data as any).failure}건 · 제외 ${(data as any).skipped}건`);
    } catch (e: any) {
      sonnerToast.error("전송 실패", { description: e.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
        <Link to="/b2b-center/app/groups" className="inline-flex items-center gap-1 hover:text-neutral-900">
          <ArrowLeft className="w-4 h-4" /> 그룹 관리
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-medium">{groupName} 동시 전송</span>
      </div>

      {/* SENT STAGE */}
      {confirmStage === "sent" && resultLog && (
        <ResultPanel log={resultLog} onBack={() => navigate("/b2b-center/app/groups")} />
      )}

      {/* COMPOSE STAGE */}
      {confirmStage === "compose" && (
        <>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4">
            <h2 className="font-semibold mb-3">1단계 · 무엇을 보낼까요?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs text-neutral-500 mb-1 block">유형</span>
                <select value={resourceType} onChange={(e) => setResourceType(e.target.value as ResourceType)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm">
                  <option value="therapy_note">주간 치료노트</option>
                  <option value="parent_report">부모 월간 리포트</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs text-neutral-500 mb-1 block">기간</span>
                <select value={periodKey} onChange={(e) => setPeriodKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm">
                  {periodOptions.length === 0 && <option value="">해당 유형의 발행 가능한 리포트가 없어요</option>}
                  {periodOptions.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </label>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sendSms} onChange={(e) => setSendSms(e.target.checked)} />
              SMS로 보호자에게 자동 발송 (해제 시 링크만 생성)
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">2단계 · 매핑 확인 <span className="text-neutral-400 text-sm font-normal">아동 ↔ 보호자 ↔ 보낼 일지</span></h2>
              <div className="text-xs text-neutral-500">
                전송 가능 <b className="text-emerald-600">{sendable.length}건</b> · 제외 <b className="text-red-600">{blocked.length}건</b>
              </div>
            </div>
            {loading ? (
              <p className="text-sm text-neutral-400 py-8 text-center">불러오는 중…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-neutral-400 py-8 text-center">
                {clients.length === 0
                  ? "이 그룹에 배정된 이용자가 없어요."
                  : "선택한 유형/기간에 해당하는 리포트가 없어요."}
              </p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-neutral-500 border-b border-neutral-100">
                    <tr>
                      <th className="text-left py-2 px-3">아동</th>
                      <th className="text-left py-2 px-3">보호자</th>
                      <th className="text-left py-2 px-3">연락처</th>
                      <th className="text-left py-2 px-3">보낼 일지/리포트</th>
                      <th className="text-left py-2 px-3">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.client.id} className={`border-b border-neutral-50 ${r.willSend ? "" : "bg-red-50/40"}`}>
                        <td className="py-3 px-3 font-medium text-neutral-900">{r.client.name}</td>
                        <td className="py-3 px-3 text-neutral-700">{r.guardianName}</td>
                        <td className="py-3 px-3">
                          {r.client.guardian_phone
                            ? <span className="font-mono text-xs text-neutral-700">{r.client.guardian_phone}</span>
                            : <span className="text-red-600 text-xs inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 없음</span>}
                        </td>
                        <td className="py-3 px-3 text-neutral-700">
                          {r.resource
                            ? <span className="text-xs">{r.resource.title ?? `${r.resource.period_start ?? ""} ~ ${r.resource.period_end ?? ""}`}</span>
                            : <span className="text-red-600 text-xs inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 없음</span>}
                        </td>
                        <td className="py-3 px-3">
                          {r.willSend
                            ? <span className="text-xs text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 전송 예정</span>
                            : <span className="text-xs text-red-600 inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> 제외 · {r.reasons.join(", ")}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sendable.length > 0 && (
              <div className="mt-5 border-t border-neutral-100 pt-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 mb-3 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-medium mb-1">
                    <ShieldCheck className="w-4 h-4" /> 오배송 방지 안전선
                  </div>
                  각 아동의 일지는 <b>해당 아동의 보호자</b>에게만 매핑되어 발송됩니다.
                  한 번의 동일 메시지를 모두에게 뿌리는 방식이 아닙니다. 서버에서도 한 번 더 검증 후 전송됩니다.
                </div>
                <label className="flex items-start gap-2 text-sm mb-3">
                  <input type="checkbox" checked={doubleCheck} onChange={(e) => setDoubleCheck(e.target.checked)} className="mt-0.5" />
                  <span>위 표의 <b>아동 ↔ 보호자 ↔ 일지</b> 매핑을 모두 확인했고, 이대로 전송에 동의합니다.</span>
                </label>
                <button onClick={dispatch} disabled={sending || !doubleCheck}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium disabled:opacity-40">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sendable.length}건 전송 확정
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ResultPanel({ log, onBack }: { log: any; onBack: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold mb-1">전송 결과</h2>
      <p className="text-sm text-neutral-500 mb-4">
        성공 <b className="text-emerald-600">{log.success}</b> ·
        실패 <b className="text-red-600">{log.failure}</b> ·
        제외 <b className="text-neutral-500">{log.skipped}</b> / 총 {log.total}건
      </p>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-neutral-500 border-b border-neutral-100">
            <tr>
              <th className="text-left py-2 px-3">아동</th>
              <th className="text-left py-2 px-3">연락처(끝4자리)</th>
              <th className="text-left py-2 px-3">결과</th>
              <th className="text-left py-2 px-3">사유 / 링크</th>
            </tr>
          </thead>
          <tbody>
            {(log.results ?? []).map((r: any, i: number) => (
              <tr key={i} className="border-b border-neutral-50">
                <td className="py-2.5 px-3 font-medium">{r.client_name ?? "-"}</td>
                <td className="py-2.5 px-3 font-mono text-xs text-neutral-600">****{r.parent_phone_last4 ?? ""}</td>
                <td className="py-2.5 px-3">
                  {r.status === "sent" && <span className="text-emerald-700 text-xs">✓ SMS 발송</span>}
                  {r.status === "link_created" && <span className="text-emerald-700 text-xs">✓ 링크 생성</span>}
                  {r.status === "link_only" && <span className="text-amber-700 text-xs">⚠ 링크만 (SMS 실패)</span>}
                  {r.status === "skipped" && <span className="text-neutral-500 text-xs">⊘ 제외</span>}
                  {r.status === "failed" && <span className="text-red-600 text-xs">✗ 실패</span>}
                </td>
                <td className="py-2.5 px-3 text-xs text-neutral-600">
                  {r.reason ?? r.sms_error ?? (r.share_url ? <span className="font-mono text-[10px] truncate inline-block max-w-xs">{r.share_url}</span> : "-")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 text-right">
        <button onClick={onBack} className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm">그룹 관리로</button>
      </div>
    </div>
  );
}
