## 변경 사항

`src/pages/MobileHome.tsx` 네비게이션 타일 38번 라인:

- 기존: `{ label: '고민 쓰기', icon: MessageSquareHeart, to: '/ai-copilot', badge: 'HOT', ... }`
- 변경: `to: '/report-generator'` 로 수정 (고민 입력 → AI 분석 리포트 생성 페이지)

코파일럿(`/ai-copilot`) 연결은 끊고, 예전 "고민 쓰면 리포트 나오는" 펀널 랜딩 페이지로 직접 이동시킵니다. 그 외 다른 타일(고민 보관함 등)은 그대로 유지합니다.

## 기술 노트

- 1줄 단순 수정. 라우팅·다른 컴포넌트 영향 없음.
- 코파일럿은 플로팅 버튼(`bottom-[72px]`)으로 계속 접근 가능하므로 별도 보강 불필요.