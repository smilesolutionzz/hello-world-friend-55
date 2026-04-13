import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

      {/* Unified Report */}
      <ParentReportRenderer
        reportData={reportData}
        userName={userInput.name}
        userAge={userAge}
        gender={userInput.gender}
      />

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
