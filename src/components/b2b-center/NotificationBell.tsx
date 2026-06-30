import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellRing, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  meta: any;
  read_by: string[] | null;
  created_at: string;
};

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationBell({ centerId }: { centerId: string }) {
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
  }, []);

  async function load() {
    const { data } = await supabase
      .from("center_activity_notifications")
      .select("id,type,title,body,link,meta,read_by,created_at")
      .eq("center_id", centerId)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data ?? []) as Notif[]);
  }

  useEffect(() => {
    if (!centerId) return;
    load();
    const ch = supabase
      .channel(`can-${centerId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "center_activity_notifications", filter: `center_id=eq.${centerId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const unread = useMemo(() => {
    if (!uid) return items.length;
    return items.filter((n) => !(n.read_by ?? []).includes(uid)).length;
  }, [items, uid]);

  async function markAll() {
    const ids = items.filter((n) => !uid || !(n.read_by ?? []).includes(uid)).map((n) => n.id);
    if (!ids.length) return;
    await supabase.rpc("mark_center_notifications_read", { _ids: ids });
    load();
  }

  async function clickItem(n: Notif) {
    if (uid && !(n.read_by ?? []).includes(uid)) {
      await supabase.rpc("mark_center_notifications_read", { _ids: [n.id] });
    }
    setOpen(false);
    if (n.link) nav(n.link);
    load();
  }

  return (
    <div className="relative" ref={popRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
        aria-label="알림"
        title="알림"
      >
        {unread > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold inline-flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[360px] sm:max-w-[360px] max-h-[70vh] sm:max-h-[480px] bg-white rounded-xl border border-neutral-200 shadow-xl z-[70] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">알림</p>
              {unread > 0 && <span className="text-[11px] text-rose-600">● {unread}</span>}
            </div>
            <button onClick={markAll} className="text-[11px] text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> 모두 읽음
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {items.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-10">새로운 알림이 없어요.</p>
            ) : items.map((n) => {
              const isRead = uid ? (n.read_by ?? []).includes(uid) : true;
              const tone = n.type === "session_cancelled" || n.type === "session_deleted"
                ? "border-l-rose-400"
                : n.type === "session_updated" ? "border-l-amber-400" : "border-l-emerald-400";
              return (
                <button
                  key={n.id}
                  onClick={() => clickItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 border-l-2 ${tone} ${isRead ? "opacity-60" : "bg-white"}`}
                >
                  <p className="text-[12px] font-semibold text-neutral-900 truncate">{n.title}</p>
                  <p className="text-[12px] text-neutral-700 mt-0.5 break-keep">{n.body}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">{timeAgo(n.created_at)}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
