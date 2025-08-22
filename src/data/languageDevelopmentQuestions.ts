// AIH 영유아 언어발달 자가체크 - 77문항 (수용언어 39문항, 표현언어 38문항)
// 연령대별 구성: 6~12개월, 13~18개월, 19~24개월, 25~30개월, 31~36개월

export interface LanguageDevelopmentQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: 'receptive' | 'expressive';
  ageRange: '6-12' | '13-18' | '19-24' | '25-30' | '31-36';
  points: number;
}

// 수용언어 문항 (39문항)
export const receptiveLanguageQuestions: LanguageDevelopmentQuestion[] = [
  // 6-12개월 (8문항)
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
    text: "'까꿍' 놀이를 할 때 즐거워하며 반응하나요?",
    options: ["무관심함", "조금 관심을 보임", "매우 즐거워함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_04",
    text: "엄마, 아빠의 목소리를 구별할 수 있나요?",
    options: ["구별하지 못함", "때때로 구별함", "확실히 구별함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_05",
    text: "음악이나 노래에 몸을 흔들며 반응하나요?",
    options: ["반응하지 않음", "가끔 반응함", "항상 반응함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_06",
    text: "'안 돼'라는 말의 의미를 이해하고 행동을 멈추나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_07",
    text: "책을 펼쳐 놓으면 그림을 보려고 하나요?",
    options: ["관심이 없음", "조금 관심을 보임", "매우 관심을 보임"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "rec_08",
    text: "간단한 지시('이리 와', '주세요')를 이해하나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "6-12",
    points: 1
  },

  // 13-18개월 (8문항)
  {
    id: "rec_09",
    text: "'엄마는 어디 있지?'라고 물으면 엄마를 찾아보나요?",
    options: ["찾지 않음", "가끔 찾음", "적극적으로 찾음"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_10",
    text: "컵, 숟가락, 공 그림을 보고 '숟가락 가리켜봐'라고 하면 올바르게 가리키나요?",
    options: ["가리키지 못함", "때때로 맞춤", "정확히 가리킴"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_11",
    text: "'신발 가져와'와 같은 2단계 지시를 따를 수 있나요?",
    options: ["따르지 못함", "도움이 필요함", "혼자서 잘 따름"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_12",
    text: "동물 소리('멍멍', '야옹')를 듣고 해당 동물을 찾을 수 있나요?",
    options: ["찾지 못함", "가끔 찾음", "잘 찾음"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_13",
    text: "몸의 부위(눈, 코, 입)를 말하면 가리킬 수 있나요?",
    options: ["가리키지 못함", "1-2개 가리킴", "3개 이상 가리킴"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_14",
    text: "'뜨거워', '아야' 같은 표현을 듣고 조심하는 행동을 보이나요?",
    options: ["반응하지 않음", "가끔 반응함", "즉시 반응함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_15",
    text: "좋아하는 놀이나 노래 이름을 말하면 기대하는 표정을 보이나요?",
    options: ["반응하지 않음", "때때로 반응함", "즉시 반응함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "rec_16",
    text: "'맘마 먹자', '응가 하자' 같은 일상 표현을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "13-18",
    points: 1
  },

  // 19-24개월 (8문항)
  {
    id: "rec_17",
    text: "'인형 밥 먹여줘'와 같은 가상 놀이 지시를 이해하나요?",
    options: ["이해하지 못함", "도움이 필요함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_18",
    text: "색깔(빨강, 노랑, 파랑) 이름을 듣고 구별할 수 있나요?",
    options: ["구별하지 못함", "1-2개 구별함", "3개 모두 구별함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_19",
    text: "크기(큰, 작은)를 나타내는 말을 이해하나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_20",
    text: "'위', '아래', '안' 같은 위치 표현을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "정확히 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_21",
    text: "간단한 질문('뭐야?', '어디 있어?')의 의미를 이해하나요?",
    options: ["이해하지 못함", "가끔 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_22",
    text: "'하나, 둘, 셋' 세는 것을 듣고 반응하나요?",
    options: ["반응하지 않음", "조금 반응함", "적극적으로 반응함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_23",
    text: "그림책의 등장인물들을 구별할 수 있나요?",
    options: ["구별하지 못함", "몇 개만 구별함", "잘 구별함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "rec_24",
    text: "'더 주세요', '그만해요' 같은 요청을 이해하나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "19-24",
    points: 1
  },

  // 25-30개월 (8문항)
  {
    id: "rec_25",
    text: "간단한 이야기를 들려주면 끝까지 집중해서 듣나요?",
    options: ["집중하지 못함", "잠깐 집중함", "끝까지 집중함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_26",
    text: "'많이', '조금' 같은 양을 나타내는 말을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_27",
    text: "'빠르게', '천천히' 같은 속도 표현을 이해하나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_28",
    text: "감정을 나타내는 말('기뻐', '슬퍼')을 이해하나요?",
    options: ["이해하지 못함", "몇 개만 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_29",
    text: "'누가', '언제', '어디서' 같은 의문사가 포함된 질문을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_30",
    text: "반대말(크다-작다, 높다-낮다)의 개념을 이해하나요?",
    options: ["이해하지 못함", "일부만 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_31",
    text: "3-4단계의 복잡한 지시를 따를 수 있나요?",
    options: ["따르지 못함", "부분적으로 따름", "정확히 따름"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "rec_32",
    text: "시간 표현('아침', '밤', '오늘', '내일')을 이해하나요?",
    options: ["이해하지 못함", "몇 개만 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "25-30",
    points: 1
  },

  // 31-36개월 (7문항)
  {
    id: "rec_33",
    text: "복잡한 문장('공원에 가서 그네를 타자')을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "완전히 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_34",
    text: "추상적인 개념('착해', '나빠', '예뻐')을 이해하나요?",
    options: ["이해하지 못함", "조금 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_35",
    text: "조건을 나타내는 문장('만약 비가 오면...')을 이해하나요?",
    options: ["이해하지 못함", "때때로 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_36",
    text: "긴 이야기를 듣고 내용에 대해 간단한 질문에 답할 수 있나요?",
    options: ["답하지 못함", "부분적으로 답함", "정확히 답함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_37",
    text: "숫자 개념(1, 2, 3)을 이해하고 구별하나요?",
    options: ["구별하지 못함", "1-2개만 구별함", "3개 모두 구별함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_38",
    text: "미래에 대한 표현('나중에', '다음에')을 이해하나요?",
    options: ["이해하지 못함", "가끔 이해함", "잘 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "rec_39",
    text: "복합적인 명령('장난감을 정리하고 손을 씻어요')을 이해하나요?",
    options: ["이해하지 못함", "부분적으로 이해함", "완전히 이해함"],
    correctAnswer: 2,
    category: "receptive",
    ageRange: "31-36",
    points: 1
  }
];

// 표현언어 문항 (38문항)
export const expressiveLanguageQuestions: LanguageDevelopmentQuestion[] = [
  // 6-12개월 (7문항)
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
    text: "소리 내어 웃거나 기쁨을 표현하나요?",
    options: ["표현하지 않음", "가끔 표현함", "자주 표현함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "exp_05",
    text: "불러주는 노래에 맞춰 소리를 내나요?",
    options: ["내지 않음", "때때로 냄", "적극적으로 냄"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "exp_06",
    text: "관심 있는 것을 가리키며 소리를 내나요?",
    options: ["하지 않음", "가끔 함", "자주 함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "6-12",
    points: 1
  },
  {
    id: "exp_07",
    text: "'안녕', '빠이빠이' 같은 인사를 따라 하려고 하나요?",
    options: ["시도하지 않음", "가끔 시도함", "자주 시도함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "6-12",
    points: 1
  },

  // 13-18개월 (8문항)
  {
    id: "exp_08",
    text: "5개 이상의 단어를 명확하게 말할 수 있나요?",
    options: ["3개 미만", "3-5개", "5개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_09",
    text: "원하는 것을 단어로 표현하려고 하나요? ('물', '과자' 등)",
    options: ["표현하지 않음", "가끔 표현함", "적극적으로 표현함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_10",
    text: "동물 이름이나 소리를 따라 말하나요? ('멍멍', '야옹' 등)",
    options: ["말하지 않음", "1-2개 말함", "3개 이상 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_11",
    text: "'더', '없어' 같은 개념어를 사용하나요?",
    options: ["사용하지 않음", "1개 정도 사용함", "2개 이상 사용함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_12",
    text: "간단한 질문('뭐야?')을 흉내 내어 말하나요?",
    options: ["하지 않음", "가끔 함", "자주 함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_13",
    text: "친숙한 사람들의 이름을 부르나요?",
    options: ["부르지 않음", "1-2명 정도", "여러 명을 부름"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_14",
    text: "몸짓과 말을 함께 사용해서 의사소통하나요?",
    options: ["하지 않음", "때때로 함", "자주 함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },
  {
    id: "exp_15",
    text: "'응', '아니' 같은 대답을 적절히 사용하나요?",
    options: ["사용하지 않음", "가끔 사용함", "적절히 사용함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "13-18",
    points: 1
  },

  // 19-24개월 (8문항)
  {
    id: "exp_16",
    text: "20개 이상의 단어를 말할 수 있나요?",
    options: ["10개 미만", "10-20개", "20개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_17",
    text: "2개 단어를 조합해서 말하나요? ('엄마 줘', '맘마 먹어' 등)",
    options: ["조합하지 않음", "가끔 조합함", "자주 조합함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_18",
    text: "자신의 요구사항을 말로 표현하나요?",
    options: ["표현하지 않음", "간단히 표현함", "명확히 표현함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_19",
    text: "일상생활 용품의 이름을 말할 수 있나요? (컵, 신발, 모자 등)",
    options: ["3개 미만", "3-5개", "5개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_20",
    text: "색깔 이름을 하나 이상 말할 수 있나요?",
    options: ["말하지 못함", "1개 정도", "2개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_21",
    text: "'큰', '작은' 같은 크기 표현을 사용하나요?",
    options: ["사용하지 않음", "1개 정도 사용함", "적절히 사용함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_22",
    text: "간단한 질문에 단어로 대답하나요? ('누구야?', '뭐야?' 등)",
    options: ["대답하지 않음", "때때로 대답함", "적절히 대답함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },
  {
    id: "exp_23",
    text: "노래나 동요의 일부를 따라 부르나요?",
    options: ["부르지 않음", "조금 부름", "잘 따라 부름"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "19-24",
    points: 1
  },

  // 25-30개월 (8문항)
  {
    id: "exp_24",
    text: "50개 이상의 단어를 사용할 수 있나요?",
    options: ["30개 미만", "30-50개", "50개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_25",
    text: "3개 단어 이상의 문장을 만들어 말하나요?",
    options: ["만들지 못함", "가끔 만듦", "자주 만듦"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_26",
    text: "자신의 경험을 간단히 말할 수 있나요? ('공원 갔어', '과자 먹었어' 등)",
    options: ["말하지 못함", "아주 간단히", "비교적 명확히"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_27",
    text: "'왜?', '뭐?' 같은 질문을 스스로 하나요?",
    options: ["질문하지 않음", "가끔 질문함", "자주 질문함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_28",
    text: "감정을 말로 표현하나요? ('기뻐', '슬퍼', '화나' 등)",
    options: ["표현하지 않음", "1-2개 정도", "다양하게 표현함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_29",
    text: "소유를 나타내는 표현을 사용하나요? ('내 거', '엄마 것' 등)",
    options: ["사용하지 않음", "가끔 사용함", "적절히 사용함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_30",
    text: "과거와 현재를 구분해서 말하나요?",
    options: ["구분하지 않음", "때때로 구분함", "명확히 구분함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },
  {
    id: "exp_31",
    text: "상대방에게 적절한 반응을 말로 하나요?",
    options: ["반응하지 않음", "간단히 반응함", "적절히 반응함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "25-30",
    points: 1
  },

  // 31-36개월 (7문항)
  {
    id: "exp_32",
    text: "100개 이상의 단어를 사용할 수 있나요?",
    options: ["50개 미만", "50-100개", "100개 이상"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_33",
    text: "4-5개 단어로 이루어진 완전한 문장을 말하나요?",
    options: ["말하지 못함", "가끔 말함", "자주 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_34",
    text: "자신의 이름과 나이를 말할 수 있나요?",
    options: ["말하지 못함", "하나만 말함", "둘 다 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_35",
    text: "간단한 이야기를 순서대로 말할 수 있나요?",
    options: ["말하지 못함", "부분적으로", "순서대로 잘 말함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_36",
    text: "미래에 대한 계획을 말로 표현하나요? ('내일 놀이터 가기' 등)",
    options: ["표현하지 않음", "때때로 표현함", "자주 표현함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_37",
    text: "타인과의 대화에서 주고받기를 할 수 있나요?",
    options: ["하지 못함", "간단한 주고받기", "자연스러운 대화"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  },
  {
    id: "exp_38",
    text: "복잡한 개념을 자신만의 방식으로 설명하려고 하나요?",
    options: ["시도하지 않음", "가끔 시도함", "적극적으로 시도함"],
    correctAnswer: 2,
    category: "expressive",
    ageRange: "31-36",
    points: 1
  }
];

// 전체 문항 (77문항)
export const allLanguageDevelopmentQuestions = [
  ...receptiveLanguageQuestions,
  ...expressiveLanguageQuestions
];

// 점수 해석 기준
export const languageDevelopmentScoring = {
  receptive: {
    excellent: { min: 35, max: 39, description: "수용언어 발달이 매우 우수합니다" },
    good: { min: 30, max: 34, description: "수용언어 발달이 양호합니다" },
    average: { min: 24, max: 29, description: "수용언어 발달이 평균 수준입니다" },
    needsAttention: { min: 0, max: 23, description: "수용언어 발달에 관심이 필요합니다" }
  },
  expressive: {
    excellent: { min: 34, max: 38, description: "표현언어 발달이 매우 우수합니다" },
    good: { min: 29, max: 33, description: "표현언어 발달이 양호합니다" },
    average: { min: 23, max: 28, description: "표현언어 발달이 평균 수준입니다" },
    needsAttention: { min: 0, max: 22, description: "표현언어 발달에 관심이 필요합니다" }
  },
  total: {
    excellent: { min: 69, max: 77, description: "전체 언어발달이 매우 우수합니다" },
    good: { min: 59, max: 68, description: "전체 언어발달이 양호합니다" },
    average: { min: 47, max: 58, description: "전체 언어발달이 평균 수준입니다" },
    needsAttention: { min: 0, max: 46, description: "전체 언어발달에 관심이 필요합니다" }
  }
};