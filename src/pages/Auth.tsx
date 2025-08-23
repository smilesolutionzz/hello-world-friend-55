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
  Phone, 
  Calendar,
  Heart,
  Shield,
  Users
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
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
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
        navigate('/dashboard');
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
    
    if (signupData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      setLoading(false);
      return;
    }

    // 전화번호 형식 검증 (입력된 경우에만)
    if (signupData.phone) {
      const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
      if (!phoneRegex.test(signupData.phone.replace(/-/g, ''))) {
        setError("올바른 전화번호 형식을 입력해주세요. (010-1234-5678)");
        setLoading(false);
        return;
      }
    }
    
    try {
      // 전화번호 중복 확인 (전화번호가 입력된 경우)
      if (signupData.phone) {
        const { data: existingPhone, error: phoneCheckError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('phone', signupData.phone)
          .maybeSingle();

        if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
          console.error('Phone check error:', phoneCheckError);
        }

        if (existingPhone) {
          setError("이미 가입된 전화번호입니다.");
          setLoading(false);
          return;
        }
      }

      // Supabase Auth에 회원가입 시도
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            display_name: signupData.displayName,
            phone: signupData.phone,
            birth_date: signupData.birthDate
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setError("이미 가입된 이메일입니다.");
        } else if (error.message.includes('invalid email')) {
          setError("올바른 이메일 형식을 입력해주세요.");
        } else if (error.message.includes('weak password')) {
          setError("비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.");
        } else if (error.message.includes('Password should be at least')) {
          setError("비밀번호는 최소 6자 이상이어야 합니다.");
        } else if (error.message.includes('duplicate key value violates unique constraint')) {
          setError("이미 가입된 전화번호입니다.");
        } else {
          setError(`회원가입 오류: ${error.message}`);
        }
      } else {
        setSuccess("회원가입이 완료되었습니다! 이메일을 확인해주세요.");
        toast({
          title: "회원가입 성공",
          description: "이메일 인증 후 로그인해주세요.",
        });
        // 폼 리셋
        setSignupData({
          email: "",
          password: "",
          confirmPassword: "",
          displayName: "",
          phone: "",
          birthDate: ""
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError("회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
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
          <p className="text-muted-foreground">데이터로 읽는 마음, AI하이라이트프로</p>
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
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
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
                      placeholder="010-1234-5678"
                      value={signupData.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 숫자만 입력받고 자동으로 하이픈 추가
                        const phoneNumber = value.replace(/[^0-9]/g, '');
                        if (phoneNumber.length <= 11) {
                          let formattedPhone = phoneNumber;
                          if (phoneNumber.length > 3 && phoneNumber.length <= 7) {
                            formattedPhone = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
                          } else if (phoneNumber.length > 7) {
                            formattedPhone = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;
                          }
                          setSignupData(prev => ({ ...prev, phone: formattedPhone }));
                        }
                      }}
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
                      placeholder="비밀번호를 입력하세요 (최소 6자)"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
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
                      className={`pl-10 ${
                        signupData.confirmPassword && signupData.password !== signupData.confirmPassword 
                          ? 'border-red-500 focus:border-red-500' 
                          : signupData.confirmPassword && signupData.password === signupData.confirmPassword
                          ? 'border-green-500 focus:border-green-500'
                          : ''
                      }`}
                      required
                    />
                  </div>
                  {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                    <p className="text-sm text-red-500">비밀번호가 일치하지 않습니다.</p>
                  )}
                  {signupData.confirmPassword && signupData.password === signupData.confirmPassword && (
                    <p className="text-sm text-green-600">비밀번호가 일치합니다.</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "가입 중..." : "회원가입"}
                </Button>
              </form>
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