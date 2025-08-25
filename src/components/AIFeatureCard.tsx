import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIBadge } from './AIBadge';
import { LucideIcon } from 'lucide-react';

interface AIFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  aiLevel?: 'basic' | 'advanced' | 'premium';
  onClick?: () => void;
  className?: string;
}

export const AIFeatureCard: React.FC<AIFeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  aiLevel = 'basic',
  onClick,
  className = ''
}) => {
  const getAIBadgeVariant = () => {
    switch (aiLevel) {
      case 'premium':
        return 'premium';
      case 'advanced':
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 ${className}`}
      onClick={onClick}
    >
      <CardHeader className="relative">
        <div className="absolute top-4 right-4">
          <AIBadge variant={getAIBadgeVariant()} size="sm" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          최신 딥러닝 신경망 모델로 분석됩니다
        </div>
      </CardContent>
    </Card>
  );
};