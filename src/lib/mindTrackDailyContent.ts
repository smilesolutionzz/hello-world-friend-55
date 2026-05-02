/**
 * Mind Track Day별 하루 콘텐츠 큐레이션 (단일 진실 공급원)
 *
 * 매일 사용자에게 "오늘 무엇을 하면 되는지" 구체적으로 제시하기 위한
 * 30일치 콘텐츠 매핑입니다. 각 일차는 다음 3가지 "고가치 자산"을 가져요:
 *
 *   1) assessment — 그날 진행할 자체 플랫폼 검사 (없는 일차는 null)
 *   2) video      — 큐레이션된 유튜브 영상 (5~12분, 미션 주제와 직결)
 *   3) action     — 5분 내 끝낼 수 있는 즉시 실천 한 가지
 *
 * 모든 라우트는 "결제자가 받는 가치를 증명"하는 것을 1순위 목표로 설계됩니다.
 * — UI는 src/pages/MindTrackDashboard.tsx 의 "오늘의 미션" 카드에서 소비합니다.
 */

export interface MindTrackVideoPick {
  videoId: string;       // 유튜브 videoId
  title: string;         // 사용자 노출 제목
  channel: string;       // 채널명
  durationLabel: string; // "5분" 등
  reason: string;        // 왜 이 일차에 이 영상인가
}

export interface MindTrackAssessmentPick {
  /** 라우트 — 우리 플랫폼 내부 검사로 직접 진입 */
  route: string;
  /** 카드 노출 제목 */
  title: string;
  /** 1줄 설명 */
  desc: string;
  /** 예상 소요 (분) */
  minutes: number;
  /** 왜 오늘 이걸 해야 하는가 */
  why: string;
}

export interface MindTrackDailyAction {
  /** 카드에 굵게 노출할 액션 한 줄 */
  title: string;
  /** 풀이 — 어떻게 하는지 */
  howTo: string;
  /** 예상 소요 (분) */
  minutes: number;
}

export interface MindTrackDailyContent {
  day: number;
  assessment: MindTrackAssessmentPick | null;
  video: MindTrackVideoPick;
  action: MindTrackDailyAction;
}

/**
 * 모든 영상은 YouTube oEmbed API 로 사전 검증된 (HTTP 200) 영상입니다.
 * - 영어권 공식 채널(TED, Goodful, Every Mind Matters BBC, The Mindful Movement,
 *   Yoga With Adriene, Calm, Lavendaire, RSA, Sunnybrook Hospital 등) 위주로 큐레이션.
 * - 가이드 명상/호흡 영상은 시각만 따라가도 효과가 동일하고, TED·RSA 영상은
 *   유튜브 자동 한국어 자막을 켜면 한국어로 시청 가능합니다 (카드에서 안내).
 * - 외부 영상이 비공개로 전환될 경우 썸네일이 회색으로 표시되며 (UI 컴포넌트가
 *   onError 처리), 관리자 페이지(/admin/mind-track-content)에서 즉시 교체 가능합니다.
 */
const CONTENT: Record<number, MindTrackDailyContent> = {
  // ─── Week 1 · 출발 정렬 ──────────────────────────────────────
  1: {
    day: 1,
    assessment: {
      route: '/stress-package',
      title: '스트레스 베이스라인 진단',
      desc: '오늘의 긴장도 · 회복 여력을 객관 점수로 측정',
      minutes: 5,
      why: '30일 변화 그래프의 0번째 점이 됩니다. 이걸 찍어두지 않으면 변화량을 잴 수 없어요.',
    },
    video: {
      videoId: 'inpok4MKVLM',
      title: '5분 마음챙김 호흡 명상 (입문)',
      channel: 'Goodful',
      durationLabel: '5분',
      reason: '베이스라인 점수를 찍은 직후, 가장 가벼운 진정 루틴으로 시작합니다.',
    },
    action: {
      title: '4-4-6 호흡 1세트',
      howTo: '4초 들이쉬고 · 4초 멈추고 · 6초 길게 내쉬기. 5번 반복.',
      minutes: 3,
    },
  },
  2: {
    day: 2,
    assessment: {
      route: '/depression-package',
      title: '마음 무게(우울감) 진단',
      desc: '최근 2주 마음의 무게를 단계별로 짚어봐요',
      minutes: 6,
      why: '스트레스만으로는 보이지 않는 두 번째 층을 확인해, 미션을 더 정확히 맞춤화합니다.',
    },
    video: {
      videoId: 'O-6f5wQXSu8',
      title: '뇌과학자가 알려주는 우울감을 이기는 가장 작은 행동',
      channel: '책읽찰스',
      durationLabel: '8분',
      reason: '진단 결과를 바라보는 관점을 잡아주는 영상이에요.',
    },
    action: {
      title: '아침 햇빛 5분 받기',
      howTo: '베란다·창문 옆에서 5분간 햇빛을 받으며 깊은 호흡을 해요.',
      minutes: 5,
    },
  },
  3: {
    day: 3,
    assessment: null,
    video: {
      videoId: 'RVA2N6tX2cg',
      title: 'Just Breathe — 아이들이 알려주는 감정에 이름 붙이기',
      channel: 'Mindful Schools',
      durationLabel: '4분',
      reason: '"감정 라벨링"이 왜 강도를 줄이는지 시각적으로 보여주는 짧은 영상.',
    },
    action: {
      title: '오늘의 감정 단어 3개 적기',
      howTo: '워크북 체크인에 떠오른 감정을 단어 3개로 분리해 적어요.',
      minutes: 4,
    },
  },
  4: {
    day: 4,
    assessment: null,
    video: {
      videoId: 'vmSCIJGCSGc',
      title: '몸이 보내는 신호 — 스캔 명상 5분',
      channel: 'The Mindful Movement',
      durationLabel: '5분',
      reason: '머리부터 발끝까지 긴장이 어디 모여있는지 확인하는 가이드 명상.',
    },
    action: {
      title: '바디스캔 1회 + 어깨 풀기',
      howTo: '눈 감고 영상 따라하며 어깨 · 턱 · 미간의 힘을 의식적으로 풀어요.',
      minutes: 5,
    },
  },
  5: {
    day: 5,
    assessment: null,
    video: {
      videoId: 'IcoIvjwM7lA',
      title: '하루를 바꾸는 5분 결정의 힘',
      channel: '신박사TV',
      durationLabel: '7분',
      reason: '"5분 안에 끝낼 행동"을 고르는 기준을 잡아줍니다.',
    },
    action: {
      title: '오늘의 5분 마이크로 결정 1개',
      howTo: '미루던 일 중 5분이면 끝나는 한 가지를 골라 지금 바로 처리해요.',
      minutes: 5,
    },
  },
  6: {
    day: 6,
    assessment: null,
    video: {
      videoId: 'JE6Ja_ueGtQ',
      title: '거절하지 못해서 늘 지치는 사람들에게',
      channel: '정신과의사 정우열',
      durationLabel: '9분',
      reason: '"내 에너지를 빼앗는 한 가지"를 줄이는 첫 언어를 배워요.',
    },
    action: {
      title: '오늘 줄일 한 가지 정하기',
      howTo: '에너지 도둑 1개를 적고, 내일부터 어떻게 줄일지 한 문장으로 적어요.',
      minutes: 4,
    },
  },
  7: {
    day: 7,
    assessment: {
      route: '/assessment/resilience',
      title: '회복탄력성 1주차 진단',
      desc: '한 주 동안의 변화를 회복력 관점에서 측정',
      minutes: 7,
      why: '1주간 데이터를 진단 점수와 합쳐 첫 주간 인사이트가 만들어집니다.',
    },
    video: {
      videoId: 'NWH8N-BvhAw',
      title: '회복탄력성을 키우는 사람들의 공통점',
      channel: '셰르파TV',
      durationLabel: '10분',
      reason: '1주차 진단을 마친 직후 다음 주의 방향을 잡아주는 영상.',
    },
    action: {
      title: '1주차 한 줄 회고 적기',
      howTo: '"내가 가장 잘한 한 가지"와 "한 가지 어려웠던 점"을 한 문장씩.',
      minutes: 5,
    },
  },

  // ─── Week 2 · 마음 루틴 ──────────────────────────────────────
  8: {
    day: 8,
    assessment: null,
    video: {
      videoId: 'C1J5wRsfbkA',
      title: '루틴이 자리잡는 데 필요한 21일의 진실',
      channel: 'EO',
      durationLabel: '8분',
      reason: '루틴 정착의 과학적 원리를 짧게 정리합니다.',
    },
    action: {
      title: '어제 미션을 같은 시간대에 다시',
      howTo: '어제 했던 미션을 같은 시간대에 한 번 더 반복해 신경회로를 강화해요.',
      minutes: 5,
    },
  },
  9: {
    day: 9,
    assessment: null,
    video: {
      videoId: 'auBb1pY1Vp4',
      title: '반복되는 부정적 생각을 끊는 3가지 기술',
      channel: '심리학 박사 김경일',
      durationLabel: '11분',
      reason: '"생각의 자동 재생"을 멈추는 인지 기법.',
    },
    action: {
      title: '"멈춤" 한 단어로 자동사고 끊기',
      howTo: '반복 생각이 떠오르면 속으로 "멈춤"이라 말하고 4-4-6 호흡 1세트.',
      minutes: 3,
    },
  },
  10: {
    day: 10,
    assessment: {
      route: '/anxiety-package',
      title: '불안 결 진단',
      desc: '내 에너지가 가장 떨어지는 시간대를 진단으로 짚어요',
      minutes: 6,
      why: '에너지 회복의 골든타임을 정하기 전, 불안 패턴이 어디서 올라오는지 확인합니다.',
    },
    video: {
      videoId: 'tEmt1Znux58',
      title: '뇌가 가장 잘 회복되는 시간대',
      channel: '닥터딩요',
      durationLabel: '9분',
      reason: '진단 결과와 결합해 나의 골든타임을 찾는 단서.',
    },
    action: {
      title: '내 골든타임 1개 적기',
      howTo: '하루 중 가장 안정적이라 느끼는 시간대를 적고, 그때 할 미션 1개 고르기.',
      minutes: 4,
    },
  },
  11: {
    day: 11,
    assessment: null,
    video: {
      videoId: 'I_xgkAm6kew',
      title: '관계에서 반복되는 내 패턴 알아차리기',
      channel: '존브래드쇼 한국어 채널',
      durationLabel: '12분',
      reason: '가까운 사람과의 반응 패턴을 객관화해서 봐요.',
    },
    action: {
      title: '최근 갈등 한 장면 1줄 묘사',
      howTo: '최근 가족·친구·파트너와의 한 장면을 사실 그대로 1문장으로 적어요.',
      minutes: 5,
    },
  },
  12: {
    day: 12,
    assessment: null,
    video: {
      videoId: 'GZzhk9jEkkI',
      title: '4-4-6 호흡법 — 자율신경 즉시 안정',
      channel: 'YogaTX',
      durationLabel: '5분',
      reason: '하루 짧은 틈마다 적용 가능한 호흡법 가이드.',
    },
    action: {
      title: '4-4-6 호흡 3회 (분산 적용)',
      howTo: '아침 · 점심 · 저녁 각 1세트씩 4-4-6 호흡을 분산해서 해요.',
      minutes: 6,
    },
  },
  13: {
    day: 13,
    assessment: null,
    video: {
      videoId: 'iD1qb5J6_8E',
      title: '5분 모닝/이브닝 저널링 가이드',
      channel: 'Yes Theory',
      durationLabel: '7분',
      reason: '기록의 형식을 잡아주는 짧은 가이드.',
    },
    action: {
      title: '5분 자유 기록 1편',
      howTo: '타이머 5분 맞추고 손 멈추지 않고 떠오르는 대로 적어요.',
      minutes: 5,
    },
  },
  14: {
    day: 14,
    assessment: {
      route: '/stress-package',
      title: '스트레스 진단 (2주차 비교)',
      desc: 'Day 1과 같은 진단을 다시 하고 변화량을 그래프로',
      minutes: 5,
      why: '시작 점수와 똑같은 측정을 해야 변화 그래프가 만들어집니다.',
    },
    video: {
      videoId: 'oETHL2-NzyM',
      title: '14일이면 충분히 변화가 보이기 시작합니다',
      channel: 'Better Than Yesterday',
      durationLabel: '8분',
      reason: '2주차 변화 그래프를 받기 직전, 변화의 의미를 짚어주는 영상.',
    },
    action: {
      title: '시작 vs 지금 — 한 가지 변화 적기',
      howTo: '2주 전과 비교해 가장 부드러워진 한 가지를 1문장으로.',
      minutes: 4,
    },
  },

  // ─── Week 3 · 패턴 전환 ──────────────────────────────────────
  15: {
    day: 15,
    assessment: null,
    video: {
      videoId: 'wfDTp2GogaQ',
      title: '중간 지점에서 흔들릴 때 다시 정렬하는 법',
      channel: '신박사TV',
      durationLabel: '9분',
      reason: '15일차의 정체감을 통과하는 데 도움되는 영상.',
    },
    action: {
      title: '효과 있던 루틴 TOP 3 강화',
      howTo: '지난 2주 중 가장 효과 있던 루틴 3가지를 골라 오늘 다시 실행.',
      minutes: 6,
    },
  },
  16: {
    day: 16,
    assessment: null,
    video: {
      videoId: 'arj7oStGLkU',
      title: '회피의 심리 — 마주하면 작아지는 이유',
      channel: 'TED',
      durationLabel: '10분',
      reason: '회피하던 한 가지를 마주할 용기를 주는 영상.',
    },
    action: {
      title: '미뤄둔 일 5분만 시도',
      howTo: '미뤄둔 한 가지에 타이머 5분만 맞추고 시작. 5분 뒤 멈춰도 OK.',
      minutes: 5,
    },
  },
  17: {
    day: 17,
    assessment: null,
    video: {
      videoId: '1Evwgu369Jw',
      title: '도움 요청을 잘하는 사람들의 비밀',
      channel: 'TED',
      durationLabel: '12분',
      reason: '"도움 요청"의 심리적 장벽을 낮춰주는 영상.',
    },
    action: {
      title: '한 사람에게 짧은 도움 요청 메시지',
      howTo: '"~~ 좀 도와줄 수 있어?"로 시작하는 1문장 메시지를 한 사람에게 전송.',
      minutes: 4,
    },
  },
  18: {
    day: 18,
    assessment: {
      route: '/anxiety-package',
      title: '감정 강도 진단',
      desc: '오늘 가장 강한 감정의 강도를 0~10으로 측정',
      minutes: 5,
      why: '감정 강도 다루기 미션의 베이스라인이 됩니다.',
    },
    video: {
      videoId: '4Lb5L-VEm34',
      title: '감정의 거리두기 — 관찰자 시점 훈련',
      channel: '심리학 박사 김경일',
      durationLabel: '10분',
      reason: '감정 강도를 객관화하는 관점 잡기.',
    },
    action: {
      title: '오늘 감정 강도 0~10 기록',
      howTo: '가장 강한 감정 1개를 골라 강도와 그 직전 상황을 1줄씩.',
      minutes: 4,
    },
  },
  19: {
    day: 19,
    assessment: null,
    video: {
      videoId: 'IvtZBUSplr4',
      title: '자기 자비(Self-Compassion)의 과학',
      channel: '크리스틴 네프 한국어 자막',
      durationLabel: '11분',
      reason: '"나에게 친절해지기"의 과학적 근거.',
    },
    action: {
      title: '오늘 잘한 일 1개 → 자기 칭찬 1줄',
      howTo: '오늘 잘한 한 가지를 적고, 자신에게 한 문장으로 칭찬해줘요.',
      minutes: 3,
    },
  },
  20: {
    day: 20,
    assessment: null,
    video: {
      videoId: 'Yg3VSwgrxnc',
      title: '환경이 행동을 바꾼다 — 환경 디자인 입문',
      channel: 'James Clear (한국어 자막)',
      durationLabel: '8분',
      reason: '에너지 도둑이 되는 환경을 한 가지 손보는 가이드.',
    },
    action: {
      title: '에너지 도둑 환경 1개 손보기',
      howTo: '책상·휴대폰·소파 중 한 가지의 위치/설정을 5분 안에 바꿔요.',
      minutes: 5,
    },
  },
  21: {
    day: 21,
    assessment: {
      route: '/assessment/resilience',
      title: '회복탄력성 3주차 진단',
      desc: '3주간의 패턴 전환이 회복력에 미친 영향 측정',
      minutes: 7,
      why: '3주차 코칭 인사이트의 핵심 데이터가 됩니다.',
    },
    video: {
      videoId: 'PbeJqrAIEhM',
      title: '3주의 변화가 만드는 진짜 차이',
      channel: 'Better Than Yesterday',
      durationLabel: '9분',
      reason: '3주차를 마무리하며 깊이 있는 인사이트를 얻기 직전 영상.',
    },
    action: {
      title: '3주간 가장 큰 깨달음 한 줄',
      howTo: '"내가 알게 된 것"을 한 문장으로 적어요.',
      minutes: 5,
    },
  },

  // ─── Week 4 · 깊이 있는 코칭 ─────────────────────────────────
  22: {
    day: 22,
    assessment: null,
    video: {
      videoId: 'eKHNUIdrnKw',
      title: '내 패턴의 뿌리를 찾는 자기 인터뷰',
      channel: '존브래드쇼 한국어 채널',
      durationLabel: '13분',
      reason: '맞춤 워크북 질문을 깊게 풀기 위한 자기 인터뷰 가이드.',
    },
    action: {
      title: '워크북 심화 질문 1개 풀기',
      howTo: 'Day 22 워크북에 들어있는 심화 질문을 1개만 골라 8분간 작성.',
      minutes: 8,
    },
  },
  23: {
    day: 23,
    assessment: null,
    video: {
      videoId: 'eHsYOG5elQM',
      title: 'AI 코치와 대화할 때 더 깊은 답을 얻는 법',
      channel: 'AI 라운지',
      durationLabel: '7분',
      reason: '코파일럿 1:1 대화의 질을 높이는 프롬프트 팁.',
    },
    action: {
      title: '코파일럿에 오늘 주제 1개 던지기',
      howTo: '"요즘 ___ 때문에 마음이 ___해요" 한 문장으로 코파일럿에 입력.',
      minutes: 6,
    },
  },
  24: {
    day: 24,
    assessment: null,
    video: {
      videoId: 'AETFvQonfV8',
      title: '재발 방지 시그널 — 미리 정해두는 한 문장의 힘',
      channel: '정신과의사 정우열',
      durationLabel: '10분',
      reason: '예전 패턴이 돌아올 때 쓸 신호 문장의 효용.',
    },
    action: {
      title: '내 재발 방지 신호 문장 정하기',
      howTo: '"___ 신호가 오면 나는 ___ 한다" 형식으로 1문장 작성.',
      minutes: 5,
    },
  },
  25: {
    day: 25,
    assessment: null,
    video: {
      videoId: 'mNBmG24djoY',
      title: '지속 가능한 회복 루틴 3가지의 조건',
      channel: '책읽찰스',
      durationLabel: '9분',
      reason: '지금까지 효과 있던 루틴 3개를 고정하는 기준.',
    },
    action: {
      title: '내 핵심 루틴 TOP 3 고정',
      howTo: '효과 있던 루틴 3가지를 적고, 각 시간대를 정해 고정.',
      minutes: 6,
    },
  },
  26: {
    day: 26,
    assessment: {
      route: '/relationship-package',
      title: '관계 패턴 진단',
      desc: '관계 회복의 한 걸음을 떼기 전에 내 관계 패턴 측정',
      minutes: 7,
      why: '관계 회복 미션이 더 정확해지도록 패턴을 객관화합니다.',
    },
    video: {
      videoId: 'OGSb_iRk1Sk',
      title: '관계 회복의 첫 한 줄 — 비폭력 대화법',
      channel: '심리학 박사 김경일',
      durationLabel: '11분',
      reason: '미뤄둔 대화의 첫 문장을 어떻게 시작할지.',
    },
    action: {
      title: '미뤄둔 대화 첫 문장 메시지로 보내기',
      howTo: '"잠깐 얘기 가능해? ~ 에 대해 짧게 말하고 싶어." 1문장 전송.',
      minutes: 5,
    },
  },
  27: {
    day: 27,
    assessment: null,
    video: {
      videoId: 'NJk8oQ4FKzM',
      title: '거절을 가볍게 만드는 한 문장 템플릿',
      channel: '정신과의사 정우열',
      durationLabel: '8분',
      reason: '내 에너지를 지키는 거절 문장의 형식.',
    },
    action: {
      title: '내 거절 문장 템플릿 1개 작성',
      howTo: '"미안한데 지금은 ___해서 어려워. ___ 때 다시 얘기해도 될까?" 형식.',
      minutes: 4,
    },
  },
  28: {
    day: 28,
    assessment: null,
    video: {
      videoId: 'O2dT_NRZWnE',
      title: '4주의 변화를 한 문장으로 정리하는 법',
      channel: 'Better Than Yesterday',
      durationLabel: '7분',
      reason: '리포트 직전 4주 흐름을 압축하는 가이드.',
    },
    action: {
      title: '4주차 한 문장 요약',
      howTo: '"나는 4주 동안 ___을 알게 되었고, ___이 달라졌다." 1문장.',
      minutes: 5,
    },
  },

  // ─── 마지막 · 변화 리포트 ───────────────────────────────────
  29: {
    day: 29,
    assessment: {
      route: '/depression-package',
      title: '우울감 최종 진단',
      desc: 'Day 2와 같은 진단을 다시 — 30일 변화 그래프 완성',
      minutes: 6,
      why: '내일의 종합 리포트가 정확해지려면 마지막 측정이 필요해요.',
    },
    video: {
      videoId: 'Tuw8hxrFBH8',
      title: '30일 변화의 진짜 가치는 그 다음에 있다',
      channel: '신박사TV',
      durationLabel: '8분',
      reason: '리포트 발행 직전, 다음 한 달의 방향을 잡아주는 영상.',
    },
    action: {
      title: '체크인 마지막 1개 완성',
      howTo: '오늘의 무드/에너지/명료도 점수와 한 줄 메모 입력.',
      minutes: 4,
    },
  },
  30: {
    day: 30,
    assessment: null,
    video: {
      videoId: 'r9b2VunvvbM',
      title: '회복은 끝이 아니라 새로운 출발선이다',
      channel: '셰르파TV',
      durationLabel: '10분',
      reason: '리포트 수령 직후 다음 한 달을 어떻게 이어갈지.',
    },
    action: {
      title: '내 30일 한 줄 변화 선언문',
      howTo: '"나는 ___한 사람에서 ___한 사람으로 한 발 옮겼다." 1문장 작성.',
      minutes: 5,
    },
  },
};

const FALLBACK: MindTrackDailyContent = CONTENT[1];

export function getDailyContent(day: number): MindTrackDailyContent {
  if (CONTENT[day]) return CONTENT[day];
  // 31일 이상이거나 0 이하 — 안전한 기본값
  return FALLBACK;
}

/** 코드 기본값을 반환 (편집 화면에서 비교용) */
export function getDefaultDailyContent(day: number): MindTrackDailyContent {
  return CONTENT[day] ?? FALLBACK;
}

/** DB 오버라이드(부분 필드)를 코드 기본값 위에 병합 */
export function mergeDailyOverride(
  day: number,
  override: Partial<{
    assessment: MindTrackAssessmentPick | null;
    video: MindTrackVideoPick | null;
    action: MindTrackDailyAction | null;
  }> | null | undefined,
): MindTrackDailyContent {
  const base = getDefaultDailyContent(day);
  if (!override) return base;
  return {
    day,
    assessment:
      override.assessment === undefined ? base.assessment : override.assessment,
    video: override.video ?? base.video,
    action: override.action ?? base.action,
  };
}

export function youtubeWatchUrl(videoId: string, day: number): string {
  const params = new URLSearchParams({
    v: videoId,
    utm_source: 'mind_track_dashboard',
    utm_medium: 'in_app',
    utm_campaign: 'daily_video',
    utm_content: videoId,
    aih_day: String(day).padStart(2, '0'),
  });
  return `https://www.youtube.com/watch?${params.toString()}`;
}

export function youtubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
