
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User as UserIcon, Phone, Calendar, Users } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';

export const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [primaryConcern, setPrimaryConcern] = useState('');
  const [relationshipToChild, setRelationshipToChild] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only redirect on SIGNED_IN event to avoid conflicts
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, redirecting to dashboard');
          navigate('/');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Redirect if already authenticated
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const interestOptions = [
    { id: 'language_delay', label: '언어지연' },
    { id: 'developmental_delay', label: '발달지연' },
    { id: 'psychological_counseling', label: '심리상담' },
    { id: 'elderly_cognitive', label: '노인인지' },
    { id: 'parent_counseling', label: '부모상담' },
    { id: 'adhd_assessment', label: 'ADHD 평가' },
    { id: 'depression_anxiety', label: '우울/불안' },
    { id: 'behavioral_issues', label: '행동문제' },
    { id: 'learning_difficulties', label: '학습장애' },
    { id: 'autism_spectrum', label: '자폐스펙트럼' }
  ];

  const handleInterestChange = (interestId: string, checked: boolean) => {
    if (checked) {
      setInterests(prev => [...prev, interestId]);
    } else {
      setInterests(prev => prev.filter(id => id !== interestId));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast({
        title: "오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast({
        title: "오류", 
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('회원가입 시도 중...');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName.trim(),
            phone: phone.trim(),
            birth_date: birthDate,
            gender,
            age_group: ageGroup,
            interests: JSON.stringify(interests),
            primary_concern: primaryConcern,
            relationship_to_child: relationshipToChild
          }
        }
      });

      console.log('회원가입 응답:', data, error);

      if (error) {
        console.error('회원가입 오류:', error);
        let errorMessage = error.message;
        
        if (error.message.includes('already registered')) {
          errorMessage = '이미 가입된 이메일입니다. 로그인해주세요.';
        } else if (error.message.includes('invalid email')) {
          errorMessage = '유효하지 않은 이메일 형식입니다.';
        } else if (error.message.includes('weak password')) {
          errorMessage = '비밀번호가 너무 약합니다.';
        }
        
        toast({
          title: "회원가입 실패",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // 회원가입 성공
      toast({
        title: "회원가입 성공!",
        description: "HIGHLIGHT에 오신 것을 환영합니다! 이메일을 확인해주세요.",
      });

      // 이메일 확인이 필요한 경우와 즉시 로그인되는 경우 모두 처리
      if (data.user && !data.session) {
        console.log('이메일 확인 필요');
      } else if (data.session) {
        console.log('즉시 로그인 성공');
        // onAuthStateChange에서 자동으로 리다이렉션됨
      }

    } catch (error: any) {
      console.error('회원가입 중 예외 발생:', error);
      toast({
        title: "오류",
        description: "회원가입 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "오류",
        description: "이메일과 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('로그인 시도 중...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('로그인 응답:', data, error);

      if (error) {
        console.error('로그인 오류:', error);
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 잘못되었습니다.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
        }
        
        toast({
          title: "로그인 실패",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      console.log('로그인 성공:', data);
      toast({
        title: "로그인 성공",
        description: "HIGHLIGHT에 오신 것을 환영합니다!",
      });
      
      // onAuthStateChange에서 자동으로 리다이렉션됨

    } catch (error: any) {
      console.error('로그인 중 예외 발생:', error);
      toast({
        title: "오류",
        description: "로그인 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            HIGHLIGHT
          </CardTitle>
          <CardDescription>
            3분 만에 완성하는 심리 검사 플랫폼
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
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
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">이름 *</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="display-name"
                        type="text"
                        placeholder="홍길동"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일 *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth-date">생년월일</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="birth-date"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">성별</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="성별 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                        <SelectItem value="prefer_not_to_say">선택 안함</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age-group">연령대</Label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="연령대 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child_0_5">유아 (0-5세)</SelectItem>
                      <SelectItem value="child_6_12">아동 (6-12세)</SelectItem>
                      <SelectItem value="teen_13_18">청소년 (13-18세)</SelectItem>
                      <SelectItem value="adult_19_35">청년 (19-35세)</SelectItem>
                      <SelectItem value="adult_36_50">중년 (36-50세)</SelectItem>
                      <SelectItem value="adult_51_65">장년 (51-65세)</SelectItem>
                      <SelectItem value="senior_65_plus">노년 (65세 이상)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="relationship">가족 관계 (자녀가 있다면)</Label>
                  <Select value={relationshipToChild} onValueChange={setRelationshipToChild}>
                    <SelectTrigger>
                      <SelectValue placeholder="관계 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">부모</SelectItem>
                      <SelectItem value="grandparent">조부모</SelectItem>
                      <SelectItem value="teacher">교사</SelectItem>
                      <SelectItem value="therapist">치료사</SelectItem>
                      <SelectItem value="self">본인</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>관심 분야 (복수 선택 가능)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {interestOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={interests.includes(option.id)}
                          onCheckedChange={(checked) => 
                            handleInterestChange(option.id, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={option.id} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary-concern">주요 관심사</Label>
                  <Select value={primaryConcern} onValueChange={setPrimaryConcern}>
                    <SelectTrigger>
                      <SelectValue placeholder="가장 관심있는 분야" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="language_delay">언어지연</SelectItem>
                      <SelectItem value="developmental_delay">발달지연</SelectItem>
                      <SelectItem value="psychological_counseling">심리상담</SelectItem>
                      <SelectItem value="elderly_cognitive">노인인지</SelectItem>
                      <SelectItem value="parent_counseling">부모상담</SelectItem>
                      <SelectItem value="adhd_assessment">ADHD 평가</SelectItem>
                      <SelectItem value="depression_anxiety">우울/불안</SelectItem>
                      <SelectItem value="behavioral_issues">행동문제</SelectItem>
                      <SelectItem value="learning_difficulties">학습장애</SelectItem>
                      <SelectItem value="autism_spectrum">자폐스펙트럼</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호 *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
