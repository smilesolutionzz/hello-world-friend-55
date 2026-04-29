import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, ChevronRight, CheckCircle2, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AssessmentRecommendation,
  isAssessmentMissionCompleted,
  markAssessmentMissionCompleted,
  buildMissionState,
} from "@/lib/mindTrackAssessmentMissions";

interface Props {
  recommendation: AssessmentRecommendation;
  enrollmentId: string;
  day: number;
  /** 외부에서 완료 상태가 바뀌었음을 알릴 때 사용 (검사 페이지 복귀 시) */
  onChanged?: (completed: boolean) => void;
}

/**
 * Day 1·2 등에서 우리 플랫폼 내부 검사를 미션의 일부로 안내하는 카드.
 * - "검사 시작" 버튼 → 추천 라우트로 이동 (state로 returnTo 전달)
 * - "이미 완료했어요" 버튼 → localStorage에 완료 마킹 (검사 결과 페이지가 있다면 자동 호출 권장)
 * - 완료 시 시각적으로 체크 표시
 */
export default function MissionAssessmentCard({
  recommendation,
  enrollmentId,
  day,
  onChanged,
}: Props) {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<boolean>(() =>
    isAssessmentMissionCompleted(enrollmentId, day),
  );

  // 사용자가 다른 탭에서 검사를 마치고 돌아왔을 때 동기화
  useEffect(() => {
    const onFocus = () => {
      const next = isAssessmentMissionCompleted(enrollmentId, day);
      if (next !== completed) {
        setCompleted(next);
        onChanged?.(next);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enrollmentId, day, completed, onChanged]);

  const handleStart = () => {
    // 우리 자체 검사 화면으로 직접 진입 + mind-track 미션 컨텍스트 전달.
    // 검사 완료 핸들러가 이 state를 보고 mind_track_checkin에 점수를 자동 기록하고
    // 워크북으로 자동 복귀시킵니다.
    navigate(recommendation.route, {
      state: buildMissionState(recommendation, enrollmentId, day),
    });
  };

  const handleMarkDone = () => {
    markAssessmentMissionCompleted(enrollmentId, day);
    setCompleted(true);
    onChanged?.(true);
  };

  return (
    <Card
      className={`p-4 mt-3 rounded-2xl border transition-colors ${
        completed
          ? "bg-emerald-50/60 border-emerald-200"
          : "bg-white border-[#C8B88A]/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            completed
              ? "bg-emerald-500 text-white"
              : "bg-[#C8B88A]/15 text-[#8a7a4d]"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <ClipboardCheck className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <Badge
              variant="outline"
              className="text-[10px] border-[#C8B88A]/50 text-[#8a7a4d] bg-[#C8B88A]/10"
            >
              <Stethoscope className="w-3 h-3 mr-0.5" /> 추천 자가진단
            </Badge>
            <span className="text-[10px] text-slate-400">약 {recommendation.minutes}분</span>
            {completed && (
              <Badge className="text-[10px] bg-emerald-500 hover:bg-emerald-500 text-white border-0">
                완료됨
              </Badge>
            )}
          </div>
          <h4 className="text-[14px] font-bold text-slate-900 break-keep leading-snug">
            {recommendation.title}
          </h4>
          <p className="text-[12px] text-slate-600 break-keep mt-1 leading-relaxed">
            {recommendation.desc}
          </p>
          {!completed && (
            <p className="mt-2 text-[11px] text-[#8a7a4d] break-keep leading-relaxed bg-[#C8B88A]/8 rounded-md px-2 py-1.5">
              ✦ {recommendation.why}
            </p>
          )}
        </div>
      </div>

      {!completed ? (
        <div className="flex items-center gap-2 mt-3">
          <Button
            onClick={handleStart}
            className="flex-1 h-10 rounded-xl bg-[#8a7a4d] hover:bg-[#6f6240] text-white font-bold text-[12px]"
          >
            지금 검사 시작
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
          <Button
            onClick={handleMarkDone}
            variant="outline"
            className="h-10 rounded-xl text-[11px] border-slate-300 text-slate-600"
          >
            이미 완료
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3">
          <Button
            onClick={handleStart}
            variant="outline"
            className="flex-1 h-9 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[12px]"
          >
            결과 다시 보기
          </Button>
        </div>
      )}
    </Card>
  );
}
