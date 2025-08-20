import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ObservationSessionFormProps {
  onSessionCreated?: (sessionId: string) => void;
}

export const ObservationSessionForm = ({ onSessionCreated }: ObservationSessionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const createSession = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('observation_sessions')
        .insert({
          user_id: user.id,
          session_type: 'observation',
          observations: { created: new Date().toISOString() }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "세션 생성 완료",
        description: "새로운 관찰 세션이 생성되었습니다.",
      });

      onSessionCreated?.(data.id);
    } catch (error: any) {
      toast({
        title: "세션 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 관찰 세션 만들기</CardTitle>
        <CardDescription>
          새로운 관찰 세션을 시작합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createSession} 
          disabled={loading || !user}
          className="w-full"
        >
          {loading ? "생성 중..." : "세션 시작"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ObservationSessionForm;