import { useState, useMemo } from "react";
import { Database, Eye, BookOpen, FileText, Brain, MessageSquare, Sparkles, ChevronRight, Settings2, Info, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface SourceCounts {
  assessments: number;
  observations: number;        // observation_logs
  observationSessions: number; // observation_sessions
  textObservations: number;    // observations
  aiObservations?: number;     // ai_observation_results (체크리스트에서 카운트)
  chatMessages: number;
}

export interface QuoteOptions {
  maxQuotes: number;       // 1~10
  contentChars: number;    // 80~500
  adviceChars: number;     // 60~300
}

interface SelectedSampleItem {
  label: string;
  detail: string;
  date: string;
}

interface Props {
  counts: SourceCounts;
  selectedCount: number;
  selectedSampleByCategory?: Record<string, SelectedSampleItem[]>;
  /** 체크리스트 카테고리별 실제 선택 개수 (소스 매핑 표시용) */
  selectedCountsByCategory?: Record<string, number>;
  userName?: string;
  quoteOptions: QuoteOptions;
  onQuoteOptionsChange: (next: QuoteOptions) => void;
}

const SOURCES = [
  { key: 'assessments', label: '검사 결과', table: 'assessments', icon: Brain, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'aiObservations', label: 'AI 영상/음성 분석', table: 'ai_observation_results', icon: Eye, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'textObservations', label: '텍스트 관찰일지', table: 'observations', icon: BookOpen, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'observations', label: '관찰 로그', table: 'observation_logs', icon: FileText, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { key: 'observationSessions', label: '관찰 세션', table: 'observation_sessions', icon: FileText, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { key: 'chatMessages', label: '상담 대화', table: 'chat_messages', icon: MessageSquare, color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const;

// 체크리스트 카테고리 키 → 실제 DB 테이블/소스 매핑
const CATEGORY_TO_SOURCE: { key: string; label: string; tables: string[] }[] = [
  { key: 'tests', label: '간편검사', tables: ['test_results'] },
  { key: 'enhanced', label: '심층검사', tables: ['assessment_enhanced_analysis', 'assessments'] },
  { key: 'observations', label: 'AI 관찰분석(영상/음성)', tables: ['ai_observation_results'] },
  { key: 'text_observations', label: '텍스트 관찰일지', tables: ['observations'] },
  { key: 'game', label: '게임검사', tables: ['play_assessment_results'] },
  { key: 'voice', label: '음성상담', tables: ['ai_coaching_sessions'] },
  { key: 'progress', label: '변화 추적', tables: ['progress_tracking'] },
  { key: 'concerns', label: '고민/인사이트', tables: ['ai_health_insights'] },
  { key: 'concern_reports', label: '고민 리포트', tables: ['concern_storage'] },
];

export default function ReportDataSourcePanel({
  counts,
  selectedCount,
  selectedSampleByCategory,
  selectedCountsByCategory,
  userName,
  quoteOptions,
  onQuoteOptionsChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const total = Object.values(counts).reduce((a, b) => a + (b || 0), 0);

  const isEmptySelection = selectedCount === 0;
  const activeMappings = useMemo(
    () => CATEGORY_TO_SOURCE.filter((m) => (selectedCountsByCategory?.[m.key] || 0) > 0),
    [selectedCountsByCategory]
  );

  const textObsSamples = selectedSampleByCategory?.text_observations || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-800">사용 중인 데이터 소스</h3>
          <Badge variant="secondary" className="text-[10px]">총 {total}건</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings((v) => !v)}
            className="h-7 text-[11px] gap-1 border-slate-200"
          >
            <Settings2 className="w-3 h-3" />
            인용 옵션
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-7 text-[11px] gap-1 border-slate-200"
          >
            <Sparkles className="w-3 h-3" />
            샘플 미리보기
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 빈 선택 안내 — 기본 동작 명확화 */}
      <div
        className={`mb-3 flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] border ${
          isEmptySelection
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
      >
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        {isEmptySelection ? (
          <span>
            <strong>선택된 항목이 없습니다.</strong> 이 상태로 생성하면 체크리스트의{' '}
            <strong>전체 데이터({total}건)</strong>를 자동으로 사용합니다.
          </span>
        ) : (
          <span>
            현재 선택한 <strong>{selectedCount}건</strong>만 분석에 반영됩니다. 미선택 카테고리는 제외됩니다.
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {SOURCES.map((s) => {
          const Icon = s.icon;
          const c = (counts as any)[s.key] || 0;
          const isOn = c > 0;
          return (
            <div
              key={s.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
                isOn ? s.color : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}
              title={s.table}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{s.label}</div>
                <div className="text-[10px] opacity-70 truncate">{s.table}</div>
              </div>
              <span className="font-bold tabular-nums">{c}</span>
            </div>
          );
        })}
      </div>

      {/* 카테고리 → DB 소스 매핑 */}
      {activeMappings.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            선택 항목 → 실제 반영 데이터 소스
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeMappings.map((m) => (
              <div
                key={m.key}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px]"
              >
                <span className="font-semibold text-slate-700">{m.label}</span>
                <span className="text-slate-400">×{selectedCountsByCategory?.[m.key]}</span>
                <span className="text-slate-300">→</span>
                <span className="font-mono text-emerald-700">{m.tables.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 인용 옵션 패널 */}
      {showSettings && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <Quote className="w-3 h-3" /> 관찰일지 원문 인용 옵션
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>최대 인용 일지 수</span>
              <span className="font-mono font-bold">{quoteOptions.maxQuotes}개</span>
            </div>
            <Slider
              min={1} max={10} step={1}
              value={[quoteOptions.maxQuotes]}
              onValueChange={(v) => onQuoteOptionsChange({ ...quoteOptions, maxQuotes: v[0] })}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>일지 본문 길이</span>
              <span className="font-mono font-bold">{quoteOptions.contentChars}자</span>
            </div>
            <Slider
              min={80} max={500} step={20}
              value={[quoteOptions.contentChars]}
              onValueChange={(v) => onQuoteOptionsChange({ ...quoteOptions, contentChars: v[0] })}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>AI 조언 길이</span>
              <span className="font-mono font-bold">{quoteOptions.adviceChars}자</span>
            </div>
            <Slider
              min={60} max={300} step={20}
              value={[quoteOptions.adviceChars]}
              onValueChange={(v) => onQuoteOptionsChange({ ...quoteOptions, adviceChars: v[0] })}
            />
          </div>

          <p className="text-[10px] text-slate-500 italic">
            ※ 길이가 길수록 AI가 더 풍부하게 인용하지만 토큰 사용량이 증가합니다.
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              선택한 데이터 기반 샘플 미리보기
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              <p className="text-xs text-slate-500 mb-1">
                💡 아래는 <strong>현재 선택한 항목</strong>만 사용해 만든 미리보기입니다.
              </p>
              <p>
                대상자: <strong>{userName || '(미입력)'}</strong> · 선택된 데이터:{' '}
                <strong>{selectedCount}건</strong>
                {isEmptySelection && (
                  <span className="ml-1 text-amber-700">(선택이 없으므로 전체 {total}건 사용)</span>
                )}
              </p>
            </div>

            {/* 활성 카테고리 목록 */}
            {activeMappings.length > 0 ? (
              <section className="space-y-2">
                <h4 className="font-bold text-slate-800 border-b pb-1">✅ 선택된 카테고리 ({activeMappings.length}개)</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeMappings.map((m) => (
                    <Badge key={m.key} variant="outline" className="text-[10px]">
                      {m.label} ×{selectedCountsByCategory?.[m.key]}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : (
              <section className="space-y-2">
                <h4 className="font-bold text-amber-800 border-b pb-1">⚠️ 선택된 항목 없음</h4>
                <p className="text-xs text-amber-700">
                  현재 체크된 항목이 없습니다. 이 상태로 생성하면 사용 가능한 전체 데이터가 자동으로 사용됩니다.
                </p>
              </section>
            )}

            <section className="space-y-2">
              <h4 className="font-bold text-slate-800 border-b pb-1">📊 1. 종합 발달 프로필 (예시)</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                선택하신 <b>{counts.assessments}건의 검사</b>·<b>{counts.aiObservations || 0}건의 AI 영상 분석</b>·
                <b>{counts.textObservations}건의 텍스트 관찰일지</b>를 종합 분석하여 인지·정서·사회성·언어·행동 5대 영역의 발달 프로파일을
                레이더 차트와 함께 제시합니다.
              </p>
            </section>

            {textObsSamples.length > 0 && (
              <section className="space-y-2">
                <h4 className="font-bold text-amber-800 border-b pb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> 2. 관찰일지 인용 (선택된 데이터 일부)
                </h4>
                <div className="space-y-1.5">
                  {textObsSamples.slice(0, quoteOptions.maxQuotes).map((item, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-amber-900">[인용 #{i + 1}] {item.label}</span>
                        <span className="text-[10px] text-amber-600">{item.date}</span>
                      </div>
                      <p className="text-amber-800/80 line-clamp-3">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-amber-700 italic">
                  → AI는 이 일지들을 <b>[인용 #N]</b> 번호로 본문에서 직접 참조하도록 강제됩니다.
                </p>
              </section>
            )}

            <section className="space-y-2">
              <h4 className="font-bold text-slate-800 border-b pb-1">📈 3. 종단 추이 분석</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                기록 시점이 다른 데이터를 시간축에 정렬하여 <b>개선/안정/하락</b> 영역을 자동 판별하고,
                또래 평균(N=1,247) 대비 위치를 백분위로 표시합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-800 border-b pb-1">🎯 4. 맞춤 권고 & 3개월 로드맵</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                위험 신호가 감지된 영역에 대해 가정 내 활동·전문가 상담·재검사 시점을 단계별로 제안합니다.
              </p>
            </section>

            <div className="text-[11px] text-slate-500 italic pt-2 border-t">
              ※ 실제 생성 시 위 구조 + 9개 전문가 섹션 + Reliability Badge가 함께 출력됩니다.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
