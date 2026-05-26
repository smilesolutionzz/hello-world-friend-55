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

export const isDemoMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
};
