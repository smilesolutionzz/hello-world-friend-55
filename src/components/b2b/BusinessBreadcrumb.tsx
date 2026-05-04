import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BusinessBreadcrumbProps {
  current: string;
}

/**
 * B2B 페이지 상단에 배치되는 공통 브레드크럼.
 * "← 비즈니스 홈 / 현재 페이지" 형태로 단일 진입점(/business)을 노출한다.
 */
export default function BusinessBreadcrumb({ current }: BusinessBreadcrumbProps) {
  return (
    <div className="border-b border-border/60 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-2 text-sm">
        <Link
          to="/business"
          className="inline-flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>비즈니스 홈</span>
        </Link>
        <span className="text-foreground/30">/</span>
        <span className="text-foreground/80 font-medium truncate">{current}</span>
      </div>
    </div>
  );
}
