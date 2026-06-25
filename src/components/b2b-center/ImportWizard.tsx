import { useEffect, useMemo, useRef, useState } from "react";
import { X, Upload, FileSpreadsheet, Download, Loader2, Check, ArrowRight, AlertTriangle, Calendar, Users, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  parseWorkbook,
  commitImport,
  downloadStandardTemplate,
  buildSessionPreview,
  applySessionColumnMap,
  SESSION_COLUMN_SPEC,
  type ParsedWorkbook,
  type DuplicateStrategy,
} from "@/lib/b2bCenter/excelImport";

type Props = {
  demo: boolean;
  centerId: string;
  onClose: () => void;
  onMergeDemo: (rows: any[]) => void;
  onImported?: () => void;
};

type Step = "upload" | "clientsOnly" | "map" | "options" | "preview" | "applying" | "done";

const SESSION_KEYS = SESSION_COLUMN_SPEC.map((s) => s.key);
const KEY_LABEL: Record<string, string> = Object.fromEntries(SESSION_COLUMN_SPEC.map((s) => [s.key, s.header]));

export default function ImportWizard({ demo, centerId, onClose, onMergeDemo, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [strategy, setStrategy] = useState<DuplicateStrategy>("skip");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [showSpec, setShowSpec] = useState(false);

  async function handleFile(f: File) {
    setFile(f); setParsed(null); setResult(null); setErrMsg(null); setColumnMap({});
    try {
      const p = await parseWorkbook(f);
      setParsed(p);
      if (p.sheets.length === 0) {
        toast({ title: "인식된 시트가 없어요", description: "표준 템플릿을 받아 그 형식에 맞춰주세요.", variant: "destructive" });
        return;
      }
      // 세션 시트의 헤더를 표준키로 자동 매핑 시도
      const sessSrc = p.sheets.find((s) => s.entity === "sessions");
      const clientsSrc = p.sheets.find((s) => s.entity === "clients");
      const hasSessionRows = (sessSrc?.rows.length ?? 0) > 0;
      const hasClientRows = (clientsSrc?.rows.length ?? 0) > 0;

      // 이용자관리 전용 엑셀: 세션이 없으면 바로 이용자 등록 단계로
      if (!hasSessionRows && hasClientRows) {
        setColumnMap({});
        setStep("clientsOnly");
        return;
      }
      if (!hasSessionRows && !hasClientRows) {
        toast({ title: "엑셀에서 데이터를 찾지 못했어요", description: "헤더에 ‘이름/이용자’ 또는 ‘일자/시작시간’이 포함됐는지 확인해주세요.", variant: "destructive" });
        return;
      }

      const rawHeaders = p.rawSheets.find((r) => sessSrc?.source.startsWith(r.name))?.headers ?? [];
      const auto: Record<string, string> = {};
      for (const h of rawHeaders) {
        const sampleVal = (sessSrc?.rows?.[0] ?? {})[h] ?? (sessSrc?.rows?.[0] ?? {})[h.trim()];
        // simple heuristic by header name
        const guess = guessKey(h);
        if (guess) auto[h] = guess;
        else if (sampleVal != null) auto[h] = "";
      }
      setColumnMap(auto);
      setStep("map");
    } catch (e: any) {
      toast({ title: "파싱 실패", description: e?.message ?? String(e), variant: "destructive" });
    }
  }

  const remapped = useMemo(() => {
    if (!parsed) return null;
    const clean = Object.fromEntries(Object.entries(columnMap).filter(([_, v]) => v));
    return applySessionColumnMap(parsed, clean);
  }, [parsed, columnMap]);

  const preview = useMemo(() => remapped ? buildSessionPreview(remapped) : null, [remapped]);

  async function handleApply() {
    if (!remapped) return;
    setStep("applying");
    setBusy(true);
    setErrMsg(null);
    try {
      if (demo) {
        const ses = remapped.sheets.find((s) => s.entity === "sessions");
        const rows = ses?.rows ?? [];
        onMergeDemo(rows);
        const summary: Record<string, number> = {};
        for (const s of remapped.sheets) summary[s.entity] = (summary[s.entity] ?? 0) + s.rows.length;
        setResult(summary);
      } else {
        const clean = Object.fromEntries(Object.entries(columnMap).filter(([_, v]) => v));
        const { summary } = await commitImport(centerId, remapped, file?.name ?? "schedule.xlsx", { duplicateStrategy: strategy, sessionColumnMap: clean });
        setResult(summary);
      }
      setStep("done");
      onImported?.();
      toast({ title: "엑셀 반영 완료", description: "일정에 반영되었어요." });
    } catch (e: any) {
      setErrMsg(e?.message ?? String(e));
      setStep("preview");
      toast({ title: "이관 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally { setBusy(false); }
  }

  const sessHeaders = useMemo(() => {
    if (!parsed) return [] as string[];
    const sessSrc = parsed.sheets.find((s) => s.entity === "sessions");
    return parsed.rawSheets.find((r) => sessSrc?.source.startsWith(r.name))?.headers ?? [];
  }, [parsed]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-100">
          <div className="min-w-0">
            <p className="text-[10px] tracking-widest text-neutral-400">SCHEDULE · IMPORT</p>
            <h3 className="text-base sm:text-lg font-semibold mt-0.5">엑셀로 일정 가져오기</h3>
            <Stepper step={step} />
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-full shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {step === "upload" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
                <p className="text-[10px] tracking-widest text-neutral-400 mb-2">QUICK GUIDE · 3단계로 끝</p>
                <ol className="space-y-2 text-xs text-neutral-700">
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-neutral-900 text-white inline-flex items-center justify-center text-[10px] font-semibold">1</span>
                    <span className="break-keep"><b className="text-neutral-900">표준 템플릿</b>을 받아 일정을 채우거나, 쓰던 케어플·자체 엑셀을 그대로 준비하세요. (.xlsx / .xls / .csv)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-neutral-900 text-white inline-flex items-center justify-center text-[10px] font-semibold">2</span>
                    <span className="break-keep">아래 영역에 파일을 <b className="text-neutral-900">끌어다 놓거나 클릭</b>해서 업로드. 컬럼은 자동 인식되고, 다음 화면에서 매칭만 확인하면 돼요.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-neutral-900 text-white inline-flex items-center justify-center text-[10px] font-semibold">3</span>
                    <span className="break-keep">중복 처리 방식(건너뛰기·덮어쓰기·병합) 선택 → <b className="text-neutral-900">미리보기</b>에서 확인 → 시간표에 반영.</span>
                  </li>
                </ol>
                <p className="text-[11px] text-neutral-500 mt-3 break-keep">필수 컬럼: 날짜 · 시작시간 · 이용자 이름. 그 외(치료사·프로그램·메모 등)는 비워둬도 됩니다.</p>
              </div>

              <details className="rounded-xl border border-neutral-200 bg-white">
                <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-neutral-800 select-none">
                  케어플에서 엑셀 받는 법 (1분)
                </summary>
                <ol className="px-5 pb-4 pt-1 space-y-1.5 text-[12px] text-neutral-700 list-decimal">
                  <li>케어플 로그인 → 좌측 <b>서비스 관리</b> → <b>일일 서비스 관리</b> (또는 <b>월 서비스 관리</b>).</li>
                  <li>상단에서 기간을 선택하고 <b>엑셀 다운로드</b> 클릭. 파일명이 <code className="px-1 bg-neutral-100 rounded">일일서비스관리_YYYY-MM-DD-YYYY-MM-DD.xlsx</code> 같은 형식이면 OK.</li>
                  <li>이용자 정보(주소·보호자·장애정보 등)까지 한 번에 옮기고 싶다면 <b>이용자관리 &gt; 엑셀 다운로드</b>도 받아서 같은 파일로 합치거나 따로 업로드하면 됩니다.</li>
                  <li>받은 파일을 그대로 아래에 끌어다 놓으세요. 시트명·헤더는 자동 인식돼요.</li>
                </ol>
              </details>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => downloadStandardTemplate()} className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-neutral-200 hover:border-neutral-400">
                  <Download className="w-3.5 h-3.5" /> 표준 템플릿 다운로드
                </button>
                <button onClick={() => setShowSpec((v) => !v)} className="text-xs text-neutral-500 underline">
                  {showSpec ? "컬럼 규칙 닫기" : "컬럼 규칙 보기"}
                </button>
              </div>
              {showSpec && (
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-neutral-100 text-neutral-600"><tr>
                      <th className="text-left px-3 py-2">컬럼</th>
                      <th className="text-left px-3 py-2">필수</th>
                      <th className="text-left px-3 py-2">예시</th>
                      <th className="text-left px-3 py-2">형식 규칙</th>
                    </tr></thead>
                    <tbody>
                      {SESSION_COLUMN_SPEC.map((c) => (
                        <tr key={c.key} className="border-t border-neutral-200">
                          <td className="px-3 py-2 font-medium">{c.header}</td>
                          <td className="px-3 py-2">{c.required ? <span className="text-rose-600">필수</span> : <span className="text-neutral-400">선택</span>}</td>
                          <td className="px-3 py-2 text-neutral-700 font-mono text-[11px]">{c.example}</td>
                          <td className="px-3 py-2 text-neutral-600 break-keep">{c.rule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center cursor-pointer hover:border-neutral-500 transition">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-sm font-medium">파일을 끌어다 놓거나 클릭</p>
                <p className="text-xs text-neutral-500 mt-1">.xlsx / .xls / .csv · 케어플 일일·월 서비스관리 / AIHPRO 표준 템플릿 자동 인식</p>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </div>
          )}

          {step === "clientsOnly" && parsed && (() => {
            const cs = parsed.sheets.find((s) => s.entity === "clients");
            const rows = cs?.rows ?? [];
            return (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-[10px] tracking-widest text-emerald-700 mb-1">이용자관리 엑셀 인식됨</p>
                  <p className="text-sm font-medium text-neutral-900">총 {rows.length}명의 이용자가 감지됐어요.</p>
                  <p className="text-xs text-neutral-600 mt-1 break-keep">아래 미리보기를 확인한 뒤 [이용자 등록]을 누르면 기존 이용자는 정보가 보강되고, 새 이용자는 추가돼요.</p>
                </div>
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 max-h-[45vh] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-neutral-100 text-neutral-600 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2">이름</th>
                        <th className="text-left px-3 py-2">생년월일</th>
                        <th className="text-left px-3 py-2">성별</th>
                        <th className="text-left px-3 py-2 hidden sm:table-cell">연락처</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 200).map((r, i) => (
                        <tr key={i} className="border-t border-neutral-200">
                          <td className="px-3 py-1.5 font-medium">{r.name ?? r.client_name ?? "—"}</td>
                          <td className="px-3 py-1.5 tabular-nums">{r.birth_date ?? "—"}</td>
                          <td className="px-3 py-1.5">{r.gender ?? "—"}</td>
                          <td className="px-3 py-1.5 hidden sm:table-cell">{r.phone ?? r.guardian_phone ?? "—"}</td>
                        </tr>
                      ))}
                      {rows.length > 200 && (
                        <tr><td colSpan={4} className="px-3 py-2 text-center text-neutral-400">… 외 {rows.length - 200}명</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {errMsg && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">⚠ {errMsg}</p>}
              </div>
            );
          })()}



          {step === "map" && parsed && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500 break-keep">엑셀의 각 컬럼이 일정의 어떤 칸에 들어갈지 골라주세요. 자동 인식된 항목은 그대로 두면 돼요.</p>
              <div className="bg-neutral-50 rounded-xl border border-neutral-200 divide-y divide-neutral-200">
                {sessHeaders.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-neutral-500">세션 시트가 비어있어요.</p>
                ) : sessHeaders.map((h) => (
                  <div key={h} className="flex items-center gap-2 px-3 py-2">
                    <span className="text-xs font-medium text-neutral-800 flex-1 truncate">{h}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400 shrink-0" />
                    <select value={columnMap[h] ?? ""} onChange={(e) => setColumnMap((m) => ({ ...m, [h]: e.target.value }))}
                      className="text-xs border border-neutral-200 rounded-md px-2 py-1 bg-white">
                      <option value="">— 무시 —</option>
                      {SESSION_KEYS.map((k) => (
                        <option key={k} value={k}>{KEY_LABEL[k]}{SESSION_COLUMN_SPEC.find((s) => s.key === k)?.required ? " *" : ""}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "options" && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500 break-keep">같은 날짜 · 시간 · 이용자 조합이 이미 일정에 있을 때 어떻게 처리할지 골라주세요.</p>
              {[
                { v: "skip" as DuplicateStrategy, t: "건너뛰기", d: "이미 등록된 일정은 그대로 두고, 새로운 일정만 추가합니다. (안전)" },
                { v: "overwrite" as DuplicateStrategy, t: "덮어쓰기", d: "엑셀의 값으로 기존 일정을 모두 교체합니다." },
                { v: "merge" as DuplicateStrategy, t: "병합", d: "비어있지 않은 엑셀 값만 기존 일정에 덮어씁니다. (메모·상태 갱신에 유용)" },
              ].map((o) => (
                <label key={o.v} className={`block rounded-xl border p-3 cursor-pointer ${strategy === o.v ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"}`}>
                  <input type="radio" name="strategy" className="sr-only" checked={strategy === o.v} onChange={() => setStrategy(o.v)} />
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full border ${strategy === o.v ? "bg-neutral-900 border-neutral-900" : "border-neutral-300"}`} />
                    <span className="text-sm font-medium">{o.t}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 ml-5 break-keep">{o.d}</p>
                </label>
              ))}
            </div>
          )}

          {step === "preview" && preview && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Tile icon={Check} label="정상" value={preview.totals.ok} tone="text-emerald-700 bg-emerald-50" />
                <Tile icon={AlertTriangle} label="경고" value={preview.totals.warnings} tone="text-amber-700 bg-amber-50" />
                <Tile icon={X} label="오류" value={preview.totals.errors} tone="text-rose-700 bg-rose-50" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <Mini icon={Calendar} label={`${Object.keys(preview.byDay).length}일`} sub="일별" />
                <Mini icon={Users} label={`${Object.keys(preview.byWeek).length}주`} sub="주별" />
                <Mini icon={Clock} label={`${Object.keys(preview.byMonth).length}달`} sub="월별" />
              </div>
              <div className="bg-neutral-50 rounded-xl border border-neutral-200 max-h-[40vh] overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2">날짜</th>
                      <th className="text-left px-3 py-2">시간</th>
                      <th className="text-left px-3 py-2">이용자</th>
                      <th className="text-left px-3 py-2 hidden sm:table-cell">치료사</th>
                      <th className="text-left px-3 py-2 hidden sm:table-cell">프로그램</th>
                      <th className="text-left px-3 py-2">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 200).map((r, i) => (
                      <tr key={i} className={`border-t border-neutral-200 ${r.warnings.length ? "bg-amber-50/40" : ""}`}>
                        <td className="px-3 py-1.5 tabular-nums">{r.session_date}</td>
                        <td className="px-3 py-1.5 tabular-nums">{r.start_time ?? "—"}</td>
                        <td className="px-3 py-1.5">{r.client_name}</td>
                        <td className="px-3 py-1.5 hidden sm:table-cell">{r.therapist_name ?? "—"}</td>
                        <td className="px-3 py-1.5 hidden sm:table-cell truncate max-w-[120px]">{r.program_name ?? "—"}</td>
                        <td className="px-3 py-1.5">
                          {r.warnings.length ? <span className="text-amber-700">{r.warnings.join(", ")}</span> : <span className="text-emerald-700">OK</span>}
                        </td>
                      </tr>
                    ))}
                    {preview.rows.length > 200 && (
                      <tr><td colSpan={6} className="px-3 py-2 text-center text-neutral-400">… 외 {preview.rows.length - 200}건</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-neutral-500">중복 처리 방식: <span className="font-medium text-neutral-800">{strategy === "skip" ? "건너뛰기" : strategy === "overwrite" ? "덮어쓰기" : "병합"}</span></p>
              {errMsg && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">⚠ {errMsg}</p>}
            </div>
          )}

          {step === "applying" && (
            <div className="py-12 text-center text-sm text-neutral-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> 반영 중…
            </div>
          )}

          {step === "done" && result && (
            <div className="py-8 text-center space-y-3">
              <Check className="w-10 h-10 mx-auto text-emerald-600" />
              <h4 className="text-base font-semibold">반영 완료</h4>
              <ul className="text-xs text-neutral-600 inline-flex flex-wrap justify-center gap-x-3 gap-y-1">
                {Object.entries(result).map(([k, v]) => (
                  <li key={k}><span className="text-neutral-400">{k}</span> <span className="font-semibold text-neutral-900">{v}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between gap-2 bg-white">
          <div className="text-[11px] text-neutral-400">
            {file ? <span className="truncate inline-block max-w-[200px]">{file.name}</span> : "파일 미선택"}
            {parsed && <span> · {parsed.format}</span>}
          </div>
          <div className="flex items-center gap-2">
            {step !== "upload" && step !== "applying" && step !== "done" && (
              <button onClick={() => setStep(step === "map" || step === "clientsOnly" ? "upload" : step === "options" ? "map" : "options")} className="text-xs px-3 py-2 text-neutral-600">이전</button>
            )}
            {step === "clientsOnly" && (
              <button disabled={busy} onClick={handleApply} className="text-xs px-4 py-2 rounded-full bg-neutral-900 text-white inline-flex items-center gap-1 disabled:opacity-40">
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} 이용자 등록
              </button>
            )}
            {step === "upload" && <button onClick={onClose} className="text-xs px-4 py-2 text-neutral-500">닫기</button>}
            {step === "map" && parsed && (
              <button onClick={() => setStep("options")} className="text-xs px-4 py-2 rounded-full bg-neutral-900 text-white inline-flex items-center gap-1">다음 <ArrowRight className="w-3 h-3" /></button>
            )}
            {step === "options" && (
              <button onClick={() => setStep("preview")} className="text-xs px-4 py-2 rounded-full bg-neutral-900 text-white inline-flex items-center gap-1">미리보기 <ArrowRight className="w-3 h-3" /></button>
            )}
            {step === "preview" && (
              <button disabled={busy || !preview || preview.totals.errors === preview.rows.length} onClick={handleApply}
                className="text-xs px-4 py-2 rounded-full bg-neutral-900 text-white inline-flex items-center gap-1 disabled:opacity-40">
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} 시간표에 반영
              </button>
            )}
            {step === "done" && <button onClick={onClose} className="text-xs px-4 py-2 rounded-full bg-neutral-900 text-white">완료</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const all: Array<{ k: Step; l: string }> = [
    { k: "upload", l: "업로드" },
    { k: "map", l: "매핑" },
    { k: "options", l: "중복처리" },
    { k: "preview", l: "미리보기" },
    { k: "done", l: "완료" },
  ];
  const i = all.findIndex((s) => s.k === step || (step === "applying" && s.k === "preview"));
  return (
    <div className="flex items-center gap-1 mt-1.5">
      {all.map((s, idx) => (
        <div key={s.k} className="flex items-center gap-1">
          <span className={`text-[10px] tracking-wider ${idx <= i ? "text-neutral-900 font-medium" : "text-neutral-300"}`}>{s.l}</span>
          {idx < all.length - 1 && <span className={`w-3 h-px ${idx < i ? "bg-neutral-900" : "bg-neutral-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function Tile({ icon: Icon, label, value, tone }: any) {
  return (
    <div className={`rounded-xl p-3 ${tone}`}>
      <Icon className="w-4 h-4 mx-auto mb-1" />
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  );
}
function Mini({ icon: Icon, label, sub }: any) {
  return (
    <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-2 py-2">
      <Icon className="w-3 h-3 mx-auto text-neutral-400 mb-0.5" />
      <p className="font-semibold">{label}</p>
      <p className="text-[10px] text-neutral-400">{sub}</p>
    </div>
  );
}

function guessKey(header: string): string | null {
  const h = header.trim();
  const map: Array<[RegExp, string]> = [
    [/날짜|일자|회기일|date/i, "session_date"],
    [/시작시간|시작|start/i, "start_time"],
    [/종료시간|종료|end/i, "end_time"],
    [/이용자|회원|성명|이름|client/i, "client_name"],
    [/치료사|선생님|담당|therapist/i, "therapist_name"],
    [/프로그램|과목|program/i, "program_name"],
    [/상태|status/i, "status"],
    [/메모|기록|특이|note/i, "note"],
  ];
  for (const [re, k] of map) if (re.test(h)) return k;
  return null;
}
