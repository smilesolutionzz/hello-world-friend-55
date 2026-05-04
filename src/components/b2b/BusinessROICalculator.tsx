import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useB2BJobcoachPlans } from '@/hooks/useB2BJobcoachPlans';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const GOLD = '#C8B88A';

/**
 * 조직 규모를 입력하면 마음건강 이슈로 인한 월간 생산성 손실 추정치 +
 * 잡코치 추천 플랜 도입 시 ROI를 산출.
 *
 * - 가격은 b2b_jobcoach_plans (DB) 의 추천 플랜에서 읽음 (메모리 정책)
 * - 손실 가정: 평균 월급 450만 × 18% 결근/생산성 손실
 * - 회복 가정: 손실의 42% 회복
 */
export default function BusinessROICalculator() {
  const { recommended, loading } = useB2BJobcoachPlans();
  const [employees, setEmployees] = useState(100);
  const [avgSalary, setAvgSalary] = useState(450); // 만원

  const data = useMemo(() => {
    const monthlyLoss = employees * avgSalary * 10000 * 0.18;
    const monthlySaving = monthlyLoss * 0.42;
    const perEmployee = recommended?.price_per_employee_monthly ?? 0;
    const programCost = perEmployee * employees;
    const netROI = monthlySaving - programCost;
    const roiPercent = programCost > 0 ? Math.round((netROI / programCost) * 100) : 0;
    return {
      monthlyLossManwon: Math.round(monthlyLoss / 10000),
      monthlySavingManwon: Math.round(monthlySaving / 10000),
      programCostManwon: Math.round(programCost / 10000),
      netROIManwon: Math.round(netROI / 10000),
      roiPercent,
      perEmployee,
    };
  }, [employees, avgSalary, recommended]);

  const fmtManwon = (v: number) => `₩${v.toLocaleString()}만`;

  return (
    <Card className="rounded-3xl border bg-white p-7 md:p-10 shadow-none" style={{ borderColor: `${GOLD}40` }}>
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.2em] text-foreground/50 mb-2">ROI CALCULATOR</p>
        <h3 className="text-xl md:text-2xl font-semibold break-keep">
          우리 조직의 마음건강 손실, 얼마일까요?
        </h3>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground/80">직원 수</label>
            <span className="text-sm font-mono" style={{ color: GOLD }}>
              {employees.toLocaleString()}명
            </span>
          </div>
          <Slider
            value={[employees]}
            onValueChange={(v) => setEmployees(v[0])}
            min={20}
            max={1000}
            step={10}
          />
          <div className="flex justify-between text-[11px] text-foreground/40 mt-2">
            <span>20명</span>
            <span>1,000명</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground/80">평균 월급</label>
            <span className="text-sm font-mono" style={{ color: GOLD }}>
              ₩{avgSalary.toLocaleString()}만
            </span>
          </div>
          <Slider
            value={[avgSalary]}
            onValueChange={(v) => setAvgSalary(v[0])}
            min={250}
            max={800}
            step={10}
          />
          <div className="flex justify-between text-[11px] text-foreground/40 mt-2">
            <span>₩250만</span>
            <span>₩800만</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-2 text-foreground/60">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs">예상 월간 손실</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums">{fmtManwon(data.monthlyLossManwon)}</p>
          <p className="text-xs text-foreground/50 mt-1">결근·생산성 저하 추정</p>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-2 text-foreground/60">
            <Wallet className="h-4 w-4" />
            <span className="text-xs">도입 비용 (월)</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            {loading ? '…' : data.perEmployee > 0 ? fmtManwon(data.programCostManwon) : '맞춤 견적'}
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            {recommended?.plan_name ?? '추천 플랜 기준'}
          </p>
        </div>
        <div
          className="rounded-2xl border p-5"
          style={{ borderColor: `${GOLD}66`, background: `${GOLD}0D` }}
        >
          <div className="flex items-center gap-2 mb-2 text-foreground/70">
            <TrendingUp className="h-4 w-4" style={{ color: GOLD }} />
            <span className="text-xs">예상 순효과</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums" style={{ color: GOLD }}>
            {data.perEmployee > 0 ? fmtManwon(data.netROIManwon) : '—'}
          </p>
          <p className="text-xs text-foreground/60 mt-1">
            ROI {data.perEmployee > 0 ? `${data.roiPercent}%` : '—'}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-foreground/40 text-center mt-6 break-keep">
        ※ 추정 모델은 평균 월급 × 결근·생산성 손실율(18%) × 회복율(42%) 가정에 기반하며, 실제 효과는 조직 특성에 따라 다를 수 있습니다.
      </p>
    </Card>
  );
}
