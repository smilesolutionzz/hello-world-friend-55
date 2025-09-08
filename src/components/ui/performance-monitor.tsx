import { useEffect } from 'react';

interface PerformanceMonitorProps {
  onMetrics?: (metrics: any) => void;
  enableConsoleLogging?: boolean;
}

const PerformanceMonitor = ({ 
  onMetrics, 
  enableConsoleLogging = false 
}: PerformanceMonitorProps) => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          const metrics = {
            type: 'LCP',
            value: entry.startTime,
            rating: entry.startTime < 2500 ? 'good' : entry.startTime < 4000 ? 'needs-improvement' : 'poor'
          };
          
          if (enableConsoleLogging) {
            console.log('🎯 Performance - LCP:', metrics);
          }
          
          onMetrics?.(metrics);
        }
        
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as any; // Type assertion for FID entry
          const metrics = {
            type: 'FID',
            value: fidEntry.processingStart - fidEntry.startTime,
            rating: (fidEntry.processingStart - fidEntry.startTime) < 100 ? 'good' : 
                   (fidEntry.processingStart - fidEntry.startTime) < 300 ? 'needs-improvement' : 'poor'
          };
          
          if (enableConsoleLogging) {
            console.log('🎯 Performance - FID:', metrics);
          }
          
          onMetrics?.(metrics);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    } catch (error) {
      console.warn('Performance Observer not supported');
    }

    // Measure page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        const metrics = {
          type: 'Page Load',
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart
        };
        
        if (enableConsoleLogging) {
          console.log('🎯 Performance - Page Load:', metrics);
        }
        
        onMetrics?.(metrics);
      }, 0);
    });

    return () => {
      observer.disconnect();
    };
  }, [onMetrics, enableConsoleLogging]);

  return null;
};

export { PerformanceMonitor };