import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import useRedFlagDetection from '@/hooks/useRedFlagDetection';
import RedFlagAlertDialog from './RedFlagAlertDialog';

interface EpdsTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onRestart?: () => void;
  onBack?: () => void;
}

const EpdsTestResult = ({ result, onRestart, onBack }: EpdsTestResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish, localePath } = useLanguage();

  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // 10번 문항(자해) 점수가 1 이상이면 레드플래그
  const selfHarmScore = result.answers[9] || 0;
  
  const { redFlagResult, showAlert, closeAlert } = useRedFlagDetection({
    result: {
      totalScore: result.total,
      level: result.severity,
      analysis: selfHarmScore >= 1 ? '자해 위험 신호 감지' : '',
      riskLevel: result.total >= 13 ? '높음' : result.total >= 10 ? '보통' : '낮음',
    },
    testType: 'epds',
    enabled: true,
  });

  useAutoSaveTestResult({
    testType: isEnglish ? 'Parenting Depression (EPDS)' : '육아 우울감 체크 (EPDS)',
    results: { total: result.total, average: result.average, answers: result.answers },
    analysis,
    severity: result.severity,
  });

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-test-results', {
          body: {
            testType: 'epds',
            results: {
              score: result.average,
              level: result.severity,
              total: result.total,
              average: result.average,
              domainScores: {
                pleasure: { score: result.answers[0] + result.answers[1], max: 6 },
                guilt: { score: result.answers[2], max: 3 },
                anxiety: { score: result.answers[3] + result.answers[4], max: 6 },
                coping: { score: result.answers[5], max: 3 },
                sleep: { score: result.answers[6], max: 3 },
                sadness: { score: result.answers[7] + result.answers[8], max: 6 },
                selfHarm: { score: result.answers[9], max: 3 },
              }
            }
          }
        });
        if (!error && data?.analysis) setAnalysis(data.analysis);
        else setAnalysis(generateFallback());
      } catch {
        setAnalysis(generateFallback());
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAI();
  }, [result]);

  const generateFallback = () => {
    const risk = result.total >= 13 ? 'high' : result.total >= 10 ? 'borderline' : 'low';
    if (isEnglish) {
      return `**1. Overall EPDS Assessment**\nYour total score is ${result.total}/30. ${risk === 'high' ? 'This score suggests a high likelihood of depressive symptoms requiring professional evaluation.' : risk === 'borderline' ? 'This score is in the borderline range. Monitoring and possible professional consultation is recommended.' : 'Your score suggests low risk for postnatal depression.'}\n\n**2. Domain Analysis**\n${domainLabelsEn.map(d => `- ${d.label}: ${d.score}/${d.max} (${d.score / d.max > 0.66 ? 'Concern' : d.score / d.max > 0.33 ? 'Mild' : 'Good'})`).join('\n')}\n\n**3. Key Observations**\n${risk === 'high' ? 'Multiple areas show elevated scores. This pattern is consistent with significant emotional distress that may benefit from professional support.' : 'Some areas show mild elevation but overall functioning appears maintained.'}\n\n**4. Recommendations**\n- Talk to your healthcare provider about your feelings\n- Maintain social connections and accept help from others\n- Prioritize rest when possible\n- Consider professional counseling if symptoms persist\n\n**5. Important Note**\nThis screening tool does not provide a diagnosis. Based on Edinburgh Postnatal Depression Scale (Cox et al., 1987). Please consult a healthcare professional for proper evaluation.\n\n**6. 📋 Summary**\nEPDS Score: ${result.total}/30 (${risk === 'high' ? 'High Risk' : risk === 'borderline' ? 'Borderline' : 'Low Risk'}). ${risk === 'high' ? 'Professional consultation is strongly recommended.' : 'Continue self-monitoring and seek help if needed.'}`;
    }
    return `**1. 육아 우울감 종합 평가**\n총점 ${result.total}/30점입니다. ${risk === 'high' ? '우울 증상의 가능성이 높아 전문가 상담이 필요한 수준입니다.' : risk === 'borderline' ? '경계 수준으로, 지속적인 모니터링과 필요시 전문가 상담을 권장합니다.' : '육아 우울증 위험이 낮은 상태입니다.'}\n\n**2. 영역별 분석**\n${domainLabelsKo.map(d => `- ${d.label}: ${d.score}/${d.max}점 (${d.score / d.max > 0.66 ? '주의' : d.score / d.max > 0.33 ? '경미' : '양호'})`).join('\n')}\n\n**3. 주요 관찰사항**\n${risk === 'high' ? '여러 영역에서 높은 점수가 확인됩니다. 상당한 정서적 어려움을 겪고 계실 수 있으며, 전문가의 도움이 필요할 수 있습니다.' : '일부 영역에서 경미한 어려움이 있으나, 전반적인 기능은 유지되고 있습니다.'}\n\n**4. 맞춤 권고사항**\n- 의료 전문가에게 현재 기분에 대해 이야기해보세요\n- 사회적 관계를 유지하고 주변의 도움을 받아들이세요\n- 가능할 때 충분한 휴식을 취하세요\n- 증상이 지속되면 전문 상담을 고려하세요\n- 배우자나 가족과 현재 기분을 솔직하게 나누세요\n\n**5. 중요 안내**\n본 검사는 진단 도구가 아닌 선별 도구입니다. Edinburgh 산후우울증 척도(Cox et al., 1987)를 기반으로 합니다. 정확한 평가를 위해 전문가와 상담하시기 바랍니다.\n\n**6. 📋 요약**\nEPDS 점수: ${result.total}/30점 (${risk === 'high' ? '높은 위험' : risk === 'borderline' ? '경계' : '낮은 위험'}). ${risk === 'high' ? '전문가 상담을 강력히 권장합니다.' : '자가 모니터링을 지속하시고, 필요시 도움을 요청하세요.'}`;
  };

  const domainLabelsKo = [
    { key: 'pleasure', label: '즐거움/흥미', score: result.answers[0] + result.answers[1], max: 6 },
    { key: 'guilt', label: '자기비난', score: result.answers[2], max: 3 },
    { key: 'anxiety', label: '불안/공포', score: result.answers[3] + result.answers[4], max: 6 },
    { key: 'coping', label: '대처능력', score: result.answers[5], max: 3 },
    { key: 'sleep', label: '수면', score: result.answers[6], max: 3 },
    { key: 'sadness', label: '슬픔/우울', score: result.answers[7] + result.answers[8], max: 6 },
    { key: 'selfHarm', label: '자해사고', score: result.answers[9], max: 3 },
  ];

  const domainLabelsEn = [
    { key: 'pleasure', label: 'Pleasure/Interest', score: result.answers[0] + result.answers[1], max: 6 },
    { key: 'guilt', label: 'Self-blame', score: result.answers[2], max: 3 },
    { key: 'anxiety', label: 'Anxiety/Fear', score: result.answers[3] + result.answers[4], max: 6 },
    { key: 'coping', label: 'Coping', score: result.answers[5], max: 3 },
    { key: 'sleep', label: 'Sleep', score: result.answers[6], max: 3 },
    { key: 'sadness', label: 'Sadness', score: result.answers[7] + result.answers[8], max: 6 },
    { key: 'selfHarm', label: 'Self-harm thoughts', score: result.answers[9], max: 3 },
  ];

  const domainData = isEnglish ? domainLabelsEn : domainLabelsKo;

  const getColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio <= 0.33) return 'bg-green-500';
    if (ratio <= 0.66) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  const getLevel = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio <= 0.33) return isEnglish ? 'Good' : '양호';
    if (ratio <= 0.66) return isEnglish ? 'Mild' : '경미';
    return isEnglish ? 'Concern' : '주의';
  };

  const domains: DomainScore[] = domainData.map(d => ({
    name: d.label,
    score: d.score,
    maxScore: d.max,
    percentage: Math.round((d.score / d.max) * 100),
    color: getColor(d.score, d.max),
    level: getLevel(d.score, d.max),
  }));

  const radarData = domainData.map(d => ({
    key: d.key,
    label: d.label,
    // Invert: lower is better for EPDS
    score: Math.max(1, 5 - (d.score / d.max) * 5),
    max: 5,
  }));

  const riskColor = result.total >= 13 ? 'text-destructive' : result.total >= 10 ? 'text-amber-600' : 'text-green-600';
  const riskBg = result.total >= 13 ? 'bg-destructive/10' : result.total >= 10 ? 'bg-amber-50' : 'bg-green-50';

  const reportSections: ReportSection[] = [];

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testType={isEnglish ? 'Parenting Depression (EPDS)' : '육아 우울감 체크 (EPDS)'} />;
  }

  return (
    <>
      <ClinicalReportLayout
        testTitle={isEnglish ? 'Parenting Depression Check (EPDS)' : '육아 우울감 체크 (EPDS)'}
        testSubtitle={isEnglish ? 'Edinburgh Postnatal Depression Scale · Cox et al., 1987' : 'Edinburgh 산후우울증 척도 · Cox et al., 1987'}
        totalScore={result.total}
        maxScore={30}
        severity={result.severity}
        severityColor={riskColor}
        severityBg={riskBg}
        domains={domains}
        analysis={analysis}
        radarData={radarData}
        onRestart={onRestart}
        onBack={onBack}
        reportSections={reportSections}
        infographic={
          <VisualResultInfographic
            testType="epds"
            totalScore={result.total}
            maxScore={30}
            severity={result.severity}
            domains={domains}
          />
        }
      />
      {redFlagResult.hasRedFlags && (
        <RedFlagAlertDialog
          isOpen={showAlert}
          onClose={closeAlert}
          redFlagResult={redFlagResult}
        />
      )}
    </>
  );
};

export default EpdsTestResult;
