import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Building2, UserCog, BookOpen, Users, Calendar, CheckCircle2, ArrowRight, Sparkles, Upload } from "lucide-react";
import ImportWizard from "@/components/b2b-center/ImportWizard";
import { toast } from "sonner";

type Ctx = { centerId: string; demo?: boolean };

interface Step {
  key: string;
  title: string;
  desc: string;
  icon: any;
  check: () => Promise<boolean>;
  cta: { label: string; href: string };
  importable?: boolean;
}

export default function OnboardingWizardPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const steps: Step[] = [
    {
      key: "org",
      title: "01. 기관 정보 입력",
      desc: "상호·사업자번호·주소를 등록해 영수증 발급 준비를 마칩니다.",
      icon: Building2,
      check: async () => {
        const { data } = await supabase.from("center_organizations").select("business_no,phone,address").eq("id", centerId).maybeSingle();
        return !!(data?.business_no || data?.phone);
      },
      cta: { label: "기관 정보 작성", href: "/b2b-center/app/admin/organization" },
    },
    {
      key: "therapists",
      title: "02. 선생님 등록",
      desc: "치료사 1명 이상을 등록해야 일정·수납이 시작됩니다.",
      icon: UserCog,
      check: async () => {
        const { count } = await supabase.from("center_therapists").select("id", { count: "exact", head: true }).eq("center_id", centerId);
        return (count ?? 0) > 0;
      },
      cta: { label: "선생님 추가", href: "/b2b-center/app/admin/therapists" },
      importable: true,
    },
    {
      key: "programs",
      title: "03. 프로그램 단가표",
      desc: "회기별 가격·바우처 여부를 등록해 청구 자동화를 켭니다.",
      icon: BookOpen,
      check: async () => {
        const { count } = await supabase.from("center_programs").select("id", { count: "exact", head: true }).eq("center_id", centerId);
        return (count ?? 0) > 0;
      },
      cta: { label: "프로그램 등록", href: "/b2b-center/app/admin/programs" },
    },
    {
      key: "clients",
      title: "04. 이용자 임포트",
      desc: "엑셀로 이용자를 한 번에 등록하거나 개별 추가합니다.",
      icon: Users,
      check: async () => {
        const { count } = await supabase.from("center_clients").select("id", { count: "exact", head: true }).eq("center_id", centerId);
        return (count ?? 0) > 0;
      },
      cta: { label: "이용자 추가", href: "/b2b-center/app/clients" },
      importable: true,
    },
    {
      key: "schedule",
      title: "05. 첫 일정 등록",
      desc: "일정을 한 건 잡으면 수납·청구가 자동 흐름으로 이어집니다.",
      icon: Calendar,
      check: async () => {
        const { count } = await supabase.from("center_sessions").select("id", { count: "exact", head: true }).eq("center_id", centerId);
        return (count ?? 0) > 0;
      },
      cta: { label: "일정 만들기", href: "/b2b-center/app/schedule" },
      importable: true,
    },
  ];

  useEffect(() => {
    if (demo) {
      setCompleted({ org: true, therapists: true, programs: true, clients: true, schedule: true });
      setLoading(false);
      return;
    }
    (async () => {
      const results: Record<string, boolean> = {};
      await Promise.all(steps.map(async (s) => { results[s.key] = await s.check(); }));
      setCompleted(results);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, demo, refreshTick]);

  const doneCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const nextStep = steps.find((s) => !completed[s.key]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Helmet><title>센터 시작 가이드 — AIHPRO</title></Helmet>

      <header>
        <p className="text-xs tracking-widest text-[#C8B88A]">SETUP WIZARD</p>
        <h1 className="text-2xl font-semibold flex items-center gap-2 mt-1"><Sparkles className="w-5 h-5 text-[#C8B88A]" /> 5분 만에 센터 콘솔 켜기</h1>
        <p className="text-sm text-neutral-600 mt-2 break-keep">5단계를 마치면 일정·수납·바우처 청구·부모 리포트가 모두 자동으로 돌아갑니다.</p>
      </header>

      <div className="rounded-2xl bg-white border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">진행률 {doneCount} / {steps.length}</p>
          <p className="text-sm font-mono text-[#C8B88A]">{progress}%</p>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#C8B88A] transition-all" style={{ width: `${progress}%` }} />
        </div>
        {nextStep && progress < 100 && (
          <button onClick={() => navigate(nextStep.cta.href)} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800">
            다음 단계: {nextStep.title.replace(/^\d+\.\s*/, "")} <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {progress === 100 && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-800">모든 셋업 완료. 이제 실제 운영을 시작할 수 있습니다.</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-neutral-400 text-sm text-center p-8">불러오는 중…</p> :
         steps.map((s) => {
          const done = completed[s.key];
          return (
            <div key={s.key} className={`rounded-2xl border p-5 transition ${done ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-neutral-200"}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1 break-keep">{s.desc}</p>
                </div>
                <button onClick={() => navigate(s.cta.href)} className={`shrink-0 px-3 py-1.5 rounded-lg text-sm ${done ? "border border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "bg-neutral-900 text-white hover:bg-neutral-800"}`}>
                  {done ? "확인" : s.cta.label}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
