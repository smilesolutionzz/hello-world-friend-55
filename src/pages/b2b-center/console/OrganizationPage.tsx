import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Building2, Save, Loader2 } from "lucide-react";
import InviteMemberPanel from "@/components/b2b-center/InviteMemberPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Ctx { centerId: string; demo?: boolean }

interface OrgRow {
  name: string;
  business_no: string | null;
  phone: string | null;
  address: string | null;
  contract_expires_at: string | null;
  plan: string;
  trial_status: string;
  trial_ends_at: string | null;
  storefront_slug: string | null;
}

export default function OrganizationPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OrgRow>({
    name: "",
    business_no: "",
    phone: "",
    address: "",
    contract_expires_at: "",
    plan: "",
    trial_status: "",
    trial_ends_at: null,
    storefront_slug: "",
  });

  useEffect(() => {
    if (!centerId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("center_organizations")
        .select("name,business_no,phone,address,contract_expires_at,plan,trial_status,trial_ends_at,storefront_slug")
        .eq("id", centerId)
        .maybeSingle();
      if (error) {
        toast.error("기관 정보를 불러오지 못했습니다");
      } else if (data) {
        setForm({
          name: data.name ?? "",
          business_no: data.business_no ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          contract_expires_at: data.contract_expires_at ?? "",
          plan: data.plan ?? "",
          trial_status: data.trial_status ?? "",
          trial_ends_at: data.trial_ends_at ?? null,
          storefront_slug: data.storefront_slug ?? "",
        });
      }
      setLoading(false);
    })();
  }, [centerId]);

  const save = async () => {
    if (demo) {
      toast.info("데모 모드에서는 저장할 수 없습니다");
      return;
    }
    if (!form.name.trim()) {
      toast.error("기관명을 입력해 주세요");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("center_organizations")
      .update({
        name: form.name.trim(),
        business_no: form.business_no?.trim() || null,
        phone: form.phone?.trim() || null,
        address: form.address?.trim() || null,
        contract_expires_at: form.contract_expires_at || null,
        storefront_slug: form.storefront_slug?.trim() || null,
      })
      .eq("id", centerId);
    setSaving(false);
    if (error) {
      toast.error("저장 실패: " + error.message);
    } else {
      toast.success("기관 정보를 저장했습니다");
    }
  };

  const field = (label: string, key: keyof OrgRow, type: string = "text", placeholder?: string) => (
    <label className="block">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <input
        type={type}
        value={(form[key] as string) ?? ""}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        disabled={demo || loading}
        className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-[#C8B88A] focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
      />
    </label>
  );

  const trialEnds = form.trial_ends_at ? new Date(form.trial_ends_at).toLocaleDateString("ko-KR") : "—";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Helmet><title>기관 정보 — AIHPRO 센터</title></Helmet>

      <div>
        <p className="text-xs tracking-widest text-neutral-500 mb-1">ADMIN</p>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#C8B88A]" />
          기관 정보
        </h1>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">기관 기본 정보</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("기관명 *", "name", "text", "예) 케어플 발달센터")}
          {field("사업자등록번호", "business_no", "text", "000-00-00000")}
          {field("대표 연락처", "phone", "tel", "02-0000-0000")}
          {field("계약 만료일", "contract_expires_at", "date")}
          <label className="block md:col-span-2">
            <span className="text-xs font-medium text-neutral-600">주소</span>
            <input
              type="text"
              value={form.address ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="도로명 주소 + 상세 주소"
              disabled={demo || loading}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-[#C8B88A] focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
            />
          </label>
          {field("스토어 슬러그 (선택)", "storefront_slug", "text", "예) carepl — /center/{slug}")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
          <div className="rounded-xl bg-neutral-50 px-3 py-2">
            <p className="text-[11px] text-neutral-500">현재 요금제</p>
            <p className="text-sm font-medium">{form.plan || "—"}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 px-3 py-2">
            <p className="text-[11px] text-neutral-500">트라이얼 상태</p>
            <p className="text-sm font-medium">{form.trial_status || "—"}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 px-3 py-2">
            <p className="text-[11px] text-neutral-500">트라이얼 종료</p>
            <p className="text-sm font-medium">{trialEnds}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={save}
            disabled={saving || loading || demo}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            저장
          </button>
        </div>

        {demo && (
          <p className="text-xs text-neutral-500">데모 모드에서는 저장이 비활성화됩니다.</p>
        )}
      </div>

      {demo ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">데모 모드에서는 구성원 초대를 사용할 수 없습니다. 실제 가입 후 본인 기관에서 사용해보세요.</p>
        </div>
      ) : (
        <InviteMemberPanel centerId={centerId} />
      )}
    </div>
  );
}
