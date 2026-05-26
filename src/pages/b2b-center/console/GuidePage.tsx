import { useOutletContext } from "react-router-dom";
import {
  Upload, CalendarClock, Send, LineChart, ShieldAlert, MessageSquare,
} from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };

const STEPS = [
  {
    icon: Upload,
    num: "01",
    title: "이용자 일괄 등록",
    body: "케어플 월서비스관리 엑셀 또는 자체 양식으로 한 번에 업로드합니다. 이용자·선생님·프로그램·세션이 자동 매핑됩니다.",
    href: "/b2b-center/import",
    cta: "엑셀 업로드 열기",
  },
  {
    icon: CalendarClock,
    num: "02",
    title: "일정·프로그램 설정",
    body: "주간·월간·선생님별 일정과 프로그램·바우처 단가를 점검합니다. 이후 모든 통계의 기준이 됩니다.",
    href: "../schedule",
    cta: "일정으로 이동",
  },
  {
    icon: Send,
    num: "03",
    title: "보호자에게 AIHPRO 초대",
    body: "이용자 카드에서 \"AIHPRO 초대 보내기\"를 누르면 무료 자가검사·Mind Track·기본 리포트가 보호자에게 부여됩니다. 카카오·SMS·QR 모두 가능.",
    href: "../clients",
    cta: "이용자 목록 열기",
  },
  {
    icon: LineChart,
    num: "04",
    title: "인텔리전스에서 결과 확인",
    body: "보호자가 검사를 완료하면 자동으로 부모 리포트 화면에 표시됩니다. 응답 원문이 아닌 점수 단계·진행률·요약 인사이트만 노출됩니다.",
    href: "../intelligence/parent-reports",
    cta: "부모 리포트 열기",
  },
  {
    icon: ShieldAlert,
    num: "05",
    title: "위기 알림 대응",
    body: "고위험 점수(상위 단계) 발생 시 운영 KPI 대시보드에 알림이 뜹니다. 전문가 연결·상담 예약을 24시간 내에 안내해주세요.",
    href: "../intelligence/ops-dashboard",
    cta: "운영 KPI 보기",
  },
  {
    icon: MessageSquare,
    num: "06",
    title: "부모 면담에 활용",
    body: "검사 결과 + 출석 + 회기 노트를 한 화면에서 보며 상담합니다. 보호자 신뢰도가 비약적으로 높아집니다.",
    href: "../intelligence/parent-reports",
    cta: "리포트 보기",
  },
];

export default function GuidePage() {
  useOutletContext<Ctx>();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <p className="text-[10px] tracking-widest text-[#C8B88A] mb-2">GUIDE</p>
        <h1 className="text-3xl font-semibold mb-2 break-keep">센터 운영 가이드</h1>
        <p className="text-neutral-600 break-keep">
          엑셀 한 번으로 콘솔이 채워지고, 보호자 초대 한 번으로 인텔리전스가 시작됩니다.
          여섯 단계만 따라하면 됩니다.
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
        <h3 className="text-lg font-semibold mb-2">왜 보호자를 초대해야 할까요?</h3>
        <p className="text-sm text-neutral-700 break-keep">
          센터에서 보호자에게 무료로 AIHPRO를 열어주면, 자가검사·Mind Track 데이터가
          센터 콘솔로 흘러들어옵니다. 회기 중 관찰만으로는 보이지 않던 가정 내 변화·정서 흐름이
          드러나고, 부모 면담의 깊이가 달라집니다. 데이터는 응답 원문이 아닌 점수 단계·요약만
          공유되어 보호자 신뢰를 해치지 않습니다.
        </p>
      </div>
    </div>
  );
}
