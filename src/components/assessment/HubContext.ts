import { createContext } from 'react';

// 검사 통합 허브 내부에 mount된 페이지가 자체 nav를 숨기도록 신호하는 컨텍스트
export const HubContext = createContext<{ insideHub: boolean }>({ insideHub: false });
