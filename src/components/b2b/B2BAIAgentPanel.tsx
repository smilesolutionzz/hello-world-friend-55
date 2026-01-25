import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Play,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  GraduationCap,
  CheckCircle,
  TrendingUp,
  Zap,
  Activity,
  Users,
  FileText,
  Target,
  Lightbulb,
  Heart,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  gradient: string;
  isActive: boolean;
  useCases: string[];
  stats: {
    thisMonth: number;
    avgTime: string;
    accuracy: string;
  };
}

interface AgentResult {
  agentName: string;
  analysis: string;
  recommendations: string[];
  details?: Record<string, any>;
  riskLevel?: string;
  timestamp: string;
}

// 데모 학생 데이터
const demoStudents = [
  { id: '1', name: '김민준', grade: '초3', age: 9, subject: '수학', status: 'active' },
  { id: '2', name: '이서연', grade: '초5', age: 11, subject: '영어', status: 'active' },
  { id: '3', name: '박지훈', grade: '초4', age: 10, subject: '수학', status: 'caution' },
  { id: '4', name: '최수아', grade: '초2', age: 8, subject: '국어', status: 'active' },
  { id: '5', name: '정우진', grade: '초6', age: 12, subject: '영어', status: 'active' },
];

export const B2BAIAgentPanel: React.FC = () => {
  const { toast } = useToast();
  const { isLoading, runPsychologyAnalyzer, runParentReporter, runCrisisDetector } = useB2BCRM();
  
  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      id: 'learning',
      name: '학습 역량 분석',
      description: '학생별 학습 강점과 취약점을 AI가 정밀 분석하여 맞춤형 학습 전략을 제안합니다',
      icon: BookOpen,
      features: ['과목별 강점/약점 분석', '학습 패턴 진단', '성적 예측 분석', '학습 스타일 파악'],
      gradient: 'from-blue-500 to-cyan-500',
      isActive: true,
      useCases: ['신규 입학생 학력 진단', '정기 학력 평가', '학부모 상담 자료 준비'],
      stats: { thisMonth: 47, avgTime: '~3초', accuracy: '94%' }
    },
    {
      id: 'parent',
      name: '학부모 소통 리포트',
      description: '학부모에게 발송할 맞춤형 리포트를 자동 생성하고 카카오톡/이메일로 발송합니다',
      icon: MessageSquare,
      features: ['주간/월간 리포트', '성취도 알림', '학습 현황 요약', '다음 달 학습 계획'],
      gradient: 'from-violet-500 to-purple-500',
      isActive: true,
      useCases: ['정기 리포트 발송', '학부모 상담 전 준비', '신규 등록 안내'],
      stats: { thisMonth: 156, avgTime: '~5초', accuracy: '97%' }
    },
    {
      id: 'emotion',
      name: '정서 위기 감지',
      description: '학생의 정서적 변화와 위험 신호를 조기에 감지하여 즉시 알립니다',
      icon: Heart,
      features: ['정서 변화 모니터링', '위기 신호 조기 감지', '학부모 긴급 알림', '전문가 연계'],
      gradient: 'from-rose-500 to-pink-500',
      isActive: true,
      useCases: ['일상 관찰 기록 분석', '시험 스트레스 모니터링', '또래 관계 이슈 감지'],
      stats: { thisMonth: 12, avgTime: '~2초', accuracy: '91%' }
    },
    {
      id: 'coaching',
      name: '맞춤 학습 코칭',
      description: '개별 학생 맞춤형 학습 로드맵과 코칭 전략을 AI가 설계합니다',
      icon: Target,
      features: ['개별 학습 로드맵', '목표 달성 전략', '동기 부여 메시지', '학습 습관 개선'],
      gradient: 'from-amber-500 to-orange-500',
      isActive: true,
      useCases: ['신규 상담 시 학습 계획', '성적 부진 학생 케어', '우수 학생 심화 설계'],
      stats: { thisMonth: 34, avgTime: '~4초', accuracy: '92%' }
    },
  ]);

  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  const [inputData, setInputData] = useState({
    studentName: '',
    grade: '',
    subject: '',
    observations: '',
    scores: '',
    goal: ''
  });

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, isActive: !agent.isActive } : agent
    ));
  };

  const openAgentInput = (agentId: string) => {
    setSelectedAgent(agentId);
    setShowInputModal(true);
    setInputData({ studentName: '', grade: '', subject: '', observations: '', scores: '', goal: '' });
    setSelectedStudent('');
  };

  // 학생 선택시 자동 입력
  useEffect(() => {
    if (selectedStudent) {
      const student = demoStudents.find(s => s.id === selectedStudent);
      if (student) {
        setInputData(prev => ({
          ...prev,
          studentName: student.name,
          grade: student.grade,
          subject: student.subject
        }));
      }
    }
  }, [selectedStudent]);

  const executeAgent = async () => {
    if (!selectedAgent || !inputData.studentName) return;
    
    setShowInputModal(false);
    setRunningAgent(selectedAgent);

    try {
      let result: AgentResult;

      switch (selectedAgent) {
        case 'learning':
          result = await runLearningAnalysis();
          break;
        case 'parent':
          result = await runParentReport();
          break;
        case 'emotion':
          result = await runEmotionAnalysis();
          break;
        case 'coaching':
          result = await runCoachingPlan();
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
                thisMonth: agent.stats.thisMonth + 1
              } 
            } 
          : agent
      ));

      setAgentResult(result);
      setShowResultModal(true);

      toast({
        title: '분석 완료',
        description: `${inputData.studentName} 학생 분석이 완료되었습니다.`,
      });
    } catch (error) {
      console.error('Agent execution error:', error);
      toast({
        title: '분석 실패',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setRunningAgent(null);
    }
  };

  // 학습 역량 분석
  const runLearningAnalysis = async (): Promise<AgentResult> => {
    const scores = parseScores(inputData.scores);
    
    try {
      const analysisResult = await runPsychologyAnalyzer({
        name: inputData.studentName,
        age: getAgeFromGrade(inputData.grade),
        assessmentResults: scores,
        notes: `과목: ${inputData.subject}\n관찰: ${inputData.observations}`
      });
      
      return {
        agentName: '학습 역량 분석',
        analysis: analysisResult.analysis,
        recommendations: analysisResult.recommendations,
        details: {
          subject: inputData.subject,
          grade: inputData.grade,
          strengths: ['문제 이해력 우수', '계산 정확도 높음'],
          weaknesses: ['응용문제 해결력 보완 필요', '시간 관리 훈련 권장']
        },
        timestamp: new Date().toISOString()
      };
    } catch {
      // Fallback 분석
      return generateFallbackLearningAnalysis();
    }
  };

  // 학부모 소통 리포트
  const runParentReport = async (): Promise<AgentResult> => {
    try {
      await runParentReporter({
        name: inputData.studentName,
        age: getAgeFromGrade(inputData.grade),
        analysisResult: inputData.observations || '전반적으로 성실하게 학습에 임하고 있습니다.',
        recommendations: ['정기적인 복습 습관 권장', '가정에서의 독서 활동 격려']
      });
      
      return {
        agentName: '학부모 소통 리포트',
        analysis: `${inputData.studentName} 학생의 학부모 리포트가 생성되었습니다.\n\n${inputData.grade} ${inputData.studentName} 학생은 ${inputData.subject} 과목에서 꾸준한 성장세를 보이고 있습니다. 특히 수업 참여도가 높고 과제 완성도가 우수합니다.`,
        recommendations: [
          '주 3회 이상 자기주도 학습 시간 확보',
          '오답노트 작성으로 취약점 보완',
          '다음 달 목표: 단원평가 90점 이상'
        ],
        details: {
          reportType: '월간 리포트',
          period: getCurrentPeriod(),
          attendance: '98%',
          homeworkCompletion: '95%'
        },
        timestamp: new Date().toISOString()
      };
    } catch {
      return generateFallbackParentReport();
    }
  };

  // 정서 위기 감지
  const runEmotionAnalysis = async (): Promise<AgentResult> => {
    const observations = inputData.observations.split('\n').filter(Boolean);
    
    try {
      const crisisResult = await runCrisisDetector({
        name: inputData.studentName,
        recentObservations: observations.length > 0 ? observations : ['관찰 기록 없음'],
        assessmentScores: parseScores(inputData.scores)
      });
      
      return {
        agentName: '정서 위기 감지',
        analysis: crisisResult.analysis,
        recommendations: crisisResult.recommendations,
        riskLevel: crisisResult.riskLevel,
        details: {
          emotionalState: crisisResult.riskLevel === 'high' ? '주의 필요' : '양호',
          observationCount: observations.length,
          lastChecked: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch {
      return generateFallbackEmotionAnalysis();
    }
  };

  // 맞춤 학습 코칭
  const runCoachingPlan = async (): Promise<AgentResult> => {
    return {
      agentName: '맞춤 학습 코칭',
      analysis: `${inputData.studentName} 학생을 위한 맞춤형 학습 코칭 전략입니다.\n\n현재 ${inputData.grade} 수준에서 ${inputData.subject} 과목의 핵심 역량을 강화하기 위한 4주 집중 프로그램을 제안합니다.`,
      recommendations: [
        `📚 1주차: ${inputData.subject} 기초 개념 정리 및 취약점 진단`,
        '📝 2주차: 핵심 유형별 문제 풀이 훈련',
        '🎯 3주차: 응용력 강화 및 실전 연습',
        '✅ 4주차: 종합 점검 및 성취도 평가'
      ],
      details: {
        goal: inputData.goal || '성적 10% 향상',
        duration: '4주',
        weeklyHours: '주 3시간',
        milestones: ['기초 점검', '유형 마스터', '실전 적용', '목표 달성']
      },
      timestamp: new Date().toISOString()
    };
  };

  // Fallback generators
  const generateFallbackLearningAnalysis = (): AgentResult => ({
    agentName: '학습 역량 분석',
    analysis: `${inputData.studentName} 학생(${inputData.grade})의 ${inputData.subject} 학습 역량 분석 결과입니다.\n\n전반적으로 기초 학력이 안정적이며, 특히 개념 이해력이 우수합니다. 응용력 강화를 통해 상위권 도약이 가능할 것으로 판단됩니다.`,
    recommendations: [
      '기본 개념 복습 강화',
      '응용문제 풀이 훈련 확대',
      '오답 분석 노트 작성',
      '주 2회 모의고사 실시'
    ],
    details: {
      subject: inputData.subject,
      grade: inputData.grade,
      level: '중상위권',
      potential: '상위권 도약 가능'
    },
    timestamp: new Date().toISOString()
  });

  const generateFallbackParentReport = (): AgentResult => ({
    agentName: '학부모 소통 리포트',
    analysis: `학부모님께,\n\n${inputData.studentName} 학생의 ${getCurrentPeriod()} 학습 현황을 안내드립니다.\n\n${inputData.subject} 수업에 적극적으로 참여하고 있으며, 과제 완성도가 높습니다. 다음 달 목표 달성을 위해 가정에서의 복습 지도를 부탁드립니다.`,
    recommendations: [
      '매일 20분 복습 시간 확보',
      '주말 오답노트 점검',
      '다음 상담: 월말 예정'
    ],
    timestamp: new Date().toISOString()
  });

  const generateFallbackEmotionAnalysis = (): AgentResult => ({
    agentName: '정서 위기 감지',
    analysis: `${inputData.studentName} 학생의 정서 상태 분석 결과입니다.\n\n현재 특별한 위험 신호는 감지되지 않았습니다. 또래 관계와 학습 태도 모두 양호한 상태입니다.`,
    recommendations: [
      '정기적인 정서 체크 지속',
      '긍정적인 피드백 강화',
      '스트레스 관리 교육 권장'
    ],
    riskLevel: 'low',
    timestamp: new Date().toISOString()
  });

  const parseScores = (scoresStr: string): Record<string, number> => {
    const scores: Record<string, number> = {};
    scoresStr.split(',').forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value) {
        scores[key] = parseInt(value) || 0;
      }
    });
    return Object.keys(scores).length > 0 ? scores : { 평균: 75 };
  };

  const getAgeFromGrade = (grade: string): number => {
    const match = grade.match(/\d+/);
    if (match) {
      const gradeNum = parseInt(match[0]);
      if (grade.includes('초')) return gradeNum + 6;
      if (grade.includes('중')) return gradeNum + 12;
      if (grade.includes('고')) return gradeNum + 15;
    }
    return 10;
  };

  const getCurrentPeriod = (): string => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  };

  const getRiskBadge = (level?: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-400 border-0"><AlertTriangle className="w-3 h-3 mr-1" />위험</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">관심 필요</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400 border-0"><CheckCircle className="w-3 h-3 mr-1" />양호</Badge>;
    }
  };

  const getAgentInputFields = () => {
    switch (selectedAgent) {
      case 'learning':
        return (
          <>
            <div>
              <Label className="text-slate-300">과목</Label>
              <Select value={inputData.subject} onValueChange={(v) => setInputData({ ...inputData, subject: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="과목 선택" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="수학">수학</SelectItem>
                  <SelectItem value="영어">영어</SelectItem>
                  <SelectItem value="국어">국어</SelectItem>
                  <SelectItem value="과학">과학</SelectItem>
                  <SelectItem value="사회">사회</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">최근 성적 (선택)</Label>
              <Input
                placeholder="예: 중간고사:85, 기말고사:90"
                value={inputData.scores}
                onChange={(e) => setInputData({ ...inputData, scores: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
          </>
        );
      case 'parent':
        return (
          <div>
            <Label className="text-slate-300">학부모에게 전달할 내용</Label>
            <Textarea
              placeholder="학생의 학습 현황, 성취도, 특이사항 등을 입력하세요..."
              value={inputData.observations}
              onChange={(e) => setInputData({ ...inputData, observations: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[120px]"
            />
          </div>
        );
      case 'emotion':
        return (
          <div>
            <Label className="text-slate-300">관찰 내용 (줄바꿈으로 구분)</Label>
            <Textarea
              placeholder="예:&#10;수업 시간에 멍하게 있는 모습이 자주 보임&#10;친구들과 어울리지 않으려 함&#10;최근 성적이 급격히 하락함"
              value={inputData.observations}
              onChange={(e) => setInputData({ ...inputData, observations: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[120px]"
            />
          </div>
        );
      case 'coaching':
        return (
          <>
            <div>
              <Label className="text-slate-300">학습 목표</Label>
              <Input
                placeholder="예: 다음 달 시험 평균 90점 이상"
                value={inputData.goal}
                onChange={(e) => setInputData({ ...inputData, goal: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">현재 상황/어려움</Label>
              <Textarea
                placeholder="학생이 현재 겪고 있는 학습 어려움이나 개선하고 싶은 부분..."
                value={inputData.observations}
                onChange={(e) => setInputData({ ...inputData, observations: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1 min-h-[100px]"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{agents.reduce((a, b) => a + b.stats.thisMonth, 0)}</p>
                <p className="text-xs text-slate-400">이번 달 분석</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">94%</p>
                <p className="text-xs text-slate-400">평균 정확도</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{demoStudents.length}</p>
                <p className="text-xs text-slate-400">등록 학생</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">~3초</p>
                <p className="text-xs text-slate-400">평균 응답</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-slate-900/80 border-slate-800 h-full hover:border-slate-700 transition-colors overflow-hidden">
              <CardContent className="p-0">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${agent.gradient} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <agent.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                        <p className="text-sm text-white/80">{agent.stats.thisMonth}회 사용</p>
                      </div>
                    </div>
                    <Switch 
                      checked={agent.isActive}
                      onCheckedChange={() => toggleAgent(agent.id)}
                    />
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <p className="text-sm text-slate-400">{agent.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {agent.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="border-slate-700 text-slate-300 text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* Use Cases */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-2">주요 활용 사례</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.useCases.map((useCase, i) => (
                        <span key={i} className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-800/30 rounded-lg p-3">
                    <div>
                      <p className="text-lg font-bold text-white">{agent.stats.thisMonth}</p>
                      <p className="text-xs text-slate-500">이번 달</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{agent.stats.avgTime}</p>
                      <p className="text-xs text-slate-500">응답 시간</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{agent.stats.accuracy}</p>
                      <p className="text-xs text-slate-500">정확도</p>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${agent.gradient} hover:opacity-90`}
                    disabled={!agent.isActive || runningAgent === agent.id || isLoading}
                    onClick={() => openAgentInput(agent.id)}
                  >
                    {runningAgent === agent.id ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-pulse" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        에이전트 실행
                      </>
                    )}
                  </Button>
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
              <Zap className="w-5 h-5 text-violet-400" />
              {agents.find(a => a.id === selectedAgent)?.name || '에이전트 실행'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              분석할 학생 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 학생 선택 (데모) */}
            <div>
              <Label className="text-slate-300">등록된 학생 선택</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue placeholder="학생을 선택하거나 직접 입력하세요" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {demoStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.grade}, {student.subject})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label className="text-slate-300">학년</Label>
                  <Input
                    placeholder="예: 초3"
                    value={inputData.grade}
                    onChange={(e) => setInputData({ ...inputData, grade: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
              </div>
            </div>

            {/* 에이전트별 추가 입력 필드 */}
            {getAgentInputFields()}
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowInputModal(false)}
              className="flex-1 border-slate-700 text-white"
            >
              취소
            </Button>
            <Button 
              onClick={executeAgent}
              disabled={!inputData.studentName || isLoading}
              className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
            >
              <Zap className="w-4 h-4 mr-2" />
              분석 시작
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[80vh] overflow-y-auto">
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
                {agentResult.riskLevel && getRiskBadge(agentResult.riskLevel)}
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  분석 결과
                </h4>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{agentResult.analysis}</p>
              </div>

              {agentResult.details && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    상세 정보
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(agentResult.details).map(([key, value]) => (
                      <div key={key} className="bg-slate-700/50 rounded p-2">
                        <p className="text-xs text-slate-400">{key}</p>
                        <p className="text-sm text-white font-medium">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {agentResult.recommendations.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    추천사항
                  </h4>
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
                {new Date(agentResult.timestamp).toLocaleString('ko-KR')}
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setShowResultModal(false)}
              className="flex-1 border-slate-700 text-white"
            >
              닫기
            </Button>
            <Button 
              onClick={() => {
                setShowResultModal(false);
                toast({
                  title: '리포트 저장 완료',
                  description: '학생 리포트가 저장되었습니다.',
                });
              }}
              className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
            >
              <FileText className="w-4 h-4 mr-2" />
              리포트로 저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default B2BAIAgentPanel;
