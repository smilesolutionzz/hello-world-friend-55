// Shared types for edge functions
export type SafeError = {
  message: string;
  code?: string;
  details?: any;
}

export function toSafeError(error: unknown): SafeError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
      details: error.stack
    };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  return { message: 'Unknown error occurred' };
}

// Common response helpers
export function createErrorResponse(error: unknown, status = 500, corsHeaders: Record<string, string> = {}) {
  const safeError = toSafeError(error);
  return new Response(
    JSON.stringify({ error: safeError.message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}