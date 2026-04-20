import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Shield, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * 직원이 회사 가입 코드로 조직에 연결하고
 * 데이터 공유 옵션(기본 익명, 옵트인 실명)을 설정하는 위젯
 *
 * 마이페이지·온보딩·검사 결과 페이지 등에 임베드 가능
 */
export const EmployeeOrgJoinCard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('');
  const [linked, setLinked] = useState<{
    institution_name: string;
    department_code: string | null;
    institution_id: string;
  } | null>(null);
  const [shareIdentity, setShareIdentity] = useState(false);
  const [shareTurnover, setShareTurnover] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: link } = await supabase
        .from('employee_organization_links')
        .select('institution_id, department_code, b2b_partner_institutions(institution_name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (link) {
        const inst = (link as { b2b_partner_institutions?: { institution_name?: string } }).b2b_partner_institutions;
        setLinked({
          institution_id: link.institution_id,
          department_code: link.department_code,
          institution_name: inst?.institution_name || '소속 기관',
        });

        const { data: prefs } = await supabase
          .from('employee_data_sharing_preferences')
          .select('share_identity, share_turnover_risk')
          .eq('user_id', user.id)
          .eq('institution_id', link.institution_id)
          .maybeSingle();

        if (prefs) {
          setShareIdentity(prefs.share_identity);
          setShareTurnover(prefs.share_turnover_risk);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) {
      toast({ title: '가입 코드를 입력하세요', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: '로그인이 필요합니다', variant: 'destructive' });
      return;
    }

    // 가입 코드 = institution.id (실제 운영 시엔 별도 join_code 컬럼 권장)
    const { data: inst, error: instErr } = await supabase
      .from('b2b_partner_institutions')
      .select('id, institution_name')
      .eq('id', code.trim())
      .maybeSingle();

    if (instErr || !inst) {
      toast({ title: '유효하지 않은 가입 코드', description: '회사에서 받은 코드를 다시 확인하세요.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('employee_organization_links')
      .insert({
        user_id: user.id,
        institution_id: inst.id,
        department_code: department.trim() || null,
        joined_via_code: code.trim(),
      });

    if (error) {
      toast({ title: '가입 실패', description: error.message, variant: 'destructive' });
      return;
    }

    // 기본 공유 설정 생성 (익명)
    await supabase.from('employee_data_sharing_preferences').insert({
      user_id: user.id,
      institution_id: inst.id,
      share_identity: false,
      share_stress_score: true,
      share_burnout_score: true,
      share_turnover_risk: false,
      share_coaching_usage: true,
      allow_crisis_alert: true,
    });

    toast({ title: `${inst.institution_name}에 연결됐어요`, description: '기본은 익명 모드로 설정됩니다.' });
    loadStatus();
  };

  const updateSharing = async (field: 'share_identity' | 'share_turnover_risk', value: boolean) => {
    if (!linked) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (field === 'share_identity') setShareIdentity(value);
    else setShareTurnover(value);

    await supabase
      .from('employee_data_sharing_preferences')
      .update({ [field]: value })
      .eq('user_id', user.id)
      .eq('institution_id', linked.institution_id);

    toast({ title: '공유 설정 저장됨', description: value ? '회사 EAP 담당자에게 공유됩니다' : '익명 처리로 전환되었습니다' });
  };

  if (loading) return null;

  if (linked) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4 text-primary" />
              {linked.institution_name}
            </CardTitle>
            <Badge variant="outline" className="gap-1 text-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 연결됨
            </Badge>
          </div>
          {linked.department_code && (
            <CardDescription>부서: {linked.department_code}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="border-emerald-200 bg-emerald-50/50">
            <EyeOff className="h-4 w-4 text-emerald-700" />
            <AlertDescription className="text-emerald-800 text-xs">
              <strong>기본 익명 모드:</strong> 스트레스·번아웃 점수는 부서 평균에만 반영되며, 회사가 당신을 식별할 수 없습니다.
            </AlertDescription>
          </Alert>

          <div className="flex items-start gap-3 p-3 rounded-lg border">
            <div className="flex-1">
              <Label htmlFor="share-id" className="text-sm font-semibold">실명으로 EAP 담당자에게 공유</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                개별 코칭·상담을 받고 싶을 때만 켜세요. 언제든 끌 수 있습니다.
              </p>
            </div>
            <Switch id="share-id" checked={shareIdentity} onCheckedChange={(v) => updateSharing('share_identity', v)} />
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border">
            <div className="flex-1">
              <Label htmlFor="share-turn" className="text-sm font-semibold">이직 위험도 공유</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                회사가 처우 개선을 검토할 수 있도록 (실명과 분리하여 익명으로도 가능)
              </p>
            </div>
            <Switch id="share-turn" checked={shareTurnover} onCheckedChange={(v) => updateSharing('share_turnover_risk', v)} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="w-4 h-4 text-primary" /> 회사 EAP 프로그램 참여
        </CardTitle>
        <CardDescription>회사에서 받은 가입 코드로 사내 마음건강 프로그램에 참여하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="join-code" className="text-xs">가입 코드</Label>
          <Input
            id="join-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="회사에서 받은 코드"
          />
        </div>
        <div>
          <Label htmlFor="dept" className="text-xs">부서명 (선택)</Label>
          <Input
            id="dept"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="예: 마케팅팀"
          />
        </div>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            가입 즉시 익명 모드로 시작합니다. 회사는 부서 평균만 보며, 당신의 점수를 식별할 수 없습니다.
          </AlertDescription>
        </Alert>
        <Button onClick={handleJoin} className="w-full">참여하기</Button>
      </CardContent>
    </Card>
  );
};

export default EmployeeOrgJoinCard;
