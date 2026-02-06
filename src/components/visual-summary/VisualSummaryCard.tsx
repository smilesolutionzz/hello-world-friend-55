import { useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

export interface VisualSummaryData {
  title: string;
  subtitle: string;
  centerTheme: string;
  sections: {
    title: string;
    icon: string;
    points: string[];
    highlight?: string;
  }[];
  keyInsight: string;
  actionItems: string[];
  moodColor: 'violet' | 'blue' | 'green' | 'amber' | 'rose';
}

interface VisualSummaryCardProps {
  data: VisualSummaryData;
  illustrationImage?: string | null;
  infographicImage?: string | null;
  backgroundImage?: string | null;
  onClose?: () => void;
}

const moodPalettes: Record<string, { primary: string; secondary: string; accent: string; bg: string; sectionBg: string; border: string; centerBg: string; centerText: string; insightBg: string; insightText: string; actionAccent: string }> = {
  violet: {
    primary: '#6D28D9', secondary: '#8B5CF6', accent: '#A78BFA',
    bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f5f3ff 100%)',
    sectionBg: 'rgba(255,255,255,0.85)', border: '#c4b5fd',
    centerBg: 'linear-gradient(135deg, #7C3AED, #6D28D9)', centerText: '#fff',
    insightBg: '#ede9fe', insightText: '#5B21B6',
    actionAccent: '#7C3AED',
  },
  blue: {
    primary: '#2563EB', secondary: '#3B82F6', accent: '#60A5FA',
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)',
    sectionBg: 'rgba(255,255,255,0.85)', border: '#93c5fd',
    centerBg: 'linear-gradient(135deg, #3B82F6, #2563EB)', centerText: '#fff',
    insightBg: '#dbeafe', insightText: '#1E40AF',
    actionAccent: '#3B82F6',
  },
  green: {
    primary: '#059669', secondary: '#10B981', accent: '#34D399',
    bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #ecfdf5 100%)',
    sectionBg: 'rgba(255,255,255,0.85)', border: '#6ee7b7',
    centerBg: 'linear-gradient(135deg, #10B981, #059669)', centerText: '#fff',
    insightBg: '#d1fae5', insightText: '#065F46',
    actionAccent: '#10B981',
  },
  amber: {
    primary: '#D97706', secondary: '#F59E0B', accent: '#FBBF24',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%)',
    sectionBg: 'rgba(255,255,255,0.85)', border: '#fcd34d',
    centerBg: 'linear-gradient(135deg, #F59E0B, #D97706)', centerText: '#fff',
    insightBg: '#fef3c7', insightText: '#92400E',
    actionAccent: '#F59E0B',
  },
  rose: {
    primary: '#E11D48', secondary: '#F43F5E', accent: '#FB7185',
    bg: 'linear-gradient(135deg, #fff1f2 0%, #fce7f3 50%, #fff1f2 100%)',
    sectionBg: 'rgba(255,255,255,0.85)', border: '#fda4af',
    centerBg: 'linear-gradient(135deg, #F43F5E, #E11D48)', centerText: '#fff',
    insightBg: '#fce7f3', insightText: '#9F1239',
    actionAccent: '#F43F5E',
  },
};

const VisualSummaryCard = ({ data, illustrationImage, infographicImage, backgroundImage, onClose }: VisualSummaryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const palette = moodPalettes[data.moodColor] || moodPalettes.violet;

  // Use illustration image (new hybrid), or fall back to infographic/background
  const bgImage = illustrationImage || infographicImage || backgroundImage;

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `visual-note-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: '이미지 저장 완료 ✅', description: '갤러리에서 확인하세요!' });
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: '저장 실패', description: '다시 시도해주세요.', variant: 'destructive' });
    }
  };

  const shareImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'visual-note.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: data.title });
        } else {
          downloadImage();
        }
      });
    } catch {
      downloadImage();
    }
  };

  const topSections = data.sections.slice(0, Math.ceil(data.sections.length / 2));
  const bottomSections = data.sections.slice(Math.ceil(data.sections.length / 2));

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={downloadImage} className="gap-2">
          <Download className="w-4 h-4" />
          저장
        </Button>
        <Button variant="outline" size="sm" onClick={shareImage} className="gap-2">
          <Share2 className="w-4 h-4" />
          공유
        </Button>
      </div>

      {/* Hybrid infographic: illustration bg + HTML text overlay */}
      <div
        ref={cardRef}
        style={{
          background: palette.bg,
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          padding: '32px',
          minHeight: '700px',
          fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
        }}
      >
        {/* Illustration background */}
        {bgImage && (
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            zIndex: 0,
          }}>
            <img
              src={bgImage}
              alt=""
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Decorative corner doodles */}
        <div style={{ position: 'absolute', top: 8, left: 12, fontSize: '20px', opacity: 0.4, zIndex: 1 }}>✿</div>
        <div style={{ position: 'absolute', top: 8, right: 12, fontSize: '20px', opacity: 0.4, zIndex: 1 }}>🦋</div>
        <div style={{ position: 'absolute', bottom: 8, left: 12, fontSize: '20px', opacity: 0.4, zIndex: 1 }}>🌿</div>
        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: '20px', opacity: 0.4, zIndex: 1 }}>💫</div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 800,
              color: palette.primary,
              marginBottom: '4px',
              letterSpacing: '-0.5px',
            }}>
              {data.title}
            </h2>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>{data.subtitle}</p>
          </div>

          {/* Top sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: topSections.length > 1 ? '1fr 1fr' : '1fr',
            gap: '12px',
            marginBottom: '16px',
          }}>
            {topSections.map((section, i) => (
              <div key={i} style={{
                background: palette.sectionBg,
                borderRadius: '12px',
                padding: '16px',
                border: `1.5px solid ${palette.border}`,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{section.icon}</span>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>{section.title}</h3>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {section.points.map((point, j) => (
                    <li key={j} style={{
                      fontSize: '12px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                    }}>
                      <span style={{ color: palette.accent, flexShrink: 0, marginTop: '2px' }}>•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {section.highlight && (
                  <p style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: palette.primary,
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                  }}>
                    💡 {section.highlight}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Center theme cloud */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              background: palette.centerBg,
              color: palette.centerText,
              borderRadius: '9999px',
              padding: '14px 32px',
              boxShadow: `0 4px 20px ${palette.accent}50`,
              position: 'relative',
            }}>
              <p style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', margin: 0 }}>
                🎯 {data.centerTheme}
              </p>
            </div>
          </div>

          {/* Connecting arrows */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0', opacity: 0.3 }}>
            <span style={{ fontSize: '24px', color: palette.primary }}>⬇</span>
          </div>

          {/* Bottom sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: bottomSections.length > 1 ? '1fr 1fr' : '1fr',
            gap: '12px',
            marginBottom: '16px',
            marginTop: '8px',
          }}>
            {bottomSections.map((section, i) => (
              <div key={i} style={{
                background: palette.sectionBg,
                borderRadius: '12px',
                padding: '16px',
                border: `1.5px solid ${palette.border}`,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{section.icon}</span>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>{section.title}</h3>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {section.points.map((point, j) => (
                    <li key={j} style={{
                      fontSize: '12px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                    }}>
                      <span style={{ color: palette.accent, flexShrink: 0, marginTop: '2px' }}>•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {section.highlight && (
                  <p style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: palette.primary,
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                  }}>
                    💡 {section.highlight}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Key Insight */}
          <div style={{
            background: palette.insightBg,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            textAlign: 'center',
            border: `1px solid ${palette.border}`,
          }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: palette.insightText, margin: 0 }}>
              ✨ 핵심 인사이트
            </p>
            <p style={{ fontSize: '13px', color: palette.insightText, marginTop: '6px', lineHeight: '1.5' }}>
              {data.keyInsight}
            </p>
          </div>

          {/* Action Items */}
          <div style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e5e7eb',
            backdropFilter: 'blur(4px)',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#1f2937', margin: '0 0 8px 0' }}>
              📋 실천 항목
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.actionItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#374151',
                }}>
                  <span style={{
                    background: palette.actionAccent,
                    color: '#fff',
                    borderRadius: '9999px',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '10px',
                    fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ lineHeight: '1.5' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p style={{ fontSize: '10px', color: '#9ca3af' }}>🐘 코끼리 AI · 마음건강 파트너</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualSummaryCard;