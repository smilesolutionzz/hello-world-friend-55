export function useReferrals() {
  return {
    loading: false,
    referrals: [],
    generateReferralCode: async () => 'REF123',
    trackReferral: async () => {},
    fetchReferrals: async () => {},
    processReferralReward: async () => {}
  };
}