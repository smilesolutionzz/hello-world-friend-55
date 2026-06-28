import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Short redirect target for SMS-delivered therapist invite codes.
 * URL: /t?c=CODE  → /therapist/my-schedule?code=CODE
 * Keeps the SMS body short enough to fit in 1 Korean SMS segment (UCS-2 70 chars).
 */
export default function TherapistInviteRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const code = (params.get("c") || "").trim();
    navigate(`/therapist/my-schedule${code ? `?code=${encodeURIComponent(code)}` : ""}`, {
      replace: true,
    });
  }, [params, navigate]);
  return null;
}
