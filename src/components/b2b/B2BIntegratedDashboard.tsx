import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Brain,
  Send,
  Settings,
  BarChart3,
  Bell,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useB2BCRM } from '@/hooks/useB2BCRM';
import { B2BStudentManager, Student } from './B2BStudentManager';
import { B2BReportCenter } from './B2BReportCenter';
import { B2BAIAgentPanel } from './B2BAIAgentPanel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface B2BIntegratedDashboardProps {
  institutionName?: string;
}

export const B2BIntegratedDashboard: React.FC<B2BIntegratedDashboardProps> = ({
  institutionName = '체험 학원'
}) => {
  const { toast } = useToast();
  const { isLoading, runPsychologyAnalyzer, runParentReporter, runCrisisDetector, generateAIReport, sendReportEmail } = useB2BCRM();

  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentType, setAgentType] = useState<string>('psychology');
  const [agentResult, setAgentResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [generatedReportContent, setGeneratedReportContent] = useState<string>('');
  const [showReportPreview, setShowReportPreview] = useState(false);

  // 학생 선택시 AI 에이전트 실행
  const handleRunAgent = useCallback(async (student: Student, type: string) => {
    setSelectedStudent(student);
    setAgentType(type);

    try {
      let result;
      switch (type) {
        case 'psychology':
          result = await runPsychologyAnalyzer({
            name: student.name,
            age: student.age,
            assessmentResults: student.assessmentScores || { overall: 75 },
            notes: student.notes
          });
          break;
        case 'crisis':
          result = await runCrisisDetector({
            name: student.name,
            recentObservations: student.notes ? [student.notes] : ['관찰 기록 없음'],
            assessmentScores: student.assessmentScores
          });
          break;
        case 'reporter':
          const reportHtml = await runParentReporter({
            name: student.name,
            age: student.age,
            analysisResult: '정기 발달 분석 결과입니다.',
            recommendations: ['정기적인 학습 점검', '사회성 발달 활동 권장']
          });
          result = {
            agentName: 'AI 학부모 리포터',
            analysis: '학부모 리포트가 생성되었습니다.',
            recommendations: ['이메일로 발송 가능합니다'],
            htmlContent: reportHtml,
            timestamp: new Date().toISOString()
          };
          break;
        default:
          throw new Error('알 수 없는 에이전트');
      }

      setAgentResult(result);
      setShowResultModal(true);
    } catch (error: any) {
      toast({
        title: '에이전트 실행 실패',
        description: error.message || '잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  }, [runPsychologyAnalyzer, runCrisisDetector, runParentReporter, toast]);

  // 리포트 생성
  const handleGenerateReport = useCallback(async (student: Student) => {
    setSelectedStudent(student);

    try {
      const reportContent = await generateAIReport({
        studentName: student.name,
        assessmentData: student.assessmentScores || { overall: 75, development: 80, emotion: 70 },
        ageGroup: student.age < 12 ? 'child' : 'teen'
      });

      // Fallback report if API fails
      const finalContent = reportContent || `
        <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #7c3aed; text-align: center;">${student.name} 학생 발달 리포트</h1>
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <h3 style="color: #334155;">📊 종합 분석</h3>
            <p style="color: #64748b;">
              ${student.name} 학생(${student.age}세, ${student.grade})의 최근 심리검사 결과를 분석한 결과입니다.
              전반적으로 양호한 발달 상태를 보이고 있으며, 일부 영역에서 지원이 필요합니다.
            </p>
          </div>
          ${student.assessmentScores ? `
          <div style="background: #f0f9ff; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <h3 style="color: #0369a1;">📈 검사 결과</h3>
            <ul style="color: #0284c7;">
              ${Object.entries(student.assessmentScores).map(([key, val]) => 
                `<li>${key}: ${val}점</li>`
              ).join('')}
            </ul>
          </div>
          ` : ''}
          <div style="background: #f0fdf4; padding: 16px; border-radius: 12px;">
            <h3 style="color: #166534;">💡 추천사항</h3>
            <ul style="color: #4ade80;">
              <li>정기적인 학습 진도 점검</li>
              <li>또래 관계 형성 활동 지원</li>
              <li>스트레스 관리 교육</li>
            </ul>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
            ${institutionName} | AIHPRO 발달검사 플랫폼
          </p>
        </div>
      `;

      setGeneratedReportContent(finalContent);
      setShowReportPreview(true);
    } catch (error: any) {
      toast({
        title: '리포트 생성 실패',
        description: error.message || '잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  }, [generateAIReport, institutionName, toast]);

  // 리포트 발송
  const handleSendReport = useCallback(async () => {
    if (!selectedStudent || !generatedReportContent) return;

    try {
      const success = await sendReportEmail({
        recipientEmail: selectedStudent.parentEmail,
        recipientName: selectedStudent.parentName || `${selectedStudent.name} 학부모님`,
        studentName: selectedStudent.name,
        reportType: '맞춤',
        reportContent: generatedReportContent,
        institutionName
      });

      if (success) {
        setShowReportPreview(false);
        setGeneratedReportContent('');
        toast({
          title: '리포트 발송 완료',
          description: `${selectedStudent.parentEmail}로 리포트가 발송되었습니다.`,
        });
      }
    } catch (error) {
      // Error handled in hook
    }
  }, [selectedStudent, generatedReportContent, sendReportEmail, institutionName, toast]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-400 border-0"><AlertTriangle className="w-3 h-3 mr-1" />위험</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-0"><Clock className="w-3 h-3 mr-1" />관심</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400 border-0"><CheckCircle className="w-3 h-3 mr-1" />양호</Badge>;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{institutionName} 대시보드</h1>
                  <p className="text-sm text-slate-500">학생 관리 & AI 분석 시스템</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/20 text-green-400 border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  체험 모드
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 gap-2 bg-slate-800/50 p-1 rounded-xl">
              <TabsTrigger
                value="students"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-pink-500 rounded-lg"
              >
                <Users className="w-4 h-4" />
                학생 관리
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-pink-500 rounded-lg"
              >
                <FileText className="w-4 h-4" />
                리포트 센터
              </TabsTrigger>
              <TabsTrigger
                value="agents"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-pink-500 rounded-lg"
              >
                <Brain className="w-4 h-4" />
                AI 에이전트
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <B2BStudentManager
                onSelectStudent={setSelectedStudent}
                onRunAgent={handleRunAgent}
                onGenerateReport={handleGenerateReport}
              />
            </TabsContent>

            <TabsContent value="reports">
              <B2BReportCenter institutionName={institutionName} />
            </TabsContent>

            <TabsContent value="agents">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="bg-slate-900/80 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-violet-400" />
                      AI 에이전트 실행
                    </CardTitle>
                    <p className="text-slate-400 text-sm">
                      {selectedStudent 
                        ? `선택된 학생: ${selectedStudent.name} (${selectedStudent.grade})`
                        : '학생을 선택하면 해당 학생 데이터로 에이전트를 실행합니다'}
                    </p>
                  </CardHeader>
                </Card>
                <B2BAIAgentPanel />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Agent Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              AI 분석 완료
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
                <h4 className="font-medium text-white mb-2">분석 결과</h4>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{agentResult.analysis}</p>
              </div>

              {agentResult.recommendations?.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-2">추천사항</h4>
                  <ul className="space-y-2">
                    {agentResult.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 border-slate-700"
                >
                  닫기
                </Button>
                {selectedStudent && (
                  <Button
                    onClick={() => {
                      setShowResultModal(false);
                      handleGenerateReport(selectedStudent);
                    }}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    리포트 생성
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Preview Modal */}
      <Dialog open={showReportPreview} onOpenChange={setShowReportPreview}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-400" />
              리포트 미리보기
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px] rounded-lg bg-white">
            <div 
              dangerouslySetInnerHTML={{ __html: generatedReportContent }}
              className="p-4"
            />
          </ScrollArea>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowReportPreview(false);
                setGeneratedReportContent('');
              }}
              className="flex-1 border-slate-700"
            >
              취소
            </Button>
            <Button
              onClick={handleSendReport}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
            >
              <Send className="w-4 h-4 mr-2" />
              {selectedStudent?.parentEmail}로 발송
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default B2BIntegratedDashboard;
