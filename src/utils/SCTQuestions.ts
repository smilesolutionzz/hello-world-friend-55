// SCT(Sentence Completion Test) 기반 질문 시스템

export type SCTAgeGroup = 'infant' | 'teen' | 'adult' | 'parent' | 'senior';

export interface SCTQuestion {
  id: string;
  stem: string; // 미완성 문장
  category: 'self' | 'family' | 'social' | 'emotion' | 'future' | 'past';
  ageGroup: SCTAgeGroup[];
  analysisKeywords: {
    positive: string[];
    negative: string[];
    concern: string[];
  };
}

export interface SCTResponse {
  questionId: string;
  stem: string;
  completion: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'concern';
  score: number;
  keywords: string[];
  timestamp: Date;
}

// 연령별 SCT 질문
export const SCT_QUESTIONS: Record<SCTAgeGroup, SCTQuestion[]> = {
  // 유아용 (5-12세)
  infant: [
    {
      id: 'inf_1',
      stem: '나는...',
      category: 'self',
      ageGroup: ['infant'],
      analysisKeywords: {
        positive: ['좋아', '행복', '재미', '신나', '좋은'],
        negative: ['싫어', '슬퍼', '무서', '힘들', '아파'],
        concern: ['혼자', '외로', '무섭', '화나', '걱정']
      }
    },
    {
      id: 'inf_2',
      stem: '엄마는...',
      category: 'family',
      ageGroup: ['infant'],
      analysisKeywords: {
        positive: ['사랑', '좋아', '따뜻', '안아', '웃어'],
        negative: ['화내', '무서', '싫어', '안 봐', '바빠'],
        concern: ['때려', '소리', '무시', '미워', '안 계셔']
      }
    },
    {
      id: 'inf_3',
      stem: '친구들은...',
      category: 'social',
      ageGroup: ['infant'],
      analysisKeywords: {
        positive: ['같이', '놀아', '친해', '좋아', '재밌'],
        negative: ['안 놀아', '싫어해', '따돌', '놀려', '싫어'],
        concern: ['혼자', '없어', '괴롭', '때려', '욕해']
      }
    },
    {
      id: 'inf_4',
      stem: '학교에서 나는...',
      category: 'social',
      ageGroup: ['infant'],
      analysisKeywords: {
        positive: ['재밌', '좋아', '잘해', '친구', '놀아'],
        negative: ['싫어', '힘들', '어려워', '무서', '가기 싫'],
        concern: ['혼자', '못해', '괴롭', '무시', '틀려']
      }
    },
    {
      id: 'inf_5',
      stem: '아빠는...',
      category: 'family',
      ageGroup: ['infant'],
      analysisKeywords: {
        positive: ['좋아', '놀아', '재밌', '사랑', '웃어'],
        negative: ['바빠', '화내', '무서', '안 봐', '없어'],
        concern: ['때려', '소리', '싫어', '무시', '안 계셔']
      }
    },
    {
      id: 'inf_6',
      stem: '밤에 나는...',
      category: 'emotion',
      ageGroup: ['infant'],
      analysisKeywords: {
        positive: ['잘 자', '꿈꿔', '편해', '좋아'],
        negative: ['무서워', '못 자', '불안', '악몽'],
        concern: ['혼자', '울어', '겁나', '떨어']
      }
    },
    {
      id: 'inf_7',
      stem: '내가 제일 좋아하는 것은...',
      category: 'self',
      ageGroup: ['infant'],
      analysisKeywords: {
        positive: ['놀이', '친구', '가족', '게임', '만화'],
        negative: ['없어', '모르겠', '생각', '글쎄'],
        concern: ['혼자', '아무것도', '없는', '싫어']
      }
    },
    {
      id: 'inf_8',
      stem: '나를 화나게 하는 것은...',
      category: 'emotion',
      ageGroup: ['infant'],
      analysisKeywords: {
        positive: ['없어', '괜찮', '별로'],
        negative: ['형제', '친구', '선생님', '엄마', '아빠'],
        concern: ['때리', '욕', '무시', '싫어', '괴롭']
      }
    }
  ],

  // 청소년용 (13-18세)
  teen: [
    {
      id: 'teen_1',
      stem: '나는...',
      category: 'self',
      ageGroup: ['teen'],
      analysisKeywords: {
        positive: ['행복', '좋은', '잘하', '자신', '괜찮'],
        negative: ['못난', '싫은', '나쁜', '부족', '실패'],
        concern: ['혼자', '외로', '쓸모없', '죽고', '사라지']
      }
    },
    {
      id: 'teen_2',
      stem: '부모님은...',
      category: 'family',
      ageGroup: ['teen'],
      analysisKeywords: {
        positive: ['이해', '사랑', '지지', '응원', '믿어'],
        negative: ['모르', '바빠', '무관심', '화내', '압박'],
        concern: ['싸워', '이혼', '없', '미워', '포기']
      }
    },
    {
      id: 'teen_3',
      stem: '학교는...',
      category: 'social',
      ageGroup: ['teen'],
      analysisKeywords: {
        positive: ['좋은', '배우', '친구', '재밌', '의미'],
        negative: ['힘든', '싫은', '스트레스', '지옥', '감옥'],
        concern: ['괴롭', '따돌', '가기 싫', '죽고', '도망']
      }
    },
    {
      id: 'teen_4',
      stem: '친구들은...',
      category: 'social',
      ageGroup: ['teen'],
      analysisKeywords: {
        positive: ['좋은', '함께', '이해', '소중', '믿을'],
        negative: ['없', '멀어', '배신', '싫어', '피곤'],
        concern: ['혼자', '따돌', '괴롭', '무시', '없어']
      }
    },
    {
      id: 'teen_5',
      stem: '미래에 나는...',
      category: 'future',
      ageGroup: ['teen'],
      analysisKeywords: {
        positive: ['되고 싶', '이루', '성공', '행복', '꿈'],
        negative: ['모르겠', '불안', '걱정', '안 될', '포기'],
        concern: ['없', '죽', '실패', '절망', '의미 없']
      }
    },
    {
      id: 'teen_6',
      stem: '내가 가장 걱정하는 것은...',
      category: 'emotion',
      ageGroup: ['teen'],
      analysisKeywords: {
        positive: ['없', '괜찮', '극복'],
        negative: ['성적', '외모', '미래', '관계', '부모'],
        concern: ['혼자', '실패', '버림', '죽음', '무가치']
      }
    },
    {
      id: 'teen_7',
      stem: '나를 이해하는 사람은...',
      category: 'social',
      ageGroup: ['teen'],
      analysisKeywords: {
        positive: ['부모', '친구', '선생님', '있', '많'],
        negative: ['없', '모르', '아무도', '찾기 힘'],
        concern: ['아무도 없', '혼자', '외로', '버림받']
      }
    },
    {
      id: 'teen_8',
      stem: '나의 장점은...',
      category: 'self',
      ageGroup: ['teen'],
      analysisKeywords: {
        positive: ['많', '있', '좋은', '잘하', '능력'],
        negative: ['없', '모르겠', '잘 모', '별로'],
        concern: ['없어', '하나도', '못하', '실패', '쓸모없']
      }
    }
  ],

  // 성인용
  adult: [
    {
      id: 'adult_1',
      stem: '나는...',
      category: 'self',
      ageGroup: ['adult'],
      analysisKeywords: {
        positive: ['만족', '행복', '성장', '건강', '균형'],
        negative: ['지친', '불안', '스트레스', '우울', '공허'],
        concern: ['무가치', '소진', '포기', '절망', '의미 없']
      }
    },
    {
      id: 'adult_2',
      stem: '일/직장은...',
      category: 'social',
      ageGroup: ['adult'],
      analysisKeywords: {
        positive: ['의미', '성장', '만족', '보람', '기회'],
        negative: ['힘든', '스트레스', '지루', '부담', '피곤'],
        concern: ['지옥', '버티', '그만두고 싶', '견딜 수 없', '소진']
      }
    },
    {
      id: 'adult_3',
      stem: '가족은...',
      category: 'family',
      ageGroup: ['adult'],
      analysisKeywords: {
        positive: ['소중', '행복', '사랑', '지지', '안식'],
        negative: ['부담', '스트레스', '갈등', '힘든', '피곤'],
        concern: ['갈라서', '무너져', '포기', '견딜 수 없', '지쳐']
      }
    },
    {
      id: 'adult_4',
      stem: '인간관계는...',
      category: 'social',
      ageGroup: ['adult'],
      analysisKeywords: {
        positive: ['풍요', '만족', '균형', '좋은', '의미'],
        negative: ['피곤', '부담', '어려운', '힘든', '복잡'],
        concern: ['단절', '외로', '신뢰 없', '피하고 싶', '포기']
      }
    },
    {
      id: 'adult_5',
      stem: '미래는...',
      category: 'future',
      ageGroup: ['adult'],
      analysisKeywords: {
        positive: ['희망', '기대', '계획', '긍정', '가능성'],
        negative: ['불안', '걱정', '막연', '불확실', '두려'],
        concern: ['절망', '포기', '의미 없', '어두', '끝']
      }
    },
    {
      id: 'adult_6',
      stem: '스트레스를 받을 때 나는...',
      category: 'emotion',
      ageGroup: ['adult'],
      analysisKeywords: {
        positive: ['운동', '취미', '휴식', '대화', '해결'],
        negative: ['술', '담배', '회피', '혼자', '못 견디'],
        concern: ['자해', '폭발', '무너져', '죽고 싶', '견딜 수 없']
      }
    },
    {
      id: 'adult_7',
      stem: '나의 가장 큰 고민은...',
      category: 'emotion',
      ageGroup: ['adult'],
      analysisKeywords: {
        positive: ['해결 가능', '노력 중', '계획'],
        negative: ['돈', '건강', '관계', '미래', '일'],
        concern: ['절망', '포기', '해결 불가', '의미 없', '끝']
      }
    },
    {
      id: 'adult_8',
      stem: '행복하기 위해서는...',
      category: 'future',
      ageGroup: ['adult'],
      analysisKeywords: {
        positive: ['노력', '가능', '작은 것', '지금', '관계'],
        negative: ['돈', '성공', '조건', '어려', '불가능'],
        concern: ['불가능', '모르겠', '포기', '없', '의미 없']
      }
    }
  ],

  // 부모용
  parent: [
    {
      id: 'parent_1',
      stem: '아이는...',
      category: 'family',
      ageGroup: ['parent'],
      analysisKeywords: {
        positive: ['소중', '사랑', '행복', '자랑', '기쁨'],
        negative: ['힘든', '걱정', '부담', '어려운', '스트레스'],
        concern: ['감당 안 돼', '포기', '후회', '버거', '지쳐']
      }
    },
    {
      id: 'parent_2',
      stem: '육아는...',
      category: 'self',
      ageGroup: ['parent'],
      analysisKeywords: {
        positive: ['보람', '행복', '의미', '성장', '기쁨'],
        negative: ['힘든', '지친', '스트레스', '어려운', '외로'],
        concern: ['지옥', '포기', '감당 안 돼', '무너져', '버겁']
      }
    },
    {
      id: 'parent_3',
      stem: '배우자는...',
      category: 'family',
      ageGroup: ['parent'],
      analysisKeywords: {
        positive: ['도와주', '이해', '지지', '함께', '고마'],
        negative: ['도움 안 돼', '무관심', '갈등', '부족', '바빠'],
        concern: ['싸워', '미워', '이혼', '포기', '한계']
      }
    },
    {
      id: 'parent_4',
      stem: '나만의 시간은...',
      category: 'self',
      ageGroup: ['parent'],
      analysisKeywords: {
        positive: ['있', '필요', '즐겨', '소중', '충분'],
        negative: ['없', '부족', '바빠', '힘든', '포기'],
        concern: ['전혀 없', '불가능', '잊어버려', '죽은 것 같']
      }
    },
    {
      id: 'parent_5',
      stem: '아이 때문에 나는...',
      category: 'emotion',
      ageGroup: ['parent'],
      analysisKeywords: {
        positive: ['행복', '성장', '배워', '기쁨', '보람'],
        negative: ['포기', '희생', '스트레스', '지쳐', '걱정'],
        concern: ['후회', '무너져', '한계', '견딜 수 없', '버겁']
      }
    },
    {
      id: 'parent_6',
      stem: '내가 가장 걱정하는 것은...',
      category: 'emotion',
      ageGroup: ['parent'],
      analysisKeywords: {
        positive: ['극복', '해결', '괜찮'],
        negative: ['아이 발달', '경제', '건강', '미래', '관계'],
        concern: ['감당 안 돼', '포기', '절망', '불가능', '한계']
      }
    },
    {
      id: 'parent_7',
      stem: '부모로서 나는...',
      category: 'self',
      ageGroup: ['parent'],
      analysisKeywords: {
        positive: ['노력', '최선', '사랑', '성장', '괜찮'],
        negative: ['부족', '미안', '걱정', '힘든', '자신 없'],
        concern: ['실패', '포기', '자격 없', '후회', '무가치']
      }
    },
    {
      id: 'parent_8',
      stem: '도움이 필요할 때 나는...',
      category: 'social',
      ageGroup: ['parent'],
      analysisKeywords: {
        positive: ['요청', '받아', '있', '가족', '친구'],
        negative: ['혼자', '어려워', '없', '못 받', '부담'],
        concern: ['아무도 없', '포기', '버려진', '외로', '절망']
      }
    }
  ],

  // 노인용
  senior: [
    {
      id: 'senior_1',
      stem: '나는...',
      category: 'self',
      ageGroup: ['senior'],
      analysisKeywords: {
        positive: ['행복', '만족', '감사', '평온', '건강'],
        negative: ['외로', '쓸모없', '아픈', '슬픈', '지친'],
        concern: ['죽고 싶', '의미 없', '버림받', '고통', '절망']
      }
    },
    {
      id: 'senior_2',
      stem: '가족은...',
      category: 'family',
      ageGroup: ['senior'],
      analysisKeywords: {
        positive: ['소중', '자랑', '행복', '사랑', '함께'],
        negative: ['바빠', '멀어', '무관심', '부담', '안 봐'],
        concern: ['버림', '외로', '없', '싫어', '포기']
      }
    },
    {
      id: 'senior_3',
      stem: '나이 드는 것은...',
      category: 'self',
      ageGroup: ['senior'],
      analysisKeywords: {
        positive: ['자연스러', '지혜', '성숙', '받아들', '괜찮'],
        negative: ['힘든', '슬픈', '두려', '외로', '아픈'],
        concern: ['끝', '죽음', '무서', '절망', '의미 없']
      }
    },
    {
      id: 'senior_4',
      stem: '건강은...',
      category: 'self',
      ageGroup: ['senior'],
      analysisKeywords: {
        positive: ['괜찮', '관리', '노력', '감사', '좋'],
        negative: ['나빠', '걱정', '아픈', '힘든', '약해'],
        concern: ['포기', '버거', '고통', '감당 안 돼', '죽고 싶']
      }
    },
    {
      id: 'senior_5',
      stem: '혼자 있을 때 나는...',
      category: 'emotion',
      ageGroup: ['senior'],
      analysisKeywords: {
        positive: ['평온', '괜찮', '편안', '좋', '생각'],
        negative: ['외로', '슬픈', '무료', '심심', '힘든'],
        concern: ['죽고 싶', '절망', '견딜 수 없', '버림받', '의미 없']
      }
    },
    {
      id: 'senior_6',
      stem: '과거를 돌아보면...',
      category: 'past',
      ageGroup: ['senior'],
      analysisKeywords: {
        positive: ['감사', '행복했', '의미', '좋았', '보람'],
        negative: ['후회', '아쉬', '힘들었', '슬펐', '잘못'],
        concern: ['의미 없었', '실패', '망쳤', '포기', '절망']
      }
    },
    {
      id: 'senior_7',
      stem: '자녀들은...',
      category: 'family',
      ageGroup: ['senior'],
      analysisKeywords: {
        positive: ['자랑', '소중', '잘 살', '행복', '사랑'],
        negative: ['바빠', '멀어', '걱정', '연락 없', '안 봐'],
        concern: ['버림', '싫어', '미워', '포기', '관심 없']
      }
    },
    {
      id: 'senior_8',
      stem: '남은 인생은...',
      category: 'future',
      ageGroup: ['senior'],
      analysisKeywords: {
        positive: ['의미', '감사', '행복', '평온', '기대'],
        negative: ['짧', '불안', '걱정', '두려', '외로'],
        concern: ['없', '끝', '절망', '의미 없', '죽고 싶']
      }
    }
  ]
};

// SCT 답변 분석
export const analyzeSCTResponse = (
  question: SCTQuestion,
  completion: string
): {
  sentiment: 'positive' | 'negative' | 'neutral' | 'concern';
  score: number;
  keywords: string[];
  concernLevel: number;
} => {
  const lowerCompletion = completion.toLowerCase();
  const foundKeywords: string[] = [];
  let positiveCount = 0;
  let negativeCount = 0;
  let concernCount = 0;

  // 긍정 키워드 체크
  question.analysisKeywords.positive.forEach(keyword => {
    if (lowerCompletion.includes(keyword)) {
      positiveCount++;
      foundKeywords.push(keyword);
    }
  });

  // 부정 키워드 체크
  question.analysisKeywords.negative.forEach(keyword => {
    if (lowerCompletion.includes(keyword)) {
      negativeCount++;
      foundKeywords.push(keyword);
    }
  });

  // 우려 키워드 체크
  question.analysisKeywords.concern.forEach(keyword => {
    if (lowerCompletion.includes(keyword)) {
      concernCount += 2; // 우려 키워드는 가중치 2
      foundKeywords.push(keyword);
    }
  });

  // 짧은 답변 패널티
  const lengthPenalty = completion.length < 5 ? 1 : 0;

  // 감정 판단
  let sentiment: 'positive' | 'negative' | 'neutral' | 'concern';
  if (concernCount > 0) {
    sentiment = 'concern';
  } else if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }

  // 점수 계산 (0-10)
  const baseScore = 5;
  const score = Math.max(0, Math.min(10, 
    baseScore - positiveCount + negativeCount + concernCount + lengthPenalty
  ));

  // 우려 레벨 (0-100)
  const concernLevel = Math.min(100, 
    (concernCount * 30) + (negativeCount * 10) + (lengthPenalty * 5)
  );

  return {
    sentiment,
    score,
    keywords: foundKeywords,
    concernLevel
  };
};

// 전체 SCT 결과 분석
export const analyzeSCTResults = (responses: SCTResponse[]) => {
  const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
  const averageScore = totalScore / responses.length;

  const sentimentDistribution = {
    positive: responses.filter(r => r.sentiment === 'positive').length,
    negative: responses.filter(r => r.sentiment === 'negative').length,
    neutral: responses.filter(r => r.sentiment === 'neutral').length,
    concern: responses.filter(r => r.sentiment === 'concern').length
  };

  const categoryScores = responses.reduce((acc, r) => {
    if (!acc[r.category]) {
      acc[r.category] = { total: 0, count: 0 };
    }
    acc[r.category].total += r.score;
    acc[r.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const categoryAverages = Object.entries(categoryScores).map(([category, data]) => ({
    category,
    average: data.total / data.count
  })).sort((a, b) => b.average - a.average);

  // 전체 키워드 빈도
  const allKeywords = responses.flatMap(r => r.keywords);
  const keywordFrequency = allKeywords.reduce((acc, k) => {
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  // 심각도 판단
  let severity: 'low' | 'medium' | 'high' | 'critical';
  if (averageScore >= 8 || sentimentDistribution.concern >= 3) {
    severity = 'critical';
  } else if (averageScore >= 6 || sentimentDistribution.concern >= 2) {
    severity = 'high';
  } else if (averageScore >= 4) {
    severity = 'medium';
  } else {
    severity = 'low';
  }

  return {
    totalScore,
    averageScore,
    sentimentDistribution,
    categoryAverages,
    topKeywords,
    severity,
    totalResponses: responses.length,
    concernResponses: responses.filter(r => r.sentiment === 'concern')
  };
};
