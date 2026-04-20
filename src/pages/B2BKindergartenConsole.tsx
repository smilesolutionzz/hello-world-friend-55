import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  School, Plus, Send, FileText, Copy, CheckCircle2,
  Calendar, ArrowRight, Sparkles, TrendingUp, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Institution {
  id: string;
  institution_name: string;
  institution_type: string;
}

interface Case {
  id: string;
  child_nickname: string;
  child_age_months: number;
  classroom_name: string | null;
  consultation_focus: string[] | null;
  scheduled_consultation_at: string | null;
  status: string;
  created_at: string;
}

const B2BKindergartenConsole = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showInstSetup, setShowInstSetup] = useState(false);

  // 기관 등록 폼
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState<'daycare' | 'kindergarten' | 'mixed'>('daycare');

  // 케이스 생성 폼
  const [childNickname, setChildNickname] = useState('');
  const [childAgeMonths, setChildAgeMonths] = useState<number>(48);
  const [classroomName, setClassroomName] = useState('');
  const [focusInput, setFocusInput] = useState('');
  const [consultDate, setConsultDate] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const { data: inst } = await supabase
        .from('kindergarten_institutions')
        .select('id, institution_name, institution_type')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (!inst) { setLoading(false); return; }
      setInstitution(inst);

      const { data: caseList } = await supabase
        .from('kindergarten_consultation_cases')
        .select('*')
        .eq('teacher_user_id', user.id)
        .order('created_at', { ascending: false });
      setCases((caseList as Case[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const registerInstitution = async () => {
    if (!instName.trim()) { toast({ title: '기관명을 입력하세요', variant: 'destructive' }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('kindergarten_institutions').insert({
      owner_user_id: user.id,
      institution_name: instName.trim(),
      institution_type: instType,
    });
    if (error) { toast({ title: '등록 실패', description: error.message, variant: 'destructive' }); return; }
    toast({ title: '기관이 등록되었어요' });
    setShowInstSetup(false);
    loadData();
  };

  const createCase = async () => {
    if (!childNickname.trim() || !institution) return;
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const focus = focusInput.split(',').map(f => f.trim()).filter(Boolean);

      // 1. 케이스 생성
      const { data: newCase, error: caseErr } = await supabase
        .from('kindergarten_consultation_cases')
        .insert({
          institution_id: institution.id,
          teacher_user_id: user.id,
          child_nickname: childNickname.trim(),
          child_age_months: childAgeMonths,
          classroom_name: classroomName.trim() || null,
          consultation_focus: focus,
          scheduled_consultation_at: consultDate ? new Date(consultDate).toISOString() : null,
        })
        .select()
        .single();
      if (caseErr) throw caseErr;

      // 2. AI 검사 큐레이션
      const { data: curated, error: curErr } = await supabase.functions.invoke('kindergarten-curate-assessment', {
        body: { childAgeMonths, consultationFocus: focus, roundLabel: 'T0', childNickname: childNickname.trim() },
      });
      if (curErr) throw curErr;

      // 3. T0 초대 생성
      const { error: invErr } = await supabase.from('kindergarten_assessment_invites').insert({
        case_id: newCase.id,
        round_label: 'T0',
        curated_assessment: curated.curated || {},
      });
      if (invErr) throw invErr;

      await supabase.from('kindergarten_consultation_cases')
        .update({ status: 'baseline_sent' })
        .eq('id', newCase.id);

      toast({ title: '케이스 생성 완료', description: '부모에게 보낼 검사 링크가 준비됐어요' });
      setChildNickname(''); setClassroomName(''); setFocusInput(''); setConsultDate('');
      setShowCreate(false);
      loadData();
    } catch (e) {
      console.error(e);
      toast({ title: '케이스 생성 실패', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const copyInviteLink = async (caseId: string) => {
    const { data } = await supabase
      .from('kindergarten_assessment_invites')
      .select('invite_token, round_label')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return;
    const url = `${window.location.origin}/parent-assessment/${data.invite_token}`;
    await navigator.clipboard.writeText(url);
    toast({ title: '링크 복사됨', description: '학부모에게 카톡·문자로 전달하세요' });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      created: { label: '생성됨', cls: 'bg-slate-100 text-slate-700' },
      baseline_sent: { label: 'T0 발송', cls: 'bg-blue-100 text-blue-700' },
      baseline_done: { label: '상담 준비 완료', cls: 'bg-emerald-100 text-emerald-700' },
      consultation_done: { label: '상담 완료', cls: 'bg-purple-100 text-purple-700' },
      t30_sent: { label: '30일 발송', cls: 'bg-amber-100 text-amber-700' },
      t30_done: { label: '30일 완료', cls: 'bg-amber-200 text-amber-900' },
      t60_sent: { label: '60일 발송', cls: 'bg-rose-100 text-rose-700' },
      t60_done: { label: '60일 완료', cls: 'bg-rose-200 text-rose-900' },
      closed: { label: '종료', cls: 'bg-slate-200 text-slate-600' },
    };
    const m = map[status] || map.created;
    return <Badge className={m.cls}>{m.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 to-rose-50/20 p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 to-rose-50/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <School className="w-10 h-10 text-amber-600 mb-2" />
            <CardTitle>어린이집·유치원 등록</CardTitle>
            <CardDescription>부모상담 솔루션을 시작하려면 기관을 먼저 등록하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="inst-name">기관명</Label>
              <Input id="inst-name" value={instName} onChange={(e) => setInstName(e.target.value)} placeholder="예: 햇살어린이집" />
            </div>
            <div>
              <Label>기관 유형</Label>
              <div className="flex gap-2 mt-1">
                {(['daycare', 'kindergarten', 'mixed'] as const).map((t) => (
                  <Button key={t} type="button" size="sm"
                    variant={instType === t ? 'default' : 'outline'}
                    onClick={() => setInstType(t)}>
                    {t === 'daycare' ? '어린이집' : t === 'kindergarten' ? '유치원' : '통합'}
                  </Button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={registerInstitution}>등록하기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 to-rose-50/20 p-4 md:p-6">
      <Helmet>
        <title>교사 콘솔 · {institution.institution_name} | AIHPRO</title>
        <meta name="description" content="부모상담 케이스 관리 + 30·60일 개선도 추적" />
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="outline" className="mb-2 gap-1 border-amber-300 text-amber-800">
              <School className="w-3 h-3" /> 교사 콘솔
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold">{institution.institution_name}</h1>
            <p className="text-sm text-muted-foreground mt-1">부모상담 케이스 · 검사 발송 · 액션 플랜</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700"><Plus className="w-4 h-4 mr-1" /> 새 케이스</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>새 부모상담 케이스</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="nickname">아동 닉네임 (실명 X)</Label>
                  <Input id="nickname" value={childNickname} onChange={(e) => setChildNickname(e.target.value)} placeholder="예: 햇살이" />
                </div>
                <div>
                  <Label htmlFor="age">월령 (12~96)</Label>
                  <Input id="age" type="number" min={12} max={96} value={childAgeMonths}
                    onChange={(e) => setChildAgeMonths(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="classroom">반 이름 (선택)</Label>
                  <Input id="classroom" value={classroomName} onChange={(e) => setClassroomName(e.target.value)} placeholder="예: 햇님반" />
                </div>
                <div>
                  <Label htmlFor="focus">상담 포커스 (쉼표로 구분)</Label>
                  <Textarea id="focus" rows={2} value={focusInput} onChange={(e) => setFocusInput(e.target.value)}
                    placeholder="예: 사회성, 언어 발달, 분리불안" />
                </div>
                <div>
                  <Label htmlFor="cdate">상담 예정일 (선택)</Label>
                  <Input id="cdate" type="datetime-local" value={consultDate} onChange={(e) => setConsultDate(e.target.value)} />
                </div>
                <Button className="w-full" onClick={createCase} disabled={creating}>
                  {creating ? <><Sparkles className="w-4 h-4 mr-1 animate-spin" /> AI 검사 생성 중...</> : '생성 + AI 검사 큐레이션'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Alert className="border-amber-200 bg-amber-50/50">
          <Sparkles className="h-4 w-4 text-amber-700" />
          <AlertTitle className="text-amber-900">4단계 부모상담 플로우</AlertTitle>
          <AlertDescription className="text-amber-800 text-sm">
            ① 케이스 생성 → ② 학부모에게 링크 발송 → ③ 응답 완료 시 PDF 2종 자동 생성 → ④ 30·60일 후 자동 재검사
          </AlertDescription>
        </Alert>

        {cases.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">
            아직 케이스가 없어요. 우측 상단 '새 케이스' 버튼으로 시작하세요.
          </CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {cases.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base">{c.child_nickname}</h3>
                        <span className="text-xs text-muted-foreground">{c.child_age_months}개월</span>
                        {c.classroom_name && <Badge variant="outline" className="text-xs">{c.classroom_name}</Badge>}
                      </div>
                      {c.consultation_focus && c.consultation_focus.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          포커스: {c.consultation_focus.join(' · ')}
                        </p>
                      )}
                      {c.scheduled_consultation_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.scheduled_consultation_at).toLocaleString('ko-KR')}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(c.status)}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" onClick={() => copyInviteLink(c.id)}>
                      <Copy className="w-3 h-3 mr-1" /> 부모 링크 복사
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/b2b-kindergarten-console/case/${c.id}`)}>
                      상세 보기 <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default B2BKindergartenConsole;
