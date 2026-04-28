import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Award, Calendar, Quote, Target, AlertCircle } from 'lucide-react';

const WeeklyReportPreview: React.FC = () => {
  return (
    <section className="my-12 md:my-16">
      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          Weekly Report — Sample
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground break-keep">
          매주 일요일, 이런 리포트가 도착합니다
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-keep">
          아래는 실제 발송되는 Week 1 리포트의 축약 샘플입니다 (개인 식별 정보는 가공)
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-3xl border border-border bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/20 p-5 md:p-8"
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

        {/* 실제 리포트 샘플 */}
        <div className="rounded-2xl bg-white dark:bg-card border border-border overflow-hidden">
          <div className="bg-foreground text-background px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-bold">Week 1 변화 리포트 · 별이엄마님</span>
            </div>
            <span className="text-[10px] opacity-70">2026.05.10</span>
          </div>

          <div className="p-5 space-y-5">
            {/* 핵심 지표 카드 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '마음 점수', val: '72', delta: '+8', dir: 'up', color: 'text-emerald-600', note: '경계 → 양호' },
                { label: '수면 질', val: '6.8', delta: '+1.2h', dir: 'up', color: 'text-blue-600', note: '평균 6.8시간' },
                { label: '회복탄력성', val: '64', delta: '+12', dir: 'up', color: 'text-violet-600', note: '백분위 71%' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">{s.label}</div>
                  <div className={`text-2xl font-black ${s.color} tabular-nums mt-0.5`}>{s.val}</div>
                  <div className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                    {s.dir === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />} {s.delta}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 break-keep">{s.note}</div>
                </div>
              ))}
            </div>

            {/* 일별 추이 미니 차트 — 큰 숫자, 기준선, 시작→끝 표시 */}
            {(() => {
              const data = [
                { d: '월', v: 58 },
                { d: '화', v: 63 },
                { d: '수', v: 60 },
                { d: '목', v: 67 },
                { d: '금', v: 70 },
                { d: '토', v: 68 },
                { d: '일', v: 72 },
              ];
              const min = 50;
              const max = 80;
              const range = max - min;
              const baseline = 65; // 양호 기준선
              const start = data[0].v;
              const end = data[data.length - 1].v;
              const delta = end - start;

              return (
                <div className="rounded-xl border border-border bg-white dark:bg-card p-4">
                  {/* 헤더: 무엇을 보고 있는지 한 줄로 */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="text-xs font-bold text-foreground">일별 마음 점수 추이</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">100점 만점 · 65점 이상이 양호</div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" /> 7일간 +{delta}점 상승
                      </div>
                    </div>
                  </div>

                  {/* 시작 → 끝 한눈에 보이는 큰 숫자 */}
                  <div className="flex items-center justify-center gap-3 my-3">
                    <div className="text-center">
                      <div className="text-[9px] text-muted-foreground font-bold">월요일</div>
                      <div className="text-2xl font-black text-slate-400 tabular-nums">{start}</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <div className="text-center">
                      <div className="text-[9px] text-emerald-700 font-bold">일요일</div>
                      <div className="text-3xl font-black text-emerald-600 tabular-nums">{end}</div>
                    </div>
                  </div>

                  {/* 막대 차트 + 기준선 */}
                  <div className="relative h-24 mt-2">
                    {/* 양호 기준선 */}
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-emerald-400 z-10"
                      style={{ bottom: `${((baseline - min) / range) * 100}%` }}
                    >
                      <span className="absolute -top-2 right-0 text-[8px] font-bold text-emerald-600 bg-white px-1">
                        양호 {baseline}
                      </span>
                    </div>
                    <div className="flex items-end justify-around h-full gap-1.5">
                      {data.map((b, i) => {
                        const heightPct = ((b.v - min) / range) * 100;
                        const isLast = i === data.length - 1;
                        const aboveBaseline = b.v >= baseline;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                            <span className={`text-[10px] font-black tabular-nums ${isLast ? 'text-emerald-700' : 'text-slate-700 dark:text-slate-300'}`}>
                              {b.v}
                            </span>
                            <div
                              className={`w-full rounded-t-md ${
                                isLast
                                  ? 'bg-emerald-500'
                                  : aboveBaseline
                                  ? 'bg-blue-400'
                                  : 'bg-slate-300'
                              }`}
                              style={{ height: `${heightPct}%`, minHeight: '4px' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* 요일 라벨 */}
                  <div className="flex items-center justify-around gap-1.5 mt-1">
                    {data.map((b, i) => (
                      <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
                        {b.d}
                      </span>
                    ))}
                  </div>

                  {/* 한 줄 해석 */}
                  <div className="mt-3 pt-3 border-t border-border text-[11px] text-foreground break-keep leading-relaxed">
                    <strong className="text-emerald-700">금요일</strong>부터 양호 구간(65점) 진입 ·
                    통계적으로 유의미한 개선(<strong>RCI 1.96</strong>)
                  </div>
                </div>
              );
            })()}

            {/* AI 임상 해석 — 실제 샘플 텍스트 */}
            <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Quote className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">
                  AI 임상 해석
                </span>
              </div>
              <p className="text-xs md:text-sm text-foreground leading-relaxed break-keep">
                지난 7일 동안 마음 점수가 <strong className="text-emerald-700">64 → 72(+8점)</strong> 상승했습니다.
                이는 RCI(신뢰변화지수) 기준 <strong>+1.96 이상의 통계적으로 유의미한 개선</strong>입니다.
                특히 <strong>목요일 저녁 호흡 명상</strong> 기록 이후 수면 질이 평균 1.2시간 늘어난 점이 핵심 변곡점으로 분석됩니다.
              </p>
            </div>

            {/* 다음 주 권장 액션 */}
            <div className="rounded-xl border border-border bg-white dark:bg-card p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-black text-foreground tracking-wider uppercase">
                  다음 주 추천 액션 (Top 2)
                </span>
              </div>
              <ul className="space-y-2 text-xs md:text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center mt-0.5">1</span>
                  <span className="text-foreground break-keep leading-relaxed">
                    효과가 검증된 <strong>목요일 호흡 명상</strong>을 주 3회로 확대 (월·목·일 21시 권장)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center mt-0.5">2</span>
                  <span className="text-foreground break-keep leading-relaxed">
                    화·수 점수 하락 패턴 → <strong>업무 회의 전 5분 그라운딩 루틴</strong> 추가 시도
                  </span>
                </li>
              </ul>
            </div>

            {/* 주의 신호 */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] md:text-xs text-amber-900 dark:text-amber-100 break-keep leading-relaxed">
                <strong>모니터링 필요:</strong> 수요일 오후 GAD-7 응답에서 "안절부절" 항목이 3주 연속 상승.
                다음 주에도 이어지면 전문가 상담권 사용을 권장드려요.
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground italic mt-4 text-center break-keep">
          ※ 본 서비스는 발달 코칭 및 의사결정 보조 도구이며, 의료 진단이 아닙니다. 표시된 수치는 샘플입니다.
        </p>
      </motion.div>
    </section>
  );
};

export default WeeklyReportPreview;
