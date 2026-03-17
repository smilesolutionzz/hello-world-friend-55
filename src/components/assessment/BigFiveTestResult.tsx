import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n';
import ClinicalReportLayout, { DomainScore } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface BigFiveTestResultProps {
  result: {
    answers: Record<string, number>;
    scores: Record<string, number>;
    total: number;
    average: number;
  };
  onRestart: () => void;
}

const factorConfigKo: Record<string, { name: string; high: string; low: string }> = {
  extraversion: { name: '외향성', high: '사교적이고 활동적이며 자극을 추구합니다', low: '조용하고 독립적이며 신중합니다' },
  agreeableness: { name: '친화성', high: '협력적이고 신뢰하며 동정심이 많습니다', low: '경쟁적이고 회의적이며 독립적입니다' },
  conscientiousness: { name: '성실성', high: '조직적이고 책임감 있으며 목표지향적입니다', low: '유연하고 자발적이며 여유로운 성향입니다' },
  neuroticism: { name: '신경성', high: '감정적으로 민감하고 스트레스에 취약합니다', low: '감정적으로 안정되고 차분합니다' },
  openness: { name: '개방성', high: '창의적이고 호기심 많으며 새로운 것을 추구합니다', low: '실용적이고 전통적이며 현실적입니다' },
};

const factorConfigEn: Record<string, { name: string; high: string; low: string }> = {
  extraversion: { name: 'Extraversion', high: 'Sociable, active, seeks stimulation', low: 'Quiet, independent, cautious' },
  agreeableness: { name: 'Agreeableness', high: 'Cooperative, trusting, compassionate', low: 'Competitive, skeptical, independent' },
  conscientiousness: { name: 'Conscientiousness', high: 'Organized, responsible, goal-oriented', low: 'Flexible, spontaneous, relaxed' },
  neuroticism: { name: 'Neuroticism', high: 'Emotionally sensitive, stress-prone', low: 'Emotionally stable and calm' },
  openness: { name: 'Openness', high: 'Creative, curious, adventurous', low: 'Practical, traditional, realistic' },
};

export default function BigFiveTestResult({ result, onRestart }: BigFiveTestResultProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish, localePath } = useLanguage();
  const factorConfig = isEnglish ? factorConfigEn : factorConfigKo;

  const analysisText = Object.entries(result.scores)
    .map(([f, s]) => {
      const c = factorConfig[f as keyof typeof factorConfig];
      return `${c?.name}(${s.toFixed(1)}): ${s >= 3 ? c?.high : c?.low}`;
    }).join('\n');

  useAutoSaveTestResult({
    testType: isEnglish ? 'Big Five Personality Test' : '빅파이브 성격검사',
    results: { total: result.total, average: result.average, scores: result.scores },
    analysis: analysisText,
  });

  const getColor = (score: number) => score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : 'bg-orange-500';
  const getLevel = (score: number) => score >= 4 ? (isEnglish ? 'High' : '높음') : score >= 3 ? (isEnglish ? 'Avg' : '보통') : (isEnglish ? 'Low' : '낮음');

  const domains: DomainScore[] = Object.entries(result.scores).map(([key, score]) => ({
    key,
    label: factorConfig[key as keyof typeof factorConfig]?.name || key,
    score: parseFloat(score.toFixed(1)),
    maxScore: 5,
    level: getLevel(score),
    color: getColor(score),
    description: score >= 3
      ? factorConfig[key as keyof typeof factorConfig]?.high
      : factorConfig[key as keyof typeof factorConfig]?.low,
  }));

  const overallLevel = result.average >= 3.5 ? (isEnglish ? 'Balanced' : '균형적') : (isEnglish ? 'Variable' : '다양');

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'BigFive_Result' : '빅파이브_성격분석_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  const handleShare = async () => {
    const text = Object.entries(result.scores)
      .map(([f, s]) => `${factorConfig[f as keyof typeof factorConfig]?.name}: ${s.toFixed(1)}`)
      .join('\n');
    const full = `${isEnglish ? 'Big Five Results' : '빅파이브 성격검사 결과'}\n\n${text}`;
    if (navigator.share) await navigator.share({ title: isEnglish ? 'Big Five' : '빅파이브', text: full }).catch(() => {});
    else { navigator.clipboard.writeText(full); toast({ title: isEnglish ? 'Copied' : '복사 완료' }); }
  };

  return (
    <ClinicalReportLayout
      testName={isEnglish ? '5-Factor Personality Analysis' : '빅파이브 성격 분석 결과'}
      subtitle={isEnglish ? '5 major personality dimensions' : '5가지 주요 성격 요인 분석'}
      onBack={onRestart}
      onDownload={handleDownload}
      onShare={handleShare}
      totalScore={result.average.toFixed(1)}
      totalLabel={isEnglish ? 'Average' : '전체 평균'}
      scoreUnit="/ 5.0"
      scoreSeverity={overallLevel}
      severityColor="text-primary border-primary/30"
      domains={domains}
      aiAnalysis={analysisText}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Big Five Personality' : '빅파이브 성격',
            subtitle: isEnglish ? '5-Factor Analysis' : '5요인 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(Object.entries(result.scores).map(([k, v]) => [k, v / 5 * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(Object.entries(factorConfig).map(([k, v]) => [k, v.name])),
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
}
