import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Clock, BookOpen, MessageCircle, Info, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Check current auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        // Load user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        setProfile(profileData);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          // Load profile when user logs in
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-border">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>
          <Sparkles className="w-8 h-8 text-primary" />
          <span className="text-brand-gradient">AI 심리케어</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-1">
        <Button variant="ghost" className="btn-ghost" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2" />
          홈
        </Button>
        <Button variant="ghost" className="btn-ghost" onClick={() => navigate('/assessment')}>
          <Clock className="w-4 h-4 mr-2" />
          3분 검사
        </Button>
        <Button variant="ghost" className="btn-ghost" onClick={() => navigate('/ai-counselor')}>
          <MessageCircle className="w-4 h-4 mr-2" />
          AI상담사
        </Button>
        {user && (
          <Button variant="ghost" className="btn-ghost" onClick={() => navigate('/dashboard')}>
            <BookOpen className="w-4 h-4 mr-2" />
            내 계정
          </Button>
        )}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-2">
        {user ? (
          // Logged in state
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {profile?.display_name || user.email}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              대시보드
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          // Not logged in state
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              로그인
            </Button>
            <Button onClick={() => navigate('/auth')}>
              시작하기
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;