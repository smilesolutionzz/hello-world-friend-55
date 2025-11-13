import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Users, User } from 'lucide-react';
import { RealtimePresence, type UserPresence } from '@/utils/RealtimePresence';
import { OtherUserAvatar } from './OtherUserAvatar';
import type { GestureType } from '@/utils/GestureSystem';
import type { EmotionType } from '@/utils/EmotionDetector';

interface GroupPresenceProps {
  roomId: string;
  userName: string;
  avatarUrl?: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  emotion?: EmotionType;
  currentGesture?: GestureType | null;
  isSpeaking?: boolean;
  enabled?: boolean;
  onPresenceChange?: (users: UserPresence[]) => void;
}

export const GroupPresence = ({ 
  roomId, 
  userName, 
  avatarUrl, 
  position,
  rotation,
  emotion,
  currentGesture,
  isSpeaking,
  enabled = false,
  onPresenceChange
}: GroupPresenceProps) => {
  const [otherUsers, setOtherUsers] = useState<Record<string, UserPresence>>({});
  const presenceRef = useRef<RealtimePresence | null>(null);
  const userIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (!enabled) return;

    console.log('🚀 Initializing group presence for room:', roomId);
    
    const presence = new RealtimePresence(
      roomId,
      userIdRef.current,
      (presences) => {
        console.log('👥 Presence update:', presences);
        // 자신을 제외한 다른 사용자들만 필터링
        const filtered = Object.fromEntries(
          Object.entries(presences).filter(([id]) => id !== userIdRef.current)
        );
        setOtherUsers(filtered);
        
        // 콜백 호출
        if (onPresenceChange) {
          onPresenceChange(Object.values(filtered));
        }
      }
    );

    // 초기 연결
    presence.connect({
      userId: userIdRef.current,
      userName,
      avatarUrl: avatarUrl || '',
      position: position || { x: 0, y: -1.5, z: 3 },
      rotation: rotation || { x: 0, y: 0, z: 0 },
      currentGesture: currentGesture || null,
      currentEmotion: emotion || 'neutral',
      isSpeaking: isSpeaking || false,
    });

    presenceRef.current = presence;

    // 주기적 업데이트 시작
    presence.startPeriodicUpdate(() => ({
      userId: userIdRef.current,
      userName,
      avatarUrl: avatarUrl || '',
      position: position || { x: 0, y: -1.5, z: 3 },
      rotation: rotation || { x: 0, y: 0, z: 0 },
      currentGesture: currentGesture || null,
      currentEmotion: emotion || 'neutral',
      isSpeaking: isSpeaking || false,
    }));

    return () => {
      console.log('🔌 Disconnecting from group presence');
      presence.disconnect();
    };
  }, [enabled, roomId]);

  // 상태 변경 시 업데이트 (주기적 업데이트와 별개로 즉시 반영)
  useEffect(() => {
    if (presenceRef.current && enabled) {
      presenceRef.current.updatePresence({
        userId: userIdRef.current,
        userName,
        avatarUrl: avatarUrl || '',
        position: position || { x: 0, y: -1.5, z: 3 },
        rotation: rotation || { x: 0, y: 0, z: 0 },
        currentGesture: currentGesture || null,
        currentEmotion: emotion || 'neutral',
        isSpeaking: isSpeaking || false,
      });
    }
  }, [position, rotation, emotion, currentGesture, isSpeaking, enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* 다른 사용자들의 아바타 렌더링 */}
      {Object.values(otherUsers).map((user) => (
        <OtherUserAvatar key={user.userId} presence={user} />
      ))}
    </>
  );
};

// 그룹 상담 사용자 목록 UI
export const GroupUserList = ({ users, currentUser }: { users: UserPresence[], currentUser: string }) => {
  return (
    <Card className="fixed top-20 right-4 p-4 bg-black/60 backdrop-blur-sm border-white/20 min-w-[200px] z-20">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-white" />
        <span className="text-white font-semibold text-sm">참여자 ({users.length + 1})</span>
      </div>
      <div className="space-y-2">
        {/* 자신 표시 */}
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-primary/20">
          <User className="w-3 h-3 text-white/70" />
          <span className="text-white text-xs">
            {currentUser} (나)
          </span>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
        </div>
        
        {/* 다른 사용자들 */}
        {users.map((user) => (
          <div 
            key={user.userId} 
            className="flex items-center gap-2 px-2 py-1 rounded bg-white/10"
          >
            <User className="w-3 h-3 text-white/70" />
            <span className="text-white text-xs">
              {user.userName}
              {user.isSpeaking && ' 🎤'}
            </span>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
          </div>
        ))}
      </div>
    </Card>
  );
};
