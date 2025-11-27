// 메타버스 공간 타입 정의

export type SpaceType = 
  | 'counseling1'      // 현대적 상담실
  | 'counseling2'      // 자연 테마 상담실
  | 'counseling3'      // 미래적 상담실
  | 'lounge'           // 휴게 공간
  | 'outdoor'          // 야외 공간
  | 'meditation'       // 명상실
  | 'exercise'         // 운동실
  | 'game'             // 게임룸
  | 'interview';       // 면접실

export interface SpaceDefinition {
  id: SpaceType;
  name: string;
  description: string;
  icon: string;
  color: string;
  portals: Portal[];
}

export interface Portal {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  targetSpace: SpaceType;
  label: string;
  color: string;
}

// 각 공간의 정의
export const SPACES: Record<SpaceType, SpaceDefinition> = {
  counseling1: {
    id: 'counseling1',
    name: '현대적 상담실',
    description: '밝고 따뜻한 분위기의 상담실',
    icon: '🏢',
    color: '#4F46E5',
    portals: [
      { 
        id: 'to-lounge', 
        position: [8, 0, 0], 
        rotation: [0, -Math.PI/2, 0],
        targetSpace: 'lounge', 
        label: '휴게실', 
        color: '#10B981' 
      },
      { 
        id: 'to-counseling2', 
        position: [0, 0, 8], 
        rotation: [0, Math.PI, 0],
        targetSpace: 'counseling2', 
        label: '자연 상담실', 
        color: '#059669' 
      }
    ]
  },
  counseling2: {
    id: 'counseling2',
    name: '자연 테마 상담실',
    description: '숲속 같은 편안한 분위기',
    icon: '🌳',
    color: '#059669',
    portals: [
      { 
        id: 'to-outdoor', 
        position: [8, 0, 0], 
        rotation: [0, -Math.PI/2, 0],
        targetSpace: 'outdoor', 
        label: '야외 공간', 
        color: '#0EA5E9' 
      },
      { 
        id: 'to-counseling1', 
        position: [0, 0, -8], 
        rotation: [0, 0, 0],
        targetSpace: 'counseling1', 
        label: '현대적 상담실', 
        color: '#4F46E5' 
      },
      { 
        id: 'to-counseling3', 
        position: [-8, 0, 0], 
        rotation: [0, Math.PI/2, 0],
        targetSpace: 'counseling3', 
        label: '미래 상담실', 
        color: '#8B5CF6' 
      }
    ]
  },
  counseling3: {
    id: 'counseling3',
    name: '미래적 상담실',
    description: '첨단 기술의 상담 공간',
    icon: '🚀',
    color: '#8B5CF6',
    portals: [
      { 
        id: 'to-counseling2', 
        position: [8, 0, 0], 
        rotation: [0, -Math.PI/2, 0],
        targetSpace: 'counseling2', 
        label: '자연 상담실', 
        color: '#059669' 
      },
      { 
        id: 'to-meditation', 
        position: [0, 0, 8], 
        rotation: [0, Math.PI, 0],
        targetSpace: 'meditation', 
        label: '명상실', 
        color: '#EC4899' 
      }
    ]
  },
  lounge: {
    id: 'lounge',
    name: '휴게 공간',
    description: '편안하게 쉴 수 있는 공간',
    icon: '☕',
    color: '#10B981',
    portals: [
      { 
        id: 'to-counseling1', 
        position: [-8, 0, 0], 
        rotation: [0, Math.PI/2, 0],
        targetSpace: 'counseling1', 
        label: '현대적 상담실', 
        color: '#4F46E5' 
      },
      { 
        id: 'to-game', 
        position: [0, 0, 8], 
        rotation: [0, Math.PI, 0],
        targetSpace: 'game', 
        label: '게임룸', 
        color: '#F59E0B' 
      },
      { 
        id: 'to-interview', 
        position: [0, 0, -8], 
        rotation: [0, 0, 0],
        targetSpace: 'interview', 
        label: '면접실', 
        color: '#6366F1' 
      },
      { 
        id: 'to-exercise', 
        position: [8, 0, 0], 
        rotation: [0, -Math.PI/2, 0],
        targetSpace: 'exercise', 
        label: '운동실', 
        color: '#EF4444' 
      }
    ]
  },
  outdoor: {
    id: 'outdoor',
    name: '야외 정원',
    description: '자연 속에서 힐링하는 공간',
    icon: '🌸',
    color: '#0EA5E9',
    portals: [
      { 
        id: 'to-counseling2', 
        position: [-8, 0, 0], 
        rotation: [0, Math.PI/2, 0],
        targetSpace: 'counseling2', 
        label: '자연 상담실', 
        color: '#059669' 
      }
    ]
  },
  meditation: {
    id: 'meditation',
    name: '명상실',
    description: '마음의 평화를 찾는 공간',
    icon: '🧘',
    color: '#EC4899',
    portals: [
      { 
        id: 'to-counseling3', 
        position: [0, 0, -8], 
        rotation: [0, 0, 0],
        targetSpace: 'counseling3', 
        label: '미래 상담실', 
        color: '#8B5CF6' 
      }
    ]
  },
  exercise: {
    id: 'exercise',
    name: '운동실',
    description: '스트레스 해소를 위한 운동 공간',
    icon: '💪',
    color: '#EF4444',
    portals: [
      { 
        id: 'to-lounge', 
        position: [-8, 0, 0], 
        rotation: [0, Math.PI/2, 0],
        targetSpace: 'lounge', 
        label: '휴게실', 
        color: '#10B981' 
      }
    ]
  },
  game: {
    id: 'game',
    name: '게임룸',
    description: '즐거운 게임으로 기분 전환',
    icon: '🎮',
    color: '#F59E0B',
    portals: [
      { 
        id: 'to-lounge', 
        position: [0, 0, -8], 
        rotation: [0, 0, 0],
        targetSpace: 'lounge', 
        label: '휴게실', 
        color: '#10B981' 
      }
    ]
  },
  interview: {
    id: 'interview',
    name: '면접실',
    description: '전문적인 면접 연습 공간',
    icon: '💼',
    color: '#6366F1',
    portals: [
      { 
        id: 'to-lounge', 
        position: [0, 0, -8], 
        rotation: [0, 0, 0],
        targetSpace: 'lounge', 
        label: '휴게실', 
        color: '#10B981' 
      }
    ]
  }
};
