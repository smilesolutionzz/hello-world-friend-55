import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ConcernData {
  id: string;
  concern_text: string;
  analysis_type: string;
  analysis_severity: string;
  analysis_advice: string;
  recommended_tests: any;
  created_at: string;
}

export const ConcernStorageList = () => {
  const [concerns, setConcerns] = useState<ConcernData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConcerns();
  }, []);

  const fetchConcerns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('concern_storage')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConcerns(data || []);
    } catch (error) {
      console.error('고민 불러오기 오류:', error);
      toast({
        title: "오류 발생",
        description: "고민을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('concern_storage')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConcerns(concerns.filter(c => c.id !== id));
      toast({
        title: "삭제 완료",
        description: "고민이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('고민 삭제 오류:', error);
      toast({
        title: "오류 발생",
        description: "고민 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '높음':
        return 'bg-red-500';
      case '중간':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (concerns.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">저장된 고민이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {concerns.map((concern) => (
        <Card key={concern.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-semibold">
                    {concern.analysis_type}
                  </Badge>
                  <Badge className={`${getSeverityColor(concern.analysis_severity)} text-white`}>
                    심각도: {concern.analysis_severity}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(concern.created_at), 'PPP', { locale: ko })}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(concern.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">내 고민</h4>
              <p className="text-foreground whitespace-pre-wrap">{concern.concern_text}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">AI 조언</h4>
              <p className="text-foreground">{concern.analysis_advice}</p>
            </div>

            {concern.recommended_tests && concern.recommended_tests.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">추천 검사</h4>
                <div className="flex flex-wrap gap-2">
                  {concern.recommended_tests.map((test: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {test}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConcernStorageList;
