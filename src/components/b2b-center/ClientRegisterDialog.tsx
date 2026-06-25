import { useEffect, useState } from "react";
import { X, Loader2, User, Trash2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


const schema = z.object({
  name: z.string().trim().min(1, "이름을 입력하세요").max(30),
  gender: z.enum(["여", "남"], { errorMap: () => ({ message: "성별을 선택하세요" }) }),
  birth_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식"),
  member_no: z.string().trim().max(50).optional().or(z.literal("")),
  initial_consult_date: z.string().trim().optional().or(z.literal("")),
  guardian_label: z.string().optional(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  guardian_phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("이메일 형식 오류").max(100).optional().or(z.literal("")),
  disability_type: z.string().optional(),
  disability_grade: z.string().optional(),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  school: z.string().trim().max(80).optional().or(z.literal("")),
  status: z.enum(["대기", "등록", "종결"]),
  source: z.string().optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

const DISABILITY_TYPES = ["미응답", "지적장애", "자폐성장애", "지체장애", "뇌병변장애", "시각장애", "청각장애", "언어장애", "발달지연", "기타"];
const DISABILITY_GRADES = ["해당없음", "경증", "중증"];
const SOURCES = ["선택안함", "온라인 검색", "지인 추천", "기관 안내", "발달재활 바우처", "교육청", "기타"];
const GUARDIANS = ["본인", "모", "부", "조부모", "기타"];
const STATUS_OPTS = [
  { v: "등록", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { v: "대기", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { v: "종결", tone: "bg-neutral-100 text-neutral-600 border-neutral-200" },
] as const;

const STATUS_TO_CODE: Record<string, string> = { 대기: "waiting", 등록: "enrolled", 종결: "terminated" };
const STATUS_FROM_CODE: Record<string, "대기" | "등록" | "종결"> = {
  waiting: "대기", enrolled: "등록", terminated: "종결",
  대기: "대기", 등록: "등록", 종결: "종결",
};

interface Props {
  open: boolean;
  centerId: string;
  demo?: boolean;
  client?: any | null; // when set, dialog is in edit mode
  onClose: () => void;
  onCreated?: () => void;
}


export default function ClientRegisterDialog({ open, centerId, demo, client, onClose, onCreated }: Props) {
  const { toast } = useToast();
  const isEdit = !!client?.id;
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [continueAfter, setContinueAfter] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [form, setForm] = useState<FormState>({
    name: "", gender: "여", birth_date: "", member_no: "", initial_consult_date: "",
    guardian_label: "모", phone: "", guardian_phone: "", email: "",
    disability_type: "미응답", disability_grade: "해당없음", address: "", school: "",
    status: "등록", source: "선택안함", note: "",
  });

  useEffect(() => {
    if (!open) return;
    if (client) {
      const di: string = client.disability_info ?? "";
      const parts = di.split("·").map((s: string) => s.trim()).filter(Boolean);
      const dtype = parts.find((p) => DISABILITY_TYPES.includes(p)) ?? "미응답";
      const dgrade = parts.find((p) => DISABILITY_GRADES.includes(p)) ?? "해당없음";
      const meta = client.meta ?? {};
      setForm({
        name: client.name ?? "",
        gender: client.gender === "남" ? "남" : "여",
        birth_date: client.birth_date ?? "",
        member_no: client.member_no ?? "",
        initial_consult_date: client.initial_consult_date ?? "",
        guardian_label: meta.guardian_label ?? "모",
        phone: client.phone ?? "",
        guardian_phone: client.guardian_phone ?? "",
        email: meta.email ?? "",
        disability_type: dtype,
        disability_grade: dgrade,
        address: client.address ?? "",
        school: meta.school ?? "",
        status: STATUS_FROM_CODE[client.status] ?? "등록",
        source: meta.source ?? "선택안함",
        note: meta.note ?? "",
      });
      setErrors({});
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client?.id]);

  if (!open) return null;


  function reset() {
    setForm({
      name: "", gender: "여", birth_date: "", member_no: "", initial_consult_date: "",
      guardian_label: "모", phone: "", guardian_phone: "", email: "",
      disability_type: "미응답", disability_grade: "해당없음", address: "", school: "",
      status: "등록", source: "선택안함", note: "",
    });
    setErrors({});
  }

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  async function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const e: any = {};
      parsed.error.issues.forEach((i) => { if (i.path[0]) e[i.path[0]] = i.message; });
      setErrors(e);
      toast({ title: "필수 항목을 확인하세요", variant: "destructive" });
      return;
    }
    if (demo) {
      toast({ title: "데모 모드", description: "실제 등록은 로그인 후 가능합니다." });
      onClose();
      return;
    }
    setSaving(true);
    try {
      const payload = {
        center_id: centerId,
        name: form.name.trim(),
        gender: form.gender,
        birth_date: form.birth_date || null,
        phone: form.phone || null,
        guardian_phone: form.guardian_phone || null,
        address: form.address || null,
        disability_info: [form.disability_type, form.disability_grade].filter((x) => x && x !== "미응답" && x !== "해당없음").join(" · ") || null,
        status: STATUS_TO_CODE[form.status] ?? "enrolled",
        member_no: form.member_no || null,
        initial_consult_date: form.initial_consult_date || null,
        meta: {
          ...(client?.meta ?? {}),
          email: form.email || null,
          school: form.school || null,
          source: form.source && form.source !== "선택안함" ? form.source : null,
          guardian_label: form.guardian_label || null,
          note: form.note || null,
          last_modified_at: new Date().toISOString().slice(0, 16).replace("T", " "),
        },
      };
      const { error } = isEdit
        ? await supabase.from("center_clients").update(payload).eq("id", client.id)
        : await supabase.from("center_clients").insert(payload);
      if (error) throw error;
      toast({ title: isEdit ? "이용자 정보 저장" : "이용자 등록 완료", description: form.name });
      onCreated?.();
      if (!isEdit && continueAfter) { reset(); }
      else { onClose(); }
    } catch (e: any) {
      toast({ title: isEdit ? "저장 실패" : "등록 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || demo) return;
    if (!confirm(`'${client.name}' 이용자를 삭제할까요? 연결된 회기 기록은 유지되지만 이용자 정보는 복구되지 않습니다.`)) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("center_clients").delete().eq("id", client.id);
      if (error) throw error;
      toast({ title: "이용자 삭제됨", description: client.name });
      onCreated?.();
      onClose();
    } catch (e: any) {
      toast({ title: "삭제 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }


  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl border border-neutral-200 w-full max-w-2xl my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-neutral-100 flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#C8B88A] mb-1">{isEdit ? "EDIT CLIENT" : "NEW CLIENT"}</p>
            <h2 className="text-xl font-semibold">{isEdit ? "이용자 정보 수정" : "이용자 등록"}</h2>
            <p className="text-xs text-neutral-500 mt-1">{isEdit ? "변경할 항목만 수정하고 저장하세요." : "기본 정보만 입력해도 됩니다. 나머지는 언제든 콘솔에서 채울 수 있어요."}</p>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-full"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-8 py-6 space-y-7 max-h-[70vh] overflow-y-auto">
          {/* 01 기본 */}
          <Section num="01" title="기본 정보">
            <Field label="이름" required err={errors.name}>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={30}
                className="ipt" placeholder="홍길동" autoFocus />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="성별" required>
                <div className="inline-flex rounded-full border border-neutral-200 p-0.5 w-full">
                  {(["여", "남"] as const).map((g) => (
                    <button key={g} type="button" onClick={() => update("gender", g)}
                      className={`flex-1 py-1.5 text-sm rounded-full transition ${form.gender === g ? "bg-neutral-900 text-white" : "text-neutral-600"}`}>{g}</button>
                  ))}
                </div>
              </Field>
              <Field label="생년월일" required err={errors.birth_date}>
                <input type="date" value={form.birth_date} onChange={(e) => update("birth_date", e.target.value)} className="ipt" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="회원번호">
                <input value={form.member_no} onChange={(e) => update("member_no", e.target.value)} maxLength={50} placeholder="2026-00001" className="ipt" />
              </Field>
              <Field label="초기상담일">
                <input type="date" value={form.initial_consult_date} onChange={(e) => update("initial_consult_date", e.target.value)} className="ipt" />
              </Field>
            </div>
          </Section>

          {/* 02 연락처 */}
          <Section num="02" title="연락처">
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <select value={form.guardian_label} onChange={(e) => update("guardian_label", e.target.value)} className="ipt">
                {GUARDIANS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <input value={form.guardian_phone} onChange={(e) => update("guardian_phone", e.target.value)} placeholder="010-1234-5678" className="ipt" maxLength={20} />
            </div>
            <Field label="이용자 본인 연락처">
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="선택 입력" className="ipt" maxLength={20} />
            </Field>
            <Field label="이메일" err={errors.email}>
              <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="example@aihpro.app" className="ipt" maxLength={100} />
            </Field>
            <Field label="주소">
              <input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="시/군/구 + 도로명" className="ipt" maxLength={200} />
            </Field>
          </Section>

          {/* 03 추가 */}
          <Section num="03" title="추가 정보">
            <div className="grid grid-cols-2 gap-3">
              <Field label="장애유형">
                <select value={form.disability_type} onChange={(e) => update("disability_type", e.target.value)} className="ipt">
                  {DISABILITY_TYPES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="장애등급">
                <select value={form.disability_grade} onChange={(e) => update("disability_grade", e.target.value)} className="ipt">
                  {DISABILITY_GRADES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>
            <Field label="학교 / 소속">
              <input value={form.school} onChange={(e) => update("school", e.target.value)} maxLength={80} className="ipt" />
            </Field>
            <Field label="유입경로">
              <select value={form.source} onChange={(e) => update("source", e.target.value)} className="ipt">
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="상태" required>
              <div className="flex gap-2">
                {STATUS_OPTS.map((s) => (
                  <button key={s.v} type="button" onClick={() => update("status", s.v)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition ${form.status === s.v ? s.tone + " font-medium" : "bg-white border-neutral-200 text-neutral-500"}`}>{s.v}</button>
                ))}
              </div>
            </Field>
            <Field label="메모">
              <textarea value={form.note} onChange={(e) => update("note", e.target.value)} rows={3} maxLength={500}
                className="ipt resize-none" placeholder="첫 상담 인상, 보호자 요청사항 등" />
            </Field>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50 rounded-b-3xl">
          {isEdit ? (
            <button onClick={handleDelete} disabled={deleting || saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-50">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {deleting ? "삭제 중…" : "이용자 삭제"}
            </button>
          ) : (
            <label className="inline-flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
              <input type="checkbox" checked={continueAfter} onChange={(e) => setContinueAfter(e.target.checked)} className="accent-neutral-900" />
              저장 후 계속 등록
            </label>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm text-neutral-600 hover:bg-neutral-100">취소</button>
            <button onClick={submit} disabled={saving || deleting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              {saving ? "저장 중…" : isEdit ? "저장" : "등록"}
            </button>
          </div>
        </div>

      </div>

      <style>{`.ipt { width:100%; padding:0.55rem 0.75rem; border:1px solid #e5e5e5; border-radius:0.625rem; background:white; font-size:0.875rem; outline:none; transition:border-color .15s; }
        .ipt:focus { border-color:#171717; }`}</style>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[10px] tracking-widest text-[#C8B88A] font-medium">{num}</span>
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <div className="flex-1 h-px bg-neutral-100" />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, required, err, children }: { label: string; required?: boolean; err?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-neutral-600 mb-1 block">
        {label}{required && <span className="text-[#C8B88A] ml-1">*</span>}
      </span>
      {children}
      {err && <span className="text-[11px] text-rose-500 mt-1 block">{err}</span>}
    </label>
  );
}
