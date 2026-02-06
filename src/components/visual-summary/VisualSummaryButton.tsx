import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useVisualSummary } from '@/hooks/useVisualSummary';
import VisualSummaryCard from './VisualSummaryCard';

interface VisualSummaryButtonProps {
  type: 'counseling' | 'assessment';
  content: string | Record<string, any>;
  therapistType?: string;
  testType?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  label?: string;
}

const VisualSummaryButton = ({
  type,
  content,
  therapistType,
  testType,
  variant = 'outline',
  size = 'sm',
  className = '',
  label = '비주얼 노트 만들기',
}: VisualSummaryButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { generate, isGenerating, result, reset } = useVisualSummary();

  const handleGenerate = async () => {
    setIsOpen(true);
    if (!result) {
      await generate({ type, content, therapistType, testType });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Don't reset - keep result for re-viewing
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`gap-2 ${className}`}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
        {isGenerating ? '생성 중...' : label}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🎨 비주얼 노트
            </DialogTitle>
          </DialogHeader>
          
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
              <p className="text-sm text-muted-foreground">AI가 비주얼 노트를 만들고 있어요...</p>
              <p className="text-xs text-muted-foreground">배경 일러스트까지 약 10-20초 소요</p>
            </div>
          )}

          {result && !isGenerating && (
            <VisualSummaryCard
              data={result.summary}
              backgroundImage={result.backgroundImage}
              onClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VisualSummaryButton;
