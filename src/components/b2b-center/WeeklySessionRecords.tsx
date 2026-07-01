import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2, Sparkles, ImagePlus, X } from "lucide-react";

const PHOTO_BUCKET = "center-session-uploads";

type SessionPhoto = { path: string; uploaded_at?: string };

// 과목별 예시 풀 — 프로그램명 감지 + 세션 id 해시로 매 회기마다 다른 예시
const EXAMPLE_POOL: { match: RegExp; samples: string[] }[] = [
  { match: /특수체육|체육|감통|운동/, samples: [
    "미끄럼틀 5회, 처음엔 거부 → 후반엔 자발 시도. 종료 시 정리 잘함",
    "트램폴린 3분 점프 유지, 균형 흔들림 감소",
    "장애물 코스 2바퀴 완주, 지시 따르기 향상",
    "공 주고받기 10회 성공, 시선 맞춤 늘어남",
  ]},
  { match: /미술|아트|그리기|만들기/, samples: [
    "크레파스 자유화, 색 3가지 선택. 마무리 정리 스스로",
    "찰흙 주무르기 거부 → 도구 사용 후 참여",
    "가위질 직선 3회 성공, 손 협응 개선",
    "물감 놀이 집중 15분, 색 이름 5개 표현",
  ]},
  { match: /언어|말|발음|스피치/, samples: [
    "/ㅅ/ 발음 단어 10개 중 7개 정조음",
    "그림카드 문장 만들기 5회, 조사 사용 자연스러움",
    "지시 따르기 3단계 성공, 반응 속도 향상",
    "이야기 순서 4장면 정확히 배열",
  ]},
  { match: /인지|학습|수학|한글/, samples: [
    "숫자 1~20 순서 맞추기 성공, 실수 감소",
    "같은 그림 찾기 8/10, 집중 15분 유지",
    "한글 자음 5개 읽기 정확, 쓰기 도움 필요",
    "패턴 완성 4단계, 스스로 수정 시도",
  ]},
  { match: /놀이|심리|정서|사회|상담/, samples: [
    "역할놀이 10분 몰입, 감정 단어 3개 표현",
    "보드게임 규칙 지키기 성공, 순서 기다림 향상",
    "감정 카드 · '속상함' 상황 자발 이야기",
    "블록 협동 놀이, 양보 2회 관찰됨",
  ]},
  { match: /음악|악기|리듬/, samples: [
    "리듬 따라치기 4마디 성공, 박자 안정",
    "노래 후렴구 자발 참여, 발성 커짐",
    "악기 3종 탐색, 선호 악기 스스로 선택",
    "손뼉치기·발구르기 연속 8회 유지",
  ]},
  { match: /.*/, samples: [
    "목표 활동 3회기 중 2회 성공, 협조도 향상",
    "초반 거부 있었으나 후반 자발 참여 늘어남",
    "지시 이해도 좋아짐, 마무리 정리 스스로 시도",
    "컨디션 양호, 다음 회기 동일 활동 심화 예정",
  ]},
];

function pickExample(programName: string | undefined, seed: string) {
  const name = programName ?? "";
  const bucket = EXAMPLE_POOL.find((b) => b.match.test(name)) ?? EXAMPLE_POOL[EXAMPLE_POOL.length - 1];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return bucket.samples[h % bucket.samples.length];
}

function SessionPhotoStrip({
  centerId, clientId, sessionId, photos, onChange,
}: {
  centerId: string; clientId: string; sessionId: string;
  photos: SessionPhoto[]; onChange: (next: SessionPhoto[]) => void;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const paths = photos.map((p) => p.path).filter(Boolean);
    if (!paths.length) { setUrls({}); return; }
    let cancelled = false;
    (async () => {
      const out: Record<string, string> = {};
      await Promise.all(paths.map(async (p) => {
        const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(p, 3600);
        if (data?.signedUrl) out[p] = data.signedUrl;
      }));
      if (!cancelled) setUrls(out);
    })();
    return () => { cancelled = true; };
  }, [photos.map((p) => p.path).join("|")]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const next = [...photos];
      for (const f of Array.from(files)) {
        const ext = (f.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
        const path = `${centerId}/${clientId}/sessions/${sessionId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, f, {
          contentType: f.type || "image/jpeg", upsert: false,
        });
        if (error) throw error;
        next.push({ path, uploaded_at: new Date().toISOString() });
      }
      onChange(next);
      toast({ title: `사진 ${files.length}장 업로드 완료` });
    } catch (e: any) {
      toast({ title: "업로드 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = async (path: string) => {
    if (!confirm("이 사진을 삭제할까요?")) return;
    await supabase.storage.from(PHOTO_BUCKET).remove([path]);
    onChange(photos.filter((p) => p.path !== path));
  };

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-[11px] text-neutral-500">회기 사진 ({photos.length})</label>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-200 text-[11px] hover:bg-neutral-50 disabled:opacity-50">
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
          사진 추가
        </button>
        <span className="text-[10px] text-neutral-400">발행 시 보호자 주간노트에 함께 보여요</span>
      </div>
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <div key={p.path} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
              {urls[p.path] ? (
                <img src={urls[p.path]} alt="회기 사진" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">…</div>
              )}
              <button type="button" onClick={() => removePhoto(p.path)}
                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Props = {
  centerId: string;
  clientId: string;
  weekKey: string; // ISO week e.g. 2026-W26
};

type StatusCode = "scheduled" | "completed" | "cancelled" | "cancelled_makeup" | "cancelled_carry";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  scheduled: { label: "예정", tone: "text-amber-700 bg-amber-50 border-amber-200" },
  completed: { label: "완료", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  cancelled: { label: "취소", tone: "text-rose-700 bg-rose-50 border-rose-200" },
  cancelled_makeup: { label: "취소(보강)", tone: "text-violet-700 bg-violet-50 border-violet-200" },
  cancelled_carry: { label: "취소(이월)", tone: "text-neutral-700 bg-neutral-100 border-neutral-200" },
};

function weekRangeFromKey(weekKey: string): [string, string] {
  const m = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!m) { const t = new Date().toISOString().slice(0,10); return [t, t]; }
  const y = parseInt(m[1]); const w = parseInt(m[2]);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Mon = new Date(jan4); week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const start = new Date(week1Mon); start.setUTCDate(week1Mon.getUTCDate() + (w - 1) * 7);
  const end = new Date(start); end.setUTCDate(start.getUTCDate() + 6);
  return [start.toISOString().slice(0,10), end.toISOString().slice(0,10)];
}

export default function WeeklySessionRecords({ centerId, clientId, weekKey }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, { consult: string; record: string; special: string; keywords?: string; dirty?: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const range = useMemo(() => weekRangeFromKey(weekKey), [weekKey]);

  useEffect(() => {
    if (!centerId || !clientId) { setSessions([]); setEdits({}); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [s, t, p] = await Promise.all([
        supabase.from("center_sessions").select("*")
          .eq("center_id", centerId).eq("client_id", clientId)
          .gte("session_date", range[0]).lte("session_date", range[1])
          .order("session_date").order("start_time", { nullsFirst: true }),
        supabase.from("center_therapists").select("id,name,title").eq("center_id", centerId),
        supabase.from("center_programs").select("id,name,category").eq("center_id", centerId),
      ]);
      if (cancelled) return;
      setSessions(s.data ?? []);
      setTherapists(t.data ?? []);
      setPrograms(p.data ?? []);
      const seed: Record<string, any> = {};
      for (const r of s.data ?? []) {
        const m = (r as any).meta?.records ?? {};
        seed[r.id] = { consult: m.consult ?? "", record: m.record ?? "", special: m.special ?? "" };
      }
      setEdits(seed);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [centerId, clientId, range[0], range[1]]);

  const updateEdit = (id: string, key: "consult" | "record" | "special" | "keywords", value: string) => {
    setEdits((p) => ({ ...p, [id]: { ...p[id], [key]: value, dirty: key === "keywords" ? p[id]?.dirty : true } }));
  };

  const updatePhotos = async (sessionId: string, photos: SessionPhoto[]) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const nextMeta = { ...(session.meta ?? {}), photos };
    const { error } = await supabase.from("center_sessions").update({ meta: nextMeta }).eq("id", sessionId);
    if (error) { toast({ title: "사진 저장 실패", description: error.message, variant: "destructive" }); return; }
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, meta: nextMeta } : s)));
  };


  const expandWithAI = async (id: string) => {
    const e = edits[id]; if (!e) return;
    const kw = (e.keywords ?? "").trim();
    if (!kw) { toast({ title: "키워드를 먼저 입력해주세요", description: "예: 미끄럼틀 5회, 처음엔 거부 → 후반엔 자발 시도" }); return; }
    const session = sessions.find((s) => s.id === id);
    const th = therapists.find((t) => t.id === session?.therapist_id);
    const pg = programs.find((p) => p.id === session?.program_id);
    setExpandingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("expand-session-record", {
        body: {
          keywords: kw,
          context: {
            program: pg?.name,
            therapist: th?.name,
            date: session?.session_date,
            time: session?.start_time?.slice(0, 5),
          },
        },
      });
      if (error) throw error;
      const out = data ?? {};
      setEdits((p) => ({
        ...p,
        [id]: {
          ...p[id],
          consult: out.activity || p[id]?.consult || "",
          record: out.evaluation || p[id]?.record || "",
          special: out.special || p[id]?.special || "",
          dirty: true,
        },
      }));
      toast({ title: "AI 확장 완료", description: "내용을 확인하고 다듬은 뒤 저장하세요." });
    } catch (err: any) {
      toast({ title: "AI 확장 실패", description: err?.message ?? String(err), variant: "destructive" });
    } finally {
      setExpandingId(null);
    }
  };

  const saveOne = async (id: string) => {
    const e = edits[id]; if (!e) return;
    setSavingId(id);
    const session = sessions.find((s) => s.id === id);
    const nextMeta = { ...(session?.meta ?? {}), records: { consult: e.consult, record: e.record, special: e.special } };
    const { error } = await supabase.from("center_sessions").update({ meta: nextMeta }).eq("id", id);
    if (error) { toast({ title: "저장 실패", description: error.message, variant: "destructive" }); setSavingId(null); return; }
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, meta: nextMeta } : s)));
    setEdits((p) => ({ ...p, [id]: { ...p[id], dirty: false } }));
    setSavingId(null);
    toast({ title: "기록이 저장됐어요" });
  };

  if (!clientId) return null;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-6">
      <div className="mb-4">
        <h2 className="font-semibold">이번 주 회기 기록 ({sessions.length}건)</h2>
        <p className="text-xs text-neutral-500 mt-0.5">키워드 한 줄만 적고 <span className="font-medium text-[#8B7A4A]">AI 확장</span>을 누르면 활동내용·주관평가·특이사항 3칸을 자동으로 채워드려요.</p>
      </div>
      {loading ? (
        <p className="text-sm text-neutral-400 py-6 text-center">불러오는 중…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-neutral-400 py-6 text-center">이번 주 잡힌 회기가 없어요.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const e = edits[s.id] ?? { consult: "", record: "", special: "" };
            const status = STATUS_LABEL[s.status];
            const th = therapists.find((t) => t.id === s.therapist_id);
            const pg = programs.find((p) => p.id === s.program_id);
            return (
              <div key={s.id} className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/40">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="text-sm">
                    <span className="font-medium">{s.session_date}</span>
                    <span className="text-neutral-500 ml-2">{s.start_time?.slice(0,5) ?? "—"}{s.end_time ? ` ~ ${s.end_time.slice(0,5)}` : ""}</span>
                    {pg && <span className="text-neutral-500 ml-2">· {pg.name}</span>}
                    {th && <span className="text-neutral-500 ml-2">· {th.name}{th.title ? `/${th.title}` : ""}</span>}
                  </div>
                  {status && <span className={`text-[11px] px-2 py-0.5 rounded-full border ${status.tone}`}>{status.label}</span>}
                </div>
                {/* AI 키워드 한 줄 입력 + 확장 */}
                <div className="flex items-stretch gap-2 mb-3">
                  <input
                    value={e.keywords ?? ""}
                    onChange={(ev) => updateEdit(s.id, "keywords", ev.target.value)}
                    onKeyDown={(ev) => { if (ev.key === "Enter") { ev.preventDefault(); expandWithAI(s.id); } }}
                    placeholder="예) 미끄럼틀 5회, 처음엔 거부 → 후반엔 자발 시도. 종료 시 정리 잘함"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#C8B88A]/50 bg-[#FBF8F1] text-sm focus:outline-none focus:border-[#C8B88A]"
                  />
                  <button
                    type="button"
                    onClick={() => expandWithAI(s.id)}
                    disabled={expandingId === s.id || !(e.keywords ?? "").trim()}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#C8B88A] text-neutral-900 text-xs font-medium hover:bg-[#b9a877] disabled:opacity-40 disabled:cursor-not-allowed"
                    title="키워드를 3칸으로 확장"
                  >
                    {expandingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {expandingId === s.id ? "확장 중…" : "AI 확장"}
                  </button>
                </div>
                <SessionPhotoStrip
                  centerId={centerId}
                  clientId={clientId}
                  sessionId={s.id}
                  photos={Array.isArray(s.meta?.photos) ? s.meta.photos : []}
                  onChange={(next) => updatePhotos(s.id, next)}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

                  <div>
                    <label className="text-[11px] text-neutral-500 mb-1 block">활동내용</label>
                    <textarea value={e.consult} onChange={(ev) => updateEdit(s.id, "consult", ev.target.value)} placeholder="회기에 진행한 활동" rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 mb-1 block">주관평가</label>
                    <textarea value={e.record} onChange={(ev) => updateEdit(s.id, "record", ev.target.value)} placeholder="치료사 시각의 수행·반응" rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 mb-1 block">특이사항</label>
                    <textarea value={e.special} onChange={(ev) => updateEdit(s.id, "special", ev.target.value)} placeholder="컨디션·다음 회기 메모" rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y bg-white" />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => saveOne(s.id)}
                    disabled={savingId === s.id || !edits[s.id]?.dirty}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition ${
                      edits[s.id]?.dirty ? "bg-neutral-900 text-white hover:bg-neutral-800" : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    {savingId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    {savingId === s.id ? "저장 중…" : edits[s.id]?.dirty ? "저장" : "저장됨"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
