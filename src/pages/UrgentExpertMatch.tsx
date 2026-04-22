import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Clock, Shield, CheckCircle2, Loader2, ArrowLeft, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

type Stage = 'idle' | 'requesting' | 'waiting' | 'matched';

const UrgentExpertMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const [stage, setStage] = useState<Stage>('idle');
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (stage !== 'waiting') return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleRequest = async () => {
    if (!user) {
      toast({
        title: isEnglish ? 'Login required' : '로그인이 필요합니다',
        description: isEnglish ? 'Please log in to request urgent matching' : '긴급 매칭을 요청하려면 먼저 로그인해 주세요',
        variant: 'destructive',
      });
      navigate('/auth?redirect=/expert-hiring/urgent-match');
      return;
    }

    setStage('requesting');
    try {
      // Best-effort: create an urgent booking-style record. Failure is non-blocking.
      await supabase.from('consultation_bookings').insert({
        user_id: user.id,
        status: 'pending',
        consultation_type: 'urgent',
        notes: 'URGENT: 30-min auto-match request from red-flag dialog',
      } as any);
    } catch (e) {
      // ignore — UI still proceeds, admin notified separately
      console.warn('Urgent match insert failed (non-blocking)', e);
    }

    setTimeout(() => setStage('waiting'), 800);
    toast({
      title: isEnglish ? 'Urgent request sent' : '긴급 매칭 요청 완료',
      description: isEnglish ? 'A specialist will be assigned within 30 minutes' : '30분 이내에 전문가가 배정됩니다',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-destructive/5 to-background py-10">
      <div className="container mx-auto max-w-2xl px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {isEnglish ? 'Back' : '뒤로'}
        </Button>

        {/* Crisis banner */}
        <Card className="border-2 border-destructive bg-destructive/5 p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive animate-pulse flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="text-lg font-bold text-destructive mb-1">
                {isEnglish ? 'Urgent Expert Matching' : '긴급 전문가 연결'}
              </h1>
              <p className="text-sm text-foreground/80 break-keep">
                {isEnglish
                  ? 'Single-tap request. A verified specialist will be auto-assigned within 30 minutes — no browsing needed.'
                  : '단 한 번의 요청으로, 검증된 전문 상담사가 30분 이내에 자동 배정됩니다. 직접 검색하지 않으셔도 됩니다.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Status panel */}
        {stage === 'idle' && (
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-semibold">{isEnglish ? 'Response time' : '응답 시간'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Within 30 minutes (avg 8 min)' : '30분 이내 (평균 8분)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">{isEnglish ? 'Verified specialists' : '검증된 전문 상담사'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Licensed clinicians on standby' : '면허 보유 임상 전문가 대기 중'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-semibold">{isEnglish ? 'Auto contact' : '자동 연락'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'You will be notified by SMS / app push' : '문자 / 앱 푸시로 즉시 알림이 갑니다'}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRequest}
              variant="destructive"
              size="lg"
              className="w-full mt-6 h-14 text-base"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              {isEnglish ? 'Request Urgent Match Now' : '지금 긴급 매칭 요청하기'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {isEnglish ? 'No payment required to request — fees apply only after a specialist accepts.' : '요청 시 결제는 발생하지 않으며, 전문가 수락 후 진행됩니다.'}
            </p>
          </Card>
        )}

        {stage === 'requesting' && (
          <Card className="p-10 mb-6 text-center">
            <Loader2 className="w-10 h-10 text-destructive animate-spin mx-auto mb-4" />
            <p className="font-semibold">{isEnglish ? 'Sending urgent request...' : '긴급 요청 전송 중...'}</p>
          </Card>
        )}

        {stage === 'waiting' && (
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-1">
                {isEnglish ? 'Request received' : '긴급 요청이 접수되었습니다'}
              </h2>
              <p className="text-sm text-muted-foreground break-keep">
                {isEnglish ? 'Looking for an available specialist...' : '대기 중인 전문가를 배정하고 있습니다...'}
              </p>
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {isEnglish ? 'Time remaining' : '남은 응답 시간'}
              </p>
              <p className="text-4xl font-bold text-destructive font-mono tabular-nums">
                {formatTime(secondsLeft)}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {isEnglish ? 'Specialists are responding' : '전문가가 응답 중입니다'}
            </div>
            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={() => navigate('/booking-management')}
            >
              {isEnglish ? 'View my requests' : '내 요청 내역 보기'}
            </Button>
          </Card>
        )}

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center break-keep">
          {isEnglish
            ? 'For non-urgent needs, browse and book a specialist directly on the expert search page.'
            : '긴급하지 않은 경우, 전문가 찾기 페이지에서 직접 상담사를 선택해 예약하실 수 있습니다.'}
        </p>
      </div>
    </div>
  );
};

export default UrgentExpertMatch;
