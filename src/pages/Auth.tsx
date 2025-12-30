import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar,
  Heart,
  Shield,
  Users,
  UserCog,
  Building,
  Stethoscope
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { processReferralReward } = useReferrals();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // User type selection
  const [userType, setUserType] = useState<'individual' | 'expert' | 'institution' | ''>('');
  
  // Signup form
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    phone: "",
    birthDate: ""
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Process referral reward if there's a stored referral code
        const referralCode = localStorage.getItem('referralCode');
        if (referralCode) {
          await processReferralReward(referralCode);
          localStorage.removeItem('referralCode');
        }
        
        // Navigate based on user type or default to dashboard
        const userType = session.user.user_metadata?.user_type;
        if (userType === 'expert') {
          navigate('/expert-onboarding');
        } else if (userType === 'institution') {
          navigate('/institution-onboarding');
        } else {
          navigate('/needs-assessment');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate, processReferralReward]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });
      
      if (error) {
        setError(error.message);
      } else {
        // Auth state change listener will handle navigation and referral processing
        // navigate('/dashboard'); // Removed to let the auth listener handle it
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }
    
    // Enhanced password validation
    if (signupData.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(signupData.password);
    const hasLowerCase = /[a-z]/.test(signupData.password);
    const hasNumber = /[0-9]/.test(signupData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(signupData.password);

    const complexityCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (complexityCount < 3) {
      setError("비밀번호는 대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다.");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      setLoading(false);
      return;
    }

    // 전화번호 중복 체크 (선택사항이므로 입력된 경우에만)
    if (signupData.phone) {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('phone', signupData.phone)
          .single();
        
        if (existingProfile) {
          setError("이미 사용 중인 전화번호입니다.");
          setLoading(false);
          return;
        }
      } catch (error) {
        // PGRST116 에러는 데이터가 없다는 뜻이므로 정상
        if (error.code !== 'PGRST116') {
          console.error('전화번호 중복 체크 오류:', error);
        }
      }
    }
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      // 추천 코드가 있는지 확인
      const referralCode = localStorage.getItem('referralCode');
      
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: signupData.displayName,
            phone: signupData.phone,
            birth_date: signupData.birthDate,
            user_type: userType,
            referral_code: referralCode || undefined
          }
        }
      });
      
      if (error) {
        if (error.message.includes('Phone number already exists')) {
          setError("이미 사용 중인 전화번호입니다.");
        } else {
          setError(error.message);
        }
      } else {
        setSuccess("회원가입이 완료되었습니다! 15토큰과 함께 시작하세요.");
        // Auth state change listener will handle referral processing after email confirmation
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setError("올바른 이메일 형식이 아닙니다.");
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
        setSuccess("비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.");
        toast({
          title: "이메일 전송 완료",
          description: "비밀번호 재설정 링크가 발송되었습니다.",
        });
      }
    } catch (err) {
      setError("비밀번호 재설정 요청 중 오류가 발생했습니다.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">AIHPRO</h1>
          <p className="text-muted-foreground">데이터로 읽는 마음, AIHUMANPRO</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "로그인 중..." : "로그인"}
                </Button>
                
                <div className="flex flex-col items-center gap-2 mt-4">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    비밀번호를 잊으셨나요?
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    계정이 없으신가요?{' '}
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-primary font-semibold hover:underline"
                      onClick={() => {
                        const signupTab = document.querySelector('[data-state="inactive"][value="signup"]') as HTMLButtonElement;
                        signupTab?.click();
                      }}
                    >
                      회원가입
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {!userType ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">서비스 이용 목적을 선택해주세요</h3>
                    <p className="text-sm text-muted-foreground">선택에 따라 맞춤형 경험을 제공해드립니다</p>
                  </div>
                  
                  <RadioGroup value={userType} onValueChange={(value) => setUserType(value as any)}>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="flex-1 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-primary mt-1" />
                            <div>
                              <div className="font-medium">개인 사용자</div>
                              <div className="text-sm text-muted-foreground">나와 가족을 위한 심리검사</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="expert" id="expert" />
                        <Label htmlFor="expert" className="flex-1 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Stethoscope className="w-5 h-5 text-primary mt-1" />
                            <div>
                              <div className="font-medium">전문가</div>
                              <div className="text-sm text-muted-foreground">심리상담사, 의료진, 교육 전문가</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="institution" id="institution" />
                        <Label htmlFor="institution" className="flex-1 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Building className="w-5 h-5 text-primary mt-1" />
                            <div>
                              <div className="font-medium">기관 관계자</div>
                              <div className="text-sm text-muted-foreground">학교, 병원, 상담센터 등</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <Button 
                    onClick={() => userType && setUserType(userType)} 
                    className="w-full"
                    disabled={!userType}
                  >
                    다음 단계로
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                  <Label htmlFor="signup-name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      value={signupData.displayName}
                      onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">전화번호 (선택)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="전화번호를 입력하세요"
                      value={signupData.phone}
                      onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-birth">생년월일 (선택)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-birth"
                      type="date"
                      value={signupData.birthDate}
                      onChange={(e) => setSignupData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="비밀번호 (최소 8자, 대소문자+숫자+특수문자 중 3가지)"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      대문자, 소문자, 숫자, 특수문자 중 최소 3가지 포함
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "가입 중..." : "회원가입"}
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setUserType('')}
                    className="text-sm"
                  >
                    ← 사용자 유형 다시 선택
                  </Button>
                </div>
              </form>
              )}
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert className="mt-4 border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mt-4 border-green-500/50 text-green-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Forgot Password Dialog */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">비밀번호 찾기</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail("");
                    setError("");
                    setSuccess("");
                  }}
                >
                  ✕
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                {error && (
                  <Alert className="border-destructive/50 text-destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-500/50 text-green-700">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail("");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    취소
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "전송 중..." : "재설정 링크 전송"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
        
        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>개인정보 보호</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>가족 통합 관리</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span>24시간 AI 상담</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;