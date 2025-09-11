import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User as UserIcon, Gift, Phone } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';
import { OnboardingOverlay } from '@/components/ui/onboarding-overlay';
import { SocialLoginButtons } from '@/components/social/SocialLoginButtons';

export const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // 로그인 폼 데이터
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // 회원가입 폼 데이터 (간소화)
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    referralCode: ''
  });

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // localStorage에서 추천 코드 확인하여 폼에 자동 입력
    const storedReferralCode = localStorage.getItem('referralCode');
    if (storedReferralCode) {
      setSignUpData(prev => ({ ...prev, referralCode: storedReferralCode }));
    }

    // 인증 상태 리스너 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('📱 Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ 로그인 성공:', session.user.email);
          navigate('/');
        }
      }
    );

    // 기존 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 초기 세션 확인:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 기본 유효성 검사
    if (!signUpData.name.trim()) {
      setError('이름을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!signUpData.phone.trim()) {
      setError('전화번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!signUpData.email.trim()) {
      setError('이메일을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!signUpData.password || signUpData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email.trim(),
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: signUpData.name.trim(),
            phone: signUpData.phone.trim(),
            referral_code: signUpData.referralCode.trim()
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast({
          title: "회원가입 완료",
          description: "이메일을 확인하여 계정을 활성화해주세요.",
        });
      } else if (data.session) {
        // 추천 코드가 있는 경우 추가 토큰 안내
        const bonusMessage = signUpData.referralCode ? "추천 보너스 2토큰 포함!" : "";
        toast({
          title: "회원가입 완료", 
          description: `환영합니다! 15토큰이 지급되었습니다. ${bonusMessage}`,
        });
        // 신규 가입자에게 온보딩 표시
        setShowOnboarding(true);
        // 추천 코드 localStorage에서 제거
        localStorage.removeItem('referralCode');
      }

    } catch (error: any) {
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      console.error('📱 회원가입 에러:', error);
      
      if (error.message?.includes('User already registered')) {
        errorMessage = '이미 등록된 이메일입니다.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = '비밀번호는 6자 이상이어야 합니다.';
      }
      
      setError(errorMessage);
      toast({
        title: "회원가입 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!signInData.email.trim() || !signInData.password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      console.log('📱 로그인 시도:', signInData.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email.trim(),
        password: signInData.password,
      });

      if (error) throw error;

      console.log('📱 로그인 성공:', data.user?.email);
      toast({
        title: "로그인 성공",
        description: "HIGHLIGHT에 오신 것을 환영합니다!",
      });
      
    } catch (error: any) {
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      console.error('📱 로그인 에러:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 잘못되었습니다.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
      }
      
      setError(errorMessage);
      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 safe-area-pb">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              HIGHLIGHT
            </CardTitle>
            <CardDescription className="space-y-2">
              <span className="block">3분 만에 완성하는 심리 검사 플랫폼</span>
              <div className="bg-primary/10 rounded-lg p-3 text-sm">
                <span className="font-semibold text-primary">💡 알고계셨나요?</span>
                <br />
                <span className="text-muted-foreground">
                  회원가입 없이도 <strong>무료 체험</strong>이 가능합니다!
                </span>
                <br />
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => navigate('/free-trial')}
                  className="text-primary underline p-0 h-auto mt-1"
                >
                  → 무료 체험 바로가기
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <div className="space-y-4">
                  <SocialLoginButtons isLoading={loading} setIsLoading={setLoading} />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        또는 이메일로
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    {error && (
                      <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">이메일 ID</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={signInData.email}
                          onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={signInData.password}
                          onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10"
                          required
                          autoComplete="current-password"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      로그인
                    </Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  <SocialLoginButtons isLoading={loading} setIsLoading={setLoading} />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        또는 이메일로
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    {error && (
                      <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="display-name">이름 *</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="display-name"
                          type="text"
                          placeholder="홍길동"
                          value={signUpData.name}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                          className="pl-10"
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">전화번호 *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="010-1234-5678"
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                          required
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">이메일 ID *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">비밀번호 *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">비밀번호 확인 *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                      {signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword && (
                        <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다.</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="referral-code">추천인 코드 (선택)</Label>
                      <div className="relative">
                        <Gift className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="referral-code"
                          type="text"
                          placeholder="추천인 코드 입력"
                          value={signUpData.referralCode}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                          className="pl-10 uppercase"
                          maxLength={6}
                        />
                      </div>
                      {signUpData.referralCode && (
                        <p className="text-xs text-secondary flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          추천인에게 3토큰, 회원가입자에게 2토큰이 지급됩니다!
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                      💡 추가 정보는 나중에 프로필에서 설정할 수 있어요!
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      회원가입
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* 온보딩 오버레이 */}
      <OnboardingOverlay
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          navigate('/');
        }}
      />
    </>
  );
};