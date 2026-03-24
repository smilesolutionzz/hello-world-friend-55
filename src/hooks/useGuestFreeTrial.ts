import { useState, useCallback } from 'react';

const GUEST_USAGE_KEY = 'aihpro_guest_usage';
const GUEST_MAX_FREE = 2;

interface GuestUsage {
  [featureKey: string]: number;
}

function getStoredUsage(): GuestUsage {
  try {
    const stored = localStorage.getItem(GUEST_USAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function useGuestFreeTrial() {
  const [usage, setUsage] = useState<GuestUsage>(getStoredUsage);

  const getTotalGuestUsage = useCallback((): number => {
    return Object.values(usage).reduce((sum, count) => sum + count, 0);
  }, [usage]);

  const canGuestUseFree = useCallback((): boolean => {
    return getTotalGuestUsage() < GUEST_MAX_FREE;
  }, [getTotalGuestUsage]);

  const getGuestRemaining = useCallback((): number => {
    return Math.max(0, GUEST_MAX_FREE - getTotalGuestUsage());
  }, [getTotalGuestUsage]);

  const recordGuestUsage = useCallback((featureKey: string) => {
    const current = getStoredUsage();
    const key = featureKey.toLowerCase();
    current[key] = (current[key] || 0) + 1;
    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(current));
    setUsage({ ...current });
  }, []);

  return {
    canGuestUseFree,
    getGuestRemaining,
    recordGuestUsage,
    totalUsed: getTotalGuestUsage(),
    maxFree: GUEST_MAX_FREE,
  };
}
