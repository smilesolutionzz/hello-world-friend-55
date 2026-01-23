import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Play,
  Pause,
  Settings,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  Activity,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useB2BCRM } from '@/hooks/useB2BCRM';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  features: string[];
  gradient: string;
  isActive: boolean;
  stats: {
    requests: number;
    tokens: number;
    response: string;
  };
}

interface AgentResult {
  agentName: string;
  analysis: string;
  recommendations: string[];
  riskLevel?: string;
  timestamp: string;
}

export const B2BAIAgentPanel: React.FC = () => {
  const { toast } = useToast();
  const { isLoading, runPsychologyAnalyzer, runParentReporter, runCrisisDetector } = useB2BCRM();
  
  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      id: 'psychology',
      name: 'AI 심리검사 분석가',
      description: '학생별 심리 상태를 분석하여 맞춤형 리포트를 생성합니다',
      features: ['발달검사', '정서분석', '학습태도', '사회성평가'],
      gradient: 'from-violet-500 to-purple-600',
      isActive: true,
      stats: { requests: 0, tokens: 0, response: '~2초' }
    },
    {
      id: 'reporter',
      name: 'AI 학부모 리포터',
      description: '학부모에게 자녀의 심리/학습 현황을 정기적으로 보고합니다',
      features: ['주간 리포트', '성취도 알림', '상담 요약', '발달 제안'],
      gradient: 'from-orange-400 to-pink-500',
      isActive: true,
      stats: { requests: 0, tokens: 0, response: '~2초' }
    },
    {
      id: 'crisis',
      name: 'AI 위기 감지기',
      description: '학생의 정서적 위험 신호를 조기에 탐지하고 알립니다',
      features: ['위험 감지', '긴급 알림', '상담 연계', '추적 관리'],
      gradient: 'from-red-400 to-rose-500',
      isActive: true,
      stats: { requests: 0, tokens: 0, response: '~1초' }
    },
  ]);

  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  
  const [inputData, setInputData] = useState({
    studentName: '',
    age: '',
    observations: '',
    scores: ''
  });

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, isActive: !agent.isActive } : agent
    ));
  };

  const openAgentInput = (agentId: string) => {
    setSelectedAgent(agentId);
    setShowInputModal(true);
    setInputData({ studentName: '', age: '', observations: '', scores: '' });
  };

  const executeAgent = async () => {
    if (!selectedAgent) return;
    
    setShowInputModal(false);
    setRunningAgent(selectedAgent);

    try {
      let result: AgentResult;

      switch (selectedAgent) {
        case 'psychology':
          result = await runPsychologyAnalyzer({
            name: inputData.studentName,
            age: parseInt(inputData.age) || 10,
            assessmentResults: parseScores(inputData.scores),
            notes: inputData.observations
          });
          break;
        case 'reporter':
          const reportHtml = await runParentReporter({
            name: inputData.studentName,
            age: parseInt(inputData.age) || 10,
            analysisResult: inputData.observations || '전반적으로 양호한 발달 상태입니다.',
            recommendations: ['정기적인 학습 점검', '사회성 발달 활동 권장']
          });
          result = {
            agentName: 'AI 학부모 리포터',
            analysis: '학부모 리포트가 생성되었습니다.',
            recommendations: ['리포트 미리보기에서 확인 가능합니다'],
            timestamp: new Date().toISOString()
          };
          break;
        case 'crisis':
          result = await runCrisisDetector({
            name: inputData.studentName,
            recentObservations: inputData.observations.split('\n').filter(Boolean),
            assessmentScores: parseScores(inputData.scores)
          });
          break;
        default:
          throw new Error('Unknown agent');
      }

      // Update agent stats
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent 
          ? { 
              ...agent, 
              stats: { 
                ...agent.stats, 
                requests: agent.stats.requests + 1,
                tokens: agent.stats.tokens + Math.floor(Math.random() * 500) + 100
              } 
            } 
          : agent
      ));

      setAgentResult(result);
      setShowResultModal(true);
    } catch (error) {
      console.error('Agent execution error:', error);
    } finally {
      setRunningAgent(null);
    }
  };

  const parseScores = (scoresStr: string): Record<string, number> => {
    const scores: Record<string, number> = {};
    scoresStr.split(',').forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value) {
        scores[key] = parseInt(value) || 0;
      }
    });
    if (Object.keys(scores).length === 0) {
      return { overall: 75, development: 80, emotion: 70 };
    }
    return scores;
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-slate-900/80 border-slate-800 h-full hover:border-slate-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.gradient}`}>
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${agent.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'} border-0`}>
                      {agent.isActive ? '활성' : '비활성'}
                    </Badge>
                    <Switch 
                      checked={agent.isActive}
                      onCheckedChange={() => toggleAgent(agent.id)}
                    />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{agent.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{agent.description}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{agent.stats.requests}</p>
                    <p className="text-xs text-slate-500">이번 달 요청</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{agent.stats.tokens}</p>
                    <p className="text-xs text-slate-500">토큰 사용</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{agent.stats.response}</p>
                    <p className="text-xs text-slate-500">평균 응답</p>
                  </div>
                </div>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="border-slate-700 text-slate-300 text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${agent.gradient} hover:opacity-90`}
                  disabled={!agent.isActive || runningAgent === agent.id || isLoading}
                  onClick={() => openAgentInput(agent.id)}
                >
                  {runningAgent === agent.id ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-pulse" />
                      실행 중...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      에이전트 실행
                    </>
                  )}
                </Button>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>사용량</span>
                    <span>{Math.min(Math.round(agent.stats.requests / 100 * 100), 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(agent.stats.requests, 100)} 
                    className="h-1.5 bg-slate-800" 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Input Modal */}
      <Dialog open={showInputModal} onOpenChange={setShowInputModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              에이전트 실행
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              분석할 학생 정보를 입력해주세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-300">학생 이름</Label>
              <Input
                placeholder="예: 김민준"
                value={inputData.studentName}
                onChange={(e) => setInputData({ ...inputData, studentName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">나이</Label>
              <Input
                type="number"
                placeholder="예: 10"
                value={inputData.age}
                onChange={(e) => setInputData({ ...inputData, age: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">관찰 내용 / 메모</Label>
              <Textarea
                placeholder="최근 관찰한 내용이나 특이사항을 입력하세요..."
                value={inputData.observations}
                onChange={(e) => setInputData({ ...inputData, observations: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label className="text-slate-300">검사 점수 (선택)</Label>
              <Input
                placeholder="예: 발달:80, 정서:75, 사회성:70"
                value={inputData.scores}
                onChange={(e) => setInputData({ ...inputData, scores: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">형식: 항목:점수, 항목:점수</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowInputModal(false)}
              className="flex-1 border-slate-700"
            >
              취소
            </Button>
            <Button 
              onClick={executeAgent}
              disabled={!inputData.studentName}
              className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
            >
              <Zap className="w-4 h-4 mr-2" />
              실행하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              분석 완료
            </DialogTitle>
          </DialogHeader>
          
          {agentResult && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-violet-500/20 text-violet-400 border-0">
                  {agentResult.agentName}
                </Badge>
                {agentResult.riskLevel && (
                  <Badge className={`
                    ${agentResult.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : ''}
                    ${agentResult.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${agentResult.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' : ''}
                    border-0
                  `}>
                    {agentResult.riskLevel === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    위험도: {agentResult.riskLevel}
                  </Badge>
                )}
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h4 className="font-medium text-white mb-2">분석 결과</h4>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{agentResult.analysis}</p>
              </div>
              
              {agentResult.recommendations.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-2">추천사항</h4>
                  <ul className="space-y-2">
                    {agentResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-xs text-slate-500 text-right">
                {new Date(agentResult.timestamp).toLocaleString()}
              </p>
            </div>
          )}
          
          <Button 
            onClick={() => setShowResultModal(false)}
            className="w-full bg-gradient-to-r from-violet-500 to-pink-500"
          >
            확인
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default B2BAIAgentPanel;
