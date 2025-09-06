import { Trophy, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    problem_description: string;
    status: string;
    points_reward: number;
    solution?: string;
    solved_at?: string;
    is_anonymous: boolean;
    created_at: string;
    user_id: string;
  };
  onSolve?: (id: string) => void;
  currentUserId?: string;
}

export function ChallengeCard({ challenge, onSolve, currentUserId }: ChallengeCardProps) {
  const isOwner = currentUserId === challenge.user_id;
  const canSolve = challenge.status === 'open' && !isOwner;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={challenge.status === 'open' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {challenge.status === 'open' ? (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  해결 대기
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  해결 완료
                </div>
              )}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Trophy className="h-3 w-3" />
              {challenge.points_reward}P
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(challenge.created_at), { addSuffix: true, locale: ko })}
          </span>
        </div>
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {challenge.title}
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-1">
            🤔 문제 상황
          </h4>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {challenge.problem_description.length > 150 
              ? `${challenge.problem_description.substring(0, 150)}...` 
              : challenge.problem_description}
          </p>
        </div>
        
        {challenge.solution && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-1 text-green-600">
              💡 해결 방법
            </h4>
            <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg">
              {challenge.solution}
            </p>
            {challenge.solved_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                해결: {formatDistanceToNow(new Date(challenge.solved_at), { addSuffix: true, locale: ko })}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          {canSolve && (
            <Button
              onClick={() => onSolve?.(challenge.id)}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              해결책 제안하기
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground ml-auto">
            {challenge.is_anonymous ? '익명' : '실명'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}