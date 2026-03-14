import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface DefenseMechanismResultProps {
  result: {
    categoryScores: Record<string, number>;
    primaryMechanisms: [string, number][];
    analysis: string;
    totalScore: number;
  };
  onBack?: () => void;
}

const mechanismInfoKo: Record<string, { name: string; emoji: string; description: string; healthyTip: string }> = {
  projection: { name: '투사', emoji: '🔄', description: '자신의 감정이나 생각을 다른 사람에게 돌리는 경향', healthyTip: '내 감정을 인정하고 소유하는 연습이 필요합니다' },
  denial: { name: '부정', emoji: '🙈', description: '불편한 현실을 받아들이지 않으려는 경향', healthyTip: '작은 것부터 천천히 현실을 직면하는 용기가 필요합니다' },
  rationalization: { name: '합리화', emoji: '🤔', description: '불편한 행동이나 선택을 논리적으로 정당화하는 경향', healthyTip: '진짜 감정과 논리적 설명을 구분하는 연습이 도움됩니다' },
  displacement: { name: '전위', emoji: '➡️', description: '감정을 원래 대상이 아닌 다른 곳에 표출하는 경향', healthyTip: '감정을 적절한 대상에게 건강하게 표현하는 방법을 배워보세요' },
  regression: { name: '퇴행', emoji: '👶', description: '스트레스 상황에서 어린 시절 행동으로 돌아가는 경향', healthyTip: '성숙한 대처 방식을 개발하고 자기 돌봄을 실천해보세요' },
  sublimation: { name: '승화', emoji: '✨', description: '부정적 에너지를 긍정적이고 창조적인 활동으로 전환', healthyTip: '가장 건강한 방어기제! 계속 발전시켜 나가세요' },
  repression: { name: '억압', emoji: '🔒', description: '불편한 기억이나 감정을 무의식으로 밀어내는 경향', healthyTip: '안전한 환경에서 억압된 감정을 천천히 풀어보세요' },
  reaction_formation: { name: '반동형성', emoji: '🔁', description: '진짜 감정과 반대되는 행동을 보이는 경향', healthyTip: '진짜 감정을 인정하고 진실되게 표현하는 연습이 필요합니다' },
};

const mechanismInfoEn: Record<string, { name: string; emoji: string; description: string; healthyTip: string }> = {
  projection: { name: 'Projection', emoji: '🔄', description: 'Tendency to attribute your own feelings to others', healthyTip: 'Practice acknowledging and owning your emotions' },
  denial: { name: 'Denial', emoji: '🙈', description: 'Tendency to refuse accepting uncomfortable realities', healthyTip: 'Build courage to face reality, starting small' },
  rationalization: { name: 'Rationalization', emoji: '🤔', description: 'Tendency to logically justify uncomfortable behaviors', healthyTip: 'Distinguish real emotions from logical explanations' },
  displacement: { name: 'Displacement', emoji: '➡️', description: 'Expressing emotions toward unrelated targets', healthyTip: 'Learn healthy ways to express emotions directly' },
  regression: { name: 'Regression', emoji: '👶', description: 'Reverting to childlike behaviors under stress', healthyTip: 'Develop mature coping strategies' },
  sublimation: { name: 'Sublimation', emoji: '✨', description: 'Channeling negative energy into positive activities', healthyTip: 'The healthiest defense mechanism!' },
  repression: { name: 'Repression', emoji: '🔒', description: 'Pushing uncomfortable memories into the unconscious', healthyTip: 'Gradually release repressed emotions safely' },
  reaction_formation: { name: 'Reaction Formation', emoji: '🔁', description: 'Behaving opposite to your true feelings', healthyTip: 'Practice authentic emotional expression' },
};

export const DefenseMechanismResult: React.FC<DefenseMechanismResultProps> = ({ result, onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish, localePath } = useLanguage();
  const mechanismInfo = isEnglish ? mechanismInfoEn : mechanismInfoKo;

  useAutoSaveTestResult({
    testType: isEnglish ? 'Defense Mechanism Test' : '방어기제 검사',
    results: { categoryScores: result.categoryScores, primaryMechanisms: result.primaryMechanisms, totalScore: result.totalScore },
    analysis: result.analysis,
    severity: result.totalScore > 70 ? (isEnglish ? 'High' : '높음') : result.totalScore > 40 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Good' : '양호'),
    ageGroup: 'adult',
  });

  const handleDownload = async () => {
    await downloadResultAsPDF(
      'clinical-report-content',
      isEnglish ? 'Defense_Mechanism_Results' : '방어기제_분석결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (error) => toast({ title: '다운로드 실패', description: error.message, variant: 'destructive' })
    );
  };

  const getColor = (score: number) => {
    if (score >= 80) return 'bg-destructive';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLevel = (score: number) => {
    if (score >= 80) return isEnglish ? 'Very High' : '매우 높음';
    if (score >= 60) return isEnglish ? 'High' : '높음';
    if (score >= 40) return isEnglish ? 'Moderate' : '보통';
    return isEnglish ? 'Low' : '낮음';
  };

  // Build domain scores
  const domains: DomainScore[] = Object.entries(result.categoryScores)
    .sort(([, a], [, b]) => b - a)
    .map(([key, score]) => ({
      key,
      label: mechanismInfo[key]?.name || key,
      score,
      maxScore: 100,
      level: getLevel(score),
      color: getColor(score),
      description: mechanismInfo[key]?.description,
    }));

  // Parse AI analysis into sections
  const parseAnalysisSections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sectionPatterns = [
      { regex: /##\s*🧠\s*(.+?)\n([\s\S]*?)(?=##\s*|$)/g, icon: '🧠' },
      { regex: /##\s*🔬\s*(.+?)\n([\s\S]*?)(?=##\s*|$)/g, icon: '🔬' },
      { regex: /##\s*💎\s*(.+?)\n([\s\S]*?)(?=##\s*|$)/g, icon: '💎' },
      { regex: /##\s*📊\s*(.+?)\n([\s\S]*?)(?=##\s*|$)/g, icon: '📊' },
      { regex: /##\s*🌱\s*(.+?)\n([\s\S]*?)(?=##\s*|$)/g, icon: '🌱' },
      { regex: /##\s*💪\s*(.+?)\n([\s\S]*?)(?=##\s*|$)/g, icon: '💪' },
      { regex: /##\s*🎯\s*(.+?)\n([\s\S]*?)(?=##\s*|$)/g, icon: '🎯' },
    ];

    const sections: ReportSection[] = [];
    const allSectionRegex = /##\s*([^\n]+)\n([\s\S]*?)(?=##\s*|$)/g;
    let match;
    let idx = 0;
    while ((match = allSectionRegex.exec(text)) !== null) {
      const title = match[1].replace(/^[^\w가-힣]*/, '').trim();
      const content = match[2].replace(/\*\*/g, '').trim();
      if (content.length > 10) {
        const emojiMatch = match[1].match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        sections.push({
          id: `section-${idx}`,
          icon: emojiMatch ? emojiMatch[0] : '📋',
          title,
          content,
          defaultOpen: idx === 0,
        });
        idx++;
      }
    }
    return sections;
  };

  const aiSections = parseAnalysisSections(result.analysis);
  const severityText = result.totalScore >= 70 ? (isEnglish ? 'High Usage' : '높은 사용') : result.totalScore >= 40 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Healthy' : '건강');
  const severityColor = result.totalScore >= 70 ? 'text-destructive border-destructive/30' : result.totalScore >= 40 ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Defense Mechanism Analysis' : '방어기제 분석 결과'}
      subtitle={isEnglish ? 'Unconscious Psychological Pattern Analysis' : '무의식적 심리 방어 패턴 전문 분석'}
      onBack={onBack || (() => navigate(localePath('/assessment')))}
      onDownload={handleDownload}
      totalScore={result.totalScore}
      totalLabel={isEnglish ? 'Defense Index' : '방어기제 지수'}
      scoreSeverity={severityText}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={result.analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      {/* Top 3 mechanisms - compact cards */}
      <div className="rounded-2xl border border-border/40 bg-card p-4 mb-4">
        <h2 className="text-sm font-bold text-foreground mb-3">🏆 {isEnglish ? 'Top 3 Defense Mechanisms' : '주요 방어기제 TOP 3'}</h2>
        <div className="space-y-3">
          {result.primaryMechanisms.map(([mechanism, score], index) => {
            const info = mechanismInfo[mechanism];
            if (!info) return null;
            return (
              <div key={mechanism} className="rounded-xl border border-border/30 p-3 bg-muted/10">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xl">{info.emoji}</span>
                  <span className="text-sm font-bold text-foreground flex-1">
                    #{index + 1} {info.name}
                  </span>
                  <span className="text-sm font-bold text-primary">{score}%</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 pl-8">{info.description}</p>
                <div className="pl-8">
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div className={`h-full rounded-full ${getColor(score)}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
                <p className="text-[11px] text-primary/80 mt-2 pl-8 font-medium">💡 {info.healthyTip}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Result Card */}
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Defense Mechanism' : '방어기제 분석',
            subtitle: isEnglish ? 'Psychological Pattern Analysis' : '심리 방어 패턴',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(
              Object.entries(result.categoryScores).map(([k, v]) => [k, v / 10])
            ),
            maxScore: 10,
            categoryTranslations: Object.fromEntries(
              Object.entries(mechanismInfo).map(([k, v]) => [k, v.name])
            ),
            aiSummary: result.analysis,
            actionItems: result.analysis
              ? result.analysis.match(/\d+\.\s*(.{15,60})/g)?.slice(0, 3).map(s => s.replace(/^\d+\.\s*/, ''))
              : undefined,
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};
