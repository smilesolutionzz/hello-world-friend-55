import { useState, useCallback, useEffect } from 'react';

const TRIAL_PROFILE_KEY = 'aihpro_trial_profile';

export interface TrialProfile {
  nickname: string;
  childAge: number;
  concernKeyword: string;
  createdAt: string;
}

function getStoredProfile(): TrialProfile | null {
  try {
    const stored = localStorage.getItem(TRIAL_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function useTrialProfile() {
  const [profile, setProfile] = useState<TrialProfile | null>(getStoredProfile);

  const saveProfile = useCallback((data: Omit<TrialProfile, 'createdAt'>) => {
    const newProfile: TrialProfile = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(TRIAL_PROFILE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
    return newProfile;
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(TRIAL_PROFILE_KEY);
    setProfile(null);
  }, []);

  const hasProfile = profile !== null;

  return {
    profile,
    hasProfile,
    saveProfile,
    clearProfile,
  };
}
