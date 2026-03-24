import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { languageDevelopmentScoring } from '@/data/languageDevelopmentQuestions';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { cleanMarkdown } from '@/utils/cleanMarkdown';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface LanguageDevelopmentResultProps {
  results: Record<string, any>;
  answers: Record<string, string>;
  onBack: () => void;
}

const LanguageDevelopmentResult = ({ results, answers, onBack }: LanguageDevelopmentResultProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const getNumericResult = (key: string) => {
    const value = results?.[key];
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const ageInMonths = getNumericResult('ageInMonths') || undefined;
  const resolvedAgeGroup = typeof results?.ageGroup === 'string' && results.ageGroup.trim().length > 0
    ? results.ageGroup
    : '영유아';

  const receptiveMax = Object.keys(answers || {}).filter((id) => id.startsWith('rec_')).length;
  const expressiveMax = Object.keys(answers || {}).filter((id) => id.startsWith('exp_')).length;
  const totalMax = receptiveMax + expressiveMax;

  const getLevel = (score: number, category: 'receptive' | 'expressive' | 'total') => {
    const scoring = languageDevelopmentScoring[category];
    if (score >= scoring.excellent.min) return { level: '우수', color: 'bg-green-500' };
    if (score >= scoring.good.min) return { level: '양호', color: 'bg-primary' };
    if (score >= scoring.average.min) return { level: '보통', color: 'bg-yellow-500' };
    return { level: '관찰필요', color: 'bg-destructive' };
  };

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('language-development-analyzer', {
          body: {
            results,
            answers,
            ageGroup: resolvedAgeGroup,
            age: ageInMonths,
            scoreMeta: {
              receptiveMax,
              expressiveMax,
              totalMax,
            },
          },
        });
        if (error) throw error;
        setAiAnalysis(data.analysis || '');
      } catch {
        setAiAnalysis(isEnglish ? 'Unable to load language development analysis.' : '언어발달 분석 결과를 불러올 수 없습니다.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    run();
  }, []);

  const totalInfo = getLevel(getNumericResult('total'), 'total');
  const receptiveInfo = getLevel(getNumericResult('receptive'), 'receptive');
  const expressiveInfo = getLevel(getNumericResult('expressive'), 'expressive');

  const domains: DomainScore[] = [
    { key: 'receptive', label: '수용언어', score: getNumericResult('receptive_percentage'), maxScore: 100, level: receptiveInfo.level, color: receptiveInfo.color },
    { key: 'expressive', label: '표현언어', score: getNumericResult('expressive_percentage'), maxScore: 100, level: expressiveInfo.level, color: expressiveInfo.color },
  ];

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const icons = ['🧠', '👂', '🗣️', '📊', '🌱', '💡', '📋'];
    const defaultTitles = [
      '전문가 종합 해석',
      '수용언어 영역 정밀 분석',
      '표현언어 영역 정밀 분석',
      '문항별 응답 패턴 분석',
      '발달 맥락 및 예후',
      '가정 내 언어자극 전략',
      '전문가 권고 및 후속 계획',
    ];

    const normalizeTitle = (raw: string) =>
      raw
        .replace(/[#*]/g, '')
        .replace(/^\d+\s*[.)]\s*/, '')
        .replace(/^[^\w가-힣]+/, '')
        .replace(/\s+/g, ' ')
        .trim();

    const isInvalidTitle = (title: string) =>
      !title ||
      title.length < 4 ||
      title.length > 52 ||
      /안녕하세요|프리미엄 유료 검사|전문가 분석 리포트/i.test(title);

    const sectionsFromHeaders: ReportSection[] = [];
    const headerRegex = /(?:^|\n)#{1,3}\s*([^\n]+)\n([\s\S]*?)(?=\n#{1,3}\s|$)/g;
    let match: RegExpExecArray | null;

    while ((match = headerRegex.exec(text)) !== null) {
      const normalizedTitle = normalizeTitle(match[1]);
      if (isInvalidTitle(normalizedTitle)) continue;

      let content = cleanMarkdown(match[2]).trim();
      if (content.startsWith(normalizedTitle)) {
        content = content.slice(normalizedTitle.length).trim();
      }
      if (content.length < 40) continue;

      const idx = sectionsFromHeaders.length;
      sectionsFromHeaders.push({
        id: `s-${idx}`,
        icon: icons[idx] || '📋',
        title: normalizedTitle,
        content,
        defaultOpen: idx === 0,
      });
    }

    if (sectionsFromHeaders.length > 0) {
      return sectionsFromHeaders.slice(0, 7);
    }

    const cleaned = cleanMarkdown(text)
      .replace(/^안녕하세요[^\n]*\n?/m, '')
      .replace(/^아래는[^\n]*\n?/m, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const paragraphs = cleaned
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 35);

    return paragraphs.slice(0, 7).map((paragraph, idx) => {
      const lines = paragraph.split('\n').map((line) => line.trim()).filter(Boolean);
      const candidateTitle = normalizeTitle(lines[0] || '');
      const hasStructuredTitle = !isInvalidTitle(candidateTitle);
      const content = hasStructuredTitle ? lines.slice(1).join('\n').trim() || paragraph : paragraph;

      return {
        id: `s-${idx}`,
        icon: icons[idx] || '📋',
        title: hasStructuredTitle ? candidateTitle : defaultTitles[idx] || `분석 ${idx + 1}`,
        content,
        defaultOpen: idx === 0,
      };
    });
  };

  const aiSections = parseAISections(aiAnalysis);
  const severityColor = totalInfo.level === '우수' ? 'text-green-600 border-green-300' : totalInfo.level === '양호' ? 'text-primary border-primary/30' : totalInfo.level === '보통' ? 'text-yellow-600 border-yellow-300' : 'text-destructive border-destructive/30';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'LanguageDev_Results' : '언어발달_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  if (isAnalyzing) return <AnalysisLoadingScreen testName={isEnglish ? "Language Development Test" : "언어발달 검사"} />;

  return (
    <ClinicalReportLayout
      testName={isEnglish ? "Language Development Test Results" : "언어발달 검사 결과"}
      subtitle={isEnglish ? "Receptive · Expressive Language Analysis" : "수용언어 · 표현언어 분석"}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={getNumericResult('total')}
      totalLabel="종합 점수"
      scoreSeverity={totalInfo.level}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
      childrenBeforeAnalysis
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Language Development' : '언어발달',
            subtitle: '수용·표현 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: { receptive: (getNumericResult('receptive_percentage') / 100) * 7, expressive: (getNumericResult('expressive_percentage') / 100) * 7 },
            maxScore: 7,
            categoryTranslations: { receptive: '수용언어', expressive: '표현언어' },
            aiSummary: aiAnalysis,
            actionItems: aiSections.slice(0, 3).map((section) => section.title),
            riskLevel: totalInfo.level === '우수' || totalInfo.level === '양호' ? 'low' : totalInfo.level === '보통' ? 'moderate' : 'high',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default LanguageDevelopmentResult;
