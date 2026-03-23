import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { useLanguage } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

interface PanicTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
    ageGroup?: string;
  };
  onBack: () => void;
  onRestart?: () => void;
}

const PanicTestResult = ({ results, onBack }: PanicTestResultProps) => {
  const { total, average, answers } = results;
  const severity = results.severity;
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isEnglish } = useLanguage();

  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const isChild = answers.length === 15;
  const maxScore = answers.length * 3;

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('panic-analyzer', {
          body: { answers, totalScore: total, average, severity, ageGroup: results.ageGroup, maxScore }
        });
        if (!error && data?.analysis) {
          setAnalysis(data.analysis);
        } else {
          setAnalysis(generateFallback());
        }
      } catch {
        setAnalysis(generateFallback());
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAI();
  }, [results]);

  const generateFallback = () => {
    if (isChild) {
      const pct = (total / maxScore) * 100;
      if (isEnglish) {
        return `**1. Child Anxiety Assessment Overview**\nYour child scored ${total} out of ${maxScore} points (${pct.toFixed(0)}%), indicating a ${severity} level of anxiety.\n\n**2. Domain Analysis**\n- School/Social Anxiety: ${answers.slice(0, 5).reduce((s, v) => s + v, 0)}/15 points\n- Separation/Fear Anxiety: ${answers.slice(5, 10).reduce((s, v) => s + v, 0)}/15 points\n- Somatic/General Anxiety: ${answers.slice(10, 15).reduce((s, v) => s + v, 0)}/15 points\n\n**3. Developmental Context**\nSome degree of anxiety is normal in childhood development. However, when anxiety significantly interferes with daily activities, school performance, or social relationships, professional evaluation is recommended.\n\n**4. Parent/Caregiver Guide**\n- Create a safe, predictable routine at home\n- Validate your child's feelings without dismissing them\n- Practice relaxation techniques together (deep breathing, progressive muscle relaxation)\n- Encourage gradual exposure to anxiety-provoking situations\n- Maintain open communication about emotions\n\n**5. Professional Recommendations**\nIf anxiety symptoms persist for more than 2 weeks or significantly impact daily functioning, consider consulting a child psychologist or psychiatrist. Play therapy and cognitive-behavioral therapy (CBT) are effective approaches for childhood anxiety.\n\n**6. 📋 Summary**\nYour child's anxiety level is at ${severity}. Focus on providing emotional support and a structured environment. With proper guidance, most childhood anxiety can be effectively managed.`;
      }
      return `**1. 아동 불안 상태 종합 평가**\n검사 총점 ${total}점(${maxScore}점 만점, ${pct.toFixed(0)}%)으로 '${severity}' 수준의 불안이 확인되었습니다. 이 점수는 아이가 일상에서 경험하는 불안의 정도를 반영합니다.\n\n**2. 영역별 불안 분석**\n- 학교/사회적 불안: ${answers.slice(0, 5).reduce((s, v) => s + v, 0)}/15점 — 학교 생활과 또래 관계에서의 불안\n- 분리/공포 불안: ${answers.slice(5, 10).reduce((s, v) => s + v, 0)}/15점 — 부모와의 분리, 새로운 환경에 대한 공포\n- 신체/일반 불안: ${answers.slice(10, 15).reduce((s, v) => s + v, 0)}/15점 — 신체 증상 동반 불안, 일반적 걱정\n\n**3. 발달적 관점 해석**\n아동기의 일정 수준의 불안은 정상 발달 과정의 일부입니다. 그러나 불안이 학교생활, 또래 관계, 가정생활에 지속적으로 지장을 준다면 전문가 평가가 필요합니다.\n\n**4. 부모/보호자 가이드**\n- 안정적이고 예측 가능한 일상 루틴을 유지해주세요\n- 아이의 감정을 무시하지 말고 공감해주세요\n- 함께 이완 기법(깊은 호흡, 근이완법)을 연습하세요\n- 불안을 유발하는 상황에 점진적으로 노출시키세요\n- 감정에 대한 열린 대화를 유지하세요\n\n**5. 전문가 권고사항**\n불안 증상이 2주 이상 지속되거나 일상 기능에 큰 영향을 미친다면 아동 심리전문가 상담을 권장합니다. 놀이치료, 인지행동치료(CBT)가 아동 불안에 효과적입니다.\n\n**6. 📋 요약 및 제언**\n아이의 불안 수준은 '${severity}' 단계입니다. 정서적 지지와 안정적인 환경 제공에 집중해주세요. 적절한 도움을 받으면 대부분의 아동기 불안은 효과적으로 관리될 수 있습니다.`;
    }

    const pct = (total / maxScore) * 100;
    if (isEnglish) {
      return `**1. Anxiety/Panic Assessment Overview**\nYou scored ${total} out of ${maxScore} points (${pct.toFixed(0)}%), indicating a ${severity} level of anxiety.\n\n**2. Domain Analysis**\n- Physical Symptoms: ${answers.slice(0, 7).reduce((s, v) => s + v, 0)}/21 points — heart pounding, breathing difficulty, dizziness\n- Cognitive Symptoms: ${answers.slice(7, 14).reduce((s, v) => s + v, 0)}/21 points — derealization, loss of control fear\n- Behavioral Symptoms: ${answers.slice(14, 21).reduce((s, v) => s + v, 0)}/21 points — avoidance, daily life interference\n\n**3. Anxiety Pattern Analysis**\nYour response pattern suggests ${pct >= 75 ? 'significant anxiety that may indicate a panic disorder' : pct >= 50 ? 'moderate anxiety requiring active management' : pct >= 25 ? 'mild anxiety within manageable range' : 'minimal anxiety symptoms'}.\n\n**4. Management Strategies**\n- Practice diaphragmatic breathing (4-7-8 technique)\n- Use grounding techniques (5-4-3-2-1 sensory method)\n- Limit caffeine and alcohol intake\n- Maintain regular exercise (30 min, 3-5 times/week)\n- Practice progressive muscle relaxation before bed\n\n**5. Professional Recommendations**\n${pct >= 50 ? 'Professional evaluation is strongly recommended. CBT and, if needed, medication (SSRIs) are evidence-based treatments.' : 'Continue self-monitoring. If symptoms worsen or persist, consider professional consultation.'}\n\n**6. 📋 Summary**\nYour anxiety level is at ${severity}. ${pct >= 50 ? 'Active professional intervention is recommended.' : 'Continue self-care practices and monitor symptoms.'} With appropriate treatment, anxiety disorders have very high recovery rates.`;
    }
    return `**1. 불안/공황 상태 종합 평가**\n검사 총점 ${total}점(${maxScore}점 만점, ${pct.toFixed(0)}%)으로 '${severity}' 수준의 불안이 확인되었습니다.\n\n**2. 영역별 불안 분석**\n- 신체적 증상: ${answers.slice(0, 7).reduce((s, v) => s + v, 0)}/21점 — 심장 두근거림, 호흡곤란, 어지러움 등\n- 인지적 증상: ${answers.slice(7, 14).reduce((s, v) => s + v, 0)}/21점 — 비현실감, 통제력 상실 공포 등\n- 행동적 증상: ${answers.slice(14, 21).reduce((s, v) => s + v, 0)}/21점 — 회피 행동, 일상생활 지장 등\n\n**3. 불안 패턴 분석**\n응답 패턴을 분석한 결과, ${pct >= 75 ? '공황장애 가능성이 시사되는 상당한 수준의 불안이 관찰됩니다' : pct >= 50 ? '적극적인 관리가 필요한 중등도 불안이 관찰됩니다' : pct >= 25 ? '관리 가능한 범위의 경미한 불안이 관찰됩니다' : '최소한의 불안 증상이 관찰됩니다'}.\n\n**4. 맞춤형 관리 전략**\n- 횡격막 호흡법 연습 (4-7-8 기법: 4초 흡입, 7초 유지, 8초 내쉬기)\n- 접지 기법 활용 (5-4-3-2-1 감각 방법)\n- 카페인과 알코올 섭취 제한\n- 규칙적인 운동 유지 (주 3-5회, 30분)\n- 취침 전 점진적 근이완법 실시\n\n**5. 전문가 권고사항**\n${pct >= 50 ? '전문가 평가를 적극 권장합니다. 인지행동치료(CBT)와 필요시 약물치료(SSRI)가 근거 기반 치료법입니다.' : '자가 모니터링을 지속하세요. 증상이 악화되거나 지속되면 전문가 상담을 고려하세요.'}\n\n**6. 📋 요약 및 제언**\n불안 수준은 '${severity}' 단계입니다. ${pct >= 50 ? '전문가의 적극적 개입이 권장됩니다.' : '자가 관리를 지속하고 증상을 모니터링하세요.'} 적절한 치료를 받으면 불안장애는 매우 높은 회복률을 보입니다.`;
  };

  useAutoSaveTestResult({
    testType: isEnglish ? 'Anxiety Test' : '불안감 검사',
    results: { total, average, answers, ageGroup: results.ageGroup },
    analysis,
    severity,
  });

  const severityColor = severity.includes('심각') || severity.includes('Severe') ? 'text-destructive border-destructive/30' : severity.includes('중등도') || severity.includes('Moderate') ? 'text-orange-600 border-orange-300' : severity.includes('경미') || severity.includes('Mild') ? 'text-yellow-600 border-yellow-300' : 'text-green-600 border-green-300';

  const domains: DomainScore[] = isChild
    ? [
        { key: 'school', label: isEnglish ? 'School/Social Anxiety' : '학교/사회적 불안', score: answers.slice(0, 5).reduce((s, v) => s + v, 0), maxScore: 15, level: '', color: '' },
        { key: 'separation', label: isEnglish ? 'Separation/Fear Anxiety' : '분리/공포 불안', score: answers.slice(5, 10).reduce((s, v) => s + v, 0), maxScore: 15, level: '', color: '' },
        { key: 'somatic', label: isEnglish ? 'Somatic/General Anxiety' : '신체/일반 불안', score: answers.slice(10, 15).reduce((s, v) => s + v, 0), maxScore: 15, level: '', color: '' },
      ].map(d => {
        const pct = (d.score / d.maxScore) * 100;
        return { ...d, level: pct >= 70 ? (isEnglish ? 'Severe' : '심각') : pct >= 40 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Normal' : '정상'), color: pct >= 70 ? 'bg-destructive' : pct >= 40 ? 'bg-orange-500' : 'bg-green-500' };
      })
    : [
        { key: 'physical', label: isEnglish ? 'Physical Symptoms' : '신체 증상', score: answers.slice(0, 7).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
        { key: 'cognitive', label: isEnglish ? 'Cognitive Symptoms' : '인지 증상', score: answers.slice(7, 14).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
        { key: 'behavioral', label: isEnglish ? 'Behavioral Symptoms' : '행동 증상', score: answers.slice(14, 21).reduce((s, v) => s + v, 0), maxScore: 21, level: '', color: '' },
      ].map(d => {
        const pct = (d.score / d.maxScore) * 100;
        return { ...d, level: pct >= 70 ? (isEnglish ? 'Severe' : '심각') : pct >= 40 ? (isEnglish ? 'Moderate' : '보통') : (isEnglish ? 'Normal' : '정상'), color: pct >= 70 ? 'bg-destructive' : pct >= 40 ? 'bg-orange-500' : 'bg-green-500' };
      });

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
        sections.push({ id: `s-${idx}`, icon: idx === 0 ? '📊' : idx === 1 ? '🧠' : idx === 2 ? '🔍' : idx === 3 ? '💡' : idx === 4 ? '👨‍⚕️' : '📋', title, content, defaultOpen: idx === 0 });
        idx++;
      }
    }
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

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', isEnglish ? 'Anxiety_Results' : '불안감_체크_결과',
      () => toast({ title: t.resultLayout.pdfComplete }),
      (e) => toast({ title: t.resultLayout.pdfFailed, description: e.message, variant: 'destructive' })
    );
  };

  const testNameLabel = isChild
    ? (isEnglish ? 'Child Anxiety Check Results' : '아동 불안 체크 결과')
    : (isEnglish ? 'Adult Anxiety Check Results' : '성인 불안 체크 결과');

  const subtitleLabel = isChild
    ? (isEnglish ? 'Child Anxiety Screening (15 items)' : '아동 불안 선별 검사 (15문항)')
    : (isEnglish ? 'Adult Anxiety/Panic Screening (21 items)' : '성인 불안/공황 선별 검사 (21문항)');

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName={isChild ? (isEnglish ? 'Child Anxiety Analysis' : '아동 불안 분석') : (isEnglish ? 'Anxiety Analysis' : '불안 분석')} estimatedSeconds={20} />;
  }

  return (
    <ClinicalReportLayout
      testName={testNameLabel}
      subtitle={subtitleLabel}
      onBack={onBack}
      onDownload={handleDownload}
      totalScore={total}
      totalLabel={isEnglish ? 'Total Score' : '총점'}
      scoreUnit={`/ ${maxScore}`}
      scoreSeverity={severity}
      severityColor={severityColor}
      domains={domains}
      aiAnalysis={analysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: isChild ? (isEnglish ? 'Child Anxiety' : '아동 불안') : (isEnglish ? 'Adult Anxiety' : '성인 불안'),
            subtitle: isEnglish ? `${domains.length}-domain analysis` : `${domains.length}영역 분석`,
            date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'),
            scores: Object.fromEntries(domains.map(d => [d.key, (d.score / d.maxScore) * 7])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries(domains.map(d => [d.key, d.label])),
            riskLevel: (total / maxScore) >= 0.75 ? 'high' : (total / maxScore) >= 0.5 ? 'moderate' : 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default PanicTestResult;
