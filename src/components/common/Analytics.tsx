import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Simple analytics utility for tracking page views and events
export const trackPageView = (page: string) => {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: page
      });
    }
    
    // Custom analytics can be added here
    console.log(`📊 Page View: ${page}`);
  }
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
    
    // Custom analytics
    console.log(`📊 Event: ${eventName}`, parameters);
  }
};

// Analytics component for automatic page view tracking
const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default Analytics;