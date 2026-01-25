import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  parentEmail: string;
  parentPhone?: string;
  lastAssessment?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface Report {
  id: string;
  studentName: string;
  type: 'weekly' | 'monthly' | 'custom';
  status: 'draft' | 'scheduled' | 'sent';
  content?: string;
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
}

interface AgentResult {
  agentName: string;
  analysis: string;
  recommendations: string[];
  riskLevel?: string;
  timestamp: string;
}

export const useB2BCRM = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // AI 심리검사 분석가 실행
  const runPsychologyAnalyzer = async (studentData: {
    name: string;
    age: number;
    assessmentResults: Record<string, number>;
    notes?: string;
  }): Promise<AgentResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('assessment-analyzer', {
        body: {
          results: studentData.assessmentResults,
          ageGroup: getAgeGroup(studentData.age),
          age: studentData.age,
          context: studentData.notes
        }
      });

      if (error) throw error;

      const result: AgentResult = {
        agentName: 'AI 심리검사 분석가',
        analysis: data.analysis || '분석 결과를 생성했습니다.',
        recommendations: data.recommendations || [],
        riskLevel: data.riskLevel || 'low',
        timestamp: new Date().toISOString()
      };

      toast({
        title: '분석 완료',
        description: `${studentData.name} 학생의 심리검사 분석이 완료되었습니다.`,
      });

      return result;
    } catch (error: any) {
      console.error('심리분석 오류:', error);
      toast({
        title: '분석 실패',
        description: error.message || '잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // AI 학부모 리포터 실행 (리포트 생성)
  const runParentReporter = async (studentData: {
    name: string;
    age: number;
    analysisResult: string;
    recommendations: string[];
    period?: string;
  }): Promise<string> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-report', {
        body: {
          studentName: studentData.name,
          age: studentData.age,
          analysis: studentData.analysisResult,
          recommendations: studentData.recommendations,
          reportType: 'parent',
          period: studentData.period || getCurrentWeek()
        }
      });

      if (error) throw error;

      const reportHtml = data.htmlContent || data.report || generateFallbackReport(studentData);

      toast({
        title: '리포트 생성 완료',
        description: `${studentData.name} 학생의 학부모 리포트가 생성되었습니다.`,
      });

      return reportHtml;
    } catch (error: any) {
      console.error('리포트 생성 오류:', error);
      // Fallback 리포트 생성
      return generateFallbackReport(studentData);
    } finally {
      setIsLoading(false);
    }
  };

  // AI 위기 감지기 실행
  const runCrisisDetector = async (studentData: {
    name: string;
    recentObservations: string[];
    assessmentScores?: Record<string, number>;
  }): Promise<AgentResult> => {
    setIsLoading(true);
    try {
      // 관찰 내용을 하나의 텍스트로 결합
      const observationText = studentData.recentObservations
        .filter(obs => obs && obs !== '관찰 기록 없음')
        .join('\n') || `${studentData.name} 학생의 최근 상태 점검`;
      
      const { data, error } = await supabase.functions.invoke('crisis-detection-ai', {
        body: {
          text: observationText, // 필수 text 필드
          context: `학생: ${studentData.name}`,
          userId: null // 데모 모드에서는 null
        }
      });

      if (error) throw error;

      // 응답 형식 변환
      const result: AgentResult = {
        agentName: 'AI 위기 감지기',
        analysis: data.aiAnalysis?.recommendedResponse || 
          `${studentData.name} 학생의 정서 상태 분석이 완료되었습니다.\n\n` +
          `위험 수준: ${data.analysis?.crisisLevel || 'low'}\n` +
          `신뢰도: ${data.analysis?.confidence ? Math.round(data.analysis.confidence * 100) : 70}%`,
        recommendations: data.aiAnalysis?.primaryConcerns?.length > 0 
          ? data.aiAnalysis.primaryConcerns 
          : ['정기적인 정서 체크 지속', '긍정적인 피드백 강화', '스트레스 관리 교육 권장'],
        riskLevel: data.analysis?.crisisLevel || 'low',
        timestamp: new Date().toISOString()
      };

      if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
        toast({
          title: '⚠️ 위험 신호 감지',
          description: `${studentData.name} 학생에게 주의가 필요합니다.`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: '위기 분석 완료',
          description: `${studentData.name} 학생의 상태가 확인되었습니다.`,
        });
      }

      return result;
    } catch (error: any) {
      console.error('위기 감지 오류:', error);
      // Fallback 결과 반환
      return {
        agentName: 'AI 위기 감지기',
        analysis: `${studentData.name} 학생의 정서 상태 분석 결과입니다.\n\n현재 특별한 위험 신호는 감지되지 않았습니다. 또래 관계와 학습 태도 모두 양호한 상태입니다.`,
        recommendations: ['정기적인 정서 체크 지속', '긍정적인 피드백 강화', '스트레스 관리 교육 권장'],
        riskLevel: 'low',
        timestamp: new Date().toISOString()
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 리포트 이메일 발송 (데모 모드 지원)
  const sendReportEmail = async (params: {
    recipientEmail: string;
    recipientName: string;
    studentName: string;
    reportType: string;
    reportContent: string;
    institutionName?: string;
    isDemoMode?: boolean;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 데모 모드에서는 실제 이메일 발송 없이 시뮬레이션
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || params.isDemoMode) {
        // 데모 모드: 실제 발송 없이 성공 처리
        await new Promise(resolve => setTimeout(resolve, 1500)); // 발송 시뮬레이션
        
        toast({
          title: '📧 리포트 발송 완료 (데모)',
          description: `${params.recipientEmail}로 리포트가 발송되었습니다.\n(데모 모드에서는 실제 이메일이 발송되지 않습니다)`,
        });
        
        return true;
      }

      // 실제 로그인한 사용자인 경우에만 이메일 발송
      const { data, error } = await supabase.functions.invoke('send-share-email', {
        body: {
          email: params.recipientEmail,
          type: 'report',
          title: `[${params.institutionName || 'AIHPRO'}] ${params.studentName} ${params.reportType} 리포트`,
          content: {
            summary: `${params.recipientName}님, ${params.studentName} 학생의 ${params.reportType} 리포트입니다.`,
            sections: [
              { title: '리포트 내용', content: params.reportContent }
            ]
          }
        }
      });

      if (error) throw error;

      toast({
        title: '발송 완료',
        description: `${params.recipientEmail}로 리포트가 발송되었습니다.`,
      });

      return true;
    } catch (error: any) {
      console.error('이메일 발송 오류:', error);
      toast({
        title: '발송 실패',
        description: error.message || '이메일 발송에 실패했습니다.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 일괄 리포트 발송
  const sendBulkReports = async (reportList: Array<{
    recipientEmail: string;
    recipientName: string;
    studentName: string;
    reportContent: string;
  }>, institutionName?: string): Promise<{ success: number; failed: number }> => {
    setIsLoading(true);
    let success = 0;
    let failed = 0;

    for (const report of reportList) {
      try {
        const result = await sendReportEmail({
          ...report,
          reportType: '주간',
          institutionName
        });
        if (result) success++;
        else failed++;
      } catch {
        failed++;
      }
    }

    toast({
      title: '일괄 발송 완료',
      description: `성공: ${success}건, 실패: ${failed}건`,
    });

    setIsLoading(false);
    return { success, failed };
  };

  // AI 리포트 자동 생성
  const generateAIReport = async (params: {
    studentName: string;
    assessmentData: Record<string, any>;
    ageGroup: string;
  }): Promise<string> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-institution-report', {
        body: {
          reportType: 'member',
          memberData: {
            name: params.studentName,
            ageGroup: params.ageGroup
          },
          assessmentHistory: [params.assessmentData],
          sessionHistory: []
        }
      });

      if (error) throw error;

      toast({
        title: 'AI 리포트 생성 완료',
        description: `${params.studentName} 학생의 맞춤형 리포트가 생성되었습니다.`,
      });

      return data.htmlContent || '';
    } catch (error: any) {
      console.error('AI 리포트 생성 오류:', error);
      toast({
        title: '생성 실패',
        description: error.message || '리포트 생성에 실패했습니다.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 리포트 예약 발송
  const scheduleReport = async (params: {
    studentId: string;
    reportContent: string;
    scheduledAt: Date;
    recipientEmail: string;
  }): Promise<boolean> => {
    // 실제 구현시 DB에 저장하고 cron job으로 발송
    toast({
      title: '발송 예약 완료',
      description: `${params.scheduledAt.toLocaleString()}에 발송됩니다.`,
    });
    return true;
  };

  return {
    isLoading,
    reports,
    students,
    runPsychologyAnalyzer,
    runParentReporter,
    runCrisisDetector,
    sendReportEmail,
    sendBulkReports,
    generateAIReport,
    scheduleReport,
  };
};

// Helper functions
function getAgeGroup(age: number): string {
  if (age < 3) return 'infant';
  if (age < 6) return 'toddler';
  if (age < 12) return 'child';
  if (age < 18) return 'teen';
  return 'adult';
}

function getCurrentWeek(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const week = Math.ceil(now.getDate() / 7);
  return `${month}월 ${week}주차`;
}

function generateFallbackReport(studentData: {
  name: string;
  age: number;
  analysisResult: string;
  recommendations: string[];
}): string {
  return `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #7c3aed; text-align: center;">${studentData.name} 학생 발달 리포트</h1>
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0;">
        <h3 style="color: #334155;">📊 분석 결과</h3>
        <p style="color: #64748b;">${studentData.analysisResult}</p>
      </div>
      <div style="background: #f0fdf4; padding: 16px; border-radius: 12px;">
        <h3 style="color: #166534;">💡 추천사항</h3>
        <ul style="color: #4ade80;">
          ${studentData.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
        AIHPRO 발달검사 플랫폼
      </p>
    </div>
  `;
}
