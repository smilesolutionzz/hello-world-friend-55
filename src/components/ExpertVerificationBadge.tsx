import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, UserCheck, Clock, CheckCircle } from 'lucide-react';

interface ExpertVerificationBadgeProps {
  status: 'ai_analysis' | 'pending_expert' | 'expert_reviewed' | 'verified';
  expertName?: string;
  reviewDate?: string;
  className?: string;
}

const ExpertVerificationBadge: React.FC<ExpertVerificationBadgeProps> = ({
  status,
  expertName,
  reviewDate,
  className = ""
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ai_analysis':
        return {
          icon: <Shield className="w-3 h-3" />,
          text: 'AI 1차 분석 완료',
          variant: 'secondary' as const,
          description: '전문가 검토 대기 중'
        };
      case 'pending_expert':
        return {
          icon: <Clock className="w-3 h-3" />,
          text: '전문가 검토 진행 중',
          variant: 'default' as const,
          description: '24시간 내 검토 완료'
        };
      case 'expert_reviewed':
        return {
          icon: <UserCheck className="w-3 h-3" />,
          text: '전문가 검토 완료',
          variant: 'outline' as const,
          description: `${expertName || '전문가'}님이 검토`
        };
      case 'verified':
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          text: '전문가 검증 완료',
          variant: 'default' as const,
          description: '신뢰할 수 있는 결과'
        };
      default:
        return {
          icon: <Shield className="w-3 h-3" />,
          text: 'AI 분석',
          variant: 'secondary' as const,
          description: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {config.text}
      </Badge>
      {config.description && (
        <p className="text-xs text-muted-foreground">
          {config.description}
          {reviewDate && ` (${new Date(reviewDate).toLocaleDateString()})`}
        </p>
      )}
    </div>
  );
};

export default ExpertVerificationBadge;