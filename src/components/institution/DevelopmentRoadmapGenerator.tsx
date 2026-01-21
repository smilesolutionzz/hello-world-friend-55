import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Calendar, 
  TrendingUp, 
  Brain,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  Download,
  Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  goals: string[];
  activities: string[];
  expectedOutcome: string;
  progress: number;
}

interface DevelopmentRoadmap {
  studentName: string;
  institutionType: string;
  currentLevel: string;
  targetGoals: string[];
  phases: RoadmapPhase[];
  recommendations: string[];
}

// 기관 유형별 로드맵 템플릿
const ROADMAP_TEMPLATES: Record<string, { name: string; phases: Omit<RoadmapPhase, 'id' | 'progress'>[] }> = {
  academy: {
    name: '학원/교습소',
    phases: [
      {
        title: '기초 평가 및 목표 설정',
        duration: '1주차',
        goals: ['학습 수준 진단', '집중력 평가', '학습 스타일 파악'],
        activities: ['기초 학력 테스트', 'AI 집중력 게임', '학부모 상담'],
        expectedOutcome: '개인 맞춤 학습 계획 수립'
      },
      {
        title: '기초 역량 강화',
        duration: '2-4주차',
        goals: ['집중력 향상 20%', '기초 개념 정립', '학습 습관 형성'],
        activities: ['뇌훈련 게임 주 3회', '개념 학습 진행', '일일 학습일지 작성'],
        expectedOutcome: '기초 역량 안정화'
      },
      {
        title: '심화 학습 진입',
        duration: '5-8주차',
        goals: ['응용력 개발', '자기주도 학습 능력', '문제해결력 향상'],
        activities: ['심화 문제 풀이', '그룹 토론 활동', '프로젝트 학습'],
        expectedOutcome: '상위 학습 단계 진입'
      },
      {
        title: '성과 측정 및 다음 단계',
        duration: '9-12주차',
        goals: ['목표 달성도 측정', '취약점 보완', '다음 분기 계획'],
        activities: ['종합 평가 테스트', '학부모 성과 보고', 'AI 분석 리포트'],
        expectedOutcome: '분기별 성장 기록'
      }
    ]
  },
  development_center: {
    name: '발달센터',
    phases: [
      {
        title: '발달 수준 종합 평가',
        duration: '1-2주차',
        goals: ['발달 영역별 수준 파악', '강점/약점 분석', '가족력 조사'],
        activities: ['K-WISC 검사', '관찰일지 작성', '부모 면담'],
        expectedOutcome: '발달 프로파일 작성'
      },
      {
        title: '개별화 치료 계획',
        duration: '3-8주차',
        goals: ['언어발달 촉진', '사회성 향상', '감각통합 개선'],
        activities: ['1:1 언어치료', '소그룹 사회성 훈련', '감각통합 활동'],
        expectedOutcome: '기초 발달 영역 개선'
      },
      {
        title: '일반화 및 적용',
        duration: '9-16주차',
        goals: ['일상생활 적용', '또래 관계 형성', '가정연계 훈련'],
        activities: ['통합 환경 경험', '가정방문 지도', '또래 놀이 참여'],
        expectedOutcome: '실생활 적용 능력 향상'
      },
      {
        title: '유지 및 모니터링',
        duration: '17-24주차',
        goals: ['성과 유지', '추가 목표 설정', '장기 계획 수립'],
        activities: ['정기 재평가', '부모 코칭', '학교 연계 준비'],
        expectedOutcome: '지속적 성장 기반 마련'
      }
    ]
  },
  counseling_center: {
    name: '상담센터',
    phases: [
      {
        title: '초기 상담 및 평가',
        duration: '1-2회기',
        goals: ['심리적 상태 파악', '주호소 문제 분석', '치료 동기 확인'],
        activities: ['심리검사 실시', '초기 면담', '치료 목표 합의'],
        expectedOutcome: '상담 계획 수립'
      },
      {
        title: '핵심 문제 탐색',
        duration: '3-8회기',
        goals: ['정서 안정화', '문제 원인 이해', '대처 기술 학습'],
        activities: ['개인 상담', '인지행동 기법', '이완 훈련'],
        expectedOutcome: '문제 인식 및 통찰'
      },
      {
        title: '변화 및 실천',
        duration: '9-16회기',
        goals: ['행동 변화 실천', '긍정적 자기상 형성', '관계 개선'],
        activities: ['역할극', '일상 과제 수행', '가족 상담'],
        expectedOutcome: '실질적 변화 경험'
      },
      {
        title: '종결 및 예방',
        duration: '17-20회기',
        goals: ['성과 정리', '재발 방지 계획', '자기관리 능력'],
        activities: ['종결 면담', '대처 매뉴얼 작성', '추후 상담 계획'],
        expectedOutcome: '독립적 문제해결 능력'
      }
    ]
  },
  hospital: {
    name: '병원/의원',
    phases: [
      {
        title: '종합 진단 평가',
        duration: '1-2주차',
        goals: ['정확한 진단', '동반 증상 파악', '치료 계획 수립'],
        activities: ['임상 면담', '심리검사', '의학적 평가'],
        expectedOutcome: '진단 및 치료 계획 확정'
      },
      {
        title: '집중 치료기',
        duration: '1-3개월',
        goals: ['증상 완화', '기능 회복', '부작용 모니터링'],
        activities: ['약물 치료', '치료 프로그램', '정기 진료'],
        expectedOutcome: '주요 증상 50% 이상 감소'
      },
      {
        title: '안정화 단계',
        duration: '4-6개월',
        goals: ['치료 효과 유지', '일상 복귀', '재발 예방'],
        activities: ['유지 치료', '사회기술 훈련', '가족 교육'],
        expectedOutcome: '안정적 일상 유지'
      },
      {
        title: '추적 관리',
        duration: '7-12개월',
        goals: ['장기 예후 관리', '조기 재발 감지', '자가 관리 능력'],
        activities: ['정기 외래 진료', 'AI 모니터링', '위기 개입 준비'],
        expectedOutcome: '완전 회복 또는 안정적 관리'
      }
    ]
  }
};

interface DevelopmentRoadmapGeneratorProps {
  institutionType: string;
  members: Array<{ id: string; member_name: string; birth_date?: string }>;
}

export default function DevelopmentRoadmapGenerator({ 
  institutionType, 
  members 
}: DevelopmentRoadmapGeneratorProps) {
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<DevelopmentRoadmap | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  const template = ROADMAP_TEMPLATES[institutionType] || ROADMAP_TEMPLATES.academy;

  const generateRoadmap = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    setGenerating(true);
    setSelectedMember(memberId);

    // AI 로드맵 생성 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));

    const roadmap: DevelopmentRoadmap = {
      studentName: member.member_name,
      institutionType: template.name,
      currentLevel: '기초 단계',
      targetGoals: [
        '집중력 및 주의력 30% 향상',
        '사회성 발달 지표 개선',
        '학습 준비도 향상'
      ],
      phases: template.phases.map((phase, idx) => ({
        ...phase,
        id: `phase-${idx}`,
        progress: idx === 0 ? 45 : 0
      })),
      recommendations: [
        '주 2회 이상 AI 집중력 게임 권장',
        '매일 10분 관찰일지 작성으로 변화 추적',
        '월 1회 학부모 상담으로 가정연계 강화',
        '3개월마다 종합 평가로 목표 조정'
      ]
    };

    setGeneratedRoadmap(roadmap);
    setGenerating(false);

    toast({
      title: "로드맵 생성 완료",
      description: `${member.member_name} 학생의 맞춤 발달 로드맵이 생성되었습니다.`
    });
  };

  const exportRoadmap = () => {
    toast({
      title: "로드맵 내보내기",
      description: "PDF 형식으로 다운로드됩니다."
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI 발달 로드맵 생성기
                  <Badge className="bg-indigo-500">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {template.name} 맞춤
                  </Badge>
                </CardTitle>
                <CardDescription>
                  기관 유형에 최적화된 개별화 발달 계획을 자동 생성합니다
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 학생 선택 */}
      {!generatedRoadmap && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              로드맵 생성할 학생 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>등록된 학생이 없습니다</p>
                <p className="text-sm">먼저 학생을 등록해주세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {members.map((member) => (
                  <Button
                    key={member.id}
                    variant="outline"
                    className={cn(
                      "h-auto py-4 flex flex-col items-center gap-2",
                      selectedMember === member.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => generateRoadmap(member.id)}
                    disabled={generating}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{member.member_name}</span>
                    {member.birth_date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(member.birth_date).getFullYear()}년생
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            )}
            {generating && (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto mb-4"
                >
                  <Sparkles className="w-12 h-12 text-primary" />
                </motion.div>
                <p className="font-medium">AI가 맞춤 로드맵을 생성하고 있습니다...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 생성된 로드맵 */}
      {generatedRoadmap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 요약 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {generatedRoadmap.studentName} 맞춤 발달 로드맵
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {generatedRoadmap.institutionType}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {generatedRoadmap.currentLevel}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setGeneratedRoadmap(null)}>
                    다시 생성
                  </Button>
                  <Button onClick={exportRoadmap}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF 내보내기
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {generatedRoadmap.targetGoals.map((goal, idx) => (
                  <div key={idx} className="p-3 bg-primary/5 rounded-lg flex items-start gap-2">
                    <Target className="w-4 h-4 text-primary mt-0.5" />
                    <span className="text-sm">{goal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 단계별 로드맵 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                단계별 발달 계획
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={`phase-${activePhase}`} onValueChange={(v) => setActivePhase(parseInt(v.split('-')[1]))}>
                <TabsList className="w-full grid grid-cols-4 mb-6">
                  {generatedRoadmap.phases.map((phase, idx) => (
                    <TabsTrigger 
                      key={phase.id} 
                      value={phase.id}
                      className="flex flex-col items-center gap-1"
                    >
                      <span className="font-medium">{idx + 1}단계</span>
                      <span className="text-xs text-muted-foreground">{phase.duration}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {generatedRoadmap.phases.map((phase, idx) => (
                  <TabsContent key={phase.id} value={phase.id} className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{phase.title}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {phase.duration}
                      </Badge>
                    </div>

                    {phase.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>진행률</span>
                          <span className="font-medium">{phase.progress}%</span>
                        </div>
                        <Progress value={phase.progress} className="h-2" />
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                            <Target className="w-4 h-4" />
                            목표
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {phase.goals.map((goal, gIdx) => (
                              <li key={gIdx} className="text-sm flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                            <Brain className="w-4 h-4" />
                            활동
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {phase.activities.map((activity, aIdx) => (
                              <li key={aIdx} className="text-sm flex items-start gap-2">
                                <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-purple-50 border-purple-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                            <TrendingUp className="w-4 h-4" />
                            기대 성과
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{phase.expectedOutcome}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* AI 추천 사항 */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Lightbulb className="w-5 h-5" />
                AI 추천 사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {generatedRoadmap.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-medium text-sm">
                      {idx + 1}
                    </div>
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
