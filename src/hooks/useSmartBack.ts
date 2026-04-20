import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * 직접 진입(외부링크/새탭/공유링크)으로 history 스택이 비어있을 때
 * navigate(-1) 이 의미없이 메인('/')으로 가버리는 문제를 해결하는 훅.
 *
 * - history가 있으면: 정상적으로 뒤로가기
 * - history가 없으면: fallback 경로로 이동 (현재 경로의 부모 경로 자동 추정 또는 명시 fallback)
 *
 * 사용 예:
 *   const goBack = useSmartBack("/mind-track");
 *   <Button onClick={goBack}>뒤로</Button>
 */
export function useSmartBack(fallback?: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    // 같은 출처(same-origin)에서 진입한 경우에만 navigate(-1)이 의미있음
    const sameOriginReferrer =
      typeof document !== 'undefined' &&
      document.referrer &&
      (() => {
        try {
          return new URL(document.referrer).origin === window.location.origin;
        } catch {
          return false;
        }
      })();

    const idx = (window.history.state?.idx ?? 0) as number;
    const hasHistory = idx > 0 || (window.history.length > 1 && sameOriginReferrer);

    if (hasHistory) {
      navigate(-1);
      return;
    }

    // fallback 명시 안되면 현재 경로의 부모로 이동
    if (fallback) {
      navigate(fallback);
      return;
    }

    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    if (segments.length <= 1) {
      navigate("/");
    } else {
      segments.pop();
      navigate("/" + segments.join("/"));
    }
  }, [navigate, location.pathname, fallback]);
}
