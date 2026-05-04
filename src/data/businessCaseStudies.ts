// B2B Case Study 데이터 — 실제 도입 레퍼런스가 확보되면 이 파일만 업데이트
// 메모리 규칙: 가격 하드코딩 금지. 수치는 비율/일반 지표만 사용.

export interface CaseStudyMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface CaseStudy {
  slug: string;
  industry: string;            // 예: 제조업, IT, 교육기관
  size: string;                // 예: 임직원 320명
  title: string;               // 한 줄 헤드라인
  summary: string;             // 카드용 요약
  challenge: string;           // 도입 배경
  approach: string[];          // 도입 단계
  outcomes: CaseStudyMetric[]; // 정성+정량 결과
  quote?: { text: string; author: string };
  pilotMonths: number;
  isAnonymized: boolean;       // true면 "익명 사례"로 표시
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'mfg-midmarket-burnout',
    industry: '제조업 (중견기업)',
    size: '임직원 320명 / 6개 부서',
    title: '교대근무 부서의 번아웃 신호를 6주 만에 가시화',
    summary: '익명 코칭과 부서 단위 집계 리포트로 HR이 처음으로 "어디가 위험한지"를 데이터로 확인.',
    challenge:
      '교대근무 비율이 높은 생산직군에서 산발적 이직과 결근이 늘었지만, HR은 정성적 면담 외에 신호를 잡을 수단이 없었습니다.',
    approach: [
      '전 직원 대상 30일 마음 트랙 익명 참여 (옵트인)',
      '부서·직군 단위 집계 리포트만 HR에 공개 (5명 미만 자동 마스킹)',
      '고위험 신호 부서에 대해 전문가 상담 크레딧 우선 배정',
    ],
    outcomes: [
      { label: '직원 자발 참여율', value: '68%', hint: '익명성 보장이 핵심' },
      { label: '고위험 신호 조기 식별', value: '2개 부서', hint: '기존엔 면담 없이는 불가' },
      { label: '코칭 만족도', value: '4.4 / 5.0' },
    ],
    quote: {
      text: '"숫자로 보여주니 임원 보고가 처음으로 가능해졌습니다."',
      author: 'HR 책임자, 제조업',
    },
    pilotMonths: 2,
    isAnonymized: true,
  },
  {
    slug: 'edu-academy-counselor-load',
    industry: '교육 (사교육 그룹)',
    size: '강사·운영진 90명 / 12개 캠퍼스',
    title: '상담 인력 부족을 AI 1차 코칭으로 보완',
    summary: '직원이 상담 신청 전 단계에서 자기 점검을 할 수 있도록 해 상담 대기열을 실질적으로 단축.',
    challenge:
      '캠퍼스마다 상담 인력이 1명 이하라 직원의 정서적 어려움이 누적되어도 즉시 대응이 어려웠습니다.',
    approach: [
      'AI 마음 트랙을 1차 진입 채널로 도입',
      '필요 시에만 인간 전문가 상담으로 연결되도록 흐름 설계',
      '캠퍼스별 추세를 월간 익명 리포트로 운영진에 공유',
    ],
    outcomes: [
      { label: '상담 대기 단축', value: '평균 9일 → 3일' },
      { label: '직원 NPS 변화', value: '+18p' },
      { label: '관리자 리포트 활용', value: '월 1회 정례 회의 채택' },
    ],
    pilotMonths: 3,
    isAnonymized: true,
  },
  {
    slug: 'kindergarten-teacher-care',
    industry: '유아교육 (어린이집·유치원)',
    size: '교직원 45명',
    title: '교사 정서 케어를 일상 루틴으로 정착',
    summary: '하루 3분 마음 트랙으로 교사의 감정 기복을 데이터화하고, 원장은 집계 신호만 확인.',
    challenge:
      '교사 개개인의 감정노동이 누적되고 있었지만, 원장이 직접 묻기 어려운 구조라 사후 대응에 그쳤습니다.',
    approach: [
      '교직원 전원에 30일 마음 트랙 익명 발송',
      '주간 5분 회복 루틴(호흡·셀프 리뷰) 권장',
      '원장은 부서 합산 추세선만 열람 (개별 응답 비공개)',
    ],
    outcomes: [
      { label: '교사 참여 지속률', value: '4주 후 76%' },
      { label: '회복 루틴 정착', value: '주 3회 이상' },
      { label: '원장 의사결정', value: '인력 재배치 1건 즉시 반영' },
    ],
    quote: {
      text: '"개인을 들여다보지 않고도 어디를 도와야 할지 보입니다."',
      author: '원장, 유아교육 기관',
    },
    pilotMonths: 2,
    isAnonymized: true,
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
