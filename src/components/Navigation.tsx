import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, Clock, BookOpen, MessageCircle, Info, User, LogOut, Menu, Brain, Users, Shield, FileText, Crown, Coins, Settings, ChevronDown, Plus, History, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTokens } from "@/hooks/useTokens";
import AIPlatformChat from "./AIPlatformChat";

const Navigation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
    try {
      console.log('로그아웃 시작...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('로그아웃 에러:', error);
        throw error;
      }
      console.log('로그아웃 성공');
      setUser(null);
      setProfile(null);
      navigate('/');
    } catch (error) {
      console.error('로그아웃 처리 중 에러:', error);
    }
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
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/faq')}>
              <Info className="w-4 h-4 mr-1" />
              FAQ
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/assessment')}>
              <Clock className="w-4 h-4 mr-1" />
              3분체크
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/assessment-history')}>
              <History className="w-4 h-4 mr-1" />
              검사기록
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:from-yellow-100 hover:to-orange-100" onClick={() => handleNavigation('/premium-assessment')}>
              <Crown className="w-4 h-4 mr-1 text-yellow-600" />
              <span className="text-yellow-700 font-medium">프리미엄검사</span>
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/observation')}>
              <FileText className="w-4 h-4 mr-1" />
              관찰일지
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  상담
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleNavigation('/counseling')}>
                  <Brain className="w-4 h-4 mr-2" />
                  단계별 상담 (AI→전문가)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/ai-counselor')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI 상담만
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  전문가
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleNavigation('/experts')}>
                  <Users className="w-4 h-4 mr-2" />
                  전문가 고용
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/institutions')}>
                  <Users className="w-4 h-4 mr-2" />
                  제휴기관 찾기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2 flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  발달센터
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleNavigation('/autism-screening')}>
                  <Users className="w-4 h-4 mr-2" />
                  AIH 발달특성 선별체크
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/han-medicine-test')}>
                  <Brain className="w-4 h-4 mr-2" />
                  한의학 체질검사
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2" onClick={() => handleNavigation('/family')}>
              <Users className="w-4 h-4 mr-1" />
              가족케어
            </Button>
            <Button variant="ghost" className="btn-ghost whitespace-normal text-center px-2 text-primary font-medium" onClick={() => handleNavigation('/token-subscription')}>
              <Shield className="w-4 h-4 mr-1" />
              구독
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* AI 상담 버튼 */}
            <div className="relative">
              {!isChatOpen ? (
                <Button
                  onClick={() => setIsChatOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 
                           hover:from-purple-600 hover:to-blue-600 text-white border-0
                           hover:shadow-lg transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline">질문 있나요?</span>
                </Button>
              ) : (
                <div className="absolute top-12 right-0 z-50">
                  <div className="relative">
                    <Button
                      onClick={() => setIsChatOpen(false)}
                      variant="outline"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10 bg-white shadow-md rounded-full w-8 h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <AIPlatformChat onClose={() => setIsChatOpen(false)} />
                  </div>
                </div>
              )}
            </div>
            
            {/* 사용자 정보 */}
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
          {/* Sign Up Button - only show if not logged in */}
          {!user && (
            <Button 
              onClick={() => navigate('/auth')}
              variant="ghost"
              size="sm"
              className="text-xs px-3 py-2 h-9 font-medium"
            >
              회원가입
            </Button>
          )}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0 bg-background/95 backdrop-blur-md">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-border/50">
                  <h2 className="text-lg font-bold text-brand-gradient">AIHPRO</h2>
                </div>
                
                {/* Navigation Links */}
                <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/')}
                  >
                    <Home className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">홈</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/assessment')}
                  >
                    <Clock className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">3분 검사</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/assessment-history')}
                  >
                    <History className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">검사 기록</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/premium-assessment')}
                  >
                    <Crown className="mr-3 h-5 w-5 text-yellow-500 shrink-0" />
                    <span className="font-medium">프리미엄 검사</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/observation')}
                  >
                    <BookOpen className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">관찰일지</span>
                  </Button>
                  
                  {/* AI 상담 버튼 - 모바일 햄버거 메뉴 내부 */}
                  <div className="relative">
                    {!isChatOpen ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-12 px-4 rounded-xl 
                                 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 
                                 text-white transition-colors"
                        onClick={() => setIsChatOpen(true)}
                      >
                        <MessageCircle className="mr-3 h-5 w-5 shrink-0" />
                        <span className="font-medium">질문 있나요?</span>
                      </Button>
                    ) : (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="relative">
                          <Button
                            onClick={() => setIsChatOpen(false)}
                            variant="outline"
                            size="icon"
                            className="absolute -top-2 -right-2 z-10 bg-white shadow-md rounded-full w-8 h-8"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <AIPlatformChat onClose={() => setIsChatOpen(false)} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/ai-counselor')}
                  >
                    <MessageCircle className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">AIH 상담사</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/experts')}
                  >
                    <Users className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">전문가고용</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/institutions')}
                  >
                    <Users className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">제휴기관</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/autism-screening')}
                  >
                    <Brain className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">AIH 발달특성 선별체크</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/family')}
                  >
                    <Users className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">가족케어</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/token-subscription')}
                  >
                    <Shield className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">구독플랜</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 px-4 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => handleNavigation('/faq')}
                  >
                    <Info className="mr-3 h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">자주 묻는 질문</span>
                  </Button>
                </div>
                
                {/* User Section */}
                {user && (
                  <div className="border-t border-border/50 p-4 space-y-4 bg-muted/20">
                    {/* Token Balance */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">토큰 잔액</span>
                        <span className="text-xl font-bold text-primary">
                          {tokenLoading ? '...' : tokenBalance?.current_tokens || 0}
                        </span>
                      </div>
                      <Progress value={Math.min(((tokenBalance?.current_tokens || 0) / 50) * 100, 100)} className="h-2 mb-3" />
                      <Button 
                        size="sm" 
                        className="w-full btn-brand h-9"
                        onClick={() => handleNavigation('/token-subscription')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        토큰 충전
                      </Button>
                    </div>
                    
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 bg-card/30 rounded-xl border border-border/20">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {profile?.display_name || user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          사용자
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-10 bg-card/30 border-border/30"
                        onClick={() => handleNavigation('/dashboard')}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        대시보드
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-10 text-red-600 hover:text-red-700 bg-card/30 border-border/30 hover:bg-red-50/50"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        로그아웃
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Login/Register for non-logged in users */}
                {!user && (
                  <div className="border-t border-border/50 p-4 space-y-3 bg-muted/20">
                    <Button 
                      className="w-full btn-brand h-11 text-base font-medium"
                      onClick={() => handleNavigation('/auth')}
                    >
                      로그인
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full h-11 text-base font-medium bg-card/30 border-border/30"
                      onClick={() => handleNavigation('/auth')}
                    >
                      회원가입
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </nav>
  );
};

export default Navigation;