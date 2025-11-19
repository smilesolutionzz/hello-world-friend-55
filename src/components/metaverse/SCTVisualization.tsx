import React from 'react';
import { Card } from '@/components/ui/card';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SCTAnalysisResult } from '@/utils/SCTQuestions';

interface SCTVisualizationProps {
  result: SCTAnalysisResult;
}

export const SCTVisualization: React.FC<SCTVisualizationProps> = ({ result }) => {
  // 안전한 값 추출 함수
  const safeValue = (value: number | undefined | null): number => {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  // 안전한 배열 함수
  const safeArray = <T,>(arr: T[] | undefined | null): T[] => {
    return Array.isArray(arr) ? arr : [];
  };

  // 대상관계이론 데이터
  const objectRelationsData = [
    { subject: '자기표상', value: safeValue(result.objectRelations?.selfRepresentation?.score) },
    { subject: '대상표상', value: safeValue(result.objectRelations?.objectRepresentation?.score) },
    { subject: '분리개별화', value: safeValue(result.objectRelations?.separationIndividuation?.score) },
    { subject: '정서조절', value: safeValue(result.attachment?.emotionalRegulation?.score) },
  ];

  // 애착 유형 데이터
  const attachmentData = [
    { name: '안정', value: safeValue(result.attachment?.styleScores?.secure), color: '#10b981' },
    { name: '불안', value: safeValue(result.attachment?.styleScores?.anxious), color: '#f59e0b' },
    { name: '회피', value: safeValue(result.attachment?.styleScores?.avoidant), color: '#3b82f6' },
    { name: '혼란', value: safeValue(result.attachment?.styleScores?.disorganized), color: '#ef4444' },
  ];

  // 미충족 욕구 데이터
  const needsData = safeArray(result.needsAnalysis?.unmetNeeds).map(need => ({
    name: need.need || '미상',
    severity: safeValue(need.severity),
  }));

  // 방어기제 데이터
  const defensesData = safeArray(result.objectRelations?.defenseMechanisms).map(defense => ({
    name: defense.type || '미상',
    strength: safeValue(defense.strength),
  }));

  const attachmentStyleKorean: Record<string, string> = {
    'secure': '안정 애착',
    'anxious-preoccupied': '불안 애착',
    'dismissive-avoidant': '회피 애착',
    'fearful-avoidant': '혼란 애착',
  };

  return (
    <div className="space-y-6">
      {/* 전체 점수 */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">심리적 안녕감 종합 점수</h3>
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            {safeValue(result.overallScore)}
          </div>
          <p className="text-muted-foreground">
            {safeValue(result.overallScore) >= 70 ? '우수' : safeValue(result.overallScore) >= 50 ? '양호' : safeValue(result.overallScore) >= 30 ? '주의' : '개선 필요'}
          </p>
        </div>
      </Card>

      {/* 대상관계이론 - 레이더 차트 */}
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">대상관계이론 분석</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={objectRelationsData}>
            <PolarGrid stroke="#8b5cf6" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#e2e8f0' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#e2e8f0' }} />
            <Radar name="점수" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-purple-400">자기 표상:</p>
            <p className="text-sm text-muted-foreground">{result.objectRelations.selfRepresentation.description}</p>
            {safeArray(result.objectRelations.selfRepresentation.patterns).length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                패턴: {safeArray(result.objectRelations.selfRepresentation.patterns).join(', ')}
              </p>
            )}
          </div>
          
          <div>
            <p className="text-sm font-semibold text-purple-400">대상 표상:</p>
            <p className="text-sm text-muted-foreground">{result.objectRelations.objectRepresentation.description}</p>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div className="text-xs">
                <span className="text-pink-400">어머니: </span>
                <span className="text-muted-foreground">{result.objectRelations.objectRepresentation.parentalFigures.mother}</span>
              </div>
              <div className="text-xs">
                <span className="text-pink-400">아버지: </span>
                <span className="text-muted-foreground">{result.objectRelations.objectRepresentation.parentalFigures.father}</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-purple-400">분리-개별화:</p>
            <p className="text-sm text-muted-foreground">{result.objectRelations.separationIndividuation.stage}</p>
            <p className="text-xs text-muted-foreground mt-1">
              과제: {safeArray(result.objectRelations.separationIndividuation.challenges).join(', ')}
            </p>
          </div>
        </div>
      </Card>

      {/* 애착이론 - 바 차트 */}
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">애착 이론 분석</h3>
        <div className="mb-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm font-semibold text-purple-400">주요 애착 유형:</p>
          <p className="text-xl font-bold text-foreground">{attachmentStyleKorean[result.attachment.primaryStyle]}</p>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={attachmentData}>
            <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#e2e8f0' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {attachmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-purple-400">자기 관점:</p>
            <p className="text-sm text-muted-foreground">{result.attachment.internalWorkingModel.selfView}</p>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-purple-400">타인 관점:</p>
            <p className="text-sm text-muted-foreground">{result.attachment.internalWorkingModel.othersView}</p>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-purple-400">관계 기대:</p>
            <p className="text-sm text-muted-foreground">{result.attachment.internalWorkingModel.relationshipExpectations}</p>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-purple-400">정서 조절:</p>
            <p className="text-sm text-muted-foreground">
              강점: {safeArray(result.attachment.emotionalRegulation.strengths).join(', ')}
            </p>
            <p className="text-sm text-muted-foreground">
              과제: {safeArray(result.attachment.emotionalRegulation.challenges).join(', ')}
            </p>
          </div>
        </div>
      </Card>

      {/* 방어기제 */}
      {result.objectRelations.defenseMechanisms.length > 0 && (
        <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">방어기제 분석</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={defensesData} layout="horizontal">
              <XAxis type="number" domain={[0, 10]} tick={{ fill: '#e2e8f0' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0' }} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
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

      {/* 미충족 욕구 */}
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-pink-500/30 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">결핍 및 욕구 분석</h3>
        
        {needsData.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={needsData}>
                <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ec4899', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="severity" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-3">
              {safeArray(result.needsAnalysis.unmetNeeds).map((need, idx) => (
                <div key={idx} className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold text-pink-400">{need.need}</p>
                    <span className="text-xs text-muted-foreground">심각도: {safeValue(need.severity)}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    나타나는 양상: {safeArray(need.manifestations).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
        
        {safeArray(result.needsAnalysis.compensatoryBehaviors).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-pink-400 mb-2">보상적 행동 패턴:</p>
            <ul className="space-y-1">
              {safeArray(result.needsAnalysis.compensatoryBehaviors).map((behavior, idx) => (
                <li key={idx} className="text-xs text-muted-foreground ml-4">• {behavior}</li>
              ))}
            </ul>
          </div>
        )}
        
        {safeArray(result.needsAnalysis.coreBeliefs).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-pink-400 mb-2">핵심 신념:</p>
            <ul className="space-y-1">
              {safeArray(result.needsAnalysis.coreBeliefs).map((belief, idx) => (
                <li key={idx} className="text-xs text-muted-foreground ml-4">• {belief}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* 치료적 권고사항 */}
      <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-xl border border-green-500/30 p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">극복 방법 및 성장 전략</h3>
        
        <div className="mb-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-sm font-semibold text-green-400">주요 초점 영역:</p>
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
          <p className="text-sm font-semibold text-green-400 mb-2">당신의 강점:</p>
          <div className="flex flex-wrap gap-2">
            {result.therapeuticRecommendations.strengths.map((strength, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                {strength}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm font-semibold text-purple-400 mb-2">성장 잠재력:</p>
          <p className="text-sm text-muted-foreground">{result.therapeuticRecommendations.growthPotential}</p>
        </div>
      </Card>
    </div>
  );
};
