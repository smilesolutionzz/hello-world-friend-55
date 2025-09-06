import { Heart, Calendar, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface GrowthStoryCardProps {
  story: {
    id: string;
    title: string;
    before_story: string;
    after_story: string;
    transformation_date?: string;
    category: string;
    likes_count: number;
    is_anonymous: boolean;
    created_at: string;
    user_id: string;
  };
  onLike?: (id: string) => void;
}

export function GrowthStoryCard({ story, onLike }: GrowthStoryCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {story.category === 'personal' ? '개인성장' : 
               story.category === 'career' ? '커리어' : 
               story.category === 'relationship' ? '인간관계' : '기타'}
            </Badge>
            {story.transformation_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {story.transformation_date}
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
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-destructive text-sm flex items-center gap-1">
              😔 Before
            </h4>
            <p className="text-sm text-muted-foreground bg-destructive/5 p-3 rounded-lg">
              {story.before_story.length > 100 
                ? `${story.before_story.substring(0, 100)}...` 
                : story.before_story}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-green-600 text-sm flex items-center gap-1">
              🌟 After
            </h4>
            <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg">
              {story.after_story.length > 100 
                ? `${story.after_story.substring(0, 100)}...` 
                : story.after_story}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(story.id)}
              className="flex items-center gap-1 hover:text-red-500"
            >
              <Heart className="h-4 w-4" />
              {story.likes_count}
            </Button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              공감
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {story.is_anonymous ? '익명' : '실명'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}