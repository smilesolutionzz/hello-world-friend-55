import { ReactNode, ComponentType } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { LoadingSpinner } from './loading-spinner';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

const LazyLoad = ({
  children,
  fallback = <LoadingSpinner />,
  threshold = 0.1,
  rootMargin = '100px',
  className
}: LazyLoadProps) => {
  const { targetRef, isVisible } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  return (
    <div ref={targetRef as any} className={className}>
      {isVisible ? children : fallback}
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