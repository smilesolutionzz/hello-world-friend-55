import { supabase } from '@/integrations/supabase/client';

export type AccountType = 'parent' | 'teacher' | 'therapist' | 'admin';

/** Signup-time secondary choice for 전문가·기관 사용자 */
export type ExpertScope = 'center_admin' | 'individual_expert';

const PENDING_ACCOUNT_TYPE_KEY = 'pending_account_type';
const PENDING_EXPERT_SCOPE_KEY = 'pending_expert_scope';
const REDIRECT_KEY = 'auth_redirect_after';

export const persistPendingAccountChoice = (
  accountType: AccountType,
  expertScope?: ExpertScope,
) => {
  try {
    localStorage.setItem(PENDING_ACCOUNT_TYPE_KEY, accountType);
    if (expertScope) {
      localStorage.setItem(PENDING_EXPERT_SCOPE_KEY, expertScope);
    } else {
      localStorage.removeItem(PENDING_EXPERT_SCOPE_KEY);
    }
    // Pre-set the redirect so the auth page can route immediately
    localStorage.setItem(REDIRECT_KEY, defaultRouteFor(accountType, expertScope));
  } catch {}
};

export const readPendingExpertScope = (): ExpertScope | null => {
  try {
    return (localStorage.getItem(PENDING_EXPERT_SCOPE_KEY) as ExpertScope | null) ?? null;
  } catch {
    return null;
  }
};

export const clearPendingAccountChoice = () => {
  try {
    localStorage.removeItem(PENDING_ACCOUNT_TYPE_KEY);
    localStorage.removeItem(PENDING_EXPERT_SCOPE_KEY);
  } catch {}
};

/** Apply any pending account_type choice to the user's profile (post sign-up/sign-in). */
export const applyPendingAccountType = async (userId: string): Promise<AccountType | null> => {
  let pending: AccountType | null = null;
  try {
    pending = (localStorage.getItem(PENDING_ACCOUNT_TYPE_KEY) as AccountType | null) ?? null;
  } catch {}

  if (!pending) return null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('user_id', userId)
      .maybeSingle();

    // Only overwrite when missing or still default 'parent'
    if (!profile?.account_type || profile.account_type === 'parent') {
      await supabase
        .from('profiles')
        .update({ account_type: pending })
        .eq('user_id', userId);
    }
  } catch (err) {
    console.warn('applyPendingAccountType failed', err);
  }

  clearPendingAccountChoice();
  return pending;
};

export const defaultRouteFor = (
  accountType: AccountType | null | undefined,
  expertScope?: ExpertScope | null,
): string => {
  switch (accountType) {
    case 'admin':
      return '/admin';
    case 'therapist':
      return expertScope === 'individual_expert'
        ? '/expert-hiring/manage'
        : '/b2b-center/app';
    case 'teacher':
      return '/b2b-center/app';
    case 'parent':
    default:
      return '/';
  }
};

/** Resolve the user's account_type from profile, then return their default landing route. */
export const resolveLandingRoute = async (userId: string): Promise<string> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('user_id', userId)
      .maybeSingle();

    const scope = readPendingExpertScope();
    return defaultRouteFor((profile?.account_type as AccountType) ?? 'parent', scope);
  } catch {
    return '/';
  }
};
