import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportBannerProps {
  onDismiss?: () => void;
}

const ReportBanner: React.FC<ReportBannerProps> = ({ onDismiss }) => {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                전문가급 리포트가 기다리고 있어요
              </h3>
              <p className="text-xs text-muted-foreground">
                차트, PDF 다운로드, 전문가 코멘트까지 한번에!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="h-8 px-3 text-xs"
              aria-label="구독 플랜 보기"
            >
              <Crown className="w-3 h-3 mr-1" />
              업그레이드
            </Button>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 w-8 p-0"
                aria-label="배너 닫기"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportBanner;