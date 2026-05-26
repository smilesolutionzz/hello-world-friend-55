/**
 * 데모 모드용 mock 데이터.
 * `/b2b-center/app?demo=1` 진입 시 사용. DB 쓰기 일절 없음.
 */
import type { CenterOrg } from "./centerClient";

export const DEMO_CENTER: CenterOrg = {
  id: "demo-center-id",
  owner_id: "demo-owner",
  name: "햇살 발달치료센터 (데모)",
  business_no: "123-45-67890",
  phone: "02-1234-5678",
  address: "서울특별시 강남구 테헤란로 123",
  contract_expires_at: null,
  plan: "standard",
  created_at: new Date().toISOString(),
};

export const DEMO_THERAPISTS = [
  { id: "t1", name: "김민지", role: "언어치료사", color: "#FFB4A2" },
  { id: "t2", name: "박서연", role: "감각통합치료사", color: "#B8E0D2" },
  { id: "t3", name: "이준호", role: "놀이치료사", color: "#FFD6A5" },
  { id: "t4", name: "최예나", role: "행동치료사", color: "#CAFFBF" },
  { id: "t5", name: "정태우", role: "인지치료사", color: "#A0C4FF" },
];

export const DEMO_CLIENTS = [
  { id: "c1", display_name: "민준 (5세)", therapist_id: "t1", status: "등록", weekly_sessions: 3 },
  { id: "c2", display_name: "서윤 (6세)", therapist_id: "t2", status: "등록", weekly_sessions: 2 },
  { id: "c3", display_name: "도윤 (4세)", therapist_id: "t1", status: "등록", weekly_sessions: 4 },
  { id: "c4", display_name: "지우 (7세)", therapist_id: "t3", status: "대기", weekly_sessions: 0 },
  { id: "c5", display_name: "하준 (5세)", therapist_id: "t4", status: "등록", weekly_sessions: 2 },
  { id: "c6", display_name: "예준 (6세)", therapist_id: "t5", status: "등록", weekly_sessions: 3 },
  { id: "c7", display_name: "수아 (4세)", therapist_id: "t2", status: "등록", weekly_sessions: 2 },
  { id: "c8", display_name: "지호 (8세)", therapist_id: "t3", status: "등록", weekly_sessions: 1 },
  { id: "c9", display_name: "유나 (5세)", therapist_id: "t1", status: "종결", weekly_sessions: 0 },
  { id: "c10", display_name: "준서 (6세)", therapist_id: "t4", status: "등록", weekly_sessions: 3 },
  { id: "c11", display_name: "지안 (4세)", therapist_id: "t5", status: "대기", weekly_sessions: 0 },
  { id: "c12", display_name: "이안 (7세)", therapist_id: "t2", status: "등록", weekly_sessions: 2 },
];

export const DEMO_STATS = {
  monthlyRevenue: 12_480_000,
  monthlySessions: 256,
  attendance: 0.94,
  utilization: 0.78,
  pendingClients: 2,
  activeClients: 9,
};

export const DEMO_PROGRAMS = [
  { id: "p1", name: "언어치료 40분", category: "언어", duration_min: 40, price_krw: 55000, is_voucher: true },
  { id: "p2", name: "언어치료 50분", category: "언어", duration_min: 50, price_krw: 70000, is_voucher: false },
  { id: "p3", name: "감각통합 40분", category: "감각통합", duration_min: 40, price_krw: 60000, is_voucher: true },
  { id: "p4", name: "놀이치료 50분", category: "놀이", duration_min: 50, price_krw: 65000, is_voucher: false },
  { id: "p5", name: "행동치료 40분", category: "행동", duration_min: 40, price_krw: 55000, is_voucher: true },
  { id: "p6", name: "인지치료 40분", category: "인지", duration_min: 40, price_krw: 58000, is_voucher: false },
];

// 이번 주 월요일 기준으로 데모 회기 생성
function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  const day = x.getDay(); // 0=일
  const diff = (day === 0 ? -6 : 1 - day);
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmt(d: Date): string { return d.toISOString().slice(0, 10); }

const WEEK0 = startOfWeek();

const SESSION_SEEDS: Array<{ dow: number; start: string; end: string; cid: string; tid: string; pid: string; status?: string }> = [
  { dow: 0, start: "10:00", end: "10:40", cid: "c1", tid: "t1", pid: "p1" },
  { dow: 0, start: "10:00", end: "10:40", cid: "c5", tid: "t4", pid: "p5" },
  { dow: 0, start: "11:00", end: "11:40", cid: "c3", tid: "t1", pid: "p1" },
  { dow: 0, start: "14:00", end: "14:40", cid: "c7", tid: "t2", pid: "p3" },
  { dow: 0, start: "15:00", end: "15:50", cid: "c8", tid: "t3", pid: "p4" },
  { dow: 1, start: "09:30", end: "10:10", cid: "c2", tid: "t2", pid: "p3" },
  { dow: 1, start: "10:00", end: "10:40", cid: "c10", tid: "t4", pid: "p5" },
  { dow: 1, start: "11:00", end: "11:40", cid: "c6", tid: "t5", pid: "p6" },
  { dow: 1, start: "14:00", end: "14:40", cid: "c1", tid: "t1", pid: "p1", status: "cancelled" },
  { dow: 2, start: "10:00", end: "10:40", cid: "c3", tid: "t1", pid: "p1" },
  { dow: 2, start: "10:00", end: "10:50", cid: "c12", tid: "t2", pid: "p3" },
  { dow: 2, start: "11:00", end: "11:50", cid: "c8", tid: "t3", pid: "p4" },
  { dow: 2, start: "15:00", end: "15:40", cid: "c10", tid: "t4", pid: "p5" },
  { dow: 3, start: "09:30", end: "10:10", cid: "c5", tid: "t4", pid: "p5" },
  { dow: 3, start: "10:00", end: "10:40", cid: "c7", tid: "t2", pid: "p3" },
  { dow: 3, start: "11:00", end: "11:40", cid: "c6", tid: "t5", pid: "p6" },
  { dow: 3, start: "14:00", end: "14:40", cid: "c1", tid: "t1", pid: "p1" },
  { dow: 4, start: "10:00", end: "10:50", cid: "c2", tid: "t2", pid: "p3" },
  { dow: 4, start: "10:00", end: "10:40", cid: "c10", tid: "t4", pid: "p5" },
  { dow: 4, start: "11:00", end: "11:40", cid: "c3", tid: "t1", pid: "p1" },
  { dow: 4, start: "14:00", end: "14:40", cid: "c8", tid: "t3", pid: "p4" },
  { dow: 4, start: "15:00", end: "15:40", cid: "c6", tid: "t5", pid: "p6" },
];

export const DEMO_SESSIONS = SESSION_SEEDS.map((s, i) => {
  const d = new Date(WEEK0);
  d.setDate(d.getDate() + s.dow);
  const program = DEMO_PROGRAMS.find((p) => p.id === s.pid)!;
  return {
    id: `s${i + 1}`,
    session_date: fmt(d),
    start_time: s.start,
    end_time: s.end,
    client_id: s.cid,
    therapist_id: s.tid,
    program_id: s.pid,
    status: s.status ?? "completed",
    price_krw: program.price_krw,
    is_voucher: program.is_voucher,
  };
});

export const DEMO_ASSESSMENTS = [
  { id: "a1", client_id: "c1", therapist_id: "t1", assessment_date: fmt(WEEK0), assessment_type: "초기상담", status: "completed", content: "표현언어 지연 의심. 가정 환경 양호." },
  { id: "a2", client_id: "c4", therapist_id: "t3", assessment_date: fmt(new Date(WEEK0.getTime() + 86400000 * 2)), assessment_type: "재평가", status: "scheduled", content: "" },
  { id: "a3", client_id: "c11", therapist_id: "t5", assessment_date: fmt(new Date(WEEK0.getTime() + 86400000 * 3)), assessment_type: "초기상담", status: "scheduled", content: "" },
];

export const DEMO_PARENT_REPORTS = [
  { id: "r1", client_id: "c1", period_start: "2026-04-01", period_end: "2026-04-30", status: "issued", issued_at: "2026-05-02" },
  { id: "r2", client_id: "c2", period_start: "2026-04-01", period_end: "2026-04-30", status: "issued", issued_at: "2026-05-02" },
  { id: "r3", client_id: "c3", period_start: "2026-05-01", period_end: "2026-05-31", status: "draft", issued_at: null },
];

export const isDemoMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
};
