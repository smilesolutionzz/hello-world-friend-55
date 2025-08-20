import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Observation {
  id: string;
  title: string;
  description: string;
  tags: string[];
  created_at: string;
}

interface SimpleObservationListProps {
  onNewObservation: () => void;
}

export const SimpleObservationList: React.FC<SimpleObservationListProps> = ({ onNewObservation }) => {
  const { toast } = useToast();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadObservations();
  }, []);

  const loadObservations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('observation_logs')
        .select('id, title, description, tags, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObservations(data || []);
    } catch (error) {
      console.error('Error loading observations:', error);
      toast({
        title: "로딩 오류",
        description: "관찰일지를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteObservation = async (id: string) => {
    if (!confirm('이 관찰일지를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('observation_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setObservations(prev => prev.filter(obs => obs.id !== id));
      toast({
        title: "삭제 완료",
        description: "관찰일지가 삭제되었습니다.",
      });
    } catch (error) {
      console.error('Error deleting observation:', error);
      toast({
        title: "삭제 실패",
        description: "관찰일지 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">관찰일지를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">내 관찰일지</h1>
        </div>
        <Button onClick={onNewObservation}>
          <Plus className="h-4 w-4 mr-2" />
          새 관찰일지 작성
        </Button>
      </div>

      {observations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">아직 작성된 관찰일지가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              첫 번째 관찰일지를 작성해보세요
            </p>
            <Button onClick={onNewObservation}>
              새 관찰일지 작성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {observations.map((observation) => (
            <Card key={observation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{observation.title}</h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {observation.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(observation.created_at), 'yyyy년 MM월 dd일')}
                      </div>
                    </div>

                    {observation.tags && observation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {observation.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteObservation(observation.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};