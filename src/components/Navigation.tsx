import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, Clock, BookOpen, MessageCircle, Info, User, LogOut, Menu, Brain, Users, Shield, FileText, Crown, Coins, Settings, ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTokens } from "@/hooks/useTokens";

const Navigation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { tokenBalance, loading: tokenLoading } = useTokens();

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

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="flex items-center justify-between w-full max-w-full min-w-0 px-4 sm:px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-border">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-brand-gradient">AIHPRO</span>
        </div>
      </div>

      {/* Desktop Navigation */}
      {!isMobile && (
        <>
          <div className="flex items-center flex-wrap gap-1 min-w-0">
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/')}>
              <Home className="w-4 h-4 mr-1" />
              홈
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/assessment')}>
              <Clock className="w-4 h-4 mr-1" />
              3분체크
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:from-yellow-100 hover:to-orange-100" onClick={() => handleNavigation('/premium-assessment')}>
              <Crown className="w-4 h-4 mr-1 text-yellow-600" />
              <span className="text-yellow-700 font-medium">프리미엄검사</span>
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/observation')}>
              <FileText className="w-4 h-4 mr-1" />
              관찰일지
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/ai-counselor')}>
              <MessageCircle className="w-4 h-4 mr-1" />
              AI상담
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/metaverse')}>
              <Brain className="w-4 h-4 mr-1" />
              메타버스
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/family')}>
              <Users className="w-4 h-4 mr-1" />
              가족케어
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2 text-primary font-medium" onClick={() => handleNavigation('/token-subscription')}>
              <Shield className="w-4 h-4 mr-1" />
              구독
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {profile?.display_name || user.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4">
                      <div className="text-sm font-medium mb-1">
                        {profile?.display_name || user.email?.split('@')[0] || 'User'}'s AIHPRO
                      </div>
                      
                      {/* 토큰 정보 */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Coins className="w-4 h-4 text-primary" />
                            토큰
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {tokenLoading ? '...' : `${tokenBalance?.current_tokens || 0}개 남음`}
                          </span>
                        </div>
                        
                        {!tokenLoading && tokenBalance && (
                          <div className="space-y-2">
                            <Progress 
                              value={Math.min((tokenBalance.current_tokens / 50) * 100, 100)} 
                              className="h-2" 
                            />
                            <div className="flex items-center text-xs text-muted-foreground">
                              <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                              월간 토큰 사용 중
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate('/token-subscription')}>
                      <Plus className="w-4 h-4 mr-2" />
                      토큰 충전하기
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="w-4 h-4 mr-2" />
                      대시보드
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
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
        </>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="flex items-center gap-2">
          {!user && (
            <Button size="sm" onClick={() => navigate('/auth')}>
              시작하기
            </Button>
          )}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 text-xl font-bold mb-4">
                  <span className="text-brand-gradient">AIHPRO</span>
                </div>
                
                <Button variant="ghost" className="justify-start" onClick={() => handleNavigation('/')}>
                  <Home className="w-4 h-4 mr-3" />
                  홈
                </Button>
                
                <Button variant="ghost" className="justify-start" onClick={() => handleNavigation('/assessment')}>
                  <Clock className="w-4 h-4 mr-3" />
                  3분 체크
                </Button>
                
                <Button variant="ghost" className="justify-start bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:from-yellow-100 hover:to-orange-100" onClick={() => handleNavigation('/premium-assessment')}>
                  <Crown className="w-4 h-4 mr-3 text-yellow-600" />
                  <span className="text-yellow-700 font-medium">프리미엄 검사</span>
                </Button>
                
                <Button variant="ghost" className="justify-start" onClick={() => handleNavigation('/observation')}>
                  <FileText className="w-4 h-4 mr-3" />
                  관찰일지
                </Button>
                
                <Button variant="ghost" className="justify-start" onClick={() => handleNavigation('/ai-counselor')}>
                  <MessageCircle className="w-4 h-4 mr-3" />
                  AI상담사
                </Button>
                
                <Button variant="ghost" className="justify-start" onClick={() => handleNavigation('/metaverse')}>
                  <Brain className="w-4 h-4 mr-3" />
                  메타버스치료
                </Button>
                
                <Button variant="ghost" className="justify-start" onClick={() => handleNavigation('/family')}>
                  <Users className="w-4 h-4 mr-3" />
                  가족케어
                </Button>
                
                
                <Button variant="ghost" className="justify-start text-primary font-medium" onClick={() => handleNavigation('/token-subscription')}>
                  <Shield className="w-4 h-4 mr-3" />
                  구독 플랜
                </Button>
                
                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      {/* 모바일 토큰 정보 */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Coins className="w-4 h-4 text-primary" />
                          토큰 잔액
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">보유 토큰</span>
                          <Badge variant="secondary">
                            {tokenLoading ? '...' : `${tokenBalance?.current_tokens || 0}개`}
                          </Badge>
                        </div>
                        {!tokenLoading && tokenBalance && (
                          <Progress 
                            value={Math.min((tokenBalance.current_tokens / 50) * 100, 100)} 
                            className="h-2 mb-2" 
                          />
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => handleNavigation('/token-subscription')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          토큰 충전
                        </Button>
                      </div>
                      
                      <div 
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleNavigation('/dashboard')}
                      >
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          {profile?.display_name || user.email}
                        </span>
                      </div>
                      <Button variant="ghost" onClick={handleLogout} className="justify-start">
                        <LogOut className="w-4 h-4 mr-3" />
                        로그아웃
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button variant="outline" onClick={() => handleNavigation('/auth')}>
                        로그인
                      </Button>
                      <Button onClick={() => handleNavigation('/auth')}>
                        회원가입
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </nav>
  );
};

export default Navigation;