import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/common/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { sanitizeAIContent } from '@/utils/sanitizeHtml';
import { ReportVerificationBadge } from '@/components/report/ReportVerificationBadge';
import { useParams as _useParams } from 'react-router-dom';
import {
  FileText, ChevronDown, ChevronUp, Calendar, Lock, Eye, Shield,
  Brain, Heart, TrendingUp, Target, LineChart, Users, Activity, BarChart3
} from 'lucide-react';

const SECTION_ICONS: Record<string, React.ElementType> = {
  Brain, Heart, TrendingUp, Target, LineChart, Users, Shield, Activity, BarChart3
};

interface ShareLink {
  id: string;
  share_type: string;
  title: string;
  description: string;
  expires_at: string | null;
  max_views: number | null;
  current_views: number;
  is_active: boolean;
  created_at: string;
}

interface ReportEntry {
  report_order: number;
  report_history_id: string;
  report_data: any;
}

const SharedReport = () => {
  const { token } = useParams<{ token: string }>();
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [activeReport, setActiveReport] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    if (token) loadSharedReport(token);
  }, [token]);

  const loadSharedReport = async (shareToken: string) => {
    try {
      // 1) 공유 링크 조회
      const { data: linkData, error: linkError } = await supabase
        .from('report_share_links')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        setError('유효하지 않거나 만료된 링크입니다.');
        setLoading(false);
        return;
      }

      // 만료 체크
      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        setError('이 링크는 만료되었습니다.');
        setLoading(false);
        return;
      }

      // 1회성 조회 체크
      if (linkData.share_type === 'one_time' && linkData.current_views >= (linkData.max_views || 1)) {
        setError('이 링크는 이미 사용되었습니다.');
        setLoading(false);
        return;
      }

      setShareLink(linkData as ShareLink);

      // 2) 연결된 리포트 목록 조회
      const { data: reportLinks } = await supabase
        .from('report_share_reports')
        .select('report_order, report_history_id')
        .eq('share_link_id', linkData.id)
        .order('report_order', { ascending: true });

      if (reportLinks && reportLinks.length > 0) {
        const reportIds = reportLinks.map(r => r.report_history_id);
        const { data: reportData } = await supabase
          .from('premium_report_history')
          .select('*')
          .in('id', reportIds);

        if (reportData) {
          const merged = reportLinks.map(rl => ({
            ...rl,
            report_data: reportData.find(r => r.id === rl.report_history_id)
          })).filter(r => r.report_data);
          setReports(merged as ReportEntry[]);
        }
      }

      // 3) 열람 로그 기록 + 조회수 증가
      await supabase.from('report_share_views').insert({
        share_link_id: linkData.id,
        viewer_agent: navigator.userAgent
      });

      // 조회수 증가는 authenticated 유저만 가능하므로 별도 처리 불필요 (RLS)
    } catch (err) {
      setError('리포트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const currentReport = reports[activeReport]?.report_data;
  const reportContent = currentReport?.report_content || currentReport?.analysis_result;

  // 리포트 콘텐츠 파싱
  const parseSections = (content: any): { title: string; body: string; icon: string }[] => {
    if (!content) return [];
    
    // JSON string이면 파싱
    let parsed = content;
    if (typeof content === 'string') {
      try { parsed = JSON.parse(content); } catch { 
        // 마크다운 형식이면 섹션으로 분리
        const sections = content.split(/(?=#{1,3}\s)/).filter(Boolean);
        return sections.map((s: string, i: number) => {
          const lines = s.trim().split('\n');
          const title = lines[0].replace(/^#+\s*/, '').trim();
          const body = lines.slice(1).join('\n').trim();
          return { title, body, icon: 'Brain' };
        });
      }
    }

    if (Array.isArray(parsed)) {
      return parsed.map((s: any) => ({
        title: s.title || s.section_title || `섹션 ${s.order || ''}`,
        body: s.content || s.body || s.analysis || '',
        icon: s.icon || 'Brain'
      }));
    }

    if (parsed.sections) return parseSections(parsed.sections);
    
    // 단일 텍스트
    return [{ title: '분석 결과', body: String(parsed), icon: 'Brain' }];
  };

  const sections = parseSections(reportContent);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-bold">{error}</h2>
            <p className="text-sm text-muted-foreground">
              링크가 만료되었거나 삭제되었습니다. 리포트 소유자에게 새 링크를 요청해주세요.
            </p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              홈으로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="AIHPRO 공유 리포트" description="AI 기반 프리미엄 심리·발달 분석 리포트" />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* 헤더 */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">AIHPRO</span>
              <Badge variant="secondary" className="text-[10px]">공유 리포트</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>{shareLink?.current_views || 0}회 열람</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-20">
          {/* 리포트 메타 정보 */}
          <div className="pt-6 pb-4">
            <h1 className="text-xl font-bold text-foreground">
              {shareLink?.title || '프리미엄 분석 리포트'}
            </h1>
            {shareLink?.description && (
              <p className="text-sm text-muted-foreground mt-1">{shareLink.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(shareLink?.created_at || '').toLocaleDateString('ko-KR')}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {shareLink?.share_type === 'permanent' ? '영구 링크' : 
                 shareLink?.share_type === 'temporary' ? '기간 한정' : '1회성'}
              </Badge>
              {shareLink?.expires_at && (
                <span className="text-orange-500">
                  ~{new Date(shareLink.expires_at).toLocaleDateString('ko-KR')} 까지
                </span>
              )}
            </div>
          </div>

          {/* 회차별 네비게이션 */}
          {reports.length > 1 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {reports.map((r, i) => {
                  const date = r.report_data?.created_at 
                    ? new Date(r.report_data.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                    : `${i + 1}회차`;
                  return (
                    <button
                      key={i}
                      onClick={() => { setActiveReport(i); setExpandedSections(new Set([0])); }}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                        activeReport === i 
                          ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                          : 'bg-card border-border/40 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold">{i + 1}회차</span>
                        <span className="text-[10px] opacity-80">{date}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* 변화 추이 바 */}
              <div className="mt-3 p-3 bg-card rounded-xl border border-border/40">
                <p className="text-[10px] text-muted-foreground mb-2 font-medium">📊 검사 이력 타임라인</p>
                <div className="flex items-center gap-1">
                  {reports.map((_, i) => (
                    <React.Fragment key={i}>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        i <= activeReport ? 'bg-primary' : 'bg-muted'
                      }`} />
                      {i < reports.length - 1 && (
                        <div className={`flex-1 h-0.5 ${
                          i < activeReport ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 리포트 본문 */}
          {currentReport ? (
            <div className="space-y-3">
              {/* 총점 요약 카드 */}
              {(currentReport.total_score != null || currentReport.risk_level) && (
                <Card className="border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">종합 점수</p>
                        <p className="text-3xl font-black text-foreground mt-1">
                          {currentReport.total_score ?? '-'}
                        </p>
                      </div>
                      {currentReport.risk_level && (
                        <Badge className={`text-xs ${
                          currentReport.risk_level === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                          currentReport.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-green-100 text-green-700 border-green-200'
                        }`}>
                          {currentReport.risk_level === 'high' ? '⚠️ 고위험' :
                           currentReport.risk_level === 'medium' ? '⚡ 경계' : '✅ 정상'}
                        </Badge>
                      )}
                    </div>
                    {/* 영역별 점수 */}
                    {currentReport.dimension_scores && (
                      <div className="mt-4 space-y-2">
                        {Object.entries(currentReport.dimension_scores as Record<string, number>).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-20 truncate">{key}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(100, (Number(val) / 100) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold w-8 text-right">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 섹션별 콘텐츠 */}
              {sections.map((section, idx) => {
                const IconComp = SECTION_ICONS[section.icon] || FileText;
                const isOpen = expandedSections.has(idx);
                return (
                  <Collapsible key={idx} open={isOpen} onOpenChange={() => toggleSection(idx)}>
                    <Card className="border-border/40 overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left">
                          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <IconComp className="w-4 h-4 text-primary" />
                            {section.title}
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4 px-4">
                          <div 
                            className="text-[13px] leading-[1.8] text-foreground/85 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sanitizeAIContent(section.body) }}
                          />
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">리포트 데이터를 찾을 수 없습니다.</p>
              </CardContent>
            </Card>
          )}

          {/* STEP 6: 검증 메타데이터 + QR */}
          {shareLink && token && (
            <div className="mt-6">
              <ReportVerificationBadge
                meta={{
                  reportId: shareLink.id,
                  shareToken: token,
                  generatedAt: shareLink.created_at,
                  modelVersion: 'Gemini 3.1 Pro + RCI v1.96',
                  dataPoints: reports.length,
                  statisticalBasis: 'Jacobson & Truax 1991 (RCI)',
                }}
              />
            </div>
          )}
          <div className="mt-8 text-center space-y-3">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
              <p className="text-sm font-semibold text-foreground mb-1">
                🧠 나도 AI 심리 분석 받아보기
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                AIHPRO에서 무료 검사 후 프리미엄 리포트를 받아보세요
              </p>
              <Button 
                onClick={() => window.open('https://aihpro.app', '_blank')}
                className="bg-primary text-primary-foreground"
                size="sm"
              >
                무료로 시작하기
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/50">
              © AIHPRO.APP · 발달 코칭 및 의사결정 보조 도구 · 의료 진단을 대체하지 않습니다.
            </p>
            {token && (
              <p className="text-[10px] text-muted-foreground/40">
                리포트 진위 확인: <a href={`/verify-report/${token}`} className="underline">aihpro.app/verify-report/{token.slice(0, 8)}...</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SharedReport;
