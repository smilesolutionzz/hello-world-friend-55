// 기관 유형별 추천 전문가/일정/요금 데이터 소스
// 학교, 상담센터, 복지기관, 기업이 서로 다른 풀을 사용합니다.

export type InstitutionType = 'school' | 'counseling' | 'welfare' | 'corporate';

export interface InstitutionExpert {
  id: string;
  name: string;
  role: string;            // 직책/자격
  specialties: string[];   // 전문 분야
  yearsExperience: number;
  pricePerSession: number; // 회기당 요금 (KRW)
  sessionMinutes: number;  // 1회기 분
  availability: string;    // 일정 요약
  modality: string[];      // 대면/비대면/방문 등
  rating: number;
}

export interface InstitutionPricingPlan {
  tier: string;
  monthlyFee: number;
  includes: string[];
  note?: string;
}

export interface InstitutionScheduleSlot {
  day: string;     // 월~일
  hours: string;   // 운영 시간대
  capacity: string; // 동시 수용
}

interface InstitutionPool {
  experts: InstitutionExpert[];
  pricing: InstitutionPricingPlan[];
  schedule: InstitutionScheduleSlot[];
  contractNote: string;
}

export const INSTITUTION_EXPERT_POOL: Record<InstitutionType, InstitutionPool> = {
  school: {
    experts: [
      { id: 'sch-01', name: '정해린 상담교사', role: '전문상담교사 1급 · 학교심리사', specialties: ['학교폭력', '교우관계', '학습부진'], yearsExperience: 11, pricePerSession: 80000, sessionMinutes: 40, availability: '학기 중 평일 09–17시 · 방학 집중 워크숍', modality: ['학교 방문', '비대면'], rating: 4.9 },
      { id: 'sch-02', name: '오세훈 박사', role: '아동청소년 임상심리사', specialties: ['ADHD', '시험불안', '정서행동'], yearsExperience: 14, pricePerSession: 120000, sessionMinutes: 50, availability: '주 2회 정기 방문 가능', modality: ['학교 방문'], rating: 4.8 },
      { id: 'sch-03', name: '김보라 상담사', role: '청소년상담사 2급', specialties: ['진로상담', '학교적응'], yearsExperience: 7, pricePerSession: 70000, sessionMinutes: 40, availability: '평일 오후 · 방과후 가능', modality: ['학교 방문', '비대면'], rating: 4.7 },
    ],
    pricing: [
      { tier: '학교 베이직', monthlyFee: 490000, includes: ['상담교사 협력 회의 월 2회', '학생 100명 기본 검사', '월간 학부모 리포트 자동 발송'] },
      { tier: '학교 프로', monthlyFee: 990000, includes: ['임상심리사 정기 방문 주 1회', '학생 300명 무제한 검사', 'Wee센터 연계 케이스 회의'], note: '학교폭력 예방 프로그램 포함' },
    ],
    schedule: [
      { day: '월–금', hours: '09:00–17:00 (학기 중)', capacity: '학급 단위 4반/일' },
      { day: '토', hours: '학부모 워크숍 격주 운영', capacity: '40명' },
    ],
    contractNote: '학교 회계연도 기준 연 단위 계약 · 교육청 위탁 정산 가능',
  },

  counseling: {
    experts: [
      { id: 'cns-01', name: '최동욱 박사', role: '정신건강임상심리사 · CBT 전문가', specialties: ['우울', '불안', 'PTSD'], yearsExperience: 15, pricePerSession: 150000, sessionMinutes: 50, availability: '평일 10–21시 · 토 10–14시', modality: ['센터 내 대면', '비대면'], rating: 4.9 },
      { id: 'cns-02', name: '한소영 박사', role: '가족치료 슈퍼바이저', specialties: ['부부상담', '가족치료', '트라우마'], yearsExperience: 20, pricePerSession: 180000, sessionMinutes: 60, availability: '예약제 · 야간 회기 가능', modality: ['센터 내 대면'], rating: 4.9 },
      { id: 'cns-03', name: '오태현 교수', role: '정신분석 전문가', specialties: ['성격장애', '심층상담'], yearsExperience: 18, pricePerSession: 200000, sessionMinutes: 50, availability: '주 2회 고정 슬롯', modality: ['센터 내 대면'], rating: 4.8 },
      { id: 'cns-04', name: '임가영 상담사', role: '청소년상담사 1급', specialties: ['청소년', '진로', '학교부적응'], yearsExperience: 9, pricePerSession: 90000, sessionMinutes: 50, availability: '방과후 + 주말', modality: ['센터 내 대면', '비대면'], rating: 4.7 },
    ],
    pricing: [
      { tier: '센터 운영형', monthlyFee: 690000, includes: ['케이스 관리 SaaS', '내담자 월 50건 리포트', '슈퍼비전 케이스 리포트'] },
      { tier: '센터 프리미엄', monthlyFee: 1290000, includes: ['내담자 무제한 리포트', '회기 동맹/RCI 종단 분석', '자살사고 모니터링 알림'], note: '안전계획 자동 템플릿 포함' },
    ],
    schedule: [
      { day: '월–금', hours: '10:00–21:00', capacity: '회기실 6실 동시' },
      { day: '토', hours: '10:00–18:00', capacity: '회기실 4실 동시' },
    ],
    contractNote: '센터 내담자 동의 기반 데이터 공유 · 월 단위 정산',
  },

  welfare: {
    experts: [
      { id: 'wel-01', name: '이복지 사회복지사', role: '사회복지사 1급 · 노인전문', specialties: ['노인 돌봄', '바우처 운영', '사례관리'], yearsExperience: 13, pricePerSession: 60000, sessionMinutes: 60, availability: '평일 09–18시 · 가정방문 가능', modality: ['기관 방문', '가정 방문'], rating: 4.8 },
      { id: 'wel-02', name: '서미경 작업치료사', role: '작업치료사 · 인지재활', specialties: ['인지재활', '일상생활 훈련', '치매예방'], yearsExperience: 10, pricePerSession: 80000, sessionMinutes: 50, availability: '주 3회 기관 출강', modality: ['기관 방문'], rating: 4.7 },
      { id: 'wel-03', name: '문정아 간호사', role: '방문간호사', specialties: ['복약지도', '건강모니터링'], yearsExperience: 12, pricePerSession: 70000, sessionMinutes: 45, availability: '평일 가정방문 라운드', modality: ['가정 방문'], rating: 4.8 },
      { id: 'wel-04', name: '한도윤 상담사', role: '정신건강사회복지사', specialties: ['고립가구', '자조모임'], yearsExperience: 8, pricePerSession: 65000, sessionMinutes: 50, availability: '평일 + 토요 자조모임', modality: ['기관 방문', '비대면'], rating: 4.6 },
    ],
    pricing: [
      { tier: '복지 기본형', monthlyFee: 390000, includes: ['이용자 200명 케어 점수 관리', '월간 운영 리포트 자동화', '바우처 증빙 서류 변환'] },
      { tier: '복지 통합형', monthlyFee: 890000, includes: ['이용자 무제한 + 가족 리포트', '인지재활 프로그램 가이드', '지자체 보고용 종합 리포트'], note: '지자체 위탁사업 정산 양식 지원' },
    ],
    schedule: [
      { day: '월–금', hours: '09:00–18:00', capacity: '주간 프로그램 6개 동시' },
      { day: '토', hours: '자조모임 격주 10:00–13:00', capacity: '30명' },
    ],
    contractNote: '지자체/사회복지공동모금회 위탁사업 정산 양식 지원',
  },

  corporate: {
    experts: [
      { id: 'cor-01', name: '장유진 EAP 코치', role: 'EAP 전문가 · 직장 코칭', specialties: ['번아웃', '직장스트레스', '대인관계'], yearsExperience: 9, pricePerSession: 130000, sessionMinutes: 50, availability: '평일 09–22시 · 익명 매칭', modality: ['비대면'], rating: 4.8 },
      { id: 'cor-02', name: '박민준 박사', role: '조직심리 전문가', specialties: ['리더십 코칭', '갈등관리'], yearsExperience: 12, pricePerSession: 200000, sessionMinutes: 60, availability: '임원 코칭 예약제', modality: ['비대면', '오프사이트'], rating: 4.9 },
    ],
    pricing: [
      { tier: 'HR 베이직', monthlyFee: 990000, includes: ['임직원 100명 익명 펄스', '월간 HR 리포트', 'EAP 매칭 월 20회'] },
      { tier: 'HR 엔터프라이즈', monthlyFee: 2490000, includes: ['무제한 임직원 + 부서별 분석', '리더십 코칭 패키지', '위기 대응 핫라인'], note: '온보딩 컨설팅 포함' },
    ],
    schedule: [
      { day: '월–금', hours: '09:00–22:00 (코칭)', capacity: '동시 매칭 12건' },
      { day: '상시', hours: '익명 펄스 서베이 자동', capacity: '무제한' },
    ],
    contractNote: '연 단위 계약 · 분기별 ROI 리포트 제공',
  },
};

export const getInstitutionPool = (type: InstitutionType): InstitutionPool =>
  INSTITUTION_EXPERT_POOL[type];

export const formatKRW = (n: number) => `₩${n.toLocaleString('ko-KR')}`;
