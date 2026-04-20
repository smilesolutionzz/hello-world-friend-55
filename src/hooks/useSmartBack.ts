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
    // window.history.length 는 같은 탭에서 실제로 navigate 된 횟수가 1 초과여야 의미있음.
    // 새 탭/외부 진입 시 length === 1 (또는 2). state.idx 를 보는 게 더 정확하지만,
    // react-router 의 internal idx는 외부에서 접근하기 어려워 length를 휴리스틱으로 사용.
    const hasHistory = window.history.length > 1 && (window.history.state?.idx ?? 0) > 0;

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
