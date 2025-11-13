export type GestureType = 'wave' | 'clap' | 'bow' | 'dance' | 'laugh' | 'cry' | 'heart' | 'thumbsup' | 'thinking' | 'celebrate' | 'idle';

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
  },
  dance: {
    name: '춤추기',
    key: '4',
    duration: 3000,
    icon: '💃'
  },
  laugh: {
    name: '웃기',
    key: '5',
    duration: 2000,
    icon: '😂'
  },
  cry: {
    name: '울기',
    key: '6',
    duration: 2500,
    icon: '😭'
  },
  heart: {
    name: '하트',
    key: '7',
    duration: 2000,
    icon: '❤️'
  },
  thumbsup: {
    name: '엄지척',
    key: '8',
    duration: 1500,
    icon: '👍'
  },
  thinking: {
    name: '생각중',
    key: '9',
    duration: 2500,
    icon: '🤔'
  },
  celebrate: {
    name: '축하',
    key: '0',
    duration: 2500,
    icon: '🎉'
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
        armRaise: 0.8,
        bodyBend: 0,
        legKick: 0,
        spin: 0
      };
    case 'clap':
      // 박수: 손뼉 치기
      return {
        armRotation: Math.abs(Math.sin(progress * Math.PI * 6)) * 0.3,
        armRaise: 0.6,
        bodyBend: 0,
        legKick: 0,
        spin: 0
      };
    case 'bow':
      // 인사: 허리 숙이기
      return {
        bodyBend: Math.sin(progress * Math.PI) * 0.3,
        armRaise: 0,
        armRotation: 0,
        legKick: 0,
        spin: 0
      };
    case 'dance':
      // 춤추기: 회전하며 팔 흔들기
      return {
        armRotation: Math.sin(progress * Math.PI * 8) * 0.8,
        armRaise: 0.7,
        bodyBend: Math.sin(progress * Math.PI * 4) * 0.15,
        legKick: Math.abs(Math.sin(progress * Math.PI * 4)) * 0.3,
        spin: progress * Math.PI * 2
      };
    case 'laugh':
      // 웃기: 위아래로 흔들리며 손으로 배 잡기
      return {
        armRotation: 0,
        armRaise: 0.4,
        bodyBend: Math.sin(progress * Math.PI * 6) * 0.1,
        legKick: 0,
        spin: 0
      };
    case 'cry':
      // 울기: 고개 숙이고 손으로 얼굴 가리기
      return {
        armRotation: 0,
        armRaise: 0.9,
        bodyBend: 0.2,
        legKick: 0,
        spin: 0
      };
    case 'heart':
      // 하트: 양손으로 하트 만들기
      return {
        armRotation: Math.sin(progress * Math.PI * 2) * 0.2,
        armRaise: 0.8,
        bodyBend: -0.1,
        legKick: 0,
        spin: 0
      };
    case 'thumbsup':
      // 엄지척: 엄지 올리기
      return {
        armRotation: 0,
        armRaise: 0.7,
        bodyBend: 0,
        legKick: 0,
        spin: 0
      };
    case 'thinking':
      // 생각중: 손을 턱에 대고 좌우로 고개 흔들기
      return {
        armRotation: Math.sin(progress * Math.PI * 2) * 0.1,
        armRaise: 0.8,
        bodyBend: 0,
        legKick: 0,
        spin: Math.sin(progress * Math.PI * 3) * 0.1
      };
    case 'celebrate':
      // 축하: 팔 올리고 점프하며 회전
      return {
        armRotation: Math.sin(progress * Math.PI * 4) * 0.6,
        armRaise: 1,
        bodyBend: -0.1,
        legKick: Math.abs(Math.sin(progress * Math.PI * 4)) * 0.5,
        spin: progress * Math.PI
      };
    default:
      return {
        armRotation: 0,
        armRaise: 0,
        bodyBend: 0,
        legKick: 0,
        spin: 0
      };
  }
};
