import { TrendingUp, Heart, MessageCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ReversalStoryCardProps {
  story: {
    id: string;
    title: string;
    worst_moment: string;
    reversal_moment: string;
    lesson_learned?: string;
    mood_before: number;
    mood_after: number;
    story_date?: string;
    reactions: {
      inspiring: number;
      relatable: number;
      helpful: number;
    };
    created_at: string;
  };
  onReact?: (id: string, type: 'inspiring' | 'relatable' | 'helpful') => void;
}

export function ReversalStoryCard({ story, onReact }: ReversalStoryCardProps) {
  const moodImprovement = story.mood_after - story.mood_before;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              반전 스토리
            </Badge>
            {story.story_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {story.story_date}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: ko })}
          </span>
        </div>
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {story.title}
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-1 text-red-600">
              😫 최악의 순간
            </h4>
            <p className="text-sm text-muted-foreground bg-red-50 p-3 rounded-lg">
              {story.worst_moment.length > 120 
                ? `${story.worst_moment.substring(0, 120)}...` 
                : story.worst_moment}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-1 text-green-600">
              ✨ 반전의 순간
            </h4>
            <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg">
              {story.reversal_moment.length > 120 
                ? `${story.reversal_moment.substring(0, 120)}...` 
                : story.reversal_moment}
            </p>
          </div>
          
          {story.lesson_learned && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-1 text-blue-600">
                💡 배운 점
              </h4>
              <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                {story.lesson_learned}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>기분 변화</span>
            <span className="text-green-600 font-medium">
              +{moodImprovement}점 상승
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500">{story.mood_before}/10</span>
            <Progress value={((story.mood_after - story.mood_before) / 10) * 100} className="flex-1" />
            <span className="text-xs text-green-500">{story.mood_after}/10</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReact?.(story.id, 'inspiring')}
              className="flex items-center gap-1 hover:text-yellow-500"
            >
              🌟 {story.reactions.inspiring}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReact?.(story.id, 'relatable')}
              className="flex items-center gap-1 hover:text-blue-500"
            >
              🤝 {story.reactions.relatable}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReact?.(story.id, 'helpful')}
              className="flex items-center gap-1 hover:text-green-500"
            >
              💡 {story.reactions.helpful}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}