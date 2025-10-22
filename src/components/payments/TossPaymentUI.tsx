import React, { useEffect, useMemo, useRef } from 'react';

interface TossPaymentUIProps {
  widget: any | null;
  amount: number;
  currency?: 'KRW' | 'USD';
  country?: 'KR' | 'US';
  onReady?: (ready: boolean) => void;
}

// 내부적으로 고유한 DOM id를 생성해 충돌을 방지하고, 위젯 렌더링과 정리를 책임지는 컴포넌트
const TossPaymentUI: React.FC<TossPaymentUIProps> = ({
  widget,
  amount,
  currency = 'KRW',
  country = 'KR',
  onReady,
}) => {
  const ids = useMemo(() => {
    const uid = Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
    return {
      pm: `tosspm_${uid}`,
      ag: `tossag_${uid}`,
    };
  }, []);

  const renderedRef = useRef(false);

  useEffect(() => {
    let canceled = false;
    async function render() {
      try {
        if (!widget || renderedRef.current) return;

        // 컨테이너가 존재하는지 보장
        const pm = document.getElementById(ids.pm);
        const ag = document.getElementById(ids.ag);
        if (!pm || !ag) return;
        pm.innerHTML = '';
        ag.innerHTML = '';

        // 결제수단 + 약관 렌더
        await widget.renderPaymentMethods(`#${ids.pm}`, {
          value: Math.round(amount),
          currency,
          country,
        });
        await widget.renderAgreement(`#${ids.ag}`);

        if (!canceled) {
          renderedRef.current = true;
          onReady?.(true);
        }
      } catch (e) {
        console.error('TossPaymentUI render error:', e);
        onReady?.(false);
      }
    }

    onReady?.(false);
    renderedRef.current = false;
    render();

    return () => {
      canceled = true;
      // 다음 마운트에서 새로 렌더되도록 초기화
      renderedRef.current = false;
      const pm = document.getElementById(ids.pm);
      const ag = document.getElementById(ids.ag);
      if (pm) pm.innerHTML = '';
      if (ag) ag.innerHTML = '';
    };
    // re-render only when widget or amount changes; ids are stable
  }, [widget, amount, currency, country, ids.pm, ids.ag, onReady]);

  return (
    <>
      <div id={ids.pm} />
      <div id={ids.ag} className="mt-4" />
    </>
  );
};

export default TossPaymentUI;
