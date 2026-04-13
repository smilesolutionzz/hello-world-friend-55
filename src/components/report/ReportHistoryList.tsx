import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, TrendingUp, ChevronDown, ChevronUp, Eye, Share2, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ReportHistoryItem {
  id: string;
  report_number: number;
  created_at: string;
  overall_score: number | null;
  risk_level: string | null;
  model_used: string | null;
  dimension_scores: any;
  data_source_counts: any;
  is_shared: boolean | null;
  share_count: number | null;
}

interface ReportHistoryListProps {
  onViewReport?: (report: any) => void;
  onShareReport?: (reportId: string) => void;
  activeReportId?: string | null;
}

const RISK_CONFIG: Record<string, { label: string; labelEn: string; color: string; bg: string }> = {
  low: { label: '양호', labelEn: 'Good', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
  moderate: { label: '관심 필요', labelEn: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
  high: { label: '주의', labelEn: 'Caution', color: 'text-red-700', bg: 'bg-red-100 border-red-200' },
  critical: { label: '긴급', labelEn: 'Critical', color: 'text-red-800', bg: 'bg-red-200 border-red-300' },
};

const ReportHistoryList: React.FC<ReportHistoryListProps> = ({ onViewReport, onShareReport, activeReportId }) => {
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isEnglish } = useLanguage();

  const t = (ko: string, en: string) => isEnglish ? en : ko;

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }

      const { data } = await supabase
        .from('premium_report_history')
        .select('id, report_number, created_at, overall_score, risk_level, model_used, dimension_scores, data_source_counts, is_shared, share_count, report_data')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) setReports(data);
    } catch (e) {
      console.error('Failed to load report history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;
  if (reports.length === 0) return null;

  const displayReports = isExpanded ? reports : reports.slice(0, 3);
  const risk = (level: string | null) => RISK_CONFIG[level || 'low'] || RISK_CONFIG.low;

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <Card className="bg-white/5 border-white/10 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{t('내 리포트 히스토리', 'My Report History')}</h3>
              <p className="text-[10px] text-muted-foreground">{t(`총 ${reports.length}건의 리포트`, `${reports.length} reports total`)}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            <BarChart3 className="w-3 h-3 mr-1" />
            {t('누적 분석', 'Cumulative')}
          </Badge>
        </div>

        <CardContent className="p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {displayReports.map((report, idx) => {
              const r = risk(report.risk_level);
              const date = new Date(report.created_at);
              const dateStr = date.toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 border transition-colors group cursor-pointer ${
                    activeReportId === report.id ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5'
                  }`}
                  onClick={() => onViewReport?.(report)}
                >
                  {/* Report number */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">#{report.report_number}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {t(`${report.report_number}차 통합 분석 리포트`, `Report #${report.report_number}`)}
                      </span>
                      <Badge className={`text-[9px] px-1.5 py-0 border ${r.bg} ${r.color}`}>
                        {isEnglish ? r.labelEn : r.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {dateStr}
                      </span>
                      {report.overall_score !== null && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {t('종합', 'Score')} {report.overall_score}{t('점', 'pt')}
                        </span>
                      )}
                      {report.is_shared && (
                        <span className="text-[10px] text-primary/70 flex items-center gap-1">
                          <Share2 className="w-3 h-3" /> {t('공유됨', 'Shared')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => { e.stopPropagation(); onShareReport?.(report.id); }}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {reports.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded
                ? <>{t('접기', 'Show Less')} <ChevronUp className="w-3.5 h-3.5 ml-1" /></>
                : <>{t(`${reports.length - 3}개 더 보기`, `Show ${reports.length - 3} More`)} <ChevronDown className="w-3.5 h-3.5 ml-1" /></>
              }
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportHistoryList;
