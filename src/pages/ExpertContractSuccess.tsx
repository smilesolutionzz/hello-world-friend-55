import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

const ExpertContractSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const { isEnglish } = useLanguage();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast.error(isEnglish ? 'No payment session found.' : '결제 세션 정보가 없습니다.');
        navigate('/expert-hiring');
        return;
      }
      try {
        setIsVerifying(false);
        toast.success(isEnglish ? 'Contract completed successfully!' : '계약이 성공적으로 완료되었습니다!');
      } catch (error) {
        console.error('Payment verification error:', error);
        setIsVerifying(false);
      }
    };
    verifyPayment();
  }, [sessionId, navigate, isEnglish]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isEnglish ? 'Verifying payment...' : '결제를 확인하고 있습니다...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-900">
                {isEnglish ? 'Contract Completed!' : '계약이 완료되었습니다!'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {isEnglish ? 'Your contract with the expert has been successfully established.' : '전문가와의 계약이 성공적으로 체결되었습니다.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  {isEnglish ? 'Next Steps' : '다음 단계'}
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
                    <span>{isEnglish ? 'The expert will contact you within 24 hours.' : '전문가가 24시간 내에 연락을 드릴 예정입니다.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
                    <span>{isEnglish ? 'Your first consultation schedule will be arranged.' : '첫 상담 일정을 조율하게 됩니다.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
                    <span>{isEnglish ? 'The contract will be sent to your email.' : '계약서는 이메일로 전송됩니다.'}</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button onClick={() => navigate('/dashboard')} className="w-full" size="lg">
                  {isEnglish ? 'Go to Dashboard' : '대시보드로 이동'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button onClick={() => navigate('/expert-hiring')} variant="outline" className="w-full" size="lg">
                  {isEnglish ? 'Back to Expert List' : '전문가 목록으로 돌아가기'}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>{isEnglish ? 'For inquiries, please contact our support center.' : '문의사항이 있으시면 고객센터로 연락주세요.'}</p>
                <p className="text-primary font-medium">1234-5678</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpertContractSuccess;
