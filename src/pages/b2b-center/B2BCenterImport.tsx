import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Upload, FileSpreadsheet, Check, AlertCircle, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseWorkbook, commitImport, downloadStandardTemplate, type ParsedWorkbook } from "@/lib/b2bCenter/excelImport";
import { listMyCenters, createCenter, getActiveCenterId, setActiveCenterId, type CenterOrg } from "@/lib/b2bCenter/centerClient";
import { supabase } from "@/integrations/supabase/client";

export default function B2BCenterImport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [centers, setCenters] = useState<CenterOrg[]>([]);
  const [activeId, setActive] = useState<string | null>(getActiveCenterId());
  const [newCenterName, setNewCenterName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      if (data.user) listMyCenters().then(setCenters).catch(() => {});
    });
  }, []);

  async function handleCreateCenter() {
    const name = newCenterName.trim();
    if (!name) {
      toast({ title: "기관 이름을 입력하세요", variant: "destructive" });
      return;
    }
    try {
      const c = await createCenter(name);
      setCenters((prev) => [...prev, c]);
      setActiveCenterId(c.id);
      setActive(c.id);
      setNewCenterName("");
      toast({ title: "기관 등록 완료", description: c.name });
    } catch (e: any) {
      console.error("[handleCreateCenter]", e);
      toast({ title: "기관 등록 실패", description: e?.message ?? String(e), variant: "destructive" });
    }
  }

  async function handleFile(f: File) {
    setFile(f);
    setParsed(null);
    setResult(null);
    try {
      const p = await parseWorkbook(f);
      setParsed(p);
      if (p.sheets.length === 0) {
        toast({ title: "감지된 시트 없음", description: "케어플 다운로드 파일 또는 AIHPRO 템플릿을 업로드하세요.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "파싱 실패", description: e.message, variant: "destructive" });
    }
  }

  async function handleCommit() {
    if (!parsed || !activeId) return;
    setCommitting(true);
    try {
      const { summary } = await commitImport(activeId, parsed, file?.name ?? "upload.xlsx");
      setResult(summary);
      toast({ title: "이관 완료", description: "콘솔에서 확인하세요." });
    } catch (e: any) {
      toast({ title: "이관 실패", description: e.message, variant: "destructive" });
    } finally {
      setCommitting(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-3">로그인이 필요합니다</h1>
          <p className="text-neutral-600 mb-6">B2B 센터 데이터는 기관 구성원만 접근할 수 있습니다.</p>
          <button onClick={() => navigate("/auth")} className="px-6 py-3 rounded-full bg-neutral-900 text-white">로그인하러 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Helmet>
        <title>엑셀 일괄 이관 — AIHPRO 발달치료센터</title>
      </Helmet>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs tracking-widest text-neutral-500 mb-2">B2B CENTER · IMPORT</p>
        <h1 className="text-4xl font-semibold mb-3 break-keep">엑셀 한 파일로 전체 데이터 이관</h1>
        <p className="text-neutral-600 mb-10 break-keep">케어플센터에서 다운로드한 파일을 그대로 올리거나, AIHPRO 표준 템플릿을 다운로드해 채워서 올리세요.</p>

        {/* 1. 기관 */}
        <section className="mb-8 p-6 rounded-2xl border border-neutral-200">
          <h2 className="font-semibold mb-4">01 · 기관 선택</h2>
          {centers.length > 0 && (
            <div className="space-y-2 mb-4">
              {centers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActive(c.id); setActiveCenterId(c.id); }}
                  className={`w-full text-left p-3 rounded-lg border ${activeId === c.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{c.name}</span>
                    {activeId === c.id && <Check className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={newCenterName}
              onChange={(e) => setNewCenterName(e.target.value)}
              placeholder="새 기관 이름"
              className="flex-1 px-4 py-2 rounded-lg border border-neutral-200"
            />
            <button onClick={handleCreateCenter} className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm">추가</button>
          </div>
        </section>

        {/* 2. 파일 */}
        <section className="mb-8 p-6 rounded-2xl border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">02 · 엑셀 업로드</h2>
            <button onClick={downloadStandardTemplate} className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900">
              <Download className="w-4 h-4" /> 표준 템플릿
            </button>
          </div>
          <label className="block border-2 border-dashed border-neutral-200 rounded-xl p-10 text-center cursor-pointer hover:border-neutral-400 transition">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={!activeId}
            />
            <Upload className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
            <p className="text-sm text-neutral-600">{file ? file.name : "클릭하거나 파일을 끌어다 놓으세요"}</p>
            {!activeId && <p className="text-xs text-red-500 mt-2">먼저 기관을 선택하세요</p>}
          </label>
        </section>

        {/* 3. 미리보기 */}
        {parsed && (
          <section className="mb-8 p-6 rounded-2xl border border-neutral-200">
            <h2 className="font-semibold mb-4">03 · 감지 결과</h2>
            <div className="text-sm text-neutral-600 mb-4">
              포맷: <span className="font-mono font-semibold">{parsed.format}</span>
            </div>
            <div className="space-y-2">
              {parsed.sheets.length === 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4" /> 인식 가능한 시트가 없습니다.
                </div>
              )}
              {parsed.sheets.map((s) => (
                <div key={s.source} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm">{s.source}</span>
                    <span className="text-xs text-neutral-500">→ {s.entity}</span>
                  </div>
                  <span className="text-sm font-medium">{s.rows.length}행</span>
                </div>
              ))}
            </div>
            {parsed.sheets.length > 0 && !result && (
              <button
                onClick={handleCommit}
                disabled={committing}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white font-medium disabled:opacity-50"
              >
                {committing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {committing ? "이관 중..." : "이 데이터로 이관 실행"}
              </button>
            )}
          </section>
        )}

        {/* 4. 결과 */}
        {result && (
          <section className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50">
            <h2 className="font-semibold mb-4 text-emerald-900">완료</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(result).map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-white">
                  <div className="text-xs text-neutral-500">{k}</div>
                  <div className="text-xl font-semibold">{v}건</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/b2b-center/app/clients")}
              className="w-full px-6 py-3 rounded-full bg-emerald-600 text-white font-medium"
            >
              콘솔에서 확인하기
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
