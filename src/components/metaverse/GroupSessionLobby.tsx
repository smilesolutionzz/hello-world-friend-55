import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Users, Plus, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GroupSession {
  id: string;
  session_name: string;
  host_user_id: string;
  room_type: string;
  max_participants: number;
  is_active: boolean;
  created_at: string;
  participant_count: number;
}

interface GroupSessionLobbyProps {
  onClose: () => void;
  onJoinSession: (sessionId: string, sessionName: string) => void;
}

export const GroupSessionLobby = ({ onClose, onJoinSession }: GroupSessionLobbyProps) => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('group_sessions')
        .select(`
          *,
          participant_count:group_participants(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSessions = data?.map(session => ({
        ...session,
        participant_count: session.participant_count?.[0]?.count || 0
      })) || [];

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "세션 로드 실패",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "세션 이름을 입력하세요",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      const { data, error } = await supabase
        .from('group_sessions')
        .insert({
          session_name: sessionName,
          host_user_id: user.id,
          room_type: 'counseling',
          max_participants: maxParticipants
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "세션이 생성되었습니다",
      });

      onJoinSession(data.id, data.session_name);
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "세션 생성 실패",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900/95 border border-purple-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            그룹 상담 세션
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!isCreating ? (
          <div className="space-y-4">
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full gap-2"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              새 세션 만들기
            </Button>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-semibold mb-3">활성 세션</h4>
              {loading ? (
                <p className="text-white/70 text-center py-4">로딩 중...</p>
              ) : sessions.length === 0 ? (
                <p className="text-white/70 text-center py-4">활성 세션이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <Card key={session.id} className="bg-black/30 border-purple-500/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-medium">{session.session_name}</h5>
                          <p className="text-sm text-white/70">
                            참가자: {session.participant_count}/{session.max_participants}명
                          </p>
                        </div>
                        <Button
                          onClick={() => onJoinSession(session.id, session.session_name)}
                          size="sm"
                          disabled={session.participant_count >= session.max_participants}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          참여
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">세션 이름</label>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="예: 육아 고민 나누기"
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">최대 참가자 수</label>
              <Input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 6)}
                min={2}
                max={10}
                className="bg-black/30 border-purple-500/30 text-white"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsCreating(false)}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleCreateSession}
                className="flex-1"
              >
                세션 생성
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};