import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { GestureType } from './GestureSystem';
import type { EmotionType } from './EmotionDetector';

export interface UserPresence {
  userId: string;
  userName: string;
  avatarUrl: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  currentGesture: GestureType | null;
  currentEmotion: EmotionType;
  isSpeaking: boolean;
  timestamp: number;
}

export class RealtimePresence {
  private channel: RealtimeChannel | null = null;
  private roomId: string;
  private userId: string;
  private onPresenceChange: (presences: Record<string, UserPresence>) => void;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    roomId: string,
    userId: string,
    onPresenceChange: (presences: Record<string, UserPresence>) => void
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.onPresenceChange = onPresenceChange;
  }

  async connect(initialState: Partial<UserPresence>) {
    console.log('Connecting to presence channel:', this.roomId);
    
    this.channel = supabase.channel(`room:${this.roomId}`, {
      config: {
        presence: {
          key: this.userId,
        },
      },
    });

    // Presence 이벤트 핸들러
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState() || {};
        console.log('Presence sync:', state);
        this.onPresenceChange(this.flattenPresenceState(state));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        const state = this.channel?.presenceState() || {};
        this.onPresenceChange(this.flattenPresenceState(state));
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        const state = this.channel?.presenceState() || {};
        this.onPresenceChange(this.flattenPresenceState(state));
      });

    // 채널 구독
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to presence channel');
        // 초기 상태 전송
        await this.updatePresence(initialState);
      }
    });
  }

  async updatePresence(state: Partial<UserPresence>) {
    if (!this.channel) return;

    const presenceState: Partial<UserPresence> = {
      ...state,
      userId: this.userId,
      timestamp: Date.now(),
    };

    await this.channel.track(presenceState);
  }

  // 주기적으로 위치 업데이트 (초당 10회)
  startPeriodicUpdate(getState: () => Partial<UserPresence>) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updatePresence(getState());
    }, 100); // 100ms = 10 updates/sec
  }

  stopPeriodicUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private flattenPresenceState(state: Record<string, any[]>): Record<string, UserPresence> {
    const flattened: Record<string, UserPresence> = {};
    
    for (const userId in state) {
      const presences = state[userId];
      if (presences && presences.length > 0) {
        // 가장 최신 상태 사용
        const latest = presences[presences.length - 1] as UserPresence;
        flattened[userId] = latest;
      }
    }
    
    return flattened;
  }

  async disconnect() {
    console.log('Disconnecting from presence channel');
    this.stopPeriodicUpdate();
    
    if (this.channel) {
      await this.channel.untrack();
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
