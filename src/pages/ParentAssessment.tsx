import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { School, CheckCircle2, Heart, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question { id: string; text: string; reverse?: boolean }
interface Domain { key: string; label: string; questions: Question[] }
interface Curated { title: string; domains: Domain[]; estimated_minutes?: number }
interface Invite {
  invite_id: string;
  case_id: string;
  round_label: string;
  curated_assessment: Curated;
  child_nickname: string;
  child_age_months: number;
  institution_name: string;
}

const SCALE = [
  { value: 0, label: '전혀 그렇지 않다' },
  { value: 1, label: '그렇지 않다' },
  { value: 2, label: '그렇다' },
  { value: 3, label: '매우 그렇다' },
];

const ParentAssessment = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!token) { setError('초대 링크가 유효하지 않습니다'); setLoading(false); return; }
    (async () => {
      const { data, error: rpcErr } = await supabase.rpc('get_parent_invite_by_token', { p_token: token });
      if (rpcErr || !data || (Array.isArray(data) && data.length === 0)) {
        setError('만료되었거나 유효하지 않은 링크입니다');
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        setInvite(row as unknown as Invite);
      }
      setLoading(false);
    })();
  }, [token]);

  const allQuestions: Array<{ q: Question; d: Domain }> = invite
    ? invite.curated_assessment.domains.flatMap(d => d.questions.map(q => ({ q, d })))
    : [];

  const totalQ = allQuestions.length;
  const answeredQ = Object.keys(responses).length;
  const progress = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;
  const allAnswered = totalQ > 0 && answeredQ === totalQ;

  const handleSubmit = async () => {
    if (!invite || !allAnswered) return;
    setSubmitting(true);
    try {
      // 영역별 점수 계산 (0~100 정규화)
      const scores: Record<string, number> = {};
      for (const d of invite.curated_assessment.domains) {
        let sum = 0; let max = 0;
        for (const q of d.questions) {
          const v = responses[q.id] ?? 0;
          sum += q.reverse ? (3 - v) : v;
          max += 3;
        }
        scores[d.key] = max > 0 ? Math.round((sum / max) * 100) : 0;
      }

      const { error: rpcErr } = await supabase.rpc('submit_parent_assessment', {
        p_token: token!,
        p_responses: responses,
        p_scores: scores,
      });
      if (rpcErr) throw rpcErr;

      // 액션 플랜 자동 생성 (백그라운드)
      supabase.functions.invoke('kindergarten-generate-action-plan', {
        body: { caseId: invite.case_id, roundLabel: invite.round_label },
      }).catch(console.error);

      setCompleted(true);
      toast({ title: '응답이 제출됐어요', description: '담임 선생님께 결과가 전달됩니다' });
    } catch (e) {
      toast({ title: '제출 실패', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-6 max-w-2xl mx-auto"><Skeleton className="h-96 w-full" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-rose-50 to-white">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <p className="font-bold mb-2">링크 확인 실패</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-white">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">응답 완료 ✓</h2>
            <p className="text-sm text-muted-foreground mb-4 break-keep">
              담임 선생님께 결과가 전달됐어요.<br />
              상담 자리에서 함께 리포트를 확인하세요.
            </p>
            <Badge className="bg-emerald-100 text-emerald-700">
              30일 후 개선도 확인 링크가 다시 발송됩니다
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 to-white pb-32">
      <Helmet>
        <title>{invite.child_nickname} 발달 체크 | {invite.institution_name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="gap-1">
              <School className="w-3 h-3" /> {invite.institution_name}
            </Badge>
            <span className="text-xs text-muted-foreground">{invite.round_label} · {answeredQ}/{totalQ}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 mt-4">
        <Card className="bg-gradient-to-br from-amber-100/40 to-rose-100/30 border-amber-200">
          <CardContent className="p-5">
            <Heart className="w-6 h-6 text-rose-500 mb-2" />
            <h1 className="text-xl font-bold mb-1 break-keep">
              {invite.child_nickname}({invite.child_age_months}개월)의 발달 체크
            </h1>
            <p className="text-sm text-muted-foreground break-keep">
              담임 선생님과의 상담을 더 깊이 있게 만들기 위한 5분 체크입니다.
              가정에서 평소 관찰하신 모습으로 응답해주세요.
            </p>
          </CardContent>
        </Card>

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription className="text-xs">
            응답은 익명으로 처리되며 담임 선생님과 부모님만 결과를 확인할 수 있습니다.
          </AlertDescription>
        </Alert>

        {invite.curated_assessment.domains.map((d) => (
          <div key={d.key} className="space-y-3">
            <h2 className="text-sm font-bold text-amber-800 border-b pb-2 sticky top-[72px] bg-amber-50/80 backdrop-blur z-[5] -mx-4 px-4 py-2">
              {d.label}
            </h2>
            {d.questions.map((q, idx) => (
              <Card key={q.id}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3 break-keep">
                    <span className="text-muted-foreground mr-1">{idx + 1}.</span>{q.text}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SCALE.map((s) => (
                      <Button
                        key={s.value}
                        type="button"
                        size="sm"
                        variant={responses[q.id] === s.value ? 'default' : 'outline'}
                        onClick={() => setResponses(r => ({ ...r, [q.id]: s.value }))}
                        className="text-xs h-auto py-2 px-1 break-keep whitespace-normal"
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
        <div className="max-w-2xl mx-auto">
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
            size="lg"
          >
            {submitting ? '제출 중...' : allAnswered ? <>응답 제출하기 <ArrowRight className="w-4 h-4 ml-1" /></> : `${totalQ - answeredQ}개 남음`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParentAssessment;
