/**
 * 부모 리포트(샘플 미리보기·실제 발행·보호자 공개 화면)에서 공유하는
 * 화이트라벨 헤더. branding 이 비어 있으면 아무것도 렌더하지 않아 기본 톤이 유지된다.
 *
 * branding 스키마 (center_organizations.branding JSONB):
 *   { tagline, therapist, logoText, c1, c2, logoBg, logoFg }
 */
export interface WhitelabelBranding {
  c1?: string;
  c2?: string;
  logoBg?: string;
  logoFg?: string;
  logoText?: string;
  tagline?: string;
  therapist?: string;
}

interface Props {
  centerName?: string | null;
  branding?: WhitelabelBranding | null;
  period?: string | null;
  className?: string;
}

export default function WhitelabelHeader({ centerName, branding, period, className }: Props) {
  if (!branding || (!branding.c1 && !branding.logoText && !branding.tagline && !branding.therapist)) {
    return null;
  }

  const c1 = branding.c1 || "#0F172A";
  const c2 = branding.c2 || "#1E293B";
  const logoBg = branding.logoBg || "#FFFFFF";
  const logoFg = branding.logoFg || "#0F172A";
  const initial = (branding.logoText || (centerName?.[0] ?? "·")).slice(0, 2);

  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-5 py-3 text-white ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0"
          style={{ background: logoBg, color: logoFg }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold leading-tight truncate">{centerName || "우리 기관"}</div>
          {branding.tagline && (
            <div className="text-[11px] opacity-90 truncate">{branding.tagline}</div>
          )}
        </div>
      </div>
      <div className="text-[11px] opacity-90 text-right shrink-0 pl-3">
        {period && <div>{period} 리포트</div>}
        {branding.therapist && (
          <div>
            발신 <b className="text-xs">{branding.therapist}</b>
          </div>
        )}
      </div>
    </div>
  );
}
