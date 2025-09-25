// Global type definitions for Supabase Edge Functions
declare global {
  // Allow any types for rapid development
  interface Error {
    message: string;
  }
}

// Type overrides for catch blocks
type CatchError = Error | any;

export {};