export type GestureType = 'wave' | 'clap' | 'bow' | 'idle';

export interface GestureState {
  type: GestureType;
  startTime: number;
  duration: number;
}

export const GESTURES = {
  wave: {
    name: '손 흔들기',
    key: '1',
    duration: 2000,
    icon: '👋'
  },
  clap: {
    name: '박수',
    key: '2',
    duration: 1500,
    icon: '👏'
  },
  bow: {
    name: '인사',
    key: '3',
    duration: 2000,
    icon: '🙇'
  }
} as const;

export class GestureManager {
  private currentGesture: GestureState | null = null;
  private onGestureChange: (gesture: GestureState | null) => void;

  constructor(onGestureChange: (gesture: GestureState | null) => void) {
    this.onGestureChange = onGestureChange;
  }

  playGesture(type: GestureType) {
    if (type === 'idle') {
      this.currentGesture = null;
      this.onGestureChange(null);
      return;
    }

    const gesture = GESTURES[type];
    this.currentGesture = {
      type,
      startTime: Date.now(),
      duration: gesture.duration
    };
    
    this.onGestureChange(this.currentGesture);

    // 자동으로 idle로 돌아가기
    setTimeout(() => {
      this.currentGesture = null;
      this.onGestureChange(null);
    }, gesture.duration);
  }

  getCurrentGesture(): GestureState | null {
    return this.currentGesture;
  }
}

// 제스처 애니메이션 헬퍼
export const getGestureAnimation = (gesture: GestureType, progress: number) => {
  switch (gesture) {
    case 'wave':
      // 손 흔들기: 좌우로 흔들기
      return {
        armRotation: Math.sin(progress * Math.PI * 4) * 0.5,
        armRaise: 0.8
      };
    case 'clap':
      // 박수: 손뼉 치기
      return {
        armRotation: Math.abs(Math.sin(progress * Math.PI * 6)) * 0.3,
        armRaise: 0.6
      };
    case 'bow':
      // 인사: 허리 숙이기
      return {
        bodyBend: Math.sin(progress * Math.PI) * 0.3,
        armRaise: 0
      };
    default:
      return {
        armRotation: 0,
        armRaise: 0,
        bodyBend: 0
      };
  }
};
