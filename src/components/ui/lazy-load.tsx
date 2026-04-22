import { ReactNode, ComponentType } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { LoadingSpinner } from './loading-spinner';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  /** Reserved min-height for placeholder to prevent layout shift / scroll jump */
  minHeight?: number | string;
}

const LazyLoad = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  className,
  minHeight = 400,
}: LazyLoadProps) => {
  const { targetRef, isVisible } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  // Reserve vertical space so the page height stays stable as sections lazy-load.
  // Without this, content "jumps" mid-scroll when a heavy section mounts.
  const placeholderStyle =
    !isVisible && minHeight
      ? { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }
      : undefined;

  const placeholder = fallback ?? (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <LoadingSpinner />
    </div>
  );

  return (
    <div ref={targetRef as any} className={className} style={placeholderStyle}>
      {isVisible ? children : placeholder}
    </div>
  );
};

// HOC for lazy loading components
export const withLazyLoad = <P extends object>(
  Component: ComponentType<P>,
  options?: Omit<LazyLoadProps, 'children'>
) => {
  return (props: P) => (
    <LazyLoad {...options}>
      <Component {...props} />
    </LazyLoad>
  );
};

export { LazyLoad };