import { Check } from "lucide-react";

const STEPS = [
  { n: "01", label: "기관 만들기" },
  { n: "02", label: "엑셀 이관" },
  { n: "03", label: "콘솔 사용" },
];

export default function CenterOnboardingStepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const idx = i + 1;
          const done = idx < step;
          const active = idx === step;
          return (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium border ${
                    done
                      ? "bg-[#C8B88A] border-[#C8B88A] text-white"
                      : active
                      ? "bg-neutral-900 border-neutral-900 text-white"
                      : "bg-white border-neutral-200 text-neutral-400"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : s.n}
                </div>
                <p className={`mt-2 text-xs ${active ? "text-neutral-900 font-medium" : "text-neutral-500"}`}>{s.label}</p>
              </div>
              {idx < STEPS.length && (
                <div className={`flex-1 h-px mx-3 ${done ? "bg-[#C8B88A]" : "bg-neutral-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
