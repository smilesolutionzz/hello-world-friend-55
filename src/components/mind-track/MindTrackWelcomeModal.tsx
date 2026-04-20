import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Database, FileText, Bell, ArrowRight, CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "aihpro:mind-track-welcome-shown";

interface Step {
  badge: string;
  title: string;
  desc: string;
  icon: typeof Sparkles;
  highlight: string;
}

const STEPS: Step[] = [
  {
    badge: "1 / 4",
    icon: Sparkles,
    title: "축하해요 — 이제 모든 데이터가 한곳에 모입니다",
    desc: "결제 완료! 지금부터 검사·관찰·코칭 모든 활동이 자동으로 누적되어 당신만의 변화 기록이 됩니다.",
    highlight: "all-data-one-place",
  },
  {
    badge: "2 / 4",
    icon: Database,
    title: "활동할수록 데이터가 쌓여요",
    desc: "심리검사, 관찰일지, 금쪽상담소, 코칭 — 무엇을 해도 워크북 타임라인에 자동 기록됩니다.",
    highlight: "auto-collect",
  },
  {
    badge: "3 / 4",
    icon: FileText,
    title: "데이터 3개부터 종합 리포트가 가능해요",
    desc: "검사·관찰·상담을 교차 분석한 박사급 종합 리포트가 자동으로 추천됩니다. 한 번의 클릭으로 생성하세요.",
    highlight: "report-trigger",
  },
  {
    badge: "4 / 4",
    icon: Bell,
    title: "변화는 자동으로 알려드릴게요",
    desc: "30일·60일 시점에 변화 추적 리포트가 자동으로 생성되고 메일로 받아볼 수 있어요. (메일 자동 전송은 곧 활성화됩니다)",
    highlight: "auto-followup",
  },
];

interface Props {
  forceOpen?: boolean;
  onClose?: () => void;
}

const MindTrackWelcomeModal = ({ forceOpen, onClose }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    const shown = localStorage.getItem(STORAGE_KEY);
    if (!shown) setOpen(true);
  }, [forceOpen]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setOpen(false);
    onClose?.();
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      close();
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0">
        <div className="bg-gradient-to-br from-primary/10 via-white to-purple-50 p-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {current.badge}
            </Badge>
            <button
              onClick={close}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              건너뛰기
            </button>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-6 space-y-5"
          >
            <div className="flex justify-center pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900 break-keep leading-snug">
                {current.title}
              </h3>
              <p className="text-sm text-slate-600 break-keep leading-relaxed">
                {current.desc}
              </p>
            </div>

            {step === STEPS.length - 1 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 시작 가이드
                </div>
                <p className="text-xs text-emerald-800 break-keep leading-relaxed">
                  먼저 워크북에서 오늘의 미션을 체크하고, 검사 1개 + 관찰일지 1개를 추가해보세요.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  이전
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-primary to-purple-600"
              >
                {step === STEPS.length - 1 ? "시작하기" : "다음"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default MindTrackWelcomeModal;
