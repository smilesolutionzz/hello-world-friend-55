// SCT (Sentence Completion Test) - 대상관계이론 & 애착이론 기반 심층 분석

export type SCTAgeGroup = 'infant' | 'teen' | 'adult' | 'parent' | 'senior';

export interface SCTQuestion {
  id: string;
  stem: string;
  category: 'self' | 'mother' | 'father' | 'family' | 'peer' | 'authority' | 'fear' | 'desire' | 'past' | 'future';
  objectRelationsAspect: 'self_representation' | 'object_representation' | 'defense_mechanism' | 'separation_individuation' | 'internal_conflict';
  attachmentAspect: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | 'emotional_regulation';
  psychologicalNeed: 'autonomy' | 'competence' | 'relatedness' | 'safety' | 'recognition';
}

export interface SCTAnalysisResult {
  ageGroup: SCTAgeGroup;
  responses: Array<{ questionId: string; response: string; stem: string }>;
  
  // 대상관계이론 분석
  objectRelations: {
    selfRepresentation: {
      score: number;
      description: string;
      patterns: string[];
    };
    objectRepresentation: {
      score: number;
      description: string;
      parentalFigures: {
        mother: string;
        father: string;
      };
    };
    defenseMechanisms: Array<{
      type: string;
      strength: number;
      description: string;
    }>;
    separationIndividuation: {
      stage: string;
      score: number;
      challenges: string[];
    };
  };
  
  // 애착이론 분석
  attachment: {
    primaryStyle: 'secure' | 'anxious-preoccupied' | 'dismissive-avoidant' | 'fearful-avoidant';
    styleScores: {
      secure: number;
      anxious: number;
      avoidant: number;
      disorganized: number;
    };
    internalWorkingModel: {
      selfView: string;
      othersView: string;
      relationshipExpectations: string;
    };
    emotionalRegulation: {
      score: number;
      strengths: string[];
      challenges: string[];
    };
  };
  
  // 결핍 및 욕구 분석
  needsAnalysis: {
    unmetNeeds: Array<{
      need: string;
      severity: number;
      manifestations: string[];
    }>;
    compensatoryBehaviors: string[];
    coreBeliefs: string[];
  };
  
  // 극복 방법
  therapeuticRecommendations: {
    primaryFocus: string;
    interventions: Array<{
      area: string;
      strategy: string;
      practices: string[];
    }>;
    strengths: string[];
    growthPotential: string;
  };
  
  overallScore: number;
  timestamp: Date;
}

// 연령별 SCT 질문
export const SCT_QUESTIONS: Record<SCTAgeGroup, SCTQuestion[]> = {
  infant: [
    // 유아용 (4-7세) - 그림 기반 간단한 문장
    { id: 'i1', stem: '엄마는...', category: 'mother', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'safety' },
    { id: 'i2', stem: '아빠는...', category: 'father', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'safety' },
    { id: 'i3', stem: '나는...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 'i4', stem: '집에서 나는...', category: 'family', objectRelationsAspect: 'self_representation', attachmentAspect: 'emotional_regulation', psychologicalNeed: 'relatedness' },
    { id: 'i5', stem: '친구들과...', category: 'peer', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'relatedness' },
    { id: 'i6', stem: '무서운 것은...', category: 'fear', objectRelationsAspect: 'defense_mechanism', attachmentAspect: 'anxious', psychologicalNeed: 'safety' },
    { id: 'i7', stem: '내가 좋아하는 것은...', category: 'desire', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'autonomy' },
    { id: 'i8', stem: '혼자 있을 때...', category: 'self', objectRelationsAspect: 'separation_individuation', attachmentAspect: 'anxious', psychologicalNeed: 'autonomy' },
    { id: 'i9', stem: '선생님은...', category: 'authority', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 'i10', stem: '밤에 나는...', category: 'fear', objectRelationsAspect: 'defense_mechanism', attachmentAspect: 'anxious', psychologicalNeed: 'safety' },
    { id: 'i11', stem: '형제자매는...', category: 'family', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'relatedness' },
    { id: 'i12', stem: '커서 나는...', category: 'future', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'competence' },
  ],
  
  teen: [
    // 청소년용 (13-18세)
    { id: 't1', stem: '엄마에 대해 나는...', category: 'mother', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'autonomy' },
    { id: 't2', stem: '아버지와의 관계는...', category: 'father', objectRelationsAspect: 'object_representation', attachmentAspect: 'avoidant', psychologicalNeed: 'recognition' },
    { id: 't3', stem: '나 자신을 보면...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 't4', stem: '친구들은 나를...', category: 'peer', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'relatedness' },
    { id: 't5', stem: '혼자 있을 때 나는...', category: 'self', objectRelationsAspect: 'separation_individuation', attachmentAspect: 'avoidant', psychologicalNeed: 'autonomy' },
    { id: 't6', stem: '내가 가장 두려운 것은...', category: 'fear', objectRelationsAspect: 'internal_conflict', attachmentAspect: 'disorganized', psychologicalNeed: 'safety' },
    { id: 't7', stem: '내 미래는...', category: 'future', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'competence' },
    { id: 't8', stem: '어른들은...', category: 'authority', objectRelationsAspect: 'object_representation', attachmentAspect: 'avoidant', psychologicalNeed: 'autonomy' },
    { id: 't9', stem: '내 가족은...', category: 'family', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'relatedness' },
    { id: 't10', stem: '나는 사랑받을 자격이...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'anxious', psychologicalNeed: 'recognition' },
    { id: 't11', stem: '화가 날 때 나는...', category: 'self', objectRelationsAspect: 'defense_mechanism', attachmentAspect: 'emotional_regulation', psychologicalNeed: 'safety' },
    { id: 't12', stem: '어렸을 때 나는...', category: 'past', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 't13', stem: '실패는 나에게...', category: 'self', objectRelationsAspect: 'internal_conflict', attachmentAspect: 'anxious', psychologicalNeed: 'competence' },
    { id: 't14', stem: '다른 사람들이 나를 떠나면...', category: 'fear', objectRelationsAspect: 'separation_individuation', attachmentAspect: 'anxious', psychologicalNeed: 'relatedness' },
    { id: 't15', stem: '내가 진정으로 원하는 것은...', category: 'desire', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'autonomy' },
  ],
  
  adult: [
    // 성인용 (19-64세)
    { id: 'a1', stem: '나의 어머니는...', category: 'mother', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 'a2', stem: '나의 아버지는...', category: 'father', objectRelationsAspect: 'object_representation', attachmentAspect: 'avoidant', psychologicalNeed: 'recognition' },
    { id: 'a3', stem: '나 자신에 대해...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 'a4', stem: '친밀한 관계에서 나는...', category: 'peer', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'relatedness' },
    { id: 'a5', stem: '혼자 있을 때 나는...', category: 'self', objectRelationsAspect: 'separation_individuation', attachmentAspect: 'avoidant', psychologicalNeed: 'autonomy' },
    { id: 'a6', stem: '내가 가장 두려워하는 것은...', category: 'fear', objectRelationsAspect: 'internal_conflict', attachmentAspect: 'disorganized', psychologicalNeed: 'safety' },
    { id: 'a7', stem: '나의 결혼/연애는...', category: 'peer', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'relatedness' },
    { id: 'a8', stem: '직장에서 나는...', category: 'authority', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'competence' },
    { id: 'a9', stem: '다른 사람들이 나를...', category: 'peer', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'recognition' },
    { id: 'a10', stem: '나는 사랑할 때...', category: 'self', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'relatedness' },
    { id: 'a11', stem: '거절당할 때 나는...', category: 'fear', objectRelationsAspect: 'defense_mechanism', attachmentAspect: 'anxious', psychologicalNeed: 'recognition' },
    { id: 'a12', stem: '어린 시절 나는...', category: 'past', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'safety' },
    { id: 'a13', stem: '내 인생의 목표는...', category: 'future', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'competence' },
    { id: 'a14', stem: '갈등이 생기면 나는...', category: 'self', objectRelationsAspect: 'defense_mechanism', attachmentAspect: 'emotional_regulation', psychologicalNeed: 'relatedness' },
    { id: 'a15', stem: '버림받는다는 것은...', category: 'fear', objectRelationsAspect: 'separation_individuation', attachmentAspect: 'disorganized', psychologicalNeed: 'safety' },
    { id: 'a16', stem: '나의 약점은...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'anxious', psychologicalNeed: 'competence' },
    { id: 'a17', stem: '나의 강점은...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'competence' },
    { id: 'a18', stem: '권위자에 대해...', category: 'authority', objectRelationsAspect: 'object_representation', attachmentAspect: 'avoidant', psychologicalNeed: 'autonomy' },
    { id: 'a19', stem: '진정한 나는...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 'a20', stem: '내가 가장 원하는 것은...', category: 'desire', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'autonomy' },
  ],
  
  parent: [
    // 부모용
    { id: 'p1', stem: '내 자녀는...', category: 'family', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'relatedness' },
    { id: 'p2', stem: '부모로서 나는...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'anxious', psychologicalNeed: 'competence' },
    { id: 'p3', stem: '내 어머니는 나를...', category: 'mother', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 'p4', stem: '내 아버지는 나를...', category: 'father', objectRelationsAspect: 'object_representation', attachmentAspect: 'avoidant', psychologicalNeed: 'recognition' },
    { id: 'p5', stem: '자녀 양육에서 가장 어려운 것은...', category: 'family', objectRelationsAspect: 'internal_conflict', attachmentAspect: 'anxious', psychologicalNeed: 'competence' },
    { id: 'p6', stem: '자녀가 나를 떠날 때...', category: 'fear', objectRelationsAspect: 'separation_individuation', attachmentAspect: 'anxious', psychologicalNeed: 'relatedness' },
    { id: 'p7', stem: '내 배우자와 육아에서...', category: 'peer', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'relatedness' },
    { id: 'p8', stem: '자녀가 울 때 나는...', category: 'self', objectRelationsAspect: 'defense_mechanism', attachmentAspect: 'emotional_regulation', psychologicalNeed: 'competence' },
    { id: 'p9', stem: '내가 어렸을 때 부모님은...', category: 'past', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'safety' },
    { id: 'p10', stem: '자녀의 미래가...', category: 'future', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'safety' },
    { id: 'p11', stem: '좋은 부모는...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'anxious', psychologicalNeed: 'competence' },
    { id: 'p12', stem: '자녀가 실수하면 나는...', category: 'family', objectRelationsAspect: 'defense_mechanism', attachmentAspect: 'emotional_regulation', psychologicalNeed: 'competence' },
    { id: 'p13', stem: '내가 부모로서 가장 두려운 것은...', category: 'fear', objectRelationsAspect: 'internal_conflict', attachmentAspect: 'disorganized', psychologicalNeed: 'safety' },
    { id: 'p14', stem: '자녀와의 관계에서 나는...', category: 'family', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'relatedness' },
    { id: 'p15', stem: '내가 자녀에게 물려주고 싶은 것은...', category: 'desire', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
  ],
  
  senior: [
    // 노인용 (65세 이상)
    { id: 's1', stem: '나의 인생을 돌아보면...', category: 'past', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 's2', stem: '자녀들은...', category: 'family', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'relatedness' },
    { id: 's3', stem: '나이가 든다는 것은...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 's4', stem: '혼자 있을 때 나는...', category: 'self', objectRelationsAspect: 'separation_individuation', attachmentAspect: 'avoidant', psychologicalNeed: 'autonomy' },
    { id: 's5', stem: '죽음에 대해...', category: 'fear', objectRelationsAspect: 'internal_conflict', attachmentAspect: 'disorganized', psychologicalNeed: 'safety' },
    { id: 's6', stem: '배우자는(였던)...', category: 'peer', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'relatedness' },
    { id: 's7', stem: '손자녀들은...', category: 'family', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'relatedness' },
    { id: 's8', stem: '젊었을 때 나는...', category: 'past', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 's9', stem: '남은 인생에서 나는...', category: 'future', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'autonomy' },
    { id: 's10', stem: '내가 후회하는 것은...', category: 'past', objectRelationsAspect: 'internal_conflict', attachmentAspect: 'anxious', psychologicalNeed: 'recognition' },
    { id: 's11', stem: '가족들이 나를...', category: 'family', objectRelationsAspect: 'object_representation', attachmentAspect: 'anxious', psychologicalNeed: 'recognition' },
    { id: 's12', stem: '건강이 나빠지면...', category: 'fear', objectRelationsAspect: 'defense_mechanism', attachmentAspect: 'anxious', psychologicalNeed: 'safety' },
    { id: 's13', stem: '내가 자랑스러운 것은...', category: 'self', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 's14', stem: '어머니에 대한 기억은...', category: 'mother', objectRelationsAspect: 'object_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
    { id: 's15', stem: '내가 남기고 싶은 것은...', category: 'desire', objectRelationsAspect: 'self_representation', attachmentAspect: 'secure', psychologicalNeed: 'recognition' },
  ],
};

// 심층 분석 함수
export function analyzeSCTResponses(
  ageGroup: SCTAgeGroup,
  responses: Array<{ questionId: string; response: string }>
): SCTAnalysisResult {
  const questions = SCT_QUESTIONS[ageGroup];
  const responsesWithStems = responses.map(r => {
    const q = questions.find(q => q.id === r.questionId);
    return { ...r, stem: q?.stem || '' };
  });
  
  // 1. 대상관계이론 분석
  const objectRelations = analyzeObjectRelations(responses, questions);
  
  // 2. 애착이론 분석
  const attachment = analyzeAttachment(responses, questions);
  
  // 3. 결핍 및 욕구 분석
  const needsAnalysis = analyzeNeeds(responses, questions, objectRelations, attachment);
  
  // 4. 치료적 권고사항
  const therapeuticRecommendations = generateRecommendations(
    objectRelations,
    attachment,
    needsAnalysis,
    ageGroup
  );
  
  // 5. 전체 점수 계산
  const overallScore = calculateOverallScore(objectRelations, attachment, needsAnalysis);
  
  return {
    ageGroup,
    responses: responsesWithStems,
    objectRelations,
    attachment,
    needsAnalysis,
    therapeuticRecommendations,
    overallScore,
    timestamp: new Date(),
  };
}

function analyzeObjectRelations(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[]
) {
  // 자기 표상 분석
  const selfRepQuestions = questions.filter(q => q.objectRelationsAspect === 'self_representation');
  const selfRepResponses = responses.filter(r => 
    selfRepQuestions.some(q => q.id === r.questionId)
  );
  
  const selfRepScore = calculateSelfRepresentationScore(selfRepResponses);
  const selfPatterns = identifySelfPatterns(selfRepResponses);
  
  // 대상 표상 분석
  const objRepQuestions = questions.filter(q => q.objectRelationsAspect === 'object_representation');
  const objRepResponses = responses.filter(r => 
    objRepQuestions.some(q => q.id === r.questionId)
  );
  
  const objRepScore = calculateObjectRepresentationScore(objRepResponses);
  const parentalFigures = analyzeParentalFigures(responses, questions);
  
  // 방어기제 분석
  const defenseMechanisms = identifyDefenseMechanisms(responses, questions);
  
  // 분리-개별화 분석
  const separationIndividuation = analyzeSeparationIndividuation(responses, questions);
  
  return {
    selfRepresentation: {
      score: selfRepScore,
      description: getSelfRepresentationDescription(selfRepScore, selfPatterns),
      patterns: selfPatterns,
    },
    objectRepresentation: {
      score: objRepScore,
      description: getObjectRepresentationDescription(objRepScore),
      parentalFigures,
    },
    defenseMechanisms,
    separationIndividuation,
  };
}

function analyzeAttachment(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[]
) {
  // 애착 유형별 점수 계산
  const styleScores = {
    secure: calculateAttachmentScore(responses, questions, 'secure'),
    anxious: calculateAttachmentScore(responses, questions, 'anxious'),
    avoidant: calculateAttachmentScore(responses, questions, 'avoidant'),
    disorganized: calculateAttachmentScore(responses, questions, 'disorganized'),
  };
  
  // 주요 애착 유형 결정
  const primaryStyle = determinePrimaryAttachmentStyle(styleScores);
  
  // 내적 작동 모델 분석
  const internalWorkingModel = analyzeInternalWorkingModel(responses, questions, primaryStyle);
  
  // 정서 조절 분석
  const emotionalRegulation = analyzeEmotionalRegulation(responses, questions);
  
  return {
    primaryStyle,
    styleScores,
    internalWorkingModel,
    emotionalRegulation,
  };
}

function analyzeNeeds(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[],
  objectRelations: any,
  attachment: any
) {
  // 미충족 욕구 식별
  const unmetNeeds = identifyUnmetNeeds(responses, questions);
  
  // 보상적 행동 패턴
  const compensatoryBehaviors = identifyCompensatoryBehaviors(
    responses,
    objectRelations,
    attachment
  );
  
  // 핵심 신념
  const coreBeliefs = identifyCoreBeliefs(responses, objectRelations, attachment);
  
  return {
    unmetNeeds,
    compensatoryBehaviors,
    coreBeliefs,
  };
}

function generateRecommendations(
  objectRelations: any,
  attachment: any,
  needsAnalysis: any,
  ageGroup: SCTAgeGroup
) {
  const interventions: Array<{ area: string; strategy: string; practices: string[] }> = [];
  
  // 애착 유형별 개입
  if (attachment.primaryStyle === 'anxious-preoccupied') {
    interventions.push({
      area: '불안정 애착 개선',
      strategy: '자기 안정화 및 정서 조절 훈련',
      practices: [
        '마음챙김 명상으로 불안 감소',
        '내면 아이 치유 작업',
        '안전한 관계 경험 쌓기',
      ],
    });
  }
  
  if (attachment.primaryStyle === 'dismissive-avoidant' || attachment.primaryStyle === 'fearful-avoidant') {
    interventions.push({
      area: '회피 애착 개선',
      strategy: '정서적 친밀감 형성 연습',
      practices: [
        '정서 인식 및 표현 훈련',
        '취약성 수용하기',
        '신뢰 관계 구축 연습',
      ],
    });
  }
  
  // 대상관계 개입
  if (objectRelations.selfRepresentation.score < 60) {
    interventions.push({
      area: '자기 표상 강화',
      strategy: '긍정적 자기 이미지 구축',
      practices: [
        '자기 존중감 향상 활동',
        '강점 찾기 및 인정하기',
        '자기 돌봄 실천',
      ],
    });
  }
  
  // 미충족 욕구별 개입
  needsAnalysis.unmetNeeds.forEach((need: any) => {
    if (need.severity > 7) {
      interventions.push({
        area: `${need.need} 욕구 충족`,
        strategy: getStrategyForNeed(need.need),
        practices: getPracticesForNeed(need.need),
      });
    }
  });
  
  // 강점 식별
  const strengths = identifyStrengths(objectRelations, attachment);
  
  // 주요 초점 결정
  const primaryFocus = determinePrimaryFocus(objectRelations, attachment, needsAnalysis);
  
  // 성장 잠재력
  const growthPotential = assessGrowthPotential(objectRelations, attachment, ageGroup);
  
  return {
    primaryFocus,
    interventions,
    strengths,
    growthPotential,
  };
}

// Helper functions
function calculateSelfRepresentationScore(responses: Array<{ response: string }>): number {
  let score = 50;
  responses.forEach(r => {
    const text = r.response.toLowerCase();
    if (text.includes('좋') || text.includes('행복') || text.includes('자랑')) score += 10;
    if (text.includes('나쁜') || text.includes('싫') || text.includes('부족')) score -= 10;
    if (text.includes('괜찮') || text.includes('보통')) score += 5;
  });
  return Math.max(0, Math.min(100, score));
}

function identifySelfPatterns(responses: Array<{ response: string }>): string[] {
  const patterns: string[] = [];
  const allText = responses.map(r => r.response.toLowerCase()).join(' ');
  
  if (allText.includes('항상') || allText.includes('늘')) patterns.push('절대적 사고');
  if (allText.includes('해야') || allText.includes('해야만')) patterns.push('당위적 사고');
  if (allText.includes('못') || allText.includes('할 수 없')) patterns.push('무력감');
  if (allText.includes('혼자') && allText.includes('외로')) patterns.push('고립감');
  
  return patterns.length > 0 ? patterns : ['특이 패턴 없음'];
}

function calculateObjectRepresentationScore(responses: Array<{ response: string }>): number {
  let score = 50;
  responses.forEach(r => {
    const text = r.response.toLowerCase();
    if (text.includes('사랑') || text.includes('좋아') || text.includes('믿')) score += 10;
    if (text.includes('미워') || text.includes('싫어') || text.includes('무섭')) score -= 10;
    if (text.includes('복잡') || text.includes('어렵')) score -= 5;
  });
  return Math.max(0, Math.min(100, score));
}

function analyzeParentalFigures(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[]
): { mother: string; father: string } {
  const motherQ = questions.filter(q => q.category === 'mother');
  const fatherQ = questions.filter(q => q.category === 'father');
  
  const motherResp = responses.filter(r => motherQ.some(q => q.id === r.questionId));
  const fatherResp = responses.filter(r => fatherQ.some(q => q.id === r.questionId));
  
  return {
    mother: analyzeParentalFigure(motherResp),
    father: analyzeParentalFigure(fatherResp),
  };
}

function analyzeParentalFigure(responses: Array<{ response: string }>): string {
  if (responses.length === 0) return '정보 없음';
  
  const allText = responses.map(r => r.response.toLowerCase()).join(' ');
  
  if (allText.includes('사랑') || allText.includes('따뜻')) return '온정적이고 지지적인 이미지';
  if (allText.includes('엄격') || allText.includes('무서')) return '권위적이고 통제적인 이미지';
  if (allText.includes('없') || allText.includes('멀')) return '부재하거나 거리감 있는 이미지';
  if (allText.includes('복잡') || allText.includes('어려')) return '양가감정이 있는 복잡한 이미지';
  
  return '중립적이거나 일반적인 이미지';
}

function identifyDefenseMechanisms(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[]
): Array<{ type: string; strength: number; description: string }> {
  const mechanisms: Array<{ type: string; strength: number; description: string }> = [];
  const allText = responses.map(r => r.response.toLowerCase()).join(' ');
  
  // 부정 (Denial)
  if (allText.includes('괜찮') || allText.includes('문제없')) {
    mechanisms.push({
      type: '부정',
      strength: 6,
      description: '어려운 감정이나 현실을 인정하지 않으려는 경향',
    });
  }
  
  // 투사 (Projection)
  if (allText.includes('남들이') || allText.includes('사람들이 나를')) {
    mechanisms.push({
      type: '투사',
      strength: 5,
      description: '자신의 감정이나 생각을 타인에게 투사하는 경향',
    });
  }
  
  // 지성화 (Intellectualization)
  if (responses.some(r => r.response.length > 100)) {
    mechanisms.push({
      type: '지성화',
      strength: 4,
      description: '감정을 회피하고 인지적으로 처리하려는 경향',
    });
  }
  
  // 억압 (Repression)
  if (allText.includes('기억 안') || allText.includes('모르겠')) {
    mechanisms.push({
      type: '억압',
      strength: 6,
      description: '불편한 기억이나 감정을 의식에서 제거하는 경향',
    });
  }
  
  return mechanisms.length > 0 ? mechanisms : [{
    type: '적응적 방어',
    strength: 7,
    description: '건강한 수준의 방어기제 사용',
  }];
}

function analyzeSeparationIndividuation(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[]
): { stage: string; score: number; challenges: string[] } {
  const sepQuestions = questions.filter(q => q.objectRelationsAspect === 'separation_individuation');
  const sepResponses = responses.filter(r => sepQuestions.some(q => q.id === r.questionId));
  
  let score = 50;
  const challenges: string[] = [];
  
  sepResponses.forEach(r => {
    const text = r.response.toLowerCase();
    if (text.includes('혼자') && (text.includes('괜찮') || text.includes('좋'))) score += 15;
    if (text.includes('혼자') && (text.includes('싫') || text.includes('무서'))) {
      score -= 15;
      challenges.push('분리 불안');
    }
    if (text.includes('독립') || text.includes('자유')) score += 10;
    if (text.includes('의존') || text.includes('필요')) {
      score -= 5;
      challenges.push('과도한 의존');
    }
  });
  
  score = Math.max(0, Math.min(100, score));
  
  let stage = '';
  if (score >= 75) stage = '성숙한 자율성 단계';
  else if (score >= 50) stage = '개별화 진행 중';
  else if (score >= 25) stage = '분리-개별화 어려움';
  else stage = '공생적 관계 패턴';
  
  if (challenges.length === 0) challenges.push('특이사항 없음');
  
  return { stage, score, challenges };
}

function calculateAttachmentScore(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[],
  style: 'secure' | 'anxious' | 'avoidant' | 'disorganized'
): number {
  const styleQuestions = questions.filter(q => q.attachmentAspect === style);
  const styleResponses = responses.filter(r => styleQuestions.some(q => q.id === r.questionId));
  
  let score = 0;
  
  styleResponses.forEach(r => {
    const text = r.response.toLowerCase();
    
    if (style === 'secure') {
      if (text.includes('안전') || text.includes('믿') || text.includes('편안')) score += 10;
      if (text.includes('사랑') || text.includes('따뜻')) score += 8;
    } else if (style === 'anxious') {
      if (text.includes('불안') || text.includes('걱정') || text.includes('버림')) score += 10;
      if (text.includes('필요') || text.includes('집착')) score += 8;
    } else if (style === 'avoidant') {
      if (text.includes('혼자') || text.includes('독립') || text.includes('거리')) score += 10;
      if (text.includes('필요없') || text.includes('의존 안')) score += 8;
    } else if (style === 'disorganized') {
      if (text.includes('혼란') || text.includes('무서운') || text.includes('복잡')) score += 10;
      if (text.includes('모순') || text.includes('알 수 없')) score += 8;
    }
  });
  
  return Math.min(100, score);
}

function determinePrimaryAttachmentStyle(styleScores: {
  secure: number;
  anxious: number;
  avoidant: number;
  disorganized: number;
}): 'secure' | 'anxious-preoccupied' | 'dismissive-avoidant' | 'fearful-avoidant' {
  const max = Math.max(styleScores.secure, styleScores.anxious, styleScores.avoidant, styleScores.disorganized);
  
  if (styleScores.secure === max) return 'secure';
  if (styleScores.anxious === max) return 'anxious-preoccupied';
  if (styleScores.avoidant === max) return 'dismissive-avoidant';
  return 'fearful-avoidant';
}

function analyzeInternalWorkingModel(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[],
  style: string
) {
  const allText = responses.map(r => r.response.toLowerCase()).join(' ');
  
  let selfView = '';
  let othersView = '';
  let relationshipExpectations = '';
  
  if (style === 'secure') {
    selfView = '자신을 가치 있고 사랑받을 자격이 있는 존재로 인식';
    othersView = '타인을 신뢰할 수 있고 반응적인 존재로 인식';
    relationshipExpectations = '안정적이고 상호 지지적인 관계 기대';
  } else if (style === 'anxious-preoccupied') {
    selfView = '자신을 불완전하고 사랑받기 어려운 존재로 인식';
    othersView = '타인을 필요하지만 일관성 없는 존재로 인식';
    relationshipExpectations = '버림받을지 모른다는 불안과 함께 친밀감 강하게 추구';
  } else if (style === 'dismissive-avoidant') {
    selfView = '자신을 독립적이고 타인이 필요 없는 존재로 인식';
    othersView = '타인을 신뢰할 수 없고 부담스러운 존재로 인식';
    relationshipExpectations = '정서적 거리를 유지하며 독립성 강조';
  } else {
    selfView = '자신에 대해 혼란스럽고 일관성 없는 인식';
    othersView = '타인에 대해 두려움과 동시에 갈망을 느낌';
    relationshipExpectations = '친밀감을 원하지만 동시에 두려워하는 모순적 태도';
  }
  
  return { selfView, othersView, relationshipExpectations };
}

function analyzeEmotionalRegulation(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[]
) {
  const emotionQuestions = questions.filter(q => q.attachmentAspect === 'emotional_regulation');
  const emotionResponses = responses.filter(r => emotionQuestions.some(q => q.id === r.questionId));
  
  let score = 50;
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  emotionResponses.forEach(r => {
    const text = r.response.toLowerCase();
    
    if (text.includes('조절') || text.includes('진정') || text.includes('참')) {
      score += 10;
      strengths.push('정서 조절 시도');
    }
    if (text.includes('폭발') || text.includes('참을 수 없')) {
      score -= 15;
      challenges.push('정서 조절 어려움');
    }
    if (text.includes('표현') || text.includes('말')) {
      score += 5;
      strengths.push('정서 표현 능력');
    }
    if (text.includes('억누') || text.includes('숨')) {
      score -= 10;
      challenges.push('정서 억압');
    }
  });
  
  score = Math.max(0, Math.min(100, score));
  
  if (strengths.length === 0) strengths.push('정서 인식');
  if (challenges.length === 0) challenges.push('특이사항 없음');
  
  return { score, strengths, challenges };
}

function identifyUnmetNeeds(
  responses: Array<{ questionId: string; response: string }>,
  questions: SCTQuestion[]
): Array<{ need: string; severity: number; manifestations: string[] }> {
  const needs: Array<{ need: string; severity: number; manifestations: string[] }> = [];
  
  // 안전 욕구
  const safetyQuestions = questions.filter(q => q.psychologicalNeed === 'safety');
  const safetyResponses = responses.filter(r => safetyQuestions.some(q => q.id === r.questionId));
  if (safetyResponses.some(r => r.response.toLowerCase().includes('불안') || r.response.toLowerCase().includes('무서'))) {
    needs.push({
      need: '안전 욕구',
      severity: 8,
      manifestations: ['불안감', '과도한 경계', '통제 욕구'],
    });
  }
  
  // 소속감 욕구
  const relatedQuestions = questions.filter(q => q.psychologicalNeed === 'relatedness');
  const relatedResponses = responses.filter(r => relatedQuestions.some(q => q.id === r.questionId));
  if (relatedResponses.some(r => r.response.toLowerCase().includes('외로') || r.response.toLowerCase().includes('혼자'))) {
    needs.push({
      need: '소속감 욕구',
      severity: 7,
      manifestations: ['고립감', '소외감', '관계 갈망'],
    });
  }
  
  // 인정 욕구
  const recognitionQuestions = questions.filter(q => q.psychologicalNeed === 'recognition');
  const recognitionResponses = responses.filter(r => recognitionQuestions.some(q => q.id === r.questionId));
  if (recognitionResponses.some(r => r.response.toLowerCase().includes('무시') || r.response.toLowerCase().includes('인정'))) {
    needs.push({
      need: '인정 욕구',
      severity: 6,
      manifestations: ['자존감 저하', '인정 추구', '과도한 노력'],
    });
  }
  
  // 자율성 욕구
  const autonomyQuestions = questions.filter(q => q.psychologicalNeed === 'autonomy');
  const autonomyResponses = responses.filter(r => autonomyQuestions.some(q => q.id === r.questionId));
  if (autonomyResponses.some(r => r.response.toLowerCase().includes('억압') || r.response.toLowerCase().includes('자유'))) {
    needs.push({
      need: '자율성 욕구',
      severity: 7,
      manifestations: ['통제받는 느낌', '무력감', '반항심'],
    });
  }
  
  // 유능감 욕구
  const competenceQuestions = questions.filter(q => q.psychologicalNeed === 'competence');
  const competenceResponses = responses.filter(r => competenceQuestions.some(q => q.id === r.questionId));
  if (competenceResponses.some(r => r.response.toLowerCase().includes('못') || r.response.toLowerCase().includes('실패'))) {
    needs.push({
      need: '유능감 욕구',
      severity: 6,
      manifestations: ['무능감', '자신감 부족', '회피 행동'],
    });
  }
  
  return needs.length > 0 ? needs : [{
    need: '기본 욕구 충족',
    severity: 3,
    manifestations: ['전반적으로 양호한 상태'],
  }];
}

function identifyCompensatoryBehaviors(
  responses: Array<{ questionId: string; response: string }>,
  objectRelations: any,
  attachment: any
): string[] {
  const behaviors: string[] = [];
  const allText = responses.map(r => r.response.toLowerCase()).join(' ');
  
  if (attachment.primaryStyle === 'anxious-preoccupied') {
    behaviors.push('타인의 인정을 과도하게 추구함');
    behaviors.push('관계에서 안심을 반복적으로 구함');
  }
  
  if (attachment.primaryStyle === 'dismissive-avoidant') {
    behaviors.push('친밀감을 회피하고 독립성을 과도하게 강조');
    behaviors.push('감정을 지성화하거나 최소화함');
  }
  
  if (objectRelations.selfRepresentation.score < 50) {
    behaviors.push('과도한 자기 비판');
    behaviors.push('완벽주의적 성향');
  }
  
  if (allText.includes('항상') || allText.includes('해야')) {
    behaviors.push('경직된 규칙과 당위에 집착');
  }
  
  return behaviors.length > 0 ? behaviors : ['특이 보상 행동 없음'];
}

function identifyCoreBeliefs(
  responses: Array<{ questionId: string; response: string }>,
  objectRelations: any,
  attachment: any
): string[] {
  const beliefs: string[] = [];
  
  if (objectRelations.selfRepresentation.score < 50) {
    beliefs.push('나는 충분하지 않다');
    beliefs.push('나는 사랑받을 자격이 없다');
  }
  
  if (attachment.primaryStyle === 'anxious-preoccupied') {
    beliefs.push('다른 사람들은 나를 떠날 것이다');
    beliefs.push('나는 혼자서는 살 수 없다');
  }
  
  if (attachment.primaryStyle === 'dismissive-avoidant') {
    beliefs.push('타인을 믿을 수 없다');
    beliefs.push('나는 혼자가 더 안전하다');
  }
  
  if (objectRelations.defenseMechanisms.some(d => d.type === '부정')) {
    beliefs.push('감정을 느끼는 것은 약한 것이다');
  }
  
  return beliefs.length > 0 ? beliefs : ['기능적인 핵심 신념'];
}

function getStrategyForNeed(need: string): string {
  const strategies: Record<string, string> = {
    '안전 욕구': '안전감 회복 및 불안 관리',
    '소속감 욕구': '안전한 관계 형성 및 소속감 증진',
    '인정 욕구': '자기 가치감 내재화',
    '자율성 욕구': '자율성 회복 및 경계 설정',
    '유능감 욕구': '성취 경험 및 자기 효능감 향상',
  };
  return strategies[need] || '심리적 욕구 충족';
}

function getPracticesForNeed(need: string): string[] {
  const practices: Record<string, string[]> = {
    '안전 욕구': ['안전 공간 만들기', '점진적 노출 연습', '이완 기법 훈련'],
    '소속감 욕구': ['소규모 그룹 활동 참여', '안전한 관계 경험', '정서적 연결 연습'],
    '인정 욕구': ['자기 인정 연습', '내적 검증 강화', '자기 가치 재정립'],
    '자율성 욕구': ['선택권 확대', '경계 설정 연습', '자기 주장 훈련'],
    '유능감 욕구': ['작은 성공 경험 쌓기', '강점 활용', '기술 개발'],
  };
  return practices[need] || ['맞춤형 개입'];
}

function identifyStrengths(objectRelations: any, attachment: any): string[] {
  const strengths: string[] = [];
  
  if (objectRelations.selfRepresentation.score >= 60) {
    strengths.push('긍정적 자기 인식');
  }
  
  if (objectRelations.objectRepresentation.score >= 60) {
    strengths.push('타인에 대한 긍정적 관점');
  }
  
  if (attachment.styleScores.secure >= 50) {
    strengths.push('안정적 애착 경향');
  }
  
  if (attachment.emotionalRegulation.score >= 60) {
    strengths.push('정서 조절 능력');
  }
  
  if (objectRelations.separationIndividuation.score >= 60) {
    strengths.push('건강한 자율성');
  }
  
  return strengths.length > 0 ? strengths : ['변화 동기', '자기 성찰 능력'];
}

function determinePrimaryFocus(
  objectRelations: any,
  attachment: any,
  needsAnalysis: any
): string {
  // 가장 심각한 영역 찾기
  const lowestScore = Math.min(
    objectRelations.selfRepresentation.score,
    objectRelations.objectRepresentation.score,
    attachment.emotionalRegulation.score,
    objectRelations.separationIndividuation.score
  );
  
  if (lowestScore === objectRelations.selfRepresentation.score) {
    return '자기 표상 강화 및 자존감 향상';
  }
  
  if (lowestScore === objectRelations.objectRepresentation.score) {
    return '대인관계 패턴 개선 및 대상 표상 재구성';
  }
  
  if (lowestScore === attachment.emotionalRegulation.score) {
    return '정서 조절 능력 향상 및 애착 안정화';
  }
  
  if (lowestScore === objectRelations.separationIndividuation.score) {
    return '분리-개별화 촉진 및 건강한 자율성 발달';
  }
  
  return '전반적 심리적 안녕감 증진';
}

function assessGrowthPotential(
  objectRelations: any,
  attachment: any,
  ageGroup: SCTAgeGroup
): string {
  const avgScore = (
    objectRelations.selfRepresentation.score +
    objectRelations.objectRepresentation.score +
    attachment.emotionalRegulation.score +
    objectRelations.separationIndividuation.score
  ) / 4;
  
  if (avgScore >= 70) {
    return `${ageGroup === 'infant' || ageGroup === 'teen' ? '발달 단계에 맞는' : ''} 높은 성장 잠재력을 보이며, 현재의 강점을 더욱 강화하고 확장할 수 있습니다.`;
  }
  
  if (avgScore >= 50) {
    return `적절한 치료적 개입과 지지를 통해 상당한 성장과 변화가 가능합니다. 자기 인식이 있어 변화 동기가 충분합니다.`;
  }
  
  return `현재 어려움이 있지만, 전문적 도움과 꾸준한 노력을 통해 점진적인 개선이 가능합니다. 작은 변화부터 시작하는 것이 중요합니다.`;
}

function calculateOverallScore(
  objectRelations: any,
  attachment: any,
  needsAnalysis: any
): number {
  const objRelScore = (
    objectRelations.selfRepresentation.score +
    objectRelations.objectRepresentation.score +
    objectRelations.separationIndividuation.score
  ) / 3;
  
  const attachScore = (
    attachment.styleScores.secure * 1.5 +
    (100 - attachment.styleScores.anxious) +
    (100 - attachment.styleScores.avoidant) +
    (100 - attachment.styleScores.disorganized) +
    attachment.emotionalRegulation.score
  ) / 5.5;
  
  const needsScore = 100 - (needsAnalysis.unmetNeeds.reduce((sum: number, n: any) => sum + n.severity, 0) / needsAnalysis.unmetNeeds.length) * 10;
  
  return Math.round((objRelScore * 0.4 + attachScore * 0.4 + needsScore * 0.2));
}

function getSelfRepresentationDescription(score: number, patterns: string[]): string {
  if (score >= 70) {
    return '긍정적이고 통합된 자기 이미지를 가지고 있습니다. 자신의 장단점을 현실적으로 인식하며 자존감이 안정적입니다.';
  }
  if (score >= 50) {
    return '자기 이미지에 일부 부정적 측면이 있으나, 전반적으로는 균형 잡힌 자기 인식을 보입니다.';
  }
  if (score >= 30) {
    return `부정적 자기 표상이 두드러집니다. ${patterns.join(', ')} 등의 패턴이 관찰되며 자존감 향상이 필요합니다.`;
  }
  return '매우 부정적인 자기 이미지를 가지고 있어 자기 가치감 회복이 시급합니다.';
}

function getObjectRepresentationDescription(score: number): string {
  if (score >= 70) {
    return '타인에 대한 긍정적이고 현실적인 표상을 가지고 있으며, 관계에서 신뢰와 친밀감을 경험할 수 있습니다.';
  }
  if (score >= 50) {
    return '타인에 대한 표상이 다소 혼합되어 있으나, 관계 형성에 큰 어려움은 없습니다.';
  }
  if (score >= 30) {
    return '타인에 대한 부정적 표상이 있어 관계에서 어려움을 경험할 수 있습니다.';
  }
  return '타인에 대한 매우 부정적이거나 왜곡된 표상으로 인해 관계 형성에 심각한 어려움이 있습니다.';
}
