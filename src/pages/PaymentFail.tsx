import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  XCircle,
  RefreshCw,
  Home,
  MessageCircle,
  CreditCard,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { mapPaymentError, RETRY_BACKOFF_MS, MAX_AUTO_RETRIES } from '@/lib/paymentErrorMessages';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = decodeURIComponent(searchParams.get('message') || '결제가 취소되었거나 실패했어요.');
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const isMindTrack = type === 'mind_track';

  const info = mapPaymentError(code || message);
  const guide = { title: info.title, tip: info.description };

  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [autoRetryIn, setAutoRetryIn] = useState<number | null>(null);

  const handleRetry = () => {
    if (isMindTrack) navigate('/mind-track?retry=1');
    else navigate('/pricing');
  };

  // 일시적 오류는 자동 재시도 카운트다운 노출
  useEffect(() => {
    if (!info.transient || autoRetryCount >= MAX_AUTO_RETRIES) return;
    const delay = RETRY_BACKOFF_MS[autoRetryCount] ?? 10000;
    setAutoRetryIn(Math.ceil(delay / 1000));
    const tick = setInterval(() => {
      setAutoRetryIn((s) => (s && s > 1 ? s - 1 : 0));
    }, 1000);
    const timer = setTimeout(() => {
      setAutoRetryCount((c) => c + 1);
      handleRetry();
    }, delay);
    return () => {
      clearInterval(tick);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.transient, autoRetryCount]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="max-w-md w-full bg-white rounded-3xl border-slate-200/70">
        <CardContent className="p-7">
          {/* 헤더 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <Badge className="bg-slate-100 text-slate-600 border-0 mb-2 text-[10px] font-bold tracking-wider">
              PAYMENT NOT COMPLETED
            </Badge>
            <h2 className="text-[20px] font-bold text-slate-900 break-keep">
              결제가 완료되지 않았어요
            </h2>
            <p className="text-[12px] text-slate-500 mt-1 break-keep">
              걱정하지 마세요. 결제 정보는 저장되지 않았고, 언제든 다시 시도할 수 있어요.
            </p>
          </div>

          {/* 원인 가이드 */}
          {guide && (
            <div className="mt-5 bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                자주 있는 원인
              </div>
              <div className="text-[13px] font-bold text-slate-900 mt-1 break-keep">
                {guide.title}
              </div>
              <div className="text-[12px] text-slate-700 mt-1 break-keep leading-relaxed">
                {guide.tip}
              </div>
            </div>
          )}

          {/* 원본 메시지 (펼치기 형태로 작게) */}
          <details className="mt-3">
            <summary className="text-[11px] text-slate-400 cursor-pointer">
              자세한 오류 메시지 보기
            </summary>
            <div className="mt-1.5 bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 break-all">
              {message}
              {code && <div className="font-mono text-slate-400 mt-1">코드: {code}</div>}
            </div>
          </details>

          {/* 30일 트랙 맥락 안내 */}
          {isMindTrack && (
            <div className="mt-4 bg-[#fbf7eb] border border-[#C8B88A]/40 rounded-2xl p-3.5">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#8a7a4d] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-bold text-[#8a7a4d]">
                    30일 마음 트랙은 그대로 대기 중이에요
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 break-keep leading-relaxed">
                    입력하신 닉네임·고민·목표 정보는 그대로 보존되어 있어, 결제만 다시 진행하시면
                    바로 Day 1부터 시작할 수 있어요.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="space-y-2.5 mt-5">
            <Button
              onClick={handleRetry}
              className="w-full h-11 rounded-2xl bg-[#8a7a4d] hover:bg-[#6f6240] text-white font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              {isMindTrack ? '30일 트랙 결제 다시 시도' : '결제 다시 시도'}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/expert-hiring')}
                className="h-10 rounded-2xl text-[12px] font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                전문가 상담
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="h-10 rounded-2xl text-[12px] font-bold"
              >
                <Home className="w-3.5 h-3.5 mr-1" />
                홈으로
              </Button>
            </div>
          </div>

          {/* 안심 신호 */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
            <Trust icon={<CreditCard className="w-3.5 h-3.5" />} label="청구되지 않음" />
            <Trust icon={<ShieldCheck className="w-3.5 h-3.5" />} label="정보 안전" />
            <Trust icon={<Clock className="w-3.5 h-3.5" />} label="언제든 재시도" />
          </div>

          <p className="text-[11px] text-slate-400 mt-5 text-center break-keep">
            계속 결제가 안 되시면{' '}
            <a href="mailto:support@aihpro.app" className="underline">
              support@aihpro.app
            </a>{' '}
            으로 알려주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-slate-500">
      {icon}
      <span className="text-[10px] font-bold text-center break-keep">{label}</span>
    </div>
  );
}

export default PaymentFail;
