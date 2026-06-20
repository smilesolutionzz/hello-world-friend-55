import { useOutletContext } from "react-router-dom";
import {
  Upload, CalendarClock, FileText, Send, ShieldAlert, MessageSquare,
} from "lucide-react";
import { BETA_MODE } from "@/config/betaMode";

type Ctx = { centerId: string; demo?: boolean };

const ALL_STEPS = [
  {
    icon: Upload,
    num: "01",
    title: "이용자 일괄 등록",
    body: "케어플 월서비스관리 엑셀 또는 자체 양식으로 한 번에 업로드합니다. 이용자·선생님·프로그램·세션이 자동 매핑됩니다.",
    href: "/b2b-center/import",
    cta: "엑셀 업로드 열기",
    beta: true,
  },
  {
    icon: CalendarClock,
    num: "02",
    title: "일정·프로그램 설정",
    body: "주간·월간·선생님별 일정과 프로그램·바우처 단가를 점검합니다. 이후 모든 통계의 기준이 됩니다.",
    href: "../schedule",
    cta: "일정으로 이동",
    beta: true,
  },
  {
    icon: FileText,
    num: "03",
    title: "회기 기록 · 치료노트 작성",
    body: "회기마다 일지 사진을 올리거나 직접 입력하면 AI가 주간 치료노트 초안을 만들어드립니다.",
    href: "../therapy-notes",
    cta: "치료노트 열기",
    beta: true,
  },
  {
    icon: Send,
    num: "04",
    title: "보호자 공유 링크 보내기",
    body: "치료노트·월간 리포트를 발행한 뒤 \"부모 공유\" 버튼을 누르면 SMS 인증 기반 공유 링크가 생성됩니다. 링크를 카톡으로 보내주세요.",
    href: "../therapy-notes",
    cta: "치료노트로 이동",
    beta: true,
  },
  {
    icon: MessageSquare,
    num: "05",
    title: "월간 리포트 발행",
    body: "치료노트가 누적되면 월 말에 보호자용 월간 리포트 초안이 자동으로 생성됩니다. 검토 후 카톡 공유 링크로 전달하세요.",
    href: "../parent-reports",
    cta: "월간 리포트 열기",
    beta: true,
  },
  {
    icon: ShieldAlert,
    num: "06",
    title: "위기 알림 대응",
    body: "고위험 점수(상위 단계) 발생 시 운영 KPI 대시보드에 알림이 뜹니다. 전문가 연결·상담 예약을 24시간 내에 안내해주세요.",
    href: "../intelligence/ops-dashboard",
    cta: "운영 KPI 보기",
    beta: false,
  },
];

const STEPS = BETA_MODE ? ALL_STEPS.filter((s) => s.beta) : ALL_STEPS;

export default function GuidePage() {
  useOutletContext<Ctx>();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <p className="text-[10px] tracking-widest text-[#C8B88A] mb-2">GUIDE</p>
        <h1 className="text-3xl font-semibold mb-2 break-keep">센터 운영 가이드</h1>
        <p className="text-neutral-600 break-keep">
          엑셀로 콘솔을 채우고, 회기 기록 → 치료노트 → 월간 리포트 → 카톡 공유 링크 순서로 보호자와 연결됩니다.
        </p>
      </div>

      <ol className="space-y-4">
        {STEPS.map((s) => (
          <li key={s.num} className="bg-white rounded-3xl border border-neutral-200 p-6 flex gap-5">
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF6E8] flex items-center justify-center mb-2">
                <s.icon className="w-6 h-6 text-[#C8B88A]" />
              </div>
              <p className="text-[10px] tracking-widest text-neutral-400 text-center">{s.num}</p>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-neutral-600 break-keep mb-3">{s.body}</p>
              <a href={s.href.startsWith("/") ? s.href : `/b2b-center/app/${s.href.replace("../", "")}`}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-900 hover:text-neutral-600 underline underline-offset-4">
                {s.cta} →
              </a>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-3xl bg-[#FAF6E8] border border-[#C8B88A]/30 p-6">
        <p className="text-[10px] tracking-widest text-[#C8B88A] mb-2">CORE PHILOSOPHY</p>
        <h3 className="text-lg font-semibold mb-2">보호자와 어떻게 연결되나요?</h3>
        <p className="text-sm text-neutral-700 break-keep">
          베타 기간에는 보호자가 별도 가입할 필요가 없습니다. 치료노트·월간 리포트를 발행한 뒤
          "부모 공유" 버튼으로 SMS 인증 기반 공유 링크를 만들어 카톡으로 보내주시면, 보호자는
          본인 휴대폰 인증만으로 리포트를 열람합니다. 90일 후 자동 만료됩니다.
        </p>
      </div>
    </div>
  );
}
