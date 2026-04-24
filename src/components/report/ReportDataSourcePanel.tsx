import { useState } from "react";
import { Database, Eye, BookOpen, FileText, Brain, MessageSquare, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SourceCounts {
  assessments: number;
  observations: number;        // observation_logs
  observationSessions: number; // observation_sessions
  textObservations: number;    // observations
  aiObservations?: number;     // ai_observation_results (체크리스트에서 카운트)
  chatMessages: number;
}

interface Props {
  counts: SourceCounts;
  selectedCount: number;
  selectedSampleByCategory?: Record<string, { label: string; detail: string; date: string }[]>;
  userName?: string;
}

const SOURCES = [
  { key: 'assessments', label: '검사 결과', table: 'assessments', icon: Brain, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'aiObservations', label: 'AI 영상/음성 분석', table: 'ai_observation_results', icon: Eye, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'textObservations', label: '텍스트 관찰일지', table: 'observations', icon: BookOpen, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'observations', label: '관찰 로그', table: 'observation_logs', icon: FileText, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { key: 'observationSessions', label: '관찰 세션', table: 'observation_sessions', icon: FileText, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { key: 'chatMessages', label: '상담 대화', table: 'chat_messages', icon: MessageSquare, color: 'bg-violet-50 text-violet-700 border-violet-200' },
] as const;

export default function ReportDataSourcePanel({ counts, selectedCount, selectedSampleByCategory, userName }: Props) {
  const [open, setOpen] = useState(false);
  const total = Object.values(counts).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-800">사용 중인 데이터 소스</h3>
          <Badge variant="secondary" className="text-[10px]">총 {total}건</Badge>
        </div>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              리포트 샘플 미리보기
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              <p className="text-xs text-slate-500 mb-1">💡 실제 리포트는 아래 데이터를 기반으로 자동 생성됩니다.</p>
              <p>대상자: <strong>{userName || '(미입력)'}</strong> · 선택된 데이터: <strong>{selectedCount}건</strong></p>
            </div>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-800 border-b pb-1">📊 1. 종합 발달 프로필 (예시)</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                선택하신 <b>{counts.assessments}건의 검사</b>·<b>{counts.aiObservations || 0}건의 AI 영상 분석</b>·
                <b>{counts.textObservations}건의 텍스트 관찰일지</b>를 종합 분석하여 인지·정서·사회성·언어·행동 5대 영역의 발달 프로파일을
                레이더 차트와 함께 제시합니다.
              </p>
            </section>

            {selectedSampleByCategory?.text_observations && selectedSampleByCategory.text_observations.length > 0 && (
              <section className="space-y-2">
                <h4 className="font-bold text-amber-800 border-b pb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> 2. 관찰일지 인용 (실제 데이터)
                </h4>
                <div className="space-y-1.5">
                  {selectedSampleByCategory.text_observations.slice(0, 3).map((item, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-amber-900">{item.label}</span>
                        <span className="text-[10px] text-amber-600">{item.date}</span>
                      </div>
                      <p className="text-amber-800/80 line-clamp-2">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-amber-700 italic">
                  → AI가 이 일지의 제목·내용·전문가 조언을 함께 읽고 패턴/키워드/위험신호를 추출합니다.
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
