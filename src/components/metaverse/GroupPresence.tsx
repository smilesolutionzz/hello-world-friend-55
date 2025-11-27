import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Users, User } from 'lucide-react';
import { ReadyPlayerMeAvatar } from './ReadyPlayerMeAvatar';

export interface UserPresence {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  position?: { x: number; y: number; z: number };
  emotion?: string;
  online_at: string;
}

interface GroupPresenceProps {
  roomId: string;
  userName: string;
  avatarUrl?: string;
  position?: { x: number; y: number; z: number };
  emotion?: string;
  enabled?: boolean;
}

export const GroupPresence = ({ 
  roomId, 
  userName, 
  avatarUrl, 
  position,
  emotion,
  enabled = false 
}: GroupPresenceProps) => {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const presenceChannel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: userName,
        },
      },
    });

    // 상태 동기화
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const presenceUsers: UserPresence[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key];
          if (presences && Array.isArray(presences)) {
            presences.forEach((presence: any) => {
              if (presence.user_id && presence.user_name && presence.online_at) {
                presenceUsers.push(presence as UserPresence);
              }
            });
          }
        });
        
        console.log('👥 Users in room:', presenceUsers);
        setUsers(presenceUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👤 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 자신의 상태 전송
          await presenceChannel.track({
            user_id: crypto.randomUUID(),
            user_name: userName,
            avatar_url: avatarUrl,
            position: position || { x: 0, y: 0, z: 0 },
            emotion: emotion || 'neutral',
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [roomId, userName, avatarUrl, enabled]);

  // 위치나 감정이 변경되면 업데이트
  useEffect(() => {
    if (channel && enabled) {
      channel.track({
        user_id: crypto.randomUUID(),
        user_name: userName,
        avatar_url: avatarUrl,
        position: position || { x: 0, y: 0, z: 0 },
        emotion: emotion || 'neutral',
        online_at: new Date().toISOString(),
      });
    }
  }, [position, emotion, channel, enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* 다른 사용자들의 아바타 렌더링 */}
      {users
        .filter(user => user.user_name !== userName)
        .map((user, index) => (
          <group key={user.user_id || index}>
            <ReadyPlayerMeAvatar
              position={[
                (user.position?.x || 0) + (index * 2),
                user.position?.y || -1.5,
                (user.position?.z || 0) - 2
              ]}
              avatarUrl={user.avatar_url}
              scale={1.5}
              emotion={(user.emotion as any) || 'neutral'}
              emotionIntensity={0.5}
            />
            {/* 사용자 이름 표시 */}
            <mesh position={[(user.position?.x || 0) + (index * 2), 1, (user.position?.z || 0) - 2]}>
              <planeGeometry args={[1, 0.3]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.6} />
            </mesh>
          </group>
        ))}
    </>
  );
};

// 그룹 상담 사용자 목록 UI
export const GroupUserList = ({ users, currentUser }: { users: UserPresence[], currentUser: string }) => {
  return (
    <Card className="fixed top-4 right-4 p-4 bg-black/60 backdrop-blur-sm border-white/20 min-w-[200px] z-20">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-white" />
        <span className="text-white font-semibold text-sm">참여자 ({users.length})</span>
      </div>
      <div className="space-y-2">
        {users.map((user, index) => (
          <div 
            key={user.user_id || index} 
            className={`flex items-center gap-2 px-2 py-1 rounded ${
              user.user_name === currentUser ? 'bg-primary/20' : 'bg-white/10'
            }`}
          >
            <User className="w-3 h-3 text-white/70" />
            <span className="text-white text-xs">
              {user.user_name}
              {user.user_name === currentUser && ' (나)'}
            </span>
            <div className={`ml-auto w-2 h-2 rounded-full ${
              user.online_at ? 'bg-green-500' : 'bg-gray-500'
            }`} />
          </div>
        ))}
      </div>
    </Card>
  );
};
