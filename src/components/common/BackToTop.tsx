import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  
  // 결과 페이지에서는 숨김
  const hideOnRoutes = ['/fun-test-result', '/han-medicine-test'];
  const shouldHide = hideOnRoutes.some(route => location.pathname.includes(route));

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (shouldHide) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300",
        "bg-primary/90 hover:bg-primary text-primary-foreground",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      )}
      aria-label="맨 위로 이동"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default BackToTop;