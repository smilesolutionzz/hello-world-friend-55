import { useState } from "react";
import { ChevronDown, Download, MousePointerClick, FileSpreadsheet, Info } from "lucide-react";
import img01 from "@/assets/careple-guide/01-clients.png";
import img02 from "@/assets/careple-guide/02-monthly.png";
import img03 from "@/assets/careple-guide/03-daily.png";
import img04 from "@/assets/careple-guide/04-by-therapist.png";
import img05 from "@/assets/careple-guide/05-daily-count.png";

type Step = {
  n: string;
  title: string;
  menu: string;
  img: string;
  required: boolean;
  filename: string;
  desc: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "이용자 명단",
    menu: "케어플 > 이용자 및 상담/평가 > 이용자 관리",
    img: img01,
    required: true,
    filename: "이용자관리_YYYYMMDD.xlsx",
    desc: "우측 상단의 [다운로드] 버튼을 누르면 전체 이용자 명단이 엑셀로 받아집니다. (대기·등록·종결 체크 모두 켠 상태로 받아주세요.)",
  },
  {
    n: "02",
    title: "월 서비스 회기",
    menu: "케어플 > 재활서비스 > 월 서비스 관리",
    img: img02,
    required: true,
    filename: "월서비스관리_YYYYMM.xlsx",
    desc: "월을 선택하고 우측 [다운로드]를 누르세요. AIHPRO가 완료[N] 카운트를 자동으로 N개의 회기 행으로 펼쳐줍니다.",
  },
  {
    n: "03",
    title: "일일 서비스 (선택)",
    menu: "케어플 > 재활서비스 > 일일 서비스 관리",
    img: img03,
    required: false,
    filename: "일일서비스_YYYYMM.xlsx",
    desc: "회기별 일자·상태 기록이 더 정확합니다. 기간(예: 이번달)을 선택 후 [다운로드].",
  },
  {
    n: "04",
    title: "선생님별 현황 (선택)",
    menu: "케어플 > 재활서비스 > 선생님별 이용자 현황",
    img: img04,
    required: false,
    filename: "선생님별이용자_YYYYMM.xlsx",
    desc: "치료사별 담당 이용자 매칭이 필요할 때만 받으세요. 자동으로 매칭 테이블이 생성됩니다.",
  },
  {
    n: "05",
    title: "일별 접수인원 (선택)",
    menu: "케어플 > 재활서비스 > 일별 접수인원 현황",
    img: img05,
    required: false,
    filename: "일별접수인원_YYYYMM.xlsx",
    desc: "월말 통계 검증용. 회기 카운트가 케어플과 정확히 일치하는지 자동 비교합니다.",
  },
];

export default function CarepleImportGuide() {
  const [open, setOpen] = useState(true);
  const [zoom, setZoom] = useState<string | null>(null);

  return (
    <div className="mb-10 rounded-2xl border border-[#C8B88A]/40 bg-[#FBF8F1] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#C8B88A]/60 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-[#8B7A4A]" />
          </div>
          <div>
            <p className="text-[10px] tracking-widest text-[#8B7A4A] mb-0.5">CAREPLE → AIHPRO 이관 가이드</p>
            <h3 className="font-semibold text-neutral-900">케어플에서 어떤 엑셀을 어디서 받아야 하나요?</h3>
            <p className="text-xs text-neutral-600 mt-1 break-keep">
              필수 2개만 받으면 5분 안에 이관이 끝나요. 캡처와 함께 단계별로 보여드립니다.
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-neutral-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-5 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-emerald-200">
              <p className="text-[10px] tracking-widest text-emerald-700 mb-1">필수 · 2개</p>
              <p className="text-sm font-medium">이용자 명단 + 월 서비스 회기</p>
              <p className="text-xs text-neutral-500 mt-1">이 둘만 있으면 콘솔이 동작합니다.</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-neutral-200">
              <p className="text-[10px] tracking-widest text-neutral-500 mb-1">선택 · 3개</p>
              <p className="text-sm font-medium">일일 서비스 · 선생님별 · 일별 접수</p>
              <p className="text-xs text-neutral-500 mt-1">정확도·통계 검증을 강화합니다.</p>
            </div>
          </div>

          <ol className="space-y-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl bg-white border border-neutral-200 overflow-hidden"
              >
                <div className="p-4 flex items-start gap-4">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      s.required
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {s.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{s.title}</h4>
                      {s.required ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">필수</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">선택</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3" />
                      {s.menu}
                    </p>
                    <p className="text-xs text-neutral-700 mt-2 break-keep">{s.desc}</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
                      <FileSpreadsheet className="w-3 h-3" />
                      {s.filename}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setZoom(s.img)}
                  className="block w-full border-t border-neutral-100 bg-neutral-50 hover:bg-neutral-100 transition"
                >
                  <div className="relative">
                    <img
                      src={s.img}
                      alt={`${s.title} 화면 - ${s.menu}`}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    <span className="absolute top-2 right-2 text-[10px] bg-neutral-900/80 text-white px-2 py-1 rounded-full inline-flex items-center gap-1">
                      <Download className="w-3 h-3" /> 우측 [다운로드] 클릭
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ol>

          <div className="p-4 rounded-xl bg-white border border-neutral-200">
            <p className="text-xs text-neutral-600 break-keep">
              <span className="font-semibold text-neutral-900">팁.</span>{" "}
              파일명은 바꾸지 않아도 됩니다. 한 번에 여러 파일을 순차 업로드해도 같은 기관으로 합쳐집니다.
              케어플 파일이 없다면 아래의 <span className="font-medium">AIHPRO 표준 템플릿</span>을 받아 채워 올리셔도 됩니다.
            </p>
          </div>
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setZoom(null)}
        >
          <img src={zoom} alt="확대 보기" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
