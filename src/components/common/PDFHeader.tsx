import React from 'react';
import { Globe } from 'lucide-react';

interface PDFHeaderProps {
  testName: string;
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ testName }) => {
  return (
    <div className="mb-6 pb-4 border-b-2 border-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{testName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Globe className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-primary">aihpro.com</span>
          </div>
          <p className="text-xs text-muted-foreground">AI 심리 분석 전문 플랫폼</p>
        </div>
      </div>
    </div>
  );
};
