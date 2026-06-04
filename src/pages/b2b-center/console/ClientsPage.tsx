import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus, Upload, Send } from "lucide-react";
import { Link } from "react-router-dom";
import ClientRegisterDialog from "@/components/b2b-center/ClientRegisterDialog";
import InviteParentDialog from "@/components/b2b-center/InviteParentDialog";
import { DEMO_CLIENTS } from "@/lib/b2bCenter/demoData";

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

export default function ClientsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [inviteFor, setInviteFor] = useState<{ id: string; name: string } | null>(null);

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

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (q && !r.name.includes(q) && !(r.member_no ?? "").includes(q)) return false;
    return true;
  });

  const counts = {
    waiting: rows.filter(r => r.status === "waiting").length,
    enrolled: rows.filter(r => r.status === "enrolled").length,
    terminated: rows.filter(r => r.status === "terminated").length,
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">이용자 관리</h1>
          <p className="text-sm text-neutral-500">총 {rows.length}명 · 등록 {counts.enrolled} · 대기 {counts.waiting} · 종결 {counts.terminated}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/b2b-center/import" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50">
            <Upload className="w-4 h-4" /> 엑셀 일괄 등록
          </Link>
          <button onClick={() => setRegisterOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800">
            <UserPlus className="w-4 h-4" /> 이용자 등록
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "enrolled", "waiting", "terminated"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm transition ${filter === s ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
            {s === "all" ? `전체 ${rows.length}` : `${statusLabel[s]} ${counts[s as keyof typeof counts]}`}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 또는 회원번호로 검색"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400" />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-x-auto">
        <table className="min-w-[1800px] w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs">
            <tr>
              <th className="text-left p-3 font-medium">이용자</th>
              <th className="text-left p-3 font-medium">성별</th>
              <th className="text-left p-3 font-medium">생년월일</th>
              <th className="text-left p-3 font-medium">개월수</th>
              <th className="text-left p-3 font-medium">장애유형</th>
              <th className="text-left p-3 font-medium">장애등급</th>
              <th className="text-left p-3 font-medium">중복장애내용</th>
              <th className="text-left p-3 font-medium">연락처</th>
              <th className="text-left p-3 font-medium">이메일</th>
              <th className="text-left p-3 font-medium">주소</th>
              <th className="text-left p-3 font-medium">학교</th>
              <th className="text-left p-3 font-medium">초기상담일시</th>
              <th className="text-left p-3 font-medium">회원번호</th>
              <th className="text-left p-3 font-medium">유입경로</th>
              <th className="text-left p-3 font-medium">유입경로 관련 참고사항</th>
              <th className="text-left p-3 font-medium">상태</th>
              <th className="text-left p-3 font-medium">메모</th>
              <th className="text-left p-3 font-medium">최종수정일시</th>
              <th className="text-right p-3 font-medium">AIHPRO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={19} className="p-12 text-center text-neutral-400">불러오는 중…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={19} className="p-12 text-center text-neutral-400">
                <p className="mb-3">아직 등록된 이용자가 없습니다.</p>
                <div className="inline-flex gap-2">
                  <button onClick={() => setRegisterOpen(true)} className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm">이용자 등록</button>
                  <Link to="/b2b-center/import" className="px-4 py-2 rounded-full border border-neutral-200 text-sm">엑셀 일괄</Link>
                </div>
              </td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50/50">
                <td className="p-3 font-medium text-neutral-900">{r.name}</td>
                <td className="p-3">{v(r.gender)}</td>
                <td className="p-3 text-neutral-600 whitespace-nowrap">{v(r.birth_date)}</td>
                <td className="p-3 text-neutral-600">{v(r.meta?.age_months ?? r.meta?.age_text)}</td>
                <td className="p-3 text-neutral-600">{v(r.disability_info)}</td>
                <td className="p-3 text-neutral-600">{v(r.meta?.disability_grade)}</td>
                <td className="p-3 text-neutral-600">{v(r.meta?.disability_secondary)}</td>
                <td className="p-3 text-neutral-600 whitespace-nowrap">{v(r.guardian_phone ?? r.phone)}</td>
                <td className="p-3 text-neutral-600">{v(r.meta?.email)}</td>
                <td className="p-3 text-neutral-600 min-w-[180px]">{v(r.address)}</td>
                <td className="p-3 text-neutral-600">{v(r.meta?.school)}</td>
                <td className="p-3 text-neutral-600 whitespace-nowrap">{v(r.initial_consult_date)}</td>
                <td className="p-3 font-mono text-xs text-neutral-500">{v(r.member_no)}</td>
                <td className="p-3 text-neutral-600">{v(r.meta?.referral_source)}</td>
                <td className="p-3 text-neutral-600 min-w-[180px]">{v(r.meta?.referral_note)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${statusTone[r.status] ?? "bg-neutral-100"}`}>
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </td>
                <td className="p-3 text-neutral-600 min-w-[180px]">{v(r.meta?.note)}</td>
                <td className="p-3 text-neutral-600 whitespace-nowrap">{v(r.meta?.last_modified_at)}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setInviteFor({ id: r.id, name: r.name })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-[#FAF6E8] text-neutral-800 hover:bg-[#F0E8C8] border border-[#C8B88A]/30">
                    <Send className="w-3 h-3" /> 초대
                  </button>
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

      {inviteFor && (
        <InviteParentDialog
          open={!!inviteFor}
          centerId={centerId}
          client={inviteFor}
          demo={demo}
          onClose={() => setInviteFor(null)}
        />
      )}
    </div>
  );
}
