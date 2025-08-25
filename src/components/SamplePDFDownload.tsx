import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download,
  Sparkles
} from "lucide-react";

export function SamplePDFDownload() {
  const handleDownload = () => {
    const googleDriveUrl = "https://drive.google.com/file/d/17WD3mhW2T4TdkfxTzLpfH5bzFARxz_Vh/view?usp=drive_link";
    window.open(googleDriveUrl, '_blank');
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary-glow/10 border-primary/20">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">샘플 리포트 미리보기</h3>
          <p className="text-sm text-muted-foreground mb-3">
            AIH 전문가 종합 리포팅의 실제 샘플을 확인해보세요
          </p>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-700 font-medium">무료 다운로드</span>
          </div>
        </div>
        <Button 
          onClick={handleDownload}
          className="font-medium"
        >
          <Download className="w-4 h-4 mr-2" />
          샘플 다운로드
        </Button>
      </div>
    </Card>
  );
}