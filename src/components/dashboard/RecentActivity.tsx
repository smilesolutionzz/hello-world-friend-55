import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  const navigate = useNavigate();
  
  const handleActivityClick = (activity: any) => {
    // 검사 결과를 다시 볼 수 있도록 세션 스토리지에 저장
    const testData = {
      testType: activity.type,
      results: activity.meta || {},
      timestamp: activity.date
    };
    
    sessionStorage.setItem('viewTestResult', JSON.stringify(testData));
    
    // 검사 유형에 따라 적절한 페이지로 이동
    if (activity.type === 'depression' || activity.type === 'panic' || activity.type === 'adhd') {
      navigate('/assessment');
      toast.success("이전 검사 결과를 불러왔습니다.");
    } else {
      toast.info("해당 검사 결과는 검사 페이지에서 확인할 수 있습니다.");
    }
  };
  
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
        return '심리테스트';
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
            <div 
              key={activity.id} 
              className="group cursor-pointer"
              onClick={() => handleActivityClick(activity)}
            >
              {/* 모바일에서 예쁘게 보이는 카드형 레이아웃 */}
              <div className="flex md:hidden bg-gradient-to-r from-white to-background/80 rounded-xl border border-border/40 p-4 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-[1.01]">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center border border-primary/10">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                      {getActivityLabel(activity.type)}
                    </Badge>
                    {activity.score && (
                      <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                        {activity.score}점
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.date).toLocaleDateString('ko-KR', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>

              {/* 데스크톱에서는 기존 레이아웃 */}
              <div className="hidden md:flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors cursor-pointer">
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