import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  className?: string;
  contentClassName?: string;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  title,
  showBackButton = true,
  showMenu = false,
  className = '',
  contentClassName = ''
}) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-muted/30 to-background ${className}`}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          {title && (
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              {title}
            </h1>
          )}
          
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`px-4 py-6 ${contentClassName}`}>
        {children}
      </div>

      {/* Bottom Safe Area for iOS */}
      <div className="h-8 bg-background"></div>
    </div>
  );
};

// Mobile-optimized Card component
export const MobileCard: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <Card className={`shadow-lg border-0 bg-card/80 backdrop-blur-sm ${className}`}>
      <CardContent className="p-4 md:p-6">
        {children}
      </CardContent>
    </Card>
  );
};

// Mobile-optimized Button Grid
export const MobileButtonGrid: React.FC<{
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}> = ({ children, columns = 2, className = '' }) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3'
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-3 ${className}`}>
      {children}
    </div>
  );
};

// Mobile-optimized Input component
export const MobileInput: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
}> = ({ placeholder, value, onChange, type = 'text', className = '' }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full p-4 text-lg rounded-xl border border-border bg-background focus:border-primary focus:outline-none ${className}`}
    />
  );
};

export default MobileOptimizedLayout;