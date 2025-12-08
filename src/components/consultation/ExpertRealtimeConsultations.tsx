import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  User,
  Bell,
  AlertCircle,
  PhoneCall,
  PhoneOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ExpertChatInterface } from './ExpertChatInterface';

interface ConsultationSession {
  id: string;
  user_id: string;
  expert_id: string | null;
  status: 'waiting' | 'active' | 'ended';
  created_at: string;
  started_at?: string;
  ended_at?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  } | null;
}

interface ExpertRealtimeConsultationsProps {
  expertId: string;
}

export const ExpertRealtimeConsultations: React.FC<ExpertRealtimeConsultationsProps> = ({ expertId }) => {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ConsultationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 세션 목록 로드
  const loadSessions = async () => {
    setIsLoading(true);
    try {
      // 전문가에게 배정된 세션 또는 대기중인 세션 로드
      const { data, error } = await supabase
        .from('realtime_consultation_sessions')
        .select('*')
        .or(`expert_id.eq.${expertId},and(status.eq.waiting,expert_id.is.null)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 사용자 프로필 별도로 가져오기
      const sessionsWithProfiles = await Promise.all(
        (data || []).map(async (session) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', session.user_id)
            .single();
          return { 
            ...session, 
            profiles: profile ? { full_name: profile.display_name, email: profile.email } : null 
          };
        })
      );
      
      setSessions(sessionsWithProfiles);
    } catch (error) {
      console.error('세션 로드 실패:', error);
      toast.error('세션 목록을 불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [expertId]);

  // 실시간 구독
  useEffect(() => {
    const channel = supabase
      .channel('expert-realtime-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'realtime_consultation_sessions'
        },
        (payload) => {
          console.log('Session update:', payload);
          loadSessions();
          
          // 새 세션 알림
          if (payload.eventType === 'INSERT' && (payload.new as any).status === 'waiting') {
            toast.info('새로운 상담 요청이 도착했습니다!', {
              action: {
                label: '확인',
                onClick: () => {}
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [expertId]);

  // 세션 수락
  const handleAcceptSession = async (session: ConsultationSession) => {
    try {
      const { error } = await supabase
        .from('realtime_consultation_sessions')
        .update({
          expert_id: expertId,
          status: 'active'
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success('상담을 시작합니다');
      setSelectedSession({ ...session, status: 'active', expert_id: expertId });
    } catch (error) {
      console.error('세션 수락 실패:', error);
      toast.error('세션 수락에 실패했습니다');
    }
  };

  // 세션 종료
  const handleEndSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('realtime_consultation_sessions')
        .update({ status: 'ended' })
        .eq('id', sessionId);

      if (error) throw error;

      toast.info('상담이 종료되었습니다');
      setSelectedSession(null);
    } catch (error) {
      console.error('세션 종료 실패:', error);
    }
  };

  const waitingSessions = sessions.filter(s => s.status === 'waiting');
  const activeSessions = sessions.filter(s => s.status === 'active');
  const endedSessions = sessions.filter(s => s.status === 'ended');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{waitingSessions.length}</p>
              <p className="text-sm text-muted-foreground">대기중</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeSessions.length}</p>
              <p className="text-sm text-muted-foreground">진행중</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{endedSessions.length}</p>
              <p className="text-sm text-muted-foreground">완료</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">전체</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="lg:col-span-1">
          <Card className="h-[600px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">상담 요청</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="waiting" className="w-full">
                <TabsList className="w-full grid grid-cols-3 px-4">
                  <TabsTrigger value="waiting" className="relative">
                    대기
                    {waitingSessions.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {waitingSessions.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="active">진행중</TabsTrigger>
                  <TabsTrigger value="ended">완료</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[480px]">
                  <TabsContent value="waiting" className="mt-0 p-4 space-y-3">
                    {waitingSessions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>대기중인 상담이 없습니다</p>
                      </div>
                    ) : (
                      waitingSessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          onAccept={() => handleAcceptSession(session)}
                          onSelect={() => setSelectedSession(session)}
                          isSelected={selectedSession?.id === session.id}
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="active" className="mt-0 p-4 space-y-3">
                    {activeSessions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>진행중인 상담이 없습니다</p>
                      </div>
                    ) : (
                      activeSessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          onSelect={() => setSelectedSession(session)}
                          isSelected={selectedSession?.id === session.id}
                          isActive
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="ended" className="mt-0 p-4 space-y-3">
                    {endedSessions.slice(0, 10).map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onSelect={() => setSelectedSession(session)}
                        isSelected={selectedSession?.id === session.id}
                      />
                    ))}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <ExpertChatInterface
              session={selectedSession}
              onEndSession={() => handleEndSession(selectedSession.id)}
            />
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">상담을 선택하세요</p>
                <p className="text-sm">왼쪽 목록에서 상담을 선택하면 여기에 채팅이 표시됩니다</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Session Card Component
interface SessionCardProps {
  session: ConsultationSession;
  onAccept?: () => void;
  onSelect: () => void;
  isSelected?: boolean;
  isActive?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  onAccept, 
  onSelect, 
  isSelected,
  isActive 
}) => {
  const userName = session.profiles?.full_name || '사용자';

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
      } ${isActive ? 'border-green-300 bg-green-50/50' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(session.created_at), {
                  addSuffix: true,
                  locale: ko
                })}
              </p>
            </div>
          </div>
          <Badge 
            variant={session.status === 'waiting' ? 'default' : session.status === 'active' ? 'secondary' : 'outline'}
            className={
              session.status === 'waiting' ? 'bg-yellow-500' : 
              session.status === 'active' ? 'bg-green-500 text-white' : ''
            }
          >
            {session.status === 'waiting' ? '대기중' : session.status === 'active' ? '진행중' : '완료'}
          </Badge>
        </div>

        {session.status === 'waiting' && onAccept && (
          <Button 
            size="sm" 
            className="w-full mt-3"
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            상담 수락
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
