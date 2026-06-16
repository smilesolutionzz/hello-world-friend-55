import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User as UserIcon, Gift, Phone, ArrowLeft } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';
import { OnboardingOverlay } from '@/components/ui/onboarding-overlay';
import { SocialLoginButtons } from '@/components/social/SocialLoginButtons';
import { AihproLogoMark } from '@/components/brand/AihproLogoMark';
import {
  persistPendingAccountChoice,
  type AccountType,
  type ExpertScope,
} from '@/lib/accountTypeRouting';
import { Users, Briefcase, Building2, UserCog } from 'lucide-react';


export const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [checkingNickname, setCheckingNickname] = useState(false);
  
  // 로그인 폼 데이터
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // 회원가입 폼 데이터 (간소화)
  const [signUpData, setSignUpData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    referralCode: ''
  });

  // 가입 경로 선택 — B2B(기관용)를 기본으로 노출, 개인용은 보조
  const [accountType, setAccountType] = useState<AccountType>('therapist');
  // 전문가·기관 선택 시 세부 경로 (B2B 센터 운영자 vs 개인 전문가)
  const [expertScope, setExpertScope] = useState<ExpertScope>('center_admin');


  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Input field refs for scrolling
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const signupEmailRef = useRef<HTMLInputElement>(null);

  // Scroll to input field when focused on mobile
  const scrollToInput = (element: HTMLElement | null) => {
    if (!element) return;
    
    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 300); // Delay to wait for keyboard to appear
  };

  useEffect(() => {
    // localStorage에서 추천 코드 확인하여 폼에 자동 입력
    const storedReferralCode = localStorage.getItem('referralCode');
    if (storedReferralCode) {
      setSignUpData(prev => ({ ...prev, referralCode: storedReferralCode }));
    }

    // 인증 상태 리스너 — 세션만 갱신하고, 라우팅은 HighlightAuth가 account_type 기반으로 처리
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('📱 Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 초기 세션 확인:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);


  // 전화번호 중복 체크 (실시간) - RPC 함수 사용
  const checkPhoneAvailability = async (phone: string) => {
    if (!phone.trim() || phone.trim().length < 10) {
      setPhoneError('');
      return;
    }

    setCheckingPhone(true);
    
    try {
      const { data: isAvailable, error } = await supabase
        .rpc('check_phone_availability', { phone_number: phone.trim() });

      if (error) {
        console.error('Phone check error:', error);
        setPhoneError('');
        return;
      }

      if (isAvailable === false) {
        setPhoneError('이미 사용 중인 전화번호입니다. 기존 계정으로 로그인해주세요.');
      } else {
        setPhoneError('');
      }
    } catch (err) {
      console.error('Phone check error:', err);
    } finally {
      setCheckingPhone(false);
    }
  };

  // 이메일 중복 체크 (실시간) - RPC 함수 사용
  const checkEmailAvailability = async (email: string) => {
    if (!email.trim() || !email.includes('@')) {
      setEmailError('');
      return;
    }

    setCheckingEmail(true);
    
    try {
      const { data: isAvailable, error } = await supabase
        .rpc('check_email_availability', { check_email: email.trim() });

      if (error) {
        console.error('Email check error:', error);
        setEmailError('');
        return;
      }

      if (isAvailable === false) {
        setEmailError('이미 등록된 이메일입니다. 기존 계정으로 로그인해주세요.');
      } else {
        setEmailError('');
      }
    } catch (err) {
      console.error('Email check error:', err);
    } finally {
      setCheckingEmail(false);
    }
  };

  // 닉네임 중복 체크 (실시간) - RPC 함수 사용
  const checkNicknameAvailability = async (nickname: string) => {
    if (!nickname.trim() || nickname.trim().length < 2) {
      setNicknameError('');
      return;
    }

    setCheckingNickname(true);
    
    try {
      const { data: isAvailable, error } = await supabase
        .rpc('check_nickname_availability', { nickname: nickname.trim() });

      if (error) {
        console.error('Nickname check error:', error);
        setNicknameError('');
        return;
      }

      if (isAvailable === false) {
        setNicknameError('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      } else {
        setNicknameError('');
      }
    } catch (err) {
      console.error('Nickname check error:', err);
    } finally {
      setCheckingNickname(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 전화번호 또는 이메일 중복 에러가 있으면 진행 중단
    if (phoneError) {
      setError(phoneError);
      setLoading(false);
      return;
    }

    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    if (nicknameError) {
      setError(nicknameError);
      setLoading(false);
      return;
    }

    // 기본 유효성 검사
    if (!signUpData.nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (signUpData.nickname.trim().length < 2) {
      setError('닉네임은 2자 이상이어야 합니다.');
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

    // 전화번호 중복 체크 (가입 전에 미리 확인) - RPC 함수 사용
    const cleanPhone = signUpData.phone.trim().replace(/-/g, '');
    const { data: isPhoneAvailable } = await supabase
      .rpc('check_phone_availability', { phone_number: signUpData.phone.trim() });

    if (isPhoneAvailable === false) {
      setError('이미 사용 중인 전화번호입니다. 다른 번호를 사용하거나, 기존 계정으로 로그인해주세요.');
      setPhoneError('이미 사용 중인 전화번호입니다.');
      setLoading(false);
      toast({
        title: "전화번호 중복",
        description: "이미 사용 중인 전화번호입니다.",
        variant: "destructive",
      });
      return;
    }

    // 이메일 중복 체크 (가입 전에 미리 확인) - RPC 함수 사용
    const { data: isEmailAvailable } = await supabase
      .rpc('check_email_availability', { check_email: signUpData.email.trim() });

    if (isEmailAvailable === false) {
      setError('이미 등록된 이메일입니다. 기존 계정으로 로그인해주세요.');
      setEmailError('이미 등록된 이메일입니다.');
      setLoading(false);
      toast({
        title: "이메일 중복",
        description: "이미 등록된 이메일입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;

      // 가입 경로 선택을 로컬에 저장 (이메일 확인 후 첫 로그인 시 프로필에 반영)
      persistPendingAccountChoice(
        accountType,
        accountType === 'therapist' ? expertScope : undefined,
      );

      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email.trim(),
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: signUpData.nickname.trim(),
            phone: cleanPhone,  // 하이픈 제거된 전화번호 사용
            referral_code: signUpData.referralCode.trim(),
            account_type: accountType,
            expert_scope: accountType === 'therapist' ? expertScope : null,
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
        // 신규 가입자 프로필에 account_type 즉시 반영
        try {
          await supabase
            .from('profiles')
            .update({ account_type: accountType })
            .eq('user_id', data.user!.id);
        } catch (e) {
          console.warn('프로필 account_type 업데이트 실패', e);
        }

        const bonusMessage = signUpData.referralCode ? "추천 보너스 2토큰 포함!" : "";
        toast({
          title: "회원가입 완료",
          description: `환영합니다! 검사 이용권 2개가 지급되었습니다. ${bonusMessage}`,
        });
        // 신규 가입자에게만 온보딩 표시 (한 번만) — 학부모만
        const userOnboardingKey = `hasSeenOnboarding_${data.user?.id}`;
        if (accountType === 'parent' && !localStorage.getItem(userOnboardingKey)) {
          setShowOnboarding(true);
        }
        // 추천 코드 localStorage에서 제거
        localStorage.removeItem('referralCode');
      }


    } catch (error: any) {
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      console.error('📱 회원가입 에러:', error);
      
      // 에러 메시지 파싱
      const errorMsg = error.message || '';
      
      if (errorMsg.includes('User already registered')) {
        errorMessage = '이미 등록된 이메일입니다.';
      } else if (errorMsg.includes('PHONE_ALREADY_EXISTS') || errorMsg.includes('이미 사용 중인 전화번호')) {
        errorMessage = '이미 사용 중인 전화번호입니다. 다른 번호를 사용해주세요.';
      } else if (errorMsg.includes('Invalid email')) {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (errorMsg.includes('Password should be')) {
        errorMessage = '비밀번호는 6자 이상이어야 합니다.';
      } else if (errorMsg.includes('Database error')) {
        errorMessage = '데이터베이스 오류가 발생했습니다. 입력하신 정보를 확인해주세요.';
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
        description: "AIHPRO에 오신 것을 환영합니다!",
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setForgotSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setError('올바른 이메일 형식이 아닙니다.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setForgotSuccess('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
        toast({
          title: "이메일 전송 완료",
          description: "비밀번호 재설정 링크가 발송되었습니다.",
        });
      }
    } catch (err) {
      setError('비밀번호 재설정 요청 중 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 safe-area-pb relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md mx-auto relative z-10">
          {/* 뒤로가기 버튼 */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              홈으로
            </Button>
          </div>

          {/* 로고 헤더 */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AihproLogoMark className="w-20 h-20" />
            </div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              AIHPRO
            </h1>
            <p className="text-sm text-muted-foreground mt-1">AI 심리발달 검사 플랫폼</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            {/* 탭 네비게이션 */}
            <TabsList className="grid w-full grid-cols-2 h-14 bg-card/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg border border-border/50 mb-4">
              <TabsTrigger 
                value="signin" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground h-full text-base font-medium transition-all duration-300"
              >
                로그인
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:text-muted-foreground h-full text-base font-medium transition-all duration-300"
              >
                회원가입
              </TabsTrigger>
            </TabsList>
            
            <Card className="border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="pt-8 pb-6 px-6">
                {/* 로그인 탭 */}
                <TabsContent value="signin" className="mt-0 space-y-5">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {error && (
                      <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                        {error}
                      </div>
                    )}
                    
                    {/* 이메일 입력 */}
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        ref={emailRef}
                        id="email"
                        type="email"
                        placeholder="이메일"
                        value={signInData.email}
                        onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                        onFocus={(e) => scrollToInput(e.currentTarget)}
                        className="h-14 pl-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                        autoComplete="email"
                      />
                    </div>

                    {/* 비밀번호 입력 */}
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        ref={passwordRef}
                        id="password"
                        type="password"
                        placeholder="비밀번호"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        onFocus={(e) => scrollToInput(e.currentTarget)}
                        className="h-14 pl-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      로그인
                    </Button>
                  </form>

                  {/* 구분선 */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-muted-foreground">또는</span>
                    </div>
                  </div>

                  {/* 소셜 로그인 */}
                  <SocialLoginButtons isLoading={loading} setIsLoading={setLoading} />
                  
                  {/* 비밀번호 찾기 링크 */}
                  <div className="text-center pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-sm text-muted-foreground hover:text-primary hover:bg-primary/5"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      비밀번호를 잊으셨나요?
                    </Button>
                  </div>
                </TabsContent>
                
                {/* 회원가입 탭 */}
                <TabsContent value="signup" className="mt-0 space-y-4">
                  {/* 가입 경로 선택 — B2B(기관용) 우선 노출 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground/80 px-1">
                      어떤 사용자로 가입하시나요?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAccountType('therapist')}
                        className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
                          accountType === 'therapist'
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border/60 bg-background/40 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold">기관용</span>
                          <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            추천
                          </span>
                        </div>
                        <span className="text-[11px] leading-snug text-muted-foreground">
                          센터·전문가 · B2B 대시보드 즉시 사용
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType('parent')}
                        className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
                          accountType === 'parent'
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border/60 bg-background/40 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold">개인용</span>
                        </div>
                        <span className="text-[11px] leading-snug text-muted-foreground">
                          학부모·일반 · 자가검사 · 마인드 트랙
                        </span>
                      </button>
                    </div>


                    {accountType === 'therapist' && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setExpertScope('center_admin')}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                            expertScope === 'center_admin'
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-border/60 bg-background/40 hover:border-primary/40'
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">센터 운영자</span>
                            <span className="text-[10px] text-muted-foreground">B2B 콘솔</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpertScope('individual_expert')}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                            expertScope === 'individual_expert'
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-border/60 bg-background/40 hover:border-primary/40'
                          }`}
                        >
                          <UserCog className="w-4 h-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">개인 전문가</span>
                            <span className="text-[10px] text-muted-foreground">매칭 관리</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-3">

                    {error && (
                      <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                        {error}
                      </div>
                    )}
                    
                    {/* 닉네임 입력 */}
                    <div className="space-y-1">
                      <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="display-name"
                          type="text"
                          placeholder="닉네임 (2자 이상)"
                          value={signUpData.nickname}
                          onChange={(e) => {
                            setSignUpData(prev => ({ ...prev, nickname: e.target.value }));
                            if (nicknameError) setNicknameError('');
                          }}
                          onBlur={(e) => checkNicknameAvailability(e.target.value)}
                          onFocus={(e) => scrollToInput(e.currentTarget)}
                          className={`h-13 pl-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all ${nicknameError ? 'border-destructive' : ''}`}
                          required
                          autoComplete="nickname"
                        />
                        {checkingNickname && (
                          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      {nicknameError && (
                        <p className="text-xs text-destructive pl-4">{nicknameError}</p>
                      )}
                    </div>
                    
                    {/* 전화번호 입력 */}
                    <div className="space-y-1">
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="전화번호"
                          value={signUpData.phone}
                          onChange={(e) => {
                            setSignUpData(prev => ({ ...prev, phone: e.target.value }));
                            if (phoneError) setPhoneError('');
                          }}
                          onBlur={(e) => checkPhoneAvailability(e.target.value)}
                          onFocus={(e) => scrollToInput(e.currentTarget)}
                          className={`h-13 pl-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all ${phoneError ? 'border-destructive focus:border-destructive' : ''}`}
                          required
                          autoComplete="tel"
                        />
                      </div>
                      {phoneError && (
                        <p className="text-xs text-destructive px-1 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-destructive" />
                          {phoneError}
                        </p>
                      )}
                    </div>
                    
                    {/* 이메일 입력 */}
                    <div className="space-y-1">
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          ref={signupEmailRef}
                          id="signup-email"
                          type="email"
                          placeholder="이메일"
                          value={signUpData.email}
                          onChange={(e) => {
                            setSignUpData(prev => ({ ...prev, email: e.target.value }));
                            if (emailError) setEmailError('');
                          }}
                          onBlur={(e) => checkEmailAvailability(e.target.value)}
                          onFocus={(e) => scrollToInput(e.currentTarget)}
                          className={`h-13 pl-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all ${emailError ? 'border-destructive focus:border-destructive' : ''}`}
                          required
                          autoComplete="email"
                        />
                      </div>
                      {emailError && (
                        <p className="text-xs text-destructive px-1 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-destructive" />
                          {emailError}
                        </p>
                      )}
                    </div>
                    
                    {/* 비밀번호 입력 */}
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="비밀번호 (6자 이상)"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        onFocus={(e) => scrollToInput(e.currentTarget)}
                        className="h-13 pl-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                    
                    {/* 비밀번호 확인 */}
                    <div className="space-y-1">
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="비밀번호 확인"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          onFocus={(e) => scrollToInput(e.currentTarget)}
                          className="h-13 pl-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                      {signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword && (
                        <p className="text-xs text-destructive px-1 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-destructive" />
                          비밀번호가 일치하지 않습니다.
                        </p>
                      )}
                    </div>
                    
                    {/* 추천인 코드 */}
                    <div className="space-y-1">
                      <div className="relative group">
                        <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="referral-code"
                          type="text"
                          placeholder="추천인 코드 (선택)"
                          value={signUpData.referralCode}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                          className="h-13 pl-12 rounded-xl border-border/50 bg-background/50 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                          maxLength={6}
                        />
                      </div>
                      {signUpData.referralCode && (
                        <p className="text-xs text-primary px-1 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          추천인 3토큰 + 회원가입자 2토큰 보너스!
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 mt-2"
                      disabled={loading || !!phoneError || checkingPhone}
                    >
                      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      가입하기
                    </Button>
                  </form>

                  {/* 구분선 */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-muted-foreground">또는</span>
                    </div>
                  </div>

                  {/* 소셜 로그인 */}
                  <SocialLoginButtons isLoading={loading} setIsLoading={setLoading} />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>

          {/* 무료 체험 안내 */}
          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/free-trial')}
              className="text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl"
            >
              회원가입 없이 무료 체험하기 →
            </Button>
          </div>
        </div>
      </div>

      {/* 비밀번호 찾기 모달 */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">비밀번호 찾기</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                    setError('');
                    setForgotSuccess('');
                  }}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="h-12 rounded-lg"
                  required
                />
                
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}
                
                {forgotSuccess && (
                  <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                    {forgotSuccess}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-11"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail('');
                      setError('');
                      setForgotSuccess('');
                    }}
                  >
                    취소
                  </Button>
                  <Button type="submit" className="flex-1 h-11" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    재설정 링크 전송
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 온보딩 오버레이 */}
      <OnboardingOverlay
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const userOnboardingKey = `hasSeenOnboarding_${user.id}`;
            localStorage.setItem(userOnboardingKey, 'true');
            localStorage.setItem('hasSeenOnboarding', 'true');
          }
          setShowOnboarding(false);
          navigate('/dashboard');
        }}
      />
    </>
  );
};