import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Vite define 으로 주입되는 빌드 버전 (빌드 시각의 ms)
declare const __APP_VERSION__: string;
const CURRENT_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

const POLL_MS = 60_000; // 1분마다 새 배포 확인
const TOAST_ID = "aihpro-app-update";

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      credentials: "omit",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { version?: string };
    return json.version ?? null;
  } catch {
    return null;
  }
}

async function hardReload() {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !/messaging|firebase|onesignal/i.test(k))
          .map((k) => caches.delete(k).catch(() => false)),
      );
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs.map((r) =>
          r.waiting?.postMessage({ type: "SKIP_WAITING" }),
        ),
      );
    }
  } catch {
    /* noop */
  }
  // 캐시 우회 새로고침
  const url = new URL(window.location.href);
  url.searchParams.set("_v", String(Date.now()));
  window.location.replace(url.toString());
}

function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  const displayMode = window.matchMedia?.("(display-mode: standalone)").matches;
  // iOS Safari
  const iosStandalone = (window.navigator as any).standalone === true;
  return Boolean(displayMode || iosStandalone);
}

export const VersionUpdateWatcher = () => {
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (CURRENT_VERSION === "dev") return; // 개발 모드에서는 비활성

    let cancelled = false;

    const check = async () => {
      const latest = await fetchLatestVersion();
      if (!latest || cancelled) return;
      if (latest !== CURRENT_VERSION && !notifiedRef.current) {
        notifiedRef.current = true;
        const pwa = isStandalonePWA();
        toast(
          pwa
            ? "새 버전이 있어요. 홈 화면 앱을 완전히 종료 후 다시 열어주세요."
            : "새 버전이 준비되었어요. 새로고침이 필요해요.",
          {
            id: TOAST_ID,
            duration: Infinity,
            description: pwa
              ? "‘지금 업데이트’를 누르면 캐시를 지우고 새로 불러옵니다."
              : "‘지금 업데이트’를 누르면 최신 화면으로 즉시 전환됩니다.",
            action: {
              label: "지금 업데이트",
              onClick: () => {
                void hardReload();
              },
            },
          },
        );
      }
    };

    // 초기 1회 + 주기 폴링 + 탭 포커스 복귀 시 확인
    void check();
    const timer = window.setInterval(check, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return null;
};

export default VersionUpdateWatcher;
