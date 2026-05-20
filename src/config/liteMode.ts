/**
 * LITE_MODE — 부모챌린지 스타일 라이트 버전 플래그
 *
 * Day 1: 복잡한 백과사전식 홈/네비게이션을 숨기고
 * 홈에서 단 하나의 진입점("발달체크 시작하기")만 노출한다.
 *
 * 절대 기존 코드/라우트를 삭제하지 말 것. 이 플래그로 토글만 한다.
 * B2B SaaS에서 재활용할 자산이므로 보존이 원칙.
 */
export const LITE_MODE = true;

/** 홈에서 노출할 단 하나의 진입점 */
export const LITE_PRIMARY_CTA = {
  label: '발달체크 시작하기',
  href: '/mind-track?audience=child',
} as const;
