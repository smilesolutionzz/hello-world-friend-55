import { ExpertProfile } from "@/types/assessment";

// 전문가 데이터베이스 (실제 환경에서는 Supabase DB에서 로드)
export const expertDatabase: ExpertProfile[] = [
  {
    id: "expert_001",
    name: "김지수",
    specialty: ["영유아발달", "언어발달지연", "자폐스펙트럼"],
    experienceYears: 12,
    rating: 4.9,
    consultationStyle: "empathetic",
    available: true,
    nextAvailableTime: "지금 바로",
    pricePerSession: 80000,
    credentials: ["임상심리사 1급", "언어재활사", "발달심리전문가"],
    languages: ["한국어", "영어"],
    ageSpecialization: "infant"
  },
  {
    id: "expert_002", 
    name: "박민준",
    specialty: ["ADHD", "학습장애", "정서행동문제"],
    experienceYears: 8,
    rating: 4.8,
    consultationStyle: "solution_focused",
    available: true,
    nextAvailableTime: "30분 후",
    pricePerSession: 70000,
    credentials: ["임상심리사 1급", "학교심리사", "인지행동치료전문가"],
    languages: ["한국어"],
    ageSpecialization: "child"
  },
  {
    id: "expert_003",
    name: "이서연",
    specialty: ["아동청소년", "게임중독", "사회성발달"],
    experienceYears: 10,
    rating: 4.9,
    consultationStyle: "integrative",
    available: false,
    nextAvailableTime: "오후 3시",
    pricePerSession: 75000,
    credentials: ["임상심리사 1급", "게임중독전문가", "집단치료전문가"],
    languages: ["한국어", "중국어"],
    ageSpecialization: "child"
  },
  {
    id: "expert_004",
    name: "최동욱",
    specialty: ["우울증", "불안장애", "스트레스관리"],
    experienceYears: 15,
    rating: 4.8,
    consultationStyle: "analytical",
    available: true,
    nextAvailableTime: "지금 바로",
    pricePerSession: 90000,
    credentials: ["정신건강임상심리사", "인지행동치료전문가", "EMDR치료사"],
    languages: ["한국어", "영어"],
    ageSpecialization: "adult"
  },
  {
    id: "expert_005",
    name: "장유진",
    specialty: ["직장스트레스", "번아웃", "대인관계"],
    experienceYears: 7,
    rating: 4.7,
    consultationStyle: "empathetic",
    available: true,
    nextAvailableTime: "1시간 후",
    pricePerSession: 65000,
    credentials: ["임상심리사 2급", "직업상담사", "EAP전문가"],
    languages: ["한국어"],
    ageSpecialization: "adult"
  },
  {
    id: "expert_006",
    name: "한소영",
    specialty: ["트라우마", "PTSD", "가족치료"],
    experienceYears: 20,
    rating: 4.9,
    consultationStyle: "integrative",
    available: false,
    nextAvailableTime: "내일 오전 9시",
    pricePerSession: 120000,
    credentials: ["정신건강임상심리사", "가족치료전문가", "트라우마전문가"],
    languages: ["한국어", "영어", "일본어"],
    ageSpecialization: "all"
  },
  {
    id: "expert_007",
    name: "오태현",
    specialty: ["성격장애", "정신분석", "심층심리"],
    experienceYears: 18,
    rating: 4.8,
    consultationStyle: "analytical",
    available: true,
    nextAvailableTime: "2시간 후",
    pricePerSession: 100000,
    credentials: ["정신건강임상심리사", "정신분석전문가", "대학교수"],
    languages: ["한국어", "영어"],
    ageSpecialization: "adult"
  },
  {
    id: "expert_008",
    name: "임가영",
    specialty: ["청소년상담", "진로상담", "학교적응"],
    experienceYears: 9,
    rating: 4.7,
    consultationStyle: "solution_focused",
    available: true,
    nextAvailableTime: "지금 바로",
    pricePerSession: 60000,
    credentials: ["청소년상담사 1급", "진로상담사", "학교심리사"],
    languages: ["한국어"],
    ageSpecialization: "child"
  }
];

// 응급상황 24시간 전문가
export const emergencyExperts: ExpertProfile[] = [
  {
    id: "emergency_001",
    name: "응급상담센터",
    specialty: ["위기개입", "자살예방", "응급상담"],
    experienceYears: 0,
    rating: 5.0,
    consultationStyle: "empathetic",
    available: true,
    nextAvailableTime: "지금 바로 (24시간)",
    pricePerSession: 150000,
    credentials: ["24시간 응급대응팀", "위기개입전문가"],
    languages: ["한국어"],
    ageSpecialization: "all"
  }
];

// 전문가 필터링 함수
export const filterExpertsByAge = (ageGroup: 'infant' | 'child' | 'adult'): ExpertProfile[] => {
  return expertDatabase.filter(expert => 
    expert.ageSpecialization === ageGroup || expert.ageSpecialization === 'all'
  );
};

// 전문가 검색 함수
export const searchExperts = (specialty: string[]): ExpertProfile[] => {
  return expertDatabase.filter(expert =>
    specialty.some(spec => expert.specialty.some(expertSpec => 
      expertSpec.toLowerCase().includes(spec.toLowerCase())
    ))
  );
};

// 가용한 전문가만 필터링
export const getAvailableExperts = (): ExpertProfile[] => {
  return expertDatabase.filter(expert => expert.available);
};