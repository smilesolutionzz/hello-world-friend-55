// AIH 영유아 언어발달 프리미엄 체크 - 45문항 (수용언어 23문항, 표현언어 22문항)
// 연령대별 구성: 6~12개월, 13~18개월, 19~24개월, 25~30개월, 31~36개월
// 3분 기본테스트와 차별화: 정밀한 AI 분석, 세부적인 발달 단계별 평가, 전문가 수준 해석

export interface LanguageDevelopmentQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: 'receptive' | 'expressive';
  ageRange: '6-12' | '13-18' | '19-24' | '25-30' | '31-36';
  points: number;
}

// 수용언어 문항 (23문항) - 핵심 발달 지표만 선별
export const receptiveLanguageQuestions: LanguageDevelopmentQuestion[] = [
  // 6-12개월 (5문항)
  {
    id: "rec_01",
    text: "아이가 자신의 이름을 부르면 고개를 돌리거나 반응을 보이나요?",
    options: ["전혀 반응하지 않음", "가끔 반응함", "대부분 반응함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_02", 
    text: "'안녕', '빠이빠이' 같은 인사말에 몸짓으로 반응하나요?",
    options: ["전혀 반응하지 않음", "가끔 반응함", "자주 반응함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_03",
    text: "엄마, 아빠의 목소리를 구별할 수 있나요?",
    options: ["구별하지 못함", "때때로 구별함", "확실히 구별함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_04",
    text: "'안 돼'라는 말의 의미를 이해하고 행동을 멈추나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_05",
    text: "간단한 지시('이리 와', '주세요')를 이해하나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },

  // 13-18개월 (5문항)
  {
    id: "rec_06",
    text: "'엄마는 어디 있지?'라고 물으면 엄마를 찾아보나요?",
    options: ["찾지 않음", "가끔 찾음", "적극적으로 찾음"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_07",
    text: "'신발 가져와'와 같은 2단계 지시를 따를 수 있나요?",
    options: ["따르지 못함", "도움이 필요함", "혼자서 잘 따름"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_08",
    text: "몸의 부위(눈, 코, 입)를 말하면 가리킬 수 있나요?",
    options: ["가리키지 못함", "1-2개 가리킴", "3개 이상 가리킴"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_09",
    text: "좋아하는 놀이나 노래 이름을 말하면 기대하는 표정을 보이나요?",
    options: ["반응하지 않음", "때때로 반응함", "즉시 반응함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_10",
    text: "'맘마 먹자', '응가 하자' 같은 일상 표현을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },

  // 19-24개월 (5문항)
  {
    id: "rec_11",
    text: "'인형 밥 먹여줘'와 같은 가상 놀이 지시를 이해하나요?",
    options: ["이해하지 못함", "도움이 필요함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_12",
    text: "색깔(빨강, 노랑, 파랑) 이름을 듣고 구별할 수 있나요?",
    options: ["구별하지 못함", "1-2개 구별함", "3개 모두 구별함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_13",
    text: "'위', '아래', '안' 같은 위치 표현을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "정확히 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_14",
    text: "간단한 질문('뭐야?', '어디 있어?')의 의미를 이해하나요?",
    options: ["이해하지 못함", "가끔 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_15",
    text: "'더 주세요', '그만해요' 같은 요청을 이해하나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },

  // 25-30개월 (4문항)
  {
    id: "rec_16",
    text: "간단한 이야기를 들려주면 끝까지 집중해서 듣나요?",
    options: ["집중하지 못함", "잠깐 집중함", "끝까지 집중함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_17",
    text: "감정을 나타내는 말('기뻐', '슬퍼')을 이해하나요?",
    options: ["이해하지 못함", "몇 개만 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_18",
    text: "'누가', '언제', '어디서' 같은 의문사가 포함된 질문을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_19",
    text: "3-4단계의 복잡한 지시를 따를 수 있나요?",
    options: ["따르지 못함", "부분적으로 따름", "정확히 따름"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },

  // 31-36개월 (4문항)
  {
    id: "rec_20",
    text: "복잡한 문장('공원에 가서 그네를 타자')을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "완전히 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_21",
    text: "조건을 나타내는 문장('만약 비가 오면...')을 이해하나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_22",
    text: "긴 이야기를 듣고 내용에 대해 간단한 질문에 답할 수 있나요?",
    options: ["답하지 못함", "부분적으로 답함", "정확히 답함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_23",
    text: "복합적인 명령('장난감을 정리하고 손을 씻어요')을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "완전히 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  }
];

// 표현언어 문항 (22문항)
export const expressiveLanguageQuestions: LanguageDevelopmentQuestion[] = [
  // 6-12개월 (4문항)
  {
    id: "exp_01",
    text: "옹알이를 다양한 소리로 하나요? (아, 우, 바바, 다다 등)",
    options: ["거의 하지 않음", "가끔 함", "자주 함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "exp_02",
    text: "의미있는 첫 단어('엄마', '아빠', '맘마')를 말하나요?",
    options: ["말하지 않음", "1개 정도 말함", "2개 이상 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "exp_03",
    text: "요구사항을 몸짓으로 표현하나요? (손 뻗기, 가리키기 등)",
    options: ["표현하지 않음", "때때로 표현함", "적극적으로 표현함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "exp_04",
    text: "'안녕', '빠이빠이' 같은 인사를 따라 하려고 하나요?",
    options: ["시도하지 않음", "가끔 시도함", "자주 시도함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "6-12",
    points: 1
  },

  // 13-18개월 (5문항)
  {
    id: "exp_05",
    text: "5개 이상의 단어를 명확하게 말할 수 있나요?",
    options: ["3개 미만", "3-5개", "5개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_06",
    text: "원하는 것을 단어로 표현하려고 하나요? ('물', '과자' 등)",
    options: ["표현하지 않음", "가끔 표현함", "적극적으로 표현함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_07",
    text: "동물 이름이나 소리를 따라 말하나요? ('멍멍', '야옹' 등)",
    options: ["말하지 않음", "1-2개 말함", "3개 이상 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_08",
    text: "친숙한 사람들의 이름을 부르나요?",
    options: ["부르지 않음", "1-2명 정도", "여러 명을 부름"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_09",
    text: "'응', '아니' 같은 대답을 적절히 사용하나요?",
    options: ["사용하지 않음", "가끔 사용함", "적절히 사용함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },

  // 19-24개월 (5문항)
  {
    id: "exp_10",
    text: "20개 이상의 단어를 말할 수 있나요?",
    options: ["10개 미만", "10-20개", "20개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_11",
    text: "2개 단어를 조합해서 말하나요? ('엄마 줘', '맘마 먹어' 등)",
    options: ["조합하지 않음", "가끔 조합함", "자주 조합함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_12",
    text: "자신의 요구사항을 말로 표현하나요?",
    options: ["표현하지 않음", "간단히 표현함", "명확히 표현함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_13",
    text: "일상생활 용품의 이름을 말할 수 있나요? (컵, 신발, 모자 등)",
    options: ["3개 미만", "3-5개", "5개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_14",
    text: "간단한 질문에 단어로 대답하나요? ('누구야?', '뭐야?' 등)",
    options: ["대답하지 않음", "때때로 대답함", "적절히 대답함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },

  // 25-30개월 (4문항)
  {
    id: "exp_15",
    text: "50개 이상의 단어를 사용할 수 있나요?",
    options: ["30개 미만", "30-50개", "50개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_16",
    text: "3개 단어 이상의 문장을 만들어 말하나요?",
    options: ["만들지 못함", "가끔 만듦", "자주 만듦"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_17",
    text: "자신의 경험을 간단히 말할 수 있나요? ('공원 갔어', '과자 먹었어' 등)",
    options: ["말하지 못함", "아주 간단히", "비교적 명확히"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_18",
    text: "'왜?', '뭐?' 같은 질문을 스스로 하나요?",
    options: ["질문하지 않음", "가끔 질문함", "자주 질문함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },

  // 31-36개월 (4문항)
  {
    id: "exp_19",
    text: "4-5개 단어로 이루어진 완전한 문장을 말하나요?",
    options: ["말하지 못함", "가끔 말함", "자주 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_20",
    text: "자신의 이름과 나이를 말할 수 있나요?",
    options: ["말하지 못함", "하나만 말함", "둘 다 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_21",
    text: "간단한 이야기를 순서대로 말할 수 있나요?",
    options: ["말하지 못함", "부분적으로", "순서대로 잘 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_22",
    text: "타인과의 대화에서 주고받기를 할 수 있나요?",
    options: ["하지 못함", "간단한 주고받기", "자연스러운 대화"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  }
];

// 전체 문항 (45문항)
export const allLanguageDevelopmentQuestions = [
  ...receptiveLanguageQuestions,
  ...expressiveLanguageQuestions
];

// 점수 해석 기준 (45문항 기준)
export const languageDevelopmentScoring = {
  receptive: {
    excellent: { min: 21, max: 23, description: "수용언어 발달이 매우 우수합니다" },
    good: { min: 18, max: 20, description: "수용언어 발달이 양호합니다" },
    average: { min: 14, max: 17, description: "수용언어 발달이 평균 수준입니다" },
    needsAttention: { min: 0, max: 13, description: "수용언어 발달에 관심이 필요합니다" }
  },
  expressive: {
    excellent: { min: 20, max: 22, description: "표현언어 발달이 매우 우수합니다" },
    good: { min: 17, max: 19, description: "표현언어 발달이 양호합니다" },
    average: { min: 13, max: 16, description: "표현언어 발달이 평균 수준입니다" },
    needsAttention: { min: 0, max: 12, description: "표현언어 발달에 관심이 필요합니다" }
  },
  total: {
    excellent: { min: 41, max: 45, description: "전체 언어발달이 매우 우수합니다" },
    good: { min: 35, max: 40, description: "전체 언어발달이 양호합니다" },
    average: { min: 27, max: 34, description: "전체 언어발달이 평균 수준입니다" },
    needsAttention: { min: 0, max: 26, description: "전체 언어발달에 관심이 필요합니다" }
  }
};
