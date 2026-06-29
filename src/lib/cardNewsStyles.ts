// 카드뉴스 스타일 프리셋. 모든 스타일은 1:1 정방형 카드 기준.
// 배경이미지(bg)는 카드별로 덮어쓸 수 있다.

export type CardNewsStyleKey =
  | "gold-dark"
  | "ivory-serif"
  | "soft-pastel"
  | "magazine-bw"
  | "photo-overlay"
  | "rounded-poster"
  | "minimal-border";

export interface CardStyleSpec {
  key: CardNewsStyleKey;
  label: string;
  description: string;
  /** 배경 이미지 권장 여부 */
  recommendsBg: boolean;
  /** 미리보기 썸네일 배경 (CSS) — 선택 UI에서 사용 */
  thumb: string;
}

export const CARD_STYLES: CardStyleSpec[] = [
  {
    key: "gold-dark",
    label: "골드 다크",
    description: "딥 네이비 + 골드 포인트. 신뢰·전문성 톤",
    recommendsBg: false,
    thumb: "linear-gradient(160deg,#0F172A 0%,#1F2937 100%)",
  },
  {
    key: "ivory-serif",
    label: "아이보리 세리프",
    description: "따뜻한 베이지에 세리프 헤드라인",
    recommendsBg: false,
    thumb: "linear-gradient(160deg,#FAF6EE 0%,#EFE6D2 100%)",
  },
  {
    key: "soft-pastel",
    label: "소프트 파스텔",
    description: "부드러운 파스텔 그라데이션",
    recommendsBg: false,
    thumb: "linear-gradient(160deg,#FCE7F3 0%,#DBEAFE 100%)",
  },
  {
    key: "magazine-bw",
    label: "매거진 블랙",
    description: "잡지 표지처럼 강한 블랙 + 사진",
    recommendsBg: true,
    thumb: "linear-gradient(160deg,#111 0%,#333 100%)",
  },
  {
    key: "photo-overlay",
    label: "포토 오버레이",
    description: "사진 위에 글래스 모프 오버레이",
    recommendsBg: true,
    thumb:
      "linear-gradient(160deg,#94a3b8 0%,#475569 100%)",
  },
  {
    key: "rounded-poster",
    label: "라운드 포스터",
    description: "큰 라운드와 컬러 블록",
    recommendsBg: false,
    thumb: "linear-gradient(160deg,#FDE68A 0%,#F59E0B 100%)",
  },
  {
    key: "minimal-border",
    label: "미니멀 보더",
    description: "흰 배경 + 얇은 보더, 카피 중심",
    recommendsBg: false,
    thumb: "linear-gradient(160deg,#ffffff 0%,#f8fafc 100%)",
  },
];

export interface RenderTokens {
  c1: string; // 포인트
  c2: string; // 서브
  bg1: string; // 딥 배경
  fg: string; // 텍스트
  logoText: string;
  centerName: string;
}
