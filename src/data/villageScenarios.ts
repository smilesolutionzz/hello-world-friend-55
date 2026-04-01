// 마을 탐험 모험 시나리오 - 종합 행동 분석
// 사회성, 감정조절, 충동성, 문제해결, 창의성, 공감능력 등 종합 측정

import type { PsychDimension, StoryChoice, StoryScene, StoryChapter } from './storyScenarios';

// ============ 챕터 2: 해바라기 마을 탐험 (5~9세) ============
export const villageChapter: StoryChapter = {
  id: 'sunflower_village',
  title: '해바라기 마을 탐험',
  subtitle: '마을 친구들의 고민을 해결하며 성장하는 이야기',
  icon: '🏘️',
  targetAge: '5~9세',
  scenes: [
    // ---- 1. 마을 광장 도착 ----
    {
      id: 'village_square',
      title: '마을 광장',
      description: '와! 해바라기 마을에 도착했어요!\n광장에서 마을 친구들이 손을 흔들고 있어요.\n어디부터 가볼까요?',
      illustration: '🏘️🌻☀️',
      bgColor: 'from-amber-100 to-yellow-200',
      choices: [
        {
          id: 'go_playground',
          text: '놀이터에서 놀고 있는 친구들에게 간다',
          emoji: '🎪',
          dimensions: { sociality: 2, anxiety: -1 },
          nextSceneId: 'playground_conflict',
          parentNote: '사회적 상호작용에 적극적 접근'
        },
        {
          id: 'go_bakery',
          text: '맛있는 냄새가 나는 빵집으로 간다',
          emoji: '🍞',
          dimensions: { creativity: 1, independence: 1 },
          nextSceneId: 'bakery_help',
          parentNote: '호기심 주도의 탐색, 감각적 탐구'
        },
        {
          id: 'go_park',
          text: '혼자 울고 있는 아이에게 다가간다',
          emoji: '😢',
          dimensions: { empathy: 2, sociality: 1 },
          nextSceneId: 'crying_child',
          parentNote: '높은 공감 능력, 타인의 감정에 민감'
        }
      ]
    },

    // ---- 2a. 놀이터 갈등 ----
    {
      id: 'playground_conflict',
      title: '놀이터 소동',
      description: '놀이터에서 두 친구가 그네를 놓고 싸우고 있어요!\n"내가 먼저야!" "아니, 내가 먼저!"\n어떻게 할까요?',
      illustration: '🎪⚡😤',
      bgColor: 'from-orange-100 to-red-100',
      character: '다투는 친구들',
      choices: [
        {
          id: 'mediate',
          text: '"번갈아 타면 어때?" 하고 중재한다',
          emoji: '🤝',
          dimensions: { sociality: 2, emotional_regulation: 2, empathy: 1 },
          nextSceneId: 'market_delivery',
          parentNote: '갈등 해결 능력 우수, 협상력'
        },
        {
          id: 'take_side',
          text: '먼저 온 친구 편을 들어준다',
          emoji: '⚖️',
          dimensions: { empathy: 1, aggression: -1, independence: 1 },
          nextSceneId: 'market_delivery',
          parentNote: '규칙과 공정성 중시, 판단력'
        },
        {
          id: 'suggest_other',
          text: '"다른 놀이를 같이 하자!" 새로운 제안',
          emoji: '💡',
          dimensions: { creativity: 2, sociality: 1, emotional_regulation: 1 },
          nextSceneId: 'market_delivery',
          parentNote: '창의적 문제해결, 갈등 회피보다 전환 능력'
        },
        {
          id: 'walk_away',
          text: '싸움이 무서워서 다른 곳으로 간다',
          emoji: '🚶',
          dimensions: { anxiety: 2, aggression: -2 },
          nextSceneId: 'market_delivery',
          parentNote: '갈등 회피 경향, 불안 수준 관찰 필요'
        }
      ]
    },

    // ---- 2b. 빵집 도움 ----
    {
      id: 'bakery_help',
      title: '빵집 아저씨의 부탁',
      description: '빵집 아저씨가 곤란한 표정이에요.\n"오늘 주문이 너무 많은데, 혹시 도와줄 수 있니?"\n빵 반죽이 여기저기 흩어져 있어요!',
      illustration: '🧁🍰🥖',
      bgColor: 'from-amber-100 to-orange-100',
      character: '빵집 아저씨',
      choices: [
        {
          id: 'help_eagerly',
          text: '"네! 제가 도울게요!" 신나게 돕는다',
          emoji: '💪',
          dimensions: { empathy: 1, sociality: 1, self_esteem: 1 },
          nextSceneId: 'market_delivery',
          parentNote: '돕기 행동에 적극적, 높은 자기효능감'
        },
        {
          id: 'help_creative',
          text: '별 모양, 하트 모양으로 예쁘게 만든다',
          emoji: '⭐',
          dimensions: { creativity: 2, self_esteem: 1 },
          nextSceneId: 'market_delivery',
          parentNote: '창의적 표현 욕구, 미적 감각'
        },
        {
          id: 'help_reluctant',
          text: '"음... 잘 할 수 있을까?" 망설인다',
          emoji: '😰',
          dimensions: { anxiety: 1, self_esteem: -1 },
          nextSceneId: 'market_delivery',
          parentNote: '자신감 부족, 실패에 대한 두려움'
        }
      ]
    },

    // ---- 2c. 울고 있는 아이 ----
    {
      id: 'crying_child',
      title: '울고 있는 친구',
      description: '벤치에서 울고 있는 친구를 발견했어요.\n"나... 엄마가 보고 싶어..." 하고 울고 있네요.\n어떻게 해줄까요?',
      illustration: '😢🪑🌸',
      bgColor: 'from-blue-100 to-indigo-100',
      character: '울고 있는 친구',
      choices: [
        {
          id: 'comfort_hug',
          text: '옆에 앉아서 "괜찮아" 하고 토닥여준다',
          emoji: '🤗',
          dimensions: { empathy: 2, emotional_regulation: 1, sociality: 1 },
          nextSceneId: 'market_delivery',
          parentNote: '정서적 공감과 위로 능력이 높음'
        },
        {
          id: 'comfort_distract',
          text: '"저기 예쁜 꽃이 있어! 같이 보러 갈래?"',
          emoji: '🌷',
          dimensions: { creativity: 1, empathy: 1, sociality: 1 },
          nextSceneId: 'market_delivery',
          parentNote: '주의 전환을 통한 정서 조절 시도'
        },
        {
          id: 'comfort_solution',
          text: '"같이 엄마를 찾으러 가자!"',
          emoji: '🔍',
          dimensions: { independence: 2, empathy: 1 },
          nextSceneId: 'market_delivery',
          parentNote: '문제 해결 지향적 접근'
        }
      ]
    },

    // ---- 3. 시장 배달 미션 ----
    {
      id: 'market_delivery',
      title: '시장 배달 미션',
      description: '마을 시장에서 할머니가 무거운 짐을 들고 힘들어하세요.\n"아이고, 이걸 저쪽 가게까지 가져다줄 사람 없나..."\n그런데 친구들이 재밌는 놀이를 하자고 불러요!',
      illustration: '🏪👵📦',
      bgColor: 'from-green-100 to-teal-100',
      character: '할머니',
      choices: [
        {
          id: 'help_grandma',
          text: '친구들한테 "잠깐!" 하고 할머니를 도와드린다',
          emoji: '💝',
          dimensions: { empathy: 2, self_esteem: 1, emotional_regulation: 1, independence: 1 },
          nextSceneId: 'storm_coming',
          parentNote: '이타적 행동, 즉각적 보상보다 도움 우선시'
        },
        {
          id: 'ask_friends',
          text: '"얘들아, 같이 도와드리자!" 친구들을 부른다',
          emoji: '👫',
          dimensions: { sociality: 2, empathy: 1, creativity: 1 },
          nextSceneId: 'storm_coming',
          parentNote: '협동 능력, 리더십 발휘'
        },
        {
          id: 'play_first',
          text: '친구들과 먼저 놀고 나중에 도와드린다',
          emoji: '🎮',
          dimensions: { aggression: 1, empathy: -1 },
          nextSceneId: 'storm_coming',
          parentNote: '충동적 욕구 우선, 지연 보상 어려움'
        },
        {
          id: 'pretend_not_see',
          text: '못 본 척하고 지나간다',
          emoji: '🙈',
          dimensions: { anxiety: 1, empathy: -2, aggression: 1 },
          nextSceneId: 'storm_coming',
          parentNote: '공감 능력 관찰 필요, 회피 경향'
        }
      ]
    },

    // ---- 4. 갑작스러운 폭풍 ----
    {
      id: 'storm_coming',
      title: '갑자기 폭풍이!',
      description: '갑자기 하늘이 어두워지고 번개가 치기 시작해요! ⚡\n마을 친구들이 무서워서 떨고 있어요.\n"어떡하지?!" 모두 당황하고 있을 때...',
      illustration: '⛈️⚡😱',
      bgColor: 'from-gray-200 to-slate-300',
      choices: [
        {
          id: 'lead_shelter',
          text: '"저기 큰 나무 밑으로 가자!" 친구들을 이끈다',
          emoji: '🏃',
          dimensions: { independence: 2, sociality: 1, emotional_regulation: 2, anxiety: -2 },
          nextSceneId: 'village_festival',
          parentNote: '위기 상황에서 리더십 발휘, 높은 스트레스 내성'
        },
        {
          id: 'calm_friends',
          text: '"괜찮아, 무섭지 않아" 친구들을 안심시킨다',
          emoji: '😊',
          dimensions: { empathy: 2, emotional_regulation: 2, self_esteem: 1 },
          nextSceneId: 'village_festival',
          parentNote: '타인 정서 조절 능력, 안정감 제공'
        },
        {
          id: 'cry_scared',
          text: '무서워서 같이 울어버린다',
          emoji: '😭',
          dimensions: { anxiety: 2, emotional_regulation: -2 },
          nextSceneId: 'village_festival',
          parentNote: '정서 조절 어려움, 불안 수준 높음'
        },
        {
          id: 'adventure_spirit',
          text: '"와! 폭풍이다! 멋있다!" 신나한다',
          emoji: '🤩',
          dimensions: { aggression: 1, creativity: 1, anxiety: -2, independence: 1 },
          nextSceneId: 'village_festival',
          parentNote: '자극 추구 성향, 두려움 없는 탐험 욕구'
        }
      ]
    },

    // ---- 5. 마을 축제 준비 ----
    {
      id: 'village_festival',
      title: '마을 축제 준비',
      description: '폭풍이 지나가고 무지개가 떴어요! 🌈\n마을에서 축제를 열기로 했어요.\n"넌 뭘 하고 싶어?" 마을 이장님이 물어요.',
      illustration: '🌈🎪🎉',
      bgColor: 'from-pink-100 to-purple-100',
      character: '이장님',
      choices: [
        {
          id: 'perform_stage',
          text: '무대에서 노래와 춤을 선보인다',
          emoji: '🎤',
          dimensions: { self_esteem: 2, creativity: 1, sociality: 1, anxiety: -1 },
          nextSceneId: 'farewell',
          parentNote: '자기 표현 욕구 높음, 무대 두려움 적음'
        },
        {
          id: 'decorate',
          text: '마을을 예쁘게 꾸미는 일을 한다',
          emoji: '🎨',
          dimensions: { creativity: 2, independence: 1 },
          nextSceneId: 'farewell',
          parentNote: '미적 감각, 개인 작업 선호'
        },
        {
          id: 'cook_together',
          text: '친구들과 맛있는 음식을 만든다',
          emoji: '🍲',
          dimensions: { sociality: 2, empathy: 1, emotional_regulation: 1 },
          nextSceneId: 'farewell',
          parentNote: '협동 활동 선호, 나눔의 가치'
        },
        {
          id: 'organize',
          text: '축제 프로그램을 계획하고 정리한다',
          emoji: '📋',
          dimensions: { independence: 2, emotional_regulation: 1, creativity: 1 },
          nextSceneId: 'farewell',
          parentNote: '계획적 사고, 조직 능력'
        }
      ]
    },

    // ---- 6. 작별 인사 ----
    {
      id: 'farewell',
      title: '따뜻한 작별',
      description: '즐거운 축제가 끝나고, 해가 지기 시작해요. 🌅\n마을 친구들이 모두 모여 인사해요.\n"오늘 정말 고마웠어! 또 올 거지?"',
      illustration: '🌅🤗🏘️',
      bgColor: 'from-orange-100 to-rose-100',
      choices: [
        {
          id: 'promise_return',
          text: '"꼭 다시 올게! 약속!" 꼭 안아준다',
          emoji: '🤗',
          dimensions: { sociality: 2, empathy: 2, self_esteem: 1 },
          nextSceneId: 'village_ending',
          parentNote: '깊은 유대감 형성, 관계 유지 욕구'
        },
        {
          id: 'gift_friends',
          text: '마을 친구들에게 선물을 만들어준다',
          emoji: '🎁',
          dimensions: { creativity: 2, empathy: 2 },
          nextSceneId: 'village_ending',
          parentNote: '감사 표현, 창의적 선물 행동'
        },
        {
          id: 'explore_more',
          text: '"아직 가고 싶은 곳이 더 있는데!"',
          emoji: '🗺️',
          dimensions: { independence: 2, creativity: 1, anxiety: -1 },
          nextSceneId: 'village_ending',
          parentNote: '높은 탐험 동기, 호기심 지속'
        }
      ]
    },

    // ---- 엔딩 ----
    {
      id: 'village_ending',
      title: '모험 완료!',
      description: '해바라기 마을에서의 하루가 끝났어요! 🌻\n오늘 많은 친구를 만나고, 도움도 주고, 재미있는 경험도 했지요.\n우리 친구는 정말 대단해요! ⭐',
      illustration: '🌻⭐🎊',
      bgColor: 'from-yellow-100 to-amber-200',
      isEnding: true,
      choices: []
    }
  ]
};
