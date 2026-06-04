import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };

type ImportKind = "therapists" | "clients" | "voucher_usage";

interface ParsedSheet {
  kind: ImportKind;
  headers: string[];
  rows: Record<string, any>[];
  fileName: string;
}

interface CardSpec {
  kind: ImportKind;
  title: string;
  caption: string;
  hint: string;
  table: string;
}

const CARDS: CardSpec[] = [
  {
    kind: "therapists",
    title: "제공인력 현황 조회",
    caption: "제공 인력 현황 엑셀 업로드",
    hint: "선생님 이름·직책·전공·연락처·생년월일 컬럼",
    table: "center_therapists",
  },
  {
    kind: "clients",
    title: "대상자 등록 현황 조회",
    caption: "대상자 등록 현황 엑셀 업로드",
    hint: "이용자명·생년월일·보호자 연락처·장애유형·등록번호",
    table: "center_clients",
  },
  {
    kind: "voucher_usage",
    title: "바우처 이용 내역 조회 (기존)",
    caption: "바우처 이용 내역 엑셀 업로드",
    hint: "이용일·이용자·선생님·회기 시간·바우처 차감",
    table: "center_sessions",
  },
];

// 한국 전자바우처 표준 컬럼명 매핑
const COLUMN_MAP: Record<ImportKind, Record<string, string>> = {
  therapists: {
    "성명": "name", "이름": "name", "선생님": "name",
    "직책": "title", "직급": "title",
    "전공": "specialty", "전문분야": "specialty", "자격": "specialty",
    "생년월일": "birth_date", "생일": "birth_date",
    "연락처": "phone", "휴대폰": "phone", "전화": "phone",
    "내선": "work_phone", "사무실": "work_phone",
    "아이디": "login_account", "계정": "login_account", "이메일": "login_account",
  },
  clients: {
    "성명": "name", "이름": "name", "대상자": "name", "이용자명": "name", "이용자": "name", "수혜자": "name",
    "성별": "gender",
    "생년월일": "birth_date", "생일": "birth_date",
    "개월수": "_age_text", "나이": "_age_text", "연령": "_age_text",
    "연락처": "phone", "본인연락처": "phone", "휴대전화": "phone", "전화번호": "phone",
    "보호자연락처": "guardian_phone", "보호자": "guardian_phone", "보호자전화": "guardian_phone",
    "이메일": "_email", "메일": "_email",
    "주소": "address",
    "학교": "_school", "재학중인학교": "_school", "소속": "_school",
    "장애유형": "disability_info", "장애": "disability_info", "장애정보": "disability_info",
    "장애등급": "_disability_grade",
    "중복장애내용": "_disability_secondary", "중복장애": "_disability_secondary",
    "초기상담일": "initial_consult_date", "상담일": "initial_consult_date", "초기상담일시": "initial_consult_date",
    "회원번호": "member_no", "등록번호": "member_no",
    "유입경로": "_referral_source", "경로": "_referral_source",
    "유입경로관련참고사항": "_referral_note", "유입참고": "_referral_note",
    "상태": "status",
    "메모": "_note", "비고": "_note", "특이사항": "_note",
    "최종수정일시": "_last_modified_at", "수정일시": "_last_modified_at",
  },
  voucher_usage: {
    "이용일": "session_date", "날짜": "session_date", "제공일": "session_date",
    "시작": "start_time", "시작시간": "start_time",
    "종료": "end_time", "종료시간": "end_time",
    "회기시간": "duration_min", "시간": "duration_min",
    "이용자": "_client_name", "대상자": "_client_name",
    "선생님": "_therapist_name", "제공인력": "_therapist_name", "치료사": "_therapist_name",
    "금액": "price_krw", "비용": "price_krw", "바우처금액": "price_krw",
    "비고": "note", "메모": "note",
  },
};

function normalizeKey(s: string) {
  return String(s ?? "").replace(/\s+/g, "").replace(/\(.*?\)/g, "").trim();
}

function parseDate(v: any): string | null {
  if (!v) return null;
  if (typeof v === "number") {
    // Excel serial
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(v).trim().replace(/\./g, "-").replace(/\//g, "-");
  const m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return null;
}

function parseTime(v: any): string | null {
  if (!v) return null;
  if (typeof v === "number") {
    const total = Math.round(v * 24 * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  }
  const s = String(v).trim();
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}:00`;
  return null;
}

function mapRow(kind: ImportKind, raw: Record<string, any>): Record<string, any> {
  const map = COLUMN_MAP[kind];
  const out: Record<string, any> = {};
  for (const [rawKey, val] of Object.entries(raw)) {
    const k = normalizeKey(rawKey);
    const target = map[k];
    if (target) out[target] = val;
  }
  // type coercion
  if (out.birth_date) out.birth_date = parseDate(out.birth_date);
  if (out.initial_consult_date) out.initial_consult_date = parseDate(out.initial_consult_date);
  if (out.session_date) out.session_date = parseDate(out.session_date);
  if (out.start_time) out.start_time = parseTime(out.start_time);
  if (out.end_time) out.end_time = parseTime(out.end_time);
  if (out.duration_min) out.duration_min = parseInt(String(out.duration_min).replace(/\D/g, ""), 10) || null;
  if (out.price_krw) out.price_krw = parseInt(String(out.price_krw).replace(/[^\d]/g, ""), 10) || null;
  return out;
}

export default function VoucherExcelImportPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const { toast } = useToast();
  const inputRefs = useRef<Record<ImportKind, HTMLInputElement | null>>({
    therapists: null,
    clients: null,
    voucher_usage: null,
  });
  const [preview, setPreview] = useState<ParsedSheet | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastImport, setLastImport] = useState<Record<ImportKind, { count: number; at: string } | null>>({
    therapists: null, clients: null, voucher_usage: null,
  });

  async function handleFile(kind: ImportKind, file: File) {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: false });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: null });
      const headers = rows.length ? Object.keys(rows[0]) : [];
      setPreview({ kind, headers, rows, fileName: file.name });
    } catch (e: any) {
      toast({ title: "엑셀을 읽지 못했어요", description: e?.message ?? String(e), variant: "destructive" });
    }
  }

  async function confirmImport() {
    if (!preview) return;
    if (demo) {
      toast({ title: "데모 모드", description: "실제 저장은 로그인 후 가능합니다." });
      setPreview(null);
      return;
    }
    setBusy(true);
    try {
      const mapped = preview.rows.map((r) => mapRow(preview.kind, r)).filter((r) => Object.keys(r).length > 0);

      if (preview.kind === "therapists") {
        const payload = mapped
          .filter((r) => r.name)
          .map((r) => ({ ...r, center_id: centerId }));
        if (!payload.length) throw new Error("저장할 행이 없어요. 컬럼명을 확인하세요.");
        const { error } = await supabase.from("center_therapists").insert(payload as any);
        if (error) throw error;
        setLastImport((s) => ({ ...s, therapists: { count: payload.length, at: new Date().toISOString() } }));
        toast({ title: `선생님 ${payload.length}명 등록 완료` });
      } else if (preview.kind === "clients") {
        // "(모) 010-1234-5678" → guardian_phone, "(본인) 010-..." → phone
        const splitPhone = (raw: any): { phone: string | null; guardian_phone: string | null } => {
          if (!raw) return { phone: null, guardian_phone: null };
          const s = String(raw).trim();
          if (!s) return { phone: null, guardian_phone: null };
          const phoneRe = /(\d{2,3}-?\d{3,4}-?\d{4})/;
          const num = (s.match(phoneRe)?.[1] ?? s).replace(/[^\d-]/g, "");
          const isGuardian = /\(?\s*(모|부|보호자|가족|조모|조부|언니|누나|형|오빠|이모|고모)\s*\)?/.test(s);
          const isSelf = /\(?\s*(본인|자녀|아이|당사자)\s*\)?/.test(s);
          if (isGuardian && !isSelf) return { phone: null, guardian_phone: num };
          return { phone: num, guardian_phone: null };
        };

        // 엑셀 상태 문자열 → DB 표준 (등록/대기/종결 외엔 그대로)
        const normalizeStatus = (s: any): string => {
          const v = String(s ?? "").trim();
          if (!v) return "등록";
          return v;
        };

        const payload = mapped
          .filter((r) => r.name)
          .map((r) => {
            const { phone, guardian_phone } = splitPhone(r.phone);
            // _ prefix 키는 모두 meta 로 모아 보관
            const meta: Record<string, any> = {};
            for (const [k, v] of Object.entries(r)) {
              if (!k.startsWith("_")) continue;
              if (v == null || String(v).trim() === "") continue;
              meta[k.slice(1)] = typeof v === "string" ? v.trim() : v;
            }
            return {
              center_id: centerId,
              name: String(r.name).trim(),
              gender: r.gender ?? null,
              birth_date: r.birth_date ?? null,
              phone: phone ?? r.phone ?? null,
              guardian_phone: guardian_phone ?? r.guardian_phone ?? null,
              address: r.address ?? null,
              disability_info: r.disability_info ?? null,
              initial_consult_date: r.initial_consult_date ?? null,
              member_no: r.member_no ?? null,
              status: normalizeStatus(r.status),
              meta: Object.keys(meta).length ? meta : {},
            };
          });
        if (!payload.length) throw new Error("저장할 행이 없어요. 컬럼명을 확인하세요.");
        // 동일 센터·동명·생년월일 이용자는 새 엑셀 값으로 보강 업데이트
        const { data: existing } = await supabase
          .from("center_clients").select("id,name,birth_date,meta").eq("center_id", centerId);
        const existKey = new Map((existing ?? []).map((c: any) => [`${c.name}|${c.birth_date ?? ""}`, c]));
        const toInsert = payload.filter((p) => !existKey.has(`${p.name}|${p.birth_date ?? ""}`));
        const toUpdate = payload
          .map((p) => ({ row: p, existing: existKey.get(`${p.name}|${p.birth_date ?? ""}`) }))
          .filter((x) => x.existing)
          .map(({ row, existing }: any) => ({
            id: existing.id,
            payload: Object.fromEntries(Object.entries({ ...row, center_id: undefined, meta: { ...(existing.meta ?? {}), ...(row.meta ?? {}) } }).filter(([_, v]) => v != null && String(v).trim() !== "")),
          }));
        if (toInsert.length) {
          const { error } = await supabase.from("center_clients").insert(toInsert as any);
          if (error) throw error;
        }
        for (const u of toUpdate) {
          const { error } = await supabase.from("center_clients").update(u.payload as any).eq("id", u.id);
          if (error) throw error;
        }
        setLastImport((s) => ({ ...s, clients: { count: toInsert.length + toUpdate.length, at: new Date().toISOString() } }));
        toast({
          title: `이용자 ${toInsert.length + toUpdate.length}명 반영 완료`,
          description: toUpdate.length ? `신규 ${toInsert.length}명 · 기존 ${toUpdate.length}명 업데이트` : undefined,
        });
      } else {
        // voucher_usage → center_sessions (이름 → ID 매칭 + 누락 시 자동 생성)
        const { data: clients } = await supabase.from("center_clients").select("id, name").eq("center_id", centerId);
        const { data: therapists } = await supabase.from("center_therapists").select("id, name").eq("center_id", centerId);
        const cMap = new Map((clients ?? []).map((c: any) => [c.name, c.id]));
        const tMap = new Map((therapists ?? []).map((t: any) => [t.name, t.id]));

        // "임동현치료사 / 특수체육치료사" → name="임동현치료사", title="특수체육치료사"
        const parseTherapistCell = (v: any): { name: string; title: string | null } | null => {
          if (!v) return null;
          const raw = String(v).trim();
          if (!raw) return null;
          const [namePart, titlePart] = raw.split("/").map((x) => x.trim());
          return { name: namePart || raw, title: titlePart || null };
        };

        // 누락된 선생님 자동 생성
        const missingTherapists = new Map<string, { name: string; title: string | null }>();
        for (const r of mapped) {
          const t = parseTherapistCell(r._therapist_name);
          if (t && !tMap.has(t.name) && !missingTherapists.has(t.name)) missingTherapists.set(t.name, t);
        }
        if (missingTherapists.size) {
          const insertT = Array.from(missingTherapists.values()).map((t) => ({
            center_id: centerId, name: t.name, title: t.title, specialty: t.title,
          }));
          const { data: createdT } = await supabase.from("center_therapists").insert(insertT as any).select("id,name");
          (createdT ?? []).forEach((t: any) => tMap.set(t.name, t.id));
        }

        const payload: any[] = [];
        const skipped: string[] = [];
        for (const r of mapped) {
          const cid = r._client_name ? cMap.get(String(r._client_name).trim()) : null;
          const t = parseTherapistCell(r._therapist_name);
          const tid = t ? tMap.get(t.name) ?? null : null;
          if (!cid || !r.session_date) {
            skipped.push(`${r._client_name ?? "?"} ${r.session_date ?? "?"}`);
            continue;
          }
          payload.push({
            center_id: centerId,
            client_id: cid,
            therapist_id: tid,
            session_date: r.session_date,
            start_time: r.start_time,
            end_time: r.end_time,
            duration_min: r.duration_min,
            price_krw: r.price_krw,
            note: r.note,
            is_voucher: true,
            status: "completed",
          });
        }
        if (!payload.length) throw new Error("매칭되는 이용자가 없어요. 먼저 이용자 엑셀을 업로드하세요.");
        const { error } = await supabase.from("center_sessions").insert(payload);
        if (error) throw error;
        setLastImport((s) => ({ ...s, voucher_usage: { count: payload.length, at: new Date().toISOString() } }));
        toast({
          title: `회기 ${payload.length}건 동기화 완료`,
          description: skipped.length
            ? `매칭 실패 ${skipped.length}건은 건너뜀`
            : (missingTherapists.size ? `선생님 ${missingTherapists.size}명 자동 등록됨` : undefined),
        });
      }
      setPreview(null);
    } catch (e: any) {
      toast({ title: "동기화 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <p className="text-xs tracking-widest text-[#C8B88A] mb-2">VOUCHER · EXCEL SYNC</p>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">전자바우처 엑셀 등록</h1>
        <p className="text-sm text-neutral-600 break-keep">
          사회서비스 전자바우처 시스템에서 받은 엑셀 파일을 그대로 올리면 이용자·선생님·회기 데이터가 자동으로 동기화돼요.
          업로드한 파일은 즉시 미리보기로 확인한 뒤 저장 버튼을 눌러야 반영됩니다.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {/* dark header strip like Vouchery */}
        <div className="grid grid-cols-3 bg-neutral-900 text-white text-sm">
          {CARDS.map((c) => (
            <div key={c.kind} className="px-6 py-3 text-center border-l first:border-l-0 border-white/10 font-medium">
              {c.title}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3">
          {CARDS.map((c) => {
            const last = lastImport[c.kind];
            return (
              <div key={c.kind} className="p-8 border-l first:border-l-0 border-neutral-200 flex flex-col items-center text-center gap-3">
                <input
                  ref={(el) => (inputRefs.current[c.kind] = el)}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(c.kind, f);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  onClick={() => inputRefs.current[c.kind]?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  <Upload className="w-4 h-4" /> {c.caption}
                </button>
                <p className="text-xs text-neutral-500 break-keep">{c.hint}</p>
                {last && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> 최근 {last.count}건 동기화됨
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Help strip */}
      <div className="mt-6 bg-[#FAF6E8] border border-[#C8B88A]/30 rounded-2xl p-5 flex gap-3">
        <FileText className="w-5 h-5 text-[#8C7A3D] shrink-0 mt-0.5" />
        <div className="text-sm text-neutral-800 break-keep">
          <p className="font-medium mb-1">권장 업로드 순서</p>
          <p className="text-neutral-600">
            1) 제공인력 → 2) 대상자 → 3) 바우처 이용내역. 회기 데이터는 이름으로 이용자·선생님을 자동 매칭하므로 앞 단계를 먼저 끝내야 매칭률이 올라갑니다.
          </p>
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={() => !busy && setPreview(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-xs text-[#C8B88A] mb-1">
                <FileSpreadsheet className="w-4 h-4" /> 미리보기
              </div>
              <h2 className="text-lg font-semibold">{preview.fileName}</h2>
              <p className="text-sm text-neutral-600 mt-1">총 {preview.rows.length}행 · 컬럼 {preview.headers.length}개</p>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {preview.rows.length === 0 ? (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4" /> 비어있는 파일입니다.
                </div>
              ) : (
                <table className="w-full text-xs border border-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      {preview.headers.map((h) => (
                        <th key={h} className="px-2 py-1.5 text-left font-medium border-b border-neutral-200 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-b border-neutral-100">
                        {preview.headers.map((h) => (
                          <td key={h} className="px-2 py-1 whitespace-nowrap text-neutral-700">{String(r[h] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {preview.rows.length > 20 && (
                <p className="text-xs text-neutral-500 mt-2">… 외 {preview.rows.length - 20}행</p>
              )}
            </div>
            <div className="p-6 border-t border-neutral-200 flex justify-end gap-2">
              <button onClick={() => setPreview(null)} disabled={busy} className="px-4 py-2 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">취소</button>
              <button onClick={confirmImport} disabled={busy || preview.rows.length === 0} className="px-5 py-2 rounded-full bg-neutral-900 text-white text-sm hover:bg-neutral-800 inline-flex items-center gap-2 disabled:opacity-50">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {busy ? "동기화 중…" : "이대로 저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
