import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Brain, 
  MessageCircle, 
  FileText,
  ArrowRight
} from "lucide-react";

interface Activity {
  id: string;
  type: 'assessment' | 'consultation' | 'observation';
  title: string;
  date: string;
  score?: number;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment':
        return <Brain className="w-4 h-4 text-primary" />;
      case 'consultation':
        return <MessageCircle className="w-4 h-4 text-soft-mint-foreground" />;
      case 'observation':
        return <FileText className="w-4 h-4 text-calm-blue-foreground" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'assessment':
        return '심리검사';
      case 'consultation':
        return 'AI상담';
      case 'observation':
        return '관찰일지';
      default:
        return '활동';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">최근 활동</h3>
      </div>
      
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors">
              <div className="p-2 bg-background rounded-lg">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {getActivityLabel(activity.type)}
                  </Badge>
                  {activity.score && (
                    <Badge variant="secondary" className="text-xs">
                      점수: {activity.score}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString('ko-KR', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">최근 활동이 없습니다</p>
        </div>
      )}
    </Card>
  );
}