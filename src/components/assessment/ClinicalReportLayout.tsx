import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, Share2, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { TextToSpeechButton } from '@/components/audio/TextToSpeechButton';
import { PDFHeader } from '@/components/common/PDFHeader';
import { cleanMarkdown, extractFootnotes } from '@/utils/cleanMarkdown';

/* ─── Types ─── */
export interface DomainScore {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  level: string;
  color: string; // tailwind bg class e.g. 'bg-green-500'
  description?: string;
}

export interface ReportSection {
  id: string;
  icon: string; // emoji
  title: string;
  content: string;
  defaultOpen?: boolean;
}

interface ClinicalReportLayoutProps {
  testName: string;
  subtitle?: string;
  onBack: () => void;
  onDownload?: () => void;
  onShare?: () => void;

  /* Score summary */
  totalScore: number | string;
  totalLabel: string;
  scoreUnit?: string;
  scoreSeverity: string;
  severityColor?: string; // e.g. 'text-green-600'

  /* Domain scores */
  domains: DomainScore[];

  /* AI analysis */
  aiAnalysis?: string;
  aiSections?: ReportSection[];
  isAnalyzing?: boolean;

  /* Extra content below analysis */
  children?: React.ReactNode;

  /* PDF id */
  pdfId?: string;
}

/* ─── Collapsible Section ─── */
const CollapsibleSection = ({ section }: { section: ReportSection }) => {
  const [open, setOpen] = useState(section.defaultOpen ?? false);
  const cleaned = cleanMarkdown(section.content);
  const { text: footnoted, footnotes } = extractFootnotes(cleaned);
  const paragraphs = footnoted.split('\n\n').map(p => p.trim()).filter(Boolean);

  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span>{section.icon}</span>
          {section.title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="p-3.5 pt-2 space-y-2.5">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="text-[13px] leading-[1.8] text-foreground/85">
              {p}
            </p>
          ))}
          <FootnoteList footnotes={footnotes} />
        </div>
      )}
    </div>
  );
};

/* ─── Footnote List ─── */
const FootnoteList = ({ footnotes }: { footnotes: string[] }) => {
  if (!footnotes || footnotes.length === 0) return null;
  return (
    <div className="mt-4 pt-3 border-t border-border/30">
      <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">📎 참고 문헌 및 이론</p>
      <div className="space-y-0.5">
        {footnotes.map((fn, idx) => (
          <p key={idx} className="text-[10px] leading-relaxed text-muted-foreground/70">
            [{idx + 1}] {fn}
          </p>
        ))}
      </div>
    </div>
  );
};

/* ─── Score Bar ─── */
const ScoreBar = ({ domain }: { domain: DomainScore }) => {
  const pct = Math.round((domain.score / domain.maxScore) * 100);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0">
      <div className="w-[88px] shrink-0">
        <span className="text-xs font-semibold text-foreground">{domain.label}</span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
          <div
            className={`h-full rounded-full ${domain.color} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-foreground w-10 text-right">
          {typeof domain.score === 'number' ? (Number.isInteger(domain.score) ? domain.score : domain.score.toFixed(1)) : domain.score}
        </span>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground w-12 text-right">{domain.level}</span>
    </div>
  );
};

/* ─── Main Layout ─── */
const ClinicalReportLayout = ({
  testName,
  subtitle,
  onBack,
  onDownload,
  onShare,
  totalScore,
  totalLabel,
  scoreUnit,
  scoreSeverity,
  severityColor = 'text-primary',
  domains,
  aiAnalysis,
  aiSections,
  isAnalyzing,
  children,
  pdfId = 'clinical-report-content',
}: ClinicalReportLayoutProps) => {
  const cleanedAnalysis = aiAnalysis ? cleanMarkdown(aiAnalysis) : '';
  const { text: footnotedAnalysis, footnotes: analysisFootnotes } = extractFootnotes(cleanedAnalysis);
  const analysisParagraphs = footnotedAnalysis
    ? footnotedAnalysis.split('\n\n').map(p => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center justify-between px-4 h-12">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 -ml-2 text-xs gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
          <div className="flex items-center gap-1.5">
            {onDownload && (
              <Button variant="ghost" size="sm" onClick={onDownload} className="h-8 w-8 p-0">
                <Download className="w-4 h-4" />
              </Button>
            )}
            {onShare && (
              <Button variant="ghost" size="sm" onClick={onShare} className="h-8 w-8 p-0">
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div id={pdfId} className="px-4 pb-24 max-w-2xl mx-auto">
        <PDFHeader testName={testName} />

        {/* ── Title ── */}
        <div className="pt-5 pb-4">
          <h1 className="text-lg font-bold text-foreground leading-tight">{testName}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          <p className="text-[10px] text-muted-foreground mt-1">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* ── Score Summary Card ── */}
        <div className="rounded-2xl border border-border/40 bg-card p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{totalLabel}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-foreground">{totalScore}</span>
                {scoreUnit && <span className="text-sm text-muted-foreground">{scoreUnit}</span>}
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${severityColor} bg-background`}>
              {scoreSeverity}
            </div>
          </div>
        </div>

        {/* ── Domain Scores ── */}
        {domains.length > 0 && (
          <div className="rounded-2xl border border-border/40 bg-card p-4 mb-4">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              📊 영역별 분석
            </h2>
            <div>
              {domains.map((d) => (
                <ScoreBar key={d.key} domain={d} />
              ))}
            </div>
          </div>
        )}

        {/* ── AI Analysis ── */}
        <div className="rounded-2xl border border-border/40 bg-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              전문가 분석 리포트
            </h2>
            {aiAnalysis && <TextToSpeechButton text={cleanedAnalysis} />}
          </div>

          {isAnalyzing ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted-foreground">심층 분석 중...</p>
            </div>
          ) : aiSections && aiSections.length > 0 ? (
            <div className="space-y-2">
              {aiSections.map((s) => (
                <CollapsibleSection key={s.id} section={s} />
              ))}
            </div>
          ) : analysisParagraphs.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {analysisParagraphs.map((p, idx) => (
                <p key={idx} className="text-[13px] leading-[1.8] text-foreground/85">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">분석 결과를 불러올 수 없습니다.</p>
          )}
        </div>

        {/* ── Extra Content ── */}
        {children}

        {/* ── Disclaimer ── */}
        <div className="mt-6 px-1">
          <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
            본 검사 결과는 참고 자료이며 의학적 진단이 아닙니다.<br />
            정확한 진단은 전문가와 상담하시기 바랍니다.
          </p>
          <p className="text-[9px] text-muted-foreground/40 text-center mt-1">© AIHPRO.COM</p>
        </div>
      </div>
    </div>
  );
};

export default ClinicalReportLayout;
