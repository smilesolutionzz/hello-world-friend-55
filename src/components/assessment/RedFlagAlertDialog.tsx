import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RedFlagResult } from '@/utils/redFlagDetection';

interface RedFlagAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  redFlagResult: RedFlagResult;
}

const RedFlagAlertDialog = ({ isOpen, onClose, redFlagResult }: RedFlagAlertDialogProps) => {
  const navigate = useNavigate();
  const isCritical = redFlagResult.overallSeverity === 'critical';

  const handleConsultation = () => {
    onClose();
    navigate('/expert-hiring');
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:1577-0199';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={`max-w-md ${isCritical ? 'border-destructive border-2' : 'border-orange-500 border-2'}`}>
        <AlertDialogHeader>
          <AlertDialogTitle className={`flex items-center gap-2 ${isCritical ? 'text-destructive' : 'text-orange-600'}`}>
            <AlertTriangle className={`w-6 h-6 ${isCritical ? 'animate-pulse' : ''}`} />
            {isCritical ? '⚠️ 즉각적인 전문 상담이 필요합니다' : '⚠️ 전문가 상담을 권장합니다'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-foreground font-medium">
                검사 결과에서 다음과 같은 중요한 신호가 감지되었습니다:
              </p>
              
              <div className="space-y-2">
                {redFlagResult.flags.map((flag, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg ${
                      flag.severity === 'critical' 
                        ? 'bg-destructive/10 border border-destructive/30' 
                        : 'bg-orange-50 border border-orange-200'
                    }`}
                  >
                    <p className={`font-semibold text-sm ${
                      flag.severity === 'critical' ? 'text-destructive' : 'text-orange-700'
                    }`}>
                      {flag.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {flag.description}
                    </p>
                  </div>
                ))}
              </div>

              {isCritical && (
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
                  <p className="text-sm font-medium text-destructive mb-2">
                    🚨 긴급 연락처
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>• 정신건강 위기상담: <strong>1577-0199</strong> (24시간)</p>
                    <p>• 자살예방 상담전화: <strong>1393</strong></p>
                    <p>• 생명의전화: <strong>1588-9191</strong></p>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                검사 결과만으로 진단을 내리기는 어렵습니다. 
                정확한 평가를 위해 전문가와 상담하시기를 권장드립니다.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          {isCritical && (
            <Button 
              onClick={handleEmergencyCall}
              variant="destructive"
              className="w-full"
            >
              <Phone className="w-4 h-4 mr-2" />
              긴급 상담 전화 (1577-0199)
            </Button>
          )}
          <Button 
            onClick={handleConsultation}
            className={`w-full ${isCritical ? 'bg-orange-600 hover:bg-orange-700' : 'bg-primary'}`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            전문가 상담 신청하기
          </Button>
          <AlertDialogCancel className="w-full mt-0">
            나중에 하기
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RedFlagAlertDialog;
