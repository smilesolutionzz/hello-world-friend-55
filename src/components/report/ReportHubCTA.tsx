import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 리포트 허브로 사용자를 모으는 통일 CTA.
 *
 * 검사 결과 / 관찰일지 / 금쪽상담소 / Mind Track 등 모든 데이터 생성 종료
 * 시점에 부착하여 "이 데이터 + 다른 데이터 합쳐 종합 리포트" 흐름을 통일한다.
 *
 * - `sources`로 어떤 카테고리를 자동 체크할지 표시 (URL 쿼리로 전달)
 * - `originLabel`로 진입한 컨텍스트(예: "방어기제 검사")를 헤더에 노출
 */
export type ReportHubSource =
  | 'tests'
  | 'enhanced'
  | 'observations'
  | 'game'
  | 'voice'
  | 'progress'
  | 'concerns'
  | 'concern_reports';

interface ReportHubCTAProps {
  originLabel: string;
  sources: ReportHubSource[];
  variant?: 'card' | 'inline';
}

const ReportHubCTA = ({ originLabel, sources, variant = 'card' }: ReportHubCTAProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const qs = sources.length ? `?sources=${sources.join(',')}&origin=${encodeURIComponent(originLabel)}` : '';
    navigate(`/report-generator-pro${qs}`);
  };

  if (variant === 'inline') {
    return (
      <Button onClick={handleClick} className="gap-2 bg-gradient-to-r from-primary to-primary/80">
        <Sparkles className="w-4 h-4" />
        이 데이터로 종합 리포트 만들기
        <ArrowRight className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">리포트 허브</span>
          </div>
          <h4 className="text-sm font-bold text-foreground leading-snug break-keep">
            방금 완료한 <span className="text-primary">{originLabel}</span>를 다른 데이터와 합쳐 종합 분석하세요
          </h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-keep">
            관찰일지·검사·상담 기록을 교차 분석해 박사급 종합 리포트를 만듭니다. 해당 데이터는 자동 선택됩니다.
          </p>
        </div>
      </div>
      <Button
        onClick={handleClick}
        className="w-full mt-4 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold gap-2"
      >
        <Sparkles className="w-4 h-4" />
        종합 리포트 허브로 이동
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default ReportHubCTA;
