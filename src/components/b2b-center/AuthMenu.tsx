import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AuthMenu() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "로그아웃되었습니다" });
    navigate("/auth");
  };

  if (!email) {
    return (
      <button
        onClick={() => {
          localStorage.setItem("auth_redirect_after", window.location.pathname);
          navigate("/auth");
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800"
      >
        <LogIn className="w-3.5 h-3.5" />
        로그인
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-neutral-600 max-w-[180px] truncate">
        <User className="w-3.5 h-3.5" />
        {email}
      </span>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
      >
        <LogOut className="w-3.5 h-3.5" />
        로그아웃
      </button>
    </div>
  );
}
