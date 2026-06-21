import * as XLSX from "xlsx";

/**
 * 엑셀 import — 케어플 다운로드 포맷 + AIHPRO 표준 템플릿 자동 감지
 * 모든 매핑은 헤더 시그니처 기반. + 컬럼 매핑 오버라이드 / 중복 처리 전략 지원.
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

export type DuplicateStrategy = "skip" | "overwrite" | "merge";

export interface ImportOptions {
  duplicateStrategy?: DuplicateStrategy;
  // 사용자 정의 컬럼 매핑: { "엑셀헤더": "표준키" } — 세션 시트에 적용
  sessionColumnMap?: Record<string, string>;
}

// ===== 헤더 시그니처 =====
const SIG: Record<ImportEntity, RegExp[]> = {
  clients: [/이름|이용자|대상자|수혜자|성명/, /성별|남.?여/, /생년월일|생일/],
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
  "개월수": "age_months", "나이": "age_months", "연령": "age_months",
  "전화번호": "phone", "휴대전화": "phone", "연락처": "phone", "본인연락처": "phone",
  "보호자전화": "guardian_phone", "보호자연락처": "guardian_phone", "보호자": "guardian_phone",
  "이메일": "email", "메일": "email",
  "주소": "address",
  "학교": "school", "재학중인학교": "school", "소속": "school",
  "장애정보": "disability_info", "장애유형": "disability_info", "장애": "disability_info",
  "장애등급": "disability_grade",
  "중복장애내용": "disability_secondary", "중복장애": "disability_secondary",
  "초기상담일": "initial_consult_date", "초기상담일시": "initial_consult_date",
  "상태": "status",
  "회원번호": "member_no", "등록번호": "member_no",
  "유입경로": "referral_source", "경로": "referral_source",
  "유입경로관련참고사항": "referral_note", "유입참고": "referral_note",
  "최종수정일시": "last_modified_at", "수정일시": "last_modified_at",
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
  "이용자": "client_name", "회원": "client_name", "이용자명": "client_name", "대상자": "client_name", "수혜자": "client_name",
  "치료사": "therapist_name", "선생님": "therapist_name", "담당": "therapist_name",
  "메모": "note", "기록": "note", "특이사항": "note", "비고": "note",
  "수납일": "paid_at", "결제일": "paid_at",
  "결제방법": "method", "결제수단": "method",
  "영수증번호": "receipt_no",
  "상담일": "assessment_date", "평가일": "assessment_date",
  "상담유형": "assessment_type", "평가유형": "assessment_type",
  "내용": "content",
};

function normalizeRow(row: Record<string, any>, override?: Record<string, string>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const trimmed = k.trim();
    const compact = trimmed.replace(/\s+/g, "").replace(/\(.*?\)/g, "").trim();
    const key = override?.[trimmed] ?? override?.[compact] ?? COL_MAP[trimmed] ?? COL_MAP[compact] ?? trimmed;
    out[key] = v;
  }
  return out;
}

// ===== 케어플 "월서비스관리_YYYYMM" 어댑터 =====
const VOUCHER_KEYWORDS = /바우처|교육청|우리아이심리지원|장애인스포츠강좌|기관협약|발달재활/;

function parseStatusCounts(s: string): Array<{ status: string; count: number }> {
  if (!s) return [];
  const out: Array<{ status: string; count: number }> = [];
  const re = /(예정|완료|취소\(보강\)|취소이월|이월|취소)\s*\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    out.push({ status: m[1], count: parseInt(m[2], 10) || 0 });
  }
  return out;
}

function statusToCode(s: string): "scheduled" | "completed" | "cancelled" | "cancelled_carry" | "cancelled_makeup" {
  if (s === "완료") return "completed";
  if (s === "예정") return "scheduled";
  if (s === "취소(보강)") return "cancelled_makeup";
  if (s === "취소이월" || s === "이월") return "cancelled_carry";
  return "cancelled";
}

function parseTherapistCell(v: any): { name: string; title: string | null } | null {
  if (!v) return null;
  const raw = String(v).trim();
  if (!raw) return null;
  const [namePart, titlePart] = raw.split("/").map((x) => x.trim());
  return { name: namePart || raw, title: titlePart || null };
}

function parseProgramCell(v: any): { category: string; name: string; is_voucher: boolean; raw: string } | null {
  if (!v) return null;
  const raw = String(v).trim();
  if (!raw) return null;
  const noBracket = raw.replace(/\s*\[.*?\]\s*$/, "").trim();
  const dash = noBracket.indexOf("-");
  const category = dash > 0 ? noBracket.slice(0, dash).trim() : "기타";
  const sub = dash > 0 ? noBracket.slice(dash + 1).trim() : noBracket;
  return { category, name: `${category}-${sub}`, is_voucher: VOUCHER_KEYWORDS.test(sub), raw };
}

function careplMonthlySheet(wb: XLSX.WorkBook): { sheetName: string; aoa: any[][] } | null {
  for (const name of wb.SheetNames) {
    if (!/^월서비스관리/.test(name)) continue;
    const aoa = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[name], { header: 1, defval: null, raw: false });
    return { sheetName: name, aoa };
  }
  for (const name of wb.SheetNames) {
    const aoa = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[name], { header: 1, defval: null, raw: false });
    const header = (aoa[1] ?? []).map((x) => String(x ?? "").trim());
    const must = ["이용자", "생년월일", "선생님", "프로그램", "총회기", "진행상태"];
    if (must.every((k) => header.includes(k))) return { sheetName: name, aoa };
  }
  return null;
}

function parseCareplMonthly(sheetName: string, aoa: any[][]): DetectedSheet[] {
  const header = (aoa[1] ?? []).map((x) => String(x ?? "").trim());
  const idx = (k: string) => header.indexOf(k);
  const iClient = idx("이용자");
  const iBirth = idx("생년월일");
  const iTherapist = idx("선생님");
  const iProgram = idx("프로그램");
  const iDuration = idx("1회시간(분)");
  const iPriceOne = idx("1회 서비스 금액");
  const iCopay = idx("본인부담금");
  const iStatus = idx("진행상태");
  const iCarry = idx("전월이월회기");
  const iNote = idx("메모");

  const monthMatch = sheetName.match(/(\d{4})(\d{2})/);
  const year = monthMatch ? parseInt(monthMatch[1], 10) : new Date().getFullYear();
  const month = monthMatch ? parseInt(monthMatch[2], 10) : new Date().getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  const clientsMap = new Map<string, any>();
  const therapistsMap = new Map<string, any>();
  const programsMap = new Map<string, any>();
  const sessions: any[] = [];

  for (let r = 2; r < aoa.length; r++) {
    const row = aoa[r];
    if (!row || row.every((c) => c == null || String(c).trim() === "")) continue;
    const clientName = String(row[iClient] ?? "").trim();
    if (!clientName) continue;
    const birth = row[iBirth] ? String(row[iBirth]).trim() : null;
    const therapist = parseTherapistCell(row[iTherapist]);
    const program = parseProgramCell(row[iProgram]);
    const duration = parseInt(row[iDuration]) || 45;
    const priceOne = parseInt(row[iPriceOne]) || 0;
    const copay = parseInt(row[iCopay]) || 0;
    const statusStr = String(row[iStatus] ?? "").trim();
    const carry = parseInt(row[iCarry]) || 0;
    const note = row[iNote] ? String(row[iNote]).trim() : null;

    const cKey = `${clientName}|${birth ?? ""}`;
    if (!clientsMap.has(cKey)) clientsMap.set(cKey, { name: clientName, birth_date: birth, status: "등록" });
    if (therapist && !therapistsMap.has(therapist.name)) therapistsMap.set(therapist.name, { name: therapist.name, title: therapist.title, specialty: therapist.title });
    let programKey: string | null = null;
    if (program) {
      programKey = `${program.name}|${duration}|${priceOne}`;
      if (!programsMap.has(programKey)) {
        programsMap.set(programKey, { name: program.name, category: program.category, duration_min: duration, price_krw: priceOne, is_voucher: program.is_voucher });
      }
    }

    const counts = parseStatusCounts(statusStr);
    const total = counts.reduce((s, c) => s + c.count, 0) || 0;
    if (total === 0) continue;
    let i = 0;
    for (const { status, count } of counts) {
      const code = statusToCode(status);
      for (let k = 0; k < count; k++) {
        const day = Math.min(daysInMonth, 1 + Math.floor((i / Math.max(total, 1)) * (daysInMonth - 1)));
        i++;
        sessions.push({
          client_name: clientName,
          client_birth_date: birth,
          therapist_name: therapist?.name ?? null,
          program_name: program?.name ?? null,
          session_date: `${monthStr}-${String(day).padStart(2, "0")}`,
          start_time: null,
          end_time: null,
          status: code,
          is_voucher: program?.is_voucher ?? false,
          price_krw: priceOne,
          copayment: copay,
          carry_over: carry,
          note,
        });
      }
    }
  }

  return [
    { source: `${sheetName} → 이용자`, entity: "clients", rows: Array.from(clientsMap.values()) },
    { source: `${sheetName} → 치료사`, entity: "therapists", rows: Array.from(therapistsMap.values()) },
    { source: `${sheetName} → 프로그램`, entity: "programs", rows: Array.from(programsMap.values()) },
    { source: `${sheetName} → 회기 (${sessions.length}건, ${monthStr})`, entity: "sessions", rows: sessions },
  ];
}

// ===== 케어플 "일일서비스관리_YYYY-MM-DD-YYYY-MM-DD" 어댑터 =====
// 선생님 컬럼은 케어플 버전에 따라 "선생님" / "치료사" / "담당" / "담당자" / "담당치료사" 로 다를 수 있다.
const THERAPIST_ALIASES = ["선생님", "치료사", "담당", "담당자", "담당치료사"];
function findHeaderAlias(header: string[], aliases: string[]): number {
  for (const a of aliases) {
    const i = header.indexOf(a);
    if (i >= 0) return i;
  }
  return -1;
}
function careplDailySheet(wb: XLSX.WorkBook): { sheetName: string; aoa: any[][] } | null {
  // 표준 템플릿 = 케어플 "일일서비스관리" 1시트 포맷
  // 헤더: 이용자 / 생년월일 / 선생님(또는 치료사/담당) / 프로그램 / 일자 / 시작시간 / 종료시간 / 상태
  // (시트명·1~3행의 요약 텍스트는 무시한다)
  const wantStrict = ["이용자", "프로그램", "일자", "시작시간", "종료시간", "상태"];
  for (const name of wb.SheetNames) {
    const aoa = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[name], { header: 1, defval: null, raw: false });
    for (const headerRow of [0, 1, 2, 3]) {
      const header = (aoa[headerRow] ?? []).map((x) => String(x ?? "").trim());
      const hasTherapist = findHeaderAlias(header, THERAPIST_ALIASES) >= 0;
      if (wantStrict.every((k) => header.includes(k)) && hasTherapist) {
        return { sheetName: name, aoa: aoa.slice(headerRow) };
      }
    }
  }
  return null;
}



function parseCareplDaily(sheetName: string, aoa: any[][]): DetectedSheet[] {
  const header = (aoa[0] ?? []).map((x) => String(x ?? "").trim());
  const idx = (k: string) => header.indexOf(k);
  const iClient = idx("이용자");
  const iBirth = idx("생년월일");
  const iTherapist = findHeaderAlias(header, THERAPIST_ALIASES);
  const iProgram = idx("프로그램");
  const iDate = idx("일자");
  const iStart = idx("시작시간");
  const iEnd = idx("종료시간");
  const iStatus = idx("상태");

  const clientsMap = new Map<string, any>();
  const therapistsMap = new Map<string, any>();
  const programsMap = new Map<string, any>();
  const sessions: any[] = [];

  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r];
    if (!row || row.every((c) => c == null || String(c).trim() === "")) continue;
    const clientName = String(row[iClient] ?? "").trim();
    if (!clientName) continue;
    const birth = row[iBirth] ? String(row[iBirth]).trim() : null;
    const therapist = parseTherapistCell(row[iTherapist]);
    const program = parseProgramCell(row[iProgram]);
    const dateRaw = row[iDate] ? String(row[iDate]).trim() : null;
    if (!dateRaw) continue;
    const m = dateRaw.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
    const sessionDate = m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : dateRaw;
    const start = row[iStart] ? String(row[iStart]).trim() : null;
    const end = row[iEnd] ? String(row[iEnd]).trim() : null;
    const statusStr = String(row[iStatus] ?? "").trim();

    const cKey = `${clientName}|${birth ?? ""}`;
    if (!clientsMap.has(cKey)) clientsMap.set(cKey, { name: clientName, birth_date: birth, status: "등록" });
    if (therapist && !therapistsMap.has(therapist.name)) therapistsMap.set(therapist.name, { name: therapist.name, title: therapist.title, specialty: therapist.title });
    if (program) {
      const pKey = program.name;
      if (!programsMap.has(pKey)) programsMap.set(pKey, { name: program.name, category: program.category, is_voucher: program.is_voucher });
    }

    sessions.push({
      client_name: clientName,
      client_birth_date: birth,
      therapist_name: therapist?.name ?? null,
      program_name: program?.name ?? null,
      session_date: sessionDate,
      start_time: start,
      end_time: end,
      status: statusToCode(statusStr),
      is_voucher: program?.is_voucher ?? false,
    });
  }

  return [
    { source: `${sheetName} → 이용자`, entity: "clients", rows: Array.from(clientsMap.values()) },
    { source: `${sheetName} → 치료사`, entity: "therapists", rows: Array.from(therapistsMap.values()) },
    { source: `${sheetName} → 프로그램`, entity: "programs", rows: Array.from(programsMap.values()) },
    { source: `${sheetName} → 회기 (${sessions.length}건)`, entity: "sessions", rows: sessions },
  ];
}

// 이용자관리 등 별도 시트에서 풍부한 클라이언트 행 추출
function extractRichClientSheets(rawSheets: ImportSheet[], excludeName?: string): Record<string, any>[] {
  const rich: Record<string, any>[] = [];
  for (const s of rawSheets) {
    if (excludeName && s.name === excludeName) continue;
    if (!s.headers?.length) continue;
    if (detectEntity(s.headers) !== "clients") continue;
    for (const r of s.rows) {
      const norm = normalizeRow(r);
      const name = String(norm.name ?? norm.client_name ?? "").trim();
      if (!name) continue;
      rich.push({ ...norm, name });
    }
  }
  return rich;
}

function mergeClientSheets(detected: DetectedSheet[], rich: Record<string, any>[]): DetectedSheet[] {
  if (!rich.length) return detected;
  const idx = detected.findIndex((s) => s.entity === "clients");
  const byKey = new Map<string, any>();
  const keyOf = (r: any) => `${String(r.name).trim()}|${r.birth_date ?? ""}`;
  if (idx >= 0) {
    for (const r of detected[idx].rows) byKey.set(keyOf(r), { ...r });
  }
  for (const r of rich) {
    const k = keyOf(r);
    const prev = byKey.get(k);
    if (prev) { byKey.set(k, { ...prev, ...r }); continue; }
    // 생년월일이 비어있는 경우 이름만 일치하는 기존 행에 병합
    let matched = false;
    if (!r.birth_date) {
      for (const [pk, pv] of byKey) {
        if (pv.name === r.name) { byKey.set(pk, { ...pv, ...r }); matched = true; break; }
      }
    }
    if (!matched) byKey.set(k, r);
  }
  const rows = Array.from(byKey.values());
  const next = [...detected];
  if (idx >= 0) next[idx] = { ...next[idx], rows, source: `${next[idx].source} + 이용자관리` };
  else next.unshift({ source: "이용자관리", entity: "clients", rows });
  return next;
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

  // 1) 케어플 일일서비스관리 — 시작·종료시간 포함, 가장 정확
  const daily = careplDailySheet(wb);
  if (daily) {
    const header = (daily.aoa[0] ?? []).map((x) => String(x ?? "").trim());
    const rebuiltRows = daily.aoa.slice(1)
      .filter((r) => r && r.some((c) => c != null && String(c).trim() !== ""))
      .map((r) => {
        const obj: Record<string, any> = {};
        header.forEach((h, i) => { if (h) obj[h] = r[i] ?? null; });
        return obj;
      });
    const fixedRawSheets = rawSheets.map((s) =>
      s.name === daily.sheetName ? { name: s.name, rows: rebuiltRows, headers: header.filter(Boolean) } : s,
    );
    const baseSheets = parseCareplDaily(daily.sheetName, daily.aoa).filter((s) => s.rows.length > 0);
    const rich = extractRichClientSheets(fixedRawSheets, daily.sheetName);
    return {
      format: "careple",
      sheets: mergeClientSheets(baseSheets, rich),
      rawSheets: fixedRawSheets,
    };
  }

  // 2) 케어플 월서비스관리 — 회기 수 기반 분산
  const careple = careplMonthlySheet(wb);
  if (careple) {
    const baseSheets = parseCareplMonthly(careple.sheetName, careple.aoa).filter((s) => s.rows.length > 0);
    const rich = extractRichClientSheets(rawSheets, careple.sheetName);
    return {
      format: "careple",
      sheets: mergeClientSheets(baseSheets, rich),
      rawSheets,
    };
  }

  const aihproSheetNames = new Set(["clients", "therapists", "programs", "vouchers", "sessions", "payments", "assessments"]);
  const aihproHits = rawSheets.filter((s) => aihproSheetNames.has(s.name.toLowerCase()));

  let detected: DetectedSheet[] = [];
  let format: ParsedWorkbook["format"] = "unknown";

  if (aihproHits.length >= 2) {
    format = "aihpro";
    detected = aihproHits.map((s) => ({ source: s.name, entity: s.name.toLowerCase() as ImportEntity, rows: s.rows.map((r) => normalizeRow(r)) }));
  } else {
    for (const s of rawSheets) {
      const ent = detectEntity(s.headers);
      if (ent) detected.push({ source: s.name, entity: ent, rows: s.rows.map((r) => normalizeRow(r)) });
    }
    if (detected.length > 0) format = "careple";
  }

  return { format, sheets: detected, rawSheets };
}

/** 사용자 정의 매핑을 sessions 시트에 적용 */
export function applySessionColumnMap(parsed: ParsedWorkbook, map: Record<string, string>): ParsedWorkbook {
  const sIdx = parsed.sheets.findIndex((s) => s.entity === "sessions");
  if (sIdx < 0) return parsed;
  const orig = parsed.rawSheets.find((r) => parsed.sheets[sIdx].source.startsWith(r.name));
  const rawRows = orig?.rows ?? [];
  const remapped = rawRows.map((r) => normalizeRow(r, map));
  const next = { ...parsed, sheets: [...parsed.sheets] };
  next.sheets[sIdx] = { ...next.sheets[sIdx], rows: remapped };
  return next;
}

// ===== 미리보기 / 검증 =====
export interface SessionPreview {
  session_date: string;
  start_time: string | null;
  client_name: string;
  therapist_name: string | null;
  program_name: string | null;
  status: string;
  warnings: string[];
}

export function buildSessionPreview(parsed: ParsedWorkbook): {
  rows: SessionPreview[];
  byDay: Record<string, number>;
  byWeek: Record<string, number>;
  byMonth: Record<string, number>;
  totals: { ok: number; warnings: number; errors: number };
} {
  const ss = parsed.sheets.find((s) => s.entity === "sessions");
  const rows: SessionPreview[] = [];
  const byDay: Record<string, number> = {};
  const byWeek: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  let okCount = 0, warnCount = 0, errCount = 0;

  for (const r of ss?.rows ?? []) {
    const warnings: string[] = [];
    const date = parseDate(r.session_date);
    if (!date) warnings.push("날짜 형식 오류");
    const cname = (r.client_name ?? r.name ?? "").toString().trim();
    if (!cname) warnings.push("이용자 누락");
    const time = parseTime(r.start_time);
    if (r.start_time && !time) warnings.push("시간 형식 오류");

    const isErr = !date || !cname;
    if (isErr) errCount++;
    else if (warnings.length) warnCount++;
    else okCount++;

    if (date) {
      byDay[date] = (byDay[date] ?? 0) + 1;
      const wk = weekKey(date);
      byWeek[wk] = (byWeek[wk] ?? 0) + 1;
      const mo = date.slice(0, 7);
      byMonth[mo] = (byMonth[mo] ?? 0) + 1;
    }

    rows.push({
      session_date: date ?? String(r.session_date ?? "—"),
      start_time: time?.slice(0, 5) ?? null,
      client_name: cname || "—",
      therapist_name: r.therapist_name ? String(r.therapist_name) : null,
      program_name: r.program_name ? String(r.program_name) : null,
      status: String(r.status ?? "scheduled"),
      warnings,
    });
  }
  return { rows, byDay, byWeek, byMonth, totals: { ok: okCount, warnings: warnCount, errors: errCount } };
}

function weekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return monday.toISOString().slice(0, 10);
}

// ===== Supabase 배치 업서트 =====
import { supabase } from "@/integrations/supabase/client";

export async function commitImport(
  centerId: string,
  parsed: ParsedWorkbook,
  filename: string,
  options: ImportOptions = {},
): Promise<{ jobId: string; summary: Record<string, number>; status: "done" | "failed" }> {
  const strategy: DuplicateStrategy = options.duplicateStrategy ?? "skip";
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
      import_options: { duplicateStrategy: strategy, sessionColumnMap: options.sessionColumnMap ?? null },
    })
    .select()
    .single();
  if (jobErr) throw jobErr;

  const summary: Record<string, number> = { inserted: 0, updated: 0, skipped: 0 };

  try {
    // 0) 기존 이름 → id 매핑 미리 로드
    const [{ data: existingClients }, { data: existingTherapists }, { data: existingPrograms }] = await Promise.all([
      supabase.from("center_clients").select("id,name,birth_date,meta").eq("center_id", centerId),
      supabase.from("center_therapists").select("id,name").eq("center_id", centerId),
      supabase.from("center_programs").select("id,name").eq("center_id", centerId),
    ]);
    const clientNameToId: Record<string, string> = {};
    (existingClients ?? []).forEach((c: any) => { clientNameToId[c.name] = c.id; });
    const clientKeyToExisting = new Map<string, any>();
    (existingClients ?? []).forEach((c: any) => { clientKeyToExisting.set(`${c.name}|${c.birth_date ?? ""}`, c); });
    const therapistNameToId: Record<string, string> = {};
    (existingTherapists ?? []).forEach((t: any) => { therapistNameToId[t.name] = t.id; });
    const programNameToId: Record<string, string> = {};
    (existingPrograms ?? []).forEach((p: any) => { programNameToId[p.name] = p.id; });

    // 1) Clients (신규만 insert)
    const clientsSheet = parsed.sheets.find((s) => s.entity === "clients");
    if (clientsSheet) {
      // "(모) 010-1234-5678\n(부) 010-...\n(본인) 010-..." 형태를 모두 보존한다.
      const splitPhone = (raw: any): { phone: string | null; guardian_phone: string | null; contact_raw: string | null } => {
        if (raw == null) return { phone: null, guardian_phone: null, contact_raw: null };
        const s = String(raw).trim();
        if (!s) return { phone: null, guardian_phone: null, contact_raw: null };
        const selfPhones: string[] = [];
        const guardianPhones: string[] = [];
        // 줄바꿈/세미콜론/슬래시/콤마로 라인 분리
        const lines = s.split(/[\n;,/]+/).map((x) => x.trim()).filter(Boolean);
        const targets = lines.length > 0 ? lines : [s];
        for (const line of targets) {
          const matches = line.match(/\d{2,3}-?\d{3,4}-?\d{4}/g) ?? [];
          if (!matches.length) continue;
          const isSelf = /\(?\s*(본인|자녀|아이|당사자)\s*\)?/.test(line);
          const isGuardian = /\(?\s*(모|부|보호자|가족|조모|조부|언니|누나|형|오빠|이모|고모|할머니|할아버지)\s*\)?/.test(line);
          for (const m of matches) {
            const num = m;
            if (isSelf && !isGuardian) selfPhones.push(num);
            else if (isGuardian) guardianPhones.push(num);
            else selfPhones.push(num); // 라벨 없으면 본인으로 간주
          }
        }
        // 중복 제거
        const uniq = (arr: string[]) => Array.from(new Set(arr));
        const phone = uniq(selfPhones).join(", ") || null;
        const guardian = uniq(guardianPhones).join(", ") || null;
        // 라벨까지 보존한 원본(공백/줄바꿈 정리)
        const contactRaw = s.replace(/\s+/g, " ").trim();
        return { phone, guardian_phone: guardian, contact_raw: contactRaw };
      };
      const META_KEYS = ["age_months", "email", "school", "disability_grade", "disability_secondary", "referral_source", "referral_note", "last_modified_at"];
      const rows = clientsSheet.rows
        .map((r: any) => ({ ...r, name: (r.name ?? r.client_name ?? "").toString().trim() }))
        .filter((r) => r.name)
        .map((r: any) => {
          const sp = splitPhone(r.phone);
          const meta: Record<string, any> = {};
          for (const k of META_KEYS) {
            const v = (r as any)[k];
            if (v != null && String(v).trim() !== "") meta[k] = typeof v === "string" ? v.trim() : v;
          }
          if (r.note != null && String(r.note).trim() !== "") meta.note = String(r.note).trim();
          return {
            center_id: centerId,
            name: r.name,
            gender: r.gender ?? null,
            birth_date: parseDate(r.birth_date),
            phone: sp.phone ?? null,
            guardian_phone: sp.guardian_phone ?? r.guardian_phone ?? null,
            address: r.address ?? null,
            disability_info: r.disability_info ?? null,
            initial_consult_date: parseDate(r.initial_consult_date),
            status: r.status != null && String(r.status).trim() !== "" ? mapClientStatus(r.status) : "enrolled",
            member_no: r.member_no ?? null,
            meta: Object.keys(meta).length ? meta : {},
          };
        });
      const inserts: any[] = [];
      const updates: Array<{ id: string; payload: any }> = [];
      for (const row of rows) {
        const existing = clientKeyToExisting.get(`${row.name}|${row.birth_date ?? ""}`) ?? (clientNameToId[row.name] ? (existingClients ?? []).find((c: any) => c.id === clientNameToId[row.name]) : null);
        if (!existing) {
          inserts.push(row);
          continue;
        }
        const mergedMeta = row.meta ? { ...(existing.meta ?? {}), ...row.meta } : existing.meta;
        const updatePayload = Object.fromEntries(
          Object.entries({ ...row, center_id: undefined, meta: mergedMeta }).filter(([_, v]) => v != null && String(v).trim() !== ""),
        );
        if (Object.keys(updatePayload).length) updates.push({ id: existing.id, payload: updatePayload });
      }
      if (inserts.length) {
        const { data, error } = await supabase.from("center_clients").insert(inserts).select("id,name,birth_date,meta");
        if (error) throw error;
        data?.forEach((c: any) => {
          clientNameToId[c.name] = c.id;
          clientKeyToExisting.set(`${c.name}|${c.birth_date ?? ""}`, c);
        });
        summary.clients_inserted = data?.length ?? 0;
      }
      if (updates.length) {
        for (const u of updates) await supabase.from("center_clients").update(u.payload).eq("id", u.id);
        summary.clients_updated = updates.length;
      }
      summary.clients = (summary.clients_inserted ?? 0) + (summary.clients_updated ?? 0);
    }

    // 2) Therapists
    const tSheet = parsed.sheets.find((s) => s.entity === "therapists");
    if (tSheet) {
      const rows = tSheet.rows
        .filter((r) => r.name && !therapistNameToId[String(r.name).trim()])
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
    if (pSheet) {
      const rows = pSheet.rows
        .filter((r) => (r.program_name || r.name) && !programNameToId[String(r.program_name ?? r.name).trim()])
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

    // 4) Sessions — 중복 처리
    const sSheet = parsed.sheets.find((s) => s.entity === "sessions");
    if (sSheet) {
      // 기존 세션 인덱스 (date + client_id + start_time)
      const { data: existingSessions } = await supabase
        .from("center_sessions")
        .select("id, session_date, client_id, start_time")
        .eq("center_id", centerId);
      const existingKey = new Map<string, string>(); // key → id
      (existingSessions ?? []).forEach((s: any) => {
        const k = `${s.session_date}|${s.client_id}|${s.start_time ?? ""}`;
        existingKey.set(k, s.id);
      });

      const candidates = sSheet.rows
        .map((r) => {
          const clientName = String(r.client_name ?? r.name ?? "").trim();
          const therapistName = r.therapist_name ? String(r.therapist_name).trim() : null;
          const programName = r.program_name ? String(r.program_name).trim() : null;
          const session_date = parseDate(r.session_date);
          const start_time = parseTime(r.start_time);
          const client_id = clientNameToId[clientName];
          const therapist_id = therapistName ? therapistNameToId[therapistName] ?? null : null;
          const program_id = programName ? programNameToId[programName] ?? null : null;
          // 요일 + 시간 + 이용자/치료사 기반 반복 키 — 다음달에도 같은 요일/시간으로 자동 반복
          const weekday = session_date ? new Date(session_date + "T00:00:00").getDay() : null;
          const recurrence_key = session_date && client_id
            ? `${client_id}|${therapist_id ?? ""}|${program_id ?? ""}|${weekday}|${start_time ?? ""}`
            : null;
          return {
            payload: {
              center_id: centerId,
              client_id,
              therapist_id,
              program_id,
              session_date,
              start_time,
              end_time: parseTime(r.end_time),
              status: mapSessionStatus(r.status),
              is_voucher: !!r.is_voucher,
              price_krw: parseInt(r.price_krw) || 0,
              note: r.note ?? null,
              recurrence_key,
              // 원본 엑셀의 선생님 이름을 항상 보존 (id 매칭 실패해도 화면에 폴백 표시)
              meta: therapistName ? { therapist_name: therapistName } : null,
            },
            dupKey: session_date && client_id ? `${session_date}|${client_id}|${start_time ?? ""}` : null,
          };
        })
        .filter((x) => x.payload.session_date && x.payload.client_id);

      const toInsert: any[] = [];
      const toUpdate: Array<{ id: string; payload: any }> = [];
      let skipped = 0;

      for (const c of candidates) {
        const existingId = c.dupKey ? existingKey.get(c.dupKey) : undefined;
        if (!existingId) { toInsert.push(c.payload); continue; }
        if (strategy === "skip") {
          const fill: any = {};
          if (c.payload.therapist_id) fill.therapist_id = c.payload.therapist_id;
          if (c.payload.program_id) fill.program_id = c.payload.program_id;
          if (c.payload.recurrence_key) fill.recurrence_key = c.payload.recurrence_key;
          if (Object.keys(fill).length) toUpdate.push({ id: existingId, payload: { __backfillOnly: true, ...fill } });
          else skipped++;
          continue;
        }
        if (strategy === "overwrite" || strategy === "merge") {
          toUpdate.push({ id: existingId, payload: c.payload });
        }
      }

      if (toInsert.length) {
        const { data, error } = await supabase.from("center_sessions").insert(toInsert).select("id");
        if (error) throw error;
        summary.sessions_inserted = data?.length ?? 0;
      }
      if (toUpdate.length) {
        for (const u of toUpdate) {
          let payload: any;
          if (u.payload.__backfillOnly) {
            const { __backfillOnly, ...rest } = u.payload;
            payload = rest;
          } else if (strategy === "merge") {
            payload = Object.fromEntries(Object.entries(u.payload).filter(([_, v]) => v != null && v !== ""));
          } else {
            payload = u.payload;
          }
          await supabase.from("center_sessions").update(payload).eq("id", u.id);
        }
        summary.sessions_updated = toUpdate.length;
      }
      summary.sessions_skipped = skipped;
      summary.sessions = (summary.sessions_inserted ?? 0) + (summary.sessions_updated ?? 0);

      // 5b) 반복 일정 자동 확장 — 가져온 모든 회기를 같은 요일/시간으로 다음 26주(약 6개월) 동안 자동 복제
      const REPEAT_WEEKS = 26;
      const baseRows = candidates.filter((c) => c.payload.recurrence_key);
      // 중복 방지를 위한 키셋 (date|client|start_time)
      const existingFutureKeys = new Set<string>(existingKey.keys());
      candidates.forEach((c) => { if (c.dupKey) existingFutureKeys.add(c.dupKey); });
      const recurRows: any[] = [];
      for (const c of baseRows) {
        const base = new Date(c.payload.session_date + "T00:00:00");
        for (let w = 1; w <= REPEAT_WEEKS; w++) {
          const d = new Date(base);
          d.setDate(d.getDate() + w * 7);
          const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const k = `${ds}|${c.payload.client_id}|${c.payload.start_time ?? ""}`;
          if (existingFutureKeys.has(k)) continue;
          existingFutureKeys.add(k);
          recurRows.push({ ...c.payload, session_date: ds, status: "scheduled" });
        }
      }
      if (recurRows.length) {
        // chunk insert (500개 단위)
        for (let i = 0; i < recurRows.length; i += 500) {
          const chunk = recurRows.slice(i, i + 500);
          const { error } = await supabase.from("center_sessions").insert(chunk);
          if (error) throw error;
        }
        summary.sessions_recurring = recurRows.length;
        summary.sessions = (summary.sessions ?? 0) + recurRows.length;
      }
    }


    // 5) Payments (간단 insert)
    const payS = parsed.sheets.find((s) => s.entity === "payments");
    if (payS) {
      const rows = payS.rows.filter((r) => r.paid_at).map((r) => {
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

    return { jobId: job.id, summary, status: "done" };
  } catch (e: any) {
    await supabase
      .from("center_import_jobs")
      .update({ status: "failed", summary, error_log: { message: e?.message ?? String(e) }, completed_at: new Date().toISOString() })
      .eq("id", job.id);
    throw e;
  }
}

export async function listRecentImports(centerId: string, limit = 10) {
  const { data, error } = await supabase
    .from("center_import_jobs")
    .select("id, filename, detected_format, status, summary, error_log, created_at, completed_at, import_options")
    .eq("center_id", centerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
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
function mapSessionStatus(v: any): "scheduled" | "completed" | "cancelled" | "cancelled_carry" | "cancelled_makeup" {
  const s = String(v ?? "").trim();
  if (/완료|completed/i.test(s)) return "completed";
  if (/취소이월|이월|carry/i.test(s)) return "cancelled_carry";
  if (/보강|makeup/i.test(s)) return "cancelled_makeup";
  if (/취소|cancel/i.test(s)) return "cancelled";
  return "scheduled";
}

// ===== 표준 컬럼 스펙 (케어플 "일일서비스관리" 호환) =====
// 헤더 순서·이름은 케어플 "일일서비스관리_YYYY-MM-DD-YYYY-MM-DD" 시트와 동일.
export const SESSION_COLUMN_SPEC: Array<{ key: string; header: string; required: boolean; example: string; rule: string }> = [
  { key: "client_name",        header: "이용자",     required: true,  example: "김민준",                              rule: "이용자(회원) 이름 — DB와 일치하면 자동 매칭" },
  { key: "client_birth_date",  header: "생년월일",   required: false, example: "2018-04-12",                          rule: "YYYY-MM-DD" },
  { key: "therapist_name",     header: "선생님",     required: false, example: "박지영치료사 / 감각통합치료사",       rule: "이름 또는 '이름 / 직급' 형식 — 슬래시(/) 뒤는 직급으로 인식" },
  { key: "program_name",       header: "프로그램",   required: false, example: "감각통합-일반 [개인/기관]",            rule: "'카테고리-세부명 [표시]' — 대괄호 안은 자동 제거" },
  { key: "session_date",       header: "일자",       required: true,  example: "2026-05-25",                          rule: "YYYY-MM-DD (필수)" },
  { key: "start_time",         header: "시작시간",   required: false, example: "11:00",                               rule: "HH:MM 24시간" },
  { key: "end_time",           header: "종료시간",   required: false, example: "11:30",                               rule: "HH:MM (시작시간 이후)" },
  { key: "status",             header: "상태",       required: false, example: "완료",                                rule: "예정 / 완료 / 취소 / 취소(보강) / 취소이월" },
];

// ===== AIHPRO 표준 템플릿 다운로드 =====
// 케어플 "일일서비스관리" 한 장짜리 형식을 그대로 따라간다. (1행 요약 / 2행 헤더 / 3행~ 데이터)
export function downloadStandardTemplate() {
  const wb = XLSX.utils.book_new();

  const headers = SESSION_COLUMN_SPEC.map((c) => c.header);
  const examples: any[][] = [
    ["김민준", "2018-04-12", "박지영치료사 / 감각통합치료사",  "감각통합-일반 [개인/기관]",   "2026-05-25", "10:00", "10:45", "완료"],
    ["김민준", "2018-04-12", "박지영치료사 / 감각통합치료사",  "감각통합-일반 [개인/기관]",   "2026-05-26", "10:00", "10:45", "예정"],
    ["이서윤", "2017-09-03", "김재민치료사 / 언어/인지치료사", "언어-발달바우처 [개인/기관]", "2026-05-25", "14:30", "15:15", "취소"],
    ["이서윤", "2017-09-03", "김재민치료사 / 언어/인지치료사", "언어-발달바우처 [개인/기관]", "2026-05-26", "14:30", "15:15", "취소(보강)"],
  ];
  const summary = `총 ${examples.length}회기 — 예정/완료/취소/취소(보강) 상태를 한 시트에 입력하세요. (이 행은 자동 무시됩니다)`;
  const aoa: any[][] = [
    [summary, ...new Array(headers.length - 1).fill(null)],
    headers,
    ...examples,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  (ws as any)["!cols"] = [
    { wch: 12 }, { wch: 12 }, { wch: 28 }, { wch: 32 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "일정 및 상태");

  // 참고 README
  const readme: any[][] = [
    ["AIHPRO 센터 표준 템플릿 — 케어플 '일일서비스관리' 호환"],
    [],
    ["1행은 요약 텍스트로 자동 무시됩니다. 2행이 헤더, 3행부터 데이터입니다."],
    ["헤더 이름이 같으면 시트 이름·순서와 무관하게 자동 인식됩니다."],
    [],
    ["컬럼", "필수", "예시", "형식 / 규칙"],
    ...SESSION_COLUMN_SPEC.map((c) => [c.header, c.required ? "필수" : "선택", c.example, c.rule]),
    [],
    ["상태 값", "매핑"],
    ["예정", "scheduled"],
    ["완료", "completed"],
    ["취소", "cancelled"],
    ["취소(보강)", "cancelled_makeup — 같은 회기를 다른 날 보강"],
    ["취소이월 / 이월", "cancelled_carry — 다음 달로 이월"],
  ];
  const wsReadme = XLSX.utils.aoa_to_sheet(readme);
  (wsReadme as any)["!cols"] = [{ wch: 16 }, { wch: 8 }, { wch: 36 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsReadme, "_README");

  XLSX.writeFile(wb, "AIHPRO_일일서비스관리_표준템플릿.xlsx");
}
