// 금쪽상담소 인터랙티브 스토리 시나리오 데이터
// 각 선택지는 심리적 차원(dimension)에 매핑됨

export type PsychDimension = 
  | 'anxiety'        // 불안 수준
  | 'sociality'      // 사회성
  | 'empathy'        // 공감 능력
  | 'aggression'     // 공격성/충동성
  | 'creativity'     // 창의성
  | 'self_esteem'    // 자존감
  | 'emotional_regulation' // 감정 조절
  | 'independence';  // 독립심

export interface StoryChoice {
  id: string;
  text: string;
  emoji: string;
  dimensions: Partial<Record<PsychDimension, number>>; // -2 ~ +2
  nextSceneId: string;
  parentNote?: string; // 부모에게 보이는 해석 힌트
}

export interface StoryScene {
  id: string;
  title: string;
  description: string;
  illustration: string; // emoji-based illustration
  bgColor: string;
  character?: string;
  choices: StoryChoice[];
  isEnding?: boolean;
}

export interface StoryChapter {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  scenes: StoryScene[];
  targetAge: string;
}

// ============ 챕터 1: 마법의 숲 모험 (4~7세) ============
export const chapter1: StoryChapter = {
  id: 'magic_forest',
  title: '마법의 숲 모험',
  subtitle: '작은 용사가 숲속 친구들을 도와주는 이야기',
  icon: '🌲',
  targetAge: '4~7세',
  scenes: [
    {
      id: 'forest_start',
      title: '숲의 입구',
      description: '어느 날, 우리 친구가 반짝이는 숲을 발견했어요.\n숲에서 작은 소리가 들려와요. 도와줘',
      illustration: '🌲✨🌳',
      bgColor: 'from-green-100 to-emerald-200',
      choices: [
        {
          id: 'brave_enter',
          text: '용감하게 숲으로 들어간다!',
          emoji: '🦸',
          dimensions: { independence: 2, anxiety: -1 },
          nextSceneId: 'meet_bunny',
          parentNote: '새로운 상황에 적극적으로 접근'
        },
        {
          id: 'careful_look',
          text: '먼저 주변을 살펴본다',
          emoji: '🔍',
          dimensions: { anxiety: 1, creativity: 1 },
          nextSceneId: 'meet_bunny',
          parentNote: '신중한 성격, 관찰력 있음'
        },
        {
          id: 'call_help',
          text: '"누구야?" 하고 큰 소리로 물어본다',
          emoji: '📢',
          dimensions: { sociality: 1, self_esteem: 1 },
          nextSceneId: 'meet_bunny',
          parentNote: '소통을 통해 상황 파악 시도'
        }
      ]
    },
    {
      id: 'meet_bunny',
      title: '울고 있는 토끼',
      description: '숲속에서 작은 토끼가 울고 있어요.\n"내 당근을 높은 나무 위에 놓고 내려올 수가 없어..."',
      illustration: '🐰😢🥕🌳',
      bgColor: 'from-yellow-100 to-amber-200',
      character: '토끼',
      choices: [
        {
          id: 'climb_tree',
          text: '직접 나무에 올라가서 당근을 가져다 준다',
          emoji: '🧗',
          dimensions: { empathy: 2, independence: 1, aggression: -1 },
          nextSceneId: 'river_crossing',
          parentNote: '타인을 위한 적극적인 행동'
        },
        {
          id: 'comfort_bunny',
          text: '"울지 마, 같이 방법을 찾아보자"',
          emoji: '🤗',
          dimensions: { empathy: 2, sociality: 2, emotional_regulation: 1 },
          nextSceneId: 'river_crossing',
          parentNote: '감정적 공감과 협력적 문제해결'
        },
        {
          id: 'find_stick',
          text: '긴 나뭇가지를 찾아서 당근을 떨어뜨린다',
          emoji: '🪵',
          dimensions: { creativity: 2, independence: 1 },
          nextSceneId: 'river_crossing',
          parentNote: '도구 활용, 창의적 문제해결'
        },
        {
          id: 'ignore_bunny',
          text: '토끼를 지나쳐서 계속 간다',
          emoji: '🚶',
          dimensions: { empathy: -2, independence: 2, anxiety: 1 },
          nextSceneId: 'river_crossing',
          parentNote: '타인의 감정에 대한 반응 부족 (관찰 필요)'
        }
      ]
    },
    {
      id: 'river_crossing',
      title: '넓은 강가',
      description: '앞에 넓은 강이 나타났어요! 건너편에 예쁜 꽃밭이 보여요.\n다리가 좀 흔들흔들거려요...',
      illustration: '🌊🌉🌺',
      bgColor: 'from-blue-100 to-cyan-200',
      choices: [
        {
          id: 'cross_bridge',
          text: '흔들다리를 조심조심 건넌다',
          emoji: '🌉',
          dimensions: { anxiety: -1, self_esteem: 1, emotional_regulation: 1 },
          nextSceneId: 'dark_cave',
          parentNote: '두려움을 극복하는 능력'
        },
        {
          id: 'find_another',
          text: '다른 길을 찾아본다',
          emoji: '🗺️',
          dimensions: { anxiety: 1, creativity: 1, independence: 1 },
          nextSceneId: 'dark_cave',
          parentNote: '위험 회피, 대안 탐색'
        },
        {
          id: 'swim_across',
          text: '수영해서 건너간다!',
          emoji: '🏊',
          dimensions: { aggression: 1, independence: 2, anxiety: -2 },
          nextSceneId: 'dark_cave',
          parentNote: '충동적 경향, 높은 모험심'
        }
      ]
    },
    {
      id: 'dark_cave',
      title: '어두운 동굴',
      description: '갑자기 하늘이 어두워지고 비가 올 것 같아요.\n근처에 동굴이 있는데, 안에서 이상한 소리가 나요...',
      illustration: '🌧️🕳️👀',
      bgColor: 'from-slate-200 to-gray-300',
      choices: [
        {
          id: 'enter_cave',
          text: '동굴 안으로 들어가 비를 피한다',
          emoji: '🏕️',
          dimensions: { anxiety: -1, independence: 1 },
          nextSceneId: 'treasure_room',
          parentNote: '불확실한 상황에서의 결단력'
        },
        {
          id: 'make_shelter',
          text: '나뭇잎으로 비를 막을 걸 만든다',
          emoji: '🍃',
          dimensions: { creativity: 2, independence: 2, emotional_regulation: 1 },
          nextSceneId: 'treasure_room',
          parentNote: '자주적 문제해결, 창의성'
        },
        {
          id: 'wait_outside',
          text: '비가 그칠 때까지 기다린다',
          emoji: '⏳',
          dimensions: { emotional_regulation: 2, anxiety: 1 },
          nextSceneId: 'treasure_room',
          parentNote: '인내심, 감정 조절 능력'
        }
      ]
    },
    {
      id: 'treasure_room',
      title: '보물 상자 발견!',
      description: '와! 반짝이는 보물상자를 발견했어요!\n상자 안에는 세 가지 보물이 있어요. 하나만 가져갈 수 있대요.',
      illustration: '✨🎁💎',
      bgColor: 'from-amber-100 to-yellow-200',
      choices: [
        {
          id: 'take_crown',
          text: '빛나는 왕관 👑',
          emoji: '👑',
          dimensions: { self_esteem: 2, aggression: 1 },
          nextSceneId: 'final_choice',
          parentNote: '권력/인정 욕구'
        },
        {
          id: 'take_book',
          text: '마법의 이야기책 📚',
          emoji: '📚',
          dimensions: { creativity: 2, empathy: 1 },
          nextSceneId: 'final_choice',
          parentNote: '지적 호기심, 상상력'
        },
        {
          id: 'take_heart',
          text: '친구를 만들 수 있는 목걸이 💝',
          emoji: '💝',
          dimensions: { sociality: 2, empathy: 2 },
          nextSceneId: 'final_choice',
          parentNote: '관계 지향, 사회적 욕구'
        }
      ]
    },
    {
      id: 'final_choice',
      title: '숲의 끝, 두 갈래 길',
      description: '드디어 숲의 끝에 도착했어요!\n한쪽은 마을로 가는 길, 다른 쪽은 더 큰 모험이 기다리는 산이에요.\n뒤에서 숲속 친구들이 "또 놀러 와!" 하고 외쳐요.',
      illustration: '🏘️↔️🏔️',
      bgColor: 'from-purple-100 to-pink-200',
      choices: [
        {
          id: 'go_village',
          text: '마을로 돌아가서 모험 이야기를 들려준다',
          emoji: '🏠',
          dimensions: { sociality: 2, emotional_regulation: 1 },
          nextSceneId: 'ending',
          parentNote: '사회적 연결 중시, 경험 공유 욕구'
        },
        {
          id: 'go_mountain',
          text: '더 큰 모험을 하러 산으로 간다!',
          emoji: '⛰️',
          dimensions: { independence: 2, anxiety: -2, creativity: 1 },
          nextSceneId: 'ending',
          parentNote: '높은 탐험 욕구, 도전 정신'
        },
        {
          id: 'stay_forest',
          text: '숲속 친구들과 더 놀기로 한다',
          emoji: '🤝',
          dimensions: { empathy: 2, sociality: 2, self_esteem: 1 },
          nextSceneId: 'ending',
          parentNote: '관계 유지 욕구, 친밀감 중시'
        }
      ]
    },
    {
      id: 'ending',
      title: '모험 끝!',
      description: '정말 멋진 모험이었어요! 🎉\n우리 친구는 오늘 숲에서 많은 걸 배웠답니다.',
      illustration: '🌟🎊🌈',
      bgColor: 'from-pink-100 to-rose-200',
      isEnding: true,
      choices: []
    }
  ]
};

// 심리 차원 메타데이터
export const dimensionMeta: Record<PsychDimension, { label: string; icon: string; description: string; lowLabel: string; highLabel: string }> = {
  anxiety: { label: '안정감', icon: '🛡️', description: '새로운 상황에서의 편안함 수준', lowLabel: '높은 불안', highLabel: '매우 안정적' },
  sociality: { label: '사회성', icon: '👫', description: '타인과의 관계 형성 능력', lowLabel: '내향적', highLabel: '매우 사교적' },
  empathy: { label: '공감 능력', icon: '💕', description: '타인의 감정을 이해하는 능력', lowLabel: '자기중심적', highLabel: '높은 공감' },
  aggression: { label: '충동 조절', icon: '⚡', description: '행동의 충동성 수준', lowLabel: '매우 신중', highLabel: '충동적 경향' },
  creativity: { label: '창의성', icon: '🎨', description: '문제 해결에서의 독창성', lowLabel: '정형적', highLabel: '매우 창의적' },
  self_esteem: { label: '자존감', icon: '⭐', description: '자기 자신에 대한 긍정적 인식', lowLabel: '낮은 자존감', highLabel: '높은 자존감' },
  emotional_regulation: { label: '감정 조절', icon: '🧘', description: '감정을 적절히 표현하고 조절하는 능력', lowLabel: '조절 어려움', highLabel: '우수한 조절' },
  independence: { label: '독립심', icon: '🚀', description: '스스로 문제를 해결하려는 의지', lowLabel: '의존적', highLabel: '매우 독립적' }
};

import { villageChapter } from './villageScenarios';
import { climbChapter, escapeChapter } from './viralGameChapters';

export const allChapters: StoryChapter[] = [chapter1, villageChapter, climbChapter, escapeChapter];
