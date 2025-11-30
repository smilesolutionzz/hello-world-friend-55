export interface MBTIPercentages {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export const calculateMBTI = (answers: Record<number, number>): string => {
  const scores = {
    EI: 0, // E(+) vs I(-)
    SN: 0, // S(-) vs N(+)
    TF: 0, // T(-) vs F(+)
    JP: 0  // J(+) vs P(-)
  };

  // MBTIQuestions의 dimension에 따라 점수 누적
  Object.entries(answers).forEach(([questionIndex, score]) => {
    const qIndex = parseInt(questionIndex);
    // 질문 인덱스에 따라 차원 결정 (MBTIQuestions 순서와 일치)
    if (qIndex <= 6) {
      // E-I: 0-6번 (7개)
      scores.EI += score;
    } else if (qIndex <= 13) {
      // S-N: 7-13번 (7개)
      scores.SN += score;
    } else if (qIndex <= 19) {
      // T-F: 14-19번 (6개)
      scores.TF += score;
    } else {
      // J-P: 20-24번 (5개)
      scores.JP += score;
    }
  });

  // MBTI 타입 결정
  const type = 
    (scores.EI > 0 ? 'E' : 'I') +
    (scores.SN > 0 ? 'N' : 'S') +
    (scores.TF > 0 ? 'F' : 'T') +
    (scores.JP > 0 ? 'J' : 'P');

  return type;
};

export const calculateMBTIPercentages = (answers: Record<number, number>): MBTIPercentages => {
  const counts = {
    EI: { total: 0, positive: 0 },
    SN: { total: 0, positive: 0 },
    TF: { total: 0, positive: 0 },
    JP: { total: 0, positive: 0 }
  };

  // 각 차원별 점수 누적
  Object.entries(answers).forEach(([questionIndex, score]) => {
    const qIndex = parseInt(questionIndex);
    
    if (qIndex <= 6) {
      counts.EI.total++;
      if (score > 0) counts.EI.positive++;
    } else if (qIndex <= 13) {
      counts.SN.total++;
      if (score > 0) counts.SN.positive++;
    } else if (qIndex <= 19) {
      counts.TF.total++;
      if (score > 0) counts.TF.positive++;
    } else {
      counts.JP.total++;
      if (score > 0) counts.JP.positive++;
    }
  });

  // 퍼센트 계산
  const ePercent = counts.EI.total > 0 ? (counts.EI.positive / counts.EI.total) * 100 : 50;
  const iPercent = 100 - ePercent;
  
  const nPercent = counts.SN.total > 0 ? (counts.SN.positive / counts.SN.total) * 100 : 50;
  const sPercent = 100 - nPercent;
  
  const fPercent = counts.TF.total > 0 ? (counts.TF.positive / counts.TF.total) * 100 : 50;
  const tPercent = 100 - fPercent;
  
  const jPercent = counts.JP.total > 0 ? (counts.JP.positive / counts.JP.total) * 100 : 50;
  const pPercent = 100 - jPercent;

  return {
    E: Math.round(ePercent),
    I: Math.round(iPercent),
    S: Math.round(sPercent),
    N: Math.round(nPercent),
    T: Math.round(tPercent),
    F: Math.round(fPercent),
    J: Math.round(jPercent),
    P: Math.round(pPercent)
  };
};

export const getMBTIDescription = (type: string) => {
  const descriptions: Record<string, { 
    title: string; 
    subtitle: string; 
    description: string; 
    strengths: string[]; 
    weaknesses: string[]; 
    careers: string[];
    loveStyle: string;
    compatibility: string[];
    celebrities: string[];
    whenStressed: string;
  }> = {
    'INTJ': {
      title: '전략가',
      subtitle: '상상력이 풍부한 전략가',
      description: '모든 일에 전략이 있고, 독립적이며 목표 지향적입니다. 복잡한 문제를 해결하는 것을 즐깁니다.',
      strengths: ['전략적 사고', '독립적', '결단력', '장기 계획'],
      weaknesses: ['감정 표현 서툼', '지나친 비판', '완벽주의'],
      careers: ['전략 컨설턴트', '과학자', '프로그래머', 'CEO'],
      loveStyle: '지적인 대화를 중요시하며 깊고 의미있는 관계를 추구합니다. 감정 표현은 서툴지만 헌신적입니다.',
      compatibility: ['ENFP', 'ENTP', 'INFP'],
      celebrities: ['방탄소년단 RM', '이병헌', '공유'],
      whenStressed: '혼자만의 시간을 가지며 전략을 재정비하고, 장기적인 계획을 세웁니다.'
    },
    'INTP': {
      title: '논리술사',
      subtitle: '혁신적인 발명가',
      description: '지적 호기심이 많고 창의적입니다. 이론과 논리를 좋아하며 새로운 아이디어를 탐구합니다.',
      strengths: ['논리적 분석', '객관적', '창의적 문제해결', '지적 호기심'],
      weaknesses: ['실행력 부족', '감정 소홀', '산만함'],
      careers: ['연구원', '철학자', '수학자', '엔지니어'],
      loveStyle: '논리적이고 이성적인 관계를 선호하며, 상대의 독립성을 존중합니다. 감정 표현보다는 행동으로 사랑을 보여줍니다.',
      compatibility: ['ENTJ', 'ENFJ', 'INFJ'],
      celebrities: ['박보검', '정재형', '김태희'],
      whenStressed: '이론적 분석에 몰두하며 혼자 생각을 정리하는 시간을 가집니다.'
    },
    'ENTJ': {
      title: '통솔자',
      subtitle: '대담한 지도자',
      description: '타고난 리더십과 결단력을 가졌습니다. 목표를 향해 팀을 이끌고 효율성을 추구합니다.',
      strengths: ['리더십', '결단력', '전략적', '효율성'],
      weaknesses: ['고집', '무뚝뚝함', '인내심 부족'],
      careers: ['경영자', '변호사', '정치인', '기업가'],
      loveStyle: '주도적이고 계획적인 연애를 선호합니다. 목표 지향적이며 파트너의 성장을 중요하게 생각합니다.',
      compatibility: ['INTP', 'INFP', 'ENFP'],
      celebrities: ['현빈', '손흥민', '전지현'],
      whenStressed: '더 열심히 일하며 목표 달성에 집중합니다. 운동으로 스트레스를 해소합니다.'
    },
    'ENTP': {
      title: '변론가',
      subtitle: '영리한 악마의 대변인',
      description: '재치있고 똑똑하며 논쟁을 즐깁니다. 새로운 가능성을 탐구하고 도전하는 것을 좋아합니다.',
      strengths: ['창의성', '논리력', '적응력', '설득력'],
      weaknesses: ['논쟁적', '산만함', '규칙 무시'],
      careers: ['마케터', '변호사', '발명가', '컨설턴트'],
      loveStyle: '지적인 토론을 즐기며 자유롭고 모험적인 관계를 추구합니다. 루틴보다는 새로운 경험을 선호합니다.',
      compatibility: ['INTJ', 'INFJ', 'ENFJ'],
      celebrities: ['유재석', '김구라', '송민호'],
      whenStressed: '새로운 프로젝트를 시작하거나 토론에 참여하여 에너지를 발산합니다.'
    },
    'INFJ': {
      title: '옹호자',
      subtitle: '선의의 옹호자',
      description: '이상주의적이고 원칙이 뚜렷합니다. 깊은 통찰력으로 사람을 이해하고 도우려 합니다.',
      strengths: ['통찰력', '공감 능력', '헌신적', '창의적'],
      weaknesses: ['완벽주의', '번아웃', '감정 과몰입'],
      careers: ['상담사', '작가', 'NGO 활동가', '교육자'],
      loveStyle: '깊고 의미있는 영혼의 교감을 추구합니다. 이상적인 사랑을 꿈꾸며 헌신적으로 사랑합니다.',
      compatibility: ['ENTP', 'ENFP', 'INTP'],
      celebrities: ['뷔(방탄소년단)', '수지', '손예진'],
      whenStressed: '혼자만의 시간으로 에너지를 재충전하며, 글쓰기나 명상을 합니다.'
    },
    'INFP': {
      title: '중재자',
      subtitle: '이상주의적 몽상가',
      description: '감수성이 풍부하고 이상주의적입니다. 자신만의 가치관을 중시하며 창의적입니다.',
      strengths: ['공감 능력', '창의성', '이상주의', '진정성'],
      weaknesses: ['현실감 부족', '우유부단', '비현실적'],
      careers: ['예술가', '작가', '심리상담사', '사회복지사'],
      loveStyle: '로맨틱하고 감성적인 연애를 추구합니다. 진실되고 순수한 사랑을 꿈꾸며 상대를 이상화합니다.',
      compatibility: ['ENFJ', 'ENTJ', 'INTJ'],
      celebrities: ['지민(방탄소년단)', '태연', '박보영'],
      whenStressed: '예술적 활동이나 상상의 세계로 도피하며, 혼자만의 시간을 가집니다.'
    },
    'ENFJ': {
      title: '선도자',
      subtitle: '카리스마 넘치는 지도자',
      description: '타인을 이끌고 영감을 주는 리더입니다. 사람들의 잠재력을 끌어내는 것을 좋아합니다.',
      strengths: ['카리스마', '공감 능력', '소통 능력', '열정'],
      weaknesses: ['지나친 이타심', '비판에 민감', '과도한 걱정'],
      careers: ['교사', '코치', 'HR 매니저', '상담사'],
      loveStyle: '파트너의 성장을 적극적으로 돕고 지지합니다. 따뜻하고 헌신적이며 관계에 많은 에너지를 투자합니다.',
      compatibility: ['INFP', 'ISFP', 'INTP'],
      celebrities: ['지드래곤', '아이유', '강호동'],
      whenStressed: '주변 사람들과 대화하며 감정을 나누고, 누군가를 도우며 에너지를 얻습니다.'
    },
    'ENFP': {
      title: '활동가',
      subtitle: '열정적인 자유영혼',
      description: '열정적이고 창의적이며 사교적입니다. 새로운 가능성과 아이디어를 탐구하는 것을 즐깁니다.',
      strengths: ['열정', '창의성', '사교성', '낙관적'],
      weaknesses: ['산만함', '스트레스 관리', '완성도'],
      careers: ['배우', '마케터', '상담사', '이벤트 기획자'],
      loveStyle: '열정적이고 로맨틱합니다. 새로운 경험을 함께 하며, 깊은 감정적 유대를 형성합니다.',
      compatibility: ['INTJ', 'INFJ', 'ENTJ'],
      celebrities: ['제시', '화사', '규현'],
      whenStressed: '친구들과 어울리거나 새로운 활동을 시작하며 긍정적 에너지를 찾습니다.'
    },
    'ISTJ': {
      title: '현실주의자',
      subtitle: '실용적인 논리주의자',
      description: '책임감이 강하고 신뢰할 수 있습니다. 사실과 세부사항을 중시하며 체계적입니다.',
      strengths: ['책임감', '체계적', '신뢰성', '꼼꼼함'],
      weaknesses: ['경직됨', '변화 거부', '감정 표현 어려움'],
      careers: ['회계사', '공무원', '의사', '엔지니어'],
      loveStyle: '진지하고 헌신적입니다. 실용적이고 안정적인 관계를 추구하며, 책임감 있게 행동합니다.',
      compatibility: ['ESFP', 'ESTP', 'ISFP'],
      celebrities: ['김연아', '박항서', '송강호'],
      whenStressed: '계획을 재점검하고 할 일 목록을 만들며, 규칙적인 루틴을 따릅니다.'
    },
    'ISFJ': {
      title: '수호자',
      subtitle: '헌신적인 보호자',
      description: '따뜻하고 헌신적이며 책임감이 강합니다. 다른 사람을 돕고 보호하는 것을 중요하게 여깁니다.',
      strengths: ['헌신적', '세심함', '책임감', '인내심'],
      weaknesses: ['자기주장 약함', '변화 어려움', '과도한 희생'],
      careers: ['간호사', '교사', '사회복지사', '행정직'],
      loveStyle: '세심하고 배려심이 깊습니다. 파트너의 필요를 채워주고 안정적인 관계를 만들어갑니다.',
      compatibility: ['ESFP', 'ESTP', 'ENFP'],
      celebrities: ['윤아', '이준기', '박서준'],
      whenStressed: '집안일이나 정리정돈을 하며 마음을 안정시키고, 친한 사람과 시간을 보냅니다.'
    },
    'ESTJ': {
      title: '경영자',
      subtitle: '뛰어난 관리자',
      description: '조직적이고 실용적이며 결단력이 있습니다. 전통과 질서를 중시하고 효율적으로 일을 처리합니다.',
      strengths: ['조직력', '결단력', '책임감', '실용성'],
      weaknesses: ['경직됨', '고집', '감정 소홀'],
      careers: ['경영자', '군인', '판사', '프로젝트 매니저'],
      loveStyle: '전통적이고 안정적인 관계를 선호합니다. 가족 중심적이며 책임감 있게 관계를 이끌어갑니다.',
      compatibility: ['ISFP', 'ISTP', 'INTP'],
      celebrities: ['김수현', '송중기', '정해인'],
      whenStressed: '더 열심히 일하며 통제력을 회복하려 하고, 규칙과 절차를 강화합니다.'
    },
    'ESFJ': {
      title: '집정관',
      subtitle: '사교적인 후원자',
      description: '친절하고 협조적이며 책임감이 강합니다. 다른 사람의 필요를 잘 알아차리고 도와줍니다.',
      strengths: ['친절함', '협조적', '사교성', '세심함'],
      weaknesses: ['비판에 민감', '변화 어려움', '과도한 헌신'],
      careers: ['호텔리어', '영업', '이벤트 기획', '교사'],
      loveStyle: '따뜻하고 애정표현이 풍부합니다. 파트너를 돌보고 함께하는 시간을 소중히 여깁니다.',
      compatibility: ['ISFP', 'ISTP', 'INFP'],
      celebrities: ['트와이스 나연', '박형식', '김희철'],
      whenStressed: '친구들과 대화하며 공감받고, 다른 사람을 도우며 가치를 느낍니다.'
    },
    'ISTP': {
      title: '장인',
      subtitle: '대담한 실험가',
      description: '조용하지만 호기심이 많고 실용적입니다. 손으로 무언가를 만들고 문제를 해결하는 것을 즐깁니다.',
      strengths: ['실용적', '문제해결', '독립적', '침착함'],
      weaknesses: ['감정 표현 어려움', '계획성 부족', '무뚝뚝함'],
      careers: ['엔지니어', '정비사', '운동선수', '소방관'],
      loveStyle: '자유로운 관계를 선호하며 행동으로 사랑을 표현합니다. 독립적이지만 신뢰할 수 있는 파트너입니다.',
      compatibility: ['ESFJ', 'ESTJ', 'ENFJ'],
      celebrities: ['장동건', '정우성', '이민호'],
      whenStressed: '혼자 작업하거나 운동, 모험적인 활동으로 스트레스를 해소합니다.'
    },
    'ISFP': {
      title: '모험가',
      subtitle: '호기심 많은 예술가',
      description: '온화하고 친절하며 예술적 감각이 뛰어납니다. 현재를 즐기고 자유를 중시합니다.',
      strengths: ['예술적', '유연함', '친절함', '개방적'],
      weaknesses: ['계획성 부족', '스트레스 취약', '우유부단'],
      careers: ['디자이너', '예술가', '음악가', '요리사'],
      loveStyle: '감성적이고 로맨틱합니다. 현재의 순간을 즐기며 조용하지만 깊은 애정을 표현합니다.',
      compatibility: ['ESFJ', 'ESTJ', 'ENFJ'],
      celebrities: ['지수(블랙핑크)', '차은우', '로제'],
      whenStressed: '예술 활동이나 자연에서 시간을 보내며 감성적으로 회복합니다.'
    },
    'ESTP': {
      title: '사업가',
      subtitle: '모험을 즐기는 사업가',
      description: '활동적이고 현실적이며 융통성이 있습니다. 위험을 감수하고 즉각적인 결과를 추구합니다.',
      strengths: ['행동력', '현실적', '사교적', '위기대응'],
      weaknesses: ['장기계획 부족', '충동적', '규칙 무시'],
      careers: ['영업', '사업가', '운동선수', '경찰'],
      loveStyle: '열정적이고 즉흥적입니다. 재미있고 활동적인 데이트를 선호하며 스릴을 즐깁니다.',
      compatibility: ['ISFJ', 'ISTJ', 'INFJ'],
      celebrities: ['강동원', '마동석', '이광수'],
      whenStressed: '즉각적인 행동으로 문제를 해결하고, 스포츠나 활동적인 취미로 전환합니다.'
    },
    'ESFP': {
      title: '연예인',
      subtitle: '자유로운 영혼의 연예인',
      description: '사교적이고 즐거움을 추구하며 현재를 즐깁니다. 사람들과 함께 있는 것을 좋아합니다.',
      strengths: ['사교성', '낙관적', '융통성', '열정'],
      weaknesses: ['장기계획 부족', '집중력', '비판에 민감'],
      careers: ['연예인', '이벤트 기획자', '영업', '교육자'],
      loveStyle: '애정표현이 풍부하고 재미있는 파트너입니다. 즉흥적이고 사교적인 활동을 함께 즐깁니다.',
      compatibility: ['ISFJ', 'ISTJ', 'INFJ'],
      celebrities: ['싸이', '신동엽', '장나라'],
      whenStressed: '사람들과 어울리고 즐거운 활동에 참여하며 긍정적인 에너지를 얻습니다.'
    }
  };

  return descriptions[type] || descriptions['INFP'];
};
