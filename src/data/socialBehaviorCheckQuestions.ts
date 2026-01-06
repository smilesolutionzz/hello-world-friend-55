// AIH 사회적 행동 발달 자가체크 (Social Behavior Development Self-Check)
// 본 검사는 AIH에서 독자 개발한 창작형 부모 관찰 도구입니다.
// 진단 도구가 아니며, 일상 속 아이의 사회적 행동 패턴을 체크하는 자가점검 용도입니다.

export const socialBehaviorCheckInfo = {
  title: "AIH 사회적 행동 발달 자가체크",
  subtitle: "SBDS-AIH (Social Behavior Development Self-check)",
  description: "일상에서 관찰되는 아이의 사회적 행동 패턴을 체크하는 부모용 자가점검 도구입니다",
  features: [
    "일상 속 사회적 상호작용 패턴 체크",
    "놀이 및 또래관계 특성 확인",
    "감정표현 및 공감능력 관찰",
    "의사소통 방식 점검",
    "환경 적응 특성 파악"
  ],
  duration: "10-15분",
  targetAge: "24개월 - 12세",
  category: "발달체크",
  priority: 2,
  highlight: true,
  questions_count: 40,
  premium_features: [
    "5가지 발달 영역별 상세 분석",
    "강점 중심 리포트 제공",
    "일상 활동 가이드 추천",
    "관찰 포인트 체크리스트",
    "전문 상담 필요 여부 안내",
    "맞춤형 놀이 활동 제안"
  ],
  disclaimer: "본 자가체크는 진단 도구가 아닙니다. 부모님의 일상 관찰을 바탕으로 아이의 발달 특성을 이해하는 참고 자료로만 활용하세요. 걱정되는 부분이 있다면 전문가와 상담하시기 바랍니다."
};

// 40문항 - 5개 영역 (영역당 8문항)
export const socialBehaviorCheckQuestions = {
  // 영역 1: 사회적 상호작용 (Social Interaction)
  social_interaction: [
    {
      id: "sbc_si01",
      text: "아이가 부모님이나 양육자에게 먼저 다가와 안기거나 신체 접촉을 시도하나요?",
      category: "social_interaction",
      subcategory: "attachment",
      options: [
        { value: 4, label: "자주 그렇다 (하루에 여러 번)" },
        { value: 3, label: "종종 그렇다 (하루에 1-2번)" },
        { value: 2, label: "가끔 그렇다 (일주일에 몇 번)" },
        { value: 1, label: "거의 그렇지 않다" }
      ],
      weight: 1.2,
      guideline: "애착 표현 빈도 관찰"
    },
    {
      id: "sbc_si02",
      text: "새로운 사람을 만났을 때 아이가 어떻게 반응하나요?",
      category: "social_interaction",
      subcategory: "stranger_response",
      options: [
        { value: 4, label: "호기심을 보이며 다가간다" },
        { value: 3, label: "처음엔 조심스럽지만 곧 편해진다" },
        { value: 2, label: "오래 경계하거나 피한다" },
        { value: 1, label: "전혀 관심을 보이지 않거나 극도로 불안해한다" }
      ],
      weight: 1.1,
      guideline: "낯선 사람에 대한 반응 패턴"
    },
    {
      id: "sbc_si03",
      text: "아이가 기분이 좋을 때 주변 사람들과 그 기쁨을 나누려고 하나요? (예: 좋아하는 것을 보여주거나 함께 웃기)",
      category: "social_interaction",
      subcategory: "shared_enjoyment",
      options: [
        { value: 4, label: "적극적으로 나누려 한다" },
        { value: 3, label: "종종 나누려 한다" },
        { value: 2, label: "가끔 나누려 한다" },
        { value: 1, label: "혼자만 즐기는 경우가 많다" }
      ],
      weight: 1.3,
      guideline: "정서 공유 의지"
    },
    {
      id: "sbc_si04",
      text: "다른 사람이 다치거나 슬퍼할 때 아이가 위로하려는 모습을 보이나요?",
      category: "social_interaction",
      subcategory: "empathy_action",
      options: [
        { value: 4, label: "다가가서 위로하거나 걱정한다" },
        { value: 3, label: "표정이 변하며 관심을 보인다" },
        { value: 2, label: "잠깐 쳐다보는 정도이다" },
        { value: 1, label: "별다른 반응이 없다" }
      ],
      weight: 1.2,
      guideline: "공감적 행동 관찰"
    },
    {
      id: "sbc_si05",
      text: "아이가 다른 사람의 시선을 따라 같은 방향을 쳐다보나요? (예: 부모가 창밖을 보면 따라 보기)",
      category: "social_interaction",
      subcategory: "joint_attention",
      options: [
        { value: 4, label: "대부분 따라 본다" },
        { value: 3, label: "종종 따라 본다" },
        { value: 2, label: "가끔 따라 본다" },
        { value: 1, label: "거의 따라 보지 않는다" }
      ],
      weight: 1.4,
      guideline: "공동 주의 집중력"
    },
    {
      id: "sbc_si06",
      text: "아이가 부모님의 감정 변화(기쁨, 걱정, 화남 등)를 알아차리는 것 같나요?",
      category: "social_interaction",
      subcategory: "emotion_recognition",
      options: [
        { value: 4, label: "민감하게 알아차린다" },
        { value: 3, label: "대체로 알아차린다" },
        { value: 2, label: "가끔 알아차린다" },
        { value: 1, label: "잘 알아차리지 못한다" }
      ],
      weight: 1.1,
      guideline: "타인 감정 인식력"
    },
    {
      id: "sbc_si07",
      text: "아이가 칭찬이나 격려를 받았을 때 어떻게 반응하나요?",
      category: "social_interaction",
      subcategory: "praise_response",
      options: [
        { value: 4, label: "기뻐하며 더 열심히 한다" },
        { value: 3, label: "미소 짓거나 기분 좋아한다" },
        { value: 2, label: "별 반응 없이 지나간다" },
        { value: 1, label: "불편해하거나 피한다" }
      ],
      weight: 1.0,
      guideline: "사회적 보상에 대한 반응"
    },
    {
      id: "sbc_si08",
      text: "아이가 자신의 이름을 부르면 쳐다보거나 반응하나요?",
      category: "social_interaction",
      subcategory: "name_response",
      options: [
        { value: 4, label: "대부분 바로 반응한다" },
        { value: 3, label: "몇 번 부르면 반응한다" },
        { value: 2, label: "집중하고 있을 때는 잘 반응하지 않는다" },
        { value: 1, label: "반응이 거의 없다" }
      ],
      weight: 1.3,
      guideline: "호명 반응"
    }
  ],

  // 영역 2: 놀이 및 또래관계 (Play & Peer Relationship)
  play_peer: [
    {
      id: "sbc_pp01",
      text: "아이가 또래 아이들과 함께 노는 것을 즐기나요?",
      category: "play_peer",
      subcategory: "peer_play",
      options: [
        { value: 4, label: "매우 좋아한다" },
        { value: 3, label: "좋아하는 편이다" },
        { value: 2, label: "혼자 노는 것을 더 선호한다" },
        { value: 1, label: "또래와 함께 있는 것을 불편해한다" }
      ],
      weight: 1.2,
      guideline: "또래 놀이 선호도"
    },
    {
      id: "sbc_pp02",
      text: "역할 놀이(소꿉놀이, 의사놀이 등)를 할 때 아이가 적절한 역할을 수행하나요?",
      category: "play_peer",
      subcategory: "pretend_play",
      options: [
        { value: 4, label: "다양한 역할을 자연스럽게 한다" },
        { value: 3, label: "간단한 역할놀이를 한다" },
        { value: 2, label: "역할놀이보다 사물 자체에 관심을 둔다" },
        { value: 1, label: "역할놀이에 관심이 없다" }
      ],
      weight: 1.3,
      guideline: "가상놀이 능력"
    },
    {
      id: "sbc_pp03",
      text: "놀이할 때 차례를 기다리거나 규칙을 따르나요?",
      category: "play_peer",
      subcategory: "turn_taking",
      options: [
        { value: 4, label: "잘 기다리고 규칙을 따른다" },
        { value: 3, label: "대체로 따르지만 가끔 어려워한다" },
        { value: 2, label: "자주 어려워하며 도움이 필요하다" },
        { value: 1, label: "매우 어려워한다" }
      ],
      weight: 1.1,
      guideline: "차례지키기와 규칙 이해"
    },
    {
      id: "sbc_pp04",
      text: "아이가 장난감을 다른 아이와 나누어 가지고 노나요?",
      category: "play_peer",
      subcategory: "sharing",
      options: [
        { value: 4, label: "자연스럽게 나눈다" },
        { value: 3, label: "요청하면 나눈다" },
        { value: 2, label: "나누기를 꺼린다" },
        { value: 1, label: "절대 나누지 않으려 한다" }
      ],
      weight: 1.0,
      guideline: "나누기 행동"
    },
    {
      id: "sbc_pp05",
      text: "아이가 놀이 상황에서 다른 아이의 의견이나 아이디어를 받아들이나요?",
      category: "play_peer",
      subcategory: "flexibility",
      options: [
        { value: 4, label: "유연하게 받아들인다" },
        { value: 3, label: "대체로 받아들인다" },
        { value: 2, label: "자기 방식을 고집하는 편이다" },
        { value: 1, label: "항상 자기 방식대로만 하려 한다" }
      ],
      weight: 1.2,
      guideline: "놀이의 유연성"
    },
    {
      id: "sbc_pp06",
      text: "아이가 또래 아이들의 놀이에 자연스럽게 끼어드나요?",
      category: "play_peer",
      subcategory: "joining_play",
      options: [
        { value: 4, label: "자연스럽게 합류한다" },
        { value: 3, label: "가끔 합류한다" },
        { value: 2, label: "멀리서 지켜보는 경우가 많다" },
        { value: 1, label: "합류하지 않거나 방법을 모르는 것 같다" }
      ],
      weight: 1.3,
      guideline: "또래 집단 참여"
    },
    {
      id: "sbc_pp07",
      text: "아이가 놀이 중 갈등이 생겼을 때 어떻게 대처하나요?",
      category: "play_peer",
      subcategory: "conflict_resolution",
      options: [
        { value: 4, label: "말로 해결하려 한다" },
        { value: 3, label: "어른에게 도움을 요청한다" },
        { value: 2, label: "울거나 그 자리를 피한다" },
        { value: 1, label: "공격적으로 행동하거나 심하게 당황한다" }
      ],
      weight: 1.1,
      guideline: "갈등 해결 방식"
    },
    {
      id: "sbc_pp08",
      text: "아이가 인형이나 장난감에 감정을 부여하며 노나요? (예: 인형이 배고프다, 아프다 등)",
      category: "play_peer",
      subcategory: "symbolic_play",
      options: [
        { value: 4, label: "자주 그런다" },
        { value: 3, label: "종종 그런다" },
        { value: 2, label: "가끔 그런다" },
        { value: 1, label: "거의 그러지 않는다" }
      ],
      weight: 1.2,
      guideline: "상징놀이 발달"
    }
  ],

  // 영역 3: 의사소통 (Communication)
  communication: [
    {
      id: "sbc_cm01",
      text: "아이가 원하는 것이 있을 때 어떻게 표현하나요?",
      category: "communication",
      subcategory: "requesting",
      options: [
        { value: 4, label: "말이나 제스처로 명확하게 표현한다" },
        { value: 3, label: "손가락으로 가리키며 표현한다" },
        { value: 2, label: "어른의 손을 끌고 간다" },
        { value: 1, label: "울거나 떼를 쓴다" }
      ],
      weight: 1.3,
      guideline: "요구 표현 방식"
    },
    {
      id: "sbc_cm02",
      text: "아이가 대화할 때 상대방의 말에 적절하게 반응하나요?",
      category: "communication",
      subcategory: "reciprocity",
      options: [
        { value: 4, label: "주제에 맞게 대화를 이어간다" },
        { value: 3, label: "대체로 적절하게 반응한다" },
        { value: 2, label: "때때로 엉뚱한 대답을 한다" },
        { value: 1, label: "자기 얘기만 하거나 대답하지 않는다" }
      ],
      weight: 1.2,
      guideline: "대화의 상호성"
    },
    {
      id: "sbc_cm03",
      text: "아이가 자신의 경험이나 하루 있었던 일을 이야기하나요?",
      category: "communication",
      subcategory: "narrative",
      options: [
        { value: 4, label: "자세히 이야기한다" },
        { value: 3, label: "간단히 이야기한다" },
        { value: 2, label: "질문하면 조금 이야기한다" },
        { value: 1, label: "거의 이야기하지 않는다" }
      ],
      weight: 1.1,
      guideline: "이야기 나누기"
    },
    {
      id: "sbc_cm04",
      text: "아이가 대화 중 눈을 맞추나요?",
      category: "communication",
      subcategory: "eye_contact_communication",
      options: [
        { value: 4, label: "자연스럽게 눈을 맞춘다" },
        { value: 3, label: "종종 눈을 맞춘다" },
        { value: 2, label: "잠깐 쳐다보다 피한다" },
        { value: 1, label: "거의 눈을 맞추지 않는다" }
      ],
      weight: 1.4,
      guideline: "대화 중 시선 접촉"
    },
    {
      id: "sbc_cm05",
      text: "아이가 표정이나 몸짓으로 자신의 감정을 표현하나요?",
      category: "communication",
      subcategory: "nonverbal_expression",
      options: [
        { value: 4, label: "다양하고 풍부하게 표현한다" },
        { value: 3, label: "기본적인 감정은 표현한다" },
        { value: 2, label: "표현이 제한적이다" },
        { value: 1, label: "표정 변화가 거의 없다" }
      ],
      weight: 1.2,
      guideline: "비언어적 감정 표현"
    },
    {
      id: "sbc_cm06",
      text: "아이가 질문에 대해 적절한 대답을 하나요?",
      category: "communication",
      subcategory: "question_response",
      options: [
        { value: 4, label: "질문을 잘 이해하고 대답한다" },
        { value: 3, label: "대체로 적절하게 대답한다" },
        { value: 2, label: "질문을 되풀이하거나 관련 없는 대답을 한다" },
        { value: 1, label: "대답하지 않거나 이해하지 못하는 것 같다" }
      ],
      weight: 1.1,
      guideline: "질문 이해와 응답"
    },
    {
      id: "sbc_cm07",
      text: "아이가 상대방의 말투나 표현을 그대로 따라 하나요? (반향어)",
      category: "communication",
      subcategory: "echolalia",
      options: [
        { value: 4, label: "거의 그러지 않는다" },
        { value: 3, label: "가끔 재미로 따라 한다" },
        { value: 2, label: "자주 따라 한다" },
        { value: 1, label: "대화 대신 따라 하는 경우가 많다" }
      ],
      weight: 1.3,
      guideline: "반향어 빈도 (역채점)"
    },
    {
      id: "sbc_cm08",
      text: "아이가 '나', '너' 같은 대명사를 적절하게 사용하나요?",
      category: "communication",
      subcategory: "pronoun_use",
      options: [
        { value: 4, label: "정확하게 사용한다" },
        { value: 3, label: "대체로 맞게 사용한다" },
        { value: 2, label: "자주 혼동한다" },
        { value: 1, label: "대명사를 거의 사용하지 않거나 뒤바꿔 사용한다" }
      ],
      weight: 1.2,
      guideline: "대명사 사용"
    }
  ],

  // 영역 4: 행동 패턴 (Behavioral Patterns)
  behavioral_patterns: [
    {
      id: "sbc_bp01",
      text: "아이가 특정 사물이나 주제에 대해 매우 깊이 집착하나요?",
      category: "behavioral_patterns",
      subcategory: "restricted_interests",
      options: [
        { value: 4, label: "다양한 관심사를 가진다" },
        { value: 3, label: "좋아하는 것이 있지만 다른 것도 즐긴다" },
        { value: 2, label: "특정 주제에 몰두하는 경향이 있다" },
        { value: 1, label: "하나의 주제에만 강하게 집착한다" }
      ],
      weight: 1.3,
      guideline: "관심사의 범위"
    },
    {
      id: "sbc_bp02",
      text: "아이가 일과나 환경의 변화에 어떻게 반응하나요?",
      category: "behavioral_patterns",
      subcategory: "routine_change",
      options: [
        { value: 4, label: "유연하게 적응한다" },
        { value: 3, label: "약간 불편해하지만 곧 적응한다" },
        { value: 2, label: "많이 불안해하며 적응에 시간이 걸린다" },
        { value: 1, label: "극도로 힘들어하거나 심하게 저항한다" }
      ],
      weight: 1.4,
      guideline: "변화 적응력"
    },
    {
      id: "sbc_bp03",
      text: "아이가 손을 퍼덕거리거나 빙글빙글 도는 등 반복적인 움직임을 하나요?",
      category: "behavioral_patterns",
      subcategory: "repetitive_motor",
      options: [
        { value: 4, label: "거의 하지 않는다" },
        { value: 3, label: "흥분할 때 가끔 한다" },
        { value: 2, label: "자주 한다" },
        { value: 1, label: "매우 자주 하며 멈추기 어렵다" }
      ],
      weight: 1.2,
      guideline: "반복적 운동 행동"
    },
    {
      id: "sbc_bp04",
      text: "아이가 장난감을 가지고 놀 때 원래 목적대로 사용하나요?",
      category: "behavioral_patterns",
      subcategory: "functional_play",
      options: [
        { value: 4, label: "다양한 방식으로 창의적으로 논다" },
        { value: 3, label: "본래 목적대로 논다" },
        { value: 2, label: "줄 세우거나 분류하는 놀이를 선호한다" },
        { value: 1, label: "장난감의 특정 부분(바퀴 등)에만 관심을 둔다" }
      ],
      weight: 1.2,
      guideline: "장난감 놀이 방식"
    },
    {
      id: "sbc_bp05",
      text: "아이가 특정 순서나 위치에 대해 고집을 부리나요?",
      category: "behavioral_patterns",
      subcategory: "insistence_sameness",
      options: [
        { value: 4, label: "그런 경우가 거의 없다" },
        { value: 3, label: "가끔 그런다" },
        { value: 2, label: "자주 그런다" },
        { value: 1, label: "순서가 바뀌면 심하게 불안해한다" }
      ],
      weight: 1.3,
      guideline: "동일성 고집"
    },
    {
      id: "sbc_bp06",
      text: "아이가 새로운 음식, 옷, 활동을 시도하는 것에 대해 어떤가요?",
      category: "behavioral_patterns",
      subcategory: "novelty_response",
      options: [
        { value: 4, label: "새로운 것을 즐긴다" },
        { value: 3, label: "격려하면 시도한다" },
        { value: 2, label: "거부하는 경우가 많다" },
        { value: 1, label: "극도로 거부한다" }
      ],
      weight: 1.1,
      guideline: "새로움에 대한 반응"
    },
    {
      id: "sbc_bp07",
      text: "아이가 특정 단어나 소리, 숫자 등을 반복해서 말하나요?",
      category: "behavioral_patterns",
      subcategory: "verbal_repetition",
      options: [
        { value: 4, label: "거의 그러지 않는다" },
        { value: 3, label: "가끔 노래나 대사를 반복한다" },
        { value: 2, label: "자주 반복한다" },
        { value: 1, label: "대부분의 말이 반복적이다" }
      ],
      weight: 1.2,
      guideline: "언어적 반복"
    },
    {
      id: "sbc_bp08",
      text: "아이가 예상치 못한 상황에서 어떻게 대처하나요?",
      category: "behavioral_patterns",
      subcategory: "unexpected_situation",
      options: [
        { value: 4, label: "당황하지만 곧 대처한다" },
        { value: 3, label: "도움을 요청한다" },
        { value: 2, label: "멍해지거나 울음을 터뜨린다" },
        { value: 1, label: "패닉 상태가 되거나 심하게 저항한다" }
      ],
      weight: 1.3,
      guideline: "예상치 못한 상황 대처"
    }
  ],

  // 영역 5: 감각 반응 (Sensory Response)
  sensory_response: [
    {
      id: "sbc_sr01",
      text: "아이가 큰 소리(청소기, 드라이기 등)에 어떻게 반응하나요?",
      category: "sensory_response",
      subcategory: "auditory",
      options: [
        { value: 4, label: "별 반응 없이 자연스럽다" },
        { value: 3, label: "약간 신경 쓰이지만 괜찮다" },
        { value: 2, label: "귀를 막거나 불편해한다" },
        { value: 1, label: "극도로 괴로워하거나 도망간다" }
      ],
      weight: 1.2,
      guideline: "청각 민감성"
    },
    {
      id: "sbc_sr02",
      text: "아이가 특정 촉감(옷감, 모래 등)에 대해 예민하게 반응하나요?",
      category: "sensory_response",
      subcategory: "tactile",
      options: [
        { value: 4, label: "다양한 촉감을 즐긴다" },
        { value: 3, label: "선호하는 촉감이 있지만 대체로 괜찮다" },
        { value: 2, label: "특정 촉감을 심하게 싫어한다" },
        { value: 1, label: "많은 촉감을 거부하고 회피한다" }
      ],
      weight: 1.1,
      guideline: "촉각 민감성"
    },
    {
      id: "sbc_sr03",
      text: "아이가 밝은 빛이나 반짝이는 것에 어떻게 반응하나요?",
      category: "sensory_response",
      subcategory: "visual",
      options: [
        { value: 4, label: "일반적으로 반응한다" },
        { value: 3, label: "밝은 빛을 조금 불편해한다" },
        { value: 2, label: "빛을 피하거나 응시하는 경향이 있다" },
        { value: 1, label: "빛에 극도로 민감하거나 집착한다" }
      ],
      weight: 1.0,
      guideline: "시각 민감성"
    },
    {
      id: "sbc_sr04",
      text: "아이가 음식의 질감에 대해 까다로운가요?",
      category: "sensory_response",
      subcategory: "oral_texture",
      options: [
        { value: 4, label: "다양한 질감의 음식을 먹는다" },
        { value: 3, label: "선호도는 있지만 대체로 잘 먹는다" },
        { value: 2, label: "특정 질감만 먹으려 한다" },
        { value: 1, label: "매우 제한된 질감의 음식만 먹는다" }
      ],
      weight: 1.1,
      guideline: "구강 감각(질감)"
    },
    {
      id: "sbc_sr05",
      text: "아이가 그네, 회전 놀이 등 움직이는 놀이기구를 즐기나요?",
      category: "sensory_response",
      subcategory: "vestibular",
      options: [
        { value: 4, label: "적당히 즐긴다" },
        { value: 3, label: "좋아하거나 보통이다" },
        { value: 2, label: "과도하게 좋아하거나 극도로 무서워한다" },
        { value: 1, label: "끊임없이 찾거나 절대 안 하려 한다" }
      ],
      weight: 1.0,
      guideline: "전정 감각"
    },
    {
      id: "sbc_sr06",
      text: "아이가 냄새에 대해 예민하게 반응하나요?",
      category: "sensory_response",
      subcategory: "olfactory",
      options: [
        { value: 4, label: "일반적으로 반응한다" },
        { value: 3, label: "특정 냄새에 민감하다" },
        { value: 2, label: "많은 냄새를 불편해한다" },
        { value: 1, label: "냄새에 극도로 민감하거나 냄새를 맡으려 집착한다" }
      ],
      weight: 0.9,
      guideline: "후각 민감성"
    },
    {
      id: "sbc_sr07",
      text: "아이가 통증에 대해 어떻게 반응하나요?",
      category: "sensory_response",
      subcategory: "pain_response",
      options: [
        { value: 4, label: "적절하게 반응한다" },
        { value: 3, label: "약간 둔감하거나 민감한 편이다" },
        { value: 2, label: "많이 둔감하거나 과민하다" },
        { value: 1, label: "통증에 거의 반응하지 않거나 극도로 반응한다" }
      ],
      weight: 1.1,
      guideline: "통증 반응"
    },
    {
      id: "sbc_sr08",
      text: "아이가 특정 물건을 입에 넣거나 핥거나 씹는 행동을 하나요?",
      category: "sensory_response",
      subcategory: "oral_seeking",
      options: [
        { value: 4, label: "해당 연령에 맞게 그러지 않는다" },
        { value: 3, label: "가끔 그런다 (스트레스 시)" },
        { value: 2, label: "자주 그런다" },
        { value: 1, label: "매우 자주 그러며 멈추기 어렵다" }
      ],
      weight: 1.0,
      guideline: "구강 감각 추구"
    }
  ]
};
