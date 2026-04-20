import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DISMISS_KEY = 'aihpro:report-hub-banner-dismissed-at';
const DISMISS_HOURS = 24;
const MIN_DATA_TO_TRIGGER = 3;

/**
 * "데이터 N건 쌓였어요 → 종합 리포트 만들 타이밍" 배너.
 * 검사·관찰·상담 데이터가 일정 개수 이상 누적되면 노출.
 * 24시간 단위로 닫기 가능.
 */
const ReportHubReadyBanner = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 24시간 내 닫은 적 있으면 숨김
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_HOURS * 3600 * 1000) {
      setDismissed(true);
      return;
    }
    void load();
  }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [tests, obs, voice] = await Promise.all([
      supabase.from('test_results').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('ai_observation_results').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('ai_coaching_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    const total = (tests.count || 0) + (obs.count || 0) + (voice.count || 0);
    setCount(total);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  if (dismissed || count === null || count < MIN_DATA_TO_TRIGGER) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 mb-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">리포트 타이밍</span>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-snug break-keep">
              데이터 <span className="text-primary">{count}건</span>이 쌓였어요. 지금이 종합 리포트 만들 때예요.
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-keep">
              검사·관찰·상담을 교차 분석한 박사급 리포트로 변화를 한눈에 확인하세요.
            </p>
            <button
              onClick={() => navigate('/report-generator-pro?origin=' + encodeURIComponent('누적 데이터'))}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              종합 리포트 허브로 이동
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="닫기"
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportHubReadyBanner;
