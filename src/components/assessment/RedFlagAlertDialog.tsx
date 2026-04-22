import React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RedFlagResult } from '@/utils/redFlagDetection';
import { useLanguage } from '@/i18n';

interface RedFlagAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  redFlagResult: RedFlagResult;
}

const RedFlagAlertDialog = ({ isOpen, onClose, redFlagResult }: RedFlagAlertDialogProps) => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const isCritical = redFlagResult.overallSeverity === 'critical';

  const handleConsultation = () => { onClose(); navigate('/expert-hiring'); };
  const handleEmergencyMatch = () => { onClose(); navigate('/expert-hiring/urgent-match'); };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={`max-w-md ${isCritical ? 'border-destructive border-2' : 'border-orange-500 border-2'}`}>
        <AlertDialogHeader>
          <AlertDialogTitle className={`flex items-center gap-2 ${isCritical ? 'text-destructive' : 'text-orange-600'}`}>
            <AlertTriangle className={`w-6 h-6 ${isCritical ? 'animate-pulse' : ''}`} />
            {isCritical
              ? (isEnglish ? '⚠️ Immediate professional help is needed' : '⚠️ 즉각적인 전문 상담이 필요합니다')
              : (isEnglish ? '⚠️ Professional consultation recommended' : '⚠️ 전문가 상담을 권장합니다')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-foreground font-medium">
                {isEnglish ? 'Important signals were detected in your results:' : '검사 결과에서 다음과 같은 중요한 신호가 감지되었습니다:'}
              </p>
              <div className="space-y-2">
                {redFlagResult.flags.map((flag, index) => (
                  <div key={index} className={`p-3 rounded-lg ${flag.severity === 'critical' ? 'bg-destructive/10 border border-destructive/30' : 'bg-orange-50 border border-orange-200'}`}>
                    <p className={`font-semibold text-sm ${flag.severity === 'critical' ? 'text-destructive' : 'text-orange-700'}`}>{flag.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                  </div>
                ))}
              </div>
              {isCritical && (
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
                  <p className="text-sm font-medium text-destructive mb-2">
                    {isEnglish ? '🚨 Immediate Expert Support Available' : '🚨 즉시 전문가 지원 가능'}
                  </p>
                  <div className="space-y-1 text-sm">
                    {isEnglish ? (
                      <>
                        <p>• <strong>Urgent expert matching</strong> available within 30 minutes</p>
                        <p>• Connect with a licensed professional through our platform</p>
                      </>
                    ) : (
                      <>
                        <p>• 플랫폼 내 <strong>긴급 전문가 매칭</strong> 30분 이내 가능</p>
                        <p>• 검증된 전문 상담사와 즉시 연결됩니다</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'Test results alone cannot provide a diagnosis. We recommend consulting a professional for an accurate assessment.'
                  : '검사 결과만으로 진단을 내리기는 어렵습니다. 정확한 평가를 위해 전문가와 상담하시기를 권장드립니다.'}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          {isCritical && (
            <div className="w-full">
              <Button onClick={handleEmergencyMatch} variant="destructive" className="w-full">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {isEnglish ? 'Urgent Expert Match' : '긴급 전문가 연결'}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-1">
                {isEnglish ? 'Auto-assigned within 30 min · single-tap request' : '30분 이내 자동 배정 · 검색 없이 1회 요청'}
              </p>
            </div>
          )}
          <div className="w-full">
            <Button onClick={handleConsultation} className={`w-full ${isCritical ? 'bg-orange-600 hover:bg-orange-700' : 'bg-primary'}`}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {isEnglish ? 'Request Professional Consultation' : '전문가 상담 신청하기'}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-1">
              {isEnglish ? 'Browse & choose your specialist' : '전문가 목록에서 직접 선택해 예약'}
            </p>
          </div>
          <AlertDialogCancel className="w-full mt-0">
            {isEnglish ? 'Later' : '나중에 하기'}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RedFlagAlertDialog;
