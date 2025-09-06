// 생애주기별 발달 영역 정의
export interface DevelopmentalDomain {
  key: string;
  label: string;
  description: string;
  ageGroups: string[];
  subDomains: SubDomain[];
  icon: string;
  color: string;
}

export interface SubDomain {
  key: string;
  label: string;
  description: string;
  milestones: Milestone[];
}

export interface Milestone {
  age: string;
  level: number;
  description: string;
  expectedRange: [number, number];
}

// 연령대별 발달 영역 매핑
export const DEVELOPMENTAL_DOMAINS: Record<string, DevelopmentalDomain[]> = {
  // 아동 (0-18세)
  child: [
    {
      key: 'gross_motor',
      label: '대근육 운동',
      description: '큰 근육을 사용한 신체 움직임과 운동 능력',
      ageGroups: ['infant', 'toddler', 'preschool', 'school'],
      subDomains: [
        {
          key: 'balance',
          label: '균형감각',
          description: '몸의 균형을 유지하는 능력',
          milestones: [
            { age: '6개월', level: 1, description: '도움을 받아 앉기', expectedRange: [1, 2] },
            { age: '12개월', level: 2, description: '혼자 서기', expectedRange: [2, 3] },
            { age: '18개월', level: 3, description: '걷기', expectedRange: [3, 4] },
            { age: '2세', level: 4, description: '달리기', expectedRange: [4, 5] },
            { age: '3세', level: 5, description: '한 발로 서기', expectedRange: [4, 5] }
          ]
        },
        {
          key: 'coordination',
          label: '협응력',
          description: '몸의 움직임을 조화롭게 조절하는 능력',
          milestones: [
            { age: '1세', level: 1, description: '기어다니기', expectedRange: [1, 2] },
            { age: '2세', level: 2, description: '계단 오르기', expectedRange: [2, 3] },
            { age: '3세', level: 3, description: '세발자전거 타기', expectedRange: [3, 4] },
            { age: '4세', level: 4, description: '공 던지고 받기', expectedRange: [4, 5] },
            { age: '5세', level: 5, description: '스키핑', expectedRange: [4, 5] }
          ]
        }
      ],
      icon: 'Activity',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'fine_motor',
      label: '소근육 운동',
      description: '손가락과 손목의 정교한 움직임',
      ageGroups: ['infant', 'toddler', 'preschool', 'school'],
      subDomains: [
        {
          key: 'hand_grip',
          label: '손 조작',
          description: '물건을 잡고 조작하는 능력',
          milestones: [
            { age: '3개월', level: 1, description: '손 쥐기 반사', expectedRange: [1, 2] },
            { age: '6개월', level: 2, description: '물건 잡기', expectedRange: [2, 3] },
            { age: '12개월', level: 3, description: '집게 잡기', expectedRange: [3, 4] },
            { age: '2세', level: 4, description: '블록 쌓기', expectedRange: [4, 5] },
            { age: '3세', level: 5, description: '가위로 자르기', expectedRange: [4, 5] }
          ]
        }
      ],
      icon: 'Hand',
      color: 'bg-green-100 text-green-800'
    },
    {
      key: 'language',
      label: '언어발달',
      description: '말하기, 듣기, 이해하기 능력',
      ageGroups: ['infant', 'toddler', 'preschool', 'school'],
      subDomains: [
        {
          key: 'receptive',
          label: '수용언어',
          description: '다른 사람의 말을 이해하는 능력',
          milestones: [
            { age: '6개월', level: 1, description: '자기 이름에 반응', expectedRange: [1, 2] },
            { age: '12개월', level: 2, description: '간단한 지시 이해', expectedRange: [2, 3] },
            { age: '18개월', level: 3, description: '신체 부위 인식', expectedRange: [3, 4] },
            { age: '2세', level: 4, description: '2단계 지시 따르기', expectedRange: [4, 5] },
            { age: '3세', level: 5, description: '복잡한 문장 이해', expectedRange: [4, 5] }
          ]
        },
        {
          key: 'expressive',
          label: '표현언어',
          description: '생각과 감정을 말로 표현하는 능력',
          milestones: [
            { age: '6개월', level: 1, description: '옹알이', expectedRange: [1, 2] },
            { age: '12개월', level: 2, description: '첫 단어', expectedRange: [2, 3] },
            { age: '18개월', level: 3, description: '2-3단어 조합', expectedRange: [3, 4] },
            { age: '2세', level: 4, description: '간단한 문장', expectedRange: [4, 5] },
            { age: '3세', level: 5, description: '복잡한 문장', expectedRange: [4, 5] }
          ]
        }
      ],
      icon: 'MessageSquare',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'social_emotional',
      label: '사회성/정서',
      description: '타인과의 관계 형성 및 감정 조절 능력',
      ageGroups: ['infant', 'toddler', 'preschool', 'school'],
      subDomains: [
        {
          key: 'attachment',
          label: '애착형성',
          description: '주 양육자와의 안정적 관계',
          milestones: [
            { age: '3개월', level: 1, description: '사회적 미소', expectedRange: [1, 2] },
            { age: '6개월', level: 2, description: '낯가림', expectedRange: [2, 3] },
            { age: '12개월', level: 3, description: '분리불안', expectedRange: [3, 4] },
            { age: '2세', level: 4, description: '안정적 애착', expectedRange: [4, 5] },
            { age: '3세', level: 5, description: '독립성 발달', expectedRange: [4, 5] }
          ]
        }
      ],
      icon: 'Heart',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      key: 'cognitive',
      label: '인지발달',
      description: '사고, 기억, 학습, 문제해결 능력',
      ageGroups: ['toddler', 'preschool', 'school'],
      subDomains: [
        {
          key: 'attention',
          label: '주의집중',
          description: '특정 대상에 집중하는 능력',
          milestones: [
            { age: '1세', level: 1, description: '짧은 집중', expectedRange: [1, 2] },
            { age: '2세', level: 2, description: '5분 집중', expectedRange: [2, 3] },
            { age: '3세', level: 3, description: '10분 집중', expectedRange: [3, 4] },
            { age: '4세', level: 4, description: '15분 집중', expectedRange: [4, 5] },
            { age: '5세', level: 5, description: '20분 집중', expectedRange: [4, 5] }
          ]
        }
      ],
      icon: 'Brain',
      color: 'bg-orange-100 text-orange-800'
    }
  ],

  // 성인 (19-64세)
  adult: [
    {
      key: 'emotional_regulation',
      label: '정서조절',
      description: '스트레스 관리 및 감정 조절 능력',
      ageGroups: ['young_adult', 'middle_adult'],
      subDomains: [
        {
          key: 'stress_management',
          label: '스트레스 관리',
          description: '일상적 스트레스에 대한 대처 능력',
          milestones: [
            { age: '20대', level: 1, description: '기본적 스트레스 인식', expectedRange: [1, 3] },
            { age: '30대', level: 3, description: '적절한 대처 전략 사용', expectedRange: [2, 4] },
            { age: '40대', level: 4, description: '능숙한 스트레스 관리', expectedRange: [3, 5] },
            { age: '50대', level: 5, description: '전문적 대처 능력', expectedRange: [4, 5] }
          ]
        }
      ],
      icon: 'Heart',
      color: 'bg-green-100 text-green-800'
    },
    {
      key: 'cognitive_function',
      label: '인지기능',
      description: '기억력, 주의력, 실행기능',
      ageGroups: ['young_adult', 'middle_adult'],
      subDomains: [
        {
          key: 'working_memory',
          label: '작업기억',
          description: '정보를 일시적으로 저장하고 조작하는 능력',
          milestones: [
            { age: '20대', level: 5, description: '최고 수준', expectedRange: [4, 5] },
            { age: '30대', level: 4, description: '안정적 수준', expectedRange: [3, 5] },
            { age: '40대', level: 4, description: '유지된 수준', expectedRange: [3, 4] },
            { age: '50대', level: 3, description: '약간 감소', expectedRange: [2, 4] }
          ]
        }
      ],
      icon: 'Brain',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'social_relationship',
      label: '사회적 관계',
      description: '대인관계 및 사회적 기능',
      ageGroups: ['young_adult', 'middle_adult'],
      subDomains: [
        {
          key: 'interpersonal_skills',
          label: '대인관계 기술',
          description: '타인과의 효과적인 소통 및 관계 형성',
          milestones: [
            { age: '20대', level: 2, description: '관계 형성 학습', expectedRange: [1, 4] },
            { age: '30대', level: 4, description: '안정적 관계 유지', expectedRange: [3, 5] },
            { age: '40대', level: 5, description: '성숙한 관계', expectedRange: [4, 5] },
            { age: '50대', level: 5, description: '깊은 유대감', expectedRange: [4, 5] }
          ]
        }
      ],
      icon: 'Users',
      color: 'bg-purple-100 text-purple-800'
    }
  ],

  // 노인 (65세 이상)
  elderly: [
    {
      key: 'cognitive_health',
      label: '인지건강',
      description: '기억력, 주의력, 판단력 유지',
      ageGroups: ['young_elderly', 'old_elderly'],
      subDomains: [
        {
          key: 'memory',
          label: '기억력',
          description: '단기 및 장기 기억 능력',
          milestones: [
            { age: '65-70세', level: 4, description: '양호한 기억력', expectedRange: [3, 5] },
            { age: '70-75세', level: 3, description: '보통 기억력', expectedRange: [2, 4] },
            { age: '75-80세', level: 3, description: '유지된 기억력', expectedRange: [2, 4] },
            { age: '80세+', level: 2, description: '기본적 기억력', expectedRange: [1, 3] }
          ]
        },
        {
          key: 'executive_function',
          label: '실행기능',
          description: '계획, 조직화, 문제해결 능력',
          milestones: [
            { age: '65-70세', level: 4, description: '효율적 계획', expectedRange: [3, 5] },
            { age: '70-75세', level: 3, description: '적절한 조직화', expectedRange: [2, 4] },
            { age: '75-80세', level: 3, description: '기본적 문제해결', expectedRange: [2, 4] },
            { age: '80세+', level: 2, description: '단순한 계획', expectedRange: [1, 3] }
          ]
        }
      ],
      icon: 'Brain',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'physical_function',
      label: '신체기능',
      description: '운동능력 및 일상생활 수행능력',
      ageGroups: ['young_elderly', 'old_elderly'],
      subDomains: [
        {
          key: 'mobility',
          label: '이동성',
          description: '걷기, 균형, 근력',
          milestones: [
            { age: '65-70세', level: 4, description: '활발한 이동', expectedRange: [3, 5] },
            { age: '70-75세', level: 3, description: '안전한 이동', expectedRange: [2, 4] },
            { age: '75-80세', level: 3, description: '보조적 이동', expectedRange: [2, 4] },
            { age: '80세+', level: 2, description: '제한적 이동', expectedRange: [1, 3] }
          ]
        }
      ],
      icon: 'Activity',
      color: 'bg-green-100 text-green-800'
    },
    {
      key: 'social_engagement',
      label: '사회참여',
      description: '사회활동 및 관계 유지',
      ageGroups: ['young_elderly', 'old_elderly'],
      subDomains: [
        {
          key: 'community_involvement',
          label: '사회활동',
          description: '지역사회 참여 및 사회적 연결',
          milestones: [
            { age: '65-70세', level: 4, description: '적극적 참여', expectedRange: [3, 5] },
            { age: '70-75세', level: 3, description: '선택적 참여', expectedRange: [2, 4] },
            { age: '75-80세', level: 3, description: '제한적 참여', expectedRange: [2, 4] },
            { age: '80세+', level: 2, description: '기본적 참여', expectedRange: [1, 3] }
          ]
        }
      ],
      icon: 'Users',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'emotional_wellbeing',
      label: '정서적 안녕',
      description: '우울, 불안, 생활만족도',
      ageGroups: ['young_elderly', 'old_elderly'],
      subDomains: [
        {
          key: 'life_satisfaction',
          label: '생활만족도',
          description: '삶의 질과 행복감',
          milestones: [
            { age: '65-70세', level: 4, description: '높은 만족도', expectedRange: [3, 5] },
            { age: '70-75세', level: 4, description: '안정적 만족도', expectedRange: [3, 5] },
            { age: '75-80세', level: 3, description: '보통 만족도', expectedRange: [2, 4] },
            { age: '80세+', level: 3, description: '기본적 만족도', expectedRange: [2, 4] }
          ]
        }
      ],
      icon: 'Heart',
      color: 'bg-pink-100 text-pink-800'
    }
  ]
};

// 연령대 분류 함수
export const getAgeGroup = (birthDate: string): 'child' | 'adult' | 'elderly' => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  
  if (age < 19) return 'child';
  if (age < 65) return 'adult';
  return 'elderly';
};

// 세부 연령대 분류 함수
export const getDetailedAgeGroup = (birthDate: string): string => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  
  // 아동
  if (age < 1) return 'infant';
  if (age < 3) return 'toddler';
  if (age < 6) return 'preschool';
  if (age < 19) return 'school';
  
  // 성인
  if (age < 35) return 'young_adult';
  if (age < 65) return 'middle_adult';
  
  // 노인
  if (age < 75) return 'young_elderly';
  return 'old_elderly';
};

// 연령대별 발달 영역 가져오기
export const getDevelopmentalDomainsForAge = (birthDate: string): DevelopmentalDomain[] => {
  const ageGroup = getAgeGroup(birthDate);
  return DEVELOPMENTAL_DOMAINS[ageGroup] || [];
};