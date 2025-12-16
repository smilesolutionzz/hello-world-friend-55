import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { TextToSpeechButton } from "@/components/audio/TextToSpeechButton";

interface MobileAnalysisCardProps {
  title?: string;
  analysis: string;
  isLoading?: boolean;
  onRequestAnalysis?: () => void;
  tokenCost?: number;
  showTTS?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const MobileAnalysisCard = ({
  title = "AI 전문 분석",
  analysis,
  isLoading,
  onRequestAnalysis,
  tokenCost,
  showTTS = true,
  collapsible = true,
  defaultExpanded = true
}: MobileAnalysisCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // 분석 내용을 섹션별로 파싱
  const formatAnalysis = (text: string) => {
    if (!text) return null;

    // 마크다운 스타일 파싱
    const sections = text.split(/\n\n+/);
    
    return sections.map((section, index) => {
      // 헤더 처리 (** 또는 #으로 시작)
      if (section.startsWith('**') && section.includes('**')) {
        const headerMatch = section.match(/^\*\*(.+?)\*\*/);
        if (headerMatch) {
          const headerText = headerMatch[1];
          const restText = section.replace(/^\*\*.+?\*\*\s*/, '');
          return (
            <div key={index} className="mb-3">
              <h4 className="text-xs md:text-sm font-semibold text-primary mb-1">
                {headerText}
              </h4>
              {restText && (
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {restText}
                </p>
              )}
            </div>
          );
        }
      }

      // 리스트 아이템
      if (section.includes('\n•') || section.includes('\n-') || section.match(/\n\d+\./)) {
        const lines = section.split('\n');
        return (
          <ul key={index} className="mb-3 space-y-1">
            {lines.map((line, lineIndex) => {
              const cleanLine = line.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '');
              if (!cleanLine.trim()) return null;
              return (
                <li key={lineIndex} className="text-xs md:text-sm text-muted-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                  {cleanLine}
                </li>
              );
            })}
          </ul>
        );
      }

      // 일반 텍스트
      return (
        <p key={index} className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-2">
          {section}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2 px-3 pt-3 md:px-6 md:pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              {title}
            </CardTitle>
            
            <div className="flex items-center gap-1">
              {showTTS && analysis && !isLoading && (
                <TextToSpeechButton text={analysis} />
              )}
              {collapsible && analysis && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-7 w-7 p-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-3 pb-3 md:px-6 md:pb-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">AI 분석 생성 중...</p>
            </div>
          ) : !analysis && onRequestAnalysis ? (
            <div className="text-center py-4">
              <p className="text-xs md:text-sm text-muted-foreground mb-3">
                AI 전문가 분석을 받아보세요
              </p>
              <Button 
                onClick={onRequestAnalysis}
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                분석 시작{tokenCost ? ` (${tokenCost}토큰)` : ''}
              </Button>
            </div>
          ) : (
            <motion.div
              initial={false}
              animate={{ 
                height: isExpanded ? 'auto' : '80px',
                opacity: 1 
              }}
              className={`overflow-hidden relative ${!isExpanded ? 'mask-gradient' : ''}`}
            >
              <div className="prose prose-sm max-w-none">
                {formatAnalysis(analysis)}
              </div>
              
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
