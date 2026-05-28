import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/i18n';
import { trackB2BEvent } from '@/hooks/useB2BFunnelTracking';

interface Props {
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * 개인용(B2C) ↔ 기업용(B2B) 모드 전환 토글.
 * 헤더 상단에 노출되어 메인 진입 동선을 분기한다.
 */
export const AudienceModeToggle = ({ size = 'md', className = '' }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { localePath } = useLanguage();

  const path = location.pathname.replace(/^\/en/, '') || '/';
  const isBusinessMode =
    path.startsWith('/business') ||
    path.startsWith('/b2b') ||
    path.startsWith('/eap-service');

  const go = (mode: 'b2c' | 'b2b') => {
    if (mode === 'b2b' && !isBusinessMode) {
      trackB2BEvent('mode_toggle', path, { to: 'b2b' });
      navigate(localePath('/b2b-hr-dashboard?demo=1'));
    } else if (mode === 'b2c' && isBusinessMode) {
      trackB2BEvent('mode_toggle', path, { to: 'b2c' });
      navigate(localePath('/'));
    }
  };

  const height = size === 'sm' ? 'h-7' : 'h-8';
  const padding = size === 'sm' ? 'px-2.5 text-[11px]' : 'px-3 text-xs';

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border bg-white p-0.5 ${className}`}
      role="tablist"
      aria-label="Audience mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={!isBusinessMode}
        onClick={() => go('b2c')}
        className={`${height} ${padding} rounded-full font-semibold tracking-tight transition-colors ${
          !isBusinessMode
            ? 'bg-foreground text-background'
            : 'text-foreground/60 hover:text-foreground'
        }`}
      >
        개인용
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isBusinessMode}
        onClick={() => go('b2b')}
        className={`${height} ${padding} rounded-full font-semibold tracking-tight transition-colors ${
          isBusinessMode
            ? 'bg-foreground text-background'
            : 'text-foreground/60 hover:text-foreground'
        }`}
      >
        기업용
      </button>
    </div>
  );
};

export default AudienceModeToggle;
