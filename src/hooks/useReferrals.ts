export function useReferrals() {
  return {
    loading: false,
    referrals: [],
    generateReferralCode: async () => 'REF123',
    trackReferral: async (code?: any) => {},
    fetchReferrals: async () => {},
    processReferralReward: async (code?: any) => {}
  };
}