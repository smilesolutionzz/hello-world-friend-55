import { useEffect, useRef } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';

interface BehaviorTrackerProps {
  children: React.ReactNode;
}

const BehaviorTracker = ({ children }: BehaviorTrackerProps) => {
  const { trackBehavior, trackPageView, trackTypingBehavior } = usePersonalization();
  const pageStartTime = useRef(Date.now());
  const typingStartTime = useRef<number | null>(null);

  useEffect(() => {
    // Track page view on mount
    trackPageView(window.location.pathname);
    
    // Track page duration on unmount
    return () => {
      const duration = (Date.now() - pageStartTime.current) / 1000;
      trackPageView(window.location.pathname, duration);
    };
  }, [trackPageView]);

  useEffect(() => {
    // Track text input patterns
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!typingStartTime.current) {
        typingStartTime.current = Date.now();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (typingStartTime.current && event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        const timeToType = (Date.now() - typingStartTime.current) / 1000;
        const text = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
        
        if (text.length > 5 && timeToType > 1) {
          trackTypingBehavior(text, timeToType);
        }
        
        typingStartTime.current = null;
      }
    };

    // Track mouse click patterns
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      trackBehavior({
        type: 'click',
        clickPattern: {
          elementType: target.tagName.toLowerCase(),
          className: target.className,
          timestamp: Date.now(),
          coordinates: { x: event.clientX, y: event.clientY }
        }
      });
    };

    // Track scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        trackBehavior({
          type: 'scroll',
          scrollBehavior: {
            scrollY: window.scrollY,
            documentHeight: document.documentElement.scrollHeight,
            viewportHeight: window.innerHeight,
            scrollPercentage: (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          }
        });
      }, 500);
    };

    // Track focus/blur events to detect engagement
    const handleFocus = () => {
      trackBehavior({
        type: 'focus',
        timestamp: Date.now()
      });
    };

    const handleBlur = () => {
      trackBehavior({
        type: 'blur',
        timestamp: Date.now()
      });
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearTimeout(scrollTimeout);
    };
  }, [trackBehavior, trackTypingBehavior]);

  // Track mood indicators from app usage patterns
  useEffect(() => {
    const detectMoodIndicators = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Track late night usage (potential mood indicator)
      if (hour >= 23 || hour <= 5) {
        trackBehavior({
          type: 'late_night_usage',
          timestamp: Date.now(),
          timeContext: {
            hour,
            isWeekend: now.getDay() === 0 || now.getDay() === 6
          }
        });
      }
      
      // Track rapid page switching (potential anxiety indicator)
      let pageChangeCount = 0;
      const pageChangeTimer = setInterval(() => {
        pageChangeCount = 0;
      }, 60000); // Reset every minute
      
      const originalPushState = history.pushState;
      history.pushState = function(...args) {
        pageChangeCount++;
        if (pageChangeCount > 5) {
          trackBehavior({
            type: 'rapid_navigation',
            rapidNavigation: {
              changesPerMinute: pageChangeCount,
              timestamp: Date.now()
            }
          });
        }
        return originalPushState.apply(history, args);
      };
      
      return () => {
        clearInterval(pageChangeTimer);
        history.pushState = originalPushState;
      };
    };

    const cleanup = detectMoodIndicators();
    return cleanup;
  }, [trackBehavior]);

  return <>{children}</>;
};

export default BehaviorTracker;