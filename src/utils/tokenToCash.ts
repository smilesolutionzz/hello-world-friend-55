// 토큰을 캐시(원화)로 환산하는 유틸리티
// 1 토큰 = 100원 기준

export const TOKEN_TO_WON_RATE = 100;

export const tokenToCash = (tokens: number): number => {
  return tokens * TOKEN_TO_WON_RATE;
};

export const formatCash = (amount: number): string => {
  return amount.toLocaleString('ko-KR');
};

export const formatTokenAsCash = (tokens: number): string => {
  const cash = tokenToCash(tokens);
  return `${formatCash(cash)}원`;
};

// 캐시를 토큰으로 환산
export const cashToToken = (cash: number): number => {
  return Math.floor(cash / TOKEN_TO_WON_RATE);
};
