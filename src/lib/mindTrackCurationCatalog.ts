/**
 * Mind-Track Curation Catalog
 * ---------------------------------------------------------------
 * 전문가 추천 콘텐츠(영상 채널/프로그램)와 발달 트랙 추천
 * 도구·도서 카탈로그. LLM은 "어떤 액션이 필요한지"만 생성하고
 * "어떤 콘텐츠를 보여줄지"는 이 파일의 화이트리스트가 결정합니다.
 *
 * 정책:
 *  - 모든 항목은 공개적으로 알려진 채널/프로그램명 사용.
 *  - 추천 상품은 구매·제휴 링크 없이 "검색 키워드"만 노출.
 *  - audience × focus 태그 매칭으로 상위 N개 선택.
 */

export type Audience = 'parent' | 'child_dev' | 'adult' | 'teen';

export type FocusTag =
  | 'tantrum'
  | 'discipline'
  | 'sleep'
  | 'aba_speech'
  | 'aba_play'
  | 'sensory'
  | 'attachment'
  | 'school_adapt'
  | 'sibling'
  | 'burnout'
  | 'anxiety'
  | 'depression'
  | 'sleep_adult'
  | 'relationship'
  | 'self_esteem'
  | 'motivation';

export interface VideoChannelEntry {
  id: string;
  channelName: string;
  programName?: string;
  language: 'ko' | 'en';
  audiences: Audience[];
  tags: FocusTag[];
  /** "왜 이 콘텐츠가 도움이 되는지" 한 줄. UI/email 그대로 노출. */
  whyTemplate: string;
  /** YouTube 검색 시 사용할 시드 키워드. */
  searchSeed: string;
  evidenceStrength: 'expert' | 'broadcast' | 'community';
}

export const VIDEO_CATALOG: VideoChannelEntry[] = [
  // 부모/육아 — 종합 방송 (브로드캐스트)
  {
    id: 'geumjjok',
    channelName: '채널A',
    programName: '금쪽같은 내 새끼',
    language: 'ko',
    audiences: ['parent'],
    tags: ['tantrum', 'discipline', 'attachment', 'sibling', 'school_adapt'],
    whyTemplate: '실제 가정의 행동 사례를 전문가가 분석하는 방송으로, 오늘의 액션이 어떤 맥락에서 작동하는지 한눈에 보입니다.',
    searchSeed: '금쪽같은 내 새끼',
    evidenceStrength: 'broadcast',
  },
  {
    id: 'changed-child',
    channelName: 'SBS',
    programName: '우리 아이가 달라졌어요',
    language: 'ko',
    audiences: ['parent'],
    tags: ['tantrum', 'discipline', 'sleep', 'attachment'],
    whyTemplate: '행동 수정·일관된 반응의 고전적 사례. 오늘 적용할 "예측 가능한 반응" 원리를 시각적으로 확인할 수 있습니다.',
    searchSeed: '우리 아이가 달라졌어요',
    evidenceStrength: 'broadcast',
  },
  {
    id: 'choi-minjun-sons',
    channelName: '최민준의 아들TV',
    language: 'ko',
    audiences: ['parent'],
    tags: ['tantrum', 'discipline', 'motivation', 'school_adapt'],
    whyTemplate: '남아 양육에 특화된 전문가 채널. 충동·에너지 조절 관점에서 오늘의 액션을 보완해 줍니다.',
    searchSeed: '최민준의 아들tv',
    evidenceStrength: 'expert',
  },
  {
    id: 'baessa-tv',
    channelName: '베싸TV',
    language: 'ko',
    audiences: ['parent', 'child_dev'],
    tags: ['sleep', 'aba_speech', 'aba_play', 'attachment'],
    whyTemplate: '근거 기반 영유아 양육 채널. 오늘의 관찰 포인트를 학술 자료로 뒷받침해 줍니다.',
    searchSeed: '베싸TV',
    evidenceStrength: 'expert',
  },
  {
    id: 'aba-parent-class',
    channelName: 'ABA 부모교실',
    language: 'ko',
    audiences: ['child_dev'],
    tags: ['aba_speech', 'aba_play', 'sensory', 'tantrum'],
    whyTemplate: 'ABA 행동기법(ABC·강화·소거) 부모 적용 사례. 오늘 기록할 관찰 항목과 직접 연결됩니다.',
    searchSeed: 'ABA 부모교육',
    evidenceStrength: 'expert',
  },
  {
    id: 'autism-family',
    channelName: 'Autism Family',
    language: 'en',
    audiences: ['child_dev'],
    tags: ['aba_speech', 'aba_play', 'sensory'],
    whyTemplate: '발달 변이 아동 가정의 실제 루틴을 영어 자막으로 볼 수 있는 사례 채널.',
    searchSeed: 'autism family routine',
    evidenceStrength: 'community',
  },

  // 성인 — 정신건강 전문가
  {
    id: 'dr-jung-wooyeol',
    channelName: '정신과의사 정우열',
    language: 'ko',
    audiences: ['adult', 'parent'],
    tags: ['burnout', 'anxiety', 'depression', 'self_esteem'],
    whyTemplate: '임상 정신건강의학과 전문의 채널. 오늘의 인지 재구성/행동 활성화 액션을 짧은 강의로 보강해 줍니다.',
    searchSeed: '정신과의사 정우열',
    evidenceStrength: 'expert',
  },
  {
    id: 'doctor-friends',
    channelName: '닥터프렌즈',
    language: 'ko',
    audiences: ['adult'],
    tags: ['anxiety', 'depression', 'sleep_adult', 'burnout'],
    whyTemplate: '의사 3인이 정신·신체 건강 이슈를 풀어주는 채널. 오늘 액션의 의학적 맥락을 짧게 잡아줍니다.',
    searchSeed: '닥터프렌즈',
    evidenceStrength: 'expert',
  },

  // 청소년
  {
    id: 'ebs-teen-mind',
    channelName: 'EBS',
    programName: '청소년 마음건강',
    language: 'ko',
    audiences: ['teen', 'parent'],
    tags: ['motivation', 'self_esteem', 'school_adapt', 'anxiety'],
    whyTemplate: '공교육 매체의 청소년 정서·동기 다큐. 오늘 액션을 청소년 언어로 풀어줍니다.',
    searchSeed: 'EBS 청소년 마음건강',
    evidenceStrength: 'broadcast',
  },
];

// ---------------------------------------------------------------
// 발달 트랙 — 추천 도구/도서 (구매 링크 없음, 검색 키워드만)
// ---------------------------------------------------------------

export type ProductCategory =
  | 'language_stim' // 언어 자극
  | 'fine_motor'   // 소근육
  | 'sensory'      // 감각 통합
  | 'emotion_reg'  // 정서 조절
  | 'sleep_routine'// 수면 루틴
  | 'play_join';   // 합동 놀이

export interface ProductEntry {
  id: string;
  name: string;
  category: ProductCategory;
  ageRange: string; // 예: '12-24m', '2-4y', '4-7y'
  tags: FocusTag[];
  whyTemplate: string;
  /** 사용자가 직접 찾아볼 수 있는 검색 키워드. */
  searchKeyword: string;
}

export const PRODUCT_CATALOG: ProductEntry[] = [
  {
    id: 'object-cards',
    name: '사물 그림카드',
    category: 'language_stim',
    ageRange: '12-36m',
    tags: ['aba_speech'],
    whyTemplate: '명사 단어 자극과 공동주시(joint attention)를 함께 만들어 줍니다. 하루 5분 카드 보여주기로 시도 횟수를 늘릴 수 있어요.',
    searchKeyword: '영유아 사물 그림카드 한글',
  },
  {
    id: 'cause-effect-toys',
    name: '인과관계 누름 장난감',
    category: 'play_join',
    ageRange: '12-30m',
    tags: ['aba_play', 'aba_speech'],
    whyTemplate: '"누르면 소리/움직임"이 일어나는 장난감은 강화(reinforcer)로 자연스럽게 작동해 자발 행동을 늘려 줍니다.',
    searchKeyword: '영유아 인과관계 장난감 누름',
  },
  {
    id: 'play-dough',
    name: '점토·찰흙 세트',
    category: 'fine_motor',
    ageRange: '2-6y',
    tags: ['aba_play', 'sensory'],
    whyTemplate: '소근육·촉감을 동시에 자극. 부모와 같이 모양을 만들며 차례 지키기(turn-taking) 연습에 좋습니다.',
    searchKeyword: '유아 천연 점토 세트',
  },
  {
    id: 'weighted-blanket-kid',
    name: '아동용 무게 담요',
    category: 'sleep_routine',
    ageRange: '3-10y',
    tags: ['sleep', 'sensory'],
    whyTemplate: '심부 압력(deep pressure)이 진정 반응을 도와 잠들기 전 각성도를 낮춰줍니다. 체중의 10% 이내로 선택하세요.',
    searchKeyword: '아동 무게 담요 1.5kg',
  },
  {
    id: 'emotion-cards',
    name: '감정 표현 카드',
    category: 'emotion_reg',
    ageRange: '3-8y',
    tags: ['tantrum', 'attachment'],
    whyTemplate: '감정을 단어로 라벨링하면 전두엽이 활성화되며 떼쓰는 강도가 줄어듭니다. 오늘 액션의 "감정 이름 붙이기" 도구로 사용하세요.',
    searchKeyword: '아동 감정 카드 한글',
  },
  {
    id: 'visual-schedule',
    name: '비주얼 스케줄 보드',
    category: 'sleep_routine',
    ageRange: '3-10y',
    tags: ['discipline', 'sleep', 'school_adapt'],
    whyTemplate: '"다음에 뭐 해?"를 예측 가능하게 시각화하면 전환기 떼쓰기가 줄어듭니다. ABA의 antecedent 조절 도구입니다.',
    searchKeyword: '비주얼 스케줄 보드 아동',
  },
  {
    id: 'sensory-bin',
    name: '감각 통합 놀이박스',
    category: 'sensory',
    ageRange: '2-6y',
    tags: ['sensory', 'aba_play'],
    whyTemplate: '쌀·콩·키네틱샌드 등 다양한 텍스처로 촉각 방어를 낮추고 주의 집중 시간을 늘립니다.',
    searchKeyword: '유아 감각 놀이 박스 키네틱샌드',
  },
];

// ---------------------------------------------------------------
// 매칭 함수
// ---------------------------------------------------------------

interface PickOptions {
  focus?: FocusTag | null;
  audience: Audience;
  limit?: number;
}

function score<T extends { audiences?: Audience[]; tags: FocusTag[] }>(
  entry: T,
  focus: FocusTag | null,
  audience: Audience,
): number {
  let s = 0;
  if (entry.audiences) {
    if (entry.audiences.includes(audience)) s += 3;
    else return -1; // audience 미스매치는 제외
  }
  if (focus && entry.tags.includes(focus)) s += 5;
  // 부분 매칭: 같은 카테고리군이면 약한 가산
  return s;
}

export function pickVideos({ focus, audience, limit = 3 }: PickOptions): VideoChannelEntry[] {
  const f = focus ?? null;
  const ranked = VIDEO_CATALOG
    .map((v) => ({ v, s: score(v, f, audience) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s);
  return ranked.slice(0, limit).map((x) => x.v);
}

export function pickProducts({ focus, audience, limit = 3 }: PickOptions): ProductEntry[] {
  if (audience !== 'child_dev') return [];
  const f = focus ?? null;
  const ranked = PRODUCT_CATALOG
    .map((p) => ({ p, s: score({ ...p, audiences: ['child_dev'] }, f, audience) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s);
  return ranked.slice(0, limit).map((x) => x.p);
}

/** track focus 문자열(goal_focus, baseline_data 등)을 FocusTag로 정규화. */
export function normalizeFocus(input?: string | null): FocusTag | null {
  if (!input) return null;
  const s = String(input).toLowerCase();
  if (s.includes('tantrum') || s.includes('떼') || s.includes('훈육')) return 'tantrum';
  if (s.includes('sleep') || s.includes('수면') || s.includes('잠')) return 'sleep';
  if (s.includes('speech') || s.includes('언어')) return 'aba_speech';
  if (s.includes('play') || s.includes('놀이')) return 'aba_play';
  if (s.includes('sensory') || s.includes('감각')) return 'sensory';
  if (s.includes('attach') || s.includes('애착')) return 'attachment';
  if (s.includes('school') || s.includes('학교') || s.includes('등원')) return 'school_adapt';
  if (s.includes('sibling') || s.includes('형제')) return 'sibling';
  if (s.includes('burnout') || s.includes('번아웃')) return 'burnout';
  if (s.includes('anxi') || s.includes('불안')) return 'anxiety';
  if (s.includes('depress') || s.includes('우울')) return 'depression';
  if (s.includes('self') || s.includes('자존')) return 'self_esteem';
  if (s.includes('relation') || s.includes('관계')) return 'relationship';
  if (s.includes('motiv') || s.includes('동기')) return 'motivation';
  if (s.includes('discipline') || s.includes('훈')) return 'discipline';
  return null;
}

export function pickFramework(audience: Audience, focus: FocusTag | null): {
  framework: 'ABA' | 'PCIT' | 'CBT' | 'MI' | 'BehavioralSleep';
  principles: string[];
} {
  if (audience === 'child_dev') {
    return {
      framework: 'ABA',
      principles: [
        'ABC 분석: 선행자극(A) → 행동(B) → 결과(C)를 분리해 관찰합니다.',
        '정적 강화(positive reinforcement): 원하는 행동 직후 즉시 보상.',
        '소거(extinction): 부적절 행동에 대한 반응을 일관되게 거둡니다.',
      ],
    };
  }
  if (audience === 'parent') {
    if (focus === 'sleep') {
      return {
        framework: 'BehavioralSleep',
        principles: [
          '일관된 수면 의식(routine)이 멜라토닌 분비 시점을 정렬합니다.',
          '잠자리 환경(빛·소리·온도)은 한 번 정하면 2주는 유지합니다.',
          '깨움 시 부모 반응 강도를 점진적으로 낮춥니다(graduated extinction).',
        ],
      };
    }
    return {
      framework: 'PCIT',
      principles: [
        'CDI(아동 주도 상호작용): 따라하기·묘사·칭찬·반영·즐기기(PRIDE).',
        '명령은 직접·구체·긍정형(Direct/Specific/Positive)으로.',
        '예측 가능한 결과(타임아웃 vs 칭찬)를 일관되게 제공합니다.',
      ],
    };
  }
  if (audience === 'teen') {
    return {
      framework: 'MI',
      principles: [
        '청소년의 변화 동기를 끌어내기 위해 열린 질문·반영을 사용합니다.',
        '저항에는 논쟁이 아닌 굴러가기(rolling with resistance)로.',
        '본인의 가치와 행동 간 불일치를 부드럽게 비춥니다.',
      ],
    };
  }
  // adult
  return {
    framework: 'CBT',
    principles: [
      '자동적 사고(automatic thought)를 적어 인지 왜곡을 식별합니다.',
      '행동 활성화(behavioral activation): 작은 즐거움·숙달 활동을 스케줄링.',
      '회피 행동을 한 단계씩 노출로 대체합니다(graded exposure).',
    ],
  };
}
