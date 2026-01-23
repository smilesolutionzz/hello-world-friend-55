import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, TrendingUp, Star } from 'lucide-react';

interface LeadScoreIndicatorProps {
  score: number; // 0-100
  className?: string;
}

export const getLeadScoreFromInquiry = (inquiry: {
  organization_type?: string;
  num_users?: number | null;
  service_interest?: string;
  message?: string | null;
}): number => {
  let score = 20; // 기본 점수

  // 기관 유형별 점수
  const orgTypeScores: Record<string, number> = {
    'enterprise': 30,
    'government': 25,
    'hospital': 25,
    'development_center': 20,
    'daycare': 15,
    'academy': 15,
    'other': 10
  };
  score += orgTypeScores[inquiry.organization_type || 'other'] || 10;

  // 직원/이용자 수별 점수
  const numUsers = inquiry.num_users || 0;
  if (numUsers >= 1000) score += 25;
  else if (numUsers >= 500) score += 20;
  else if (numUsers >= 200) score += 15;
  else if (numUsers >= 50) score += 10;
  else score += 5;

  // 관심 서비스별 점수
  const interestScores: Record<string, number> = {
    'brain_capital': 20,
    'eap': 15,
    'custom': 15,
    'development_screening': 10,
    'reporting': 10
  };
  score += interestScores[inquiry.service_interest || ''] || 5;

  // 메시지 길이별 점수 (상세 문의 = 높은 관심)
  const messageLength = inquiry.message?.length || 0;
  if (messageLength > 200) score += 10;
  else if (messageLength > 100) score += 7;
  else if (messageLength > 50) score += 5;

  return Math.min(score, 100);
};

export const LeadScoreIndicator: React.FC<LeadScoreIndicatorProps> = ({ score, className }) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getScoreLabel = () => {
    if (score >= 80) return { label: 'HOT', variant: 'destructive' as const, icon: Flame };
    if (score >= 60) return { label: 'WARM', variant: 'default' as const, icon: TrendingUp };
    if (score >= 40) return { label: 'COOL', variant: 'secondary' as const, icon: Star };
    return { label: 'COLD', variant: 'outline' as const, icon: Star };
  };

  const { label, variant, icon: Icon } = getScoreLabel();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
      <div className="flex items-center gap-2 flex-1 max-w-[100px]">
        <Progress value={score} className="h-2" />
        <span className={`text-xs font-medium ${getScoreColor()}`}>
          {score}
        </span>
      </div>
    </div>
  );
};

export default LeadScoreIndicator;
