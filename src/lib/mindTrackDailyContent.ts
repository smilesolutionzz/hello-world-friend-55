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
/**
 * 30일 큐레이션 — 전 영상 한국어 채널 우선, YouTube oEmbed로 검증 완료.
 * 모든 videoId는 검증된 임베드 가능 영상이며, 죽은 링크가 없습니다.
 */
const CONTENT: Record<number, MindTrackDailyContent> = {
  1: {
    day: 1,
    assessment: { route: '/stress-package', title: '스트레스 베이스라인 진단', desc: '오늘의 긴장도 · 회복 여력을 객관 점수로 측정', minutes: 5, why: '30일 변화 그래프의 0번째 점이 됩니다.' },
    video: { videoId: 'TGoAN5L_oPI', title: '5분 마음챙김 명상 — 마음을 다스리는 호흡', channel: '에일린 mind yoga', durationLabel: '5분', reason: '베이스라인 직후 가장 가벼운 진정 루틴으로 시작합니다.' },
    action: { title: '4-4-6 호흡 1세트', howTo: '4초 들이쉬고 · 4초 멈추고 · 6초 길게 내쉬기. 5번 반복.', minutes: 3 },
  },
  2: {
    day: 2,
    assessment: { route: '/depression-package', title: '마음 무게(우울감) 진단', desc: '최근 2주 마음의 무게를 단계별로 짚어봐요', minutes: 6, why: '미션을 더 정확히 맞춤화하기 위해 두 번째 층을 확인합니다.' },
    video: { videoId: 'wQfWgYCMeLw', title: '내 몸 안에서 감정 느끼고 흘려보내기 명상', channel: '마인드풀tv', durationLabel: '10분', reason: '진단 결과를 차분히 받아들이는 감정 흘려보내기 가이드.' },
    action: { title: '아침 햇빛 5분 받기', howTo: '베란다·창문 옆에서 5분간 햇빛을 받으며 깊은 호흡을 해요.', minutes: 5 },
  },
  3: {
    day: 3, assessment: null,
    video: { videoId: '3hyTLOCQFTE', title: '성공한 사람들이 꼭 하는 감정 관리법, "감정 라벨링"의 힘', channel: '모찌 심리학', durationLabel: '7분', reason: '"감정 라벨링"이 왜 강도를 줄이는지 설명하는 한국어 영상.' },
    action: { title: '오늘의 감정 단어 3개 적기', howTo: '워크북 체크인에 떠오른 감정을 단어 3개로 분리해 적어요.', minutes: 4 },
  },
  4: {
    day: 4, assessment: null,
    video: { videoId: 'GBBh694I1bw', title: '안희영 소장과 쉽게 배워보는 마음챙김 명상 "바디스캔"', channel: '한국MBSR마음챙김연구소', durationLabel: '15분', reason: '머리부터 발끝까지 긴장을 따라가는 한국어 가이드 명상.' },
    action: { title: '바디스캔 1회 + 어깨 풀기', howTo: '눈 감고 영상 따라하며 어깨 · 턱 · 미간의 힘을 의식적으로 풀어요.', minutes: 5 },
  },
  5: {
    day: 5, assessment: null,
    video: { videoId: 'Uuq4OME-7-M', title: '인생을 성공으로 이끄는 5초 법칙 — 멜 로빈스 (한영자막)', channel: '잭스파이어', durationLabel: '8분', reason: '"5분 안에 끝낼 행동"을 고르는 기준을 잡아줍니다.' },
    action: { title: '오늘의 5분 마이크로 결정 1개', howTo: '미루던 일 중 5분이면 끝나는 한 가지를 골라 지금 바로 처리해요.', minutes: 5 },
  },
  6: {
    day: 6, assessment: null,
    video: { videoId: 'Oo43FrfVXOk', title: '거절은 다정한 경계', channel: '행복한 오늘', durationLabel: '8분', reason: '"내 에너지를 빼앗는 한 가지"를 줄이기 전, 다정한 경계의 언어를 배워요.' },
    action: { title: '오늘 줄일 한 가지 정하기', howTo: '에너지 도둑 1개를 적고, 내일부터 어떻게 줄일지 한 문장으로 적어요.', minutes: 4 },
  },
  7: {
    day: 7,
    assessment: { route: '/assessment/resilience', title: '회복탄력성 1주차 진단', desc: '한 주 변화를 회복력 관점에서 측정', minutes: 7, why: '1주간 데이터를 진단 점수와 합쳐 첫 주간 인사이트가 만들어집니다.' },
    video: { videoId: 'Lllh4HdUMvk', title: '회복탄력성 향상법 두 가지 — 김주환 교수 직접 요약', channel: '김주환의 내면소통', durationLabel: '12분', reason: '1주차 진단 직후 다음 주의 방향을 잡아주는 영상.' },
    action: { title: '1주차 한 줄 회고 적기', howTo: '"내가 가장 잘한 한 가지"와 "한 가지 어려웠던 점"을 한 문장씩.', minutes: 5 },
  },
  8: {
    day: 8, assessment: null,
    video: { videoId: '6Qu5E3MrVH8', title: '5분 명상 — 인생을 180도 바꾸는 습관', channel: '에일린 mind yoga', durationLabel: '5분', reason: '루틴이 자리잡히는 원리를 짧게 정리합니다.' },
    action: { title: '어제 미션을 같은 시간대에 다시', howTo: '어제 했던 미션을 같은 시간대에 한 번 더 반복해 신경회로를 강화해요.', minutes: 5 },
  },
  9: {
    day: 9, assessment: null,
    video: { videoId: 'cvPS_25gRPs', title: '생각 비우기 명상 — 부정적 생각을 없애는 방법', channel: '에일린 mind yoga', durationLabel: '10분', reason: '"생각의 자동 재생"을 멈추는 호흡 + 시각화 가이드.' },
    action: { title: '"멈춤" 한 단어로 자동사고 끊기', howTo: '반복 생각이 떠오르면 속으로 "멈춤"이라 말하고 4-4-6 호흡 1세트.', minutes: 3 },
  },
  10: {
    day: 10,
    assessment: { route: '/anxiety-package', title: '불안 결 진단', desc: '내 에너지가 가장 떨어지는 시간대를 진단으로 짚어요', minutes: 6, why: '에너지 회복 골든타임을 정하기 전 불안 패턴을 확인합니다.' },
    video: { videoId: 'XgVjs-WeBWY', title: '불안하고 생각이 많을 때 즉시 도움되는 10분 호흡명상', channel: '마보TV', durationLabel: '10분', reason: '진단 결과와 결합해 골든타임을 찾는 단서.' },
    action: { title: '내 골든타임 1개 적기', howTo: '하루 중 가장 안정적이라 느끼는 시간대를 적고, 그때 할 미션 1개 고르기.', minutes: 4 },
  },
  11: {
    day: 11, assessment: null,
    video: { videoId: 'NKoiz6YtlRE', title: '생각이 많아질 때 멈추는 호흡법', channel: '헤럴드TV', durationLabel: '5분', reason: '관계에서 자동으로 튀어나오는 반응을 호흡으로 멈추는 법.' },
    action: { title: '최근 갈등 한 장면 1줄 묘사', howTo: '최근 가족·친구·파트너와의 한 장면을 사실 그대로 1문장으로 적어요.', minutes: 5 },
  },
  12: {
    day: 12, assessment: null,
    video: { videoId: 'QN9v0nkmR_o', title: '박스 호흡법 따라해보세요', channel: '세바시 인생질문', durationLabel: '4분', reason: '하루 짧은 틈마다 적용 가능한 4-4-4-4 호흡 가이드.' },
    action: { title: '4-4-6 호흡 3회 (분산 적용)', howTo: '아침 · 점심 · 저녁 각 1세트씩 4-4-6 호흡을 분산해서 해요.', minutes: 6 },
  },
  13: {
    day: 13, assessment: null,
    video: { videoId: 'ZcEBlA-9r9k', title: '마음이 편안해지는 10분 명상 가이드', channel: '에일린 mind yoga', durationLabel: '10분', reason: '저널링 직전 마음을 가라앉히는 호흡 가이드.' },
    action: { title: '5분 자유 기록 1편', howTo: '타이머 5분 맞추고 손 멈추지 않고 떠오르는 대로 적어요.', minutes: 5 },
  },
  14: {
    day: 14,
    assessment: { route: '/stress-package', title: '스트레스 진단 (2주차 비교)', desc: 'Day 1과 같은 진단을 다시 하고 변화량을 그래프로', minutes: 5, why: '시작 점수와 똑같은 측정을 해야 변화 그래프가 만들어집니다.' },
    video: { videoId: 'dZewQEbQQM0', title: '5분 호흡명상 — 뇌를 위한 최고의 휴식법', channel: '에일린 mind yoga', durationLabel: '5분', reason: '2주차 변화 그래프 직전, 스트레스 관리의 기본 원리를 짧게 짚어요.' },
    action: { title: '시작 vs 지금 — 한 가지 변화 적기', howTo: '2주 전과 비교해 가장 부드러워진 한 가지를 1문장으로.', minutes: 4 },
  },
  15: {
    day: 15, assessment: null,
    video: { videoId: 'LaM3-_ntnjU', title: '복잡한 생각, 5분 만에 정리하는 빼기명상 가이드', channel: '마음수련 명상', durationLabel: '5분', reason: '15일차의 정체감을 짧은 명상으로 통과합니다.' },
    action: { title: '효과 있던 루틴 TOP 3 강화', howTo: '지난 2주 중 가장 효과 있던 루틴 3가지를 골라 오늘 다시 실행.', minutes: 6 },
  },
  16: {
    day: 16, assessment: null,
    video: { videoId: 'Bcs33wFg-KA', title: '회피형 성격 극복 방법 — 회피의 과학', channel: '장동선의 궁금한 뇌', durationLabel: '12분', reason: '회피하던 한 가지를 마주할 용기를 주는 한국어 영상.' },
    action: { title: '미뤄둔 일 5분만 시도', howTo: '미뤄둔 한 가지에 타이머 5분만 맞추고 시작. 5분 뒤 멈춰도 OK.', minutes: 5 },
  },
  17: {
    day: 17, assessment: null,
    video: { videoId: 'Tiwk1f6ZS9Y', title: '회피형 성격의 인생이 꼬이는 이유 & 극복법', channel: '희렌최널', durationLabel: '12분', reason: '"도움 요청"의 심리적 장벽을 낮춰주는 영상.' },
    action: { title: '한 사람에게 짧은 도움 요청 메시지', howTo: '"~~ 좀 도와줄 수 있어?"로 시작하는 1문장 메시지를 한 사람에게 전송.', minutes: 4 },
  },
  18: {
    day: 18,
    assessment: { route: '/anxiety-package', title: '감정 강도 진단', desc: '오늘 가장 강한 감정의 강도를 0~10으로 측정', minutes: 5, why: '감정 강도 다루기 미션의 베이스라인이 됩니다.' },
    video: { videoId: 'TtTbhde9A3E', title: '감정을 피하지 않고 마주하는 연습 — RAIN 자기돌봄 명상', channel: '숲의그림자MindfulDay', durationLabel: '15분', reason: '감정 강도를 객관화하는 관점 잡기.' },
    action: { title: '오늘 감정 강도 0~10 기록', howTo: '가장 강한 감정 1개를 골라 강도와 그 직전 상황을 1줄씩.', minutes: 4 },
  },
  19: {
    day: 19, assessment: null,
    video: { videoId: 'YkFiiNBo6O0', title: '나를 사랑하는 연습 — 자애 명상', channel: '마보TV', durationLabel: '10분', reason: '"나에게 친절해지기"의 한국어 가이드 명상.' },
    action: { title: '오늘 잘한 일 1개 → 자기 칭찬 1줄', howTo: '오늘 잘한 한 가지를 적고, 자신에게 한 문장으로 칭찬해줘요.', minutes: 3 },
  },
  20: {
    day: 20, assessment: null,
    video: { videoId: 'xeul9fEvo-Q', title: '7분 긍정확언 — 나는 결국 잘될 것이다', channel: '에일린 mind yoga', durationLabel: '7분', reason: '에너지 도둑이 되는 환경을 손보기 전, 마음을 정렬합니다.' },
    action: { title: '에너지 도둑 환경 1개 손보기', howTo: '책상·휴대폰·소파 중 한 가지의 위치/설정을 5분 안에 바꿔요.', minutes: 5 },
  },
  21: {
    day: 21,
    assessment: { route: '/assessment/resilience', title: '회복탄력성 3주차 진단', desc: '3주간의 패턴 전환이 회복력에 미친 영향 측정', minutes: 7, why: '3주차 코칭 인사이트의 핵심 데이터가 됩니다.' },
    video: { videoId: '_MTd1opMBk0', title: '마음이 평온해지는 10분 명상 — 호흡 명상 가이드', channel: '에일린 mind yoga', durationLabel: '10분', reason: '3주차 마무리 깊이 있는 인사이트 직전 명상.' },
    action: { title: '3주간 가장 큰 깨달음 한 줄', howTo: '"내가 알게 된 것"을 한 문장으로 적어요.', minutes: 5 },
  },
  22: {
    day: 22, assessment: null,
    video: { videoId: '0KROAacWzEA', title: '진정한 명상은 생각을 쉬게하고 마음을 내려놓는 것', channel: '용수스님의렛고명상', durationLabel: '10분', reason: '맞춤 워크북 심화 질문을 풀기 위한 마음 비우기.' },
    action: { title: '워크북 심화 질문 1개 풀기', howTo: 'Day 22 워크북 심화 질문 1개를 골라 8분간 작성.', minutes: 8 },
  },
  23: {
    day: 23, assessment: null,
    video: { videoId: 'PIoK5ZdYk6E', title: '5분 아침명상 — 오늘은 특별한 날입니다', channel: '에일린 mind yoga', durationLabel: '5분', reason: '코파일럿 1:1 대화의 질을 높이려면 마음을 먼저 정리해요.' },
    action: { title: '코파일럿에 오늘 주제 1개 던지기', howTo: '"요즘 ___ 때문에 마음이 ___해요" 한 문장으로 코파일럿에 입력.', minutes: 6 },
  },
  24: {
    day: 24, assessment: null,
    video: { videoId: 'GQgjJUN02u4', title: '스트레스 관리 — 우울증 재발방지와 알아차림 명상', channel: '명상상담 Meditation TV', durationLabel: '12분', reason: '예전 패턴이 돌아올 때 신호를 미리 감지하는 명상.' },
    action: { title: '내 재발 방지 신호 문장 정하기', howTo: '"___ 신호가 오면 나는 ___ 한다" 형식으로 1문장 작성.', minutes: 5 },
  },
  25: {
    day: 25, assessment: null,
    video: { videoId: 'yiysD0Jl2Wo', title: '명상이 필요할 때 10분 명상 가이드', channel: '에일린 mind yoga', durationLabel: '10분', reason: '지속 가능한 회복 루틴은 "매일 짧게". 10분 데일리 명상으로 고정.' },
    action: { title: '내 핵심 루틴 TOP 3 고정', howTo: '효과 있던 루틴 3가지를 적고, 각 시간대를 정해 고정.', minutes: 6 },
  },
  26: {
    day: 26,
    assessment: { route: '/relationship-package', title: '관계 패턴 진단', desc: '관계 회복의 한 걸음 전, 내 관계 패턴 측정', minutes: 7, why: '관계 회복 미션이 더 정확해지도록 패턴을 객관화합니다.' },
    video: { videoId: 'inxAScz0PTM', title: '누워서 하는 10분 명상 — 호흡명상 가이드', channel: '에일린 mind yoga', durationLabel: '10분', reason: '미뤄둔 대화의 첫 문장을 보내기 전 마음을 정렬.' },
    action: { title: '미뤄둔 대화 첫 문장 메시지로 보내기', howTo: '"잠깐 얘기 가능해? ~ 에 대해 짧게 말하고 싶어." 1문장 전송.', minutes: 5 },
  },
  27: {
    day: 27, assessment: null,
    video: { videoId: 'NsVVO9hnCJ4', title: '완벽한 피로회복 효과 이완명상 — 스트레스 푸는법', channel: '에일린 mind yoga', durationLabel: '15분', reason: '거절 문장을 쓰기 전, 두려움을 내려놓아요.' },
    action: { title: '내 거절 문장 템플릿 1개 작성', howTo: '"미안한데 지금은 ___해서 어려워. ___ 때 다시 얘기해도 될까?" 형식.', minutes: 4 },
  },
  28: {
    day: 28, assessment: null,
    video: { videoId: 'hTSLx_wCQjU', title: '나를 힘들게 하는 불편한 감정을 건강히 다루는 명상', channel: '숨쉬는고래', durationLabel: '12분', reason: '리포트 직전 4주 흐름을 정리하기 위한 차분한 명상.' },
    action: { title: '4주차 한 문장 요약', howTo: '"나는 4주 동안 ___을 알게 되었고, ___이 달라졌다." 1문장.', minutes: 5 },
  },
  29: {
    day: 29,
    assessment: { route: '/depression-package', title: '우울감 최종 진단', desc: 'Day 2와 같은 진단을 다시 — 30일 변화 그래프 완성', minutes: 6, why: '내일의 종합 리포트가 정확해지려면 마지막 측정이 필요해요.' },
    video: { videoId: 'RptypCXGN-c', title: '매일 아침 따라 해보세요 — 10분 긍정확언', channel: '마음빛 글', durationLabel: '10분', reason: '리포트 발행 직전, 다음 한 달의 방향을 잡아주는 확언.' },
    action: { title: '체크인 마지막 1개 완성', howTo: '오늘의 무드/에너지/명료도 점수와 한 줄 메모 입력.', minutes: 4 },
  },
  30: {
    day: 30, assessment: null,
    video: { videoId: 'c9W414XrdF0', title: '밤 명상 — 잠들기 전 하루를 마무리 하는 고요한 시간', channel: '명상하는그녀_내안의별', durationLabel: '10분', reason: '리포트 수령 직후, 30일을 차분히 마무리하는 명상.' },
    action: { title: '내 30일 한 줄 변화 선언문', howTo: '"나는 ___한 사람에서 ___한 사람으로 한 발 옮겼다." 1문장 작성.', minutes: 5 },
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
