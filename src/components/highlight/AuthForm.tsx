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
  const [error, setError] = useState('');
  
  // 로그인 폼 데이터
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // 회원가입 폼 데이터
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    birthDate: '',
    gender: '',
    ageGroup: '',
    relationshipToChild: '',
    interests: [] as string[],
    primaryConcern: ''
  });

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // 인증 상태 리스너 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          navigate('/');
        }
      }
    );

    // 기존 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
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
    setSignUpData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interestId]
        : prev.interests.filter(id => id !== interestId)
    }));
  };

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
            birth_date: signUpData.birthDate,
            gender: signUpData.gender,
            age_group: signUpData.ageGroup,
            relationship_to_child: signUpData.relationshipToChild,
            interests: signUpData.interests,
            primary_concern: signUpData.primaryConcern
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
        toast({
          title: "회원가입 완료", 
          description: "환영합니다!",
        });
      }

    } catch (error: any) {
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email.trim(),
        password: signInData.password,
      });

      if (error) throw error;

      toast({
        title: "로그인 성공",
        description: "HIGHLIGHT에 오신 것을 환영합니다!",
      });
      
    } catch (error: any) {
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
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
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
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
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
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
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
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
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
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
                        value={signUpData.birthDate}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">성별</Label>
                    <Select value={signUpData.gender} onValueChange={(value) => setSignUpData(prev => ({ ...prev, gender: value }))}>
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
                  <Select value={signUpData.ageGroup} onValueChange={(value) => setSignUpData(prev => ({ ...prev, ageGroup: value }))}>
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
                  <Select value={signUpData.relationshipToChild} onValueChange={(value) => setSignUpData(prev => ({ ...prev, relationshipToChild: value }))}>
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
                          checked={signUpData.interests.includes(option.id)}
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
                  <Select value={signUpData.primaryConcern} onValueChange={(value) => setSignUpData(prev => ({ ...prev, primaryConcern: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="가장 관심있는 분야" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adhd_assessment">ADHD 평가</SelectItem>
                      <SelectItem value="language_development">언어 발달</SelectItem>
                      <SelectItem value="behavioral_assessment">행동 평가</SelectItem>
                      <SelectItem value="developmental_screening">발달 선별</SelectItem>
                      <SelectItem value="psychological_evaluation">심리 평가</SelectItem>
                      <SelectItem value="family_counseling">가족 상담</SelectItem>
                    </SelectContent>
                  </Select>
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