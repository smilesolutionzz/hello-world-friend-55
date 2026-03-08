import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, Baby, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ChildConsent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    childName: '',
    childBirthYear: '',
    consentCollect: false,
    consentUse: false,
    consentThirdParty: false,
    consentAI: false,
  });

  const allConsentsChecked = form.consentCollect && form.consentUse && form.consentThirdParty && form.consentAI;
  const formValid = form.guardianName && form.guardianRelation && form.guardianPhone && form.childName && form.childBirthYear && allConsentsChecked;

  const handleSubmit = async () => {
    if (!formValid) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: '로그인이 필요합니다', variant: 'destructive' });
        navigate('/auth');
        return;
      }

      // Store consent record
      const { error } = await supabase.from('legal_disclaimer_views').insert({
        user_id: user.id,
        page_url: '/child-consent',
        user_agent: JSON.stringify({
          type: 'child_guardian_consent',
          guardian_name: form.guardianName,
          guardian_relation: form.guardianRelation,
          child_birth_year: form.childBirthYear,
          consents: {
            collect: form.consentCollect,
            use: form.consentUse,
            third_party: form.consentThirdParty,
            ai_analysis: form.consentAI,
          },
          consented_at: new Date().toISOString(),
        }),
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: '✅ 동의가 완료되었습니다', description: '이제 아동 관련 서비스를 이용하실 수 있습니다.' });
    } catch (err: any) {
      toast({ title: '오류 발생', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <SEOHead title="아동 동의 완료 - AIHumanPro" noIndex={true} />
        <div className="min-h-screen bg-background">
          <UnifiedNavigation />
          <div className="container mx-auto px-6 py-12 max-w-2xl">
            <Card className="text-center p-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">동의가 완료되었습니다</h2>
              <p className="text-muted-foreground mb-6">
                법정대리인 동의가 정상적으로 처리되었습니다.<br />
                이제 아동 관련 서비스(관찰일지, 발달검사 등)를 이용하실 수 있습니다.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/observation')} className="w-full">
                  관찰일지 시작하기
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  홈으로 돌아가기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="아동 개인정보 수집 동의 - AIHumanPro"
        description="14세 미만 아동의 개인정보 수집을 위한 법정대리인 동의"
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-6 py-12 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl font-bold">아동 개인정보 수집·이용 동의서</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                「개인정보 보호법」 제22조에 따라 만 14세 미만 아동의 개인정보를 수집·이용하기 위해
                법정대리인의 동의가 필요합니다.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* 안내 */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                <Baby className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  본 동의서는 관찰일지, 발달검사 등 <strong>14세 미만 아동</strong>의 정보를 다루는 서비스 이용 시 필요합니다.
                  법정대리인(부모 등)이 직접 작성해주세요.
                </AlertDescription>
              </Alert>

              {/* 법정대리인 정보 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">법정대리인 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">성명 *</Label>
                    <Input
                      id="guardianName"
                      placeholder="홍길동"
                      value={form.guardianName}
                      onChange={(e) => setForm(prev => ({ ...prev, guardianName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianRelation">관계 *</Label>
                    <Input
                      id="guardianRelation"
                      placeholder="부/모/법정대리인"
                      value={form.guardianRelation}
                      onChange={(e) => setForm(prev => ({ ...prev, guardianRelation: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">연락처 *</Label>
                  <Input
                    id="guardianPhone"
                    placeholder="010-1234-5678"
                    value={form.guardianPhone}
                    onChange={(e) => setForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                  />
                </div>
              </div>

              {/* 아동 정보 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">아동 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childName">아동 이름(이니셜) *</Label>
                    <Input
                      id="childName"
                      placeholder="예: 홍OO"
                      value={form.childName}
                      onChange={(e) => setForm(prev => ({ ...prev, childName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childBirthYear">출생연도 *</Label>
                    <Input
                      id="childBirthYear"
                      placeholder="예: 2018"
                      type="number"
                      min="2010"
                      max="2026"
                      value={form.childBirthYear}
                      onChange={(e) => setForm(prev => ({ ...prev, childBirthYear: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* 수집 항목 안내 */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <h4 className="font-semibold">수집하는 아동 개인정보 항목</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li><strong>필수:</strong> 이름(이니셜), 생년월일, 성별, 연령</li>
                  <li><strong>선택:</strong> 관찰일지 내용, 발달검사 결과, 행동 패턴 분석 데이터</li>
                </ul>
                <h4 className="font-semibold mt-3">이용 목적</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>AI 발달 분석 및 관찰일지 작성 지원</li>
                  <li>맞춤형 발달 추천 및 전문가 상담 연계</li>
                </ul>
                <h4 className="font-semibold mt-3">보유 기간</h4>
                <p className="text-muted-foreground">회원 탈퇴 시 또는 동의 철회 시 즉시 삭제 (법령 보관 의무 제외)</p>
              </div>

              {/* 동의 체크박스 */}
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentCollect"
                    checked={form.consentCollect}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, consentCollect: checked === true }))}
                  />
                  <Label htmlFor="consentCollect" className="text-sm leading-relaxed cursor-pointer">
                    <strong>[필수]</strong> 위 아동의 개인정보 <strong>수집</strong>에 동의합니다.
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentUse"
                    checked={form.consentUse}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, consentUse: checked === true }))}
                  />
                  <Label htmlFor="consentUse" className="text-sm leading-relaxed cursor-pointer">
                    <strong>[필수]</strong> 위 아동의 개인정보를 명시된 목적으로 <strong>이용</strong>하는 것에 동의합니다.
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentThirdParty"
                    checked={form.consentThirdParty}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, consentThirdParty: checked === true }))}
                  />
                  <Label htmlFor="consentThirdParty" className="text-sm leading-relaxed cursor-pointer">
                    <strong>[필수]</strong> AI 분석을 위해 외부 처리업체(OpenAI, Google)에 <strong>암호화된 데이터 전송</strong>에 동의합니다. (학습 미사용)
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentAI"
                    checked={form.consentAI}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, consentAI: checked === true }))}
                  />
                  <Label htmlFor="consentAI" className="text-sm leading-relaxed cursor-pointer">
                    <strong>[필수]</strong> AI 분석 결과는 <strong>참고 정보</strong>이며, 의료적 진단을 대체하지 않음을 이해합니다.
                  </Label>
                </div>
              </div>

              {/* 경고 */}
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                  동의는 언제든지 설정 페이지 또는 privacy@aihpro.app 으로 철회할 수 있으며, 
                  철회 시 해당 아동의 모든 데이터는 즉시 삭제됩니다.
                </AlertDescription>
              </Alert>

              {/* 제출 */}
              <Button 
                onClick={handleSubmit} 
                disabled={!formValid || loading}
                className="w-full"
                size="lg"
              >
                {loading ? '처리 중...' : '법정대리인 동의 제출'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ChildConsent;
