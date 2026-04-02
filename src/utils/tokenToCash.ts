// 토큰 시스템 폐기 - 하위 호환성을 위한 no-op 유틸리티
export const TOKEN_TO_WON_RATE = 100;
export const tokenToCash = (_tokens: number): number => 0;
export const formatCash = (amount: number): string => amount.toLocaleString('ko-KR');
export const formatTokenAsCash = (_tokens: number): string => '0원';
export const cashToToken = (_cash: number): number => 0;
