import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Lock, 
  Heart,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n';

const Auth = () => {
  const navigate = useNavigate();
  const { processReferralReward } = useReferrals();
  const { toast } = useToast();
  const { t } = useTranslation();
  const a = t.auth;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Signup form - 최소 정보만 수집
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const referralCode = localStorage.getItem('referralCode');
        if (referralCode) {
          await processReferralReward(referralCode);
          localStorage.removeItem('referralCode');
        }
        navigate('/needs-assessment');
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
        if (error.message.includes('Invalid login')) {
          setError(a.errors.invalidLogin);
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError(a.errors.loginError);
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // 닉네임 검증
    const trimmedName = signupData.displayName.trim();
    if (trimmedName.length < 2) {
      setError(a.errors.nickMin);
      setLoading(false);
      return;
    }
    if (trimmedName.length > 20) {
      setError(a.errors.nickMax);
      setLoading(false);
      return;
    }
    
    // 비밀번호 일치 확인
    if (signupData.password !== signupData.confirmPassword) {
      setError(a.errors.passwordMismatch);
      setLoading(false);
      return;
    }
    
    // 비밀번호 길이
    if (signupData.password.length < 8) {
      setError(a.errors.passwordMin);
      setLoading(false);
      return;
    }

    // 비밀번호 복잡성
    const hasUpperCase = /[A-Z]/.test(signupData.password);
    const hasLowerCase = /[a-z]/.test(signupData.password);
    const hasNumber = /[0-9]/.test(signupData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(signupData.password);
    const complexityCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (complexityCount < 3) {
      setError(a.errors.passwordComplexity);
      setLoading(false);
      return;
    }

    // 이메일 형식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      setError(a.errors.invalidEmail);
      setLoading(false);
      return;
    }

    // 닉네임 중복 체크
    try {
      const { data: nickAvailable } = await supabase.rpc('check_nickname_availability', {
        nickname: trimmedName
      });
      if (nickAvailable === false) {
        setError(a.errors.nickTaken);
        setLoading(false);
        return;
      }
    } catch (err) {
      // RPC 오류 시 넘어감
    }
    
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const referralCode = localStorage.getItem('referralCode');
      
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: trimmedName,
            referral_code: referralCode || undefined
          }
        }
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(a.success.signupComplete);
      }
    } catch (err) {
      setError(a.errors.signupError);
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
      setError(a.errors.invalidEmail);
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
        setSuccess(a.success.resetSent);
        toast({
          title: a.emailSent,
          description: a.emailSentDesc,
        });
      }
    } catch (err) {
      setError(a.errors.resetError);
    }

    setLoading(false);
  };

  // 비밀번호 강도 표시
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: "", color: "" };
    const checks = [
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 8,
      password.length >= 12,
    ].filter(Boolean).length;

    if (checks <= 2) return { level: 1, label: a.weak, color: "bg-destructive" };
    if (checks <= 4) return { level: 2, label: a.medium, color: "bg-amber-500" };
    return { level: 3, label: a.strong, color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(signupData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{a.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{a.subtitle}</p>
        </div>

        <Card className="p-5 shadow-lg border-border/50">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">{a.loginTab}</TabsTrigger>
              <TabsTrigger value="signup">{a.signupTab}</TabsTrigger>
            </TabsList>
            
            {/* 로그인 */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm">{a.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={a.emailPlaceholder}
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-sm">{a.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={a.passwordPlaceholder}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? a.loggingIn : a.loginButton}
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-xs text-muted-foreground"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    {a.forgotPassword}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            {/* 회원가입 - 최소 정보만 */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* 닉네임 */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-sm">닉네임</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="2~20자 닉네임"
                      value={signupData.displayName}
                      onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="pl-10 h-11"
                      maxLength={20}
                      required
                    />
                  </div>
                </div>

                {/* 이메일 */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={a.emailPlaceholder}
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
                
                {/* 비밀번호 */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-sm">{a.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={a.passwordSignupPlaceholder}
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signupData.password && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength.level ? passwordStrength.color : 'bg-muted'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{passwordStrength.label}</span>
                    </div>
                  )}
                </div>
                
                {/* 비밀번호 확인 */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm" className="text-sm">{a.confirmPassword}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={a.confirmPasswordPlaceholder}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                    <p className="text-[11px] text-destructive">{a.passwordMismatch}</p>
                  )}
                </div>
                
                {/* 개인정보 최소 수집 안내 */}
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                   <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {a.privacyNotice} <span className="font-semibold text-foreground">{a.privacyMinimal}</span> {a.privacyRest}
                  </p>
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? a.signingUp : a.signupButton}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert className="mt-4 border-destructive/50 text-destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mt-4 border-green-500/50 text-green-700">
              <AlertDescription className="text-sm">{success}</AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Forgot Password Dialog */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">{a.forgotPasswordTitle}</h3>
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
              
              <p className="text-sm text-muted-foreground mb-4">
                {a.forgotPasswordDesc}
              </p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder={a.emailPlaceholder}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
                
                {error && (
                  <Alert className="border-destructive/50 text-destructive">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-500/50 text-green-700">
                    <AlertDescription className="text-sm">{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-11"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail("");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    취소
                  </Button>
                  <Button type="submit" className="flex-1 h-11" disabled={loading}>
                    {loading ? "전송 중..." : "재설정 링크 전송"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
        
        {/* 홈으로 */}
        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground">
            ← 홈으로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
