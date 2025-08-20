import { useState } from 'react';

export function useTokens() {
  return {
    loading: false,
    balance: { current_tokens: 10, total_purchased: 10, total_used: 0 },
    tokenBalance: { current_tokens: 10, total_purchased: 10, total_used: 0 },
    fetchBalance: async () => {},
    refreshTokenBalance: async () => {},
    consumeTokens: async () => {},
    checkTokenAvailability: (amount: number) => true
  };
}