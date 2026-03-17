import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import ClinicalReportLayout, { DomainScore, ReportSection } from './ClinicalReportLayout';
import VisualResultInfographic from './VisualResultInfographic';

interface PersonalityLoveResultProps {
  result: any;
  onRestart: () => void;
}

export const PersonalityLoveResult: React.FC<PersonalityLoveResultProps> = ({ result, onRestart }) => {
  const { personalityType, aiAnalysis } = result;
  const { toast } = useToast();

  useAutoSaveTestResult({
    testType: '연애 성격 검사',
    results: { personalityType: personalityType.type, characteristics: personalityType.characteristics, loveStyle: personalityType.loveStyle },
    analysis: aiAnalysis,
    severity: '보통',
    ageGroup: 'adult',
  });

  const domains: DomainScore[] = (personalityType.characteristics || []).map((char: string, idx: number) => ({
    key: `char-${idx}`,
    label: char,
    score: 70 + Math.random() * 25,
    maxScore: 100,
    level: '높음',
    color: 'bg-pink-500',
  }));

  const parseAISections = (text: string): ReportSection[] => {
    if (!text) return [];
    const paragraphs = text.split('\n\n').filter((p: string) => p.trim().length > 20);
    const icons = ['💕', '💖', '🌹', '💡', '🎯', '✨'];
    return paragraphs.slice(0, 6).map((p: string, idx: number) => {
      const firstLine = p.split('\n')[0].replace(/[#*]/g, '').trim();
      const rest = p.split('\n').slice(1).join('\n').trim() || p;
      return { id: `s-${idx}`, icon: icons[idx] || '📋', title: firstLine.length > 5 && firstLine.length < 50 ? firstLine : `분석 ${idx + 1}`, content: rest, defaultOpen: idx === 0 };
    });
  };

  const aiSections = parseAISections(aiAnalysis);

  const handleDownload = async () => {
    await downloadResultAsPDF('clinical-report-content', '연애성격_분석_결과',
      () => toast({ title: 'PDF 다운로드 완료' }),
      (e) => toast({ title: '다운로드 실패', description: e.message, variant: 'destructive' })
    );
  };

  return (
    <ClinicalReportLayout
      testName="연애 성격 유형 분석 결과"
      subtitle={`유형: ${personalityType.type}`}
      onBack={onRestart}
      onDownload={handleDownload}
      totalScore={personalityType.type}
      totalLabel="연애 유형"
      scoreSeverity={personalityType.loveStyle || ''}
      severityColor="text-pink-600 border-pink-300"
      domains={domains}
      aiAnalysis={aiAnalysis}
      aiSections={aiSections.length > 0 ? aiSections : undefined}
    >
      <div className="mb-4">
        <VisualResultInfographic
          data={{
            testName: '연애 성격',
            subtitle: '유형 분석',
            date: new Date().toLocaleDateString('ko-KR'),
            scores: Object.fromEntries((personalityType.characteristics || []).map((c: string, i: number) => [`char${i}`, 4 + Math.random() * 3])),
            maxScore: 7,
            categoryTranslations: Object.fromEntries((personalityType.characteristics || []).map((c: string, i: number) => [`char${i}`, c])),
            riskLevel: 'low',
          }}
        />
      </div>
    </ClinicalReportLayout>
  );
};

export default PersonalityLoveResult;
