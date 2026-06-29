import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Users, X, ShieldCheck, ChevronDown, ChevronRight, Wand2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  centerId: string;
  weekKey: string;
  onCreated?: (results: Array<{ clientId: string; reportId: string }>) => void;
};

type Group = { id: string; name: string; color: string | null };
type Member = { id: string; name: string; guardian_phone: string | null };

type Common = {
  title: string;
  greeting: string;
  activities_summary: string;
  highlights: string; // newline list
  home_tips: string;  // newline list
  next_week_focus: string;
};

type Personal = { observation: string; special: string };

const EMPTY_COMMON: Common = {
  title: "",
  greeting: "",
  activities_summary: "",
  highlights: "",
  home_tips: "",
  next_week_focus: "",
};

async function callExpand(text: string, instruction: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/expand-therapy-note`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text, instruction }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || j.detail || "AI 확장 실패");
  return j.text || text;
}

export default function GroupTherapyNoteComposer({ open, onClose, centerId, weekKey, onCreated }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [common, setCommon] = useState<Common>(EMPTY_COMMON);
  const [personal, setPersonal] = useState<Record<string, Personal>>({});
  const [submitting, setSubmitting] = useState(false);
  const [expanding, setExpanding] = useState<string | null>(null);
  const [openChild, setOpenChild] = useState<string | null>(null);
  const [activitySeed, setActivitySeed] = useState("");
  const [autoGenerating, setAutoGenerating] = useState(false);


  // Load groups
  useEffect(() => {
    if (!open || !centerId) return;
    (async () => {
      const { data } = await supabase
        .from("center_client_groups")
        .select("id, name, color")
        .eq("center_id", centerId)
        .order("name");
      setGroups((data || []) as Group[]);
    })();
  }, [open, centerId]);

  // Load group members
  useEffect(() => {
    if (!groupId) { setMembers([]); setSelected(new Set()); return; }
    (async () => {
      const { data } = await supabase
        .from("center_client_group_members")
        .select("client_id, center_clients(id, name, guardian_phone)")
        .eq("center_id", centerId)
        .eq("group_id", groupId);
      const rows: Member[] = ((data || []) as any[])
        .map((r) => r.center_clients)
        .filter(Boolean)
        .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "", "ko"));
      setMembers(rows);
      setSelected(new Set(rows.map((m) => m.id)));
    })();
  }, [groupId, centerId]);

  const toggleChild = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const updatePersonal = (id: string, patch: Partial<Personal>) =>
    setPersonal((p) => ({ ...p, [id]: { observation: "", special: "", ...(p[id] || {}), ...patch } }));

  const expandCommonField = async (field: keyof Common, instruction: string) => {
    const v = common[field];
    if (!v?.trim()) { toast({ title: "확장할 내용을 먼저 적어주세요" }); return; }
    setExpanding(`c:${field}`);
    try {
      const out = await callExpand(v, instruction);
      setCommon((c) => ({ ...c, [field]: out }));
    } catch (e: any) {
      toast({ title: "AI 확장 실패", description: e?.message, variant: "destructive" });
    } finally { setExpanding(null); }
  };

  const expandPersonalField = async (clientId: string, field: keyof Personal, instruction: string) => {
    const v = personal[clientId]?.[field] || "";
    if (!v.trim()) { toast({ title: "이 아동의 키워드를 먼저 적어주세요" }); return; }
    setExpanding(`p:${clientId}:${field}`);
    try {
      const out = await callExpand(v, instruction);
      updatePersonal(clientId, { [field]: out });
    } catch (e: any) {
      toast({ title: "AI 확장 실패", description: e?.message, variant: "destructive" });
    } finally { setExpanding(null); }
  };

  const autoGenerateAll = async () => {
    const seed = activitySeed.trim();
    if (!seed) { toast({ title: "프로그램/활동명을 먼저 적어주세요" }); return; }
    setAutoGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/generate-group-common-fields`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ activity: seed }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || j.detail || "전체 생성 실패");
      setCommon((c) => ({
        title: j.title || c.title || seed,
        greeting: j.greeting || c.greeting,
        activities_summary: j.activities_summary || c.activities_summary,
        highlights: Array.isArray(j.highlights) && j.highlights.length ? j.highlights.join("\n") : c.highlights,
        home_tips: Array.isArray(j.home_tips) && j.home_tips.length ? j.home_tips.join("\n") : c.home_tips,
        next_week_focus: j.next_week_focus || c.next_week_focus,
      }));
      toast({ title: "공통 영역 전체 생성 완료", description: "내용을 검토·수정 후 일괄 생성하세요." });
    } catch (e: any) {
      toast({ title: "전체 생성 실패", description: e?.message, variant: "destructive" });
    } finally { setAutoGenerating(false); }
  };

  const submit = async () => {
    if (!groupId) { toast({ title: "그룹을 선택하세요" }); return; }
    const chosen = Array.from(selected);
    if (chosen.length === 0) { toast({ title: "최소 1명을 선택하세요" }); return; }
    if (!common.activities_summary.trim() && !common.highlights.trim()) {
      if (!confirm("공통 활동 내용이 비어있어요. 그래도 진행할까요?")) return;
    }
    setSubmitting(true);
    try {
      const perChild: Record<string, Personal> = {};
      for (const id of chosen) perChild[id] = personal[id] || { observation: "", special: "" };

      const payload = {
        centerId,
        groupId,
        weekKey,
        common: {
          title: common.title.trim(),
          greeting: common.greeting,
          activities_summary: common.activities_summary,
          highlights: common.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
          home_tips: common.home_tips.split("\n").map((s) => s.trim()).filter(Boolean),
          next_week_focus: common.next_week_focus,
        },
        perChild,
      };

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/generate-group-therapy-notes`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || j.detail || "생성 실패");
      toast({ title: `${j.count}건 생성 완료`, description: j.failures?.length ? `실패 ${j.failures.length}건` : "각 아동 노트로 들어가서 검토·발행해주세요." });
      onCreated?.(j.results || []);
      onClose();
    } catch (e: any) {
      toast({ title: "그룹 작성 실패", description: e?.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const chosenList = useMemo(() => members.filter((m) => selected.has(m.id)), [members, selected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-start md:items-center justify-center p-2 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl my-4 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C8B88A]" />
            <h2 className="text-lg font-semibold">그룹(반) 단위 치료노트 일괄 작성</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          {/* Step 1: Group + week */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">그룹</label>
              <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">— 그룹 선택 —</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <span className="text-xs text-neutral-500">주차: <b>{weekKey}</b></span>
            <span className="text-xs text-neutral-500">선택됨: <b>{selected.size}</b> / {members.length}명</span>
          </div>

          {groups.length === 0 && (
            <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg p-3">
              그룹이 없어요. <a className="underline" href="/b2b-center/app/groups">그룹 관리</a>에서 먼저 만들어주세요.
            </div>
          )}

          {groupId && (
            <>
              {/* Common section */}
              <section className="rounded-2xl border-2 border-[#C8B88A]/50 bg-[#FDFBF3] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-[#9A8B5C] uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" /> 공통 영역 · 그룹 전원에게 동일 적용
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-4 break-keep">
                  여기 적은 내용은 선택한 아동 <b>{selected.size}명 전원의 주간 노트에 동일하게</b> 들어갑니다.
                  개인별 내용은 절대 여기 쓰지 마세요.
                </p>
                <div className="rounded-xl bg-white border border-[#C8B88A]/40 p-4 mb-4">
                  <label className="block text-[11px] font-semibold text-[#9A8B5C] mb-2 tracking-wider uppercase">
                    프로그램 / 활동명 한 줄 → 공통 영역 전체 자동 생성
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={activitySeed}
                      onChange={(e) => setActivitySeed(e.target.value)}
                      placeholder="예: 도형 매칭 + 집단 율동"
                      className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white"
                    />
                    <button
                      onClick={autoGenerateAll}
                      disabled={autoGenerating || !activitySeed.trim()}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium disabled:opacity-50"
                    >
                      {autoGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {autoGenerating ? "생성 중…" : "전체 자동 생성"}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">활동명만 적으면 인사·활동 내용·하이라이트·가정 활동·다음 주 방향까지 AI가 한 번에 채워줍니다. 이후 직접 수정 가능합니다.</p>
                </div>

                <div className="space-y-3">
                  <CommonInput label="제목 (선택)" value={common.title} onChange={(v) => setCommon((c) => ({ ...c, title: v }))} placeholder="예: 이번 주 도형 인식 활동" />
                  <CommonTextarea
                    label="보호자께 인사 (공통)"
                    value={common.greeting}
                    onChange={(v) => setCommon((c) => ({ ...c, greeting: v }))}
                    onExpand={(inst) => expandCommonField("greeting", inst)}
                    expanding={expanding === "c:greeting"}
                  />
                  <CommonTextarea
                    label="이번 주 활동 내용 (공통) ★"
                    value={common.activities_summary}
                    onChange={(v) => setCommon((c) => ({ ...c, activities_summary: v }))}
                    placeholder="예: 도형 매칭 게임, 집단 율동, 마무리 회상"
                    onExpand={(inst) => expandCommonField("activities_summary", inst)}
                    expanding={expanding === "c:activities_summary"}
                  />
                  <CommonTextarea
                    label="하이라이트 (공통) — 한 줄에 하나씩"
                    value={common.highlights}
                    onChange={(v) => setCommon((c) => ({ ...c, highlights: v }))}
                    placeholder={"전원 협력 활동 완료\n새 친구 환영 시간"}
                    onExpand={(inst) => expandCommonField("highlights", inst)}
                    expanding={expanding === "c:highlights"}
                  />
                  <CommonTextarea
                    label="가정 활동 제안 (공통) — 한 줄에 하나씩"
                    value={common.home_tips}
                    onChange={(v) => setCommon((c) => ({ ...c, home_tips: v }))}
                    onExpand={(inst) => expandCommonField("home_tips", inst)}
                    expanding={expanding === "c:home_tips"}
                  />
                  <CommonTextarea
                    label="다음 주 집중 방향 (공통)"
                    value={common.next_week_focus}
                    onChange={(v) => setCommon((c) => ({ ...c, next_week_focus: v }))}
                    onExpand={(inst) => expandCommonField("next_week_focus", inst)}
                    expanding={expanding === "c:next_week_focus"}
                  />
                </div>
              </section>

              {/* Personal section */}
              <section className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider text-blue-700 uppercase">
                    개인 영역 · 아동별로 따로 입력
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-4 break-keep">
                  각 아동의 <b>회기 관찰·특이사항</b>은 여기에서만 입력하세요.
                  입력 안 한 아동은 공통 내용만으로 노트가 생성됩니다(빈 특이사항을 억지로 만들지 않음).
                </p>

                {members.length === 0 && (
                  <p className="text-xs text-neutral-400">그룹에 소속된 아동이 없어요.</p>
                )}

                <div className="space-y-2">
                  {members.map((m) => {
                    const isOpen = openChild === m.id;
                    const p = personal[m.id] || { observation: "", special: "" };
                    const isSel = selected.has(m.id);
                    return (
                      <div key={m.id} className={`rounded-xl border bg-white ${isSel ? "border-neutral-200" : "border-neutral-100 opacity-60"}`}>
                        <div className="flex items-center gap-3 p-3">
                          <input type="checkbox" checked={isSel} onChange={() => toggleChild(m.id)} className="w-4 h-4" />
                          <button
                            onClick={() => setOpenChild(isOpen ? null : m.id)}
                            className="flex-1 flex items-center justify-between text-left"
                          >
                            <span className="text-sm font-medium">{m.name}</span>
                            <span className="flex items-center gap-2 text-xs text-neutral-400">
                              {(p.observation || p.special) ? <span className="text-blue-600">개인 메모 있음</span> : <span>개인 메모 없음 (공통만)</span>}
                              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                          </button>
                        </div>
                        {isOpen && isSel && (
                          <div className="border-t border-neutral-100 p-3 space-y-3 bg-neutral-50/50">
                            <PersonalTextarea
                              label={`${m.name} · 회기 관찰 (이 아동만)`}
                              value={p.observation}
                              onChange={(v) => updatePersonal(m.id, { observation: v })}
                              placeholder="키워드만 적어도 됩니다. 예: 도형 매칭 즐거워함, 색깔 인지 향상"
                              onExpand={(inst) => expandPersonalField(m.id, "observation", inst)}
                              expanding={expanding === `p:${m.id}:observation`}
                            />
                            <PersonalTextarea
                              label={`${m.name} · 특이사항 (이 아동만)`}
                              value={p.special}
                              onChange={(v) => updatePersonal(m.id, { special: v })}
                              placeholder="예: 오후에 졸려함, 보호자 전달 필요사항"
                              onExpand={(inst) => expandPersonalField(m.id, "special", inst)}
                              expanding={expanding === `p:${m.id}:special`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Preview / safety reminder */}
              <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg p-3">
                생성 시: 선택된 <b>{chosenList.length}명</b> 각자에게 별도 주간 노트가 만들어집니다.
                각 노트에는 위 공통 내용 + 본인 개인 메모만 들어가며, 다른 아동의 개인 메모는 절대 포함되지 않습니다.
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-100 sticky bottom-0 bg-white rounded-b-3xl">
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-neutral-200 text-sm">취소</button>
          <button
            disabled={submitting || !groupId || selected.size === 0}
            onClick={submit}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#C8B88A] text-neutral-900 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {submitting ? "생성 중…" : `${selected.size}명 일괄 생성`}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommonInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-neutral-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white" />
    </div>
  );
}

function CommonTextarea({ label, value, onChange, placeholder, onExpand, expanding }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; onExpand?: (inst: string) => void; expanding?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-medium text-neutral-600">{label}</label>
        {onExpand && (
          <button
            disabled={expanding}
            onClick={() => onExpand("expand")}
            className="inline-flex items-center gap-1 text-[11px] text-[#9A8B5C] hover:text-[#7A6C44] disabled:opacity-50"
          >
            {expanding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI 확장 (공통)
          </button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white resize-y"
      />
    </div>
  );
}

function PersonalTextarea({ label, value, onChange, placeholder, onExpand, expanding }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; onExpand: (inst: string) => void; expanding: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-medium text-blue-700">{label}</label>
        <button
          disabled={expanding}
          onClick={() => onExpand("expand")}
          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {expanding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI 확장 (이 아동만)
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white resize-y"
      />
    </div>
  );
}
