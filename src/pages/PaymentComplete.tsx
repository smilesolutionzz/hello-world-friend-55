import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Home, Crown, Zap, FileText, CalendarCheck, Sparkles } from 'lucide-react';
import { waitForCompletedEnrollment } from '@/lib/mindTrackEnrollment';
import { trackEvent } from '@/components/common/Analytics';

const PaymentComplete = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [mindTrackStage, setMindTrackStage] = useState<'idle' | 'verifying' | 'creating' | 'ready' | 'failed'>('idle');

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const status = searchParams.get('status');
  const productType = searchParams.get('type');
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  useEffect(() => {
    const confirmPayment = async () => {
      if (status === 'fail') {
        trackEvent('payment_failed', {
          stage: 'toss_redirect',
          product_type: productType,
          error_code: errorCode,
          error_message: errorMessage,
        });
        setLoading(false);
        setSuccess(false);
        return;
      }

      if (!paymentKey || !orderId || !amount) {
        setLoading(false);
        setSuccess(false);
        return;
      }

      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          toast({ title: '로그인 필요', description: '로그인 후 다시 시도해주세요.', variant: 'destructive' });
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase.functions.invoke('unified-payment', {
          headers: { Authorization: `Bearer ${session.session.access_token}` },
          body: { action: 'confirm-payment', paymentKey, orderId, amount: parseInt(amount) }
        });

        if (error || !data?.success) {
          throw new Error(data?.error || error?.message || '결제 확인에 실패했습니다.');
        }

        setSuccess(true);
        setPaymentInfo(data);

        trackEvent('payment_completed', {
          product_type: data.productType || productType,
          amount: parseInt(amount || '0'),
          order_id: orderId,
        });

        // Handle consultation booking creation after successful payment
        if (productType === 'consultation') {
          await createConsultationBooking(session.session.access_token);
        }

        toast({ title: '🎉 결제 완료!', description: getSuccessMessage(productType === 'consultation' ? 'consultation' : data.productType) });

        // Mind Track: poll the enrollment row instead of a fixed 1.5s timer.
        if (productType === 'mind_track' || data.productType === 'mind_track') {
          setMindTrackStage('verifying');
          setTimeout(() => setMindTrackStage('creating'), 600);
          const result = await waitForCompletedEnrollment(15_000, 800);
          if (result?.id) {
            setMindTrackStage('ready');
            const target = result.hasBaseline
              ? '/mind-track/start?welcome=1&seeded=1'
              : '/mind-track/start?welcome=1';
            setTimeout(() => navigate(target), 700);
          } else {
            setMindTrackStage('failed');
          }
        }
      } catch (err: any) {
        console.error('Payment confirmation error:', err);
        setSuccess(false);
        trackEvent('payment_failed', {
          stage: 'confirm',
          product_type: productType,
          error: err.message,
        });
        toast({ title: '결제 확인 실패', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, status, navigate, toast]);

  const createConsultationBooking = async (accessToken: string) => {
    try {
      const pendingBookingStr = sessionStorage.getItem('pendingBooking');
      if (!pendingBookingStr) return;
      
      const pendingBooking = JSON.parse(pendingBookingStr);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startTime = pendingBooking.startTime;
      const [hours, minutes] = startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + (minutes || 0) + pendingBooking.durationMinutes;
      const endHour = Math.floor(totalMinutes / 60) % 24;
      const endMinute = totalMinutes % 60;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;

      const { error: bookingError } = await supabase
        .from('consultation_bookings')
        .insert({
          user_id: user.id,
          expert_id: pendingBooking.expertId,
          booking_date: pendingBooking.bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: pendingBooking.durationMinutes,
          tokens_paid: 0,
          notes: pendingBooking.notes || null,
          status: 'confirmed',
          meeting_platform: 'video'
        });

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
      }

      sessionStorage.removeItem('pendingBooking');
    } catch (err) {
      console.error('Failed to create consultation booking:', err);
    }
  };

  const getSuccessMessage = (type: string) => {
    switch (type) {
      case 'subscription': return '프리미엄 구독이 활성화되었습니다! 모든 기능을 무제한으로 이용하세요.';
      case 'single': return '리포트 이용권 1회가 추가되었습니다.';
      case 'single_test': return '검사 이용권 1회가 추가되었습니다. 바로 검사를 시작해보세요!';
      case 'single_report': return '리포트 이용권 1회가 추가되었습니다.';
      case 'consultation': return '상담 예약이 확정되었습니다! 전문가가 확인 후 연락드립니다.';
      case 'mind_track': return '30일 마음 변화 트랙이 시작되었습니다! 잠시 후 초기 진단으로 이동합니다.';
      case 'pass': return '프리미엄 패스가 활성화되었습니다.';
      case 'cash': return '캐시가 충전되었습니다.';
      default: return '결제가 완료되었습니다.';
    }
  };

  const resolvedType = paymentInfo?.productType || productType;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <Card className="p-8 text-center max-w-md mx-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">결제 확인 중...</h2>
          <p className="text-muted-foreground">잠시만 기다려주세요.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="p-8 text-center max-w-md w-full">
        {success ? (
          <>
            <div className="mb-6 flex justify-center">
              {resolvedType === 'subscription' ? (
                <Crown className="w-16 h-16 text-primary" />
              ) : resolvedType === 'single' || resolvedType === 'single_test' || resolvedType === 'single_report' ? (
                <FileText className="w-16 h-16 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              {resolvedType === 'subscription' ? '🎉 구독 시작!' : resolvedType === 'consultation' ? '상담 예약 완료!' : (resolvedType === 'single' || resolvedType === 'single_test' || resolvedType === 'single_report') ? '이용권 구매 완료!' : '결제 완료!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {getSuccessMessage(resolvedType)}
            </p>

            {paymentInfo?.paymentResult && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">주문번호</span>
                  <span className="font-medium">{orderId?.slice(-12)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">결제금액</span>
                  <span className="font-bold text-primary">₩{parseInt(amount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제수단</span>
                  <span>{paymentInfo.paymentResult.method || '카드'}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {resolvedType === 'subscription' && (
                <Button className="w-full" onClick={() => navigate('/assessment')}>
                  <Crown className="w-4 h-4 mr-2" />
                  검사 시작하기
                </Button>
              )}
              {(resolvedType === 'single' || resolvedType === 'single_test' || resolvedType === 'single_report') && (
                <Button className="w-full" onClick={() => navigate('/assessment')}>
                  <FileText className="w-4 h-4 mr-2" />
                  이용권으로 검사하기
                </Button>
              )}
              {resolvedType === 'consultation' && (
                <Button className="w-full" onClick={() => navigate('/booking-management')}>
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  예약 내역 확인
                </Button>
              )}
              {resolvedType === 'mind_track' && mindTrackStage !== 'idle' && mindTrackStage !== 'failed' && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {mindTrackStage === 'ready'
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    <span className={mindTrackStage === 'verifying' ? 'font-semibold' : 'text-muted-foreground'}>
                      결제 검증 중
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {mindTrackStage === 'ready'
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : mindTrackStage === 'creating'
                      ? <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      : <span className="w-4 h-4 rounded-full border border-muted-foreground/30 inline-block" />}
                    <span className={mindTrackStage === 'creating' ? 'font-semibold' : 'text-muted-foreground'}>
                      30일 트랙 생성 중
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {mindTrackStage === 'ready'
                      ? <Sparkles className="w-4 h-4 text-emerald-500" />
                      : <span className="w-4 h-4 rounded-full border border-muted-foreground/30 inline-block" />}
                    <span className={mindTrackStage === 'ready' ? 'font-semibold' : 'text-muted-foreground'}>
                      준비 완료 → 이동 중
                    </span>
                  </div>
                </div>
              )}
              {resolvedType === 'mind_track' && mindTrackStage === 'failed' && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-900">
                  결제는 완료됐지만 트랙 생성 확인이 늦어지고 있어요. 아래 버튼으로 직접 시작해주세요.
                </div>
              )}
              {resolvedType === 'mind_track' && (
                <Button className="w-full" onClick={() => navigate('/mind-track/start?welcome=1')}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {mindTrackStage === 'ready' ? '바로 시작하기' : '초기 진단으로 이동'}
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <XCircle className="w-16 h-16 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">결제 실패</h2>
            <p className="text-muted-foreground mb-4">
              {errorMessage ? decodeURIComponent(errorMessage) : '결제 처리 중 문제가 발생했습니다.'}
            </p>
            {errorCode && <p className="text-xs text-muted-foreground/60 mb-6">오류 코드: {errorCode}</p>}
            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate('/pricing')}>다시 시도</Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />홈으로
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentComplete;
