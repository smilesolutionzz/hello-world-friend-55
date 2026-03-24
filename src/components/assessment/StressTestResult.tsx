import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface StressTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onRestart?: () => void;
  onBack?: () => void;
}

const StressTestResult = ({ result, onRestart, onBack }: StressTestResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish, localePath } = useLanguage();

  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useAutoSaveTestResult({
    testType: isEnglish ? 'Stress Test' : '스트레스 검사',
    results: { total: result.total, average: result.average, answers: result.answers },
    analysis,
    severity: result.severity,
  });

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stress-analyzer', {
          body: { answers: result.answers, totalScore: result.total, average: result.average, severity: result.severity }
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
    const risk = result.total > 32 ? 'high' : result.total > 16 ? 'medium' : 'low';
    const domainScores = radarData.map(d => `- ${d.label}: ${d.score.toFixed(1)}/5점 (${getLevel(d.score)})`).join('\n');
    
    if (isEnglish) {
      return `**1. Overall Stress Assessment**\nYour total score is ${result.total}/48 (${result.average.toFixed(1)} avg), indicating a ${risk === 'high' ? 'HIGH' : risk === 'medium' ? 'MODERATE' : 'LOW'} stress level. ${risk === 'high' ? 'This level of stress can significantly impact physical and mental health if not managed.' : risk === 'medium' ? 'This level requires consistent stress management strategies.' : 'You are managing stress well. Maintain your current lifestyle.'}\n\n**2. Domain Analysis**\n${domainScores}\n\n**3. Stress Pattern Analysis**\n${risk === 'high' ? 'Your responses indicate elevated stress across multiple domains. The combination of emotional instability and poor coping mechanisms suggests chronic stress patterns that may lead to burnout.' : risk === 'medium' ? 'You show moderate stress with some areas of concern. Your stress coping skills are partially effective but need strengthening.' : 'Your stress levels are within healthy range. You demonstrate good coping mechanisms and emotional regulation.'}\n\n**4. Management Strategies**\n- Practice deep breathing exercises (4-7-8 technique) for 5 minutes daily\n- Engage in 30 minutes of moderate exercise 3-5 times per week\n- Maintain consistent sleep schedule (7-8 hours)\n- Limit caffeine intake after 2pm\n- Practice mindfulness meditation for 10 minutes daily\n- Set clear boundaries between work and personal time\n\n**5. Professional Recommendations**\n${risk === 'high' ? 'Professional help is strongly recommended. Consider cognitive-behavioral therapy (CBT) or stress management counseling.' : 'Continue self-monitoring. If stress increases, consider professional consultation.'}\n\n**6. 📋 Summary**\nStress level: ${risk.toUpperCase()}. ${risk === 'high' ? 'Take immediate action to reduce stress. Professional support is recommended.' : risk === 'medium' ? 'Active stress management needed. Focus on the strategies above.' : 'Maintain current healthy habits.'} Remember: stress is manageable with the right tools and support.`;
    }
    return `**1. 현재 스트레스 상태 종합 평가**\n총점 ${result.total}/48점(평균 ${result.average.toFixed(1)}점)으로 '${risk === 'high' ? '높은' : risk === 'medium' ? '중간' : '낮은'}' 수준의 스트레스가 확인되었습니다. ${risk === 'high' ? '이 수준의 스트레스는 관리하지 않으면 신체적, 정신적 건강에 상당한 영향을 미칠 수 있습니다.' : risk === 'medium' ? '꾸준한 스트레스 관리 전략이 필요한 수준입니다.' : '스트레스를 잘 관리하고 계십니다. 현재 생활 방식을 유지하세요.'}\n\n**2. 영역별 스트레스 분석**\n${domainScores}\n\n**3. 스트레스 요인 및 패턴 분석**\n${risk === 'high' ? '여러 영역에서 높은 스트레스가 관찰됩니다. 정서 불안정과 대처 능력 저하가 복합적으로 나타나 만성 스트레스 패턴으로 발전할 우려가 있습니다.' : risk === 'medium' ? '일부 영역에서 주의가 필요한 스트레스가 관찰됩니다. 스트레스 대처 기술이 부분적으로 효과적이나 강화가 필요합니다.' : '스트레스 수준이 건강한 범위 내에 있습니다. 좋은 대처 능력과 정서 조절력을 보여줍니다.'}\n\n**4. 맞춤형 스트레스 관리 전략**\n- 깊은 호흡 운동(4-7-8 기법)을 매일 5분간 연습하세요\n- 중등도 운동을 주 3-5회, 30분간 실시하세요\n- 일정한 수면 시간(7-8시간)을 유지하세요\n- 오후 2시 이후 카페인 섭취를 제한하세요\n- 마음챙김 명상을 매일 10분간 실천하세요\n- 업무와 개인 시간의 명확한 경계를 설정하세요\n\n**5. 전문가 권고사항**\n${risk === 'high' ? '전문가의 도움을 적극 권장합니다. 인지행동치료(CBT)나 스트레스 관리 상담을 고려해주세요.' : '자가 모니터링을 지속하세요. 스트레스가 증가하면 전문가 상담을 고려하세요.'}\n\n**6. 📋 요약 및 제언**\n스트레스 수준: ${risk === 'high' ? '높음' : risk === 'medium' ? '보통' : '낮음'}. ${risk === 'high' ? '즉시 스트레스 감소를 위한 행동을 시작하세요. 전문가 지원이 권장됩니다.' : risk === 'medium' ? '적극적인 스트레스 관리가 필요합니다. 위의 전략에 집중하세요.' : '현재의 건강한 습관을 유지하세요.'} 스트레스는 올바른 도구와 지원이 있으면 충분히 관리할 수 있습니다.`;
  };

  // Domain scores from answers
  const radarData = [
    { key: 'emotional', label: isEnglish ? 'Emotional' : '정서안정', score: Math.max(1, 5 - (result.answers[0] + result.answers[2]) / 2), max: 5 },
    { key: 'problem', label: isEnglish ? 'Problem Solving' : '문제해결', score: Math.max(1, 5 - (result.answers[3] + result.answers[6]) / 2), max: 5 },
    { key: 'physical', label: isEnglish ? 'Physical' : '신체건강', score: Math.max(1, 5 - (result.answers[11] + result.answers[5]) / 2), max: 5 },
    { key: 'social', label: isEnglish ? 'Social' : '사회관계', score: Math.max(1, 5 - (result.answers[10] + result.answers[8]) / 2), max: 5 },
    { key: 'future', label: isEnglish ? 'Future' : '미래전망', score: Math.max(1, 5 - (result.answers[7] + result.answers[4]) / 2), max: 5 },
    { key: 'coping', label: isEnglish ? 'Coping' : '스트레스대처', score: Math.max(1, 5 - (result.answers[1] + result.answers[9]) / 2), max: 5 },
  ];

  const getColor = (score: number) => score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : score >= 2 ? 'bg-orange-500' : 'bg-destructive';
  const getLevel = (score: number) => score >= 4 ? (isEnglish ? 'Good' : '양호') : score >= 3 ? (isEnglish ? 'Fair' : '보통') : score >= 2 ? (isEnglish ? 'Caution' : '주의') : (isEnglish ? 'Risk' : '위험');

  const domains: DomainScore[] = radarData.map(d => ({
    key: d.key,
    label: d.label,
    score: parseFloat(d.score.toFixed(1)),
    maxScore: d.max,
    level: getLevel(d.score),
    color: getColor(d.score),
  }));

  const parseAnalysisSections = (text: string): ReportSection[] => {
    if (!text) return [];
    const sections: ReportSection[] = [];
    const regex = /\*\*(\d+)\.\s*(.+?)\*\*\n*([\s\S]*?)(?=\*\*\d+\.|$)/g;
    let match;
    let idx = 0;
    while ((match = regex.exec(text)) !== null) {
      const title = match[2].trim();
      const content = match[3].replace(/\*\*/g, '').trim();
      if (content.length > 5) {
        sections.push({ id: `s-${idx}`, icon: idx === 0 ? '📊' : idx === 1 ? '💡' : idx === 2 ? '🎯' : '🌱', title, content, defaultOpen: idx === 0 });
        idx++;
      }
    }
    // fallback: split by ## if numbered pattern didn't work
    if (sections.length === 0) {
      const regex2 = /##\s*([^\n]+)\n([\s\S]*?)(?=##\s*|$)/g;
      while ((match = regex2.exec(text)) !== null) {
        const title = match[1].replace(/^[^\w가-힣]*/, '').trim();
        const content = match[2].replace(/\*\*/g, '').trim();
        if (content.length > 10) {
          const emojiMatch = match[1].match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
          sections.push({ id: `s-${idx}`, icon: emojiMatch?.[0] || '📋', title, content, defaultOpen: idx === 0 });
          idx++;
        }
      }
    }
    return sections;
  };

  const aiSections = parseAnalysisSections(analysis);
  const stressLevel = result.total <= 16 ? (isEnglish ? 'Low' : '낮음') : result.total <= 32 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'High' : '높음');
  const severityColor = result.total > 32 ? 'text-destructive border-destructive/30' : result.total > 16 ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '스트레스_검사_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const handleShare = async () => {
    const text = `${isEnglish ? 'Stress Test Result' : '스트레스 검사 결과'}\n${isEnglish ? 'Score' : '총점'}: ${result.total}\n${isEnglish ? 'Level' : '수준'}: ${stressLevel}`;
    if (navigator.share) await navigator.share({ title: isEnglish ? 'Stress Result' : '스트레스 결과', text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast({ title: isEnglish ? 'Copied' : '결과가 복사되었습니다' }); }
  };

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName={isEnglish ? 'Stress Analysis' : '스트레스 분석'} estimatedSeconds={20} />;
  }

  return (
    <ClinicalReportLayout
      testName={isEnglish ? 'Stress Analysis Result' : '스트레스 분석 결과'}
      subtitle={isEnglish ? '12-item stress assessment' : '12문항 스트레스 평가'}
      onBack={onBack || (() => navigate(localePath('/assessment')))}
      onDownload={handleDownload}
      onShare={handleShare}
      totalScore={result.total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit={`/ 48${isEnglish ? 'pts' : '점'}`}
      scoreSeverity={stressLevel}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isEnglish ? 'Stress Test' : '스트레스 검사',
            subtitle: isEnglish ? 'Comprehensive Stress Analysis' : '종합 스트레스 분석',
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(radarData.map(d => [d.key, d.score])),
            maxScore: 5,
            categoryTranslations: Object.fromEntries(radarData.map(d => [d.key, d.label])),
            aiSummary: analysis,
            riskLevel: result.total > 32 ? 'high' : result.total > 16 ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default StressTestResult;
