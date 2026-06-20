import { Navigate, useParams } from "react-router-dom";

/**
 * Legacy route. The original implementation used Supabase Auth's Phone provider,
 * which is intentionally disabled (we use a self-managed Twilio OTP flow instead
 * via parent-otp-send / parent-otp-verify edge functions). Redirect to the
 * working flow so old SMS links keep working.
 */
export default function GuardianReportView() {
  const { token = "" } = useParams<{ token: string }>();
  if (!token) return <Navigate to="/" replace />;
  return <Navigate to={`/parent-share/${token}`} replace />;
}
