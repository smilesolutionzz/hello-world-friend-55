import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, MapPin, Sparkles, Loader2 } from "lucide-react";

type Center = {
  id: string;
  name: string;
  region: string | null;
  category: string | null;
  intro: string | null;
  strength1: string | null;
  strength2: string | null;
  strength3: string | null;
  voucher: string | null;
  contact_channel: string | null;
  external_link: string | null;
  status: string;
};

const BRAND = "#6A52C9";

export default function PublicCenter() {
  const { id } = useParams<{ id: string }>();
  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    parent_name: "",
    phone: "",
    child_age: "",
    concern: "",
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("centers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) console.error(error);
      setCenter(data as Center | null);
      setLoading(false);
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parent_name.trim() || !form.phone.trim()) {
      toast.error("보호자명과 연락처를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("leads").insert({
      center_id: id,
      parent_name: form.parent_name.trim().slice(0, 100),
      phone: form.phone.trim().slice(0, 50),
      child_age: form.child_age.trim().slice(0, 50),
      concern: form.concern.trim().slice(0, 1000),
    });
    setSubmitting(false);
    if (error) {
      toast.error("제출에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    setSubmitted(true);
    toast.success("상담 신청이 접수되었어요.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7FF]">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--brand)]" style={{ color: BRAND }} />
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7FF] px-6 text-center">
        <p className="text-lg font-semibold text-gray-900">기관을 찾을 수 없어요.</p>
        <Link to="/find-center" className="mt-4 text-sm underline" style={{ color: BRAND }}>
          다른 기관 찾기
        </Link>
      </div>
    );
  }

  const strengths = [center.strength1, center.strength2, center.strength3].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7FF] via-[#FFF5F0] to-white">
      <Helmet>
        <title>{center.name} · AIHPRO 검증 파트너</title>
        <meta name="description" content={(center.intro ?? `${center.name} 상담 신청`).slice(0, 150)} />
      </Helmet>

      <div className="mx-auto max-w-2xl px-5 pt-10 pb-24">
        {/* Verified Badge */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: "#EFE9FF", color: BRAND }}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          AIHPRO 검증 파트너
        </div>

        {/* Header */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 break-keep leading-tight">
          {center.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {center.region && (
            <span className="inline-flex items-center gap-1 text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              {center.region}
            </span>
          )}
          {center.category && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: "#FFE8DC", color: "#B8542A" }}
            >
              {center.category}
            </span>
          )}
          {center.voucher && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: "#E6F4EA", color: "#1E7C3A" }}
            >
              {center.voucher}
            </span>
          )}
        </div>

        {/* Intro */}
        {center.intro && (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-purple-100">
            <p className="text-[15px] leading-relaxed text-gray-700 break-keep whitespace-pre-wrap">
              {center.intro}
            </p>
          </div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="mt-6">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <Sparkles className="h-4 w-4" style={{ color: BRAND }} />
              이 기관의 강점
            </h2>
            <div className="mt-3 space-y-2">
              {strengths.map((s, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-purple-50"
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: "#EFE9FF", color: BRAND }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 break-keep">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inquiry Form */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-md ring-1 ring-purple-100">
          <h2 className="text-lg font-bold text-gray-900">상담 신청</h2>
          <p className="mt-1 text-xs text-gray-500">
            입력하신 정보는 이 기관과 AIHPRO 운영팀에게만 전달돼요.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl p-6 text-center" style={{ backgroundColor: "#F3EEFF" }}>
              <p className="text-base font-semibold" style={{ color: BRAND }}>
                상담 신청이 접수되었어요
              </p>
              <p className="mt-2 text-sm text-gray-600 break-keep">
                담당자가 확인 후 빠르게 연락드릴게요.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <Label htmlFor="parent_name" className="text-sm">보호자명 *</Label>
                <Input
                  id="parent_name"
                  required
                  maxLength={100}
                  value={form.parent_name}
                  onChange={(e) => setForm((f) => ({ ...f, parent_name: e.target.value }))}
                  className="mt-1.5"
                  placeholder="예) 김지영"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm">연락처 *</Label>
                <Input
                  id="phone"
                  required
                  type="tel"
                  maxLength={50}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1.5"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <Label htmlFor="child_age" className="text-sm">아이 나이</Label>
                <Input
                  id="child_age"
                  maxLength={50}
                  value={form.child_age}
                  onChange={(e) => setForm((f) => ({ ...f, child_age: e.target.value }))}
                  className="mt-1.5"
                  placeholder="예) 만 5세"
                />
              </div>
              <div>
                <Label htmlFor="concern" className="text-sm">고민 내용</Label>
                <Textarea
                  id="concern"
                  maxLength={1000}
                  rows={4}
                  value={form.concern}
                  onChange={(e) => setForm((f) => ({ ...f, concern: e.target.value }))}
                  className="mt-1.5"
                  placeholder="현재 가장 걱정되는 부분을 편하게 적어주세요."
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl text-base font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    제출 중…
                  </>
                ) : (
                  "상담 신청하기"
                )}
              </Button>
              <p className="text-[11px] text-gray-400 text-center break-keep">
                제출 시 개인정보 수집·이용에 동의한 것으로 간주됩니다.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
