import { useRef, useState } from 'react';
import { Download, Share2, LayoutGrid, Image as ImageIcon } from 'lucide-react';
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
  infographicImage?: string | null;
  backgroundImage?: string | null;
  onClose?: () => void;
}

const colorThemes = {
  violet: {
    bg: 'from-violet-50 to-purple-50',
    accent: 'bg-violet-600',
    accentLight: 'bg-violet-100 text-violet-800',
    border: 'border-violet-200',
    highlight: 'text-violet-700',
    sectionBg: 'bg-white/80',
    centerBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  blue: {
    bg: 'from-blue-50 to-cyan-50',
    accent: 'bg-blue-600',
    accentLight: 'bg-blue-100 text-blue-800',
    border: 'border-blue-200',
    highlight: 'text-blue-700',
    sectionBg: 'bg-white/80',
    centerBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  green: {
    bg: 'from-green-50 to-emerald-50',
    accent: 'bg-green-600',
    accentLight: 'bg-green-100 text-green-800',
    border: 'border-green-200',
    highlight: 'text-green-700',
    sectionBg: 'bg-white/80',
    centerBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
  },
  amber: {
    bg: 'from-amber-50 to-yellow-50',
    accent: 'bg-amber-600',
    accentLight: 'bg-amber-100 text-amber-800',
    border: 'border-amber-200',
    highlight: 'text-amber-700',
    sectionBg: 'bg-white/80',
    centerBg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
  },
  rose: {
    bg: 'from-rose-50 to-pink-50',
    accent: 'bg-rose-600',
    accentLight: 'bg-rose-100 text-rose-800',
    border: 'border-rose-200',
    highlight: 'text-rose-700',
    sectionBg: 'bg-white/80',
    centerBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
  },
};

const VisualSummaryCard = ({ data, infographicImage, backgroundImage, onClose }: VisualSummaryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const theme = colorThemes[data.moodColor] || colorThemes.violet;
  const [viewMode, setViewMode] = useState<'infographic' | 'card'>(infographicImage ? 'infographic' : 'card');

  const downloadInfographic = () => {
    if (!infographicImage) return;
    const link = document.createElement('a');
    link.download = `visual-note-${Date.now()}.png`;
    link.href = infographicImage;
    link.click();
    toast({ title: '이미지 저장 완료', description: '갤러리에서 확인하세요!' });
  };

  const downloadCard = async () => {
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
      toast({ title: '이미지 저장 완료', description: '갤러리에서 확인하세요!' });
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: '저장 실패', description: '다시 시도해주세요.', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    if (viewMode === 'infographic' && infographicImage) {
      downloadInfographic();
    } else {
      downloadCard();
    }
  };

  const shareImage = async () => {
    if (viewMode === 'infographic' && infographicImage) {
      try {
        const res = await fetch(infographicImage);
        const blob = await res.blob();
        const file = new File([blob], 'visual-note.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: data.title });
          return;
        }
      } catch { /* fallback */ }
    }
    handleDownload();
  };

  const topSections = data.sections.slice(0, Math.ceil(data.sections.length / 2));
  const bottomSections = data.sections.slice(Math.ceil(data.sections.length / 2));

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {infographicImage && (
            <>
              <Button
                variant={viewMode === 'infographic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('infographic')}
                className="gap-1.5 text-xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                인포그래픽
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="gap-1.5 text-xs"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                카드뷰
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            저장
          </Button>
          <Button variant="outline" size="sm" onClick={shareImage} className="gap-2">
            <Share2 className="w-4 h-4" />
            공유
          </Button>
        </div>
      </div>

      {/* Infographic view */}
      {viewMode === 'infographic' && infographicImage ? (
        <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
          <img 
            src={infographicImage} 
            alt={data.title}
            className="w-full h-auto"
            crossOrigin="anonymous"
          />
          <div className="bg-muted/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">🐘 코끼리 AI · 마음건강 파트너</p>
          </div>
        </div>
      ) : (
        /* Card view (fallback / alternative) */
        <div
          ref={cardRef}
          className={`relative bg-gradient-to-br ${theme.bg} rounded-2xl overflow-hidden`}
          style={{ minHeight: '600px', padding: '32px' }}
        >
          {backgroundImage && (
            <div className="absolute inset-0 opacity-10">
              <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{data.title}</h2>
              <p className="text-sm text-gray-500">{data.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {topSections.map((section, i) => (
                <div key={i} className={`${theme.sectionBg} backdrop-blur-sm rounded-xl p-4 ${theme.border} border shadow-sm`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{section.icon}</span>
                    <h3 className="font-bold text-gray-800 text-sm">{section.title}</h3>
                  </div>
                  <ul className="space-y-1">
                    {section.points.map((point, j) => (
                      <li key={j} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {section.highlight && (
                    <p className={`mt-2 text-xs font-bold ${theme.highlight} bg-white/50 rounded-lg px-2 py-1`}>
                      💡 {section.highlight}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center mb-4">
              <div className={`${theme.centerBg} text-white rounded-full px-6 py-3 shadow-lg`}>
                <p className="text-lg font-bold text-center">🎯 {data.centerTheme}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {bottomSections.map((section, i) => (
                <div key={i} className={`${theme.sectionBg} backdrop-blur-sm rounded-xl p-4 ${theme.border} border shadow-sm`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{section.icon}</span>
                    <h3 className="font-bold text-gray-800 text-sm">{section.title}</h3>
                  </div>
                  <ul className="space-y-1">
                    {section.points.map((point, j) => (
                      <li key={j} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {section.highlight && (
                    <p className={`mt-2 text-xs font-bold ${theme.highlight} bg-white/50 rounded-lg px-2 py-1`}>
                      💡 {section.highlight}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className={`${theme.accentLight} rounded-xl p-4 mb-4 text-center`}>
              <p className="font-bold text-sm">✨ 핵심 인사이트</p>
              <p className="text-sm mt-1">{data.keyInsight}</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <p className="font-bold text-sm text-gray-800 mb-2">📋 실천 항목</p>
              <div className="space-y-1">
                {data.actionItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className={`${theme.accent} text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[10px] font-bold`}>
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-[10px] text-gray-400">🐘 코끼리 AI · 마음건강 파트너</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSummaryCard;