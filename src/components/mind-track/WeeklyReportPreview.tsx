import React from 'react';
import { motion } from 'framer-motion';
import { Lock, TrendingUp, Award, Calendar } from 'lucide-react';

const WeeklyReportPreview: React.FC = () => {
  return (
    <section className="my-12 md:my-16">
      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          Weekly Report
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground break-keep">
          매주 일요일, 박사급 분석 리포트가 도착합니다
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-keep">
          단순 점수 그래프가 아닌, 통계적으로 검증된 변화 해석
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl border border-border bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/20 p-5 md:p-8 overflow-hidden"
      >
        {/* 신뢰 뱃지 */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-600 text-white px-2 py-1 rounded">
            <Award className="w-3 h-3" /> RCI 신뢰변화지수
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-600 text-white px-2 py-1 rounded">
            박사급 임상 분석
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-violet-600 text-white px-2 py-1 rounded">
            7대 데이터 통합
          </span>
        </div>

        {/* 가짜 리포트 모형 (블러 처리) */}
        <div className="relative rounded-2xl bg-white dark:bg-card border border-border overflow-hidden">
          <div className="bg-foreground text-background px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-bold">Week 1 변화 리포트</span>
            </div>
            <span className="text-[10px] opacity-70">2026.05.10</span>
          </div>

          <div className="p-5 space-y-4 select-none">
            {/* 점수 카드 — 일부만 명확, 나머지 블러 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '마음 점수', val: '72', delta: '+8', color: 'text-emerald-600' },
                { label: '수면 질', val: '6.8', delta: '+1.2', color: 'text-blue-600' },
                { label: '회복탄력성', val: '64', delta: '+12', color: 'text-violet-600' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">{s.label}</div>
                  <div className={`text-2xl font-black ${s.color} tabular-nums mt-0.5`}>{s.val}</div>
                  <div className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                    <TrendingUp className="w-2.5 h-2.5" /> {s.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* 차트 자리 — 블러 */}
            <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 h-28 relative overflow-hidden filter blur-sm">
              <div className="absolute inset-0 flex items-end justify-around pb-3 px-3 gap-1.5">
                {[40, 55, 48, 62, 70, 65, 78].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* 분석 텍스트 — 블러 */}
            <div className="space-y-1.5 filter blur-[2.5px] select-none">
              <div className="h-2 bg-muted rounded w-full" />
              <div className="h-2 bg-muted rounded w-11/12" />
              <div className="h-2 bg-muted rounded w-4/5" />
              <div className="h-2 bg-muted rounded w-3/4" />
            </div>
          </div>

          {/* Lock 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-border rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2">
              <Lock className="w-4 h-4 text-foreground" />
              <span className="text-xs md:text-sm font-bold text-foreground">결제 후 매주 일요일 발송</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground italic mt-4 text-center break-keep">
          ※ 본 서비스는 발달 코칭 및 의사결정 보조 도구이며, 의료 진단이 아닙니다.
        </p>
      </motion.div>
    </section>
  );
};

export default WeeklyReportPreview;
