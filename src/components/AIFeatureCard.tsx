import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIBadge } from './AIBadge';
import { LucideIcon } from 'lucide-react';

interface AIFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  aiLevel?: 'basic' | 'advanced' | 'premium';
  rank?: number;
  onClick?: () => void;
  className?: string;
}

export const AIFeatureCard: React.FC<AIFeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  aiLevel = 'basic',
  rank,
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
        <div className="absolute top-2 right-2 flex gap-2">
          {rank && (
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {rank}위
            </span>
          )}
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
          AI 분석으로 재미있는 결과를 제공합니다
        </div>
      </CardContent>
    </Card>
  );
};