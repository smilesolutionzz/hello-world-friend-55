import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clock, Zap } from 'lucide-react';

interface QuickConsultationFilterProps {
  showQuickOnly: boolean;
  onToggle: (value: boolean) => void;
  showTodayOnly: boolean;
  onTodayToggle: (value: boolean) => void;
}

export const QuickConsultationFilter: React.FC<QuickConsultationFilterProps> = ({
  showQuickOnly,
  onToggle,
  showTodayOnly,
  onTodayToggle,
}) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Switch
          id="quick-filter"
          checked={showQuickOnly}
          onCheckedChange={onToggle}
        />
        <Label htmlFor="quick-filter" className="flex items-center gap-2 cursor-pointer">
          <Zap className="w-4 h-4 text-orange-500" />
          <span>빠른 상담만 (15분)</span>
          <Badge variant="secondary" className="ml-1">50% 할인</Badge>
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="today-filter"
          checked={showTodayOnly}
          onCheckedChange={onTodayToggle}
        />
        <Label htmlFor="today-filter" className="flex items-center gap-2 cursor-pointer">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>당일 예약 가능</span>
        </Label>
      </div>
    </div>
  );
};
