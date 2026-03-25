import React from 'react';
import { Card } from '@/components/ui/card';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { SCTAnalysisResult } from '@/utils/SCTQuestions';
import { useLanguage } from '@/i18n/LanguageContext';

interface SCTVisualizationProps {
  result: SCTAnalysisResult;
}

export const SCTVisualization: React.FC<SCTVisualizationProps> = ({ result }) => {
  const { isEnglish } = useLanguage();

  const safeValue = (value: number | undefined | null): number => typeof value === 'number' && !isNaN(value) ? value : 0;
  const safeArray = <T,>(arr: T[] | undefined | null): T[] => Array.isArray(arr) ? arr : [];

  const objectRelationsData = [
    { subject: isEnglish ? 'Self-Rep.' : '자기표상', value: safeValue(result.objectRelations?.selfRepresentation?.score) },
    { subject: isEnglish ? 'Object-Rep.' : '대상표상', value: safeValue(result.objectRelations?.objectRepresentation?.score) },
    { subject: isEnglish ? 'Sep.-Indiv.' : '분리개별화', value: safeValue(result.objectRelations?.separationIndividuation?.score) },
    { subject: isEnglish ? 'Emo. Reg.' : '정서조절', value: safeValue(result.attachment?.emotionalRegulation?.score) },
  ];

  const attachmentData = [
    { name: isEnglish ? 'Secure' : '안정', value: safeValue(result.attachment?.styleScores?.secure), color: '#10b981' },
    { name: isEnglish ? 'Anxious' : '불안', value: safeValue(result.attachment?.styleScores?.anxious), color: '#f59e0b' },
    { name: isEnglish ? 'Avoidant' : '회피', value: safeValue(result.attachment?.styleScores?.avoidant), color: '#3b82f6' },
    { name: isEnglish ? 'Disorg.' : '혼란', value: safeValue(result.attachment?.styleScores?.disorganized), color: '#ef4444' },
  ];

  const needsData = safeArray(result.needsAnalysis?.unmetNeeds).map(need => ({
    name: need.need || (isEnglish ? 'Unknown' : '미상'),
    severity: safeValue(need.severity),
  }));

  const defensesData = safeArray(result.objectRelations?.defenseMechanisms).map(defense => ({
    name: defense.type || (isEnglish ? 'Unknown' : '미상'),
    strength: safeValue(defense.strength),
  }));

  const attachmentStyleMap: Record<string, string> = isEnglish
    ? { 'secure': 'Secure Attachment', 'anxious-preoccupied': 'Anxious Attachment', 'dismissive-avoidant': 'Avoidant Attachment', 'fearful-avoidant': 'Disorganized Attachment' }
    : { 'secure': '안정 애착', 'anxious-preoccupied': '불안 애착', 'dismissive-avoidant': '회피 애착', 'fearful-avoidant': '혼란 애착' };

  const scoreLabel = (score: number) => {
    if (score >= 70) return isEnglish ? 'Excellent' : '우수';
    if (score >= 50) return isEnglish ? 'Good' : '양호';
    if (score >= 30) return isEnglish ? 'Caution' : '주의';
    return isEnglish ? 'Needs Improvement' : '개선 필요';
  };

  const tooltipStyle = { backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">{isEnglish ? 'Psychological Well-being Score' : '심리적 안녕감 종합 점수'}</h3>
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            {safeValue(result.overallScore)}
          </div>
          <p className="text-muted-foreground">{scoreLabel(safeValue(result.overallScore))}</p>
        </div>
      </Card>

      {/* Object Relations */}
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{isEnglish ? 'Object Relations Analysis' : '대상관계이론 분석'}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={objectRelationsData}>
            <PolarGrid stroke="#8b5cf6" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#e2e8f0' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#e2e8f0' }} />
            <Radar name={isEnglish ? 'Score' : '점수'} dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#e2e8f0' }} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-purple-400">{isEnglish ? 'Self Representation:' : '자기 표상:'}</p>
            <p className="text-sm text-muted-foreground">{result.objectRelations.selfRepresentation.description}</p>
            {safeArray(result.objectRelations.selfRepresentation.patterns).length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{isEnglish ? 'Patterns' : '패턴'}: {safeArray(result.objectRelations.selfRepresentation.patterns).join(', ')}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-400">{isEnglish ? 'Object Representation:' : '대상 표상:'}</p>
            <p className="text-sm text-muted-foreground">{result.objectRelations.objectRepresentation.description}</p>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div className="text-xs"><span className="text-pink-400">{isEnglish ? 'Mother: ' : '어머니: '}</span><span className="text-muted-foreground">{result.objectRelations.objectRepresentation.parentalFigures.mother}</span></div>
              <div className="text-xs"><span className="text-pink-400">{isEnglish ? 'Father: ' : '아버지: '}</span><span className="text-muted-foreground">{result.objectRelations.objectRepresentation.parentalFigures.father}</span></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-400">{isEnglish ? 'Separation-Individuation:' : '분리-개별화:'}</p>
            <p className="text-sm text-muted-foreground">{result.objectRelations.separationIndividuation.stage}</p>
            <p className="text-xs text-muted-foreground mt-1">{isEnglish ? 'Challenges' : '과제'}: {safeArray(result.objectRelations.separationIndividuation.challenges).join(', ')}</p>
          </div>
        </div>
      </Card>

      {/* Attachment */}
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{isEnglish ? 'Attachment Theory Analysis' : '애착 이론 분석'}</h3>
        <div className="mb-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm font-semibold text-purple-400">{isEnglish ? 'Primary Attachment Style:' : '주요 애착 유형:'}</p>
          <p className="text-xl font-bold text-foreground">{attachmentStyleMap[result.attachment.primaryStyle] || result.attachment.primaryStyle}</p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={attachmentData}>
            <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#e2e8f0' }} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#e2e8f0' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {attachmentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-3">
          <div><p className="text-sm font-semibold text-purple-400">{isEnglish ? 'Self View:' : '자기 관점:'}</p><p className="text-sm text-muted-foreground">{result.attachment.internalWorkingModel.selfView}</p></div>
          <div><p className="text-sm font-semibold text-purple-400">{isEnglish ? 'Others View:' : '타인 관점:'}</p><p className="text-sm text-muted-foreground">{result.attachment.internalWorkingModel.othersView}</p></div>
          <div><p className="text-sm font-semibold text-purple-400">{isEnglish ? 'Relationship Expectations:' : '관계 기대:'}</p><p className="text-sm text-muted-foreground">{result.attachment.internalWorkingModel.relationshipExpectations}</p></div>
          <div>
            <p className="text-sm font-semibold text-purple-400">{isEnglish ? 'Emotional Regulation:' : '정서 조절:'}</p>
            <p className="text-sm text-muted-foreground">{isEnglish ? 'Strengths' : '강점'}: {safeArray(result.attachment.emotionalRegulation.strengths).join(', ')}</p>
            <p className="text-sm text-muted-foreground">{isEnglish ? 'Challenges' : '과제'}: {safeArray(result.attachment.emotionalRegulation.challenges).join(', ')}</p>
          </div>
        </div>
      </Card>

      {/* Defense Mechanisms */}
      {result.objectRelations.defenseMechanisms.length > 0 && (
        <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">{isEnglish ? 'Defense Mechanism Analysis' : '방어기제 분석'}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={defensesData} layout="horizontal">
              <XAxis type="number" domain={[0, 10]} tick={{ fill: '#e2e8f0' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0' }} width={100} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="strength" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {result.objectRelations.defenseMechanisms.map((defense, idx) => (
              <div key={idx} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-sm font-semibold text-purple-400">{defense.type}</p>
                <p className="text-xs text-muted-foreground">{defense.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Unmet Needs */}
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-pink-500/30 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{isEnglish ? 'Needs & Deficiency Analysis' : '결핍 및 욕구 분석'}</h3>
        {needsData.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={needsData}>
                <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#e2e8f0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ec4899', borderRadius: '8px' }} labelStyle={{ color: '#e2e8f0' }} />
                <Bar dataKey="severity" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              {safeArray(result.needsAnalysis.unmetNeeds).map((need, idx) => (
                <div key={idx} className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold text-pink-400">{need.need}</p>
                    <span className="text-xs text-muted-foreground">{isEnglish ? 'Severity' : '심각도'}: {safeValue(need.severity)}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{isEnglish ? 'Manifestations' : '나타나는 양상'}: {safeArray(need.manifestations).join(', ')}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {safeArray(result.needsAnalysis.compensatoryBehaviors).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-pink-400 mb-2">{isEnglish ? 'Compensatory Behavior Patterns:' : '보상적 행동 패턴:'}</p>
            <ul className="space-y-1">
              {safeArray(result.needsAnalysis.compensatoryBehaviors).map((behavior, idx) => (
                <li key={idx} className="text-xs text-muted-foreground ml-4">• {behavior}</li>
              ))}
            </ul>
          </div>
        )}
        {safeArray(result.needsAnalysis.coreBeliefs).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-pink-400 mb-2">{isEnglish ? 'Core Beliefs:' : '핵심 신념:'}</p>
            <ul className="space-y-1">
              {safeArray(result.needsAnalysis.coreBeliefs).map((belief, idx) => (
                <li key={idx} className="text-xs text-muted-foreground ml-4">• {belief}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Therapeutic Recommendations */}
      <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-xl border border-green-500/30 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{isEnglish ? 'Growth Strategies & Coping Methods' : '극복 방법 및 성장 전략'}</h3>
        <div className="mb-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-sm font-semibold text-green-400">{isEnglish ? 'Primary Focus Area:' : '주요 초점 영역:'}</p>
          <p className="text-sm text-foreground font-medium">{result.therapeuticRecommendations.primaryFocus}</p>
        </div>
        <div className="space-y-4 mb-4">
          {result.therapeuticRecommendations.interventions.map((intervention, idx) => (
            <div key={idx} className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm font-semibold text-blue-400 mb-1">{intervention.area}</p>
              <p className="text-xs text-muted-foreground mb-2">{intervention.strategy}</p>
              <div className="space-y-1">
                {intervention.practices.map((practice, pidx) => (
                  <div key={pidx} className="flex items-start gap-2">
                    <span className="text-green-400 text-xs mt-0.5">✓</span>
                    <p className="text-xs text-muted-foreground">{practice}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <p className="text-sm font-semibold text-green-400 mb-2">{isEnglish ? 'Your Strengths:' : '당신의 강점:'}</p>
          <div className="flex flex-wrap gap-2">
            {result.therapeuticRecommendations.strengths.map((strength, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">{strength}</span>
            ))}
          </div>
        </div>
        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm font-semibold text-purple-400 mb-2">{isEnglish ? 'Growth Potential:' : '성장 잠재력:'}</p>
          <p className="text-sm text-muted-foreground">{result.therapeuticRecommendations.growthPotential}</p>
        </div>
      </Card>
    </div>
  );
};
