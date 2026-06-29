import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Users, X, Search, Send, ChevronRight } from "lucide-react";
import { toast as sonnerToast } from "sonner";

type Ctx = { centerId: string; demo?: boolean };

interface Group { id: string; name: string; color: string | null; note: string | null; }
interface Client { id: string; name: string; guardian_phone: string | null; }
interface GroupMember { group_id: string; client_id: string; }

const COLORS = [
  { v: "#FCD34D", name: "햇살" },
  { v: "#A5B4FC", name: "별빛" },
  { v: "#86EFAC", name: "새싹" },
  { v: "#FDA4AF", name: "꽃잎" },
  { v: "#7DD3FC", name: "물빛" },
  { v: "#C4B5FD", name: "구름" },
];

export default function CenterGroupsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState(COLORS[0].v);
  const [assignOpen, setAssignOpen] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    if (demo) { setLoading(false); return; }
    setLoading(true);
    const [g, c, m] = await Promise.all([
      supabase.from("center_client_groups").select("*").eq("center_id", centerId).order("name"),
      supabase.from("center_clients").select("id,name,guardian_phone").eq("center_id", centerId).order("name"),
      supabase.from("center_client_group_members").select("group_id,client_id").eq("center_id", centerId),
    ]);
    setGroups((g.data ?? []) as Group[]);
    setClients((c.data ?? []) as Client[]);
    setMembers((m.data ?? []) as GroupMember[]);
    setLoading(false);
  }, [centerId, demo]);

  useEffect(() => { load(); }, [load]);

  const memberMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const mem of members) {
      if (!map.has(mem.group_id)) map.set(mem.group_id, new Set());
      map.get(mem.group_id)!.add(mem.client_id);
    }
    return map;
  }, [members]);

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  async function createGroup() {
    const name = newGroupName.trim();
    if (!name) { sonnerToast.error("그룹 이름을 입력해주세요"); return; }
    const { data, error } = await supabase.from("center_client_groups")
      .insert({ center_id: centerId, name, color: newGroupColor })
      .select().single();
    if (error) { sonnerToast.error("생성 실패", { description: error.message }); return; }
    setGroups((p) => [...p, data as Group].sort((a, b) => a.name.localeCompare(b.name)));
    setNewGroupName("");
    setActiveGroup((data as Group).id);
    sonnerToast.success(`그룹 '${name}' 생성됨`);
  }

  async function deleteGroup(id: string) {
    if (!confirm("이 그룹을 삭제할까요? (이용자 정보는 삭제되지 않습니다)")) return;
    const { error } = await supabase.from("center_client_groups").delete().eq("id", id);
    if (error) { sonnerToast.error("삭제 실패", { description: error.message }); return; }
    setGroups((p) => p.filter((g) => g.id !== id));
    setMembers((p) => p.filter((m) => m.group_id !== id));
    if (activeGroup === id) setActiveGroup(null);
  }

  async function toggleMember(groupId: string, clientId: string) {
    const set = memberMap.get(groupId);
    const has = set?.has(clientId);
    if (has) {
      const { error } = await supabase.from("center_client_group_members")
        .delete().eq("group_id", groupId).eq("client_id", clientId);
      if (error) { sonnerToast.error("제외 실패", { description: error.message }); return; }
      setMembers((p) => p.filter((m) => !(m.group_id === groupId && m.client_id === clientId)));
    } else {
      const { error } = await supabase.from("center_client_group_members")
        .insert({ group_id: groupId, client_id: clientId, center_id: centerId });
      if (error) { sonnerToast.error("추가 실패", { description: error.message }); return; }
      setMembers((p) => [...p, { group_id: groupId, client_id: clientId }]);
    }
  }

  const active = activeGroup ? groups.find((g) => g.id === activeGroup) ?? null : null;
  const activeMemberIds = activeGroup ? Array.from(memberMap.get(activeGroup) ?? []) : [];
  const activeMembers = activeMemberIds.map((id) => clientMap.get(id)).filter(Boolean) as Client[];

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">그룹(반) 관리</h1>
          <p className="text-sm text-neutral-500">
            반을 만들고 이용자를 배정한 뒤, 한 번의 클릭으로 각 보호자에게 <b>자기 자녀의 일지/리포트</b>만 동시 전송할 수 있어요.
          </p>
        </div>
        {activeGroup && activeMembers.length > 0 && (
          <Link
            to={`/b2b-center/app/groups/${activeGroup}/batch-send`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800"
          >
            <Send className="w-4 h-4" /> 이 그룹 동시 전송
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4">
        {/* Groups list */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createGroup()}
              placeholder="예: 햇살반, 별님반"
              className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400"
            />
            <button onClick={createGroup} className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {COLORS.map((c) => (
              <button key={c.v} onClick={() => setNewGroupColor(c.v)}
                className={`w-6 h-6 rounded-full border-2 transition ${newGroupColor === c.v ? "border-neutral-900 scale-110" : "border-white"}`}
                style={{ background: c.v }} title={c.name} />
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-neutral-400 py-8 text-center">불러오는 중…</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">아직 그룹이 없어요</p>
          ) : (
            <ul className="space-y-1">
              {groups.map((g) => {
                const count = memberMap.get(g.id)?.size ?? 0;
                const isActive = activeGroup === g.id;
                return (
                  <li key={g.id}>
                    <button
                      onClick={() => setActiveGroup(g.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition ${
                        isActive ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: g.color ?? "#999" }} />
                      <span className="flex-1 text-left truncate">{g.name}</span>
                      <span className={isActive ? "text-neutral-300" : "text-neutral-400"}>{count}명</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Active group detail */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          {!active ? (
            <div className="text-center py-16 text-neutral-400 text-sm">
              왼쪽에서 그룹을 선택하거나 새 그룹을 만들어주세요.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: active.color ?? "#999" }} />
                  <h2 className="text-lg font-semibold">{active.name}</h2>
                  <span className="text-sm text-neutral-500">소속 {activeMembers.length}명</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAssignOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">
                    <Users className="w-4 h-4" /> 이용자 추가/제거
                  </button>
                  <button onClick={() => deleteGroup(active.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-200 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" /> 그룹 삭제
                  </button>
                </div>
              </div>

              {activeMembers.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  이 그룹에 속한 이용자가 없어요. 우측 상단 <b>이용자 추가/제거</b>로 배정해주세요.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-neutral-500 text-xs">
                    <tr className="border-b border-neutral-100">
                      <th className="text-left py-2">이용자</th>
                      <th className="text-left py-2">보호자 연락처</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeMembers.map((c) => (
                      <tr key={c.id} className="border-b border-neutral-50">
                        <td className="py-2.5 font-medium text-neutral-900">{c.name}</td>
                        <td className="py-2.5 text-neutral-600">
                          {c.guardian_phone ?? <span className="text-red-500 text-xs">⚠ 연락처 없음</span>}
                        </td>
                        <td className="py-2.5 text-right">
                          <button onClick={() => toggleMember(active.id, c.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assign dialog */}
      {assignOpen && active && (
        <AssignDialog
          group={active}
          allClients={clients}
          selectedIds={new Set(activeMemberIds)}
          onClose={() => setAssignOpen(false)}
          onToggle={(cid) => toggleMember(active.id, cid)}
          q={q}
          setQ={setQ}
        />
      )}
    </div>
  );
}

function AssignDialog({
  group, allClients, selectedIds, onToggle, onClose, q, setQ,
}: {
  group: Group;
  allClients: Client[];
  selectedIds: Set<string>;
  onToggle: (clientId: string) => void;
  onClose: () => void;
  q: string;
  setQ: (s: string) => void;
}) {
  const filtered = allClients.filter((c) =>
    !q.trim() || c.name.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-semibold">{group.name} 이용자 배정</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-neutral-400" /></button>
        </div>
        <div className="p-4 border-b border-neutral-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 검색"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {filtered.map((c) => {
            const on = selectedIds.has(c.id);
            return (
              <button key={c.id} onClick={() => onToggle(c.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-neutral-50">
                <div className="text-left">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-neutral-500">{c.guardian_phone ?? "보호자 연락처 없음"}</div>
                </div>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  on ? "border-neutral-900 bg-neutral-900" : "border-neutral-300"
                }`}>
                  {on && <span className="text-white text-xs">✓</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-neutral-100 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm">완료</button>
        </div>
      </div>
    </div>
  );
}
