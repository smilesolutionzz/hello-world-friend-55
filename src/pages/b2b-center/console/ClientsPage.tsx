import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus, Upload, Send, Settings2, Check, Users } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import ClientRegisterDialog from "@/components/b2b-center/ClientRegisterDialog";
import InviteParentDialog from "@/components/b2b-center/InviteParentDialog";
import ImportWizard from "@/components/b2b-center/ImportWizard";
import { DEMO_CLIENTS } from "@/lib/b2bCenter/demoData";
import { BETA_MODE } from "@/config/betaMode";


type Ctx = { centerId: string; demo?: boolean };

interface Client {
  id: string;
  name: string;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  guardian_phone: string | null;
  address: string | null;
  disability_info: string | null;
  initial_consult_date: string | null;
  member_no: string | null;
  status: string;
  meta: Record<string, any> | null;
  created_at: string;
}

const statusLabel: Record<string, string> = { waiting: "대기", enrolled: "등록", terminated: "종결", 등록: "등록", 대기: "대기", 종결: "종결" };
const statusTone: Record<string, string> = {
  enrolled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  등록: "bg-emerald-50 text-emerald-700 border-emerald-200",
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  대기: "bg-amber-50 text-amber-700 border-amber-200",
  terminated: "bg-neutral-100 text-neutral-500 border-neutral-200",
  종결: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

const v = (value: any) => (value == null || String(value).trim() === "" ? "—" : String(value));
const statusCode = (status: string) => {
  if (status === "등록") return "enrolled";
  if (status === "대기") return "waiting";
  if (status === "종결") return "terminated";
  return status;
};

type ColKey =
  | "gender" | "birth_date" | "age_months" | "disability_info" | "disability_grade" | "disability_secondary"
  | "phone" | "email" | "address" | "school" | "initial_consult_date" | "member_no"
  | "referral_source" | "referral_note" | "status" | "note" | "last_modified_at";

const COLUMNS: { key: ColKey; label: string; default: boolean; align?: "right" }[] = [
  { key: "gender", label: "성별", default: true },
  { key: "birth_date", label: "생년월일", default: true },
  { key: "age_months", label: "개월수", default: true },
  { key: "disability_info", label: "장애유형", default: true },
  { key: "disability_grade", label: "장애등급", default: true },
  { key: "disability_secondary", label: "중복장애", default: false },
  { key: "phone", label: "연락처", default: true },
  { key: "email", label: "이메일", default: false },
  { key: "address", label: "주소", default: false },
  { key: "school", label: "학교", default: false },
  { key: "initial_consult_date", label: "초기상담일시", default: false },
  { key: "member_no", label: "회원번호", default: true },
  { key: "referral_source", label: "유입경로", default: false },
  { key: "referral_note", label: "유입참고", default: false },
  { key: "status", label: "상태", default: true },
  { key: "note", label: "메모", default: false },
  { key: "last_modified_at", label: "최종수정", default: false },
];

const STORAGE_KEY = "b2b_clients_visible_cols_v1";

function renderCell(key: ColKey, r: Client) {
  switch (key) {
    case "gender": return <span className="text-neutral-700">{v(r.gender)}</span>;
    case "birth_date": return <span className="text-neutral-600 whitespace-nowrap">{v(r.birth_date)}</span>;
    case "age_months": return <span className="text-neutral-600">{v(r.meta?.age_months ?? r.meta?.age_text)}</span>;
    case "disability_info": return <span className="text-neutral-600">{v(r.disability_info)}</span>;
    case "disability_grade": return <span className="text-neutral-600">{v(r.meta?.disability_grade)}</span>;
    case "disability_secondary": return <span className="text-neutral-600">{v(r.meta?.disability_secondary)}</span>;
    case "phone": return <span className="text-neutral-600 whitespace-pre-line text-xs leading-snug">{v(r.meta?.contact_raw ?? [r.guardian_phone, r.phone].filter(Boolean).join(" / "))}</span>;
    case "email": return <span className="text-neutral-600">{v(r.meta?.email)}</span>;
    case "address": return <span className="text-neutral-600">{v(r.address)}</span>;
    case "school": return <span className="text-neutral-600">{v(r.meta?.school)}</span>;
    case "initial_consult_date": return <span className="text-neutral-600 whitespace-nowrap">{v(r.initial_consult_date)}</span>;
    case "member_no": return <span className="font-mono text-xs text-neutral-500">{v(r.member_no)}</span>;
    case "referral_source": return <span className="text-neutral-600">{v(r.meta?.referral_source)}</span>;
    case "referral_note": return <span className="text-neutral-600">{v(r.meta?.referral_note)}</span>;
    case "status":
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs border ${statusTone[r.status] ?? "bg-neutral-100"}`}>
          {statusLabel[r.status] ?? r.status}
        </span>
      );
    case "note": return <span className="text-neutral-600">{v(r.meta?.note)}</span>;
    case "last_modified_at": return <span className="text-neutral-600 whitespace-nowrap">{v(r.meta?.last_modified_at)}</span>;
  }
}

export default function ClientsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [inviteFor, setInviteFor] = useState<{ id: string; name: string } | null>(null);
  const [therapists, setTherapists] = useState<{ id: string; name: string }[]>([]);
  const [therapistClientIds, setTherapistClientIds] = useState<Record<string, Set<string>>>({});
  const [therapistFilter, setTherapistFilter] = useState<string>("all");



  const [visible, setVisible] = useState<Record<ColKey, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return Object.fromEntries(COLUMNS.map((c) => [c.key, c.default])) as Record<ColKey, boolean>;
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(visible)); } catch {}
  }, [visible]);

  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!colMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setColMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [colMenuOpen]);

  const load = useCallback(() => {
    if (demo) {
      setRows(DEMO_CLIENTS.map((c, i) => ({
        id: c.id, name: c.display_name, gender: i % 2 === 0 ? "남" : "여",
        birth_date: null, phone: null, guardian_phone: "010-****-****",
        address: null, disability_info: null, initial_consult_date: null,
        member_no: `2026-${String(i + 1).padStart(4, "0")}`, meta: null,
        status: c.status === "등록" ? "enrolled" : c.status === "대기" ? "waiting" : "terminated",
        created_at: "",
      })));
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase.from("center_clients").select("*").eq("center_id", centerId).order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as Client[];
        setRows(list);
        setLoading(false);
        if (list.length > 0) {
          supabase.from("center_onboarding_progress")
            .upsert({ center_id: centerId, step_key: "first_client_added" }, { onConflict: "center_id,step_key" })
            .then(() => {});
        }
      });
  }, [centerId, demo]);

  useEffect(() => { load(); }, [load]);

  // Load therapists + therapist→client map
  useEffect(() => {
    if (demo) return;
    (async () => {
      const [{ data: ths }, { data: sess }] = await Promise.all([
        supabase.from("center_therapists").select("id,name").eq("center_id", centerId).order("name"),
        supabase.from("center_sessions").select("therapist_id,client_id").eq("center_id", centerId),
      ]);
      setTherapists((ths ?? []) as { id: string; name: string }[]);
      const map: Record<string, Set<string>> = {};
      (sess ?? []).forEach((s: any) => {
        if (!s.therapist_id || !s.client_id) return;
        (map[s.therapist_id] ||= new Set()).add(s.client_id);
      });
      setTherapistClientIds(map);
    })();
  }, [centerId, demo]);

  async function handleDelete(client: Client) {
    if (demo) return;
    const snapshot = { ...client };
    const { error } = await supabase.from("center_clients").delete().eq("id", client.id);
    if (error) {
      sonnerToast.error("삭제 실패", { description: error.message });
      return;
    }
    setEditClient(null);
    setRows((p) => p.filter((r) => r.id !== client.id));
    sonnerToast.success(`'${snapshot.name}' 이용자 삭제됨`, {
      description: "10초 내에 되돌릴 수 있어요.",
      duration: 10000,
      action: {
        label: "되돌리기",
        onClick: async () => {
          const { id, created_at, ...rest } = snapshot as any;
          const { error: e2 } = await supabase.from("center_clients").insert({ id, ...rest });
          if (e2) {
            sonnerToast.error("되돌리기 실패", { description: e2.message });
            return;
          }
          sonnerToast.success("이용자 복구 완료");
          load();
        },
      },
    });
  }

  const filtered = rows.filter((r) => {
    if (filter !== "all" && statusCode(r.status) !== filter) return false;
    if (therapistFilter !== "all") {
      const set = therapistClientIds[therapistFilter];
      if (!set || !set.has(r.id)) return false;
    }
    if (q) {
      const needle = q.trim().toLowerCase();
      const digits = needle.replace(/\D/g, "");
      const hay = [
        r.name, r.member_no, r.phone, r.guardian_phone,
        r.meta?.contact_raw, r.meta?.email,
      ].filter(Boolean).map((v) => String(v).toLowerCase()).join(" ");
      const hayDigits = [r.phone, r.guardian_phone, r.meta?.contact_raw].filter(Boolean).join(" ").replace(/\D/g, "");
      const matchText = hay.includes(needle);
      const matchPhone = digits.length >= 3 && hayDigits.includes(digits);
      if (!matchText && !matchPhone) return false;
    }
    return true;

  });

  const counts = {
    waiting: rows.filter(r => statusCode(r.status) === "waiting").length,
    enrolled: rows.filter(r => statusCode(r.status) === "enrolled").length,
    terminated: rows.filter(r => statusCode(r.status) === "terminated").length,
  };

  const activeCols = useMemo(() => COLUMNS.filter((c) => visible[c.key]), [visible]);
  const visibleCount = activeCols.length;
  const totalCount = COLUMNS.length;
  const colSpan = activeCols.length + 2; // 이용자 + 컬럼들 + AIHPRO

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">이용자 관리</h1>
          <p className="text-sm text-neutral-500">총 {rows.length}명 · 등록 {counts.enrolled} · 대기 {counts.waiting} · 종결 {counts.terminated}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50">
            <Upload className="w-4 h-4" /> 엑셀 일괄 등록
          </button>
          <button onClick={() => setRegisterOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800">
            <UserPlus className="w-4 h-4" /> 이용자 등록
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["all", "enrolled", "waiting", "terminated"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm transition ${filter === s ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
            {s === "all" ? `전체 ${rows.length}` : `${statusLabel[s]} ${counts[s as keyof typeof counts]}`}
          </button>
        ))}
        <div className="ml-auto relative" ref={colMenuRef}>
          <button onClick={() => setColMenuOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50">
            <Settings2 className="w-4 h-4" /> 컬럼 <span className="text-neutral-400">{visibleCount}/{totalCount}</span>
          </button>
          {colMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-lg p-2 z-30">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-xs text-neutral-500">표시할 컬럼</span>
                <div className="flex gap-1">
                  <button onClick={() => setVisible(Object.fromEntries(COLUMNS.map((c) => [c.key, true])) as Record<ColKey, boolean>)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 px-1.5">전체</button>
                  <button onClick={() => setVisible(Object.fromEntries(COLUMNS.map((c) => [c.key, c.default])) as Record<ColKey, boolean>)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 px-1.5">기본</button>
                </div>
              </div>
              <div className="max-h-72 overflow-auto">
                {COLUMNS.map((c) => {
                  const on = visible[c.key];
                  return (
                    <button key={c.key} onClick={() => setVisible((p) => ({ ...p, [c.key]: !p[c.key] }))}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-50 text-sm">
                      <span className={on ? "text-neutral-900" : "text-neutral-400"}>{c.label}</span>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${on ? "bg-neutral-900 border-neutral-900" : "border-neutral-300"}`}>
                        {on && <Check className="w-3 h-3 text-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 · 회원번호 · 연락처로 검색"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400" />
        </div>
        {!demo && therapists.length > 0 && (
          <div className="relative">
            <Users className="w-4 h-4 absolute left-3 top-3 text-neutral-400 pointer-events-none" />
            <select
              value={therapistFilter}
              onChange={(e) => setTherapistFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:border-neutral-400 min-w-[200px]"
            >
              <option value="all">담당 치료사 전체</option>
              {therapists.map((t) => {
                const n = therapistClientIds[t.id]?.size ?? 0;
                return <option key={t.id} value={t.id}>{t.name} · {n}명</option>;
              })}
            </select>
          </div>
        )}
        {(q || therapistFilter !== "all") && (
          <button
            onClick={() => { setQ(""); setTherapistFilter("all"); }}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-600 hover:bg-neutral-50"
          >초기화</button>
        )}
      </div>


      <div className="bg-white rounded-2xl border border-neutral-200 overflow-auto max-h-[calc(100vh-260px)]">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead className="text-neutral-500 text-xs sticky top-0 z-20">
            <tr>
              <th className="text-left p-3 font-medium whitespace-nowrap border-b border-r border-neutral-200 bg-neutral-50 sticky left-0 z-30 min-w-[140px]">이용자</th>
              {activeCols.map((c) => (
                <th key={c.key} className="text-left p-3 font-medium whitespace-nowrap border-b border-neutral-200 bg-neutral-50">{c.label}</th>
              ))}
              <th className="text-right p-3 font-medium whitespace-nowrap border-b border-neutral-200 bg-neutral-50">AIHPRO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colSpan} className="p-12 text-center text-neutral-400">불러오는 중…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={colSpan} className="p-12 text-center text-neutral-400">
                <p className="mb-3">아직 등록된 이용자가 없습니다.</p>
                <div className="inline-flex gap-2">
                  <button onClick={() => setRegisterOpen(true)} className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm">이용자 등록</button>
                  <button onClick={() => setImportOpen(true)} className="px-4 py-2 rounded-full border border-neutral-200 text-sm">엑셀 일괄</button>
                </div>
              </td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} onClick={() => !demo && setEditClient(r)}
                className={`group ${demo ? "" : "cursor-pointer hover:bg-neutral-50/80"}`}>
                <td className="p-3 font-medium text-neutral-900 border-t border-r border-neutral-100 bg-white sticky left-0 z-10 group-hover:bg-neutral-50/80 whitespace-nowrap">
                  <span className={demo ? "" : "underline decoration-dotted decoration-neutral-300 underline-offset-4 group-hover:decoration-neutral-600"}>{r.name}</span>
                </td>

                {activeCols.map((c) => (
                  <td key={c.key} className="p-3 border-t border-neutral-100">{renderCell(c.key, r)}</td>
                ))}
                <td className="p-3 border-t border-neutral-100 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  {!BETA_MODE && (
                    <button onClick={() => setInviteFor({ id: r.id, name: r.name })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-[#FAF6E8] text-neutral-800 hover:bg-[#F0E8C8] border border-[#C8B88A]/30">
                      <Send className="w-3 h-3" /> 초대
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClientRegisterDialog
        open={registerOpen}
        centerId={centerId}
        demo={demo}
        onClose={() => setRegisterOpen(false)}
        onCreated={load}
      />

      <ClientRegisterDialog
        open={!!editClient}
        centerId={centerId}
        demo={demo}
        client={editClient}
        onClose={() => setEditClient(null)}
        onCreated={load}
      />


      {inviteFor && (
        <InviteParentDialog
          open={!!inviteFor}
          centerId={centerId}
          client={inviteFor}
          demo={demo}
          onClose={() => setInviteFor(null)}
        />
      )}

      {importOpen && (
        <ImportWizard
          demo={!!demo}
          centerId={centerId}
          onClose={() => setImportOpen(false)}
          onImported={load}
          onMergeDemo={() => { /* demo: 인메모리 병합은 일정표에서 처리 */ }}
        />
      )}
    </div>
  );
}
