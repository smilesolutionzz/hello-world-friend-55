export interface MBTIOption {
  text: string;
  description?: string;
  score: number; // -2 to 2
}

export interface MBTIQuestion {
  question: string;
  context?: string;
  category: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  options: MBTIOption[];
}

export const MBTIQuestions: MBTIQuestion[] = [
  // E-I 차원 (외향-내향) - 7개
  {
    question: "금요일 저녁, 친구가 갑자기 술 한잔하자고 연락왔어요",
    context: "이미 집에 도착해서 편한 옷으로 갈아입은 상태입니다",
    category: "에너지 방향",
    dimension: "EI",
    options: [
      { text: "좋아! 당장 나갈게!", description: "사람 만나는 게 더 재밌죠", score: 2 },
      { text: "오케이~ 30분 후에 보자", description: "나가는 것도 나쁘지 않네", score: 1 },
      { text: "오늘은 좀 피곤해서...", description: "혼자 있고 싶은 날도 있잖아요", score: -1 },
      { text: "다음에 보자! 오늘은 집순이 할래", description: "집이 최고입니다", score: -2 }
    ]
  },
  {
    question: "파티에서 모르는 사람들이 많아요. 어떻게 하시나요?",
    category: "에너지 방향",
    dimension: "EI",
    options: [
      { text: "적극적으로 먼저 다가가서 말 걸기", description: "새로운 사람 만나는 거 좋아해요", score: 2 },
      { text: "아는 사람과 함께 다니면서 소개받기", description: "자연스럽게 친해지는 게 좋죠", score: 1 },
      { text: "말 걸어주면 대화하고, 아니면 조용히 있기", description: "굳이 적극적일 필요는...", score: -1 },
      { text: "아는 사람 옆에만 붙어있기", description: "모르는 사람은 부담스러워요", score: -2 }
    ]
  },
  {
    question: "오랜만에 만난 친구와 5시간 놀고 집에 왔어요",
    category: "에너지 방향",
    dimension: "EI",
    options: [
      { text: "아직도 신나서 다른 친구들한테 연락", description: "에너지가 넘쳐요!", score: 2 },
      { text: "오늘 하루 되게 즐거웠다~", description: "기분 좋은 하루였어요", score: 1 },
      { text: "집에서 좀 쉬어야겠다", description: "에너지 충전 필요", score: -1 },
      { text: "완전 녹초... 말도 하기 싫어", description: "배터리 방전됐어요", score: -2 }
    ]
  },
  {
    question: "회사/학교에서 점심시간이에요",
    category: "에너지 방향",
    dimension: "EI",
    options: [
      { text: "여러 명이랑 왁자지껄 먹기", description: "식사는 다같이 먹어야 맛있죠", score: 2 },
      { text: "친한 사람이랑 같이 먹기", description: "아는 사람이랑 먹는 게 편해요", score: 1 },
      { text: "혼자 먹거나 헤드폰 끼고 먹기", description: "점심시간엔 휴식이 필요해요", score: -1 },
      { text: "무조건 혼밥! 그게 최고", description: "나만의 시간이 소중해요", score: -2 }
    ]
  },
  {
    question: "주말에 집에만 있었더니 월요일 아침",
    category: "에너지 방향",
    dimension: "EI",
    options: [
      { text: "답답해 죽을 것 같아... 사람 만나야겠다", description: "에너지 충전이 필요해요", score: 2 },
      { text: "사람 좀 만나고 싶긴 하네", description: "밖에 나가면 좋을 것 같아요", score: 1 },
      { text: "집에서 잘 쉬었다~ 개운해", description: "충분히 회복됐어요", score: -1 },
      { text: "완벽한 주말! 더 쉬고 싶다", description: "혼자 있는 게 최고의 휴식", score: -2 }
    ]
  },
  {
    question: "길 가다가 아는 사람을 봤는데 나를 못 봤어요",
    category: "에너지 방향",
    dimension: "EI",
    options: [
      { text: "크게 불러서 반갑게 인사", description: "만나면 당연히 인사해야죠", score: 2 },
      { text: "다가가서 어깨 톡 치기", description: "반가우니까 말 걸어요", score: 1 },
      { text: "눈 마주치면 인사, 아니면 그냥 지나감", description: "굳이 먼저 말 걸 필요는...", score: -1 },
      { text: "못 본 척 빠르게 지나가기", description: "사회생활 하기 싫어요", score: -2 }
    ]
  },
  {
    question: "연휴가 3일 남았어요. 뭐 할까요?",
    category: "에너지 방향",
    dimension: "EI",
    options: [
      { text: "친구들 다 불러서 놀 계획 세우기", description: "사람들이랑 놀아야 연휴죠", score: 2 },
      { text: "친구 몇 명이랑 가볍게 놀기", description: "적당히 만나는 게 좋아요", score: 1 },
      { text: "1-2명만 만나고 나머지는 집에서", description: "적당한 사회생활만", score: -1 },
      { text: "집에서 혼자 보내기", description: "나만의 시간이 최고", score: -2 }
    ]
  },

  // S-N 차원 (감각-직관) - 7개
  {
    question: "친구가 '어제 꿈에서 날아다녔어!'라고 하면",
    category: "정보 인식",
    dimension: "SN",
    options: [
      { text: "그게 무슨 의미가 있을까? 뭔가 상징적인 거 아냐?", description: "꿈은 무의식의 메시지!", score: 2 },
      { text: "신기하다! 어떤 느낌이었어?", description: "경험 자체가 흥미로워요", score: 1 },
      { text: "잠을 잘 못 잤나? 피곤하면 그런 꿈 꾸더라", description: "실질적인 이유가 있겠죠", score: -1 },
      { text: "그냥 꿈이잖아. 별 의미 없어", description: "꿈은 그냥 꿈일 뿐", score: -2 }
    ]
  },
  {
    question: "새로운 카페에 갔을 때, 가장 먼저 눈에 들어오는 것은?",
    category: "정보 인식",
    dimension: "SN",
    options: [
      { text: "이 카페만의 독특한 분위기와 콘셉트", description: "전체적인 느낌이 중요해요", score: 2 },
      { text: "인테리어 스타일이 어떤 감성인지", description: "분위기를 먼저 느껴요", score: 1 },
      { text: "자리가 편한지, 콘센트는 있는지", description: "실용성을 체크합니다", score: -1 },
      { text: "메뉴판의 가격과 음료 종류", description: "구체적인 정보가 필요해요", score: -2 }
    ]
  },
  {
    question: "요리 레시피를 볼 때",
    category: "정보 인식",
    dimension: "SN",
    options: [
      { text: "대충 보고 감으로 만들기", description: "레시피는 참고만!", score: 2 },
      { text: "기본은 따르되 내 스타일로 변형", description: "창의적으로 응용해요", score: 1 },
      { text: "레시피대로 정확히 따라하기", description: "정확히 하는 게 안전해요", score: -1 },
      { text: "그램 단위까지 재면서 만들기", description: "정밀하게 해야 맛있어요", score: -2 }
    ]
  },
  {
    question: "책을 읽을 때",
    category: "정보 인식",
    dimension: "SN",
    options: [
      { text: "행간의 의미, 숨겨진 메시지 찾기", description: "작가가 전하고 싶은 본질", score: 2 },
      { text: "전체적인 스토리와 주제에 집중", description: "큰 그림을 봐요", score: 1 },
      { text: "세부 묘사와 구체적 설명 위주로", description: "디테일이 중요해요", score: -1 },
      { text: "팩트와 정보 위주로 읽기", description: "정확한 내용 파악", score: -2 }
    ]
  },
  {
    question: "처음 가는 곳으로 여행갈 때",
    category: "정보 인식",
    dimension: "SN",
    options: [
      { text: "이 여행이 나에게 어떤 의미일까 상상", description: "여행의 본질적 가치", score: 2 },
      { text: "어떤 경험을 하게 될지 기대", description: "새로운 발견이 설레요", score: 1 },
      { text: "구체적인 명소와 맛집 리스트 작성", description: "철저한 준비가 중요해요", score: -1 },
      { text: "교통편, 숙소, 비용 정확히 체크", description: "실용적인 정보 수집", score: -2 }
    ]
  },
  {
    question: "친구가 새 직장 이야기를 하는데",
    category: "정보 인식",
    dimension: "SN",
    options: [
      { text: "이 회사가 앞으로 어떻게 될까?", description: "미래 가능성이 궁금해요", score: 2 },
      { text: "분위기나 업무 스타일이 어때?", description: "전반적인 느낌이 중요해요", score: 1 },
      { text: "연봉이랑 복지는 어때?", description: "실질적인 조건을 확인해요", score: -1 },
      { text: "출퇴근 시간, 업무량은?", description: "구체적인 정보가 필요해요", score: -2 }
    ]
  },
  {
    question: "뉴스를 볼 때",
    category: "정보 인식",
    dimension: "SN",
    options: [
      { text: "이 사건이 사회에 미칠 영향", description: "큰 맥락을 생각해요", score: 2 },
      { text: "왜 이런 일이 일어났을까", description: "배경과 원인이 궁금해요", score: 1 },
      { text: "누가, 언제, 어디서, 무엇을", description: "정확한 사실 파악", score: -1 },
      { text: "구체적인 수치와 통계", description: "객관적 데이터가 중요해요", score: -2 }
    ]
  },

  // T-F 차원 (사고-감정) - 6개
  {
    question: "친구가 '나 회사 그만두고 싶어'라고 하면",
    category: "판단 기준",
    dimension: "TF",
    options: [
      { text: "힘들었겠다ㅠㅠ 많이 스트레스 받았어?", description: "감정을 먼저 공감해요", score: 2 },
      { text: "무슨 일 있었어? 얘기 들어줄게", description: "이야기를 들어주고 싶어요", score: 1 },
      { text: "다음 회사 알아봤어? 당장 그만두면 어쩌려고?", description: "현실적인 조언이 필요해요", score: -1 },
      { text: "이직 시장 상황 알아봤어? 연봉은 얼마나 받을 수 있을까?", description: "구체적인 계획이 중요해요", score: -2 }
    ]
  },
  {
    question: "길에서 지나가다 다투는 커플을 봤어요",
    category: "판단 기준",
    dimension: "TF",
    options: [
      { text: "저 사람들 관계 괜찮을까... 안쓰럽다", description: "감정이 먼저 느껴져요", score: 2 },
      { text: "무슨 일이 있었을까 궁금하네", description: "상황이 궁금해요", score: 1 },
      { text: "공공장소에서 다투는 건 좀...", description: "객관적으로 판단해요", score: -1 },
      { text: "나랑 상관없는 일이네", description: "남의 일은 남의 일", score: -2 }
    ]
  },
  {
    question: "팀 프로젝트에서 한 팀원이 실수를 했어요",
    category: "판단 기준",
    dimension: "TF",
    options: [
      { text: "괜찮아! 누구나 실수할 수 있어", description: "위로를 먼저 해요", score: 2 },
      { text: "다음엔 이렇게 해보는 건 어때?", description: "부드럽게 피드백해요", score: 1 },
      { text: "왜 이렇게 했는지 설명해줄래?", description: "이유를 파악하고 싶어요", score: -1 },
      { text: "이 부분은 이렇게 하면 더 효율적일 것 같은데", description: "개선 방안을 제시해요", score: -2 }
    ]
  },
  {
    question: "친구가 시험에서 떨어졌다고 해요",
    category: "판단 기준",
    dimension: "TF",
    options: [
      { text: "많이 속상하겠다ㅠㅠ 괜찮아?", description: "마음을 먼저 헤아려요", score: 2 },
      { text: "힘들었을 텐데... 같이 밥 먹을까?", description: "위로해주고 싶어요", score: 1 },
      { text: "어느 부분이 어려웠어?", description: "문제를 분석하고 싶어요", score: -1 },
      { text: "다음엔 이렇게 준비하면 될 것 같은데", description: "해결책을 제시해요", score: -2 }
    ]
  },
  {
    question: "영화 보고 나왔는데 결말이 슬펐어요",
    category: "판단 기준",
    dimension: "TF",
    options: [
      { text: "너무 슬프다... 주인공 생각하면 눈물나", description: "감정에 몰입했어요", score: 2 },
      { text: "마음이 먹먹하네... 여운이 남아", description: "감동받았어요", score: 1 },
      { text: "연출은 좋았는데 스토리가 좀...", description: "객관적으로 평가해요", score: -1 },
      { text: "결말 논리가 안 맞지 않아?", description: "분석적으로 봐요", score: -2 }
    ]
  },
  {
    question: "후배가 일처리를 잘못했어요",
    category: "판단 기준",
    dimension: "TF",
    options: [
      { text: "힘들었을 텐데... 괜찮아 천천히 해", description: "배려가 우선이에요", score: 2 },
      { text: "이 부분이 어려웠구나, 같이 해보자", description: "공감하며 도와줘요", score: 1 },
      { text: "다음부터는 이렇게 하면 돼", description: "명확하게 알려줘요", score: -1 },
      { text: "왜 이렇게 했는지 이해가 안 가", description: "논리적으로 따져요", score: -2 }
    ]
  },

  // J-P 차원 (판단-인식) - 5개
  {
    question: "주말 여행을 갈 때",
    category: "생활 방식",
    dimension: "JP",
    options: [
      { text: "일정표 만들고 예약 다 해두기", description: "계획대로가 편해요", score: 2 },
      { text: "주요 장소만 정하고 나머지는 대충", description: "큰 틀만 있으면 돼요", score: 1 },
      { text: "가서 그때그때 정하기", description: "즉흥적으로 움직여요", score: -1 },
      { text: "계획? 그냥 일단 가!", description: "계획은 필요 없어요", score: -2 }
    ]
  },
  {
    question: "과제 마감이 2주 남았어요",
    category: "생활 방식",
    dimension: "JP",
    options: [
      { text: "오늘 당장 시작해서 일주일 안에 끝내기", description: "미리미리가 정신건강에 좋아요", score: 2 },
      { text: "계획 세우고 나눠서 하기", description: "체계적으로 진행해요", score: 1 },
      { text: "며칠 남았을 때 시작", description: "적당한 압박이 필요해요", score: -1 },
      { text: "마감 전날 올나이터", description: "데드라인이 동력!", score: -2 }
    ]
  },
  {
    question: "방을 청소할 때",
    category: "생활 방식",
    dimension: "JP",
    options: [
      { text: "정리 순서 정하고 체계적으로", description: "계획적으로 해요", score: 2 },
      { text: "보이는 곳부터 차근차근", description: "순서대로 진행해요", score: 1 },
      { text: "눈에 띄는 것부터 막 치우기", description: "일단 시작하고 봐요", score: -1 },
      { text: "치우다가 딴 짓하다가 반복", description: "자유롭게 움직여요", score: -2 }
    ]
  },
  {
    question: "하루 일과를 정할 때",
    category: "생활 방식",
    dimension: "JP",
    options: [
      { text: "시간 단위로 스케줄 짜기", description: "계획표가 있어야 편해요", score: 2 },
      { text: "해야 할 일 리스트 만들기", description: "할 일은 정리해둬요", score: 1 },
      { text: "큰 일정만 체크하고 자유롭게", description: "융통성 있게 움직여요", score: -1 },
      { text: "그때그때 하고 싶은 거 하기", description: "계획 없이 사는 게 편해요", score: -2 }
    ]
  },
  {
    question: "갑자기 약속이 취소됐어요",
    category: "생활 방식",
    dimension: "JP",
    options: [
      { text: "계획이 틀어져서 불안함", description: "계획대로 안 되면 스트레스", score: 2 },
      { text: "아쉽지만 다른 계획 세우기", description: "새로운 계획을 만들어요", score: 1 },
      { text: "오히려 좋아! 쉬어야지", description: "여유가 생겨서 좋아요", score: -1 },
      { text: "좋아! 즉흥적으로 뭐 할까?", description: "자유로운 시간 최고!", score: -2 }
    ]
  },

  // 추가 균형 질문들
  {
    question: "친구가 갑자기 '나 좀 이상한 사람 맞지?'라고 물어봐요",
    category: "에너지 방향",
    dimension: "EI",
    options: [
      { text: "그게 너만의 매력이지! 난 그런 네가 좋아", description: "긍정적으로 표현해요", score: 2 },
      { text: "독특한 건 맞는데 나쁜 건 아니야", description: "있는 그대로 받아들여요", score: 1 },
      { text: "뭐가 이상하다는 거야?", description: "구체적으로 물어봐요", score: -1 },
      { text: "음... 뭘 보고 그렇게 생각해?", description: "분석적으로 접근해요", score: -2 }
    ]
  },
  {
    question: "영화를 볼 때 가장 집중하는 부분은?",
    category: "정보 인식",
    dimension: "SN",
    options: [
      { text: "등장인물들의 관계와 심리", description: "인간 드라마에 몰입해요", score: 2 },
      { text: "전체적인 스토리 흐름", description: "이야기 구조를 봐요", score: 1 },
      { text: "디테일한 배경과 소품", description: "세부사항을 관찰해요", score: -1 },
      { text: "논리적 개연성", description: "설정이 합리적인지 확인해요", score: -2 }
    ]
  },
  {
    question: "친구가 새로 산 옷을 입고 나타났어요",
    category: "판단 기준",
    dimension: "TF",
    options: [
      { text: "우와! 진짜 잘 어울린다!", description: "바로 칭찬해요", score: 2 },
      { text: "좋은데? 어디서 샀어?", description: "긍정적으로 반응해요", score: 1 },
      { text: "음... 색깔이 좀 어두운 것 같은데", description: "솔직하게 말해요", score: -1 },
      { text: "가격 대비 괜찮은 거 같아?", description: "실용성을 먼저 생각해요", score: -2 }
    ]
  },
  {
    question: "갑자기 약속이 취소됐어요",
    category: "생활 방식",
    dimension: "JP",
    options: [
      { text: "계획이 틀어져서 불안함", description: "계획대로 안 되면 스트레스", score: 2 },
      { text: "아쉽지만 다른 계획 세우기", description: "새로운 계획을 만들어요", score: 1 },
      { text: "오히려 좋아! 쉬어야지", description: "여유가 생겨서 좋아요", score: -1 },
      { text: "좋아! 즉흥적으로 뭐 할까?", description: "자유로운 시간 최고!", score: -2 }
    ]
  }
];
