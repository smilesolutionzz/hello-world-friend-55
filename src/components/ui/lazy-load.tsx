import { ReactNode, ComponentType } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { SectionPlaceholder } from './section-placeholder';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  /** Optional debug label shown in placeholder + scroll-reveal debug badges */
  debugLabel?: string;
  /** Override placeholder height (Tailwind class) when using default fallback */
  placeholderHeight?: string;
}

const LazyLoad = ({
  children,
  fallback,
  threshold = 0.01,
  rootMargin = '300px',
  className,
  debugLabel,
  placeholderHeight,
}: LazyLoadProps) => {
  const { targetRef, isVisible } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const resolvedFallback =
    fallback ?? (
      <SectionPlaceholder heightClass={placeholderHeight} label={debugLabel} />
    );

  return (
    <div
      ref={targetRef as any}
      className={className}
      data-lazy-label={debugLabel}
      data-lazy-visible={isVisible ? 'true' : 'false'}
    >
      {isVisible ? children : resolvedFallback}
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
