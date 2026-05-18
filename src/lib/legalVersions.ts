/**
 * 법무/고지 문서 버전 관리.
 * 모든 /legal/* 페이지는 여기서 단일 출처로 버전과 수정일을 읽습니다.
 * 약관 본문이 변경되면 반드시 version + lastUpdated를 올려 동의 이력과
 * 푸터/온보딩 노출이 일관되게 갱신되도록 합니다.
 */
export type LegalDoc =
  | "terms"
  | "privacy"
  | "refund"
  | "crisis"
  | "medical-disclaimer";

export interface LegalVersion {
  version: string; // semver-like
  lastUpdated: string; // YYYY-MM-DD
  title: string;
  path: string; // canonical /legal/* path
  legacyPaths?: string[];
}

export const LEGAL_VERSIONS: Record<LegalDoc, LegalVersion> = {
  terms: {
    version: "2026.05.1",
    lastUpdated: "2026-05-18",
    title: "서비스 이용약관",
    path: "/legal/terms",
    legacyPaths: ["/terms-of-service", "/terms"],
  },
  privacy: {
    version: "2026.05.1",
    lastUpdated: "2026-05-18",
    title: "개인정보처리방침",
    path: "/legal/privacy",
    legacyPaths: ["/privacy-policy", "/privacy"],
  },
  refund: {
    version: "2026.05.1",
    lastUpdated: "2026-05-18",
    title: "환불 정책",
    path: "/legal/refund",
    legacyPaths: ["/refund-policy", "/refund"],
  },
  crisis: {
    version: "2026.05.1",
    lastUpdated: "2026-05-18",
    title: "위기 대응 안내",
    path: "/legal/crisis",
  },
  "medical-disclaimer": {
    version: "2026.05.1",
    lastUpdated: "2026-05-18",
    title: "의료 비면책 고지",
    path: "/legal/medical-disclaimer",
  },
};

export const LEGAL_DOCS_LIST: LegalDoc[] = [
  "terms",
  "privacy",
  "refund",
  "crisis",
  "medical-disclaimer",
];
