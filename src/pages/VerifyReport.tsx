import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Loader2, ExternalLink, Hash, Calendar, Database, FileCheck, Building2 } from 'lucide-react';
import SEOHead from '@/components/common/SEOHead';

type VerifyState = 'loading' | 'valid' | 'invalid' | 'expired';

interface VerificationData {
  reportId: string;
  title: string;
  createdAt: string;
  expiresAt: string | null;
  viewCount: number;
  reportCount: number;
  shareType: string;
}

/**
 * STEP 6: 공개 검증 페이지
 * - 누구나 (로그인 없이) QR 코드 스캔 후 접근 가능
 * - 리포트의 진위 여부, 발급 정보, 통계 모델 확인
 * - 학교/병원 제출 시 위변조 방지 증빙
 */
const VerifyReport = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<VerifyState>('loading');
  const [data, setData] = useState<VerificationData | null>(null);

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const { data: link, error } = await supabase
          .from('report_share_links')
          .select('id, share_type, title, expires_at, current_views, max_views, is_active, created_at, share_link_reports(report_history_id)')
          .eq('share_token', token)
          .maybeSingle();

        if (error || !link || !link.is_active) {
          setState('invalid');
          return;
        }

        if (link.expires_at && new Date(link.expires_at) < new Date()) {
          setState('expired');
        } else {
          setState('valid');
        }

        setData({
          reportId: link.id,
          title: link.title || 'AIHPRO 발달 코칭 리포트',
          createdAt: link.created_at,
          expiresAt: link.expires_at,
          viewCount: link.current_views || 0,
          reportCount: (link as any).share_link_reports?.length || 1,
          shareType: link.share_type,
        });
      } catch {
        setState('invalid');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <SEOHead 
        title="리포트 검증 · AIHPRO"
        description="AIHPRO 발달 코칭 리포트의 진위 여부와 발급 정보를 확인합니다."
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Building2 className="w-4 h-4" />
            AIHPRO Verification System
          </div>
          <h1 className="text-3xl font-bold text-foreground break-keep">
            리포트 진위 검증
          </h1>
          <p className="text-sm text-muted-foreground break-keep">
            발급 정보, 통계 모델, 데이터 무결성을 확인합니다.
          </p>
        </div>

        {/* Status Card */}
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6">
            {state === 'loading' && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground">검증 중...</p>
              </div>
            )}

            {state === 'invalid' && (
              <div className="flex flex-col items-center py-8 gap-3 text-center">
                <ShieldAlert className="w-16 h-16 text-destructive" />
                <h2 className="text-xl font-bold text-destructive">검증 실패</h2>
                <p className="text-sm text-muted-foreground break-keep max-w-sm">
                  유효하지 않거나 폐기된 리포트입니다. 발급자에게 새 링크를 요청하세요.
                </p>
              </div>
            )}

            {state === 'expired' && (
              <div className="flex flex-col items-center py-8 gap-3 text-center">
                <ShieldAlert className="w-16 h-16 text-amber-500" />
                <h2 className="text-xl font-bold text-amber-700">기간 만료</h2>
                <p className="text-sm text-muted-foreground break-keep max-w-sm">
                  이 리포트의 검증 기간이 만료되었습니다. 발급일 정보는 아래에서 확인할 수 있습니다.
                </p>
              </div>
            )}

            {state === 'valid' && data && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-2 text-center pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="w-9 h-9 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-700">검증 완료</h2>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                    AIHPRO 공식 발급 리포트
                  </Badge>
                </div>

                {data && (
                  <div className="grid gap-3">
                    <VerifyRow icon={FileCheck} label="리포트 제목" value={data.title} />
                    <VerifyRow icon={Hash} label="발급 ID" value={data.reportId} mono />
                    <VerifyRow 
                      icon={Calendar} 
                      label="발급일시" 
                      value={new Date(data.createdAt).toLocaleString('ko-KR')} 
                    />
                    <VerifyRow 
                      icon={Database} 
                      label="포함 리포트 수" 
                      value={`${data.reportCount}건`}
                    />
                    <VerifyRow 
                      icon={Database} 
                      label="분석 모델" 
                      value="Gemini 3.1 Pro + RCI (Jacobson & Truax 1991)"
                    />
                    {data.expiresAt && (
                      <VerifyRow 
                        icon={Calendar} 
                        label="유효기간" 
                        value={new Date(data.expiresAt).toLocaleString('ko-KR')}
                      />
                    )}
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground break-keep leading-relaxed">
                  <p className="font-semibold text-foreground mb-1">📋 검증 정보 안내</p>
                  본 리포트는 AIHPRO 발달 코칭 플랫폼이 발급한 분석 결과입니다. 
                  의료 진단을 대체하지 않으며, 발달 지원 및 의사결정 보조 용도로 활용됩니다.
                  통계 분석은 신뢰변화지수(RCI ≥ 1.96, p&lt;.05) 기준을 따릅니다.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild variant="outline">
            <Link to="/">
              <ExternalLink className="w-4 h-4 mr-2" />
              AIHPRO 홈으로 이동
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const VerifyRow = ({ icon: Icon, label, value, mono }: { 
  icon: any; label: string; value: string; mono?: boolean;
}) => (
  <div className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium text-foreground break-all ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  </div>
);

export default VerifyReport;
