import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, Palette, Sparkles, Building2, User2, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from "html2pdf.js";

type Ctx = { centerId: string; demo?: boolean };

const PRESETS = [
  { label: "따뜻한 오렌지", c1: "#F59E0B", c2: "#FB7185", logoBg: "#FFFFFF", logoFg: "#F59E0B" },
  { label: "차분한 네이비", c1: "#1E3A8A", c2: "#3B82F6", logoBg: "#FFFFFF", logoFg: "#1E3A8A" },
  { label: "포레스트 그린", c1: "#047857", c2: "#10B981", logoBg: "#FFFFFF", logoFg: "#047857" },
  { label: "AIHPRO 골드", c1: "#0F172A", c2: "#1E293B", logoBg: "#C8B88A", logoFg: "#0F172A" },
];

export default function WhitelabelReportPreviewPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const [centerName, setCenterName] = useState("햇살아동발달센터");
  const [tagline, setTagline] = useState("아이의 한 달, 따뜻하게 정리해드립니다");
  const [therapist, setTherapist] = useState("이지영 언어재활사");
  const [logoText, setLogoText] = useState("햇");
  const [phone, setPhone] = useState("02-000-0000");
  const [address, setAddress] = useState("서울 강동구");
  const [c1, setC1] = useState(PRESETS[0].c1);
  const [c2, setC2] = useState(PRESETS[0].c2);
  const [logoBg, setLogoBg] = useState(PRESETS[0].logoBg);
  const [logoFg, setLogoFg] = useState(PRESETS[0].logoFg);
  const [childName, setChildName] = useState("지호 (만 4세 7개월)");
  const [period, setPeriod] = useState("2026년 5월");
  const [busy, setBusy] = useState(false);

  const applyPreset = (p: typeof PRESETS[number]) => {
    setC1(p.c1); setC2(p.c2); setLogoBg(p.logoBg); setLogoFg(p.logoFg);
  };

  const headerGradient = useMemo(() => `linear-gradient(135deg, ${c1}, ${c2})`, [c1, c2]);

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setBusy(true);
    try {
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `${centerName}_부모리포트_${period.replace(/\s/g, "")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      } as any).from(previewRef.current).save();
      toast({ title: "PDF 다운로드 완료", description: `${centerName} 명의로 발행되었습니다.` });
    } catch (e: any) {
      toast({ title: "PDF 생성 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">부모 리포트 — 화이트라벨 미리보기</h1>
          <p className="text-xs text-neutral-500 mt-1">
            기관 로고·명의·강조색을 설정해 우리 기관 명의의 PDF 샘플을 즉시 만들어보세요.
            실제 발행은 <b>부모 월간 리포트</b> 페이지에서 진행합니다.
          </p>
        </div>
        <button
          onClick={downloadPDF}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs whitespace-nowrap disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-[#C8B88A]" />
          {busy ? "PDF 생성 중…" : "PDF 다운로드"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* === Settings === */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Building2 className="w-4 h-4 text-[#C8B88A]" /> 기관 정보
            </div>
            <Field label="기관명" value={centerName} onChange={setCenterName} />
            <Field label="태그라인" value={tagline} onChange={setTagline} />
            <Field label="로고 이니셜 (1~2자)" value={logoText} onChange={setLogoText} maxLength={2} />
            <Field label="대표 연락처" value={phone} onChange={setPhone} />
            <Field label="주소" value={address} onChange={setAddress} />
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <User2 className="w-4 h-4 text-[#C8B88A]" /> 발신자 명의
            </div>
            <Field label="치료사 / 발신자" value={therapist} onChange={setTherapist} />
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Palette className="w-4 h-4 text-[#C8B88A]" /> 강조색
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="border border-neutral-200 rounded-lg p-2 text-xs text-left hover:bg-neutral-50"
                >
                  <div className="h-6 rounded mb-1.5" style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }} />
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <ColorField label="강조색 1" value={c1} onChange={setC1} />
              <ColorField label="강조색 2" value={c2} onChange={setC2} />
              <ColorField label="로고 배경" value={logoBg} onChange={setLogoBg} />
              <ColorField label="로고 글자" value={logoFg} onChange={setLogoFg} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Sparkles className="w-4 h-4 text-[#C8B88A]" /> 샘플 데이터
            </div>
            <Field label="아이 이름 / 월령" value={childName} onChange={setChildName} />
            <Field label="기간" value={period} onChange={setPeriod} />
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              * 미리보기는 화이트라벨 톤을 확인하기 위한 샘플 콘텐츠입니다.
              실제 부모 리포트는 회기 데이터 기반으로 생성됩니다.
            </p>
          </div>
        </div>

        {/* === Live Preview === */}
        <div className="bg-neutral-100 rounded-2xl p-6 overflow-auto">
          <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500">
            <Eye className="w-3.5 h-3.5" /> 실시간 미리보기 (A4)
          </div>
          <div className="mx-auto bg-white shadow-sm" style={{ width: "210mm", minHeight: "297mm" }}>
            <div ref={previewRef} style={{ padding: "18mm 16mm", color: "#1f2937", fontFamily: "'Pretendard Variable', Pretendard, sans-serif", lineHeight: 1.6, fontSize: 12 }}>
              <SampleReport
                centerName={centerName} tagline={tagline} therapist={therapist}
                logoText={logoText} logoBg={logoBg} logoFg={logoFg}
                phone={phone} address={address}
                headerGradient={headerGradient} accent={c1}
                childName={childName} period={period}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, maxLength }: { label: string; value: string; onChange: (v: string) => void; maxLength?: number }) {
  return (
    <label className="block">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <input value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm" />
    </label>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded border border-neutral-200" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs font-mono" />
      </div>
    </label>
  );
}

function SampleReport(props: {
  centerName: string; tagline: string; therapist: string;
  logoText: string; logoBg: string; logoFg: string;
  phone: string; address: string;
  headerGradient: string; accent: string;
  childName: string; period: string;
}) {
  const { centerName, tagline, therapist, logoText, logoBg, logoFg, phone, address, headerGradient, accent, childName, period } = props;
  const Bar = ({ pct, label }: { pct: number; label: string }) => (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 50px", gap: 10, alignItems: "center", margin: "8px 0" }}>
      <div>{label}</div>
      <div style={{ height: 10, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: headerGradient }} />
      </div>
      <div style={{ textAlign: "right" }}>{pct}%</div>
    </div>
  );

  return (
    <>
      {/* Brand header */}
      <div style={{ background: headerGradient, color: "#fff", padding: "14px 18px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: logoBg, color: logoFg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
            {logoText || "·"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{centerName}</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>{tagline}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, opacity: 0.9 }}>
          {period} 월간 리포트<br />발신: {therapist}
        </div>
      </div>

      <h1 style={{ fontSize: 22, margin: "0 0 6px", letterSpacing: "-0.3px", color: "#0f172a" }}>
        {childName} 부모님께 — 한 달의 발달 이야기
      </h1>
      <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 20 }}>
        이번 달 회기 4회의 관찰 기록을 기반으로, 담당 치료사가 검토·발행한 리포트입니다.
      </p>

      <H2 accent={accent}>01. 이번 달 한눈에 보기</H2>
      <div style={{ display: "flex", gap: 12, margin: "12px 0 18px" }}>
        {[
          { v: "+22%", l: "표현 어휘 다양성 (지난달 대비)" },
          { v: "3/4", l: "목표 미션 달성 회기 수" },
          { v: "안정", l: "정서 패턴 — 회복 빠름" },
        ].map((k) => (
          <div key={k.l} style={{ flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>{k.v}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <H2 accent={accent}>02. 영역별 발달 신호</H2>
      <Bar pct={82} label="표현 언어" />
      <Bar pct={74} label="수용 언어" />
      <Bar pct={68} label="사회적 상호작용" />
      <Bar pct={71} label="정서 조절" />
      <Bar pct={65} label="주의·집중" />

      <H2 accent={accent}>03. 회기 요약</H2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["회기", "주요 활동", "관찰된 강점", "다음 도전"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "9px 6px", borderBottom: "1px solid #e5e7eb", fontWeight: 700, color: "#0f172a" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ["5/3", "그림책 함께 읽기", "새 단어 5개 자발 사용", "이야기 순서 회상"],
            ["5/10", "역할놀이 — 빵집 사장님", "주문 받기 차례 지킴", "또래 갈등 시 표현"],
            ["5/17", "감정 카드 분류", "‘서운하다’ 단어 새로 사용", "복합 감정 설명"],
            ["5/24", "블록 협동 작업", "도움 요청 성공", "실패 후 재도전"],
          ].map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => <td key={j} style={{ padding: "9px 6px", borderBottom: "1px solid #e5e7eb", verticalAlign: "top" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      <H2 accent={accent}>04. 집에서 함께 해보기</H2>
      <ol style={{ paddingLeft: 18 }}>
        <li style={{ marginBottom: 6 }}>저녁 식탁에서 ‘오늘의 단어’ 하나만 함께 이야기해보기</li>
        <li style={{ marginBottom: 6 }}>일주일에 한 번, 5분 그림책 함께 읽기</li>
        <li>화가 났을 때 ‘잠깐 멈춤’ 사인 — 손바닥 펴기 신호 함께 사용</li>
      </ol>
      <div style={{ background: "#ecfdf5", borderLeft: `4px solid ${accent}`, padding: "10px 14px", borderRadius: 6, fontSize: 12, marginTop: 8 }}>
        가장 큰 변화는 <b>말로 도움을 요청한 첫 회기</b>였습니다. 작지만 중요한 신호예요.
      </div>

      <div style={{ marginTop: 22, padding: "14px 16px", border: "1px dashed #cbd5e1", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
        <div>
          본 리포트는 <b>{centerName}</b>의 담당 치료사 검토 후 발행되었습니다.<br />
          <span style={{ color: "#6b7280", fontSize: 11 }}>발신: {therapist}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: accent }}>{centerName}</div>
          <div style={{ color: "#6b7280", fontSize: 11 }}>{address} · {phone}</div>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #e5e7eb", color: "#9ca3af", fontSize: 10.5, textAlign: "center" }}>
        Powered by AIHPRO · 본 리포트는 의료 진단을 대체하지 않으며, 발달 코칭을 위한 관찰 기록입니다.
      </div>
    </>
  );
}

function H2({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h2 style={{ fontSize: 15, margin: "22px 0 10px", color: "#0f172a", paddingBottom: 6, borderBottom: `2px solid ${accent}` }}>
      {children}
    </h2>
  );
}
