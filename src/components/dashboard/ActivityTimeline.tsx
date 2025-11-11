import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Clock, TrendingUp } from 'lucide-react';

interface TimelineItem {
  id: string;
  type: 'test' | 'observation';
  title: string;
  date: string;
  score?: number;
  description?: string;
}

interface ActivityTimelineProps {
  recentTests: any[];
  observations: any[];
}

export function ActivityTimeline({ recentTests, observations }: ActivityTimelineProps) {
  // 검사와 관찰 기록을 합쳐서 타임라인 생성
  const timelineItems: TimelineItem[] = [
    ...recentTests.map(test => ({
      id: test.id,
      type: 'test' as const,
      title: test.test_types.name,
      date: test.completed_at,
      score: test.scores.total_score,
      description: '검사 완료'
    })),
    ...observations.map(obs => ({
      id: obs.id,
      type: 'observation' as const,
      title: '관찰 기록',
      date: obs.created_at,
      score: obs.score_overall,
      description: '일상 관찰 기록'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          <Clock className="w-5 h-5 text-purple-400" />
          최근 활동
        </CardTitle>
        <CardDescription className="text-purple-300/70">
          최근 검사 및 관찰 기록 타임라인
        </CardDescription>
      </CardHeader>
      <CardContent>
        {timelineItems.length > 0 ? (
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline Line */}
                {index !== timelineItems.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-purple-500/50 to-transparent" />
                )}
                
                {/* Timeline Item */}
                <div className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    item.type === 'test' 
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                      : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                  }`}>
                    {item.type === 'test' ? (
                      <Brain className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Activity className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="p-4 rounded-lg border border-purple-500/20 bg-gradient-to-br from-slate-900/60 to-slate-900/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                          <p className="text-xs text-purple-400/70">{item.description}</p>
                        </div>
                        {item.score !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              item.score >= 80 
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                                : item.score >= 60 
                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                                : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                            }`}
                          >
                            {Math.round(item.score)}점
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-purple-300/60">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.date).toLocaleString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-500/30" />
            <p className="text-sm text-purple-400/60">아직 활동 이력이 없습니다</p>
            <p className="text-xs text-purple-400/40 mt-2">검사나 관찰 기록을 시작해보세요</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}