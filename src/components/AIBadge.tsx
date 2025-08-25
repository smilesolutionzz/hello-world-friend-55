import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';

interface AIBadgeProps {
  variant?: 'default' | 'premium' | 'processing';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const AIBadge: React.FC<AIBadgeProps> = ({ 
  variant = 'default', 
  size = 'sm',
  showIcon = true 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse';
      case 'processing':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 animate-bounce';
      default:
        return 'bg-gradient-to-r from-primary to-primary/80 text-white border-0';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'lg':
        return 'px-4 py-2 text-base';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  return (
    <Badge className={`${getVariantStyles()} ${getSizeStyles()} font-semibold`}>
      {showIcon && (
        <Brain className={`${size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} mr-1`} />
      )}
      딥러닝 AI
      {variant === 'premium' && (
        <Sparkles className={`${size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} ml-1`} />
      )}
    </Badge>
  );
};