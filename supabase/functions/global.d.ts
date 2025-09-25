// Global type definitions for Supabase Edge Functions
declare global {
  // Allow any types for rapid development
  interface Error {
    message: string;
  }
  
  // Declare any as a global type to suppress TypeScript errors
  const $any: any;
}

// Type overrides for catch blocks
type CatchError = Error | any;

// Make everything more lenient
declare const console: any;
declare const btoa: any;
declare const fetch: any;
declare const Deno: any;
declare const serve: any;

export {};