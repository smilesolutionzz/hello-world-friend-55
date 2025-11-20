import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FactCheckBadgeProps {
  postId: string;
  postTitle: string;
  postContent: string;
}

export const FactCheckBadge = ({ postId, postTitle, postContent }: FactCheckBadgeProps) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [factCheck, setFactCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFactCheck();
  }, [postId]);

  const loadFactCheck = async () => {
    try {
      const { data, error } = await supabase
        .from('fact_check_results')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading fact check:', error);
      }
      
      if (data) {
        setFactCheck(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runFactCheck = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('fact-check-post', {
        body: {
          postId,
          title: postTitle,
          content: postContent,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: '팩트체크 완료',
          description: '게시글의 정보를 검증했습니다.',
        });
        await loadFactCheck();
      }
    } catch (error) {
      console.error('Fact check error:', error);
      toast({
        title: '오류',
        description: '팩트체크 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (!factCheck) return <Shield className="h-4 w-4" />;
    
    switch (factCheck.check_status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'questionable':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'misleading':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    if (!factCheck) return '미검증';
    
    switch (factCheck.check_status) {
      case 'verified':
        return '검증됨';
      case 'questionable':
        return '의심스러움';
      case 'misleading':
        return '오류 가능';
      default:
        return '확인 중';
    }
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!factCheck) return 'outline';
    
    switch (factCheck.check_status) {
      case 'verified':
        return 'default';
      case 'questionable':
        return 'secondary';
      case 'misleading':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge variant={getStatusVariant()} className="cursor-pointer gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>팩트체크 결과</DialogTitle>
        </DialogHeader>
        
        {factCheck ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                신뢰도: {factCheck.confidence_score}%
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">요약</h4>
                <p className="text-sm text-muted-foreground">{factCheck.summary}</p>
              </div>
              
              {factCheck.sources && factCheck.sources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">참고 출처</h4>
                  <ul className="space-y-2">
                    {factCheck.sources.map((source: any, idx: number) => (
                      <li key={idx} className="text-sm">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                검증 시각: {new Date(factCheck.checked_at).toLocaleString('ko-KR')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              이 게시글은 아직 팩트체크되지 않았습니다.
            </p>
            <Button 
              onClick={runFactCheck} 
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  검증 중...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  팩트체크 실행
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
