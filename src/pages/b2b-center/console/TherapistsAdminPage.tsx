import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { centerId: string };

// 일정표와 동일한 팔레트
const PALETTE = ["#E63946", "#1D7874", "#F4A261", "#264653", "#9D4EDD", "#0077B6", "#FB8500", "#2A9D8F", "#7209B7", "#BC4749", "#3A86FF", "#8AB17D"];

export default function TherapistsAdminPage() {
  const { centerId } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("center_therapists")
        .select("*")
        .eq("center_id", centerId)
        .order("created_at", { ascending: true });
      const list = data ?? [];

      // 색상이 비어 있거나 중복인 치료사에게 팔레트에서 미사용 색을 자동 배정
      const used = new Set<string>();
      const toUpdate: Array<{ id: string; color: string }> = [];
      const assigned = list.map((r: any, i: number) => {
        let c = (r.calendar_color || "").toLowerCase();
        if (!c || used.has(c)) {
          let pick = PALETTE[i % PALETTE.length];
          let k = i;
          while (used.has(pick.toLowerCase()) && k < i + PALETTE.length) {
            k += 1;
            pick = PALETTE[k % PALETTE.length];
          }
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
    })();
  }, [centerId]);

  async function changeColor(id: string, color: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, calendar_color: color } : r)));
    await supabase.from("center_therapists").update({ calendar_color: color }).eq("id", id);
  }

  async function shuffleAll() {
    const next = rows.map((r, i) => ({ ...r, calendar_color: PALETTE[i % PALETTE.length] }));
    setRows(next);
    for (const r of next) {
      supabase.from("center_therapists").update({ calendar_color: r.calendar_color }).eq("id", r.id);
    }
  }

  const active = rows.filter(r => r.account_status === "active").length;
  const locked = rows.filter(r => r.account_status === "locked").length;
  const inactive = rows.filter(r => r.account_status === "inactive").length;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold">선생님 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">총 {rows.length}명 · 색상은 일정표에서 선생님 구분에 사용돼요.</p>
        </div>
        <button
          onClick={shuffleAll}
          className="text-xs px-3 py-2 rounded-full bg-white border border-neutral-200 hover:border-neutral-400 transition"
        >
          색상 자동 재배정
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-[#C8B88A]/40 bg-[#FAF6E8]/60 p-4">
        <p className="text-[10px] tracking-widest text-[#8B7B4A] mb-1">TIP · 치료사 본인 일정 보기</p>
        <p className="text-sm text-neutral-800 break-keep mb-3">
          선생님이 본인 일정을 직접 확인·완료/취소 처리하려면 아래 3단계를 따라주세요.
        </p>
        <ol className="text-sm text-neutral-800 space-y-1.5 list-decimal pl-5 break-keep">
          <li>아래 표의 <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white border border-neutral-200">계정</span> 열에 선생님의 AIHPRO 가입 이메일을 입력합니다.</li>
          <li>
            선생님께 아래 페이지 링크를 전달합니다.
            <div className="mt-1">
              <Link to="/therapist/my-schedule" className="inline-flex items-center gap-1 font-mono text-xs px-2 py-1 rounded-md bg-white border border-neutral-300 hover:border-[#8B7B4A] hover:text-[#8B7B4A] transition">
                /therapist/my-schedule ↗
              </Link>
            </div>
          </li>
          <li>선생님이 해당 페이지에서 "내 계정 연결" 버튼을 누르면 <span className="text-emerald-700 font-medium">연결됨</span> 상태로 표시됩니다.</li>
        </ol>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="정상" value={active} color="bg-emerald-500" />
        <Stat label="잠금" value={locked} color="bg-amber-500" />
        <Stat label="미사용(퇴사)" value={inactive} color="bg-neutral-300" />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="text-left p-3">색상</th>
              <th className="text-left p-3">이름</th>
              <th className="text-left p-3">직급</th>
              <th className="text-left p-3">전공</th>
              <th className="text-left p-3">전화</th>
              <th className="text-left p-3">계정</th>
              <th className="text-left p-3">연결</th>
              <th className="text-left p-3">상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="p-8 text-center text-neutral-400">불러오는 중…</td></tr> :
             rows.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-neutral-400">선생님이 없습니다.</td></tr> :
             rows.map((r) => {
              const linked = !!r.linked_user_id;
              const color = r.calendar_color || "#94a3b8";
              return (
                <tr key={r.id} className="border-t border-neutral-100">
                  <td className="p-3">
                    <label
                      className="relative inline-block w-6 h-6 rounded-md cursor-pointer ring-1 ring-neutral-200 hover:ring-neutral-400 transition overflow-hidden"
                      style={{ backgroundColor: color }}
                      title="클릭하여 색상 변경"
                    >
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => changeColor(r.id, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </td>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{r.title ?? "—"}</td>
                  <td className="p-3">{r.specialty ?? "—"}</td>
                  <td className="p-3">{r.phone ?? "—"}</td>
                  <td className="p-3 text-neutral-500">{r.login_account ?? "—"}</td>
                  <td className="p-3">
                    {linked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />연결됨
                      </span>
                    ) : r.login_account ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />대기중
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-500 border border-neutral-200">
                        미입력
                      </span>
                    )}
                  </td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100">{r.account_status}</span></td>
                </tr>
              );
             })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
