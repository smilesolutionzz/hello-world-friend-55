import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileDown, Copy, Share2, Mail, Loader2, MessageSquare, Crown,
  Eye, BarChart3, TrendingUp, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import ParentReportRenderer from '@/components/report/ParentReportRenderer';
import VisualSummaryButton from '@/components/visual-summary/VisualSummaryButton';
import ReportShareModal from '@/components/report/ReportShareModal';
import ReportCurationSection from '@/components/report/ReportCurationSection';
import { supabase } from '@/integrations/supabase/client';
import html2pdf from 'html2pdf.js';

interface ReportProOutputProps {
  reportData: any;
  userInput: {
    name: string;
    birthDate: string;
    gender: string;
    recentConcerns: string;
  };
}

// Scenario detection logic
function detectScenario(reportData: any): {
  overall: 'improved' | 'stable' | 'declined' | 'mixed' | 'first_test';
  domains: Array<{ name: string; status: 'improved' | 'stable' | 'declined'; change: number }>;
  severity: 'mild' | 'moderate' | 'severe';
} {
  const comparison = reportData?.preprocessedData?.reportComparison;
  
  if (!comparison?.has_comparison) {
    return { overall: 'first_test', domains: [], severity: 'mild' };
  }

  const changes = comparison.dimension_changes || [];
  const improved = changes.filter((d: any) => d.status === 'improved').length;
  const declined = changes.filter((d: any) => d.status === 'declined').length;
  const total = changes.length || 1;

  let overall: 'improved' | 'stable' | 'declined' | 'mixed';
  if (declined === 0 && improved > 0) overall = 'improved';
  else if (improved === 0 && declined > 0) overall = 'declined';
  else if (improved > 0 && declined > 0) overall = 'mixed';
  else overall = 'stable';

  // Severity based on change magnitude
  const maxDecline = Math.max(0, ...changes.filter((d: any) => d.status === 'declined').map((d: any) => Math.abs(d.change || 0)));
  let severity: 'mild' | 'moderate' | 'severe' = 'mild';
  if (maxDecline > 40) severity = 'severe';
  else if (maxDecline > 20) severity = 'moderate';

  return {
    overall,
    domains: changes.map((d: any) => ({ name: d.dimension, status: d.status, change: d.change })),
    severity,
  };
}

function getScenarioBanner(scenario: ReturnType<typeof detectScenario>, isEnglish: boolean) {
  const t = (ko: string, en: string) => isEnglish ? en : ko;

  switch (scenario.overall) {
    case 'improved':
      return {
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
        bg: 'bg-emerald-50 border-emerald-200',
        title: t('🎉 의미 있는 성장이 확인되었습니다', '🎉 Meaningful Growth Detected'),
        desc: t('부모님의 노력이 빛을 발하고 있습니다. 아래 리포트에서 상세한 변화를 확인하세요.', 
               'Your efforts are paying off. Check detailed changes in the report below.'),
      };
    case 'stable':
      return {
        icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
        bg: 'bg-blue-50 border-blue-200',
        title: t('📊 안정적인 상태가 유지되고 있습니다', '📊 Stable Condition Maintained'),
        desc: t('유지도 중요한 성과입니다. 한 단계 더 나아갈 수 있는 방법을 안내드립니다.', 
               'Maintenance is also an achievement. We\'ll guide you on how to take the next step.'),
      };
    case 'declined':
      return {
        icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
        bg: 'bg-amber-50 border-amber-200',
        title: t('📋 일부 영역에서 변화가 감지되었습니다', '📋 Changes Detected in Some Areas'),
        desc: t('이것은 "나빠졌다"는 의미가 아닙니다. 조기에 알아차리고 대응하면 충분히 개선할 수 있습니다. 발견이 늦은 것보다, 지금 알게 된 것이 다행입니다.', 
               'This doesn\'t mean things have gotten worse. Early detection enables effective intervention. It\'s better to know now than to find out later.'),
      };
    case 'mixed':
      return {
        icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
        bg: 'bg-indigo-50 border-indigo-200',
        title: t('⚖️ 성장과 주의가 함께 나타났습니다', '⚖️ Growth and Attention Areas Coexist'),
        desc: t('일부 영역은 좋아지고 있고, 일부는 관심이 필요합니다. 균형 있는 지원이 중요합니다.', 
               'Some areas are improving while others need attention. Balanced support is key.'),
      };
    default:
      return {
        icon: <Eye className="w-6 h-6 text-slate-600" />,
        bg: 'bg-slate-50 border-slate-200',
        title: t('📝 첫 번째 평가 리포트입니다', '📝 This is Your First Assessment Report'),
        desc: t('기준선이 설정되었습니다. 다음 검사에서 변화 추이를 비교 분석합니다.', 
               'Your baseline has been set. Changes will be tracked in future assessments.'),
      };
  }
}

const ReportProOutput: React.FC<ReportProOutputProps> = ({ reportData, userInput }) => {
  const { isEnglish } = useLanguage();
  const { toast } = useToast();
  const t = (ko: string, en: string) => isEnglish ? en : ko;

  const [showShareModal, setShowShareModal] = useState(false);
  const [familyEmail, setFamilyEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState('visual');

  const scenario = detectScenario(reportData);
  const banner = getScenarioBanner(scenario, isEnglish);

  // Calculate age from birthDate
  const userAge = userInput.birthDate
    ? Math.floor((Date.now() - new Date(userInput.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  const copyToClipboard = async () => {
    let text = t(`종합 분석 리포트\n대상: ${userInput.name}\n\n`, `Report\nSubject: ${userInput.name}\n\n`);
    reportData.sections?.forEach((s: any, i: number) => { text += `${i + 1}. ${s.title}\n${s.content?.replace(/<[^>]*>/g, '')}\n\n`; });
    await navigator.clipboard.writeText(text);
    toast({ title: t("📋 클립보드에 복사됨", "📋 Copied") });
  };

  const shareReport = async () => {
    if (navigator.share) {
      await navigator.share({ title: t('종합 분석 리포트', 'Analysis Report'), text: t(`${userInput.name}님의 리포트`, `Report for ${userInput.name}`), url: window.location.href });
    } else { copyToClipboard(); }
  };

  const sendFamilyEmail = async () => {
    if (!familyEmail) { toast({ title: t("이메일 주소를 입력해주세요", "Enter email"), variant: "destructive" }); return; }
    setIsSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-share-email', {
        body: {
          email: familyEmail, type: 'report',
          title: t(`${userInput.name}님의 종합 분석 리포트`, `Report for ${userInput.name}`),
          recipientName: '', senderName: userInput.name,
          content: { summary: reportData.summary?.replace(/<[^>]*>/g, ''), sections: reportData.sections?.map((s: any) => ({ title: s.title, content: s.content?.replace(/<[^>]*>/g, '').substring(0, 800) })) || [] }
        }
      });
      if (error) throw error;
      toast({ title: t("✅ 이메일 전송 완료", "✅ Sent") });
      setFamilyEmail('');
    } catch { toast({ title: t("전송 실패", "Failed"), variant: "destructive" }); }
    finally { setIsSendingEmail(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Floating Action Bar */}
      <div className="sticky top-4 z-20 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button onClick={copyToClipboard} size="sm" className="bg-slate-700 hover:bg-slate-600 text-white gap-1.5 text-xs font-semibold h-9">
            <Copy className="w-3.5 h-3.5" /> {t('복사', 'Copy')}
          </Button>
          <Button onClick={shareReport} size="sm" className="bg-slate-700 hover:bg-slate-600 text-white gap-1.5 text-xs font-semibold h-9">
            <Share2 className="w-3.5 h-3.5" /> {t('공유', 'Share')}
          </Button>
          <Button onClick={() => setShowShareModal(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs font-semibold h-9">
            <Mail className="w-3.5 h-3.5" /> {t('링크 공유', 'Share Link')}
          </Button>
          <a href="https://open.kakao.com/o/sHLdK3Ch" target="_blank" rel="noopener noreferrer" className="w-full">
            <Button size="sm" className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold gap-1.5 text-xs h-9">
              <MessageSquare className="w-3.5 h-3.5" /> {t('카카오톡', 'KakaoTalk')}
            </Button>
          </a>
        </div>
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <Mail className="w-4 h-4 text-white/40 shrink-0" />
          <input type="email" value={familyEmail} onChange={(e) => setFamilyEmail(e.target.value)}
            placeholder={t('가족 이메일로 전송', 'Send to family email')}
            className="flex-1 p-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/30 focus:border-primary/50 focus:outline-none" />
          <Button onClick={sendFamilyEmail} disabled={isSendingEmail} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4">
            {isSendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('전송', 'Send')}
          </Button>
        </div>
      </div>

      {/* Scenario Banner */}
      <div className={`p-5 rounded-xl border-2 ${banner.bg}`}>
        <div className="flex items-start gap-3">
          {banner.icon}
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-1">{banner.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{banner.desc}</p>
            {scenario.overall === 'declined' && scenario.severity === 'severe' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-semibold">
                  {t('⚠️ 전문 기관 상담을 권장드립니다', '⚠️ Professional consultation is recommended')}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {t('자살예방상담전화 1393 · 정신건강위기상담전화 1577-0199', 'Crisis Hotline: 1393 · Mental Health: 1577-0199')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 border border-white/10 rounded-xl p-1 gap-0">
          <TabsTrigger value="visual" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-white/60 text-sm font-semibold rounded-lg py-2.5">
            📊 {t('학부모용 비주얼 리포트', 'Visual Report')}
          </TabsTrigger>
          <TabsTrigger value="detail" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-white/60 text-sm font-semibold rounded-lg py-2.5">
            📋 {t('전문 상세 분석', 'Detailed Analysis')}
          </TabsTrigger>
        </TabsList>

        {/* 학부모용 비주얼 리포트 */}
        <TabsContent value="visual" className="mt-6">
          <ParentReportRenderer
            reportData={reportData}
            userName={userInput.name}
            userAge={userAge}
            gender={userInput.gender}
          />
        </TabsContent>

        {/* 전문 상세 분석 (기존 텍스트 리포트) */}
        <TabsContent value="detail" className="mt-6">
          <div id="report-content" className="bg-white rounded-2xl p-6 md:p-12 shadow-2xl space-y-8">
            {/* Cover */}
            <div className="text-center space-y-6 pb-8 border-b-4 border-slate-200">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                <Crown className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">PREMIUM PERSONAL REPORT</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t('AI 종합 분석 리포트', 'AI Comprehensive Report')}</h1>
              <div className="flex justify-center gap-4 flex-wrap text-sm text-slate-500">
                <span>{t('대상', 'Subject')}: {userInput.name}</span>
                <span>{t('생성일', 'Generated')}: {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR')}</span>
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                <Badge variant="outline">{t('검사', 'Tests')} {reportData.dataSource?.assessments || 0}{t('건', '')}</Badge>
                <Badge variant="outline">{t('관찰', 'Obs.')} {reportData.dataSource?.observations || 0}{t('건', '')}</Badge>
                <Badge variant="outline">{t('상담', 'Chats')} {reportData.dataSource?.chatMessages || 0}{t('건', '')}</Badge>
              </div>
            </div>

            {/* Sections */}
            {reportData.sections?.map((section: any, index: number) => {
              const colors = [
                { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800' },
                { bg: 'bg-rose-50', border: 'border-rose-200', title: 'text-rose-800' },
                { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-800' },
                { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800' },
                { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-800' },
              ][index % 5];
              return (
                <div key={index} className="space-y-4" data-report-section={index}>
                  <h3 className={`text-2xl font-bold ${colors.title}`}>
                    {index + 1}. {section.title}
                  </h3>
                  <div className={`p-6 rounded-xl border-2 ${colors.bg} ${colors.border}`}>
                    <div className="prose prose-slate max-w-none leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: section.content }} />
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            {reportData.summary && (
              <div className="space-y-6 pt-12 border-t-4 border-slate-200">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" /> {t('종합 요약', 'Summary')}
                </h2>
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-xl border-2 border-slate-200">
                  <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: reportData.summary }} />
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="text-center pt-12 border-t-2 border-slate-200 space-y-4">
              <p className="text-sm text-slate-600 max-w-3xl mx-auto">
                {t('본 리포트는 AI 기반 자동 분석 결과이며, 의학적 진단이나 전문가의 정확한 평가를 대체할 수 없습니다.',
                   'This report is AI-based and cannot replace professional evaluation.')}
              </p>
              <p className="text-xs text-slate-500">Generated by AIHPRO | © 2025</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Curation */}
      <ReportCurationSection concerns={userInput.recentConcerns} />

      {/* Share Modal */}
      <ReportShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        reportHistoryIds={[]}
        reportTitle={t(`${userInput.name}님의 종합 분석 리포트`, `Report for ${userInput.name}`)}
      />
    </div>
  );
};

export default ReportProOutput;
