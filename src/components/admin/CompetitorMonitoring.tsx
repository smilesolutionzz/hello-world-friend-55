import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, RefreshCw, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const CompetitorMonitoring = () => {
  const { toast } = useToast();
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    url: '',
    category: '',
  });

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('monitor-competitors', {
        body: { action: 'list' },
      });

      if (error) throw error;
      if (data?.success) {
        setCompetitors(data.competitors || []);
      }
    } catch (error) {
      console.error('Error loading competitors:', error);
      toast({
        title: '오류',
        description: '경쟁사 목록을 불러올 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addCompetitor = async () => {
    if (!newCompetitor.name || !newCompetitor.url) {
      toast({
        title: '입력 오류',
        description: '이름과 URL을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('monitor-competitors', {
        body: {
          action: 'add',
          competitorData: newCompetitor,
        },
      });

      if (error) throw error;

      toast({
        title: '성공',
        description: '경쟁사가 추가되었습니다.',
      });

      setNewCompetitor({ name: '', url: '', category: '' });
      await loadCompetitors();
    } catch (error) {
      console.error('Error adding competitor:', error);
      toast({
        title: '오류',
        description: '경쟁사 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const checkCompetitors = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('monitor-competitors', {
        body: { action: 'check' },
      });

      if (error) throw error;

      toast({
        title: '모니터링 완료',
        description: `${data.checked}개 경쟁사를 확인했습니다.`,
      });

      await loadCompetitors();
    } catch (error) {
      console.error('Error checking competitors:', error);
      toast({
        title: '오류',
        description: '경쟁사 모니터링 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>경쟁사 모니터링</CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>경쟁사 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>이름</Label>
                    <Input
                      value={newCompetitor.name}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                      placeholder="경쟁사 이름"
                    />
                  </div>
                  <div>
                    <Label>웹사이트 URL</Label>
                    <Input
                      value={newCompetitor.url}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label>카테고리</Label>
                    <Input
                      value={newCompetitor.category}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, category: e.target.value })}
                      placeholder="예: 육아, 교육, 상담"
                    />
                  </div>
                  <Button onClick={addCompetitor} className="w-full">
                    추가하기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" onClick={checkCompetitors} disabled={checking}>
              {checking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              확인
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                모니터링 중인 경쟁사가 없습니다.
              </p>
            ) : (
              competitors.map((competitor) => (
                <Card key={competitor.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{competitor.competitor_name}</h3>
                          {competitor.is_active && (
                            <Badge variant="default">활성</Badge>
                          )}
                          {competitor.category && (
                            <Badge variant="outline">{competitor.category}</Badge>
                          )}
                        </div>
                        <a
                          href={competitor.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {competitor.website_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {competitor.last_checked_at && (
                          <p className="text-xs text-muted-foreground">
                            마지막 확인: {new Date(competitor.last_checked_at).toLocaleString('ko-KR')}
                          </p>
                        )}
                        {competitor.changes_detected && competitor.changes_detected.length > 0 && (
                          <div className="mt-2">
                            <Badge variant="destructive">
                              {competitor.changes_detected.length}개 변경사항 감지
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
