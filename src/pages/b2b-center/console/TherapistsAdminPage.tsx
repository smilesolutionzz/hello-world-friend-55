import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import ImportWizard from "@/components/b2b-center/ImportWizard";

type Ctx = { centerId: string; demo?: boolean };

// 일정표와 동일한 팔레트
const PALETTE = [
  "#E63946", "#1D7874", "#F4A261", "#264653", "#9D4EDD", "#0077B6",
  "#FB8500", "#2A9D8F", "#7209B7", "#BC4749", "#3A86FF", "#8AB17D",
  "#06B6D4", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#0EA5E9",
];

type Permission = "schedule" | "billing" | "clients" | "reports" | "admin";
const PERMISSION_LIST: { key: Permission; label: string; hint: string }[] = [
  { key: "schedule", label: "일정 관리", hint: "일정 생성·수정·완료/취소 처리" },
  { key: "billing", label: "수납 관리", hint: "결제·환불·미수금 관리" },
  { key: "clients", label: "이용자 관리", hint: "아동/보호자 정보 열람·수정" },
  { key: "reports", label: "리포트 작성", hint: "상담·평가·치료 리포트 작성" },
  { key: "admin", label: "기관 관리자", hint: "선생님/프로그램/권한 설정 (최고권한)" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "정상" },
  { value: "locked", label: "잠금" },
  { value: "inactive", label: "미사용(퇴사)" },
];

function nextColor(used: Set<string>, seed = 0) {
  for (let k = 0; k < PALETTE.length; k++) {
    const c = PALETTE[(seed + k) % PALETTE.length];
    if (!used.has(c.toLowerCase())) return c;
  }
  return PALETTE[seed % PALETTE.length];
}

export default function TherapistsAdminPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "locked" | "inactive">("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [permEditing, setPermEditing] = useState<any | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("center_therapists")
      .select("*")
      .eq("center_id", centerId)
      .order("created_at", { ascending: true });
    const list = data ?? [];
    const used = new Set<string>();
    const toUpdate: Array<{ id: string; color: string }> = [];
    const assigned = list.map((r: any, i: number) => {
      let c = (r.calendar_color || "").toLowerCase();
      if (!c || c === "#94a3b8" || used.has(c)) {
        const pick = nextColor(used, i);
        c = pick.toLowerCase();
        toUpdate.push({ id: r.id, color: pick });
        r = { ...r, calendar_color: pick };
      }
      used.add(c);
      return r;
    });
    setRows(assigned);
    setLoading(false);
    for (const u of toUpdate) {
      supabase.from("center_therapists").update({ calendar_color: u.color }).eq("id", u.id);
    }
  }

  useEffect(() => { load(); }, [centerId]);

  async function changeColor(id: string, color: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, calendar_color: color } : r)));
    const { error } = await supabase.from("center_therapists").update({ calendar_color: color }).eq("id", id);
    if (error) toast.error("색상 저장 실패: " + error.message);
  }

  async function shuffleAll() {
    const used = new Set<string>();
    const next = rows.map((r, i) => {
      const c = nextColor(used, i);
      used.add(c.toLowerCase());
      return { ...r, calendar_color: c };
    });
    setRows(next);
    for (const r of next) {
      supabase.from("center_therapists").update({ calendar_color: r.calendar_color }).eq("id", r.id);
    }
    toast.success("색상이 자동 재배정되었어요");
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== "all" && r.account_status !== filter) return false;
      if (q.trim()) {
        const s = q.trim().toLowerCase();
        const hay = `${r.name ?? ""} ${r.title ?? ""} ${r.specialty ?? ""} ${r.phone ?? ""} ${r.login_account ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [rows, filter, q]);

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter(r => r.account_status === "active").length,
    locked: rows.filter(r => r.account_status === "locked").length,
    inactive: rows.filter(r => r.account_status === "inactive").length,
  }), [rows]);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold">선생님 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">총 {rows.length}명 · 캘린더 색상은 일정표에서 선생님 구분에 사용돼요.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={shuffleAll} className="rounded-full">색상 자동 재배정</Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="rounded-full">↑ 엑셀 일괄 등록</Button>
          <Button size="sm" onClick={() => setEditing({})} className="rounded-full">+ 선생님 등록</Button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#C8B88A]/40 bg-[#FAF6E8]/60 p-4">
        <p className="text-[10px] tracking-widest text-[#8B7B4A] mb-1">TIP · 치료사 본인 계정 연결 (초대코드 방식)</p>
        <ol className="text-sm text-neutral-800 space-y-1.5 list-decimal pl-5 break-keep">
          <li>오른쪽 표 <b>초대코드</b> 칸의 <b>코드 발급</b>을 누르면 6자리 코드가 만들어집니다 (30일 유효).</li>
          <li>코드와 함께 <Link to="/therapist/claim" className="font-mono text-xs px-1.5 py-0.5 rounded bg-white border border-neutral-300">/therapist/claim</Link> 링크를 선생님께 전달하세요.</li>
          <li>선생님이 AIHPRO에 가입·로그인 후 코드를 입력하면 <span className="text-emerald-700 font-medium">연결됨</span>으로 표시됩니다.</li>
        </ol>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-1">
          {[
            { k: "all", label: `전체 ${counts.all}` },
            { k: "active", label: `정상 ${counts.active}` },
            { k: "locked", label: `잠금 ${counts.locked}` },
            { k: "inactive", label: `미사용 ${counts.inactive}` },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k as any)}
              className={`text-xs px-3 py-1.5 rounded-full transition ${filter === t.k ? "bg-white shadow-sm font-medium" : "text-neutral-500 hover:text-neutral-800"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름·직급·전화·계정 검색"
          className="max-w-xs rounded-full"
        />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="text-left p-3 w-20">캘린더색상</th>
              <th className="text-left p-3">이름</th>
              <th className="text-left p-3">직급</th>
              <th className="text-left p-3">전공</th>
              <th className="text-left p-3">전화</th>
              <th className="text-left p-3">초대코드</th>
              <th className="text-left p-3">연결</th>
              <th className="text-left p-3">상태</th>
              <th className="text-right p-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={9} className="p-8 text-center text-neutral-400">불러오는 중…</td></tr> :
             filtered.length === 0 ? <tr><td colSpan={9} className="p-8 text-center text-neutral-400">선생님이 없습니다.</td></tr> :
             filtered.map((r) => {
              const linked = !!r.linked_user_id;
              const color = r.calendar_color || "#94a3b8";
              const perms = (r.meta?.permissions ?? []) as Permission[];
              return (
                <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                  <td className="p-3">
                    <ColorSwatch color={color} onChange={(c) => changeColor(r.id, c)} />
                  </td>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3 text-neutral-700">{r.title ?? "—"}</td>
                  <td className="p-3 text-neutral-700">{r.specialty ?? "—"}</td>
                  <td className="p-3 text-neutral-500">{r.phone ?? "—"}</td>
                  <td className="p-3">
                    <InviteCodeCell
                      therapistId={r.id}
                      code={r.invite_code}
                      expiresAt={r.invite_code_expires_at}
                      linked={linked}
                      onIssued={(code, exp) => setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, invite_code: code, invite_code_expires_at: exp } : x))}
                    />
                  </td>
                  <td className="p-3">
                    {linked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />연결됨
                      </span>
                    ) : r.invite_code ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />대기중
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-500 border border-neutral-200">미발급</span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={r.account_status} />
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setPermEditing(r)}
                      className="text-xs px-2 py-1 rounded-md border border-neutral-200 hover:border-neutral-400 mr-1"
                      title={perms.length ? `권한 ${perms.length}개` : "권한 없음"}
                    >
                      권한 {perms.length > 0 && <span className="ml-1 text-[10px] px-1 rounded bg-neutral-900 text-white">{perms.length}</span>}
                    </button>
                    <button
                      onClick={() => setEditing(r)}
                      className="text-xs px-2 py-1 rounded-md border border-neutral-200 hover:border-neutral-400"
                    >
                      수정
                    </button>
                  </td>
                </tr>
              );
             })}
          </tbody>
        </table>
      </div>

      {editing && (
        <TherapistDialog
          centerId={centerId}
          row={editing}
          existingColors={new Set(rows.filter(r => r.id !== editing.id).map(r => (r.calendar_color || "").toLowerCase()))}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {permEditing && (
        <PermissionsDialog
          row={permEditing}
          onClose={() => setPermEditing(null)}
          onSaved={(perms) => {
            setRows((prev) => prev.map((r) => r.id === permEditing.id ? { ...r, meta: { ...(r.meta ?? {}), permissions: perms } } : r));
            setPermEditing(null);
          }}
        />
      )}

      {importOpen && (
        <ImportWizard
          demo={!!demo}
          centerId={centerId}
          onClose={() => setImportOpen(false)}
          onImported={load}
          onMergeDemo={() => { /* 데모: 일정표에서 병합 */ }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    locked: "bg-amber-50 text-amber-700 border-amber-200",
    inactive: "bg-neutral-100 text-neutral-500 border-neutral-200",
  };
  const label = STATUS_OPTIONS.find(s => s.value === status)?.label ?? status;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${map[status] ?? map.inactive}`}>{label}</span>;
}

function ColorSwatch({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 rounded-md ring-1 ring-neutral-200 hover:ring-neutral-400 transition"
          style={{ backgroundColor: color }}
          aria-label="캘린더 색상 변경"
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="text-xs text-neutral-500 mb-2">팔레트에서 선택</p>
        <div className="grid grid-cols-6 gap-1.5 mb-3">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setOpen(false); }}
              className={`w-8 h-8 rounded-md ring-1 transition ${c.toLowerCase() === color.toLowerCase() ? "ring-neutral-900 ring-2" : "ring-neutral-200 hover:ring-neutral-400"}`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <span className="text-xs text-neutral-500">사용자 지정</span>
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-neutral-200"
          />
          <span className="font-mono text-xs text-neutral-500">{color.toUpperCase()}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TherapistDialog({
  centerId, row, existingColors, onClose, onSaved,
}: {
  centerId: string;
  row: any;
  existingColors: Set<string>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !row?.id;
  const [form, setForm] = useState<any>({
    name: row.name ?? "",
    title: row.title ?? "",
    specialty: row.specialty ?? "",
    birth_date: row.birth_date ?? "",
    phone: row.phone ?? "",
    work_phone: row.work_phone ?? "",
    login_account: row.login_account ?? "",
    calendar_color: row.calendar_color || nextColor(existingColors, existingColors.size),
    account_status: row.account_status ?? "active",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name?.trim()) { toast.error("이름을 입력해주세요"); return; }
    setSaving(true);
    const payload = {
      center_id: centerId,
      name: form.name.trim(),
      title: form.title || null,
      specialty: form.specialty || null,
      birth_date: form.birth_date || null,
      phone: form.phone || null,
      work_phone: form.work_phone || null,
      login_account: form.login_account || null,
      calendar_color: form.calendar_color,
      account_status: form.account_status,
    };
    const { error } = isNew
      ? await supabase.from("center_therapists").insert(payload)
      : await supabase.from("center_therapists").update(payload).eq("id", row.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "선생님이 등록되었어요" : "수정되었어요");
    onSaved();
  }

  async function remove() {
    if (!confirm("정말 삭제할까요? 관련된 일정/수납 데이터는 유지됩니다.")) return;
    const { error } = await supabase.from("center_therapists").delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("삭제되었어요");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "선생님 등록" : "선생님 수정"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="이름 *" className="col-span-2">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="직급(호칭)">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 팀장, 치료사" />
          </Field>
          <Field label="전공">
            <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="예: 언어치료" />
          </Field>
          <Field label="생년월일">
            <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          </Field>
          <Field label="휴대전화">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01012345678" />
          </Field>
          <Field label="업무용 전화">
            <Input value={form.work_phone} onChange={(e) => setForm({ ...form, work_phone: e.target.value })} />
          </Field>
          <Field label="상태">
            <select
              value={form.account_status}
              onChange={(e) => setForm({ ...form, account_status: e.target.value })}
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm bg-white"
            >
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="로그인 계정(이메일)" className="col-span-2">
            <Input value={form.login_account} onChange={(e) => setForm({ ...form, login_account: e.target.value })} placeholder="teacher@example.com" />
          </Field>
          <Field label="캘린더 색상" className="col-span-2">
            <div className="flex items-center gap-2">
              <ColorSwatch color={form.calendar_color} onChange={(c) => setForm({ ...form, calendar_color: c })} />
              <span className="font-mono text-xs text-neutral-500">{form.calendar_color.toUpperCase()}</span>
            </div>
          </Field>
        </div>
        <DialogFooter className="flex sm:justify-between gap-2">
          {!isNew ? (
            <Button variant="outline" onClick={remove} className="text-rose-600 hover:text-rose-700 border-rose-200">삭제</Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={save} disabled={saving}>{saving ? "저장 중…" : "저장"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsDialog({ row, onClose, onSaved }: { row: any; onClose: () => void; onSaved: (perms: Permission[]) => void }) {
  const [perms, setPerms] = useState<Permission[]>((row.meta?.permissions ?? []) as Permission[]);
  const [saving, setSaving] = useState(false);

  function toggle(k: Permission) {
    setPerms((p) => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);
  }

  async function save() {
    setSaving(true);
    const newMeta = { ...(row.meta ?? {}), permissions: perms };
    const { error } = await supabase.from("center_therapists").update({ meta: newMeta }).eq("id", row.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("권한이 저장되었어요");
    onSaved(perms);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{row.name} 권한 설정</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-neutral-500 -mt-2 mb-1">계정이 연결된 선생님에게만 적용돼요.</p>
        <div className="space-y-2.5">
          {PERMISSION_LIST.map((p) => (
            <label key={p.key} className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 cursor-pointer">
              <Checkbox checked={perms.includes(p.key)} onCheckedChange={() => toggle(p.key)} className="mt-0.5" />
              <div>
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{p.hint}</div>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={save} disabled={saving}>{saving ? "저장 중…" : "저장"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-neutral-500 mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

function InviteCodeCell({ therapistId, code, expiresAt, linked, onIssued }: {
  therapistId: string; code: string | null; expiresAt: string | null; linked: boolean;
  onIssued: (code: string, expiresAt: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const expired = expiresAt && new Date(expiresAt) < new Date();

  async function issue() {
    setBusy(true);
    const { data, error } = await supabase.rpc("issue_therapist_invite_code", { _therapist_id: therapistId });
    setBusy(false);
    if (error) { toast.error("코드 발급 실패: " + error.message); return; }
    const exp = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    onIssued(data as string, exp);
    try { await navigator.clipboard.writeText(data as string); toast.success(`코드 ${data} 가 발급되어 복사되었어요`); }
    catch { toast.success(`코드 발급 완료: ${data}`); }
  }

  async function copy() {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); toast.success("코드가 복사되었어요"); } catch {}
  }

  async function sendSms() {
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-therapist-invite-sms", {
      body: { therapist_id: therapistId, origin_url: window.location.origin },
    });
    setSending(false);
    if (error || (data && (data as any).error)) {
      const msg = (data as any)?.error || error?.message || "전송 실패";
      toast.error("문자 전송 실패: " + msg);
      return;
    }
    const d = data as any;
    if (d?.code && !code) {
      const exp = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      onIssued(d.code, exp);
    }
    if (d?.sms_sent) toast.success(`문자 전송 완료 (****${d.to_last4})`);
    else toast.warning("코드는 발급됐지만 SMS 미발송 (Twilio 미설정)");
  }

  if (linked) return <span className="text-xs text-neutral-400">연결 완료</span>;

  if (!code) {
    return (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" disabled={busy} onClick={issue} className="h-7 text-xs rounded-full">{busy ? "발급 중…" : "코드 발급"}</Button>
        <Button size="sm" variant="ghost" disabled={sending} onClick={sendSms} className="h-7 text-xs rounded-full" title="문자로 코드 발송">{sending ? "전송 중…" : "📱 문자"}</Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button onClick={copy} className={`font-mono text-xs px-2 py-1 rounded border ${expired ? "border-rose-200 bg-rose-50 text-rose-600 line-through" : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"}`} title="클릭해서 복사">
        {code}
      </button>
      <button onClick={sendSms} disabled={sending} className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50" title="치료사 휴대폰으로 코드 전송">
        {sending ? "전송 중…" : "📱 문자전송"}
      </button>
      <button onClick={issue} disabled={busy} className="text-[10px] text-neutral-500 hover:text-neutral-900 underline">{busy ? "..." : "재발급"}</button>
    </div>
  );
}

