import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Building2, ArrowLeft, RefreshCw, Inbox } from 'lucide-react';
import { toast } from 'sonner';

type RequestRow = {
  id: string;
  institution_name: string;
  institution_type: string;
  contact_name: string;
  contact_email: string;
  request_type: string;
  status: string | null;
  message: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  school: '학교/교육기관',
  counseling: '상담센터',
  welfare: '복지기관',
  corporate: '기업/HR',
};
const REQUEST_LABEL: Record<string, string> = {
  free_trial: '14일 무료 체험',
  paid_inquiry: '도입 상담',
  demo_download: '데모 리포트',
};
const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  pending: { text: '접수됨', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  reviewing: { text: '검토 중', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  contacted: { text: '연락 완료', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  completed: { text: '처리 완료', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { text: '반려', className: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const B2BMyRequests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [authed, setAuthed] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [searchEmail, setSearchEmail] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email ?? null;
      setAuthed(!!session?.user);

      const targetEmail = userEmail || searchEmail;
      if (!targetEmail) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('b2b_demo_requests')
        .select('id, institution_name, institution_type, contact_name, contact_email, request_type, status, message, created_at')
        .eq('contact_email', targetEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRows((data || []) as RequestRow[]);
    } catch (e: any) {
      console.error('[B2BMyRequests] load failed', e);
      toast.error('신청 내역을 불러오지 못했습니다', { description: e?.message });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [searchEmail]);

  const handleSearch = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      toast.error('이메일 형식을 확인해 주세요.');
      return;
    }
    setSearchEmail(emailInput.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="내 B2B 신청 내역 | AIHPRO"
        description="학교·상담센터·복지기관·기업의 무료 체험 및 도입 상담 신청 내역과 처리 상태를 확인하세요."
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/b2b-demo-report" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-1" /> B2B 데모로 돌아가기
          </Link>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> 새로고침
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Inbox className="w-5 h-5 text-primary" /> 내 신청 내역
            </CardTitle>
            <p className="text-sm text-muted-foreground break-keep mt-1">
              제출하신 무료 체험·도입 상담·데모 리포트 신청의 접수 및 처리 상태를 확인할 수 있습니다.
            </p>
          </CardHeader>
          <CardContent>
            {!authed && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 mb-2 break-keep">
                  로그인하지 않은 상태입니다. 신청 시 사용한 이메일을 입력하면 해당 내역을 조회할 수 있습니다.
                  (* 본인 확인을 위해 로그인을 권장합니다.)
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="sr-only">이메일</Label>
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="신청 시 입력한 이메일"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={loading}>조회</Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-12 flex items-center justify-center text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> 불러오는 중…
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Mail className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">아직 접수된 신청이 없습니다.</p>
                <Button asChild className="mt-4" variant="outline" size="sm">
                  <Link to="/b2b-demo-report">데모 리포트 페이지로 이동</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {rows.map((r) => {
                  const status = STATUS_LABEL[r.status || 'pending'] || STATUS_LABEL.pending;
                  return (
                    <li key={r.id} className="border rounded-xl p-4 hover:border-primary/40 transition-colors bg-white">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="font-semibold text-slate-900 break-keep">{r.institution_name}</span>
                            <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[r.institution_type] || r.institution_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            담당자 {r.contact_name} · {r.contact_email}
                          </p>
                        </div>
                        <Badge className={status.className} variant="outline">{status.text}</Badge>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2 mt-2">
                        <div className="text-xs text-slate-600">
                          <span className="font-medium text-slate-700">신청 종류</span> · {REQUEST_LABEL[r.request_type] || r.request_type}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(r.created_at).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      {r.message && (
                        <p className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded-md whitespace-pre-wrap break-keep">
                          {r.message}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="text-[11px] text-center text-muted-foreground break-keep">
          확인 메일이 도착하지 않았다면 스팸함을 확인해 주세요. 추가 문의: kijung_kku@naver.com
        </p>
      </div>
    </div>
  );
};

export default B2BMyRequests;
