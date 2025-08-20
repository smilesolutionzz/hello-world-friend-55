import { useState } from 'react';

export type UserRole = 'admin' | 'expert' | 'user' | 'viewer';

export function useUserRole() {
  return {
    loading: false,
    role: 'user' as UserRole,
    userRole: 'user' as UserRole,
    hasRole: (role: UserRole) => false,
    isAdmin: false,
    canWriteExpertNotes: () => false,
    canViewExpertNotes: () => true,
    canInvite: () => false
  };
}