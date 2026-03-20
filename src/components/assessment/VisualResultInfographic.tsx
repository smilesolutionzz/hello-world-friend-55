import { useRef, useState, useMemo } from 'react';
import { Download, Share2, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { shareTestResult, isKakaoInitialized } from '@/lib/kakaoShare';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguage } from '@/i18n/LanguageContext';

export interface VisualResultData {
  testName: string;
  subtitle?: string;
  date: string;
  scores: Record<string, number>;
  maxScore?: number;
  categoryTranslations: Record<string, string>;
  aiSummary?: string;
  actionItems?: string[];
  riskLevel?: 'low' | 'moderate' | 'high';
}

interface Props {
  data: VisualResultData;
  onClose?: () => void;
}

function deriveRiskLevel(scores: Record<string, number>, max: number): 'low' | 'moderate' | 'high' {
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const ratio = avg / max;
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.45) return 'moderate';
  return 'low';
}

function extractKeyPoints(aiSummary: string): string[] {
  if (!aiSummary) return [];
  const sentences = aiSummary.replace(/\*\*/g, '').split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 15 && s.length < 80);
  return sentences.slice(0, 3);
}

const VisualResultInfographic = ({ data, onClose }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);

  const max = data.maxScore || 7;
  const risk = data.riskLevel || deriveRiskLevel(data.scores, max);

  const PALETTES = {
    low: {
      primary: '#059669', accent: '#10B981',
      bg: 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 30%, #f0fdf4 70%, #ecfdf5 100%)',
      cardBg: 'rgba(255,255,255,0.88)', border: '#6ee7b7',
      hubBg: 'linear-gradient(135deg, #10B981, #059669)',
      insightBg: '#d1fae5', insightText: '#065F46',
      label: t.resultLayout.good,
    },
    moderate: {
      primary: '#D97706', accent: '#F59E0B',
      bg: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 30%, #fefce8 70%, #fffbeb 100%)',
      cardBg: 'rgba(255,255,255,0.88)', border: '#fcd34d',
      hubBg: 'linear-gradient(135deg, #F59E0B, #D97706)',
      insightBg: '#fef3c7', insightText: '#92400E',
      label: t.resultLayout.caution,
    },
    high: {
      primary: '#DC2626', accent: '#F87171',
      bg: 'linear-gradient(145deg, #fef2f2 0%, #fecaca 30%, #fff1f2 70%, #fef2f2 100%)',
      cardBg: 'rgba(255,255,255,0.88)', border: '#fca5a5',
      hubBg: 'linear-gradient(135deg, #EF4444, #DC2626)',
      insightBg: '#fecaca', insightText: '#991B1B',
      label: t.resultLayout.needsAttention,
    },
  };

  const palette = PALETTES[risk];
  const entries = Object.entries(data.scores);
  const avg = entries.reduce((s, [, v]) => s + v, 0) / entries.length;
  const topCategories = [...entries].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const keyPoints = useMemo(() => extractKeyPoints(data.aiSummary || ''), [data.aiSummary]);

  const getScoreLabel = (score: number, maxVal: number) => {
    const r = score / maxVal;
    if (r >= 0.75) return t.resultLayout.high;
    if (r >= 0.5) return t.resultLayout.average;
    if (r >= 0.3) return t.resultLayout.low;
    return t.resultLayout.veryLow;
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const link = document.createElement('a');
      link.download = `${data.testName}_result_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: t.resultLayout.imageSaved, description: t.resultLayout.imageSavedDesc });
    } catch {
      toast({ title: t.resultLayout.saveFailed, variant: 'destructive' });
    }
  };

  const handleKakaoShare = () => {
    if (isKakaoInitialized()) {
      shareTestResult({
        testName: data.testName,
        resultTitle: `${data.testName} ${t.resultLayout.analysisComplete}`,
        resultSummary: `${t.resultLayout.average} ${avg.toFixed(1)}/${max} · ${palette.label}`,
      });
    } else {
      toast({ title: t.resultLayout.kakaoReady, description: t.resultLayout.kakaoRetry });
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'result.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: data.testName });
        } else {
          handleKakaoShare();
        }
      });
    } catch {
      handleKakaoShare();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ImageIcon className="w-4 h-4 text-primary" />
          {t.resultLayout.visualCard}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadImage} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> {t.resultLayout.save}
          </Button>
          <Button variant="outline" size="sm" onClick={handleNativeShare} className="gap-1.5 text-xs">
            <Share2 className="w-3.5 h-3.5" /> {t.resultLayout.share}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); onClose?.(); }} className="text-xs">
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div
        ref={cardRef}
        style={{
          background: palette.bg,
          borderRadius: '20px',
          overflow: 'hidden',
          padding: '28px 24px',
          fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            AI ANALYSIS REPORT
          </p>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1f2937', marginBottom: '4px', lineHeight: 1.3 }}>
            {data.testName}
          </h2>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            {data.date} {data.subtitle ? `· ${data.subtitle}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            background: palette.hubBg, borderRadius: '16px', padding: '18px 32px',
            textAlign: 'center', boxShadow: `0 8px 30px ${palette.accent}40`, minWidth: '180px',
          }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.5px' }}>
              {t.resultLayout.overallEval}
            </p>
            <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '2px' }}>
              {avg.toFixed(1)}<span style={{ fontSize: '16px', fontWeight: 500, opacity: 0.7 }}>/{max}</span>
            </p>
            <div style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.25)', borderRadius: '999px',
              padding: '2px 12px', fontSize: '11px', fontWeight: 700, color: '#fff', marginTop: '4px',
            }}>
              {palette.label}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {entries.map(([key, score]) => {
            const label = data.categoryTranslations[key.toLowerCase()] || key.replace(/_/g, ' ');
            const pct = Math.round((score / max) * 100);
            const isTop = topCategories.some(([k]) => k === key);
            return (
              <div key={key} style={{
                background: palette.cardBg, borderRadius: '12px', padding: '12px',
                border: `1.5px solid ${isTop ? palette.accent : palette.border}`,
                boxShadow: isTop ? `0 2px 12px ${palette.accent}20` : '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: palette.primary }}>
                    {getScoreLabel(score, max)}
                  </span>
                </div>
                <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: '999px',
                    background: `linear-gradient(90deg, ${palette.accent}, ${palette.primary})`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                  {score.toFixed(1)} / {max}
                </div>
              </div>
            );
          })}
        </div>

        {keyPoints.length > 0 && (
          <div style={{
            background: palette.insightBg, borderRadius: '12px', padding: '14px 16px',
            marginBottom: '12px', border: `1px solid ${palette.border}`,
          }}>
            <p style={{ fontSize: '12px', fontWeight: 800, color: palette.insightText, marginBottom: '8px' }}>
              {t.resultLayout.keyInsights}
            </p>
            {keyPoints.map((point, i) => (
              <div key={i} style={{
                display: 'flex', gap: '6px', alignItems: 'flex-start',
                fontSize: '11px', color: palette.insightText, lineHeight: '1.5',
                marginBottom: i < keyPoints.length - 1 ? '4px' : 0,
              }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        )}

        {data.actionItems && data.actionItems.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.75)', borderRadius: '12px', padding: '14px 16px',
            border: '1px solid #e5e7eb', marginBottom: '12px',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 800, color: '#374151', marginBottom: '8px' }}>
              {t.resultLayout.actionGuide}
            </p>
            {data.actionItems.slice(0, 3).map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px', alignItems: 'flex-start',
                fontSize: '11px', color: '#4b5563', lineHeight: '1.5',
                marginBottom: i < 2 ? '6px' : 0,
              }}>
                <span style={{
                  background: palette.primary, color: '#fff', borderRadius: '999px',
                  width: '18px', height: '18px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 700,
                }}>{i + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '14px' }}>
          <p style={{ fontSize: '9px', color: '#9ca3af', letterSpacing: '0.3px' }}>
            AIHPRO.COM · {t.resultLayout.aiPlatform}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisualResultInfographic;