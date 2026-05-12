import { useEffect, useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, ExternalLink, Copy, Loader2, CheckCircle2, AlertCircle, Users, X } from "lucide-react";
import { MIND_TRACK_PRICE } from "@/constants/tokenCosts";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type Org = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  tagline: string | null;
  is_referral_active: boolean;
  commission_rate: number;
};

type Stats = { clicks: number; enrollments: number; paid: number; commission: number };

export default function PartnerCenterDashboard() {
  const { user, loading: authLoading } = useAuthGuard();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<Org | null>(null);
  const [slug, setSlug] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<Stats>({ clicks: 0, enrollments: 0, paid: 0, commission: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id,name,slug,logo_url,tagline,is_referral_active,commission_rate")
        .eq("admin_user_id", user.id)
        .maybeSingle();
      if (error) console.error(error);
      if (data) {
        setOrg(data as Org);
        setSlug(data.slug || "");
        setSavedSlug(data.slug || "");
        setTagline(data.tagline || "");
        setLogoUrl(data.logo_url || "");
        loadStats(data.id);
      }
      setLoading(false);
    })();
  }, [user]);

  const loadStats = async (orgId: string) => {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [{ count: clicks }, { data: enrolls }] = await Promise.all([
      supabase.from("partner_referral_clicks").select("*", { count: "exact", head: true })
        .eq("org_id", orgId).gte("created_at", since),
      supabase.from("mind_track_enrollments").select("payment_status,created_at")
        .eq("referrer_org_id", orgId).gte("created_at", since),
    ]);
    const enrollments = enrolls?.length ?? 0;
    const paid = enrolls?.filter((e: any) => e.payment_status === "paid").length ?? 0;
    const commission = Math.round(paid * MIND_TRACK_PRICE * (org?.commission_rate ?? 0.15));
    setStats({ clicks: clicks ?? 0, enrollments, paid, commission });
  };

  const onSelectFile = (file: File) => {
    setUploadStatus("idle");
    setUploadError("");
    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadError("2MB 이하 이미지만 업로드 가능합니다");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadStatus("error");
      setUploadError("이미지 파일만 업로드 가능합니다");
      return;
    }
    setPendingFile(file);
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingPreview(URL.createObjectURL(file));
  };

  const clearPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview("");
    setUploadStatus("idle");
    setUploadError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onUpload = async () => {
    if (!org || !pendingFile) return;
    setUploadStatus("uploading");
    setUploadError("");
    const ext = pendingFile.name.split(".").pop() || "png";
    const path = `${org.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("partner-logos")
      .upload(path, pendingFile, { upsert: true, contentType: pendingFile.type });
    if (error) {
      setUploadStatus("error");
      setUploadError(error.message);
      toast.error("업로드 실패: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("partner-logos").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setUploadStatus("success");
    toast.success("로고 업로드 완료 — '저장'을 눌러 적용하세요");
    clearPending();
  };

  const onSave = async () => {
    if (!org) return;
    if (slug && !/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug)) {
      toast.error("슬러그는 소문자/숫자/하이픈만, 3~40자");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("organizations")
      .update({ slug: slug || null, tagline: tagline || null, logo_url: logoUrl || null })
      .eq("id", org.id);
    setSaving(false);
    if (error) {
      if (error.message.includes("duplicate")) toast.error("이미 사용 중인 슬러그입니다");
      else toast.error("저장 실패: " + error.message);
      return;
    }
    toast.success("저장되었습니다");
    setOrg({ ...org, slug, tagline, logo_url: logoUrl });
    setSavedSlug(slug);
  };

  const referralUrl = savedSlug ? `${window.location.origin}/c/${savedSlug}` : "";
  const slugDirty = slug !== savedSlug;

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }
  if (!user) return <Navigate to="/auth?redirect=/app/center" replace />;
  if (!org) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <Card className="max-w-lg p-10 text-center rounded-3xl">
          <h1 className="text-2xl font-medium mb-3">파트너 센터 등록이 필요합니다</h1>
          <p className="text-sm text-muted-foreground mb-6">
            아직 파트너로 등록된 센터가 없습니다. 파트너 가입 문의 후 관리자가 활성화하면 이 페이지에서 직접 관리할 수 있습니다.
          </p>
          <Button asChild><Link to="/expert-hiring">파트너 문의하기</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Partner Center</p>
          <h1 className="text-3xl md:text-4xl font-medium">{org.name}</h1>
          <div className="flex gap-2 mt-3">
            <Badge variant={org.is_referral_active ? "default" : "secondary"}>
              {org.is_referral_active ? "추천 활성" : "추천 비활성 (관리자 검토중)"}
            </Badge>
            <Badge variant="outline">정산률 {Math.round(org.commission_rate * 100)}%</Badge>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "30일 클릭", value: stats.clicks.toLocaleString() },
            { label: "신청", value: stats.enrollments.toLocaleString() },
            { label: "결제 완료", value: stats.paid.toLocaleString() },
            { label: "예상 정산금", value: `₩${stats.commission.toLocaleString()}` },
          ].map((s) => (
            <Card key={s.label} className="p-5 rounded-2xl">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-medium mt-1">{s.value}</p>
            </Card>
          ))}
        </section>

        {/* Referral URL */}
        {slug && org.is_referral_active && (
          <Card className="p-6 rounded-2xl">
            <p className="text-xs text-muted-foreground mb-2">전용 추천 링크</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-muted/40 rounded-lg px-3 py-2 truncate">{referralUrl}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(referralUrl); toast.success("복사됨"); }}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={referralUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a>
              </Button>
            </div>
          </Card>
        )}

        {/* Edit form */}
        <Card className="p-6 md:p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-medium">센터 정보</h2>

          <div className="space-y-2">
            <Label>로고</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-muted/40 flex items-center justify-center overflow-hidden border">
                {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full object-contain" /> : <span className="text-xs text-muted-foreground">없음</span>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" hidden
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                  이미지 업로드
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG/JPG, 2MB 이하 권장</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">슬러그 (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">aihpro.app/c/</span>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="my-center" maxLength={40} />
            </div>
            <p className="text-xs text-muted-foreground">소문자/숫자/하이픈, 3~40자</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">한 줄 소개</Label>
            <Textarea id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)}
              placeholder="예: 14년 임상 경력의 발달 전문 센터" maxLength={120} rows={2} />
            <p className="text-xs text-muted-foreground">{tagline.length}/120자</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={onSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              저장
            </Button>
          </div>
        </Card>

        <p className="text-xs text-muted-foreground">
          정산률·추천 활성 여부는 운영팀이 관리합니다. 변경이 필요하시면 운영팀에 문의해 주세요.
        </p>
      </div>
    </div>
  );
}
