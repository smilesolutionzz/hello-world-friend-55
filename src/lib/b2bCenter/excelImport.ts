import * as XLSX from "xlsx";

/**
 * 엑셀 import — 케어플 다운로드 포맷 + AIHPRO 표준 템플릿 자동 감지
 * 모든 매핑은 헤더 시그니처 기반.
 */

export type ImportSheet = {
  name: string;
  rows: Record<string, any>[];
  headers: string[];
};

export type ImportEntity = "clients" | "therapists" | "programs" | "vouchers" | "sessions" | "payments" | "assessments";

export type DetectedSheet = {
  source: string;          // 원본 시트명
  entity: ImportEntity;
  rows: Record<string, any>[]; // 정규화된 행 (entity 표준 필드)
};

export interface ParsedWorkbook {
  format: "careple" | "aihpro" | "unknown";
  sheets: DetectedSheet[];
  rawSheets: ImportSheet[];
}

// ===== 헤더 시그니처 =====
const SIG: Record<ImportEntity, RegExp[]> = {
  clients: [/이름/, /성별|남.?여/, /생년월일|생일/],
  therapists: [/(선생님|치료사|강사).*(이름|성명)|성명|이름/, /(전공|분야|구분)/],
  programs: [/(프로그램|과목)/, /(시간|분)/, /(금액|단가|비용)/],
  vouchers: [/바우처/, /(시작|유효).*(일|기간)/],
  sessions: [/(일자|날짜)/, /(시간|시작)/, /(이용자|회원|성명|이름)/, /(치료사|선생님)/],
  payments: [/(수납|결제).*(일|날짜)|결제일|수납일/, /(금액|결제금액|수납금액)/],
  assessments: [/(상담|평가)/, /(날짜|일자)/],
};

function detectEntity(headers: string[]): ImportEntity | null {
  const joined = headers.join("|");
  const scores: Record<string, number> = {};
  for (const [ent, regs] of Object.entries(SIG)) {
    scores[ent] = regs.filter((r) => r.test(joined)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] < 2) return null;
  return best[0] as ImportEntity;
}

// ===== 컬럼 매핑 (한글 → 표준 키) =====
const COL_MAP: Record<string, string> = {
  "이름": "name", "성명": "name",
  "성별": "gender",
  "생년월일": "birth_date", "생일": "birth_date",
  "전화번호": "phone", "휴대전화": "phone", "연락처": "phone",
  "보호자전화": "guardian_phone", "보호자연락처": "guardian_phone",
  "주소": "address",
  "장애정보": "disability_info", "장애유형": "disability_info",
  "상태": "status",
  "회원번호": "member_no",
  "직급": "title", "호칭": "title",
  "전공": "specialty", "분야": "specialty", "구분": "specialty",
  "프로그램": "program_name", "프로그램명": "program_name",
  "카테고리": "category", "과목": "category",
  "시간": "duration_min", "1회시간": "duration_min",
  "단가": "price_krw", "금액": "price_krw", "1회비용": "price_krw", "수납금액": "amount_krw", "결제금액": "amount_krw",
  "바우처여부": "is_voucher",
  "바우처유형": "voucher_type", "바우처종류": "voucher_type",
  "바우처번호": "voucher_no",
  "시작일": "valid_from", "유효시작": "valid_from",
  "종료일": "valid_until", "유효종료": "valid_until", "만료일": "valid_until",
  "월한도": "monthly_amount", "월금액": "monthly_amount",
  "본인부담": "copayment", "본인부담금": "copayment",
  "날짜": "session_date", "일자": "session_date", "회기일": "session_date",
  "시작시간": "start_time",
  "종료시간": "end_time",
  "이용자": "client_name", "회원": "client_name", "이용자명": "client_name",
  "치료사": "therapist_name", "선생님": "therapist_name", "담당": "therapist_name",
  "메모": "note", "기록": "note", "특이사항": "note",
  "수납일": "paid_at", "결제일": "paid_at",
  "결제방법": "method", "결제수단": "method",
  "영수증번호": "receipt_no",
  "상담일": "assessment_date", "평가일": "assessment_date",
  "상담유형": "assessment_type", "평가유형": "assessment_type",
  "내용": "content",
};

function normalizeRow(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = COL_MAP[k.trim()] ?? k.trim();
    out[key] = v;
  }
  return out;
}

// ===== 메인 파서 =====
export async function parseWorkbook(file: File): Promise<ParsedWorkbook> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });

  const rawSheets: ImportSheet[] = wb.SheetNames.map((name) => {
    const sheet = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null, raw: false });
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { name, rows, headers };
  });

  // AIHPRO 표준: 시트명이 표준 키
  const aihproSheetNames = new Set(["clients", "therapists", "programs", "vouchers", "sessions", "payments", "assessments"]);
  const aihproHits = rawSheets.filter((s) => aihproSheetNames.has(s.name.toLowerCase()));

  let detected: DetectedSheet[] = [];
  let format: ParsedWorkbook["format"] = "unknown";

  if (aihproHits.length >= 2) {
    format = "aihpro";
    detected = aihproHits.map((s) => ({
      source: s.name,
      entity: s.name.toLowerCase() as ImportEntity,
      rows: s.rows.map(normalizeRow),
    }));
  } else {
    // 케어플 자동 감지
    for (const s of rawSheets) {
      const ent = detectEntity(s.headers);
      if (ent) {
        detected.push({ source: s.name, entity: ent, rows: s.rows.map(normalizeRow) });
      }
    }
    if (detected.length > 0) format = "careple";
  }

  return { format, sheets: detected, rawSheets };
}

// ===== Supabase 배치 업서트 =====
import { supabase } from "@/integrations/supabase/client";

export async function commitImport(
  centerId: string,
  parsed: ParsedWorkbook,
  filename: string,
): Promise<{ jobId: string; summary: Record<string, number> }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: job, error: jobErr } = await supabase
    .from("center_import_jobs")
    .insert({
      center_id: centerId,
      user_id: user.id,
      filename,
      detected_format: parsed.format,
      status: "processing",
    })
    .select()
    .single();
  if (jobErr) throw jobErr;

  const summary: Record<string, number> = {};

  // 1) Clients
  const clientsSheet = parsed.sheets.find((s) => s.entity === "clients");
  const clientNameToId: Record<string, string> = {};
  if (clientsSheet) {
    const rows = clientsSheet.rows
      .filter((r) => r.name)
      .map((r) => ({
        center_id: centerId,
        name: String(r.name).trim(),
        gender: r.gender ?? null,
        birth_date: parseDate(r.birth_date),
        phone: r.phone ?? null,
        guardian_phone: r.guardian_phone ?? null,
        address: r.address ?? null,
        disability_info: r.disability_info ?? null,
        status: mapClientStatus(r.status),
        member_no: r.member_no ?? null,
      }));
    if (rows.length) {
      const { data, error } = await supabase.from("center_clients").insert(rows).select("id,name");
      if (error) throw error;
      data?.forEach((c: any) => { clientNameToId[c.name] = c.id; });
      summary.clients = data?.length ?? 0;
    }
  }

  // 2) Therapists
  const tSheet = parsed.sheets.find((s) => s.entity === "therapists");
  const therapistNameToId: Record<string, string> = {};
  if (tSheet) {
    const rows = tSheet.rows
      .filter((r) => r.name)
      .map((r) => ({
        center_id: centerId,
        name: String(r.name).trim(),
        title: r.title ?? null,
        specialty: r.specialty ?? null,
        birth_date: parseDate(r.birth_date),
        phone: r.phone ?? null,
      }));
    if (rows.length) {
      const { data, error } = await supabase.from("center_therapists").insert(rows).select("id,name");
      if (error) throw error;
      data?.forEach((t: any) => { therapistNameToId[t.name] = t.id; });
      summary.therapists = data?.length ?? 0;
    }
  }

  // 3) Programs
  const pSheet = parsed.sheets.find((s) => s.entity === "programs");
  const programNameToId: Record<string, string> = {};
  if (pSheet) {
    const rows = pSheet.rows
      .filter((r) => r.program_name || r.name)
      .map((r) => ({
        center_id: centerId,
        category: r.category ?? "기타",
        name: String(r.program_name ?? r.name).trim(),
        duration_min: parseInt(r.duration_min) || 45,
        price_krw: parseInt(r.price_krw) || 0,
        is_voucher: !!r.is_voucher,
      }));
    if (rows.length) {
      const { data, error } = await supabase.from("center_programs").insert(rows).select("id,name");
      if (error) throw error;
      data?.forEach((p: any) => { programNameToId[p.name] = p.id; });
      summary.programs = data?.length ?? 0;
    }
  }

  // 4) Sessions
  const sSheet = parsed.sheets.find((s) => s.entity === "sessions");
  if (sSheet) {
    const rows = sSheet.rows
      .filter((r) => r.session_date && (r.client_name || r.name))
      .map((r) => {
        const clientName = String(r.client_name ?? r.name).trim();
        const therapistName = r.therapist_name ? String(r.therapist_name).trim() : null;
        const programName = r.program_name ? String(r.program_name).trim() : null;
        return {
          center_id: centerId,
          client_id: clientNameToId[clientName],
          therapist_id: therapistName ? therapistNameToId[therapistName] ?? null : null,
          program_id: programName ? programNameToId[programName] ?? null : null,
          session_date: parseDate(r.session_date),
          start_time: parseTime(r.start_time),
          end_time: parseTime(r.end_time),
          status: mapSessionStatus(r.status),
          is_voucher: !!r.is_voucher,
          price_krw: parseInt(r.price_krw) || 0,
          note: r.note ?? null,
        };
      })
      .filter((r) => r.client_id);
    if (rows.length) {
      const { data, error } = await supabase.from("center_sessions").insert(rows).select("id");
      if (error) throw error;
      summary.sessions = data?.length ?? 0;
    }
  }

  // 5) Payments
  const payS = parsed.sheets.find((s) => s.entity === "payments");
  if (payS) {
    const rows = payS.rows
      .filter((r) => r.paid_at)
      .map((r) => {
        const clientName = r.client_name ? String(r.client_name).trim() : null;
        return {
          center_id: centerId,
          client_id: clientName ? clientNameToId[clientName] ?? null : null,
          paid_at: parseDate(r.paid_at),
          amount_krw: parseInt(r.amount_krw) || 0,
          voucher_amount: parseInt(r.voucher_amount) || 0,
          copayment: parseInt(r.copayment) || 0,
          method: r.method ?? null,
          receipt_no: r.receipt_no ?? null,
        };
      });
    if (rows.length) {
      const { data, error } = await supabase.from("center_payments").insert(rows).select("id");
      if (error) throw error;
      summary.payments = data?.length ?? 0;
    }
  }

  await supabase
    .from("center_import_jobs")
    .update({ status: "done", summary, completed_at: new Date().toISOString() })
    .eq("id", job.id);

  return { jobId: job.id, summary };
}

function parseDate(v: any): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  if (!s) return null;
  const m = s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function parseTime(v: any): string | null {
  if (!v) return null;
  const s = String(v).trim();
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}:00`;
  return null;
}

function mapClientStatus(v: any): string {
  const s = String(v ?? "").trim();
  if (/대기/.test(s)) return "waiting";
  if (/종결|종료/.test(s)) return "terminated";
  if (/등록|진행/.test(s)) return "enrolled";
  return "waiting";
}
function mapSessionStatus(v: any): string {
  const s = String(v ?? "").trim();
  if (/완료/.test(s)) return "completed";
  if (/취소이월|이월/.test(s)) return "cancelled_carry";
  if (/보강/.test(s)) return "cancelled_makeup";
  if (/취소/.test(s)) return "cancelled";
  return "scheduled";
}

// ===== AIHPRO 표준 템플릿 다운로드 =====
export function downloadStandardTemplate() {
  const wb = XLSX.utils.book_new();
  const sheets: Record<string, any[][]> = {
    clients: [["이름", "성별", "생년월일", "전화번호", "보호자전화", "주소", "장애정보", "상태", "회원번호"]],
    therapists: [["이름", "직급", "전공", "생년월일", "전화번호"]],
    programs: [["프로그램명", "카테고리", "1회시간", "단가", "바우처여부"]],
    vouchers: [["이용자", "바우처유형", "바우처번호", "시작일", "종료일", "월한도", "본인부담"]],
    sessions: [["날짜", "시작시간", "종료시간", "이용자", "치료사", "프로그램", "상태", "메모"]],
    payments: [["수납일", "이용자", "결제금액", "본인부담", "결제방법", "영수증번호"]],
    assessments: [["상담일", "이용자", "치료사", "상담유형", "내용"]],
  };
  for (const [name, rows] of Object.entries(sheets)) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  XLSX.writeFile(wb, "AIHPRO_center_template.xlsx");
}
