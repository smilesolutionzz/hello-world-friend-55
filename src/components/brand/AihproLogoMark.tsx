import React from "react";

interface Props {
  className?: string;
  title?: string;
}

/**
 * AIHPRO 인라인 SVG 로고 마크 ("AH" 모노그램).
 * 외부 PNG 자산 로딩 실패(SW 캐시/번들 미스 등) 영향을 받지 않도록 인라인으로 렌더합니다.
 */
export const AihproLogoMark: React.FC<Props> = ({ className, title = "AIHPRO" }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="aihproLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#5EC8F2" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#aihproLogoGrad)" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontWeight={700}
        fontSize="30"
        fill="#FFFFFF"
        letterSpacing="-1"
      >
        AH
      </text>
    </svg>
  );
};

export default AihproLogoMark;
