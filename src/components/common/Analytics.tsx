import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Enhanced analytics with GA4, Hotjar, and Clarity support
export const trackPageView = (page: string) => {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('config', 'G-TLTDC7TNZL', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: page
      });
    }
    
    // Hotjar
    if (window.hj) {
      window.hj('stateChange', page);
    }
    
    console.log(`📊 Page View: ${page}`);
  }
};

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
    
    // Hotjar event
    if (window.hj) {
      window.hj('event', eventName);
    }
    
    // Microsoft Clarity custom tag
    if (window.clarity) {
      window.clarity('set', eventName, parameters);
    }
    
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

// Extend window type for analytics tools
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    hj?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

export default Analytics;