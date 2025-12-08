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
  Sparkles,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ExpertChatInterface } from './ExpertChatInterface';
import { motion, AnimatePresence } from 'framer-motion';

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
      const { data, error } = await supabase
        .from('realtime_consultation_sessions')
        .select('*')
        .or(`expert_id.eq.${expertId},and(status.eq.waiting,expert_id.is.null)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
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
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: '대기중', 
      value: waitingSessions.length, 
      icon: Bell,
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      pulse: waitingSessions.length > 0
    },
    { 
      label: '진행중', 
      value: activeSessions.length, 
      icon: MessageCircle,
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      pulse: false
    },
    { 
      label: '완료', 
      value: endedSessions.length, 
      icon: CheckCircle,
      gradient: 'from-slate-400 to-zinc-500',
      bgGradient: 'from-slate-50 to-zinc-50',
      iconBg: 'bg-gradient-to-br from-slate-400 to-zinc-500',
      pulse: false
    },
    { 
      label: '전체', 
      value: sessions.length, 
      icon: Activity,
      gradient: 'from-violet-400 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500',
      pulse: false
    },
  ];

  return (
    <div className="space-y-6 p-1">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.03]`} />
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`relative p-3.5 ${stat.iconBg} rounded-2xl shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                  {stat.pulse && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  )}
                </div>
                <div>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-[650px] overflow-hidden border-0 shadow-xl bg-gradient-to-b from-background to-muted/20">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                상담 요청
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="active" className="w-full">
                <div className="px-4 pt-4">
                  <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger 
                      value="waiting" 
                      className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                    >
                      대기
                      {waitingSessions.length > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          {waitingSessions.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="active"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                    >
                      진행중
                    </TabsTrigger>
                    <TabsTrigger 
                      value="ended"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                    >
                      완료
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[530px]">
                  <TabsContent value="waiting" className="mt-0 p-4 space-y-3">
                    <AnimatePresence>
                      {waitingSessions.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 opacity-50" />
                          </div>
                          <p className="font-medium">대기중인 상담이 없습니다</p>
                        </motion.div>
                      ) : (
                        waitingSessions.map((session, index) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <SessionCard
                              session={session}
                              onAccept={() => handleAcceptSession(session)}
                              onSelect={() => setSelectedSession(session)}
                              isSelected={selectedSession?.id === session.id}
                            />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="active" className="mt-0 p-4 space-y-3">
                    <AnimatePresence>
                      {activeSessions.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 opacity-50" />
                          </div>
                          <p className="font-medium">진행중인 상담이 없습니다</p>
                        </motion.div>
                      ) : (
                        activeSessions.map((session, index) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <SessionCard
                              session={session}
                              onSelect={() => setSelectedSession(session)}
                              isSelected={selectedSession?.id === session.id}
                              isActive
                            />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="ended" className="mt-0 p-4 space-y-3">
                    {endedSessions.slice(0, 10).map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SessionCard
                          session={session}
                          onSelect={() => setSelectedSession(session)}
                          isSelected={selectedSession?.id === session.id}
                        />
                      </motion.div>
                    ))}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Interface */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {selectedSession ? (
            <ExpertChatInterface
              session={selectedSession}
              onEndSession={() => handleEndSession(selectedSession.id)}
            />
          ) : (
            <Card className="h-[650px] flex items-center justify-center border-0 shadow-xl bg-gradient-to-br from-background via-muted/10 to-primary/5">
              <div className="text-center text-muted-foreground">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full animate-pulse" />
                  <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-primary/40" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-foreground/70">상담을 선택하세요</p>
                <p className="text-sm mt-2">왼쪽 목록에서 상담을 선택하면<br/>여기에 채팅이 표시됩니다</p>
              </div>
            </Card>
          )}
        </motion.div>
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
      className={`cursor-pointer transition-all duration-300 border-0 shadow-md hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-primary bg-gradient-to-r from-primary/10 to-violet-500/10 scale-[1.02]' 
          : 'hover:bg-gradient-to-r hover:from-muted/50 hover:to-transparent hover:scale-[1.01]'
      } ${isActive ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-l-emerald-500' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 ring-2 ring-offset-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/20">
                <User className="w-5 h-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(session.created_at), {
                  addSuffix: true,
                  locale: ko
                })}
              </p>
            </div>
          </div>
          <Badge 
            className={`font-medium shadow-sm ${
              session.status === 'waiting' 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0' 
                : session.status === 'active' 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0' 
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {session.status === 'waiting' ? '대기중' : session.status === 'active' ? '진행중' : '완료'}
          </Badge>
        </div>

        {session.status === 'waiting' && onAccept && (
          <Button 
            size="sm" 
            className="w-full mt-4 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg hover:shadow-xl transition-all"
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
